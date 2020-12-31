const TCP = require('./tcp');
const crypto = require('crypto');

/**
 * JSON-RPC stratum protocol client. Default protocol is stratum+tcp://
 * @module tcp/stratum
 * @typicalname stratum
 */

 /**
 * @external TCP
 * @see {@link ./tcp.md}
 */

// traditional JSON-RPC stratum protocol over stratum+tcp://
// When it disconnects (cfg.reconnectOnError tells it what to do):
// - network error like timeout/server closed connection etc
// - stratum authorization fails with error
// - internal data buffer has more than 8kb in it (should not happen if we're using stratum)
// - server sends 5 or more unknown/invalid commands one after another
// - no response to login command for 30 seconds
//
// Stratum cmd's ID
// 1 - jsonrpc2 login
// 2 - mining.subscribe
// 3 - mining.authorize
// 4 - mining.ping
// ....
// 20+ submit share
//
// emits inherited from TCPTransport + following:
// redirect				- stratum requested to reconnect to another host. param is {host, port}
// online					- authorization passed. pool is online. no param
// error					- well, error. param is Error
// status					- stratum status text change. param is new status text
// diff						- difficulty change. param is new diff (number)
// job						- new job received. param is the actual job received (object or array)
// accepted				- share accepted. param is share ID
// rejected 			- share rejected. param is share ID

const cmdPing = JSON.stringify({ id: 4, method: 'mining.ping', params: []}) + '\r\n';

const defaultConfig = {
	url: null,							// url to connect to. ex: 'tcp://127.0.0.1:8080' or 'localhost:8080' or 'https://atomminer.com'
	keepalive: true,				// whether set keep-alive flag on the socket or not. must be true for stratum
	nodelay: true,					// socket.setNoDelay enable/disable the use of Nagle's algorithm.
	username: null,					// stratum login. connect will throw error if username is null or empty
	password: 'x',					// default password

	jsonRPC2: false,				// will attempt JSON-RPC 2.0 login first and fallback to 1.x on failure
	reconnectSession: true, // whether we try to reconnect to previous sessions or starting a new session
	loginTimeout: 30000,		// timeout to receive login command response. 30 seconds. 0 to disable
	enablePing: false,			// enables ping-pong command(s) to keep connection truly alive. most pools will kick you out for using ping
	reconnectOnError: true, // should it automatically try to reconnect after error

	reconnectTimeout: [1000, 5000, 10000, 30000],	// number or array of timeouts
	// reconnectTimeout: 10000, // fixed timeout like seen in cpuminer and others

	// auxilary helpers and what not
	algo: '',								// not required. for convinience only. most likely will be required to generate data for JSON-RPC 1.x jobs
	id: '',									// will be created if empty to help save/load pool setting
}

class Stratum extends TCP {
	constructor(config) { 
		var opts = {...defaultConfig, ...config};
		super(opts);
		this._reconnectTimeoutIdx = 0;
		this._connectedTime = 0;
		this._lastDisconnect = 0;
		this._online = false;
		this._disconnectCount = 0;
		this._diff = 1;
		this._invalidCmdCount = 0;

		this.accepted = 0;
		this.rejected = 0;

		// try JSON-RPC 2.0 first as it never returns anything on mining.subscribe or authorize
		// while JSON-RPC 1.x returns an error (20 - Not supported) on JSON-RPC 2.0 login
		this._jsonRPC2 = opts.jsonRPC2;

		this._supportPingPong = false;

		this._rcvBuffer = '';
		this._extraNonce = '';
		this._job = null;
		this._session = '';
		this._lastJobReceived = 0;

		if(!this.opts.id) {
			this.opts.id = crypto.createHash('md5').update(`${this.opts.url}${this.opts.algo}${(new Date()).toLocaleDateString()}`).digest("hex");;
		}
	}

	// readonly
	get type() { return this._jsonRPC2 ? 'stratum2.0' : 'stratum'; }
	get online() { return this._online; }
	get algo() { return this.opts.algo; }
	get jsonRPC2() { return this._jsonRPC2; };
	get id() {return this.opts.id; }

	// methods
	_beforeConnect() {
		this.debug('beforeConnect');
		this._supportPingPong = false;
		this._rcvBuffer = '';
		this._invalidCmdCount = 0;
		if(!this.opts.username) {
			throw new Error('Stratum requires username to be not null');
		}
	}

	_beforeDisconnect() {
		if(this.__loginTimeout) {
			clearTimeout(this.__loginTimeout);
			this.__loginTimeout = null;
		}
		if(this.__pingTimer) {
			clearInterval(this.__pingTimer);
			this.__pingTimer = null;
		}

		this._rcvBuffer = '';
		this._lastDisconnect = +new Date();
		this._disconnectCount ++;
		this._online = false;
		// don't! must be saved for the case when we reconnect to the same mining session 
		//this._extraNonce = '';
		//this._job = null;
	}

	doConnect() {
		if(this.opts.jsonRPC2) { // if we should attempt JSON-RPC 2.0 login
			const cmd = { id: 1, method: 'login', params: { login: this.opts.username, pass: this.opts.password || 'x', agent: this.AGENT} };
			this.send(cmd);
		}
		else {
			const cmdSubscribe = { id: 2, method: 'mining.subscribe', params: [Stratum.AGENT]};
			if(this.opts.reconnectSession && this._session && this._session.length) cmdSubscribe.params.push(this._session);
			this.send(cmdSubscribe);
			const authorize = { id: 3, method: 'mining.authorize', params: [this.opts.username, this.opts.password || 'x']};
			this.send(authorize);
			if(this.opts.enablePing) this.send(cmdPing);
		}
	}

	_onLoginTimeout() {
		if(!this._online) {
			this.lastError = 'Stratum login timeout reached';
			this.onTimeout();
			this.__loginTimeout = null;
		}
	}

	onConnect() {
		this.debug('onConnect');
		this._connectedTime = +new Date();

		if(this.opts.loginTimeout) {
			this.__loginTimeout = setTimeout(this._onLoginTimeout.bind(this), this.opts.loginTimeout);
		}

		this.doConnect();
	}

	// i.e. remote host has closed connection
	onEnd() {
		this.debug('onEnd');
		this.status = 'Remote host has closed connection';
		this._online = false;
	}

	// connection closed
	onClose(hadError) {
		this.debug('onClose');

		this._beforeDisconnect();
		if(this._reconnectTo) {
			process.nextTick(() => { this.connect(); })
		}
		else if(this.opts.reconnectOnError) {
			var timeout = 0;
			if(Array.isArray(this.opts.reconnectTimeout)) {
				if(this._reconnectTimeoutIdx < 0) this._reconnectTimeoutIdx = 0;
				if(this._reconnectTimeoutIdx >= this.opts.reconnectTimeout.length) this._reconnectTimeoutIdx = this.opts.reconnectTimeout.length - 1;
				timeout = this.opts.reconnectTimeout[this._reconnectTimeoutIdx];
				this._reconnectTimeoutIdx ++;
			}
			else timeout = this.opts.reconnectTimeout;
			const msg = `Reconnecting to ${this.opts.url} in ${Math.floor(timeout / 1000)} second(s)...`; 
			this.debug(msg);
			this.status = msg;
			this._reconnectTimer = setTimeout(this.connect.bind(this), timeout);
		}
	}

	// connection or data timeout happened
	onTimeout() {
		this.debug('onTimeout');
		// https://nodejs.org/api/net.html#net_event_timeout
		process.nextTick(() => {this._socket.destroy()});
	}

	onError(err) {
		var s = 'Error ';
		if(err.code ) s += err.code + ' ';
		if(err.errno ) s += '(' + err.errno + ') ';
		s += err;
		this.error(s);
		this.lastError = s;
	
		// no reason to try to reconnect right away if connection was refused
		if(err.code === 'EREFUSED' && Array.isArray(this.opts.reconnectTimeout)) this._reconnectTimeoutIdx = this.opts.reconnectTimeout.length;
	}

	onData(data){
		//this.debug('onData'); // too noisy even for debug
		const sData = data.toString('utf8');
		if(this.opts.logdatain) this.log('< ' + sData.replace(/\r?\n/, ''));
		this._rcvBuffer += sData;

		// non-json data will cause buffer overflow => disconnect
		// partial json will be decoded once the rest of the message is received
		try{
			var idx;
			while((idx = this._rcvBuffer.indexOf('\n')) != -1) {
				const cmd = JSON.parse(this._rcvBuffer.substring(0, idx+1));
				this._rcvBuffer = this._rcvBuffer.slice(idx+1)
				this.onCommand(cmd);		
			}
		}
		catch(e) {
			if(this._rcvBuffer.indexOf('\n') != -1) {
				this.lastError = `Stratum::onData are we using JSON-RPC? error: ${e.message}`
				process.nextTick(() => { this._socket.destroy(); });
			}
		}

		this._rcvBuffer = this._rcvBuffer.replace(/\r?\n/, '');
		if(this._rcvBuffer.length > 8192) {
			this.lastError = 'Stratum server seems to be too verbose. Disconnecting.';
			process.nextTick(() => { this._socket.destroy(); });
		}
	}

	onCommand(cmd) {
		if(!cmd) throw new Error('Cmd is null');
		if(!cmd.id && !cmd.error && !cmd.result && !cmd.method) throw new Error('Cmd is missing mandatory fields');
		var processed = false;
		if(cmd.id == 4) { // mining.ping
			processed = this.onPing(cmd);
		}
		else if(cmd.id == 1) { // jsonrpc2.0 login response
			processed = this.onLogin(cmd);
		}
		else if(cmd.id == 2) { // mining.subscribe response
			processed = this.onSubscribe(cmd);
		}
		else if(cmd.id == 3) { // mining.authorize response
			processed = this.onAuthorize(cmd);
		}
		else if(cmd.method === 'mining.set_difficulty') {
			processed = this.onDiff(cmd);
		}
		else if(cmd.method === 'mining.notify') {
			processed = this.onNotify(cmd);
		}
		// mining.ping might or might not have id. depends on the pool implementation
		else if(cmd.method === 'mining.ping') {
			this.send({id: cmd.id || null, result:'pong', error:null});
			processed = true;
		}
		else if(cmd.method === 'job' && cmd.params) {
			processed = this.onJob(cmd.params);
		}
		else if(cmd.method === 'mining.set_extranonce') {
			processed = this.onSetExtraNonce(cmd.params);
		}
		else if(cmd.method === 'client.show_message') {
			processed = this.onShowMessage(cmd)
		}
		else if(cmd.method === 'client.reconnect') {
			processed = this.onReconnect(cmd);
		}
		else if(cmd.method === 'mining.ping') { // some pools are actually sending mining.ping
			this.send({id: cmd.id || null, result:'pong', error:null});
			processed = true;
		}
		else if(cmd.id >= 20) { // mining.submit response
			processed = this.onShareResult(cmd);
		}
		else {
			this.lastError = `Stratum received unknown command ${JSON.stringify(cmd)}`;
			this.error(this._lastError);
		}

		this._invalidCmdCount += processed ? 0 : 1;

		if(this._invalidCmdCount >= 5) {
			this.lastError = `Received too many incorrect commands from stratum. Disconnecting`;
			this.error(this._lastError);
			this._invalidCmdCount ++;
		}
	}

	// internal. called up when either login or mining.authorize are good
	onLoggedIn() {
		this.debug('onLoggedIn - Login success')
		if(this.__loginTimeout) {
			clearTimeout(this.__loginTimeout);
			this.__loginTimeout = null;
		}
		this._online = true;
		this._invalidCmdCount = 0;
		this.lastError = '';
		this._reconnectTimeoutIdx = 0;
		this.emit('online');
		this.status = 'Online';
		return true;
	}

	// JSON-RPC2.0 login method
	onLogin(cmd) {
		this.debug('onLogin');
		if(!cmd.result) {
			this.debug('JSON-RPC 2.0 login failed. Falling back to 1.x')
			this.status = 'JSON-RPC 2.0 login failed. Falling back to JSON-RPC 1.x';
			this._jsonRPC2 = false;
			this.doConnect();
		}
		else {
			this._extraNonce = ''; // haven't seen extra nonce is being used in JSON-RPC 2.0
			this._jsonRPC2 = true;
			this.onLoggedIn();
			if(cmd.result && cmd.result.job) this.onJob(cmd.result.job);
		}
		return true;
	}

	// job received
	onJob(job) {
		this.debug('onJob');
		if(job) {
			this._lastJobReceived = + new Date();
			this._job = job;
			this.emit('job', this._job);
		}
		return true;
	}

	// mining.subscribe
	onSubscribe(cmd) {
		this.debug('onSubscribe');
		// am, yiimp, nomp: note, mining.set_difficulty can be either string or number! 
		// {"id":2,"result":[[["mining.set_difficulty","1.000"],["mining.notify","2344053c4a36e6d748513a8776cde339"]],"81000378",4],"error":null}
		// {"id":2,"result":[[["mining.set_difficulty",1.000],["mining.notify","7f7da94d387c442d199eb0fd57f454a1"]],"81000815",4],"error":null}
		// seen at some nomp based pools... what's wrong with people???
		// {"id":2,"result":[[["mining.set_difficulty","deadbeefcafebabe0900000000000000"],["mining.notify","deadbeefcafebabe0900000000000000"]],"00000001",4],"error":null}
		// python p2pool:
		// {"id": 2, "result": [["mining.notify", "ae6812eb4cd7735a302a8a9dd95cf71f"], "78636025", 4], "error": null}
		// nicehash, smart math. stay away from them...
		// {"id":2,"error":null,"result":[["mining.notify","fa7ce2accc79883ec73bb3d8ebcb2362"],"422dc5397d",3]}
		this._diff = 1; // just in case
		if(cmd.error || !cmd.result || !Array.isArray(cmd.result)) {
			this._extraNonce = '';
			return true;
		}
		var singlenum = 0;
		var enonce = '';
		var enoncelen = 0;
		const grabDiff = (p) => {
			if(p && p[0] && p[1] && p[0] === 'mining.set_difficulty' && !isNaN(parseFloat(p[1]))) {
				this._diff = parseFloat(p[1]);
			}
		}
		const grabSession = (p) => {
			if(p && p[0] && p[1] && p[0] === 'mining.notify') {
				if(p[1].toString() !== this._session) {
					this._session = p[1].toString();
					this.status = `Started session ${this._session}`;
				}
				else {
					this.status = `Resumed previous session ${this._session}`;
				}
			}
		}
		for(var param of cmd.result) {
			if(Array.isArray(param)) {
				for(var p of param) {
					if(Array.isArray(p)) { // 3rd nested arrays
						grabDiff(p);
						grabSession(p);
					}
					else { // 2nd nested array
						grabDiff(param);
						grabSession(param);
						break;
					}
				}
				continue;
			} // end if(Array.isArray(param))
		}
		const extranonce = cmd.result.filter((v) => { return !(Array.isArray(v) || typeof v === 'object')});
		this.onSetExtraNonce(extranonce);

		return true;
	}

	onNotify(cmd) {
		this.debug('onNotify');
		if(cmd.params) this.onJob(cmd.params);
		return true;
	}

	// mining.authorize
	onAuthorize(cmd) {
		this.debug('onAuthorize');
		if(cmd.result) {
			this._jsonRPC2 = false;
			this.onLoggedIn();
		}
		else {
			this.lastError = 'Stratum login error ' + (cmd.error || '');
			process.nextTick(() => { this._socket.destroy(); });
		}
		return true;
	}

	onSetExtraNonce(params) {
		// only ['00000001', 4] or ['00000001', '4'] parsed here
		if(!(params && Array.isArray(params))) return true;
		if(params.length < 2) return true;

		const ishex = (v) => { return /^[A-Fa-f0-9]+$/i.test(v) }
		if(!(typeof params[0] === 'string' && ishex(params[0]))) return;
		
		// nicehash seems to be retarded enough to miscalculate extraNonce length
		//if(len < this._extraNonce.length) this._extraNonce = this._extraNonce.substr(-len); 
		var len = 2*parseFloat(params[1]);
		this._extraNonce = params[0];
		if(isNaN(len)) len = this._extraNonce.length;
		if(this._extraNonce.length % 2) this._extraNonce = '0' + this._extraNonce;
		while (len > this._extraNonce.length) this._extraNonce = '0' + this._extraNonce;
		return true;
	}

	onShowMessage(cmd) {
		this.debug('onShowMessage');
		if(cmd && cmd.params) {
			if(Array.isArray(cmd.params)) this.status = cmd.params[0].toString();
			else this.status = cmd.params.toString();
			return true;
		}
		return false;
	}

	onReconnect(cmd) {
		this.debug('onReconnect');
		if(cmd && cmd.params && Array.isArray(cmd.params)) {
			this._online = false;
			if(cmd.params.length == 1) {
				this._reconnectTo = {url: cmd.params[0].toString()};
				this.status = `Stratum requested reconnect to ${cmd.params[0].toString()}`;
			}
			else if(cmd.params.length == 2) {
				this._reconnectTo = {host: cmd.params[0], port: cmd.params[1]};
				this.status = `Stratum requested reconnect to ${cmd.params[0]}:${cmd.params[1]}`;
			}
			else {
				this.error(`Stratum::onReconnect cant parse reconnect command: ${JSON.stringify(cmd)}`);
			}
			
			this.emit('redirect', this._reconnectTo);
			setImmediate(() => { this._socket.destroy(); });
			return true;
		}
		return false;
	}

	// response to our ping
	onPing(cmd) {
		this.debug('onPing');
		this._supportPingPong = cmd.result === true;
		if(this._supportPingPong) {
			if(this.__pingTimer) clearInterval(this.__pingTimer);
			this.__pingTimer = setInterval(() => { this.send(cmdPing); }, 60000);
		}
		return true;
	}

	//mining.set_difficulty
	onDiff(cmd) {
		this.debug('onDiff');
		var processed = false;
		// {"id":null,"method":"mining.set_difficulty","params":[1]}
		if(Array.isArray(cmd.params) && cmd.params.length > 0 && isFinite(cmd.params[0])) {
			processed = true;
			this._diff = cmd.params[0];
		}
		// {"id":null,"method":"mining.set_difficulty","params":1}
		else if(typeof cmd.params == 'number') {
			processed = true;
			this._diff = cmd.params;
		}
		processed && this.emit('diff', this._diff);
		return processed;
	}

	onShareResult(cmd) {
		this.debug('onDiff');
		if(cmd.result) {
			this.accepted ++;
			this.emit('accepted', cmd.id);
		}
		else {
			this.rejected ++;
			this.emit('rejected', cmd.id);
		}
		return true;
	}
}

module.exports = Stratum;
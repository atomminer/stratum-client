const TCPTransport = require('./tcp');
const crypto = require('crypto');

/**
 * JSON-RPC stratum protocol client. Default protocol is stratum+tcp://
 * 
 * Typical disconnect reasons:
 * - network error like timeout, server closed connection, conn refused etc.;
 * - stratum authorization fails with error;
 * - internal data buffer has more than 8Kb in it (should not happen if we're using stratum protocol);
 * - server sends 5 or more unknown/invalid commands one after another;
 * - no response to login command for 5 seconds;
 * 
 * Hard-coded Stratum methods ID's
 * `1` - jsonrpc2 login
 * `2` - mining.subscribe
 * `3` - mining.authorize
 * `4` - mining.ping
 * `[5,19]` - reserved
 * `20+` submit share/response
 * 
 * @module tcp/stratum
 * @typicalname stratum
 */

 /**
 * @external TCPTransport
 * @see {@link ./tcp.md}
 */

 const cmdPing = JSON.stringify({ id: 4, method: 'mining.ping', params: []}) + '\r\n';

/**
 * Stratum config object. Inherits TCPOptions
 * @namespace StratumOptions
 * @property {string} url=null url to connect to. ex: 'tcp://127.0.0.1:8080'. protocol defaults to 
 * stratum+tcp:// if not specified.
 * @property {boolean} keepalive=true whether set keep-alive flag on the socket or not.
 * @property {boolean} nodelay=true	socket.setNoDelay enable/disable the use of Nagle's algorithm.
 * @property {string} username=null	Stratum login. stratum::Connect will throw an error if username is 
 * `null` or empty. Always put `stratum.connect` in `try{} catch{}` block.
 * @property {string} password='x' Stratum password or options as required by the pool. 'x' is the 
 * most common password for all-default pool settings.
 * @property {boolean} jsonRPC2=false Indicates that stratum should attempt JSON-RPC 2.0 login first 
 * and then fallback to 1.x on failure. Defaults to `false` due to the fact that too many pool backends 
 * do not tolerate unknown commands.
 * @property {boolean} reconnectSession=true Attempts to use previous mining session on reconnect, if 
 * supported by the pool.
 * @property {Number} loginTimeout=5000 Time in ms to wait for authorization/login response. Some dumb pools
 * ignore mining.authorize and/or login commands if something is wrong, instead of error response. `0` to disable.
 * @property {boolean} enablePing=false Tells stratum if it should try to use `mining.ping`/`mining.pong` 
 * methods to keep connection truly alive. Many pools will disconnect client for using `mining.ping`.
 * @property {boolean} reconnectOnError=true Tells stratum to try to reconnect to the pool on error. If
 * `false`, stratum client will remain in disconnected state and it is up to external manager to control when to connect again.
 * @property {Array|Number} reconnectTimeout=[1000,5000,10000,30000] Reconnect timeouts in ms. Use `Number` for 
 * fixed timeout and `Array` of numbers for more logical dynamic timeouts. Value of `10000` will make this class to
 * work the same way `cpumier` does. Dynamic (default) timeouts should be more efficient when network error happened by 
 * reconnecting client within 1s and increasing timeout value if connection keeps failing.
 * @property {string} algo='' Optional. Algo name for this stratum connection. Will be pretty useful 
 * for parsing data and assembling mining block with JSON-RPC 1.x pools.
 * @property {string} id='' Will be generated if left empty string or `null`. Convenience identity field 
 * to helps save, load and track pools and connections in multi-pool environment.
 */
const defaultConfig = {
	url: null,
	keepalive: true,
	nodelay: true,
	username: null,
	password: 'x',
	
	jsonRPC2: false,
	reconnectSession: true,
	loginTimeout: 5000,
	enablePing: false,
	
	reconnectOnError: true,
	reconnectTimeout: [1000, 5000, 10000, 30000],
	
	algo: '',
	id: '',
}

/**
 * @class 
 * @extends {external:TCPTransport} 
 * @param {StratumOptions} config StratumOptions configuration object. See: {@link ~StratumOptions}
 * @fires connected
 * @fires disconnected
 * @fires error 
 * @fires status
 * @fires redirect
 * @fires online
 * @fires diff
 * @fires job
 * @fires accepted
 * @fires rejected
 * @alias module:tcp/stratum
 * @public
 */
class Stratum extends TCPTransport {
	/**
	 * Event reporting that socket is connected. Fired by parent class TCPTransport
	 * @event connected
	 * @instance
	 */

	 /**
	 * Event reporting that socket is disconnected. Fired by parent class TCPTransport
	 * @event disconnected
	 * @instance
	 */

	 /**
	 * Error event.  Fired by parent class TCPTransport
	 * @event error
	 * @property {string|Error} e Error description
	 * @instance
	 */

	 /**
	 * Status event. Fired when internal status changes. Fired by parent class TCPTransport
	 * @event status
	 * @property {string} status New status
	 * @instance
	 */

	 /**
	 * Reconnect event. Fired when pool is requesting to reconnect to another port/URL. No action 
	 * required if `stratum.config.reconnectOnError` is set to `true`.
	 * @event redirect
	 * @property {Object} r Contains reconnect info: either `r.url` or `r.host` and `r.port` should be provided.
	 * @instance
	 */

	 /**
	 * Online event. Fired when stratum server confirms authorization/login
	 * @event online
	 * @instance
	 */

	 /**
	 * Difficulty changed event. Fired when pool changes target difficulty
	 * @event diff
	 * @property {Number} diff New difficulty
	 * @instance
	 */

	 /**
	 * New job received event.
	 * @event job
	 * @property {Array|Object} job `Object` containing job data blob for JSON-RPC 2.0 pools; 
	 * and `Array` for JSON-RPC 1.x pools
	 * @instance
	 */

	 /**
	 * Share accepted event.
	 * @event accepted
	 * @property {Number} id ID of the share that was accepted by the pool. Actual share data 
	 * like nonce, extra nonce etc. should be tracked somewhere else
	 * @instance
	 */

	 /**
	 * Share rejected event.
	 * @event rejected
	 * @property {Number} id Same as accepted, only fired when share was rejected by the pool.
	 * @instance
	 */

	 /**
	 * Connect to the stratum server
	 * @function connect
	 * @instance
	 */

	 /**
	 * Permanently close connection to the pool and destroy all internal timers.
	 * @function disconnect
	 * @instance
	 */

	 /**
	 * Close connection to the pool and let current instance to decide if it wants to reconnect, when and where to.
	 * @function close
	 * @instance
	 */

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

		this._shareID = 19;

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

	/**
	 * Get protocol type. Either `stratum` or `stratum2.0`
	 *
	 * @readonly
	 */
	get type() { return this._jsonRPC2 ? 'stratum2.0' : 'stratum'; }
	
	/**
	 * Check if stratum clien is online. I.e if authorization/login was accepted by the server
	 *
	 * @readonly
	 */
	get online() { return this._online; }

	/**
	 * Current algo. See {@link ~StratumOptions}
	 *
	 * @readonly
	 */
	get algo() { return this.opts.algo; }

	/**
	 * Check if JSON-RPC 2.0 login was accepted and we're working in 2.0 mode {@link ~StratumOptions}
	 *
	 * @readonly
	 */
	get jsonRPC2() { return this._jsonRPC2; };

	/**
	 * This class pseudo-unique ID
	 *
	 * @readonly
	 */
	get id() {return this.opts.id; }

	/**
	 * Submit share to the pool server
	 * @param {object} data Solution data to send as an answer
	 * @throws
	 */
	submit(data) {
		if(this._jsonRPC2) throw new Error('Stratum::submit Not Implemented');
		// RPC 1.x
		if(!(data && data.job && data.nonce && data.nonce2 && data.time)) throw new Error('Stratum::submit Invalid data');
		this._shareID++;
		const cmd = { 
			id: this._shareID, 
			method: 'mining.submit', 
			params: [this.config.username, data.job, data.nonce2, data.time, data.nonce],
		};
		this.send(cmd)
	}

	/**
	 * Before connect hook. Called right before socket.connect
	 * @inner
	 */
	_beforeConnect() {
		this.debug('beforeConnect');
		this._supportPingPong = false;
		this._rcvBuffer = '';
		this._invalidCmdCount = 0;
		this._shareID = 19;
		if(!this.opts.username) {
			throw new Error('Stratum requires username to be not null');
		}
	}

	/**
	 * Before disconnect hook. Called right before `'disconnect'`
	 * @inner
	 */
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

	/**
	 * Sends initial messages (`login` or `mining.subscribe` + `mining.authorize`) to the server once socket is connected
	 * @inner
	 */
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

	/**
	 * Called when loginTimeout expired with no response from the pool server. Will cause disconnect
	 * @inner
	 */
	_onLoginTimeout() {
		if(!this._online) {
			this.lastError = 'Stratum login timeout reached';
			this.onTimeout();
			this.__loginTimeout = null;
		}
	}

	/**
	 * Called by TCPTransport when connection to the pool is established.
	 * @inner
	 */
	onConnect() {
		this.debug('onConnect');
		this._connectedTime = +new Date();

		if(this.opts.loginTimeout) {
			this.__loginTimeout = setTimeout(this._onLoginTimeout.bind(this), this.opts.loginTimeout);
		}

		this.doConnect();
	}

	/**
	 * Called by TCPTransport when remote host has closed connection.
	 * @inner
	 */
	onEnd() {
		this.debug('onEnd');
		this.status = 'Remote host has closed connection';
		this._online = false;
	}

	/**
	 * Called by TCPTransport when socket connections is closed. **!!!NOTE!!!** `onClose` is not called on `stratum.disconnect()`
	 * thus preventing automatic reconnect. Use `stratum.close()` if reconnect required.
	 * @inner
	 */
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

	/**
	 * Called by TCPTransport on timeout and onLoginTimeout.
	 * @inner
	 */
	onTimeout() {
		this.debug('onTimeout');
		// https://nodejs.org/api/net.html#net_event_timeout
		process.nextTick(() => {this._socket.destroy()});
	}

	/**
	 * Erro handler
	 * @inner
	 */
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

	/**
	 * Data received on the underlying socket
	 * @inner
	 */
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

	/**
	 * Decode and process stratum command/method
	 * @inner
	 */
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
		else if(cmd.method === 'mining.pong') { // some pools are actually sending mining.ping
			this.onPing({result: true});
			processed = true;
		}
		else if(cmd.id >= 20) { // mining.submit response
			processed = this.onShareResult(cmd);
		}
		else {
			this.lastError = `Stratum received unknown command ${JSON.stringify(cmd)}`;
		}

		this._invalidCmdCount += processed ? 0 : 1;

		if(this._invalidCmdCount >= 5) {
			this.lastError = `Received too many incorrect commands from stratum. Disconnecting`;
			this._invalidCmdCount ++;
		}
	}

	/**
	 * Internal. Called up when either login or mining.authorize are accepted by the pool
	 * @fires online
	 * @inner
	 */
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

	/**
	 * JSON-RPC 2.0 login method response handler
	 * @inner
	 */
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

	/**
	 * Called when new job received from the pool
	 * @fires job
	 * @inner
	 */
	onJob(job) {
		this.debug('onJob');
		if(job) {
			this._lastJobReceived = + new Date();
			this._job = job;
			this.emit('job', this._job);
		}
		return true;
	}

	/**
	 * `mining.subscribe` response handler
	 * @inner
	 */
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

	/**
	 * `mining.notify` handler
	 * @fires job
	 * @inner
	 */
	onNotify(cmd) {
		this.debug('onNotify');
		if(cmd.params) this.onJob(cmd.params);
		return true;
	}

	/**
	 * `mining.authorize` handlers
	 * @fires login
	 * @inner
	 */
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

	/**
	 * Internal. Parse extra nonce
	 * @inner
	 */
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

	/**
	 * `client.show_message` handler
	 * @fires status
	 * @inner
	 */
	onShowMessage(cmd) {
		this.debug('onShowMessage');
		if(cmd && cmd.params) {
			if(Array.isArray(cmd.params)) this.status = cmd.params[0].toString();
			else this.status = cmd.params.toString();
			return true;
		}
		return false;
	}

	/**
	 * `client.reconnect` handler
	 * @fires redirect
	 * @inner
	 */
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

	/**
	 * `mining.ping` handler
	 * @inner
	 */
	onPing(cmd) {
		this.debug('onPing');
		this._supportPingPong = cmd.result === true;
		if(this._supportPingPong) {
			if(this.__pingTimer) clearInterval(this.__pingTimer);
			this.__pingTimer = setInterval(() => { this.send(cmdPing); }, 60000);
		}
		return true;
	}

	/**
	 * `mining.set_difficulty` handler
	 * @fires diff
	 * @inner
	 */
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

	/**
	 * Share result handler
	 * @fires accepted
	 * @fires rejected
	 * @inner
	 */
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
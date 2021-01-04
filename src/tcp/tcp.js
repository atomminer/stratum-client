const dns = require('dns');
const net = require('net');
const url = require('url');
const ITransport = require('../transport');

/**
 * Generic TCP transport over raw socket
 * @module tcp/tcp
 * @typicalname tcp
 */

 /**
 * @external ITransport
 * @see {@link ../transport.md}
 */


/**
 * TCP Transport config object
 * @namespace TCPOptions
 * @property {string} url=false	URL to connect to. ex: 'tcp://127.0.0.1:8080' or 'localhost:8080'
 * @property {boolean} keepalive=false	whether set keep-alive flag on the socket or not
 * @property {boolean} nodelay=false	socket.setNoDelay enable/disable the use of Nagle's algorithm.
 * @property {boolean} logdataout=false	Enable logging of outgoing data
 * @property {boolean} logdatain=false Enable logging of incoming data
 * @property {boolean} lognetstat=false Log network statistics every once in a while
 * @property {boolean} netstatPeriod=1000 Network statistics refresh period. 0 to disable
 * @property {boolean} dnsCache=dns.lookup Optional DNS cache. Must implement [DNS Lookup]{@link https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback}
 */
const defaultconfigTCP = {
	url: null,
	keepalive: false,
	nodelay: false,

	logdataout: false,
	logdatain: false,
	lognetstat: false,
	netstatPeriod: 1000,
	dnsCache: dns.lookup,
};


/**
 * @class 
 * @extends {external:ITransport} 
 * @param {TCPOptions} config TCPOptions configuration object. See See: {@link ~TCPOptions}
 * @fires connected
 * @fires disconnected
 * @fires error
 * @fires status
 * @alias module:tcp/tcp
 * @public
 */
class TCPTransport extends ITransport {
	/**
	 * Event reporting that socket is connected.
	 *
	 * @event connected
	 */

	 /**
	 * Event reporting that socket is disconnected.
	 *
	 * @event disconnected
	 */

	/**
	 * Error event.
	 *
	 * @event error
	 * @property {string|Error} e Error description
	 */

	 /**
	 * Status event. Fired when internal status changes
	 *
	 * @event status
	 * @property {string} status New status
	 */

	constructor(urlOrConfig) { 
		const opts = (typeof urlOrConfig === 'object') ? {...defaultconfigTCP, ...urlOrConfig} : defaultconfigTCP;
		if(typeof urlOrConfig == 'string') opts.url = urlOrConfig;
		super(opts);
		this._socket = null;
		this._connected = false;
		this._reconnectTimer = null;

		// traffic meter
		this.__netstatTimer = null;
		this._totalBytesOut = 0;
		this._totalBytesIn = 0;
		this._bytesOut = 0;
		this._bytesIn = 0;
		this._upspeed = 0;
		this._downspeed = 0;
	}

	/**
	 * Get protocol type
	 *
	 * @readonly
	 */
	get type() { return 'rawtcp'; }

	/**
	 * Check if socket is connected
	 *
	 * @readonly
	 */
	get connected() { return this._connected; }

	/**
	 * Shows if netstat is enabled and running on this connection
	 *
	 * @readonly
	 */
	get netstat() { return this.opts.netstatPeriod > 0; }
	
	/**
	 * Average upload speed in bytes/s
	 *
	 * @readonly
	 */
	get upspeed() {return this._upspeed;}
	
	/**
	 * Average download speed in bytes/s
	 *
	 * @readonly
	 */
	get downspeed() {return this._downspeed;}
	
	/**
	 * Total bytes sent
	 *
	 * @readonly
	 */
	get totalBytesSent() {return this._totalBytesOut;}
	
	/**
	 * Total bytes received
	 *
	 * @readonly
	 */
	get totalBytesReceived() {return this._totalBytesIn;}
	
	/**
	 * Bytes sent since connect/reconnect. Resets when connection is closed.
	 *
	 * @readonly
	 */
	get bytesSent() {return this._bytesOut;}
	
	/**
	 * bytes received since connect/reconnect. Resets when connection is closed.
	 *
	 * @readonly
	 * @memberof TCPTransport
	 */
	get bytesReceived() {return this._bytesIn;}

	/**
	 * Connect to the socket and start
	 * @fires connected
	 * @fires status
	 */
	connect() {
		try {
			if(!this.opts.url && !this._reconnectTo) {
				this._lastError = `TCPTransport::connect url is required`;
				throw new Error(this._lastError);
			}

			var constructedUrl = (this.opts.url.indexOf('://') == -1 ? 'tcp://' : '') + this.opts.url;
			if(this._reconnectTo) {
				constructedUrl = this._reconnectTo.url ? this._reconnectTo.url : `tcp://${this._reconnectTo.host}:${this._reconnectTo.port}`;
				// do not save reconnect to the URL. query original source again if disconnected
				// idea for AM pool: add ttl as a 3rd param to client.reconnect method
				this._reconnectTo = null;
			}
			const u = url.parse(constructedUrl);
			var host = u.hostname;
			var port = u.port;
			if(!port && u.protocol === 'http:') port = 80;
			if(!port && u.protocol === 'https:') port = 443;

			if(!port || !host) {
				this._lastError = `TCPTransport::connect invalid URL. host and port are required to connect`;
				throw new Error(this._lastError);
			}

			if(this._socket) this.disconnect();

			if(!this._socket) {
				this._socket = new net.Socket();
				this._socket.setKeepAlive(this.opts.keepalive || true);
				this._socket.setNoDelay(this.opts.nodelay || true)

				this._socket.on('connect', () => { 
					this._connected = true; 
					this.emit('connected');
					this._measuretime = new Date();
					if(this._reconnectTimer) {
						clearTimeout(this._reconnectTimer);
						this._reconnectTimer = null;
					}
					if(this.opts.netstatPeriod) this.__netstatTimer = setInterval(() => { this._measureSpeed(); }, this.opts.netstatPeriod);
					this.onConnect();
				});
				this._socket.on('timeout', () => { this._connected = false; this.onTimeout(); this.emit('disconnected'); });
				this._socket.on('error', this.onError.bind(this));
				this._socket.on('data', this.onData.bind(this));
				
			}

			this._socket.on('end', () => { this._connected = false; this.onEnd(); });
			this._socket.on('close', (hadError) => { 
				this._connected = false; 
				this.emit('disconnected');
				this.onClose(hadError);
				if(this.__netstatTimer) {
					clearInterval(this.__netstatTimer);
					this.__netstatTimer = null;
					this._measureSpeed();
				}
				this._socket.removeAllListeners('end');
				this._socket.removeAllListeners('close');
				this._socket.destroy();
			});

			this._bytesOut = 0;
			this._bytesIn = 0;

			this._beforeConnect && this._beforeConnect(); // hook. can throw exceptions
			this.status = `Connecting to ${host}:${port}`;
			this._socket.connect({port:port, host:host, lookup: this.opts.dnsCache || dns.lookup});
		}
		catch(e) {
			this.lastError = e.message;
		}
	}

	/**
	 * close socket connection and cleanup timers and socket listeners. no automatic reconnect 
	 * is going to happen when disconnected. onClose is not fired. Perfect before destroying the object.
	 * @fires disconnected
	 */
	disconnect() {
		this.debug('disconnect');
		if(!this._socket) return;

		if(this._reconnectTimer) {
			clearTimeout(this._reconnectTimer);
			this._reconnectTimer = null;
		}
		if(this.__netstatTimer) {
			clearInterval(this.__netstatTimer);
			this.__netstatTimer = null;
			this._measureSpeed();
		}

		if(this._socket.destroyed) return;

		this._beforeDisconnect && this._beforeDisconnect();

		this._socket.removeAllListeners('end');
		this._socket.removeAllListeners('close');
		this._socket.destroy();
		this._connected = false;

		this.emit('disconnected');
		this.status = "Disconnected";
	}

	/**
	 * Close connection. onClose will be fired thus child classes can reconnect if the want to
	 * @fires disconnected
	 */
	close() {
		this.debug('disconnect');
		if(!this._socket) return;
		this._beforeDisconnect && this._beforeDisconnect();
		this._socket.destroy();
		this._connected = false;
		// 'disconnected' event will be emitted by onClose listener
	}

	/**
	 * send data to the server
	 *
	 * @param {*} strOrBufferOrObj
	 * @fires error
	 */
	send(strOrBufferOrObj) {
		if(!this.connected) {
			this.emit('error', 'Can not send data to closed connection');
			return;
		}
		const tosend = (typeof strOrBufferOrObj === 'object') ? (JSON.stringify(strOrBufferOrObj) + '\r\n') : strOrBufferOrObj;
		if(this.opts.logdataout) this.log('> ' + tosend.toString().replace(/\r?\n/, ''));
		this._socket.write(tosend);
	}

	/**
	 * Connection estblished callback
	 */
	onConnect() {
		this.debug('onConnect');
	}

	/**
	 * Connection has been closed by remote host callback
	 */
	onEnd() {
		this.debug('onEnd');
	}

	/**
	 * Connection closed callback
	 */
	onClose(hadError) {
		this.debug('onClose');
	}

	/**
	 * Connection or data timeout callback
	 */
	onTimeout() {
		this.lastError = 'TCPTransport::onTimeout';
		this.debug(this._lastError);
		this._socket.destroy();
	}

	/**
	 * Socket error callback
	 * @fires error
	 */
	onError(err) {
		this.lastError = err;
		this.debug(this._lastError);
		this._socket.destroy();
	}

	/**
	 * Data received callback
	 */
	onData(data){
		this.debug('onData');
		const sData = data.toString('utf8');
		if(this.opts.logdatain) this.log('< ' + sData);
	}

	/**
	 * Measure up/down speeds and update stats
	 * @inner
	 */
	_measureSpeed() {
		if(!this._socket) return;
		if(!this._connected) {
			this._upspeed = 0;
			this._downspeed = 0;
		}
		const dt = new Date();
		const dtime = (dt - this._measuretime) / 1000;
		if(dtime < 0.11) return;
		const bup = this._socket.bytesWritten - this._bytesOut;
		const bdown = this._socket.bytesRead - this._bytesIn;

		this._upspeed = ~~((this._upspeed + (bup / dtime)) / 2);
		this._downspeed = ~~((this._downspeed + (bdown / dtime)) / 2);
		if(this._upspeed < 1) this._upspeed = 0;
		if(this._downspeed < 1) this._downspeed = 0;
		this._bytesOut = this._socket.bytesWritten;
		this._bytesIn = this._socket.bytesRead;
		this._totalBytesOut += bup;
		this._totalBytesIn += bdown;
		this._measuretime = dt;

		if(this.opts.lognetstat) {
			const o = {
				upspeed: this._upspeed,
				downspeed: this._downspeed,
				out: this._bytesOut,
				in: this._bytesIn,
			}
			if(this._upspeed || this._downspeed) console.error(o)
		}
	}
}

module.exports = TCPTransport;
const EventEmitter = require('events').EventEmitter;

/**
 * Generic Transport interface for mining job devlivery with built-in logging
 * @module transport
 * @typicalname transport
 */

 /**
 * @external EventEmitter
 * @see {@link http://nodejs.org/api/events.html}
 */


/**
 * Transport config object
 * @namespace TransportOptions
 * @property {LoggerInterface} logger=false	Class instance specific logger, if required
 * @property {boolean} loglog=false	Allow this.log() to print
 * @property {boolean} logdebug=false	Allow this.debug() to print
 * @property {boolean} logerror=false	Allow this.error() to print
 * @property {boolean} logwarning=false Allow this.warning() to print
 */
const defaultconfig = {
	logger: null,

	loglog: false,
	logdebug: false,
	logerror: false,
	logwarning: false,
};


/** 
 * Implements default logger functions with forwrding to console
 * @namespace LoggerInterface
 * @see ITransport#error
*/
var defaultLogger = {
	/**
	 * Log function 
	 * @static
	 * @param {string} cat Category
	 * @param {string} msg Message
	 * @memberof LoggerInterface
	 * @method log
	 */
	log(cat, msg) {
		console.log(`[${cat}] ${msg}`);
	},

	/**
	 * Debug log function. Most ITransport methods will use it inside
	 * @static
	 * @function
	 * @param {string} cat Category
	 * @param {string} msg Message
	 * @memberof LoggerInterface
	 */
	debug(cat, msg) {
		console.log(`[${cat}] ${msg}`);
	},

	/**
	 * Error log
	 * @static
	 * @param {string} cat Category
	 * @param {string} msg Message
	 * @memberof LoggerInterface
	 */
	error(cat, msg) {
		console.error(`[${cat}] ${msg}`);
	},

	/**
	 * Wrning log
	 * @static
	 * @param {string} cat Category
	 * @param {string} msg Message
	 * @memberof LoggerInterface
	 */
	warning(cat, msg) {
		console.warning(`[${cat}] ${msg}`);
	},
}


var logger = defaultLogger;
var agent = 'atomminer/1.1.0';

/**
 * @class 
 * @extends {external:EventEmitter}
 * @param {TransportConfig} config ITransport configuration object. See See: {@link ~TransportOptions}
 * @fires ITransport#error
 * @fires ITransport#status
 * @alias module:transport
 * @exports
 * @public
 */
class ITransport extends EventEmitter {
	constructor(config) { 
		super();
		this._status = 'Offline';
		this.logger = null; // use global logger by default
		this.opts = config ? { ...defaultconfig, ...config } : defaultconfig;
		this._lastError = '';
	}

	// https://esdiscuss.org/topic/define-static-properties-and-prototype-properties-with-the-class-syntax
	//static AGENT = 'atomminer/1.1.0';  // node 14+
	// target node 10+
	/**
  * Get current agent string
  * @static
  * @returns {string} Current agent string
  */
	static get AGENT() { return agent; }
	/**
  * Set Agent with version
  * @param {string} val New agent string
  * @static
  */
	static set AGENT(val) { agent = val; }

	/**
	 * Set default global logger used by all ITransport instances
	 *
	 * @static
	 * @param {LoggerInterface} log Logger inteface
	 * @return {LoggerInterface} 
	 */
	static setDefaultLogger(log) {
		if(log !== undefined) logger = log;
		return logger;
	}

	/**
	 * Sets custom logger for this current instance
	 *
	 * @param {LoggerInterface} log Logger inteface
	 * @return {LoggerInterface} 
	 */
	setLogger(log) {
		if(log !== undefined) this.logger = log;
		return this.logger || logger;
	}


	/**
	 * Get current config
	 *
	 * @readonly
	 */
	get config() { return this.opts; }


	/**
	 * Get last error
	 *
	 * @readonly
	 */
	get lastError() { return this._lastError; }
	

	/**
  * Set lastError and fire "error" event
	* @param {Error|string} e Error description
  * @event error
  */
	set lastError(e) {
		this._lastError = e || '';
		if(this._lastError.length) this.emit('error', this._lastError);
	}

	
	/**
	 * Get current status
	 *
	 * @readonly
	 */
	get status() { return this._status; }


	/**
  * Set current status and fire "status" event.
	* @param {string} e Error description
  * @event status
  */
	set status(val) { 
		if(val !== undefined) {
			this._status = val; 
			if(this._status) this.emit('status', val);
		}
	}

	// connect to the transport
	connect() {
		throw new Error('ITransport::connect is not Implemented');
	}

	// disconnect
	disconnect() {
		throw new Error('ITransport::disconnect is not Implemented');
	}

	// send response or whatever to the server
	send() {
		throw new Error('ITransport::disconnect is not Implemented');
	}

	// logging functions
	log(msg) {
		if(!this.opts.loglog) return;
		const l = this.logger || logger;
		l.log(this.constructor.name, (typeof msg === 'string') ? msg : JSON.stringify(msg));
	}
	debug(msg) {
		if(!this.opts.logdebug) return;
		const l = this.logger || logger;
		l.log(this.constructor.name, (typeof msg === 'string') ? msg : JSON.stringify(msg));
	}
	warning(msg) {
		if(!this.opts.logwarning) return;
		const l = this.logger || logger;
		l.log(this.constructor.name, (typeof msg === 'string') ? msg : JSON.stringify(msg));
	}
	error(msg) {
		if(!this.opts.logerror) return;
		const l = this.logger || logger;
		l.log(this.constructor.name, (typeof msg === 'string') ? msg : JSON.stringify(msg));
	}
}

module.exports = ITransport;
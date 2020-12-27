const EventEmitter = require('events').EventEmitter;

const defaultconfig = {
	logger: null, 				// private instance logger. global logger is used if null

	loglog: false,				// this.log
	logdebug: false,			// this.debug
	logerror: false,			// this.error
	logwarning: false,		// this.warning
};

/////////////////////////////////////////////////////////////////////////////////////////
// simple default logger
// use ITransport::setDefaultLogger to set another logger or logging proxy
const defaultLogger = {
	log(cat, msg) {
		console.log(`[${cat}] ${msg}`);
	},
	debug(cat, msg) {
		console.log(`[${cat}] ${msg}`);
	},
	error(cat, msg) {
		console.error(`[${cat}] ${msg}`);
	},
	warning(cat, msg) {
		console.warning(`[${cat}] ${msg}`);
	},
}

const logger = defaultLogger;
var agent = 'atomminer/1.1.0';

// transport interface (!!!) 
// emits:
// error					- 
// status					- internal status change

class ITransport extends EventEmitter {
	constructor(config) { 
		super();
		this._status = 'Offline';
		this.logger = null; // use global logger by default
		this.config(config ? { ...defaultconfig, ...config } : defaultconfig);
		this._lastError = '';
	}

	// https://esdiscuss.org/topic/define-static-properties-and-prototype-properties-with-the-class-syntax
	//static AGENT = 'atomminer/1.1.0';  // node 14+
	// target node 10+
	static get AGENT() { return agent; }
	static set AGENT(v) { agent = v; }

	/////////////////////////////////////////////////////////////////////////////////////////
	// sets default global logger used by all ITransport instances
	static setDefaultLogger(log) {
		if(log !== undefined) logger = log;
		return logger;
	}
	/////////////////////////////////////////////////////////////////////////////////////////
	// sets logger for this current instance
	setLogger(log) {
		if(log !== undefined) this.logger = log;
		return this.logger || logger;
	}

	// get/set current config
	get config() { return this.opts; }
	config(val) { 
		if(val !== undefined) this.opts = { ...defaultconfig, ...val };
		if(this.opts.logger) this.logger = this.opts.logger;
		return this.opts; 
	}

	// lastError
	get lastError() { return this._lastError; }
	set lastError(e) {
		this._lastError = e || '';
		if(this._lastError.length) this.emit('error', this._lastError);
	}

	// get/set current status
	get status() { return this._status; }
	status(val) { 
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
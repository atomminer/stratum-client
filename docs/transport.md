##### [<< Back to index](README.md)

<a name="module_transport"></a>

## transport
Generic Transport interface for mining job devlivery with built-in logging


* [transport](#module_transport)
    * [ITransport](#exp_module_transport--ITransport) ⇐ [<code>EventEmitter</code>](http://nodejs.org/api/events.html) ⏏
        * [new ITransport(config)](#new_module_transport--ITransport_new)
        * _instance_
            * [.config](#module_transport--ITransport+config)
            * [.lastError](#module_transport--ITransport+lastError)
            * [.status](#module_transport--ITransport+status)
            * [.setLogger(log)](#module_transport--ITransport+setLogger) ⇒ <code>LoggerInterface</code>
        * _static_
            * [.AGENT](#module_transport--ITransport.AGENT) ⇒ <code>string</code>
            * [.AGENT](#module_transport--ITransport.AGENT)
            * [.setDefaultLogger(log)](#module_transport--ITransport.setDefaultLogger) ⇒ <code>LoggerInterface</code>
        * _inner_
            * [~TransportOptions](#module_transport--ITransport..TransportOptions) : <code>object</code>
            * [~LoggerInterface](#module_transport--ITransport..LoggerInterface) : <code>object</code>
            * ["error" (e)](#event_error)
            * ["status" (e)](#event_status)

<a name="exp_module_transport--ITransport"></a>

### ITransport ⇐ [<code>EventEmitter</code>](http://nodejs.org/api/events.html) ⏏
**Kind**: Exported class  
**Extends**: [<code>EventEmitter</code>](http://nodejs.org/api/events.html)  
**Emits**: <code>ITransport#event:error</code>, <code>ITransport#event:status</code>  
**Access**: public  
<a name="new_module_transport--ITransport_new"></a>

#### new ITransport(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>TransportConfig</code> | ITransport configuration object. See See: [~TransportOptions](~TransportOptions) |

<a name="module_transport--ITransport+config"></a>

#### iTransport.config
Get current config

**Kind**: instance property of [<code>ITransport</code>](#exp_module_transport--ITransport)  
**Read only**: true  
<a name="module_transport--ITransport+lastError"></a>

#### iTransport.lastError
Get last error

**Kind**: instance property of [<code>ITransport</code>](#exp_module_transport--ITransport)  
**Read only**: true  
<a name="module_transport--ITransport+status"></a>

#### iTransport.status
Get current status

**Kind**: instance property of [<code>ITransport</code>](#exp_module_transport--ITransport)  
**Read only**: true  
<a name="module_transport--ITransport+setLogger"></a>

#### iTransport.setLogger(log) ⇒ <code>LoggerInterface</code>
Sets custom logger for this current instance

**Kind**: instance method of [<code>ITransport</code>](#exp_module_transport--ITransport)  

| Param | Type | Description |
| --- | --- | --- |
| log | <code>LoggerInterface</code> | Logger inteface |

<a name="module_transport--ITransport.AGENT"></a>

#### ITransport.AGENT ⇒ <code>string</code>
Get current agent string

**Kind**: static property of [<code>ITransport</code>](#exp_module_transport--ITransport)  
**Returns**: <code>string</code> - Current agent string  
<a name="module_transport--ITransport.AGENT"></a>

#### ITransport.AGENT
Set Agent with version

**Kind**: static property of [<code>ITransport</code>](#exp_module_transport--ITransport)  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> | New agent string |

<a name="module_transport--ITransport.setDefaultLogger"></a>

#### ITransport.setDefaultLogger(log) ⇒ <code>LoggerInterface</code>
Set default global logger used by all ITransport instances

**Kind**: static method of [<code>ITransport</code>](#exp_module_transport--ITransport)  

| Param | Type | Description |
| --- | --- | --- |
| log | <code>LoggerInterface</code> | Logger inteface |

<a name="module_transport--ITransport..TransportOptions"></a>

#### ITransport~TransportOptions : <code>object</code>
Transport config object

**Kind**: inner namespace of [<code>ITransport</code>](#exp_module_transport--ITransport)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| logger | <code>LoggerInterface</code> | <code>false</code> | Class instance specific logger, if required |
| loglog | <code>boolean</code> | <code>false</code> | Allow this.log() to print |
| logdebug | <code>boolean</code> | <code>false</code> | Allow this.debug() to print |
| logerror | <code>boolean</code> | <code>false</code> | Allow this.error() to print |
| logwarning | <code>boolean</code> | <code>false</code> | Allow this.warning() to print |

<a name="module_transport--ITransport..LoggerInterface"></a>

#### ITransport~LoggerInterface : <code>object</code>
Implements default logger functions with forwrding to console

**Kind**: inner namespace of [<code>ITransport</code>](#exp_module_transport--ITransport)  
**See**: ITransport#error  
<a name="event_error"></a>

#### "error" (e)
Set lastError and fire "error" event

**Kind**: event emitted by [<code>ITransport</code>](#exp_module_transport--ITransport)  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Error</code> \| <code>string</code> | Error description |

<a name="event_status"></a>

#### "status" (e)
Set current status and fire "status" event.

**Kind**: event emitted by [<code>ITransport</code>](#exp_module_transport--ITransport)  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>string</code> | Error description |


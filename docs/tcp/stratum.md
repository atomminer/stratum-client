##### [<< Back to index](../README.md)

<a name="module_tcp/stratum"></a>

## tcp/stratum
JSON-RPC stratum protocol client. Default protocol is stratum+tcp://

Typical disconnect reasons:
- network error like timeout, server closed connection, conn refused etc.;
- stratum authorization fails with error;
- internal data buffer has more than 8Kb in it (should not happen if we're using stratum protocol);
- server sends 5 or more unknown/invalid commands one after another;
- no response to login command for 5 seconds;

Hard-coded Stratum methods ID's
`1` - jsonrpc2 login
`2` - mining.subscribe
`3` - mining.authorize
`4` - mining.ping
`[5,19]` - reserved
`20+` submit share/response


* [tcp/stratum](#module_tcp/stratum)
    * [Stratum](#exp_module_tcp/stratum--Stratum) ⇐ [<code>TCPTransport</code>](./tcp.md) ⏏
        * [new Stratum(config)](#new_module_tcp/stratum--Stratum_new)
        * _instance_
            * [.type](#module_tcp/stratum--Stratum+type)
            * [.online](#module_tcp/stratum--Stratum+online)
            * [.algo](#module_tcp/stratum--Stratum+algo)
            * [.jsonRPC2](#module_tcp/stratum--Stratum+jsonRPC2)
            * [.id](#module_tcp/stratum--Stratum+id)
            * [.connect()](#module_tcp/stratum--Stratum+connect)
            * [.disconnect()](#module_tcp/stratum--Stratum+disconnect)
            * [.close()](#module_tcp/stratum--Stratum+close)
            * ["connected"](#event_connected)
            * ["disconnected"](#event_disconnected)
            * ["error"](#event_error)
            * ["status"](#event_status)
            * ["redirect"](#event_redirect)
            * ["online"](#event_online)
            * ["diff"](#event_diff)
            * ["job"](#event_job)
            * ["accepted"](#event_accepted)
            * ["rejected"](#event_rejected)
        * _inner_
            * [~StratumOptions](#module_tcp/stratum--Stratum..StratumOptions) : <code>object</code>
            * [~_beforeConnect()](#module_tcp/stratum--Stratum.._beforeConnect)
            * [~_beforeDisconnect()](#module_tcp/stratum--Stratum.._beforeDisconnect)
            * [~doConnect()](#module_tcp/stratum--Stratum..doConnect)
            * [~_onLoginTimeout()](#module_tcp/stratum--Stratum.._onLoginTimeout)
            * [~onConnect()](#module_tcp/stratum--Stratum..onConnect)
            * [~onEnd()](#module_tcp/stratum--Stratum..onEnd)
            * [~onClose()](#module_tcp/stratum--Stratum..onClose)
            * [~onTimeout()](#module_tcp/stratum--Stratum..onTimeout)
            * [~onError()](#module_tcp/stratum--Stratum..onError)
            * [~onData()](#module_tcp/stratum--Stratum..onData)
            * [~onCommand()](#module_tcp/stratum--Stratum..onCommand)
            * [~onLoggedIn()](#module_tcp/stratum--Stratum..onLoggedIn)
            * [~onLogin()](#module_tcp/stratum--Stratum..onLogin)
            * [~onJob()](#module_tcp/stratum--Stratum..onJob)
            * [~onSubscribe()](#module_tcp/stratum--Stratum..onSubscribe)
            * [~onNotify()](#module_tcp/stratum--Stratum..onNotify)
            * [~onAuthorize()](#module_tcp/stratum--Stratum..onAuthorize)
            * [~onSetExtraNonce()](#module_tcp/stratum--Stratum..onSetExtraNonce)
            * [~onShowMessage()](#module_tcp/stratum--Stratum..onShowMessage)
            * [~onReconnect()](#module_tcp/stratum--Stratum..onReconnect)
            * [~onPing()](#module_tcp/stratum--Stratum..onPing)
            * [~onDiff()](#module_tcp/stratum--Stratum..onDiff)
            * [~onShareResult()](#module_tcp/stratum--Stratum..onShareResult)

<a name="exp_module_tcp/stratum--Stratum"></a>

### Stratum ⇐ [<code>TCPTransport</code>](./tcp.md) ⏏
**Kind**: Exported class  
**Extends**: [<code>TCPTransport</code>](./tcp.md)  
**Emits**: [<code>connected</code>](#event_connected), [<code>disconnected</code>](#event_disconnected), [<code>error</code>](#event_error), [<code>status</code>](#event_status), [<code>redirect</code>](#event_redirect), [<code>online</code>](#event_online), [<code>diff</code>](#event_diff), [<code>job</code>](#event_job), [<code>accepted</code>](#event_accepted), [<code>rejected</code>](#event_rejected)  
**Access**: public  
<a name="new_module_tcp/stratum--Stratum_new"></a>

#### new Stratum(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>StratumOptions</code> | StratumOptions configuration object. See: [~StratumOptions](~StratumOptions) |

<a name="module_tcp/stratum--Stratum+type"></a>

#### stratum.type
Get protocol type. Either `stratum` or `stratum2.0`

**Kind**: instance property of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Read only**: true  
<a name="module_tcp/stratum--Stratum+online"></a>

#### stratum.online
Check if stratum clien is online. I.e if authorization/login was accepted by the server

**Kind**: instance property of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Read only**: true  
<a name="module_tcp/stratum--Stratum+algo"></a>

#### stratum.algo
Current algo. See [~StratumOptions](~StratumOptions)

**Kind**: instance property of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Read only**: true  
<a name="module_tcp/stratum--Stratum+jsonRPC2"></a>

#### stratum.jsonRPC2
Check if JSON-RPC 2.0 login was accepted and we're working in 2.0 mode [~StratumOptions](~StratumOptions)

**Kind**: instance property of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Read only**: true  
<a name="module_tcp/stratum--Stratum+id"></a>

#### stratum.id
This class pseudo-unique ID

**Kind**: instance property of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Read only**: true  
<a name="module_tcp/stratum--Stratum+connect"></a>

#### stratum.connect()
Connect to the stratum server

**Kind**: instance method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum+disconnect"></a>

#### stratum.disconnect()
Permanently close connection to the pool and destroy all internal timers.

**Kind**: instance method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum+close"></a>

#### stratum.close()
Close connection to the pool and let current instance to decide if it wants to reconnect, when and where to.

**Kind**: instance method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="event_connected"></a>

#### "connected"
Event reporting that socket is connected. Fired by parent class TCPTransport

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="event_disconnected"></a>

#### "disconnected"
Event reporting that socket is disconnected. Fired by parent class TCPTransport

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="event_error"></a>

#### "error"
Error event.  Fired by parent class TCPTransport

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| e | <code>string</code> \| <code>Error</code> | Error description |

<a name="event_status"></a>

#### "status"
Status event. Fired when internal status changes. Fired by parent class TCPTransport

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| status | <code>string</code> | New status |

<a name="event_redirect"></a>

#### "redirect"
Reconnect event. Fired when pool is requesting to reconnect to another port/URL. No action 
required if `stratum.config.reconnectOnError` is set to `true`.

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| r | <code>Object</code> | Contains reconnect info: either `r.url` or `r.host` and `r.port` should be provided. |

<a name="event_online"></a>

#### "online"
Online event. Fired when stratum server confirms authorization/login

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="event_diff"></a>

#### "diff"
Difficulty changed event. Fired when pool changes target difficulty

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| diff | <code>Number</code> | New difficulty |

<a name="event_job"></a>

#### "job"
New job received event.

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| job | <code>Array</code> \| <code>Object</code> | `Object` containing job data blob for JSON-RPC 2.0 pools;  and `Array` for JSON-RPC 1.x pools |

<a name="event_accepted"></a>

#### "accepted"
Share accepted event.

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | ID of the share that was accepted by the pool. Actual share data  like nonce, extra nonce etc. should be tracked somewhere else |

<a name="event_rejected"></a>

#### "rejected"
Share rejected event.

**Kind**: event emitted by [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Same as accepted, only fired when share was rejected by the pool. |

<a name="module_tcp/stratum--Stratum..StratumOptions"></a>

#### Stratum~StratumOptions : <code>object</code>
Stratum config object. Inherits TCPOptions

**Kind**: inner namespace of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> | <code>null</code> | url to connect to. ex: 'tcp://127.0.0.1:8080'. protocol defaults to  stratum+tcp:// if not specified. |
| keepalive | <code>boolean</code> | <code>true</code> | whether set keep-alive flag on the socket or not. |
| nodelay | <code>boolean</code> | <code>true</code> | socket.setNoDelay enable/disable the use of Nagle's algorithm. |
| username | <code>string</code> | <code>null</code> | Stratum login. stratum::Connect will throw an error if username is  `null` or empty. Always put `stratum.connect` in `try{} catch{}` block. |
| password | <code>string</code> | <code>&quot;&#x27;x&#x27;&quot;</code> | Stratum password or options as required by the pool. 'x' is the  most common password for all-default pool settings. |
| jsonRPC2 | <code>boolean</code> | <code>false</code> | Indicates that stratum should attempt JSON-RPC 2.0 login first  and then fallback to 1.x on failure. Defaults to `false` due to the fact that too many pool backends  do not tolerate unknown commands. |
| reconnectSession | <code>boolean</code> | <code>true</code> | Attempts to use previous mining session on reconnect, if  supported by the pool. |
| loginTimeout | <code>Number</code> | <code>5000</code> | Time in ms to wait for authorization/login response. Some dumb pools ignore mining.authorize and/or login commands if something is wrong, instead of error response. `0` to disable. |
| enablePing | <code>boolean</code> | <code>false</code> | Tells stratum if it should try to use `mining.ping`/`mining.pong`  methods to keep connection truly alive. Many pools will disconnect client for using `mining.ping`. |
| reconnectOnError | <code>boolean</code> | <code>true</code> | Tells stratum to try to reconnect to the pool on error. If `false`, stratum client will remain in disconnected state and it is up to external manager to control when to connect again. |
| reconnectTimeout | <code>Array</code> \| <code>Number</code> | <code>[1000,5000,10000,30000</code> | Reconnect timeouts in ms. Use `Number` for  fixed timeout and `Array` of numbers for more logical dynamic timeouts. Value of `10000` will make this class to work the same way `cpumier` does. Dynamic (default) timeouts should be more efficient when network error happened by  reconnecting client within 1s and increasing timeout value if connection keeps failing. |
| algo | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Optional. Algo name for this stratum connection. Will be pretty useful  for parsing data and assembling mining block with JSON-RPC 1.x pools. |
| id | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Will be generated if left empty string or `null`. Convenience identity field  to helps save, load and track pools and connections in multi-pool environment. |

<a name="module_tcp/stratum--Stratum.._beforeConnect"></a>

#### Stratum~\_beforeConnect()
Before connect hook. Called right before socket.connect

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum.._beforeDisconnect"></a>

#### Stratum~\_beforeDisconnect()
Before disconnect hook. Called right before `'disconnect'`

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..doConnect"></a>

#### Stratum~doConnect()
Sends initial messages (`login` or `mining.subscribe` + `mining.authorize`) to the server once socket is connected

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum.._onLoginTimeout"></a>

#### Stratum~\_onLoginTimeout()
Called when loginTimeout expired with no response from the pool server. Will cause disconnect

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onConnect"></a>

#### Stratum~onConnect()
Called by TCPTransport when connection to the pool is established.

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onEnd"></a>

#### Stratum~onEnd()
Called by TCPTransport when remote host has closed connection.

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onClose"></a>

#### Stratum~onClose()
Called by TCPTransport when socket connections is closed. **!!!NOTE!!!** `onClose` is not called on `stratum.disconnect()`
thus preventing automatic reconnect. Use `stratum.close()` if reconnect required.

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onTimeout"></a>

#### Stratum~onTimeout()
Called by TCPTransport on timeout and onLoginTimeout.

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onError"></a>

#### Stratum~onError()
Erro handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onData"></a>

#### Stratum~onData()
Data received on the underlying socket

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onCommand"></a>

#### Stratum~onCommand()
Decode and process stratum command/method

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onLoggedIn"></a>

#### Stratum~onLoggedIn()
Internal. Called up when either login or mining.authorize are accepted by the pool

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>online</code>](#event_online)  
<a name="module_tcp/stratum--Stratum..onLogin"></a>

#### Stratum~onLogin()
JSON-RPC 2.0 login method response handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onJob"></a>

#### Stratum~onJob()
Called when new job received from the pool

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>job</code>](#event_job)  
<a name="module_tcp/stratum--Stratum..onSubscribe"></a>

#### Stratum~onSubscribe()
`mining.subscribe` response handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onNotify"></a>

#### Stratum~onNotify()
`mining.notify` handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>job</code>](#event_job)  
<a name="module_tcp/stratum--Stratum..onAuthorize"></a>

#### Stratum~onAuthorize()
`mining.authorize` handlers

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: <code>event:login</code>  
<a name="module_tcp/stratum--Stratum..onSetExtraNonce"></a>

#### Stratum~onSetExtraNonce()
Internal. Parse extra nonce

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onShowMessage"></a>

#### Stratum~onShowMessage()
`client.show_message` handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>status</code>](#event_status)  
<a name="module_tcp/stratum--Stratum..onReconnect"></a>

#### Stratum~onReconnect()
`client.reconnect` handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>redirect</code>](#event_redirect)  
<a name="module_tcp/stratum--Stratum..onPing"></a>

#### Stratum~onPing()
`mining.ping` handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
<a name="module_tcp/stratum--Stratum..onDiff"></a>

#### Stratum~onDiff()
`mining.set_difficulty` handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>diff</code>](#event_diff)  
<a name="module_tcp/stratum--Stratum..onShareResult"></a>

#### Stratum~onShareResult()
Share result handler

**Kind**: inner method of [<code>Stratum</code>](#exp_module_tcp/stratum--Stratum)  
**Emits**: [<code>accepted</code>](#event_accepted), [<code>rejected</code>](#event_rejected)  

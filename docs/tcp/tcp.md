##### [<< Back to index](../README.md)

<a name="module_tcp/tcp"></a>

## tcp/tcp
Generic TCP transport over raw socket


* [tcp/tcp](#module_tcp/tcp)
    * [TCPTransport](#exp_module_tcp/tcp--TCPTransport) ⇐ [<code>ITransport</code>](../transport.md) ⏏
        * [new TCPTransport(config)](#new_module_tcp/tcp--TCPTransport_new)
        * _instance_
            * [.type](#module_tcp/tcp--TCPTransport+type)
            * [.connected](#module_tcp/tcp--TCPTransport+connected)
            * [.netstat](#module_tcp/tcp--TCPTransport+netstat)
            * [.upspeed](#module_tcp/tcp--TCPTransport+upspeed)
            * [.downspeed](#module_tcp/tcp--TCPTransport+downspeed)
            * [.totalBytesSent](#module_tcp/tcp--TCPTransport+totalBytesSent)
            * [.totalBytesReceived](#module_tcp/tcp--TCPTransport+totalBytesReceived)
            * [.bytesSent](#module_tcp/tcp--TCPTransport+bytesSent)
            * [.connect()](#module_tcp/tcp--TCPTransport+connect)
            * [.disconnect()](#module_tcp/tcp--TCPTransport+disconnect)
            * [.close()](#module_tcp/tcp--TCPTransport+close)
            * [.send(strOrBufferOrObj)](#module_tcp/tcp--TCPTransport+send)
            * [.onConnect()](#module_tcp/tcp--TCPTransport+onConnect)
            * [.onEnd()](#module_tcp/tcp--TCPTransport+onEnd)
            * [.onClose()](#module_tcp/tcp--TCPTransport+onClose)
            * [.onTimeout()](#module_tcp/tcp--TCPTransport+onTimeout)
            * [.onError()](#module_tcp/tcp--TCPTransport+onError)
            * [.onData()](#module_tcp/tcp--TCPTransport+onData)
        * _inner_
            * [~TCPOptions](#module_tcp/tcp--TCPTransport..TCPOptions) : <code>object</code>
            * [~_measureSpeed()](#module_tcp/tcp--TCPTransport.._measureSpeed)
            * ["connected"](#event_connected)
            * ["disconnected"](#event_disconnected)
            * ["error"](#event_error)
            * ["status"](#event_status)

<a name="exp_module_tcp/tcp--TCPTransport"></a>

### TCPTransport ⇐ [<code>ITransport</code>](../transport.md) ⏏
**Kind**: Exported class  
**Extends**: [<code>ITransport</code>](../transport.md)  
**Emits**: [<code>connected</code>](#event_connected), [<code>disconnected</code>](#event_disconnected), [<code>error</code>](#event_error), [<code>status</code>](#event_status)  
**Access**: public  
<a name="new_module_tcp/tcp--TCPTransport_new"></a>

#### new TCPTransport(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>TCPOptions</code> | TCPOptions configuration object. See See: [~TCPOptions](~TCPOptions) |

<a name="module_tcp/tcp--TCPTransport+type"></a>

#### tcpTransport.type
Get protocol type

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+connected"></a>

#### tcpTransport.connected
Check if socket is connected

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+netstat"></a>

#### tcpTransport.netstat
Shows if netstat is enabled and running on this connection

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+upspeed"></a>

#### tcpTransport.upspeed
Average upload speed in bytes/s

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+downspeed"></a>

#### tcpTransport.downspeed
Average download speed in bytes/s

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+totalBytesSent"></a>

#### tcpTransport.totalBytesSent
Total bytes sent

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+totalBytesReceived"></a>

#### tcpTransport.totalBytesReceived
Total bytes received

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+bytesSent"></a>

#### tcpTransport.bytesSent
Bytes sent since connect/reconnect. Resets when connection is closed.

**Kind**: instance property of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Read only**: true  
<a name="module_tcp/tcp--TCPTransport+connect"></a>

#### tcpTransport.connect()
Connect to the socket and start

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Emits**: [<code>connected</code>](#event_connected), [<code>status</code>](#event_status)  
<a name="module_tcp/tcp--TCPTransport+disconnect"></a>

#### tcpTransport.disconnect()
close socket connection and cleanup timers and socket listeners. no automatic reconnect 
is going to happen when disconnected. onClose is not fired. Perfect before destroying the object.

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Emits**: [<code>disconnected</code>](#event_disconnected)  
<a name="module_tcp/tcp--TCPTransport+close"></a>

#### tcpTransport.close()
Close connection. onClose will be fired thus child classes can reconnect if the want to

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Emits**: [<code>disconnected</code>](#event_disconnected)  
<a name="module_tcp/tcp--TCPTransport+send"></a>

#### tcpTransport.send(strOrBufferOrObj)
send data to the server

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Emits**: [<code>error</code>](#event_error)  

| Param | Type |
| --- | --- |
| strOrBufferOrObj | <code>\*</code> | 

<a name="module_tcp/tcp--TCPTransport+onConnect"></a>

#### tcpTransport.onConnect()
Connection estblished callback

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="module_tcp/tcp--TCPTransport+onEnd"></a>

#### tcpTransport.onEnd()
Connection has been closed by remote host callback

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="module_tcp/tcp--TCPTransport+onClose"></a>

#### tcpTransport.onClose()
Connection closed callback

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="module_tcp/tcp--TCPTransport+onTimeout"></a>

#### tcpTransport.onTimeout()
Connection or data timeout callback

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="module_tcp/tcp--TCPTransport+onError"></a>

#### tcpTransport.onError()
Socket error callback

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Emits**: [<code>error</code>](#event_error)  
<a name="module_tcp/tcp--TCPTransport+onData"></a>

#### tcpTransport.onData()
Data received callback

**Kind**: instance method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="module_tcp/tcp--TCPTransport..TCPOptions"></a>

#### TCPTransport~TCPOptions : <code>object</code>
TCP Transport config object

**Kind**: inner namespace of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> | <code>false</code> | URL to connect to. ex: 'tcp://127.0.0.1:8080' or 'localhost:8080' |
| keepalive | <code>boolean</code> | <code>false</code> | whether set keep-alive flag on the socket or not |
| nodelay | <code>boolean</code> | <code>false</code> | socket.setNoDelay enable/disable the use of Nagle's algorithm. |
| logdataout | <code>boolean</code> | <code>false</code> | Enable logging of outgoing data |
| logdatain | <code>boolean</code> | <code>false</code> | Enable logging of incoming data |
| lognetstat | <code>boolean</code> | <code>false</code> | Log network statistics every once in a while |
| netstatPeriod | <code>boolean</code> | <code>1000</code> | Network statistics refresh period. 0 to disable |
| dnsCache | <code>boolean</code> | <code>dns.lookup</code> | Optional DNS cache. Must implement [DNS Lookup](https://nodejs.org/api/dns.html#dns_dns_lookup_hostname_options_callback) |

<a name="module_tcp/tcp--TCPTransport.._measureSpeed"></a>

#### TCPTransport~\_measureSpeed()
Measure up/down speeds and update stats

**Kind**: inner method of [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="event_connected"></a>

#### "connected"
Event reporting that socket is connected.

**Kind**: event emitted by [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="event_disconnected"></a>

#### "disconnected"
Event reporting that socket is disconnected.

**Kind**: event emitted by [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
<a name="event_error"></a>

#### "error"
Error event.

**Kind**: event emitted by [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| e | <code>string</code> \| <code>Error</code> | Error description |

<a name="event_status"></a>

#### "status"
Status event. Fired when internal status changes

**Kind**: event emitted by [<code>TCPTransport</code>](#exp_module_tcp/tcp--TCPTransport)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| status | <code>string</code> | New status |


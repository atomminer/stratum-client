Stratum Client
==============

Stratum client made with node js. Suitable for building miner software.

#### Motivation:
While curl or libevent can do the trick, it is faster and easier to use nodejs for async socket communications. This code showed acceptable behavior during tests and can easily handle hundreds of stratum connections without visible lags thus can be used in multi-miner multi-pool environments. This leaves enough room for improvements in the future like round-robin jobs dispatch and more advanced profit switching.

#### Features:
- Supports most of the mining pools. Found incompatible stratum pool? Please create New Issue;
- Supports traditional stratum pools 1.x like sha256 and tons of other coins;
- Supports JSON-RPC2.0 pool that sends job blobs like XMR, AEON and others;
- Supports client.reconnect method;
- Handles network errors and attempts reconnect; Default reconnect timeouts: 1, 5, 10, 30 seconds;
- Supports mining sessions and attempts to reconnect to the previous one if connection was interrupted or broken;
- Built-in traffic meter that provides handy stats: bytes received and transferred during object lifetime and current session along with average up/down speed.

##### Installation
Can be installed via npm. Requires node 10+. 
```sh
npm install atomminer/stratum-client
```
Tested with the following node versions: 10.21.0; 10.23.0; 14.13.0; 14.15.3; 15.5.0

##### Usage
```js
const {Stratum} = require('stratum-client');
const opts = {
    url: 'stratum+tcp://sha256q.pool.atomminer.com:6221',
    username: 'donate@atomminer.com',
}
const s3 = new Stratum(opts);
s3.on('disconnected', () => { console.log(`Stratum disconnected`); })
s3.on('status', (s) => { console.log(`Stratum status: ${s}`); })
s3.on('error', (e) => { console.log(`Stratum error: ${e}`); });
s3.on('online', () => { console.log(`Stratum changed state to online`); });
s3.on('diff', (d) => { console.log(`Stratum set difficulty to ${d}`); });
s3.on('redirect', (d) => { console.log(`Stratum requested reconnect`); });
s3.on('job', (j) => { 
	var id = s3.jsonRPC2 ? j.job_id : j[0];
	console.log(`Stratum new job ${id} received`);
});
s3.connect();
```
check test.js for more info


##### License
This software is released under BSD 4-Clause Original license

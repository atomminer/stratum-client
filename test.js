const Stratum = require('./index').Stratum;

// NOTE to self:
// most pools will not tolerate incorrect commands!!!
//	- do not enable pings (enablePing) 
//	- do not use rpc2.0 (jsonRPC2) with fallback to 1.x on pools unless it is supported
//	- so far, rpc2.0 only makes sense when algo is set to k12 (AEON)
//
// Discovered issues:
// - NOMP is ignoring invalid commands => timeout
// - some yiimp pools seem to kick you out instead of sending 'Not Supported' error
// - yiimp flips out when you send mining.authorize before mining.subscribe
// - zergpool closes connection in response to mining.ping command
// - zergpool's jsonrpc2 completely ignores login. incorrect logins like email are accepted (!!!). Use with caution
// - nicehash is...well, nicehash. Use with caution
//
// test-cases
// 1.  null config 																																								 OK
// 2.  url that throws connection refused		stratum+tcp://127.0.0.1:55555 												 OK
// 3.  non-stratum protocol 				 				http://127.0.0.1/ 																		 OK
// 4.  pool.atomminer.com										stratum+tcp://sha256q.pool.atomminer.com:6221 				 OK
// 5.  nomp based pool											stratum+tcp://pool.cryptopowered.club:1275			[GLT]  OK
// 6.  yiimp based pool											stratum+tcp://keccak.mine.zergpool.com:5133			[BTC]  OK
// 7.  anonymous p2p pool										stratum+tcp://sha256.p2p-spb.xyz:9334 					[BTC]  OK    http://sha256.p2p-spb.xyz:9334/static/
// 8.  jsonrpc2 yiimp 											stratum+tcp://k12.mine.zergpool.com:4459				[BTC]  OK
// 9.  jsonrpc2 yiimp. bad login						stratum+tcp://k12.mine.zergpool.com:4459				[BTC]  FAIL
// 10. jsonrpc2 nomp  											stratum+tcp://aeon.mcmpool.eu:3335							[AEON] Not tested
// 11. another yiimp pool										stratum+tcp://keccak.eu.mine.zpool.ca:5133			[BTC]  OK, zpool supports mining.ping
// 12. nicehash															stratum+tcp://keccak.eu.nicehash.com:3338				[NH]   OK
// 13. MRR, they use redirects							us-east01.miningrigrentals.com:3333							[MRR]  OK
//
// test gracefull shutdown



const stratums  = [];
const amlogin   = 'donate@atomminer.com';
const btclogin  = '';
const gltlogin  = '';
const nhlogin   = '';
const aeonlogin = '';

const cfg = {
	loglog: true,
	//logdebug: true,
	logerror: true,
	//logdataout: true,
	//logdatain: true,
};

const createAndAddStratum = (label, url, uname, rpc2 = false) => {
	const opts = cfg;
	opts.url = url,
	opts.username = uname;
	opts.jsonRPC2 = rpc2;
	opts.enablePing = url.indexOf('atomminer.com') != -1 || url.indexOf('zpool.ca') != -1;
	const s3 = new Stratum(opts);
	s3.on('disconnected', () => { console.log(`Stratum ${label} disconnected`); })
	s3.on('status', (s) => { console.log(`Stratum ${label} status: ${s}`); })
	s3.on('error', (e) => { console.log(`Stratum ${label} error: ${e}`); });
	s3.on('online', () => { console.log(`Stratum ${label} changed state to online`); });
	s3.on('diff', (d) => { console.log(`Stratum ${label} set difficulty to ${d}`); });
	s3.on('redirect', (d) => { console.log(`Stratum ${label} requested reconnect`); });
	s3.on('job', (j) => { 
		var id = s3.jsonRPC2 ? j.job_id : j[0];
		console.log(`Stratum ${label} new job ${id} received`);
	});
	stratums.push(s3);
}

// 1.  null config OK
//createAndAddStratum('case1');
// 2.  url that throws connection refused		stratum+tcp://127.0.0.1:55555 OK
//createAndAddStratum('case2', 'stratum+tcp://127.0.0.1:55555', amlogin);
// 3.  non-stratum protocol like http				http://127.0.0.1/ OK
//createAndAddStratum('case3', 'http://127.0.0.1/', amlogin);
// 4.  pool.atomminer.com										stratum+tcp://sha256q.pool.atomminer.com:6221 OK
//createAndAddStratum('case4', 'stratum+tcp://sha256q.pool.atomminer.com:6221', amlogin);
// 5.  nomp based pool											stratum+tcp://pool.cryptopowered.club:1275			[GLT] OK
//createAndAddStratum('case5', 'stratum+tcp://pool.cryptopowered.club:1275', gltlogin);
// 6.  yiimp based pool											stratum+tcp://keccak.mine.zergpool.com:5133			[BTC] OK
//createAndAddStratum('case6', 'stratum+tcp://keccak.mine.zergpool.com:5133', btclogin);
// 7.  anonymous p2p pool										stratum+tcp://sha256.p2p-spb.xyz:9334 					[BTC] OK    http://sha256.p2p-spb.xyz:9334/static/
//createAndAddStratum('case7', 'stratum+tcp://sha256.p2p-spb.xyz:9334', btclogin); 
// 8.  jsonrpc2 yiimp 											stratum+tcp://k12.mine.zergpool.com:4459				[BTC] OK
//createAndAddStratum('case8', 'stratum+tcp://k12.mine.zergpool.com:4459', btclogin, true);
// 9.  jsonrpc2 yiimp. bad login						stratum+tcp://k12.mine.zergpool.com:4459				[BTC] FAIL: pool ignores incorrect logins
//createAndAddStratum('case9', 'stratum+tcp://k12.mine.zergpool.com:4459', amlogin, true);
// 10. jsonrpc2 nomp  											stratum+tcp://aeon.mcmpool.eu:3335							[AEON] Not tested
//createAndAddStratum('case10', 'stratum+tcp://aeon.mcmpool.eu:3335', aeonlogin);
// 11. another yiimp pool										stratum+tcp://keccak.mine.zergpool.com:5133			[BTC] OK, zpool supports mining.ping
//createAndAddStratum('case11', 'stratum+tcp://keccak.eu.mine.zpool.ca:5133', btclogin);
// 12. nicehash															stratum+tcp://keccak.eu.nicehash.com:3338				[NH]  OK
//createAndAddStratum('case12', 'stratum+tcp://keccak.eu.nicehash.com:3338', nhlogin);
// 13. MRR, they use redirects							us-east01.miningrigrentals.com:3333							[MRR] OK
createAndAddStratum('case13', 'us-east01.miningrigrentals.com:3333', 'atomminer.56956');

for(var s of stratums) {
	try{
		s.connect();
	}
	catch(e){
		console.error(e);
	}
}

// test if force disconnect will (should) release all the events and timers and let app finish
// if no ctrl-c detected, we should close in 2 minutes
var timetoquit = null;
timetoquit = setTimeout(() => {
	for(var s of stratums) {
		s.disconnect();
	}
	console.error('closed');
}, 120000);

process.on("SIGINT", function () {
	  console.log("Closing...");
	  for(var s of stratums) {
			s.disconnect();
			for(var ev of s.eventNames()) s.removeAllListeners(ev);
		}
		timetoquit && clearTimeout(timetoquit)
		console.log("Process should terminate now.");
		// don't terminate process to test gracefull shutdown (!!!)
  	//process.exit();
});
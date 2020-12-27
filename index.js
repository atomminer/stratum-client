// stratum+tcp client. supports RPC 1.x and RPC2.0 (jobs from bloc) as seen in XMR, AEON, and similar pools
const Stratum = require('./transport/stratum');

module.exports = {
	Stratum,
}
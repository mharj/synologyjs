'use strict';
const NodeSsh = require('node-ssh');
const sshMdList = new NodeSsh();
const sshMdCheck = new NodeSsh();
const listRegex = new RegExp(/^(md\d) : (\w+) (raid\w) (.*?)$/);
const statusRegex = new RegExp(/(\w+) =\W+([\d|.]+%)/);
const partitionNameNumber = new RegExp(/^([a-z]+)(\d+)\[(\d+)\]/);
const partitionSpare = new RegExp(/\(S\)$/);

/**
 * Parse partition parts "sdx1[5]"
 * @param {string} data of partition and index info
 * @return {object} {'disk', 'idx','isSpare'}
 */
function parseMdPartitionData(data) {
	let ret;
	let name = data.match(partitionNameNumber);
	if ( name ) {
		ret = {};
		ret.disk = name[1];
		ret.part = parseInt(name[2]);
		ret.idx = parseInt(name[3]);
		if ( data.match(partitionSpare) ) {
			ret.isSpare = true;
		}
	}
	return ret;
}

/**
 * Parse mdstat data line
 * @param {string} data of Linux mdinfo line
 * @return {object} {device,statys,type,partitions:[],action,progress}
 */
function parseMdData(data) {
	let idx = null;
	let parts = [];
	data.split('\n').forEach(function(line) { // split each md as own part
		let matches = line.match(/^md(\d+) /);
		if ( matches ) {
			idx = matches[1];
			parts[idx] = '';
		}
		if ( idx && line.length > 0 ) {
			parts[idx] += line+'\n';
		}
	});
	let devices = [];
	parts.forEach(function(part) {
		let device = {};
		part.split('\n').forEach(function(line) {
			let match = line.match(listRegex);
			if ( match ) {
				device.device = match[1];
				device.status = match[2];
				device.type = match[3];
				device.partitions = [];
				match[4].split(' ').forEach(function(part) {
					let diskPart = parseMdPartitionData(part);
					device.partitions[diskPart.part]=diskPart;
				});
			}
			let status = line.match(statusRegex);
			if ( status ) {
				device.action = status[1];
				device.progress = status[2];
			}
		});
		devices.push(device);
	});
	return devices;
}

module.exports = function(sshOptions) {
	let devicesCache = null;
	/**
	 * raid "check" action to md and return current action and progress
	 * @param {string} md - md name (i.e. md0)
	 * @return {object} {action,progress} current action and progress if ongoing
	 * @throws Will throw an error if md is not valid
	 */
	this.checkMd = function(md) {
		let self = this;
		return new Promise(function(resolve, reject) {
			resolve( (devicesCache?devicesCache:self.getMdStatus()) ); // use cached devices info or query if empty cache
		}).then(function(devices) {
			let isValid = false;
			devices.forEach(function(e) {
				if ( e.device == md ) { // check correct "md"
					isValid = true;
				}
			});
			if ( ! isValid ) { // md name was not in list
				throw new Error('not valid md device');
			}
			return sshMdCheck.connect(sshOptions)
				.then(function() {
					return sshMdCheck.execCommand('/bin/echo check > /sys/block/'+md+'/md/sync_action && /bin/cat /sys/block/'+md+'/md/sync_action && /bin/cat /proc/mdstat | /bin/grep -A2 ^'+md, {cwd: '/root'});
				}).then(function(result) {
					let action = result.stdout.split('\n').shift();
					let matches = result.stdout.match(statusRegex);
					sshMdCheck.dispose();
					return({'action': action, 'progress': (matches && matches[1]?matches[1]:null)});
			});
		});
	};
	/**
	 * returns mdstat as JSON
	 * @return {array} [{device,status,type,partitions,action,progress}] array of md info
	 */
	this.getMdStatus = function() {
		let self = this;
		return sshMdList.connect(sshOptions)
			.then(function() {
				return sshMdList.execCommand('/bin/cat /proc/mdstat', {cwd: '/root'});
			}).then(function(result) {
				self.deviceCache = parseMdData(result.stdout);
				return self.deviceCache;
			});
	};
};
module.exports.parseMdStat = parseMdData;
module.exports.parseMdPartitionData = parseMdPartitionData;

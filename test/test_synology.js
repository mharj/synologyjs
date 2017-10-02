const chai = require('chai');
const expect = chai.expect;
chai.should();
const mdParse = require('../synology.js').parseMdStat;
const mdParsePartition = require('../synology.js').parseMdPartitionData;
const fs = require('fs');
let mdstatData = null;

describe('mdstat parse', function() {
	before(function(done) {
		fs.readFile('./test/mdstat.txt', function(err, data) {
			mdstatData = data.toString('utf8');
			done();
		});
	});

	it('should parse all mdstat lines', function(done) {
		let obj = mdParse(mdstatData);
		expect(obj).to.be.an('array');
		obj.forEach(function(md) {
			md.should.contain.all.keys('device', 'status', 'type', 'partitions');
			md.device.should.be.oneOf(['md0', 'md1', 'md2', 'md9']);
			md.type.should.be.oneOf(['raid1', 'raid5']);
			md.status.should.be.oneOf(['active']);
			if ( md.action ) { // action in progress
				md.action.should.be.string;
				md.progress.should.be.string;
			}
		});
		done();
	});

	it('should parse partition info', function(done) {
		let obj = mdParsePartition('hda1[5]');
		obj.should.have.all.keys(['disk', 'idx', 'part']);
		expect(obj).to.deep.equal({disk: 'hda', part: 1, idx: 5});

		obj = mdParsePartition('hda4[5](S)');
		obj.should.have.all.keys(['disk', 'idx', 'part', 'isSpare']);
		expect(obj).to.deep.equal({disk: 'hda', part: 4, idx: 5, isSpare: true});
		done();
	});
});

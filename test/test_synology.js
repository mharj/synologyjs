var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var mdParse = require('../synology.js').parseMdStat;
var mdParsePartition = require('../synology.js').parseMdPartitionData;
var fs = require('fs');

var mdstatData = null;

describe('mdstat parse', function() {
	before(function(done) {
		fs.readFile('./test/mdstat.txt', function(err, data) {
			mdstatData = data.toString('utf8');
			done();
		});
	});

	it('should parse all mdstat lines',function(done) {
		var obj = mdParse(mdstatData);
		console.log(JSON.stringify(obj,null,2));
		expect(obj).to.be.an('array');
		obj.forEach(function(md){
			md.should.contain.all.keys('device', 'status','type','partitions');
			if ( md.action ) { // action in progress
				md.action.should.be.string;
				md.progress.should.be.string;
			}
		});
		done();
	});

	it('should parse partition info',function(done) {
		var obj = mdParsePartition('hda[5]');
		expect(obj).to.be.object;
		obj.should.have.all.keys(['disk', 'number']);

		obj = mdParsePartition('hda[5](S)');
		expect(obj).to.be.object;
		obj.should.have.all.keys(['disk', 'number','isSpare']);
		done();
	});
});

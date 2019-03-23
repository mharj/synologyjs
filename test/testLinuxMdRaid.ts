process.env.NODE_ENV = 'test';
import {expect} from 'chai';
import * as fs from 'fs';
import {before, describe, it} from 'mocha';
import {parseMdPartitionData, parseMdStat} from '../src/parseUtils';
let mdstatData: string;

describe('mdstat parse', () => {
	before((done) => {
		fs.readFile('./test/mdstat.txt', (err, data) => {
			mdstatData = data.toString('utf8');
			done();
		});
	});

	it('should parse all mdstat lines', (done) => {
		const obj = parseMdStat(mdstatData);
		expect(obj).to.be.an('array');
		obj.forEach((md) => {
			expect(md).to.contain.all.keys('device', 'status', 'type', 'partitions');
			expect(md.device).to.be.oneOf(['md0', 'md1', 'md2', 'md9']);
			expect(md.type).to.be.oneOf(['raid1', 'raid5']);
			expect(md.status).to.be.oneOf(['active']);
			if (md.action) {
				expect(md.action).to.be.a('string');
				expect(md.progress).to.be.a('string');
			}
		});
		done();
	});

	it('should parse partition name', (done) => {
		let obj = parseMdPartitionData('hda1[5]');
		expect(obj).to.have.all.keys(['disk', 'idx', 'part']);
		expect(obj).to.deep.equal({disk: 'hda', part: 1, idx: 5});

		obj = parseMdPartitionData('hda4[5](S)');
		expect(obj).to.have.all.keys(['disk', 'idx', 'part', 'isSpare']);
		expect(obj).to.deep.equal({disk: 'hda', part: 4, idx: 5, isSpare: true});
		done();
	});
	it('should not parse broken partition name', (done) => {
		expect(parseMdPartitionData.bind(parseMdPartitionData, 'qweqwe')).throw();
		done();
	});
});

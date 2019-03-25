process.env.NODE_ENV = 'test';
import {expect} from 'chai';
import * as fs from 'fs';
import {before, describe, it} from 'mocha';
import * as url from 'url';
import {LinuxMdInfo} from '../src';
import {parseMdPartitionData, parseMdStat} from '../src/parseUtils';
let mdstatData: string;
let sshUrlData: url.UrlWithStringQuery;

describe('Linux MD Raid', () => {
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
	describe('test with SSH', () => {
		before(function(done) {
			if (!process.env.SSH_URL) {
				this.skip();
			} else {
				sshUrlData = url.parse(process.env.SSH_URL);
			}
			done();
		});
		it('should not parse broken partition name', async () => {
			if ( ! sshUrlData.auth ) {
				throw new Error('no ssh auth data in url');
			}
			const [username, password] = sshUrlData.auth.split(':', 2) as string[];
			const md = new LinuxMdInfo({host: sshUrlData.host, username, password});
			const data = await md.getMdStatus();
			expect(data).to.be.an('array');
		});
		it('should start raid check', async () => {
			if ( ! sshUrlData.auth ) {
				throw new Error('no ssh auth data in url');
			}
			const [username, password] = sshUrlData.auth.split(':', 2) as string[];
			const md = new LinuxMdInfo({host: sshUrlData.host, username, password});
			const action = await md.checkMd('md2');
			expect(action.trim()).to.be.an('string').and.eq('check');
		});
		it('should start raid check if no raid found', async () => {
			if ( ! sshUrlData.auth ) {
				throw new Error('no ssh auth data in url');
			}
			const [username, password] = sshUrlData.auth.split(':', 2) as string[];
			const md = new LinuxMdInfo({host: sshUrlData.host, username, password});
			try {
				await md.checkMd('md666');
				throw new Error('this should not happen');
			} catch(err) {
				// ignore
			}
		});
	});
});

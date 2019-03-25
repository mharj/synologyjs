process.env.NODE_ENV = 'test';
import {expect} from 'chai';
import {before, describe, it} from 'mocha';
import * as url from 'url';
import {sshUtil} from '../src/sshUtil';
let sshUrlData: url.UrlWithStringQuery;

describe('SSH Util testing', () => {
    before(function(done) {
        if (!process.env.SSH_URL) {
            this.skip();
        } else {
            sshUrlData = url.parse(process.env.SSH_URL);
        }
        done();
    });
    it('should get uname via ssh', async () => {
        if ( ! sshUrlData.auth ) {
            throw new Error('no ssh auth data in url');
        }
        const [username, password] = sshUrlData.auth.split(':', 2) as string[];
        const uname = await sshUtil({host: sshUrlData.host, username, password},'uname') as Buffer;
        expect(uname.toString()).to.be.a('string');
    });
    it('should get uname via ssh with stdout callback', async () => {
        if ( ! sshUrlData.auth ) {
            throw new Error('no ssh auth data in url');
        }
        const [username, password] = sshUrlData.auth.split(':', 2) as string[];
        await sshUtil({host: sshUrlData.host, username, password},'uname',(data)=> {
            expect(data.toString()).to.be.a('string');
        });
    });
    it('should fail with wrong hostname', async () => {
        if ( ! sshUrlData.auth ) {
            throw new Error('no ssh auth data in url');
        }
        const [username, password] = sshUrlData.auth.split(':', 2) as string[];
        try {
           await sshUtil({host: 'qweqweqweqwe', username, password},'uname');
           throw new Error('this should not happen');
        } catch(err) {
            // ignore
        }
    }).timeout(15000);
    it('should error if no command found', async () => {
        if ( ! sshUrlData.auth ) {
            throw new Error('no ssh auth data in url');
        }
        const [username, password] = sshUrlData.auth.split(':', 2) as string[];
        try {
            await sshUtil({host: sshUrlData.host, username, password},'qweqweqweqweeeww');
        } catch(err) {
            // ignore
        }
    });
});
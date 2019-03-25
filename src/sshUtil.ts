import {Client, ConnectConfig} from 'ssh2';

export const sshUtil = (config: ConnectConfig, cmd: string, stdout?: (data: Buffer) => void): Promise<void | Buffer> => {
	const isStream = stdout ? true : false;
	const ssh = new Client();
	return new Promise((resolve, reject) => {
		ssh
			.on('ready', () => {
				ssh.exec(cmd, (err, stream) => {
					if (err) {
						reject(err);
					} else {
						const buffer: Buffer[] = [];
						stream
							.on('close', (code: number, signal: number) => {
								ssh.end();
								if (code === 0) {
									if (isStream && stdout) {
										resolve();
									} else {
										resolve(Buffer.concat(buffer));
									}
								} else {
									reject(new Error('Error code:' + code));
								}
							})
							.on('data', (data: Buffer) => {
								if (isStream && stdout) {
									stdout(data);
								} else {
									buffer.push(data);
								}
							})
							.stderr.on('data', (data) => {
								// console.log('STDERR: ' + data);
							});
					}
				});
			})
			.on('error',(err) => {
				reject(err);
			})
			.connect(config);
	});
};

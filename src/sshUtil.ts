import {Client, ConnectConfig} from 'ssh2';

export const sshUtil = (config: ConnectConfig, cmd: string, stdout?: (data: string) => void): Promise<void | string> => {
	const isStream = stdout ? true : false;
	const ssh = new Client();
	return new Promise((resolve, reject) => {
		ssh
			.on('ready', () => {
				ssh.exec(cmd, (err, stream) => {
					if (err) {
						reject(err);
					} else {
						let buffer = '';
						stream
							.on('close', (code: number, signal: number) => {
								ssh.end();
								if (code === 0) {
									if (isStream && stdout) {
										resolve();
									} else {
										resolve(buffer);
									}
								} else {
									reject(new Error('Error code:' + code));
								}
							})
							.on('data', (data: string) => {
								if (isStream && stdout) {
									stdout(data);
								} else {
									buffer += data;
								}
							})
							.stderr.on('data', (data) => {
								console.log('STDERR: ' + data);
							});
					}
				});
			})
			.connect(config);
	});
};

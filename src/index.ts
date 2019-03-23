import {ConnectConfig} from 'ssh2';
import {IDevice, parseMdStat} from './parseUtils';
import {sshUtil} from './sshUtil';

export class LinuxMdInfo {
	private sshOptions: ConnectConfig;
	private devicesCache: IDevice[];
	constructor(options: ConnectConfig) {
		this.sshOptions = options;
	}
	public checkMd = async (md: string): Promise<void> => {
		if (!this.devicesCache) {
			this.devicesCache = await this.getMdStatus();
		}
		if (this.devicesCache.find((d) => d.device === md)) {
			const commands = [
				'/bin/echo check > /sys/block/' + md + '/md/sync_action',
				'/bin/cat /sys/block/' + md + '/md/sync_action',
				'/bin/cat /proc/mdstat | /bin/grep -A2 ^' + md,
			];
			await sshUtil(this.sshOptions, commands.join(' && '));
		} else {
			throw new Error('not valid md device');
		}
		return;
	};
	public getMdStatus = async (): Promise<IDevice[]> => {
		const raidData = await sshUtil(this.sshOptions, '/bin/cat /proc/mdstat');
		if (!raidData) {
			throw new Error('no raid data');
		}
		return parseMdStat(raidData);
	};
}

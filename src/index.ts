import {ConnectConfig} from 'ssh2';
import {IDevice, parseMdStat} from './parseUtils';
import {sshUtil} from './sshUtil';

export class LinuxMdInfo {
	private sshOptions: ConnectConfig;
	private devicesCache: IDevice[];
	constructor(options: ConnectConfig) {
		this.sshOptions = options;
	}
	public checkMd = async (md: string): Promise<string> => {
		if (!this.devicesCache) {
			this.devicesCache = await this.getMdStatus();
		}
		if (this.devicesCache.find((d) => d.device === md)) {
			const procBlockAction = process.env.NODE_ENV === 'test' ? `/tmp/${md}_sync_action` : `/sys/block/${md}/md/sync_action`;
			const commands = [
				'/bin/echo check > ' + procBlockAction,
				'/bin/cat ' + procBlockAction,
			];
			const action = await sshUtil(this.sshOptions, commands.join(' && ')) as Buffer;
			return action.toString();
		} else {
			throw new Error('not valid md device');
		}
	};
	public getMdStatus = async (): Promise<IDevice[]> => {
		const raidData = await sshUtil(this.sshOptions, '/bin/cat /proc/mdstat') as Buffer;
		return parseMdStat(raidData.toString());
	};
}

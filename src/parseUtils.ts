const listRegex = new RegExp(/^(md\d) : (\w+) (raid\w) (.*?)$/);
const statusRegex = new RegExp(/(\w+) =\W+([\d|.]+%)/);
const partitionNameNumber = new RegExp(/^([a-z]+)(\d+)\[(\d+)\]/);
const partitionSpare = new RegExp(/\(S\)$/);

export interface IDevice {
	device: string;
	status: string;
	type: string;
	partitions: IPartition[];
	action?: string;
	progress?: string;
}

interface IPartition {
	disk: string;
	part: number;
	idx: number;
	isSpare?: boolean;
}

/**
 * Parse partition parts "sdx1[5]"
 * @param {string} data of partition and index info
 * @return {object} {'disk', 'idx','isSpare'}
 */
export const parseMdPartitionData = (data: string): IPartition => {
	const name = data.match(partitionNameNumber);
	if (name) {
		const partition:IPartition = {
			disk: name[1],
			idx: parseInt(name[3], 10),
			part: parseInt(name[2], 10),
		};
		if ( data.match(partitionSpare) ) {
			partition.isSpare = true;
		}
		return partition;
	} else {
		throw new TypeError('Can\'t parse partition information');
	}
};

/**
 * Parse mdstat data line
 * @param {string} data of Linux mdinfo line
 * @return {object} {device,statys,type,partitions:[],action,progress}
 */
export const parseMdStat = (data: string) => {
	let idx: number | undefined;
	const parts: string[] = [];
	data.split('\n').forEach((line) => {
		// split each md as own part
		const matches = line.match(/^md(\d+) /);
		if (matches) {
			idx = parseInt(matches[1], 10);
			parts[idx] = '';
		}
		if (idx && line.length > 0) {
			parts[idx] += line + '\n';
		}
	});
	const devices: IDevice[] = [];
	parts.forEach((part) => {
		let device: IDevice | undefined;
		part.split('\n').forEach((line: string) => {
			const match = line.match(listRegex);
			if (match) {
				device = {
					device: match[1],
					partitions: [],
					status: match[2],
					type: match[3],
				};
				match[4].split(' ').forEach((partOut: string) => {
					const partData = parseMdPartitionData(partOut);
					if (device) {
						device.partitions[partData.idx] = partData;
					}
				});
			}
			const status = line.match(statusRegex);
			if (status && device) {
				device.action = status[1];
				device.progress = status[2];
			}
		});
		if (device) {
			devices.push(device);
		}
	});
	return devices;
};
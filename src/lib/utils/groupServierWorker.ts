import { type Person } from '$lib/types';
import { GroupService } from './groupService';

self.onmessage = (
	event: MessageEvent<{
		data: {
			members: Person[];
			leader: Person[];
			group_cnt: number;
			day: number;
			forbiddenPairs: string[][];
		};
	}>
) => {
	const { members, leader, day, forbiddenPairs, group_cnt } = event.data.data;

	try {
		const groupService = new GroupService(members, leader, forbiddenPairs, day, group_cnt);
		const res = groupService.randomGroup();
		self.postMessage({
			data: res,
			errors: null
		});
	} catch (e) {
		self.postMessage({
			data: null,
			errors: e
		});
	}

	return;
};

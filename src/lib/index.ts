import type { Person } from './types';

// place files you want to import through the `$lib` alias in this folder.
export function randomGroup(
	data: Person[],
	forbiddenPairs: string[][],
	day: number,
	group_cnt: number
) {
	// TODO: implement
	const groups = Array.from({ length: group_cnt }, () =>
		Array.from({ length: day }, () => [])
	) as Person[][][];
	const groupOfMembers = Array.from({ length: data.length }, () =>
		Array.from({ length: day }, () => -1)
	);
	for (let g = 0; g < group_cnt; g++) {
		for (let d = 0; d < day; d++) {
			for (let i = 0; i < 4; i++) {
				groups[g][d].push(data[i]);
				console.log(data[i].id);
				groupOfMembers[data[i].id - 1][d] = g;
			}
		}
	}
	return {
		groups,
		groupOfMembers
	};
}

export function getGroupError(groups: Person[][][]) {
	// TODO: validate group by the following conditions:
	// 1. Every group must have at least 1 male and 1 female
	// 2. Number of people in a group must be in range [MAX_GROUP_SIZE - 1, MAX_GROUP_SIZE]
	// 3. No pair of member in a group meet twice
	return undefined;
}

function getGenderError() {
	return undefined;
}

function getMeetError() {
	return undefined;
}

function getSizeError() {
	return undefined;
}

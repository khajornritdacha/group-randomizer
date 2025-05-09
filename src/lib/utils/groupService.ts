import type { Person, Schedule, Day, Group } from '$lib/types';

export class GroupService {
	readonly BATCH_SIZE: number = 1000;
	readonly ITER: number = 25;
	readonly C: number = 91;
	readonly data: Person[];
	readonly forbiddenPairs: string[][];
	readonly DAY: number;
	readonly TOTAL_GROUP: number;
	readonly TOTAL_STAFF: number;
	readonly MAX_GROUP_SIZE: number;
	forbiddenSet: Set<string>;
	leader: Person[];
	newData: Person[];
	leftMaxGroupSize: number; // Count number of groups that can have maximum group size

	constructor(data: Person[], leader: Person[], forbiddenPairs: string[][], DAY: number, TOTAL_GROUP: number) {
		shuffle(data);
		this.data = data;
		this.forbiddenPairs = forbiddenPairs;
		this.DAY = DAY;
		this.TOTAL_GROUP = TOTAL_GROUP;
		this.TOTAL_STAFF = data.length;
		this.MAX_GROUP_SIZE = Math.ceil(data.length / TOTAL_GROUP);
		this.newData = [];
		this.leftMaxGroupSize = this.data.length - this.TOTAL_GROUP * Math.floor(this.data.length / this.TOTAL_GROUP);
		this.leader = leader;
		this.forbiddenSet = new Set<string>();

		let rest = this.data.length % this.TOTAL_GROUP;
		let dataSize = this.data.length;

		if (rest > 0) {
			for (let i = dataSize + 1; i < dataSize + this.TOTAL_GROUP - rest + 1; i++) {
				console.log("N e wwwwwwwwwwwwwwww")
				this.data.push({
					name: '-',
					gender: '-',
					faculty: '-',
					field: '-',
					year: '-',
					section: '-',
					baan: '-',
					status: '-',
					id: i
				});
			}
		}
	}

	randomGroup() {
		this.leftMaxGroupSize = this.data.length - this.TOTAL_GROUP * Math.floor(this.data.length / this.TOTAL_GROUP);
		if (this.leftMaxGroupSize === 0) this.leftMaxGroupSize = this.TOTAL_GROUP;

		this.forbiddenPairs.forEach((pair) => {
			let person1 = this.data.find((person) => person.name === pair[0]);
			let person2 = this.data.find((person) => person.name === pair[1]);
			if (person1 && person2) {
				if (person1.id > person2.id) [person1, person2] = [person2, person1];
				const key = `${person1.id},${person2.id}`;
				this.forbiddenSet.add(key);
			}
		});

		console.log({ forbiddenSet : this.forbiddenSet });

		let [basis, cost] = this.generateGroup();
		if (cost == -1) cost = 1e9;

		// generate best result
		for(let i = 0; i < 2; i++) {
			console.log(`<---------- / Process ${i} / ---------->`);
			const [curBasis, curCost] = this.generateGroup();
			if (curCost == -1) continue;
			if (curCost < cost) {
				cost = curCost;
				basis = curBasis;
			}
		}

		console.log(`<---------- / Result Cost ${cost} / ---------->`);

		const groups = Array.from({ length: this.DAY }, () =>
			Array.from({ length: this.TOTAL_GROUP }, () => [])
		) as Person[][][];

		const groupOfMembers = Array.from({ length: this.data.length }, () =>
			Array.from({ length: this.DAY }, () => -1)
		);

		for (let d = 0; d < this.DAY; d++) {
			for (let g = 0; g < this.TOTAL_GROUP; g++) {
				for (const person of basis[d][g]) {
					groups[d][g].push(person);
					groupOfMembers[person.id - 1][d] = g;
				}
			}
		}

		return {
			groups,
			groupOfMembers
		};
	}

	/* --- New Code --- */

	generateSchedule(): Schedule {
		const scd: Schedule = [];

		for (let d = 0; d < this.DAY; d++) {
			shuffle(this.newData);
			const day: Day = [];

			for (let g = 0; g < this.TOTAL_GROUP; g++) {
				const bunch: Group = this.newData.slice(g * this.MAX_GROUP_SIZE, (g + 1) * this.MAX_GROUP_SIZE);
				day.push(bunch);
			}

			scd.push(day);
		}

		return scd;
	}

	countConflicts(scd: Schedule): [number, number] {
		const meet = new Set<string>();
		let cnt = 0, cost = 0;

		for (const day of scd) {
			let ack = 0;
			for (const bunch of day) {
				let inva = 0;
				const sorted = [...bunch].sort((a, b) => a.id - b.id);
				let sameStatus = 0;
				let sameGender = 0;
				let sameBaan = 0;
				let sameField = 0;
				let sameFaculty = 0;
				let sameSection = 0;
				let countSuksa = 0;
				let countMale = 0;
				let countNew = 0;
				let conutMiss = 0;
				for (let i = 0; i < sorted.length; i++) {
					for (let j = i + 1; j < sorted.length; j++) {
						const u = sorted[i];
						const v = sorted[j];
						const key = `${u.id},${v.id}`;
						if (meet.has(key)) cnt++;
						else meet.add(key);
						if (this.forbiddenSet.has(key)) cnt++;
						if (u.name === '-') conutMiss++;
						if (u.status == v.status) {
							if (u.status === 'ใหม่') countNew++;
							sameStatus++;
						}
						if (u.gender == v.gender) {
							if (u.gender === 'ชาย') countMale++;
							sameGender++;
						}
						if (u.baan == v.baan) sameBaan++;
						if (u.field == v.field) sameField++;
						if (u.faculty == v.faculty) sameFaculty++;
						if (u.section == v.section) {
							if (u.section === 'ศึกษา') countSuksa++;
							sameSection++;
						}
					}
				}

				// Weighted
				if(sameStatus == 3) inva += 1;
				else if(sameStatus == 6) inva += 4;
				if(sameGender == 3) inva += 2;
				else if(sameGender == 6) inva += 6;
				if(sameBaan == 3) ack = this.TOTAL_GROUP;
				else if(sameBaan == 6) ack = this.TOTAL_GROUP;
				if(sameField == 3) inva += 1;
				else if(sameField == 6) inva += 2;
				if(sameFaculty == 3) inva += 6;
				else if(sameFaculty == 6) inva += 6;
				if(sameSection == 3) ack = this.TOTAL_GROUP;
				else if(sameSection == 6) ack = this.TOTAL_GROUP;

				if(countNew == 6) ack = this.TOTAL_GROUP;
				if(countMale >= 3) inva += 6;
				if(countSuksa >= 1) ack = this.TOTAL_GROUP;

				if(conutMiss >= 2) ack = this.TOTAL_GROUP;

				if(inva > 5) ack++;
				cost += inva;
			}
			if(3 * ack > this.TOTAL_GROUP) cnt++; 
		}

		return [cnt, cost];
	}

	modifySchedule(scd: Schedule): Schedule {
		const newScd = JSON.parse(JSON.stringify(scd)) as Schedule; // deep copy
		const d = Math.floor(Math.random() * this.DAY);
		let g1: number, g2: number;

		do {
			g1 = Math.floor(Math.random() * this.TOTAL_GROUP);
			g2 = Math.floor(Math.random() * this.TOTAL_GROUP);
		} while (g1 === g2);

		const p1 = Math.floor(Math.random() * this.MAX_GROUP_SIZE);
		const p2 = Math.floor(Math.random() * this.MAX_GROUP_SIZE);

		[newScd[d][g1][p1], newScd[d][g2][p2]] = [newScd[d][g2][p2], newScd[d][g1][p1]];
		return newScd;
	}

	generateGroup(): [Schedule, number] {
		this.newData = this.data.map((person: Person) => ({ ...person }));

		if (this.TOTAL_STAFF <= 0 || this.TOTAL_GROUP <= 0 || this.DAY <= 0) throw new Error("Invalid input");
		if (this.TOTAL_STAFF < this.TOTAL_GROUP) throw new Error("total staff less than total group");

		if ((this.MAX_GROUP_SIZE - 1) * this.DAY >= this.TOTAL_STAFF) throw new Error("Too many days for the given group size");

		let curScd: Schedule = this.generateSchedule();
		let [curScore, curCost] = this.countConflicts(curScd);
		let prevScore = 1e9;

		let T = 1.0;
		let alpha = 0.5;
		
		let epoch = 0;
		let cnt = 0;

		while (curScore > 0) {
			if (cnt % (this.BATCH_SIZE * this.ITER) === 0) {
				epoch++;
				if (epoch == 4) {
					console.log("\n---- Unsuccessfully Generated :( ----\n");
					curCost = -1;
					break;
				}
				console.log(`---------- [ Epoch ${epoch} ] ----------`);

				if (curScore > prevScore) {
					alpha -= (4 * (1 - alpha)) / 5;
					alpha = Math.max(alpha, 0);
				} else {
					alpha += (1 - alpha) / 2;
				}

				console.log("Using alpha =", alpha);

				prevScore = curScore;
				curScd = this.generateSchedule();
				[curScore, curCost] = this.countConflicts(curScd);
				T = 1.0;
				cnt = 0;

				if (curScore === 0) break;
			}

			const nextScd = this.modifySchedule(curScd);
			const [nextScore, nextCost] = this.countConflicts(nextScd);
			const delta = nextScore - curScore;

			if (delta < 0 || Math.exp(-delta / T) > Math.random()) {
				curScd = nextScd;
				curScore = nextScore;
				curCost = nextCost;
			}
			else if (delta == 0 && nextCost < curCost) {
				curScd = nextScd;
				curScore = nextScore;
				curCost = nextCost;
			}

			if (cnt % this.BATCH_SIZE === 0) {
				console.log(`Batch: ${cnt / this.BATCH_SIZE + 1}, Conflicts: ${curScore}, Cost: ${curCost}`);
			}

			if (curScore === 0) {
				console.log("\n---- Successfully Generated! ----\n");
				console.log(`\n---- Cost : ${curCost} ----\n`);
				break;
			}

			T *= alpha;
			cnt++;
		}
		return [curScd, curCost];
	}

	/**
	 * 1. Number of people in a group must be in range [MAX_GROUP_SIZE - 1, MAX_GROUP_SIZE]
	 * 2. No pair of member in a group meet twice
	 * @param groups
	 * @returns
	 */
	getGroupError(groups: Person[][][]) {
		const errors: string[] = [];
		this.getMeetError(errors, groups);
		this.getSizeError(errors, groups);
		this.getForbiddenPairError(errors, groups);
		return errors;
	}

	getMeetError(errors: string[], groups: Person[][][]) {
		const meet_cnt = Array.from({ length: this.data.length }, () =>
			Array.from({ length: this.data.length }, () => 0)
		);
		for (let d = 0; d < groups.length; d++) {
			for (let g = 0; g < groups[d].length; g++) {
				for (let i = 0; i < groups[d][g].length; i++) {
					for (let j = i + 1; j < groups[d][g].length; j++) {
						meet_cnt[groups[d][g][i].id - 1][groups[d][g][j].id - 1]++;
						meet_cnt[groups[d][g][j].id - 1][groups[d][g][i].id - 1]++;
						if (meet_cnt[groups[d][g][i].id - 1][groups[d][g][j].id - 1] > 1) {
							errors.push(
								`Some pairs meet twice: ${groups[d][g][i].name} and ${groups[d][g][j].name}`
							);
							return;
						}
					}
				}
			}
		}
	}

	getSizeError(errors: string[], groups: Person[][][]) {
		for (let d = 0; d < groups.length; d++) {
			for (let g = 0; g < groups[d].length; g++) {
				if (
					groups[d][g].length < this.MAX_GROUP_SIZE - 1 ||
					groups[d][g].length > this.MAX_GROUP_SIZE
				) {
					errors.push(`Some group is too small`);
					return;
				}
			}
		}
	}

	getForbiddenPairError(errors: string[], groups: Person[][][]) {
		for (let d = 0; d < groups.length; d++) {
			for (let g = 0; g < groups[d].length; g++) {
				for (let i = 0; i < groups[d][g].length; i++) {
					for (let j = i + 1; j < groups[d][g].length; j++) {
						if (this.isForbiddenPair(groups[d][g][i], groups[d][g][j])) {
							errors.push(`Some group has forbidden pair`);
							return;
						}
					}
				}
			}
		}
	}

	isForbiddenPair(person1: Person, person2: Person) {
		return this.forbiddenPairs.some((pair) => {
			const idx1 = pair.indexOf(person1.name);
			const idx2 = pair.indexOf(person2.name);
			return idx1 !== -1 && idx2 !== -1 && Math.abs(idx1 - idx2) === 1;
		});
	}
}

function shuffle(array: unknown[]) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex > 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

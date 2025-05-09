import type { Person, Schedule, Day, Group } from '$lib/types';

export class GroupService {
	readonly BATCH_SIZE: number = 1000;
	readonly ITER: number = 15;
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
		console.log({ forbiddenPairs : this.forbiddenPairs });

		const basis: Schedule = this.generateGroup();

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

	// New Code

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

	countConflicts(scd: Schedule): number {
		const meet = new Set<string>();
		let cnt = 0;

		for (const day of scd) {
			for (const bunch of day) {
				const sorted = [...bunch].sort((a, b) => a.id - b.id);
				let sameStatus = 0;
				let sameGender = 0;
				let sameBaan = 0;
				let sameField = 0;
				let sameFaculty = 0;
				let sameSection = 0;
				for (let i = 0; i < sorted.length; i++) {
					for (let j = i + 1; j < sorted.length; j++) {
						const u = sorted[i];
						const v = sorted[j];
						const key = `${u.id},${v.id}`;
						if (meet.has(key)) cnt++;
						else meet.add(key);
						if (this.forbiddenSet.has(key)) cnt++;
						if (u.status == v.status) sameStatus++;
						if (u.gender == v.gender) sameGender++;
						if (u.baan == v.baan) sameBaan++;
						if (u.field == v.field) sameField++;
						if (u.faculty == v.faculty) sameFaculty++;
						if (u.section == v.section) sameSection++;
					}
				}
				if(sameStatus >= 6) cnt++; // at least 3 persons
				if(sameGender >= 6) cnt++; // at least 3 persons
				if(sameBaan >= 6) cnt++; // at least 3 persons
				if(sameField >= 6) cnt++; // all persons
				if(sameFaculty >= 6) cnt++; // at least 3 persons
				if(sameSection >= 6) cnt++; // at least 3 persons
			} 
		}

		return cnt;
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

	// countCost(scd: Schedule): number {
	// 	let cost = 0;

	// 	for (const day of scd) {
	// 		for (const bunch of day) {
	// 			const sorted = [...bunch].sort((a, b) => a.id - b.id);
	// 			for (let i = 0; i < sorted.length; i++) {
	// 				for (let j = i + 1; j < sorted.length; j++) {
	// 					const u = sorted[i];
	// 					const v = sorted[j];
	// 					const key = `${u.id},${v.id}`;
	// 					if (this.forbiddenSet.has(key)) cost += 10;
	// 				}
	// 			}
	// 		}
	// 	}

	// 	return cost;
	// }

	generateGroup(): Person[][][] {
		this.newData = this.data.map((person: Person) => ({ ...person }));
		if (this.TOTAL_STAFF <= 0 || this.TOTAL_GROUP <= 0 || this.DAY <= 0) throw new Error("Invalid input");
		if (this.TOTAL_STAFF < this.TOTAL_GROUP || this.TOTAL_STAFF % this.TOTAL_GROUP !== 0) throw new Error("total staff must be divisible by total group");

		if ((this.MAX_GROUP_SIZE - 1) * this.DAY >= this.TOTAL_STAFF) throw new Error("Too many days for the given group size");

		let curScd: Schedule = this.generateSchedule();
		let curScore: number = this.countConflicts(curScd);
		let prevScore = 1e9;

		let T = 1.0;
		let alpha = 0.5;
		
		let epoch = 0;
		let cnt = 0;
		
		console.log(`** start generate group **`);

		while (curScore > 0) {
			if (cnt % (this.BATCH_SIZE * this.ITER) === 0) {
				epoch++;
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
				curScore = this.countConflicts(curScd);
				T = 1.0;
				cnt = 0;

				if (curScore === 0) break;
			}

			const nextScd = this.modifySchedule(curScd);
			const nextScore = this.countConflicts(nextScd);
			const delta = nextScore - curScore;

			if (delta < 0 || Math.exp(-delta / T) > Math.random()) {
				curScd = nextScd;
				curScore = nextScore;
			}

			if (cnt % this.BATCH_SIZE === 0) {
				console.log(`Batch: ${cnt / this.BATCH_SIZE + 1}, Conflicts: ${curScore}`);
			}

			if (curScore === 0) {
				console.log("\n---- Successfully Generated! ----\n");
				break;
			}

			T *= alpha;
			cnt++;
		}
		return curScd;
	}

	fillWithRandom(basis: Person[][]) {
		for (let g = 0; g < basis.length; g++) {
			while (this.checkInsertSize(1, basis[g])) {
				const person = this.getRandomPerson(this.newData);
				basis[g].push(person);
				this.newData = this.newData.filter((p) => p.id !== person.id);
			}
		}
	}

	insertLeader(basis: Person[][]) {
		for (let g = 0; g < basis.length; g++) {
			const leader = this.getRandomPerson(this.leader);
			const person1 = this.newData.find((person) =>
				person.name === leader.name &&
				person.faculty === leader.faculty &&
				person.year === leader.year);
			if (person1) {
				basis[g].push(person1);
				this.newData = this.newData.filter((p) => p.id !== person1.id);
				this.leader = this.leader.filter((p) => p.name !== leader.name);
			}
		}
	}
	
	insertForbiddenPairs(basis: Person[][]) {
		let g = 0;
		this.forbiddenPairs.forEach((pair) => {
			let person1 = this.newData.find((person) => person.name === pair[0]);
			let person2 = this.newData.find((person) => person.name === pair[1]);
			if (person1 && person2) {
				if (this.checkInsertSize(2, basis[g])) {
					this.newData = this.newData.filter(
						(person) => person.id !== person1?.id && person.id !== person2?.id
					);
					basis[g].push(person1);
					basis[g].push(person2);
					g++;
					if (g === basis.length) g = 0;
				}
			} else if (!person1 && !person2) {
				// do nothing
			} else {
				const personIdx = person1 ? 1 : 0;
				if (person2) [person1, person2] = [person2, person1];
				const insertIdx = this.findPersonGroupIndex(basis, pair[personIdx]);
				if (this.checkInsertSize(1, basis[insertIdx])) {
					this.newData = this.newData.filter((person) => person.id !== person1?.id);
					basis[insertIdx].push(person1 as Person);
				}
			}
		});
	}

	findPersonGroupIndex(basis: Person[][], name: string) {
		for (let i = 0; i < basis.length; i++) {
			if (basis[i].find((p) => p.name === name)) return i;
		}
		return -1;
	}

	checkInsertSize(insertSize: number, group: Person[]) {
		if (group.length + insertSize < this.MAX_GROUP_SIZE) return true;
		if (group.length + insertSize === this.MAX_GROUP_SIZE && this.leftMaxGroupSize > 0) {
			this.leftMaxGroupSize--;
			return true;
		}
		return false;
	}

	getRandomPerson(arr: Person[]) {
		const rand = Math.floor(Math.random() * arr.length);
		return arr[rand];
	}

	calculateGroupId(base_group: number, round: number, day: number): number {
		if (round === 0) round = this.MAX_GROUP_SIZE;
		return ((base_group + round * day) % this.TOTAL_GROUP) + 1;
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

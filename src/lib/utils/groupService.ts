import type { Person } from '../types';

// TODO: force men to be 1-st index and women to 2-nd index in every basis group to ensure every group has all genders
export class GroupService {
	readonly data: Person[];
	readonly forbiddenPairs: string[][];
	readonly DAY: number;
	readonly TOTAL_GROUP: number;
	readonly MAX_GROUP_SIZE: number;
	newData: Person[];
	leftMaxGroupSize: number; // Count number of groups that can have maximum group size

	constructor(data: Person[], forbiddenPairs: string[][], DAY: number, TOTAL_GROUP: number) {
		shuffle(data);
		this.data = data;
		this.forbiddenPairs = forbiddenPairs;
		this.DAY = DAY;
		this.TOTAL_GROUP = TOTAL_GROUP;
		this.MAX_GROUP_SIZE = Math.ceil(data.length / TOTAL_GROUP);
		this.newData = [];
		this.leftMaxGroupSize =
			this.data.length - this.TOTAL_GROUP * Math.floor(this.data.length / this.TOTAL_GROUP);
	}

	randomGroup() {
		const basis = this.generateBasisGroup();

		const groups = Array.from({ length: this.TOTAL_GROUP }, () =>
			Array.from({ length: this.DAY }, () => [])
		) as Person[][][];

		const groupOfMembers = Array.from({ length: this.data.length }, () =>
			Array.from({ length: this.DAY }, () => -1)
		);

		for (let g = 0; g < this.TOTAL_GROUP; g++) {
			basis[g].forEach((person, idx) => {
				for (let d = 0; d < this.DAY; d++) {
					// increase actual DAY by 1
					const group_id = this.calculateGroupId(g, idx, d + 1);
					groups[group_id - 1][d].push(person);
					groupOfMembers[person.id - 1][d] = group_id;
				}
			});
		}

		return {
			groups,
			groupOfMembers
		};
	}

	generateBasisGroup(): Person[][] {
		this.newData = this.data.map((person: Person) => ({ ...person, rand: Math.random() }));
		const basis = Array.from({ length: this.TOTAL_GROUP }, () => []) as Person[][];

		// insert all forbidden pairs
		this.insertForbiddenPairs(basis);

		// ensure men and women
		this.ensureGender(basis);

		// fill leftover slots with random people
		this.fillWithRandom(basis);

		// sort by gender and then rand value
		this.sortByGenderRand(basis);
		return basis;
	}

	fillWithRandom(basis: Person[][]) {
		for (let g = 0; g < basis.length; g++) {
			while (this.checkInsertSize(1, basis[g])) {
				const person = this.getRandomPerson();
				basis[g].push(person);
				this.newData = this.newData.filter((p) => p.id !== person.id);
			}
		}
	}

	sortByGenderRand(basis: Person[][]) {
		// it should ensure that all women align in the same position
		for (let i = 0; i < basis.length; i++) {
			basis[i].sort((a, b) => {
				if (a.gender === b.gender && a?.rand && b?.rand) {
					return a.rand < b.rand ? -1 : 1;
				}
				return a.gender < b.gender ? -1 : 1;
			});
		}
		return basis;
	}

	ensureGender(basis: Person[][]) {
		for (let g = 0; g < basis.length; g++) {
			const gender_cnt = this.countGender(basis[g]);
			for (const gender in gender_cnt) {
				if (gender_cnt[gender] === 0 && this.checkInsertSize(1, basis[g])) {
					const person = this.randomPersonWithGender(gender);
					if (!person) continue;
					basis[g].push(person);
					this.newData = this.newData.filter((p) => p.id !== person.id);
				}
			}
		}
	}

	insertForbiddenPairs(basis: Person[][]) {
		let g = 0;
		this.forbiddenPairs.forEach((pair) => {
			let person1 = this.newData.find((person) => person.name === pair[0]);
			let person2 = this.newData.find((person) => person.name === pair[1]);
			if (person1 && person2) {
				// Current version only allow upto 2 people with forbidden pairs
				if (basis[g].length === 0) {
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

	countGender(group: Person[]) {
		return group.reduce(
			(agg, person) => {
				if (!(person.gender in agg))
					throw new Error(`Invalid gender expect 1 or 2, found ${person.gender}`);
				agg[person.gender]++;
				return agg;
			},
			{ '1': 0, '2': 0 } as { [key: string]: number }
		);
	}

	randomPersonWithGender(gender: string) {
		const arr = this.newData.filter((person) => person.gender == gender);
		const rand = Math.floor(Math.random() * arr.length);
		return arr[rand];
	}

	getRandomPerson() {
		const rand = Math.floor(Math.random() * this.newData.length);
		return this.newData[rand];
	}

	calculateGroupId(base_group: number, round: number, day: number): number {
		if (round === 0) round = this.MAX_GROUP_SIZE;
		return ((base_group + round * day) % this.TOTAL_GROUP) + 1;
	}

	getGroupError(groups: Person[][][]) {
		// TODO: validate group by the following conditions:
		// 1. Every group must have at least 1 male and 1 female
		// 2. Number of people in a group must be in range [MAX_GROUP_SIZE - 1, MAX_GROUP_SIZE]
		// 3. No pair of member in a group meet twice
		const errors: string[] = [];
		this.getGenderError(errors, groups);
		this.getMeetError(errors, groups);
		this.getSizeError(errors, groups);
		this.getForbiddenPairError(errors, groups);
		return errors;
	}

	getGenderError(errors: string[], groups: Person[][][]) {
		for (let g = 0; g < groups.length; g++) {
			for (let d = 0; d < groups[g].length; d++) {
				const gender_cnt = this.countGender(groups[g][d]);
				for (const gender in gender_cnt) {
					if (gender_cnt[gender] === 0) {
						errors.push(`Some group do not have all gender, group ${g + 1} day ${d + 1}`);
						return;
					}
				}
			}
		}
	}

	getMeetError(errors: string[], groups: Person[][][]) {
		const meet_cnt = Array.from({ length: this.data.length }, () =>
			Array.from({ length: this.data.length }, () => 0)
		);
		for (let g = 0; g < groups.length; g++) {
			for (let d = 0; d < groups[g].length; d++) {
				for (let i = 0; i < groups[g][d].length; i++) {
					for (let j = i + 1; j < groups[g][d].length; j++) {
						meet_cnt[groups[g][d][i].id - 1][groups[g][d][j].id - 1]++;
						meet_cnt[groups[g][d][j].id - 1][groups[g][d][i].id - 1]++;
						if (meet_cnt[groups[g][d][i].id - 1][groups[g][d][j].id - 1] > 1) {
							errors.push(
								`Some group meet twice: ${groups[g][d][i].name} and ${groups[g][d][j].name}`
							);
							return;
						}
					}
				}
			}
		}
	}

	getSizeError(errors: string[], groups: Person[][][]) {
		for (let g = 0; g < groups.length; g++) {
			for (let d = 0; d < groups[g].length; d++) {
				if (
					groups[g][d].length < this.MAX_GROUP_SIZE - 1 ||
					groups[g][d].length > this.MAX_GROUP_SIZE
				) {
					errors.push(`Some group is too small`);
					return;
				}
			}
		}
	}

	getForbiddenPairError(errors: string[], groups: Person[][][]) {
		for (let g = 0; g < groups.length; g++) {
			for (let d = 0; d < groups[g].length; d++) {
				for (let i = 0; i < groups[g][d].length; i++) {
					for (let j = i + 1; j < groups[g][d].length; j++) {
						if (this.isForbiddenPair(groups[g][d][i], groups[g][d][j])) {
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

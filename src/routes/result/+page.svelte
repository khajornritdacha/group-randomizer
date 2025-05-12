<script lang="ts">
	import { handleDownload } from '$lib/utils/sheetService';
	import type { Person } from '$lib/types';
	import Background from '../../components/Background.svelte';
	import DownloadButton from '../../components/DownloadButton.svelte';
	import {
		groups_store,
		groupOfMembers_store,
		workbook_store,
		data_store,
		forbiddenPairs_store
	} from '../../store';
	import LoadResult from '../../components/LoadResult.svelte';

	const MAX_COL = 12;
	let page = 0,
		col = 7;
	let totalPages: Person[][][] = [];
	let currentPageRows: Person[][] = [];
	let showDetail = false,
		showSwappablePairs = false;

	let firstMember = '',
		secondMember = '';

	$: totalPages = $groups_store;
	$: currentPageRows = totalPages.length > 0 ? totalPages[page] : [];

	const setPage = (p: number) => {
		if (p >= 0 && p < totalPages.length) {
			page = p;
		}
	};

	function handleDownloadButton() {
		handleDownload($workbook_store, $groupOfMembers_store, true);
		return;
	}

	function getErrorTripleThings(day: number, group: number) {
		let cntSection = 0,
			cntMale = 0,
			cntStatus = 0,
			cntSuksa = 0,
			cntBaan = 0;
		for (let i = 0; i < $groups_store[day][group].length; i++) {
			if ($groups_store[day][group][i].section === 'ศึกษา') {
				cntSuksa++;
			}
			for (let j = i + 1; j < $groups_store[day][group].length; j++) {
				if ($groups_store[day][group][i].status === $groups_store[day][group][j].status) {
					cntStatus++;
				}
				if ($groups_store[day][group][i].section === $groups_store[day][group][j].section) {
					cntSection++;
				}
				if (
					$groups_store[day][group][i].gender === 'ชาย' &&
					$groups_store[day][group][j].gender === 'ชาย'
				) {
					cntMale++;
				}
				if ($groups_store[day][group][i].baan === $groups_store[day][group][j].baan) {
					cntBaan++;
				}
			}
		}
		if (cntMale >= 3) return 'A';
		if (cntStatus >= 6) return 'B';
		if (cntBaan >= 3) return 'C';
		if (cntSection >= 3 && cntSuksa <= 1) return 'D';
		if (cntSuksa >= 2) return 'E';
		return '';
	}

	function isForbiddenPair(person1: Person, person2: Person) {
		return $forbiddenPairs_store.some((pair) => {
			const idx1 = pair.indexOf(person1.name);
			const idx2 = pair.indexOf(person2.name);
			return idx1 !== -1 && idx2 !== -1 && Math.abs(idx1 - idx2) === 1;
		});
	}

	function hasForbiddenPairs(day: number, group: number, person: Person) {
		for (let i = 0; i < $groups_store[day][group].length; i++) {
			if (isForbiddenPair($groups_store[day][group][i], person)) {
				return true;
			}
		}
		return false;
	}

	function IsMetTwice(groups: Person[][][]) {
		const meet_cnt = Array.from({ length: $groupOfMembers_store.length }, () =>
			Array.from({ length: $groupOfMembers_store.length }, () => 0)
		);
		for (let d = 0; d < groups.length; d++) {
			for (let g = 0; g < groups[d].length; g++) {
				for (let i = 0; i < groups[d][g].length; i++) {
					for (let j = i + 1; j < groups[d][g].length; j++) {
						meet_cnt[groups[d][g][i].id - 1][groups[d][g][j].id - 1]++;
						meet_cnt[groups[d][g][j].id - 1][groups[d][g][i].id - 1]++;
						if (meet_cnt[groups[d][g][i].id - 1][groups[d][g][j].id - 1] > 1) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	function trySwapMembers(member1: string, member2: string) {
		if (member1 === '' || member2 === '')
			return { groups: [], groupOfMembers: [], error: 'Please select 2 members to swap' };

		let groupOfFirstMember = -1,
			groupOfSecondMember = -1;
		let groupOfFirstMemberIndex = -1,
			groupOfSecondMemberIndex = -1;
		for (let i = 0; i < $groups_store[page].length; i++) {
			const group = $groups_store[page][i];
			const firstMemberIndex = group.findIndex((member) => member.name === member1);
			const secondMemberIndex = group.findIndex((member) => member.name === member2);
			if (firstMemberIndex !== -1) {
				groupOfFirstMember = i;
				groupOfFirstMemberIndex = firstMemberIndex;
			}
			if (secondMemberIndex !== -1) {
				groupOfSecondMember = i;
				groupOfSecondMemberIndex = secondMemberIndex;
			}
		}

		if (groupOfFirstMember === -1) {
			return { groups: [], groupOfMembers: [], error: 'Member 1 is not in any group' };
		}
		if (groupOfSecondMember === -1) {
			return { groups: [], groupOfMembers: [], error: 'Member 2 is not in any group' };
		}
		if (groupOfFirstMember === groupOfSecondMember) {
			return { groups: [], groupOfMembers: [], error: 'Members are in the same group' };
		}

		const groups = Array.from({ length: $groups_store.length }, () =>
			Array.from({ length: $groups_store[0].length }, () => [])
		) as Person[][][];

		const groupOfMembers = Array.from({ length: $groupOfMembers_store.length }, () =>
			Array.from({ length: $groups_store.length }, () => -1)
		);
		for (let i = 0; i < $groups_store.length; i++) {
			for (let j = 0; j < $groups_store[i].length; j++) {
				for (let k = 0; k < $groups_store[i][j].length; k++) {
					if (i === page && j === groupOfFirstMember && k === groupOfFirstMemberIndex) {
						groupOfMembers[$groups_store[i][groupOfSecondMember][groupOfSecondMemberIndex].id - 1][
							i
						] = j + 1;
						groups[i][j].push($groups_store[i][groupOfSecondMember][groupOfSecondMemberIndex]);
					} else if (i === page && j === groupOfSecondMember && k === groupOfSecondMemberIndex) {
						groupOfMembers[$groups_store[i][groupOfFirstMember][groupOfFirstMemberIndex].id - 1][
							i
						] = j + 1;
						groups[i][j].push($groups_store[i][groupOfFirstMember][groupOfFirstMemberIndex]);
					} else {
						groupOfMembers[$groups_store[i][j][k].id - 1][i] = j + 1;
						groups[i][j].push($groups_store[i][j][k]);
					}
				}
			}
		}

		if (IsMetTwice(groups)) {
			return {
				groups: [],
				groupOfMembers: [],
				error: 'This swap will cause 2 members to meet more than once'
			};
		}
		return { groups: groups, groupOfMembers: groupOfMembers, error: '' };
	}

	function handleSwapMembers() {
		const result = trySwapMembers(firstMember, secondMember);
		if (result.error !== '') {
			alert(result.error);
			return;
		}
		groups_store.set(result.groups);
		groupOfMembers_store.set(result.groupOfMembers);
		secondMember = '';
		return;
	}
</script>

<Background />
<div class="absolute top-4 right-48">
	<a
		href="/"
		class="rounded-xl inline-block leading-[0] font-bold text-center text-lg bg-orange-primary hover:bg-orange-primary-darken text-white-secondary p-5 font-scaryHalloween"
		>Home</a
	>
</div>
<div class="absolute top-4 right-4">
	<a
		href="https://github.com/khajornritdacha/group-randomizer/tree/main?tab=readme-ov-file#group-randomizer"
		target="_blank"
		class="rounded-xl inline-block leading-[0] font-bold text-center text-lg bg-orange-primary hover:bg-orange-primary-darken text-white-secondary p-5 font-scaryHalloween"
		>How to Use</a
	>
</div>
<h1
	class="text-nowrap bg-none font-bold text-5xl lg:text-5xl text-center py-10 mt-12 text-[#E57F31] bg-[#E5E2D9] font-scaryHalloween"
>
	🕯️Suksa Result Day {page + 1}🕯️
</h1>

<input
	type="number"
	bind:value={col}
	min="1"
	max={MAX_COL}
	class="p-1 mt-3 rounded grow absolute top-20 right-48"
/>
<div class="flex flex-row gap-2 items-center absolute top-20 right-6">
	<input
		type="checkbox"
		bind:checked={showDetail}
		class="p-2 ml-2 rounded mt-1 w-4 h-4 cursor-pointer"
	/>
	<label class="py-3 text-lg flex font-bold" for="showDetails">Show Details</label>
</div>
<LoadResult />

{#if currentPageRows.length === 0}
	<h3
		class="bg-orange-400 text-white-secondary transition-all font-bold text-2xl py-1 px-2 rounded-2xl text-center mx-auto w-32"
	>
		No data
	</h3>
{:else}
	<div class={`grid grid-cols-${col.toString()} gap-4 mx-12`}>
		{#each currentPageRows as group, i}
			<div
				class={`${
					getErrorTripleThings(page, i) === 'A'
						? 'bg-red-800'
						: getErrorTripleThings(page, i) === 'B'
							? 'bg-red-600'
							: getErrorTripleThings(page, i) === 'C'
								? 'bg-green-500'
								: getErrorTripleThings(page, i) === 'D'
									? 'bg-red-400'
									: getErrorTripleThings(page, i) === 'E'
										? 'bg-purple-400'
										: 'bg-orange-primary'
				} bg-orange-400 ${
					getErrorTripleThings(page, i) !== ''
						? 'hover:bg-red-950'
						: 'hover:bg-orange-primary-darken'
				} text-white-secondary transition-all py-2 px-4 rounded-xl m-2`}
			>
				<h3 class="text-lg font-bold mb-2 flex justify-center text-white">Group : {i + 1}</h3>
				{#each group as member}
					{#if member.name !== '-'}
						<p
							class={`${
								member.name === firstMember || member.name === secondMember
									? 'bg-orange-600 text-white'
									: hasForbiddenPairs(page, i, member)
										? 'bg-red-500 text-white '
										: 'text-orange-primary bg-white'
							} text-center font-bold hover:bg-orange-200 border-2 border-orange-primary transition-all rounded-md py-1`}
						>
							{member.name}
							{#if showDetail}
								#{member.year} {member.faculty}
							{/if}
						</p>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}

<div class="flex flex-col items-center justify-center my-8">
	<button
		class="bg-purple-500 hover:bg-purple-700 text-white font-bold transition-all text-lg py-1 px-3 mx-2 rounded-lg cursor-pointer"
		on:click={() => (showSwappablePairs = !showSwappablePairs)}
	>
		Show swappable pairs
	</button>
	{#key page}
		{#if showSwappablePairs}
			<div class="mt-6 grid grid-cols-7 gap-4 mx-12">
				{#each $data_store as member1, i}
					{#each $data_store as member2, j}
						{#if i < j && ((firstMember === '' && secondMember === '') || (secondMember === '' && ((member1.name === firstMember && firstMember !== '') || (member2.name === firstMember && firstMember !== ''))) || (secondMember !== '' && ((member1.name === firstMember && member2.name === secondMember) || (member2.name === firstMember && member1.name === secondMember)))) && trySwapMembers(member1.name, member2.name).error === ''}
							<div
								class="bg-purple-400 hover:bg-purple-600 transition-all py-2 px-4 rounded-xl m-2"
							>
								<p
									class={`text-center text-purple-500 ${
										member1.name === firstMember || member1.name === secondMember
											? 'bg-purple-700 text-white'
											: 'bg-white'
									} hover:bg-purple-200 border-2 border-purple-300 transition-all rounded-md py-1`}
								>
									{member1.name}
									{#if showDetail}
										#{member1.year} {member1.faculty}
									{/if}
								</p>
								<p
									class={`text-center text-purple-500 ${
										member2.name === firstMember || member2.name === secondMember
											? 'bg-purple-700 text-white'
											: 'bg-white'
									} hover:bg-purple-200 border-2 border-purple-300 transition-all rounded-md py-1`}
								>
									{member2.name}
									{#if showDetail}
										#{member2.year} {member2.faculty}
									{/if}
								</p>
							</div>
						{/if}
					{/each}
				{/each}
			</div>
		{/if}
	{/key}
</div>

<div class="my-8 flex flex-row gap-2 items-center justify-center">
	<select
		class="p-2 ml-2 rounded mt-1 cursor-pointer"
		placeholder="name1"
		disabled={$data_store.length === 0}
		bind:value={firstMember}
	>
		<option value="">Select 1st member</option>
		{#each $data_store as member}
			<option value={member.name}>{member.name}</option>
		{/each}
	</select>
	{#key page}
		<select
			class="p-2 ml-2 rounded mt-1 cursor-pointer"
			placeholder="name2"
			disabled={$data_store.length === 0}
			bind:value={secondMember}
		>
			{#key secondMember}
				<option value="">Select 2nd member</option>
				{#each $data_store as member}
					{#if trySwapMembers(firstMember, member.name).error === ''}
						<option value={member.name}>{member.name}</option>
					{/if}
				{/each}
			{/key}
		</select>
	{/key}
	<button
		class="bg-orange-400 hover:bg-orange-primary-darken text-white font-bold transition-all text-lg py-1 px-3 mx-2 rounded-lg cursor-pointer"
		on:click={handleSwapMembers}
	>
		Swap
	</button>
</div>

<div class="flex justify-center my-8">
	<button
		type="button"
		class="bg-white hover:bg-orange-300 text-orange-primary border-2 font-bold border-orange-primary transition-all rounded-md py-1 cursor-pointer w-8"
		on:click={() => setPage(page - 1)}
	>
		&lt;
	</button>

	{#each totalPages as pageNumber, i}
		<button
			type="button"
			class={`${
				i === page ? 'bg-orange-300' : 'bg-white'
			} hover:bg-orange-200 text-orange-primary border-2 border-orange-primary transition-all rounded-md py-1 cursor-pointer w-8`}
			on:click={() => {
				setPage(i);
				secondMember = '';
			}}
		>
			D{i + 1}
		</button>
	{/each}

	<button
		type="button"
		class="bg-white hover:bg-orange-300 text-orange-primary border-2 font-bold border-orange-primary transition-all rounded-md py-1 cursor-pointer w-8"
		on:click={() => setPage(page + 1)}
	>
		&gt;
	</button>
</div>

<div class="flex justify-center gap-3 mb-8">
	<DownloadButton on:click={handleDownloadButton} group_cnt={1} />
</div>

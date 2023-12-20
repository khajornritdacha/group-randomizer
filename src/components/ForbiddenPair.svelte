<script lang="ts">
	import { getGroupError, randomGroup } from '$lib';
	import { handleDownload } from '$lib/utils/sheetService';
	import { data_store, workbook_store } from '../store';
	import DownloadButton from './DownloadButton.svelte';

	export let day: number;
	export let group_cnt: number;

	let forbiddenPairs: string[][] = [];

	let cur_first = '';
	let cur_second = '';

	let second_options: string[] = [];

	function check_forbidden(name1: string, name2: string) {
		// check if cur_first and cur_second are in forbiddenPairs
		// if they are, then alert
		// else, add to forbiddenPairs
		return forbiddenPairs.some((pair) => {
			return (pair[0] === name1 && pair[1] === name2) || (pair[1] === name1 && pair[0] === name2);
		});
	}

	function change_second_input() {
		if (check_forbidden(cur_first, cur_second)) {
			cur_second = '';
		}
		second_options = $data_store.reduce((agg, member) => {
			if (member.name !== cur_first && !check_forbidden(member.name, cur_first))
				agg.push(member.name);
			return agg;
		}, [] as string[]);
	}

	function handleAdd() {
		if (cur_first === '' || cur_second === '') return;
		forbiddenPairs = [...forbiddenPairs, [cur_first, cur_second]];
		cur_first = '';
		cur_second = '';
	}

	function handleRemove(pair: string[]) {
		forbiddenPairs = forbiddenPairs.filter((p) => p[0] !== pair[0] || p[1] !== pair[1]);
	}

	function showModal(errors: string[]) {
		// TODO: handle show modal
		return;
	}

	function handleDownloadButton() {
		// TODO: complete this function
		const { groups, groupOfMembers } = randomGroup($data_store, forbiddenPairs, day, group_cnt);
		const errors = getGroupError(groups) as string[] | undefined;

		if (errors && errors.length > 0) {
			showModal(errors || []);
			return;
		}
		handleDownload($workbook_store, groupOfMembers);
		console.log('Handle download');
		return;
	}

	$: cur_first && change_second_input();
	$: console.log(`Day = ${day}`);
</script>

<DownloadButton on:click={handleDownloadButton} />
<h1 class="pt-10 pb-5 text-4xl font-bold">Forbidden Pairs</h1>
{#if $data_store.length === 0}
	<p class="text-xl">Please Upload File</p>
{:else}
	<ol>
		<!-- TODO: grid is recommended here -->
		{#each forbiddenPairs as pair}
			<li class="text-xl py-3 flex justify-between items-center border rounded-xl my-4">
				<span class="px-5">{pair[0]}</span>
				<span class="px-5">{pair[1]}</span>
				<button
					class="bg-red-500 hover:bg-red-600 text-gray-800 py-1 px-3 mx-2 rounded-2xl cursor-pointer"
					on:click={() => handleRemove(pair)}>remove</button
				>
			</li>
		{/each}
		<li class="text-xl py-3 flex justify-between border rounded-xl my-4">
			<select
				class="mx-2 p-2 rounded"
				placeholder="name1"
				disabled={$data_store.length === 0}
				bind:value={cur_first}
			>
				{#each $data_store as member}
					<option value={member.name}>{member.name}</option>
				{/each}
			</select>
			<select
				class="mx-2 p-2 rounded"
				placeholder="name2"
				disabled={$data_store.length === 0 || cur_first === ''}
				bind:value={cur_second}
			>
				{#each second_options as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
			<button
				class="bg-red-500 hover:bg-red-600 text-gray-800 py-1 px-3 mx-2 rounded-2xl cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
				on:click={handleAdd}
				disabled={cur_first === '' || cur_second === ''}>add</button
			>
		</li>
	</ol>
{/if}

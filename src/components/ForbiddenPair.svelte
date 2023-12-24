<script lang="ts">
	import { GroupService } from '$lib/utils/groupService';
	import { handleDownload } from '$lib/utils/sheetService';
	import { data_store, workbook_store } from '../store';
	import DownloadButton from './DownloadButton.svelte';
	import Modal from 'svelte-parts/Modal.svelte';

	// TODO: maximum number of forbidden pairs is group size
	export let day: number;
	export let group_cnt: number;

	let forbiddenPairs: string[][] = [];

	let cur_first = '';
	let cur_second = '';

	let second_options: string[] = [];

	let openModal = false;
	let force = false;
	let errorsToShow: string[] = [];

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
		openModal = true;
		errorsToShow = errors;
		return;
	}

	function handleDownloadButton() {
		const groupService = new GroupService($data_store, forbiddenPairs, day, group_cnt);
		const { groups, groupOfMembers } = groupService.randomGroup();
		const errors = groupService.getGroupError(groups) as string[] | undefined;
		if (errors && errors.length > 0 && !force) {
			console.warn(errors);
			force = true;
			showModal(errors || []);
			return;
		}
		handleDownload($workbook_store, groupOfMembers);
		force = false;
		return;
	}

	$: cur_first && change_second_input();
</script>

<div class="flex flex-row justify-center">
	<DownloadButton on:click={handleDownloadButton} {group_cnt} />
</div>
<h1 class="pt-10 pb-5 text-4xl font-bold text-indigo-950 text-center">Forbidden Pairs</h1>
{#if $data_store.length === 0}
	<p class="text-xl text-center">Please Upload File!</p>
{:else}
	<ol>
		{#each forbiddenPairs as pair}
			<li class="text-xl py-3 grid grid-cols-3 items-center border rounded-xl my-4">
				<span class="p-2 mx-3">{pair[0]}</span>
				<span class="p-2 mx-3">{pair[1]}</span>
				<button
					class="bg-red-400 hover:bg-red-500 text-white py-2 px-3 mx-3 rounded-2xl cursor-pointer inline-flex justify-center items-center"
					on:click={() => handleRemove(pair)}
				>
					<svg
						class="w-4 h-4 mr-1 text-gray-800 dark:text-white"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 18 20"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"
						/>
					</svg>
					<span>remove</span>
				</button>
			</li>
		{/each}
		<li class="text-xl py-3 grid grid-cols-3 items-center border rounded-xl my-4">
			<select
				class="mx-3 p-2 pr-12 rounded"
				disabled={$data_store.length === 0}
				bind:value={cur_first}
			>
				<option value="" disabled selected>member1</option>
				{#each $data_store as member}
					<option value={member.name}>{member.name}</option>
				{/each}
			</select>
			<select
				class="mx-3 p-2 pr-12 rounded"
				disabled={$data_store.length === 0 || cur_first === ''}
				bind:value={cur_second}
			>
				<option value="" disabled selected>member2</option>
				{#each second_options as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
			<button
				class="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 mx-3 rounded-2xl cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
				on:click={handleAdd}
				disabled={cur_first === '' || cur_second === ''}>add</button
			>
		</li>
	</ol>
{/if}

<Modal
	open={openModal}
	onClose={() => {
		openModal = false;
		force = false;
	}}
>
	<div class="bg-indigo-300 p-12 rounded-2xl">
		<h1 class="mb-8 text-4xl font-bold text-indigo-950 text-center">Warning!</h1>
		<div class="flex flex-col">
			{#each errorsToShow as error}
				<li class="text-xl text-indigo-950 py-4">{error}</li>
			{/each}
		</div>
		<div class="flex flex-row justify-center mt-8">
			<DownloadButton on:click={handleDownloadButton} {group_cnt} {force} />
		</div>
	</div>
</Modal>

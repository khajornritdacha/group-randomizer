<script lang="ts">
	import { onMount } from 'svelte';
	import { data_store, forbiddenPairs_store } from '../store';

	export let forbiddenPairs: string[][];

	let cur_first = '';
	let cur_second = '';

	let second_options: string[] = [];

	$: forbiddenPairs = $forbiddenPairs_store;

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

	$: cur_first && change_second_input();
</script>

<div class="flex-col items-center p-4 border-4 border-orange-primary-darken rounded-2xl">
	<h1 class="py-2 text-4xl font-bold text-center">Forbidden Pairs</h1>
	<ol class="flex flex-col justify-center">
		{#each forbiddenPairs as pair}
			<li
				class="text-xl py-2 grid grid-cols-3 justify-items-center items-center border-2 border-orange-primary rounded-xl mt-3"
			>
				<span class="px-5 text-nowrap">{pair[0]}</span>
				<span class="px-5 text-no-wrap">{pair[1]}</span>
				<button
					class="bg-orange-primary hover:bg-orange-primary-darken text-white-secondary text-sm transition-all px-3 py-1 mx-2 rounded-2xl cursor-pointer font-scaryHalloween"
					on:click={() => handleRemove(pair)}>Remove</button
				>
			</li>
		{/each}
		<li class="text-xl py-1 grid grid-cols-3 justify-items-center border rounded-xl my-3">
			<select
				class="mx-2 p-2 rounded w-[90%]"
				placeholder="name1"
				disabled={$data_store.length === 0}
				bind:value={cur_first}
			>
				{#each $data_store as member}
					<option value={member.name}>{member.name}</option>
				{/each}
			</select>
			<select
				class="mx-2 p-2 rounded w-[90%]"
				placeholder="name2"
				disabled={$data_store.length === 0 || cur_first === ''}
				bind:value={cur_second}
			>
				{#each second_options as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
			<button
				class="bg-orange-primary hover:bg-orange-primary-darken text-white-secondary transition-all py-1 px-3 mx-2 rounded-2xl cursor-pointer disabled:opacity-50 disabled:pointer-events-none font-scaryHalloween"
				on:click={handleAdd}
				disabled={cur_first === '' || cur_second === ''}>Add</button
			>
		</li>
	</ol>
</div>

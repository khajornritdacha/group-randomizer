<script lang="ts">
	import { data_store } from '../store';

	export let group_cnt: number;
	export let day: number;
	const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];

	$: console.log(`group_cnt in children= ${group_cnt}`);
</script>

<h1 class="pt-10 pb-5 text-4xl font-bold text-indigo-950 text-center">Group Information</h1>
<div class="grid grid-cols-2 py-4">
	<h2 class="py-3 text-2xl text-indigo-950 font-bold">Number of members :</h2>
	<input
		type="number"
		bind:value={$data_store.length}
		disabled
		class="p-2 ml-2 rounded grow"
		id="n_member"
	/>
</div>
<div class="grid grid-cols-2 py-4">
	<h2 class="py-3 text-2xl text-indigo-950 font-bold">Number of groups :</h2>
	<select bind:value={group_cnt} class="p-2 ml-2 rounded grow" id="n_group">
		{#each PRIMES as prime}
			<option value={prime}>{prime}</option>
		{/each}
	</select>
</div>
<div class="grid grid-cols-2 py-4">
	<h2 class="py-3 text-2xl text-indigo-950 font-bold">Number of days :</h2>
	<input
		type="number"
		bind:value={day}
		disabled={!group_cnt}
		min="1"
		max={group_cnt - 1}
		class="p-2 ml-2 rounded grow"
		id="n_day"
	/>
</div>

<script lang="ts">
	import { data_store } from '../store';

	export let group_cnt: number;
	export let day: number;
	export let disableGenerateControlSheet: boolean;
	const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
</script>

<div class="flex flex-col pt-10 justify-center">
	<label class="py-3 text-2xl flex font-bold" for="n_member">Number of members :</label>
	<input
		type="number"
		bind:value={$data_store.length}
		disabled
		class="p-2 ml-2 rounded grow"
		id="n_member"
	/>
	<label class="py-3 text-2xl flex font-bold" for="n_group">Number of groups :</label>
	<select
		bind:value={group_cnt}
		class="p-2 ml-2 rounded grow"
		id="n_group"
		disabled={!$data_store.length}
	>
		{#each PRIMES as prime}
			<option value={prime}>{prime}</option>
		{/each}
	</select>
	<label class="py-3 text-2xl flex font-bold" for="n_day">Number of days :</label>
	<input
		type="number"
		bind:value={day}
		disabled={!group_cnt}
		min="1"
		max={group_cnt - 1}
		class="p-2 ml-2 rounded grow"
		id="n_day"
	/>
	<input
		type="checkbox"
		bind:checked={disableGenerateControlSheet}
		disabled={!group_cnt}
		class="p-2 ml-2 rounded grow"
		id="control_sheet"
	/>
	<label class="py-3 text-2xl flex font-bold" for="control_sheet">Don't generate template</label>
</div>

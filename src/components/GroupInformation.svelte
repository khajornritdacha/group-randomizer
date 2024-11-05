<script lang="ts">
	import { data_store } from '../store';

	export let group_cnt: number;
	export let day: number;
	export let disableGenerateControlSheet: boolean;
	export let enableForbiddenPairs: boolean;
	const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
</script>

<div class="flex flex-col justify-center">
	<div class="grid grid-cols-2 gap-4 mt-12">
		<label class="py-3 text-xl flex font-bold" for="n_member">Number of members :</label>
		<input
			type="number"
			bind:value={$data_store.length}
			disabled
			class="p-2 ml-2 rounded grow disabled: bg-gray-100"
			id="n_member"
		/>

		<label class="py-3 text-xl flex font-bold" for="n_group">Number of groups :</label>
		<select
			bind:value={group_cnt}
			disabled={!$data_store.length}
			class="p-2 ml-2 rounded grow disabled: bg-gray-100"
			id="n_group"
		>
			{#each PRIMES as prime}
				<option value={prime}>{prime}</option>
			{/each}
		</select>

		<label class="py-3 text-xl flex font-bold" for="n_day">Number of days :</label>
		<input
			type="number"
			bind:value={day}
			disabled={!group_cnt}
			min="1"
			max={group_cnt - 1}
			class="p-2 ml-2 rounded grow disabled: bg-gray-100"
			id="n_day"
		/>
	</div>

	<!-- <div class="flex flex-row mt-4 gap-6 items-center">
		<input
			type="checkbox"
			bind:checked={disableGenerateControlSheet}
			disabled={!group_cnt}
			class="p-2 ml-2 rounded mt-1"
			id="control_sheet"
		/>
		<label class="py-3 text-xl flex font-bold" for="control_sheet">Download minimal version</label>
	</div> -->
	<div class="flex flex-row my-2 gap-6 items-center">
		<input
			type="checkbox"
			bind:checked={enableForbiddenPairs}
			disabled={!group_cnt}
			class="p-2 ml-2 rounded mt-1"
			id="forbiddenPairs"
		/>
		<label class="py-3 text-xl flex font-bold" for="forbiddenPairs">Enable Forbidden Pairs</label>
	</div>
</div>

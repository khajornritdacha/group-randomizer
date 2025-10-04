<script lang="ts">
	import { data_store } from '../store';

	export let group_cnt: number;
	export let day: number;
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
		<input
			type="number"
			bind:value={group_cnt}
			disabled={!$data_store.length}
			min="1"
			class="p-2 ml-2 rounded grow disabled: bg-gray-100"
			id="n_group"
		/>

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
</div>

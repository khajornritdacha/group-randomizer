<script lang="ts">
	import DropMember from '../components/DropMember.svelte';
	import ForbiddenPair from '../components/ForbiddenPair.svelte';
	import GroupInformation from '../components/GroupInformation.svelte';

	let group_cnt = 0;
	let day = 1;

	$: console.log(`group_cnt = ${group_cnt}`);
</script>

<h1 class="font-bold text-7xl flex justify-center text-center py-10 text-indigo-950">
	Group Randomizer
</h1>
<div class="flex max-sm:flex-col">
	<div class="sm:basis-1/2 m-5 flex flex-col pl-12 pr-6">
		<div class="flex flex-row mx-auto">
			<DropMember />
		</div>
		<GroupInformation bind:group_cnt bind:day />
	</div>
	<div class="sm:basis-1/2 m-5 flex flex-col pl-6 pr-12">
		<ForbiddenPair {day} {group_cnt} />
	</div>
</div>

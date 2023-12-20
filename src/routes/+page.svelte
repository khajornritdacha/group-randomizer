<script lang="ts">
	import DropMember from '../components/DropMember.svelte';
	import Footer from '../components/Footer.svelte';
	import ForbiddenPair from '../components/ForbiddenPair.svelte';
	import GroupInformation from '../components/GroupInformation.svelte';

	let group_cnt = 0;
	let day = 1;

	$: console.log(`group_cnt = ${group_cnt}`);
</script>

<h1 class="font-bold text-7xl text-center py-10 text-indigo-950">Group Randomizer</h1>
<div class="flex flex-row">
	<div class="basis-1/2 m-5 flex flex-col items-center">
		<DropMember />
		<GroupInformation bind:group_cnt bind:day />
	</div>
	<div class="basis-1/2 m-5 flex flex-col items-center">
		<ForbiddenPair {day} {group_cnt} />
	</div>
</div>

<!-- TODO: let me learn about $: first, and I will go back to create modal -->
<!-- <Modal open={...} onClose={() => ...}>
    <div class="bg-yellow-500 p-2 rounded-2 flex">
        <h2 class="font-bold">Warning!</h2>
    </div>
</Modal> -->

<Footer />

<!-- <button type="button" on:click={() => count += 1} class="bg-blue-500 text-white rounded px-4 py-2">Augment</button> -->

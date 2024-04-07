<script lang="ts">
	import { GroupService } from '$lib/utils/groupService';
	import { handleDownload } from '$lib/utils/sheetService';
	import DownloadButton from '../components/DownloadButton.svelte';
	import DropMember from '../components/DropMember.svelte';
	import Footer from '../components/Footer.svelte';
	import ForbiddenPair from '../components/ForbiddenPair.svelte';
	import GroupInformation from '../components/GroupInformation.svelte';
	import { data_store, workbook_store } from '../store';

	let group_cnt = 0;
	let day = 1;
	let disableGenerateControlSheet: boolean = false;
	let forbiddenPairs: string[][] = [];
	let enableForbiddenPairs: boolean = false;

	function showModal(errors: string[]) {
		// TODO: handle show modal
		return;
	}

	function handleDownloadButton() {
		const groupService = new GroupService($data_store, forbiddenPairs, day, group_cnt);
		const { groups, groupOfMembers } = groupService.randomGroup();
		const errors = groupService.getGroupError(groups) as string[] | undefined;
		if (errors && errors.length > 0) {
			console.warn(errors);
			// TODO: handle show modal
			showModal(errors || []);
			// TODO: you probably want to return here to prevent download
			// return;
		}
		handleDownload($workbook_store, groupOfMembers, disableGenerateControlSheet);
		return;
	}
</script>

<div class="flex">
	<div
		class="flex flex-col items-center min-h-[100vh] justify-evenly px-[5%] max-w-[50%] basis-1/2"
	>
		<h1
			class="font-bold text-7xl text-center py-10 text-[#E57F31] bg-[#E5E2D9] font-scaryHalloween"
		>
			Group Randomizer
		</h1>
		<div class="min-h-max w-[80%]">
			<DropMember />
		</div>
	</div>

	<div
		class={`flex flex-col justify-${
			enableForbiddenPairs ? 'between' : 'center'
		} items-center px-[5%] basis-1/2 min-h-[100vh]`}
	>
		<div class={`flex flex-col justify-between gap-3 ${enableForbiddenPairs && 'pt-10'}`}>
			<GroupInformation
				bind:group_cnt
				bind:day
				bind:disableGenerateControlSheet
				bind:enableForbiddenPairs
			/>
			<DownloadButton on:click={handleDownloadButton} {group_cnt} />
		</div>
		{#if enableForbiddenPairs}
			<ForbiddenPair {forbiddenPairs} />
		{/if}
	</div>
</div>
<!-- <div class="flex flex-row"></div> -->

<!-- TODO: let me learn about $: first, and I will go back to create modal -->
<!-- <Modal open={...} onClose={() => ...}>
    <div class="bg-yellow-500 p-2 rounded-2 flex">
        <h2 class="font-bold">Warning!</h2>
    </div>
</Modal> -->

<!-- <Footer /> -->

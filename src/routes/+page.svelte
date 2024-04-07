<script lang="ts">
	import { GroupService } from '$lib/utils/groupService';
	import { handleDownload } from '$lib/utils/sheetService';
	import Background from '../components/Background.svelte';
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
			// return;
		}
		handleDownload($workbook_store, groupOfMembers, disableGenerateControlSheet);
		return;
	}
</script>

<Background />
<div class="absolute top-2 right-2">
	<a
		href="https://github.com/khajornritdacha/group-randomizer/tree/main?tab=readme-ov-file#group-randomizer"
		target="_blank"
		class="rounded-full inline-block leading-[0] font-bold text-center text-2xl bg-orange-primary hover:bg-orange-primary-darken text-white-secondary p-5"
		>How to Use</a
	>
</div>
<div class="flex bg-none">
	<div
		class="flex flex-col items-center min-h-[100vh] justify-evenly px-[5%] max-w-[50%] basis-1/2"
	>
		<h1
			class="bg-none font-bold text-7xl text-center py-10 text-[#E57F31] bg-[#E5E2D9] font-scaryHalloween"
		>
			🕯️Suksa🕯️ Random
		</h1>
		<div class="min-h-max w-[80%] z-10">
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

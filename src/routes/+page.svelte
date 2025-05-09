<script lang="ts">
	import { goto } from '$app/navigation';
	import { GroupService } from '$lib/utils/groupService';
	import { handleDownload } from '$lib/utils/sheetService';
	import Background from '../components/Background.svelte';
	import DownloadButton from '../components/DownloadButton.svelte';
	import DropMember from '../components/DropMember.svelte';
	import ForbiddenPair from '../components/ForbiddenPair.svelte';
	import GroupInformation from '../components/GroupInformation.svelte';
	import { data_store, groupOfMembers_store, groups_store, leader_store, workbook_store } from '../store';

	let group_cnt = 0;
	let day = 1;
	let disableGenerateControlSheet: boolean = true;
	let forbiddenPairs: string[][] = [];
	let enableForbiddenPairs: boolean = false;

	function showModal(errors: string[]) {
		// TODO: handle show modal
		return;
	}

	function handleDownloadButton() {
		const groupService = new GroupService($data_store, $leader_store, forbiddenPairs, day, group_cnt);
		const { groups, groupOfMembers } = groupService.randomGroup();
		const errors = groupService.getGroupError(groups) as string[] | undefined;
		if (errors && errors.length > 0) {
			console.warn(errors);
			// TODO: handle show modal
			showModal(errors || []);
			// return;
		}
		groups_store.set(groups);
		groupOfMembers_store.set(groupOfMembers);
		// handleDownload($workbook_store, groupOfMembers, disableGenerateControlSheet);
		goto('/result');
		return;
	}
</script>

<Background />
<div class="absolute top-4 right-48">
	<a
		href="/result"
		class="rounded-xl inline-block leading-[0] font-bold text-center text-lg bg-orange-primary hover:bg-orange-primary-darken text-white-secondary p-5 font-scaryHalloween"
		>Result</a
	>
</div>
<div class="absolute top-4 right-4">
	<a
		href="https://github.com/khajornritdacha/group-randomizer/tree/main?tab=readme-ov-file#group-randomizer"
		target="_blank"
		class="rounded-xl inline-block leading-[0] font-bold text-center text-lg bg-orange-primary hover:bg-orange-primary-darken text-white-secondary p-5 font-scaryHalloween"
		>How to Use</a
	>
</div>
<div class="flex bg-none flex-col items-center overflow-x-hidden lg:flex-row">
	<div
		class="flex flex-col items-center min-h-[100vh] justify-evenly px-[5%] lg:max-w-[50%] basis-1/2"
	>
		<div>
			<h1
				class="text-nowrap bg-none font-bold text-5xl lg:text-7xl text-center py-10 text-[#E57F31] bg-[#E5E2D9] font-scaryHalloween"
			>
				🕯️Suksa🕯️
			</h1>
			<h1
				class="text-nowrap bg-none font-bold text-5xl lg:text-7xl text-center py-10 text-[#E57F31] bg-[#E5E2D9] font-scaryHalloween"
			>
				Random
			</h1>
		</div>
		<div class="min-h-max w-[80%] z-10 bg-orange-200 rounded-3xl">
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
		</div>
		{#if enableForbiddenPairs}
			<ForbiddenPair {forbiddenPairs} />
		{/if}
		<div class={`flex flex-col justify-between gap-3 ${enableForbiddenPairs && 'py-5'}`}>
			<DownloadButton on:click={handleDownloadButton} {group_cnt} />
		</div>
	</div>
</div>

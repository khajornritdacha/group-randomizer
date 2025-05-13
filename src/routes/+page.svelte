<script lang="ts">
	import { goto } from '$app/navigation';
	import { type RandomGroupResult } from '$lib/types';
	import GroupServiceWorker from '$lib/utils/groupServierWorker.ts?worker';
	import Background from '../components/Background.svelte';
	import DownloadButton from '../components/DownloadButton.svelte';
	import DropMember from '../components/DropMember.svelte';
	import ForbiddenPair from '../components/ForbiddenPair.svelte';
	import GroupInformation from '../components/GroupInformation.svelte';
	import { data_store, groupOfMembers_store, groups_store, leader_store } from '../store';
	import toast, { Toaster } from 'svelte-french-toast';

	let group_cnt = 0;
	let day = 1;
	let disableGenerateControlSheet: boolean = true;
	let forbiddenPairs: string[][] = [];
	let enableForbiddenPairs: boolean = false;
	let isLoading = false;
	let intervalId: number | null = null;
	let elapsedTime = 0;
	let processingStatusWord = 'Loading';

	function startLoadingModal() {
		isLoading = true;
		elapsedTime = 0;
		intervalId = setInterval(() => {
			elapsedTime += 1;
		}, 1000);
	}

	function stopLoadingModal() {
		isLoading = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function showErrorsModal(errors: string) {
		toast.error(errors);
	}

	function handleDownloadButton() {
		startLoadingModal();
		const worker = new GroupServiceWorker();
		worker.postMessage({
			type: 'init',
			data: {
				members: $data_store,
				leader: $leader_store,
				group_cnt,
				forbiddenPairs,
				day
			}
		});

		worker.onmessage = (event: MessageEvent<{ data: RandomGroupResult; errors: Error }>) => {
			const { errors } = event.data;

			if (errors !== null) {
				stopLoadingModal();
				showErrorsModal(errors.message);
				return;
			}

			if (event.data.data.processingStatus !== undefined) {
				processingStatusWord = event.data.data.processingStatus;
			}

			const { groups, groupOfMembers } = event.data.data;

			if (groups === null || groupOfMembers === null) return;

			stopLoadingModal();
			toast.success('Generated groups successfully!');
			groups_store.set(groups);
			groupOfMembers_store.set(groupOfMembers);

			goto('/result');
			return;
		};
	}
</script>

<Toaster />
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
			<ForbiddenPair bind:forbiddenPairs />
		{/if}
		<div class={`flex flex-col justify-between gap-3 ${enableForbiddenPairs && 'py-5'}`}>
			<DownloadButton on:click={handleDownloadButton} {group_cnt} />
		</div>
	</div>
	{#if isLoading}
		<div
			class="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto"
			style="backdrop-filter: blur(5px);"
		>
			<div class="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full space-y-4">
				<!-- <p class="text-2xl font-semibold text-orange-600">Generating Groups</p> -->
				<p class="text-2xl font-semibold text-orange-600">Currently in {processingStatusWord}{'.'.repeat((elapsedTime % 3) + 1)}</p>
				<p class="text-lg">Elapsed Time: {elapsedTime} second{elapsedTime === 1 ? '' : 's'}</p>
				<div class="flex justify-center">
					<div
						class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"
					></div>
				</div>
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import DropFile from 'svelte-parts/DropFile.svelte';
	import {
		groups_store,
		groupOfMembers_store,
		workbook_store,
		data_store,
		forbiddenPairs_store
	} from '../store';
	import { read } from 'xlsx';

	import { loadResult } from '$lib/utils/sheetService';

	export async function onDrop(files: File[]) {
		const file = files[0];
		const raw_sheet = await file.arrayBuffer();
		const workbook = read(raw_sheet);

		workbook_store.set(workbook);
		const result = loadResult(workbook);
		groups_store.set(result.groups);
		groupOfMembers_store.set(result.groupOfMembers);
		data_store.set(result.data);
		console.log({ NowforbiddenPairs : result.forbiddenPairs });
		forbiddenPairs_store.set(result.forbiddenPairs);
	}
</script>

{#if !$workbook_store}
	<DropFile {onDrop} class="w-4"></DropFile>
{/if}

<script lang="ts">
	import DropFile from 'svelte-parts/DropFile.svelte';
	import { data_store, forbiddenPairs_store, leader_store, workbook_store } from '../store';
	import { read } from 'xlsx';

	import { loadForbiddenPairs, loadFromSheet } from '$lib/utils/sheetService';

	export async function onDrop(files: File[]) {
		const file = files[0];
		const raw_sheet = await file.arrayBuffer();
		const workbook = read(raw_sheet);
		workbook_store.set(workbook);
		data_store.set(loadFromSheet(workbook, 'database'));
		forbiddenPairs_store.set(loadForbiddenPairs(workbook));
		// leader_store.set(loadFromSheet(workbook, 'leader'));
	}
</script>

<DropFile {onDrop} class="max-h-min"></DropFile>

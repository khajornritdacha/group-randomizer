<script lang="ts">
	import DropFile from 'svelte-parts/DropFile.svelte';
	import { data_store, leader_store, workbook_store } from '../store';
	import { read } from 'xlsx';

	import { loadFromSheet } from '$lib/utils/sheetService';

	export async function onDrop(files: File[]) {
		const file = files[0];
		const raw_sheet = await file.arrayBuffer();
		const workbook = read(raw_sheet);
		workbook_store.set(workbook);
		data_store.set(loadFromSheet(workbook, 'database'));
		leader_store.set(loadFromSheet(workbook, 'leader'));
	}
</script>

<DropFile {onDrop} class="max-h-min"></DropFile>

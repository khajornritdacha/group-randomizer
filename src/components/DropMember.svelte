<script lang="ts">
	import DropFile from 'svelte-parts/DropFile.svelte';
	import { data_store, workbook_store } from '../store';
	import { read } from 'xlsx';

	import { loadFromSheet } from '$lib/utils/sheetService';

	export async function onDrop(files: File[]) {
		const file = files[0];
		const raw_sheet = await file.arrayBuffer();
		const workbook = read(raw_sheet);
		workbook_store.set(workbook);
		data_store.set(loadFromSheet(workbook));
	}
</script>

<DropFile {onDrop}>
	<div
		class="text-3xl text-white bg-purple-500 hover:bg-purple-600 py-6 px-6 rounded-2xl inline-flex items-center cursor-pointer"
	>
		<svg
			class="h-6 w-6 mr-2"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" />
			<path d="M7 18a4.6 4.4 0 0 1 0 -9h0a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
			<polyline points="9 15 12 12 15 15" /> <line x1="12" y1="12" x2="12" y2="21" /></svg
		>
		<span class="text-3xl">Upload file</span>
	</div>
</DropFile>

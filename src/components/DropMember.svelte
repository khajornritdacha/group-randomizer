<script lang="ts">
	import DropFile from 'svelte-parts/DropFile.svelte';
	import { data_store, forbiddenPairs_store, workbook_store } from '../store';
	import { read } from 'xlsx';

	import { loadForbiddenPairs, loadFromSheet } from '$lib/utils/sheetService';
	import toast from 'svelte-french-toast';
	import { FORBIDDEN_PAIR_SHEET_NOT_FOUND } from '$lib/constants';

	export async function onDrop(files: File[]) {
		const file = files[0];
		if (!file) return;
		if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
			toast.error('Please upload an Excel file (.xlsx or .xls)');
			return;
		}

		const raw_sheet = await file.arrayBuffer();
		const workbook = read(raw_sheet);
		try {
			workbook_store.set(workbook);
			data_store.set(loadFromSheet(workbook, 'database'));
			toast.success(`Loaded ${$data_store.length} members successfully!`);
		} catch (err: unknown) {
			toast.error((err as Error).message);
			console.error(err);
			data_store.set([]);
			workbook_store.set(null);
			forbiddenPairs_store.set([]);
			return;
		}

		try {
			forbiddenPairs_store.set(loadForbiddenPairs(workbook));

			toast.success(`Loaded ${$forbiddenPairs_store.length} forbidden pairs successfully!`);
		} catch (err: unknown) {
			if (err instanceof Error && err.message === FORBIDDEN_PAIR_SHEET_NOT_FOUND) {
				toast((err as Error).message, { icon: '⚠️' });
				console.warn(err);
				forbiddenPairs_store.set([]);
				return;
			} 
			toast.error((err as Error).message);
			console.error(err);
			forbiddenPairs_store.set([]);
			return;
		}
	}
</script>

<DropFile {onDrop} class="max-h-min"></DropFile>

// place files you want to import through the `$lib` alias in this folder.
import { read } from 'xlsx';

export async function onDrop(files: File[]) {
	const file = files[0];
	const raw_sheet = await file.arrayBuffer();
	const workbook = read(raw_sheet);
	console.log(workbook);
}

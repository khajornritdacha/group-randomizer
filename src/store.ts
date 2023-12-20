import { writable } from 'svelte/store';
import * as XLSX from 'xlsx';

export interface Person {
	names: string;
	roles: string;
	baan: string;
	ex_camp: string;
	gender: string;
	id: number;
}

function createData() {
	const { subscribe, set } = writable<Person[]>([]);

	function load(raw_sheet: ArrayBuffer) {
		const workbook = XLSX.read(raw_sheet);
		const data = [];
		for (let i = 2; ; i++) {
			if (!workbook.Sheets['database'][`A${i}`]) break;
			data.push({
				names: workbook.Sheets['database'][`A${i}`].v,
				roles: workbook.Sheets['database'][`D${i}`].v,
				baan: workbook.Sheets['database'][`E${i}`].v,
				ex_camp: workbook.Sheets['database'][`F${i}`].v,
				gender: workbook.Sheets['database'][`G${i}`].v,
				id: i - 1
			});
		}
		set(data);
	}

	return {
		subscribe,
		load: (raw_sheet: ArrayBuffer) => load(raw_sheet)
	};
}

export const data = createData();

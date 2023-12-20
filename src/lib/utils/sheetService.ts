import { read } from 'xlsx';

export function loadFromSheet(raw_sheet: ArrayBuffer) {
	// TODO: Add flexibility to attribute
	const workbook = read(raw_sheet);
	const data = [];
	for (let i = 2; ; i++) {
		if (!workbook.Sheets['database'][`A${i}`]) break;
		data.push({
			name: workbook.Sheets['database'][`A${i}`].v,
			role: workbook.Sheets['database'][`D${i}`].v,
			baan: workbook.Sheets['database'][`E${i}`].v,
			ex_camp: workbook.Sheets['database'][`F${i}`].v,
			gender: workbook.Sheets['database'][`G${i}`].v,
			id: i - 1
		});
	}
	console.log(data);
	return data;
}

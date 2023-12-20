import { type WorkBook, writeFile, utils, type CellObject } from 'xlsx';

const GROUP_ASSIGN_SHEET_NAME = 'group_assign';

export function loadFromSheet(workbook: WorkBook) {
	// TODO: Add flexibility to attribute
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
	return data;
}

export function handleDownload(workbook: WorkBook | null, groupOfMembers: number[][]) {
	if (!workbook) return;
	const out_wb = utils.book_new();
	utils.book_append_sheet(out_wb, workbook.Sheets['database'], 'database');

	createGroupAssignSheet(out_wb, groupOfMembers.length, groupOfMembers[0].length);
	utils.sheet_add_aoa(out_wb.Sheets[GROUP_ASSIGN_SHEET_NAME], groupOfMembers, {
		origin: 'B2'
	});
	writeFile(out_wb, 'output.xlsx');
}

function createGroupAssignSheet(workbook: WorkBook, member_cnt: number, day: number) {
	const groupAssigns = [['ชื่อ', ...Array.from({ length: day }, (_, i) => `วันที่ ${i + 1}`)]] as (
		| string
		| CellObject
	)[][];
	for (let i = 1; i <= member_cnt; i++) {
		groupAssigns.push([{ t: 'n', f: `=database!A${i + 1}` }]);
	}
	utils.book_append_sheet(workbook, utils.aoa_to_sheet(groupAssigns), GROUP_ASSIGN_SHEET_NAME);
}

import type { Person } from '$lib/types';
import { type WorkBook, writeFile, utils, type CellObject } from 'xlsx';

const GROUP_ASSIGN_SHEET_NAME = 'group_assign';
const CONTROL_SHEET_NAME = 'control';

export function loadFromSheet(workbook: WorkBook, sheetName: string) {
	const data: Person[] = [];
	for (let i = 2; ; i++) {
		if (!workbook.Sheets[sheetName][`A${i}`]) break;
		data.push({
			name: workbook.Sheets[sheetName][`A${i}`].v,
			id: i - 1
		});
	}
	return data;
}

export function handleDownload(
	workbook: WorkBook | null,
	groupOfMembers: number[][],
	disableGenerateControlSheet: boolean = false
) {
	if (!workbook) return;
	const out_wb = utils.book_new();
	utils.book_append_sheet(out_wb, workbook.Sheets['database'], 'database');

	createGroupAssignSheet(out_wb, groupOfMembers.length, groupOfMembers[0].length);
	utils.sheet_add_aoa(out_wb.Sheets[GROUP_ASSIGN_SHEET_NAME], groupOfMembers, {
		origin: 'B2'
	});

	// if (!disableGenerateControlSheet) {
	// 	createControlSheet(out_wb, groupOfMembers.length, groupOfMembers[0].length);
	// }

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

function createControlSheet(workbook: WorkBook, member: number, day: number) {
	const control = [];
	const max_col_member = utils.encode_col(3 + day);
	for (let i = 1, row = 2; i <= member; i++) {
		for (let j = 1; j <= member; j++, row++) {
			control.push([
				{
					t: 'n',
					f: `=COUNTIF(D${row}:${utils.encode_col(2 + day)}${row},"TRUE")`
				},
				{ t: 'n', f: `=database!A${i + 1}` },
				{ t: 'n', f: `=database!A${j + 1}` },
				...Array.from({ length: day }, (_, i) => ({
					t: 'n',
					f: `=EXACT(VLOOKUP($B${row},group_assign!$A$2:$${max_col_member}${member + 1}, ${
						5 + i
					}, 0),VLOOKUP($C${row},group_assign!$A$2:$${max_col_member}${member + 1}, ${5 + i}, 0))`
				}))
			]);
		}
	}
	utils.book_append_sheet(workbook, utils.aoa_to_sheet(control), CONTROL_SHEET_NAME);
}

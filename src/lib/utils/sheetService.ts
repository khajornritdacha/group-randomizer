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
			gender: workbook.Sheets[sheetName][`B${i}`].v,
			faculty: workbook.Sheets[sheetName][`C${i}`].v,
			field: workbook.Sheets[sheetName][`D${i}`].v,
			year: workbook.Sheets[sheetName][`E${i}`].v,
			section: workbook.Sheets[sheetName][`F${i}`].v,
			baan: workbook.Sheets[sheetName][`G${i}`].v,
			status: workbook.Sheets[sheetName][`H${i}`].v,
			id: i - 1
		});
	}
	return data;
}

export function loadForbiddenPairs(workbook: WorkBook) {
	const sheetName = 'forbidden_pairs';
	const data: string[][] = [];
	for (let i = 1; ; i++) {
		if (!workbook.Sheets[sheetName][`A${i}`]) break;
		const row = String(workbook.Sheets[sheetName][`A${i}`].v).split(',');
		for (let j = 0; j < row.length; j++) {
			for (let k = j + 1; k < row.length; k++) {
				data.push([row[j].trim(), row[k].trim()]);
			}
		}
	}
	console.log({ forbidden_pairs: data });
	return data;
}

export function loadResult(workbook: WorkBook) {
	const sheetName = 'group_assign';
	const sheetNameData = 'database';

	let DAY = 0,
		TOTAL_GROUP = 0,
		LEN = 0;
	const members: Person[] = [];
	for (let i = 2; ; i++) {
		if (!workbook.Sheets[sheetNameData][`A${i}`]) break;

		LEN++;
		members.push({
			name: workbook.Sheets[sheetNameData][`A${i}`].v,
			gender: workbook.Sheets[sheetNameData][`B${i}`].v,
			faculty: workbook.Sheets[sheetNameData][`C${i}`].v,
			field: workbook.Sheets[sheetNameData][`D${i}`].v,
			year: workbook.Sheets[sheetNameData][`E${i}`].v,
			section: workbook.Sheets[sheetNameData][`F${i}`].v,
			baan: workbook.Sheets[sheetNameData][`G${i}`].v,
			status: workbook.Sheets[sheetNameData][`H${i}`].v,
			id: i - 1
		});
		for (let j = 2, startAlpha = 66; ; j++, startAlpha++) {
			const alpha = String.fromCharCode(startAlpha);
			if (!workbook.Sheets[sheetName][`${alpha}${i}`]) break;

			if (i == 2) DAY++;
			if (workbook.Sheets[sheetName][`${alpha}${i}`].v === 0) continue;

			TOTAL_GROUP = Math.max(TOTAL_GROUP, Number(workbook.Sheets[sheetName][`${alpha}${i}`].v));
		}
	}

	const groups = Array.from({ length: DAY }, () =>
		Array.from({ length: TOTAL_GROUP }, () => [])
	) as Person[][][];

	const groupOfMembers = Array.from({ length: LEN }, () => Array.from({ length: DAY }, () => -1));

	for (let i = 0; i < LEN; i++) {
		for (let j = 0; j < DAY; j++) {
			const alpha = String.fromCharCode(66 + j);
			groupOfMembers[i][j] = workbook.Sheets[sheetName][`${alpha}${i + 2}`].v;

			if (workbook.Sheets[sheetName][`${alpha}${i + 2}`].v === 0) continue;

			groups[j][groupOfMembers[i][j] - 1].push(members[i]);
		}
	}

	return {
		data: members,
		groups: groups,
		groupOfMembers: groupOfMembers,
		forbiddenPairs: loadForbiddenPairs(workbook)
	};
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

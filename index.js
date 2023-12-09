import * as xlsx from "./xlsx.mjs";

const GROUP = 13;
const DAY = 6;
let member = 0;
const ROUND = 3;
let MAX_GROUP_SIZE = 0;
// TODO: change this number
const SAMPLE_ROUND = 10000;
const data = [];
const COMPARE_MODE = Object.freeze({
  EXACT: "exact",
  EXACT_SOME: "exact_some",
});
const COMPARE_OBJ = [
  {
    mode: COMPARE_MODE.EXACT,
    attr: "roles",
    weight: 0.3,
  },
  {
    mode: COMPARE_MODE.EXACT,
    attr: "baan",
    weight: 0.2,
  },
  {
    mode: COMPARE_MODE.EXACT_SOME,
    attr: "ex_camp",
    weight: 0.5,
    value: [1],
  },
];

async function processForm() {
  const file_form = document.getElementById("input-file");
  if (!file_form.files.length) {
    console.warn("No file selected");
    return false;
  }

  const file = file_form.files[0];
  const raw_sheet = await file.arrayBuffer();
  /* raw_sheet is an ArrayBuffer */
  const workbook = xlsx.read(raw_sheet);

  // Extract member data
  // id start from 1
  for (let i = 2; ; i++) {
    if (!workbook.Sheets["database"][`A${i}`]) break;
    data.push({
      names: workbook.Sheets["database"][`A${i}`].v,
      roles: workbook.Sheets["database"][`D${i}`].v,
      baan: workbook.Sheets["database"][`E${i}`].v,
      ex_camp: workbook.Sheets["database"][`F${i}`].v,
      id: i - 1,
      leader_round: workbook.Sheets["database"][`J${i}`]?.v,
    });
    member++;
  }
  MAX_GROUP_SIZE = Math.ceil(member / GROUP);

  // Insert database sheet
  const out_wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(out_wb, workbook.Sheets["database"], "database");

  const { groups, group_for_member, group_leaders } = random_group(COMPARE_OBJ);
  create_group_assign_sheet(out_wb);
  insert_group_to_wb(out_wb, group_for_member);

  create_group_leader_sheet(out_wb);
  insert_group_leader_to_wb(out_wb, group_leaders);

  const is_generate_control_sheet = false;
  if (is_generate_control_sheet && !("control" in workbook.Sheets)) {
    modify_control_sheet(workbook);
  }

  xlsx.writeFile(out_wb, "output.xlsx");
}

function reset() {
  data.length = 0;
  member = 0;
}

/**
 * Create new xlsx worksheet for group assign
 * @param {xlsx.WorkBook} wb
 */
function create_group_assign_sheet(wb) {
  const group_assign = [
    [
      "ชื่อ",
      "โครง",
      "บ้าน",
      "เป็นชาวค่ายเก่า",
      ...Array.from({ length: DAY }, (_, i) => `วันที่ ${i + 1}`),
    ],
  ];
  for (let i = 1; i <= member; i++) {
    group_assign.push([
      { t: "n", f: `=database!A${i + 1}` },
      {
        t: "n",
        f: `=VLOOKUP(A${i + 1},database!$A$2:$I${member + 1}, 4, 0)`,
      },
      {
        t: "n",
        f: `=VLOOKUP(A${i + 1},database!$A$2:$I${member + 1}, 5, 0)`,
      },
      {
        t: "n",
        f: `=2-VLOOKUP(A${i + 1},database!$A$2:$I${member + 1}, 6, 0)`,
      },
    ]);
  }
  xlsx.utils.book_append_sheet(
    wb,
    xlsx.utils.aoa_to_sheet(group_assign),
    "group_assign"
  );
}

/**
 * Assign group leader
 * @param {xlsx.WorkBook} wb
 */
function create_group_leader_sheet(wb) {
  const group_leader = [
    ["group/day", ...Array.from({ length: DAY }, (_, i) => `วันที่ ${i + 1}`)],
  ];
  for (let i = 1; i <= GROUP; i++) {
    group_leader.push([i]);
  }
  xlsx.utils.book_append_sheet(
    wb,
    xlsx.utils.aoa_to_sheet(group_leader),
    "group_leader"
  );
}

/**
 * Random best possible group
 * @param {Object[]} compare_obj Array of compare object with mode and attr and (optional) value
 * @returns {{groups: number[][], group_leaders: string[][], err: number}}
 */
function random_group(compare_obj = []) {
  const samples = [];
  for (let i = 0; i < SAMPLE_ROUND; i++) {
    const { groups, group_for_member, group_leaders } = sample_group();
    if (!validate_group(groups)) continue;
    const err = calculate_combination_error(groups, compare_obj);
    if (err === -1) continue;
    samples.push({ groups, group_for_member, group_leaders, err });
  }
  const min_err = Math.min(...samples.map((s) => s.err));
  const idx = samples.findIndex((s) => s.err === min_err);
  if (idx === -1) {
    console.warn("No valid group");
    return [];
  } else {
    console.log(`Minimum error of group: ${min_err}`);
  }
  return samples[idx];
}

/**
 * Generate random group and return 3 values
 * 1. Group indexes by group number
 * 2. Group indexes by member number
 * 3. Group leaders by group number
 * @returns {{groups: Object[][], group_for_member: number[][], group_leaders: string[][]}}
 */
function sample_group() {
  const { groups, group_for_member, group_leaders } = sample_by_group_leader();
  return {
    groups,
    group_for_member,
    group_leaders,
  };
}

function generate_blank_group() {
  const group_for_member = Array.from({ length: member }, (_, i) => []);
  shuffle(data);
  const group_leaders = Array.from({ length: GROUP }, (_, i) =>
    Array.from({ length: DAY }, (_, i) => "")
  );
  const groups = Array.from({ length: GROUP }, (_, i) =>
    Array.from({ length: DAY }, (_, i) => [])
  );
  return {
    groups,
    group_for_member,
    group_leaders,
  };
}

/**
 * Sample groups distribution by ex_camp and baan (This will not properly assign group leader)
 * @returns {{groups: Object[][], group_for_member: number[][], group_leaders: string[][]}}
 */
function sample_by_baan() {
  const { group_for_member, group_leaders, groups } = generate_blank_group();
  // group people by ex-camp then baan
  const cat = {};
  data.forEach((d, i) => {
    if (!(d.ex_camp in cat)) {
      cat[d.ex_camp] = {};
    }
    if (!(d.baan in cat[d.ex_camp])) {
      cat[d.ex_camp][d.baan] = [];
    }
    console.log(d);
    cat[d.ex_camp][d.baan].push(d);
  });
  // shuffle each group
  Object.keys(cat).forEach((ex_camp) => {
    Object.keys(cat[ex_camp]).forEach((baan) => {
      shuffle(cat[ex_camp][baan]);
    });
  });

  // assign group
  let g = 0;
  let ith_person = 0;
  for (let ex_camp in cat) {
    for (let baan in cat[ex_camp]) {
      for (let person of cat[ex_camp][baan]) {
        for (let d = 0; d < DAY; d++) {
          const group_id = calculate_group_id(g, ith_person, d);
          const is_group_leader = ith_person === 0;
          groups[group_id - 1][d].push({
            ...person,
            is_group_leader,
          });
          group_for_member[person.id - 1].push(group_id);
          if (is_group_leader) group_leaders[group_id - 1][d] = person.names;
        }
        g++;
        if (g === GROUP) {
          g = 0;
          ith_person++;
        }
      }
    }
  }

  return {
    groups,
    group_for_member,
    group_leaders,
  };
}

/**
 * Sample group by fixing group leader
 * @param {Object[][]} cat
 * @param {Object[][][]} groups
 * @param {Object[][]} group_for_member
 * @param {string[][]} group_leaders
 * @returns
 */

function sample_by_group_leader() {
  const { group_for_member, group_leaders, groups } = generate_blank_group();
  const cat = Array.from({ length: ROUND + 1 }, (_, i) => []);
  data.forEach((d, i) => {
    const leader_round = d.leader_round;
    if (!leader_round) cat[ROUND].push(d);
    else cat[leader_round - 1].push(d);
  });
  for (let g = 0; g < GROUP; g++) {
    for (let r = 0; r < ROUND; r++) {
      for (let d = 0; d < DAY; d++) {
        const group_id = calculate_group_id(g, r, d);
        let is_group_leader = false;
        if (
          cat[r][g].leader_round &&
          Math.floor(d / 2) === cat[r][g].leader_round - 1
        ) {
          if (group_leaders[group_id - 1][d]) console.warn("Duplicate leader");
          group_leaders[group_id - 1][d] = cat[r][g].names;
          is_group_leader = true;
        }
        groups[group_id - 1][d].push({ ...cat[r][g], is_group_leader });
        group_for_member[cat[r][g].id - 1].push(group_id);
      }
    }
    if (g < cat[ROUND].length) {
      for (let d = 0; d < DAY; d++) {
        const group_id = calculate_group_id(g, ROUND, d);
        groups[group_id - 1][d].push(cat[ROUND][g]);
        group_for_member[cat[ROUND][g].id - 1].push(group_id);
      }
    }
  }
  return {
    groups,
    group_for_member,
    group_leaders,
  };
}

/**
 * Calculate error score for group combination by squaring the error for each group and each day
 * @param {Object[][][]} groups group combination
 * @param {Object[]} compare_obj Array of compare object with mode and attr and (optional) value
 * @return {number} error score
 */
function calculate_combination_error(groups, compare_obj) {
  let total_error = 0;
  for (let d = 0; d < DAY; d++) {
    let error_for_day = 0;
    for (let g = 0; g < GROUP; g++) {
      const error_for_group = calculate_group_error(groups[g][d], compare_obj);
      error_for_day += error_for_group;
    }
    total_error += error_for_day;
  }
  const R = total_error;
  return R;
}

/**
 * Calculate error score for a group
 * @param {Object[]} groups
 * @param {Object[]} compare_obj Array of compare object with mode and attr and (optional) value
 * @return {number} error score
 */
function calculate_group_error(groups, compare_obj) {
  let total_error = 0;
  const MAX_DUP_CNT = 2;
  compare_obj.forEach((cmp) => {
    let dup_cnt = 0;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (!validate_attr(groups[i], groups[j], cmp.attr)) continue;
        const raw_error = calculate_error(groups[i], groups[j], cmp);
        dup_cnt += raw_error;
      }
    }
    if (dup_cnt > MAX_DUP_CNT) total_error += 1;
  });
  return total_error;
}

/**
 * Validate attribute in members m1 and m2, return true if valid
 * @param{Object} m1
 * @param{Object} m2
 * @param{string} attr
 * @return{boolean}
 */
function validate_attr(m1, m2, attr) {
  if (!(attr in m1)) {
    console.warn(`Attribute ${attr} not found in member ${m1}`);
    return false;
  }
  if (!(attr in m2)) {
    console.warn(`Attribute ${attr} not found in member ${m1}`);
    return false;
  }
  return true;
}

/**
 * Calculate error for a pair of member a and b
 * @param{Object} m1
 * @param{Object} m2
 * @param{Object} cmp Compare object with mode and attr and (optional) value
 * @return{number} error score
 */
function calculate_error(m1, m2, cmp) {
  let error = 0;
  switch (cmp.mode) {
    case COMPARE_MODE.EXACT:
      if (m1[cmp.attr] === m2[cmp.attr]) error++;
      break;
    case COMPARE_MODE.EXACT_SOME:
      if (m1[cmp.attr] === m2[cmp.attr] && cmp.value.includes(m1[cmp.attr]))
        error++;
      break;
    default:
      console.warn(`Compare mode ${mode} not found`);
      break;
  }
  return error;
}

/**
 * Returns true if group is valid
 * @param {Object[][]} groups
 * @returns {boolean}
 */
function validate_group(groups, options = {}) {
  for (let g = 0; g < GROUP; g++) {
    for (let d = 0; d < DAY; d++) {
      const group = groups[g][d];
      // check group size
      if (Math.abs(MAX_GROUP_SIZE - group.length) > 1) {
        console.warn(
          `Group size not valid: expected ${MAX_GROUP_SIZE} +- 1, but found ${group.length}`,
          group
        );
        return false;
      }

      // check group leader
      const group_leader = group.filter((m) => m.is_group_leader);
      if (options?.check_group_leader && group_leader.length !== 1) {
        console.warn(`Group leader not valid: ${group_leader.length}`, group);
        return false;
      }
    }
  }
  return true;
}

/**
 * Calculate group id
 * @param {number} g
 * @param {number} r
 * @param {number} d
 * @returns {number}
 */
function calculate_group_id(g, r, d) {
  if (r === 0) r = MAX_GROUP_SIZE;
  return ((g + r * d) % GROUP) + 1;
}

/**
 * Shuffle array
 * @param {any[]} array
 * @returns {any[]}
 */
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

/**
 * Assign group to group assign sheet
 * @param {xlsx.WorkBook} wb
 */
function insert_group_to_wb(wb, groups) {
  xlsx.utils.sheet_add_aoa(wb.Sheets["group_assign"], groups, {
    origin: "E2",
  });
}

/**
 * Assign group leader to group leader sheet
 * @param {xlsx.WorkBook} wb
 * @param {string[][]} group_leaders
 */
function insert_group_leader_to_wb(wb, group_leaders) {
  xlsx.utils.sheet_add_aoa(wb.Sheets["group_leader"], group_leaders, {
    origin: "B2",
  });
}

function modify_control_sheet(wb) {
  const control = [];
  const max_col_member = xlsx.utils.encode_col(3 + DAY);
  for (let i = 1, row = 2; i <= member; i++) {
    for (let j = 1; j <= member; j++, row++) {
      control.push([
        {
          t: "n",
          f: `=COUNTIF(D${row}:${xlsx.utils.encode_col(2 + DAY)}${row},"TRUE")`,
        },
        { t: "n", f: `=database!A${i + 1}` },
        { t: "n", f: `=database!A${j + 1}` },
        ...Array.from({ length: DAY }, (_, i) => ({
          t: "n",
          f: `=EXACT(VLOOKUP($B${row},group_assign!$A$2:$${max_col_member}${
            member + 1
          }, ${
            5 + i
          }, 0),VLOOKUP($C${row},group_assign!$A$2:$${max_col_member}${
            member + 1
          }, ${5 + i}, 0))`,
        })),
      ]);
    }
  }
  xlsx.utils.sheet_add_aoa(wb.Sheets["control"], control, {
    origin: "A2",
  });
}

const randomBtn = document.getElementById("random-btn");
randomBtn.addEventListener("click", () => {
  processForm();
  reset();
});

// import { read, writeFileXLSX } from "xlsx";

/* load the codepage support library for extended support with older formats  */
// import { set_cptable } from "xlsx";
// import * as cptable from "xlsx/dist/cpexcel.full.mjs";
// set_cptable(cptable);

import xlsx from "./node_modules/xlsx/xlsx.js";
// const xlsx = require("xlsx");

// xlsx.readFile("test.xlsx");

console.log("Hello World");
function processForm(e) {
  console.log("submit");
  if (e.preventDefault) e.preventDefault();
  const test = document.createElement("h1");
  test.innerText = "Johhny";
  document.body.appendChild(test);
  console.log("processForm");
  return false;
}

const form = document.getElementById("file-form");
if (form.attachEvent) {
  form.AttachEvent("submit", processForm);
} else {
  form.addEventListener("submit", processForm);
}

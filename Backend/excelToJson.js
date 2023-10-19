const XLSX = require('xlsx');
const fs = require('fs');

// Load Excel file
const workbook = XLSX.readFile('LNL_QoR_Summary daily tracking WW24p7.xlsx');

// Choose the sheet you want to convert to JSON
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert sheet to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Write JSON data to a file
fs.writeFileSync('output2.json', JSON.stringify(jsonData, null, 2));

console.log('Excel converted to JSON and saved as output.json');

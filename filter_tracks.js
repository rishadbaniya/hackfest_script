const fs = require("fs");

const tracks_to_filer = ["ML/AI", "Blockchain"];
const path_to_qualified_csv = "/output/Qualified.csv";
const CSV_FIELDS = require("./constants/csv_field");

(() => {
  try {
    const data = fs.readFileSync(__dirname + path_to_qualified_csv);
  } catch {
    console.log("File not found!");
    return;
  }
})();

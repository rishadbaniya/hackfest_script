const csv_lib = require("csvtojson-converter");
const path = require("path");
const fs = require("fs");

module.exports = (csvFilePath) => {
  const delimiter = ",";
  const INPUT_CSV_DATA = fs.readFileSync(csvFilePath, {
    encoding: "utf-8",
    flag: "r",
  });
  let GLOBAL_JSON = csv_lib.csvToJson(INPUT_CSV_DATA, delimiter);
  return GLOBAL_JSON;
};

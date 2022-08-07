// This is the first script to be run, it simply makes sure that there are no mulitple team members of the same team
// i.e only one person will represent the whole team
//
// If there is no team of any person i.e the "Team Name" field is "N/A", then we'll let them go in this script
//
// We'll assume the team name won't be duplicated i.e there won't be a case that two teams will have same name

// Usage : node script_0.js first_raw.csv
// Where first_raw.csv is the first CSV that is downloaded from the Devfolio
// TODO : Merge with the final script to make a standalone script
const fs = require('fs');
const csv_lib = require('csvtojson-converter');
const json_to_csv = require('json2csv');

let args = process.argv;
args.splice(0, 2);

const TEAM_NAME = "Team Name";

let csv_path = args[0];

const csv_data = fs.readFileSync(csv_path, { encoding:'utf8', flag:'r'}); 
const delimiter = ',';

let JSON = csv_lib.csvToJson(csv_data, delimiter);

let NEW_JSON = [];
let TEAMS_INSERTED = [];

JSON.forEach((d)=> {
    if(!TEAMS_INSERTED.includes(d[TEAM_NAME]) || d[TEAM_NAME] === "N/A"){
        TEAMS_INSERTED.push(d[TEAM_NAME])
        NEW_JSON.push(d);
    }
})

const OUTPUT_DIRECTORY = __dirname + "/output";

if(!fs.existsSync(OUTPUT_DIRECTORY)){
    fs.mkdirSync(OUTPUT_DIRECTORY);
}

const NEW_CSV = json_to_csv.parse(NEW_JSON);
const OUTPUT_SINGLE_TEAM_NAME_CSV_PATH = __dirname + "/output/single_team_name.csv";
fs.writeFileSync(OUTPUT_SINGLE_TEAM_NAME_CSV_PATH, NEW_CSV);

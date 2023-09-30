// FOR THIS TO WORK, THE USER MUST INSTALL "git" in their system

// The hackathon participants could be using different version control sites, such as github, gitlab or bitbucket. The sites are dynamic as well, in order to scrape out the data one would have to
// make multiple http request and even spend the time to scrape that specific version control dynamic site, so it's sort of difficult.
// to scrape all these sites. The easies way out of this is to make use of something that all go down in common as, i.e a local git rep
//
// So, the only way to figure out the oldest commit would be to use the local git command to get the clone and then see the oldest
// commit through it

// This script must run!!
// Errors that can lead in this script and should be handled are :
//
// 1. No internet
// 2. Wrong repository link

// Usage : node index.js path_to_csv.csv
// It's gonna take it's time and list you out the candidates who are to be disqualified

const childProcess = require("child_process");
const process = require("process");
const fs = require("fs");
const csv_lib = require("csvtojson-converter");
const json_to_csv = require("json2csv");
const path = require("path");
const CSV_FIELDS = require("./constants/csv_field");
const readCSVintoJSON = require("./utils/readCSVintoJSON");

// Important : The month field of the Date starts from 0
// Any commit before HACKATHON_START_DATE and after HACKATHON_END_DATE would be considered disqualified
// Unix Epoch time of starting Hackathon Date and Ending Hackathon Date
let HACKATHON_START_DATE = new Date(1995, 10, 29, 11, 0, 0).getTime() / 1000;
let HACKATHON_END_DATE = new Date(2023, 11, 1, 9, 0, 0).getTime() / 1000;

let PARAMS = {
  maxBuffer: 10000 * 10000, // Max Buffer size for stdout
  timeout: 480 * 1000, // Max timeout of 8 minutes per repo
  stdio: [0, "ignore", "ignore"],
  shell: "sh",
};

let args = process.argv;
args.splice(0, 2);

// Qualified has 3 values :
// "Unresolved" => Haven't checked if the team qualifies or no idea
// "Qualified" => Checked if the team qualifies and it's yes
// "Not Qualified" => Checked if the team qualifies and it's no
let GLOBAL_JSON = readCSVintoJSON(path.join(__dirname, args[0]));
let DOUBLE_QUOTE_REMOVED_FROM_HEADING_JSON = [];

GLOBAL_JSON.forEach((d) => {
  let newObj = {};
  for (let i in d) {
    let oldKey = i;
    let newKey = i.replaceAll('"', "");
    newObj[newKey] = d[oldKey];
  }
  DOUBLE_QUOTE_REMOVED_FROM_HEADING_JSON.push(newObj);
});
GLOBAL_JSON = DOUBLE_QUOTE_REMOVED_FROM_HEADING_JSON;

// At this point csv is converted into json, now we have to check if the they have submitted the github url or not.

GLOBAL_JSON.forEach((d) => {
  // originalString.replace(new RegExp(wordToRemove, "g"), "");
  // console.log(d[CSV_FIELDS.TEAM_NAME]);
  d[CSV_FIELDS.TRACKS] = d[CSV_FIELDS.TRACKS].replace(" and", "");
  console.log(d[CSV_FIELDS.TRACKS]);
});

// console.log(GLOBAL_JSON);

let NO_OF_TEAMS = GLOBAL_JSON.length;
let NO_OF_RESOLVED = 0;

GLOBAL_JSON.forEach((data, i) => {
  if (
    data[CSV_FIELDS.QUALIFIED_OR_NOT] === "Qualified" ||
    data[CSV_FIELDS.QUALIFIED_OR_NOT] === "Disqualified"
  ) {
  } else {
    GLOBAL_JSON[i][CSV_FIELDS.QUALIFIED_OR_NOT] = "Unresolved";
  }

  if (
    data[CSV_FIELDS.SUBMISSION_URL] === null ||
    data[CSV_FIELDS.TEAM_NAME] === "N/A"
  ) {
    data[CSV_FIELDS.QUALIFIED_OR_NOT] = "Disqualified";
  }
});

// console.log(GLOBAL_JSON);

try {
  childProcess.execSync("yes | rm -r AxBxCxDxExFxGxYx", {
    stdin: [0, "ignore", "ignore"],
    shell: "sh",
  });
} catch (_) {}

const checkAllData = () => {
  GLOBAL_JSON.forEach((data, index) => {
    if (data[CSV_FIELDS.QUALIFIED_OR_NOT] == "Unresolved") {
      console.log(`Checking ${index + 1} of ${NO_OF_TEAMS}......`);
      try {
        // Naming the repository something complex, so that it doesn't cause
        // name conflict and cause issues while cloning
        let command = `git clone ${
          data[CSV_FIELDS.SUBMISSION_URL]
        } AxBxCxDxExFxGxYx`;
        console.log(data[CSV_FIELDS.SUBMISSION_URL]);
        childProcess.execSync(command, PARAMS);

        // Reverse the log from the oldest and in YYYY-MM-DD format
        let old_commit_history = childProcess.execSync(
          'git log --reverse --format="%at"',
          {
            encoding: "UTF-8",
            cwd: "./AxBxCxDxExFxGxYx",
            stdin: [0, "ignore", "ignore"],
            shell: "sh",
          }
        );

        let latest_commit_history = childProcess.execSync(
          'git log --format="%at"',
          {
            encoding: "UTF-8",
            cwd: "./AxBxCxDxExFxGxYx",
            stdin: [0, "ignore", "ignore"],
            shell: "sh",
          }
        );
        // TODO : Handle issues when the Repository is empty
        // Only gets the first commit of the reverse i.e the oldest commit
        const OLDEST_COMMIT_DATE = parseInt(old_commit_history.slice(0, 10));
        const LATEST_COMMIT_DATE = parseInt(latest_commit_history.slice());

        if (
          OLDEST_COMMIT_DATE <= HACKATHON_START_DATE ||
          LATEST_COMMIT_DATE >= HACKATHON_END_DATE
        ) {
          console.log("NOT QUALIFIED");
          GLOBAL_JSON[index][CSV_FIELDS.QUALIFIED_OR_NOT] = "Disqualified";
        } else {
          console.log("QUALIFIED");
          GLOBAL_JSON[index][CSV_FIELDS.QUALIFIED_OR_NOT] = "Qualified";
        }

        // TODO : Make sure yes | rm -r AxBxCxDxExFxGxYx works on Windows default shell for execSync as well, coz this was only tested for "sh" shell,
        // which is the default shell for execSync in linux
        //
        // Remove the local repository created and make space for another repo
        try {
          childProcess.execSync("yes | rm -r AxBxCxDxExFxGxYx/", {
            stdin: [0, "ignore", "ignore"],
            shell: "sh",
          });
        } catch (_) {}
        NO_OF_RESOLVED += 1;
      } catch (e) {
        // Delete the directory AxBxCxDxExFxGxYx if it's there because it's going to create conflicts
        try {
          childProcess.execSync("yes | rm -r AxBxCxDxExFxGxYx/", {
            stdin: [0, "ignore", "ignore"],
            shell: "sh",
          });
        } catch (_) {}
      }
    }
  });
};

// Delete the directory AxBxCxDxExFxGxYx if it's there because it's going to create conflicts

const MAX_ITERATIONS = 1;
let NO_OF_ITERATIONS = 0;

// Algorithm :

// 1. It's going to check if the team is qualified or not first
// 2. If they are neither qualified nor disqualified then they are at "Unresolved", which means "Hey I havent checked if the team is qualified or not"
// or "Hey I couldnt figure out the team is qualified or not, which could be either due to wrong repository link or empty repository link"
const containsAnyUnResolved = () => {
  let NO_OF_QUALIFIED_TEAMS = 0;
  let NO_OF_DISQUALIFIED_TEAMS = 0;
  let NO_OF_UNRESOLVED_TEAMS = 0;

  GLOBAL_JSON.forEach((data, index) => {
    if (data[CSV_FIELDS.QUALIFIED_OR_NOT] == "Qualified") {
      NO_OF_QUALIFIED_TEAMS++;
    } else if (data[CSV_FIELDS.QUALIFIED_OR_NOT] == "Disqualified") {
      NO_OF_DISQUALIFIED_TEAMS++;
    } else {
      NO_OF_UNRESOLVED_TEAMS++;
    }
  });

  console.log(`No Of Qualified Teams : ${NO_OF_QUALIFIED_TEAMS}`);
  console.log(`No Of Disqualified Teams : ${NO_OF_DISQUALIFIED_TEAMS}`);
  console.log(`No Of Unresolved Teams : ${NO_OF_UNRESOLVED_TEAMS}`);

  return NO_OF_UNRESOLVED_TEAMS > 0 ? true : false;
};

// Checks until the "Unresolved" fields appear as "Qualified" or "Not Qualified"
// for upto MAX_ITERATIONS
while (NO_OF_ITERATIONS <= MAX_ITERATIONS) {
  console.log(`ITERATION : ${NO_OF_ITERATIONS} of ${MAX_ITERATIONS}`);
  console.log(
    "-------------------------------------------------------------------------------------"
  );
  if (containsAnyUnResolved()) {
    checkAllData();
  }
  NO_OF_ITERATIONS++;
}

// Converting all Unresolved to Disqualified
GLOBAL_JSON = GLOBAL_JSON.map((d) => {
  if (d[CSV_FIELDS.QUALIFIED_OR_NOT] === "Unresolved") {
    d[CSV_FIELDS.QUALIFIED_OR_NOT] = "Disqualified";
  }
  return d;
});

let QUALIFIED_JSON = GLOBAL_JSON.filter((d) => {
  return d[CSV_FIELDS.QUALIFIED_OR_NOT] === "Qualified";
});

let DISQUALIFIED_JSON = GLOBAL_JSON.filter((d) => {
  return d[CSV_FIELDS.QUALIFIED_OR_NOT] === "Disqualified";
});

if (QUALIFIED_JSON.length != 0) {
  const QUALIFIED_CSV = json_to_csv.parse(QUALIFIED_JSON);
  const QUALIFIED_CSV_PATH = __dirname + "/output/Qualified.csv";
  fs.writeFileSync(QUALIFIED_CSV_PATH, QUALIFIED_CSV);
}

if (DISQUALIFIED_JSON.length != 0) {
  const DISQUALIFIED_CSV = json_to_csv.parse(DISQUALIFIED_JSON);
  const DISQUALIFIED_CSV_PATH = __dirname + "/output/Disqualified.csv";
  fs.writeFileSync(DISQUALIFIED_CSV_PATH, DISQUALIFIED_CSV);
}

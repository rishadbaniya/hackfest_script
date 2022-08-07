// This is the second script to be run, it's used to scrape out the githubURL of each team

const fs = require('fs');
const csv_lib = require('csvtojson-converter');
const json_to_csv = require('json2csv');
const request = require('request');

// TODO : Change it to Submission URL if the field changes in the future
const DEVFOLIO_URL = 'Submission URL';

const csv_path = __dirname + "/output/single_team_name.csv";
const csv_data = fs.readFileSync(csv_path, { encoding:'utf8', flag:'r'}); 
const delimiter = ',';

let args = process.argv;
args.splice(0, 2);

const split =  (str, index) => {
  const result = [str.slice(0, index), str.slice(index)];
  return result;
}

// URL of the devfolioi, url from where we'll extract the github URL
// noOfTries, it's the no of tries that was performed initially, which is 0 
// On error(Only error is network error), it will try to retrieve data for 10 times, even then if it fails then
// it's gonna consider it as "Not Submitted"
const grabGithubURL = (devfolioURL, noOfTries) => {
  return new Promise((resolve, reject) => {
    let options = {
      url : devfolioURL,
      timeout : 10000 // 10 seconds
    }
    request(options, (err, res, body) => {
      // Github URL regex
      if(!err && res.statusCode === 200){
          let firstSplitPoint = body.search("https://github.com");
          let [_, splitted] = split(body, firstSplitPoint);
          let secondSplitPoint = splitted.search('" target=');
          let [githubUrl, __ ] = split(splitted, secondSplitPoint);
          resolve(githubUrl);
      }else{
        if(noOfTries > 9){
            return reject();
        }else{
          let newNoOfTries = noOfTries + 1;
          return grabGithubURL(devfolioURL, newNoOfTries).then((url) => {
              resolve(url);
          }).catch(() => {
              resolve("Not Submitted");
          });
        }
      }
    });
  });
}

let JSON = csv_lib.csvToJson(csv_data, delimiter);
let DOUBLE_QUOTE_REMOVED_FROM_HEADING_JSON = [];
JSON.forEach((d)=>{
    let newObj = {};
    for(let i in d){
      let oldKey = i;
      let newKey = i.replaceAll('"', "");
      newObj[newKey] = d[oldKey];
    }
    DOUBLE_QUOTE_REMOVED_FROM_HEADING_JSON.push(newObj);
});
JSON = DOUBLE_QUOTE_REMOVED_FROM_HEADING_JSON;

let allSubmissionURL__promises = [];

let NEW_JSON = [];

const grabGithubURLPromise = (devfolioURL)=> {
  return new Promise((res, rej) => {
      grabGithubURL(devfolioURL, 0).then((d) => {
          console.log(d);
          res(d);
      }).catch((e) => {
          console.log(e);
          rej(e);
      });
  })
}

JSON.forEach((d)=> {
  allSubmissionURL__promises.push(grabGithubURLPromise(d[DEVFOLIO_URL]));
});

Promise.all(allSubmissionURL__promises).then((data_s)=>{    
  // Go through each promise that was resolved
  data_s.forEach((data, index) => {
      JSON[index]['GithubURL'] = data;
      NEW_JSON.push(JSON[index]);
  });
  
  NEW_JSON = NEW_JSON.map((d)=> {
    if (d['GithubURL'].length > 100){
        d['GithubURL'] = "Not Submitted";
    }
    return d;
  });
  let new_csv = json_to_csv.parse(NEW_JSON);

  const path = __dirname + "/output/github_url_extracted.csv";
  fs.writeFileSync(path, new_csv);
});

const QUALIFIED_SHEET_FIELDS = {
    TEAM_NAME : "Team Name",
    TRACKS : "Tracks",
    CATEGORY : "Category",
    GITHUB_URL : "Github Repository",
    SUBMISSION_URL : "Github Repository",
    QUALIFIED_OR_NOT : "Qualified Or Not" // It's a custom field
};

const JUDGES_SHEET_FIELD = {
    FULL_NAME : 'Full Name',
    EMAIL : "Email",
    EMAILED_URL : "EmailedURL",
    EMAILED_URL_SECOND_ROUND : "SecondRoundEmailedURL"
}

function containsDuplicates(array) {
  const result = array.some(element => {
    if (array.indexOf(element) !== array.lastIndexOf(element)) {
      return true;
    }
    return false;
  });
return result;
}

// Data Structure to store the Project Metadata
// Project ID is simply the index of the project in the google sheet (Index as in it starts from 1)
class Project{
    constructor(projectID, team_name){
        this.id = projectID;
        this.team_name = team_name;

        // Id of the Judges, the project was assigned to 
        this.judgesAssigned = [];
    }
}

// Data Structure to store the Judge Metadata
// Id of the judge is simply the index of the judge in the google sheet (Index as in it starts from 1)
class Judge{
    constructor(judgeID, email, full_name,emailedURL){
        this.id = judgeID;
        this.email = email;
        this.full_name = full_name;
        // Projects assigned to the judge
        this.projectsAssigned = [];
        // Extra Projects assigned to the judge
        this.extraProjectsAssigned = [];
        this.emailedURL = emailedURL;
    }
    allocProj(project){
      this.projectsAssigned.push(project)
    }
    hasProject(proj){
      if(this.projectsAssigned.filter((project)=> project.id === proj.id).length>0){
        return true;
      }
      return false;
    }
    
    // Finds out all the project id that was assigned to this Judge
    allTheProjectThatJudgeNeedsToWorkOn(){
        let projects = [];
        for(let i = 0; i < this.projectsAssigned.length; i++){
            projects.push(this.projectsAssigned[i].id);
        }
        projects.push(...(this.extraProjectsAssigned));
        this.allProjectsToWorkOn = projects;
    }
}

// Shuffles the array at O(n^2)
const arrayRandomizer = (array) => {

    let randomizedArray = [...array];
    if(array.length > 1) {
        for(i = 0; i < randomizedArray.length; i++){
            for(j = 0; j < randomizedArray.length; j++){
                let randomIndex = Math.floor(Math.random() * randomizedArray.length);
                while(randomIndex == j){
                    randomIndex = Math.floor(Math.random() * randomizedArray.length);
                }
    
                let temp = randomizedArray[randomIndex];
                randomizedArray[randomIndex] = randomizedArray[j];
                randomizedArray[j] = temp;
            }  
        }
    }

    return randomizedArray;
}


// Gives the JSON output of the given sheet
const getJSONData = (sheet) => {
  let row = sheet.getLastRow();
  let column = sheet.getLastColumn();

  let x = sheet.getRange(1,1);
  let data__JSON = [];
  let headers = [];

  for(i = 1;i <= column; i++){
    headers.push(sheet.getRange(1, i).getValue());
  }

  for(i = 2; i<= row;i++){
    let data = {};
    for(j = 1;j<=column;j++){
      data[headers[j - 1]] = sheet.getRange(i, j).getValue();
    }
    data__JSON.push(data);
  }
  return data__JSON;
}

// Pass on the sheet, it will resize the sheet to beautify it
const autoResizeSheet = (sheet) => {
  let row = sheet.getLastRow();
  let column = sheet.getLastColumn();

  for(let i = 1; i<= column ;i++){
    for(let j = 1; j <= row; j++){
        sheet.getRange(j, i).setWrap(true);
    }
  }

  sheet.setColumnWidths(1, sheet.getLastColumn(), 200);
  sheet.autoResizeRows(1, sheet.getLastRow());
}


// It's the first script to be run, it's going to divide each project to 3 judges atleast
// and give out to those judges
// Procedure :
// 1. Get the qualified teams sheet as the first sheet of the spreadsheet
// 2. Get the judges sheet as the second sheet of the spreadsheet
// 3. Run the Script
const script_0 = () => {
    let current_sheet = SpreadsheetApp.getActiveSpreadsheet();
    let allSheets = current_sheet.getSheets();

    // We're gonna assume that the list of Qualified Teams is the first index
    // Qualified Teams Sheet Object
    let qualified_teams_sheet = allSheets[0];  

    // Judges Teams Sheet Object  
    let judges_sheet = allSheets[1];  

    autoResizeSheet(qualified_teams_sheet);
    autoResizeSheet(judges_sheet);

    // JSON data fo the sheets
    let qualified_teams_sheet_JSON= getJSONData(qualified_teams_sheet);
    let judges_sheet_JSON = getJSONData(judges_sheet);

   let allProjects = [];
   let doubleProjects = [];
   let allJudges = [];

    for(let i = 0; i < qualified_teams_sheet_JSON.length; i++){
      let team_name = qualified_teams_sheet_JSON[i][QUALIFIED_SHEET_FIELDS.TEAM_NAME];
      allProjects.push(new Project(i + 1, team_name));
      doubleProjects.push(new Project(i + 1, team_name));
      doubleProjects.push(new Project(i + 1, team_name));
    }


    for(let i = 0; i < judges_sheet_JSON.length; i++){
      let judge_full_name = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.FULL_NAME]
      let judge_email = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.EMAIL];
      allJudges.push(new Judge(i + 1, judge_email,judge_full_name));
    }

    p2 = arrayRandomizer(doubleProjects);
  // NOBLE CODE
  let count = 0;
  const judges = allJudges;
  while (p2.length > 0){
    const proj = p2.pop();
    if(judges[count].hasProject(proj)){
        count = (count + 1)%judges.length;
    }
    count = judges[count].hasProject(proj) ? count++: count;
    count = count % judges.length;
    judges[count].allocProj(proj)
    count=(count + 1) % judges.length;
  }

  
  let NO_OF_PROJECTS = 0;
  for(let y in allJudges){
      let projectIndices = [];
      for(x = 0; x < allJudges[y].projectsAssigned.length ; x++){
          if (allJudges[y].projectsAssigned[x].judgesAssigned.length < 3){
              projectIndices.push(x);
          }
      }

    if(projectIndices.length != 0){
          NO_OF_PROJECTS++;
      }
  }


  // Figure out all the projects the judge has to work on
  for(let y in allJudges){
      allJudges[y].allTheProjectThatJudgeNeedsToWorkOn();
  } 

  // GIVING OUT PROJECTS TO EACH JUDGE ENDS HERE, NOW ONWARDS THE EMAILING SYSTEM WORKS HERE

  // EmailedURL field is not set in the Judges CSV, instead it's created automatically after sending each judge an email 
  judges_sheet.getRange(1,3).setValue("EmailedURL");

  let judges_sheet_rows = judges_sheet.getLastRow();
  let judges_sheet_columns = judges_sheet.getLastColumn();

  // Create a new Sheet for each judge and give him all the fields required to work on that field
  for(let y = 0; y < (judges_sheet_rows - 1); y++){
    //let judgeName = allJudges[parseInt(y)].full_name;
    //let judgeEmail = allJudges[parseInt(y)].email;
    let judgeName = judges_sheet.getRange(y + 2, 1).getValue();
    let judgeEmail = judges_sheet.getRange(y + 2 , 2).getValue();

    // IMP : Naming Convention of Each Judge Marks File
    let spreadSheetName = `JUDGE ${judgeName} Marks`;
    let spreadSheet = SpreadsheetApp.create(spreadSheetName);

    // Adds judge to the editor list, grants him access to edit the SpreadSheet
    spreadSheet.addEditor(judgeEmail);
    let url = spreadSheet.getUrl();

    let __sheet = spreadSheet.getSheets()[0];
    __sheet.getRange(1,1).setValue(QUALIFIED_SHEET_FIELDS.TEAM_NAME);
    __sheet.getRange(1,2).setValue(QUALIFIED_SHEET_FIELDS.SUBMISSION_URL);
    __sheet.getRange(1,3).setValue(QUALIFIED_SHEET_FIELDS.TRACKS);
    __sheet.getRange(1,4).setValue(QUALIFIED_SHEET_FIELDS.CATEGORY);
    __sheet.getRange(1,10).setValue("Total Marks");

    let index_of_sheet_judge_in_allJudge = null;
    for(let ___x = 0; ___x < (judges_sheet_rows - 1); ___x++){
        if(judgeName === allJudges[___x].full_name){
          index_of_sheet_judge_in_allJudge = ___x;
        }
    }

    for (let _y in allJudges[index_of_sheet_judge_in_allJudge].allProjectsToWorkOn){
      let team_name = qualified_teams_sheet_JSON[allJudges[parseInt(index_of_sheet_judge_in_allJudge)].allProjectsToWorkOn[parseInt(_y)] - 1][QUALIFIED_SHEET_FIELDS.TEAM_NAME];
      let submission_url = qualified_teams_sheet_JSON[allJudges[index_of_sheet_judge_in_allJudge].allProjectsToWorkOn[parseInt(_y)] - 1][QUALIFIED_SHEET_FIELDS.SUBMISSION_URL];
      let tracks = qualified_teams_sheet_JSON[allJudges[index_of_sheet_judge_in_allJudge].allProjectsToWorkOn[parseInt(_y)] - 1][QUALIFIED_SHEET_FIELDS.TRACKS];
      let category = qualified_teams_sheet_JSON[allJudges[index_of_sheet_judge_in_allJudge].allProjectsToWorkOn[parseInt(_y)] - 1][QUALIFIED_SHEET_FIELDS.CATEGORY];
      __sheet.getRange(2 + parseInt(_y), 1).setValue(team_name);
      __sheet.getRange(2 + parseInt(_y), 2).setValue(submission_url);
      __sheet.getRange(2 + parseInt(_y), 3).setValue(tracks);
      __sheet.getRange(2+parseInt(_y), 4).setValue(category)
      let totalCell = __sheet.getRange(2 + parseInt(_y), 10);
      totalCell.setFormula(`=SUM(D${2 + parseInt(_y)}:I${2 + parseInt(_y)})`);
  } 

    judges_sheet.getRange(2 + parseInt(y), 3).setValue(url);

    //Beautify JUDGE Marks Sheet and Judges Sheet
    // It's gonna absort a lot of time, so i need to figure out a way to get RangeList and use wrap as true
    autoResizeSheet(__sheet);
    autoResizeSheet(judges_sheet);

    // REMOVE COMMENT
    GmailApp.sendEmail(judgeEmail, "Marks to be filled", url);
  } 
}


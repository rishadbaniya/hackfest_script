const QUALIFIED_SHEET_FIELDS = {
    FIRST_NAME : "First Name",
    LAST_NAME : "Last Name",
    TSHIRT_SIZE : "T-shirt Size",
    GENDER : "Gender",
    COLLEGE : "College",
    EMAIL : "Email",
    TEAM_NAME : "Team Name",
    DEVFOLIO_PROFILE : "Devfolio Profile",
    SUBMISSION_URL : "Submission URL",
    TRACKS : "Project Tracks",
    WINNERS : "Winners",
    GITHUB_URL : "GithubURL",
    CUSTOM_QUESTIONS : "Custom Questions",
    FINAL_RELEVANCE_MARKS : "Final Relevance To Track Marks",
    FINAL_MARKS : "Final Marks",
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

const JUDGING_CRITERIA = {
  A : "Originality Of Idea (0-20)",
  B : "UI/UX (0-20)",
  C : "Code Quality/ Tech Implementation (0-20)",
  D : "Business Value/ Market Readiness (0-20)",
  E : "Project Description And Demo Video (0-20)",
  F : "Relevance To Track (0-20)"
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
    let judges_sheet_JSON= getJSONData(judges_sheet);
    
    let allProjects = [];
    let allJudges = [];

    for(let i = 0; i < qualified_teams_sheet_JSON.length; i++){
      let team_name = qualified_teams_sheet_JSON[i][QUALIFIED_SHEET_FIELDS.TEAM_NAME];
      allProjects.push(new Project(i + 1, team_name));
    }


    for(let i = 0; i < judges_sheet_JSON.length; i++){
      let judge_full_name = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.FULL_NAME]
      let judge_email = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.EMAIL];
      allJudges.push(new Judge(i + 1, judge_email,judge_full_name));
    }

    // Algorithm ;
    // It shufflest the array and then assigns to judges
    // Virtually, it means the judge was assigned each project randomly
    let shuffledAllProjects = arrayRandomizer(allProjects);


    // Assign each Project to a judge, if there are NO_OF_JUDGES not multiple of NO_OF_PROJECTS,
    // a judge will be randomly given an extra project to work on initially
    let __allJudges = [...allJudges];
    for(i = 0; i < shuffledAllProjects.length; i++){
        while(__allJudges.length === 0){
          __allJudges = [...allJudges]
        }

        let random_index = Math.floor(Math.random() * __allJudges.length);
      
        shuffledAllProjects[i].judgesAssigned.push(__allJudges[random_index].id);
        __allJudges.splice(random_index, 1);
    }

    // Assign each Project to a Judge, basically in the code above we 
    // stored each Judge id in a project, now we'll store each project's id that was assigned to the judge
    for(i = 0; i < shuffledAllProjects.length; i++){
        let judge_id = shuffledAllProjects[i].judgesAssigned[0];
        allJudges[judge_id - 1].projectsAssigned.push(shuffledAllProjects[i]);
    }   


    //--------------------ALL GOOD HERE_--------------------------
    for (let _x in allProjects){
      //Shuffle the judges array in each loop
      allJudges = arrayRandomizer(allJudges);

      // Sorting Judges from Highest to Lowest in terms of Extra Project, coz the judge with extra project will be selected for
      // distributing his project to other judges
      // From highest extra project to lowest extra project
      for (let x = 0; x < allJudges.length ; x++){
          for(let y = 0; y < allJudges.length - 1; y++){
              if(allJudges[y+1].extraProjectsAssigned.length > allJudges[y].extraProjectsAssigned.length){
                  let temp = allJudges[y];
                  allJudges[y] = allJudges[y + 1];
                  allJudges[y+1] = temp;
              }
          }
      } 

      // Select one of the project of the judge at the top of allJudges array randomly and assign it to the last two judges
      // List of all projects of the judge that is not distributed to other judge
      let projectIndices = [];
      for(x = 0; x < allJudges[0].projectsAssigned.length ; x++){
          if (allJudges[0].projectsAssigned[x].judgesAssigned.length < 3){
              projectIndices.push(x);
          }
      }

      projectIndices = arrayRandomizer(projectIndices);

      if(projectIndices.length != 0){
          allJudges[0].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 1].id);
          allJudges[0].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 2].id);

          allJudges[allJudges.length - 1].extraProjectsAssigned.push(allJudges[0].projectsAssigned[projectIndices[0]].id);
          allJudges[allJudges.length - 2].extraProjectsAssigned.push(allJudges[0].projectsAssigned[projectIndices[0]].id);
      }
  }

  // Cleanup
  for (let m = 0; m < (3 * allProjects.length) ; m++){

      //Shuffle the judges array in each loop
      allJudges = arrayRandomizer(allJudges);

      //Sorting from highest extra project to lowest extra project
      for (let x = 0; x < allJudges.length ; x++){
          for(let y = 0; y < allJudges.length - 1; y++){
              if(allJudges[y+1].extraProjectsAssigned.length > allJudges[y].extraProjectsAssigned.length){
                  let temp = allJudges[y];
                  allJudges[y] = allJudges[y + 1];
                  allJudges[y+1] = temp;
              }
          }
      }

      let judgeIndex = null;
      let projectIndices = [];

      for(let y = 0; y < allJudges.length; y++){
        for(x = 0; x < allJudges[y].projectsAssigned.length ; x++){
          if (allJudges[y].projectsAssigned[x].judgesAssigned.length < 3){
                projectIndices.push(x);
            }
          }

          if(projectIndices.length != 0){
              judgeIndex = y;
              console.log("the judge index is "+ judgeIndex);
              console.log(projectIndices);
              break;
          }
      }

      projectIndices = arrayRandomizer(projectIndices);

      if(judgeIndex != null){
          // Case - 1 
          // If the index of the Judge is the last index, then he/she should share it with the upper two
          if(judgeIndex === allJudges.length - 1) {
              if(projectIndices.length != 0){
                  allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex - 1].id);
                  allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex - 2].id);

                  allJudges[judgeIndex - 1].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
                  allJudges[judgeIndex - 2].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
              }
          // If the index of the judge is the second last index, then he/ she should share with the one below and one up
          }else if(judgeIndex === allJudges.length - 2){
              if(projectIndices.length != 0){
                  allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex + 1 ].id);
                  allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex - 1].id);

                  allJudges[judgeIndex + 1].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
                  allJudges[judgeIndex - 1].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
              }
          }else{
              allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 1].id);
              allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 2].id);

              allJudges[allJudges.length - 1].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
              allJudges[allJudges.length - 2].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
          }
      }
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

  console.log("No Of Projects that has less than 3 judge = " + NO_OF_PROJECTS);

 //   for(let xxx = 0; xxx < allJudges.length; xxx++){
  //   console.log(allJudges[xxx].projectsAssigned);
 //   }
 // Figure out all the projects the judge has to work on
  for(let y in allJudges){
      allJudges[y].allTheProjectThatJudgeNeedsToWorkOn();
     // console.log(containsDuplicates(allJudges[y].projectsAssigned));
  } 
 // --------------------------------------------------------------------

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
    __sheet.getRange(1,4).setValue(JUDGING_CRITERIA.A);
    __sheet.getRange(1,5).setValue(JUDGING_CRITERIA.B);
    __sheet.getRange(1,6).setValue(JUDGING_CRITERIA.C);
    __sheet.getRange(1,7).setValue(JUDGING_CRITERIA.D);
    __sheet.getRange(1,8).setValue(JUDGING_CRITERIA.E);
    __sheet.getRange(1,9).setValue(JUDGING_CRITERIA.F);
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
      __sheet.getRange(2 + parseInt(_y), 1).setValue(team_name);
      __sheet.getRange(2 + parseInt(_y), 2).setValue(submission_url);
      __sheet.getRange(2 + parseInt(_y), 3).setValue(tracks);
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

// It's the second script that has to be run, which is after all the judges were handed out
// the email to fill up the data, after all the data has been filled, it's going to gives us a new sheet, i.e a sheet
// which contains the sorted Total Marks averaged from 3 judges
const script_1 = () => {
  let currentSpreasheet = SpreadsheetApp.getActiveSpreadsheet();
  let allSheets = currentSpreasheet.getSheets();

  // We're gonna assume that the list of Qualified Teams is the first index
  // Qualified Teams Sheet Object
  let qualified_teams_sheet = allSheets[0]; 

    // Judges Teams Sheet Object 
  let judges_sheet = allSheets[1];  

  qualified_teams_sheet.copyTo(currentSpreasheet);

  let compiledSheet = currentSpreasheet.getSheets()[2];
  compiledSheet.setName("Total_Final_Sheet");

  // JSON data for the sheets
  let qualified_teams_sheet_JSON= getJSONData(qualified_teams_sheet);
  let judges_sheet_JSON = getJSONData(judges_sheet);

  // Max Row and Max Column of Compiled Sheet
  let row = compiledSheet.getLastRow();
  let column = compiledSheet.getLastColumn();

  let allJudges = [];

  for(let i = 0; i < judges_sheet_JSON.length; i++){
    let judge_full_name = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.FULL_NAME]
    let judge_email = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.EMAIL];
    let judge_emailed_URL = judges_sheet_JSON[i][JUDGES_SHEET_FIELD.EMAILED_URL];
    allJudges.push(new Judge(i + 1, judge_email,judge_full_name, judge_emailed_URL));
  }

  for(let i = 0; i < allJudges.length; i++){
      let judgeName = allJudges[i].full_name;
      let judgeSpreadSheet = SpreadsheetApp.openByUrl(allJudges[i].emailedURL);
      let marksSheet = judgeSpreadSheet.getSheets()[0];

      // Gonna make sure the total marks is in the last column and the marks of tracks is in the second last column
      let _row = marksSheet.getLastRow();
      let _column = marksSheet.getLastColumn();

      // Sets the name of judge in the Compiled Sheet
      compiledSheet.getRange(1,column + i + 1).setValue(`${judgeName} Marks`);

      for (let _i = 2; _i <= _row;_i++ ){

        // WARNING : Submission URL is in the second column of the rows we are going through of the JUDGE marks list
        // DONOT CHANGE THE COLUMN OF Submission URL in JUDGE marks list, it must be on the second
        let submission__url = marksSheet.getRange(_i, 2).getValue();
        

        // WARNING : Total Marks is in the last column of the JUDGE marks list
        // DONOT CHANGE THE COLUMN OF Total Marks in JUDGE marks list, it must be on the last
        let marks = marksSheet.getRange(_i, _column).getValue();


        let row_to_be_found = null;
        // Finding row of the marks
        for(let __i = 0; __i < qualified_teams_sheet_JSON.length ;__i++){
            if(submission__url === qualified_teams_sheet_JSON[__i][QUALIFIED_SHEET_FIELDS.SUBMISSION_URL]){
              row_to_be_found = __i + 2;
            }
        }

        // WARNING : On the compile sheet the last column should be Final Marks and the Second last should be Relevance To Tracks Marks
        compiledSheet.getRange(row_to_be_found,column + 1 + i).setValue(marks);
      }    
  }

  compiledSheet.getRange(1, column + allJudges.length + 1).setValue('Final Relevance To Track Marks');
  compiledSheet.getRange(1, column + allJudges.length + 2).setValue(`Final Marks`);
  // TODO : GET the formula working
  // NOTE : Can't use this formula because at this point of time i.e the development time of this 
  // project there is no way to figure out the absolute poisiton of the cell 
  // =DIVIDE(SUM(A1:C1),3)

  // Gives you the final marks, by going through all the marks in the compiled section
  // NOTE : The compiled sheet should be in the 3rd position i.e on the 2nd index always
  let compiled_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[2];

  let compiled_sheet_column = compiledSheet.getLastColumn();

  for(let ___j = 0; ___j < qualified_teams_sheet_JSON.length; ___j++){
    //let cell = compiledSheet.getRange(2 + 0, compiled_sheet_column);
      let full_marks = 0;
      for(let ___i = 0; ___i < allJudges.length; ___i++){
        let marks = parseInt(compiledSheet.getRange(___j + 2, compiledSheet.getLastColumn() - 1 - ___i).getValue());
        full_marks += marks ? marks : 0;
    }

   // Make sure that the final marks is in the last column as always
   compiledSheet.getRange(___j + 2, column + allJudges.length + 2).setValue(full_marks / 3);

   
  }





    // CompiledSheet after the total Marks has been added
    compiledSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[2];
    let columnPositionOfSubmissionURLInCompiledSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.SUBMISSION_URL, compiledSheet);

    let allJudgesSubmissionUrlAndTrackMarks = [];
    allJudges.forEach((d, i) => {
      let judge_marks_sheet = SpreadsheetApp.openByUrl(d.emailedURL).getSheets()[0];
      let columnPositionOfTrackMarks = findColumnPositionOf(JUDGING_CRITERIA.F, judge_marks_sheet);
      let columnPositionOfSubmissionURLInJudgeMarksSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.SUBMISSION_URL, judge_marks_sheet);

      let submissionUrlAndTrackMarksObj = {};

      let totalProjectsUnderJudge = judge_marks_sheet.getLastRow() - 1;
      for(let ___y = 1; ___y <= totalProjectsUnderJudge; ___y++){
          let __row = ___y + 1;
          console.log(__row);
          let _submissionUrl = judge_marks_sheet.getRange(__row, columnPositionOfSubmissionURLInJudgeMarksSheet).getValue();
          let marks = parseInt(judge_marks_sheet.getRange(__row, columnPositionOfTrackMarks).getValue());
          submissionUrlAndTrackMarksObj[_submissionUrl] = marks  ? marks : 0;
      }

      allJudgesSubmissionUrlAndTrackMarks.push(submissionUrlAndTrackMarksObj);
    });

 
  let totalProjects = compiledSheet.getLastRow() - 1;
  for(let ___k = 1; ___k <= totalProjects; ___k++){
    
    let totalRelevantTrackMarks = 0;
    let submission___url = compiledSheet.getRange(___k + 1, columnPositionOfSubmissionURLInCompiledSheet).getValue();
    allJudgesSubmissionUrlAndTrackMarks.forEach((v)=>{
        totalRelevantTrackMarks += v[submission___url] ? v[submission___url] : 0;
    });
    
    // Make sure that the final marks is in the last column as always
    let columnPositionOfTrackMarksInTotalMarksSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.FINAL_RELEVANCE_MARKS, compiledSheet);
    compiledSheet.getRange(___k + 1, columnPositionOfTrackMarksInTotalMarksSheet).setValue( totalRelevantTrackMarks / 3);
  }

  
  // Beautify the sheet and sort the sheet by descending order of Total Marks
  autoResizeSheet(compiledSheet);
  compiledSheet.sort(compiled_sheet_column,false);
}

// Script to create multiple sheets of different tracks
const script_2 = () => {
      // CompiledSheet after the total Marks has been added
    compiledSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[2];
    let noOfProjects = compiledSheet.getLastRow() - 1;

    let columnPositionOfTracksInCompiledSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.TRACKS, compiledSheet);
    let columnPositionOfRelevantMarksInCompiledSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.FINAL_RELEVANCE_MARKS, compiledSheet);

    // Pattern to extract out track from inside of Track (alsjdflsjdf)
    let pattern = /\((.*?)\)/g;
    let regexForGettingCommaSeparated = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;

    let allPossibleTracks = new Set();
    let allPossibleMainTracks = new Set();
    let allPossibleNonMainTracks = new Set();

    for(let i = 1; i <= noOfProjects; i++){
        let allTracksInThisProject = compiledSheet.getRange(i + 1, columnPositionOfTracksInCompiledSheet).getValue();
        allTracksInThisProject = allTracksInThisProject.match(regexForGettingCommaSeparated);
        for(let j = 0; j < allTracksInThisProject.length; j++){
          let track = allTracksInThisProject[j].replaceAll(",", "");
          if(!track.includes("Track (")){
                allPossibleTracks.add(track.trim());
                allPossibleNonMainTracks.add(track.trim());
          }else{
               let itemInsideTrack = allTracksInThisProject[j].match(pattern);
               let track = itemInsideTrack[0].replaceAll("(", "").replaceAll(")", "");
               allPossibleTracks.add(track.trim());
               allPossibleMainTracks.add(track.trim());

          }
        }
    } 

    allPossibleTracks = Array.from(allPossibleTracks);
    allPossibleTracks = allPossibleTracks.filter((v)=>{
      if(v.length > 1){
        return true;
      }
      return false;
    });

    allPossibleMainTracks = Array.from(allPossibleMainTracks);
    allPossibleMainTracks = allPossibleMainTracks.filter((v) => {
      if(v.length > 1){
        return true;
      }
      return false;
    });

    allPossibleNonMainTracks = Array.from(allPossibleNonMainTracks);
    allPossibleNonMainTracks = allPossibleNonMainTracks.filter((v)=>{
      if(v.length > 1){
        return true;
      }
      return false;
    });

    // PROJECT TO INCLUDE AS MAIN TRACK AS WELL
    const BEST_NEWBIE_PROEJCT = "Best Newbie Project";
    allPossibleMainTracks.push(BEST_NEWBIE_PROEJCT);
    allPossibleNonMainTracks = allPossibleNonMainTracks.filter((d,_) => d != BEST_NEWBIE_PROEJCT);
    
    let currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    let columnsToIgnore = [
      findColumnPositionOf(QUALIFIED_SHEET_FIELDS.FINAL_MARKS, compiledSheet)
    ];

    let columnsOfCompiledSheet = compiledSheet.getLastColumn();
    let judges_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
    for(m = 1; m <= judges_sheet.getLastRow() - 1; m++){
        columnsToIgnore.push(columnsOfCompiledSheet - 1 - m);
    }

    
  // Get the sheets of the Main Tracks Out
    allPossibleMainTracks.forEach((d)=>{
        let rowPointer = 2;
        let sheet = currentSpreadsheet.insertSheet(`M - ${d}`);

        // Copy the entire first row from the Compiled Sheet
        for(let i = 1; i <= compiledSheet.getLastColumn(); i++){
            sheet.getRange(1, i).setValue(compiledSheet.getRange(1, i).getValue());
        }

        // Go through all the projects
        for(let j = 2; j <= compiledSheet.getLastRow(); j++){

          // Stores all the tracks that are availaible in this project
           let allTracksInThisProject = [];
           let allTracks = compiledSheet.getRange(j, columnPositionOfTracksInCompiledSheet).getValue();
           allTracks = allTracks.match(regexForGettingCommaSeparated);

          for(let j = 0; j < allTracks.length; j++){
            let track = allTracks[j].replaceAll(",", "");
            if(!track.includes("Track (")){
                allTracksInThisProject.push(track.trim());
            }else{
               let itemInsideTrack = allTracks[j].match(pattern);
               let track = itemInsideTrack[0].replaceAll("(", "").replaceAll(")", "");
               allTracksInThisProject.push(track.trim())
            }
          }

          console.log(allTracksInThisProject);

          if(allTracksInThisProject.includes(d)){
             for(let i = 1; i <= compiledSheet.getLastColumn(); i++){
                sheet.getRange(rowPointer, i).setValue(compiledSheet.getRange(j, i).getValue());
              }
            rowPointer++;
          }
      }

      sheet.sort(columnPositionOfRelevantMarksInCompiledSheet,false);
      columnsToIgnore.forEach((v)=>{
        sheet.deleteColumn(v);
      });
      autoResizeSheet(sheet);
    });

    // Get the sheets of the Non Main Tracks Out
    allPossibleNonMainTracks.forEach((d)=>{
        let rowPointer = 2;
        let sheet = currentSpreadsheet.insertSheet(`NM - ${d}`);

        // Copy the entire first row from the Compiled Sheet
        for(let i = 1; i <= compiledSheet.getLastColumn(); i++){
            sheet.getRange(1, i).setValue(compiledSheet.getRange(1, i).getValue());
        }

        // Go through all the projects
        for(let j = 2; j <= compiledSheet.getLastRow(); j++){

          // Stores all the tracks that are availaible in this project
           let allTracksInThisProject = [];
           let allTracks = compiledSheet.getRange(j, columnPositionOfTracksInCompiledSheet).getValue();
           allTracks = allTracks.match(regexForGettingCommaSeparated);

          for(let j = 0; j < allTracks.length; j++){
            let track = allTracks[j].replaceAll(",", "");
            if(!track.includes("Track (")){
                allTracksInThisProject.push(track.trim());
            }else{
               let itemInsideTrack = allTracks[j].match(pattern);
               let track = itemInsideTrack[0].replaceAll("(", "").replaceAll(")", "");
               allTracksInThisProject.push(track.trim())
            }
          }

          console.log(allTracksInThisProject);

          if(allTracksInThisProject.includes(d)){
             for(let i = 1; i <= compiledSheet.getLastColumn(); i++){
                sheet.getRange(rowPointer, i).setValue(compiledSheet.getRange(j, i).getValue());
              }
            rowPointer++;
          }
      }
      sheet.sort(columnPositionOfRelevantMarksInCompiledSheet,false);
      columnsToIgnore.forEach((v)=>{
        sheet.deleteColumn(v);
      });
      autoResizeSheet(sheet);

      let relevantMarksColumnPosition = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.FINAL_RELEVANCE_MARKS, sheet);

      // Remove all the markings
      for(let ii = 2; ii <= sheet.getLastRow(); ii++){
          sheet.getRange(ii, relevantMarksColumnPosition).setValue("");
      }

    });
}



const OLD_FINAL_MARKS = "Old Final Marks";
const JUDGES_MARKING_CRITERIA_SECOND = {
  A : "Pitching and Presentation(0 - 20)",
  B : "Q&A Response (0 - 20)",
  C : "Overall Project Value (0 - 20)"
}
// Script to get the top 6 and then again give it to the judge
const script_3 = () => {
    let currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get the judges sheet and the total marks sheet
    let judges_sheet = currentSpreadsheet.getSheets()[1];
    let total_marks_sheet = currentSpreadsheet.getSheets()[2];

    // Get the top six sheet and the judges sheet
    let top_six_spreadsheet = SpreadsheetApp.create("Top 6");
    let url_of_top_six_spreadsheet = top_six_spreadsheet.getUrl();
    let top_six_sheet = top_six_spreadsheet.getSheets()[0];
    let top_six_judges_sheet = top_six_spreadsheet.insertSheet("Judges");

    // Extract the Top 6 and put them on the new sheet
    const TOP_HOW_MANY = 6;
    for(let j = 1; j <= TOP_HOW_MANY + 1; j++){
        for(let i = 1; i <= total_marks_sheet.getLastColumn(); i++){
            top_six_sheet.getRange(j, i).setValue(total_marks_sheet.getRange(j, i).getValue());    
        } 
    }

    let columnOfFinalMarksInTopSixSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.FINAL_MARKS, top_six_sheet);
    top_six_sheet.getRange(1, columnOfFinalMarksInTopSixSheet).setValue(OLD_FINAL_MARKS);

    let columnsToIgnore = [
      findColumnPositionOf(QUALIFIED_SHEET_FIELDS.FINAL_RELEVANCE_MARKS, top_six_sheet)
    ];

    let columnsOfTopSixSheet = top_six_sheet.getLastColumn();
    for(m = 1; m <= judges_sheet.getLastRow() - 1; m++){
        columnsToIgnore.push(columnsOfTopSixSheet - 1 - m);
    }

    console.log(columnsToIgnore);

    columnsToIgnore.forEach((v)=>{
        top_six_sheet.deleteColumn(v);
    });

    autoResizeSheet(top_six_sheet);

    // Copy all the rows and columns of the Judges from previous sheet into the new sheet
    for(let j = 1; j<= judges_sheet.getLastRow(); j++){
      for(let i = 1; i<= total_marks_sheet.getLastColumn(); i++){
        top_six_judges_sheet.getRange(j, i).setValue(judges_sheet.getRange(j, i).getValue());
      }
    }

    autoResizeSheet(top_six_judges_sheet);

    let columnOfJudgeFullNameInJudgesSheet = findColumnPositionOf(JUDGES_SHEET_FIELD.FULL_NAME, top_six_judges_sheet);
    let columnOfEmailedURLinJudgesSheet = findColumnPositionOf(JUDGES_SHEET_FIELD.EMAILED_URL, top_six_judges_sheet);
    let columnOfEmailInJudgesSheet = findColumnPositionOf(JUDGES_SHEET_FIELD.EMAIL, top_six_judges_sheet);

    // Send Each Judge a email of the new sheet to give marks
    for(let j = 2; j <= top_six_judges_sheet.getLastRow(); j++){

      let judge_full_name = top_six_judges_sheet.getRange(j, columnOfJudgeFullNameInJudgesSheet).getValue();
      let judge_email = top_six_judges_sheet.getRange(j, columnOfEmailInJudgesSheet).getValue();
    
      let marks_spreadsheet = SpreadsheetApp.create(`Top 6 JUDGE ${judge_full_name} MARKS`);
      let marks_sheet = marks_spreadsheet.getSheets()[0];

      // Set up the marks sheet here START
      marks_sheet.getRange(1, 1).setValue(QUALIFIED_SHEET_FIELDS.TEAM_NAME);
      marks_sheet.getRange(1, 2).setValue(QUALIFIED_SHEET_FIELDS.SUBMISSION_URL);
      marks_sheet.getRange(1, 3).setValue(QUALIFIED_SHEET_FIELDS.TRACKS);
      marks_sheet.getRange(1, 4).setValue(JUDGES_MARKING_CRITERIA_SECOND.A);
      marks_sheet.getRange(1, 5).setValue(JUDGES_MARKING_CRITERIA_SECOND.B);
      marks_sheet.getRange(1, 6).setValue(JUDGES_MARKING_CRITERIA_SECOND.C);
      marks_sheet.getRange(1, 7).setValue(QUALIFIED_SHEET_FIELDS.FINAL_MARKS);

      for(let i = 2; i <= top_six_sheet.getLastRow(); i++){
          let columnOfTeamNameInTopSixMarksSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.TEAM_NAME, top_six_sheet);
          let columnOfSubmissionURLInTopSixMarksSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.SUBMISSION_URL, top_six_sheet);
          let columnOfTracksInTopSixMarksSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.TRACKS, top_six_sheet);
          marks_sheet.getRange(i, 1).setValue(top_six_sheet.getRange(i, columnOfTeamNameInTopSixMarksSheet).getValue());
          marks_sheet.getRange(i, 2).setValue(top_six_sheet.getRange(i, columnOfSubmissionURLInTopSixMarksSheet).getValue());
          marks_sheet.getRange(i, 3).setValue(top_six_sheet.getRange(i, columnOfTracksInTopSixMarksSheet).getValue());
          marks_sheet.getRange(i, 7).setFormula(`=SUM(D${i}:F${i})`);
      }
      // Set up the marks sheet here END
      console.log(judge_email);
      marks_spreadsheet.addEditor(judge_email);
      let url = marks_spreadsheet.getUrl();
      top_six_judges_sheet.getRange(j, columnOfEmailedURLinJudgesSheet).setValue(url);

      autoResizeSheet(marks_sheet);
      GmailApp.sendEmail(judge_email, "Marks to be filled", url);
    }

    let sheetX = currentSpreadsheet.insertSheet("DEVELOPER_USE_ONLY", 10);
    sheetX.getRange(1,1).setValue(url_of_top_six_spreadsheet);
}


// It's going to compile all the marks from each judge and give the average of those judges
const script_4 = () => {
  let currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheetX = currentSpreadsheet.getSheetByName("DEVELOPER_USE_ONLY");

  let top_six_spreadsheet = SpreadsheetApp.openByUrl(sheetX.getRange(1,1).getValue());
  let top_six_marksheet = top_six_spreadsheet.getSheets()[0];
  let top_six_judges_sheet = top_six_spreadsheet.getSheets()[1];

  top_six_marksheet.copyTo(top_six_spreadsheet);
  let totalEverything = top_six_spreadsheet.getSheets()[2];
  totalEverything.setName("Total Final Sheet");

  totalEverything.getRange(1, totalEverything.getLastColumn() + 1).setValue("New Final Marks");

  // Go through all the projects and check each project in the Judges Marked Sheet
  for(let i = 2; i <= top_six_marksheet.getLastRow(); i++){
    let totalMarks = 0;
    let columnOfTeamNameInTopSixMarkSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.TEAM_NAME, top_six_marksheet);
    let team_name = top_six_marksheet.getRange(i, columnOfTeamNameInTopSixMarkSheet).getValue();

    // Go through each judge marks and get all the marks
      for(let j = 2; j <= top_six_judges_sheet.getLastRow(); j++){
        // Get the emailed URL
        let url = top_six_judges_sheet.getRange(j, 3).getValue();
        console.log(url);
        // Get the judge mark sheet
        let judgeMarkSheet = SpreadsheetApp.openByUrl(url).getSheets()[0];
        let columnOfTeamNameInJudgeMarkSheet = findColumnPositionOf(QUALIFIED_SHEET_FIELDS.TEAM_NAME, judgeMarkSheet);
        for(let k = 2; k <=judgeMarkSheet.getLastRow();k++){
            if(team_name === judgeMarkSheet.getRange(k, columnOfTeamNameInJudgeMarkSheet).getValue()){
            let marks = judgeMarkSheet.getRange(k, judgeMarkSheet.getLastColumn()).getValue();
            totalMarks += marks ? marks : 0;
          } 
        }
      }
      console.log(totalMarks);
      // WHERE 9 IS the total no of judges
      totalEverything.getRange(i, totalEverything.getLastColumn()).setValue((totalMarks/ 9) * 2);
  }
};

const findColumnPositionOf = (heading, sheet)=>{
  for(let i = 1; i <= sheet.getLastColumn(); i++){
    if(sheet.getRange(1, i).getValue() === heading){
      return i;
    }
  }
}





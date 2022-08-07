// Initially we'll count just the TOTAL_NO_OF_JUDGES and TOTAL_NO_OF_PROJECTS from the CSV file, 
// giving each judge an ID, and giving each project an ID
//
// At last we'll map the Judge with the specific ID, the project with Specific ID from the CSV file 

const TOTAL_PROJECTS = 60;
const TOTAL_JUDGES = 8;

// Data Structure to store the Project Metadata
class Project{
    constructor(projectID){
        this.id = projectID;

        // Id of the Judges, the project was assigned to 
        this.judgesAssigned = [];
    }
}

// Data Structure to store the Judge Metadata
class Judge{
    constructor(judgeID){
        this.id = judgeID;
    
        // Projects assigned to the judge
        this.projectsAssigned = [];
        // Extra Projects assigned to the judge
        this.extraProjectsAssigned = [];
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



let allProjects = [];
for(let _x = 1 ; _x <= TOTAL_PROJECTS; _x++){
    allProjects.push(new Project(_x));
}

let allJudges = [];
for(let _y = 1 ; _y <= TOTAL_JUDGES; _y++){
    allJudges.push(new Judge(_y));
}

// Algorithm
// Assign each project to each judge randomly



//let allJudges = [new Judge(1), new Judge(2), new Judge(3), new Judge(4), new Judge(5), new Judge(6)];
//let allProjects = [new Project(1),new Project(2),new Project(3),new Project(4),new Project(5),new Project(6),new Project(7),new Project(8),new Project(9),new Project(10),new Project(11),new Project(12),new Project(13),new Project(14),new Project(15),new Project(16),new Project(17),new Project(18),new Project(19), new Project(20)];

// Assign each judge, a project randomly
// TODO : Choose a judge randomly as well
//




// Algorithm ;
// It Clones the allProjects array and then shuffle the entire 
// array then assign to each judge serially
//
// Virtually, it means the judge was assigned each project randomly
//
// O(n^2) randomization
let shuffledAllProjects = [...allProjects];
for(i = 0; i < shuffledAllProjects.length; i++){
    for(j = 0; j < shuffledAllProjects.length; j++){

        let randomIndex = Math.floor(Math.random() * shuffledAllProjects.length);
        while(randomIndex == j){
            randomIndex = Math.floor(Math.random() * shuffledAllProjects.length);
        }

        let temp = shuffledAllProjects[randomIndex];
        shuffledAllProjects[randomIndex] = shuffledAllProjects[j];
        shuffledAllProjects[j] = temp;
    }  
}


// Assign each Project to a judge, if there are NO_OF_JUDGES not multiple of NO_OF_PROJECTS,
// a judge will be randomly given an extra project to work on initially
let __allJudges = [...allJudges];
for(i = 0; i < shuffledAllProjects.length; i++){
    while(__allJudges.length == 0){
        __allJudges = [...allJudges]
    }

    let random_index = Math.floor(Math.random() * __allJudges.length);

    shuffledAllProjects[i].judgesAssigned.push(__allJudges[random_index].id);
    __allJudges.splice(random_index, 1);
}

// Assign each Project to a judge
for(i = 0; i < shuffledAllProjects.length; i++){
    let judge_id = shuffledAllProjects[i].judgesAssigned[0];
    allJudges[judge_id - 1].projectsAssigned.push(shuffledAllProjects[i]);
}



// Index of all the judges to go through

//for (let _x in allProjects){
//
//   //Shuffle the judges array
//   allJudges = arrayRandomizer(allJudges);
//    // Sorting Judges from Highest to Lowest in terms of Extra Project, coz the judge with extra project will be selected for
//    // distributing his project to other judges
//     
//    //Sorting from lowest amount of project the judge has given to other judges
//    for (let x = 0; x < allJudges.length ; x++){
//        for(let y = 0; y < allJudges.length - 1; y++){
//            if(allJudges[y+1].judgesTheJudgeSharedTo.length < allJudges[y].judgesTheJudgeSharedTo.length){
//                let temp = allJudges[y];
//                allJudges[y] = allJudges[y + 1];
//                allJudges[y+1] = temp;
//            }
//        }
//    }
//
//    // Select one of the project of the judge at the top of allJudges array randmly and assign it to the last two judges
//    // List of all projects of the judge that is not distributed to other judge
//    let projectIndices= [];
//    for(x = 0; x < allJudges[0].projectsAssigned.length ; x++){
//        if (allJudges[0].projectsAssigned[x].judgesAssigned.length < 3){
//            projectIndices.push(x);
//        }
//    }
//
//    projectIndices = arrayRandomizer(projectIndices);
//
//    if(projectIndices.length !== 0){
//        allJudges[0].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 1].id);
//        allJudges[0].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 2].id);
//
//        allJudges[allJudges.length - 1].extraProjectsAssigned.push(allJudges[0].projectsAssigned[projectIndices[0]].id);
//        allJudges[allJudges.length - 2].extraProjectsAssigned.push(allJudges[0].projectsAssigned[projectIndices[0]].id);
//
//        allJudges[0].judgesTheJudgeSharedTo.push(allJudges.length -1);
//        allJudges[0].judgesTheJudgeSharedTo.push(allJudges.length - 2);
//
//    }
//}


for (let _x in allProjects){

   //Shuffle the judges array
   allJudges = arrayRandomizer(allJudges);
    // Sorting Judges from Highest to Lowest in terms of Extra Project, coz the judge with extra project will be selected for
    // distributing his project to other judges
     
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

    // Select one of the project of the judge at the top of allJudges array randmly and assign it to the last two judges
    // List of all projects of the judge that is not distributed to other judge
    
    let projectIndices = [];
    for(x = 0; x < allJudges[0].projectsAssigned.length ; x++){
        if (allJudges[0].projectsAssigned[x].judgesAssigned.length < 3){
            projectIndices.push(x);
        }
    }

    projectIndices = arrayRandomizer(projectIndices);

    if(projectIndices.length !== 0){
        allJudges[0].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 1].id);
        allJudges[0].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 2].id);

        allJudges[allJudges.length - 1].extraProjectsAssigned.push(allJudges[0].projectsAssigned[projectIndices[0]].id);
        allJudges[allJudges.length - 2].extraProjectsAssigned.push(allJudges[0].projectsAssigned[projectIndices[0]].id);
    }
}

// For the cleanup
//
// Finding out how many not shared projects are there i.e Projects with only Judge

let NOT_SHARED = 0;
for(let y in allJudges){
    let projectIndices = [];
    for(x = 0; x < allJudges[y].projectsAssigned.length ; x++){
        if (allJudges[y].projectsAssigned[x].judgesAssigned.length < 3){
            projectIndices.push(x);
        }
    }

    if(projectIndices.length != 0){
        NOT_SHARED++;
    }
} 
console.log("TOTAL = ", NOT_SHARED);

//
for (let m = 0; m < TOTAL_PROJECTS ; m++){

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
    for(let y in allJudges){
        for(x = 0; x < allJudges[y].projectsAssigned.length ; x++){
       if (allJudges[y].projectsAssigned[x].judgesAssigned.length < 3){
                projectIndices.push(x);
            }
        }
    
        if(projectIndices.length != 0){
            judgeIndex = y;
            break;
        }
    }


    projectIndices = arrayRandomizer(projectIndices);
    if(judgeIndex){

        // Case - 1 
        // If the index of the Judge is the last index, then he/she should share it with the upper two
        if(judgeIndex === allJudges.length - 1) {
            if(projectIndices.length !== 0){

                allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex - 1].id);
                allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex - 2].id);

                allJudges[judgeIndex - 1].extraProjectsAssigned.push(allJudges[y].projectsAssigned[projectIndices[0]].id);
                allJudges[judgeIndex - 2].extraProjectsAssigned.push(allJudges[y].projectsAssigned[projectIndices[0]].id);
            }
        // If the index of the judge is the second last index, then he/ she should share with the one below and one up
        }else if(judgeIndex === allJudges.length - 2){

            if(projectIndices.length !== 0){
                allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex + 1 ].id);
                allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[judgeIndex - 1].id);

                allJudges[judgeIndex + 1].extraProjectsAssigned.push(allJudges[y].projectsAssigned[projectIndices[0]].id);
                allJudges[judgeIndex - 1].extraProjectsAssigned.push(allJudges[y].projectsAssigned[projectIndices[0]].id);
            }
        }else{
            allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 1].id);
            allJudges[judgeIndex].projectsAssigned[projectIndices[0]].judgesAssigned.push(allJudges[allJudges.length - 2].id);

            allJudges[allJudges.length - 1].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
            allJudges[allJudges.length - 2].extraProjectsAssigned.push(allJudges[judgeIndex].projectsAssigned[projectIndices[0]].id);
        }
    }


}



    for(let j in allJudges){
        console.log("-----------------------------------------------------------------------------------------------------");
        console.log(JSON.stringify(allJudges[j]));
    }



let SHARED = 0;
for(let y in allJudges){
    let projectIndices = [];
    for(x = 0; x < allJudges[y].projectsAssigned.length ; x++){
        if (allJudges[y].projectsAssigned[x].judgesAssigned.length < 3){
            projectIndices.push(x);
        }
    }

    if(projectIndices.length != 0){
        SHARED++;
    }
} 
console.log("TOTAL = ",SHARED);

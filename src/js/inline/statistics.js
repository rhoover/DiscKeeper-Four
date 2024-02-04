(() => {
  'use strict';

  const stats = {

    init() {
      async function getData() {
        const coursesFetch = await localforage.getItem('courseList');
        const roundsFetch = await localforage.getItem('savedRounds');
        return [coursesFetch, roundsFetch];
      };
      getData().then(fetchedData => {
        const fetchedCourses = fetchedData[0];
        const fetchedRounds = fetchedData[1];
        // are there rounds or not
        switch (fetchedRounds) {
          // if there is saved rounds data
          case fetchedRounds:
            stats.buildListForDOM(fetchedRounds);
            // console.log('fetched rounds:', fetchedRounds);
          break;
          // if there is not saved rounds data
          case false:
            stats.noRounds();            
          break;
        
          default:
          break;
        };
      });

    }, //end init()

    noRounds() {
      let mainElement = document.querySelector('.statistics');
      let courseItems = document.querySelector('.statistics-courses')
      let warningOutput = "";

      if (roundsData == null) {
        courseItems.remove();
      };

      warningOutput += `
        <p class="statistics-warning">You don't have any rounds saved yet,</p>
        <a href="pages/roundsetup.html" class="statistics-warning-link">Go ahead and start one!  ➤</a>
      `;
      mainElement.innerHTML += warningOutput;

    }, // end noRounds()

    buildListForDOM (fetchedRounds) {
      let coursesList = document.querySelector('.statistics-courses');
      let coursesOutput = "";
      let deduped;

      // remove duplicates for on-screen display
      deduped = fetchedRounds.filter((obj, index) => {
        return index === fetchedRounds.findIndex(o => obj.courseName === o.courseName)
      });
      // <span>➤</span>
      deduped.forEach((round) => {
        coursesOutput += `
          <div class="statistics-course">
            <p>${round.courseName}</p>
            <button class="statistics-course-button" data-choice="round" data-courseid="${round.courseID}">Round Stats</button>
            <button class="statistics-course-button" data-choice="holes" data-courseid="${round.courseID}">Hole Stats</button>
          </div>
          
        `;
      });

      coursesList.innerHTML = coursesOutput;

      stats.manageDOMList(fetchedRounds);
    }, // end buildListForDOM()

    manageDOMList(fetchedRounds) {

      let courses = document.querySelector('.statistics-courses');
      let chosenCourseID = '';
      let buttonChoice = '';
      let chosenCourseRounds = [];

      courses.addEventListener('click', getRounds);
      function getRounds(event) {

        // which button was clicked
        chosenCourseID = event.target.closest('.statistics-course-button').dataset.courseid;
        buttonChoice = event.target.closest('.statistics-course-button').dataset.choice;

        // get the appropriate rounds
        chosenCourseRounds = fetchedRounds.filter((round) => {return round.courseID == chosenCourseID});

        switch (buttonChoice) {
          case 'round':
            stats.buildRoundData(chosenCourseRounds);            
          break;
          case 'holes':
            stats.buildHoleData(chosenCourseRounds);            
          break;
        
          default:
            break;
        };
        
      };
    }, // end manageDOMList()

    buildHoleData(chosenCourseRounds) {
      // console.log('chosen course:', chosenCourseRounds);

      let chosenCourseName = chosenCourseRounds[0].courseName;
      let playerScoring = [];
      let playerScoringRounds = [];
      let holeThrowsArray = Array(18).fill(0).map(() => []);
      let minMaxAvg = [];

      // player[0] as the first player is always the primary player
      for (let i = 0; i < chosenCourseRounds.length; i++) {
        playerScoring.push({playerThrows: chosenCourseRounds[i].players[0].courseHoles});
      };
      // console.log('playerScoring:', playerScoring);

      // get the throws per hole for each round
      playerScoringRounds = playerScoring.map((rounds) => rounds.playerThrows);
      console.log('playerScoringRounds:', playerScoringRounds);
      
      // bunge the throws for each hole from each round into it's own array [3,2,4] inside an array
      for (let i = 0; i < playerScoringRounds.length; i++) {
        for (let j = 0; j < holeThrowsArray.length; j++) {
          holeThrowsArray[j].push(playerScoringRounds[i][j].holeThrows);
        }
      };
      // console.log('holeThrowsArray:', holeThrowsArray);

      // build the min-max-avg for each hole
      for (let i = 0; i < holeThrowsArray.length; i++) {
        let minNumber = Math.min(...holeThrowsArray[i]);
        let maxNumber = Math.max(...holeThrowsArray[i]);
        let avgNumber = holeThrowsArray[i].reduce((a,b) => a + b) / holeThrowsArray[i].length;
        // round down to nearest integer, i.e. no decimals
        avgNumber = Math.floor(Number(avgNumber));
        let hn = i + 1;
        let holeNumber = 'Hole ' + hn.toString();

        minMaxAvg.push({hole: holeNumber, minimum: minNumber, maximum: maxNumber, average: avgNumber});
      };

      // need to get the holePar into minMaxAvg for display purposes
      for (let i = 0; i < playerScoringRounds.length; i++) {
        for (let j = 0; j < minMaxAvg.length; j++) {
          minMaxAvg[j].par = playerScoringRounds[i][j].holePar;
        };
      };

      stats.buildHoleGraph(chosenCourseName, minMaxAvg);

    }, //end buildHoleData()

    buildRoundData(chosenCourseRounds) {
      let chosenCourseName = chosenCourseRounds[0].courseName;
      let playerScoring = [];
      let playerScoringRounds = [];
      let lastHole;
      let lastHoleArray = [];
      let overAllScore = [];
      let minMaxAvgScore = [];

      // player[0] as the first player is always the primary player
      for (let i = 0; i < chosenCourseRounds.length; i++) {
        playerScoring.push({playerThrows: chosenCourseRounds[i].players[0].courseHoles});
      };
      // console.log('playerScoring:', playerScoring);

      // get the throws per hole for each round
      playerScoringRounds = playerScoring.map((rounds) => rounds.playerThrows);
      // console.log('playerScoringRounds:', playerScoringRounds);

      // get the last hole of each round to build an overall score comparison
      playerScoringRounds.forEach((round) => {
        lastHole = round[round.length - 1];
        lastHoleArray.push(lastHole);
      });
      // console.log('lastHoleArray:', lastHoleArray);

      // bunge the overall score for each round into it's own array
      lastHoleArray.forEach((finalScore) => {
        overAllScore.push(finalScore.roundOverUnder);
      });
      // console.log('overAllScore:', overAllScore);

      // build the min-max-avg for the overall course score
      let averageScore = overAllScore.reduce((a,b) => a + b) / overAllScore.length;
      // get rid of decimals
      averageScore = Number(averageScore).toFixed(0);
      // return to typeof number
      averageScore = Number(averageScore);
      let bestScore = Math.min(...overAllScore);
      let worstScore = Math.max(...overAllScore);
      
      minMaxAvgScore.push({minimum: bestScore, maximum: worstScore, average: averageScore});
      // console.log('minMaxAvgScore', minMaxAvgScore);

      stats.buildRoundGraph(chosenCourseName, minMaxAvgScore)
    }, // end buildRoundData()

    buildHoleGraph(chosenCourseName, minMaxAvg) {

      let graphDiv = document.querySelector('.statistics-graph');
      let graphDivHeader = document.querySelector('.statistics-graph-header');
      let graphDivChart = document.querySelector('.statistics-graph-chart');
      let headerOutput = '';
      let chartOutput = '';


      console.log('minMaxAvg:', minMaxAvg);

      headerOutput = `<h1 class="statistics-graph-header-text">${chosenCourseName}</h1><p class="statistics-graph-close">Close</p>`;

      // https://joshcollinsworth.com/blog/css-grid-bar-charts
      minMaxAvg.forEach((hole) => {
        chartOutput += `
          <div class="statistics-graph-chart-hole">
            <h4 class="statistics-graph-chart-hole-name" style="grid-column: span ${hole.maximum}">
              ${hole.hole} 
              <span class="statistics-graph-chart-hole-name-par">Par: ${hole.par}</span>
            </h4>
            <p style="grid-column-end: span ${hole.minimum}">
              Best: <span>${hole.minimum}</span>
            </p>
            <p style="grid-column-end: span ${hole.maximum}">
              Worst: <span>${hole.maximum}</span>
            </p>
            <p style="grid-column-end: span ${hole.average}">
              Average: <span>${hole.average}</span>
            </p>
          </div>
        `;
      });

      graphDivHeader.innerHTML = headerOutput;
      graphDivChart.innerHTML = chartOutput;

      graphDiv.classList.toggle('statistics-graph-display');

      let closeModal = document.querySelector('.statistics-graph-close');
      closeModal.addEventListener('click', (event) => {
        graphDiv.classList.toggle('statistics-graph-display');
      });

    }, // end buildHoleGraph()

    buildRoundGraph(chosenCourseName, minMaxAvgScore) {
      // console.log(chosenCourseName, minMaxAvgScore);
      let roundDiv = document.querySelector('.statistics-round');
      let roundDivHeader = document.querySelector('.statistics-round-header');
      let roundDivChart = document.querySelector('.statistics-round-chart');
      let roundHeaderOutput = '';
      let roundChartOutput = '';

      roundHeaderOutput = `<h1 class="statistics-round-header-text">${chosenCourseName}</h1><p class="statistics-round-close">Close</p>`;

      roundChartOutput = `
        <p style="grid-column-end: span ${minMaxAvgScore[0].minimum}">
          Best: <span>${minMaxAvgScore[0].minimum}</span>
        </p>
        <p style="grid-column-end: span ${minMaxAvgScore[0].maximum}">
          Worst: <span>${minMaxAvgScore[0].maximum}</span>
        </p>
        <p style="grid-column-end: span ${minMaxAvgScore[0].average}">
          Average: <span>${minMaxAvgScore[0].average}</span>
        </p>
      `;
      roundDivHeader.innerHTML = roundHeaderOutput;
      roundDivChart.innerHTML = roundChartOutput;

      roundDiv.classList.toggle('statistics-round-display');

      let closeModal = document.querySelector('.statistics-round-close');
      closeModal.addEventListener('click', (event) => {
        roundDiv.classList.toggle('statistics-round-display');
      });
    } // end buildHoleGraph()
  }; // end stats{}

  stats.init();
})();
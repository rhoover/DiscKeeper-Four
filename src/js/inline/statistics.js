(() => {
  'use strict';

  const stats = {

    init() {

      async function getData() {
        const roundsFetch = await localforage.getItem('savedRounds');
        return roundsFetch;
      };

      getData().then((data) => {

        // are there rounds or not
        if (data) {
          stats.buildListForDOM(data);          
        } else {
          stats.noRounds(data);          
        };
      });

    }, //end init()

    noRounds(roundsData) {
      let mainElement = document.querySelector('.statistics');
      let courseItemsSection = document.querySelector('.courses')
      let warningOutput = "";

      // remove section where course cards to choose are displayed since there are no rounds
      if (roundsData == null) {
        courseItemsSection.remove();
      };

      warningOutput += `
        <p class="warning">You don't have any rounds saved yet,</p>
        <a href="/pages/roundsetup.html" class="warning-link">Go ahead and start one!  ➤</a>
      `;
      mainElement.innerHTML += warningOutput;

    }, // end noRounds()

    buildListForDOM (fetchedRounds) {
      let coursesList = document.querySelector('.courses');
      let coursesOutput = "";
      let deduped;

      // remove duplicates for on-screen display
      deduped = fetchedRounds.filter((obj, index) => {
        return index === fetchedRounds.findIndex(o => obj.courseName === o.courseName)
      });

      // then present on-screen
      deduped.forEach((round) => {
        coursesOutput += `
          <div class="course-card">
            <p>${round.courseName}</p>
            <button class="course-card-button" data-choice="round" data-courseid="${round.courseID}">Course Stats</button>
            <button class="course-card-button" data-choice="holes" data-courseid="${round.courseID}">Hole Stats</button>
          </div>
          
        `;
      });

      coursesList.innerHTML = coursesOutput;

      stats.manageDOMList(fetchedRounds);
    }, // end buildListForDOM()

    manageDOMList(fetchedRounds) {

      let courses = document.querySelector('.courses');
      let chosenCourseID = '';
      let buttonChoice = '';
      let chosenCourseRounds = [];

      courses.addEventListener('click', getRounds);
      function getRounds(event) {

        // which button was clicked
        chosenCourseID = event.target.closest('.course-card-button').dataset.courseid;
        buttonChoice = event.target.closest('.course-card-button').dataset.choice;

        // get the appropriate rounds
        chosenCourseRounds = fetchedRounds.filter((round) => {return round.courseID == chosenCourseID});

        switch (buttonChoice) {
          case 'round':
            stats.buildCourseData(chosenCourseRounds);            
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
      //aka an array of arrays
      for (let i = 0; i < playerScoringRounds.length; i++) {
        for (let j = 0; j < holeThrowsArray.length; j++) {
          holeThrowsArray[j].push(playerScoringRounds[i][j].holeThrows);
        }
      };
      // console.log('holeThrowsArray:', holeThrowsArray);

      // build the min-max-avg for each hole
      for (let i = 0; i < holeThrowsArray.length; i++) {
        // first the math
        let minNumber = Math.min(...holeThrowsArray[i]);
        let maxNumber = Math.max(...holeThrowsArray[i]);
        let avgNumber = holeThrowsArray[i].reduce((a,b) => a + b) / holeThrowsArray[i].length;
        // round down to nearest integer, i.e. no decimals
        let gridAvgNumber = Math.floor(Number(avgNumber));
        // restrict to one decimal place
        let realAvg = parseFloat(avgNumber.toFixed(1));
        // hole number as string
        let hn = i + 1;
        let holeNumber = 'Hole ' + hn.toString();

        minMaxAvg.push({hole: holeNumber, minimum: minNumber, maximum: maxNumber, gridaverage: gridAvgNumber, realavg: realAvg});
      };

      // need to get the holePar into minMaxAvg for display purposes
      for (let i = 0; i < playerScoringRounds.length; i++) {
        for (let j = 0; j < minMaxAvg.length; j++) {
          minMaxAvg[j].par = playerScoringRounds[i][j].holePar;
        };
      };

      stats.buildHoleGraph(chosenCourseName, minMaxAvg);

    }, //end buildHoleData()

    buildCourseData(chosenCourseRounds) {
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

      // get the last hole of each round and bunge it into an array to later build an overall score comparison
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
      let bestScore = Math.min(...overAllScore);
      let worstScore = Math.max(...overAllScore);
      let averageScore = overAllScore.reduce((a,b) => a + b) / overAllScore.length;
      // round down to nearest integer
      let gridAverageScore = Math.floor(Number(averageScore));
      // restrict to one decimal place
      let realAverageScore = parseFloat(averageScore.toFixed(1));
      
      minMaxAvgScore.push({minimum: bestScore, maximum: worstScore, gridaverage: gridAverageScore, realavg: realAverageScore});
      // console.log('minMaxAvgScore', minMaxAvgScore);

      stats.buildCourseGraph(chosenCourseName, minMaxAvgScore)
    }, // end buildCourseData()

    buildHoleGraph(chosenCourseName, minMaxAvg) {

      let graphDiv = document.querySelector('.holes');
      let graphDivHeader = document.querySelector('.holes-header');
      let graphDivChart = document.querySelector('.holes-chart');
      let headerOutput = '';
      let chartOutput = '';


      console.log('minMaxAvg:', minMaxAvg);

      headerOutput = `<p class="holes-header-text">${chosenCourseName}</p><p>Hole-By-Hole</p>`;

      // https://joshcollinsworth.com/blog/css-grid-bar-charts
      minMaxAvg.forEach((hole) => {
        chartOutput += `
          <div class="holes-chart-hole">
            <h4 class="holes-chart-hole-name" style="grid-column: span ${hole.maximum}">
              ${hole.hole} 
              <span class="holes-chart-hole-name-par">Par: ${hole.par}</span>
            </h4>
            <p style="grid-column-end: span ${hole.minimum}">
              Best: <span>${hole.minimum}</span>
            </p>
            <p style="grid-column-end: span ${hole.maximum}">
              Worst: <span>${hole.maximum}</span>
            </p>
            <p style="grid-column-end: span ${hole.gridaverage}">
              Average: <span>${hole.realavg}</span>
            </p>
          </div>
        `;
      });

      graphDivHeader.innerHTML = headerOutput;
      graphDivChart.innerHTML = chartOutput;

      graphDiv.showModal();

      let closeModal = document.querySelector('.holes-close');
      closeModal.addEventListener('click', (event) => {
        graphDiv.close();
      });

    }, // end buildHoleGraph()

    buildCourseGraph(chosenCourseName, minMaxAvgScore) {
      // console.log(chosenCourseName, minMaxAvgScore);
      let roundDiv = document.querySelector('.course');
      let roundDivHeader = document.querySelector('.course-header');
      let roundDivChart = document.querySelector('.course-chart');
      let roundHeaderOutput = '';
      let roundChartOutput = '';

      roundHeaderOutput = `<p class="course-header-text">${chosenCourseName}</p>`;

      roundChartOutput = `
        <p style="grid-column-end: span ${minMaxAvgScore[0].minimum}">
          Best: <span>${minMaxAvgScore[0].minimum}</span>
        </p>
        <p style="grid-column-end: span ${minMaxAvgScore[0].maximum}">
          Worst: <span>${minMaxAvgScore[0].maximum}</span>
        </p>
        <p style="grid-column-end: span ${minMaxAvgScore[0].gridaverage}">
          Average: <span>${minMaxAvgScore[0].realavg}</span>
        </p>
      `;
      roundDivHeader.innerHTML = roundHeaderOutput;
      roundDivChart.innerHTML = roundChartOutput;

      // roundDiv.classList.toggle('course-display');
      roundDiv.showModal();

      let closeModal = document.querySelector('.course-close');
      closeModal.addEventListener('click', (event) => {
        // roundDiv.classList.remove('course-display');
        roundDiv.close();
      });
    } // end buildHoleGraph()
  }; // end stats{}

  stats.init();
})();
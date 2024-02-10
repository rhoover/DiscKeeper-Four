(() => {
  'use strict';

  const roundHistory = {

    init() {
      async function getRounds() {
        const roundsFetch = await localforage.getItem('savedRounds');
        return roundsFetch;
      };
      getRounds().then(data => {

        if (data) { // if true
          roundHistory.massageRoundData(data);
          roundHistory.manageRoundModal(data);
        } else { // if not true, i.e. null
          roundHistory.noRounds(data);          
        };
      });
    }, // end init()

    massageRoundData(roundsData) {

      //sort by date
      roundsData.sort((a,b) => {
        return new Date(b.roundDate) - new Date(a.roundDate);
      });

      // so there will be only one button for each course, despite how many rounds on each course
      // count how many rounds for each course, and add to new duplicates array of objects
      const deduped = roundsData.reduce((acc, item) => {
        let newItem = acc.find((i) => i.courseName === item.courseName); // check if an item with the current courseName exists
        //Use !newItem, because if you don't find a object - you don't add it in array
        if (!newItem) {
          // create a new object w/ new shape
          // item.name = item.courseName;
          item.count = 1;
          acc.push(item);
        } else {
          // object exists -> update count
          //You find this object and you need add to finded object
          //item.count += 1;
            newItem.count += 1;
        }
        return acc;
      }, []);

      let chooseSection = document.querySelector('.choose');
      let roundsSection = document.querySelector('.items');
      let buttonOutput = '';
      let roundsSectionOutput = '';

      deduped.forEach((course) => {
        buttonOutput += `
        <button class="button" data-course="${course.courseID}">${course.courseName}</button>
        `;
        roundsSectionOutput += `
        <div class="course" data-courseid="${course.courseID}"></div>
        `;
      });

      chooseSection.innerHTML = buttonOutput;
      roundsSection.innerHTML = roundsSectionOutput;

      roundHistory.manageButtons(chooseSection);
      roundHistory.buildRoundsList(roundsData);
    }, // massageRoundData()

    manageButtons(chooseSection) {

      let courseTargets = document.querySelectorAll('.course');

      chooseSection.addEventListener('click', buttonClick);
      function buttonClick(event) {

        let clickedButton = event.target;

        courseTargets.forEach((target) => {
          if (target.classList.contains('course-visible')) {
            target.classList.remove('course-visible');
          };

          if (clickedButton.dataset.course === target.dataset.courseid) {

            if (document.startViewTransition) {
              document.startViewTransition(() => target.classList.add('course-visible'));
            } else {
              target.classList.add('course-visible');
            };
          }; // end if
        }); // end forEach
      }; // end listener
    },

    buildRoundsList(roundsData) {

      let courseDivs = document.querySelectorAll('.course');

      for (let i = 0; i < courseDivs.length; i++) {
        for (let j = 0; j < roundsData.length; j++) {
          if (roundsData[j].courseID === courseDivs[i].dataset.courseid) {

            courseDivs[i].innerHTML += `
            <div class="round" data-roundid="${roundsData[j].roundID}">
              <p class="round-header">${roundsData[j].courseName} <span>${roundsData[j].roundDate}</span></p>
              <p class="round-score"><span>${roundsData[j].players[0].finalScore}</span> from ${roundsData[j].players[0].finalThrows} throws   ➤</p>
            </div>
          `;
          };
        };
      };

    }, // end buildRoundsList()


    manageRoundModal(roundsData) {
      let roundModal = document.querySelector('.roundmodal');
      let chosenRound = document.querySelector('.items');

      let roundModalHeader = document.querySelector('.roundmodal-header');
      let roundModalHeaderOutput = '';

      let holesElement = document.querySelector('.roundmodal-holes');
      let holesElementOutput = '';

      let closeModal = document.querySelector('.roundmodal-header');

      let clickedRoundID = '';
      let round = {};

      chosenRound.addEventListener('click', choseRound);
      function choseRound(event) {
        clickedRoundID = event.target.closest('.round').getAttribute('data-roundid');

        round = roundsData.find((round) => round.roundID == clickedRoundID);
        console.log(round);

        roundModalHeaderOutput += `<p>${round.courseName}<br /> <span>${round.roundDate}<span></p> <p class="close">Close</p>`;

        let primaryPlayerScores = round.players.map((player) => {
          if (player.primary == true) {
            return player.courseHoles;
          }
        });
        let scoreData = primaryPlayerScores[0];
        // console.log('primary scores', scoreData);

        for (let i = 0; i < scoreData.length; i++) {
          holesElementOutput += `
          <div class="roundmodal-hole">
            <p class="roundmodal-hole-number">${scoreData[i].holeNumber}</p>
            <p class="roundmodal-hole-par">Par:   ${scoreData[i].holePar}</p>
            <p class="roundmodal-hole-throws">Hole Throws:   ${scoreData[i].holeThrows}</p>
            <p class="roundmodal-hole-score">Hole Score:   ${scoreData[i].holeOverUnder}</p>
            <p class="roundmodal-hole-roundthrows">Round Throws:   ${scoreData[i].roundThrows}</p>
            <p class="roundmodal-hole-roundscore">Round Score:   ${scoreData[i].roundOverUnder}</p>
          </div>
          `;
        };

        roundModalHeader.innerHTML = roundModalHeaderOutput;
        holesElement.innerHTML = holesElementOutput;

        roundModal.classList.toggle('roundmodal-open');
      }; // end choseRound()

      closeModal.addEventListener('click', (event) => {
        roundModal.classList.toggle('roundmodal-open');
        // adjusting modal inner DOM
        roundModalHeaderOutput = '';
        holesElementOutput = '';
        roundModalHeader.innerHTML = roundModalHeaderOutput;
        holesElement.innerHTML = holesElementOutput;
      });

    }, // end roundModal()

    noRounds(roundsData) {
      let roundsWarning = document.querySelector('.roundhistory');
      let statsEncourage = document.querySelector('.stats');
      let roundItems = document.querySelector('.items')
      let warningOutput = "";

      if (roundsData == null) {

        statsEncourage.remove();
        roundItems.remove();

        warningOutput += `
          <p class="warning">You don't have any rounds saved yet,</p>
          <a href="pages/roundsetup.html" class="warning-link">Go ahead and start one!  ➤</a>
        `;
        roundsWarning.innerHTML += warningOutput;
      };

    }, // end noRounds()
  };

  roundHistory.init();
})();
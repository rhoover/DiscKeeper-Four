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

      // dedupe so only one courseName appearance in choose section
      const deduped = roundsData.filter((obj, index) => {
        return index === roundsData.findIndex(o => obj.courseName === o.courseName)
      });

      roundHistory.buildChooseCourse(deduped);
      roundHistory.buildRoundsList(roundsData);
      roundHistory.roundScoresModal(roundsData);
    }, // massageRoundData()

    buildChooseCourse(deduped) {

      let chooseSection = document.querySelector('.choose');
      let roundsSection = document.querySelector('.rounds');
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
    }, // end buildChooseCourse

    manageButtons(chooseSection) {

      let courseTargets = document.querySelectorAll('.course');

      // section where course buttons live
      chooseSection.addEventListener('click', buttonClick);
      function buttonClick(event) {

        let clickedButton = event.target;

        courseTargets.forEach((target) => {

          // animate out list of rounds
          if (target.classList.contains('course-visible')) {
            if (document.startViewTransition) {
              document.startViewTransition(() => target.classList.remove('course-visible'));
            } else {
              target.classList.remove('course-visible');
            }; // end if view transition capability exists
          };

          if (clickedButton.dataset.course === target.dataset.courseid) {

          // animate in list of rounds
            if (document.startViewTransition) {
              document.startViewTransition(() => target.classList.add('course-visible'));
            } else {
              target.classList.add('course-visible');
            }; // end if view transition capability exists
          }; // end if course = course
        }); // end forEach
      }; // end listener
    },

    buildRoundsList(roundsData) {

      let courseDivs = document.querySelectorAll('.course');

      let dateOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };

      for (let i = 0; i < courseDivs.length; i++) {
        for (let j = 0; j < roundsData.length; j++) {
          if (roundsData[j].courseID === courseDivs[i].dataset.courseid) {
            let dateReadable = new Date(roundsData[j].roundDate).toLocaleDateString("en-US", dateOptions);

            courseDivs[i].innerHTML += `
            <div class="round" data-roundid="${roundsData[j].roundID}">
              <div class="round-header">
                <p class="round-header-name">${roundsData[j].courseName}</p>
                <p class=round-header-date> ${dateReadable}</p>
              </div>
              <p class="round-score"><span>Scored ${roundsData[j].players[0].finalScore}</span><br /><br /><span>from</span><br /><br /><span> ${roundsData[j].players[0].finalThrows} throws</span></p><p class="round-arrow">Details  ➤</p>
            </div>
          `;
          };
        };
      };

    }, // end buildRoundsList()

    roundScoresModal(roundsData) {

      console.log(roundsData);
      let courseSection = document.querySelector('.rounds');
      let roundModal = document.querySelector('.round-modal');
      let roundModalHeader = document.querySelector('.round-modal-header');
      let closeButton = document.querySelector('.round-modal-close');
      let holesSection = document.querySelector('.round-modal-holes');

      let dateOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };

      courseSection.addEventListener('click', (event) => {

        // get the roundid
        let clickedRound = event.target.closest('[data-roundid]').dataset.roundid;
        // use the roundid to find the correct round in the array
        let roundData = roundsData.find((round) => round.roundID === clickedRound);
        // make the date readable
        let dateReadable = new Date(roundData.roundDate).toLocaleDateString("en-US", dateOptions);
        // array for pesentation
        let holesArray = roundData.players[0].courseHoles;

        roundModalHeader.innerHTML = `<p>${roundData.courseName}</p> <p>${dateReadable}</p>`;

        // present the holes data in the modal
        for (let i = 0; i < holesArray.length; i++) {
          holesSection.innerHTML += `
            <div class="round-modal-hole">
              <p>Hole ${holesArray[i].holeNumber}</p>
              <p>Par: ${holesArray[i].holePar}</p>
              <p>Hole Throws: ${holesArray[i].holeThrows}</p>
              <p>Hole Score: ${holesArray[i].holeOverUnder}</p>
              <p>Round Throws: ${holesArray[i].roundThrows}</p>
              <p>Round Score: ${holesArray[i].roundOverUnder}</p>
            </div>
          `;
          
        };

        // bring it
        roundModal.showModal();

      });


      // close it and delete the interior info
      closeButton.addEventListener('click', (event) => {
        roundModal.close();
        holesSection.innerHTML = "";
      });

    }, // end roundScoresModal()

    noRounds(roundsData) {
      const roundsWarning = document.querySelector('.roundhistory');
      const statsEncourage = document.querySelector('.stats');
      const roundItems = document.querySelector('.rounds');
      const chooseElement = document.querySelector('.choose');
      let warningOutput = "";

      if (roundsData == null) {

        statsEncourage.remove();
        roundItems.remove();
        chooseElement.remove();

        warningOutput += `
          <p class="warning">You don't have any rounds saved yet,</p>
          <a href="/pages/roundsetup.html" class="warning-link">Go ahead and start one!  ➤</a>
        `;
        roundsWarning.innerHTML += warningOutput;
      };

    }, // end noRounds()
  };

  roundHistory.init();
})();
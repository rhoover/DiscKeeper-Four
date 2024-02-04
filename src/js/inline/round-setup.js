(() => {
  'use strict';

  const setup = {

    init() {
      
      // get both data lists
      async function getData() {
        const courseFetch = await localforage.getItem('courseList');
        const playerFetch = await localforage.getItem('playerList');
        return [courseFetch, playerFetch];
      };
      getData().then(fetchedData => {
        const displayedPlayers = document.querySelector('.roundsetup-selections-players');

        fetchedData[1].forEach((player) => {
          if (player.primary == true) {
            displayedPlayers.innerHTML = player.nameFirst;
          };
        });

        setup.dataCheck(fetchedData[0], fetchedData[1]);
        setup.assembleFinalData(fetchedData[1]);
      });

    }, // end init()

    dataCheck(courseList, playerList) {

      if (courseList == null) {
        const noCoursesModal = document.querySelector('.roundsetup-modal-nocourse')
        noCoursesModal.classList.add('roundsetup-modal-nocourse-display');
      } else {
        setup.buildCoursesModal(courseList);
        setup.buildPlayersModal(playerList);
        // setup.assembleFinalData(playerList);
      };
    }, // end dataCheck()

    buildCoursesModal(courseList) {

      let insertCoursesHere = document.querySelector('.roundsetup-modal-courses-list');
      let coursesOutput = "";

      courseList.forEach(function(course) {
        coursesOutput += `
        <p class="roundsetup-modal-courses-item" data-courseID="${course.courseID}">${course.courseName}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="roundsetup-modal-courses-item-checkmark"><path d="M170.718 216.482L141.6 245.6l93.6 93.6 208-208-29.118-29.118L235.2 279.918l-64.482-63.436zM422.4 256c0 91.518-74.883 166.4-166.4 166.4S89.6 347.518 89.6 256 164.482 89.6 256 89.6c15.6 0 31.2 2.082 45.764 6.241L334 63.6C310.082 53.2 284.082 48 256 48 141.6 48 48 141.6 48 256s93.6 208 208 208 208-93.6 208-208h-41.6z"/></svg>
        </p>
        `;
      }); // end for loop

      insertCoursesHere.innerHTML = coursesOutput;

      setup.manageCoursesModal(courseList);

    }, // end buildCoursesModal()

    manageCoursesModal(courseList) {
      let chooseCourseButton = document.querySelector('[rh-button="courses"]');

      let coursesModal = document.querySelector('.roundsetup-modal-courses');
      let courseListElement = document.querySelector('.roundsetup-modal-courses-list');
      let coursesFooter = document.querySelector('.roundsetup-modal-courses-footer');

      let clickedCourse = {};
      let clickedCourseID = '';
      let chosenCourse = [];

      let mainDisplaySlot = document.querySelector('.roundsetup-selections-course');
      let mainDisplayText = '';


      chooseCourseButton.addEventListener('click', (event) => {
        document.querySelector('.roundsetup-modal-courses').classList.add('roundsetup-modal-courses-display');
      });

      courseListElement.addEventListener('click', (event) => {

        clickedCourseID = event.target.closest('p').getAttribute('data-courseid');
        clickedCourse = courseList.find((course) => course.courseID === clickedCourseID);

        chosenCourse.push(clickedCourse);

        event.target.closest('p').classList.toggle('roundsetup-modal-courses-item-clicked');

      });

      coursesFooter.addEventListener('click', (event) => {
        let action = event.target.getAttribute('data-action');

        switch (action) {
          case 'close':
            coursesModal.classList.remove('roundsetup-modal-courses-display');

          break;
          case 'save':

            // first dedupe chosenCourse array
            //https://stackoverflow.com/questions/43505967/completely-removing-duplicate-items-from-an-array
            let dedupeCourses = chosenCourse.filter(
              Map.prototype.get,
              chosenCourse.reduce((m,v) => m.set(v, !m.has(v)), new Map)
            );

            // then add some meta info of the round
            dedupeCourses[0].roundID = (+new Date).toString(36);
            dedupeCourses[0].roundDate = new Date().toLocaleDateString('en-US');

            // then save to idb
            localforage.setItem('chosenCourse', dedupeCourses[0]);

            // then add to main screen
            mainDisplaySlot.innerHTML = `${dedupeCourses[0].courseName}`;

            // then close modal
            coursesModal.classList.remove('roundsetup-modal-courses-display');
          break;
        
          default:
            break;
        }
      });
    }, // end manageCoursesModal()

    buildPlayersModal(playerList) {

      let insertPlayersHere = document.querySelector('.roundsetup-modal-players-list');
      let playersOutput = '';
      let primaryPlayer = playerList.filter((player) => player.primary == true);

      for (let i = 0; i < playerList.length; i++) {
        if (playerList[i].primary == true) {
          playerList.splice(i, 1);
        };
      };

      playerList.forEach((player) => {
        playersOutput += `
        <p class="roundsetup-modal-players-item" data-playerID="${player.playerID}">${player.nameFirst}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="roundsetup-modal-players-item-checkmark"><path d="M170.718 216.482L141.6 245.6l93.6 93.6 208-208-29.118-29.118L235.2 279.918l-64.482-63.436zM422.4 256c0 91.518-74.883 166.4-166.4 166.4S89.6 347.518 89.6 256 164.482 89.6 256 89.6c15.6 0 31.2 2.082 45.764 6.241L334 63.6C310.082 53.2 284.082 48 256 48 141.6 48 48 141.6 48 256s93.6 208 208 208 208-93.6 208-208h-41.6z"/></svg>
        </p>
        `;
      });

      insertPlayersHere.innerHTML = playersOutput;

      setup.managePlayersModal(playerList, primaryPlayer);
    }, // end buildPlayersModal()

    managePlayersModal(playerList, primaryPlayer) {

      let morePlayersButton = document.querySelector('[rh-button="players"]');

      let playersModal = document.querySelector('.roundsetup-modal-players');
      let playersListElement = document.querySelector('.roundsetup-modal-players-list');
      let playersFooter = document.querySelector('.roundsetup-modal-players-footer');

      let playerDisplaySlot = document.querySelector('.roundsetup-selections-players');
      let playerDisplayText = '';

      let clickedPlayer = {};
      let clickedPlayerID = '';
      let chosenPlayers = [];

      chosenPlayers.push(primaryPlayer[0]);

      // save for final assembly if no more players are chosen, doing this ahaead of time
      localforage.setItem('chosenPlayers', chosenPlayers);

      morePlayersButton.addEventListener('click', (event) => {
        playersModal.classList.add('roundsetup-modal-players-display');
      });

      playersListElement.addEventListener('click', (event) => {

        clickedPlayerID = event.target.closest('p').getAttribute('data-playerid');
        clickedPlayer = playerList.find((player) => player.playerID === clickedPlayerID);

        chosenPlayers.push(clickedPlayer);

        event.target.closest('p').classList.toggle('roundsetup-modal-players-item-clicked');
      });

      playersFooter.addEventListener('click', (event) => {

        let action = event.target.getAttribute('data-action');

        switch (action) {
          case 'close':
            playersModal.classList.remove('roundsetup-modal-players-display');
          break;
          case 'save':

            // first dedupe chosenPlayers array
            //https://stackoverflow.com/questions/43505967/completely-removing-duplicate-items-from-an-array
            let dedupeResult = chosenPlayers.filter(
              Map.prototype.get,
              chosenPlayers.reduce((m,v) => m.set(v, !m.has(v)), new Map)
            );

            // then save to idb
            localforage.setItem('chosenPlayers', dedupeResult);

            // then add to main screen
            for (let i = 0; i < dedupeResult.length; i++) {
              if (dedupeResult[i].primary == false) {
                playerDisplayText = dedupeResult[i].nameFirst;
                playerDisplaySlot.innerHTML += `, ${playerDisplayText}`;                
              };
            };
            // then close modal
            playersModal.classList.remove('roundsetup-modal-players-display');
          break;        
          default:
            break;
        };
      });
    }, // end managePlayersModal()

    assembleFinalData(playerList) {
      // thid needs to get something fed into it from init() even though it's not being used
      let submitButton = document.querySelector('[data-goscore]');

      submitButton.addEventListener('click', () => {

        async function getChosenData() {
          const players = await localforage.getItem('chosenPlayers');
          const course = await localforage.getItem('chosenCourse');
          return [players, course];
        };

        getChosenData().then(data => {
          let players = data[0];
          let course = data[1];

          for (let i = 0; i < players.length; i++) {
            // add course meta for round saves
            players[i].courseName = course.courseName;
            players[i].courseID = course.courseID;
            players[i].roundDate = new Date().toLocaleDateString('en-US');
            // add course holes for scorekeeping purposes
            players[i].courseHoles = course.courseHoles;
          }; // end for loop

          // re-save players new data
          localforage.setItem('chosenPlayers', players);
        }); // end .then
        

        // off to the show
        setTimeout(() => {
          window.location.href = '/pages/roundscoring.html';
        }, 500);

      }); // end listener
    
    } // end assembleFinalData()

  }; // end setup{}

  setup.init();
})();
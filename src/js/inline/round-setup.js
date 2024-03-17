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
        const displayedPlayers = document.querySelector('.selections-players');

        fetchedData[1].forEach((player) => {
          if (player.primary == true) {
            displayedPlayers.innerHTML = player.nameFirst;
          };
        });

        setup.dataCheck(fetchedData[0], fetchedData[1]);
      });

    }, // end init()

    dataCheck(courseList, playerList) {

      if (courseList == null) { // if there are no courses available
        const noCoursesModal = document.querySelector('.modal-nocourse')
        noCoursesModal.classList.add('modal-nocourse-display');
      } else { // otherwised thedre are!
        setup.buildCoursesModal(courseList);
        setup.buildPlayersModal(playerList);
        // setup.assembleFinalData(playerList);
      };
    }, // end dataCheck()

    buildCoursesModal(courseList) {

      let insertCoursesHere = document.querySelector('.modal-courses-list');
      let coursesOutput = "";

      courseList.forEach(function(course) {
        coursesOutput += `
          <label class="modal-courses-item">
            ${course.courseName}
            <input type="radio" name="course" value="${course.courseID}" />
          </label>
        `;
      }); // end for loop

      insertCoursesHere.innerHTML = coursesOutput;

      setup.manageCoursesModal(courseList);

    }, // end buildCoursesModal()

    manageCoursesModal(courseList) {
      // courses button on page to launch everything
      let chooseCourseButton = document.querySelector('[rh-button="courses"]');

      let coursesModal = document.querySelector('.modal-courses');
      let courseListForm = document.querySelector('.modal-courses-list');
      let coursesFooter = document.querySelector('.modal-courses-footer');

      let mainDisplaySlot = document.querySelector('.selections-course');

      chooseCourseButton.addEventListener('click', (event) => {
        document.querySelector('.modal-courses').classList.add('modal-courses-display');
      });

      coursesFooter.addEventListener('click', (event) => {
        // which "button" was clicked
        let action = event.target.getAttribute('data-action');

        // form data collection
        let formCourseData = new FormData(courseListForm);
        let formCourseID = formCourseData.get('course');
        let courseObject = courseList.find(x => x.courseID === formCourseID);

        switch (action) {
          case 'close':
            coursesModal.classList.remove('modal-courses-display');

          break;
          case 'save':

            // add some meta info of the round to course object
            let newRoundID = Math.random().toString(36).substring(2,11);
            newRoundID.toString();
            courseObject.roundID = newRoundID;
            courseObject.roundDate = new Date().toLocaleDateString('en-US');

            // then save to idb
            localforage.setItem('chosenCourse', courseObject);

            // then add to main screen
            mainDisplaySlot.innerHTML = `${courseObject.courseName}`;

            // then close modal
            coursesModal.classList.remove('modal-courses-display');
          break;
        
          default:
            break;
        }
      });
    }, // end manageCoursesModal()

    buildPlayersModal(playerList) {

      let insertPlayersHere = document.querySelector('.modal-players-list');
      let playersOutput = '';
      let primaryPlayer = playerList.find(x => x.primary == true);

      for (let i = 0; i < playerList.length; i++) {
        if (playerList[i].primary == true) {
          playerList.splice(i, 1);
        };
      };

      playerList.forEach((player) => {
        playersOutput += `
          <label class="modal-players-item">
            ${player.nameFirst} ${player.nameLast}
            <input type="checkbox" name="player" value="${player.playerID}"/>
          </label>
        `;
      });

      insertPlayersHere.innerHTML = playersOutput;

      setup.managePlayersModal(playerList, primaryPlayer);
    }, // end buildPlayersModal()

    managePlayersModal(playerList, primaryPlayer) {

      // players button on page to launch this
      let morePlayersButton = document.querySelector('[rh-button="players"]');

      let playersModal = document.querySelector('.modal-players');
      let playersFooter = document.querySelector('.modal-players-footer');

      let playerDisplaySlot = document.querySelector('.selections-players');

      let chosenPlayers = [];

      chosenPlayers.push(primaryPlayer);

      // save for final assembly if no more players are chosen, doing this ahead of time
      localforage.setItem('chosenPlayers', chosenPlayers);

      morePlayersButton.addEventListener('click', (event) => {
        playersModal.classList.add('modal-players-display');
      });

      playersFooter.addEventListener('click', (event) => {
        // which "button" was clicked
        let action = event.target.getAttribute('data-action');

        let checkedBoxes = document.querySelectorAll("input[type='checkbox']:checked");

        switch (action) {
          case 'close':
            playersModal.classList.remove('modal-players-display');
          break;
          case 'save':
            // find the players from the checked boxes
            for (let i = 0; i < checkedBoxes.length; i++) {
              let formPlayerID = checkedBoxes[i].getAttribute('value');
              let playerObject = playerList.find(x => x.playerID === formPlayerID);
              // push checked player into the array
              chosenPlayers.push(playerObject);
              // then add names to main screen
              playerDisplaySlot.innerHTML += `, ${playerObject.nameFirst}, `;
            };

            // then save to idb
            localforage.setItem('chosenPlayers', chosenPlayers);


            // then close modal
            playersModal.classList.remove('modal-players-display');
          break;        
          default:
            break;
        };
      });
    }, // end managePlayersModal()

  }; // end setup{}

  setup.init();

  function assembleFinalData() {
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

    }); // end submitButton listener
  
  } // end assembleFinalData()
  assembleFinalData();
})();
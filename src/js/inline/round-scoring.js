(() => {
  'use strict';

  const roundscoring = {

    init() {
      async function getChosenData() {
        const courseFetch = await localforage.getItem('chosenCourse');
        const playersFetch = await localforage.getItem('chosenPlayers');
        return [courseFetch, playersFetch]; // [ data[0], data[1] ]
      };
      getChosenData().then(data => {
          //send down course data (courseFetch)
          roundscoring.seedMeta(data[0]);
  
          // send down player data (playersFetch)
          roundscoring.seedConfirm(data[1]);
          roundscoring.seedPlayerScores(data[1]);
  
          let padNumbers = document.querySelectorAll('.numpad-button');
          roundscoring.scoring(padNumbers, data[0], data[1]);
        });
    }, // end init()

    seedMeta(course) {
      // console.log(course);
      document.querySelector('[data-courseName]').innerHTML = course.courseName;
      document.querySelector('[data-holeNumber]').innerHTML = course.courseHoles[0].holeNumber;
      document.querySelector('[data-parNumber]').innerHTML = course.courseHoles[0].holePar;
    }, // end seedMeta()

    seedConfirm(players) {
      let names = document.querySelectorAll('[data-playerConfirmName]');
      names.forEach(function(name) {
        name.innerHTML = players[0].nameFirst;
      });
    }, // end seedConfirm()

    seedPlayerScores(players) {
      let scoringSection = document.querySelector('.players');
      let playersOutput = "";

      players.forEach(function(player, index) {
        playersOutput += `
        <div class="players-player">
        <p class="players-name" data-player-name">${player.nameFirst}</p>
        <p class="players-score" data-player-score></p>
        </div>
        `;
      });
      scoringSection.innerHTML = playersOutput;
    }, // end seedPlayerScores()

    scoring(numberPad, course, players) {

      // declare all the things
      let throwsBox = document.querySelector('[data-throws]');
      //clear button on numpad
      let clearNumpad = document.querySelector('[data-clear]');
      // submit throws for hole
      let submitThrowsButton = document.querySelector('[data-submit]');     
      // initialize indices for moving through players and holes 
      let activePlayerIndex = 0;
      let roundIndex = 0;
      // because
      let activePlayer;
      // elements, meta
      let holeNumber = document.querySelector('[data-holenumber]');
      let holePar = document.querySelector('[data-parnumber]');
      // elements, scores
      let activePlayerName = document.querySelectorAll('[data-playerConfirmname]');
      let playerScoreCurrent = document.querySelectorAll('[data-player-score]');
      let nextHoleIndex;
      // finishing up
      let finishedModal;
      let whereInPlayerList;

      throwsBox.innerHTML = "";

      // punching the pad and showing it in the throws box
      numberPad.forEach(number => {
        number.addEventListener('click', (event) => {
          // a ternery in case there's a double digit throw for the hole
          throwsBox.innerHTML ? throwsBox.innerHTML += number.innerHTML : throwsBox.innerHTML = number.innerHTML;
        });
      });

      // Clear Button on NumPad
      clearNumpad.addEventListener('click', (event) => {
        throwsBox.innerHTML = "";
      });

      // and by submit we mean update both the DOM display and the js objects
      submitThrowsButton.addEventListener('click', event => {
        
        if (throwsBox.innerHTML) {

          // deep copy necessary
          activePlayer = JSON.parse(JSON.stringify(players[activePlayerIndex]));

          // this is it!! calling the function just below
          scores(parseInt(throwsBox.innerHTML, 10), activePlayer);
        };
      }); // end submit click

      function scores(incomingThrows, activePlayer) {
        // the parameters come from clicking the submit button above

        if (roundIndex < course.courseHoles.length -1) { // if not the last hole

          // then update activePlayer object with new scoring data
          activePlayer.courseHoles[roundIndex].holeThrows = incomingThrows;
          // add hole throws to roud throws
          activePlayer.courseHoles[roundIndex].roundThrows += incomingThrows;
          activePlayer.courseHoles[roundIndex].holeOverUnder = (incomingThrows - activePlayer.courseHoles[roundIndex].holePar);
          // add hole over-under to round over-under
          activePlayer.courseHoles[roundIndex].roundOverUnder += activePlayer.courseHoles[roundIndex].holeOverUnder;

          // then write new score to displayed scores
          playerScoreCurrent[activePlayerIndex].innerHTML = activePlayer.courseHoles[roundIndex].roundOverUnder;

          // then UI goodness: different colors for different scores
          let roundScore = activePlayer.courseHoles[roundIndex].roundOverUnder;
          switch (true) {
            // over par
            case roundScore >= 0:
              playerScoreCurrent[activePlayerIndex].classList.remove('players-score-under');
              playerScoreCurrent[activePlayerIndex].classList.remove('players-score-par');

              playerScoreCurrent[activePlayerIndex].classList.add('players-score-over');
            break;

            // par
            case roundScore == 0:
              playerScoreCurrent[activePlayerIndex].classList.remove('players-score-over');
              playerScoreCurrent[activePlayerIndex].classList.remove('players-score-under');

              playerScoreCurrent[activePlayerIndex].classList.add('players-score-par');
            break;

            // under par
            case roundScore <= 0:
              playerScoreCurrent[activePlayerIndex].classList.remove('players-score-over');
              playerScoreCurrent[activePlayerIndex].classList.remove('players-score-par');
              
              playerScoreCurrent[activePlayerIndex].classList.add('players-score-under');
            break;

            default:
            break;
          };

          // then seed next hole for active player
          nextHoleIndex = roundIndex + 1;
          activePlayer.courseHoles[nextHoleIndex].roundThrows = activePlayer.courseHoles[roundIndex].roundThrows;
          activePlayer.courseHoles[nextHoleIndex].roundOverUnder = activePlayer.courseHoles[roundIndex].roundOverUnder;

          // then deep copy of original chosenPlayers array necessary after modifying referenced activePlayer object
          players[activePlayerIndex] = JSON.parse(JSON.stringify(activePlayer));
          
          // then bump to next player if exists to become activePlayer
          whereInPlayerList = activePlayerIndex < players.length - 1;
          switch (whereInPlayerList) {
            // if true, it is not the last player in the list
            case true:
              activePlayerIndex++;
              activePlayer = players[activePlayerIndex];
              
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerHTML = players[activePlayerIndex].nameFirst;
              });
            break;

            // it is either the last player in the list or a single player
            case false:          
              activePlayerIndex = 0;
              roundIndex++;
  
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerHTML = players[activePlayerIndex].nameFirst;
              });
  
              // update displayed hole meta info at the top of the screen
              holeNumber.innerHTML = course.courseHoles[roundIndex].holeNumber;
              holePar.innerHTML = course.courseHoles[roundIndex].holePar;
              
            break;
          
            default:
            break;
          }; // end switch

        //
        //
        } else { // then it is indeed the last hole
        //
        //

          // then update activePlayer object with new scoring data
          activePlayer.courseHoles[roundIndex].holeThrows = incomingThrows;
          // add hole throws to roud throws
          activePlayer.courseHoles[roundIndex].roundThrows += incomingThrows;
          activePlayer.courseHoles[roundIndex].holeOverUnder = (incomingThrows - activePlayer.courseHoles[roundIndex].holePar);
          // add hole over-under to round over-under
          activePlayer.courseHoles[roundIndex].roundOverUnder += activePlayer.courseHoles[roundIndex].holeOverUnder;

          //
          // not seeding the next hole, as there is no next hole
          //

          // then deep copy of original chosenPlayers array necessary after modifying referenced activePlayer object
          players[activePlayerIndex] = JSON.parse(JSON.stringify(activePlayer));

          // then bump to next player if exists to become activePlayer
          whereInPlayerList = activePlayerIndex < players.length - 1;
          switch (whereInPlayerList) {
            // if true, it is not the last player in the list
            case true:
              activePlayerIndex++;
              activePlayer = players[activePlayerIndex];
              
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerHTML = players[activePlayerIndex].nameFirst;
              });
            break;

            // it is either the last player in the list or a single player on last hole
            case false:          
              activePlayerIndex = 0;
  
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerHTML = players[activePlayerIndex].nameFirst;
              });
  
              // update displayed hole meta info at the top of the screen
              holeNumber.innerHTML = course.courseHoles[roundIndex].holeNumber;
              holePar.innerHTML = course.courseHoles[roundIndex].holePar;

              // finishing up
              // then seed the finishing modal
              roundscoring.seedFinishedModal(course, players, roundIndex);

              // then bring the modal in
              setTimeout(() => {
                finishedModal = document.querySelector('.modal');
                finishedModal.classList.toggle('modal-open');
              }, 300);
              
            break;
          
            default:
            break;
          }; // end switch
          
        }; // end if-else for for wether or not it's the last hole
        
        // start all over again
        throwsBox.innerHTML = "";
        
      }; // end scores function

    }, // end scoring()
    
    seedFinishedModal(course, players, roundIndex) {
      let insertRoundDataHere = document.querySelector('[data-rounddata]');
      let roundDataOutput = "";

      roundDataOutput = `
        <h5 class="modal-round-header">${course.courseName}</h5>
        <p class="modal-round-date">${course.roundDate}</p>`;

      players.forEach(function(player) {
        player.finalScore = player.courseHoles[roundIndex].roundOverUnder;
        player.finalThrows = player.courseHoles[roundIndex].roundThrows;

        roundDataOutput += `
        <div class="modal-player">
        <p class="modal-player-name">${player.nameFirst}</p>
        <p class="modal-player-score">${player.finalScore}</p>
        <p class="modal-player-throws">From ${player.finalThrows} Throws</p>
        </div>
        `;
      });
      insertRoundDataHere.innerHTML = roundDataOutput;
      roundscoring.manageFinishedModal(course, players, roundIndex);

    }, // end seedFinishedModal()

    manageFinishedModal(course, players) {
      let closeButton = document.querySelector('.modal-footer-close-icon');
      let saveButton = document.querySelector('.modal-footer-save-icon');
      let savedRound = {};
      let savedRoundsArray = [];

      savedRound = {
        players: players,
        courseName: course.courseName,
        courseID: course.courseID,
        roundID: course.roundID,
        roundDate: new Date().toLocaleDateString('en-US')
      };

      // footer actions
      saveButton.addEventListener('click', saveButtonListener); 
      function saveButtonListener(event) {

        async function getSavedRounds() {
          const rounds = await localforage.getItem('savedRounds');
          return(rounds);
        };
        getSavedRounds().then(data => {
          if (data) {
            data.splice(0, 0, savedRound);
            roundscoring.storage(data, course);
          } else {
            savedRoundsArray.splice(0, 0, savedRound);
            console.log(savedRoundsArray);
            roundscoring.storage(savedRoundsArray, course);
          };
        }); // end .then
        document.querySelector('.modal').classList.remove('modal-open');
      };// end save button listener

      closeButton.addEventListener('click', event => {
        document.querySelector('.modal').classList.remove('modal-open');
      });

    }, // end manageFinishedModal()

    storage(incomingSavedRoundData, course) {

      // update courseList here for how many rounds scored count on courseList page
      async function getCourses() {
        const coursesFetch = await localforage.getItem('courseList');
        return coursesFetch
      };
      getCourses().then(data => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].courseID == course.courseID) {
            data[i].roundsScored++;
          };          
        };
        
        localforage.setItem('courseList', data);
      });

      localforage.setItem('savedRounds', incomingSavedRoundData);

      // remove chosen stuff for this round
      localforage.removeItem('chosenCourse');
      localforage.removeItem('chosenPlayers');
      
      // off to round history page
      setTimeout(() => {
        window.location.href = 'roundhistory';
      }, 1000);
    } // end storage()
  }; //end const roundscoring{}

  roundscoring.init();
})();
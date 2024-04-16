(() => {
  'use strict';

  const createNewPlayer = {

    init() {

      let formEl = document.querySelector('.createplayer-form');

      // get player list
      async function getPlayerList() {
        const idbData = await localforage.getItem('playerList');
        return idbData;
      };
      getPlayerList()
        .then(playerList => {
          createNewPlayer.setUpPlayerObject(playerList, formEl);
        });

    }, // end init()

    setUpPlayerObject(playerList, incomingFormEl) {

      let nameObject = {};
      const existsDialog = document.querySelector('.createplayer-exists');

      incomingFormEl.addEventListener('submit', createPlayer);
      function createPlayer(event) {
        event.preventDefault();
        const formData = new FormData(incomingFormEl);
        
        // object skeleton
        nameObject = {
          nameFirst: formData.get('playerNameFirst'),
          nameLast: formData.get('playerNameLast')
        };

        if (playerList !==  null) {
          if (playerList.find(x => x.nameFirst == nameObject.nameFirst && playerList.find(x => x.nameLast == nameObject.nameLast))) {
            console.log('firstname', playerList.find(x => x.nameFirst == nameObject.nameFirst));
            console.log('lastname', playerList.find(x => x.nameLast == nameObject.nameLast));
            createNewPlayer.dialogBehavior(existsDialog);
          } else {
            createNewPlayer.addPlayerMetaData(playerList, nameObject);
          };
        } else {
          createNewPlayer.addPlayerMetaData(playerList, nameObject);
        };
      };
    }, // end setUpPlayerObject()

    addPlayerMetaData(playerList, nameObject) {
      let newPlayerID = Math.random().toString(36).substring(2,11);
      newPlayerID.toString();

      let playerMetaInfo = {
        nameFirst: nameObject.nameFirst,
        nameLast: nameObject.nameLast,
        playerID: newPlayerID,
        playerCreated: new Date().toLocaleDateString('en-US')
      };

      createNewPlayer.primaryPlayer(playerList, playerMetaInfo);
    }, // end addPlayerMetaData()

    primaryPlayer(playerList, incomingPlayerData) {

      if (playerList) { // the list does exist
        incomingPlayerData.primary = false;
        playerList.push(incomingPlayerData);        
      } else { // the list does not exist
        playerList = [];
        incomingPlayerData.primary = true;
        playerList.push(incomingPlayerData);          
      };

      createNewPlayer.storePlayer(playerList);
    }, // end primaryPlayer()

    storePlayer(finishedList) {
      let success = document.querySelector('.createplayer-success');

      localforage.setItem('playerList', finishedList);

      createNewPlayer.dialogBehavior(success);
    }, // end storePlayer()

    dialogBehavior(whichDialog) {

      const formElement = document.querySelector('.createplayer-form');
      const successButton = document.querySelector('.createplayer-success-button');
      const existsButton = document.querySelector('.createplayer-exists-button');

      whichDialog.showModal();

      successButton.addEventListener('click', () => {
        formElement.reset();
        whichDialog.close();
      });

      existsButton.addEventListener('click', () => {
        formElement.reset();
        whichDialog.close();
      });
    } // end dialogBehavior()
  };
  createNewPlayer.init();
})();
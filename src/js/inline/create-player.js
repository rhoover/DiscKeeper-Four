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

      incomingFormEl.addEventListener('submit', createPlayer);
      function createPlayer(event) {
        event.preventDefault();
        const formData = new FormData(incomingFormEl);
        nameObject = {
          firstName: formData.get('playerNameFirst'),
          lastName: formData.get('playerNameLast')
        };
        createNewPlayer.addPlayerMetaData(playerList, nameObject);
      };
    }, // end setUpPlayerObject()

    addPlayerMetaData(playerList, nameObject) {
      let newPlayerID = Math.random().toString(36).substring(2,11);
      newPlayerID.toString();

      let playerMetaInfo = {
        nameFirst: nameObject.firstName,
        nameLast: nameObject.lastName,
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
      
      //some UI assistance
      success.classList.add('createplayer-success-display');

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } // end storePlayer()
  };
  createNewPlayer.init();
})();
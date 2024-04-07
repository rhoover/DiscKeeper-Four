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

        if (playerList.find(x => x.nameFirst == nameObject.nameFirst && playerList.find(x => x.nameLast == nameObject.nameLast))) {
          console.log('firstname', playerList.find(x => x.nameFirst == nameObject.nameFirst));
          console.log('lastname', playerList.find(x => x.nameLast == nameObject.nameLast));
          createNewPlayer.dialogBehavior(existsDialog);
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
      const successButton = document.querySelector('.createplayer-success');
      const existsButton = document.querySelector('.createplayer-exists');

      whichDialog.showModal();

      // https://www.linkedin.com/pulse/how-make-modals-html-dialogtag-vanilla-react-mike-cronin-p2loe
      const handleBackdropClick = (e) => {
        if (!e.target.matches('dialog')) return;
        const { top, bottom, left, right } = e.target.getBoundingClientRect();
        const { clientX: mouseX, clientY: mouseY } = e;
      
        // Ignore radio button arrow movement "clicks"
        // https://github.com/facebook/react/issues/7407
        if (mouseX === 0 && mouseY === 0) return;
      
        const clickedOutsideOfModalBox = (
          mouseX <= left || mouseX >= right ||
          mouseY <= top || mouseY >= bottom
        );
      
        if (clickedOutsideOfModalBox) whichDialog.close();
        formElement.reset();
      };
      whichDialog.addEventListener('click', handleBackdropClick); 

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
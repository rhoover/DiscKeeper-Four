(() => {
  'use strict';

  const onboard = {

    init() {

      // get player list
      async function getPlayers() {
        const playerFetch = await localforage.getItem('playerList');
        return playerFetch;
      };
      getPlayers()
        .then(fetchedData => {
          onboard.displayModal(fetchedData);
        });
      }, // end init()

      displayModal(fetchedData) {

        let onboardModal = document.querySelector('.modal');

        if (fetchedData == null) {
          onboardModal.showModal;
        };
      } // end displayModal()
  }

  onboard.init();
})();
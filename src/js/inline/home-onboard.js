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

        let onboardModal = document.querySelector('.home-modal');

        if (fetchedData == null) {
          onboardModal.classList.add('home-modal-display');
        };
      } // end displayModal()
  }

  onboard.init();
})();
(() => {
  'use Strict';

  localforage.config({
    name: 'disckeeper',
    storeName: 'Disckeeper',
    description: 'IndexedDB Disckeeper Scores and Data'
  });

})();
(() => {
  'use strict';

  const adjustPars = {

    init() {

      //get course object
      async function getCourseObject() {
        const idbData = await localforage.getItem('courseInProgress');
        return idbData;
      };
      getCourseObject().then(courseObject => {
          adjustPars.buildDOMList(courseObject);
        });
    }, // end init()
    
    buildDOMList(courseObject) {

      let insertHere = document.querySelector('.list');
      let holesOutput = '';

      courseObject.courseHoles.forEach((hole) => {
        holesOutput += `
          <div class="item" data-item="holeCard">
            <p class="item-hole">Hole: ${hole.holeNumber}</p>
            <p class="item-par">Par: <span data-bind="par">${hole.holePar}</span></p>
            <p class="item-advice">Adjust Par:</p>
            <button class="item-increase" data-model="increasePar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 217.9L383 345c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.3-24.6 0-34L273 167c-9.1-9.1-23.7-9.3-33.1-.7L95 310.9c-4.7 4.7-7 10.9-7 17s2.3 12.3 7 17c9.4 9.4 24.6 9.4 33.9 0l127.1-127z"/></svg>
            </button>
            <button class="item-decrease" data-model="decreasePar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"/></svg>
            </button>
          </div>
        ` //end template literal
      });

      insertHere.innerHTML = holesOutput;

      adjustPars.dataBinding(courseObject)
    }, // end buildDOMList()

    dataBinding(courseObject) {

      // so that clicking on a button adjusts the par number, both in the object and on the screen

      const holeCards = document.querySelectorAll('[data-item]');
      const submitButton = document.querySelector('.submit');

      // it's all done in this loop so that the scope is confined to each item/hole
      for (let [index, hole] of holeCards.entries()) {

        const increaseButton = hole.querySelector('[data-model="increasePar"]');
        const decreaseButton = hole.querySelector('[data-model="decreasePar"]');
        const boundParNumber = hole.querySelector('[data-bind]');

        // value is three as all holes have been assigned that figure ahead of time for their par
        let cardScope = {
          value: 3
        };

        // modifying the par property number/value
        // nevermind that this is above the click increaseButton/decreaseButton eventListeners, it works
        // NB the new cardScope object created above, the button clicks modify the value property of that object, which is then applied to the displayed par figure for any given hole
        Object.defineProperty(cardScope, 'parNumber', {
          set: function(value) {
            //cardScope.value is incremented or decreased depending on the incoming value
            this.value += value;
            // this new number is changed to a string for display purposes
            boundParNumber.innerHTML = this.value.toString();
            // but left as a number to update the par property in the object
            courseObject.courseHoles[index].holePar = this.value;
          },
        });

        increaseButton.addEventListener('click', event => {
          cardScope.parNumber = 1;
        });
        decreaseButton.addEventListener('click', event => {
          cardScope.parNumber = -1;
        });
      } // end for loop

      submitButton.addEventListener('click', event => {
        adjustPars.storage(courseObject);
      });
    }, // end dataBinding()
    
    storage(courseObject) {

      let deduped;
      
      // get course list
      async function getCourselist() {
        const idbData = await localforage.getItem('courseList');
        return idbData;
      };
      getCourselist().then(idbData => {

        switch (idbData) {
           // if courselist does not exist
          case idbData == null:
            idbData = [];
            idbData.push(courseObject);
          break;
           // if courselist does exist
          case idbData:
            idbData.push(courseObject);
            // remove duplicates leaving 1 original
            deduped = idbData.filter((obj, index) => {
              return index === idbData.findIndex(o => obj.courseName === o.courseName)
            });            
          break;        
          default:
            break;
        };

        // however that sugars out above, store the course in the iDB
        localforage.setItem('courseList', deduped);

        // no need for this anymore, so get rid of it
        localforage.removeItem('courseInProgress');

        //some UI assistance on our way out the door
        document.querySelector('.success').classList.add('success-good');

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      });
    } // end storage()

  };

  adjustPars.init();
})();
(() => {
  'use strict'

  const createNewCourse = {

    init() {

      //get course list
      async function getCourseList() {
        const idbData = await localforage.getItem('courseList');
        return idbData;
      };
      getCourseList().then(idbData => {
        // if it does not exist, create it
        if (idbData == null) {
          idbData = [];
        };
        createNewCourse.courseSetUp(idbData);
      });
    }, // end init()

    courseSetUp(idbData) {
      let formEl = document.querySelector('.form');

      formEl.addEventListener('submit', formElementListener);
      function formElementListener(event) {
        event.preventDefault();

        let whichButton = event.submitter;
        let formData = new FormData(formEl);
        let formCourseName = formData.get('courseName');
        let courseObject = {};

        switch (idbData) {

          // if there's no existing course *list*
          case idbData == null:
            // create skeleton for course object
            courseObject = {
              courseName: formCourseName,
              courseLength: parseInt(formData.get('holeradio'), 10),
              courseID: (+new Date).toString(36),
              courseCreated: new Date().toLocaleDateString('en-US'),
              roundsScored: 0
            };  
            // send off to fill in hole data for this new course
            createNewCourse.addCourseHoleData(idbData, courseObject, whichButton);
          break;

          // if there is an existing course *list*
          case idbData:
            // let's find out if the submitted course already exists
            if (idbData.find(x => x.courseName == formCourseName)) {
              // if it does, skip all the building below and jump to end because course already exists
              createNewCourse.alreadyExists();
            } else { // since it doesn't exist, create a new one
              // create skeleton for course object
              courseObject = {
                courseName: formCourseName,
                courseLength: parseInt(formData.get('holeradio'), 10),
                courseID: (+new Date).toString(36),
                courseCreated: new Date().toLocaleDateString('en-US'),
                roundsScored: 0
              };
  
              // send off to fill in hole data for this new course
              createNewCourse.addCourseHoleData(idbData, courseObject, whichButton);   

            };         
          break;
          default:
          break;
        };
      }; // end formElementListener()
    }, // end courseSetUp()

    addCourseHoleData(idbData, courseObject, whichButton) {

      let holesArray = [];
      holesArray.length = courseObject.courseLength;

      for (let i = 0; i < holesArray.length; i++) {
        holesArray[i] = {
          holeNumber: 1 + i,
          holePar: 3,
          holeThrows: 0,
          holeOverUnder: 0,
          roundOverUnder: 0,
          roundThrows: 0
        };
      };
      courseObject.courseHoles = holesArray;

      createNewCourse.handleButtonSelection(idbData, courseObject, whichButton);
    }, // end addCourseHoleData()

    handleButtonSelection(idbData, courseObject, whichButton) {

      let buttonClicked = whichButton.getAttribute('value');

      switch (buttonClicked) {
        case 'samepar':

          // pressed top button all par three course
          idbData.push(courseObject);
          
          // remove duplicates leaving 1 original
          const deduped = idbData.filter((obj, index) => {
            return index === idbData.findIndex(o => obj.courseName === o.courseName)
          });

          //some UI assistance
          document.querySelector('.success').classList.add('success-display');
          
          localforage.setItem('courseList', deduped);

          // redirect to home
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);

        break;

        // pressed bottom button, i.e. fix pars
        case 'differentpar':

          //some UI assistance
          document.querySelector('.success').classList.add('success-display');

          // courseInProgress because the pars for the course need to be adjusted
          // this will be handled by adjustpars.js
          localforage.setItem('courseInProgress', courseObject);

          setTimeout(() => {
            window.location.href = '/pages/adjustpars.html';
          }, 500);
        break;
      
        default:
        break;
      };
    }, // end handleButtonSelection()

    alreadyExists() {
      document.querySelector('.exists').classList.add('exists-display');
    } // end alreadyExists()
  };

  createNewCourse.init();
})();
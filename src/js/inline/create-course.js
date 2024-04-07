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
      let newCourseID = Math.random().toString(36).substring(2,11);
      newCourseID.toString();

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
              courseID: newCourseID,
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
                courseID: newCourseID,
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
      const successDialog = document.querySelector('.success');

      switch (buttonClicked) {
        case 'samepar':

          // pressed top button all par three course
          idbData.push(courseObject);
          
          // remove duplicates leaving 1 original
          const deduped = idbData.filter((obj, index) => {
            return index === idbData.findIndex(o => obj.courseName === o.courseName)
          });
          
          localforage.setItem('courseList', deduped);

          //some dialog assistance
          createNewCourse.dialogBehavior(successDialog);

        break;

        // pressed bottom button, i.e. fix pars
        case 'differentpar':

          //some dialog assistance
          createNewCourse.dialogBehavior(successDialog);

          // courseInProgress because the pars for the course need to be adjusted
          // this will be handled by adjustpars.js
          localforage.setItem('courseInProgress', courseObject);

          setTimeout(() => {
            window.location.href = '/pages/adjustpars.html';
          }, 2000);
        break;
      
        default:
        break;
      };
    }, // end handleButtonSelection()

    alreadyExists() {
      const exists = document.querySelector('.exists');
      const existsButton = document.querySelector('.exists-button');
      const formElement = document.querySelector('.form');

      existsButton.addEventListener('click', () => {
        formElement.reset();
        exists.close();
      });
      createNewCourse.dialogBehavior(exists);
    }, // end alreadyExists()
    
    dialogBehavior (incomingDialog) {

      const formElement = document.querySelector('.form');
      const successButton = document.querySelector('.success-button');

      // setTimeout(() => {
        incomingDialog.showModal();
      // }, 500);

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
      
        if (clickedOutsideOfModalBox) incomingDialog.close();
        formElement.reset();
      }
      
      incomingDialog.addEventListener('click', handleBackdropClick);

      successButton.addEventListener('click', () => {
        formElement.reset();
        incomingDialog.close();
      });

    } // end dialogBehavior()
  };

  createNewCourse.init();
})();
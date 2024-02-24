(() => {
'use strict';

const listcourses = {

  init() {

    // get course list
    async function getData() {
      const coursesFetch = await localforage.getItem('courseList');
      const roundsFetch = await localforage.getItem('savedRounds');
      return [coursesFetch, roundsFetch];
    };
    getData().then(fetchedData => {
      const fetchedCourses = fetchedData[0];
      const fetchedRounds = fetchedData[1];
      listcourses.buildListForDOM(fetchedCourses, fetchedRounds);
    });
  },// end init()

  buildListForDOM(fetchedCourses, fetchedRounds) {
    let coursesList = document.querySelector('.items');
    let coursesOutput = "";
    let noCoursesOutput = "";

    // if there are no courses created
    if (fetchedCourses.length == 0) {
      noCoursesOutput = `
      <p>You do not have any courses created :(.</p>
      `;
      coursesList.innerHTML = noCoursesOutput;
    };

    console.log('fetched courses:', fetchedCourses);

    // create list of courses created
    fetchedCourses.forEach((course, duplicates) => {
      
      coursesOutput += `
        <div class="item" data-courseid="${course.courseID}">
          <p class="item-name">${course.courseName}</p>
          <svg xmlns="http://www.w3.org/2000/svg" class="delete-me" viewbox="0 0 875 1000" width="27" height="50" >
            <path d="M0 281.296v-68.355q1.953-37.107 29.295-62.496t64.449-25.389h93.744V93.808q0-39.06 27.342-66.402T281.232.064h312.48q39.06 0 66.402 27.342t27.342 66.402v31.248H781.2q37.107 0 64.449 25.389t29.295 62.496v68.355q0 25.389-18.553 43.943t-43.943 18.553v531.216q0 52.731-36.13 88.862T687.456 1000H187.488q-52.731 0-88.862-36.13t-36.13-88.862V343.792q-25.389 0-43.943-18.553T0 281.296zm62.496 0h749.952V218.8q0-13.671-8.789-22.46t-22.46-8.789H93.743q-13.671 0-22.46 8.789t-8.789 22.46v62.496zm62.496 593.712q0 25.389 18.553 43.943t43.943 18.553h499.968q25.389 0 43.943-18.553t18.553-43.943V343.792h-624.96v531.216zm62.496-31.248V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76zm31.248-718.704H624.96V93.808q0-13.671-8.789-22.46t-22.46-8.789h-312.48q-13.671 0-22.46 8.789t-8.789 22.46v31.248zM374.976 843.76V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76zm156.24 0V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76z"/>
          </svg>
          <p class="item-delete">Delete Course</p>
          <pclass="item-scored">Completed Rounds Scored:  ${course.roundsScored}</p>
        </div>
      `;
    });

    coursesList.innerHTML = coursesOutput;

    listcourses.clickTrashCan(fetchedCourses, fetchedRounds);
  
  }, // end buildListForDOM()

  clickTrashCan(fetchedCourses, fetchedRounds) {

    //declare all the things
    let courseList = document.querySelector('.listcourses');
    let coursesModal = document.querySelector('.modal');
    let clickedCourseID = "";
    let clickedCourseObj = {};
    let target;
    let insertCourseName;
    let testing;

    // clicking the trashcan listener
    courseList.addEventListener('click', clickTrashListener);
    function clickTrashListener(event) {
      target = event.target.closest('.item');

      //which course was clicked
      clickedCourseID = target.getAttribute('data-courseid');

      switch (true) {
        case fetchedRounds == null:
          // send along the info to remove the clicked course
          listcourses.deleteCourse(target, clickedCourseID, fetchedCourses);
          
        break;
        case fetchedRounds.length > 0:
          // does the clicked course actually exist in the saved rounds array? check and see
          testing = fetchedRounds.find(x => x.courseID === clickedCourseID);

          switch (true) {
            case testing == undefined:
              listcourses.deleteCourse(target, clickedCourseID, fetchedCourses);
            break;
            case testing !== undefined:
              clickedCourseObj = testing;

              // insert info into the modal DOM
              insertCourseName = document.querySelector('.modal-warning-name');
              insertCourseName.innerHTML = `${clickedCourseObj.courseName}`;
    
              // make the fully dressed modal appear
              coursesModal.classList.add('modal-open');
    
              listcourses.modalChoices(target, coursesModal, clickedCourseID, fetchedCourses, fetchedRounds);
          
            default:
            break;
          };
        break;
      
        default:
        break;
      };
    }; // end clickTrashListener function

  }, // end clickTrashCan()

  modalChoices(targetDOM, coursesModal, clickedCourseID, fetchedCourses, fetchedRounds) {

    let buttonClicked;
    let buttonChoice = '';

    coursesModal.addEventListener('click', clickedButtonListener);

    function clickedButtonListener(event) {
      event.stopPropagation();

      buttonClicked = event.target.closest('.modal-choices');
      buttonChoice = buttonClicked.getAttribute('data-options');

      // which button was clicked?
      switch (buttonChoice) {
        case 'yes':
          listcourses.deleteCourse(targetDOM, clickedCourseID, fetchedCourses);
          listcourses.deleteRounds(clickedCourseID, fetchedRounds);
        break;
        case 'no':
          coursesModal.classList.remove('modal-open');
        break;
        default:
        break;
      };
    };
   

  }, // end modalChoices()

  deleteCourse(targetDOM, clickedCourseID, fetchedCourses) {

    // send it along before it gets stripped out of courses array
    listcourses.successModal(fetchedCourses, clickedCourseID);

    //remove course from courses array
    let indexOfCourse = fetchedCourses.findIndex(course => {
      return course.courseID === clickedCourseID;
    });
    fetchedCourses.splice(indexOfCourse, 1);

    //save modified courses array
    localforage.setItem('courseList', fetchedCourses);

    //remove course from DOM
    targetDOM.remove();


    if (document.querySelector('.modal-open')) {
      document.querySelector('.modal').classList.toggle('modal-open');
    };

  }, // end deleteCourse()

  deleteRounds(clickedCourseID, fetchedRounds) {

    //find which rounds are to be nuked
    fetchedRounds.forEach((round, index) => {
      if (round.courseID === clickedCourseID) {
        fetchedRounds.splice(index, 1);
      };
    });

    // save updated rounds array back to idb
    localforage.setItem('savedRounds', fetchedRounds);

    if (document.querySelector('.modal-open')) {
      document.querySelector('.modal').classList.toggle('modal-open');
    };
  }, // end deleteRounds()

  successModal(fetchedCourses, clickedCourseID) {

    // bring the modal down
    let deletedModal = document.querySelector('.modal-deleted');
    deletedModal.classList.toggle('modal-deleted-open');

    // insert the deleted course name into the modal
    let clickedCourse = fetchedCourses.find(x => x.courseID === clickedCourseID);
    let clickedCourseName = clickedCourse.courseName;

    document.querySelector('.modal-deleted-name').innerHTML = `${clickedCourseName}`;

    // click on modal button to send it back off-screen
    deletedModal.addEventListener('click', buttonListener);
    function buttonListener(event) {
      event.stopPropagation();
      deletedModal.classList.toggle('modal-deleted-open');
    };
  } // end successModal()

}; // end const listcourses {}

listcourses.init()
})();
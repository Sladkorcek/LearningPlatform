// This script ONLY gets loaded if user has just registered. The "driver.js" library is also loaded, so that we can
// drive user's attention around the page.

window.addEventListener('load', function () {
  // This function gets called when the page is loaded, everything should be
  // initialized here  
  const steps = [
    {
      element: '#tutorial_welcome', // id of a html element that we want to highlight
      popover: {
        className: 'colorful-next no-previous', // class of the popover html element
        title: '<p>Welcome to <strong>stvari.si</strong>!</p>', // title of the popover
        description: 'We\'ll quickly guide you through the basics.', // body of a popover
        position: 'bottom', // where in relation to the hihlighted document should the popup be
        nextBtnText: 'Let\'s go!', // text on the next button
        closeBtnText: 'Skip', // text on the close button
      }
    },
    {
      element: '#new_document_button',
      popover: {
        title: 'Documents',
        description: '<p>You can write your notes into a document. Let\'s create one right now and see how this works.</p><p>Click the purple "new" button.</p>',
        showButtons: false,
        position: 'top'
      }
    },
    {
      element: '#document-form',
      popover: {
        title: 'Editor',
        description: '<p>We\'ve prepared a sample document for you below. You can use Markdown and LateX language to style the document and Smrik to add interactive elements. More on that later. You can try editing this document now or come back later when you learn more.</p><p>When you are ready to continue the tour, click on purple "Save" button at the bottom.</p>',
        showButtons: false,
        position: 'left'
      }
    },
    {
      element: '#button-change-visibility',
      popover: {
        className: 'colorful-next no-previous no-close',
        title: 'Visibility',
        description: '<p>As you can see, this document is currently PRIVATE, which means you are the only one who can see it. You can change visibility to LINK and make it accessible to anyone with the link, or to PUBLIC so everyone can see it.</p>',
        position: 'bottom',
        nextBtnText: 'Okay, go on.'
      }
    },
    {
      element: '#explore-button',
      popover: {
        title: 'Explore!',
        description: '<p>Public documents will appear on the explore page, let\'s head there now.</p><p>Click "Explore".</p>',
        showButtons: false,
        position: 'bottom'
      }
    },
    {
      element: '#new_document_button',
      popover: {
        title: 'Documents',
        description: 'You can  button.',
        showButtons: false,
        position: 'top'
      }
    }
  ];

  // Load last executed step from local storage
  let lastStep = getLastStep();

  // Based on the last step, setup current page - create new elements, setup
  // event listeners, etc.
  setup(lastStep);

  const driver = new Driver({
    allowClose: false, // click on overlay should not close the tutorial

    // When the highlight changes, get its index and save it to local storage
    onHighlightStarted: function (element) {
      saveLastStep(element.popover.options.currentIndex);
    }
  });
  driver.defineSteps(steps);

  // Start the driver from last step
  driver.start(lastStep);
});

function setup(lastStep) {
  if (lastStep < 2) {
    // This changes the link of the "new" button for creating a new document to
    // a pre-filled document (for the sake of the tutorial)
    let gumb = document.getElementById("new_document_button");
    gumb.href = gumb.href + "?type=tutorial";
  }
}

function saveLastStep(step) {
  localStorage.setItem('tutorial_step', step);
}

function getLastStep() {
  const lastStep = localStorage.getItem('tutorial_step');
  if (!lastStep)
    return 0;
  return Number(lastStep);
}

function endTutorial(callback) {
  // If this function is called, a request should be made to Django backend
  // that will not load the tutorial libraries any more

  let url = '/accounts/end_tutorial';
  let request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.send();

  request.addEventListener('load', function (event) {
    if (callback)
      callback(true);
  });

  request.addEventListener('error', function (event) {
    if (callback)
      callback(false);
  });
}


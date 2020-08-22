// This script ONLY gets loaded if user has just registered and is looking at
// their own profile. The "driver.js" library is also loaded, so that we can
// drive user's attention around the page.

window.addEventListener('load', function() {
    // This function gets called when the page is loaded, everything should be
    // initialized here

    const driver = new Driver({
      allowClose: false, // click on overlay should not close the tutorial
    });

    // This changes the link of the "new" button for creating a new document to
    // a pre-filled document (for the sake of the tutorial)
    let gumb = document.getElementById("new_document_button");
    gumb.href = gumb.href + "?type=tutorial";

    // Define the steps for introduction
    driver.defineSteps([
      {
        element: '#tutorial_welcome', // id of a html element that we want to highlight
        popover: {
          className: 'first-step', // class of the popover html element
          title: '<p>Welcome to <strong>stvari.si</strong>!</p>', // title of the popover
          description: 'We\'ll quickly guide you through the basics.', // body of a popover
          position: 'bottom', // where in relation to the hihlighted document should the popup be
          nextBtnText: 'Let\'s go!', // text on the next button
          prevBtnText: 'Back', // text on the previous button
          closeBtnText: 'Skip' // text on the close button
        }
      },
      {
        element: '#new_document_button',
        popover: {
          title: 'Documents',
          description: 'You can write your notes into a document. Let\'s create one right now and see how this works.\n Click the purple "new" button.',
          showButtons: false,
          position: 'top'
        }
      },
      {
        element: '#save_document_button',
        popover: {
          title: 'Documents',
          description: 'You can  button.',
          showButtons: false,
          position: 'top'
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
      },
      {
        element: '#new_document_button',
        popover: {
          title: 'Documents',
          description: 'You can  button.',
          showButtons: false,
          position: 'top'
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
    ]);


    driver.start(stepNumber = 0);
    console.log('Tutorial!');
});

function endTutorial(callback) {
    // If this function is called, a request should be made to Django backend
    // that will not load the tutorial libraries any more

    let url = '/accounts/end_tutorial';
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send();

    request.addEventListener('load', function(event) {
        if (callback)
            callback(true);
    });

    request.addEventListener('error', function(event) {
        if (callback)
            callback(false);
    });
}


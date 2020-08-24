// This script ONLY gets loaded if user has just registered. The "driver.js" library is also loaded, so that we can
// drive user's attention around the page.
var driver;

const TUTORIAL_STEPS = [
    {
        element: '#tutorial_welcome', // id of a html element that we want to highlight PREMAKNI NA NEK DRUG ELEMENT
        popover: {
            className: 'colorful-next no-previous', // class of the popover html element
            title: '<p>Welcome to <strong>stvari.si</strong>!</p>', // title of the popover
            description: 'We\'ll quickly guide you through the basics.', // body of a popover
            position: 'bottom', // where in relation to the hihlighted document should the popup be
            nextBtnText: 'Let\'s go!', // text on the next button
            closeBtnText: 'Skip', // text on the close button
        },
        stepId: 0
    },
    {
        element: '#new_document_button',
        popover: {
            title: 'Documents',
            description: '<p>You can write your notes into a document. Let\'s create one right now and see how this works.</p><p>Click the purple "new" button.</p>',
            showButtons: false,
            position: 'top'
        },
        stepId: 1,
        onHighlightStarted: function (element) {
            // Before the highlight is displayed, set the "New Document" button
            // to redirect user to different URL
            let newDocumentButton = document.getElementById("new_document_button");
            newDocumentButton.href = newDocumentButton.href + "?type=tutorial";
            newDocumentButton.addEventListener('click', function(event) {
                nextStep(element);
            });
        }
    },
    {
        element: '#document-form',
        popover: {
            title: 'Editor',
            description: '<p>We\'ve prepared a sample document for you below. You can use Markdown and LateX language to style the document and Smrik to add interactive elements. More on that later. You can try editing this document now or come back later when you learn more.</p><p>When you are ready to continue the tour, click on purple "Save and view" button at the bottom.</p>', // SPREMENI V SAVE AND VIEW IN SPREMENI HTML; DA LAHKO POSEBAJ OZNAČIŠ EDITOR BREZ SAVE BUTTONA, NATO DODAJ KORAK; KJER IMAMO SAMO SAVE
            showButtons: false,
            position: 'left'
        },
        stepId: 2,
        onHighlightStarted: function (element) {
            let saveDocumentButton = document.getElementById("save-button");;
            saveDocumentButton.addEventListener('click', function(event) {
                nextStep(element);
            });
        }
    },
    {
        element: '#button-change-visibility',
        popover: {
            className: 'colorful-next no-previous no-close',
            title: 'Visibility',
            description: '<p>As you can see, this document is currently PRIVATE, which means you are the only one who can see it. You can change visibility to LINK and make it accessible to anyone with the link, or to PUBLIC so everyone can see it.</p>',
            position: 'bottom',
            nextBtnText: 'Okay, go on.'
        },
        stepId: 3
    },
    {
        element: '#explore-button',
        popover: {
            title: 'Explore!',
            description: '<p>Public documents will appear on the explore page, let\'s head there now.</p><p>Click "Explore".</p>',
            showButtons: false,
            position: 'bottom'
        },
        stepId: 4,
        onHighlightStarted: function (element) {
            let exploreButton = document.getElementById("explore-button");;
            exploreButton.addEventListener('click', function(event) {
                nextStep(element);
            });
        }
    },
    {
        element: '#explore-page-content',
        popover: {
            className: 'colorful-next no-previous no-close',
            title: 'Collaboration',
            description: '<p>All documents and collections here allow you to build upon them and to collaborate. </p>',
            nextBtnText: 'Let me see!',
            position: 'top'
        },
        stepId: 5
    },
    {
        element: '#tutorial-document',
        popover: {
            title: 'Collaboration',
            description: 'Click on the highlighted document to open it.',
            showButtons: false,
            position: 'bottom'
        },
        stepId: 6,
        onHighlightStarted: function (element) {
            let tutorialDocument = document.getElementById("tutorial-document");;
            tutorialDocument.addEventListener('click', function(event) {
                nextStep(element);
            });
        }
    },
    {
        element: '#star-button',
        popover: {
            className: 'colorful-next no-previous no-close',
            title: 'Stars',
            description: 'If you like a document or a collection and/or want to save it for later, give it a star!',
            nextBtnText: 'Nice, where can I see them?',
            position: 'bottom'
        },
        stepId: 7
    },
    {
        element: '#starred',
        popover: {
            className: 'colorful-next no-previous no-close',
            title: 'Starred',
            description: 'Glad you asked. You can see your starred documents right here. You can try it out on your own. Now let\'s continue.',
            nextBtnText: 'Okay.',
            position: 'left'
        },
        stepId: 8,
        onHighlightStarted: function (element) {
            // Display menu on mobile devices
            const menu = document.getElementById("menu");
            menu.classList.add('show');
            const menuToggler = menu.parentElement.querySelector('.navbar-toggler');
            menuToggler.setAttribute("aria-expanded", "true");

            // Display dropdown on both mobile and web
            let profileDropdown = new BSN.Dropdown("#profile-dropdown", true);
            profileDropdown.show();

            document.getElementById("starred").addEventListener('click', function(event) {
                event.preventDefault();
            })
        }
    },
    {
        element: '#clone-button',
        popover: {
            title: 'Cloning?',
            description: '<p>Yes, you read that correctly. It says "clone". And it works exactly as cloning.</p><p>Try it out!</p>',
            showButtons: false,
            position: 'left'
        },
        stepId: 9,
        onHighlightStarted: function (element) {
            let cloneButton = document.getElementById("clone-button");;
            cloneButton.addEventListener('click', function(event) {
                nextStep(element);
            });
        }
    },
    {
        element: '#document-form',
        popover: {
            title: 'Editing cloned document',
            description: '<p>When you clone a document, you get your own copy of it. You can edit it however you want to, without changing the original. This means you can safely build upon the work of others and tweak it to your liking without having to worry that the original work would be affected.</p><p>Click the purple "Save end view" button when you\'re ready for one last step of the tutorial</p>',
            showButtons: false,
            position: 'top'
        },
        stepId: 10,
        onHighlightStarted: function (element) {
            let saveDocumentButton = document.getElementById("save-button");;
            saveDocumentButton.addEventListener('click', function(event) {
                nextStep(element);
            });
        }
    },
    {
        element: '#add-to-collection-dropdown',
        popover: {
            className: 'colorful-next no-previous no-close',
            title: 'Collections',
            description: '<p>You\'ve probably already noticed collections during our time together. Collections are a neat way to organize your documents in your own way. You can think of them as binders, folders, repositories, boxes, library iles, ... whichever is the most familliar to you.</p><p>Here you can add this document to a collection by checking the box next to it.</p>',
            nextBtnText: 'Great!',
            position: 'bottom'
        },
        stepId: 11
    },
    {
        element: '#end-tutorial', // TA ELEMENT SE NE OBSTAJA
        popover: {
            title: 'You\'re ready!',
            description: 'That\'s all for now. If there is anything you\'d like to learn more about, you can check the document "Tutorial" that you just cloned or the FAQ page (in the footer). Enjoy your note taking experience!',
            nextBtnText: 'Yay, can\'t wait!',
            position: 'top'
        },
        stepId: 12
    }
];

function nextStep(element) {
    // When the next button is clicked, save the next element index as
    // current index into localstorage
    saveLastStep(element.options.stepId + 1);
}

window.addEventListener('load', function () {
    // Load last executed step from local storage (as index in array of steps)
    let lastStep = getLastStep();
    let steps = TUTORIAL_STEPS.slice(lastStep);

    // If there are no steps, that means the user has finished the tutorial,
    // call the endTutorial function to save this in SESSION variable
    try {
        driver = new Driver({
            allowClose: false, // click on overlay should not close the tutorial
            onNext: nextStep   // listener for when the next button is clicked
        });
        driver.defineSteps(steps);
        driver.start();
    } catch (Exception) {
        // If there are no steps any more, end the tutorial
        clearTutorialSteps();
        endTutorial();
    }
    
});

function clearTutorialSteps() {
    localStorage.removeItem('tutorial_step');
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


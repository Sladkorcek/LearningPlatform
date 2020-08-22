// This script ONLY gets loaded if user has just registered and is looking at
// their own profile. The "driver.js" library is also loaded, so that we can
// drive user's attention around the page.

window.addEventListener('load', function() {
    // This function gets called when the page is loaded, everything should be
    // initialized here
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
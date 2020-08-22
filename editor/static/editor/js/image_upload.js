const AUTOCLOSE_FILE_UPLOAD_MODAL_TIME = 2000;

var csrfToken = '';

function setupFileUploadModal(displayHelpText, displayUploadProgress, displaySuccessMessage) {
    document.getElementById("file-upload-help-text").style.display = displayHelpText ? "block" : "none";
    document.getElementById("file-upload-progress").style.display = displayUploadProgress ? "block" : "none";
    document.getElementById("file-upload-success").style.display = displaySuccessMessage ? "block" : "none";
}

window.addEventListener('load', function() {

    let csrfTokenField = document.getElementsByName('csrfmiddlewaretoken')[0];
    csrfToken = csrfTokenField.value;

    var fileUploadProgressbar = document.getElementById("file-upload-progressbar");

    var imageUploadElement = document.getElementById("image-upload");

    var imageUploader = new Dropzone(imageUploadElement, {
        url: "/image/upload",
        headers: { "X-CSRFToken": csrfToken },
        paramName: 'image',
        previewsContainer: "#image-previews",
        clickable: "#upload-image-button"
    });

    imageUploader.on('addedfile', function(file) {
        setupFileUploadModal(false, true, false);
    });

    imageUploader.on("uploadprogress", function(file, progress) {
        fileUploadProgressbar.setAttribute("aria-valuenow", progress);
        fileUploadProgressbar.style.width = progress + "%";
    });

    imageUploader.on("error", function(file, response) {
        this.removeFile(file);
        
        // There was an error with the file upload, display error.
        document.getElementById('error-message').innerHTML = response.message;

        var errorModal = new BSN.Modal('#error-modal');
        errorModal.show();
        
        setupFileUploadModal(true, false, false);
    });

    imageUploader.on("success", function(file, response) {
        // The image was uploaded successfully, insert it into markdown editor.
        markdownEditor.insertImage(response.url);
        this.removeFile(file);
        
        setupFileUploadModal(false, false, true);
        
        // Hide the file upload modal if it is show
        setTimeout(function() {
            let modal = new BSN.Modal(document.getElementById("upload-image"));
            modal.hide();
            setupFileUploadModal(true, false, false);
        }, AUTOCLOSE_FILE_UPLOAD_MODAL_TIME);

    });

    window.addEventListener("paste", function(event) {
        // If there is no clipboard data, do nothing
        if (event.clipboardData == false)
            return;
        
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        if(items == undefined)
            return;
        
        for (var i = 0; i < items.length; i++) {
            // If current element contains no image, skip it
            if (items[i].type.indexOf("image") == -1)
                continue;

            // Get image from clipboard as blob
            const blob = items[i].getAsFile();

            // Use dropzone to upload image to the server
            imageUploader.addFile(blob)
        }
    }, false);

});

var lastTarget = null;

window.addEventListener("dragenter", function(event) {
    lastTarget = event.target;
    document.getElementById("image-upload").style.visibility = "";
    document.getElementById("image-upload").style.opacity = 1;
});

window.addEventListener("dragleave", function(event) {
    event.preventDefault();
    if(event.target === lastTarget || event.target === document) {
        document.getElementById("image-upload").style.visibility = "hidden";
        document.getElementById("image-upload").style.opacity = 0;
    }
});

window.addEventListener("dragover", function (e) {
    e.preventDefault();
});

window.addEventListener("drop", function (e) {
    e.preventDefault();
    document.getElementById("image-upload").style.visibility = "hidden";
    document.getElementById("image-upload").style.opacity = 0;
});
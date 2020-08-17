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

    var imageUploader = new Dropzone(document.body, {
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

});
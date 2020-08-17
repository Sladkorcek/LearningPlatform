var csrfToken = '';

window.addEventListener('load', function() {

    let csrfTokenField = document.getElementsByName('csrfmiddlewaretoken')[0];
    csrfToken = csrfTokenField.value;

    var imageUploader = new Dropzone(document.body, {
        url: "/image/upload",
        headers: { "X-CSRFToken": csrfToken },
        paramName: 'image',
        previewsContainer: "#image-previews",
        clickable: "#upload-image-button"
    });

    imageUploader.on("error", function(file, response) {
        this.removeFile(file);
        
        // There was an error with the file upload, display error.
        document.getElementById('error-message').innerHTML = response.message;

        var errorModal = new BSN.Modal('#error-modal');
        errorModal.show();
    });

    imageUploader.on("success", function(file, response) {
        // The image was uploaded successfully, insert it into markdown editor.
        markdownEditor.insertImage(response.url);
        this.removeFile(file);

        // Hide the file upload modal if it is show
        let modal = new BSN.Modal(document.getElementById("upload-image"));
        modal.hide();
    });

});
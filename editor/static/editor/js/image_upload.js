// Don't auto discover dropzones
Dropzone.autoDiscover = false;

var csrfToken = '';

function setupFileUploadModal(displayHelpText, displayUploadProgress) {
    document.getElementById("file-upload-help-text").style.display = displayHelpText ? "block" : "none";
    document.getElementById("file-upload-progress").style.display = displayUploadProgress ? "block" : "none";
}

window.addEventListener('load', function() {

    let csrfTokenField = document.getElementsByName('csrfmiddlewaretoken')[0];
    csrfToken = csrfTokenField.value;

    var fileUploadProgressbar = document.getElementById("file-upload-progressbar");
    var topProgressbar = document.getElementById("top-progressbar");
    
    imageUploadElement = document.getElementById("image-upload");

    var imageUploader = new Dropzone(imageUploadElement, {
        url: "/image/upload",
        headers: { "X-CSRFToken": csrfToken },
        paramName: 'image',
        previewsContainer: "#image-previews",
        clickable: "#upload-image-button"
    });

    imageUploader.on('addedfile', function(file) {
        setupFileUploadModal(false, true);
    });

    imageUploader.on("uploadprogress", function(file, progress) {
        fileUploadProgressbar.setAttribute("aria-valuenow", progress);
        fileUploadProgressbar.style.width = progress + "%";
        topProgressbar.style.width = progress + "%";
    });

    imageUploader.on("error", function(file, response) {
        this.removeFile(file);
        
        // There was an error with the file upload, display error.
        document.getElementById('error-message').innerHTML = response.message;

        var errorModal = new BSN.Modal('#error-modal');
        errorModal.show();

        setupFileUploadModal(true, false);
        
        topProgressbar.style.width = "0";
        fileUploadProgressbar.style.width = "0";
    });

    imageUploader.on("success", function(file, response) {
        // The image was uploaded successfully, insert it into markdown editor.
        markdownEditor.insertImage(response.url);
        this.removeFile(file);
        
        setupFileUploadModal(true, false);

        let modal = new BSN.Modal(document.getElementById("upload-image"));
        modal.hide();

        topProgressbar.style.width = "0";
        fileUploadProgressbar.style.width = "0";
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

    window.addEventListener('dragenter', function(event) {
        if (isFileUploadEvent(event))
            displayDropZone(true);
    });
    
    imageUploadElement.addEventListener('dragover', function(event) {
        if (isFileUploadEvent(event))
            displayDropZone(true);
    });
    
    imageUploadElement.addEventListener('dragleave', function(event) {
        displayDropZone(false);
    });

    imageUploadElement.addEventListener('drop', function(event) {
        displayDropZone(false);
    });

});

function isFileUploadEvent(event) {
    if (event.dataTransfer.types) {
        for (var i = 0; i < event.dataTransfer.types.length; i++) {
            if (event.dataTransfer.types[i] == "Files")
                return true;
        }
    }
    return false;
}

var imageUploadElement;
function displayDropZone(visibility) {
    imageUploadElement.style.visibility = visibility ? "visible" : "hidden";
    imageUploadElement.style.opacity = visibility ? "1" : "0";
}
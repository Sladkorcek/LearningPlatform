window.onload = setupMarkdownEditor;

const AUTOSAVE_INTERVAL = 10000;
let lastSavedTime = null;
let isCurrentlySaving = false;
let lastSavedElement = null;

// AUTOSAVE the document every 10 seconds
let autosaveInterval = setInterval(function() {
    saveDocument();
}, AUTOSAVE_INTERVAL);

function updateLastSavedElement(element) {
    if (element != null)
        lastSavedElement = element;
    
    if (isCurrentlySaving) {
        lastSavedElement.innerText = "Saving document...";
    } else {
        if (lastSavedTime != null) {
            const dateTimeFormat = new Intl.DateTimeFormat('en', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }) 
            let formatted = dateTimeFormat.format(lastSavedTime);
            lastSavedElement.innerText = "Last saved: " + formatted;
        } else {
            lastSavedElement.innerText = "";
        }
    }
}

function saveDocument(editor) {
    // TODO: This function is run everytime user presses the save button or
    // every 10 seconds. Create a POST request to save data to server.

    let documentName = document.getElementById("document-name").value;
    let documentContent = document.getElementById("content").value;
    let csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;

    let formData = [
        "document_name=" + encodeURIComponent(documentName),
        "document_content=" + encodeURIComponent(documentContent),
        "csrfmiddlewaretoken=" + encodeURIComponent(csrfToken)
    ];
    let encodedFormData = formData.join('&').replace(/%20/g, '+');

    let url = window.location.href;
    let request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(encodedFormData);

    isCurrentlySaving = true;

    request.addEventListener('load', function(event) {
        lastSavedTime = new Date();
        isCurrentlySaving = false;
        updateLastSavedElement();
    });

    request.addEventListener('error', function(event) {
        console.log('Error while saving data');
        isCurrentlySaving = false;
        updateLastSavedElement();
    });

    updateLastSavedElement();

}

function getStartEnd(selection) {
    let start = { line: selection.anchor.line, ch: selection.anchor.ch };
    let end = { line: selection.head.line, ch: selection.head.ch };

    if (end.line <= start.line) {
        if (end.ch <= start.ch) {
            let temporary = end.ch;
            end.ch = start.ch;
            start.ch = temporary;
        } else {
            let temporary = end.line;
            end.line = start.line;
            start.line = temporary;
        }
    }

    return { start: start, end: end };
}

let interactiveBlockButton = {
    name: "interactive_block",
    action: function(editor){
        const document = editor.codemirror;

        let selections = document.listSelections();
        
        let replacements = [];
        for (let i = 0; i < selections.length; i++) {
            let selection = getStartEnd(selections[i]);
            let selectionContent = document.getRange(selection.start, selection.end);
            let newContent = '{: ' + selectionContent + ' :}';
            replacements.push(newContent);
        }

        document.replaceSelections(replacements, "around");

        selections = document.listSelections();
        console.log(selections);
        for (let i = 0; i < selections.length; i++) {
            let selection = getStartEnd(selections[i]);
            document.markText(selection.start, selection.end, {
                className: 'is-inline-interactive-block'
            });
        }
        
        document.focus();
        
    },
    className: "fa fa-bolt",
    title: "Interactive element",
}

let saveButton = {
    name: "save_document",
    action: saveDocument,
    className: "fa fa-floppy-o",
    title: "Save document",
};

let uploadImageButton = {
    name: "upload_image",
    action: function() {
        let modal = new BSN.Modal(document.getElementById("upload-image"));
        modal.show();
    },
    className: "fa fa-upload",
    title: "Upload image"
};

let lastSavedStatusItem = {
    className: "keystrokes",
    defaultValue: function(element) {
        updateLastSavedElement(element);
    },
    onUpdate: function(element) {
        updateLastSavedElement(element);
    }
};

var markdownEditor;

// A custom function for SimpleMDE that inserts image from imageUrl at current
// cursor position
SimpleMDE.prototype.insertImage = function(imageUrl) {
    let markdown = "![](" + imageUrl + ")";
    let cursor = this.codemirror.getCursor();
    this.codemirror.replaceRange(markdown, cursor);
}

function setupMarkdownEditor() {
    markdownEditor = new SimpleMDE({
        element: document.getElementById("content"),
        autofocus: true,
        spellChecker: false,
        forceSync: true,
        tabSize: 4,
        toolbar: ["bold", "italic", "strikethrough", "heading", "|", "quote", "unordered-list", "ordered-list", "code", "|", "link", "|", "image", uploadImageButton, "|", "table", "|", interactiveBlockButton, "|", saveButton, "|", "preview", "side-by-side", "fullscreen"],
        status: ["lines", "words", lastSavedStatusItem]
    });
}
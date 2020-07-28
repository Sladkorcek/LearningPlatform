window.onload = setupMarkdownEditor;

function setupMarkdownEditor() {
    let markdownEditor = new SimpleMDE({
        element: document.getElementById("content"),
        autofocus: true,
        spellChecker: false,
        forceSync: true
    });
}
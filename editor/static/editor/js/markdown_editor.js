window.onload = setupMarkdownEditor;

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
    action: function customFunction(editor){
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
    className: "fa fa-keyboard-o",
    title: "Custom Button",
}

function setupMarkdownEditor() {
    let markdownEditor = new SimpleMDE({
        element: document.getElementById("content"),
        autofocus: true,
        autosave: {
            enabled: true,
            delay: 7000,
            uniqueId: 'document-markdown-editor'
        },
        spellChecker: false,
        forceSync: true,
        tabSize: 4,
        toolbar: ["bold", "italic", "strikethrough", "heading", "|", "quote", "unordered-list", "ordered-list", "code", "|", "link", "image", "table", "|", interactiveBlockButton, "|", "preview", "side-by-side", "fullscreen"]
    });
}
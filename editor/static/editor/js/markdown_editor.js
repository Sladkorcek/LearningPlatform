window.onload = setupMarkdownEditor;

let interactiveBlockButton = {
    name: "interactive_block",
    action: function customFunction(editor){
        const document = editor.codemirror;

        let selections = document.listSelections();
        
        let replacements = [];
        let fixedPositions = [];
        for (let i = 0; i < selections.length; i++) {
            let start = selections[i].anchor;
            let end = selections[i].head;
            
            let selectionContent = document.getRange(start, end);
            let newContent = '{: ' + selectionContent + ' :}';

            let newEnd = {
                line: end.line,
                ch: end.ch + newContent.length - selectionContent.length
            };
            fixedPositions.push([start, newEnd]);
            
            replacements.push(newContent);
        }

        document.replaceSelections(replacements, "around");

        selections = document.listSelections();
        document.operation(function() {

            for (let i = 0; i < selections.length; i++) {
                let start = selections[i].anchor;
                let end = selections[i].head;
                document.markText(start, end, {
                    className: 'is-inline-interactive-block'
                });
            }
        });
        
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
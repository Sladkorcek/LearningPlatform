// URL's for other parts of this library
const SMIRK_STANDARD = '/static/editor/js/smirk_standard.js';
const SMIRK_MATH = '/static/editor/js/smirk_math.js';

const INTERACTIVE_ELEMENTS_LIBRARIES = {
    'button': SMIRK_STANDARD,
    'flashcard': SMIRK_STANDARD,
    'text': SMIRK_STANDARD,
    'multipleChoice': SMIRK_STANDARD,
    'svg': SMIRK_MATH,
    'plot': SMIRK_MATH,
};

const REQUIREMENTS = {};
REQUIREMENTS[SMIRK_MATH] = [
    'https://unpkg.com/d3@3/d3.min.js',
    'https://unpkg.com/function-plot@1/dist/function-plot.js'
];

var callbacks = {};
var currentlyLoading = [];
var alreadyLoaded = [];

function loadScripts(scripts, callback) {
    if (scripts.length <= 0) {
        callback();
    } else {
        let script = scripts.shift();
        
        // If library is already loading, don't try to download it again, but
        // wait until the download has finished and then proceed.
        if (currentlyLoading.indexOf(script) != -1) {
            if (!callbacks.hasOwnProperty(script))
            callbacks[script] = [];
            callbacks[script].push(function() {
                loadScripts(scripts, callback);
            });
            return;
        }

        console.log('Loading library: ' + script);

        // Before starting to load library, add it to currentlyLoading array
        currentlyLoading.push(script);

        loadScript(script, function() {
            // When the script finishes loading, remove it from currentlyLoading
            // array and add it to alreadyLoaded array
            let index = currentlyLoading.indexOf(script);
            if (index != -1)
                currentlyLoading.splice(index, 1);
            alreadyLoaded.push(script);

            // The script has been loaded, load the next one
            loadScripts(scripts, callback);
        });
    }
}

function loadLibrary(library, callback) {
    let allLibraries = [ library ];
    if (REQUIREMENTS.hasOwnProperty(library)) {
        let libraryRequirements = REQUIREMENTS[library];
        allLibraries = allLibraries.concat(libraryRequirements);
    }
    loadScripts(allLibraries, callback);
}

// window.onload executes after EVERYTHING is loaded, including images
// The interactive blocks can start rendering before images, so
// find a different way to detect if document has been loaded
window.addEventListener('load', renderAll);

function renderAll() {
    
    let interactiveBlocks = document.body.getElementsByTagName('interactive');
    for (let i = 0; i < interactiveBlocks.length; i++) {
        let interactiveBlock = interactiveBlocks[i];
        renderInteractiveBlock(interactiveBlock);
    }

}

function renderInteractiveBlock(interactiveBlock) {

    let blockCode = interactiveBlock.innerHTML;

    // If we are re-rendering elements, current interactive block contents
    // should be removed.
    clearInteractiveBlock(interactiveBlock);

    try {
        let render = constructRenderingFunction(blockCode);
        let generatedElement = render();

        // If the element that we want to render is an array, render all its
        // elements in line instead of one after another
        if (Array.isArray(generatedElement)) {

            // Use Bootstrap's grid system to create a row of elements
            let row = document.createElement("div");
            row.className = "row";

            for (let i = 0; i < generatedElement.length; i++) {
                let column = document.createElement("div");
                column.className = "col-sm";

                try {
                    let renderedElement = generatedElement[i].getElement(interactiveBlock.parentElement);
                    column.appendChild(renderedElement);
                } catch (error) {
                    let exceptionElement = exception().withMessage(error);
                    column.appendChild(exceptionElement.getElement());
                }
                row.appendChild(column);
            }

            interactiveBlock.parentElement.appendChild(row);

        } else {
            let renderedElement = generatedElement.getElement(interactiveBlock.parentElement);
            interactiveBlock.parentElement.appendChild(renderedElement);
        }
        
    } catch (error) {
        // If the error is a ReferenceError, the user called a function that
        // does not exist. That most likely means that a sublibrary was not
        // loaded yet, so we will load it.
        if (error instanceof ReferenceError) {
            // Because JavaScript's ReferenceError object does not
            // contain name of the variable that caused it, we will extract it from
            // error message string.
            let variableName = error.message.split(' ', 1)[0];

            if (INTERACTIVE_ELEMENTS_LIBRARIES.hasOwnProperty(variableName)) {
                let requiredLibrary = INTERACTIVE_ELEMENTS_LIBRARIES[variableName];

                // Display loading library text
                interactiveBlock.parentElement.appendChild(exception().withMessage("Loading smirk library").getElement());

                loadLibrary(requiredLibrary, function() {
                    // After the correct smirk library is loaded, re-render this
                    // interactive object
                    renderInteractiveBlock(interactiveBlock);
                });
            } else {
                interactiveBlock.parentElement.appendChild(exception().withMessage(error).getElement());
            }
        } else {
            interactiveBlock.parentElement.appendChild(exception().withMessage(error).getElement());
        }

    }

}

function constructRenderingFunction(code) {

    let renderingFunctionCode = 'return (' + code + ')';
    return new Function(renderingFunctionCode);

}

function clearInteractiveBlock(interactiveBlock) {
    let parent = interactiveBlock.parentElement;
    let children = parent.children;
    for (let i = children.length - 1; i >= 0; i--) {
        if (children[i].tagName.toUpperCase() !== 'INTERACTIVE') {
            parent.removeChild(children[i]);
        }
    }
}

let idCounter = 1;

class InteractiveElement {
    constructor(element) {
        this.element = element;
        this.id = InteractiveElement.generateUniqueId();
    }
    getElement(parent) {
        // This function is called with a parent element passed in as an
        // argument. We could update our element before returning it here.
        return this.element;
    }
    static generateUniqueId() {
        idCounter += 1;
        return idCounter - 1;
    }
    uniqueId() {
        return this.id;
    }
}

class Exception extends InteractiveElement {
    constructor() {
        super(document.createElement("div"));
        this.element.className = "exception";
    }
    withMessage(error) {
        this.element.innerText = error;
        return this;
    }
}

function exception() {
    return new Exception();
}

function loadScript(url, callback){
    if (alreadyLoaded.indexOf(url) != -1) {
        // The script has already been loaded, don't download it again
        if (callback)
            callback();
        return;
    }

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  // IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                if (callback)
                    callback();
            }
        };
    } else {  // Others
        script.onload = function(){
            if (callback)
                callback();
            // Also call other callbacks
            if (callbacks.hasOwnProperty(url)) {
                for (let i = 0; i < callbacks[url].length; i++) {
                    callbacks[url][i]();
                }
                callback[url] = undefined;
            }
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}
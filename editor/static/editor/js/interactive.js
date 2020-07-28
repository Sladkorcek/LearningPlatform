// window.onload executes after EVERYTHING is loaded, including images
// The interactive blocks can start rendering before images, so
// find a different way to detect if document has been loaded
window.onload = renderAll;

function renderAll() {
    
    let interactiveBlocks = document.body.getElementsByTagName('interactive');
    for (let i = 0; i < interactiveBlocks.length; i++) {
        let interactiveBlock = interactiveBlocks[i];
        renderInteractiveBlock(interactiveBlock);
    }

}

function renderInteractiveBlock(interactiveBlock) {

    let blockCode = interactiveBlock.innerHTML;

    try {
        let render = constructRenderingFunction(blockCode);
        let generatedElement = render();
        interactiveBlock.parentElement.appendChild(generatedElement.getElement());
    } catch (error) {
        let exceptionElement = exception().withMessage(error);
        interactiveBlock.parentElement.appendChild(exceptionElement.getElement());
    }

}

function constructRenderingFunction(code) {

    let renderingFunctionCode = 'return (' + code + ')';
    return new Function(renderingFunctionCode);

}
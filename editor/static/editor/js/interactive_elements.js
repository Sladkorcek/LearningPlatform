class InteractiveElement {
    constructor(element) {
        this.element = element;
    }
    getElement() {
        return this.element;
    }
}

class Button extends InteractiveElement {
    constructor() {
        super(document.createElement("button"));
    }
    withText(buttonText) {
        this.element.innerText = buttonText;
        return this;
    }
    onClick(clickListener) {
        this.element.onclick = clickListener;
        return this;
    }
}

class Plot extends InteractiveElement {
    constructor() {
        super(document.createElement("canvas"));
    }
    withSize(width, height) {
        this.element.width = width;
        this.element.height = height;
        return this;
    }
}

class Exception extends InteractiveElement {
    constructor() {
        super(document.createElement("div"));
        this.element.className = "exception";
    }
    withMessage(error) {
        console.log(error);
        this.element.innerText = error;
        return this;
    }
}

function exception() {
    return new Exception();
}

function button() {
    return new Button();
}

function plot() {
    return new Plot();
}
class InteractiveElement {
    constructor(element) {
        this.element = element;
    }
    getElement(parent) {
        // This function is called with a parent element passed in as an
        // argument. We could update our element before returning it here.
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
        let element = document.createElement("div");
        element.className = "text-center";
        super(element);
        
        // A list of functions that we are plotting
        this.functions = [];

        // Configuration for the function-plot library
        this.plotData = {
            target: this.element,
            data: this.functions
        };

        this.update();
    }
    getElement(parent) {
        // If width of element is not set, use the full width of the parent
        // element
        if (!this.plotData.hasOwnProperty('width')) {
            let parentWidth = parent.getBoundingClientRect().width;
            if (parentWidth > 0) {
                this.plotData['width'] = Math.floor(parentWidth * 0.98);
            }
        }
        
        this.update();
        return super.getElement();
    }
    update() {
        this.chart = functionPlot(this.plotData);
        return this;
    }
    withGrid(displayGrid) {
        if (displayGrid != undefined)
            this.plotData['grid'] = displayGrid;
        else
            this.plotData['grid'] = true;
        return this;
    }
    withDomainX(interval) {
        this.plotData['xAxis'] = {
            'domain': interval
        };
        return this;
    }
    withDomainY(interval) {
        this.plotData['yAxis'] = {
            'domain': interval
        };
        return this;
    }
    withSize(width, height) {
        this.plotData['width'] = width;
        this.plotData['height'] = height;
        return this;
    }
    function(functionString) {
        this.functions.push({
            fn: functionString
        });
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
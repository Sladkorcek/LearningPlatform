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
        let button = document.createElement("button");
        button.className = "btn button-secondary";
        super(button);
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

        this.environmentData = {};
        
        // A list of functions that we are plotting
        this.functions = [];

        // Configuration for the function-plot library
        this.plotData = {
            target: this.element,
            data: this.functions
        };

        this.additionalElements = [];

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

        for (let i = 0; i < this.additionalElements.length; i++) {
            this.element.appendChild(this.additionalElements[i]);
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
    withWidth(width) {
        this.plotData['width'] = width;
        return this;
    }
    withHeight(height) {
        this.plotData['height'] = height;
        return this;
    }
    withSize(width, height) {
        this.plotData['width'] = width;
        this.plotData['height'] = height;
        return this;
    }
    withData(dataObject) {
        this.environmentData = dataObject;
        return this;
    }
    function(functionString) {
        console.log(functionString);
        if (typeof functionString === 'string' || functionString instanceof String) {
            this.functions.push({
                fn: functionString
            });
        } else {
            this.functions.push({
                graphType: 'polyline',
                fn: function(scope) {
                    return functionString(scope.x, this.environmentData);
                }.bind(this)
            });
        }
        return this;
    }
    withSliderFor(property, interval) {
        let inputContainer = document.createElement("div");

        let slider = document.createElement("input");
        slider.type = "range";
        slider.min = interval[0];
        slider.max = interval[1];
        slider.step = (interval[1] - interval[0]) / 100;
        slider.value = this.environmentData[property];
        
        slider.addEventListener('input', function() {
            this.environmentData[property] = slider.value;
            this.update();
        }.bind(this));

        let label = document.createElement("label");
        label.htmlFor = "slider";
        label.innerText = property + ": ";

        inputContainer.appendChild(label);
        inputContainer.appendChild(slider);
        this.additionalElements.push(inputContainer);
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
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
    grid(displayGrid) {
        if (displayGrid != undefined)
            this.plotData['grid'] = displayGrid;
        else
            this.plotData['grid'] = true;
        return this;
    }
    domainX(interval) {
        this.plotData['xAxis'] = {
            'domain': interval
        };
        return this;
    }
    domainY(interval) {
        this.plotData['yAxis'] = {
            'domain': interval
        };
        return this;
    }
    width(width) {
        this.plotData['width'] = width;
        return this;
    }
    height(height) {
        this.plotData['height'] = height;
        return this;
    }
    size(width, height) {
        this.plotData['width'] = width;
        this.plotData['height'] = height;
        return this;
    }
    data(dataObject) {
        this.environmentData = dataObject;
        return this;
    }
    function(functionString) {
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
    uniqueSliderId() {
        return this.additionalElements.length + 1;
    }
    slider(property, interval) {
        let inputContainer = document.createElement("div");
        inputContainer.className = "plot-slider-group";

        if (!this.environmentData.hasOwnProperty(property)) {
            this.environmentData[property] = interval[0];
        }

        let slider = document.createElement("input");
        slider.id = "slider-" + this.uniqueSliderId();
        slider.type = "range";
        slider.min = interval[0];
        slider.max = interval[1];
        slider.step = Math.abs(interval[1] - interval[0]) / 100;
        slider.value = this.environmentData[property];

        let label = document.createElement("label");
        label.id = "slider-label-" + this.uniqueSliderId();
        label.htmlFor = "slider-" + this.uniqueSliderId();
        label.innerText = "$" + property + ' = ' + slider.value + "$";
        MathJax.typeset([label]);
        
        slider.addEventListener('input', function() {
            this.environmentData[property] = Number.parseFloat(slider.value);
            label.innerText = property + ' = ' + slider.value;
            this.update();

            if (this.latexTimer != null) {
                clearTimeout(this.latexTimer);
            }

            // Set timeout that will re-typeset latex equations after 100ms
            this.latexTimer = setTimeout(function() {
                label.innerText = '$' + property + ' = ' + slider.value + '$';
                MathJax.typeset([label]);
                this.latexTimer = undefined;
            }.bind(this), 100);

        }.bind(this));

        inputContainer.appendChild(slider);
        inputContainer.appendChild(label);
        this.additionalElements.push(inputContainer);
        return this;
    }
}

class Svg extends InteractiveElement {
    constructor() {
        super(document.createElement("div"));
        this.svg = d3.select(this.element).append("svg");
    }
    width(width) {
        this.svg.attr("width", width);
        return this;
    }
    height(height) {
        this.svg.attr("height", height);
        return this;
    }
    applyStyling(element, styling) {
        if (!styling)
            return;
        
        for (const [key, value] of Object.entries(styling)) {
            element.style(key, value);
        }
    }
    rectangle(x, y, width, height, styling) {
        let newElement = this.svg.append("rect")
            .attr("x", x).attr("y", y)
            .attr("width", width).attr("height", height);
        this.applyStyling(newElement, styling);
        return this;
    }
    ellipse(centerX, centerY, radiusX, radiusY, styling) {
        let newElement = this.svg.append("ellipse")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("rx", radiusX)
            .attr("ry", radiusY);
        this.applyStyling(newElement, styling);
        return this;
    }
    circle(centerX, centerY, radius, styling) {
        let newElement = this.svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", radius);
        this.applyStyling(newElement, styling);
        return this;
    }
    square(x, y, size, styling) {
        return this.rectangle(x, y, size, size, styling);
    }
    point(x, y, styling) {
        return this.circle(x, y, 3, styling);
    }
}

function plot() {
    return new Plot();
}

function svg() {
    return new Svg();
}
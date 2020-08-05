let idCounter = 1;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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
    withSliderFor(property, interval) {
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

class Flashcard extends InteractiveElement {
    constructor() {
        let card = document.createElement("div");
        card.className = "card flashcard";

        let cardBody = document.createElement("div");
        cardBody.className = "card-body";

        card.appendChild(cardBody);

        super(card);

        this.questionElement = document.createElement("div");

        this.answerElement = document.createElement("div");
        this.answerElement.style.visibility = "hidden";
        
        cardBody.appendChild(this.questionElement);
        cardBody.appendChild(this.answerElement);

        // When card is clicked, display the answer
        card.addEventListener('click', function(event) {
            this.answerElement.style.visibility = "visible";
        }.bind(this));
    }
    question(html) {
        this.questionElement.innerHTML = html;
        return this;
    }
    answer(html) {
        this.answerElement.innerHTML = html;
        return this;
    }
}

class Text extends InteractiveElement {
    constructor(text) {
        let textElement = document.createElement('span');
        textElement.innerText = text;
        super(textElement);
    }
}

class MultipleChoice extends InteractiveElement {
    constructor() {
        super(document.createElement("div"));
        this.element.className = "multiple-choice-card";

        this.cardHeader = document.createElement("div");
        this.cardHeader.className = "multiple-choice-card-header fancy-background";
        this.element.appendChild(this.cardHeader);

        this.cardBody = document.createElement("div");
        this.cardBody.className = "multiple-choice-card-body";
        this.element.appendChild(this.cardBody);

        this.correct = null;
        this.answers = [];
    }
    question(question) {
        this.cardHeader.innerHTML = question;
        return this;
    }
    createAnswerElement(text) {
        let checkboxContainer = document.createElement("div");
        checkboxContainer.className = "multiple-choice-card-answer";

        let label = document.createElement("label");
        label.innerHTML = text;

        let radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = "radio-" + this.uniqueId(); 
        
        label.prepend(radioButton);
        checkboxContainer.appendChild(label);

        radioButton.onchange = function() {
            for (let i = 0; i < this.answers.length; i++) {
                let additionalClass = (this.answers[i] != this.correct) ? "is-wrong" : "is-right";
                this.answers[i].className += " " + additionalClass;
                this.answers[i].querySelector("input").disabled = true;
            }
        }.bind(this);

        return checkboxContainer;
    }
    correctAnswer(answer) {
        let answerElement = this.createAnswerElement(answer);
        this.answers.push(answerElement);
        this.correct = answerElement;
        return this;
    }
    otherAnswers(answers) {
        for (let i = 0; i < answers.length; i++) {
            let answerElement = this.createAnswerElement(answers[i]);
            this.answers.push(answerElement);
        }
        return this;
    }
    getElement(parent) {

        shuffleArray(this.answers);
        for (let i = 0; i < this.answers.length; i++) {
            this.cardBody.appendChild(this.answers[i]);
        }

        return super.getElement(parent);
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

function flashcard() {
    return new Flashcard();
}

function text(content) {
    return new Text(content);
}

function multipleChoice() {
    return new MultipleChoice();
}
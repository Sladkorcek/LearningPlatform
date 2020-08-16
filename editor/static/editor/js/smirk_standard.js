function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
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

function button() {
    return new Button();
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
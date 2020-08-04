# Tutorial
In this tutorial you'll learn how to write documents using our extended version of markdown syntax language.

## Markdown
Markdown is a lightweight markup language that allows you to format document using plain text. It was designed to be easy to write and easy to read. Its philosophy is that a markdown file should be publishable and readable as-is. Our page allows you to download raw file and save it to your computer or to render it in your browser - stylized for even better readability.

### Paragraphs
### Headings
### Emphasis

## Latex
The `stvari.si` platform allows you to write beautiful equations directly in your notebooks. This and interactive plots make it ideal for sharing math notes.

For rendering LaTeX equations we use mathjax javascript library. Its documentation can be found [here]().

Equations can be inserted in two different ways - as inline or block equations.

### Inline equations
Inline equations can be inserted directly inbetween some text. To insert an equation, all you have to do is write your equation between two dolar signs: `$ inline equation $`, similarly as you would in any latex editor.

```markdown
The formula to compute the area of a circle with radius $r$ is $ \pi r^2 $.
```

### Block equations
Block equations are rendered in their own line. They are great if you want to write longer equations or to emphasize them.

To insert a block equation, wrap it in two dollar sign operators like so ``$$ block equation $$.``

```markdown
The area of a circle with radius $r$ can be computed with the following formula. $$ A = \pi r^2 $$
```

## Interactive blocks
To add interactivity to your notes, the interactive blocks can be used. Interactive is a JavaScript expression that is sandwiched between a pair of special symbols: `{: code :}`.

When rendering a document, the JavaScript expression is wrapped in a function and executed. The expression should return an object descended from `InteractiveElement` class. After the object is constructed, a `getElement(parent)` function is executed and the resulting HTML element is inserted in place of interactive block.

If there is an error while rendering an `Exception` element is rendered instead with corresponding exception message.

### Inline interactive blocks
Sometimes, we might want to display multiple interactive blocks in the same row. This can be done by returning an array of interactive elements instead of interactive elements as we normally would. To render multiple interactive blocks, we use Bootstrap grid system. This means that the maximum number of elements in one row is 12.

#### Example
The following example displays a plot of function `f(x) = 2x + 3` and right next to it a flashcard.

```markdown
{:
    [
        plot().withGrid().function('2x + 3'),
        flashcard().question('What is an integral?').answer('Integral is ...')
    ]
:}
```

### The interactive library
Every interactive block is rendered using a subclass of `InteractiveElement`.

### Text
The text element is a simple text element that is displayed in document. It can be created using the `text(content)` function. Combined with the `.id(componentId)` function this allows you to create a text that can be changed with the click of a button.

### Input
Inputs allow users to interact with the document.

#### Button
To add a button, a `button()` function can be used. The rendered button matches the styling of other buttons on site, but it can be changed.

Once button function is called, the following functions can be chained:

* `.withText(text)`: changes the button text
* `.onClick(callback)`: function that is run when user presses the button

##### Examples
Render a button with text `"Click me!"` that displays a popup with text `"You clicked a button!"` when pressed.

```markdown
{:
    button()
        .withText("Click me!")
        .onClick(function() {
            alert("You clicked a button!");
        })
:}
```

### Plot
The plot component is used to display a graph of a function. It can be created using the `plot()` function.

The following functions can be chained:

* `withGrid()`: displays a unit grid
* `withGrid(boolean displayGrid)`: if `displayGrid` is set to `true`, it displays a grid
* `withDomainX(interval)`: sets the domain along x axis
* `withDomainY(interval)`: sets the domain along y axis
* `withWidth(width)`: sets the component width
* `withHeight(height)`: sets the component height
* `withSize(width, height)`: sets the component width and height
* `withData(dataObject)`: adds data to component that can be used while rendering it
* `function(anonymousFunction)`: plots a function from JavaScript anonymous function
* `function(String functionString)`: plots a function from string
* `withSliderFor(property, interval)`: adds a slider that can be used to alter the plot
* `update()`: can be called to redraw the graph from other components

#### Examples
The following example displays a coordinate system with grid and two functions. In this case, the functions are a simple strings.

```markdown
{:
    plot()
        .withGrid()
        .function('2x + 1')
        .function('x^2 + 1')
:}
```

The following example displays a graph of a linear function which can be changed with two sliders for line slope $m$ and y-intercept $b$. The slope $m$ has an initial value of 1 and the interception point is $(0, 0)$. The slider for slope $m$ is constrained to interval $[-2, 2]$ and the slider for parameter $b$ can have any value between -1 and 1.

In this case, the function isn't a string but an anonymous JavaScript function that accepts two parameters - the parameter `x` and the `data` object which has been initialized in the `.withData({ ... })` function.

```markdown
{:
    plot()
        .function(function(x, data) {
            return data.m * x + data.b;
        })
        .withData({
            m: 1,
            b: 0
        })
        .withSliderFor('m', [-2, 2])
        .withSliderFor('b', [-1, 1])
:}
```

### Flashcard
Another useful interactive element is a flashcard. It can be inserted using `flashcard()` function.

The following functions can be chained:

* `.question(html)`: the question that is displayed in the front side of the card
* `.answer(html)`: the answer that is displayed in the back side of the card

Both the question and the answer function accept only one, `html` argument which allows user to style their cards.

The answer is invisible at the beginning and is shown when user clicks on the card.

#### Examples
```markdown
{:
    flashcard()
        .question('How many bones are in an adult skeleton?')
        .answer('<strong>206</strong>, but varies with development of sesamoid bones (patella)')
:}
```
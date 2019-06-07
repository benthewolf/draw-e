const TOOL_CIRCLE = "circle";
const TOOL_SQUARE = "square";
const TOOL_RECTANGLE = "rectangle";
const TOOL_DELETE = "delete";
const TOOL_MOVE_UP = "move_up";
const TOOL_MOVE_DOWN = "move_down";
const TOOL_MOVE_LEFT = "move_left";
const TOOL_MOVE_RIGHT = "move_right";
const TOOL_COLOUR_CHANGE = "colour_apply"
const TOOLS = [
    TOOL_CIRCLE,
    TOOL_DELETE,
    TOOL_COLOUR_CHANGE,
    TOOL_SQUARE,
    TOOL_MOVE_UP,
    TOOL_MOVE_DOWN,
    TOOL_MOVE_LEFT,
    TOOL_MOVE_RIGHT
];
const EDITOR_TOOLS = [
    TOOL_DELETE,
    TOOL_COLOUR_CHANGE,
    TOOL_MOVE_UP,
    TOOL_MOVE_DOWN,
    TOOL_MOVE_LEFT,
    TOOL_MOVE_RIGHT
];

class Shape {
    get getWidth() {
        return this.width;
    }

    get getHeight() {
        return this.height;
    }

    get getX() {
        return this.x;
    }

    get getY() {
        return this.y;
    }

    get getColour() {
        return this.colour;
    }

    get getId() {
        return this.id;
    }

    set setWidth(width) {
        this.width = width;
    }

    set setHeight(height) {
        this.height = height;
    }

    set setX(x) {
        this.x = x;
    }

    set setY(y) {
        this.y = y;
    }

    set setColour(colour) {
        this.colour = colour;
    }

    constructor(width, height, x, y, colour, id) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.id = id;
    }
}

class Circle extends Shape {
    constructor(width, height, x, y, colour = "black", id) {
        super(width, height, x, y, colour, id);
        this.radius = width / 2;
        this.name = TOOL_CIRCLE;
    }

    draw(canvas) {
        canvas.beginPath();
        canvas.arc(this.getX, this.getY, this.getRadius, 0, 2 * Math.PI, false);
        canvas.fillStyle = this.getColour;
        canvas.fill();
    }

    get getRadius() {
        return this.radius;
    }

    set setRadius(radius) {
        this.radius = radius;
    }
}

class Rectangle extends Shape {
    constructor(width, height, x, y, colour = "black", id) {
        super(width, height, x, y, colour, id);
        this.name = TOOL_RECTANGLE;
    }

    draw(canvas) {
        canvas.fillStyle = this.getColour;
        canvas.fillRect(this.getX, this.getY, this.getWidth, this.getHeight);
    }
}

class Square extends Shape {
    constructor(width, height, x, y, colour = "black", id) {
        if (width != height) {
            throw new Error("This is not a Square !");
        }
        super(width, height, x, y, colour, id);
        this.name = TOOL_SQUARE;
    }

    draw(canvas) {
        canvas.fillStyle = this.getColour;
        canvas.fillRect(this.getX, this.getY, this.getWidth, this.getWidth);
    }
}

class Model {
    constructor() {
        this.currentShapes = {};
        this.currentSelectedShape = "";
        this.currentSelectedTool = "";
        this.subscribers = [];
        this.idCount = 1;
        this.currentRenderColour = "black"
    }

    shapeManipulations = {
        colour(shape, newColour) {
            shape.setColour = newColour;
            this.currentRenderColour = newColour;
        },

        top(shape, newVal) {
            shape.setY = shape.getY - newVal;
        },

        left(shape, newVal) {
            shape.setX = shape.getX + newVal;
        }
    }

    get getCurrentShapes() {
        let output = Array.prototype.reverse.call(this.currentShapes);
        delete output[length];
        return output;
    }

    get getIdCount() {
        return this.idCount++;
    }

    get getCurrentRenderColour() {
        return this.currentRenderColour;
    }

    get getCurrentSelectedTool() {
        return this.currentSelectedTool;
    }

    get getCurrentSelectedShape() {
        return this.currentSelectedShape;
    }

    addShape(shape) {
        this.currentShapes[shape.getId] = shape;
        let temp = {};
        temp[shape.getId] = shape;
        this.notifySubscribers("shapeAddition", temp);
    }

    deleteShape(id) {
        delete this.currentShapes[id];
        this.currentSelectedShape = null;
        this.notifySubscribers("shapeDeletion", this.currentShapes);
    }

    editShape(id, property, newValue) {
        let shape = this.currentShapes[id]
        this.shapeManipulations[property].call(this, shape, newValue);
        this.notifySubscribers("shapeEdit", this.currentShapes);
    }

    set setCurrentSelectedShape(shape) {
        this.currentSelectedShape = shape;
        this.notifySubscribers("shapeSelect", shape);
    }

    set setCurrentSelectedTool(tool) {
        this.currentSelectedTool = tool;
        this.notifySubscribers("toolSelect", tool);
    }

    notifySubscribers(message, data) {
        this.subscribers.forEach(e => e.updateNow(message, data));
    }

    addSubscriber(subscriber) {
        this.subscribers.push(subscriber);
    }
}

class View {
    DomElems = {
        canvas: "canvas",
        canvasParent: "workspc",
        viewPane: "drawnpane"
    };

    defaultShapesSettings = {
        circle() {
            this.elem = document.createElement("DIV");
            this.elem.id = "preview";
            this.elem.style.border = "2px solid black"
            this.elem.style.position = "absolute";
            this.elem.style.width = "50px";
            this.elem.style.height = "50px";
            this.elem.style.display = "block";
            this.elem.style.borderRadius = "90%";
            this.canvasContainer.appendChild(this.elem);
        },

        square() {

            this.elem = document.createElement("DIV");
            this.elem.id = "preview";
            this.elem.style.border = "2px solid black"
            this.elem.style.position = "absolute";
            this.elem.style.width = "50px";
            this.elem.style.height = "50px";
            this.elem.style.display = "block";
            this.canvasContainer.appendChild(this.elem);
        }


    };

    constructor() {
        this.count = 0;
        this.clickPane = null;
        this.canvasClick = null;
        this.toolClick = null;
        this.mouseMovementHandler = null;
        this.canvas = document
            .getElementById(this.DomElems.canvas)
            .getContext("2d");
        this.viewPane = document.getElementById(this.DomElems.viewPane);
        this.canvasContainer = document.getElementById(this.DomElems.canvasParent);
        this.canvas.canvas.width = this.canvasContainer.getBoundingClientRect().width;
        this.canvas.canvas.height = this.canvasContainer.getBoundingClientRect().height;
    }

    set setToolClick(action) {
        this.toolClick = action;
    }

    set setViewPaneClick(action) {
        this.clickPane = action;
    }

    set setMouseMovementHandler(action) {
        this.mouseMovementHandler = action;
    }

    set setCanvasClick(action) {
        this.canvasClick = action;
    }

    init() {
        for (let tool of TOOLS) {
            document.getElementById(tool).addEventListener("click", this.toolClick);
        }

        this.canvasContainer.addEventListener(
            "mousemove",
            this.mouseMovementHandler
        );

        this.canvasContainer.addEventListener("mousedown", this.canvasClick);
        this.canvasContainer.addEventListener("mouseup", this.canvasClick);
    }

    updateNow(message, data) {
        switch (message) {
            case "shapeAddition":
                this.PopulateViewPane(data, true);
                this.RenderCanvas(data);
                break;

            case "shapeEdit":
                this.ClearViewPane();
                this.ClearCanvas();
                this.PopulateViewPane(data);
                this.RenderCanvas(data);
                break;

            case "shapeDeletion":
                this.ClearViewPane();
                this.ClearCanvas();
                this.PopulateViewPane(data);
                this.RenderCanvas(data);
                break;
        }
    }

    ClearViewPane() {
        while (this.viewPane.firstChild) {
            this.viewPane.removeChild(this.viewPane.firstChild);
        }
    }

    PopulateViewPane(data, add = false) {
        if (!add) {
            for (let shape in data) {
                if (data.hasOwnProperty(shape)) {
                    let node = document.createElement("DIV");
                    let text = (data[shape].name).toUpperCase() + "\n\n" +
                        "Width: " + data[shape].getWidth + "\n" +
                        "Height: " + data[shape].getHeight + "\n" +
                        "Color: " + data[shape].getColour;

                    node.innerText = text;
                    node.style.textAlign = "center";
                    node.id = data[shape].getId;
                    node.style.cursor = "pointer";
                    node.classList.add("shapes");
                    node.addEventListener("click", this.clickPane);
                    this.viewPane.appendChild(node);

                }
            }
        } else {
            for (let shape in data) {
                if (data.hasOwnProperty(shape)) {
                    let node = document.createElement("DIV");
                    let text = (data[shape].name).toUpperCase() + "\n\n" +
                        "Width: " + data[shape].getWidth + "\n" +
                        "Height: " + data[shape].getHeight + "\n" +
                        "Color: " + data[shape].getColour;

                    node.innerText = text;
                    node.style.textAlign = "center";
                    node.id = data[shape].getId;
                    node.style.cursor = "pointer";
                    node.classList.add("shapes");
                    node.addEventListener("click", this.clickPane);
                    this.viewPane.insertAdjacentElement("afterbegin", node);

                }
            }
        }
    }

    ClearCanvas() {
        this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    }

    RenderCanvas(data) {
        for (let shape in data) {
            if (data.hasOwnProperty(shape)) {
                data[shape].draw(this.canvas);
            }
        }
    }

    showPreviewElem(shape) {
        this.defaultShapesSettings[shape].call(this);
    }

    deletePreview() {
        if (this.elem)
            this.elem.remove();
    }
}

class MainController {
    editorTools = {
        delete() {
            this.model.deleteShape(this.model.getCurrentSelectedShape);
        },

        colour_apply() {
            let colour = document.getElementById("colour_choice").value;
            this.model.editShape(this.model.getCurrentSelectedShape, "colour", colour)
        },
        move_up() {
            this.model.editShape(this.model.getCurrentSelectedShape, "top", 3);
        },
        move_down() {
            this.model.editShape(this.model.getCurrentSelectedShape, "top", -3);
        },
        move_left() {
            this.model.editShape(this.model.getCurrentSelectedShape, "left", -3);
        },
        move_right() {
            this.model.editShape(this.model.getCurrentSelectedShape, "left", 3);
        }

    };

    shapeTools = {
        circle(width, height, x, y, colour, id) {
            return new Circle(width, height, x, y, colour, id)
        },

        rectangle(width, height, x, y, colour, id) {
            return new Rectangle(width, height, x, y, colour, id)
        },

        square(width, height, x, y, colour, id) {
            return new Square(width, height, x, y, colour, id)
        },
    }

    constructor(model, view) {
        this.isDragging = false;
        this.mouseMovement = 0;
        this.model = model;
        this.view = view;
        this.view.setToolClick = this.toolClick.bind(this);
        this.view.setViewPaneClick = this.viewPaneClick.bind(this);
        this.view.setMouseMovementHandler = this.mouseMovementHandler.bind(this);
        this.view.setCanvasClick = this.canvasClick.bind(this);
        this.view.init();
    }

    toolClick(event) {
        if (TOOLS.includes(event.target.id)) {
            if (EDITOR_TOOLS.includes(event.target.id)) {
                this.view.deletePreview();
                this.model.setCurrentSelectedTool = event.target.id;
                let executions = this.editorTools;
                executions[event.target.id].call(this, event);
            } else {
                if (this.model.getCurrentSelectedTool != event.target.id) {
                    this.view.deletePreview();
                    this.model.setCurrentSelectedTool = event.target.id;
                    this.view.showPreviewElem(event.target.id);
                } else {
                    this.view.deletePreview();
                    this.model.setCurrentSelectedTool = null;
                }
            }
        } else {}
    }

    mouseMovementHandler(event) {
        if (this.view.elem == undefined) {
            return;
        }

        if (this.isDragging) {
            this.mouseMovement += event.movementX * -1;
            this.view.elem.style.width = this.mouseMovement + "px";
            this.view.elem.style.height = this.mouseMovement + "px";
            //let top = window.innerHeight - this.view.canvasContainer.getBoundingClientRect().width;
            let left = window.innerWidth - this.view.canvasContainer.getBoundingClientRect().width;

            this.view.elem.style.top = (event.clientY) + "px";
            this.view.elem.style.left = (event.clientX - left) + "px"
        } else {
            //let top = window.innerHeight - this.view.canvasContainer.getBoundingClientRect().width;
            let left = window.innerWidth - this.view.canvasContainer.getBoundingClientRect().width;

            this.view.elem.style.top = (event.clientY) + "px";
            this.view.elem.style.left = (event.clientX - left) + "px"
        }
    }

    canvasClick() {
        if (
            !EDITOR_TOOLS.includes(this.model.getCurrentSelectedTool) &&
            this.model.getCurrentSelectedTool != null
        ) {
            if (!this.isDragging) {
                this.isDragging = true;
            } else {
                let top = window.innerHeight - this.view.canvasContainer.getBoundingClientRect().width;
                let left = window.innerWidth - this.view.canvasContainer.getBoundingClientRect().width;
                this.isDragging = false;
                let rect = this.view.elem.getBoundingClientRect();
                this.model.addShape(
                    this.shapeTools[this.model.getCurrentSelectedTool](
                        rect.width,
                        rect.height,
                        rect.left - left + 4,
                        rect.top,
                        this.model.getCurrentRenderColour,
                        this.model.getIdCount
                    )
                )
            }
        }
    }

    viewPaneClick(event) {
        let children = event.target.parentNode.childNodes;
        if (this.model.getCurrentSelectedShape != event.target.id) {
            for (let a = 0; a < children.length; ++a) {
                children[a].classList.remove("active");
            }
            event.target.classList.add("active");
            this.model.setCurrentSelectedShape = event.target.id;
        } else {
            this.model.setCurrentSelectedShape = null;
            event.target.classList.remove("active");
        }
    }
}

class DrawE_New {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.model.addSubscriber(this.view);
        this.controller = new MainController(this.model, this.view);
    }
}

const drawE_new = new DrawE_New();
const TOOL_CIRCLE = "circle";
const TOOL_SQUARE = "square";
const TOOL_RECTANGLE = "rectangle";
const TOOL_DELETE = "delete";
const TOOL_MOVE_UP = "moveUp";
const TOOLS = [TOOL_CIRCLE, TOOL_SQUARE, TOOL_RECTANGLE, TOOL_DELETE];
const EDITOR_TOOLS = [TOOL_DELETE];

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

    get getColor() {
        return this.color;
    }

    get getId() {
        this.id;
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

    set setColor(color) {
        this.color = color;
    }

    constructor(width, height, x, y, color, id) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color;
        this.id = id;
    }
}

class Circle extends Shape {
    constructor(width, height, x, y, color = "black", id) {
        super(width, height, x, y, color, id);
        this.radius = width / 2;
        this.name = TOOL_CIRCLE;
    }

    draw(canvas) {
        canvas.beginPath();
        canvas.arc(this.getX, this.getY, this.getRadius, 0, 2 * Math.PI, false);
        canvas.fillStyle = this.getColor;
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
    constructor(width, height, x, y, color = "black", id) {
        super(width, height, x, y, color, id);
        this.name = TOOL_RECTANGLE;
    }

    draw(canvas) {
        canvas.fillStyle = this.getColor;
        canvas.fillRect(this.getX, this.getY, this.getWidth, this.getHeight);
    }
}

class Square extends Shape {
    constructor(width, height, x, y, color = "black", id) {
        if (width != height) {
            throw new Error("This is not a Square !");
        }
        super(width, height, x, y, color, id);
        this.name = TOOL_SQUARE;
    }

    draw(canvas) {
        canvas.fillStyle = this.getColor;
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
    }

    get getCurrentShapes() {
        return this.currentShapes;
    }

    get GetIdCount() {
        return this.idCount++;
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
        this.currentSelectedShape = "";
        this.notifySubscribers("shapeDeletion", this.currentShapes);
    }

    editShape(id, property, newValue) {
        this.currentShapes[id][property] = newValue;
        this.currentShapes("shapeEdit", this.currentShapes);
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
    DomTools = [TOOL_CIRCLE, TOOL_DELETE];
    DomElems = {
        canvas: "canvas",
        canvasParent: "workspc",
        viewPane: "drawnPane"
    };

    defaultShapesSettings = {
        circle() {
            this.elem = document.createElement("DIV");
            this.elem.classList.add("circle");
            this.elem.id = "preview";
            this.elem.style.borderColor = "black";
            this.elem.style.position = "absolute";
            this.elem.style.width = "40px";
            this.elem.style.height = "40px";
            this.elem.style.display = "block";
            this.canvasContainer.appendChild(this.elem);
            let self = this;
            this.canvasContainer.addEventListener(
                "mousemove",
                this.mouseMovementHandler
            );
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
        for (let tool of this.DomTools) {
            document.getElementById(tool).addEventListener("click", this.toolClick);
        }

        this.canvasContainer.addEventListener("mousedown", this.canvasClick);
        this.canvasContainer.addEventListener("mouseup", this.canvasClick);
    }

    updateNow(message, data) {
        switch (message) {
            case "shapeAddition":
                this.PopulateViewPane(data);
                this.renderCanvas(data);
                break;

            case "shapeEdit":
                this.ClearCanvas();
                this.RenderCanvas(data);
                break;

            case "toolSelect":
                console.log("Tool has been selected");
                break;

            case "shapeDeletion":
                console.log("A shape has deleted");
                break;
        }
    }

    ClearViewPane() {
        while (this.viewPane.firstChild) {
            this.viewPane.removeChild(this.viewPane.firstChild);
        }
    }

    PopulateViewPane(data) {
        for (shape in data) {
            if (data.hasOwnProperty(shape)) {
                let node = document.createElement("DIV");
                node.innerText = shape.name;
                node.id = shape.getId;
                node.style.cursor = "pointer";
                node.classList.add("shapes");
                node.addEventListener("click", this.clickPane);
            }
        }
    }

    ClearCanvas() {
        canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    }

    RenderCanvas(data) {
        for (shape in data) {
            if (data.hasOwnProperty(shape)) {
                shape.draw(this.canvas);
            }
        }
    }

    showPreviewElem(shape) {
        this.defaultShapesSettings[shape].call(this);
    }

    deletePreview() {
        this.elem.remove();
    }
}

class MainController {
    editorTools = {
        delete: function (event) {
            this.model.deleteShape(event.target.id);
        }
    };

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
        if (this.isDragging) {
            this.mouseMovement += event.movementX * -1;
            this.elem.style.width = this.mouseMovement + "px";
            this.elem.style.height = this.mouseMovement + "px";
        } else {
            let top = event.offsetY;
            let left = event.offsetX;
            this.view.elem.style.top = top + "px";
            this.view.elem.style.left = left + "px";
        }
    }

    canvasClick() {
        if (
            !EDITOR_TOOLS.includes(this.model.getCurrentSelectedTool) &&
            this.model.getCurrentSelectedTool != null
        ) {
            console.log("hey");
            if (!this.isDragging) {
                this.isDragging == true;
            } else {
                this.isDragging = false;
            }
        }
    }

    viewPaneClick(event) {}
}

class DrawE_New {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.model.addSubscriber(this.view);
        this.controller = new MainController(this.model, this.view);
    }
}

let drawE_new = new DrawE_New();
(() => {

    const renderShape = {
        /**
         * Object that defines how to render all shapes on the canvas
         */
        circle: function (arg, canvas) {
            canvas.beginPath();
            canvas.arc(arg["x"], arg["y"], arg["height"], 0, 2 * Math.PI, false);
            canvas.fillStyle = "black";
            canvas.fill();
        },

        square: function () {}
    };

    const IsRequired = (elem) => {
        throw new Error(elem + " : Arguement is required !");
    };

    const ViewPane = function (element = IsRequired("element")) {

        this.node = document.getElementById(element);
        if (!this.node) {
            throw new Error("Element Not found !");
        }
        this.id = element;
    };

    const ViewPaneController = function (viewPaneId = IsRequired(), drawE = IsRequired()) {


        this.viewPane = new ViewPane(viewPaneId);
        this.drawE = drawE;
        this.PopulateViewPane();
        this.currentSelectedRenderedShape = null;

    };

    ViewPaneController.prototype.UpdateViewPane = function () {
        this.ClearViewPane();
        this.PopulateViewPane();
    };

    ViewPaneController.prototype.ClearViewPane = function () {
        let node = this.viewPane.node;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    };

    ViewPaneController.prototype.PopulateViewPane = function () {
        let currentShapes = this.drawE.workSpaceController.workSpace.currentShapes;
        let self = this;
        for (obj in currentShapes) {
            if (currentShapes.hasOwnProperty(obj)) {
                let node = document.createElement("DIV");
                node.addEventListener("click", function (event) {
                    self.SetCurrentSelectedRenderedShape(event);
                    let children = event.target.parentNode.childNodes;
                    for (let a = 0; a < children.length; ++a) {
                        children[a].classList.remove("active");
                    }
                    if (event.target.classList.contains("active")) {
                        event.target.classList.remove("active");
                    } else {
                        event.target.classList.add("active");
                    }
                });
                node.id = currentShapes[obj]["id"]
                node.innerText = currentShapes[obj]["shape"];
                node.style.cursor = "pointer";
                node.classList.add("shapes");

                this.viewPane.node.appendChild(node);
            }
        }
    };

    ViewPaneController.prototype.SetCurrentSelectedRenderedShape = function (event) {


        if (this.currentSelectedRenderedShape != event.target.id) {
            this.currentSelectedRenderedShape = event.target.id
        } else {
            this.currentSelectedRenderedShape = null;
        }
        console.log(this.currentSelectedRenderedShape);

    };



    const ToolContainer = function (element = IsRequired("element"), tools) {

        this.containerElement = document.getElementById(element);


        if (!this.containerElement) {
            throw new Error("Container Id does not exist !");
        }

        this.toolElements = [];


        if (tools != undefined && tools.length != 0) {
            this.RegisterTools(tools);

        }

        this.currentSelectedTool;

    };

    ToolContainer.prototype.RegisterTools = function (tools) {
        if (!Array.isArray(tools)) {
            throw new Error("Tools must be in an array !");
        }
        for (tool of tools) {
            if (!this.containerElement.contains(document.getElementById(tool.id))) {
                throw new Error("Tool: " + tool.id + " must be a direct child of the tool container !");
            }
            tool.node = document.getElementById(tool.id);
            let tempobj = {};
            tempobj[tool.id] = tool
            this.toolElements.push(tempobj);
        };



    };

    ToolContainer.prototype.getTools = function () {
        return this.toolElements;
    };

    const ToolsController = function (toolContainer = IsRequired("toolContainer"), drawE = IsRequired("An instance of DrawE")) {

        if (!toolContainer instanceof ToolContainer) {
            throw new Error("Arguement is not an instance of ToolContainer !");
        }

        this.toolContainer = toolContainer;
        this.currentSelectedTool = null;
        this.DrawE = drawE;
        this.toolImplementations;
    };

    ToolsController.prototype.RegisterTools = function () {

        let self = this;

        let currentTools = this.toolContainer.getTools();
        for (obj of currentTools) {
            for (key in obj) {
                if (obj[key]["editorTool"] != true) {
                    this.RegisterShapeTool(obj[key]);
                } else {
                    this.RegisterEditorTool(obj[key]);
                }
            }
        }

    };

    ToolsController.prototype.RegisterShapeTool = function (obj = IsRequired("Obj")) {
        let self = this;

        obj["node"].addEventListener("click", function (event) {
            self.SetCurrentSelectedTool(event.target.id);
            self.ExecuteToolFunction(event.target.id);
            /* let parent = event.target.parentNode;
            for (let a = 0; a < parent.childNodes; ++a) {

                parent.childNodes[a].classList.remove("active");
            }
            event.target.classList.toggle("active"); */

        });

    };

    ToolsController.prototype.RegisterEditorTool = function (obj = IsRequired("Obj")) {
        let self = this;

        obj["node"].addEventListener("click", function (event) {
            self.DrawE.workSpaceController.HidePreview();
            if (self.currentSelectedTool != event.target.id) {
                self.SetCurrentSelectedTool(event.target.id);
            }
            self.ExecuteToolFunction(event.target.id);
            /* let parent = event.target.parentNode;
            for (let a = 0; a < parent.childNodes; ++a) {
                parent.childNodes[a].classList.remove("active");
            }
            event.target.classList.toggle("active"); */

        });
    };

    ToolsController.prototype.SetCurrentSelectedTool = function (tool = IsRequired("tool")) {

        if (this.currentSelectedTool != tool) {
            this.currentSelectedTool = tool;
        } else {
            this.currentSelectedTool = null;
            this.DrawE.workSpaceController.HidePreview();
        }

    };


    ToolsController.prototype.ExecuteToolFunction = function (tool = IsRequired()) {
        this.toolImplementations[tool](this.DrawE);

    }




    ToolsController.prototype.RegisterImplementations = function (implementations = IsRequired("implementations")) {

        this.toolImplementations = implementations;

    };


    const WorkSpace = function (workSpace = IsRequired("workSpace"), canvas = IsRequired("canvas")) {

        this.workSpaceId = workSpace;
        this.workSpace = document.getElementById(workSpace);
        this.currentShapes = {};

        if (!workSpace) {
            throw new Error("The id for the workSpace does not exist !")
        }

        this.canvasId = canvas;
        this.canvas = document.getElementById(canvas).getContext("2d");

        if (!canvas) {
            throw new Error("The Id for the canvas does not exist !")
        }

        this.canvas.canvas.width = this.workSpace.getBoundingClientRect().width;
        this.canvas.canvas.height = this.workSpace.getBoundingClientRect().height;

    };

    WorkSpace.prototype.AddShape = function (details = IsRequired("details")) {


        this.currentShapes[details.id] = details

    };

    WorkSpace.prototype.DeleteShape = function (ShapeId = IsRequired("ShapeId")) {
        delete this.currentShapes[ShapeId];
    }


    const CanvasController = function (elem = IsRequired("elem"), renderSheet = IsRequired("renderSheet")) {

        this.workSpace = elem
        this.canvas = elem.canvas;
        this.renderShape = renderSheet;
    };

    CanvasController.prototype.render = function () {
        this.ClearCanvas();
        window.canvas = this.canvas;
        let currentShapes = this.workSpace.currentShapes;
        for (let obj in currentShapes) {
            if (currentShapes.hasOwnProperty(obj)) {
                this.renderShape[currentShapes[obj]["shape"]](currentShapes[obj], this.canvas);
            }
        }
    };

    CanvasController.prototype.ClearCanvas = function () {

        this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    };

    const PreviewElem = function (workSpace = IsRequired("workSpace")) {

        this.elem = document.createElement("DIV");
        this.elem.style.borderColor = "black";
        this.elem.id = "preview";
        this.elem.style.position = "absolute";
        this.elem.style.width = "12.5%";
        this.elem.style.height = "25%";
        this.elem.style.display = "none";
        this.workSpace = workSpace
        this.workSpace.appendChild(this.elem);
    };

    PreviewElem.prototype.SetShape = function (shape) {

        if (this.elem.classList.contains(shape)) {
            this.elem.classList.remove(shape);
        };

        this.elem.classList.add(shape);

    };

    PreviewElem.prototype.SetDisplay = function (value) {
        if (value) {
            this.elem.style.display = "block";
        } else {
            this.elem.style.display = "none";
        }
    };

    PreviewElem.prototype.ResetElement = function () {
        this.elem.style.width = "12.5%";
        this.elem.style.height = "25%";
    };

    const PreviewElemController = function (workSpace) {
        this.boundController = workSpace
        this.workSpace = this.boundController.workSpace;
        this.previewElem = new PreviewElem(this.workSpace.workSpace);

    };

    PreviewElemController.prototype.Show = function (currentSelectedShape) {
        this.previewElem.SetDisplay(true);

        this.previewElem.SetShape(currentSelectedShape);
        let self = this;
        this.workSpace.workSpace.addEventListener("mousemove", function (event) {
            self.UpdatePreview(event);
        })
    };

    PreviewElemController.prototype.UpdatePreview = function (event) {

        let elem = this.previewElem.elem;
        if (!this.boundController.isDragging) {
            this.previewElem.ResetElement();
            let top = event.offsetY;
            let left = event.offsetX;
            elem.style.top = top + "px";
            elem.style.left = left + "px";
        } else {
            this.boundController.mouseMovement += event.movementX * -1;
            elem.style.width = this.boundController.mouseMovement + "px";
            elem.style.height = this.boundController.mouseMovement + "px";
        }
    };

    PreviewElemController.prototype.Hide = function () {
        this.previewElem.SetDisplay(false);
        this.previewElem.SetShape("none");
        let self = this;
        this.workSpace.workSpace.removeEventListener("mousemove", function () {
            self.UpdatePreview();
        })
    };

    const WorkSpaceController = function (drawE = IsRequired("An Instance of drawE")) {
        this.drawE = drawE;
        this.mouseMovement = 0
        this.idCount = 1;
        this.isDragging = false;
        this.workSpace = new WorkSpace("workspc", "canvas");
        this.canvasController = new CanvasController(this.workSpace, renderShape);
        this.previewElemController = new PreviewElemController(this);
        this.previewShowing = false;
    };

    WorkSpaceController.prototype.ShowPreview = function () {
        this.previewShowing = true;
        this.previewElemController.Show(this.drawE.toolsController.currentSelectedTool);
        this.ListenForDrags();
    };

    WorkSpaceController.prototype.RenderNewShape = function () {
        let elem = this.previewElemController.previewElem.elem;
        let rect = elem.getBoundingClientRect();
        this.workSpace.canvas.moveTo(rect.x, rect.y);
        let id = this.idCount;
        currentSelected = this.drawE.toolsController.currentSelectedTool;

        let widthElem = elem.style.width;

        let currentShape = {
            id: id,
            shape: currentSelected,
            x: Math.floor(rect.left - parseInt(widthElem)),
            y: Math.floor(rect.top),
            width: Math.floor(rect.width - 10),
            height: Math.floor(rect.height - 10),
            color: "black"
        };

        this.workSpace.AddShape(currentShape);
        this.idCount++;
        this.drawE.RefreshState();
    };



    WorkSpaceController.prototype.HidePreview = function () {
        this.previewShowing = false;
        this.previewElemController.Hide();
        this.StopListening();
    };

    WorkSpaceController.prototype.ListenForDrags = function () {
        let self = this;
        this.workSpace.workSpace.addEventListener("mousedown", function () {
            if (self.previewShowing) {
                self.isDragging = true;
            }
        });

        this.workSpace.workSpace.addEventListener("mouseup", function () {
            self.isDragging = false;
            if (self.previewShowing) {
                self.StopListening();
                self.RenderNewShape();
                this.mouseMovement = 0;
            }
        })
    };

    WorkSpaceController.prototype.DeleteShape = function (shapeId = IsRequired("ShapeId")) {

        this.workSpace.DeleteShape(ShapeId);
        this.drawE.RefreshState();
    }

    WorkSpaceController.prototype.StopListening = function () {
        let self = this;
        this.workSpace.workSpace.removeEventListener("mouseup", function () {
            self.isDragging = false;
            if (self.previewShowing) {
                self.StopListening();
                self.RenderNewShape();
                this.mouseMovement = 0;
            }
        });

        this.workSpace.workSpace.removeEventListener("mousedown", function () {

            self.isDragging = true;

        });

    };


    const ToolImplementations = {
        circle: function (drawE) {
            drawE.workSpaceController.ShowPreview();
        },

        delete: function (drawE) {

            if (drawE.currentSelectedRenderedShape != null) {
                drawE.workSpaceController.DeleteShape(drawE.currentSelectedRenderedShape);

            }
        }
    };

    const toolDefinitions = [{
        id: "circle",
        render: true,
        editorTool: false,
    }, {
        id: "delete",
        editorTool: true,
    }]

    const DrawE = function () {
        this.workSpaceController = new WorkSpaceController(this);
        this.toolsController = new ToolsController(new ToolContainer("tools", toolDefinitions), this);
        this.toolsController.RegisterTools();
        this.toolsController.RegisterImplementations(ToolImplementations);
        this.viewPaneController = new ViewPaneController("drawnpane", this);
        this.isDragging = false;
        this.currentSelectedTool = this.getCurrentSelectedTool();
        this.currentSelectedRenderedShape = this.getCurrentSelectedRenderedShape();
    }

    DrawE.prototype.getCurrentSelectedTool = function () {
        return this.toolsController.currentSelectedTool;
    }

    DrawE.prototype.getCurrentSelectedRenderedShape = function () {
        return this.viewPaneController.currentSelectedRenderedShape;
    }

    DrawE.prototype.RefreshState = function () {
        this.workSpaceController.canvasController.render();
        this.viewPaneController.UpdateViewPane();
    }

    drawE = DrawE;

})();
(() => {
    //These are all the the tools 
    const tools = document.getElementsByClassName("tool");

    //The container for the cavas
    const workspc = document.getElementById("workspc");

    //The pane that shows currently rendered elements
    const drawnPane = document.getElementById("drawnpane");

    //The canvas
    const canvas = document.querySelector("canvas").getContext("2d");

    //Set the width and height of the canvas to match its parent
    canvas.canvas.width = workspc.getBoundingClientRect().width;
    canvas.canvas.height = workspc.getBoundingClientRect().height;

    //is There a drag occuring ?
    let isDragging = false;

    //Currently valid shapes
    let currentShapes = {};

    let currentSelected;
    //Currently selected rendered shape
    let currentSelectedRenderedShape;

    //Add event listeners for all tools for the click event
    for (let a = 0; a < tools.length; ++a) {
        tools[a].addEventListener("click", ToolSelectionHandler);
    }

    //Create the preview element and style it;
    let elem = document.createElement("DIV");
    elem.classList.add("circle");
    elem.style.borderColor = "black";
    elem.id = "preview";
    elem.style.position = "absolute";
    elem.style.width = "12.5%";
    elem.style.height = "25%";
    elem.style.display = "none";
    viewport.appendChild(elem);

    let shapeTools = ["circle"]


    function DrawOnWorkspace(event) {
        /**
         * When the drag is done, it set the size, postion ,
         *  creates and id and adds all of this to an object
         */

        if (!isDragging || !shapeTools.includes(currentSelected)) {

        } else {

            mouseMovement = 0;
            isDragging = false;
            let rect = elem.getBoundingClientRect();
            canvas.moveTo(rect.x, rect.y);

            let id = "#" + Math.floor(10 + Math.random() * 400000);

            currentShapes[id] = {
                id: id,
                shape: currentSelected,
                x: rect.left - rect.width,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                color: "black"
            }

        }

        render();

    }


    function UpdateViewPane() {
        /**
         * Simply destroys the current elements in the view
         * pane and rebuilds with the current elements in the model
         */

        while (drawnPane.firstChild) {
            drawnPane.removeChild(drawnPane.firstChild);
        }
        for (let obj in currentShapes) {
            if (currentShapes.hasOwnProperty(obj)) {
                let node = document.createElement("DIV");
                node.addEventListener("click", function (event) {
                    currentSelectedRenderedShape = currentShapes[obj]["id"];
                    let children = event.target.parentNode.childNodes;
                    for (let a = 0; a < children.length; ++a) {
                        children[a].classList.remove("active");
                        console.log("hey");
                    }

                    if (event.target.classList.contains("active")) {
                        event.target.classList.remove("active");
                    } else {
                        event.target.classList.add("active");
                    }


                });
                node.innerText = currentShapes[obj]["id"] + currentShapes[obj]["shape"];
                node.style.cursor = "pointer";
                node.classList.add("shapes");

                drawnPane.appendChild(node);
            }
        }
    }



    const renderShape = {
        /**
         * Object that defines how to render all shapes on the canvas
         */
        circle: function (arg) {

            canvas.beginPath();
            canvas.arc(arg["x"], arg["y"], arg["height"],
                0, 2 * Math.PI, false);
            canvas.fillStyle = arg["black"];
            canvas.fill();

        },

        square: function () {



        },
    }



    function render() {
        /**
         * Calls the render object for all shapes
         * in the model
         */
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        console.log("render called !");
        for (let obj in currentShapes) {
            if (currentShapes.hasOwnProperty(obj)) {

                renderShape[currentShapes[obj]["shape"]](currentShapes[obj]);
            }
        }

        UpdateViewPane();
    }

    function HandleClick(event) {
        if (currentSelected != event.target.id) {
            currentSelected = event.target.id;
        } else {
            currentSelected = null;
        }
    }

    function DeleteItem(elem) {
        return;
    }


    let mouseMovement = 0;

    function UpdatePreview(event) {
        /**
         * Binds the preview to cursor movement
         * also binds size to X axis movement during dragging
         */
        if (!isDragging)
            elem.style.top = event.clientY + "px";
        elem.style.left = event.clientX + "px";

        if (isDragging) {
            mouseMovement += (event.movementX * -1);
            elem.style.width = mouseMovement + "px";
            elem.style.height = mouseMovement + "px";
        }
    }

    function SetIsDragging() {
        isDragging = true;
    }

    function CursorPreview(tool) {
        /**
         * Makes the preview visible and binds it to mousemovements
         */
        if (!tool.target.classList.contains("active")) {
            elem.style.display = "inline-block";

            workspc.addEventListener("mousemove", UpdatePreview)

        } else {
            elem.style.display = "none";
            console.log("Removed");
            isDragging = false;
            canvas.canvas.removeEventListener("mouseup", DrawOnWorkspace);
            canvas.canvas.removeEventListener("mousemove", UpdatePreview);
            canvas.canvas.removeEventListener("mousedown", SetIsDragging);
        }
    }

    function ToolSelectionHandler(event) {
        console.log(event);



        WhatDoesTheToolDo[event.target.id](event);




    }

    const WhatDoesTheToolDo = {
        "circle": function (event) {
            console.log("circle");
            currentSelected = "circle";
            CursorPreview(event);
            canvas.canvas.addEventListener("mousedown", () => {
                isDragging = true;
            });
            canvas.canvas.addEventListener("mouseup", DrawOnWorkspace);
            CursorPreview(event);

        },

        "delete": function (event) {
            currentSelected = "delete";
            if (currentSelectedRenderedShape) {
                delete currentShapes[currentSelectedRenderedShape];
                console.log(currentShapes);
                render(event);
            }
        }
    }

    for (let a = 0; a < tools.length; ++a) {
        tools[a].addEventListener("click", function (event) {
            event.stopPropagation();
            event.target.classList.toggle("active");
        });
    }
})();
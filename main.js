var tools = document.getElementsByClassName("tool");
var circleTool = document.getElementById("circle");
const workspc = document.getElementById("workspc");
const viewport = document.getElementById("viewport");
const drawnPane = document.getElementById("drawnpane");
var isDragging = false;
var currentElems = [];
var currentSelected;

circleTool.addEventListener("click", ToolSelectionHandler);

var elem = document.createElement("DIV");

elem.classList.add("circle");
elem.style.borderColor = "black";
elem.id = "preview";
elem.style.position = "absolute";
elem.style.width = "12.5%";
elem.style.height = "25%";
elem.style.display = "none";
workspc.appendChild(elem);



function DrawOnWorkspace(event) {

    if (isDragging == false) {
        return;
    } else {

        mouseMovement = 0;
        isDragging = false;

        let rect = elem.getBoundingClientRect()
        elem.style.width = "12.5%";
        elem.style.height = "25%";
        let newElem = document.createElement("DIV");
        newElem.id = Math.floor(1 + Math.random() * 20000000) + "  circle";
        currentElems.push(newElem.id);
        newElem.classList.add("circle");
        newElem.style.width = rect.width + "px";
        newElem.style.height = rect.height + "px";
        newElem.style.borderColor = "black";
        newElem.style.position = "relative";
        newElem.style.margin = "0px";
        newElem.style.display = "inline-block";
        newElem.style.zIndex = "1";
        newElem.addEventListener("click", HandleClick)
        workspc.appendChild(newElem);
        RenderDrawnPane();
    }

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

function RenderDrawnPane() {

    let currentpane = drawnPane.childNodes;
    for (let i = 0; i < currentpane.length; ++i) {
        drawnPane.removeChild(currentpane[i]);
    }

    var frag = new DocumentFragment();

    for (let a = 0; a < currentElems.length; ++a) {

        let newElem = document.createElement("DIV");
        newElem.classList.add("viewer");
        newElem.innerText = currentElems[a];
        let button = document.createElement("BUTTON");
        button.innerText = "Delete";
        button.addEventListener("click", DeleteItem);

        newElem.appendChild(button);

        frag.appendChild(newElem);


    }

    drawnPane.appendChild(frag);
}





var mouseMovement = 0;

function UpdatePreview(event) {

    if (!isDragging)
        elem.style.transform = "translate(" + (parseInt(event.clientX + scrollX) - 500) + "px," + (parseInt(event.clientY + scrollY) - 200) + "px)"

    if (isDragging) {
        mouseMovement += (event.movementX * -1);
        elem.style.width = mouseMovement + "px";
        elem.style.height = mouseMovement + "px";
    }
}

function SetIsDragging() {
    isDragging = true
}

function CursorPreview(tool) {
    if (!tool.target.classList.contains("active")) {
        elem.style.display = "inline-block";

        workspc.addEventListener("mousemove", UpdatePreview)

    } else {
        elem.style.display = "none";
        console.log("Removed");

        isDragging = false;
        workspc.removeEventListener("mouseup", DrawOnWorkspace);
        workspc.removeEventListener("mousemove", UpdatePreview);
        workspc.removeEventListener("mousedown", SetIsDragging);
        workspc.removeEventListener("mouseup", DrawOnWorkspace);
    }
}

function ToolSelectionHandler(event) {
    console.log(event);
    CursorPreview(event);
    workspc.addEventListener("mousedown", () => isDragging = true);
    workspc.addEventListener("mouseup", DrawOnWorkspace)

}




console.log(tools);

for (var a = 0; a < tools.length; ++a) {
    tools[a].addEventListener("click", function (event) {
        event.stopPropagation();
        event.target.classList.toggle("active");
    });
}
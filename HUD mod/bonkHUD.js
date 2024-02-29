// ==UserScript==
// @name         bonkHUD
// @version      1.4.48
// @description  Add a customizable key table overlay to the bonk.io game
// @author       BZD + FeiFei
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

window.bonkHUD = {};

bonkHUD.windowHold = [];

bonkHUD.initialize = function () {
    //! menu not fully working
    //Create element in top bar
    let topBarOption = document.createElement("div");
    topBarOption.style.width = "58px";
    topBarOption.style.height = "34px";
    topBarOption.style.backgroundRepeat = "no-repeat";
    topBarOption.style.backgroundPosition = "center";
    topBarOption.style.position = "absolute";
    topBarOption.style.right = "290px";
    topBarOption.style.top = "0";
    topBarOption.style.visibility = "visible";
    topBarOption.style.borderBottom = "2px solid transparent";
    topBarOption.style.fontFamily = "futurept_b1";
    topBarOption.style.color = "#ffffff";
    topBarOption.classList.add("niceborderleft");
    topBarOption.classList.add("pretty_top_button");

    let topBarIcon = document.createElement("span");
    topBarIcon.innerText = "HUD";

    topBarOption.appendChild(topBarIcon);

    //Place it before help button
    document.getElementById('pretty_top_bar').appendChild(topBarOption);

    // Make menu to control opacity + visibility visible
    /*topBarOption.addEventListener('click', (e) => {

    });*/
};

bonkHUD.createWindow = function (name, id, bodyHTML, minHeight) {
    let found = bonkHUD.getWindowIndexByID(id);
    if(found == -1) {
        bonkHUD.windowHold.push({
            id: id,
            width: "154px",
            height: minHeight,
            bottom: "0rem",
            right: "0rem",
            opacity: "1",
            visibility: "visible",
        });
        found = bonkHUD.windowHold.length - 1;
    }

    // Create the main container 'dragItem'
    let dragItem = document.createElement("div");
    dragItem.classList.add("bonkhud-window-container");
    dragItem.classList.add("windowShadow");
    dragItem.id = id + "-drag";
    dragItem.style.position = "fixed";
    dragItem.style.bottom = bonkHUD.windowHold[found].bottom; //top ? top : "0";
    dragItem.style.right = bonkHUD.windowHold[found].right; //left ? left : "0";
    dragItem.style.width = bonkHUD.windowHold[found].width; //width ? width : "172";
    dragItem.style.minWidth = "5rem"; // Minimum width to prevent deformation
    dragItem.style.height = bonkHUD.windowHold[found].height; //height ? height : minHeight;
    dragItem.style.minHeight = minHeight; // Minimum height to prevent deformation
    dragItem.style.backgroundColor = "#cfd8cd";
    dragItem.style.fontFamily = "futurept_b1";
    dragItem.style.overflow = "hidden";
    dragItem.style.visibility = bonkHUD.windowHold[found].visibility;
    dragItem.style.opacity = bonkHUD.windowHold[found].opacity;
    dragItem.style.zIndex = "9990";
    dragItem.style.borderRadius = "8px"; // Rounded corners

    // Create the header
    let header = document.createElement("div");
    header.classList.add("drag-header");
    header.classList.add("newbonklobby_boxtop");
    header.classList.add("newbonklobby_boxtop_classic");

    // Create the title span
    let title = document.createElement("span");
    title.classList.add("drag-header");
    title.textContent = name;
    title.style.flexGrow = "1";
    title.style.textAlign = "center";

    // Create the resize button
    let resizeButton = document.createElement("div");
    resizeButton.classList.add("resize-button");
    resizeButton.innerText = ":::"; // Use an appropriate icon or text
    resizeButton.style.position = "absolute";
    resizeButton.style.top = "3px";
    resizeButton.style.left = "3px";
    resizeButton.style.width = "25px";
    resizeButton.style.height = "25px";
    resizeButton.style.color = "white";
    resizeButton.style.borderRadius = "3px";
    resizeButton.style.lineHeight = "22px"; //! possibly a bad way to do this
    resizeButton.style.textIndent = "5px"; //! but dont want to mess with margins
    resizeButton.style.cursor = "nwse-resize";

    let closeButton = document.createElement("div");
    closeButton.classList.add("close-button");
    closeButton.innerText = "_"; // Use an appropriate icon or text
    closeButton.style.position = "absolute";
    closeButton.style.top = "3px";
    closeButton.style.right = "3px";
    closeButton.style.width = "25px";
    closeButton.style.height = "25px";
    closeButton.style.color = "white";
    closeButton.style.borderRadius = "3px";
    closeButton.style.lineHeight = "9px";
    closeButton.style.cursor = "pointer";

    // Append the title and resize button to the header
    header.appendChild(title);
    header.appendChild(resizeButton);
    header.appendChild(closeButton);

    // Append the header to the dragItem
    dragItem.appendChild(header);

    // Create the key table
    bodyHTML.id = id;
    bodyHTML.style.width = "100%";
    bodyHTML.style.height = "calc(100% - 30px)"; // Adjusted height for header
    bodyHTML.style.color = "#000000";

    // Append the keyTable to the dragItem
    dragItem.appendChild(bodyHTML);

    // Append the opacity control to the dragItem
    //! add opacity control to dropdown
    /*let opacityControl = createOpacityControl();
    dragItem.appendChild(opacityControl);*/

    // Append the dragItem to the body of the page
    document.body.appendChild(dragItem);

    // Add event listeners for dragging
    dragItem.addEventListener('mousedown', (e) => bonkHUD.dragStart(e, dragItem));

    // Add event listeners for resizing
    resizeButton.addEventListener('mousedown', (e) => bonkHUD.startResizing(e, dragItem));

    // Call loadUISettings when the script is loaded
    //document.addEventListener("DOMContentLoaded", loadUISettings);
};

bonkHUD.saveUISettings = function () {
    localStorage.setItem('bonkHUD_Settings', JSON.stringify(bonkHUD.windowHold));
};

bonkHUD.loadUISettings = function () {
    let settings = JSON.parse(localStorage.getItem('bonkHUD_Settings'));
    if (settings) {
        for(let i = 0; i < settings.length; i++) {
            bonkHUD.windowHold.push(settings[i]);
        }
    }
};

bonkHUD.resetUISettings = function () {
    localStorage.removeItem('bonkHUD_Settings');
}

bonkHUD.dragStart = function (e, dragItem) {
    bonkHUD.focusWindow(dragItem);
    // Prevents dragging from starting on the opacity slider
    if (e.target.classList.contains("drag-header") && !e.target.classList.contains("resize-button")) {
        let startX = e.clientX;
        let startY = e.clientY;
        let startRight = parseInt(window.getComputedStyle(dragItem).right, 10);
        let startBottom = parseInt(window.getComputedStyle(dragItem).bottom, 10);
        const boundDragMove = bonkHUD.dragMove.bind(null, startX, startY, startRight, startBottom, dragItem);
        document.addEventListener('mousemove', boundDragMove);
        document.addEventListener('mouseup', () => bonkHUD.dragEnd(boundDragMove, dragItem), {once: true});
    }
};

bonkHUD.dragMove = function (startX, startY, startRight, startBottom, dragItem, e) {
    let w = parseFloat(window.getComputedStyle(dragItem).width) / 2;
    let h = parseFloat(window.getComputedStyle(dragItem).height) / 2;
    let moveX = bonkHUD.clamp(startRight + startX - e.clientX, -w, window.innerWidth - w);
    let moveY = bonkHUD.clamp(startBottom + startY - e.clientY, -h, window.innerHeight - h*2 + 15);
    dragItem.style.right = bonkHUD.pxTorem(moveX) + "rem";
    dragItem.style.bottom = bonkHUD.pxTorem(moveY) + "rem";
};

bonkHUD.dragEnd = function (dragMoveFn, dragItem) {
    document.removeEventListener('mousemove', dragMoveFn);
    let ind = bonkHUD.getWindowIndexByID(dragItem.id.substring(0, dragItem.id.length - 5));
    bonkHUD.windowHold[ind].width = dragItem.style.width;
    bonkHUD.windowHold[ind].height = dragItem.style.height;
    bonkHUD.windowHold[ind].bottom = dragItem.style.bottom;
    bonkHUD.windowHold[ind].right = dragItem.style.right;
    bonkHUD.windowHold[ind].opacity = dragItem.style.opacity;
    bonkHUD.windowHold[ind].visibility = dragItem.style.visibility;
    bonkHUD.saveUISettings();
};

// Function to start resizing the UI
bonkHUD.startResizing = function (e, dragItem) {
    e.stopPropagation(); // Prevent triggering dragStart for dragItem

    let startX = e.clientX;
    let startY = e.clientY;
    let startWidth = parseInt(window.getComputedStyle(dragItem).width, 10);
    let startHeight = parseInt(window.getComputedStyle(dragItem).height, 10);

    function doResize(e) {
        bonkHUD.resizeMove(e, startX, startY, startWidth, startHeight, dragItem);
    }

    function stopResizing() {
        bonkHUD.resizeEnd(doResize, dragItem);
    }

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResizing, { once: true });
};

// Function to handle the resize event
bonkHUD.resizeMove = function (e, startX, startY, startWidth, startHeight, dragItem) {
    let newWidth = startWidth - (e.clientX - startX);
    let newHeight = startHeight - (e.clientY - startY);

    // Enforce minimum dimensions
    newWidth = Math.max(154, newWidth);
    newHeight = Math.max(100, newHeight);

    dragItem.style.width = bonkHUD.pxTorem(newWidth) + 'rem';
    dragItem.style.height = bonkHUD.pxTorem(newHeight) + 'rem';
};

// Function to stop the resize event
bonkHUD.resizeEnd = function (resizeMoveFn, dragItem) {
    document.removeEventListener('mousemove', resizeMoveFn);
    let ind = bonkHUD.getWindowIndexByID(dragItem.id.substring(0, dragItem.id.length - 5));
    bonkHUD.windowHold[ind].width = dragItem.style.width;
    bonkHUD.windowHold[ind].height = dragItem.style.height;
    bonkHUD.windowHold[ind].bottom = dragItem.style.bottom;
    bonkHUD.windowHold[ind].right = dragItem.style.right;
    bonkHUD.windowHold[ind].opacity = dragItem.style.opacity;
    bonkHUD.windowHold[ind].visibility = dragItem.style.visibility;
    bonkHUD.saveUISettings();
};

bonkHUD.focusWindow = function (focusItem) {
    let elements = document.getElementsByClassName("bonkhud-window-container");
    focusItem.style.zIndex = "9999";
    for(let i = 0; i < elements.length; i++) {
        if(focusItem.id != elements[i].id) {
            elements[i].style.zIndex = "9990";
        }
    }
};

bonkHUD.getWindowIndexByID = function (id) {
    for(let i = 0; i < bonkHUD.windowHold.length; i++) {
        if(bonkHUD.windowHold[i].id == id) {
            return i;
        }
    }
    return -1;
};

bonkHUD.clamp = function (val, min, max) {
    //? supposedly faster than Math.max/min
    if (val > min) {
        if (val < max) {
            return val;
        }
        else {
            return max;
        }
    }
    return min;
};

bonkHUD.pxTorem = function (px) {
    return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
};

bonkHUD.initialize();

bonkHUD.loadUISettings();
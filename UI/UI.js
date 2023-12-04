// ==UserScript==
// @name         LBB_DB UI
// @version      1.1.48
// @description  Adds a keytable to bonk.io
// @author       BZD
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-body
// @grant        none
// ==/UserScript==

// This project uses modifications code from [https://greasyfork.org/en/scripts/445890-bonk-keytable]
// which is available under the MIT license.

window.LBB_UI = {};

'use strict';

// Initial position and size of the key table
const left = "0";
const top = "0";
const width = "172px";
const height = "100px";

// Variable to store the latest input
window.latestInput = 0;

// Function to update the style of a key based on the latest input
window.keyStyle = (keyname) => {
    // Define input values for each key
    let inputValues = {
        '←': 1,
        '→': 2,
        '↑': 4,
        '↓': 8,
        'Heavy': 16,
        'Special': 32
    };
    // Update the background color of the key based on whether it's pressed
    if (window.latestInput & inputValues[keyname]) {
        document.getElementById(keyname).style.backgroundColor = '#808080';
    } else {
        document.getElementById(keyname).style.backgroundColor = '#333333';
    }
};

// Function to update the styles of all keys
window.updateKeyStyles = () => {
    var keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(key => {
        window.keyStyle(key);
    });
};

// Function to reset the background color of all keys to gray
window.keyTableReset = () => {
    var keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(key => {
        document.getElementById(key).style.backgroundColor = '#333333';
    });
};

// Function to set the opacity of the entire UI
window.setKeyTableOpacity = (opacity) => {
    const dragContainer = document.getElementById("drag-container");
    if (dragContainer) {
        dragContainer.style.opacity = opacity;
    }
};

// Function to process input and update the latest input variable
window.LBB_UI.receive_Inputs = (args) => {
    var jsonStr = args.match(/\{.*\}/)[0];
    var jsonObj = JSON.parse(jsonStr);
    window.latestInput = jsonObj.i;
    window.updateKeyStyles();
    return args;
};

// Event listener for toggling the slider display
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'S') {
        toggleSliderDisplay();
    }
});

// Function to toggle the slider row display
function toggleSliderDisplay() {
    const sliderRow = document.getElementById("slider-row");
    const keyTable = document.getElementById("bonk_keytable");
    const isVisible = sliderRow.style.display !== 'none';
    sliderRow.style.display = isVisible ? 'none' : 'block';
    keyTable.style.height = isVisible ? "calc(100% - 30px)" : "calc(100% - 50px)"; // Adjust as needed
}

// Function to handle the drag event
function dragStart(e, dragItem) {
    // Prevents dragging from starting on the opacity slider
    if (e.target.id !== "opacity-slider") {
        let startX = e.clientX;
        let startY = e.clientY;
        let startRight = parseInt(window.getComputedStyle(dragItem).right, 10);
        let startBottom = parseInt(window.getComputedStyle(dragItem).bottom, 10);
        const boundDragMove = dragMove.bind(null, startX, startY, startRight, startBottom, dragItem);
        document.addEventListener('mousemove', boundDragMove);
        document.addEventListener('mouseup', () => dragEnd(boundDragMove));
    }
}

// Function to move the draggable element
function dragMove(startX, startY, startRight, startBottom, dragItem, e) {
    let moveX = startX - e.clientX;
    let moveY = startY - e.clientY;
    dragItem.style.right = (startRight + moveX) + "px";
    dragItem.style.bottom = (startBottom + moveY) + "px";
}

// Function to stop the dragging
function dragEnd(dragMoveFn) {
    document.removeEventListener('mousemove', dragMoveFn);
}

// Function to start resizing the UI
function startResizing(e, dragItem) {
    e.stopPropagation(); // Prevent triggering dragStart for dragItem

    let startX = e.clientX;
    let startY = e.clientY;
    let startWidth = parseInt(window.getComputedStyle(dragItem).width, 10);
    let startHeight = parseInt(window.getComputedStyle(dragItem).height, 10);

    function doResize(e) {
        resizeMove(e, startX, startY, startWidth, startHeight, dragItem);
    }

    function stopResizing() {
        resizeEnd(doResize);
    }

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResizing);
}

// Function to handle the resize event
function resizeMove(e, startX, startY, startWidth, startHeight, dragItem) {
    let newWidth = startWidth - (e.clientX - startX);
    let newHeight = startHeight - (e.clientY - startY);

    // Enforce minimum dimensions
    newWidth = Math.max(200, newWidth);
    newHeight = Math.max(100, newHeight);

    dragItem.style.width = newWidth + 'px';
    dragItem.style.height = newHeight + 'px';
}

// Function to stop the resize event
function resizeEnd(resizeMoveFn) {
    document.removeEventListener('mousemove', resizeMoveFn);
    document.removeEventListener('mouseup', resizeEnd);
}

// Function to add the key table to the DOM
const addKeyTable = () => {
    // Create the main container 'dragItem'
    let dragItem = document.createElement("div");
    dragItem.id = "drag-container";
    dragItem.style.position = "fixed";
    dragItem.style.bottom = top;
    dragItem.style.right = left;
    dragItem.style.width = width;
    dragItem.style.minWidth = "200px"; // Minimum width to prevent deformation
    dragItem.style.height = height;
    dragItem.style.minHeight = "100px"; // Minimum height to prevent deformation
    dragItem.style.backgroundColor = "#3c3c3c";
    dragItem.style.overflow = "hidden";
    dragItem.style.zIndex = "9999";
    dragItem.style.borderRadius = "8px"; // Rounded corners

    // Create the header
    let header = document.createElement("div");
    header.style.width = "100%";
    header.style.height = "30px";
    header.style.backgroundColor = "#3c3c3c";
    header.style.color = "white";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.padding = "0 10px";
    header.style.borderTopLeftRadius = "8px";
    header.style.borderTopRightRadius = "8px";

    // Create the title span
    let title = document.createElement("span");
    title.textContent = "KeyTable";
    title.style.flexGrow = "1";
    title.style.textAlign = "center";

    // Create the resize button
    let resizeButton = document.createElement("div");
    resizeButton.id = "resize-button";
    resizeButton.innerText = "⬛"; // Use an appropriate icon or text
    resizeButton.style.position = "absolute";
    resizeButton.style.top = "5px";
    resizeButton.style.left = "5px";
    resizeButton.style.width = "20px";
    resizeButton.style.height = "20px";
    resizeButton.style.backgroundColor = "#3c3c3c";
    resizeButton.style.color = "white";
    resizeButton.style.cursor = "nwse-resize";

    // Append the title and resize button to the header
    header.appendChild(title);
    header.appendChild(resizeButton);

    // Append the header to the dragItem
    dragItem.appendChild(header);

    // Create the key table
    let keyTable = document.createElement("table");
    keyTable.id = "bonk_keytable";
    keyTable.style.width = "100%";
    keyTable.style.height = "calc(100% - 30px)"; // Adjusted height for header
    keyTable.style.color = "#ccc";
    keyTable.innerHTML = `
        <tbody>
            <tr>
                <td id="Special" style="width: 34%; text-align: center;">Special</td>
                <td id="↑" style="width: 34%; text-align: center;">↑</td>
                <td id="Heavy" style="width: 34%; text-align: center;">Heavy</td>
            </tr>
            <tr>
                <td id="←" style="width: 34%; text-align: center;">←</td>
                <td id="↓" style="width: 34%; text-align: center;">↓</td>
                <td id="→" style="width: 34%; text-align: center;">→</td>
            </tr>
        </tbody>`;

    // Append the keyTable to the dragItem
    dragItem.appendChild(keyTable);

    // Create the slider row for opacity control
    let sliderRow = document.createElement("div");
    sliderRow.id = "slider-row";
    sliderRow.style.display = "none"; // Initially hidden
    sliderRow.innerHTML = `
        <input type="range" id="opacity-slider" min="0.1" max="1" step="0.1" value="1"
               style="width: 100%;" oninput="window.setKeyTableOpacity(this.value)">`;

    // Append the sliderRow to the dragItem
    dragItem.appendChild(sliderRow);

    // Append the dragItem to the body of the page
    document.body.appendChild(dragItem);

    // Initialize the key styles
    window.updateKeyStyles();

    // Add event listeners for dragging and resizing
    dragItem.addEventListener('mousedown', (e) => dragStart(e, dragItem));
    resizeButton.addEventListener('mousedown', (e) => startResizing(e, dragItem));
};

// Ensure setup is called when the document is fully loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
    addKeyTable();
} else {
    document.addEventListener("DOMContentLoaded", addKeyTable);
}

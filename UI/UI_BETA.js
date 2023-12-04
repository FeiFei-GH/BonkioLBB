// ==UserScript==
// @name         LBB_DB UI
// @version      1.1.48
// @description  Add a customizable key table overlay to the bonk.io game
// @author       BZD
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-body
// @grant        none
// ==/UserScript==

window.LBB_UI = {}; // Namespace for encapsulating the UI functions and variables

// Use 'strict' mode for safer code by managing silent errors
'use strict';

// Constants defining the initial position and size of the key table overlay
const left = "0";
const top = "0";
const width = "172px";
const height = "100px";

// Function to toggle color pick mode
function toggleColorPickMode() {
    window.colorPickMode = !window.colorPickMode;
    // Change cursor to indicate color pick mode
    let elements = document.querySelectorAll('.ui-component');
    elements.forEach(element => {
        element.style.cursor = window.colorPickMode ? 'crosshair' : '';
    });
}

// Function to apply the selected color to the UI component
function applyColor(component, color) {
    component.style.backgroundColor = color;
    saveUISettings(); // Assuming saveUISettings() will save the necessary details
}

// Function to initiate the color picking process
function pickColor(component) {
    // Create a color input element to use the browser's color picker
    let colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.style.position = 'absolute';
    colorPicker.style.visibility = 'hidden'; // 隐藏颜色选择器，但保留在文档中

    // 当用户选择颜色后处理颜色变化
    colorPicker.addEventListener('change', function() {
        applyColor(component, this.value);
        document.body.removeChild(this); // 移除颜色选择器
        window.colorPickMode = false; // 重置颜色选择模式
    });

    // 将颜色选择器添加到文档中并触发颜色选择器弹出
    document.body.appendChild(colorPicker);
    colorPicker.click();
}

// Function to make elements color-changeable
function makeColorChangeable() {
    document.querySelectorAll('.key, #drag-container, #opacity-slider, #resize-button, #bonk_keytable').forEach(element => {
        element.classList.add('ui-component');
    });
}

// Event listener for color pick mode toggle
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.ctrlKey) {
        toggleColorPickMode();
    }
});

// Event listener for clicks on UI components to start color picking
document.addEventListener('click', (e) => {
    if (window.colorPickMode && e.target.classList.contains('ui-component')) {
        // Prevent any default action to ensure the color picker works correctly
        e.preventDefault();
        pickColor(e.target); // Call the function to pick a color
    }
});

// Function to make elements color-changeable
document.addEventListener("DOMContentLoaded", () => {
    makeColorChangeable();
    // Make sure all elements that are meant to be color-changeable have the 'ui-component' class
    document.querySelectorAll('.key').forEach(el => el.classList.add('ui-component'));
});

// Call makeColorChangeable when the document is loaded to set up color changing
document.addEventListener("DOMContentLoaded", makeColorChangeable);

// Updates the visual representation of keys based on user input
window.keyStyle = (keyname) => {
    // Mapping of key names to their corresponding binary input value
    let inputValues = {
        '←': 1, '→': 2, '↑': 4, '↓': 8, 'Heavy': 16, 'Special': 32
    };
    // Change the key's background color if it's currently pressed
    let keyElement = document.getElementById(keyname);
    keyElement.style.backgroundColor = window.latestInput & inputValues[keyname] ? '#808080' : '#333333';
};

// Refresh the styles for all keys on the UI
window.updateKeyStyles = () => {
    let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(window.keyStyle);
};

// Reset the background color of all keys to the default state
window.keyTableReset = () => {
    let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(key => {
        document.getElementById(key).style.backgroundColor = '#333333';
    });
};

// Adjust the UI's opacity based on user input
window.setKeyTableOpacity = (opacity) => {
    let dragContainer = document.getElementById("drag-container");
    dragContainer.style.opacity = opacity;
    saveUISettings(); // Save the new setting to local storage
};

// Process input data and invoke style updates
window.LBB_UI.receive_Inputs = (args) => {
    // Extract the input data from the argument string
    let jsonObj = JSON.parse(args.match(/\{.*\}/)[0]);
    window.latestInput = jsonObj.i;
    window.updateKeyStyles();
    return args;
};

// Save the current state of the UI settings to local storage
function saveUISettings() {
    let dragContainer = document.getElementById("drag-container");
    let settings = {
        width: dragContainer.style.width,
        height: dragContainer.style.height,
        opacity: dragContainer.style.opacity,
        bottom: dragContainer.style.bottom,
        right: dragContainer.style.right,
        display: dragContainer.style.display
    };
    localStorage.setItem('LBB_UI_Settings', JSON.stringify(settings));
}

// Load the UI settings from local storage and apply them
function loadUISettings() {
    let settings = JSON.parse(localStorage.getItem('LBB_UI_Settings'));
    if (settings) {
        let dragContainer = document.getElementById("drag-container");
        let opacitySlider = document.getElementById("opacity-slider");
        // Apply the saved settings to the UI elements
        Object.assign(dragContainer.style, settings);
        // Set the slider's position to reflect the current opacity
        if (opacitySlider) {
            opacitySlider.value = settings.opacity;
        }
    }
}

// Toggle the visibility of the slider row and adjust the UI dimensions
function toggleSliderDisplay() {
    let dragContainer = document.getElementById("drag-container");
    let sliderRow = document.getElementById("slider-row");
    let keyTable = document.getElementById("bonk_keytable");
    let isVisible = sliderRow.style.display !== 'none';
    // Calculate and adjust the heights when showing or hiding the slider
    keyTable.style.height = `calc(100% - ${isVisible ? '30px' : '100px'})`;
    dragContainer.style.height = `calc(${dragContainer.style.height} ${isVisible ? '-' : '+'} 50px)`;
    sliderRow.style.display = isVisible ? 'none' : 'block'; // Toggle display
    saveUISettings(); // Persist the changes
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
    saveUISettings();
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
    saveUISettings();
}

// Function to toggle the UI's visibility
function toggleUIDisplay() {
    const dragContainer = document.getElementById("drag-container");
    if (dragContainer) {
        dragContainer.style.display = dragContainer.style.display === 'none' ? 'block' : 'none';
        saveUISettings(); // Save the settings whenever the display changes
    }
}

// Factory function to create the slider row for opacity control
function createOpacityControl() {
    // Create container for the opacity controls with initial styles
    let sliderRow = document.createElement("div");
    sliderRow.id = "slider-row";
    sliderRow.style.display = "none"; // Set to hidden until toggled
    sliderRow.style.marginTop = "10px"; // Space above the slider
    sliderRow.style.backgroundColor = "#2d2d2d"; // Dark theme background
    sliderRow.style.borderRadius = "5px"; // Smoothed corners for aesthetics
    sliderRow.style.padding = "10px"; // Inner spacing around the contents
    sliderRow.style.boxSizing = "border-box"; // Ensures padding is included in total width/height
    sliderRow.style.position = "relative"; // Enables absolute positioning of child elements

    // Add a title to the slider row for visual clarity
    let sliderTitle = document.createElement("div");
    sliderTitle.textContent = "UI";
    sliderTitle.style.position = "absolute"; // Positioned relative to sliderRow
    sliderTitle.style.top = "0"; // Align to the top of sliderRow
    sliderTitle.style.left = "10px"; // Horizontal position within sliderRow
    sliderTitle.style.fontSize = "12px"; // Text size for readability
    sliderTitle.style.fontWeight = "bold"; // Make the title text bold
    sliderTitle.style.color = "#fff"; // White text for contrast
    sliderRow.appendChild(sliderTitle); // Insert the title into the slider container

    // Create a label for the opacity slider for accessibility
    let opacityLabel = document.createElement("label");
    opacityLabel.textContent = "Opacity";
    opacityLabel.setAttribute("for", "opacity-slider"); // Associate with the slider
    opacityLabel.style.fontSize = "12px"; // Consistent font size with the title
    opacityLabel.style.fontWeight = "bold"; // Emphasize the label text
    opacityLabel.style.marginRight = "5px"; // Space between label and slider
    opacityLabel.style.display = "inline-block"; // Allows margin-top adjustment
    opacityLabel.style.color = "#fff"; // White color for visibility
    opacityLabel.style.marginTop = "25px"; // Vertical alignment with the slider
    sliderRow.appendChild(opacityLabel); // Add the label to the slider container

    // Create the opacity slider input, configuring its range and appearance
    let opacitySlider = document.createElement("input");
    opacitySlider.type = "range"; // Slider type for range selection
    opacitySlider.id = "opacity-slider"; // Unique identifier for the slider
    opacitySlider.min = "0.1"; // Minimum opacity value
    opacitySlider.max = "1"; // Maximum opacity value (fully opaque)
    opacitySlider.step = "0.1"; // Incremental steps for opacity adjustment
    opacitySlider.value = "1"; // Default value set to fully opaque
    opacitySlider.style.width = "calc(100% - 60px)"; // Width adjusted for the label
    opacitySlider.style.verticalAlign = "middle"; // Center align with the label text
    opacitySlider.oninput = function () {
        window.setKeyTableOpacity(this.value); // Update the UI opacity in real-time
    };
    sliderRow.appendChild(opacitySlider); // Place the slider into the slider container

    return sliderRow; // Return the fully constructed slider row element
}

// Main function to construct and add the key table UI to the DOM
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

    // Append the opacity control to the dragItem
    let opacityControl = createOpacityControl();
    dragItem.appendChild(opacityControl);

    // Append the dragItem to the body of the page
    document.body.appendChild(dragItem);

    // Initialize the key styles
    window.updateKeyStyles();

    // Add event listeners for dragging
    dragItem.addEventListener('mousedown', (e) => dragStart(e, dragItem));

    // Add event listeners for resizing
    resizeButton.addEventListener('mousedown', (e) => startResizing(e, dragItem));

    // Event listener for toggling the slider display
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'O') {
            toggleSliderDisplay();
        }
    });

    // Event listener for toggling the UI display
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'H') {
            toggleUIDisplay();
        }
    });

    // Call loadUISettings when the script is loaded
    document.addEventListener("DOMContentLoaded", loadUISettings);
};

// Initialization logic to set up the UI once the document is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    addKeyTable();
    loadUISettings(); // Immediately load settings if the document is ready
} else {
    document.addEventListener("DOMContentLoaded", () => {
        addKeyTable();
        loadUISettings(); // Load settings after DOM content has loaded
    });
}


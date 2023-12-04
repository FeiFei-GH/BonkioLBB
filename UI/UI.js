// ==UserScript==
// @name         LBB_DB UI
// @version      1.0.48
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

function dragStart(e, dragItem) {
    if (e.target.id !== "opacity-slider") {
        let startX = e.clientX;
        let startY = e.clientY;
        let startRight = parseInt(window.getComputedStyle(dragItem).right, 10);
        let startBottom = parseInt(window.getComputedStyle(dragItem).bottom, 10);

        function dragMove(e) {
            let moveX = startX - e.clientX;
            let moveY = startY - e.clientY;
            dragItem.style.right = (startRight + moveX) + "px";
            dragItem.style.bottom = (startBottom + moveY) + "px";
        }

        function dragEnd() {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }
}

// Function to add the key table to the DOM
const addKeyTable = () => {
    let dragItem = document.createElement("div");
    dragItem.id = "drag-container";
    dragItem.style.position = "fixed";
    dragItem.style.bottom = top;
    dragItem.style.right = left;
    dragItem.style.width = width;
    dragItem.style.height = height;
    dragItem.style.backgroundColor = "#3c3c3c";
    dragItem.style.resize = "both";
    dragItem.style.overflow = "auto";
    dragItem.style.zIndex = "10";

    let keyTable = document.createElement("table");
    keyTable.id = "bonk_keytable";
    keyTable.style.width = "100%";
    keyTable.style.height = "calc(100% - 30px)";  // Leave space for the settings button
    keyTable.style.color = "#ccc";
    keyTable.style.cursor = "all-scroll";
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

    dragItem.appendChild(keyTable);

    let sliderRow = document.createElement("div");
    sliderRow.id = "slider-row";
    sliderRow.style.display = "none";
    sliderRow.innerHTML = `
        <input type="range" id="opacity-slider" min="0" max="1" step="0.1" value="1"
               style="width: 100%;" oninput="window.setKeyTableOpacity(this.value)">`;
    dragItem.appendChild(sliderRow);

    document.body.appendChild(dragItem);

    function toggleSliderDisplay(e) {
        if (e.shiftKey && e.key === 'S') {
            sliderRow.style.display = sliderRow.style.display === 'none' ? 'block' : 'none';
        }
    }

    document.addEventListener('keydown', toggleSliderDisplay);
    dragItem.addEventListener('mousedown', (e) => dragStart(e, dragItem));

    window.updateKeyStyles();
};

// Ensure setup is called when the document is fully loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
    addKeyTable();
} else {
    document.addEventListener("DOMContentLoaded", addKeyTable);
}


// ==UserScript==
// @name         KeyTable
// @version      1.2.48
// @description  Add a customizable key table overlay to the bonk.io game
// @author       BZD
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-body
// @grant        none
// ==/UserScript==

window.KeyTable_UI = {}; // Namespace for encapsulating the UI functions and variables

// Use 'strict' mode for safer code by managing silent errors
'use strict';

// Constants defining the initial position and size of the key table overlay
const left = "0";
const top = "0";
const width = "172px";
const height = "100px";

bonkHUD.readingPlayer = "BZD233";

// Variable to track the most recent key input by the user
window.latestInput = 0;

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

// Process input data and invoke style updates
bonkAPI.addEventListener("gameInputs", (e) => {
    let readingPlayerID = bonkAPI.getPlayerIDByName(bonkHUD.readingPlayer);

    if (e.userID == readingPlayerID) {
        window.latestInput = e.rawInput;
        window.updateKeyStyles();
    }
});

// Save the current state of the UI settings to local storage
function saveUISettings() {
    let keytable_window = document.getElementById("keytable_window");
    let settings = {
        width: keytable_window.style.width,
        height: keytable_window.style.height,
        opacity: keytable_window.style.opacity,
        bottom: keytable_window.style.bottom,
        right: keytable_window.style.right
    };
    localStorage.setItem('KeyTable_UI_Settings', JSON.stringify(settings));
}

// Load the UI settings from local storage and apply them
function loadUISettings() {
    let settings = JSON.parse(localStorage.getItem('KeyTable_UI_Settings'));
    if (settings) {
        let keytable_window = document.getElementById("keytable_window");
        // Apply the saved settings to the UI elements
        Object.assign(keytable_window.style, settings);
        // Set the slider's position to reflect the current opacity
    }
}

// Main function to construct and add the key table UI to the DOM
const addKeyTable = () => {
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

    bonkHUD.createWindow("KeyTable", "keytable_window", keyTableHTML, "100px");

    let keytable_window = document.getElementById("keytable_window");
    keytable_window.style.position = "fixed";
    keytable_window.style.bottom = top;
    keytable_window.style.right = left;
    keytable_window.style.width = width;
    keytable_window.style.minWidth = "200px"; // Minimum width to prevent deformation
    keytable_window.style.height = height;
    keytable_window.style.minHeight = "100px"; // Minimum height to prevent deformation
    keytable_window.style.backgroundColor = "#3c3c3c";
    keytable_window.style.overflow = "hidden";
    keytable_window.style.zIndex = "9999";
    keytable_window.style.borderRadius = "8px"; // Rounded corners

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
    keytable_window.appendChild(header);

    // Initialize the key styles
    window.updateKeyStyles();

    // Call loadUISettings when the script is loaded
    // document.addEventListener("DOMContentLoaded", loadUISettings);
};

// Initialization logic to set up the UI once the document is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    addKeyTable();
    // loadUISettings(); // Immediately load settings if the document is ready
} else {
    document.addEventListener("DOMContentLoaded", () => {
        addKeyTable();
        // loadUISettings(); // Load settings after DOM content has loaded
    });
}


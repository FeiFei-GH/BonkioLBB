// ==UserScript==
// @name         KeyTable_HUD
// @version      1.3.48
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

bonkHUD.readingPlayer = "BZD2333";

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
    console.log("gameInputs event received", e);
    let readingPlayerID = bonkAPI.getPlayerIDByName(bonkHUD.readingPlayer);

    if (e.userID == readingPlayerID) {
        console.log("Updating latestInput for player", readingPlayerID, "with input", e.rawInput);
        window.latestInput = e.rawInput;
        window.updateKeyStyles();
    }
});

// Main function to construct and add the key table UI to the DOM
const addKeyTable = () => {
    // Create the key table
    let keyTable = document.createElement("table");
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

    bonkHUD.createWindow("KeyTable", "keytable_window", keyTable, "100px");
    let keytable_window = document.getElementById("keytable_window");
    keytable_window.style.width = "100%";
    keytable_window.style.height = "calc(100% - 30px)"; // Adjusted height for header
    keytable_window.style.color = "#ccc";

    let keytable_window_drag = document.getElementById("keytable_window-drag");
    keytable_window_drag.style.position = "fixed";
    keytable_window_drag.style.bottom = top;
    keytable_window_drag.style.right = left;
    keytable_window_drag.style.width = width;
    keytable_window_drag.style.minWidth = "200px"; // Minimum width to prevent deformation
    keytable_window_drag.style.height = height;
    keytable_window_drag.style.minHeight = "100px"; // Minimum height to prevent deformation
    keytable_window_drag.style.backgroundColor = "#3c3c3c";
    keytable_window_drag.style.overflow = "hidden";
    keytable_window_drag.style.zIndex = "9999";
    keytable_window_drag.style.borderRadius = "8px"; // Rounded corners

    bonkHUD.loadUISetting("keytable_window");
    // Initialize the key styles
    window.updateKeyStyles();
};

// Initialization logic to set up the UI once the document is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    addKeyTable();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        addKeyTable();
    });
}


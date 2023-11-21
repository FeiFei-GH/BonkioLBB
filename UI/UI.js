// ==UserScript==
// @name         LBB_DB UI
// @version      1.0
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

// Function to set up the key table
const setup = () => {
    let keyTable = document.createElement("table");
    document.body.appendChild(keyTable);
    keyTable.outerHTML = `<table id="bonk_keytable" style="background-color:#3c3c3c; bottom:${top}; right: ${left}; width: ${width}; height: ${height}; position: fixed; font-family: 'futurept_b1'; z-index: 10; cursor: all-scroll;">
                <tbody>
                    <tr>
                        <td id="Special" style="width: 34%;text-align: center;color: #ccc;">Special</td>
                        <td id="↑" style="width: 34%;text-align: center;color: #ccc;">↑</td>
                        <td id="Heavy" style="width: 34%;text-align: center;color: #ccc;">Heavy</td>
                    </tr>
                    <tr>
                        <td id="←" style="width: 34%;text-align: center;color: #ccc;">←</td>
                        <td id="↓" style="width: 34%;text-align: center;color: #ccc;">↓</td>
                        <td id="→" style="width: 34%;text-align: center;color: #ccc;">→</td>
                    </tr>
                </tbody>
            </table>`;

    // Make the key table draggable
    const el = document.getElementById("bonk_keytable");
    let x1 = left, y1 = top, x2, y2;
    el.onmousedown = dragMouseDown;

    // Function to handle the mouse down event for dragging
    function dragMouseDown(e) {
        e = e || window.event;

        x2 = e.clientX;
        y2 = e.clientY;

        // Update the position of the key table as the mouse moves
        document.onmousemove = function (e) {
            e = e || window.event;

            x1 = x2 - e.clientX;
            y1 = y2 - e.clientY;
            x2 = e.clientX;
            y2 = e.clientY;
            el.style.top = (el.offsetTop - y1) + "px";
            el.style.left = (el.offsetLeft - x1) + "px";
        };

        // Clear the movement events when the mouse button is released
        document.onmouseup = function () {
            document.onmouseup = null;
            document.onmousemove = null;
        };
    }

    // Initialize the key styles
    window.updateKeyStyles();
}

// Ensure setup is called when the document is fully loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
    setup();
} else {
    document.addEventListener("DOMContentLoaded", setup);
}

// Function to process input and update the latest input variable
LBB_UI.receive_Inputs = (args) =>  {
    // Extract the JSON part from the input string
    var jsonStr = args.match(/\{.*\}/)[0];
    // Parse the JSON string to an object
    var jsonObj = JSON.parse(jsonStr);
    //console.log("jsonObj: " + jsonObj);
    // Get the value of 'i' from the JSON object
    var iValue = jsonObj.i;
    //console.log("jsonStr: " + jsonStr);
    //console.log("jsonStr: " + jsonStr);
    //console.log("iValue: " + iValue);

    // Update the latest input and refresh the key styles
    window.latestInput = iValue;
    window.updateKeyStyles();

    return args;
};


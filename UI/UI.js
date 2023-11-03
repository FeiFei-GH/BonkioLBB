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

(function () {
    'use strict';

    const left = "0";
    const top = "0";
    const width = "172px";
    const height = "100px";

    window.latestInput = 0;

    window.keyStyle = (keyname) => {
        let inputValues = {
            '←': 1,
            '→': 2,
            '↑': 4,
            '↓': 8,
            'Heavy': 16,
            'Special': 32
        };
        if (window.latestInput & inputValues[keyname]) {
            document.getElementById(keyname).style.backgroundColor = '#808080';
        } else {
            document.getElementById(keyname).style.backgroundColor = '#333333';
        }
    };
    // sets colors for keys when pressed/released

    window.keyTableReset = () => {
        var keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
        for (let i = 0; i < keys.length; i++) {
            document.getElementById(keys[i]).style.backgroundColor = '#333333';
        }
    };
    // (Re)sets all keys to gray

    function setup() {
        let keyTable = document.createElement("table");
        document.body.appendChild(keyTable);  // Changed to 'body' to ensure the element exists
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

        const el = document.getElementById("bonk_keytable");
        let x1 = left, y1 = top, x2, y2;
        el.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;

            x2 = e.clientX;
            y2 = e.clientY;

            document.onmousemove = function (e) {
                e = e || window.event;

                x1 = x2 - e.clientX;
                y1 = y2 - e.clientY;
                x2 = e.clientX;
                y2 = e.clientY;
                el.style.top = (el.offsetTop - y1) + "px";
                el.style.left = (el.offsetLeft - x1) + "px";
            };
            document.onmouseup = function () {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            };
        }

        window.keyTableReset();
    }

    // Ensure the setup function is called when the document is fully loaded
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setup();
    } else {
        document.addEventListener("DOMContentLoaded", setup);
    }

    // Hook into game's input system to update key table display
    window.scope.send_SendInputs = function (args) {
        window.latestInput = args[1].i;
        return args;
    };
})();

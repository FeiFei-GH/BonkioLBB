// ==UserScript==
// @name         bonkKeyTable
// @version      1.3.48
// @description  Add a customizable key table overlay to the bonk.io game
// @author       BZD + FeiFei
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

//! made more variables local, dk why
window.keyTable = {};
keyTable.readingPlayer = "";

// Variable to track the most recent key input by the user
let latestInput = 0;

// Updates the visual representation of keys based on user input
let keyStyle = (keyname) => {
    // Mapping of key names to their corresponding binary input value
    let inputValues = {
        '←': 1, '→': 2, '↑': 4, '↓': 8, 'Heavy': 16, 'Special': 32
    };
    // Change the key's background color if it's currently pressed
    let keyElement = document.getElementById(keyname);
    //! keytable will change style alot so instead of using class from bonkHUD that
    //! slowly updates styles(doesnt need to be down all the time)
    //! Currently using hardcoded numbers but will switch to an object with keys
    //! with the name of the classnames
    keyElement.style.backgroundColor = latestInput & inputValues[keyname] ? bonkHUD.styleHold[6] : bonkHUD.styleHold[5];
};

// Refresh the styles for all keys on the UI
let updateKeyStyles = () => {
    let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(keyStyle);
};

// Reset the background color of all keys to the default state
let keyTableReset = () => {
    let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(key => {
        document.getElementById(key).style.backgroundColor = bonkHUD.styleHold[5];
    });
};

// !Use bonkAPI as listener
bonkAPI.addEventListener("gameInputs", (e) => {
    if(keyTable.readingPlayer == "") {
        return;
    }
    let readingPlayerID = bonkAPI.getPlayerIDByName(keyTable.readingPlayer);

    if (e.userID == readingPlayerID) {
        latestInput = e.rawInput;
        updateKeyStyles();
    }
});

// Main function to construct and add the key table UI to the DOM
let addKeyTable = () => {
    let keyTable = document.createElement("table");
    keyTable.innerHTML = `
        <tbody>
            <tr>
                <td id="Special" class="bonkhud-button-color bonkhud-text-color" style="width: 34%; text-align: center;">Special</td>
                <td id="↑" class="bonkhud-button-color bonkhud-text-color" style="width: 34%; text-align: center;">↑</td>
                <td id="Heavy" class="bonkhud-button-color bonkhud-text-color" style="width: 34%; text-align: center;">Heavy</td>
            </tr>
            <tr>
                <td id="←" class="bonkhud-button-color bonkhud-text-color" style="width: 34%; text-align: center;">←</td>
                <td id="↓" class="bonkhud-button-color bonkhud-text-color" style="width: 34%; text-align: center;">↓</td>
                <td id="→" class="bonkhud-button-color bonkhud-text-color" style="width: 34%; text-align: center;">→</td>
            </tr>
        </tbody>`;
                                                               // ↓ kind of ignored
    bonkHUD.createWindow("Keytable", "bonk-keytable", keyTable, "100");
    //! Might get rid of some of the automatic styling so this doesnt need to be here later
    let finalTable = document.getElementById("bonk-keytable");
    finalTable.style.padding = "0";
    finalTable.style.width = "100%";

    // Initialize the key styles
    updateKeyStyles();
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    addKeyTable();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        addKeyTable();
    });
}
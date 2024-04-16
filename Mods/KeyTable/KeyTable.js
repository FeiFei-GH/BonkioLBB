// ==UserScript==
// @name         KeyTable
// @version      1.3.48
// @description  Add a customizable key table overlay to the bonk.io game
// @author       BZD
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

window.KeyTable = {}; // Namespace for encapsulating the UI functions and variables

// Use 'strict' mode for safer code by managing silent errors
'use strict';

// Constants defining the initial position and size of the key table overlay
const left = "0";
const top = "0";
const width = "172px";
const height = "100px";

// Variable to track the most recent key input by the user
KeyTable.latestInput = 0;
KeyTable.currentPlayerID = 0;

// Updates the visual representation of keys based on user input
KeyTable.keyStyle = (keyname) => {
    // Mapping of key names to their corresponding binary input value
    let inputValues = {
        '←': 1, '→': 2, '↑': 4, '↓': 8, 'Heavy': 16, 'Special': 32
    };
    // Change the key's background color if it's currently pressed
    let keyElement = document.getElementById(keyname);
    keyElement.style.backgroundColor = KeyTable.latestInput & inputValues[keyname] ? bonkHUD.styleHold.buttonColorHover.color : bonkHUD.styleHold.buttonColor.color;
};

// Refresh the styles for all keys on the UI
KeyTable.updateKeyStyles = () => {
    let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(KeyTable.keyStyle);
};

// Reset the background color of all keys to the default state
KeyTable.keyTableReset = () => {
    let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];
    keys.forEach(key => {
        document.getElementById(key).style.backgroundColor = bonkHUD.styleHold.buttonColor.color;
    });
};

// Event listener function to change the player selected in the player selector
KeyTable.select_player = () => {
    let player_selector = document.getElementById("player_selector");
    let player_id = player_selector.options[player_selector.selectedIndex].value;
    KeyTable.currentPlayerID = player_id;
    KeyTable.updateKeyStyles();
    //console.log("current Player ID: " + player_id);
};

// Create a new option in the player selector
KeyTable.create_option = (userID) => {
    //console.log("userID:" + userID);
    let playerName = bonkAPI.getPlayerNameByID(userID);
    let player_selector = document.getElementById("player_selector");
    let newOption = document.createElement("option");
    newOption.innerText = playerName;
    newOption.value = userID;
    newOption.id = "selector_option_" + userID;
    player_selector.appendChild(newOption);
    KeyTable.updateKeyStyles();
    //console.log("selector_option_" + userID + " added to player_selector");
};

// Remove an option from the player selector
KeyTable.remove_option = (userID) => {
    let player_selector = document.getElementById("player_selector");
    let option = document.getElementById("selector_option_" + userID);
    player_selector.removeChild(option);
};

// Reset the player selector to the default state
KeyTable.reset_selector = () => {
    // Remove all options except the default one
    let player_selector = document.getElementById("player_selector");
    Array.from(player_selector.options).forEach((option) => {
        if (option.id !== "selector_option_user") {
            player_selector.removeChild(option);
        }
        // Reset the current player ID
        KeyTable.currentPlayerID = bonkAPI.getMyID();
        // Set the selector to the first option as default
        player_selector.selectedIndex = bonkAPI.getMyID();
    });
};

// Update the player list in the player selector
KeyTable.update_players = () => {
    // Get the list of players and the current player ID
    let playerList = bonkAPI.getPlayerList();
    let myID = bonkAPI.getMyID();
    // Reset the player selector
    KeyTable.reset_selector();
    // Add all player to the player selector
    playerList.forEach((player, id) => {
        if (player && id !== myID) {
            KeyTable.create_option(id);
        }
    });
};

// Process input data and invoke style updates
bonkAPI.addEventListener("gameInputs", (e) => {
    // console.log("gameInputs event received", e);
    if (e.userID == KeyTable.currentPlayerID) {
        // console.log("Updating latestInput for player", readingPlayerID, "with input", e.rawInput);
        KeyTable.latestInput = e.rawInput;
        KeyTable.updateKeyStyles();
    }
});

// Event listener for when a user joins the game
bonkAPI.addEventListener("userJoin", (e) => {
    //console.log("User join event received", e);
    //console.log("User ID", e.userID);
    // Add the player to the player selector
    KeyTable.create_option(e.userID);
});

// Event listener for when a user leaves the game
bonkAPI.addEventListener("userLeave", (e) => {
    //console.log("User Leave event received", e);
    //console.log("User ID", e.userID);
    // Remove the player from the player selector
    let playerName = bonkAPI.getPlayerNameByID(e.userID);
    let player_selector = document.getElementById("player_selector");
    // If the player is the current player, set the current player to 0 and reset the selector
    if (player_selector.options[player_selector.selectedIndex].value === playerName) {
        KeyTable.currentPlayerID = bonkAPI.getMyID();
        // Set the selector to the first option as default
        player_selector.selectedIndex = 0;
    }

    KeyTable.remove_option(e.userID);
});

// Event listener for when user(mod user) creates a room
bonkAPI.addEventListener("createRoom", (e) => {
    //console.log("create Room event received", e);
    //console.log("User ID", e);
    // Set the player name in the player selector to the current user
    let option = document.getElementById("selector_option_user");
    let playerName = bonkAPI.getPlayerNameByID(e.userID);
    option.innerText = playerName;
    option.value = e.userID;
    KeyTable.currentPlayerID = e.userID;
    // Reset the player selector to the default state
    KeyTable.reset_selector();
});

// Event listener for when user(mod user) joins a room
bonkAPI.addEventListener("onJoin", (e) => {
    //console.log("on Join event received", e);
    //console.log("User ID", e.userID);
    // Set the player name in the player selector to the current user
    let option = document.getElementById("selector_option_user");
    let playerName = bonkAPI.getPlayerNameByID(bonkAPI.getMyID());
    option.innerText = playerName;
    option.value = bonkAPI.getMyID();
    KeyTable.currentPlayerID = bonkAPI.getMyID();
    // Update the player list in the player selector
    KeyTable.update_players();
});

// Main function to construct and add the key table UI to the DOM
const addKeyTable = () => {
    // Create the key table
    let keyTable = document.createElement("div");

    keyTable.innerHTML = `
        <table style="flex: 1 1 auto;">
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
            </tbody>
        </table>
        <div style="flex: 0 1 auto;padding: 10px;">
            <select id="player_selector">
                <option id="selector_option_user">......</option>
            </select>
        </div>`;

    bonkHUD.createWindow("KeyTable", "keytable_window", keyTable, "100px");
    let keytable_window = document.getElementById("keytable_window");
    keytable_window.style.width = "100%";
    keytable_window.style.height = "calc(100% - 32px)";
    keytable_window.style.padding = "0";
    keytable_window.style.display = "flex";
    keytable_window.style.flexFlow = "column";

    bonkHUD.loadUISetting("keytable_window");

    // Initialize the key styles
    KeyTable.updateKeyStyles();
};

// Initialization logic to set up the UI once the document is ready
const init = () => {
    addKeyTable();
    let playerSelector = document.getElementById("player_selector");
    if (playerSelector) {
        playerSelector.addEventListener("change", KeyTable.select_player);
    } else {
        console.error("player_selector element not found!");
    }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

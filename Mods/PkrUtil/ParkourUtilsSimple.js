// ==UserScript==
// @name         ParkourUtilsTemp
// @namespace    http://tampermonkey.net/
// @version      1.0.48
// @description  Parkour Utilities
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

window.pkrUtils = {}; // Namespace for encapsulating the UI functions and variables

// Use 'strict' mode for safer code by managing silent errors
'use strict';

// Constants defining the initial position and size of the key table overlay
const left = "0";
const top = "0";
const width = "172px";
const height = "100px";

pkrUtils.currentPlayerID = 0;

pkrUtils.updateData = () => {

}

// Event listener function to change the player selected in the player selector
pkrUtils.select_player = () => {
    let player_selector = document.getElementById("pkrutils_player_selector");
    let player_id = player_selector.options[player_selector.selectedIndex].value;
    pkrUtils.currentPlayerID = player_id;
    //console.log("current Player ID: " + player_id);
};

// Create a new option in the player selector
pkrUtils.create_option = (userID) => {
    //console.log("userID:" + userID);
    let playerName = bonkAPI.getPlayerNameByID(userID);
    let player_selector = document.getElementById("pkrutils_player_selector");
    let newOption = document.createElement("option");
    newOption.innerText = playerName;
    newOption.value = userID;
    newOption.id = "selector_option_" + userID;
    player_selector.appendChild(newOption);
    //console.log("selector_option_" + userID + " added to player_selector");
};

// Remove an option from the player selector
pkrUtils.remove_option = (userID) => {
    let player_selector = document.getElementById("pkrutils_player_selector");
    let option = document.getElementById("selector_option_" + userID);
    player_selector.removeChild(option);
};

// Reset the player selector to the default state
pkrUtils.reset_selector = () => {
    // Remove all options except the default one
    let player_selector = document.getElementById("pkrutils_player_selector");
    Array.from(player_selector.options).forEach((option) => {
        if (option.id !== "pkrutils_selector_option_user") {
            player_selector.removeChild(option);
        }
        // Reset the current player ID
        pkrUtils.currentPlayerID = bonkAPI.getMyID();
        // Set the selector to the first option as default
        player_selector.selectedIndex = bonkAPI.getMyID();
    });
};

// Update the player list in the player selector
pkrUtils.update_players = () => {
    // Get the list of players and the current player ID
    let playerList = bonkAPI.getPlayerList();
    let myID = bonkAPI.getMyID();
    // Reset the player selector
    pkrUtils.reset_selector();
    // Add all player to the player selector
    playerList.forEach((player, id) => {
        if (player && id !== myID) {
            pkrUtils.create_option(id);
        }
    });
};

bonkAPI.addEventListener("stepEvent", (e) => {
    let inputState = e.inputState;
    let myData = inputState.discs[pkrUtils.currentPlayerID];
    
    let specialCD = myData.a1a;
    let xPos = myData.x;
    let yPos = myData.y;
    let xVel = myData.xv;
    let yVel = myData.yv;
    //console.log(myData);
});

// Event listener for when a user joins the game
bonkAPI.addEventListener("userJoin", (e) => {
    //console.log("User join event received", e);
    //console.log("User ID", e.userID);
    // Add the player to the player selector
    pkrUtils.create_option(e.userID);
});

// Event listener for when a user leaves the game
bonkAPI.addEventListener("userLeave", (e) => {
    //console.log("User Leave event received", e);
    //console.log("User ID", e.userID);
    // Remove the player from the player selector
    let playerName = bonkAPI.getPlayerNameByID(e.userID);
    let player_selector = document.getElementById("pkrutils_player_selector");
    // If the player is the current player, set the current player to 0 and reset the selector
    if (player_selector.options[player_selector.selectedIndex].value === playerName) {
        pkrUtils.currentPlayerID = bonkAPI.getMyID();
        // Set the selector to the first option as default
        player_selector.selectedIndex = 0;
    }

    pkrUtils.remove_option(e.userID);
});

// Event listener for when user(mod user) creates a room
bonkAPI.addEventListener("createRoom", (e) => {
    //console.log("create Room event received", e);
    //console.log("User ID", e);
    // Set the player name in the player selector to the current user
    let option = document.getElementById("pkrutils_selector_option_user");
    let playerName = bonkAPI.getPlayerNameByID(e.userID);
    option.innerText = playerName;
    option.value = e.userID;
    pkrUtils.currentPlayerID = e.userID;
    // Reset the player selector to the default state
    pkrUtils.reset_selector();
});

// Event listener for when user(mod user) joins a room
bonkAPI.addEventListener("joinRoom", (e) => {
    //console.log("on Join event received", e);
    //console.log("User ID", e.userID);
    // Set the player name in the player selector to the current user
    let option = document.getElementById("pkrutils_selector_option_user");
    let playerName = bonkAPI.getPlayerNameByID(bonkAPI.getMyID());
    option.innerText = playerName;
    option.value = bonkAPI.getMyID();
    pkrUtils.currentPlayerID = bonkAPI.getMyID();
    // Update the player list in the player selector
    pkrUtils.update_players();
});

// Main function to construct and add the key table UI to the DOM
const addKeyTable = () => {
    // Create the key table
    let keyTable = document.createElement("div");

    keyTable.innerHTML = `
        <div>
        <div style="flex: 0 1 auto;padding: 10px;">
            <select id="pkrutils_player_selector">
                <option id="pkrutils_selector_option_user">......</option>
            </select>
        </div>`;

    bonkHUD.createWindow("pkrUtils", "pkr_utils_window", keyTable, "100px");
    /*let keytable_window = document.getElementById("keytable_window");
    keytable_window.style.width = "100%";
    keytable_window.style.height = "calc(100% - 32px)";
    keytable_window.style.padding = "0";
    keytable_window.style.display = "flex";
    keytable_window.style.flexFlow = "column";*/

    bonkHUD.loadUISetting("pkr_utils_window");
};

// Initialization logic to set up the UI once the document is ready
const init = () => {
    addKeyTable();
    let playerSelector = document.getElementById("pkrutils_player_selector");
    if (playerSelector) {
        playerSelector.addEventListener("change", pkrUtils.select_player);
    } else {
        console.error("pkrutils_player_selector element not found!");
    }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

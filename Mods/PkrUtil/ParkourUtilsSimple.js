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

pkrUtils.positionElement = 0;
pkrUtils.velocityElement = 0;
pkrUtils.specialElement = 0;
pkrUtils.vtolAngle = 0;
pkrUtils.vtolAnglev = 0;
pkrUtils.arrowCharge = 0;
pkrUtils.arrowAngle = 0;

pkrUtils.scale = 1;

pkrUtils.hasPrecision = false;

pkrUtils.currentMode = -1;

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

bonkAPI.addEventListener("modeChange", (e) => {
    currentMode = e.mode;
    let arrowdivs = document.getElementsByClassName("pkrutils-arrows-div");
    let vtoldivs = document.getElementsByClassName("pkrutils-vtol-div");
    if(currentMode == "ar" || currentMode == "ard") {
        for(let i = 0; i < arrowdivs.length; i++) {
            arrowdivs[i].style.display = "block";
        }
        for(let i = 0; i < vtoldivs.length; i++) {
            vtoldivs[i].style.display = "none";
        }
    }
    else if(currentMode == "v") {
        for(let i = 0; i < arrowdivs.length; i++) {
            arrowdivs[i].style.display = "none";
        }
        for(let i = 0; i < vtoldivs.length; i++) {
            vtoldivs[i].style.display = "block";
        }
    }
    else {
        for(let i = 0; i < arrowdivs.length; i++) {
            arrowdivs[i].style.display = "none";
        }
        for(let i = 0; i < vtoldivs.length; i++) {
            vtoldivs[i].style.display = "none";
        }
    }
});

bonkAPI.addEventListener("stepEvent", (e) => {
    if(bonkAPI.isInGame()) {
        let inputState = e.inputState;
        try {
            let myData = inputState.discs[pkrUtils.currentPlayerID];

            let specialCD = myData.a1a;
            let xPos = myData.x * pkrUtils.scale - 365;
            let yPos = myData.y * pkrUtils.scale - 250;
            let xVel = myData.xv * pkrUtils.scale;
            let yVel = myData.yv * pkrUtils.scale;
            if(!pkrUtils.hasPrecision) {
                xPos = xPos.toFixed(2);
                yPos = yPos.toFixed(2);
                xVel = xVel.toFixed(2);
                yVel = yVel.toFixed(2);
            }
            //console.log(myData);
            pkrUtils.positionElement.textContent = "(" + xPos + ", " + yPos + ")";
            pkrUtils.velocityElement.textContent = "(" + xVel + ", " + yVel + ")";
            pkrUtils.specialElement.textContent = specialCD / 10;
            pkrUtils.vtolAngle.textContent = myData.a;
            pkrUtils.vtolAnglev.textContent = myData.av;
            pkrUtils.arrowCharge.textContent = myData.ds;
            pkrUtils.arrowAngle.textContent = myData.da;
        } catch (err) {}
    }
});

bonkAPI.addEventListener('gameStart', (e) => {
    try {
        pkrUtils.scale = e.mapData.physics.ppm;
    } catch(er) {console.log(er)}
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
const addPkrDiv = () => {
    // Create the key table
    let pkrDiv = document.createElement("div");

    pkrDiv.innerHTML = `
        <div class="bonkhud-settings-row">
            <div>
                <span class="bonkhud-settings-label">Position: </span>
                <span id="pkrutils_position"></span>
            </div>
            <div>
                <span class="bonkhud-settings-label">Velocity: </span>
                <span id="pkrutils_velocity"></span>
            </div>
            <div>
                <span class="bonkhud-settings-label">Special: </span>
                <span id="pkrutils_special"></span>
            </div>
            <div class="pkrutils-vtol-div" style="display:none">
                <span class="bonkhud-settings-label">Angle: </span>
                <span id="pkrutils_a"></span>
            </div>
            <div class="pkrutils-vtol-div" style="display:none">
                <span class="bonkhud-settings-label">Angle 2: </span>
                <span id="pkrutils_av"></span>
            </div>
            <div class="pkrutils-arrows-div" style="display:none">
                <span class="bonkhud-settings-label">Charge: </span>
                <span id="pkrutils_ds"></span>
            </div>
            <div class="pkrutils-arrows-div" style="display:none">
                <span class="bonkhud-settings-label">Angle: </span>
                <span id="pkrutils_da"></span>
            </div>
        </div>
        <div style="flex: 0 1 auto;padding: 10px;">
            <select id="pkrutils_player_selector">
                <option id="pkrutils_selector_option_user">......</option>
            </select>
            <div>
                <span class="bonkhud-settings-label" style="margin-right:5px;vertical-align:middle;">Precision</span>
                <input type="checkbox" id="pkrutils_precision_toggle">
            </div>
        </div>`;

    bonkHUD.createWindow("pkrUtils", "pkr_utils_window", pkrDiv, "100px");
    /*let keytable_window = document.getElementById("keytable_window");
    keytable_window.style.width = "100%";
    keytable_window.style.height = "calc(100% - 32px)";
    keytable_window.style.padding = "0";
    keytable_window.style.display = "flex";
    keytable_window.style.flexFlow = "column";*/

    let precisionCheck = document.getElementById("pkrutils_precision_toggle");
    precisionCheck.checked = false;
    precisionCheck.oninput = function () {
        pkrUtils.hasPrecision = precisionCheck.checked;
    };

    pkrUtils.positionElement = document.getElementById("pkrutils_position");
    pkrUtils.velocityElement = document.getElementById("pkrutils_velocity");
    pkrUtils.specialElement = document.getElementById("pkrutils_special");
    pkrUtils.vtolAngle = document.getElementById("pkrutils_a");
    pkrUtils.vtolAnglev = document.getElementById("pkrutils_av");
    pkrUtils.arrowCharge = document.getElementById("pkrutils_ds");
    pkrUtils.arrowAngle = document.getElementById("pkrutils_da");

    bonkHUD.loadUISetting("pkr_utils_window");
};

// Initialization logic to set up the UI once the document is ready
const init = () => {
    addPkrDiv();
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

// ==UserScript==
// @name         LBB_LDB
// @namespace    http://tampermonkey.net/
// @version      2.0.48
// @description  LDB
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ! Matching Bonk Version 48

// *Everything should be inside this object to prevent conflict with other prgrams.
window.LBB_LDB = {};

// *Initialize Vars
LBB_LDB.playerData = {};
LBB_LDB.mapData = {};


// !Save and load for local Database
LBB_LDB.savePlayerData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playerData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "playerData.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

LBB_LDB.loadPlayerData = () => {
    // Create a file input element
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json'; // Optional: Ensure only JSON files can be selected

    // Listen for changes on the file input (i.e., when a user selects a file)
    fileInput.addEventListener('change', function(e) {
        let file = e.target.files[0]; // Get the selected file

        if (file) {
            // Create a FileReader to read the file
            let reader = new FileReader();

            // Set up what happens once reading completes
            reader.onload = function(e) {
                try {
                    // Parse the JSON content and update playerData
                    playerData = JSON.parse(e.target.result);
                    console.log('Player data loaded successfully.', playerData);
                } catch (error) {
                    console.error('Error parsing JSON.', error);
                }
            };

            // Read the file as text
            reader.readAsText(file);
        }
    });

    // Trigger the file input click event programmatically to open the file dialog
    fileInput.click();
}




// !Helper functions

LBB_Main.addPlayerToMapRecords = function (mapName, playerName, time) {
    let playerTimeType = 0;
    
    // if (isNameGuest(playerName)) {
    //     chat("Not allow to add Guest's data");
    //     return -1;
    // }
    
    // If the map doesn't exist in the map data, create it with an empty player map
    if (!LBB_Main.mapRecordsData.has(mapName)) {
        LBB_Main.mapRecordsData.set(mapName, new Map());
    }
    const playerMap = LBB_Main.mapRecordsData.get(mapName);
    
    // If the player doesn't exist in the player map, create it with the new data
    if (!playerMap.has(playerName)) {
        if (time == -1) {
            playerMap.set(playerName, { bestTime: time, numberOfFinishes: 0 });
        } else {
            playerMap.set(playerName, { bestTime: time, numberOfFinishes: 1 });
            playerTimeType = 1;
        }
    } else { // player got record before
        const playerData = playerMap.get(playerName);

        // If the time is better than the current best time, update the player's data
        if (time < playerData.bestTime) {
            playerData.bestTime = time;
            playerTimeType = 1;
        }

        // Increment the number of finishes for the player
        playerData.numberOfFinishes++;
    }
    
    return playerTimeType;
};
// ==UserScript==
// @name         Black List
// @namespace    http://tampermonkey.net/
// @version      1.0.48
// @description  Auto bans player from Black List
// @author       FeiFei
// @license      MIT
// @match        https://*.bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==
// ! Compitable with Bonk Version 48

// *Everything should be inside this object to prevent conflict with other prgrams.
window.BL = {};

// #region //!------------------Initialize Variables-----------------
BL.blackList = {};
// #endregion

// #region //!------------------Download and Upload BlackList-----------------
BL.downloadBlackList = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(BL.blackList));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "BlackList.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

BL.uploadBlackList = () => {
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
                    BL.blackList = JSON.parse(e.target.result);
                    console.log('BlackList loaded successfully.', BL.blackList);
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

// #endregion

// #region //!------------------Helper Functions-----------------
BL.addNameToBlackList = (name, reason) => {
    // Check if the name is already in the blacklist
    if (!BL.blackList.hasOwnProperty(name)) {
        // If not, add it to the blacklist with the reason
        BL.blackList[name] = { reason: reason }; // Store the reason in an object
        console.log(`${name} has been added to the blacklist for reason: ${reason}`);
        BL.saveBlackListToLocal();
    } else {
        // If already in the blacklist, update the reason
        BL.blackList[name].reason = reason; // Update the reason
        console.log(`${name} is already in the blacklist. Reason updated to: ${reason}`);
        BL.saveBlackListToLocal();
    }
}

BL.removeNameFromBlackList = (name) => {
    // Check if the name is in the blacklist
    if (BL.blackList.hasOwnProperty(name)) {
        // If so, remove it from the blacklist
        delete BL.blackList[name];
        console.log(`${name} has been removed from the blacklist.`);
        BL.saveBlackListToLocal();
    } else {
        console.log(`${name} is not in the blacklist.`);
    }
}
// #endregion

// #region //!------------------Using bonkAPI as listener-----------------
bonkAPI.addEventListener("userJoin", (e) => {
    let playerName = e.userData.userName;
    
    if (BL.blackList.hasOwnProperty(playerName)) {
        console.log("banning: " + playerName);
        let blackListerID = bonkAPI.getPlayerIDByName(playerName);
        bonkAPI.banPlayerByID(blackListerID);
    }
});
// #endregion

// #region //!------------------Load and Save from Localstorage-----------------
// Save BlackList to localStorage
BL.saveBlackListToLocal = () => {
    localStorage.setItem('BlackList', JSON.stringify(BL.blackList));
};

// Load BlackList from localStorage
BL.loadBlackListFromLocal = () => {
    const data = localStorage.getItem('BlackList');
    if (data) {
        try {
            BL.blackList = JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse BlackList from localStorage", e);
        }
    }
};

BL.initializeSetup = () => {
    if (window.bonkAPI) {
        BL.loadBlackListFromLocal();
    } else {
        alert("Black List requires BonkAPI, please install BonkAPI and retry, thank you.");
    }
}

// Set up the BlackList once the document is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    BL.initializeSetup();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        BL.initializeSetup();
    });
}
// #endregion

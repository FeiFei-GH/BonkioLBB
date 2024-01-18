// ==UserScript==
// @name         LBB_Main
// @namespace    http://tampermonkey.net/
// @version      2.0.48
// @description  Main
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ! Compitable with Bonk Version 48

// *Everything should be inside this object to prevent conflict with other prgrams.
window.LBB_Main = {};

// *Initialize Vars
LBB_Main.msgs = {
    welcomeMsg: "Welcome username!",
    welcomeMsg2: "Welcome username! You will be joining shortly",
    finishMsg: "username finished with: time",
    pbMsg: "Nice! username just got new PB: time",
    wrMsg: "Congratulations! username just got new WR: time",
    goMsg: "Go!",
};


// *Helper functions
LBB_Main.frameToMS = (frame) => {
    const frameRate = 30; // TPS
    const milliseconds = (frame / frameRate) * 1000;
    return Math.round(milliseconds); // Round to nearest integer
}

LBB_Main.msToTimeStr = (ms) => {
    var minutes = Math.floor(ms / 60000);
    var seconds = Math.floor((ms % 60000) / 1000);
    var milliSeconds = ms % 1000;
    
    // Add leading zero to minute component if it is less than 10
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    
    if (milliSeconds < 10) {
        milliSeconds = "00" + milliSeconds;
    } else if (milliSeconds < 100) {
        milliSeconds = "0" + milliSeconds;
    }
    
    return "" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + milliSeconds;
}


// *Main Functions
LBB_Main.sendFinishedMsg = (playerName, timeStr) => {
    bonkAPI.chat(LBB_Main.msgs.finishMsg.replaceAll("username", playerName).replaceAll("time", timeStr));
}


// *Use bonkAPI as listener
bonkAPI.addEventListener("userJoin", function(e) {
    let playerName = bonkAPI.getPlayerNameByID(e.userID);
    
    if (true) {
        bonkAPI.chat(LBB_Main.msgs.welcomeMsg.replaceAll("username", playerName));
    }
});

bonkAPI.addEventListener("gameStart", function(e) {
    if (true) {
        bonkAPI.chat(LBB_Main.msgs.goMsg);
    }
});


// *Use LBBAPI as listener
LBB_Main.capZoneEvent = (playerID, finalFrame) => {
    let playerName = bonkAPI.getPlayerNameByID(playerID);
    let timeStr = LBB_main.msToTimeStr(LBB_main.frameToMS(finalFrame));
    
    LBB_Main.sendFinishedMsg(playerName, timeStr);
};
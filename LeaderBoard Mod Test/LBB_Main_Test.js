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

// ! Matching Bonk Version 48

// Everything should be inside this object
// to prevent conflict with other prgrams.
window.LBB_Main = {};

LBB_Main.frameIncEvent = (curFrame, gameState) => {
    //console.log("Current Frame: " + curFrame);
    //console.log("Append game state: ");
    //console.log(gameState);
};

LBB_Main.stepEvent = (gameState) => {
    console.log("Current Frame: " + gameState.rl);
    console.log("Game State: ");
    console.log(gameState);
};

LBB_Main.capZoneEvent = (id, frame) => {
    //console.log("player: " + id);
    //console.log("Frame: " + time);
};

LBB_Main.playerFinishEvent = (playerID, finalFrame) => {
    console.log("playerID: " + playerID);
    console.log("finalFrame: " + finalFrame);
};
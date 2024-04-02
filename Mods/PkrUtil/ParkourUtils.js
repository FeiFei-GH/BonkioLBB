// ==UserScript==
// @name         ParkourUtils
// @namespace    http://tampermonkey.net/
// @version      1.0.48
// @description  Parkour Utilities
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ! Compitable with Bonk Version 48

// *Everything should be inside this object to prevent conflict with other prgrams.
window.pkrUtils = {};

// #region //!------------------Use bonkAPI as listener-----------------
bonkAPI.addEventListener("stepEvent", (e) => {
    let inputState = e.inputState;
    let myData = inputState.discs[bonkAPI.getMyID()];
    
    let specialCD = myData.a1a;
    let xPos = myData.x;
    let yPos = myData.y;
    let xVel = myData.xv;
    let yVel = myData.yv;
    
    console.log(`specialCD: ${specialCD}, xPos: ${xPos}, yPos: ${yPos}, xVel: ${xVel}, yVel: ${yVel}`);
});

// #endregion
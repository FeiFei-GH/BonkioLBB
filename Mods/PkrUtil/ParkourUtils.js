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

// #region //!------------------Injector------------------
// *Injecting code into src
pkrUtils.injector = function (src) {
    let newSrc = src;

    //! Inject capZoneEvent fire
    let orgCode = `K$h[9]=K$h[0][0][K$h[2][138]]()[K$h[2][115]];`;
    let newCode = `
        K$h[9]=K$h[0][0][K$h[2][138]]()[K$h[2][115]];
        
        try {
            // Initialize
            let inputState = z0M[0][0];
            let currentFrame = inputState.rl;
            let playerID = K$h[0][0].m_userData.arrayID;
            let capID = K$h[1];
            
            
        } catch(err) {
            console.error("ERROR: capZoneEvent");
            console.error(err);
        }`;

    newSrc = newSrc.replace(orgCode, newCode);
    
    //! Inject
    orgCode = `doCapZone(c5K,E4_,j1P,X5a) {`;
    newCode = `
        doCapZone(c5K,E4_,j1P,X5a) {
        
        try {
            console.log(c5K);
            console.log(E4_);
            console.log(j1P);
            console.log(X5a);
            
        } catch(err) {
            console.error("ERROR: capZoneEvent");
            console.error(err);
        }`;

    newSrc = newSrc.replace(orgCode, newCode);
    
    //! Inject stepEvent fire
    orgCode = `return z0M[720];`;
    newCode = `
        try {
            let inputStateClone = JSON.parse(JSON.stringify(z0M[0][0]));
            let currentFrame = inputStateClone.rl;
            let gameStateClone = JSON.parse(JSON.stringify(z0M[720]));
            
            z0M[720].capZones[0].p = 0;
            
            console.log(z0M[720]);
        } catch(err) {
            console.error("ERROR: stepEvent");
            console.error(err);
        }
        
        return z0M[720];`;

    newSrc = newSrc.replace(orgCode, newCode);

    return newSrc;
};

// Compatibility with Excigma's code injector userscript
if (!window.bonkCodeInjectors) window.bonkCodeInjectors = [];
window.bonkCodeInjectors.push((bonkCode) => {
    try {
        return pkrUtils.injector(bonkCode);
    } catch (error) {
        alert(`Injecting failed`);
        throw error;
    }
});
// #endregion

// #region //!------------------Use bonkAPI as listener-----------------
bonkAPI.addEventListener("stepEvent", (e) => {
    let inputState = e.inputState;
    let myData = inputState.discs[bonkAPI.getMyID()];

    let specialCD = myData.a1a;
    let xPos = myData.x;
    let yPos = myData.y;
    let xVel = myData.xv;
    let yVel = myData.yv;

    //console.log(`specialCD: ${specialCD}, xPos: ${xPos}, yPos: ${yPos}, xVel: ${xVel}, yVel: ${yVel}`);
});

// #endregion

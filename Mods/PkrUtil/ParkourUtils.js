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

pkrUtils.data = 0;

// #region //!------------------Use bonkAPI as listener-----------------

let init = function () {
    let circleCtx = 0;
    let scale = 1;
    let mapScale = 1;
    let screenWidth = 1000;

    let resizeCtx = function () {
        //console.log(circleCtx);
        circleCtx.clear();
        circleCtx.beginFill(0xff0000);
        //console.log(scale);
        circleCtx.drawCircle(0, 0, scale, scale);
        circleCtx.endFill();
    }

    bonkAPI.addEventListener("graphicsReady", (e) => {
        circleCtx = new window.PIXI.Graphics();
        circleCtx.beginFill(0xff0000);
        circleCtx.drawCircle(0, 0, 16, 16);
        circleCtx.endFill();
        bonkAPI.pixiCtx.addChild(circleCtx);
        console.log(circleCtx);
    });

    bonkAPI.addEventListener('gameStart', (e) => {
        try {
            mapScale = 730 / e.mapData.physics.ppm;
            resizeCtx();
        } catch(er) {console.log(er)}
    });

    bonkAPI.addEventListener("stepEvent", (e) => {
        if(bonkAPI.isInGame()) {
            let inputState = e.inputState;
            pkrUtils.data = inputState.discs[bonkAPI.getMyID()];
            try {
                let xPos = pkrUtils.data.x;
                let yPos = pkrUtils.data.y;
                //console.log(e.width + ": " + xPos);
                circleCtx.x = xPos * scale;
                circleCtx.y = yPos * scale;
                circleCtx.visible = true;
                //e.g.drawCircle(xPos * 12, yPos * 12, 5, 5);
            } catch(er) {
                //console.log(er);
                circleCtx.visible = false;
            }
        }
    });

    bonkAPI.addEventListener("graphicsUpdate", (e) => {
        if(screenWidth != e.width) {
            screenWidth = e.width;
            scale = screenWidth / mapScale;
            resizeCtx();
        }
    });
    console.log("PkrUtils Loaded");
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
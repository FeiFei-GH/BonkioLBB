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
    let graphicsRef = new Map();
    let uiCtx = 0;
    let scale = 1;
    let mapScale = 1;
    let screenWidth = 1000;
    let goResize = false;

    let inGameList = [];

    let resizeCtx = function () {
        graphicsRef.forEach((val, key, map) => {
            val.resize();
        });
    }

    bonkAPI.addEventListener("playerChange", (e) => {
        inGameList = bonkAPI.getPlayersInLobbyID();
        if(!e.hasLeft) {
            let c = new window.PIXI.Container();
            c.y = -scale;
            let specialHold = new window.PIXI.Graphics();
            specialHold.lineStyle(1, 0xebebeb);
            specialHold.drawRect(0, 0, 0.5 * scale, 2 * scale);
            specialHold.endFill();
            let sContainer = new window.PIXI.Container();
            sContainer.y = -2 * scale;
            let special = new window.PIXI.Graphics();
            special.beginFill(0xd4feff);
            special.drawRect(0, 0, 0.5 * scale, 2 * scale);
            special.endFill();
            sContainer.addChild(special);
            c.addChild(sContainer);
            c.addChild(specialHold);
            uiCtx.addChild(c);
            console.log(special);
            console.log(specialHold);

            let resizeFunc = function () {
                console.log("UNO");
                specialHold.clear();
                specialHold.lineStyle(1, 0xebebeb);
                specialHold.drawRect(0, -2 * scale, 0.5 * scale, 2 * scale);
                specialHold.endFill();

                sContainer.y = -2 * scale;

                special.clear();
                special.beginFill(0xd4feff);
                special.drawRect(0, 0, 0.5 * scale, 2 * scale);
                special.endFill();
                console.log(special);
            }

            let refHold = {
                container: c,
                specialBar: sContainer,
                resize: resizeFunc,
            }
            graphicsRef.set(e.userID, refHold);
        }
        else {
            graphicsRef.get(e.userID).container.destroy();
            graphicsRef.delete(e.userID);
        }
    });

    bonkAPI.addEventListener("graphicsReady", (e) => {
        uiCtx = new window.PIXI.Container();
        resizeCtx();
        bonkAPI.pixiCtx.addChild(uiCtx);
        console.log(uiCtx);
    });

    bonkAPI.addEventListener('gameStart', (e) => {
        try {
            mapScale = 730 / e.mapData.physics.ppm;
            goResize = true;
        } catch(er) {console.log(er)}
    });

    bonkAPI.addEventListener("stepEvent", (e) => {
        if(bonkAPI.isInGame()) {
            let inputState = e.inputState;

            for(let i = 0; i < inGameList.length; i++) {
                let info = graphicsRef.get(inGameList[i]);

                try {
                    let xPos = inputState.discs[inGameList[i]].x;
                    let yPos = inputState.discs[inGameList[i]].y;
                    //console.log(e.width + ": " + xPos);
                    info.specialBar.scale.y = inputState.discs[inGameList[i]].a1a / 1000;
                    info.container.x = xPos * scale;
                    info.container.y = yPos * scale - scale;
                    info.container.visible = true;
                    //e.g.drawCircle(xPos * 12, yPos * 12, 5, 5);
                } catch(er) {
                    //console.log(er);
                    if(info) {
                        info.container.visible = false;
                    }
                }
            }
        }
    });

    bonkAPI.addEventListener("graphicsUpdate", (e) => {
        //console.log("g");
        if(screenWidth != e.width || goResize) {
            screenWidth = e.width;
            scale = screenWidth / mapScale;
            resizeCtx();
            goResize = false;
        }
    });
    console.log("PkrUtils Loaded");
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
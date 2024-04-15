// ==UserScript==
// @name         BonkAPI_UnitTest
// @namespace    http://tampermonkey.net/
// @version      1.0.49
// @description  BonkAPI_UnitTest
// @author       FeiFei
// @license      MIT
// @match        https://*.bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==
// ! Compitable with Bonk Version 49

// *Everything should be inside this object to prevent conflict with other prgrams.
window.BonkAPI_UnitTest = {};

// #region //!------------------Event Unit Testers-----------------
BonkAPI_UnitTest.pingUpdateUT = (e) => {
    if (e.keys(object).length != 2) {
        throw "updatePingUT: event object has more than 2 keys";
    }
    
    if (typeof e.pingList != object) {
        throw "updatePingUT: pingList is not an object";
    }
    
    if (typeof e.echoTo != number) {
        throw "updatePingUT: echoTo is not a number";
    }
};


// #endregion

// #region //!------------------All BonkAPI Events-----------------
bonkAPI.addEventListener("pingUpdate", (e) => {
    BonkAPI_UnitTest.pingUpdateUT(e);
});

bonkAPI.addEventListener("roomJoin", (e) => {
    BonkAPI_UnitTest.roomJoinUT(e);
});

bonkAPI.addEventListener("playerJoin", (e) => {
    BonkAPI_UnitTest.playerJoinUT(e);
});

bonkAPI.addEventListener("playerLeave", (e) => {
    BonkAPI_UnitTest.playerLeaveUT(e);
});

bonkAPI.addEventListener("hostChange", (e) => {
    BonkAPI_UnitTest.hostChangeUT(e);
});

bonkAPI.addEventListener("playerInputs", (e) => {
    BonkAPI_UnitTest.playerInputsUT(e);
});

bonkAPI.addEventListener("readyChange", (e) => {
    BonkAPI_UnitTest.readyChangeUT(e);
});

bonkAPI.addEventListener("gameEnd", (e) => {
    BonkAPI_UnitTest.gameEndUT(e);
});

bonkAPI.addEventListener("gameStart", (e) => {
    BonkAPI_UnitTest.gameStartUT(e);
});

bonkAPI.addEventListener("gameError", (e) => {
    BonkAPI_UnitTest.gameErrorUT(e);
});

bonkAPI.addEventListener("teamChange", (e) => {
    BonkAPI_UnitTest.teamChangeUT(e);
});

bonkAPI.addEventListener("teamLockChange", (e) => {
    BonkAPI_UnitTest.teamLockChangeUT(e);
});

bonkAPI.addEventListener("chatMessage", (e) => {
    BonkAPI_UnitTest.chatMessageUT(e);
});

bonkAPI.addEventListener("initialData", (e) => {
    BonkAPI_UnitTest.initialDataUT(e);
});

bonkAPI.addEventListener("playerKick", (e) => {
    BonkAPI_UnitTest.playerKickUT(e);
});

bonkAPI.addEventListener("modeChange", (e) => {
    BonkAPI_UnitTest.modeChangeUT(e);
});

bonkAPI.addEventListener("roundsChange", (e) => {
    BonkAPI_UnitTest.roundsChangeUT(e);
});

bonkAPI.addEventListener("mapSwitch", (e) => {
    BonkAPI_UnitTest.mapSwitchUT(e);
});

bonkAPI.addEventListener("inactive", (e) => {
    BonkAPI_UnitTest.inactiveUT(e);
});

bonkAPI.addEventListener("mapSuggest", (e) => {
    BonkAPI_UnitTest.mapSuggestUT(e);
});

bonkAPI.addEventListener("playerBalanceChange", (e) => {
    BonkAPI_UnitTest.playerBalanceChangeUT(e);
});

bonkAPI.addEventListener("replaySave", (e) => {
    BonkAPI_UnitTest.replaySaveUT(e);
});

bonkAPI.addEventListener("hostChange", (e) => {
    BonkAPI_UnitTest.hostChangeUT(e);
});

bonkAPI.addEventListener("friendRequest", (e) => {
    BonkAPI_UnitTest.friendRequestUT(e);
});

// #endregion
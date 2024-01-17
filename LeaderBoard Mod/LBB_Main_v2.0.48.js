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

// My custom vars
LBB_Main.unfinishedPlayerIDs = new Set();

LBB_Main.mapPPM = -1;
LBB_Main.mapCapZones = [];
LBB_Main.mapRecordsData = new Map();

LBB_Main.joinText = "Welcome username! You will be joining shortly";
LBB_Main.joinText2 = "Welcome username! You will be joining shortly, game auto restarts after timer minutes";
LBB_Main.winText = "username finishes with: "
LBB_Main.pbText = "Nice! username just got new PB: "
LBB_Main.wrText = "Congratulations! username just got new WR: "
LBB_Main.startText = "Timer Starts!"; // Timer Starts! // GO!
LBB_Main.currentMode = "";
LBB_Main.gameStartTimeStamp = -1;
LBB_Main.firstFinishTimeStamp = -1;
LBB_Main.instaDelay = 6;
LBB_Main.isInstaStart = false;
LBB_Main.firstFinish = true;
LBB_Main.matchEnds = true;

// those are likely to change during running
LBB_Main.timeBetweenRounds = 7000;
LBB_Main.autoRestartTimer = 6000000; // in ms
LBB_Main.matchEndsAfterFinish = 9000;





// &----------------------Receive Handler Functions----------------------
LBB_Main.receive_RoomJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.playerList = {};
    LBB_Main.myID = jsonargs[1];
    LBB_Main.hostID = jsonargs[2];
    
    for(var i = 0; i < jsonargs[3].length; i++){
        if(jsonargs[3][i] != null){
            LBB_Main.playerList[i.toString()] = jsonargs[3][i];
        }
    }
    
    return args;
}

LBB_Main.receive_PlayerJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.playerList[jsonargs[1]] = {
        peerId: jsonargs[2],
        userName: jsonargs[3],
        guest: jsonargs[4],
        level: jsonargs[5],
        team: jsonargs[6],
        ready: false,
        tabbed: false,
        avatar: jsonargs[7],
    };

    if (LBB_Main.joinText != "" || LBB_Main.joinText2 != "") {
        if (LBB_Main.autoRestartTimer < 180000) {
            LBB_Main.chat(LBB_Main.joinText2.replaceAll("username", jsonargs[3]).replaceAll("timer", (LBB_Main.autoRestartTimer / 60000)));
        } else {
            LBB_Main.chat(LBB_Main.joinText.replaceAll("username", jsonargs[3]));
        }
    }
    return args;
}

LBB_Main.receive_PlayerLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    if (typeof LBB_Main.playerList[jsonargs[1]] != "undefined") {
        delete LBB_Main.playerList[jsonargs[1]];
        LBB_Main.unfinishedPlayerIDs.delete(jsonargs[1].toString());
    }
    
    return args;
}

LBB_Main.receive_HostLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    if (typeof LBB_Main.playerList[jsonargs[1]] != "undefined") {
        delete LBB_Main.playerList[jsonargs[1]];
        LBB_Main.unfinishedPlayerIDs.delete(jsonargs[1].toString());
    }
    LBB_Main.hostID = jsonargs[2];
    
    return args;
}

LBB_Main.receive_Inputs = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //console.log("Receive: " + args);
    
    
    return args;
}

//! Detects when match starts!!!
LBB_Main.receive_GameStart = function (args) {
    LBB_Main.gameStartTimeStamp = Date.now();
    LBB_Main.firstFinishTimeStamp = -1;
    LBB_Main.firstFinish = true;
    LBB_Main.matchEnds = false;
    
    // Check who is playing
    LBB_Main.unfinishedPlayerIDs = new Set(Object.keys(LBB_Main.playerList));
    for (const id of LBB_Main.unfinishedPlayerIDs) {
        if(LBB_Main.playerList[id].team == 0){
            LBB_Main.unfinishedPlayerIDs.delete(id);
        }
    }
    
    if (LBB_Main.startText != "") {
        LBB_Main.chat(LBB_Main.startText);
    }

    return args;
}



LBB_Main.receive_ChatMessage = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    let chatUserID = jsonargs[1];
    let chatMessage = jsonargs[2];
    
    if (chatMessage.substring(0, 1) == "!") {
        LBB_Main.commandHandle(chatMessage, LBB_Main.isIDAdmin(chatUserID));
    }
    
    return args;
}



LBB_Main.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    
    //console.log("Map Changed");
    //console.log(jsonargs[1]);
    //decodedCurrentMap = decodeFromDatabase(jsonargs[1]);
    //currentPPM = decodedCurrentMap.physics.ppm
    //setCurrentCapZones();
    
    return args;
}


LBB_Main.receive_FriendReq = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LBB_Main.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
    //LBB_Main.chat("Friended :3");
    
    return args;
}

// &Send Handler Functions
LBB_Main.send_TriggerStart = function (args) {
    var jsonargs = JSON.parse(args.substring(2));
    
    if (LBB_Main.isInstaStart) {
        LBB_Main.isInstaStart = false;
        // jsonargs[1]["gs"]["wl"] = -1; //keep this here for now
                    
        if(LBB_Main.instaDelay != 0){
            var jsonargs2 = decodeIS(jsonargs[1]["is"]);
            jsonargs2["ftu"] = instaDelay * 30;
                        
            jsonargs2 = encodeIS(jsonargs2);
            jsonargs[1]["is"] = jsonargs2;
        }
    }

    args = "42" + JSON.stringify(jsonargs);
    return args;
}

LBB_Main.send_CreatRoom = function (args) {
    LBB_Main.playerList = {};
    var jsonargs2 = JSON.parse(args.substring(2));
    var jsonargs = jsonargs2[1];

    LBB_Main.playerList[0] = {
        peerId: jsonargs["peerID"],
        userName: document.getElementById("pretty_top_name").textContent,
        level:
            document.getElementById("pretty_top_level").textContent == "Guest"
                ? 0
                : parseInt(document.getElementById("pretty_top_level").textContent.substring(3)),
        guest: typeof jsonargs.token == "undefined",
        team: 1,
        ready: false,
        tabbed: false,
        avatar: jsonargs["avatar"],
    };
    
    LBB_Main.myID = 0;
    LBB_Main.hostID = 0;
    
    return args;
}

LBB_Main.send_SendInputs = function (args) {
    //console.log("SEND: " + args);
    //LBB_Main.playerList[myID].lastMoveTime = Date.now();
    return args;
}

LBB_Main.send_MapAdd = function (args) {
    //console.log("Map Changed");
    var jsonargs = JSON.parse(args.substring(2));
    //decodedCurrentMap = decodeFromDatabase(jsonargs[1]["m"]);
    //currentPPM = decodedCurrentMap.physics.ppm
    //setCurrentCapZones();
    
    return args;
}
// #endregion






LBB_Main.msToStr = function(ms) {
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

LBB_Main.getCurrentMapName = function() {
    return document.getElementById("newbonklobby_maptext").innerHTML;
}





LBB_Main.playerFinished = function (id, timeGot) {
    let finishMessage = "";
    
    let playerTimeType = LBB_Main.addPlayerToMapRecords(LBB_Main.getCurrentMapName(), LBB_Main.playerList[id].userName, timeGot);
    
    if (playerTimeType == 0) {
        finishMessage += LBB_Main.winText.replaceAll("username", LBB_Main.playerList[id].userName) + LBB_Main.msToStr(timeGot);
    } else if (playerTimeType == 1) {
        finishMessage += LBB_Main.pbText.replaceAll("username", LBB_Main.playerList[id].userName) + LBB_Main.msToStr(timeGot);
    } else if (playerTimeType == 2) {
        finishMessage += LBB_Main.wrText.replaceAll("username", LBB_Main.playerList[id].userName) + LBB_Main.msToStr(timeGot);
    }
    
    if (LBB_Main.firstFinish) {
        LBB_Main.firstFinishTimeStamp = Date.now();
        LBB_Main.firstFinish = false;
        finishMessage += " [match ends in 10 sec]";
    }
    
    if (playerTimeType != -1) {
        LBB_Main.chat(finishMessage);
    }
    
    LBB_Main.unfinishedPlayerIDs.delete(id);
}

LBB_Main.stepEvent = function (physicsFrame) {
    console.log("physicsFrame: ");
    console.log(physicsFrame);
};

LBB_Main.capZoneEvent = function (id) {
    id = id.toString();
    
    if (LBB_Main.unfinishedPlayerIDs.has(id)) {
        let timeGot = Date.now() - LBB_Main.gameStartTimeStamp;
        LBB_Main.playerFinished(id, timeGot);
    }
};
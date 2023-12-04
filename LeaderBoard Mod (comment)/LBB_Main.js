// ==UserScript==
// @name         LBB_Main
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Main
// @author       FeiFei + LEGEND
// @license MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

window.LBB_Main = {};

LBB_Main.bonkWSS = 0;
window.originalSend = window.WebSocket.prototype.send; // store original WebSocket send method for later override
LBB_Main.originalDrawCircle = window.PIXI.Graphics.prototype.drawCircle; // Store the original method of drawing a circle
LBB_Main.scale = -1;
LBB_Main.requestAnimationFrameOriginal = window.requestAnimationFrame;

// My custom vars
LBB_Main.playerList = {};
LBB_Main.unfinishedPlayerIDs = new Set(); // IDs of players who haven't finished
LBB_Main.myID = -1; // My ID
LBB_Main.myID = -1;
LBB_Main.hostID = -1;
LBB_Main.decodedMap = {};
LBB_Main.mapPPM = -1;
LBB_Main.mapCapZones = [];
LBB_Main.mapRecordsData = new Map();

// Initialize default values for in-game message texts
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



// !Overriding bonkWSS
// #region Overriding bonkWSS
// Override the send method of WebSocket
window.WebSocket.prototype.send = function(args) {
    // Check if the WebSocket URL contains the specific bonk.io address
    if (this.url.includes(".bonk.io/socket.io/?EIO=3&transport=websocket&sid=")) {
        LBB_Main.bonkWSS = this;

        if (!this.injected) { // initialize overriding receive listener (only run once)
            this.injected = true;
            var originalReceive = this.onmessage;

            // This function intercepts incoming packets
            // Override the onmessage handler function
            this.onmessage = function (args) {
                // Handle different types of messages based on the beginning of the received data
                // &Receiving incoming packets
                if (args.data.startsWith('42[1,')) { // *Update Pings
                    
                } else if (args.data.startsWith('42[3,')) { // *Room join
                    args = LBB_Main.receive_RoomJoin(args);
                } else if (args.data.startsWith('42[4,')) { // *Player join
                    args = LBB_Main.receive_PlayerJoin(args);
                } else if (args.data.startsWith('42[5,')) { // *Player leave
                    args = LBB_Main.receive_PlayerLeave(args);
                } else if (args.data.startsWith('42[6,')) { // *Host leave
                    args = LBB_Main.receive_HostLeave(args);
                } else if (args.data.startsWith('42[7,')) { // *Inputs
                    args = LBB_Main.receive_Inputs(args);
                } else if (args.data.startsWith('42[8,')) { // *Ready Change
                    
                } else if (args.data.startsWith('42[13,')) { // *Game End
                    
                } else if (args.data.startsWith('42[15,')) { // *Game Start
                    args = LBB_Main.receive_GameStart(args);
                } else if (args.data.startsWith('42[16,')) { // *Error
                    
                } else if (args.data.startsWith('42[18,')) { // *Team Change
                    args = LBB_Main.receive_TeamChange(args);
                } else if (args.data.startsWith('42[19,')) { // *Teamlock toggle
                    
                } else if (args.data.startsWith('42[20,')) { // *Chat Message
                    args = LBB_Main.receive_ChatMessage(args);
                } else if (args.data.startsWith('42[21,')) { // *Initial data
                    
                } else if (args.data.startsWith('42[24,')) { // *Kicked
                    
                } else if (args.data.startsWith('42[26,')) { // *Mode change
                    args = LBB_Main.receive_ModeChange(args);
                } else if (args.data.startsWith('42[27,')) { // *Change WL (Rounds)
                    
                } else if (args.data.startsWith('42[29,')) { // *Map switch
                    args = LBB_Main.receive_MapSwitch(args);
                } else if (args.data.startsWith('42[32,')) { // *inactive?
                    
                } else if (args.data.startsWith('42[33,')) { // *Map Suggest
                    
                } else if (args.data.startsWith('42[34,')) { // *Map Suggest Client
                    
                } else if (args.data.startsWith('42[36,')) { // *Player Balance Change
                    
                } else if (args.data.startsWith('42[40,')) { // *Save Replay
                    
                } else if (args.data.startsWith('42[41,')) { // *New Host
                    args = LBB_Main.receive_NewHost(args);
                } else if (args.data.startsWith('42[42,')) { // *Friend Req
                    args = LBB_Main.receive_FriendReq(args);
                } else if (args.data.startsWith('42[43,')) { // *Game starting Countdown
                    
                } else if (args.data.startsWith('42[44,')) { // *Abort Countdown
                    
                } else if (args.data.startsWith('42[45,')) { // *Player Leveled Up
                    
                } else if (args.data.startsWith('42[46,')) { // *Local Gained XP
                    
                } else if (args.data.startsWith('42[49,')) { // *Created Room Share Link
                    
                } else if (args.data.startsWith('42[52,')) { // *Tabbed
                    
                } else if (args.data.startsWith('42[58,')) { // *Room Name Update
                    
                } else if (args.data.startsWith('42[59,')) { // *Room Password Update
                    
                }
                
                return originalReceive.call(this, args);
            };

            var originalClose = this.onclose;
            this.onclose = function () {
                LBB_Main.bonkWSS = 0;
                return originalClose.call(this);
            };
        } else { //// Handle sent data, process different types of messages based on the beginning of the send data
            // &Sending outgoing packets
            if (args.startsWith('42[4,')) { // *Send Inputs
                args = LBB_Main.send_SendInputs(args);
            } else if (args.startsWith('42[5,')) { // *Trigger Start
                args = LBB_Main.send_TriggerStart(args);
            } else if (args.startsWith('42[6,')) { // *Change Own Team
                
            } else if (args.startsWith('42[7,')) { // *Team Lock
                
            } else if (args.startsWith('42[9,')) { // *Kick/Ban Player
                
            } else if (args.startsWith('42[10,')) { // *Chat Message
                
            } else if (args.startsWith('42[11,')) { // *Inform In Lobby
                
            } else if (args.startsWith('42[12,')) { // *Create Room
                args = LBB_Main.send_CreatRoom(args);
            } else if (args.startsWith('42[14,')) { // *Return To Lobby
                
            } else if (args.startsWith('42[16,')) { // *Set Ready
                
            } else if (args.startsWith('42[17,')) { // *All Ready Reset
                
            } else if (args.startsWith('42[19,')) { // *Send Map Reorder
                
            } else if (args.startsWith('42[20,')) { // *Send Mode
                
            } else if (args.startsWith('42[21,')) { // *Send WL (Rounds)
                
            } else if (args.startsWith('42[22,')) { // *Send Map Delete
                
            } else if (args.startsWith('42[23,')) { // *Send Map Add
                args = LBB_Main.send_MapAdd(args);
            } else if (args.startsWith('42[26,')) { // *Change Other Team
                
            } else if (args.startsWith('42[27,')) { // *Send Map Suggest
                
            } else if (args.startsWith('42[29,')) { // *Send Balance
                
            } else if (args.startsWith('42[32,')) { // *Send Team Settings Change
                
            } else if (args.startsWith('42[33,')) { // *Send Arm Record
                
            } else if (args.startsWith('42[34,')) { // *Send Host Change
                
            } else if (args.startsWith('42[35,')) { // *Send Friended
                
            } else if (args.startsWith('42[36,')) { // *Send Start Countdown
                
            } else if (args.startsWith('42[37,')) { // *Send Abort Countdown
                
            } else if (args.startsWith('42[38,')) { // *Send Req XP
                
            } else if (args.startsWith('42[39,')) { // *Send Map Vote
                
            } else if (args.startsWith('42[40,')) { // *Inform In Game
                
            } else if (args.startsWith('42[41,')) { // *Get Pre Vote
                console.log(`Map ID: ${args}`);
            } else if (args.startsWith('42[44,')) { // *Tabbed
                
            } else if (args.startsWith('42[50,')) { // *Send No Host Swap
                
            }
        }
    }

    return originalSend.call(this, args);
};

// Send a packet to server
LBB_Main.sendPacket = function (packet) {
    if (LBB_Main.bonkWSS != 0) {
        LBB_Main.bonkWSS.send(packet);
    }
};

// Make client receive a packet
LBB_Main.receivePacket = function (packet) {
    if (LBB_Main.bonkWSS != 0) {
        LBB_Main.bonkWSS.onmessage({ data: packet });
    }
};

// &----------------------Receive Handler Functions----------------------
// Handling when joining a room
LBB_Main.receive_RoomJoin = function (args) {
    //parse the received data
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.playerList = {}; // reset player list
    LBB_Main.myID = jsonargs[1];
    LBB_Main.hostID = jsonargs[2];
    // Populate player list
    for(var i = 0; i < jsonargs[3].length; i++){
        if(jsonargs[3][i] != null){
            LBB_Main.playerList[i.toString()] = jsonargs[3][i];
        }
    }
    
    return args;
}
// Handling when a player joins
LBB_Main.receive_PlayerJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.playerList[jsonargs[1]] = { // create player object
        peerId: jsonargs[2],
        userName: jsonargs[3],
        guest: jsonargs[4],
        level: jsonargs[5],
        team: jsonargs[6],
        ready: false,
        tabbed: false,
        avatar: jsonargs[7],
    };
    // send remind info if there is join text
    if (LBB_Main.joinText != "" || LBB_Main.joinText2 != "") {
        if (LBB_Main.autoRestartTimer < 180000) {
            LBB_Main.chat(LBB_Main.joinText2.replaceAll("username", jsonargs[3]).replaceAll("timer", (LBB_Main.autoRestartTimer / 60000)));
        } else {
            LBB_Main.chat(LBB_Main.joinText.replaceAll("username", jsonargs[3]));
        }
    }
    return args;
}
// handling when player leave
LBB_Main.receive_PlayerLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    if (typeof LBB_Main.playerList[jsonargs[1]] != "undefined") {
        delete LBB_Main.playerList[jsonargs[1]];
        LBB_Main.unfinishedPlayerIDs.delete(jsonargs[1].toString());
    }
    
    return args;
}
// handling when host leave
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
    LBB_Main.gameStartTimeStamp = Date.now(); // record start time
    LBB_Main.firstFinishTimeStamp = -1; // Initialize the first completed timestamp
    LBB_Main.firstFinish = true; // mark whether first finished player
    LBB_Main.matchEnds = false; // if match ends
    
    // Check who is playing
    LBB_Main.unfinishedPlayerIDs = new Set(Object.keys(LBB_Main.playerList));
    for (const id of LBB_Main.unfinishedPlayerIDs) {
        if(LBB_Main.playerList[id].team == 0){
            LBB_Main.unfinishedPlayerIDs.delete(id);
        }
    }
    // send game start remind
    if (LBB_Main.startText != "") {
        LBB_Main.chat(LBB_Main.startText);
    }

    return args;
}
// handle when player changes their team
LBB_Main.receive_TeamChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.playerList[jsonargs[1]].team = jsonargs[2];
    
    return args;
}
//Handle when a chat message is received. If the chat message starts with "!",
//it's treated as a command and processed accordingly
LBB_Main.receive_ChatMessage = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    let chatUserID = jsonargs[1];
    let chatMessage = jsonargs[2];
    
    if (chatMessage.substring(0, 1) == "!") {
        LBB_Main.commandHandle(chatMessage, LBB_Main.isIDAdmin(chatUserID));
    }
    
    return args;
}
//Handle when the game mode is changed
LBB_Main.receive_ModeChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.currentMode = jsonargs[3];
    
    return args;
}
//Handle when the game map is switched
LBB_Main.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    
    //console.log("Map Changed");
    //console.log(jsonargs[1]);
    //decodedCurrentMap = decodeFromDatabase(jsonargs[1]);
    //currentPPM = decodedCurrentMap.physics.ppm
    //setCurrentCapZones();
    
    return args;
}
//Handle when there's a new game host
LBB_Main.receive_NewHost = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LBB_Main.hostID = jsonargs[1]["newHost"];
    
    return args;
}
//Handle when a friend request is received.
LBB_Main.receive_FriendReq = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LBB_Main.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
    //LBB_Main.chat("Friended :3");
    
    return args;
}

// &Send Handler Functions
// handling when trigger game start
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
    //Format and return data
    args = "42" + JSON.stringify(jsonargs);
    return args;
}

//Initialize the game room when created
LBB_Main.send_CreatRoom = function (args) {
    LBB_Main.playerList = {};
    var jsonargs2 = JSON.parse(args.substring(2));
    var jsonargs = jsonargs2[1];

    LBB_Main.playerList[0] = {
        // Initialize the host player details
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
    // Set the player's ID and host ID to 0 (self, since the player is the creator)
    LBB_Main.myID = 0;
    LBB_Main.hostID = 0;
    
    return args;
}

//Send the player's inputs， Send the player's inputs
LBB_Main.send_SendInputs = function (args) {
    //console.log("SEND: " + args);
    LBB_Main.playerList[myID].lastMoveTime = Date.now();
    return args;
}

//Handle the addition of a new map
LBB_Main.send_MapAdd = function (args) {
    //console.log("Map Changed");
    var jsonargs = JSON.parse(args.substring(2));
    //decodedCurrentMap = decodeFromDatabase(jsonargs[1]["m"]);
    //currentPPM = decodedCurrentMap.physics.ppm
    //setCurrentCapZones();
    
    return args;
}
// #endregion

// send a chat message
LBB_Main.chat = function (message) {
    LBB_Main.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
};





// Convert milliseconds to a formatted string: "MM:SS.mmm".
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
//Get the name of the current map
LBB_Main.getCurrentMapName = function() {
    return document.getElementById("newbonklobby_maptext").innerHTML;
}


// Add or update a player's finish time for a specific map
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

//Handle the event when a player finishes
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

//Handle the event when a player enters a checkpoint zone
LBB_Main.playerInCZ = function (id) {
    id = id.toString();
    
    if (LBB_Main.unfinishedPlayerIDs.has(id)) {
        let timeGot = Date.now() - LBB_Main.gameStartTimeStamp;
        LBB_Main.playerFinished(id, timeGot);
    }
};







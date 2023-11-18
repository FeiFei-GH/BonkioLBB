// ==UserScript==
// @name         bonkHUD
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  bonkHUD
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-end
// @grant        none
// ==/UserScript==

window.LB_HUD = {};

LB_HUD.bonkWSS = 0;
window.originalSend = window.WebSocket.prototype.send;
LB_HUD.originalDrawCircle = window.PIXI.Graphics.prototype.drawCircle;
LB_HUD.scale = -1;
LB_HUD.requestAnimationFrameOriginal = window.requestAnimationFrame;

// My custom vars
LB_HUD.playerList = {};
LB_HUD.myID = -1;
LB_HUD.hostID = -1;


// !Overriding bonkWSS
// #region Overriding bonkWSS
window.WebSocket.prototype.send = function(args) {
    if (this.url.includes("socket.io/?EIO=3&transport=websocket&sid=")) {
        LB_HUD.bonkWSS = this;

        if (!this.injected) { // initialize overriding receive listener (only run once)
            this.injected = true;
            var originalReceive = this.onmessage;

            // This function intercepts incoming packets
            this.onmessage = function (args) {
                // &Receiving incoming packets
                if (args.data.startsWith('42[1,')) { // *Update Pings
                    
                } else if (args.data.startsWith('42[3,')) { // *Room join
                    args = LB_HUD.receive_RoomJoin(args);
                } else if (args.data.startsWith('42[4,')) { // *Player join
                    args = LB_HUD.receive_PlayerJoin(args);
                } else if (args.data.startsWith('42[5,')) { // *Player leave
                    args = LB_HUD.receive_PlayerLeave(args);
                } else if (args.data.startsWith('42[6,')) { // *Host leave
                    args = LB_HUD.receive_HostLeave(args);
                } else if (args.data.startsWith('42[7,')) { // *Inputs
                    args = LB_HUD.receive_Inputs(args);
                } else if (args.data.startsWith('42[8,')) { // *Ready Change
                    
                } else if (args.data.startsWith('42[13,')) { // *Game End
                    
                } else if (args.data.startsWith('42[15,')) { // *Game Start
                    args = LB_HUD.receive_GameStart(args);
                } else if (args.data.startsWith('42[16,')) { // *Error
                    
                } else if (args.data.startsWith('42[18,')) { // *Team Change
                    args = LB_HUD.receive_TeamChange(args);
                } else if (args.data.startsWith('42[19,')) { // *Teamlock toggle
                    
                } else if (args.data.startsWith('42[20,')) { // *Chat Message
                    args = LB_HUD.receive_ChatMessage(args);
                } else if (args.data.startsWith('42[21,')) { // *Initial data
                    
                } else if (args.data.startsWith('42[24,')) { // *Kicked
                    
                } else if (args.data.startsWith('42[26,')) { // *Mode change
                    args = LB_HUD.receive_ModeChange(args);
                } else if (args.data.startsWith('42[27,')) { // *Change WL (Rounds)
                    
                } else if (args.data.startsWith('42[29,')) { // *Map switch
                    args = LB_HUD.receive_MapSwitch(args);
                } else if (args.data.startsWith('42[32,')) { // *inactive?
                    
                } else if (args.data.startsWith('42[33,')) { // *Map Suggest
                    
                } else if (args.data.startsWith('42[34,')) { // *Map Suggest Client
                    
                } else if (args.data.startsWith('42[36,')) { // *Player Balance Change
                    
                } else if (args.data.startsWith('42[40,')) { // *Save Replay
                    
                } else if (args.data.startsWith('42[41,')) { // *New Host
                    args = LB_HUD.receive_NewHost(args);
                } else if (args.data.startsWith('42[42,')) { // *Friend Req
                    args = LB_HUD.receive_FriendReq(args);
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
                LB_HUD.bonkWSS = 0;
                return originalClose.call(this);
            };
        } else {
            // &Sending outgoing packets
            if (args.startsWith('42[4,')) { // *Send Inputs
                args = LB_HUD.send_SendInputs(args);
            } else if (args.startsWith('42[5,')) { // *Trigger Start
                args = LB_HUD.send_TriggerStart(args);
            } else if (args.startsWith('42[6,')) { // *Change Own Team
                
            } else if (args.startsWith('42[7,')) { // *Team Lock
                
            } else if (args.startsWith('42[9,')) { // *Kick/Ban Player
                
            } else if (args.startsWith('42[10,')) { // *Chat Message
                
            } else if (args.startsWith('42[11,')) { // *Inform In Lobby
                
            } else if (args.startsWith('42[12,')) { // *Create Room
                args = LB_HUD.send_CreatRoom(args);
            } else if (args.startsWith('42[14,')) { // *Return To Lobby
                
            } else if (args.startsWith('42[16,')) { // *Set Ready
                
            } else if (args.startsWith('42[17,')) { // *All Ready Reset
                
            } else if (args.startsWith('42[19,')) { // *Send Map Reorder
                
            } else if (args.startsWith('42[20,')) { // *Send Mode
                
            } else if (args.startsWith('42[21,')) { // *Send WL (Rounds)
                
            } else if (args.startsWith('42[22,')) { // *Send Map Delete
                
            } else if (args.startsWith('42[23,')) { // *Send Map Add
                args = LB_HUD.send_MapAdd(args);
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
LB_HUD.sendPacket = function (packet) {
    if (LB_HUD.bonkWSS != 0) {
        LB_HUD.bonkWSS.send(packet);
    }
};

// Make client receive a packet
LB_HUD.receivePacket = function (packet) {
    if (LB_HUD.bonkWSS != 0) {
        LB_HUD.bonkWSS.onmessage({ data: packet });
    }
};

// &----------------------Receive Handler Functions----------------------
LB_HUD.receive_RoomJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LB_HUD.playerList = {};
    LB_HUD.myID = jsonargs[1];
    LB_HUD.hostID = jsonargs[2];
    
    for(var i = 0; i < jsonargs[3].length; i++){
        if(jsonargs[3][i] != null){
            LB_HUD.playerList[i.toString()] = jsonargs[3][i];
        }
    }
    
    return args;
}

LB_HUD.receive_PlayerJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LB_HUD.playerList[jsonargs[1]] = {
        peerId: jsonargs[2],
        userName: jsonargs[3],
        guest: jsonargs[4],
        level: jsonargs[5],
        team: jsonargs[6],
        ready: false,
        tabbed: false,
        avatar: jsonargs[7],
    };

    return args;
}

LB_HUD.receive_PlayerLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    
    return args;
}

LB_HUD.receive_HostLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    LB_HUD.hostID = jsonargs[2];
    
    return args;
}

LB_HUD.receive_Inputs = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //console.log("Receive: " + args);
    
    return args;
}

//! Detects when match starts!!!
LB_HUD.receive_GameStart = function (args) {

    return args;
}

LB_HUD.receive_TeamChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LB_HUD.playerList[jsonargs[1]].team = jsonargs[2];
    
    return args;
}

LB_HUD.receive_ChatMessage = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    let chatUserID = jsonargs[1];
    let chatMessage = jsonargs[2];
    
    
    return args;
}

LB_HUD.receive_ModeChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LB_HUD.currentMode = jsonargs[3];
    
    return args;
}

LB_HUD.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    
    return args;
}

LB_HUD.receive_NewHost = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    LB_HUD.hostID = jsonargs[1]["newHost"];
    
    return args;
}

LB_HUD.receive_FriendReq = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LB_HUD.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
    //LB_HUD.chat("Friended :3");
    
    return args;
}

// &Send Handler Functions
LB_HUD.send_TriggerStart = function (args) {
    var jsonargs = JSON.parse(args.substring(2));
    

    //args = "42" + JSON.stringify(jsonargs);
    return args;
}

LB_HUD.send_CreatRoom = function (args) {
    LB_HUD.playerList = {};
    var jsonargs2 = JSON.parse(args.substring(2));
    var jsonargs = jsonargs2[1];

    LB_HUD.playerList[0] = {
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
    
    LB_HUD.myID = 0;
    LB_HUD.hostID = 0;
    
    return args;
}

LB_HUD.send_SendInputs = function (args) {
    console.log("SEND: " + args);
    //LB_HUD.playerList[myID].lastMoveTime = Date.now();
    return args;
}

LB_HUD.send_MapAdd = function (args) {
    //console.log("Map Changed");
    var jsonargs = JSON.parse(args.substring(2));
    
    return args;
}
// #endregion


LB_HUD.chat = function (message) {
    LB_HUD.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
};
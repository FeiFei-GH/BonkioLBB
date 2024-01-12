// ==UserScript==
// @name         bonkAPI
// @namespace    http://tampermonkey.net/
// @version      2.0.48
// @description  bonkAPI
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ! Matching Bonk Version 48

window.bonkAPI = {};

bonkAPI.bonkWSS = 0;
bonkAPI.originalSend = window.WebSocket.prototype.send;
//LB_HUD.originalDrawCircle = window.PIXI.Graphics.prototype.drawCircle;
bonkAPI.scale = -1;
bonkAPI.requestAnimationFrameOriginal = window.requestAnimationFrame;

// My custom vars
bonkAPI.playerList = {};
bonkAPI.myID = -1;
bonkAPI.hostID = -1;

//Not nice but works
/*bonkAPI.events = document.createElement("div");
bonkAPI.events.id = "WSS_API";
document.body.appendChild(bonkAPI.events);*/

var EventHandler;
(EventHandler = function() {this.hasEvent = []}).prototype = {
    addEventListener: function(event, method, scope, context) {
        var listeners, handlers;
        if(!(listeners = this.listeners)) {
            listeners = this.listeners = {};
        }
        if(!(handlers = listeners[event])) {
            handlers = listeners[event] = [];
            this.hasEvent[event] = true;
        }
        scope = (scope ? scope : window);
        handlers.push({
            method: method,
            scope: scope,
            context: (context ? context : scope)
        });
    },
    fireEvent: function(event, data, context) {
        var listeners, handlers, handler, l, scope;
        if(!(listeners = this.listeners)) {
            return;
        }
        if(!(handlers = listeners[event])) {
            return;
        }
        l = handlers.length;
        for(let i = 0; i < l; i++) {
            handler = handlers[i];
            if(typeof(context) !== "undefined" && context !== handler.context) {
                continue;
            }
            handler.method.call(handler.scope, data);
        }
    }
};

bonkAPI.events = new EventHandler();

/*bonkAPI.events.addEventListener("chatIn", function(e){
    console.log("HUM " + e.chatMessage);
});*/

// !Overriding bonkWSS
// #region Overriding bonkWSS

window.WebSocket.prototype.send = function(args) {
    if (this.url.includes("socket.io/?EIO=3&transport=websocket&sid=")) {
        //this.originalSend = this.send;
        if (!this.injectedAPI) { // initialize overriding receive listener (only run once)
            bonkAPI.bonkWSS = this;
            this.injectedAPI = true;
            var originalReceive = this.onmessage;
            // This function intercepts incoming packets
            this.onmessage = function (args) {
                // &Receiving incoming packets
                switch(args.data.substring(0, 5)) {
                    case "42[1,":
                        break; //FORGORT TO ADD WHAT THESE DID
                    case "42[3,": args = bonkAPI.receive_RoomJoin(args);
                        break; // *Room Join
                    case "42[5,": args = bonkAPI.receive_PlayerJoin(args);
                        break; // *Player Join
                    case "42[6,": args = bonkAPI.receive_HostLeave(args);
                        break; // *Host Leave
                    case "42[7,": args = bonkAPI.receive_Inputs(args);
                        break; // *Receive Inputs
                    case "42[8,":
                        break;
                    case "42[13":
                        break; // *Game End
                    case "42[15": args = bonkAPI.receive_GameStart(args);
                        break; // *Game Start
                    case "42[16":
                        break; // *Error
                    case "42[18": args = bonkAPI.receive_TeamChange(args);
                        break; // *Team Change
                    case "42[19": 
                        break; // *Teamlock Toggle
                    case "42[20": args = bonkAPI.receive_ChatMessage(args);
                        break; // *Chat Message
                    case "42[21":
                        break; // *Initial Data
                    case "42[24":
                        break; // *Kicked
                    case "42[26": args = bonkAPI.receive_ModeChange(args);
                        break; // *Change Mode
                    case "42[27":
                        break; // *Change Rounds
                    case "42[29": args = bonkAPI.receive_MapSwitch(args);
                        break; // *Map Switch
                    case "42[32": 
                        break; // *inactive?
                    case "42[33": 
                        break; // *Map Suggest
                    case "42[34":
                        break; // *Map Suggest Client
                    case "42[36": 
                        break; // *Player Balance Change
                    case "42[40": 
                        break; // *Save Replay
                    case "42[41": args = bonkAPI.receive_NewHost(args);
                        break; // *New Host
                    case "42[42": args = bonkAPI.receive_FriendReq(args);
                        break; // *Friend Req
                    case "42[43": 
                        break; // *Game Starting Countdown
                    case "42[44": 
                        break; // *Abort Countdown
                    case "42[45": 
                        break; // *Player Leveled Up
                    case "42[46": 
                        break; // *Local Gained XP
                    case "42[49": 
                        break; // *Created Room Share Link
                    case "42[52": 
                        break; // *Tabbed
                    case "42[58": 
                        break; // *Room Name Update
                    case "42[59": 
                        break; // *Room Password Update
                }
                
                return originalReceive.call(this, args);
            };

            var originalClose = this.onclose;
            this.onclose = function () {
                bonkAPI.bonkWSS = 0;
                return originalClose.call(this);
            };
        } else {
            console.log(args.substring(0,5));
            // &Sending outgoing packets
            switch(args.substring(0, 5)) {
                case "42[4,": args = bonkAPI.send_SendInputs(args);
                    break; // *Send Inputs
                case "42[5,": args = bonkAPI.send_TriggerStart(args);
                    break; // *Trigger Start
                case "42[6,": 
                    break; // *Change Own Team
                case "42[7,": 
                    break; // *Team Lock
                case "42[9,": 
                    break; // *Kick/Ban Player
                case "42[10":
                    break;  // *Chat Message
                case "42[11":
                    break;  // *Inform In Lobby
                case "42[12": args = bonkAPI.send_CreatRoom(args);
                    break;  // *Create Room
                case "42[14":
                    break;  // *Return To Lobby
                case "42[16": 
                    break;  // *Set Ready
                case "42[17": 
                    break;  // *All Ready Reset
                case "42[19": 
                    break;  // *Send Map Reorder
                case "42[20":
                    break;  // *Send Mode
                case "42[21":
                    break;  // *Send WL (Rounds)
                case "42[22": 
                    break;  // *Send Map Delete
                case "42[23": args = bonkAPI.send_MapAdd(args);
                    break;  // *Send Map Add
                case "42[26": 
                    break;  // *Change Other Team
                case "42[27": 
                    break;  // *Send Map Suggest
                case "42[29": 
                    break;  // *Send Balance
                case "42[32":
                    break;  // *Send Team Settings Change
                case "42[33": 
                    break;  // *Send Arm Record
                case "42[34": 
                    break;  // *Send Host Change
                case "42[35": 
                    break;  // *Send Friended
                case "42[36": 
                    break;  // *Send Start Countdown
                case "42[37": 
                    break;  // *Send Abort Countdown
                case "42[38": 
                    break;  // *Send Req XP
                case "42[39": 
                    break;  // *Send Map Vote
                case "42[40": 
                    break;  // *Inform In Game
                case "42[41": 
                    break;  // *Get Pre Vote
                case "42[44": 
                    break;  // *Tabbed
                case "42[50": 
                    break;  // *Send No Host Swap
            }
        }
    }

    return bonkAPI.originalSend.call(this, args);
};

// Send a packet to server
bonkAPI.sendPacket = function (packet) {
    if (bonkAPI.bonkWSS != 0) {
        bonkAPI.bonkWSS.send(packet);
    }
};

// Make client receive a packet
bonkAPI.receivePacket = function (packet) {
    if (bonkAPI.bonkWSS != 0) {
        bonkAPI.bonkWSS.onmessage({ data: packet });
    }
};

// &----------------------Receive Handler Functions----------------------
bonkAPI.receive_RoomJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.playerList = {};
    bonkAPI.myID = jsonargs[1];
    bonkAPI.hostID = jsonargs[2];
    
    for(var i = 0; i < jsonargs[3].length; i++){
        if(jsonargs[3][i] != null){
            bonkAPI.playerList[i.toString()] = jsonargs[3][i];
        }
    }

    // this name isnt descriptive
    if(bonkAPI.events.hasEvent["onJoin"]) {
        var sendObj = { hostID: jsonargs[2],
                        userData: bonkAPI.playerList,
                        roomId: jsonargs[6],
                        bypass: jsonargs[7] };
        bonkAPI.events.fireEvent("onJoin", sendObj);
    }
    
    return args;
}

bonkAPI.receive_PlayerJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.playerList[jsonargs[1]] = {
        peerId: jsonargs[2],
        userName: jsonargs[3],
        guest: jsonargs[4],
        level: jsonargs[5],
        team: jsonargs[6],
        ready: false,
        tabbed: false,
        avatar: jsonargs[7],
    };

    //can:
    // - send the playerlist as data
    // - send the new player object as data
    // - send nothing and let the user access bonkAPI.playerList
    if(bonkAPI.events.hasEvent["userJoin"]) {
        var sendObj = { userID: jsonargs[2], userData: bonkAPI.playerList[jsonargs[1]] };
        bonkAPI.events.fireEvent("userJoin", sendObj);
    }

    return args;
}

bonkAPI.receive_PlayerLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    if(bonkAPI.events.hasEvent["userLeave"]) {
        var sendObj = { userID: jsonargs[2], userData: bonkAPI.playerList[jsonargs[1]] };
        bonkAPI.events.fireEvent("userLeave", sendObj);
    }
    
    return args;
}

bonkAPI.receive_HostLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    bonkAPI.hostID = jsonargs[2];
    
    //Using hostChange to use for multiple cases
    if(bonkAPI.events.hasEvent["hostChange"]) {
        var sendObj = { userID: jsonargs[2] };
        bonkAPI.events.fireEvent("hostChange", sendObj);
    }

    return args;
}

bonkAPI.receive_Inputs = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    /* Maybe we could have different event names like
     * "receiveRawInput" and "receiveInput" which send
     * different data, the second could have booleans
     * representing the inputs, the other is binary
     */
    if(bonkAPI.events.hasEvent["receivedInputs"]) {
        var sendObj = { userID: jsonargs[1],
                        rawInput: jsonargs[2]["i"], 
                        frame: jsonargs[2]["f"], 
                        sequence: jsonargs[2]["c"] };
        bonkAPI.events.fireEvent("receivedInputs", sendObj);
    } //example
    /*if(bonkAPI.events.hasEvent["receiveRawInput"]) {
        obj here
        bonkAPI.events.fireEvent("receiveRawInput", sendObj);
    }
    */

    return args;
}

//! Detects when match starts!!!
bonkAPI.receive_GameStart = function (args) {
    //Dont need to send args if it doesnt have usefull information
    if(bonkAPI.events.hasEvent["gameStart"]) {
        var sendObj = { extraData: args };
        bonkAPI.events.fireEvent("gameStart", sendObj);
    }

    return args;
}

bonkAPI.receive_TeamChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.playerList[jsonargs[1]].team = jsonargs[2];
    
    if(bonkAPI.events.hasEvent["teamChange"]) {
        var sendObj = { userID: jsonargs[1], team: jsonargs[2] };
        bonkAPI.events.fireEvent("teamChange", sendObj);
    }

    return args;
}

bonkAPI.receive_ChatMessage = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    let chatUserID = jsonargs[1];
    let chatMessage = jsonargs[2];

    if(bonkAPI.events.hasEvent["chatIn"]) {
        var sendObj = { userID: chatUserID, message: chatMessage };
        bonkAPI.events.fireEvent("chatIn", sendObj);
    }

    return args;
}

bonkAPI.receive_ModeChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    
    //Maybe change raw arguement to full mode name or numbers
    if(bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: jsonargs[1] };
        bonkAPI.events.fireEvent("modeChange", sendObj);
    }

    return args;
}

bonkAPI.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    
    //Using mapChange to stick with other events using "change"
    if(bonkAPI.events.hasEvent["mapChange"]) {
        var sendObj = { mapData: jsonargs[1] };
        bonkAPI.events.fireEvent("mapChange", sendObj);
    }

    return args;
}

bonkAPI.receive_NewHost = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.hostID = jsonargs[1]["newHost"];
    
    /* Leaving out for now since i dont know what this packet contains
    if(bonkAPI.events.hasEvent["hostChange"]) {
        bonkAPI.events.fireEvent("hostChange", jsonargs[1]["newHost"]);
    }*/

    return args;
}

bonkAPI.receive_FriendReq = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LB_HUD.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
    //LB_HUD.chat("Friended :3");

    if(bonkAPI.events.hasEvent["receivedFriend"]) {
        var sendObj = { userID: jsonargs[1] };
        bonkAPI.events.fireEvent("receivedFriend", sendObj);
    }
    
    return args;
}

// &Send Handler Functions
bonkAPI.send_TriggerStart = function (args) {
    var jsonargs = JSON.parse(args.substring(2));
    

    //args = "42" + JSON.stringify(jsonargs);
    return args;
}

bonkAPI.send_CreatRoom = function (args) {
    bonkAPI.playerList = {};
    var jsonargs2 = JSON.parse(args.substring(2));
    var jsonargs = jsonargs2[1];

    bonkAPI.playerList[0] = {
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
    
    bonkAPI.myID = 0;
    bonkAPI.hostID = 0;
    
    return args;
}

bonkAPI.send_SendInputs = function (args) {
    //LB_HUD.playerList[myID].lastMoveTime = Date.now();
    return args;
}

bonkAPI.send_MapAdd = function (args) {
    //console.log("Map Changed");
    var jsonargs = JSON.parse(args.substring(2));
    
    return args;
}
// #endregion


bonkAPI.chat = function (message) {
    bonkAPI.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
};
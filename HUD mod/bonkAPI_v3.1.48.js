// ==UserScript==
// @name         bonkAPI
// @namespace    http://tampermonkey.net/
// @version      3.1.48
// @description  bonkAPI
// @author       FeiFei + Clarifi
// @license      MIT
// @match        https://bonk.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ! Compitable with Bonk Version 48

// Everything should be inside this object
// to prevent conflict with other prgrams.
window.bonkAPI = {};

// Functions handle add Listeners from other programs and also fires event to them
bonkAPI.EventHandler;
(bonkAPI.EventHandler = function () {
    this.hasEvent = [];
}).prototype = {
    addEventListener: function (event, method, scope, context) {
        var listeners, handlers;
        if (!(listeners = this.listeners)) {
            listeners = this.listeners = {};
        }

        if (!(handlers = listeners[event])) {
            handlers = listeners[event] = [];
            this.hasEvent[event] = true;
        }

        scope = scope ? scope : window;
        handlers.push({
            method: method,
            scope: scope,
            context: context ? context : scope,
        });
    },
    fireEvent: function (event, data, context) {
        var listeners, handlers, handler, l, scope;
        if (!(listeners = this.listeners)) {
            return;
        }
        if (!(handlers = listeners[event])) {
            return;
        }
        l = handlers.length;
        for (let i = 0; i < l; i++) {
            handler = handlers[i];
            if (typeof context !== "undefined" && context !== handler.context) {
                continue;
            }
            handler.method.call(handler.scope, data);
        }
    },
};
Object.freeze(bonkAPI.EventHandler);

// !Initialize Variable

bonkAPI.bonkWSS = 0;
bonkAPI.originalSend = window.WebSocket.prototype.send;
bonkAPI.originalRequestAnimationFrame = window.requestAnimationFrame;

// bonkAPI Vars
bonkAPI.playerList = [];
bonkAPI.myID = -1;
bonkAPI.hostID = -1;

bonkAPI.events = new bonkAPI.EventHandler();

// !----------------------------Overriding bonkWSS----------------------------
// #region
window.WebSocket.prototype.send = function (args) {
    if (this.url.includes("socket.io/?EIO=3&transport=websocket&sid=")) {
        if (!this.injectedAPI) {
            // initialize overriding receive listener (only run once)
            bonkAPI.bonkWSS = this;
            this.injectedAPI = true;
            var originalReceive = this.onmessage;
            // This function intercepts incoming packets
            this.onmessage = function (args) {
                // &Receiving incoming packets
                switch (args.data.substring(0, 5)) {
                    case "42[1,": //*Update other players' pings
                        break;
                    case "42[2,": // *UNKNOWN, received after sending create room packet
                        break;
                    case "42[3,": // *Room Join
                        args = bonkAPI.receive_RoomJoin(args);
                        break;
                    case "42[4,": // *Player Join
                        args = bonkAPI.receive_PlayerJoin(args);
                        break;
                    case "42[5,": // *Player Join
                        args = bonkAPI.receive_PlayerLeave(args);
                        break;
                    case "42[6,": // *Host Leave
                        args = bonkAPI.receive_HostLeave(args);
                        break;
                    case "42[7,": // *Receive Inputs
                        args = bonkAPI.receive_Inputs(args);
                        break;
                    case "42[8,": // *Ready Change
                        break;
                    case "42[13": // *Game End
                        break;
                    case "42[15": // *Game Start
                        args = bonkAPI.receive_GameStart(args);
                        break;
                    case "42[16": // *Error
                        break;
                    case "42[18": // *Team Change
                        args = bonkAPI.receive_TeamChange(args);
                        break;
                    case "42[19": // *Teamlock Toggle
                        break;
                    case "42[20": // *Chat Message
                        args = bonkAPI.receive_ChatMessage(args);
                        break;
                    case "42[21": // *Initial Data
                        break;
                    case "42[24": // *Kicked
                        break;
                    case "42[26": // *Change Mode
                        args = bonkAPI.receive_ModeChange(args);
                        break;
                    case "42[27": // *Change Rounds
                        break;
                    case "42[29": // *Map Switch
                        args = bonkAPI.receive_MapSwitch(args);
                        break;
                    case "42[32": // *inactive?
                        break;
                    case "42[33": // *Map Suggest
                        break;
                    case "42[34": // *Map Suggest Client
                        break;
                    case "42[36": // *Player Balance Change
                        break;
                    case "42[40": // *Save Replay
                        break;
                    case "42[41": // *New Host
                        args = bonkAPI.receive_NewHost(args);
                        break;
                    case "42[42": // *Friend Req
                        args = bonkAPI.receive_FriendReq(args);
                        break;
                    case "42[43": // *Game Starting Countdown
                        break;
                    case "42[44": // *Abort Countdown
                        break;
                    case "42[45": // *Player Leveled Up
                        break;
                    case "42[46": // *Local Gained XP
                        break;
                    case "42[49": // *Created Room Share Link
                        break;
                    case "42[52": // *Tabbed
                        break;
                    case "42[58": // *Room Name Update
                        break;
                    case "42[59": // *Room Password Update
                        break;
                }

                return originalReceive.call(this, args);
            };

            var originalClose = this.onclose;
            this.onclose = function () {
                bonkAPI.bonkWSS = 0;
                return originalClose.call(this);
            };
        } else {
            // &Sending outgoing packets
            switch (args.substring(0, 5)) {
                case "42[4,": // *Send Inputs
                    args = bonkAPI.send_SendInputs(args);
                    break;
                case "42[5,": // *Trigger Start
                    args = bonkAPI.send_TriggerStart(args);
                    break;
                case "42[6,": // *Change Own Team
                    break;
                case "42[7,": // *Team Lock
                    break;
                case "42[9,": // *Kick/Ban Player
                    break;
                case "42[10": // *Chat Message
                    break;
                case "42[11": // *Inform In Lobby
                    break;
                case "42[12": // *Create Room
                    args = bonkAPI.send_CreateRoom(args);
                    break;
                case "42[14": // *Return To Lobby
                    break;
                case "42[16": // *Set Ready
                    break;
                case "42[17": // *All Ready Reset
                    break;
                case "42[19": // *Send Map Reorder
                    break;
                case "42[20": // *Send Mode
                    break;
                case "42[21": // *Send WL (Rounds)
                    break;
                case "42[22": // *Send Map Delete
                    break;
                case "42[23": // *Send Map Add
                    args = bonkAPI.send_MapAdd(args);
                    break;
                case "42[26": // *Change Other Team
                    break;
                case "42[27": // *Send Map Suggest
                    break;
                case "42[29": // *Send Balance
                    break;
                case "42[32": // *Send Team Settings Change
                    break;
                case "42[33": // *Send Arm Record
                    break;
                case "42[34": // *Send Host Change
                    break;
                case "42[35": // *Send Friended
                    break;
                case "42[36": // *Send Start Countdown
                    break;
                case "42[37": // *Send Abort Countdown
                    break;
                case "42[38": // *Send Req XP
                    break;
                case "42[39": // *Send Map Vote
                    break;
                case "42[40": // *Inform In Game
                    break;
                case "42[41": // *Get Pre Vote
                    break;
                case "42[44": // *Tabbed
                    break;
                case "42[50": // *Send No Host Swap
                    break;
            }
        }
    }

    return bonkAPI.originalSend.call(this, args);
};
// #endregion

// !-----------------Send and Receive Packets-----------------
// #region
// !Note: these could be dangerous, maybe add some sanitization
// *Send a packet to server
bonkAPI.sendPacket = function (packet) {
    if (bonkAPI.bonkWSS != 0) {
        bonkAPI.bonkWSS.send(packet);
    }
};

// *Make client receive a packet
bonkAPI.receivePacket = function (packet) {
    if (bonkAPI.bonkWSS != 0) {
        bonkAPI.bonkWSS.onmessage({ data: packet });
    }
};
// #endregion

// !Receive Handler Functions
// #region -----------------Receive Handler Functions-----------------------
bonkAPI.receive_RoomJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.playerList = [];
    bonkAPI.myID = jsonargs[1];
    bonkAPI.hostID = jsonargs[2];

    for (var i = 0; i < jsonargs[3].length; i++) {
        //if(jsonargs[3][i] != null){
        bonkAPI.playerList[i] = jsonargs[3][i];
        //}
    }

    // !this name isnt descriptive
    if (bonkAPI.events.hasEvent["onJoin"]) {
        var sendObj = {
            hostID: jsonargs[2],
            userData: bonkAPI.playerList, // !May or may not be immutable
            roomID: jsonargs[6],
            bypass: jsonargs[7],
        };
        bonkAPI.events.fireEvent("onJoin", sendObj);
    }

    return args;
};

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

    //? can:
    //? - send the bonkAPI.playerList as data
    //? - send the new player object as data
    //? - send nothing and let the user access bonkAPI.playerList
    if (bonkAPI.events.hasEvent["userJoin"]) {
        var sendObj = { userID: jsonargs[2], userData: bonkAPI.playerList[jsonargs[1]] };
        bonkAPI.events.fireEvent("userJoin", sendObj);
    }

    return args;
};

bonkAPI.receive_PlayerLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    if (bonkAPI.events.hasEvent["userLeave"]) {
        var sendObj = { userID: jsonargs[2], userData: bonkAPI.playerList[jsonargs[1]] };
        bonkAPI.events.fireEvent("userLeave", sendObj);
    }

    return args;
};

bonkAPI.receive_HostLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    bonkAPI.hostID = jsonargs[2];

    //Using hostChange to use for multiple cases
    if (bonkAPI.events.hasEvent["hostChange"]) {
        var sendObj = { userID: jsonargs[2] };
        bonkAPI.events.fireEvent("hostChange", sendObj);
    }

    return args;
};

bonkAPI.receive_Inputs = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    /*
     * Maybe we could have different event names like
     * "receiveRawInput" and "receiveInput" which send
     * different data, the second could have booleans
     * representing the inputs, the other is binary
     */
    if (bonkAPI.events.hasEvent["receivedInputs"]) {
        var sendObj = {
            userID: jsonargs[1],
            rawInput: jsonargs[2]["i"],
            frame: jsonargs[2]["f"],
            sequence: jsonargs[2]["c"],
        };
        bonkAPI.events.fireEvent("receivedInputs", sendObj);
    } //example
    /*if(bonkAPI.bonkAPI.events.hasEvent["receiveRawInput"]) {
        obj here
        bonkAPI.bonkAPI.events.fireEvent("receiveRawInput", sendObj);
    }
    */

    return args;
};

//! Detects when match starts!!!
bonkAPI.receive_GameStart = function (args) {
    // *Dont need to send args if it doesnt have usefull information
    if (bonkAPI.events.hasEvent["gameStart"]) {
        var sendObj = { extraData: args };
        bonkAPI.events.fireEvent("gameStart", sendObj);
    }

    return args;
};

bonkAPI.receive_TeamChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.playerList[jsonargs[1]].team = jsonargs[2];

    if (bonkAPI.events.hasEvent["teamChange"]) {
        var sendObj = { userID: jsonargs[1], team: jsonargs[2] };
        bonkAPI.events.fireEvent("teamChange", sendObj);
    }

    return args;
};

bonkAPI.receive_ChatMessage = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    let chatUserID = jsonargs[1];
    let chatMessage = jsonargs[2];

    if (bonkAPI.events.hasEvent["chatIn"]) {
        var sendObj = { userID: chatUserID, message: chatMessage };
        bonkAPI.events.fireEvent("chatIn", sendObj);
    }

    return args;
};

bonkAPI.receive_ModeChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    // *Maybe change raw arguement to full mode name or numbers
    if (bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: jsonargs[1] };
        bonkAPI.events.fireEvent("modeChange", sendObj);
    }

    return args;
};

bonkAPI.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    // *Using mapChange to stick with other bonkAPI.events using "change"
    if (bonkAPI.events.hasEvent["mapChange"]) {
        var sendObj = { mapData: jsonargs[1] };
        bonkAPI.events.fireEvent("mapChange", sendObj);
    }

    return args;
};

bonkAPI.receive_NewHost = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.hostID = jsonargs[1]["newHost"];

    /* Leaving out for now since i dont know what this packet contains
    if(bonkAPI.bonkAPI.events.hasEvent["hostChange"]) {
        bonkAPI.bonkAPI.events.fireEvent("hostChange", jsonargs[1]["newHost"]);
    }*/

    return args;
};

bonkAPI.receive_FriendReq = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LB_HUD.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
    //LB_HUD.chat("Friended :3");

    if (bonkAPI.events.hasEvent["receivedFriend"]) {
        var sendObj = { userID: jsonargs[1] };
        bonkAPI.events.fireEvent("receivedFriend", sendObj);
    }

    return args;
};

// &Send Handler Functions
bonkAPI.send_TriggerStart = function (args) {
    var jsonargs = JSON.parse(args.substring(2));

    //args = "42" + JSON.stringify(jsonargs);
    return args;
};

bonkAPI.send_CreateRoom = function (args) {
    bonkAPI.playerList = [];
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
};

bonkAPI.send_SendInputs = function (args) {
    //LB_HUD.playerList[myID].lastMoveTime = Date.now();
    return args;
};

bonkAPI.send_MapAdd = function (args) {
    //console.log("Map Changed");
    var jsonargs = JSON.parse(args.substring(2));

    return args;
};
// #endregion

// !--------------------------Public Functions--------------------------
// #region
/**
 * Sends message in chat.
 * @param {string} message - The message.
 */
bonkAPI.chat = function (message) {
    bonkAPI.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
};


bonkAPI.addEventListener = function (event, method, scope, context) {
    bonkAPI.events.addEventListener(event, method, scope, context);
};


/**
 * Represents a book.
 * @returns {number} Sum of a and b
 */
// *Returns a copy of bonkAPI.playerList
bonkAPI.getPlayerList = function () {
    return Object.assign([], bonkAPI.playerList);
};


bonkAPI.getPlayerListLength = function () {
    return bonkAPI.playerList.length;
};


bonkAPI.getPlayerByID = function (id) {
    for (let i = 0; i < bonkAPI.playerList.length; i++) {
        if (i == id) {
            return Object.assign({}, bonkAPI.playerList[i]);
        }
    }
};

bonkAPI.getPlayerByName = function (name) {
    for (let i = 0; i < bonkAPI.playerList.length; i++) {
        if (name == bonkAPI.playerList[i].userName) {
            return Object.assign({}, bonkAPI.playerList[i]);
        }
    }
    return null;
};

// *Returns list of players in a team(using team numbers, not strings)
bonkAPI.getPlayersByTeam = function (team) {
    var teamList = [];
    for (let i = 0; i < bonkAPI.playerList.length; i++) {
        if (team == bonkAPI.playerList[i].team) {
            teamList.push({ userID: i, userData: bonkAPI.playerList[i] });
        }
    }
    return teamList;
};

bonkAPI.getMyID = function () {
    return bonkAPI.myID;
};

bonkAPI.getHostID = function () {
    return bonkAPI.hostID;
};
// #endregion

// Freeze all constant objects
/*Object.freeze(bonkAPI.addEventListener);
Object.freeze(bonkAPI.chat);
Object.freeze(bonkAPI.getPlayerList);
Object.freeze(bonkAPI.getPlayerListLength);
Object.freeze(bonkAPI.getPlayerByID);
Object.freeze(bonkAPI.getPlayerByName);
Object.freeze(bonkAPI.getPlayersByTeam);
Object.freeze(bonkAPI.getMyID);
Object.freeze(bonkAPI.getHostID);
Object.freeze(bonkAPI);*/
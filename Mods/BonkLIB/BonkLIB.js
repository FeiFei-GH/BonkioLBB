// ==UserScript==
// @name         BonkLIB
// @namespace    http://tampermonkey.net/
// @version      1.0.48
// @description  BonkAPI + BonkHUD
// @author       FeiFei + Clarifi
// @license      MIT
// @match        https://*bonk.io/gameframe-release.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ! Compitable with Bonk Version 48

// Everything should be inside this object to prevent conflict with other prgrams.
window.bonkAPI = {};

// #region //!------------------Event Handling-----------------
// *Functions handle add Listeners from other programs and also fires event to them
/**
 * @class EventHandler
 * @classdesc Stores functions and events and can fire events with data.
 * This class is already instantiated onto bonkAPI so if you dont need your
 * own event handler, ignore this class.
 * @hideconstructor
 */
bonkAPI.EventHandler;
(bonkAPI.EventHandler = function () {
    this.hasEvent = [];
}).prototype = {
    /**
     * Begins to listen for the given event to call the method later.
     * @method
     * @memberof EventHandler
     * @param {string} event - Event that is listened for
     * @param {function(object)} method - Function that is called
     * @param {*} [scope] - Where the function should be called from, defaults to window
     * @param {*} [context] - defaults to nothing
     */
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

    /**
     * Fires the event given to call the methods linked to that event.
     * @method
     * @memberof EventHandler
     * @param {string} event - Event that is being fired
     * @param {object} data - Data sent along with the event
     * @param {*} [context]
     * @returns
     */
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
// #endregion

// #region //!------------------Initialize Variables-----------------
/**
 * Contains data of a single player
 *
 * @typedef {object} Player
 * @property {string} peerID - Peer ID of player
 * @property {string} userName - Username of player
 * @property {number} level - Level of player
 * @property {boolean} guest - Is guest
 * @property {number} team - Integer of what team from 0 to 5
 * @property {boolean} ready - Is ready
 * @property {boolean} tabbed - Is tabbed
 * @property {JSON} avatar - Avatar data
 */

/**
 * Contains data of a single friend
 *
 * @typedef {object} Friend
 * @property {string} userName - Username of friend
 * @property {string} roomID - Room ID of the lobby that the friend is in
 */

bonkAPI.playerList = [];
bonkAPI.myID = -1;
bonkAPI.myToken = -1;
bonkAPI.hostID = -1;
bonkAPI.events = new bonkAPI.EventHandler();

bonkAPI.isLoggingIn = false;

// MGF vars
bonkAPI.bonkWSS = 0;
bonkAPI.originalSend = window.WebSocket.prototype.send;
bonkAPI.originalRequestAnimationFrame = window.requestAnimationFrame;
bonkAPI.originalXMLOpen = window.XMLHttpRequest.prototype.open;
bonkAPI.originalXMLSend = window.XMLHttpRequest.prototype.send;

// #endregion

// #region //!------------------Overriding bonkWSS------------------
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
                        args = bonkAPI.receive_PingUpdate(args);
                        break;
                    case "42[2,": // *UNKNOWN, received after sending create room packet
                        args = bonkAPI.receive_Unknow2(args);
                        break;
                    case "42[3,": // *Room Join
                        args = bonkAPI.receive_RoomJoin(args);
                        break;
                    case "42[4,": // *Player Join
                        args = bonkAPI.receive_PlayerJoin(args);
                        break;
                    case "42[5,": // *Player Leave
                        args = bonkAPI.receive_PlayerLeave(args);
                        break;
                    case "42[6,": // *Host Leave
                        args = bonkAPI.receive_HostLeave(args);
                        break;
                    case "42[7,": // *Receive Inputs
                        args = bonkAPI.receive_Inputs(args);
                        break;
                    case "42[8,": // *Ready Change
                        args = bonkAPI.receive_ReadyChange(args);
                        break;
                    case "42[13": // *Game End
                        args = bonkAPI.receive_GameEnd(args);
                        break;
                    case "42[15": // *Game Start
                        args = bonkAPI.receive_GameStart(args);
                        break;
                    case "42[16": // *Error
                        args = bonkAPI.receive_Error(args);
                        break;
                    case "42[18": // *Team Change
                        args = bonkAPI.receive_TeamChange(args);
                        break;
                    case "42[19": // *Teamlock Toggle
                        args = bonkAPI.receive_TeamLockToggle(args);
                        break;
                    case "42[20": // *Chat Message
                        args = bonkAPI.receive_ChatMessage(args);
                        break;
                    case "42[21": // *Initial Data
                        args = bonkAPI.receive_InitialData(args);
                        break;
                    case "42[24": // *Kicked
                        args = bonkAPI.receive_PlayerKick(args);
                        break;
                    case "42[26": // *Change Mode
                        args = bonkAPI.receive_ModeChange(args);
                        break;
                    case "42[27": // *Change Rounds
                        args = bonkAPI.receive_RoundsChange(args);
                        break;
                    case "42[29": // *Map Switch
                        args = bonkAPI.receive_MapSwitch(args);
                        break;
                    case "42[32": // *inactive?
                        args = bonkAPI.receive_Inactive(args);
                        break;
                    case "42[33": // *Map Suggest
                        args = bonkAPI.receive_MapSuggest(args);
                        break;
                    case "42[34": // *Map Suggest Client
                        args = bonkAPI.receive_MapSuggestClient(args);
                        break;
                    case "42[36": // *Player Balance Change
                        args = bonkAPI.receive_PlayerBalance(args);
                        break;
                    case "42[40": // *Save Replay
                        args = bonkAPI.receive_ReplaySave(args);
                        break;
                    case "42[41": // *New Host
                        args = bonkAPI.receive_NewHost(args);
                        break;
                    case "42[42": // *Friend Req
                        args = bonkAPI.receive_FriendRequest(args);
                        break;
                    case "42[43": // *Game Starting Countdown
                        args = bonkAPI.receive_CountdownStart(args);
                        break;
                    case "42[44": // *Abort Countdown
                        args = bonkAPI.receive_CountdownAbort(args);
                        break;
                    case "42[45": // *Player Leveled Up
                        args = bonkAPI.receive_PlayerLevelUp(args);
                        break;
                    case "42[46": // *Local Gained XP
                        args = bonkAPI.receive_LocalGainXP(args);
                        break;
                    case "42[49": // *Created Room Share Link
                        args = bonkAPI.receive_RoomShareLink(args);
                        break;
                    case "42[52": // *Tabbed
                        args = bonkAPI.receive_Tabbed(args);
                        break;
                    case "42[58": // *Room Name Update
                        args = bonkAPI.receive_RoomName(args);
                        break;
                    case "42[59": // *Room Password Update
                        args = bonkAPI.receive_RoomPassword(args);
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
                    args = bonkAPI.send_TeamChange(args);
                    break;
                case "42[7,": // *Team Lock
                    args = bonkAPI.send_TeamLock(args);
                    break;
                case "42[9,": // *Kick/Ban Player
                    args = bonkAPI.send_KickBanPlayer(args);
                    break;
                case "42[10": // *Chat Message
                    args = bonkAPI.send_ChatMsg(args);
                    break;
                case "42[11": // *Inform In Lobby
                    args = bonkAPI.send_LobbyInform(args);
                    break;
                case "42[12": // *Create Room
                    args = bonkAPI.send_CreateRoom(args);
                    break;
                case "42[13": // *Room Join Information
                    args = bonkAPI.send_RoomJoin(args);
                case "42[14": // *Return To Lobby
                    args = bonkAPI.send_LobbyReturn(args);
                    break;
                case "42[16": // *Set Ready
                    args = bonkAPI.send_Ready(args);
                    break;
                case "42[17": // *All Ready Reset
                    args = bonkAPI.send_AllReadyReset(args);
                    break;
                case "42[19": // *Send Map Reorder
                    args = bonkAPI.send_MapReorder(args);
                    break;
                case "42[20": // *Send Mode
                    args = bonkAPI.send_ModeChange(args);
                    break;
                case "42[21": // *Send WL (Rounds)
                    args = bonkAPI.send_RoundsChange(args);
                    break;
                case "42[22": // *Send Map Delete
                    args = bonkAPI.send_MapDelete(args);
                    break;
                case "42[23": // *Send Map Switch
                    args = bonkAPI.send_MapSwitch(args);
                    break;
                case "42[26": // *Change Other Team
                    args = bonkAPI.send_OtherTeamChange(args);
                    break;
                case "42[27": // *Send Map Suggest
                    args = bonkAPI.send_MapSuggest(args);
                    break;
                case "42[29": // *Send Balance
                    args = bonkAPI.send_Balance(args);
                    break;
                case "42[32": // *Send Team Settings Change
                    args = bonkAPI.send_TeamSetting(args);
                    break;
                case "42[33": // *Send Arm Record
                    args = bonkAPI.send_ArmRecord(args);
                    break;
                case "42[34": // *Send Host Change
                    args = bonkAPI.send_HostChange(args);
                    break;
                case "42[35": // *Send Friended
                    args = bonkAPI.send_Friended(args);
                    break;
                case "42[36": // *Send Start Countdown
                    args = bonkAPI.send_CountdownStart(args);
                    break;
                case "42[37": // *Send Abort Countdown
                    args = bonkAPI.send_CountdownAbort(args);
                    break;
                case "42[38": // *Send Req XP
                    args = bonkAPI.send_RequestXP(args);
                    break;
                case "42[39": // *Send Map Vote
                    args = bonkAPI.send_MapVote(args);
                    break;
                case "42[40": // *Inform In Game
                    args = bonkAPI.send_InformInGame(args);
                    break;
                case "42[41": // *Get Pre Vote
                    args = bonkAPI.send_GetPreVote(args);
                    break;
                case "42[44": // *Tabbed
                    args = bonkAPI.send_Tabbed(args);
                    break;
                case "42[50": // *Send No Host Swap
                    args = bonkAPI.send_NoHostSwap(args);
                    break;
            }
        }
    }

    return bonkAPI.originalSend.call(this, args);
};
// #endregion

// #region //!------------------Send and Receive Packets-----------------
// TODO: these could be dangerous, maybe add some sanitization
// *Send a packet to server
/**
 * Sends the given packet to bonk servers.
 * @function bonkAPI.sendPacket
 * @param {string} packet - Packet to send to bonk
 */
bonkAPI.sendPacket = function (packet) {
    if (bonkAPI.bonkWSS != 0) {
        bonkAPI.bonkWSS.send(packet);
    }
};

// *Make client receive a packet
/**
 * Makes your client receive the given packet.
 * @function bonkAPI.receivePacket
 * @param {string} packet - Packet that is received
 */
bonkAPI.receivePacket = function (packet) {
    if (bonkAPI.bonkWSS != 0) {
        bonkAPI.bonkWSS.onmessage({ data: packet });
    }
};
// #endregion

// #region //!-----------------Overriding HTTPRequest------------------
window.XMLHttpRequest.prototype.open = function (_, url) {
    if (url.includes("scripts/login_legacy")) {
        bonkAPI.isLoggingIn = true;
    }
    //? Could check for other post requests but not necessary

    bonkAPI.originalXMLOpen.call(this, ...arguments);
};
window.XMLHttpRequest.prototype.send = function (data) {
    if (bonkAPI.isLoggingIn) {
        this.onreadystatechange = function () {
            if (this.readyState == 4) {
                bonkAPI.myToken = JSON.parse(this.response)["token"];
            }
        };
        bonkAPI.isLoggingIn = false;
    }
    bonkAPI.originalXMLSend.call(this, ...arguments);
};
// #endregion

// #region //!------------------Receive Handler Functions------------------
bonkAPI.receive_PingUpdate = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_Unknow2 = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when the user joins a lobby.
 * @function receive_RoomJoin
 * @fires onJoin
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
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
    /**
     * When the user joins a lobby.
     * @event onJoin
     * @type {object}
     * @property {number} hostID - ID of the host
     * @property {Array.<Player>} userData - List of players currently in the room
     * @property {*} roomID - ID of the lobby joined
     * @property {string} bypass
     */
    // TODO: this name isnt descriptive
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

/**
 * Triggered when a player joins the lobby.
 * @function receive_PlayerJoin
 * @fires userJoin
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
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
    /**
     * When another player joins the lobby.
     * @event userJoin
     * @type {object}
     * @property {number} userID - ID of the player joined
     * @property {Player} userData - {@linkcode Player} object data of the player that joined
     */
    if (bonkAPI.events.hasEvent["userJoin"]) {
        var sendObj = { userID: jsonargs[1], userData: bonkAPI.playerList[jsonargs[1]] };
        bonkAPI.events.fireEvent("userJoin", sendObj);
    }

    return args;
};

/**
 * Triggered when a player leaves the lobby.
 * @function receive_PlayerLeave
 * @fires userLeave
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_PlayerLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    /**
     * When another player leaves the lobby.
     * @event userLeave
     * @type {object}
     * @property {number} userID - ID of the player left
     * @property {Player} userData - {@linkcode Player} object data of the player that left
     */
    if (bonkAPI.events.hasEvent["userLeave"]) {
        var sendObj = { userID: jsonargs[1], userData: bonkAPI.playerList[jsonargs[1]] };
        bonkAPI.events.fireEvent("userLeave", sendObj);
    }

    return args;
};

/**
 * Triggered when the host has changed.
 * @function receive_HostLeave
 * @fires hostChange
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_HostLeave = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    bonkAPI.hostID = jsonargs[2];

    /**
     * When the host changes.
     * @event hostChange
     * @type {object}
     * @property {number} userID - ID of the new host
     */
    //Using hostChange to use for multiple cases
    if (bonkAPI.events.hasEvent["hostChange"]) {
        var sendObj = { userID: jsonargs[1] };
        bonkAPI.events.fireEvent("hostChange", sendObj);
    }

    return args;
};

/**
 * Triggered when a player sends an input.
 * @function receive_Inputs
 * @fires gameInputs
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_Inputs = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    /*
     * Maybe we could have different event names like
     * "receiveRawInput" and "receiveInput" which send
     * different data, the second could have booleans
     * representing the inputs, the other is binary
     */
    /**
     * When inputs are received from other players.
     * @event gameInputs
     * @type {object}
     * @property {number} userID - ID of the player who inputted
     * @property {number} rawInput - Input of the player in the form of 6 bits
     * @property {number} frame - Frame when input happened
     * @property {number} sequence - The total amount of inputs by that player
     */
    if (bonkAPI.events.hasEvent["gameInputs"]) {
        var sendObj = {
            userID: jsonargs[1],
            rawInput: jsonargs[2]["i"],
            frame: jsonargs[2]["f"],
            sequence: jsonargs[2]["c"],
        };
        bonkAPI.events.fireEvent("gameInputs", sendObj);
    } //example
    /*if(bonkAPI.bonkAPI.events.hasEvent["receiveRawInput"]) {
        obj here
        bonkAPI.bonkAPI.events.fireEvent("receiveRawInput", sendObj);
    }
    */

    return args;
};

bonkAPI.receive_ReadyChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_GameEnd = function (args) {
    //  TODO: Finish implement of function

    return args;
};

//! Detects when match starts!!!
/**
 * Triggered when the game starts.
 * @function receive_GameStart
 * @fires gameStart
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_GameStart = function (args) {
    // *Dont need to send args if it doesnt have usefull information
    /**
     * When game has started
     * @event gameStart
     * @type {object}
     * @property {string} extraData - Packet sent with the start of the game, contains data
     */
    if (bonkAPI.events.hasEvent["gameStart"]) {
        var sendObj = { extraData: args };
        bonkAPI.events.fireEvent("gameStart", sendObj);
    }

    return args;
};

bonkAPI.receive_Error = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when a player changes team.
 * @function receive_TeamChange
 * @fires teamChange
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_TeamChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.playerList[parseInt(jsonargs[1])].team = jsonargs[2];

    /**
     * When a player has changed teams.
     * @event teamChange
     * @type {object}
     * @property {number} userID - Player who changed teams
     * @property {number} team - The new team, represented from 0 to 5
     */
    if (bonkAPI.events.hasEvent["teamChange"]) {
        var sendObj = { userID: jsonargs[1], team: jsonargs[2] };
        bonkAPI.events.fireEvent("teamChange", sendObj);
    }

    return args;
};

bonkAPI.receive_TeamLockToggle = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when received a message.
 * @function receive_ChatMessage
 * @fires chatIn
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_ChatMessage = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    let chatUserID = jsonargs[1];
    let chatMessage = jsonargs[2];

    /**
     * When the user has received a message.
     * @event chatIn
     * @type {object}
     * @property {number} userID - Player who chatted
     * @property {string} message - The message received
     */
    if (bonkAPI.events.hasEvent["chatIn"]) {
        var sendObj = { userID: chatUserID, message: chatMessage };
        bonkAPI.events.fireEvent("chatIn", sendObj);
    }

    return args;
};

bonkAPI.receive_InitialData = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_PlayerKick = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when the mode changes.
 * @function receive_ModeChange
 * @fires modeChange
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_ModeChange = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    // *Maybe change raw arguement to full mode name or numbers
    /**
     * When the mode has changed.
     * @event modeChange
     * @type {object}
     * @property {string} mode - Short string representing the new mode
     */
    if (bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: jsonargs[1] };
        bonkAPI.events.fireEvent("modeChange", sendObj);
    }

    return args;
};

bonkAPI.receive_RoundsChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when map has changed.
 * @function receive_MapSwitch
 * @fires mapSwitch
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    // *Using mapSwitch to stick with other bonkAPI.events using "change"
    /**
     * When the map has changed.
     * @event mapSwitch
     * @type {object}
     * @property {string} mapData - String with the data of the map
     */
    if (bonkAPI.events.hasEvent["mapSwitch"]) {
        var sendObj = { mapData: jsonargs[1] };
        bonkAPI.events.fireEvent("mapSwitch", sendObj);
    }

    return args;
};

bonkAPI.receive_Inactive = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_MapSuggest = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_MapSuggestClient = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_PlayerBalance = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_ReplaySave = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when there is a new host.
 * @function receive_NewHost
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_NewHost = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    bonkAPI.hostID = jsonargs[1]["newHost"];

    // TODO: NO EVENT HERE YET
    /* Leaving out for now since i dont know what this packet contains
    if(bonkAPI.bonkAPI.events.hasEvent["hostChange"]) {
        bonkAPI.bonkAPI.events.fireEvent("hostChange", jsonargs[1]["newHost"]);
    }*/

    return args;
};

/**
 * Triggered when the user receives a friend request.
 * @function receive_FriendReq
 * @fires receivedFriend
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_FriendRequest = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    /**
     * When the the user has been friended.
     * @event receivedFriend
     * @type {object}
     * @property {number} userID - ID of the player who friended you
     */
    if (bonkAPI.events.hasEvent["receivedFriend"]) {
        var sendObj = { userID: jsonargs[1] };
        bonkAPI.events.fireEvent("receivedFriend", sendObj);
    }

    return args;
};

bonkAPI.receive_CountdownStart = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_CountdownAbort = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_PlayerLevelUp = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_LocalGainXP = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_RoomShareLink = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_Tabbed = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_RoomName = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.receive_RoomPassword = function (args) {
    //  TODO: Finish implement of function

    return args;
};
// #endregion

// #region //!------------------Send Handler Functions------------------
/**
 * Called when sending inputs out.
 * @function send_SendInputs
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.send_SendInputs = function (args) {
    var jsonargs = JSON.parse(args.substring(2));

    /**
     * When inputs are received from other players.
     * @event gameInputs
     * @type {object}
     * @property {number} userID - ID of the player who inputted
     * @property {number} rawInput - Input of the player in the form of 6 bits
     * @property {number} frame - Frame when input happened
     * @property {number} sequence - The total amount of inputs by that player
     */
    if (bonkAPI.events.hasEvent["gameInputs"]) {
        var sendObj = {
            userID: bonkAPI.myID,
            rawInput: jsonargs[1]["i"],
            frame: jsonargs[1]["f"],
            sequence: jsonargs[1]["c"],
        };
        bonkAPI.events.fireEvent("gameInputs", sendObj);
    }

    return args;
};

/**
 * Called when started the game.
 * @function send_TriggerStart
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.send_TriggerStart = function (args) {
    var jsonargs = JSON.parse(args.substring(2));

    //args = "42" + JSON.stringify(jsonargs);
    return args;
};

bonkAPI.send_TeamChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_TeamLock = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_KickBanPlayer = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_ChatMsg = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_LobbyInform = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Called when created a room.
 * @function send_CreateRoom
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
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

/**
 * Called as to send inital user data when joining a room.
 * @function send_RoomJoin
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.send_RoomJoin = function (args) {
    let jsonargs = JSON.parse(args.substring(2));

    //! DONT KNOW WHAT TO DO FOR NAMING
    //! Possibly get rid of XMLhttp thing since this gives the login token
    /**
     * When inputs are received from other players.
     * @event sendJoin
     * @type {object}
     * @property {string} password - Room password
     * @property {object} avatar - User's avatar
     * @property {string} token - Login token
     * @property {string} packet - Editable packet
     */
    if (bonkAPI.events.hasEvent["sendJoin"]) {
        var sendObj = {
            //password: jsonargs[1]["roomPassword"],
            //avatar: JSON.parse(jsonargs[1]["avatar"]),
            //token: jsonargs[1]["token"] ? jsonargs[1]["token"] : null,
            packet: args,
        };
        bonkAPI.events.fireEvent("sendJoin", sendObj);
    }

    return args;
};

bonkAPI.send_LobbyReturn = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_Ready = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_AllReadyReset = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_MapReorder = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_ModeChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_RoundsChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_MapDelete = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Called when user changes map.
 * @function send_MapSwitch
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.send_MapSwitch = function (args) {
    //console.log("Map Changed");
    var jsonargs = JSON.parse(args.substring(2));
    //var jsonargs = JSON.parse(args.data.substring(2));

    // *Using mapSwitch to stick with other bonkAPI.events using "change"
    /**
     * When the map has changed.
     * @event mapSwitch
     * @type {object}
     * @property {string} mapData - String with the data of the map
     */
    if (bonkAPI.events.hasEvent["mapSwitch"]) {
        var sendObj = { mapData: jsonargs[1]["m"] };
        bonkAPI.events.fireEvent("mapSwitch", sendObj);
    }
    return args;
};

bonkAPI.send_OtherTeamChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_MapSuggest = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_Balance = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_TeamSetting = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_ArmRecord = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_HostChange = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_Friended = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_CountdownStart = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_CountdownAbort = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_RequestXP = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_MapVote = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_InformInGame = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_GetPreVote = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_Tabbed = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_NoHostSwap = function (args) {
    //  TODO: Finish implement of function

    return args;
};
// #endregion

// #region //!------------------Load Complete Detection------------------
bonkAPI.onLoaded = () => {
    console.log("Document loaded complete");

    bonkAPI.LZString = window.LZString;
    bonkAPI.PSON = window.dcodeIO.PSON;
    bonkAPI.bytebuffer = window.dcodeIO.ByteBuffer;
    bonkAPI.ISpsonpair = new window.dcodeIO.PSON.StaticPair([
        "physics",
        "shapes",
        "fixtures",
        "bodies",
        "bro",
        "joints",
        "ppm",
        "lights",
        "spawns",
        "lasers",
        "capZones",
        "type",
        "w",
        "h",
        "c",
        "a",
        "v",
        "l",
        "s",
        "sh",
        "fr",
        "re",
        "de",
        "sn",
        "fc",
        "fm",
        "f",
        "d",
        "n",
        "bg",
        "lv",
        "av",
        "ld",
        "ad",
        "fr",
        "bu",
        "cf",
        "rv",
        "p",
        "d",
        "bf",
        "ba",
        "bb",
        "aa",
        "ab",
        "axa",
        "dr",
        "em",
        "mmt",
        "mms",
        "ms",
        "ut",
        "lt",
        "New body",
        "Box Shape",
        "Circle Shape",
        "Polygon Shape",
        "EdgeChain Shape",
        "priority",
        "Light",
        "Laser",
        "Cap Zone",
        "BG Shape",
        "Background Layer",
        "Rotate Joint",
        "Slider Joint",
        "Rod Joint",
        "Gear Joint",
        65535,
        16777215,
    ]);

    // !Map Decoder
    bonkAPI.textdecoder = new window.TextDecoder();
    bonkAPI.textencoder = new window.TextEncoder();

    class bonkAPI_bytebuffer {
        constructor() {
            var g1d = [arguments];
            this.index = 0;
            this.buffer = new ArrayBuffer(100 * 1024);
            this.view = new DataView(this.buffer);
            this.implicitClassAliasArray = [];
            this.implicitStringArray = [];
            this.bodgeCaptureZoneDataIdentifierArray = [];
        }
        readByte() {
            var N0H = [arguments];
            N0H[4] = this.view.getUint8(this.index);
            this.index += 1;
            return N0H[4];
        }
        writeByte(z0w) {
            var v8$ = [arguments];
            this.view.setUint8(this.index, v8$[0][0]);
            this.index += 1;
        }
        readInt() {
            var A71 = [arguments];
            A71[6] = this.view.getInt32(this.index);
            this.index += 4;
            return A71[6];
        }
        writeInt(W6i) {
            var p5u = [arguments];
            this.view.setInt32(this.index, p5u[0][0]);
            this.index += 4;
        }
        readShort() {
            var R1R = [arguments];
            R1R[9] = this.view.getInt16(this.index);
            this.index += 2;
            return R1R[9];
        }
        writeShort(H8B) {
            var d_3 = [arguments];
            this.view.setInt16(this.index, d_3[0][0]);
            this.index += 2;
        }
        readUint() {
            var W2$ = [arguments];
            W2$[8] = this.view.getUint32(this.index);
            this.index += 4;
            return W2$[8];
        }
        writeUint(B2X) {
            var f8B = [arguments];
            this.view.setUint32(this.index, f8B[0][0]);
            this.index += 4;
        }
        readBoolean() {
            var h6P = [arguments];
            h6P[6] = this.readByte();
            return h6P[6] == 1;
        }
        writeBoolean(Y3I) {
            var l79 = [arguments];
            if (l79[0][0]) {
                this.writeByte(1);
            } else {
                this.writeByte(0);
            }
        }
        readDouble() {
            var V60 = [arguments];
            V60[4] = this.view.getFloat64(this.index);
            this.index += 8;
            return V60[4];
        }
        writeDouble(z4Z) {
            var O41 = [arguments];
            this.view.setFloat64(this.index, O41[0][0]);
            this.index += 8;
        }
        readFloat() {
            var I0l = [arguments];
            I0l[5] = this.view.getFloat32(this.index);
            this.index += 4;
            return I0l[5];
        }
        writeFloat(y4B) {
            var B0v = [arguments];
            this.view.setFloat32(this.index, B0v[0][0]);
            this.index += 4;
        }
        readUTF() {
            var d6I = [arguments];
            d6I[8] = this.readByte();
            d6I[7] = this.readByte();
            d6I[9] = d6I[8] * 256 + d6I[7];
            d6I[1] = new Uint8Array(d6I[9]);
            for (d6I[6] = 0; d6I[6] < d6I[9]; d6I[6]++) {
                d6I[1][d6I[6]] = this.readByte();
            }
            return bonkAPI.textdecoder.decode(d6I[1]);
        }
        writeUTF(L3Z) {
            var Z75 = [arguments];
            Z75[4] = bonkAPI.textencoder.encode(Z75[0][0]);
            Z75[3] = Z75[4].length;
            Z75[5] = Math.floor(Z75[3] / 256);
            Z75[8] = Z75[3] % 256;
            this.writeByte(Z75[5]);
            this.writeByte(Z75[8]);
            Z75[7] = this;
            Z75[4].forEach(I_O);
            function I_O(s0Q, H4K, j$o) {
                var N0o = [arguments];
                Z75[7].writeByte(N0o[0][0]);
            }
        }
        toBase64() {
            var P4$ = [arguments];
            P4$[4] = "";
            P4$[9] = new Uint8Array(this.buffer);
            P4$[8] = this.index;
            for (P4$[7] = 0; P4$[7] < P4$[8]; P4$[7]++) {
                P4$[4] += String.fromCharCode(P4$[9][P4$[7]]);
            }
            return window.btoa(P4$[4]);
        }
        fromBase64(W69, A8Q) {
            var o0n = [arguments];
            o0n[8] = window.pako;
            o0n[6] = window.atob(o0n[0][0]);
            o0n[9] = o0n[6].length;
            o0n[4] = new Uint8Array(o0n[9]);
            for (o0n[1] = 0; o0n[1] < o0n[9]; o0n[1]++) {
                o0n[4][o0n[1]] = o0n[6].charCodeAt(o0n[1]);
            }
            if (o0n[0][1] === true) {
                o0n[5] = o0n[8].inflate(o0n[4]);
                o0n[4] = o0n[5];
            }
            this.buffer = o0n[4].buffer.slice(o0n[4].byteOffset, o0n[4].byteLength + o0n[4].byteOffset);
            this.view = new DataView(this.buffer);
            this.index = 0;
        }
    }

    bonkAPI.ISdecode = function (rawdata) {
        rawdata_caseflipped = "";
        for (i = 0; i < rawdata.length; i++) {
            if (i <= 100 && rawdata.charAt(i) === rawdata.charAt(i).toLowerCase()) {
                rawdata_caseflipped += rawdata.charAt(i).toUpperCase();
            } else if (i <= 100 && rawdata.charAt(i) === rawdata.charAt(i).toUpperCase()) {
                rawdata_caseflipped += rawdata.charAt(i).toLowerCase();
            } else {
                rawdata_caseflipped += rawdata.charAt(i);
            }
        }

        data_deLZd = bonkAPI.LZString.decompressFromEncodedURIComponent(rawdata_caseflipped);
        databuffer = bonkAPI.bytebuffer.fromBase64(data_deLZd);
        data = bonkAPI.ISpsonpair.decode(databuffer.buffer);
        return data;
    };

    bonkAPI.ISencode = function (obj) {
        data = bonkAPI.ISpsonpair.encode(obj);
        b64 = data.toBase64();
        lzd = bonkAPI.LZString.compressToEncodedURIComponent(b64);

        caseflipped = "";
        for (i = 0; i < lzd.length; i++) {
            if (i <= 100 && lzd.charAt(i) === lzd.charAt(i).toLowerCase()) {
                caseflipped += lzd.charAt(i).toUpperCase();
            } else if (i <= 100 && lzd.charAt(i) === lzd.charAt(i).toUpperCase()) {
                caseflipped += lzd.charAt(i).toLowerCase();
            } else {
                caseflipped += lzd.charAt(i);
            }
        }

        return caseflipped;
    };

    bonkAPI.decodeIS = function (x) {
        return bonkAPI.ISdecode(x);
    };
    bonkAPI.encodeIS = function (x) {
        return bonkAPI.ISencode(x);
    };

    bonkAPI.encodeMap = function (W2A) {
        var M3n = [arguments];
        M3n[1] = new bonkAPI_bytebuffer();
        M3n[9] = M3n[0][0].physics;
        M3n[0][0].v = 15;
        M3n[1].writeShort(M3n[0][0].v);
        M3n[1].writeBoolean(M3n[0][0].s.re);
        M3n[1].writeBoolean(M3n[0][0].s.nc);
        M3n[1].writeShort(M3n[0][0].s.pq);
        M3n[1].writeFloat(M3n[0][0].s.gd);
        M3n[1].writeBoolean(M3n[0][0].s.fl);
        M3n[1].writeUTF(M3n[0][0].m.rxn);
        M3n[1].writeUTF(M3n[0][0].m.rxa);
        M3n[1].writeUint(M3n[0][0].m.rxid);
        M3n[1].writeShort(M3n[0][0].m.rxdb);
        M3n[1].writeUTF(M3n[0][0].m.n);
        M3n[1].writeUTF(M3n[0][0].m.a);
        M3n[1].writeUint(M3n[0][0].m.vu);
        M3n[1].writeUint(M3n[0][0].m.vd);
        M3n[1].writeShort(M3n[0][0].m.cr.length);
        for (M3n[84] = 0; M3n[84] < M3n[0][0].m.cr.length; M3n[84]++) {
            M3n[1].writeUTF(M3n[0][0].m.cr[M3n[84]]);
        }
        M3n[1].writeUTF(M3n[0][0].m.mo);
        M3n[1].writeInt(M3n[0][0].m.dbid);
        M3n[1].writeBoolean(M3n[0][0].m.pub);
        M3n[1].writeInt(M3n[0][0].m.dbv);
        M3n[1].writeShort(M3n[9].ppm);
        M3n[1].writeShort(M3n[9].bro.length);
        for (M3n[17] = 0; M3n[17] < M3n[9].bro.length; M3n[17]++) {
            M3n[1].writeShort(M3n[9].bro[M3n[17]]);
        }
        M3n[1].writeShort(M3n[9].shapes.length);
        for (M3n[80] = 0; M3n[80] < M3n[9].shapes.length; M3n[80]++) {
            M3n[2] = M3n[9].shapes[M3n[80]];
            if (M3n[2].type == "bx") {
                M3n[1].writeShort(1);
                M3n[1].writeDouble(M3n[2].w);
                M3n[1].writeDouble(M3n[2].h);
                M3n[1].writeDouble(M3n[2].c[0]);
                M3n[1].writeDouble(M3n[2].c[1]);
                M3n[1].writeDouble(M3n[2].a);
                M3n[1].writeBoolean(M3n[2].sk);
            }
            if (M3n[2].type == "ci") {
                M3n[1].writeShort(2);
                M3n[1].writeDouble(M3n[2].r);
                M3n[1].writeDouble(M3n[2].c[0]);
                M3n[1].writeDouble(M3n[2].c[1]);
                M3n[1].writeBoolean(M3n[2].sk);
            }
            if (M3n[2].type == "po") {
                M3n[1].writeShort(3);
                M3n[1].writeDouble(M3n[2].s);
                M3n[1].writeDouble(M3n[2].a);
                M3n[1].writeDouble(M3n[2].c[0]);
                M3n[1].writeDouble(M3n[2].c[1]);
                M3n[1].writeShort(M3n[2].v.length);
                for (M3n[61] = 0; M3n[61] < M3n[2].v.length; M3n[61]++) {
                    M3n[1].writeDouble(M3n[2].v[M3n[61]][0]);
                    M3n[1].writeDouble(M3n[2].v[M3n[61]][1]);
                }
            }
        }
        M3n[1].writeShort(M3n[9].fixtures.length);
        for (M3n[20] = 0; M3n[20] < M3n[9].fixtures.length; M3n[20]++) {
            M3n[7] = M3n[9].fixtures[M3n[20]];
            M3n[1].writeShort(M3n[7].sh);
            M3n[1].writeUTF(M3n[7].n);
            if (M3n[7].fr === null) {
                M3n[1].writeDouble(Number.MAX_VALUE);
            } else {
                M3n[1].writeDouble(M3n[7].fr);
            }
            if (M3n[7].fp === null) {
                M3n[1].writeShort(0);
            }
            if (M3n[7].fp === false) {
                M3n[1].writeShort(1);
            }
            if (M3n[7].fp === true) {
                M3n[1].writeShort(2);
            }
            if (M3n[7].re === null) {
                M3n[1].writeDouble(Number.MAX_VALUE);
            } else {
                M3n[1].writeDouble(M3n[7].re);
            }
            if (M3n[7].de === null) {
                M3n[1].writeDouble(Number.MAX_VALUE);
            } else {
                M3n[1].writeDouble(M3n[7].de);
            }
            M3n[1].writeUint(M3n[7].f);
            M3n[1].writeBoolean(M3n[7].d);
            M3n[1].writeBoolean(M3n[7].np);
            M3n[1].writeBoolean(M3n[7].ng);
            M3n[1].writeBoolean(M3n[7].ig);
        }
        M3n[1].writeShort(M3n[9].bodies.length);
        for (M3n[37] = 0; M3n[37] < M3n[9].bodies.length; M3n[37]++) {
            M3n[4] = M3n[9].bodies[M3n[37]];
            M3n[1].writeUTF(M3n[4].type);
            M3n[1].writeUTF(M3n[4].n);
            M3n[1].writeDouble(M3n[4].p[0]);
            M3n[1].writeDouble(M3n[4].p[1]);
            M3n[1].writeDouble(M3n[4].a);
            M3n[1].writeDouble(M3n[4].fric);
            M3n[1].writeBoolean(M3n[4].fricp);
            M3n[1].writeDouble(M3n[4].re);
            M3n[1].writeDouble(M3n[4].de);
            M3n[1].writeDouble(M3n[4].lv[0]);
            M3n[1].writeDouble(M3n[4].lv[1]);
            M3n[1].writeDouble(M3n[4].av);
            M3n[1].writeDouble(M3n[4].ld);
            M3n[1].writeDouble(M3n[4].ad);
            M3n[1].writeBoolean(M3n[4].fr);
            M3n[1].writeBoolean(M3n[4].bu);
            M3n[1].writeDouble(M3n[4].cf.x);
            M3n[1].writeDouble(M3n[4].cf.y);
            M3n[1].writeDouble(M3n[4].cf.ct);
            M3n[1].writeBoolean(M3n[4].cf.w);
            M3n[1].writeShort(M3n[4].f_c);
            M3n[1].writeBoolean(M3n[4].f_1);
            M3n[1].writeBoolean(M3n[4].f_2);
            M3n[1].writeBoolean(M3n[4].f_3);
            M3n[1].writeBoolean(M3n[4].f_4);
            M3n[1].writeBoolean(M3n[4].f_p);
            M3n[1].writeBoolean(M3n[4].fz.on);
            if (M3n[4].fz.on) {
                M3n[1].writeDouble(M3n[4].fz.x);
                M3n[1].writeDouble(M3n[4].fz.y);
                M3n[1].writeBoolean(M3n[4].fz.d);
                M3n[1].writeBoolean(M3n[4].fz.p);
                M3n[1].writeBoolean(M3n[4].fz.a);
                M3n[1].writeShort(M3n[4].fz.t);
                +M3n[1].writeDouble(M3n[4].fz.cf);
            }
            M3n[1].writeShort(M3n[4].fx.length);
            for (M3n[28] = 0; M3n[28] < M3n[4].fx.length; M3n[28]++) {
                M3n[1].writeShort(M3n[4].fx[M3n[28]]);
            }
        }
        M3n[1].writeShort(M3n[0][0].spawns.length);
        for (M3n[30] = 0; M3n[30] < M3n[0][0].spawns.length; M3n[30]++) {
            M3n[6] = M3n[0][0].spawns[M3n[30]];
            M3n[1].writeDouble(M3n[6].x);
            M3n[1].writeDouble(M3n[6].y);
            M3n[1].writeDouble(M3n[6].xv);
            M3n[1].writeDouble(M3n[6].yv);
            M3n[1].writeShort(M3n[6].priority);
            M3n[1].writeBoolean(M3n[6].r);
            M3n[1].writeBoolean(M3n[6].f);
            M3n[1].writeBoolean(M3n[6].b);
            M3n[1].writeBoolean(M3n[6].gr);
            M3n[1].writeBoolean(M3n[6].ye);
            M3n[1].writeUTF(M3n[6].n);
        }
        M3n[1].writeShort(M3n[0][0].capZones.length);
        for (M3n[74] = 0; M3n[74] < M3n[0][0].capZones.length; M3n[74]++) {
            M3n[3] = M3n[0][0].capZones[M3n[74]];
            M3n[1].writeUTF(M3n[3].n);
            M3n[1].writeDouble(M3n[3].l);
            M3n[1].writeShort(M3n[3].i);
            M3n[1].writeShort(M3n[3].ty);
        }
        M3n[1].writeShort(M3n[9].joints.length);
        for (M3n[89] = 0; M3n[89] < M3n[9].joints.length; M3n[89]++) {
            M3n[5] = M3n[9].joints[M3n[89]];
            if (M3n[5].type == "rv") {
                M3n[1].writeShort(1);
                M3n[1].writeDouble(M3n[5].d.la);
                M3n[1].writeDouble(M3n[5].d.ua);
                M3n[1].writeDouble(M3n[5].d.mmt);
                M3n[1].writeDouble(M3n[5].d.ms);
                M3n[1].writeBoolean(M3n[5].d.el);
                M3n[1].writeBoolean(M3n[5].d.em);
                M3n[1].writeDouble(M3n[5].aa[0]);
                M3n[1].writeDouble(M3n[5].aa[1]);
            }
            if (M3n[5].type == "d") {
                M3n[1].writeShort(2);
                M3n[1].writeDouble(M3n[5].d.fh);
                M3n[1].writeDouble(M3n[5].d.dr);
                M3n[1].writeDouble(M3n[5].aa[0]);
                M3n[1].writeDouble(M3n[5].aa[1]);
                M3n[1].writeDouble(M3n[5].ab[0]);
                M3n[1].writeDouble(M3n[5].ab[1]);
            }
            if (M3n[5].type == "lpj") {
                M3n[1].writeShort(3);
                M3n[1].writeDouble(M3n[5].pax);
                M3n[1].writeDouble(M3n[5].pay);
                M3n[1].writeDouble(M3n[5].pa);
                M3n[1].writeDouble(M3n[5].pf);
                M3n[1].writeDouble(M3n[5].pl);
                M3n[1].writeDouble(M3n[5].pu);
                M3n[1].writeDouble(M3n[5].plen);
                M3n[1].writeDouble(M3n[5].pms);
            }
            if (M3n[5].type == "lsj") {
                M3n[1].writeShort(4);
                M3n[1].writeDouble(M3n[5].sax);
                M3n[1].writeDouble(M3n[5].say);
                M3n[1].writeDouble(M3n[5].sf);
                M3n[1].writeDouble(M3n[5].slen);
            }
            M3n[1].writeShort(M3n[5].ba);
            M3n[1].writeShort(M3n[5].bb);
            M3n[1].writeBoolean(M3n[5].d.cc);
            M3n[1].writeDouble(M3n[5].d.bf);
            M3n[1].writeBoolean(M3n[5].d.dl);
        }
        M3n[32] = M3n[1].toBase64();
        M3n[77] = bonkAPI.LZString.compressToEncodedURIComponent(M3n[32]);
        return M3n[77];
    };

    bonkAPI.decodeMap = function (map) {
        var F5W = [arguments];
        var b64mapdata = bonkAPI.LZString.decompressFromEncodedURIComponent(map);
        var binaryReader = new bonkAPI_bytebuffer();
        binaryReader.fromBase64(b64mapdata, false);
        map = {
            v: 1,
            s: { re: false, nc: false, pq: 1, gd: 25, fl: false },
            physics: { shapes: [], fixtures: [], bodies: [], bro: [], joints: [], ppm: 12 },
            spawns: [],
            capZones: [],
            m: {
                a: "noauthor",
                n: "noname",
                dbv: 2,
                dbid: -1,
                authid: -1,
                date: "",
                rxid: 0,
                rxn: "",
                rxa: "",
                rxdb: 1,
                cr: [],
                pub: false,
                mo: "",
            },
        };
        map.physics = map.physics;
        map.v = binaryReader.readShort();
        if (map.v > 15) {
            throw new Error("Future map version, please refresh page");
        }
        map.s.re = binaryReader.readBoolean();
        map.s.nc = binaryReader.readBoolean();
        if (map.v >= 3) {
            map.s.pq = binaryReader.readShort();
        }
        if (map.v >= 4 && map.v <= 12) {
            map.s.gd = binaryReader.readShort();
        } else if (map.v >= 13) {
            map.s.gd = binaryReader.readFloat();
        }
        if (map.v >= 9) {
            map.s.fl = binaryReader.readBoolean();
        }
        map.m.rxn = binaryReader.readUTF();
        map.m.rxa = binaryReader.readUTF();
        map.m.rxid = binaryReader.readUint();
        map.m.rxdb = binaryReader.readShort();
        map.m.n = binaryReader.readUTF();
        map.m.a = binaryReader.readUTF();
        if (map.v >= 10) {
            map.m.vu = binaryReader.readUint();
            map.m.vd = binaryReader.readUint();
        }
        if (map.v >= 4) {
            F5W[7] = binaryReader.readShort();
            for (F5W[83] = 0; F5W[83] < F5W[7]; F5W[83]++) {
                map.m.cr.push(binaryReader.readUTF());
            }
        }
        if (map.v >= 5) {
            map.m.mo = binaryReader.readUTF();
            map.m.dbid = binaryReader.readInt();
        }
        if (map.v >= 7) {
            map.m.pub = binaryReader.readBoolean();
        }
        if (map.v >= 8) {
            map.m.dbv = binaryReader.readInt();
        }
        map.physics.ppm = binaryReader.readShort();
        F5W[4] = binaryReader.readShort();
        for (F5W[15] = 0; F5W[15] < F5W[4]; F5W[15]++) {
            map.physics.bro[F5W[15]] = binaryReader.readShort();
        }
        F5W[6] = binaryReader.readShort();
        for (F5W[28] = 0; F5W[28] < F5W[6]; F5W[28]++) {
            F5W[5] = binaryReader.readShort();
            if (F5W[5] == 1) {
                map.physics.shapes[F5W[28]] = { type: "bx", w: 10, h: 40, c: [0, 0], a: 0.0, sk: false };
                map.physics.shapes[F5W[28]].w = binaryReader.readDouble();
                map.physics.shapes[F5W[28]].h = binaryReader.readDouble();
                map.physics.shapes[F5W[28]].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                map.physics.shapes[F5W[28]].a = binaryReader.readDouble();
                map.physics.shapes[F5W[28]].sk = binaryReader.readBoolean();
            }
            if (F5W[5] == 2) {
                map.physics.shapes[F5W[28]] = { type: "ci", r: 25, c: [0, 0], sk: false };
                map.physics.shapes[F5W[28]].r = binaryReader.readDouble();
                map.physics.shapes[F5W[28]].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                map.physics.shapes[F5W[28]].sk = binaryReader.readBoolean();
            }
            if (F5W[5] == 3) {
                map.physics.shapes[F5W[28]] = { type: "po", v: [], s: 1, a: 0, c: [0, 0] };
                map.physics.shapes[F5W[28]].s = binaryReader.readDouble();
                map.physics.shapes[F5W[28]].a = binaryReader.readDouble();
                map.physics.shapes[F5W[28]].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                F5W[74] = binaryReader.readShort();
                map.physics.shapes[F5W[28]].v = [];
                for (F5W[27] = 0; F5W[27] < F5W[74]; F5W[27]++) {
                    map.physics.shapes[F5W[28]].v.push([
                        binaryReader.readDouble(),
                        binaryReader.readDouble(),
                    ]);
                }
            }
        }
        F5W[71] = binaryReader.readShort();
        for (F5W[17] = 0; F5W[17] < F5W[71]; F5W[17]++) {
            map.physics.fixtures[F5W[17]] = {
                sh: 0,
                n: "Def Fix",
                fr: 0.3,
                fp: null,
                re: 0.8,
                de: 0.3,
                f: 0x4f7cac,
                d: false,
                np: false,
                ng: false,
            };
            map.physics.fixtures[F5W[17]].sh = binaryReader.readShort();
            map.physics.fixtures[F5W[17]].n = binaryReader.readUTF();
            map.physics.fixtures[F5W[17]].fr = binaryReader.readDouble();
            if (map.physics.fixtures[F5W[17]].fr == Number.MAX_VALUE) {
                map.physics.fixtures[F5W[17]].fr = null;
            }
            F5W[12] = binaryReader.readShort();
            if (F5W[12] == 0) {
                map.physics.fixtures[F5W[17]].fp = null;
            }
            if (F5W[12] == 1) {
                map.physics.fixtures[F5W[17]].fp = false;
            }
            if (F5W[12] == 2) {
                map.physics.fixtures[F5W[17]].fp = true;
            }
            map.physics.fixtures[F5W[17]].re = binaryReader.readDouble();
            if (map.physics.fixtures[F5W[17]].re == Number.MAX_VALUE) {
                map.physics.fixtures[F5W[17]].re = null;
            }
            map.physics.fixtures[F5W[17]].de = binaryReader.readDouble();
            if (map.physics.fixtures[F5W[17]].de == Number.MAX_VALUE) {
                map.physics.fixtures[F5W[17]].de = null;
            }
            map.physics.fixtures[F5W[17]].f = binaryReader.readUint();
            map.physics.fixtures[F5W[17]].d = binaryReader.readBoolean();
            map.physics.fixtures[F5W[17]].np = binaryReader.readBoolean();
            if (map.v >= 11) {
                map.physics.fixtures[F5W[17]].ng = binaryReader.readBoolean();
            }
            if (map.v >= 12) {
                map.physics.fixtures[F5W[17]].ig = binaryReader.readBoolean();
            }
        }
        F5W[63] = binaryReader.readShort();
        for (F5W[52] = 0; F5W[52] < F5W[63]; F5W[52]++) {
            map.physics.bodies[F5W[52]] = {
                type: "s",
                n: "Unnamed",
                p: [0, 0],
                a: 0,
                fric: 0.3,
                fricp: false,
                re: 0.8,
                de: 0.3,
                lv: [0, 0],
                av: 0,
                ld: 0,
                ad: 0,
                fr: false,
                bu: false,
                cf: { x: 0, y: 0, w: true, ct: 0 },
                fx: [],
                f_c: 1,
                f_p: true,
                f_1: true,
                f_2: true,
                f_3: true,
                f_4: true,
                fz: { on: false, x: 0, y: 0, d: true, p: true, a: true, t: 0, cf: 0 },
            };
            map.physics.bodies[F5W[52]].type = binaryReader.readUTF();
            map.physics.bodies[F5W[52]].n = binaryReader.readUTF();
            map.physics.bodies[F5W[52]].p = [binaryReader.readDouble(), binaryReader.readDouble()];
            map.physics.bodies[F5W[52]].a = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].fric = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].fricp = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].re = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].de = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].lv = [binaryReader.readDouble(), binaryReader.readDouble()];
            map.physics.bodies[F5W[52]].av = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].ld = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].ad = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].fr = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].bu = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].cf.x = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].cf.y = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].cf.ct = binaryReader.readDouble();
            map.physics.bodies[F5W[52]].cf.w = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].f_c = binaryReader.readShort();
            map.physics.bodies[F5W[52]].f_1 = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].f_2 = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].f_3 = binaryReader.readBoolean();
            map.physics.bodies[F5W[52]].f_4 = binaryReader.readBoolean();
            if (map.v >= 2) {
                map.physics.bodies[F5W[52]].f_p = binaryReader.readBoolean();
            }
            if (map.v >= 14) {
                map.physics.bodies[F5W[52]].fz.on = binaryReader.readBoolean();
                if (map.physics.bodies[F5W[52]].fz.on) {
                    map.physics.bodies[F5W[52]].fz.x = binaryReader.readDouble();
                    map.physics.bodies[F5W[52]].fz.y = binaryReader.readDouble();
                    map.physics.bodies[F5W[52]].fz.d = binaryReader.readBoolean();
                    map.physics.bodies[F5W[52]].fz.p = binaryReader.readBoolean();
                    map.physics.bodies[F5W[52]].fz.a = binaryReader.readBoolean();
                    if (map.v >= 15) {
                        map.physics.bodies[F5W[52]].t = binaryReader.readShort();
                        map.physics.bodies[F5W[52]].cf = binaryReader.readDouble();
                    }
                }
            }
            F5W[88] = binaryReader.readShort();
            for (F5W[65] = 0; F5W[65] < F5W[88]; F5W[65]++) {
                map.physics.bodies[F5W[52]].fx.push(binaryReader.readShort());
            }
        }
        F5W[97] = binaryReader.readShort();
        for (F5W[41] = 0; F5W[41] < F5W[97]; F5W[41]++) {
            map.spawns[F5W[41]] = {
                x: 400,
                y: 300,
                xv: 0,
                yv: 0,
                priority: 5,
                r: true,
                f: true,
                b: true,
                gr: false,
                ye: false,
                n: "Spawn",
            };
            F5W[35] = map.spawns[F5W[41]];
            F5W[35].x = binaryReader.readDouble();
            F5W[35].y = binaryReader.readDouble();
            F5W[35].xv = binaryReader.readDouble();
            F5W[35].yv = binaryReader.readDouble();
            F5W[35].priority = binaryReader.readShort();
            F5W[35].r = binaryReader.readBoolean();
            F5W[35].f = binaryReader.readBoolean();
            F5W[35].b = binaryReader.readBoolean();
            F5W[35].gr = binaryReader.readBoolean();
            F5W[35].ye = binaryReader.readBoolean();
            F5W[35].n = binaryReader.readUTF();
        }
        F5W[16] = binaryReader.readShort();
        for (F5W[25] = 0; F5W[25] < F5W[16]; F5W[25]++) {
            map.capZones[F5W[25]] = { n: "Cap Zone", ty: 1, l: 10, i: -1 };
            map.capZones[F5W[25]].n = binaryReader.readUTF();
            map.capZones[F5W[25]].l = binaryReader.readDouble();
            map.capZones[F5W[25]].i = binaryReader.readShort();
            if (map.v >= 6) {
                map.capZones[F5W[25]].ty = binaryReader.readShort();
            }
        }
        F5W[98] = binaryReader.readShort();
        for (F5W[19] = 0; F5W[19] < F5W[98]; F5W[19]++) {
            F5W[31] = binaryReader.readShort();
            if (F5W[31] == 1) {
                map.physics.joints[F5W[19]] = {
                    type: "rv",
                    d: { la: 0, ua: 0, mmt: 0, ms: 0, el: false, em: false, cc: false, bf: 0, dl: true },
                    aa: [0, 0],
                };
                F5W[20] = map.physics.joints[F5W[19]];
                F5W[20].d.la = binaryReader.readDouble();
                F5W[20].d.ua = binaryReader.readDouble();
                F5W[20].d.mmt = binaryReader.readDouble();
                F5W[20].d.ms = binaryReader.readDouble();
                F5W[20].d.el = binaryReader.readBoolean();
                F5W[20].d.em = binaryReader.readBoolean();
                F5W[20].aa = [binaryReader.readDouble(), binaryReader.readDouble()];
            }
            if (F5W[31] == 2) {
                map.physics.joints[F5W[19]] = {
                    type: "d",
                    d: { fh: 0, dr: 0, cc: false, bf: 0, dl: true },
                    aa: [0, 0],
                    ab: [0, 0],
                };
                F5W[87] = map.physics.joints[F5W[19]];
                F5W[87].d.fh = binaryReader.readDouble();
                F5W[87].d.dr = binaryReader.readDouble();
                F5W[87].aa = [binaryReader.readDouble(), binaryReader.readDouble()];
                F5W[87].ab = [binaryReader.readDouble(), binaryReader.readDouble()];
            }
            if (F5W[31] == 3) {
                map.physics.joints[F5W[19]] = {
                    type: "lpj",
                    d: { cc: false, bf: 0, dl: true },
                    pax: 0,
                    pay: 0,
                    pa: 0,
                    pf: 0,
                    pl: 0,
                    pu: 0,
                    plen: 0,
                    pms: 0,
                };
                F5W[90] = map.physics.joints[F5W[19]];
                F5W[90].pax = binaryReader.readDouble();
                F5W[90].pay = binaryReader.readDouble();
                F5W[90].pa = binaryReader.readDouble();
                F5W[90].pf = binaryReader.readDouble();
                F5W[90].pl = binaryReader.readDouble();
                F5W[90].pu = binaryReader.readDouble();
                F5W[90].plen = binaryReader.readDouble();
                F5W[90].pms = binaryReader.readDouble();
            }
            if (F5W[31] == 4) {
                map.physics.joints[F5W[19]] = {
                    type: "lsj",
                    d: { cc: false, bf: 0, dl: true },
                    sax: 0,
                    say: 0,
                    sf: 0,
                    slen: 0,
                };
                F5W[44] = map.physics.joints[F5W[19]];
                F5W[44].sax = binaryReader.readDouble();
                F5W[44].say = binaryReader.readDouble();
                F5W[44].sf = binaryReader.readDouble();
                F5W[44].slen = binaryReader.readDouble();
            }
            map.physics.joints[F5W[19]].ba = binaryReader.readShort();
            map.physics.joints[F5W[19]].bb = binaryReader.readShort();
            map.physics.joints[F5W[19]].d.cc = binaryReader.readBoolean();
            map.physics.joints[F5W[19]].d.bf = binaryReader.readDouble();
            map.physics.joints[F5W[19]].d.dl = binaryReader.readBoolean();
        }
        return map;
    };
};

bonkAPI.checkDocumentReady = () => {
    if (document.readyState === "complete") {
        // Document is already fully loaded, call onLoaded directly
        bonkAPI.onLoaded();
    } else {
        // Document is not yet fully loaded, wait for it to complete
        document.addEventListener("readystatechange", function () {
            if (document.readyState === "complete") {
                bonkAPI.onLoaded();
            }
        });
    }
};

// Call the function to check document readiness
bonkAPI.checkDocumentReady();
// #endregion

// #region //!------------------Public API Functions------------------
/**
 * Sends message in game's public chat.
 * @function chat
 * @param {string} message - The message.
 */
bonkAPI.chat = function (message) {
    bonkAPI.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
};

/**
 * Defaults to banning the player with the given ID.
 * @function banPlayerByID
 * @param {number} id - ID of the player to be kicked/banned
 * @param {boolean} kick - Whether player should be kicked or banned, defaults to false (banned)
 */
bonkAPI.banPlayerByID = function (id, kick = false) {
    bonkAPI.sendPacket('42[9,{"banshortid":' + id + ',"kickonly":' + kick + "}]");
};

/**
 * Gets all online friends.
 * @function getOnlineFriendList
 * @param {function} callback - Callback function
 * @returns {Array.<Friend>} Array of {@linkcode Friend} objects
 */
bonkAPI.getOnlineFriendList = function (callback) {
    let req = new window.XMLHttpRequest();
    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            let friends = [];
            let data = JSON.parse(req.response)["friends"];
            for (let i = 0; i < data.length; i++) {
                let rid = data[i]["roomid"];
                if (rid != null) {
                    friends.push({ userName: data[i]["name"], roomID: rid });
                }
            }
            callback(friends);
        }
    };
    try {
        req.open("POST", "https://bonk2.io/scripts/friends.php");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        //! maybe make a function to automatically build this stuff, but not necessary and probably worse
        req.send("token=" + bonkAPI.myToken + "&task=getfriends");
    } catch (e) {
        console.log(e);
        callback([]);
    }
};

/**
 * Adds a listener to {@linkcode EventHandler} to call the method.
 * @function addEventListener
 * @param {string} event - The event that is listened for
 * @param {function(object)} method - Method that is called when event is fired
 * @param {*} [scope] - Defaults to window
 * @param {*} [context] - Defaults to nothing
 */
bonkAPI.addEventListener = function (event, method, scope, context) {
    bonkAPI.events.addEventListener(event, method, scope, context);
};

/**
 * Returns the entire list of {@linkcode Player} objects in the lobby at time this
 * function was called.
 * @function getPlayerList
 * @returns {Array.<Player>} Array of {@linkcode Player} objects
 */
bonkAPI.getPlayerList = function () {
    // *Returns a copy of bonkAPI.playerList
    return Object.assign([], bonkAPI.playerList);
};

/**
 * Returns the amount of players that have been in the lobby.
 * @function getPlayerListLength
 * @returns {number} Length of the player list
 */
bonkAPI.getPlayerListLength = function () {
    return bonkAPI.playerList.length;
};

/**
 * Returns the {@linkcode Player} object of the ID or name given.
 * @function getPlayer
 * @param {*} ref - Either ID of the player or name of the player
 * @returns {Player} Player object
 */
bonkAPI.getPlayer = function (ref) {
    if (typeof ref === "number") {
        if (ref < 0 || ref >= bonkAPI.playerList.length) {
            return null;
        }
        return Object.assign({}, bonkAPI.playerList[ref]);
    } else if (typeof ref === "string") {
        for (let i = 0; i < bonkAPI.playerList.length; i++) {
            if (bonkAPI.playerList[i] != null && ref == bonkAPI.playerList[i].userName) {
                return Object.assign({}, bonkAPI.playerList[i]);
            }
        }
        return null;
    } else {
        return null;
    }
};

/**
 * Returns the {@linkcode Player} object of the ID given.
 * @function getPlayerByID
 * @param {number} id - ID of the player that is being looked for
 * @returns {Player} Player object
 */
bonkAPI.getPlayerByID = function (id) {
    if (id < 0 || id >= bonkAPI.playerList.length) {
        return null;
    }
    return Object.assign({}, bonkAPI.playerList[id]);
};

/**
 * Returns the {@linkcode Player} object of the name given.
 * @function getPlayerByName
 * @param {string} name - Name of the player that is being looked for
 * @returns {Player} Player object
 */
bonkAPI.getPlayerByName = function (name) {
    for (let i = 0; i < bonkAPI.playerList.length; i++) {
        if (bonkAPI.playerList[i] != null && name == bonkAPI.playerList[i].userName) {
            return Object.assign({}, bonkAPI.playerList[i]);
        }
    }
    return null;
};

/**
 * Returns the name of the player of the ID given.
 * @function getPlayerNameByID
 * @param id - ID of the player to get the name of
 * @returns {string} Name of player
 */
bonkAPI.getPlayerNameByID = function (id) {
    if (id < 0 || id >= bonkAPI.playerList.length) {
        return "";
    }
    return bonkAPI.playerList[id].userName;
};

/**
 * Returns the user ID of the player with the given name.
 * @function getPlayerIDByName
 * @param {string} name - Name of player to get ID of
 * @returns {number} ID of player
 */
bonkAPI.getPlayerIDByName = function (name) {
    for (let i = 0; i < bonkAPI.playerList.length; i++) {
        if (bonkAPI.playerList[i] != null && name == bonkAPI.playerList[i].userName) {
            return i;
        }
    }
    return -1;
};

/**
 * Returns a list of {@linkcode Player} objects that are in the specified
 * team.
 * @function getPlayersByTeam
 * @param {number} team - Team of the player, from 0 to 5
 * @returns {Array.<Player>} List of {@linkcode Player} objects
 */
bonkAPI.getPlayersByTeam = function (team) {
    var teamList = [];
    for (let i = 0; i < bonkAPI.playerList.length; i++) {
        if (team == bonkAPI.playerList[i].team) {
            teamList.push({ userID: i, userData: bonkAPI.playerList[i] });
        }
    }
    return teamList;
};

/**
 * Returns your own player ID.
 * @function getMyID
 * @returns {number} ID of the user
 */
bonkAPI.getMyID = function () {
    return bonkAPI.myID;
};

/**
 * Returns the player ID of the host.
 * @function getHostID
 * @returns {number} ID of the host
 */
bonkAPI.getHostID = function () {
    return bonkAPI.hostID;
};
// #endregion

//! ------------------BonkHUD------------------
window.bonkHUD = {};

bonkHUD.windowHold = [];

//! not used but will be
// *Style Store
bonkHUD.styleHold = {};

//! styles added do not include color, to be added/changed by user
//! some innercss using these classes still has not been deleted(will do it)
bonkHUD.bonkHUDCSS = document.createElement("style");

bonkHUD.bonkHUDCSS.innerHTML = `
.bonkhud-settings-row {
    border-bottom: 1px solid;
    padding: 10px;
}
.bonkhud-settings-label {
    font-size: 0.9rem;
    font-weight: bold;
}
.bonkhud-window-container {
    position: fixed;
    min-width: 5rem;
    font-family: "futurept_b1";
    border-radius: 8px;
    z-index: 9990;
}
.bonkhud-header-button {
    position: absolute;
    top: 3px;
    width: 25px;
    height: 25px;
    border-radius: 3px;
}
`;
document.getElementsByTagName("head")[0].appendChild(bonkHUD.bonkHUDCSS);

bonkHUD.initialize = function () {
    //bonkHUD.stylesheet = document.createElement("style");
    let settingsMenu = document.createElement("div");
    settingsMenu.id = "bonkhud-settings";
    settingsMenu.classList.add("bonkhud-background-color");
    settingsMenu.classList.add("windowShadow");
    settingsMenu.style.position = "absolute";
    settingsMenu.style.top = "0";
    settingsMenu.style.left = "0";
    settingsMenu.style.right = "0";
    settingsMenu.style.bottom = "0";
    settingsMenu.style.width = "60%"; //bonkHUD.pxTorem(450) + "rem";
    settingsMenu.style.height = "75%"; //bonkHUD.pxTorem(385) + "rem";
    settingsMenu.style.fontFamily = "futurept_b1";
    settingsMenu.style.margin = "auto";
    settingsMenu.style.borderRadius = "8px";
    //settingsMenu.style.outline = "3000px solid rgba(0,0,0,0.30)";
    settingsMenu.style.pointerEvents = "auto";
    settingsMenu.style.zIndex = "9992";
    settingsMenu.style.visibility = "hidden";

    // Create the header
    let header = document.createElement("div");
    header.classList.add("newbonklobby_boxtop");
    header.classList.add("newbonklobby_boxtop_classic");
    header.classList.add("bonkhud-header-color");

    // Create the title span
    let title = document.createElement("span");
    title.classList.add("bonkhud-title-color");
    title.textContent = "BonkHUD Settings";
    title.style.flexGrow = "1";
    title.style.textAlign = "center";

    let closeButton = document.createElement("div");
    closeButton.classList.add("bonkhud-header-button");
    closeButton.classList.add("bonkhud-title-color");
    closeButton.innerText = "_"; // Use an appropriate icon or text
    closeButton.style.lineHeight = "9px";
    closeButton.style.right = "3px";
    closeButton.style.cursor = "pointer";

    let containerContainer = document.createElement("div");
    containerContainer.classList.add("bonkhud-text-color");
    containerContainer.style.overflowX = "hidden";
    containerContainer.style.overflowY = "hidden";
    containerContainer.style.display = "flex";
    containerContainer.style.width = "100%";
    containerContainer.style.height = "calc(100% - 32px)"; // Adjusted height for header

    let windowSettingsContainer = document.createElement("div");
    windowSettingsContainer.id = "bonkhud-window-settings-container";
    windowSettingsContainer.classList.add("bonkhud-border-color");
    windowSettingsContainer.style.overflowY = "auto";
    windowSettingsContainer.style.flexGrow = "1.5";
    //windowSettingsContainer.style.minWidth = "30%";
    windowSettingsContainer.style.height = "100%";
    windowSettingsContainer.style.borderRight = "1px solid";

    let settingsContainer = document.createElement("div");
    settingsContainer.id = "bonkhud-settings-container";
    settingsContainer.style.overflowY = "auto";
    settingsContainer.style.flexGrow = "3";
    settingsContainer.style.float = "right";
    settingsContainer.style.height = "100%";

    let mainSettingsDiv = document.createElement("div");
    mainSettingsDiv.classList.add("bonkhud-border-color");
    mainSettingsDiv.classList.add("bonkhud-settings-row");

    let mainSettingsHeading = document.createElement("div");
    mainSettingsHeading.classList.add("bonkhud-text-color");
    mainSettingsHeading.textContent = "General Settings";
    mainSettingsHeading.style.marginBottom = "5px";
    mainSettingsHeading.style.fontSize = "1.2rem";

    let styleResetDiv = document.createElement("div");
    styleResetDiv.style.marginTop = "5px";

    let styleResetLabel = document.createElement("label");
    styleResetLabel.classList.add("bonkhud-text-color");
    styleResetLabel.classList.add("bonkhud-settings-label");
    styleResetLabel.style.marginRight = "5px";
    styleResetLabel.innerText = "Reset Style";

    let styleResetButton = bonkHUD.generateButton("Reset");
    styleResetButton.style.paddingLeft = "5px";
    styleResetButton.style.paddingRight = "5px";
    styleResetButton.style.display = "inline-block";

    let styleExportDiv = document.createElement("div");
    styleExportDiv.style.marginTop = "5px";

    let styleExportLabel = document.createElement("label");
    styleExportLabel.classList.add("bonkhud-text-color");
    styleExportLabel.classList.add("bonkhud-settings-label");
    styleExportLabel.style.marginRight = "5px";
    styleExportLabel.innerText = "Export Style";

    let styleExportButton = bonkHUD.generateButton("Export");
    styleExportButton.style.paddingLeft = "5px";
    styleExportButton.style.paddingRight = "5px";
    styleExportButton.style.display = "inline-block";

    let styleImportDiv = document.createElement("div");
    styleImportDiv.style.marginTop = "5px";

    let styleImportLabel = document.createElement("label");
    styleImportLabel.classList.add("bonkhud-text-color");
    styleImportLabel.classList.add("bonkhud-settings-label");
    styleImportLabel.style.marginRight = "5px";
    styleImportLabel.innerText = "Import Style";

    let styleImportButton = bonkHUD.generateButton("Import");
    styleImportButton.style.paddingLeft = "5px";
    styleImportButton.style.paddingRight = "5px";
    styleImportButton.style.display = "inline-block";

    let styleImportInput = document.createElement("input");
    styleImportInput.setAttribute("type", "file");
    styleImportInput.setAttribute("accept", ".style");
    styleImportInput.setAttribute("onChange", "bonkHUD.importStyleSettings(event)");
    styleImportInput.style.display = "none";

    let styleSettingsDiv = document.createElement("div");
    styleSettingsDiv.classList.add("bonkhud-border-color");
    styleSettingsDiv.classList.add("bonkhud-settings-row");

    let styleSettingsHeading = document.createElement("div");
    styleSettingsHeading.classList.add("bonkhud-text-color");
    styleSettingsHeading.style.fontSize = "1.2rem";
    styleSettingsHeading.style.marginBottom = "5px";
    styleSettingsHeading.textContent = "Style Settings";

    // Append children of style settings to rows
    styleResetDiv.appendChild(styleResetLabel);
    styleResetDiv.appendChild(styleResetButton);
    styleExportDiv.appendChild(styleExportLabel);
    styleExportDiv.appendChild(styleExportButton);
    styleImportDiv.appendChild(styleImportLabel);
    styleImportDiv.appendChild(styleImportButton);
    styleImportDiv.appendChild(styleImportInput);

    styleSettingsDiv.appendChild(styleSettingsHeading);
    styleSettingsDiv.appendChild(styleResetDiv);
    styleSettingsDiv.appendChild(styleExportDiv);
    styleSettingsDiv.appendChild(styleImportDiv);

    for (let prop in bonkHUD.styleHold) {
        let colorDiv = document.createElement("div");
        colorDiv.style.marginTop = "5px";

        let colorLabel = document.createElement("label");
        colorLabel.classList.add("bonkhud-text-color");
        colorLabel.classList.add("bonkhud-settings-label");
        colorLabel.style.marginRight = "10px";
        colorLabel.innerText = bonkHUD.styleHold[prop].class;

        let colorEdit = document.createElement("input");
        colorEdit.setAttribute("type", "color");
        colorEdit.value = bonkHUD.styleHold[prop].color;
        colorEdit.style.display = "inline-block";

        colorDiv.appendChild(colorLabel);
        colorDiv.appendChild(colorEdit);

        styleSettingsDiv.appendChild(colorDiv);
        colorEdit.addEventListener("change", (e) => {
            bonkHUD.styleHold[prop].color = e.target.value;
            bonkHUD.saveStyleSettings();
            bonkHUD.updateStyleSettings();
        });
    }

    //Create element in top bar
    let topBarOption = document.createElement("div");
    topBarOption.style.width = "58px";
    topBarOption.style.height = "34px";
    topBarOption.style.backgroundRepeat = "no-repeat";
    topBarOption.style.backgroundPosition = "center";
    topBarOption.style.position = "absolute";
    topBarOption.style.right = "290px";
    topBarOption.style.top = "0";
    topBarOption.style.visibility = "visible";
    topBarOption.style.borderBottom = "2px solid transparent";
    topBarOption.style.lineHeight = "34px";
    topBarOption.style.textAlign = "center";
    topBarOption.style.fontFamily = "futurept_b1";
    topBarOption.style.color = "#ffffff";
    topBarOption.classList.add("niceborderleft");
    topBarOption.classList.add("pretty_top_button");

    let topBarIcon = document.createElement("span");
    topBarIcon.innerText = "HUD";

    // Append Header
    header.appendChild(title);
    header.appendChild(closeButton);

    // Append children of general settings to rows
    //? not appending mainSettingsDiv since there is nothing to put in it yet
    //mainSettingsDiv.appendChild(mainSettingsHeading);

    // Append general setting rows to general settings container
    //settingsContainer.appendChild(mainSettingsDiv);
    settingsContainer.appendChild(styleSettingsDiv);

    // Append everything to main container (HUD window)
    containerContainer.appendChild(windowSettingsContainer);
    containerContainer.appendChild(settingsContainer);

    settingsMenu.appendChild(header);
    settingsMenu.appendChild(containerContainer);
    topBarOption.appendChild(topBarIcon);

    document.getElementById("prettymenu").appendChild(settingsMenu);
    //Place it before help button
    document.getElementById("pretty_top_bar").appendChild(topBarOption);

    // Make menu to control opacity + visibility visible
    closeButton.addEventListener("click", (e) => {
        settingsMenu.style.visibility = "hidden";
    });
    topBarOption.addEventListener("click", (e) => {
        if (settingsMenu.style.visibility == "hidden") {
            settingsMenu.style.visibility = "visible";
        } else {
            settingsMenu.style.visibility = "hidden";
        }
    });
    styleResetButton.addEventListener("click", (e) => {
        bonkHUD.resetStyleSettings();
        bonkHUD.updateStyleSettings();
    });
    styleExportButton.addEventListener("click", (e) => {
        bonkHUD.updateStyleSettings();
        bonkHUD.exportStyleSettings();
    });
    styleImportButton.addEventListener("click", (e) => {
        styleImportInput.click();
    });
};

bonkHUD.createWindowControl = function (name, ind) {
    // Create container for the opacity controls with initial styles
    let sliderRow = document.createElement("div");
    sliderRow.classList.add("bonkhud-settings-row");
    sliderRow.classList.add("bonkhud-border-color");

    // Add a title to the slider row for visual clarity
    let sliderTitle = document.createElement("div");
    sliderTitle.textContent = name;
    sliderTitle.style.marginBottom = "5px";
    sliderTitle.style.fontSize = "1.2rem"; // Text size for readability
    sliderTitle.style.fontWeight = "bold"; // Make the title text bold
    sliderRow.appendChild(sliderTitle); // Insert the title into the slider container

    let holdLeft = document.createElement("div");
    holdLeft.style.display = "flex";
    holdLeft.style.alignContent = "center";

    // Create a label for the opacity slider for accessibility
    let opacityLabel = document.createElement("label");
    opacityLabel.classList.add("bonkhud-settings-label");
    opacityLabel.textContent = "Opacity";
    holdLeft.appendChild(opacityLabel); // Add the label to the slider container

    // Create the opacity slider input, configuring its range and appearance
    let opacitySlider = document.createElement("input");
    opacitySlider.type = "range"; // Slider type for range selection
    opacitySlider.min = "0.1"; // Minimum opacity value
    opacitySlider.max = "1"; // Maximum opacity value (fully opaque)
    opacitySlider.step = "0.05"; // Incremental steps for opacity adjustment
    opacitySlider.value = bonkHUD.windowHold[ind].opacity; // Default value set to fully opaque
    opacitySlider.style.minWidth = "20px";
    opacitySlider.style.flexGrow = "1"; // Width adjusted for the label
    opacitySlider.oninput = function () {
        let control = document.getElementById(bonkHUD.windowHold[ind].id + "-drag"); // Update the UI opacity in real-time;
        control.style.opacity = this.value;
        bonkHUD.windowHold[ind].opacity = control.style.opacity;
        bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
    };
    holdLeft.appendChild(opacitySlider); // Place the slider into the slider container

    let holdRight = document.createElement("div");
    let visibilityLabel = document.createElement("label");
    visibilityLabel.classList.add("bonkhud-settings-label");
    visibilityLabel.textContent = "Visible";
    visibilityLabel.style.marginRight = "5px"; // Space between label and slider
    visibilityLabel.style.display = "inline-block"; // Allows margin-top adjustment
    visibilityLabel.style.verticalAlign = "middle";
    holdRight.appendChild(visibilityLabel);

    let visiblityCheck = document.createElement("input");
    visiblityCheck.id = bonkHUD.windowHold[ind].id + "-visibility-check";
    visiblityCheck.type = "checkbox"; // Slider type for range selection
    if (bonkHUD.windowHold[ind].visibility == "visible") {
        visiblityCheck.checked = true;
    } else {
        visiblityCheck.checked = false;
    }
    visiblityCheck.style.display = "inline-block"; // Allows margin-top adjustment
    visiblityCheck.style.verticalAlign = "middle";
    visiblityCheck.oninput = function () {
        let control = document.getElementById(bonkHUD.windowHold[ind].id + "-drag"); // Update the UI opacity in real-time;
        control.style.visibility = this.checked ? "visible" : "hidden";
        bonkHUD.windowHold[ind].visibility = control.style.visibility;
        bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
    };
    holdRight.appendChild(visiblityCheck); // Place the slider into the slider container

    let windowResetButton = bonkHUD.generateButton("Reset");
    windowResetButton.style.paddingLeft = "5px";
    windowResetButton.style.paddingRight = "5px";
    windowResetButton.style.display = "inline-block";
    windowResetButton.addEventListener("click", (e) => {
        bonkHUD.resetUISetting(bonkHUD.windowHold[ind].id);
        bonkHUD.loadUISetting(bonkHUD.windowHold[ind].id);
    });

    sliderRow.appendChild(holdLeft);
    sliderRow.appendChild(holdRight);
    sliderRow.appendChild(windowResetButton);

    return sliderRow; // Return the fully constructed slider row element
};

bonkHUD.createWindow = function (name, id, bodyHTML, minHeight) {
    let ind = bonkHUD.getWindowIndexByID(id);
    if (ind == -1) {
        bonkHUD.windowHold.push(bonkHUD.getUISetting(id));
        ind = bonkHUD.windowHold.length - 1;
    }

    // Create the main container 'dragItem'
    let dragItem = document.createElement("div");
    dragItem.classList.add("bonkhud-window-container");
    dragItem.classList.add("bonkhud-background-color");
    dragItem.classList.add("windowShadow");
    dragItem.id = id + "-drag";
    dragItem.style.overflowX = "hidden";
    dragItem.style.overflowY = "auto";
    dragItem.style.bottom = bonkHUD.windowHold[ind].bottom; //top ? top : "0";
    dragItem.style.right = bonkHUD.windowHold[ind].right; //left ? left : "0";
    dragItem.style.width = bonkHUD.windowHold[ind].width; //width ? width : "172";
    dragItem.style.height = bonkHUD.windowHold[ind].height; //height ? height : minHeight;
    //dragItem.style.minHeight = minHeight; // Minimum height to prevent deformation
    dragItem.style.visibility = bonkHUD.windowHold[ind].visibility;
    dragItem.style.opacity = bonkHUD.windowHold[ind].opacity;

    // Create the header
    let header = document.createElement("div");
    header.classList.add("bonkhud-drag-header");
    header.classList.add("newbonklobby_boxtop");
    header.classList.add("newbonklobby_boxtop_classic");
    header.classList.add("bonkhud-header-color");

    // Create the title span
    let title = document.createElement("span");
    title.classList.add("bonkhud-drag-header");
    title.classList.add("bonkhud-title-color");
    title.textContent = name;
    title.style.flexGrow = "1";
    title.style.textAlign = "center";

    // Create the resize button
    let resizeButton = document.createElement("div");
    resizeButton.classList.add("bonkhud-header-button");
    resizeButton.classList.add("bonkhud-title-color");
    resizeButton.classList.add("bonkhud-resize");
    resizeButton.innerText = ":::"; // Use an appropriate icon or text
    resizeButton.style.lineHeight = "22px";
    resizeButton.style.textIndent = "5px";
    resizeButton.style.cursor = "nwse-resize";

    let closeButton = document.createElement("div");
    closeButton.classList.add("bonkhud-header-button");
    closeButton.classList.add("bonkhud-title-color");
    closeButton.innerText = "_"; // Use an appropriate icon or text
    closeButton.style.lineHeight = "9px";
    closeButton.style.right = "3px";
    closeButton.style.cursor = "pointer";

    // Append the title and resize button to the header
    header.appendChild(title);
    header.appendChild(resizeButton);
    header.appendChild(closeButton);

    // Append the header to the dragItem
    dragItem.appendChild(header);

    // Create the key table
    bodyHTML.id = id;
    bodyHTML.classList.add("bonkhud-text-color");
    bodyHTML.style.padding = "5px";
    bodyHTML.style.width = "calc(100% - 10px)";
    bodyHTML.style.height = "calc(100% - 42px)"; // Adjusted height for header

    // Append the keyTable to the dragItem
    dragItem.appendChild(bodyHTML);

    // Append the opacity control to the dragItem
    let opacityControl = bonkHUD.createWindowControl(name, ind);
    document.getElementById("bonkhud-window-settings-container").appendChild(opacityControl);

    // Append the dragItem to the body of the page
    document.body.appendChild(dragItem);

    closeButton.addEventListener("click", (e) => {
        dragItem.style.visibility = "hidden";
        let visCheck = document.getElementById(id + "-visibility-check");
        visCheck.checked = false;
        bonkHUD.windowHold[ind].visibility = dragItem.style.visibility;
        bonkHUD.saveUISetting(id);
    });

    // Add event listeners for dragging
    dragItem.addEventListener("mousedown", (e) => bonkHUD.dragStart(e, dragItem));

    // Add event listeners for resizing
    resizeButton.addEventListener("mousedown", (e) => bonkHUD.startResizing(e, dragItem));

    bonkHUD.updateStyleSettings(); //! probably slow but it works, its not like someone will have 100's of windows
};

bonkHUD.saveUISetting = function (id) {
    let ind = bonkHUD.getWindowIndexByID(id);
    let save_id = "bonkHUD_Setting_" + id;
    localStorage.setItem(save_id, JSON.stringify(bonkHUD.windowHold[ind]));
};

bonkHUD.getUISetting = function (id) {
    let save_id = "bonkHUD_Setting_" + id;
    let setting = JSON.parse(localStorage.getItem(save_id));
    if (!setting) {
        setting = {
            id: id,
            width: "154px",
            height: "100px",
            bottom: "0rem",
            right: "0rem",
            opacity: "1",
            visibility: "visible",
        };
    }
    return setting;
};

bonkHUD.loadUISetting = function (id) {
    let windowElement = document.getElementById(id + "-drag");
    if (windowElement) {
        Object.assign(windowElement.style, bonkHUD.getUISetting(id));
    } else {
        console.log(
            `bonkHUD.loadUISetting: Window element not found for id: ${id}. Please ensure the window has been created.`
        );
    }
};

bonkHUD.resetUISetting = function (id) {
    let windowElement = document.getElementById(id + "-drag");
    if (windowElement) {
        let save_id = "bonkHUD_Setting_" + id;
        localStorage.removeItem(save_id);
        Object.assign(windowElement.style, bonkHUD.getUISetting(id));
    } else {
        console.log(
            `bonkHUD.resetUISetting: Window element not found for id: ${id}. Please ensure the window has been created.`
        );
    }
};

bonkHUD.saveStyleSettings = function () {
    localStorage.setItem("bonkHUD_Style_Settings", JSON.stringify(bonkHUD.styleHold));
};

bonkHUD.exportStyleSettings = function () {
    let out = JSON.stringify(bonkHUD.styleHold);
    let save = new File([out], "bonkHUDStyle-" + Date.now() + ".style", { type: "text/plain" });

    let url = URL.createObjectURL(save);
    let link = document.createElement("a");
    link.href = url;
    link.download = save.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

bonkHUD.importStyleSettings = function (event) {
    if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
        return;
    }
    let fileReader = new FileReader();
    fileReader.addEventListener(
        "load",
        (e) => {
            //! No error handling for incorrect file, only protection is that it is in .style file
            console.log(e.target.result);
            bonkHUD.loadStyleSettings(JSON.parse(e.target.result));
            bonkHUD.updateStyleSettings();
            bonkHUD.saveStyleSettings();
        },
        false
    );
    //let file = event.target.files[0];
    fileReader.readAsText(event.target.files[0]);
};

bonkHUD.loadStyleSettings = function (settings) {
    if (!settings) {
        settings = JSON.parse(localStorage.getItem("bonkHUD_Style_Settings"));
    }
    if (settings) {
        bonkHUD.styleHold = {};
        for (let prop in settings) {
            bonkHUD.styleHold[prop] = settings[prop];
        }
    } else {
        bonkHUD.resetStyleSettings();
    }
};

bonkHUD.resetStyleSettings = function () {
    localStorage.removeItem("bonkHUD_Style_Settings");
    //Add bonkhud to key for class name
    bonkHUD.styleHold = {
        backgroundColor: { class: "bonkhud-background-color", css: "background-color", color: "#cfd8cd" },
        borderColor: { class: "bonkhud-border-color", css: "border-color", color: "#b4b8ae" },
        headerColor: { class: "bonkhud-header-color", css: "background-color", color: "#009688" },
        titleColor: { class: "bonkhud-title-color", css: "color", color: "#ffffff" },
        textColor: { class: "bonkhud-text-color", css: "color", color: "#000000" },
        buttonColor: { class: "bonkhud-button-color", css: "background-color", color: "#bcc4bb" },
        buttonColorHover: { class: "bonkhud-button-color", css: "background-color", color: "#acb9ad" },
    };
};

bonkHUD.updateStyleSettings = function () {
    for (let prop in bonkHUD.styleHold) {
        if (prop == "buttonColorHover") continue;
        else if (prop == "headerColor") {
            elements = document.getElementsByClassName(bonkHUD.styleHold[prop].class);
            for (let j = 0; j < elements.length; j++) {
                elements[j].style.setProperty(
                    bonkHUD.styleHold[prop].css,
                    bonkHUD.styleHold[prop].color,
                    "important"
                );
            }
            continue;
        } else {
            elements = document.getElementsByClassName(bonkHUD.styleHold[prop].class);
            for (let j = 0; j < elements.length; j++) {
                elements[j].style.setProperty(bonkHUD.styleHold[prop].css, bonkHUD.styleHold[prop].color);
            }
        }
    }
};

bonkHUD.dragStart = function (e, dragItem) {
    bonkHUD.focusWindow(dragItem);
    // Prevents dragging from starting on the opacity slider
    if (
        e.target.classList.contains("bonkhud-drag-header") &&
        !e.target.classList.contains("bonkhud-resize")
    ) {
        let startX = e.clientX;
        let startY = e.clientY;
        let startRight = parseInt(window.getComputedStyle(dragItem).right, 10);
        let startBottom = parseInt(window.getComputedStyle(dragItem).bottom, 10);
        const boundDragMove = bonkHUD.dragMove.bind(null, startX, startY, startRight, startBottom, dragItem);
        document.addEventListener("mousemove", boundDragMove);
        document.addEventListener("mouseup", () => bonkHUD.dragEnd(boundDragMove, dragItem), { once: true });
    }
};

bonkHUD.dragMove = function (startX, startY, startRight, startBottom, dragItem, e) {
    let w = parseFloat(window.getComputedStyle(dragItem).width) / 2;
    let h = parseFloat(window.getComputedStyle(dragItem).height) / 2;
    let moveX = bonkHUD.clamp(startRight + startX - e.clientX, -w, window.innerWidth - w);
    let moveY = bonkHUD.clamp(startBottom + startY - e.clientY, -h, window.innerHeight - h * 2 + 15);
    dragItem.style.right = bonkHUD.pxTorem(moveX) + "rem";
    dragItem.style.bottom = bonkHUD.pxTorem(moveY) + "rem";
};

bonkHUD.dragEnd = function (dragMoveFn, dragItem) {
    document.removeEventListener("mousemove", dragMoveFn);
    let ind = bonkHUD.getWindowIndexByID(dragItem.id.substring(0, dragItem.id.length - 5));
    bonkHUD.windowHold[ind].width = dragItem.style.width;
    bonkHUD.windowHold[ind].height = dragItem.style.height;
    bonkHUD.windowHold[ind].bottom = dragItem.style.bottom;
    bonkHUD.windowHold[ind].right = dragItem.style.right;
    bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
};

// Function to start resizing the UI
bonkHUD.startResizing = function (e, dragItem) {
    e.stopPropagation(); // Prevent triggering dragStart for dragItem

    let startX = e.clientX;
    let startY = e.clientY;
    let startWidth = parseInt(window.getComputedStyle(dragItem).width, 10);
    let startHeight = parseInt(window.getComputedStyle(dragItem).height, 10);

    function doResize(e) {
        bonkHUD.resizeMove(e, startX, startY, startWidth, startHeight, dragItem);
    }

    function stopResizing() {
        bonkHUD.resizeEnd(doResize, dragItem);
    }

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResizing, { once: true });
};

// Function to handle the resize event
bonkHUD.resizeMove = function (e, startX, startY, startWidth, startHeight, dragItem) {
    let newWidth = startWidth - (e.clientX - startX);
    let newHeight = startHeight - (e.clientY - startY);

    // Enforce minimum dimensions
    newWidth = Math.max(154, newWidth);
    newHeight = Math.max(30, newHeight);

    dragItem.style.width = bonkHUD.pxTorem(newWidth) + "rem";
    dragItem.style.height = bonkHUD.pxTorem(newHeight) + "rem";
};

// Function to stop the resize event
bonkHUD.resizeEnd = function (resizeMoveFn, dragItem) {
    document.removeEventListener("mousemove", resizeMoveFn);
    let ind = bonkHUD.getWindowIndexByID(dragItem.id.substring(0, dragItem.id.length - 5));
    bonkHUD.windowHold[ind].width = dragItem.style.width;
    bonkHUD.windowHold[ind].height = dragItem.style.height;
    bonkHUD.windowHold[ind].bottom = dragItem.style.bottom;
    bonkHUD.windowHold[ind].right = dragItem.style.right;
    bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
};

bonkHUD.focusWindow = function (focusItem) {
    let elements = document.getElementsByClassName("bonkhud-window-container");
    focusItem.style.zIndex = "9991";
    for (let i = 0; i < elements.length; i++) {
        if (focusItem.id != elements[i].id) {
            elements[i].style.zIndex = "9990";
        }
    }
};

bonkHUD.getWindowIndexByID = function (id) {
    for (let i = 0; i < bonkHUD.windowHold.length; i++) {
        if (bonkHUD.windowHold[i].id == id) {
            return i;
        }
    }
    return -1;
};

// ================HELPER METHODS=====================

bonkHUD.clamp = function (val, min, max) {
    //? supposedly faster than Math.max/min
    if (val > min) {
        if (val < max) {
            return val;
        } else {
            return max;
        }
    }
    return min;
};

bonkHUD.pxTorem = function (px) {
    return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
};

//? might make more of these for use in the main settings window
//? and so others can use these to make a unified look of bonkhud
//? windows
bonkHUD.generateButton = function (name) {
    let newButton = document.createElement("div");
    newButton.classList.add("bonkhud-button-color");
    newButton.classList.add("bonkhud-text-color");
    newButton.style.cursor = "pointer";
    newButton.style.borderRadius = "3px";
    newButton.style.textAlign = "center";
    newButton.innerText = name;

    newButton.addEventListener("mouseover", (e) => {
        e.target.style.backgroundColor = bonkHUD.styleHold.buttonColorHover.color;
    });
    newButton.addEventListener("mouseleave", (e) => {
        e.target.style.backgroundColor = bonkHUD.styleHold.buttonColor.color;
    });
    return newButton;
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    bonkHUD.loadStyleSettings();
    bonkHUD.updateStyleSettings();

    bonkHUD.initialize();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        bonkHUD.loadStyleSettings();
        bonkHUD.updateStyleSettings();

        bonkHUD.initialize();
    });
}

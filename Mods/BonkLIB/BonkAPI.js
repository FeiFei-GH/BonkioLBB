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
 * @property {JSON} avatar - Skin data
 */

/**
 * Contains data of a single friend
 *
 * @typedef {object} Friend
 * @property {string} userName - Username of friend
 * @property {string} roomID - Room ID of the lobby that the friend is in
 */

// *Global Variables
bonkAPI.currentPlayers = []; //List of user IDs of players in the lobby
bonkAPI.playerList = []; // History list of players in the room
bonkAPI.myID = -1; // Client's ID
bonkAPI.myToken = -1; // Client's token
bonkAPI.hostID = -1; // Host's ID
bonkAPI.events = new bonkAPI.EventHandler();

bonkAPI.isLoggingIn = false;

// MGF vars
bonkAPI.bonkWSS = 0;
bonkAPI.originalSend = window.WebSocket.prototype.send;
bonkAPI.originalRequestAnimationFrame = window.requestAnimationFrame;
bonkAPI.originalDrawShape = 0;
bonkAPI.pixiCtx = 0;
bonkAPI.pixiStage = 0;
bonkAPI.parentDraw = 0;
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
                if(args.data.substring(0, 3) == "42[") {
                    newArgs = JSON.parse(args.data.substring(2));
                    // !All function names follow verb_noun[verb] format
                    switch (parseInt(newArgs[0])) {
                        case 1: //*Update other players' pings
                            newArgs = bonkAPI.receive_PingUpdate(newArgs);
                            break;
                        case 2: // *UNKNOWN, received after sending create room packet
                            newArgs = bonkAPI.receive_Unknow2(newArgs);
                            break;
                        case 3: // *Room Join
                            newArgs = bonkAPI.receive_RoomJoin(newArgs);
                            break;
                        case 4: // *Player Join
                            newArgs = bonkAPI.receive_PlayerJoin(newArgs);
                            break;
                        case 5: // *Player Leave
                            newArgs = bonkAPI.receive_PlayerLeave(newArgs);
                            break;
                        case 6: // *Host Leave
                            newArgs = bonkAPI.receive_HostLeave(newArgs);
                            break;
                        case 7: // *Receive Inputs
                            newArgs = bonkAPI.receive_Inputs(newArgs);
                            break;
                        case 8: // *Ready Change
                            newArgs = bonkAPI.receive_ReadyChange(newArgs);
                            break;
                        case 13: // *Game End
                            newArgs = bonkAPI.receive_GameEnd(newArgs);
                            break;
                        case 15: // *Game Start
                            newArgs = bonkAPI.receive_GameStart(newArgs);
                            break;
                        case 16: // *Error
                            newArgs = bonkAPI.receive_Error(newArgs);
                            break;
                        case 18: // *Team Change
                            newArgs = bonkAPI.receive_TeamChange(newArgs);
                            break;
                        case 19: // *Teamlock Toggle
                            newArgs = bonkAPI.receive_TeamLockToggle(newArgs);
                            break;
                        case 20: // *Chat Message
                            newArgs = bonkAPI.receive_ChatMessage(newArgs);
                            break;
                        case 21: // *Initial Data
                            newArgs = bonkAPI.receive_InitialData(newArgs);
                            break;
                        case 24: // *Kicked
                            newArgs = bonkAPI.receive_PlayerKick(newArgs);
                            break;
                        case 26: // *Change Mode
                            newArgs = bonkAPI.receive_ModeChange(newArgs);
                            break;
                        case 27: // *Change Rounds
                            newArgs = bonkAPI.receive_RoundsChange(newArgs);
                            break;
                        case 29: // *Map Switch
                            newArgs = bonkAPI.receive_MapSwitch(newArgs);
                            break;
                        case 32: // *inactive?
                            newArgs = bonkAPI.receive_Inactive(newArgs);
                            break;
                        case 33: // *Map Suggest
                            newArgs = bonkAPI.receive_MapSuggest(newArgs);
                            break;
                        case 34: // *Map Suggest Client
                            newArgs = bonkAPI.receive_MapSuggestClient(newArgs);
                            break;
                        case 36: // *Player Balance Change
                            newArgs = bonkAPI.receive_PlayerBalance(newArgs);
                            break;
                        case 40: // *Save Replay
                            newArgs = bonkAPI.receive_ReplaySave(newArgs);
                            break;
                        case 41: // *New Host
                            newArgs = bonkAPI.receive_NewHost(newArgs);
                            break;
                        case 42: // *Friend Req
                            newArgs = bonkAPI.receive_FriendRequest(newArgs);
                            break;
                        case 43: // *Game Starting Countdown
                            newArgs = bonkAPI.receive_CountdownStart(newArgs);
                            break;
                        case 44: // *Abort Countdown
                            newArgs = bonkAPI.receive_CountdownAbort(newArgs);
                            break;
                        case 45: // *Player Leveled Up
                            newArgs = bonkAPI.receive_PlayerLevelUp(newArgs);
                            break;
                        case 46: // *Local Gained XP
                            newArgs = bonkAPI.receive_LocalXPGain(newArgs);
                            break;
                        case 48:
                            newArgs = bonkAPI.receive_gameState(newArgs);
                            break;
                        case 49: // *Created Room Share Link
                            newArgs = bonkAPI.receive_RoomShareLink(newArgs);
                            break;
                        case 52: // *Tabbed
                            newArgs = bonkAPI.receive_Tabbed(newArgs);
                            break;
                        case 58: // *Room Name Update
                            newArgs = bonkAPI.receive_RoomName(newArgs);
                            break;
                        case 59: // *Room Password Update
                            newArgs = bonkAPI.receive_RoomPassword(newArgs);
                            break;
                    }
                    args.data = 42 + JSON.stringify(newArgs);
                }
                return originalReceive.call(this, args);
            };

            var originalClose = this.onclose;
            this.onclose = function () {
                bonkAPI.bonkWSS = 0;
                return originalClose.call(this);
            };
        } else {
            // !All function names follow verb_noun[verb] format
            if(args.substring(0, 3) == "42[") {
                args = JSON.parse(args.substring(2));
                // &Sending outgoing packets
                switch (parseInt(args[0])) {
                    case 4: // *Send Inputs
                        args = bonkAPI.send_Inputs(args);
                        break;
                    case 5: // *Trigger Start
                        args = bonkAPI.send_GameStart(args);
                        break;
                    case 6: // *Change Own Team
                        args = bonkAPI.send_TeamChange(args);
                        break;
                    case 7: // *Team Lock
                        args = bonkAPI.send_TeamLock(args);
                        break;
                    case 9: // *Kick/Ban Player
                        args = bonkAPI.send_PlayerKickBan(args);
                        break;
                    case 10: // *Chat Message
                        args = bonkAPI.send_ChatMessage(args);
                        break;
                    case 11: // *Inform In Lobby
                        args = bonkAPI.send_LobbyInform(args);
                        break;
                    case 12: // *Create Room
                        args = bonkAPI.send_RoomCreate(args);
                        break;
                    case 13: // *Room Join Information
                        args = bonkAPI.send_RoomJoin(args);
                        break;
                    case 14: // *Return To Lobby
                        args = bonkAPI.send_LobbyReturn(args);
                        break;
                    case 16: // *Set Ready
                        args = bonkAPI.send_Ready(args);
                        break;
                    case 17: // *All Ready Reset
                        args = bonkAPI.send_AllReadyReset(args);
                        break;
                    case 19: // *Send Map Reorder
                        args = bonkAPI.send_MapReorder(args);
                        break;
                    case 20: // *Send Mode
                        args = bonkAPI.send_ModeChange(args);
                        break;
                    case 21: // *Send WL (Rounds)
                        args = bonkAPI.send_RoundsChange(args);
                        break;
                    case 22: // *Send Map Delete
                        args = bonkAPI.send_MapDelete(args);
                        break;
                    case 23: // *Send Map Switch
                        args = bonkAPI.send_MapSwitch(args);
                        break;
                    case 26: // *Change Other Team
                        args = bonkAPI.send_OtherTeamChange(args);
                        break;
                    case 27: // *Send Map Suggest
                        args = bonkAPI.send_MapSuggest(args);
                        break;
                    case 29: // *Send Balance
                        args = bonkAPI.send_Balance(args);
                        break;
                    case 32: // *Send Team Settings Change
                        args = bonkAPI.send_TeamSetting(args);
                        break;
                    case 33: // *Send Arm Record
                        args = bonkAPI.send_ArmRecord(args);
                        break;
                    case 34: // *Send Host Change
                        args = bonkAPI.send_HostChange(args);
                        break;
                    case 35: // *Send Friended
                        args = bonkAPI.send_Friended(args);
                        break;
                    case 36: // *Send Start Countdown
                        args = bonkAPI.send_CountdownStart(args);
                        break;
                    case 37: // *Send Abort Countdown
                        args = bonkAPI.send_CountdownAbort(args);
                        break;
                    case 38: // *Send Req XP
                        args = bonkAPI.send_XPRequest(args);
                        break;
                    case 39: // *Send Map Vote
                        args = bonkAPI.send_MapVote(args);
                        break;
                    case 40: // *Inform In Game
                        args = bonkAPI.send_InGameInform(args);
                        break;
                    case 41: // *Get Pre Vote
                        args = bonkAPI.send_PreVoteGet(args);
                        break;
                    case 44: // *Tabbed
                        args = bonkAPI.send_Tabbed(args);
                        break;
                    case 50: // *Send No Host Swap
                        args = bonkAPI.send_NoHostSwap(args);
                        break;
                }
                args = 42 + JSON.stringify(args);
            }
        }
    }

    return bonkAPI.originalSend.call(this, args);
};
// #endregion

// #region //! ------------Overriding Request Animation Frame-------------

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

// #region //!------------------Overriding HTTPRequest------------------
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
/**
 * Triggered when recieving ping updates.
 * @function receive_PingUpdate
 * @fires pingUpdate
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_PingUpdate = function (args) {
    let pingList = args[1];
    let ehcoTo = args[2];

    /**
     * When the user receives ping update.
     * @event pingUpdate
     * @type {object}
     * @property {object} pingList - Other players' ping
     * @property {number} echoTo - The ID of the player to echo to
     */
    if (bonkAPI.events.hasEvent["pingUpdate"]) {
        var sendObj = {
            pingList: pingList,
            ehcoTo: ehcoTo,
        };
        bonkAPI.events.fireEvent("pingUpdate", sendObj);
    }

    return args;
};

bonkAPI.receive_Unknow2 = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggered when the user joins a lobby.
 * @function receive_RoomJoin
 * @fires joinRoom
 * @fires playerChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_RoomJoin = function (args) {
    bonkAPI.playerList = [];
    bonkAPI.myID = args[1];
    bonkAPI.hostID = args[2];

    for (let i = 0; i < bonkAPI.currentPlayers.length; i++) {
        /**
             * When a player leaves or joins.
             * @event playerChange
             * @type {object}
             * @property {number} userID - ID of the player who joined or left
             * @property {object} userData - Data of the player who joined or left
             * @property {boolean} hasLeft - Whether the player joined or left 
             */
        if (bonkAPI.events.hasEvent["playerChange"]) {
            var sendObj = { userID: bonkAPI.currentPlayers[i], userData: bonkAPI.playerList[bonkAPI.currentPlayers[i]], hasLeft: true };
            bonkAPI.events.fireEvent("playerChange", sendObj);
        }
    }
    bonkAPI.currentPlayers = [];

    for (let i = 0; i < args[3].length; i++) {
        bonkAPI.playerList[i] = args[3][i];
        if (args[3][i] != null) {
            bonkAPI.currentPlayers.push(i);

            /**
             * When a player leaves or joins.
             * @event playerChange
             * @type {object}
             * @property {number} userID - ID of the player who joined or left
             * @property {object} userData - Data of the player who joined or left
             * @property {boolean} hasLeft - Whether the player joined or left 
             */
            if (bonkAPI.events.hasEvent["playerChange"]) {
                var sendObj = { userID: args[1], userData: bonkAPI.playerList[args[1]], hasLeft: false };
                bonkAPI.events.fireEvent("playerChange", sendObj);
            }
        }
    }
    /**
     * When the user joins a lobby.
     * @event joinRoom
     * @type {object}
     * @property {number} hostID - ID of the host
     * @property {Array.<Player>} userData - List of players currently in the room
     * @property {*} roomID - ID of the lobby joined
     * @property {string} bypass
     */
    if (bonkAPI.events.hasEvent["joinRoom"]) {
        var sendObj = {
            hostID: args[2],
            userData: bonkAPI.playerList, // !May or may not be immutable
            roomID: args[6],
            bypass: args[7],
        };
        bonkAPI.events.fireEvent("joinRoom", sendObj);
    }

    /**
     * When a player leaves or joins.
     * @event playerChange
     * @type {object}
     * @property {number} userID - ID of the player who joined or left
     * @property {object} userData - Data of the player who joined or left
     * @property {boolean} hasLeft - Whether the player joined or left 
     */
    if (bonkAPI.events.hasEvent["playerChange"]) {
        var sendObj = { userID: args[1], userData: bonkAPI.playerList[args[1]], hasLeft: false };
        bonkAPI.events.fireEvent("playerChange", sendObj);
    }

    return args;
};

/**
 * Triggered when a player joins the lobby.
 * @function receive_PlayerJoin
 * @fires userJoin
 * @fires playerChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_PlayerJoin = function (args) {
    bonkAPI.playerList[args[1]] = {
        peerId: args[2],
        userName: args[3],
        guest: args[4],
        level: args[5],
        team: args[6],
        ready: false,
        tabbed: false,
        avatar: args[7],
    };
    bonkAPI.currentPlayers.push(args[1]);

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
        var sendObj = { userID: args[1], userData: bonkAPI.playerList[args[1]] };
        bonkAPI.events.fireEvent("userJoin", sendObj);
    }

    /**
     * When a player leaves or joins.
     * @event playerChange
     * @type {object}
     * @property {number} userID - ID of the player who joined or left
     * @property {object} userData - Data of the player who joined or left
     * @property {boolean} hasLeft - Whether the player joined or left 
     */
    if (bonkAPI.events.hasEvent["playerChange"]) {
        var sendObj = { userID: args[1], userData: bonkAPI.playerList[args[1]], hasLeft: false };
        bonkAPI.events.fireEvent("playerChange", sendObj);
    }

    return args;
};

/**
 * Triggered when a player leaves the lobby.
 * @function receive_PlayerLeave
 * @fires userLeave
 * @fires playerChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_PlayerLeave = function (args) {
    // Remove player from current players
    bonkAPI.currentPlayers.forEach((n, i) => {
        if (n == args[1]) {
            bonkAPI.currentPlayers.splice(i, 1);
        }
    });

    /**
     * When another player leaves the lobby.
     * @event userLeave
     * @type {object}
     * @property {number} userID - ID of the player left
     * @property {Player} userData - {@linkcode Player} object data of the player that left
     */
    if (bonkAPI.events.hasEvent["userLeave"]) {
        var sendObj = { userID: args[1], userData: bonkAPI.playerList[args[1]] };
        bonkAPI.events.fireEvent("userLeave", sendObj);
    }

    /**
     * When a player leaves or joins.
     * @event playerChange
     * @type {object}
     * @property {number} userID - ID of the player who joined or left
     * @property {object} userData - Data of the player who joined or left
     * @property {boolean} hasLeft - Whether the player joined or left 
     */
    if (bonkAPI.events.hasEvent["playerChange"]) {
        var sendObj = { userID: args[1], userData: bonkAPI.playerList[args[1]], hasLeft: true };
        bonkAPI.events.fireEvent("playerChange", sendObj);
    }

    return args;
};

/**
 * Triggered when the host has left.
 * @function receive_HostLeave
 * @fires hostChange
 * @fires userLeave
 * @fires playerChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_HostLeave = function (args) {
    let lastHostID = bonkAPI.hostID;
    bonkAPI.hostID = args[2];

    // Remove player from current players
    bonkAPI.currentPlayers.forEach((n, i) => {
        if (n == lastHostID) {
            bonkAPI.currentPlayers.splice(i, 1);
        }
    });

    /**
     * When the host changes.
     * @event hostChange
     * @type {object}
     * @property {number} userID - ID of the new host
     */
    //Using hostChange to use for multiple cases
    if (bonkAPI.events.hasEvent["hostChange"]) {
        var sendObj = { userID: args[1] };
        bonkAPI.events.fireEvent("hostChange", sendObj);
    }

    /**
     * When another player leaves the lobby.
     * @event userLeave
     * @type {object}
     * @property {number} userID - ID of the player left
     * @property {Player} userData - {@linkcode Player} object data of the player that left
     */
    if (bonkAPI.events.hasEvent["userLeave"]) {
        var sendObj = { userID: lastHostID, userData: bonkAPI.playerList[lastHostID] };
        bonkAPI.events.fireEvent("userLeave", sendObj);
    }

    /**
     * When a player leaves or joins.
     * @event playerChange
     * @type {object}
     * @property {number} userID - ID of the player who joined or left
     * @property {object} userData - Data of the player who joined or left
     * @property {boolean} hasLeft - Whether the player joined or left 
     */
    if (bonkAPI.events.hasEvent["playerChange"]) {
        var sendObj = { userID: lastHostID, userData: bonkAPI.playerList[lastHostID], hasLeft: true };
        bonkAPI.events.fireEvent("playerChange", sendObj);
    }

    return args;
};

/**
 * Triggered when a player sends an input.
 * @function receive_Inputs
 * @fires gameInputs
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_Inputs = function (args) {
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
            userID: args[1],
            rawInput: args[2]["i"],
            frame: args[2]["f"],
            sequence: args[2]["c"],
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
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_GameStart = function (args) {
    /**
     * When game has started
     * @event gameStart
     * @type {object}
     * @property {string} mapData - Encoded map data, must decode it to use
     * @property {object} startData - Extra game specific data
     */
    if (bonkAPI.events.hasEvent["gameStart"] && bonkAPI.myID != bonkAPI.hostID) {
        //! change name of mapdata since it is not map data, probably gamestate
        //! do the same in triggerstart
        var sendObj = {
            mapData: bonkAPI.ISdecode(args[2]),
            startData: args[3],
        };
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
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_TeamChange = function (args) {
    bonkAPI.playerList[parseInt(args[1])].team = args[2];

    /**
     * When a player has changed teams.
     * @event teamChange
     * @type {object}
     * @property {number} userID - Player who changed teams
     * @property {number} team - The new team, represented from 0 to 5
     */
    if (bonkAPI.events.hasEvent["teamChange"]) {
        var sendObj = { userID: args[1], team: args[2] };
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
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_ChatMessage = function (args) {
    let chatUserID = args[1];
    let chatMessage = args[2];

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

/**
 * Data given by host after join.
 * @function receive_InitialData
 * @fires modeChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_InitialData = function (args) {
    /**
     * When the mode has changed.
     * @event modeChange
     * @type {object}
     * @property {string} mode - Short string representing the new mode
     */
    if (bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: args[1]["mo"] };
        bonkAPI.events.fireEvent("modeChange", sendObj);
    }

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
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_ModeChange = function (args) {
    // *Maybe change raw arguement to full mode name or numbers
    /**
     * When the mode has changed.
     * @event modeChange
     * @type {object}
     * @property {string} mode - Short string representing the new mode
     */
    if (bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: args[1] };
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
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_MapSwitch = function (args) {
    // *Using mapSwitch to stick with other bonkAPI.events using "change"
    /**
     * When the map has changed.
     * @event mapSwitch
     * @type {object}
     * @property {string} mapData - String with the data of the map
     */
    if (bonkAPI.events.hasEvent["mapSwitch"]) {
        var sendObj = { mapData: args[1] };
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
 * @fires hostChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_NewHost = function (args) {
    bonkAPI.hostID = args[1]["newHost"];

    /**
     * When the host changes.
     * @event hostChange
     * @type {object}
     * @property {number} userID - ID of the new host
     */
    if (bonkAPI.events.hasEvent["hostChange"]) {
        var sendObj = { userID: args[1]["newHost"] };
        bonkAPI.events.fireEvent("hostChange", sendObj);
    }

    return args;
};

/**
 * Triggered when the user receives a friend request.
 * @function receive_FriendReq
 * @fires receivedFriend
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_FriendRequest = function (args) {
    /**
     * When the the user has been friended.
     * @event receivedFriend
     * @type {object}
     * @property {number} userID - ID of the player who friended you
     */
    if (bonkAPI.events.hasEvent["receivedFriend"]) {
        var sendObj = { userID: args[1] };
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

bonkAPI.receive_LocalXPGain = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Triggers after joining a room and the 
 * game state is sent.
 * @function receive_gameState
 * @fires modeChange
 * @fires gameStart
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.receive_gameState = function (args) {
    //! also needs to fire something to do with gamestate
    /**
     * When the mode has changed.
     * @event modeChange
     * @type {object}
     * @property {string} mode - Short string representing the new mode
     */
    if (bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: args[1]["gs"]["mo"] };
        bonkAPI.events.fireEvent("modeChange", sendObj);
    }

    /**
     * When game has started
     * @event gameStart
     * @type {object}
     * @property {string} mapData - Encoded map data, must decode it to use
     * @property {object} startData - Extra game specific data
     */
    if (bonkAPI.events.hasEvent["gameStart"]) {
        //! change name of mapdata since it is not map data, probably gamestate
        //! do the same in triggerstart
        var sendObj = {
            mapData: bonkAPI.decodeMap(args[1]["gs"]["map"]),
            startData: args[3],
        };
        bonkAPI.events.fireEvent("gameStart", sendObj);
    }
  
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
 * @function send_Inputs
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.send_Inputs = function (args) {
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
            rawInput: args[1]["i"],
            frame: args[1]["f"],
            sequence: args[1]["c"],
        };
        bonkAPI.events.fireEvent("gameInputs", sendObj);
    }

    return args;
};

/**
 * Called when started the game.
 * @function send_GameStart
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.send_GameStart = function (args) {
    /**
     * When game has started
     * @event gameStart
     * @type {object}
     * @property {string} mapData - Encoded map data, must decode it to use
     * @property {object} startData - Extra game specific data
     */
    if (bonkAPI.events.hasEvent["gameStart"]) {
        //! do something to mapData so it will encode it
        //! then assign it back to the args
        var sendObj = {
            mapData: bonkAPI.ISdecode(args[1]["is"]),
            startData: args[1]["map"],
        };
        bonkAPI.events.fireEvent("gameStart", sendObj);
    }

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

bonkAPI.send_PlayerKickBan = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_ChatMessage = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_LobbyInform = function (args) {
    //  TODO: Finish implement of function

    return args;
};

/**
 * Called when created a room.
 * @function send_RoomCreate
 * @fires createRoom
 * @fires playerChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.send_RoomCreate = function (args) {
    bonkAPI.playerList = [];

    for (let i = 0; i < bonkAPI.currentPlayers.length; i++) {
        /**
             * When a player leaves or joins.
             * @event playerChange
             * @type {object}
             * @property {number} userID - ID of the player who joined or left
             * @property {object} userData - Data of the player who joined or left
             * @property {boolean} hasLeft - Whether the player joined or left 
             */
        if (bonkAPI.events.hasEvent["playerChange"]) {
            var sendObj = { userID: bonkAPI.currentPlayers[i], userData: bonkAPI.playerList[bonkAPI.currentPlayers[i]], hasLeft: true };
            bonkAPI.events.fireEvent("playerChange", sendObj);
        }
    }
    bonkAPI.currentPlayers = [];

    bonkAPI.playerList[0] = {
        peerId: args[1]["peerID"],
        userName: document.getElementById("pretty_top_name").textContent,
        level:
            document.getElementById("pretty_top_level").textContent == "Guest"
                ? 0
                : parseInt(document.getElementById("pretty_top_level").textContent.substring(3)),
        guest: typeof args[1].token == "undefined",
        team: 1,
        ready: false,
        tabbed: false,
        avatar: args[1]["avatar"],
    };
    bonkAPI.currentPlayers.push(0);

    bonkAPI.myID = 0;
    bonkAPI.hostID = 0;

    /**
     * When you create a room.
     * @event createRoom
     * @type {object}
     * @property {number} userID - ID of you
     * @property {object} userData - Your player data
     */
    if (bonkAPI.events.hasEvent["createRoom"]) {
        var sendObj = { userID: 0, userData: bonkAPI.playerList[0] };
        bonkAPI.events.fireEvent("createRoom", sendObj);
    }

    /**
     * When a player leaves or joins.
     * @event playerChange
     * @type {object}
     * @property {number} userID - ID of the player who joined or left
     * @property {object} userData - Data of the player who joined or left
     * @property {boolean} hasLeft - Whether the player joined or left 
     */
    if (bonkAPI.events.hasEvent["playerChange"]) {
        var sendObj = { userID: 0, userData: bonkAPI.playerList[0], hasLeft: false };
        bonkAPI.events.fireEvent("playerChange", sendObj);
    }

    return args;
};

/**
 * Called as to send inital user data when joining a room.
 * @function send_RoomJoin
 * @fires roomJoin
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.send_RoomJoin = function (args) {
    //! DONT KNOW WHAT TO DO FOR NAMING
    //! Possibly get rid of XMLhttp thing since this gives the login token
    /**
     * When inputs are received from other players.
     * @event roomJoin
     * @type {object}
     * @property {string} password - Room password
     * @property {object} avatar - User's avatar
     * @property {string} token - Login token
     */
    if (bonkAPI.events.hasEvent["roomJoin"]) {
        var sendObj = {
            password: args[1]["roomPassword"],
            avatar: args[1]["avatar"],
            token: args[1]["token"] ? args[1]["token"] : null,
        };
        bonkAPI.events.fireEvent("roomJoin", sendObj);
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

/**
 * When you change modes.
 * @function send_ModeChange
 * @fires modeChange
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.send_ModeChange = function (args) {
    //  TODO: Finish implement of function
    /**
     * When the mode has changed.
     * @event modeChange
     * @type {object}
     * @property {string} mode - Short string representing the new mode
     */
    if (bonkAPI.events.hasEvent["modeChange"]) {
        var sendObj = { mode: args[1]["mo"] };
        bonkAPI.events.fireEvent("modeChange", sendObj);
    }

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
 * @param {JSON} args - Packet received by websocket.
 * @returns {JSON} arguements
 */
bonkAPI.send_MapSwitch = function (args) {
    // *Using mapSwitch to stick with other bonkAPI.events using "change"
    /**
     * When the map has changed.
     * @event mapSwitch
     * @type {object}
     * @property {string} mapData - String with the data of the map
     */
    if (bonkAPI.events.hasEvent["mapSwitch"]) {
        var sendObj = { mapData: args[1]["m"] };
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

bonkAPI.send_XPRequest = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_MapVote = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_InGameInform = function (args) {
    //  TODO: Finish implement of function

    return args;
};

bonkAPI.send_PreVoteGet = function (args) {
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
    // TODO: Maybe for more things when the page is loaded
    //bonkAPI.pixi = window.PIXI;
    bonkAPI.originalDrawShape = window.PIXI.Graphics.prototype.drawShape;
    bonkAPI.pixiCtx = new window.PIXI.Container();
    window.PIXI.Graphics.prototype.drawShape = function(...args) {
        //! testing whether cap can be easily found in drawShape
        //! in drawCircle, capzone has attribute 'cap: "bet"' inside fill_outline
        //console.log([...args]);
        let draw = this;
        setTimeout(function(){
            if(draw.parent) {
                bonkAPI.parentDraw = draw.parent;
                while(bonkAPI.parentDraw.parent != null) {
                    bonkAPI.parentDraw = bonkAPI.parentDraw.parent;
                }
            }
        }, 0);
        return bonkAPI.originalDrawShape.call(this, ...args);
    }
    window.requestAnimationFrame = function(...args) {
        //console.log(bonkAPI.isInGame());
        if(bonkAPI.isInGame()) {
            let canv = 0;
            for(let i = 0; i < document.getElementById("gamerenderer").children.length; i++) {
                if(document.getElementById("gamerenderer").children[i].constructor.name == "HTMLCanvasElement"){
                    canv = document.getElementById("gamerenderer").children[i];
                    break;
                }
            }
            //console.log(bonkAPI.parentDraw);
            if(canv != 0 && bonkAPI.parentDraw) {
                //! might do something might not
                while(bonkAPI.parentDraw.parent != null) {
                    bonkAPI.parentDraw = bonkAPI.parentDraw.parent;
                }
                /**
                 * When a new frame is rendered when in game. It is recomended
                 * to not create new graphics or clear graphics every frame if
                 * possible.
                 * @event graphicsUpdate
                 * @type {object}
                 * @property {string} container - PIXI container to hold PIXI graphics.
                 * @property {number} width - Width of main screen
                 * @property {number} height - Height of main screen
                 */
                if(bonkAPI.events.hasEvent["graphicsUpdate"]) {
                    let w = parseInt(canv.style.width);
                    let h = parseInt(canv.style.height);
                    //bonkAPI.pixiCtx.x = w / 2;
                    //bonkAPI.pixiCtx.y = h / 2;
                    bonkAPI.pixiStage = 0;
                    for(let i = 0; i < bonkAPI.parentDraw.children.length; i++){
                        if(bonkAPI.parentDraw.children[i].constructor.name == "e"){
                            //console.log(bonkAPI.parentDraw);
                            bonkAPI.pixiStage = bonkAPI.parentDraw.children[i];
                            break;
                        }
                    }
                    
                    let sendObj = {
                        container: bonkAPI.pixiCtx,
                        width: w,
                        height: h,
                    };
                    
                    
                    bonkAPI.events.fireEvent("graphicsUpdate", sendObj);
                    if(bonkAPI.pixiStage != 0 && !bonkAPI.pixiStage.children.includes(bonkAPI.pixiCtx)) {
                        bonkAPI.pixiStage.addChild(bonkAPI.pixiCtx);
                    }
                }
            }
        }
        return bonkAPI.originalRequestAnimationFrame.call(this,...args);
    }

    /**
     * When the map has changed.
     * @event mapSwitch
     * @type {object}
     * @property {PIXI} pixi - PIXI class in order to create graphics and containers.
     * @property {string} container - PIXI container to hold PIXI graphics.
     */
    if(bonkAPI.events.hasEvent["graphicsReady"]) {
        let sendObj = {
            pixi: window.PIXI,
            container: bonkAPI.pixiCtx,
        }
        bonkAPI.events.fireEvent("graphicsReady", sendObj);
    }

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
          this.buffer = new ArrayBuffer(100*1024);
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
          Z75[5] = Math.floor(Z75[3]/256);
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
          return Gwindow.btoa(P4$[4]);
        }
        fromBase64(W69, A8Q) {
          var o0n = [arguments];
          o0n[8] = Gwindow.pako;
          o0n[6] = Gwindow.atob(o0n[0][0]);
          o0n[9] = o0n[6].length;
          o0n[4] = new Uint8Array(o0n[9]);
          for (o0n[1] = 0; o0n[1] < o0n[9]; o0n[1]++) {
            o0n[4][o0n[1]] = o0n[6].charCodeAt(o0n[1]);
          }
          if (o0n[0][1] === true) {
            o0n[5] = o0n[8].inflate(o0n[4]);
            o0n[4] = o0n[5];
          }
          this.buffer = o0n[4].buffer.slice(
            o0n[4].byteOffset,
            o0n[4].byteLength + o0n[4].byteOffset
          );
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
            if (M3n[5].type == "g") {
                M3n[1].writeShort(5);
                M3n[1].writeUTF(M3n[5].n);
                M3n[1].writeShort(M3n[5].ja);
                M3n[1].writeShort(M3n[5].jb);
                M3n[1].writeDouble(M3n[5].r);
            }
            if (M3n[5].type != "g") {
                M3n[1].writeShort(M3n[5].ba);
                M3n[1].writeShort(M3n[5].bb);
                M3n[1].writeBoolean(M3n[5].d.cc);
                M3n[1].writeDouble(M3n[5].d.bf);
                M3n[1].writeBoolean(M3n[5].d.dl);
            }
        }
        M3n[32] = M3n[1].toBase64();
        M3n[77] = LZString.compressToEncodedURIComponent(M3n[32]);
        return M3n[77];
    };

    bonkAPI.decodeMap = function (map) {
        var F5W = [arguments];
        var b64mapdata = LZString.decompressFromEncodedURIComponent(map);
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
            if (F5W[31] == 5) {
                map.physics.joints[F5W[19]] = { type: "g", n: "", ja: -1, jb: -1, r: 1 };
                F5W[91] = map.physics.joints[F5W[19]];
                F5W[91].n = binaryReader.readUTF();
                F5W[91].ja = binaryReader.readShort();
                F5W[91].jb = binaryReader.readShort();
                F5W[91].r = binaryReader.readDouble();
            }
            if (F5W[31] != 5) {
                map.physics.joints[F5W[19]].ba = binaryReader.readShort();
                map.physics.joints[F5W[19]].bb = binaryReader.readShort();
                map.physics.joints[F5W[19]].d.cc = binaryReader.readBoolean();
                map.physics.joints[F5W[19]].d.bf = binaryReader.readDouble();
                map.physics.joints[F5W[19]].d.dl = binaryReader.readBoolean();
            }
        }
        return map;
    };
    console.log("Document loaded complete");
};

bonkAPI.checkDocumentReady = () => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        bonkAPI.onLoaded();
    } else {
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
 * Returns the entire list of {@linkcode Player} objects that have joined
 * since you have.
 * @function getPlayerList
 * @returns {Array.<Player>} Array of {@linkcode Player} objects
 */
bonkAPI.getPlayerList = function () {
    // *Returns a copy of bonkAPI.playerList
    return bonkAPI.playerList;
};

/**
 * Returns list of {@linkcode Player} objects in the lobby at time this
 * function was called.
 * @function getPlayerLobbyList
 * @returns {Array.<Player>} Array of {@linkcode Player} objects
 */
bonkAPI.getPlayerLobbyList = function () {
    //! i want to make more playerlobby functions but dk what to name
    //! or whether to join it with the other functions but add an arguement
    //! to specify which to use
    let list = [];
    bonkAPI.currentPlayers.forEach((index) => {
        list.push(bonkAPI.playerList[index]);
    });
    return list;
}

/**
 * Returns list of user IDs in the lobby at time this
 * function was called.
 * @function getPlayersInLobbyID
 * @returns {Array.<Player>} Array of {@linkcode Player} objects
 */
bonkAPI.getPlayersInLobbyID = function () {
    return bonkAPI.currentPlayers;
}

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
        return bonkAPI.playerList[ref];
    } else if (typeof ref === "string") {
        for (let i = 0; i < bonkAPI.playerList.length; i++) {
            if (bonkAPI.playerList[i] != null && ref == bonkAPI.playerList[i].userName) {
                return bonkAPI.playerList[i];
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
    return bonkAPI.playerList[id];
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
            return bonkAPI.playerList[i];
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

/**
 * Returns whether the capzone can be capped
 * without ending game or desyncing
 * @function safeToCap
 * @returns {boolean} Whether it is safe to cap
 */
bonkAPI.safeToCap = function () {
    if(bonkAPI.currentPlayers.length == 1) {
        return true;
    }
    let t = bonkAPI.playerList[bonkAPI.currentPlayers[0]].team;
    for(let i = 1; i < bonkAPI.currentPlayers.length; i++) {
        if(t != bonkAPI.playerList[bonkAPI.currentPlayers[i]].team && 0 != bonkAPI.playerList[bonkAPI.currentPlayers[i]].team) {
            return false;
        }
    }
    return true;
}

/**
 * Returns whether the game is running after
 * you have first joined a lobby.
 * @function isInGame
 * @returns {boolean} Whether in game or not
 */
bonkAPI.isInGame = function () {
    let renderer = document.getElementById("gamerenderer");
    return renderer.style.visibility == "inherit";
}
// #endregion

// #region //!------------------Injector------------------
// *Injecting code into src
bonkAPI.injector = function (src) {
    let newSrc = src;

    //! Inject capZoneEvent fire
    let orgCode = `K$h[9]=K$h[0][0][K$h[2][138]]()[K$h[2][115]];`;
    let newCode = `
        K$h[9]=K$h[0][0][K$h[2][138]]()[K$h[2][115]];
        
        capZoneEventTry: try {
            // Initialize
            let inputState = z0M[0][0];
            let currentFrame = inputState.rl;
            let playerID = K$h[0][0].m_userData.arrayID;
            let capID = K$h[1];
            
            let sendObj = { capID: capID, playerID: playerID, currentFrame: currentFrame };
            
            if (window.bonkAPI.events.hasEvent["capZoneEvent"]) {
                window.bonkAPI.events.fireEvent("capZoneEvent", sendObj);
            }
        } catch(err) {
            console.error("ERROR: capZoneEvent");
            console.error(err);
        }`;

    newSrc = newSrc.replace(orgCode, newCode);

    //! Inject stepEvent fire
    orgCode = `return z0M[720];`;
    newCode = `
        stepEventTry: try {
            let inputStateClone = JSON.parse(JSON.stringify(z0M[0][0]));
            let currentFrame = inputStateClone.rl;
            let gameStateClone = JSON.parse(JSON.stringify(z0M[720]));
            
            let sendObj = { inputState: inputStateClone, gameState: gameStateClone, currentFrame: currentFrame };
            
            if (window.bonkAPI.events.hasEvent["stepEvent"]) {
                window.bonkAPI.events.fireEvent("stepEvent", sendObj);
            }
        } catch(err) {
            console.error("ERROR: stepEvent");
            console.error(err);
        }
        
        return z0M[720];`;

    newSrc = newSrc.replace(orgCode, newCode);

    //! Inject frameIncEvent fire
    //TODO: update to bonk 49
    orgCode = `Y3z[8]++;`;
    newCode = `
        Y3z[8]++;
        
        frameIncEventTry: try {
            if (window.bonkAPI.events.hasEvent["frameIncEvent"]) {
                var sendObj = { frame: Y3z[8], gameStates: o3x[7] };
                
                window.bonkAPI.events.fireEvent("frameIncEvent", sendObj);
            }
        } catch(err) {
            console.error("ERROR: frameIncEvent");
            console.error(err);
        }`;

    // newSrc = newSrc.replace(orgCode, newCode);
    return newSrc;
};

// Compatibility with Excigma's code injector userscript
if (!window.bonkCodeInjectors) window.bonkCodeInjectors = [];
window.bonkCodeInjectors.push((bonkCode) => {
    try {
        return bonkAPI.injector(bonkCode);
    } catch (error) {
        alert(`Injecting failed, BonkAPI may lose some functionality. This may be due to an update by Chaz.`);
        throw error;
    }
});
// #endregion

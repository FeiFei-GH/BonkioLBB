// ! Compitable with Bonk Version 48

// Everything should be inside this object
// to prevent conflict with other prgrams.

window.bonkAPI = {};

// Functions handle add Listeners from other programs and also fires event to them
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
     * @param {*} event - Event that is being fired
     * @param {*} data - Data sent along with the event
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
Object.freeze(bonkAPI.EventHandler);

// !Initialize Variable

bonkAPI.bonkWSS = 0;
bonkAPI.originalSend = window.WebSocket.prototype.send;
bonkAPI.originalRequestAnimationFrame = window.requestAnimationFrame;

// bonkAPI Vars
/**
 * Contains data of a single player

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
                bonkWSS = 0;
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

    return originalSend.call(this, args);
};
// #endregion

// !-----------------Send and Receive Packets-----------------
// #region
// !Note: these could be dangerous, maybe add some sanitization
// *Send a packet to server
/**
 * Sends the given packet to bonk servers.
 * @function bonkAPI.sendPacket
 * @param {string} packet - Packet to send to bonk
 */
bonkAPI.sendPacket = function (packet) {
    if (bonkWSS != 0) {
        bonkWSS.send(packet);
    }
};

// *Make client receive a packet
/**
 * Makes your client receive the given packet.
 * @function bonkAPI.receivePacket
 * @param {string} packet - Packet that is received
 */
bonkAPI.receivePacket = function (packet) {
    if (bonkWSS != 0) {
        bonkWSS.onmessage({ data: packet });
    }
};
// #endregion

// !Receive Handler Functions
// #region -----------------Receive Handler Functions-----------------------
/**
 * Triggered when the user joins a lobby.
 * @function receive_RoomJoin
 * @fires onJoin
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_RoomJoin = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    playerList = [];
    myID = jsonargs[1];
    hostID = jsonargs[2];

    for (var i = 0; i < jsonargs[3].length; i++) {
        //if(jsonargs[3][i] != null){
        playerList[i] = jsonargs[3][i];
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
    // !this name isnt descriptive
    if (events.hasEvent["onJoin"]) {
        var sendObj = {
            hostID: jsonargs[2],
            userData: playerList, // !May or may not be immutable
            roomID: jsonargs[6],
            bypass: jsonargs[7],
        };
        events.fireEvent("onJoin", sendObj);
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
    playerList[jsonargs[1]] = {
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
    //? - send the playerlist as data
    //? - send the new player object as data
    //? - send nothing and let the user access bonkAPI.playerList
    /** 
     * When another player joins the lobby.
     * @event userJoin
     * @type {object}
     * @property {number} userID - ID of the player joined
     * @property {Player} userData - {@linkcode Player} object data of the player that joined
    */
    if (events.hasEvent["userJoin"]) {
        var sendObj = { userID: jsonargs[2], userData: playerList[jsonargs[1]] };
        events.fireEvent("userJoin", sendObj);
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
    if (events.hasEvent["userLeave"]) {
        var sendObj = { userID: jsonargs[2], userData: playerList[jsonargs[1]] };
        events.fireEvent("userLeave", sendObj);
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

    hostID = jsonargs[2];

    /** 
     * When the host changes.
     * @event hostChange
     * @type {object}
     * @property {number} userID - ID of the new host
    */
    //Using hostChange to use for multiple cases
    if (events.hasEvent["hostChange"]) {
        var sendObj = { userID: jsonargs[2] };
        events.fireEvent("hostChange", sendObj);
    }

    return args;
};

/**
 * Triggered when a player sends an input.
 * @function receive_Inputs
 * @fires receivedInputs
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
     * @event receivedInputs
     * @type {object}
     * @property {number} userID - ID of the player who inputted
     * @property {number} rawInput - Input of the player in the form of 6 bits
     * @property {number} frame - Frame when input happened
     * @property {number} sequence - The total amount of inputs by that player
    */
    if (events.hasEvent["receivedInputs"]) {
        var sendObj = {
            userID: jsonargs[1],
            rawInput: jsonargs[2]["i"],
            frame: jsonargs[2]["f"],
            sequence: jsonargs[2]["c"],
        };
        events.fireEvent("receivedInputs", sendObj);
    } //example
    /*if(bonkAPI.events.hasEvent["receiveRawInput"]) {
        obj here
        bonkAPI.events.fireEvent("receiveRawInput", sendObj);
    }
    */

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
    if (events.hasEvent["gameStart"]) {
        var sendObj = { extraData: args };
        events.fireEvent("gameStart", sendObj);
    }

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
    playerList[jsonargs[1]].team = jsonargs[2];

    /** 
     * When a player has changed teams.
     * @event teamChange
     * @type {object}
     * @property {number} userID - Player who changed teams
     * @property {number} team - The new team, represented from 0 to 5
     */
    if (events.hasEvent["teamChange"]) {
        var sendObj = { userID: jsonargs[1], team: jsonargs[2] };
        events.fireEvent("teamChange", sendObj);
    }

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
    if (events.hasEvent["chatIn"]) {
        var sendObj = { userID: chatUserID, message: chatMessage };
        events.fireEvent("chatIn", sendObj);
    }

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
    if (events.hasEvent["modeChange"]) {
        var sendObj = { mode: jsonargs[1] };
        events.fireEvent("modeChange", sendObj);
    }

    return args;
};

/**
 * Triggered when map has changed.
 * @function receive_MapSwitch
 * @fires mapChange
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_MapSwitch = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));

    // *Using mapChange to stick with other events using "change"
    //! might be json or string
    /** 
     * When the map has changed.
     * @event mapChange
     * @type {object}
     * @property {string} mapData - String with the data of the map
     */
    if (events.hasEvent["mapChange"]) {
        var sendObj = { mapData: jsonargs[1] };
        events.fireEvent("mapChange", sendObj);
    }

    return args;
};

//! NO EVENT HERE YET
/**
 * Triggered when there is a new host.
 * @function receive_NewHost
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.receive_NewHost = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    hostID = jsonargs[1]["newHost"];

    /* Leaving out for now since i dont know what this packet contains
    if(bonkAPI.events.hasEvent["hostChange"]) {
        bonkAPI.events.fireEvent("hostChange", jsonargs[1]["newHost"]);
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
bonkAPI.receive_FriendReq = function (args) {
    var jsonargs = JSON.parse(args.data.substring(2));
    //LB_HUD.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
    //LB_HUD.chat("Friended :3");

    /** 
     * When the the user has been friended.
     * @event receivedFriend
     * @type {object}
     * @property {number} userID - ID of the player who friended you
     */
    if (events.hasEvent["receivedFriend"]) {
        var sendObj = { userID: jsonargs[1] };
        events.fireEvent("receivedFriend", sendObj);
    }

    return args;
};

// &Send Handler Functions
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

/**
 * Called when created a room.
 * @function send_CreateRoom
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.send_CreateRoom = function (args) {
    playerList = [];
    var jsonargs2 = JSON.parse(args.substring(2));
    var jsonargs = jsonargs2[1];

    playerList[0] = {
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

    myID = 0;
    hostID = 0;

    return args;
};

/**
 * Called when sending inputs out.
 * @function send_SendInputs
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
bonkAPI.send_SendInputs = function (args) {
    //LB_HUD.playerList[myID].lastMoveTime = Date.now();
    return args;
};

/**
 * Called when user changes map
 * @function send_MapAdd
 * @param {string} args - Packet received by websocket.
 * @returns {string} arguements
 */
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
 * @function chat
 * @param {string} message - The message.
 */
bonkAPI.chat = function (message) {
    bonkAPI.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
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
    events.addEventListener(event, method, scope, context);
};


/**
 * Returns the entire list of {@linkcode Player} objects in the lobby at time this
 * function was called.
 * @function getPlayerList
 * @returns {Array.<Player>} Array of {@linkcode Player} objects
 */
// *Returns a copy of playerlist
bonkAPI.getPlayerList = function () {
    return Object.assign([], playerList);
};

/**
 * Returns the amount of players that have been in the lobby.
 * @function getPlayerListLength
 * @returns {number} Length of the player list
 */
bonkAPI.getPlayerListLength = function () {
    return playerList.length;
};

/**
 * Returns the {@linkcode Player} object of the ID given.
 * @function getPlayerByID
 * @param {number} id - ID of the player that is being looked for
 * @returns {Player} Player object
 */
bonkAPI.getPlayerByID = function (id) {
    for (let i = 0; i < playerList.length; i++) {
        if (i == id) {
            return Object.assign({}, playerList[i]);
        }
    }
};

/**
 * Returns the {@linkcode Player} object of the name given.
 * @function getPlayerByName
 * @param {string} name - Name of the player that is being looked for
 * @returns {Player} Player object
 */
bonkAPI.getPlayerByName = function (name) {
    for (let i = 0; i < playerList.length; i++) {
        if (name == playerList[i].userName) {
            return Object.assign({}, playerList[i]);
        }
    }
    return null;
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
    for (let i = 0; i < playerList.length; i++) {
        if (team == playerList[i].team) {
            teamList.push({ userID: i, userData: playerList[i] });
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
    return myID;
};

/**
 * Returns the player ID of the host.
 * @function getHostID
 * @returns {number} ID of the host
 */
bonkAPI.getHostID = function () {
    return hostID;
};
// #endregion

//? If you dont care about people changing the code then these
//? dont need to be frozen
/*
// Freeze all constant objects
Object.freeze(bonkAPI.addEventListener);
Object.freeze(bonkAPI.chat);
Object.freeze(bonkAPI.getPlayerList);
Object.freeze(bonkAPI.getPlayerListLength);
Object.freeze(bonkAPI.getPlayerByID);
Object.freeze(bonkAPI.getPlayerByName);
Object.freeze(bonkAPI.getPlayersByTeam);
Object.freeze(bonkAPI.getMyID);
Object.freeze(bonkAPI.getHostID);
Object.freeze(bonkAPI);
*/
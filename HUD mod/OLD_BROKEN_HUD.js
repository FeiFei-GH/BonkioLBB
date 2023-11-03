// ==UserScript==
// @name         bonkHUD
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  bonkHUD
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-end
// @grant        none
// ==/UserScript==

function bonkHUDInjector(func) {
    if (window.location === window.parent.location) {
        // Run Script only when document have loaded
        if (document.readyState === "complete") {
            func();
        } else {
            document.addEventListener("readystatechange", function() {
                setTimeout(func, 1500);
            });
        }
    }
}

// !Main Function!
bonkHUDInjector(function () {
    // &Define Default Variables
    let scope = window; // Tampermonkey ya know...
    scope.scope = scope; //make scope defined LOL
    scope.Gwindow = document.getElementById("maingameframe").contentWindow;
    scope.Gdocument = document.getElementById("maingameframe").contentDocument;
    Gwindow.Gwindow = window; // Don't ask
    Gwindow.Gdocument = document; // Don't ask
    
    // Clear all previous intervals
    if (typeof scope.loop30FPSID == "undefined") {
        scope.loop30FPSID = true;
    } else {
        clearInterval(loop30FPSID);
    }
    
    // &When first time running script (also keep values when rerun script)
    if(typeof(scope.originalSend)=='undefined'){scope.originalSend = Gwindow.WebSocket.prototype.send;}
    if(typeof(scope.originalDrawCircle)=='undefined'){scope.originalDrawCircle = Gwindow.PIXI.Graphics.prototype.drawCircle;}
    if(typeof(scope.scale)=='undefined'){scope.scale = -1;}
    if(typeof(scope.requestAnimationFrameOriginal)=='undefined'){scope.requestAnimationFrameOriginal = Gwindow.requestAnimationFrame;}
    if(typeof(scope.bonkWSS)=='undefined'){scope.bonkWSS = 0;}
    
    // My custom vars
    if(typeof(scope.currentPlayerIDs)=='undefined'){scope.currentPlayerIDs = {};}
    if(typeof(scope.myID)=='undefined'){scope.myID = -1;}
    if(typeof(scope.hostID)=='undefined'){scope.hostID = -1;}

    // Local vars (resets everytime)
    scope.isInstaStart = false;
    scope.instaDelay = 2;
    
    // Start all loops
    scope.loop30FPSID = setInterval(loop30FPS,33.33);

    // overriding draw circle and get player data
    Gwindow.PIXI.Graphics.prototype.drawCircle = function(...args){
        let This = this;
        let Args = [...args]; // Args[2] is player radius but buggy
        
        setTimeout(function(){
            if (This.parent) {
                let children = This.parent.children;
                let user = 0;
                
                for(let i = 0; i < children.length; i++){
                    if(children[i]._text){
                        user = children[i]._text;
                    }
                }
                
                var keys = Object.keys(currentPlayerIDs);
                for(var i = 0; i<keys.length; i++){
                    if(currentPlayerIDs[keys[i]].userName === user){
                        currentPlayerIDs[keys[i]].playerData = This.parent;
                    }
                }
            }
        },0);
        
        return originalDrawCircle.call(this,...args);
    };
    
    //------------------------------Overriding bonkWSS------------------------------//
    Gwindow.WebSocket.prototype.send = function(args) {
        if (this.url.includes(".bonk.io/socket.io/?EIO=3&transport=websocket&sid=")) {
            let bonkWSS = this;

            if (!this.injected) { // initialize overriding receive listener (only run once)
                this.injected = true;
                let originalReceive = this.onmessage;

                // This function intercepts incoming packets
                this.onmessage = function (args) {
                    // &Receiving incoming packets
                    if (args.data.startsWith('42[1,')) { // *Update Pings
                        
                    } else if (args.data.startsWith('42[3,')) { // *Room join
                        args = receive_RoomJoin(args);
                    } else if (args.data.startsWith('42[4,')) { // *Player join
                        args = receive_PlayerJoin(args);
                    } else if (args.data.startsWith('42[5,')) { // *Player leave
                        args = receive_PlayerLeave(args);
                    } else if (args.data.startsWith('42[6,')) { // *Host leave
                        args = receive_HostLeave(args);
                    } else if (args.data.startsWith('42[7,')) { // *Inputs
                        console.log(args);
                    } else if (args.data.startsWith('42[8,')) { // *Ready Change
                        
                    } else if (args.data.startsWith('42[13,')) { // *Game End
                        
                    } else if (args.data.startsWith('42[15,')) { // *Game Start
                        args = receive_GameStart(args);
                    } else if (args.data.startsWith('42[16,')) { // *Error
                        
                    } else if (args.data.startsWith('42[18,')) { // *Team Change
                        args = receive_TeamChange(args);
                    } else if (args.data.startsWith('42[19,')) { // *Teamlock toggle
                        
                    } else if (args.data.startsWith('42[20,')) { // *Chat Message
                        args = receive_ChatMessage(args);
                    } else if (args.data.startsWith('42[21,')) { // *Initial data
                        
                    } else if (args.data.startsWith('42[24,')) { // *Kicked
                        
                    } else if (args.data.startsWith('42[26,')) { // *Mode change
                        
                    } else if (args.data.startsWith('42[27,')) { // *Change WL (Rounds)
                        
                    } else if (args.data.startsWith('42[29,')) { // *Map switch
                        
                    } else if (args.data.startsWith('42[32,')) { // *inactive?
                        
                    } else if (args.data.startsWith('42[33,')) { // *Map Suggest
                        
                    } else if (args.data.startsWith('42[34,')) { // *Map Suggest Client
                        
                    } else if (args.data.startsWith('42[36,')) { // *Player Balance Change
                        
                    } else if (args.data.startsWith('42[40,')) { // *Save Replay
                        
                    } else if (args.data.startsWith('42[41,')) { // *New Host
                        args = receive_NewHost(args);
                    } else if (args.data.startsWith('42[42,')) { // *Friend Req
                        args = receive_FriendReq(args);
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
                    window.bonkWSS = 0;
                    return originalClose.call(this);
                };
            } else {
                // &Sending outgoing packets
                if (args.startsWith('42[4,')) { // *Send Inputs
                    args = send_SendInputs(args);
                } else if (args.startsWith('42[5,')) { // *Trigger Start
                    args = send_TriggerStart(args);
                } else if (args.startsWith('42[6,')) { // *Change Own Team
                    
                } else if (args.startsWith('42[7,')) { // *Team Lock
                    
                } else if (args.startsWith('42[9,')) { // *Kick/Ban Player
                    
                } else if (args.startsWith('42[10,')) { // *Chat Message
                    
                } else if (args.startsWith('42[11,')) { // *Inform In Lobby
                    
                } else if (args.startsWith('42[12,')) { // *Create Room
                    args = send_CreatRoom(args);
                } else if (args.startsWith('42[14,')) { // *Return To Lobby
                    
                } else if (args.startsWith('42[16,')) { // *Set Ready
                    
                } else if (args.startsWith('42[17,')) { // *All Ready Reset
                    
                } else if (args.startsWith('42[19,')) { // *Send Map Reorder
                    
                } else if (args.startsWith('42[20,')) { // *Send Mode
                    
                } else if (args.startsWith('42[21,')) { // *Send WL (Rounds)
                    
                } else if (args.startsWith('42[22,')) { // *Send Map Delete
                    
                } else if (args.startsWith('42[23,')) { // *Send Map Add
                    args = send_MapAdd(args);
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
                    
                } else if (args.startsWith('42[44,')) { // *Tabbed
                    
                } else if (args.startsWith('42[50,')) { // *Send No Host Swap
                    
                }
            }
        }

        return originalSend.call(this, args);
    };

    // Send a packet to server
    scope.sendPacket = function (packet) {
        if (bonkWSS !== 0) {
            bonkWSS.send(packet);
        }
    };
    
    // Make client receive a packet
    scope.receivePacket = function (packet) {
        if (bonkWSS !== 0) {
            bonkWSS.onmessage({ data: packet });
        }
    };

    // &Receive Handler Functions
    scope.receive_RoomJoin = function (args) {
        const jsonArgs = JSON.parse(args.data.substring(2));
        let currentPlayerIDs = {};
        let myID = jsonArgs[1];
        let hostID = jsonArgs[2];

        for(let i = 0; i < jsonArgs[3].length; i++){
            if(jsonArgs[3][i] != null){
                currentPlayerIDs[i.toString()] = jsonArgs[3][i];
            }
        }
        
        return args;
    }

    scope.receive_PlayerJoin = function (args) {
        let jsonArgs = JSON.parse(args.data.substring(2));
        currentPlayerIDs[jsonArgs[1]] = {
            peerID: jsonArgs[2],
            userName: jsonArgs[3],
            guest: jsonArgs[4],
            level: jsonArgs[5],
            team: jsonArgs[6],
            avatar: jsonArgs[7],
        };

        return args;
    }
    
    scope.receive_PlayerLeave = function (args) {
        let jsonArgs = JSON.parse(args.data.substring(2));

        if (typeof currentPlayerIDs[jsonArgs[1]] != "undefined") {
            delete currentPlayerIDs[jsonArgs[1]];
        }
        return args;
    }
    
    scope.receive_HostLeave = function (args) {
        let jsonArgs = JSON.parse(args.data.substring(2));

        if (typeof currentPlayerIDs[jsonArgs[1]] != "undefined") {
            delete currentPlayerIDs[jsonArgs[1]];
        }
        hostID = jsonargs[2];
        
        return args;
    }
    
    //! Detects when match starts!!!
    scope.receive_GameStart = function (args) {
        
        return args;
    }
    
    scope.receive_TeamChange = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        currentPlayerIDs[jsonargs[1]].team = jsonargs[2];
        
        return args;
    }
    
    scope.receive_ChatMessage = function (args) {
        let jsonArgs = JSON.parse(args.data.substring(2));
        let chatUserName = currentPlayerIDs[jsonArgs[1]].userName;
        let chatMessage = jsonArgs[2];
        
        return args;
    }
    
    scope.receive_NewHost = function (args) {
        const jsonArgs = JSON.parse(args.data.substring(2));
        hostID = jsonArgs[1]["newHost"];
        
        return args;
    }
    
    scope.receive_FriendReq = function (args) {
        let jsonArgs = JSON.parse(args.data.substring(2));
        
        return args;
    }
    
    // &Send Handler Functions
    scope.send_TriggerStart = function (args) {
        let jsonArgs = JSON.parse(args.substring(2));
        
        if (isInstaStart) {
            isInstaStart = false;
            // jsonargs[1]["gs"]["wl"] = 1; //keep this here for now
                        
            if(instaDelay !== 0){
                let jsonargs2 = decodeIS(jsonargs[1]["is"]);
                jsonargs2["ftu"] = instaDelay * 30;
                            
                jsonargs2 = encodeIS(jsonargs2);
                jsonargs[1]["is"] = jsonargs2;
            }
        }
    
        args = "42"+JSON.stringify(jsonargs);
        return args;
    }
    
    scope.send_CreatRoom = function (args) {
        let currentPlayerIDs = {};
        var jsonargs2 = JSON.parse(args.substring(2));
        var jsonargs = jsonargs2[1];

        currentPlayerIDs["0"] = {
            peerID: jsonargs["peerID"],
            userName: Gdocument.getElementById("pretty_top_name").textContent,
            level:
                Gdocument.getElementById("pretty_top_level").textContent === "Guest"
                    ? 0
                    : parseInt(Gdocument.getElementById("pretty_top_level").textContent.substring(3)),
            guest: typeof jsonargs.token == "undefined",
            team: 1,
            avatar: jsonargs["avatar"],
        };
        
        let myID = 0;
        let hostID = 0;
        
        return args;
    }
    
    scope.send_SendInputs = function (args) {
        return args;
    }
    
    scope.send_MapAdd = function (args) {
        
        return args;
    }
    
    
    
    // &------------------------------------------All Functions------------------------------------------
    scope.defaultEnd = function () {
        console.log("defaultEnd");
        if (Gdocument.getElementById("gamerenderer").style["visibility"] !== "hidden") {
            Gdocument.getElementById("pretty_top_exit").click();
        }
    };
    
    scope.defaultStart = function() {
        console.log("defaultStart");
        Gdocument.getElementById("newbonklobby_startbutton").click();
    }
    
    scope.instaStart = function() {
        isInstaStart = true;
        Gdocument.getElementById("newbonklobby_editorbutton").click();
        Gdocument.getElementById("mapeditor_close").click();
        Gdocument.getElementById("mapeditor_midbox_testbutton").click();
    }
    
    scope.chat = function (message) {
        sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
    };
            
    scope.getCurrentMapName = function() {
        return Gdocument.getElementById("newbonklobby_maptext").innerHTML;
    }
    
    scope.updatePlayerData = function (scale) {
        let keys = Object.keys(currentPlayerIDs);
        for(let i = 0; i < keys.length; i++){
            if(currentPlayerIDs[keys[i]].playerData){
                if(currentPlayerIDs[keys[i]].playerData2){
                    if(currentPlayerIDs[keys[i]].playerData.transform){
                        currentPlayerIDs[keys[i]].playerData2.x = currentPlayerIDs[keys[i]].playerData.transform.position.x * scale - 365;
                        currentPlayerIDs[keys[i]].playerData2.y = currentPlayerIDs[keys[i]].playerData.transform.position.y * scale - 250;
                    } else {
                        currentPlayerIDs[keys[i]].playerData2.alive = false;
                    }
                } else {
                    currentPlayerIDs[keys[i]].playerData2 = {
                        alive: true,
                        radius: 0,
                        x: 0,
                        y: 0,
                        balance: 0,
                    };
                }
            }
        }
    }
    
    //& All Looping Functions
    //this function runs all the time, matches 30FPS
    function loop30FPS() {
        
    }
    
    //This function gets called every frame
    Gwindow.requestAnimationFrame = function(...args){
        //When game playing
        try {
            if(myID !== -1 && Gdocument.getElementById("gamerenderer").style["visibility"] !== "hidden"){
                let canv = 0;
                for (let i = 0; i<Gdocument.getElementById("gamerenderer").children.length; i++) {
                    if(Gdocument.getElementById("gamerenderer").children[i].constructor.name === "HTMLCanvasElement"){
                        canv = Gdocument.getElementById("gamerenderer").children[i];
                        break;
                    }
                }
                const canvWidth = parseInt(canv.style["width"]);
                let scale = canvWidth / 730;
                
                updatePlayerData(1 / scale);
            }
        } catch (err) {
            console.log(err.message);
        }
        
        return requestAnimationFrameOriginal.call(this,...args);
    };
});
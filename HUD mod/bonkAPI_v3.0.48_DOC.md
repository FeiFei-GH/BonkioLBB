# bonkAPI Doc
`v3.0.48`

Description here...

In a userscript, it is recomended to change `@run-at` to `document-idle` or `document-end` to ensure that bonkAPI has been fully injected.

#### Methods:
All methods in bonkAPI can be accesed by using the `bonkAPI` object in window. Inside of a userscript, all you need is `bonkAPI.methodName(arguements)`.
- [addEventListener(event, method)](#addeventlistenerevent-method)
- [receivePacket(packet)](#receivepacketpacket)
- [sendPacket(packet)](#sendpacketpacket)
    - [chat(message)](#chatmessage)
- [getMyID()](#getmyid)
- [getHostID()](#gethostid)
- [getPlayerList()](#getplayerlist)
- [getPlayerListLength()](#getplayerlistlength)
- [getPlayerByID(id)](#getplayerbyidid)
- [getPlayerByName(name)](#getplayerbynamename)
- [getPlayersByTeam(team)](#getplayersbyteamteam)

### addEventListener(event, method)
Listen for a specific `event` and call `method` when the event has been fired.

Example
```javascript
// Listen for when a user joins the lobby
// User data is stored in `e`
bonkAPI.addEventListener("userJoin", function(e) {
    // If Sky_Dream joined, this will send:
    // "Hello, Sky_Dream!" to the chat
    bonkAPI.chat("Hello, " + e.userName + "!");
});
```

Here is a [list of events](#events).

### receivePacket(packet)
Fake receives a specific packet. For information on packets, see [Demystify Bonk](https://github.com/UnmatchedBracket/DemystifyBonk/blob/main/Packets.md).

Example
```javascript
// Show map request text only to the user
bonkAPI.receivePacket('42[34,"SomeMap","Maker",2]');
```

### sendPacket(packet)
Sends a specific packet to bonk servers. For information on packets, see [Demystify Bonk](https://github.com/UnmatchedBracket/DemystifyBonk/blob/main/Packets.md).

Example
```javascript
// Send packet to be moved to green team
bonkAPI.sendPacket('42[6,{"targetTeam":4}]')
```

### chat(message)
Sends a message to the lobby with the string `message`.

Example
```javascript
bonkAPI.chat("Hello, Bonk!");
```

### getMyID()
Returns you're current id in the lobby you are in.

Example
```javascript
// Get user data from your own id and check if you are a guest
if(bonkAPI.getPlayerByID(bonkAPI.getMyID()).guest === true) {
    bonkAPI.chat("I am a guest!");
} else {
    bonkAPI.chat("I am not a guest!");
}
```

### getHostID()
Returns the id of the host of the lobby you are in.

Example
```javascript
// Gets the user data of the host then gets their name
let host = bonkAPI.getPlayerByID(bonkAPI.getHostID()).userName;
bonkAPI.chat("Don't kick me pls, " + host);
```

### getPlayerList()
Gets the entire list of players in the lobby at the point in time, including `null` values where a player has left. The first person to create the lobby is 0 and new player's are always the next available integer. Changing the returned value will not change what is stored in bonkAPI.

If you need to access many players in a short amount of time, it is more efficient to use this than [`getPlayerByName(name)`](#getplayerbynamename) or [`getPlayerByID(id)`](#getplayerbyidid)

Example
```javascript
// Get a copy of the current playerList
var players = bonkAPI.getPlayerList();
// Loop through the list 
for(let i = 0; i < players.length; i++) {
    // Get player data at id i
    let player = players[i];
    /* Code */
}
```

### getPlayerListLength()
Gets the length of the current full list of players in the lobby, including players who left.

Example
```javascript
// Loops through possible ids
for(let i = 0; i < bonkAPI.getPlayerListLength(); i++) {
    if(bonkAPI.getMyID() != i) {
        // Kicks everyone in the room, not including you
        // toString() isn't neccesary
        bonkAPI.sendPacket('42[9,{"banshortid":'+ i.toString()+',"kickonly":true}]');
    }
}
```

### getPlayerByID(id)
Gets the user data of the player at the given `id`. It is possible to get `null` if the player has left.

Example
```javascript
/* Fith person to say hi gets host */
var counter = 0;

// Listen for when a user chats
// Chat data stored in e
bonkAPI.addEventListener("userJoin", function(e) {
    if(counter === 5) {
        // Send message
        bonkAPI.chat(bonkAPI.getPlayerByID(e.userID).userName + " gets host!");
        // Change host
        bonkAPI.sendPacket('42[34,{"id":'+ e.userID +'}]');
    }
    counter++;
});
```

### getPlayerByName(name)
Gets the user data of the player with the given `name` in a string. Returns `null` if a player with the name doesn't exist.

Example
```javascript
/* Method with parameter [name] */
// Gets player data from name
var player = bonkAPI.getPlayerByName(name);
// If the name existed return the player's level
if(player != null) {
    return player.level;
}
return -1;
/* End method */
```

### getPlayersByTeam(team)
Gets a list of objects that contain the `userID` and `userData` of all of the players in the specified `team`, which is an integer.
- 0: Spectator
- 1: Free For All
- 2: Red Team
- 3: Blue Team
- 4: Green Team
- 5: Yellow Team

Example
```javascript
//Switches everyone in team yellow to spectator
if(bonkAPI.getMyID() === bonkAPI.getHostID()) {
    // Contains a list of players in team yellow
    var yellow = bonkAPI.getPlayersByTeam(5);
    for(let i = 0; i < yellow.length; i++) {
        // Change own team
        if(yellow.userID === bonkAPI.getMyID()) {
            bonkAPI.sendPacket('42[6,{"targetTeam":0}]');
            continue;
        }
        // Change other's team
        bonkAPI.sendPacket('42[26,{"targetID":'+ yellow.userID +',"targetTeam":0}]');
    }
}
```

### Events
- someevents
- here
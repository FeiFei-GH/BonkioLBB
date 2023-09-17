require("dotenv").config();
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// Global Variables
var DCBotReady = false;
var bonkLoginToken = process.env.BonkLoginToken_LB;
var spiceBoxLoginToken = process.env.SpiceBoxLoginToken_LB;

client.on("ready", (c) => {
    DCBotReady = true;
    console.log(`${c.user.username} is online.`);
    
    sendBonkInfo(); // call it 1st so I dont have to wait
    sendSpiceBoxInfo(); // call it 1st so I dont have to wait
});

client.on("messageCreate", (msg) => {
    if (msg.author.bot) {
        return;
    }
    
    
});


// !My functions
const bonkGetRoomsJSON = async () => {
    try {
        const fetchRoomURL = "https://bonk2.io/scripts/getrooms.php";

        const fetchRoomHeaders = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://bonk.io/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }

        const fetchRoomData = `version=46&gl=n&token=${bonkLoginToken}`;

        const response = await fetch(fetchRoomURL, {
            headers: fetchRoomHeaders,
            body: fetchRoomData,
            method: "POST",
        });
        
        const responseJSON = await response.json();
        return responseJSON;
    } catch (err) {
        console.log("bonkGetRoomsJSON() failed");
        console.error(err);
    }
}

const spiceBoxGetRoomsJSON = async () => {
    try {
        const fetchRoomURL = "https://spicebox.multiplayer.gg/scripts/customroom_get.php";

        const fetchRoomHeaders = {
            'authority': 'spicebox.multiplayer.gg',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': '_ga=GA1.1.2047908670.1686891618; _ga_FRME6WE3K3=GS1.1.1687697968.41.0.1687697968.0.0.0',
            'origin': 'https://spicebox.multiplayer.gg',
            'referer': 'https://spicebox.multiplayer.gg/game.html',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }

        const fetchRoomData = `version=30&gl=n&token=${spiceBoxLoginToken}`;

        const response = await fetch(fetchRoomURL, {
            headers: fetchRoomHeaders,
            body: fetchRoomData,
            method: "POST",
        });
        
        const responseJSON = await response.json();
        return responseJSON;
    } catch (err) {
        console.log("spiceBoxGetRoomsJSON() failed");
        console.error(err);
    }
}

const getNewBLT = async () => {
    try {
        const fetchRoomURL = "https://bonk2.io/scripts/login_auto.php";

        const fetchRoomHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://bonk.io',
            'Connection': 'keep-alive',
            'Referer': 'https://bonk.io/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'TE': 'trailers'
        }

        const fetchRoomData = `rememberToken=${process.env.BonkRemberToken_LB}`;

        const response = await fetch(fetchRoomURL, {
            headers: fetchRoomHeaders,
            body: fetchRoomData,
            method: "POST",
        });
        
        const responseJSON = await response.json();
        return responseJSON.token;
    } catch (err) {
        console.log("getNewBLT() failed");
        console.error(err);
    }
}

const getNewSBLT = async () => {
    try {
        const fetchRoomURL = "https://spicebox.multiplayer.gg/scripts/login_auto_spice.php";

        const fetchRoomHeaders = {
            'authority': 'spicebox.multiplayer.gg',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': '_ga=GA1.1.2047908670.1686891618; _ga_FRME6WE3K3=GS1.1.1687700957.42.1.1687701304.0.0.0',
            'origin': 'https://spicebox.multiplayer.gg',
            'referer': 'https://spicebox.multiplayer.gg/game.html',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }

        const fetchRoomData = `rememberToken=${process.env.SpiceBoxRemberToken_LB}`;

        const response = await fetch(fetchRoomURL, {
            headers: fetchRoomHeaders,
            body: fetchRoomData,
            method: "POST",
        });
        
        const responseJSON = await response.json();
        return responseJSON.token;
    } catch (err) {
        console.log("getNewSBLT() failed");
        console.error(err);
    }
}

printBonkPkrRooms = (roomsJSON) => {
    let roomsArray = roomsJSON.rooms;
    
    let roomsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Live Bonk Parkour Rooms:")
        .setTimestamp();
    
    let noRoom = true;
    for (room of roomsArray) {
        if (room.roomname.toLowerCase().includes("parkour")) {
            noRoom = false;
            
            let mode = "Classic";
            let password = "No";
            
            if (room.mode_mo == "ar") {
                mode = "Arrows";
            } else if (room.mode_mo == "ard") {
                mode = "Death Arrows";
            } else if (room.mode_mo == "sp") {
                mode = "Grapple";
            } else if (room.mode_mo == "f") {
                mode = "Football";
            }
            
            if (room.password == 1) {
                password = "Yes";
            }
            
            roomsEmbed.addFields({
                name: `Room Name: ${room.roomname}`,
                value: `Mode: ${mode}\nPlayers: ${room.players}/${room.maxplayers}\nLevel Require: ${room.minlevel}-${room.maxlevel}\nCountry: ${room.country}\nPassword: ${password}`,
            });
        }
    }
    
    if (noRoom) {
        roomsEmbed.addFields({
            name: "No Parkour rooms available at the moment",
            value: "Please check back later :D",
        });
    }
    
    return roomsEmbed;
}

printSpiceBoxRooms = (roomsJSON) => {
    let roomsArray = roomsJSON.rooms;
    
    let roomsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Live SpiceBox Rooms:")
        .setTimestamp();
    
    let noRoom = true;
    for (room of roomsArray) {
        if (true) { // Guess I dont need filter right now
            noRoom = false;
            
            let mode = "Classic";
            let password = "No";
            
            if (room.mode_mo == "ar") {
                mode = "Arrows";
            } else if (room.mode_mo == "ard") {
                mode = "Death Arrows";
            } else if (room.mode_mo == "sp") {
                mode = "Grapple";
            } else if (room.mode_mo == "f") {
                mode = "Football";
            }
            
            if (room.password == 1) {
                password = "Yes";
            }
            
            roomsEmbed.addFields({
                name: `Room Name: ${room.roomname}`,
                value: `Players: ${room.players}/${room.maxplayers}\nCountry: ${room.country}\nPassword: ${password}`,
            });
        }
    }
    
    if (noRoom) {
        roomsEmbed.addFields({
            name: "No Parkour rooms available at the moment",
            value: "Please check back later :D",
        });
    }
    
    return roomsEmbed;
}

sendBonkInfo = async () => {
    console.log("Sending Bonk Info");
    
    let roomsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Live Bonk Parkour Rooms:")
        .addFields({
            name: "No Parkour rooms available at the moment",
            value: "Please check back later :D",
        })
        .setTimestamp();
    
    try {
        let roomsJSON = await bonkGetRoomsJSON();
        
        if (roomsJSON.r === 'fail' && roomsJSON.e === 'token') {
            console.log("Token Expired");
            bonkLoginToken = await getNewBLT();
        } else {
            roomsEmbed = printBonkPkrRooms(roomsJSON);
        }
    } catch (err) {
        console.log("failed getting bonk rooms");
        console.error(err);
    }
    
    if (DCBotReady) {
        try {
            const channel = client.channels.cache.get('1122510728331542579');
            const message = await channel.messages.fetch('1122529394922106930');
            //channel.send({ embeds: [roomsEmbed] }); // Use this to send a new message
            message.edit({ embeds: [roomsEmbed] });
        } catch (err) {
            console.log("failed sending bonk info to discord");
            console.error(err);
        }
    }
};

sendSpiceBoxInfo = async () => {
    console.log("Sending SpiceBox Info");
    
    let roomsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Live SpiceBox Rooms:")
        .addFields({
            name: "No rooms available at the moment",
            value: "Please check back later :D",
        })
        .setTimestamp();
    
    try {
        let roomsJSON = await spiceBoxGetRoomsJSON();
        
        if (roomsJSON.r === 'fail' && roomsJSON.e === 'token') {
            console.log("Token Expired");
            spiceBoxLoginToken = await getNewSBLT();
        } else {
            roomsEmbed = printSpiceBoxRooms(roomsJSON);
        }
    } catch (err) {
        console.log("failed getting spiceBox rooms");
        console.error(err);
    }
    
    if (DCBotReady) {
        try {
            const channel = client.channels.cache.get('1122510728331542579');
            const message = await channel.messages.fetch('1122529396398497873');
            //channel.send({ embeds: [roomsEmbed] }); // Use this to send a new message
            message.edit({ embeds: [roomsEmbed] });
        } catch (err) {
            console.log("failed sending spiceBox info to discord");
            console.error(err);
        }
    }
};



client.login(process.env.DCBOTTOKEN); // Let the discord bot login

let sendBonkInfoID = setInterval(sendBonkInfo, 10000);
let sendSpiceBoxInfoID = setInterval(sendSpiceBoxInfo, 10000);
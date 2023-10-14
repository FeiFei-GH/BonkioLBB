const dotenv = require("dotenv");
dotenv.config(); // Load sensitive information

const { Client, Intents, MessageEmbed } = require("discord.js");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_CONTENT,
    ],
});

// Common: Global variables
let DCBotReady = false;
let bonkLoginToken = process.env.BonkLoginToken_LB;

client.once("ready", () => {
    DCBotReady = true;
    console.log(`${client.user.username} is online.`);
    
    sendBonkInfo(); // Common: Call immediately to avoid waiting
});

client.on("messageCreate", (msg) => {
    if (msg.author.bot) {
        return;
    }
    
    // Common: Handle messages here
});

// Common: Custom functions
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

        const fetchRoomData = `version=48&gl=n&token=${bonkLoginToken}`;

        const response = await fetch(fetchRoomURL, {
            method: "POST",
            headers: fetchRoomHeaders,
            body: fetchRoomData,
        });
        
        const responseJSON = await response.json();
        return responseJSON;
    } catch (err) {
        console.log("bonkGetRoomsJSON() failed");
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

        const fetchRoomData = `rememberToken=${process.env.BonkRememberToken_LB}`;

        const response = await fetch(fetchRoomURL, {
            method: "POST",
            headers: fetchRoomHeaders,
            body: fetchRoomData,
        });
        
        const responseJSON = await response.json();
        return responseJSON.token;
    } catch (err) {
        console.log("getNewBLT() failed");
        console.error(err);
    }
}

const printBonkPkrRooms = (roomsJSON) => {
    let roomsArray = roomsJSON.rooms;
    
    let roomsEmbed = new MessageEmbed()
        .setColor("#0099FF")
        .setTitle("Live Bonk Parkour Rooms:")
        .setTimestamp();
    
    let noRoom = true;
    for (let room of roomsArray) {
        if (room.roomname.toLowerCase().includes("parkour")) {
            noRoom = false;
            
            let mode = "Classic";
            let password = "No";
            
            if (room.mode_mo === "ar") {
                mode = "Arrows";
            } else if (room.mode_mo === "ard") {
                mode = "Death Arrows";
            } else if (room.mode_mo === "sp") {
                mode = "Grapple";
            } else if (room.mode_mo === "f") {
                mode = "Football";
            }
            
            if (room.password === 1) {
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

const sendBonkInfo = async () => {
    let updateMsg = "Sending Bonk Info ";
    setTimeout(sendBonkInfo, 10000); // Common: Too fast and the bot will get rate-limited by the bonk.io server
    const now = new Date();
    console.log(`${updateMsg}${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`);
    let roomsEmbed = new MessageEmbed()
        .setColor("#0099FF")
        .setTitle("Live Bonk Parkour Rooms:")
        .addFields({
            name: "No Parkour rooms available at the moment",
            value: "Please check back later :D",
        })
        .setTimestamp(Date.now());
    
    try {
        let roomsJSON = await bonkGetRoomsJSON();
        console.log(JSON.stringify(roomsJSON, null, 2));
        if (roomsJSON.r === 'fail' && roomsJSON.e === 'token') {
            console.log("Token Expired");
            bonkLoginToken = await getNewBLT();
        } else {
            roomsEmbed = printBonkPkrRooms(roomsJSON);
        }
    } catch (err) {
        console.log("Failed getting bonk rooms");
        console.error(err);
    }
    
    if (DCBotReady) {
        try {
            const channel = client.channels.cache.get('1122510728331542579');
            const message = await channel.messages.fetch('1122529394922106930');
            //channel.send({ embeds: [roomsEmbed] }); // Common: Use this to send a new message
            message.edit({ embeds: [roomsEmbed] });
        } catch (err) {
            console.log("Failed sending bonk info to Discord");
            console.error(err);
        }
    }
};

void client.login(process.env.DCBOTTOKEN); // Let the Discord bot login

let sendBonkInfoID = sendBonkInfo;

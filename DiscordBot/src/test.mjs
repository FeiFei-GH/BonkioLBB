require("dotenv").config();

let spiceBoxLoginToken = process.env.SpiceBoxLoginToken_LB;

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

        console.log(process.env.SpiceBoxLoginToken_LB);
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

sendBonkInfo = async () => {
    let roomsJSON = await spiceBoxGetRoomsJSON();
    console.log(roomsJSON);
    
}

sendBonkInfo();
// ! Matching Bonk Version 48

const http = require("http");
const fs = require("fs");
const fsp = fs.promises;

class Bot {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.loggedin = false;
        this.token = "";
    }
    async fetchPOST(url, body_) {
        var data = { r: "fail", e: "" };
        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body_,
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (response) {
                data = response;
            });
        return data;
    }
    async login() {
        var data = await this.fetchPOST(
            "https://bonk2.io/scripts/login_legacy.php",
            "username=" + this.username + "&password=" + this.password + "&remember=false"
        );
        if (data["r"] == "fail") {
            return data["e"];
        }

        this.token = data.token;
        this.loggedin = true;
        return data["r"];
    }

    async favMap(id, unfav = false) {
        var data = await this.fetchPOST(
            "https://bonk2.io/scripts/map_fave.php",
            "token=" + this.token + "&mapid=" + id + "&action=" + (unfav ? "u" : "f")
        );
        if (data["r"] == "fail") {
            return data["e"];
        }
        return data["r"];
    }
}

var mybot = new Bot("username", "password");
var mapid = 0;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function dostuff() {
    console.log("Logged in: " + (await mybot.login()));
    while (true) {
        while (true) {
            var result = await mybot.favMap(mapid);
            if (result == "ratelimited") {
                break;
            }
            mapid++;
        }
        await sleep(420000);
        console.log(mapid);
    }
}

dostuff();

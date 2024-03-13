// ==UserScript==
// @name         bonkCopyBot
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Hum
// @author       Baglad
// @license MIT
// @match        https://*bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

window.skinMine = {};
skinMine.objectToSkinCode = function (skinObject) {
    let t = 1;//30 / 700;
    skinObject.shapes = skinObject.shapes.slice();
    var n = skinMine.fromHexToArray("0a070361000209");
    n = skinMine.concatTypedArrays(n, skinMine.specialConvertToBytes(2 * skinObject.shapes.length + 1));
    n = skinObject.shapes.length > 0 ? skinMine.concatTypedArrays(n, skinMine.fromHexToArray("010a0705616c000100")) : skinMine.concatTypedArrays(n, skinMine.fromHexToArray("010101"));
    for (var r = 0; r < skinObject.shapes.length; r++) {
        var o = skinObject.shapes[r];
        n = skinMine.concatTypedArrays(n, skinMine.specialConvertToBytes(o.shapeID));
        n = skinMine.l(n, o.scale / t);
        n = skinMine.l(n, o.rotation);
        n = skinMine.l(n, o.position.x / t);
        n = skinMine.l(n, o.position.y / t);
        n = skinMine.concatTypedArrays(n, skinMine.specialConvertToBytes(+o.hf));
        n = skinMine.concatTypedArrays(n, skinMine.specialConvertToBytes(+o.vf));
        n = skinMine.s(n, o.color);
        r !== skinObject.shapes.length - 1 && (n = skinMine.concatTypedArrays(n, skinMine.fromHexToArray("0a05000100")));
    }
    n = skinMine.s(n, skinObject.baseColor);
    return btoa(String.fromCharCode.apply(null, n));
}

skinMine.fromHexToArray = function (hexString) {
    return Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

skinMine.concatTypedArrays = function (a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

skinMine.specialConvertToBytes = function (e) {
    var t = e.toString(16);
    return skinMine.fromHexToArray(t.length < 2 ? "0" + t : t)
}

skinMine.l = function (e, t) {
    var i = new Float32Array(1);
    i[0] = t;
    var n = new Uint8Array(i.buffer);
    return skinMine.concatTypedArrays(e, n.reverse());
}
/*function l(e, t) {
    var n = h.Buffer.allocUnsafe(4); //makes uint8array of size 4
    return n.writeFloatBE(t, 0), //convert float to 4 bits
    concatTypedArrays(e, n)
}*/

skinMine.s = function (e, t) {
    return skinMine.concatTypedArrays(e, skinMine.fromHexToArray("00" + t.replace("#", "")))
}

skinMine.objectifySkin = function (skinData) {
    let jsonargs = JSON.parse(skinData);
    let dataLayers = jsonargs["layers"];
    let layers = [];
    for(let i = 0; i < dataLayers.length; i++) {
        let layer = {
            shapeID: dataLayers[i]["id"],
            scale: dataLayers[i]["scale"],
            rotation: dataLayers[i]["angle"],
            position: {
                x: dataLayers[i]["x"],
                y: dataLayers[i]["y"]
            },
            hf: dataLayers[i]["flipX"],
            vf: dataLayers[i]["flipY"],
            color: "#" + skinMine.decToHex(dataLayers[i]["color"]),
        };
        layers.push(layer);
    }

    let skin = {
        baseColor: "#" + skinMine.decToHex(jsonargs["bc"]),
        shapes: layers,
    };
    return skin;
}

skinMine.decToHex = function (d) {
    let h = d.toString(16);
    return h;
}

let skinBody = document.createElement("div");

let collectDiv = document.createElement("div");
collectDiv.id = "my-skin-holder";
collectDiv.classList.add("bonkhud-border-color");
collectDiv.style.borderBottom = "1px solid";
collectDiv.style.marginBottom = "5px";
//collectDiv.style.padding = "10px";

let collectPlayerContainer = document.createElement("div");
collectPlayerContainer.id = "my-skin-container";

let collectButton = bonkHUD.generateButton("Collect");
collectButton.bottom = "0";

collectDiv.appendChild(collectPlayerContainer);
collectDiv.appendChild(collectButton);

let skinChangeDiv = document.createElement("div");

let skinChangeInput = document.createElement("input");
skinChangeInput.setAttribute("type","text");
skinChangeInput.style.marginBottom = "5px";
skinChangeInput.style.width = "100%";

let skinChangeConfirm = bonkHUD.generateButton("Save");
skinChangeConfirm.style.marginBottom = "10px";
skinChangeConfirm.innerText = "Save";

skinChangeDiv.appendChild(skinChangeInput);
skinChangeDiv.appendChild(skinChangeConfirm);

let skinExportDiv = document.createElement("div");

let skinExportInput = document.createElement("input");
skinExportInput.setAttribute("type","text");
skinExportInput.style.marginBottom = "5px";
skinExportInput.style.width = "100%";

let skinExportConfirm = bonkHUD.generateButton("Export");

skinExportDiv.appendChild(skinExportInput);
skinExportDiv.appendChild(skinExportConfirm);

skinBody.appendChild(collectDiv);
skinBody.appendChild(skinChangeDiv);
skinBody.appendChild(skinExportDiv);

collectButton.addEventListener('click', (e) => {
    let list = bonkAPI.getPlayerList();

    let oldPlayerContainer = document.getElementById("my-skin-container");
    if(typeof oldPlayerContainer != null) {
        document.getElementById("my-skin-holder").removeChild(oldPlayerContainer);
    }
    let playerContainer = document.createElement("div");
    playerContainer.id = "my-skin-container";

    for(let i = 0; i < list.length; i++) {
        if(list[i]) {
            let skinHold = document.createElement("div");
            skinHold.classList.add("bonkhud-border-color");
            skinHold.style.height = "3rem";
            skinHold.style.display = "flex";
            skinHold.style.borderBottom = "1px solid";
            skinHold.style.alignItems = "center";
            skinHold.style.justifyContent = "space-between";
            skinHold.style.flexWrap = "wrap";
            let nameSpan = document.createElement("span");
            nameSpan.innerText = list[i].userName;
            let skinButton = bonkHUD.generateButton("Copy");
            skinButton.style.width = "3rem";
            skinButton.style.float = "right";

            skinHold.appendChild(nameSpan);
            skinHold.appendChild(skinButton);
            playerContainer.appendChild(skinHold);

            skinButton.addEventListener('click', (e) => {
                navigator.clipboard.writeText(JSON.stringify(list[i].avatar));
            });
        }
    }
    document.getElementById("my-skin-holder").prepend(playerContainer);
    bonkHUD.updateStyleSettings();
});

let myAvatar = "";

skinChangeConfirm.addEventListener('click', (e) => {
    myAvatar = skinChangeInput.value;
});

skinExportConfirm.addEventListener('click', (e) => {
    let skinToExport = skinExportInput.value;
    if(skinToExport != "") {
        let blSkin = skinMine.objectifySkin(skinToExport);
        let encodedSkin = encodeURIComponent(skinMine.objectToSkinCode(blSkin));
        window.open('https://bonkleagues.io/skins.html#unknown|unknown|' + encodedSkin, '_blank').focus();
    }
});

bonkAPI.events.fireEvent('block', {packet: "42[13"});

bonkAPI.addEventListener("sendJoin", function(e) {
    //console.log(e.avatar);
    let regex = /{"layers.*"bc".*?}/;
    if(myAvatar == "") {
        myAvatar = e.packet.match(regex);
    }
    let newPacket = e.packet.replace(regex, myAvatar);
    newPacket = newPacket.substring(0, newPacket.length - 1) + ',true]';
    bonkAPI.sendPacket(newPacket);
});

bonkHUD.createWindow("Skin Handle", "bonk-skinchanger", skinBody, "120");

let expDiv = document.createElement("div");

let delayLabel = document.createElement("label");
delayLabel.innerText = "Delay";

let delayInput = document.createElement("input");
delayInput.setAttribute("type","number");
delayInput.style.marginBottom = "10px";
delayInput.style.width = "100%";
delayInput.value = 3500;

let timesLabel = document.createElement("label");
timesLabel.innerText = "Times";

let timesInput = document.createElement("input");
timesInput.setAttribute("type","number");
timesInput.style.marginBottom = "10px";
timesInput.style.width = "100%";

let expConfirm = bonkHUD.generateButton("Go");

expDiv.appendChild(delayLabel);
expDiv.appendChild(delayInput);
expDiv.appendChild(timesLabel);
expDiv.appendChild(timesInput);
expDiv.appendChild(expConfirm);

let intervalGoing;

expConfirm.addEventListener('click', (e) => {
    //console.log(intervalGoing);
    if(!intervalGoing) {
        delayInput.disabled = true;
        timesInput.disabled = true;
        let i = timesInput.value;
        intervalGoing = setInterval(() => {
            if(i == 0) {
                delayInput.disabled = false;
                timesInput.disabled = false;
                expConfirm.innerText = "Go";
                clearInterval(intervalGoing);
                intervalGoing = null;
            }
            timesInput.value = i;
            bonkAPI.sendPacket("42[38]");
            i--;
        }, delayInput.value);
        expConfirm.innerText = "Cancel";
    }
    else {
        delayInput.disabled = false;
        timesInput.disabled = false;
        expConfirm.innerText = "Go";
        clearInterval(intervalGoing);
        intervalGoing = null;
    }
});

bonkHUD.createWindow("Exp Gain", "bonk-exp-gainer", expDiv, "120");

//<input type="text" id="ingamechatinputtext" spellcheck="false" autocomplete="one-time-code" class="js-bound" style="visibility: visible;">
//ingamechatcontent

let chatWindow = document.createElement("div");
let chatHold = document.createElement("div");
chatHold.classList.add("bonkhud-text-color");
chatHold.style.overflowY = "show";
let chatInput = document.createElement("input");
chatInput.classList.add("bonkhud-text-color");
chatInput.setAttribute("type","text");

let bonkInGameChat = document.getElementById("ingamechatcontent");

//let chatObserver =

/*bonkAPI.addEventListener("chatIn", function(e) {
    
});*/

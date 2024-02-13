// ==UserScript==
// @name         Leader Board Bot
// @namespace    http://tampermonkey.net/
// @version      1.0.47
// @description  Leader Board Bot
// @author       FeiFei + LEGEND
// @license MIT
// @match        https://bonk.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

function leaderBoardBot(func) {
    if (window.location == window.parent.location) {
        // Run Script only when document have loaded
        if (document.readyState == "complete") {
            func();
        } else {
            document.addEventListener("readystatechange", function () {
                setTimeout(func, 1500);
            });
        }
    }
}

// !Main Function!
leaderBoardBot(function () {
    // &Define Default Variables
    window.LBB = {};

    // Clear all previous intervals
    if (typeof LBB.loop30FPSID == "undefined") {
        LBB.loop30FPSID = true;
    } else {
        clearInterval(LBB.loop30FPSID);
    }

    // &When first time running script (also keep values when rerun script)
    if (typeof LBB.originalSend == "undefined") {
        LBB.originalSend = window.WebSocket.prototype.send;
    }
    if (typeof LBB.originalDrawCircle == "undefined") {
        LBB.originalDrawCircle = window.PIXI.Graphics.prototype.drawCircle;
    }
    if (typeof LBB.requestAnimationFrameOriginal == "undefined") {
        LBB.requestAnimationFrameOriginal = window.requestAnimationFrame;
    }
    if (typeof LBB.scale == "undefined") {
        LBB.scale = -1;
    }

    if (typeof LBB.bonkWSS == "undefined") {
        LBB.bonkWSS = 0;
    }
    if (typeof LBB.LZString == "undefined") {
        LBB.LZString = window.LZString;
    }
    if (typeof LBB.PSON == "undefined") {
        LBB.PSON = window.dcodeIO.PSON;
    }
    if (typeof LBB.bytebuffer == "undefined") {
        LBB.bytebuffer = window.dcodeIO.ByteBuffer;
    }
    if (typeof LBB.ISpsonpair == "undefined") {
        LBB.ISpsonpair = new window.dcodeIO.PSON.StaticPair([
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
    }
    // ^Don't mind this super long line...

    // My custom vars
    if (typeof LBB.currentPlayerIDs == "undefined") {
        LBB.currentPlayerIDs = {};
    }
    if (typeof LBB.unfinishedPlayerIDs == "undefined") {
        LBB.unfinishedPlayerIDs = new Set();
    }
    if (typeof LBB.myID == "undefined") {
        LBB.myID = -1;
    }
    if (typeof LBB.hostID == "undefined") {
        LBB.hostID = -1;
    }
    if (typeof LBB.decodedCurrentMap == "undefined") {
        LBB.decodedCurrentMap = {};
    }
    if (typeof LBB.currentPPM == "undefined") {
        LBB.currentPPM = -1;
    }
    if (typeof LBB.currentCapZones == "undefined") {
        LBB.currentCapZones = [];
    }

    if (typeof LBB.mapRecordsData == "undefined") {
        LBB.mapRecordsData = new Map();
    }

    // Local vars (resets everytime)
    LBB.joinText = "Welcome username! You will be joining shortly";
    LBB.joinText2 = "Welcome username! You will be joining shortly, game auto restarts after timer minutes";
    LBB.winText = "username finishes with: ";
    LBB.pbText = "Nice! username just got new PB: ";
    LBB.wrText = "Congratulations! username just got new WR: ";
    LBB.startText = "Timer Starts!"; // Timer Starts! // GO!
    LBB.currentMode = "";
    LBB.gameStartTimeStamp = -1;
    LBB.firstFinishTimeStamp = -1;
    LBB.instaDelay = 2;
    LBB.isInstaStart = false;
    LBB.firstFinish = true;
    LBB.matchEnds = true;

    // those are likely to change during running
    LBB.timeBetweenRounds = 7000;
    LBB.autoRestartTimer = 6000000; // in ms
    LBB.matchEndsAfterFinish = 9000;

    // Start all loops
    LBB.loop30FPSID = setInterval(loop30FPS, 33.33);

    // !Map Decoder
    // #region Map decoder
    if (typeof LBB.textdecoder == "undefined") {
        LBB.textdecoder = new window.TextDecoder();
    }
    if (typeof LBB.textencoder == "undefined") {
        LBB.textencoder = new window.TextEncoder();
    }

    class bytebuffer2 {
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
            return textdecoder.decode(d6I[1]);
        }
        writeUTF(L3Z) {
            var Z75 = [arguments];
            Z75[4] = textencoder.encode(Z75[0][0]);
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

    LBB.ISdecode = function (rawdata) {
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

        data_deLZd = LZString.decompressFromEncodedURIComponent(rawdata_caseflipped);
        databuffer = bytebuffer.fromBase64(data_deLZd);
        data = ISpsonpair.decode(databuffer.buffer);
        return data;
    };

    LBB.ISencode = function (obj) {
        data = ISpsonpair.encode(obj);
        b64 = data.toBase64();
        lzd = LZString.compressToEncodedURIComponent(b64);

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

    LBB.decodeIS = function (x) {
        return ISdecode(x);
    };
    LBB.encodeIS = function (x) {
        return ISencode(x);
    };

    encodeToDatabase = function (mapObject) {
        var H_B = [arguments];
        H_B[2] = new bytebuffer2();
        H_B[5] = mapObject.physics;
        mapObject.v = 13;
        H_B[2].writeShort(mapObject.v);
        H_B[2].writeBoolean(mapObject.s.re);
        H_B[2].writeBoolean(mapObject.s.nc);
        H_B[2].writeShort(mapObject.s.pq);
        H_B[2].writeFloat(mapObject.s.gd);
        H_B[2].writeBoolean(mapObject.s.fl);
        H_B[2].writeUTF(mapObject.m.rxn);
        H_B[2].writeUTF(mapObject.m.rxa);
        H_B[2].writeUint(mapObject.m.rxid);
        H_B[2].writeShort(mapObject.m.rxdb);
        H_B[2].writeUTF(mapObject.m.n);
        H_B[2].writeUTF(mapObject.m.a);
        H_B[2].writeUint(mapObject.m.vu);
        H_B[2].writeUint(mapObject.m.vd);
        H_B[2].writeShort(mapObject.m.cr.length);
        for (H_B[62] = 0; H_B[62] < mapObject.m.cr.length; H_B[62]++) {
            H_B[2].writeUTF(mapObject.m.cr[H_B[62]]);
        }
        H_B[2].writeUTF(mapObject.m.mo);
        H_B[2].writeInt(mapObject.m.dbid);
        H_B[2].writeBoolean(mapObject.m.pub);
        H_B[2].writeInt(mapObject.m.dbv);
        H_B[2].writeShort(H_B[5].ppm);
        H_B[2].writeShort(H_B[5].bro.length);
        for (H_B[31] = 0; H_B[31] < H_B[5].bro.length; H_B[31]++) {
            H_B[2].writeShort(H_B[5].bro[H_B[31]]);
        }
        H_B[2].writeShort(H_B[5].shapes.length);
        for (H_B[61] = 0; H_B[61] < H_B[5].shapes.length; H_B[61]++) {
            H_B[3] = H_B[5].shapes[H_B[61]];
            if (H_B[3].type == "bx") {
                H_B[2].writeShort(1);
                H_B[2].writeDouble(H_B[3].w);
                H_B[2].writeDouble(H_B[3].h);
                H_B[2].writeDouble(H_B[3].c[0]);
                H_B[2].writeDouble(H_B[3].c[1]);
                H_B[2].writeDouble(H_B[3].a);
                H_B[2].writeBoolean(H_B[3].sk);
            }
            if (H_B[3].type == "ci") {
                H_B[2].writeShort(2);
                H_B[2].writeDouble(H_B[3].r);
                H_B[2].writeDouble(H_B[3].c[0]);
                H_B[2].writeDouble(H_B[3].c[1]);
                H_B[2].writeBoolean(H_B[3].sk);
            }
            if (H_B[3].type == "po") {
                H_B[2].writeShort(3);
                H_B[2].writeDouble(H_B[3].s);
                H_B[2].writeDouble(H_B[3].a);
                H_B[2].writeDouble(H_B[3].c[0]);
                H_B[2].writeDouble(H_B[3].c[1]);
                H_B[2].writeShort(H_B[3].v.length);
                for (H_B[45] = 0; H_B[45] < H_B[3].v.length; H_B[45]++) {
                    H_B[2].writeDouble(H_B[3].v[H_B[45]][0]);
                    H_B[2].writeDouble(H_B[3].v[H_B[45]][1]);
                }
            }
        }
        H_B[2].writeShort(H_B[5].fixtures.length);
        for (H_B[88] = 0; H_B[88] < H_B[5].fixtures.length; H_B[88]++) {
            H_B[4] = H_B[5].fixtures[H_B[88]];
            H_B[2].writeShort(H_B[4].sh);
            H_B[2].writeUTF(H_B[4].n);
            if (H_B[4].fr === null) {
                H_B[2].writeDouble(Number.MAX_VALUE);
            } else {
                H_B[2].writeDouble(H_B[4].fr);
            }
            if (H_B[4].fp === null) {
                H_B[2].writeShort(0);
            }
            if (H_B[4].fp === false) {
                H_B[2].writeShort(1);
            }
            if (H_B[4].fp === true) {
                H_B[2].writeShort(2);
            }
            if (H_B[4].re === null) {
                H_B[2].writeDouble(Number.MAX_VALUE);
            } else {
                H_B[2].writeDouble(H_B[4].re);
            }
            if (H_B[4].de === null) {
                H_B[2].writeDouble(Number.MAX_VALUE);
            } else {
                H_B[2].writeDouble(H_B[4].de);
            }
            H_B[2].writeUint(H_B[4].f);
            H_B[2].writeBoolean(H_B[4].d);
            H_B[2].writeBoolean(H_B[4].np);
            H_B[2].writeBoolean(H_B[4].ng);
            H_B[2].writeBoolean(H_B[4].ig);
        }
        H_B[2].writeShort(H_B[5].bodies.length);
        for (H_B[41] = 0; H_B[41] < H_B[5].bodies.length; H_B[41]++) {
            H_B[9] = H_B[5].bodies[H_B[41]];
            H_B[2].writeUTF(H_B[9].type);
            H_B[2].writeUTF(H_B[9].n);
            H_B[2].writeDouble(H_B[9].p[0]);
            H_B[2].writeDouble(H_B[9].p[1]);
            H_B[2].writeDouble(H_B[9].a);
            H_B[2].writeDouble(H_B[9].fric);
            H_B[2].writeBoolean(H_B[9].fricp);
            H_B[2].writeDouble(H_B[9].re);
            H_B[2].writeDouble(H_B[9].de);
            H_B[2].writeDouble(H_B[9].lv[0]);
            H_B[2].writeDouble(H_B[9].lv[1]);
            H_B[2].writeDouble(H_B[9].av);
            H_B[2].writeDouble(H_B[9].ld);
            H_B[2].writeDouble(H_B[9].ad);
            H_B[2].writeBoolean(H_B[9].fr);
            H_B[2].writeBoolean(H_B[9].bu);
            H_B[2].writeDouble(H_B[9].cf.x);
            H_B[2].writeDouble(H_B[9].cf.y);
            H_B[2].writeDouble(H_B[9].cf.ct);
            H_B[2].writeBoolean(H_B[9].cf.w);
            H_B[2].writeShort(H_B[9].f_c);
            H_B[2].writeBoolean(H_B[9].f_1);
            H_B[2].writeBoolean(H_B[9].f_2);
            H_B[2].writeBoolean(H_B[9].f_3);
            H_B[2].writeBoolean(H_B[9].f_4);
            H_B[2].writeBoolean(H_B[9].f_p);
            H_B[2].writeShort(H_B[9].fx.length);
            for (H_B[78] = 0; H_B[78] < H_B[9].fx.length; H_B[78]++) {
                H_B[2].writeShort(H_B[9].fx[H_B[78]]);
            }
        }
        H_B[2].writeShort(mapObject.spawns.length);
        for (H_B[74] = 0; H_B[74] < mapObject.spawns.length; H_B[74]++) {
            H_B[6] = mapObject.spawns[H_B[74]];
            H_B[2].writeDouble(H_B[6].x);
            H_B[2].writeDouble(H_B[6].y);
            H_B[2].writeDouble(H_B[6].xv);
            H_B[2].writeDouble(H_B[6].yv);
            H_B[2].writeShort(H_B[6].priority);
            H_B[2].writeBoolean(H_B[6].r);
            H_B[2].writeBoolean(H_B[6].f);
            H_B[2].writeBoolean(H_B[6].b);
            H_B[2].writeBoolean(H_B[6].gr);
            H_B[2].writeBoolean(H_B[6].ye);
            H_B[2].writeUTF(H_B[6].n);
        }
        H_B[2].writeShort(mapObject.capZones.length);
        for (H_B[48] = 0; H_B[48] < mapObject.capZones.length; H_B[48]++) {
            H_B[1] = mapObject.capZones[H_B[48]];
            H_B[2].writeUTF(H_B[1].n);
            H_B[2].writeDouble(H_B[1].l);
            H_B[2].writeShort(H_B[1].i);
            H_B[2].writeShort(H_B[1].ty);
        }
        H_B[2].writeShort(H_B[5].joints.length);
        for (H_B[69] = 0; H_B[69] < H_B[5].joints.length; H_B[69]++) {
            H_B[8] = H_B[5].joints[H_B[69]];
            if (H_B[8].type == "rv") {
                H_B[2].writeShort(1);
                H_B[2].writeDouble(H_B[8].d.la);
                H_B[2].writeDouble(H_B[8].d.ua);
                H_B[2].writeDouble(H_B[8].d.mmt);
                H_B[2].writeDouble(H_B[8].d.ms);
                H_B[2].writeBoolean(H_B[8].d.el);
                H_B[2].writeBoolean(H_B[8].d.em);
                H_B[2].writeDouble(H_B[8].aa[0]);
                H_B[2].writeDouble(H_B[8].aa[1]);
            }
            if (H_B[8].type == "d") {
                H_B[2].writeShort(2);
                H_B[2].writeDouble(H_B[8].d.fh);
                H_B[2].writeDouble(H_B[8].d.dr);
                H_B[2].writeDouble(H_B[8].aa[0]);
                H_B[2].writeDouble(H_B[8].aa[1]);
                H_B[2].writeDouble(H_B[8].ab[0]);
                H_B[2].writeDouble(H_B[8].ab[1]);
            }
            if (H_B[8].type == "lpj") {
                H_B[2].writeShort(3);
                H_B[2].writeDouble(H_B[8].pax);
                H_B[2].writeDouble(H_B[8].pay);
                H_B[2].writeDouble(H_B[8].pa);
                H_B[2].writeDouble(H_B[8].pf);
                H_B[2].writeDouble(H_B[8].pl);
                H_B[2].writeDouble(H_B[8].pu);
                H_B[2].writeDouble(H_B[8].plen);
                H_B[2].writeDouble(H_B[8].pms);
            }
            if (H_B[8].type == "lsj") {
                H_B[2].writeShort(4);
                H_B[2].writeDouble(H_B[8].sax);
                H_B[2].writeDouble(H_B[8].say);
                H_B[2].writeDouble(H_B[8].sf);
                H_B[2].writeDouble(H_B[8].slen);
            }
            H_B[2].writeShort(H_B[8].ba);
            H_B[2].writeShort(H_B[8].bb);
            H_B[2].writeBoolean(H_B[8].d.cc);
            H_B[2].writeDouble(H_B[8].d.bf);
            H_B[2].writeBoolean(H_B[8].d.dl);
        }
        H_B[15] = H_B[2].toBase64();
        H_B[30] = LZString.compressToEncodedURIComponent(H_B[15]);
        return H_B[30];
    };

    LBB.decodeFromDatabase = function (map) {
        var a8k = [arguments];
        b64mapdata = LZString.decompressFromEncodedURIComponent(map);
        var binaryReader = new bytebuffer2();
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
        map.v = binaryReader.readShort();
        if (map.v > 13) {
            throw new Error("New map format, this script needs to be updated.");
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
            cr_count = binaryReader.readShort();
            for (cr_iterator = 0; cr_iterator < cr_count; cr_iterator++) {
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
        bro_count = binaryReader.readShort();
        for (bro_iterator = 0; bro_iterator < bro_count; bro_iterator++) {
            map.physics.bro[bro_iterator] = binaryReader.readShort();
        }
        shape_count = binaryReader.readShort();
        for (shape_iterator = 0; shape_iterator < shape_count; shape_iterator++) {
            shape_type = binaryReader.readShort();
            if (shape_type == 1) {
                map.physics.shapes[shape_iterator] = { type: "bx", w: 10, h: 40, c: [0, 0], a: 0, sk: false };
                map.physics.shapes[shape_iterator].w = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].h = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                map.physics.shapes[shape_iterator].a = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].sk = binaryReader.readBoolean();
            }
            if (shape_type == 2) {
                map.physics.shapes[shape_iterator] = { type: "ci", r: 25, c: [0, 0], sk: false };
                map.physics.shapes[shape_iterator].r = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                map.physics.shapes[shape_iterator].sk = binaryReader.readBoolean();
            }
            if (shape_type == 3) {
                map.physics.shapes[shape_iterator] = { type: "po", v: [], s: 1, a: 0, c: [0, 0] };
                map.physics.shapes[shape_iterator].s = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].a = binaryReader.readDouble();
                map.physics.shapes[shape_iterator].c = [binaryReader.readDouble(), binaryReader.readDouble()];
                point_count = binaryReader.readShort();
                map.physics.shapes[shape_iterator].v = [];
                for (point_iterator = 0; point_iterator < point_count; point_iterator++) {
                    map.physics.shapes[shape_iterator].v.push([
                        binaryReader.readDouble(),
                        binaryReader.readDouble(),
                    ]);
                }
            }
        }
        a8k[31] = binaryReader.readShort();
        for (a8k[89] = 0; a8k[89] < a8k[31]; a8k[89]++) {
            map.physics.fixtures[a8k[89]] = {
                n: "Def Fix",
                fr: 0.3,
                fp: null,
                re: 0.8,
                de: 0.3,
                f: 5209260,
                d: false,
                np: false,
                ng: false,
            };
            map.physics.fixtures[a8k[89]].sh = binaryReader.readShort();
            map.physics.fixtures[a8k[89]].n = binaryReader.readUTF();
            map.physics.fixtures[a8k[89]].fr = binaryReader.readDouble();
            if (map.physics.fixtures[a8k[89]].fr == Number.MAX_VALUE) {
                map.physics.fixtures[a8k[89]].fr = null;
            }
            a8k[22] = binaryReader.readShort();
            if (a8k[22] == 0) {
                map.physics.fixtures[a8k[89]].fp = null;
            }
            if (a8k[22] == 1) {
                map.physics.fixtures[a8k[89]].fp = false;
            }
            if (a8k[22] == 2) {
                map.physics.fixtures[a8k[89]].fp = true;
            }
            map.physics.fixtures[a8k[89]].re = binaryReader.readDouble();
            if (map.physics.fixtures[a8k[89]].re == Number.MAX_VALUE) {
                map.physics.fixtures[a8k[89]].re = null;
            }
            map.physics.fixtures[a8k[89]].de = binaryReader.readDouble();
            if (map.physics.fixtures[a8k[89]].de == Number.MAX_VALUE) {
                map.physics.fixtures[a8k[89]].de = null;
            }
            map.physics.fixtures[a8k[89]].f = binaryReader.readUint();
            map.physics.fixtures[a8k[89]].d = binaryReader.readBoolean();
            map.physics.fixtures[a8k[89]].np = binaryReader.readBoolean();
            if (map.v >= 11) {
                map.physics.fixtures[a8k[89]].ng = binaryReader.readBoolean();
            }
            if (map.v >= 12) {
                map.physics.fixtures[a8k[89]].ig = binaryReader.readBoolean();
            }
        }
        a8k[41] = binaryReader.readShort();
        for (a8k[20] = 0; a8k[20] < a8k[41]; a8k[20]++) {
            map.physics.bodies[a8k[20]] = {
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
            };
            map.physics.bodies[a8k[20]].type = binaryReader.readUTF();
            map.physics.bodies[a8k[20]].n = binaryReader.readUTF();
            map.physics.bodies[a8k[20]].p = [binaryReader.readDouble(), binaryReader.readDouble()];
            map.physics.bodies[a8k[20]].a = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].fric = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].fricp = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].re = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].de = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].lv = [binaryReader.readDouble(), binaryReader.readDouble()];
            map.physics.bodies[a8k[20]].av = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].ld = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].ad = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].fr = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].bu = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].cf.x = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].cf.y = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].cf.ct = binaryReader.readDouble();
            map.physics.bodies[a8k[20]].cf.w = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_c = binaryReader.readShort();
            map.physics.bodies[a8k[20]].f_1 = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_2 = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_3 = binaryReader.readBoolean();
            map.physics.bodies[a8k[20]].f_4 = binaryReader.readBoolean();
            if (map.v >= 2) {
                map.physics.bodies[a8k[20]].f_p = binaryReader.readBoolean();
            }
            a8k[50] = binaryReader.readShort();
            for (a8k[66] = 0; a8k[66] < a8k[50]; a8k[66]++) {
                map.physics.bodies[a8k[20]].fx.push(binaryReader.readShort());
            }
        }
        a8k[48] = binaryReader.readShort();
        for (a8k[36] = 0; a8k[36] < a8k[48]; a8k[36]++) {
            map.spawns[a8k[36]] = {
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
            a8k[80] = map.spawns[a8k[36]];
            a8k[80].x = binaryReader.readDouble();
            a8k[80].y = binaryReader.readDouble();
            a8k[80].xv = binaryReader.readDouble();
            a8k[80].yv = binaryReader.readDouble();
            a8k[80].priority = binaryReader.readShort();
            a8k[80].r = binaryReader.readBoolean();
            a8k[80].f = binaryReader.readBoolean();
            a8k[80].b = binaryReader.readBoolean();
            a8k[80].gr = binaryReader.readBoolean();
            a8k[80].ye = binaryReader.readBoolean();
            a8k[80].n = binaryReader.readUTF();
        }
        a8k[40] = binaryReader.readShort();
        for (a8k[18] = 0; a8k[18] < a8k[40]; a8k[18]++) {
            map.capZones[a8k[18]] = { n: "Cap Zone", ty: 1, l: 10, i: -1 };
            map.capZones[a8k[18]].n = binaryReader.readUTF();
            map.capZones[a8k[18]].l = binaryReader.readDouble();
            map.capZones[a8k[18]].i = binaryReader.readShort();
            if (map.v >= 6) {
                map.capZones[a8k[18]].ty = binaryReader.readShort();
            }
        }
        a8k[39] = binaryReader.readShort();
        for (a8k[94] = 0; a8k[94] < a8k[39]; a8k[94]++) {
            a8k[75] = binaryReader.readShort();
            if (a8k[75] == 1) {
                map.physics.joints[a8k[94]] = {
                    type: "rv",
                    d: { la: 0, ua: 0, mmt: 0, ms: 0, el: false, em: false, cc: false, bf: 0, dl: true },
                    aa: [0, 0],
                };
                a8k[53] = map.physics.joints[a8k[94]];
                a8k[53].d.la = binaryReader.readDouble();
                a8k[53].d.ua = binaryReader.readDouble();
                a8k[53].d.mmt = binaryReader.readDouble();
                a8k[53].d.ms = binaryReader.readDouble();
                a8k[53].d.el = binaryReader.readBoolean();
                a8k[53].d.em = binaryReader.readBoolean();
                a8k[53].aa = [binaryReader.readDouble(), binaryReader.readDouble()];
            }
            if (a8k[75] == 2) {
                map.physics.joints[a8k[94]] = {
                    type: "d",
                    d: { fh: 0, dr: 0, cc: false, bf: 0, dl: true },
                    aa: [0, 0],
                    ab: [0, 0],
                };
                a8k[27] = map.physics.joints[a8k[94]];
                a8k[27].d.fh = binaryReader.readDouble();
                a8k[27].d.dr = binaryReader.readDouble();
                a8k[27].aa = [binaryReader.readDouble(), binaryReader.readDouble()];
                a8k[27].ab = [binaryReader.readDouble(), binaryReader.readDouble()];
            }
            if (a8k[75] == 3) {
                map.physics.joints[a8k[94]] = {
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
                a8k[23] = map.physics.joints[a8k[94]];
                a8k[23].pax = binaryReader.readDouble();
                a8k[23].pay = binaryReader.readDouble();
                a8k[23].pa = binaryReader.readDouble();
                a8k[23].pf = binaryReader.readDouble();
                a8k[23].pl = binaryReader.readDouble();
                a8k[23].pu = binaryReader.readDouble();
                a8k[23].plen = binaryReader.readDouble();
                a8k[23].pms = binaryReader.readDouble();
            }
            if (a8k[75] == 4) {
                map.physics.joints[a8k[94]] = {
                    type: "lsj",
                    d: { cc: false, bf: 0, dl: true },
                    sax: 0,
                    say: 0,
                    sf: 0,
                    slen: 0,
                };
                a8k[47] = map.physics.joints[a8k[94]];
                a8k[47].sax = binaryReader.readDouble();
                a8k[47].say = binaryReader.readDouble();
                a8k[47].sf = binaryReader.readDouble();
                a8k[47].slen = binaryReader.readDouble();
            }
            map.physics.joints[a8k[94]].ba = binaryReader.readShort();
            map.physics.joints[a8k[94]].bb = binaryReader.readShort();
            map.physics.joints[a8k[94]].d.cc = binaryReader.readBoolean();
            map.physics.joints[a8k[94]].d.bf = binaryReader.readDouble();
            map.physics.joints[a8k[94]].d.dl = binaryReader.readBoolean();
        }
        return map;
    };
    // #endregion

    // !Overriding bonkWSS
    // #region Overriding bonkWSS
    window.WebSocket.prototype.send = function (args) {
        if (this.url.includes(".bonk.io/socket.io/?EIO=3&transport=websocket&sid=")) {
            LBB.bonkWSS = this;

            if (!this.injected) {
                // initialize overriding receive listener (only run once)
                this.injected = true;
                LBB.originalReceive = this.onmessage;

                // This function intercepts incoming packets
                this.onmessage = function (args) {
                    // &Receiving incoming packets
                    if (args.data.startsWith("42[1,")) {
                        // *Update Pings
                    } else if (args.data.startsWith("42[3,")) {
                        // *Room join
                        args = receive_RoomJoin(args);
                    } else if (args.data.startsWith("42[4,")) {
                        // *Player join
                        args = receive_PlayerJoin(args);
                    } else if (args.data.startsWith("42[5,")) {
                        // *Player leave
                        args = receive_PlayerLeave(args);
                    } else if (args.data.startsWith("42[6,")) {
                        // *Host leave
                        args = receive_HostLeave(args);
                    } else if (args.data.startsWith("42[7,")) {
                        // *Inputs
                        args = receive_Inputs(args);
                    } else if (args.data.startsWith("42[8,")) {
                        // *Ready Change
                    } else if (args.data.startsWith("42[13,")) {
                        // *Game End
                    } else if (args.data.startsWith("42[15,")) {
                        // *Game Start
                        args = receive_GameStart(args);
                    } else if (args.data.startsWith("42[16,")) {
                        // *Error
                    } else if (args.data.startsWith("42[18,")) {
                        // *Team Change
                        args = receive_TeamChange(args);
                    } else if (args.data.startsWith("42[19,")) {
                        // *Teamlock toggle
                    } else if (args.data.startsWith("42[20,")) {
                        // *Chat Message
                        args = receive_ChatMessage(args);
                    } else if (args.data.startsWith("42[21,")) {
                        // *Initial data
                    } else if (args.data.startsWith("42[24,")) {
                        // *Kicked
                    } else if (args.data.startsWith("42[26,")) {
                        // *Mode change
                        args = receive_ModeChange(args);
                    } else if (args.data.startsWith("42[27,")) {
                        // *Change WL (Rounds)
                    } else if (args.data.startsWith("42[29,")) {
                        // *Map switch
                        args = receive_MapSwitch(args);
                    } else if (args.data.startsWith("42[32,")) {
                        // *inactive?
                    } else if (args.data.startsWith("42[33,")) {
                        // *Map Suggest
                    } else if (args.data.startsWith("42[34,")) {
                        // *Map Suggest Client
                    } else if (args.data.startsWith("42[36,")) {
                        // *Player Balance Change
                    } else if (args.data.startsWith("42[40,")) {
                        // *Save Replay
                    } else if (args.data.startsWith("42[41,")) {
                        // *New Host
                        args = receive_NewHost(args);
                    } else if (args.data.startsWith("42[42,")) {
                        // *Friend Req
                        args = receive_FriendReq(args);
                    } else if (args.data.startsWith("42[43,")) {
                        // *Game starting Countdown
                    } else if (args.data.startsWith("42[44,")) {
                        // *Abort Countdown
                    } else if (args.data.startsWith("42[45,")) {
                        // *Player Leveled Up
                    } else if (args.data.startsWith("42[46,")) {
                        // *Local Gained XP
                    } else if (args.data.startsWith("42[49,")) {
                        // *Created Room Share Link
                    } else if (args.data.startsWith("42[52,")) {
                        // *Tabbed
                    } else if (args.data.startsWith("42[58,")) {
                        // *Room Name Update
                    } else if (args.data.startsWith("42[59,")) {
                        // *Room Password Update
                    }

                    return LBB.originalReceive.call(this, args);
                };

                LBB.originalClose = this.onclose;
                this.onclose = function () {
                    LBB.bonkWSS = 0;
                    return LBB.originalClose.call(this);
                };
            } else {
                // &Sending outgoing packets
                if (args.startsWith("42[4,")) {
                    // *Send Inputs
                    args = send_SendInputs(args);
                } else if (args.startsWith("42[5,")) {
                    // *Trigger Start
                    args = send_TriggerStart(args);
                } else if (args.startsWith("42[6,")) {
                    // *Change Own Team
                } else if (args.startsWith("42[7,")) {
                    // *Team Lock
                } else if (args.startsWith("42[9,")) {
                    // *Kick/Ban Player
                } else if (args.startsWith("42[10,")) {
                    // *Chat Message
                } else if (args.startsWith("42[11,")) {
                    // *Inform In Lobby
                } else if (args.startsWith("42[12,")) {
                    // *Create Room
                    args = send_CreatRoom(args);
                } else if (args.startsWith("42[14,")) {
                    // *Return To Lobby
                } else if (args.startsWith("42[16,")) {
                    // *Set Ready
                } else if (args.startsWith("42[17,")) {
                    // *All Ready Reset
                } else if (args.startsWith("42[19,")) {
                    // *Send Map Reorder
                } else if (args.startsWith("42[20,")) {
                    // *Send Mode
                } else if (args.startsWith("42[21,")) {
                    // *Send WL (Rounds)
                } else if (args.startsWith("42[22,")) {
                    // *Send Map Delete
                } else if (args.startsWith("42[23,")) {
                    // *Send Map Add
                    args = send_MapAdd(args);
                } else if (args.startsWith("42[26,")) {
                    // *Change Other Team
                } else if (args.startsWith("42[27,")) {
                    // *Send Map Suggest
                } else if (args.startsWith("42[29,")) {
                    // *Send Balance
                } else if (args.startsWith("42[32,")) {
                    // *Send Team Settings Change
                } else if (args.startsWith("42[33,")) {
                    // *Send Arm Record
                } else if (args.startsWith("42[34,")) {
                    // *Send Host Change
                } else if (args.startsWith("42[35,")) {
                    // *Send Friended
                } else if (args.startsWith("42[36,")) {
                    // *Send Start Countdown
                } else if (args.startsWith("42[37,")) {
                    // *Send Abort Countdown
                } else if (args.startsWith("42[38,")) {
                    // *Send Req XP
                } else if (args.startsWith("42[39,")) {
                    // *Send Map Vote
                } else if (args.startsWith("42[40,")) {
                    // *Inform In Game
                } else if (args.startsWith("42[41,")) {
                    // *Get Pre Vote
                    console.log(args);
                } else if (args.startsWith("42[44,")) {
                    // *Tabbed
                } else if (args.startsWith("42[50,")) {
                    // *Send No Host Swap
                }
            }
        }

        return LBB.originalSend.call(this, args);
    };

    // Send a packet to server
    LBB.sendPacket = function (packet) {
        if (LBB.bonkWSS != 0) {
            LBB.bonkWSS.send(packet);
        }
    };

    // Make client receive a packet
    LBB.receivePacket = function (packet) {
        if (LBB.bonkWSS != 0) {
            LBB.bonkWSS.onmessage({ data: packet });
        }
    };

    // &Receive Handler Functions
    LBB.receive_RoomJoin = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        currentPlayerIDs = {};
        myID = jsonargs[1];
        hostID = jsonargs[2];

        for (var i = 0; i < jsonargs[3].length; i++) {
            if (jsonargs[3][i] != null) {
                currentPlayerIDs[i.toString()] = jsonargs[3][i];
            }
        }

        return args;
    };

    LBB.receive_PlayerJoin = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        currentPlayerIDs[jsonargs[1]] = {
            peerID: jsonargs[2],
            userName: jsonargs[3],
            guest: jsonargs[4],
            level: jsonargs[5],
            team: jsonargs[6],
            avatar: jsonargs[7],
        };

        if (joinText != "" || joinText2 != "") {
            if (autoRestartTimer < 180000) {
                chat(
                    joinText2
                        .replaceAll("username", jsonargs[3])
                        .replaceAll("timer", autoRestartTimer / 60000)
                );
            } else {
                chat(joinText.replaceAll("username", jsonargs[3]));
            }
        }
        return args;
    };

    LBB.receive_PlayerLeave = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));

        if (typeof currentPlayerIDs[jsonargs[1]] != "undefined") {
            delete currentPlayerIDs[jsonargs[1]];
            unfinishedPlayerIDs.delete(jsonargs[1].toString());
        }
        return args;
    };

    LBB.receive_HostLeave = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));

        if (typeof currentPlayerIDs[jsonargs[1]] != "undefined") {
            delete currentPlayerIDs[jsonargs[1]];
            unfinishedPlayerIDs.delete(jsonargs[1].toString());
        }
        hostID = jsonargs[2];

        return args;
    };

    LBB.receive_Inputs = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));

        return args;
    };

    //! Detects when match starts!!!
    LBB.receive_GameStart = function (args) {
        gameStartTimeStamp = Date.now();
        firstFinishTimeStamp = -1;
        firstFinish = true;
        matchEnds = false;

        // Check who is playing
        unfinishedPlayerIDs = new Set(Object.keys(currentPlayerIDs));
        for (const id of unfinishedPlayerIDs) {
            if (currentPlayerIDs[id].team == 0) {
                unfinishedPlayerIDs.delete(id);
            }
        }

        if (startText != "") {
            chat(startText);
        }

        return args;
    };

    LBB.receive_TeamChange = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        currentPlayerIDs[jsonargs[1]].team = jsonargs[2];

        return args;
    };

    LBB.receive_ChatMessage = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        let chatUserID = jsonargs[1];
        let chatMessage = jsonargs[2];

        if (chatMessage.substring(0, 1) == "!") {
            commandHandle(chatMessage, isIDAdmin(chatUserID));
        }

        return args;
    };

    LBB.receive_ModeChange = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        currentMode = jsonargs[3];

        return args;
    };
    
    // or window.bonkAPI
    bonkAPI.addEventListener('receiveChat', (message) => {
        console.log(message);
    });
    
    
    LBB.receive_MapSwitch = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));

        console.log("Map Changed");
        decodedCurrentMap = decodeFromDatabase(jsonargs[1]);
        currentPPM = decodedCurrentMap.physics.ppm;
        setCurrentCapZones();

        return args;
    };

    LBB.receive_NewHost = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        hostID = jsonargs[1]["newHost"];

        return args;
    };

    LBB.receive_FriendReq = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        LBB.sendPacket(`42[35,{"id":${jsonargs[1]}}]`);
        chat("Friended :3");

        return args;
    };

    // &Send Handler Functions
    LBB.send_TriggerStart = function (args) {
        var jsonargs = JSON.parse(args.substring(2));
        // decodedCurrentMap = decodeFromDatabase(jsonargs[1]["gs"]["map"]);

        if (isInstaStart) {
            isInstaStart = false;
            // jsonargs[1]["gs"]["wl"] = 1; //keep this here for now

            if (instaDelay != 0) {
                var jsonargs2 = decodeIS(jsonargs[1]["is"]);
                jsonargs2["ftu"] = instaDelay * 30;

                jsonargs2 = encodeIS(jsonargs2);
                jsonargs[1]["is"] = jsonargs2;
            }
        }

        args = "42" + JSON.stringify(jsonargs);
        return args;
    };

    LBB.send_CreatRoom = function (args) {
        currentPlayerIDs = {};
        var jsonargs2 = JSON.parse(args.substring(2));
        var jsonargs = jsonargs2[1];

        currentPlayerIDs["0"] = {
            peerID: jsonargs["peerID"],
            userName: document.getElementById("pretty_top_name").textContent,
            level:
                document.getElementById("pretty_top_level").textContent == "Guest"
                    ? 0
                    : parseInt(document.getElementById("pretty_top_level").textContent.substring(3)),
            guest: typeof jsonargs.token == "undefined",
            team: 1,
            avatar: jsonargs["avatar"],
        };

        myID = 0;
        hostID = 0;

        return args;
    };

    LBB.send_SendInputs = function (args) {
        currentPlayerIDs[myID].lastMoveTime = Date.now();
        return args;
    };

    LBB.send_MapAdd = function (args) {
        console.log("Map Changed");
        var jsonargs = JSON.parse(args.substring(2));
        decodedCurrentMap = decodeFromDatabase(jsonargs[1]["m"]);
        currentPPM = decodedCurrentMap.physics.ppm;
        setCurrentCapZones();

        return args;
    };
    // #endregion

    // overriding draw circle and get playerdata
    window.PIXI.Graphics.prototype.drawCircle = function (...args) {
        var This = this;
        var Args = [...args]; // Args[2] is player radius (with shadow)

        setTimeout(function () {
            if (This.parent) {
                var childs = This.parent.children;
                var user = 0;

                for (var i = 0; i < childs.length; i++) {
                    if (childs[i]._text) {
                        user = childs[i]._text;
                    }
                }

                var keys = Object.keys(LBB.currentPlayerIDs);
                for (var i = 0; i < keys.length; i++) {
                    if (currentPlayerIDs[keys[i]].userName == user) {
                        currentPlayerIDs[keys[i]].playerData = This.parent;
                    }
                }
            }
        }, 0);

        return LBB.originalDrawCircle.call(this, ...args);
    };

    // &------------------------------------------All Functions------------------------------------------
    // Bot counts down and start
    LBB.countDownStart = function () {
        chat("Next starts in 3");

        setTimeout(function () {
            chat("Next starts in 2");
        }, 1000);

        setTimeout(function () {
            chat("Next starts in 1");
        }, 2000);

        setTimeout(function () {
            instaStart();
        }, 3000);
    };

    LBB.defaultEnd = function () {
        console.log("defaultEnd");
        if (document.getElementById("gamerenderer").style["visibility"] != "hidden") {
            document.getElementById("pretty_top_exit").click();
        }
    };

    LBB.defaultStart = function () {
        console.log("defaultStart");
        document.getElementById("newbonklobby_startbutton").click();
    };

    LBB.instaStart = function () {
        isInstaStart = true;
        document.getElementById("newbonklobby_editorbutton").click();
        document.getElementById("mapeditor_close").click();
        document.getElementById("mapeditor_midbox_testbutton").click();
    };

    // W9 function will call this
    LBB.playerInCZ = function (playerID) {
        console.log(playerID);
    };

    LBB.msToStr = function (ms) {
        var minutes = Math.floor(ms / 60000);
        var seconds = Math.floor((ms % 60000) / 1000);
        var milliSeconds = ms % 1000;

        // Add leading zero to minute component if it is less than 10
        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        if (milliSeconds < 10) {
            milliSeconds = "00" + milliSeconds;
        } else if (milliSeconds < 100) {
            milliSeconds = "0" + milliSeconds;
        }

        return "" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + milliSeconds;
    };

    LBB.chat = function (message) {
        LBB.sendPacket('42[10,{"message":' + JSON.stringify(message) + "}]");
    };

    LBB.isIDAdmin = function (ID) {
        if (isIDGuest(ID)) {
            return false; // Guest can't be admin
        }

        let playerName = currentPlayerIDs[ID].userName;
        if (playerName == "Sky_Dream") {
            return true;
        }

        return false;
    };

    LBB.isIDGuest = function (ID) {
        return currentPlayerIDs[ID].guest;
    };

    //check if the playername is guest or not
    LBB.isNameGuest = function (playerName) {
        return isIDGuest(getIDFromName(playerName));
    };

    LBB.getIDFromName = function (playerName) {
        var keys = Object.keys(currentPlayerIDs);

        for (var i = 0; i < keys.length; i++) {
            if (currentPlayerIDs[keys[i]].userName == playerName) {
                return i;
            }
        }
    };

    LBB.setCurrentCapZones = function () {
        currentCapZones = [];

        decodedCurrentMap.capZones.forEach((capZone) => {
            if (capZone.ty == 1 && capZone.i != -1) {
                // normal capzone and seted capzone
                let pfX = 0;
                let pfY = 0;
                decodedCurrentMap.physics.bodies.forEach((platform) => {
                    if (platform.fx.includes(capZone.i)) {
                        pfX = platform.p[0];
                        pfY = platform.p[1];
                    }
                });

                let shape = decodedCurrentMap.physics.shapes[capZone.i];

                let czX = pfX + shape.c[0];
                let czY = pfY + shape.c[1];
                let czRad = 0;
                let czW = 0;
                let czH = 0;

                if (shape.type == "bx") {
                    czRad = -1;
                    czW = shape.w;
                    czH = shape.h;
                } else if (shape.type == "ci") {
                    czRad = shape.r;
                    czW = -1;
                    czH = -1;
                }

                currentCapZones.push({
                    capTime: capZone.l,
                    radius: czRad,
                    centerX: czX,
                    centerY: czY,
                    w: czW,
                    h: czH,
                });
            }
        });
    };

    LBB.showTopFinishers = function (mapName) {
        // Get the player map for the specified map name
        const playerMap = mapRecordsData.get(mapName);

        // If the player map doesn't exist, log an error message and return
        if (!playerMap) {
            console.error(`No data found for map '${mapName}'`);
            return;
        }

        // Create an array of player data objects, sorted by number of finishes
        const playerData = Array.from(playerMap.entries()).map(([name, data]) => ({
            name,
            finishes: data.numberOfFinishes,
        }));
        playerData.sort((a, b) => b.finishes - a.finishes);

        // Print out the top 5 players with the most finishes
        chat(`[${mapName}] - Top 5 Finishers:`);
        for (let i = 0; i < 5 && i < playerData.length; i++) {
            chat(`${i + 1}. ${playerData[i].name}: ${playerData[i].finishes} finishes`);
        }
    };

    LBB.showTFofCurrentMap = function () {
        showTopFinishers(getCurrentMapName());
    };

    LBB.showAllTopFinishers = function (mapName) {
        // Get the player map for the specified map name
        const playerMap = mapRecordsData.get(mapName);

        // If the player map doesn't exist, log an error message and return
        if (!playerMap) {
            console.error(`No data found for map '${mapName}'`);
            return;
        }

        // Create an array of player data objects, sorted by number of finishes
        const playerData = Array.from(playerMap.entries()).map(([name, data]) => ({
            name,
            finishes: data.numberOfFinishes,
        }));
        playerData.sort((a, b) => b.finishes - a.finishes);

        // Print out the top 5 players with the most finishes
        console.log(`[${mapName}] - Most Finish:`);
        for (let i = 0; i < playerData.length; i++) {
            console.log(`${i + 1}. ${playerData[i].name}: ${playerData[i].finishes} finishes`);
        }
    };

    LBB.showTop10Record = function (mapName) {
        const playerMap = mapRecordsData.get(mapName);
        const playerList = [...playerMap];
        playerList.sort((a, b) => a[1].bestTime - b[1].bestTime);

        chat(`[${mapName}] - Top 10 Records:`);
        for (let i = 0; i < 10 && i < playerList.length; i += 2) {
            let lineStr =
                `${i + 1}. ${playerList[i][0]}: ${msToStr(playerList[i][1].bestTime)}` +
                "   " +
                `${i + 2}. ${playerList[i + 1][0]}: ${msToStr(playerList[i + 1][1].bestTime)}`;
            chat(lineStr);
        }
    };

    LBB.showAllWRofMap = function (mapName) {
        const playerMap = mapRecordsData.get(mapName);
        const playerList = [...playerMap];
        playerList.sort((a, b) => a[1].bestTime - b[1].bestTime);

        chat(`[${mapName}] - World Records:`);
        for (let i = 0; i < playerList.length; i++) {
            console.log(`${i + 1}. ${playerList[i][0]}: ${msToStr(playerList[i][1].bestTime)}`);
        }
    };

    LBB.showWRofMap = function (mapName) {
        const playerMap = mapRecordsData.get(mapName);
        const playerList = [...playerMap];
        playerList.sort((a, b) => a[1].bestTime - b[1].bestTime);

        chat(`[${mapName}] - Top 5 World Records:`);
        for (let i = 0; i < 5 && i < playerList.length; i++) {
            chat(`${i + 1}. ${playerList[i][0]}: ${msToStr(playerList[i][1].bestTime)}`);
        }
    };

    LBB.showWRofCurrentMap = function () {
        showWRofMap(getCurrentMapName());
    };

    LBB.saveData = function () {
        let content = "";
        for (const [mapName, playerMap] of mapRecordsData) {
            content += mapName + "\n";
            for (const [playerName, playerStats] of playerMap) {
                content +=
                    playerName + "," + playerStats.bestTime + "," + playerStats.numberOfFinishes + "\n";
            }
            content += "\n";
        }

        var a = document.createElement("a");
        var file = new Blob([content], { type: "text/plain" });
        a.href = URL.createObjectURL(file);
        a.download = "mapRecordsData.txt";
        a.click();
    };

    LBB.loadFile = function () {
        var input = document.createElement("input");
        input.type = "file";

        input.onchange = (e) => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");

            reader.onload = (readerEvent) => {
                var content = readerEvent.target.result; // this is the content!
                // we will get map name on 1st line
                let currentLineMapName = true;
                let currentMapName = null;

                for (const line of content.split("\n")) {
                    //if empty line, we know next line is a map name
                    if (line.trim() === "") {
                        currentLineMapName = true;
                    } else if (currentLineMapName === true) {
                        currentMapName = line;
                        mapRecordsData.set(currentMapName, new Map());
                        currentLineMapName = false;
                    } else {
                        const [playerName, bestTimeInMillis, numberOfFinishes] = line.split(",");
                        const playerMap = mapRecordsData.get(currentMapName);
                        playerMap.set(playerName, {
                            bestTime: Number(bestTimeInMillis),
                            numberOfFinishes: Number(numberOfFinishes),
                        });
                    }
                }
            };
        };

        input.click();
    };

    LBB.getCurrentMapName = function () {
        return document.getElementById("newbonklobby_maptext").innerHTML;
    };

    LBB.updatePlayerData = function (scale) {
        var keys = Object.keys(currentPlayerIDs);
        for (var i = 0; i < keys.length; i++) {
            if (currentPlayerIDs[keys[i]].playerData) {
                if (currentPlayerIDs[keys[i]].playerData2) {
                    if (currentPlayerIDs[keys[i]].playerData.transform) {
                        currentPlayerIDs[keys[i]].playerData2.x =
                            currentPlayerIDs[keys[i]].playerData.transform.position.x * scale - 365;
                        currentPlayerIDs[keys[i]].playerData2.y =
                            currentPlayerIDs[keys[i]].playerData.transform.position.y * scale - 250;
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
    };

    LBB.addPlayerToMapRecords = function (mapName, playerName, time) {
        let playerTimeType = 0;

        // if (isNameGuest(playerName)) {
        //     chat("Not allow to add Guest's data");
        //     return -1;
        // }

        // If the map doesn't exist in the map data, create it with an empty player map
        if (!mapRecordsData.has(mapName)) {
            mapRecordsData.set(mapName, new Map());
        }
        const playerMap = mapRecordsData.get(mapName);

        // If the player doesn't exist in the player map, create it with the new data
        if (!playerMap.has(playerName)) {
            if (time == -1) {
                playerMap.set(playerName, { bestTime: time, numberOfFinishes: 0 });
            } else {
                playerMap.set(playerName, { bestTime: time, numberOfFinishes: 1 });
                playerTimeType = 1;
            }
        } else {
            // player got record before
            const playerData = playerMap.get(playerName);

            // If the time is better than the current best time, update the player's data
            if (time < playerData.bestTime) {
                playerData.bestTime = time;
                playerTimeType = 1;
            }

            // Increment the number of finishes for the player
            playerData.numberOfFinishes++;
        }

        return playerTimeType;
    };

    LBB.playerFinished = function (id, timeGot) {
        let finishMessage = "";

        let playerTimeType = addPlayerToMapRecords(
            getCurrentMapName(),
            currentPlayerIDs[id].userName,
            timeGot
        );

        if (playerTimeType == 0) {
            finishMessage += winText.replaceAll("username", currentPlayerIDs[id].userName) + msToStr(timeGot);
        } else if (playerTimeType == 1) {
            finishMessage += pbText.replaceAll("username", currentPlayerIDs[id].userName) + msToStr(timeGot);
        } else if (playerTimeType == 2) {
            finishMessage += wrText.replaceAll("username", currentPlayerIDs[id].userName) + msToStr(timeGot);
        }

        if (firstFinish) {
            firstFinishTimeStamp = Date.now();
            firstFinish = false;
            finishMessage += " [match ends in 10 sec]";
        }

        if (playerTimeType != -1) {
            chat(finishMessage);
        }

        unfinishedPlayerIDs.delete(id);
    };

    LBB.checkPlayerFinish = function () {
        for (const id of unfinishedPlayerIDs) {
            if (currentPlayerIDs[id]) {
                if (currentPlayerIDs[id].playerData2) {
                    let playerX = currentPlayerIDs[id].playerData2.x;
                    let playerY = currentPlayerIDs[id].playerData2.y;
                    let playerRadius = currentPPM;

                    currentCapZones.forEach((capZone) => {
                        if (capZone.radius == -1) {
                            // not circle capzone
                            if (
                                isCircleTouchingRectangle(
                                    playerX,
                                    playerY,
                                    playerRadius,
                                    capZone.centerX,
                                    capZone.centerY,
                                    capZone.w,
                                    capZone.h
                                )
                            ) {
                                let timeGot = Date.now() - gameStartTimeStamp;
                                playerFinished(id, timeGot);
                            }
                        } else {
                            // circle capzone
                            if (
                                isCircleTouchingCircle(
                                    playerX,
                                    playerY,
                                    playerRadius,
                                    capZone.centerX,
                                    capZone.centerY,
                                    capZone.radius
                                )
                            ) {
                                let timeGot = Date.now() - gameStartTimeStamp;
                                playerFinished(id, timeGot);
                            }
                        }
                    });
                }
            }
        }
    };

    LBB.isCircleTouchingCircle = function (
        circle1X,
        circle1Y,
        circle1Radius,
        circle2X,
        circle2Y,
        circle2Radius
    ) {
        // Calculate the distance between the centers of the circles
        var distance = Math.sqrt((circle2X - circle1X) ** 2 + (circle2Y - circle1Y) ** 2);

        // If the distance between the centers is less than or equal to the sum of the radii of the circles,
        // then the circles are touching each other
        return distance <= circle1Radius + circle2Radius;
    };

    LBB.isCircleTouchingRectangle = function (
        circleX,
        circleY,
        circleRadius,
        rectangleX,
        rectangleY,
        rectangleWidth,
        rectangleHeight
    ) {
        // Calculate the distance between the center of the circle and the center of the rectangle
        var distanceX = Math.abs(circleX - rectangleX);
        var distanceY = Math.abs(circleY - rectangleY);

        // If the distance is greater than half the sum of the circle's radius and the rectangle's width/height,
        // then the circle and rectangle are not touching
        if (distanceX > rectangleWidth / 2 + circleRadius) {
            return false;
        }
        if (distanceY > rectangleHeight / 2 + circleRadius) {
            return false;
        }

        // If the distance is less than or equal to half the sum of the circle's radius and the rectangle's width/height,
        // then the circle and rectangle are touching
        if (distanceX <= rectangleWidth / 2) {
            return true;
        }
        if (distanceY <= rectangleHeight / 2) {
            return true;
        }

        // If neither condition is met, then the circle and rectangle are not touching
        var dx = distanceX - rectangleWidth / 2;
        var dy = distanceY - rectangleHeight / 2;
        return dx * dx + dy * dy <= circleRadius * circleRadius;
    };

    //#region Local message send
    document.getElementById("newbonklobby_chat_input").onkeydown = function (e) {
        if (e.keyCode == 13) {
            var chat_val = document.getElementById("newbonklobby_chat_input").value;

            if (chat_val != "" && chat_val[0] == "!") {
                commandHandle(chat_val, true);
            }
        }
    };

    document.getElementById("ingamechatinputtext").onkeydown = function (e) {
        if (e.keyCode == 13) {
            var chat_val = document.getElementById("ingamechatinputtext").value;

            if (chat_val != "" && chat_val[0] == "!") {
                commandHandle(chat_val, true);
            }
        }
    };
    // #endregion

    LBB.commandHandle = function (cmdStr, isAdmin) {
        if (cmdStr.substring(0, 1) != "!") {
            console.log("Error: not command");
            return;
        }

        if (isAdmin) {
            if (cmdStr.substring(1, 5) == "load" || cmdStr.includes("load")) {
                console.log("Load File");
                loadFile();
            }

            if (cmdStr.substring(1, 6) == "start" || cmdStr.includes("start")) {
                console.log("defaultStart");
                defaultStart();
            }

            if (cmdStr.substring(1, 4) == "end" || cmdStr.includes("end")) {
                console.log("defaultEnd");
                defaultEnd();
            }

            if (cmdStr.substring(1, 7) == "showWR" || cmdStr.includes("showWR")) {
                showWRofCurrentMap();
            }

            if (cmdStr.substring(1, 7) == "showTF" || cmdStr.includes("showTF")) {
                showTFofCurrentMap();
            }
        } else {
            if (cmdStr.substring(0, 1) == "!" && cmdStr.length != 1) {
                chat("Join BPC server to check your record!: https://discord.gg/8s39kJ9dV7");
            }
        }
    };

    //& All Looping Functions
    //this function runs all the time, matches 30FPS
    function loop30FPS() {
        // When round ends
        if (document.getElementById("ingamewinner").style["visibility"] == "inherit") {
            if (
                document.getElementById("ingamewinner").style["parsed"] == false &&
                winText != "" &&
                document.getElementById("ingamewinner_bottom").textContent != "DRAW"
            ) {
                console.log("Winner appeared");
                // chat(winText.replaceAll("username", document.getElementById("ingamewinner_top").textContent) + msToStr(timeGot));
            }

            document.getElementById("ingamewinner").style["parsed"] = true;
        } else {
            document.getElementById("ingamewinner").style["parsed"] = false;
        }

        // check when game is playing
        if (LBB.myID != -1 && document.getElementById("gamerenderer").style["visibility"] != "hidden") {
            // If more than 2 minutes, restart game
            if (gameStartTimeStamp > 0 && Date.now() - gameStartTimeStamp > autoRestartTimer) {
                defaultEnd();
                chat("Game passed " + autoRestartTimer / 60000 + " mintues, auto restarting...");
                setTimeout(defaultStart, 1000);
            }
        }
    }

    //This function gets called every frame
    window.requestAnimationFrame = function (...args) {
        //When game playing
        try {
            if (LBB.myID != -1 && document.getElementById("gamerenderer").style["visibility"] != "hidden") {
                var canv = 0;
                for (var i = 0; i < document.getElementById("gamerenderer").children.length; i++) {
                    if (
                        document.getElementById("gamerenderer").children[i].constructor.name ==
                        "HTMLCanvasElement"
                    ) {
                        canv = document.getElementById("gamerenderer").children[i];
                        break;
                    }
                }
                var canvWidth = parseInt(canv.style["width"]);
                scale = canvWidth / 730;

                updatePlayerData(1 / scale);

                if (Date.now() - gameStartTimeStamp > 500) {
                    // don't check right when match starts, wait 0.5 seconds for playerdata 2 to update
                    checkPlayerFinish();

                    if (
                        (unfinishedPlayerIDs.size == 0 && !matchEnds) ||
                        (Date.now() - firstFinishTimeStamp > matchEndsAfterFinish &&
                            firstFinishTimeStamp != -1)
                    ) {
                        chat("Match ends, next starting in: " + timeBetweenRounds / 1000 + " sec");
                        matchEnds = true;
                        firstFinishTimeStamp = -1;
                        setTimeout(function () {
                            defaultEnd();
                            setTimeout(defaultStart, timeBetweenRounds - 2000);
                        }, 2000);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

        return LBB.requestAnimationFrameOriginal.call(this, ...args);
    };
});

// ==UserScript==
// @name         bonkAPI
// @namespace    http://tampermonkey.net/
// @version      3.3.48
// @description  bonkAPI
// @author       FeiFei + Clarifi
// @license      MIT
// @match        https://bonk.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bonk.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ! Compitable with Bonk Version 48
"use strict";

// Everything should be inside this object to prevent conflict with other prgrams.
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
     * @param {string} event - Event that is being fired
     * @param {object} data - Data sent along with the event
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
    /**
     * Fires the given event to the desired scope. This is meant to fire events not to do
     * with bonkAPI's events(ie keyup, keydown).
     * @param {string} event - Event that is being fired
     * @param {object} options - Options that go along with the event
     * @param {*} scope - Scope of where the event is being listened, defaults to #maingameframe
     */
    fireWindowEvent(event, options, scope) {
        scope = scope ? scope : document.getElementById("maingameframe").contentDocument;
        var toSend = document.createEvent("HTMLEvents");
        toSend.initEvent(event, true, false);
        for (let p in options) {
            toSend[p] = options[p];
        }
        scope.dispatchEvent(toSend);
    },
};
Object.freeze(bonkAPI.EventHandler);

// !Initialize Variable
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

let initializeBonkAPI = function (f) {
    if (window.location == window.parent.location) {
        if (document.readyState == "complete") {
            f();
        } else {
            document.addEventListener("readystatechange", function () {
                setTimeout(f, 1500);
            });
        }
    }
};

initializeBonkAPI(function () {
    bonkAPI.bonkWSS = 0;
    bonkAPI.originalSend = window.WebSocket.prototype.send;
    bonkAPI.gameFrame = document.getElementById("maingameframe");
    bonkAPI.originalRequestAnimationFrame =
        document.getElementById("maingameframe").contentWindow.requestAnimationFrame;
    bonkAPI.originalDrawCircle =
        document.getElementById("maingameframe").contentWindow.PIXI.Graphics.prototype.drawCircle;

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
    // #region Map decoder
    bonkAPI.textdecoder = new window.TextDecoder();
    bonkAPI.textencoder = new window.TextEncoder();

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

        data_deLZd = LZString.decompressFromEncodedURIComponent(rawdata_caseflipped);
        databuffer = bytebuffer.fromBase64(data_deLZd);
        data = ISpsonpair.decode(databuffer.buffer);
        return data;
    };

    bonkAPI.ISencode = function (obj) {
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

    bonkAPI.decodeIS = function (x) {
        return ISdecode(x);
    };
    bonkAPI.encodeIS = function (x) {
        return ISencode(x);
    };

    bonkAPI.encodeMap = function (W2A) {
        var M3n = [arguments];
        M3n[1] = new bytebuffer2();
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
            M3n[1].writeShort(M3n[5].ba);
            M3n[1].writeShort(M3n[5].bb);
            M3n[1].writeBoolean(M3n[5].d.cc);
            M3n[1].writeDouble(M3n[5].d.bf);
            M3n[1].writeBoolean(M3n[5].d.dl);
        }
        M3n[32] = M3n[1].toBase64();
        M3n[77] = LZString.compressToEncodedURIComponent(M3n[32]);
        return M3n[77];
    };
    
    bonkAPI.decodeMap = function (map) {
        var F5W = [arguments];
        var b64mapdata = LZString.decompressFromEncodedURIComponent(map);
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
            map.physics.joints[F5W[19]].ba = binaryReader.readShort();
            map.physics.joints[F5W[19]].bb = binaryReader.readShort();
            map.physics.joints[F5W[19]].d.cc = binaryReader.readBoolean();
            map.physics.joints[F5W[19]].d.bf = binaryReader.readDouble();
            map.physics.joints[F5W[19]].d.dl = binaryReader.readBoolean();
        }
        return map;
    };

    // #endregion

    // bonkAPI Vars
    bonkAPI.playerList = [];
    bonkAPI.myID = -1;
    bonkAPI.hostID = -1;
    bonkAPI.queuePress = [];
    bonkAPI.injectedAnimation = false;

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
                    bonkAPI.bonkWSS = 0;
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

        return bonkAPI.originalSend.call(this, args);
    };
    // #endregion

    // !---------------------Overriding PIXI--------------------------------
    // #region
    /*bonkAPI.gameFrame.contentWindow.PIXI.Graphics.prototype.drawCircle = function (...args) {
    return bonkAPI.originalDrawCircle.call(this, ...args);
}*/
    // #endregion

    // !--------------------Overriding RequestAnimationFrame-----------------
    // #region
    /*document.getElementById("maingameframe").contentWindow.requestAnimationFrame = function (...args) {
    if(bonkAPI.gameFrame.style["visibility"] != "hidden") {
        bonkAPI.handleGameAnimationFrame(...args);
    }

    return bonkAPI.originalRequestAnimationFrame.call(this, ...args);
}*/
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

    // !----------------------------Handling PIXI-----------------------------
    // #region
    bonkAPI.handleGameAnimationFrame = function (...args) {
        if (bonkAPI.queuePress.length != 0) {
            for (let i = 0; i < bonkAPI.queuePress.length; i++) {
                bonkAPI.fireKey(bonkAPI.queuePress[i], (t = true));
            }
            bonkAPI.queuePress = [];
        }
    };
    //#endregion

    // !---------------------Receive Handler Functions-----------------------
    // #region
    /**
     * Triggered when the user joins a lobby.
     * @function receive_RoomJoin
     * @fires onJoin
     * @param {string} args - Packet received by websocket.
     * @returns {string} arguements
     */
    bonkAPI.receive_RoomJoin = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));
        bonkAPI.playerList = [];
        bonkAPI.myID = jsonargs[1];
        bonkAPI.hostID = jsonargs[2];

        for (var i = 0; i < jsonargs[3].length; i++) {
            //if(jsonargs[3][i] != null){
            bonkAPI.playerList[i] = jsonargs[3][i];
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
        if (bonkAPI.events.hasEvent["onJoin"]) {
            var sendObj = {
                hostID: jsonargs[2],
                userData: bonkAPI.playerList, // !May or may not be immutable
                roomID: jsonargs[6],
                bypass: jsonargs[7],
            };
            bonkAPI.events.fireEvent("onJoin", sendObj);
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
        bonkAPI.playerList[jsonargs[1]] = {
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
            var sendObj = { userID: jsonargs[1], userData: bonkAPI.playerList[jsonargs[1]] };
            bonkAPI.events.fireEvent("userJoin", sendObj);
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
        if (bonkAPI.events.hasEvent["userLeave"]) {
            var sendObj = { userID: jsonargs[1], userData: bonkAPI.playerList[jsonargs[1]] };
            bonkAPI.events.fireEvent("userLeave", sendObj);
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

        bonkAPI.hostID = jsonargs[2];

        /**
         * When the host changes.
         * @event hostChange
         * @type {object}
         * @property {number} userID - ID of the new host
         */
        //Using hostChange to use for multiple cases
        if (bonkAPI.events.hasEvent["hostChange"]) {
            var sendObj = { userID: jsonargs[1] };
            bonkAPI.events.fireEvent("hostChange", sendObj);
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
        if (bonkAPI.events.hasEvent["receivedInputs"]) {
            var sendObj = {
                userID: jsonargs[1],
                rawInput: jsonargs[2]["i"],
                frame: jsonargs[2]["f"],
                sequence: jsonargs[2]["c"],
            };
            bonkAPI.events.fireEvent("receivedInputs", sendObj);
        } //example
        /*if(bonkAPI.bonkAPI.events.hasEvent["receiveRawInput"]) {
        obj here
        bonkAPI.bonkAPI.events.fireEvent("receiveRawInput", sendObj);
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
        if (bonkAPI.events.hasEvent["gameStart"]) {
            var sendObj = { extraData: args };
            bonkAPI.events.fireEvent("gameStart", sendObj);
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
        bonkAPI.playerList[parseInt(jsonargs[1])].team = jsonargs[2];

        /**
         * When a player has changed teams.
         * @event teamChange
         * @type {object}
         * @property {number} userID - Player who changed teams
         * @property {number} team - The new team, represented from 0 to 5
         */
        if (bonkAPI.events.hasEvent["teamChange"]) {
            var sendObj = { userID: jsonargs[1], team: jsonargs[2] };
            bonkAPI.events.fireEvent("teamChange", sendObj);
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
        if (bonkAPI.events.hasEvent["chatIn"]) {
            var sendObj = { userID: chatUserID, message: chatMessage };
            bonkAPI.events.fireEvent("chatIn", sendObj);
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
        if (bonkAPI.events.hasEvent["modeChange"]) {
            var sendObj = { mode: jsonargs[1] };
            bonkAPI.events.fireEvent("modeChange", sendObj);
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

        // *Using mapChange to stick with other bonkAPI.events using "change"
        /**
         * When the map has changed.
         * @event mapChange
         * @type {object}
         * @property {string} mapData - String with the data of the map
         */
        if (bonkAPI.events.hasEvent["mapChange"]) {
            var sendObj = { mapData: jsonargs[1] };
            bonkAPI.events.fireEvent("mapChange", sendObj);
        }

        if (bonkAPI.events.hasEvent["globalMapSwitch"]) {
            var sendObj = { mapData: jsonargs[1] };
            bonkAPI.events.fireEvent("globalMapSwitch", sendObj);
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
        bonkAPI.hostID = jsonargs[1]["newHost"];

        /* Leaving out for now since i dont know what this packet contains
    if(bonkAPI.bonkAPI.events.hasEvent["hostChange"]) {
        bonkAPI.bonkAPI.events.fireEvent("hostChange", jsonargs[1]["newHost"]);
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
        if (bonkAPI.events.hasEvent["receivedFriend"]) {
            var sendObj = { userID: jsonargs[1] };
            bonkAPI.events.fireEvent("receivedFriend", sendObj);
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
        bonkAPI.playerList = [];
        var jsonargs2 = JSON.parse(args.substring(2));
        var jsonargs = jsonargs2[1];

        bonkAPI.playerList[0] = {
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

        bonkAPI.myID = 0;
        bonkAPI.hostID = 0;

        return args;
    };

    /**
     * Called when sending inputs out.
     * @function send_SendInputs
     * @param {string} args - Packet received by websocket.
     * @returns {string} arguements
     */
    bonkAPI.send_SendInputs = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));

        /**
         * When inputs are received from other players.
         * @event sendInputs
         * @type {object}
         * @property {number} rawInput - Input of the player in the form of 6 bits
         * @property {number} frame - Frame when input happened
         * @property {number} sequence - The total amount of inputs by that player
         */
        if (bonkAPI.events.hasEvent["sendInputs"]) {
            var sendObj = {
                rawInput: jsonargs[1]["i"],
                frame: jsonargs[1]["f"],
                sequence: jsonargs[1]["c"],
            };
            bonkAPI.events.fireEvent("sendInputs", sendObj);
        }
        return args;
    };

    /**
     * Called when user changes map
     * @function send_MapAdd
     * @param {string} args - Packet received by websocket.
     * @returns {string} arguements
     */
    bonkAPI.send_MapAdd = function (args) {
        var jsonargs = JSON.parse(args.data.substring(2));

        if (bonkAPI.events.hasEvent["globalMapSwitch"]) {
            var sendObj = { mapData: jsonargs[1] };
            bonkAPI.events.fireEvent("globalMapSwitch", sendObj);
        }

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
     * Fires an event to press and release a key.
     * @function fireKey
     * @param {number} key - Key code to press
     */
    bonkAPI.fireKey = function (key, t = false) {
        if (t) {
            bonkAPI.events.fireWindowEvent("keydown", { keyCode: key });
            bonkAPI.events.fireWindowEvent("keyup", { keyCode: key });
        } else {
            bonkAPI.queuePress.push(key);
        }
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
     * Returns the entire list of {@linkcode Player} objects in the lobby at time this
     * function was called.
     * @function getPlayerList
     * @returns {Array.<Player>} Array of {@linkcode Player} objects
     */
    // *Returns a copy of bonkAPI.playerList
    bonkAPI.getPlayerList = function () {
        return Object.assign([], bonkAPI.playerList);
    };

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
            return Object.assign({}, bonkAPI.playerList[ref]);
        } else if (typeof ref === "string") {
            for (let i = 0; i < bonkAPI.playerList.length; i++) {
                if (ref == bonkAPI.playerList[i].userName) {
                    return Object.assign({}, bonkAPI.playerList[i]);
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
        return Object.assign({}, bonkAPI.playerList[id]);
    };

    /**
     * Returns the name of the player of the ID given.
     * @function getPlayerNameByID
     * @param id - ID of the player to get the name of
     * @returns {string} Name of player
     */
    bonkAPI.getPlayerNameByID = function (id) {
        if (id < 0 || id >= bonkAPI.playerList.length) {
            return null;
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
            if (name == bonkAPI.playerList[i].userName) {
                return i;
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
        for (let i = 0; i < bonkAPI.playerList.length; i++) {
            if (name == bonkAPI.playerList[i].userName) {
                return Object.assign({}, bonkAPI.playerList[i]);
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
    // #endregion
});

// Freeze all constant objects
/*Object.freeze(bonkAPI.addEventListener);
Object.freeze(bonkAPI.chat);
Object.freeze(bonkAPI.getPlayerList);
Object.freeze(bonkAPI.getPlayerListLength);
Object.freeze(bonkAPI.getPlayerByID);
Object.freeze(bonkAPI.getPlayerByName);
Object.freeze(bonkAPI.getPlayersByTeam);
Object.freeze(bonkAPI.getMyID);
Object.freeze(bonkAPI.getHostID);
Object.freeze(bonkAPI);*/

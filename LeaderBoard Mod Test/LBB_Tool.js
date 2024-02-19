// ==UserScript==
// @name         LBB_Tool
// @namespace    http://tampermonkey.net/
// @version      2.0.48
// @description  Tool
// @author       FeiFei
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ! Compitable with Bonk Version 48

// *Everything should be inside this object to prevent conflict with other prgrams.
window.LBB_Tool = {};

LBB_Tool.LZString = window.LZString;
LBB_Tool.PSON = window.dcodeIO.PSON;
LBB_Tool.bytebuffer = window.dcodeIO.ByteBuffer;
LBB_Tool.ISpsonpair = new window.dcodeIO.PSON.StaticPair([
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
LBB_Tool.textdecoder = new window.TextDecoder();
LBB_Tool.textencoder = new window.TextEncoder();

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
        return LBB_Tool.textdecoder.decode(d6I[1]);
    }
    writeUTF(L3Z) {
        var Z75 = [arguments];
        Z75[4] = LBB_Tool.textencoder.encode(Z75[0][0]);
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

LBB_Tool.ISdecode = function (rawdata) {
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

LBB_Tool.ISencode = function (obj) {
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

LBB_Tool.decodeIS = function (x) {
    return ISdecode(x);
};
LBB_Tool.encodeIS = function (x) {
    return ISencode(x);
};

LBB_Tool.encodeMap = function (W2A) {
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

LBB_Tool.decodeMap = function (map) {
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
                map.physics.shapes[F5W[28]].v.push([binaryReader.readDouble(), binaryReader.readDouble()]);
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

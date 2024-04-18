const fs = require('fs');
const manifest = require('./dist/manifest.json');
const npmPackage = require('./package.json');

const BonkAPI = fs.readFileSync('./BonkAPI.js', {encoding: 'utf-8'});
let BonkHUD = fs.readFileSync('./BonkHUD.js', {encoding: 'utf-8'});

const content = `// ==UserScript==
// @name         BonkLIB
// @version      ${npmPackage.version}
// @author       FeiFei + Clarifi + BoZhi
// @namespace    https://github.com/XyaoFeiFei/BonkioLBB
// @description  ${manifest.description}
// @license      MIT
// @match        https://*.bonk.io/gameframe-release.html
// @run-at       document-start
// @grant        none
// ==/UserScript==
/*
  Usable with:
  https://greasyfork.org/en/scripts/433861-code-injector-bonk-io
*/

${BonkAPI}\n${BonkHUD}`;

fs.writeFileSync(`./BonkLIB.js`, content);
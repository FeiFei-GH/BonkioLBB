// ==UserScript==
// @name         KeyTable_HUD
// @version      1.2.48
// @description  Add a customizable key table overlay to the bonk.io game
// @author       BZD
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-body
// @grant        none
// ==/UserScript==
// TEST KEY TABLE WITH HUD API

(function () {
    'use strict';

    if (typeof window.bonkHUD === 'undefined') {
        console.error('bonkHUD is not available.');
        return;
    }

    function updateKeyStyle(keyname) {
        let inputValues = { '←': 1, '→': 2, '↑': 4, '↓': 8, 'Heavy': 16, 'Special': 32 };
        let keyElement = document.getElementById('key-' + keyname);
        if (keyElement) {
            keyElement.style.backgroundColor = window.latestInput & inputValues[keyname] ? '#808080' : '#333333';
        }
    }

    function createKeyTableContent() {
        let content = document.createElement('div');
        let keys = ['←', '↑', '→', '↓', 'Heavy', 'Special'];

        keys.forEach(key => {
            let keyDiv = document.createElement('div');
            keyDiv.id = 'key-' + key;
            keyDiv.innerText = key;
            keyDiv.style.margin = '5px';
            keyDiv.style.display = 'inline-block';
            keyDiv.style.padding = '10px';
            keyDiv.style.backgroundColor = '#333333';
            keyDiv.style.color = '#FFFFFF';
            content.appendChild(keyDiv);
        });

        return content;
    }

    function showKeyTable() {
        let keyTableContent = createKeyTableContent();
        bonkHUD.createWindow("KeyTable", "keyTableWindow", keyTableContent, "120px");

        bonkAPI.addEventListener("gameInputs", (e) => {
            let readingPlayerID = bonkAPI.getPlayerIDByName(bonkHUD.readingPlayer);
            if (e.userID === readingPlayerID) {
                window.latestInput = e.rawInput;
                ['←', '↑', '→', '↓', 'Heavy', 'Special'].forEach(updateKeyStyle);
            }
        });
    }

    function loadKeyTableSettings() {

    }

    function saveKeyTableSettings() {

    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        showKeyTable();
        loadKeyTableSettings();
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            showKeyTable();
            loadKeyTableSettings();
        });
    }
})();

// ==UserScript==
// @name         LBB_DB
// @namespace    http://tampermonkey.net/
// @version      1.0.48
// @description  DataBase
// @author       FeiFei
// @license MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ! Matching Bonk Version 48

var LBB_DBJS = document.createElement('script');
LBB_DBJS.textContent = `
console.log("MEOW");
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

class LBB_DB {
    constructor() {
        this.firebaseConfig = {
            
        };
        
        // Initialize Firebase
        this.app = initializeApp(this.firebaseConfig);
    
        // Initialize Cloud Firestore and get a reference to the service
        this.db = getFirestore(this.app);
    }
    
    
    
    async getPlayerData(playerName) {
        const docRef = doc(this.db, "playerData", playerName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
        }
            
    }
}

window.LBB_DB = new LBB_DB();
window.LBB_DB.getPlayerData("Sky_Dream");


`;

LBB_DBJS.setAttribute('type', 'module');
document.head.appendChild(LBB_DBJS);
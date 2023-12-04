// ==UserScript==
// @name         LBB_DB
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  DataBase
// @author       FeiFei
// @license MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Create a new script element
var LBB_DBJS = document.createElement('script');
// Inside this script, log a message and then interact with Firebase (a popular Backend-as-a-Service)
LBB_DBJS.textContent = `
console.log("MEOW");
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

class LBB_DB {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyAka60D6au7Y38SeWIBahUPG5tNcYAXSA8",
            authDomain: "bonkleaderboard.firebaseapp.com",
            projectId: "bonkleaderboard",
            storageBucket: "bonkleaderboard.appspot.com",
            messagingSenderId: "621980729647",
            appId: "1:621980729647:web:fa4b5a179f9cdb677161da",
            measurementId: "G-TJC3N4E459"
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
// The script will be of type module because it uses ES6 imports
LBB_DBJS.setAttribute('type', 'module');
// Append the created script to the document head, causing it to execute
document.head.appendChild(LBB_DBJS);
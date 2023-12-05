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

/* import statements */
var LBB_DBJS = document.createElement('script');
LBB_DBJS.textContent = `
console.log("MEOW");
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
top.initializeApp = initializeApp;
top.getFirestore = getFirestore;
top.collection = collection;
top.getDocs = getDocs;
top.doc = doc;
top.getDoc = getDoc;
`
LBB_DBJS.setAttribute('type', 'module');
document.head.appendChild(LBB_DBJS);


/* init variables */
window.initializeApp = top.initializeApp;
window.getFirestore = top.getFirestore;
window.collection = top.collection;
window.getDocs = top.getDocs;
window.doc = top.doc;
window.getDoc = top.getDoc;


/* main code */

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
        this.app = top.initializeApp(this.firebaseConfig);
    
        // Initialize Cloud Firestore and get a reference to the service
        this.db = top.getFirestore(this.app);
    }
    
    
    
    async getPlayerData(playerName) {
        const docRef = top.doc(this.db, "playerData", playerName);
        const docSnap = await top.getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
        }
            
    }
}

window.LBB_DB = new LBB_DB();
console.log("Get player Sky_Dream:");
window.LBB_DB.getPlayerData("Sky_Dream");
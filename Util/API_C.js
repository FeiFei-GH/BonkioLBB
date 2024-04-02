// ==UserScript==
// @name         API_C
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Connects Bonk.io to Firebase Firestore
// @author       Char
// @match        https://bonk.io/gameframe-release.html
// @require      https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js
// @require      https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js
// @require      https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js
// ==/UserScript==

// unfinished so far

import * as firebase from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyDBjDOXr82jzdBnb5vmasz0MX3E7suDv_k",
    authDomain: "bonkio-mod-database.firebaseapp.com",
    projectId: "bonkio-mod-database",
    storageBucket: "bonkio-mod-database.appspot.com",
    messagingSenderId: "950892818313",
    appId: "1:950892818313:web:ecbd99457389ce709afb58",
    measurementId: "G-9CQHHGKRSY"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.getAnalytics(app);
const db = firebase.getFirestore(app);

//read data
async function fetchData(documentId) {
    const docRef = doc(db, "YOUR_COLLECTION_NAME", documentId); // change  "YOUR_COLLECTION_NAME" to specific assemble name
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
        console.log("No such document!");
    }
}

// write data
async function writeData(documentId, data) {
    const docRef = doc(db, "YOUR_COLLECTION_NAME", documentId);
    await setDoc(docRef, data);
}
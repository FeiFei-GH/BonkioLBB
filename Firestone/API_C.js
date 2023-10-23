// ==UserScript==
// @name         API_C
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Connects Bonk.io to Firebase Firestore
// @author       Char
// @match        https://bonk.io/gameframe-release.html
// @require      https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js
// @require      https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js
// ==/UserScript==

// unfinished so far

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// initialize Firebase app
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const db = getFirestore(app);

//read data
async function fetchData(documentId) {
    const docRef = doc(db, "YOUR_COLLECTION_NAME", documentId);
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
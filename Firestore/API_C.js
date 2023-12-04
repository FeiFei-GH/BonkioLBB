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

const firebaseConfig = {
    apiKey: "AIzaSyDrwbPO5X8RNKxwhrz_gFRRUwRWNjLcW4k",
    authDomain: "bonkio-leaderboard-mod.firebaseapp.com",
    projectId: "bonkio-leaderboard-mod",
    storageBucket: "bonkio-leaderboard-mod.appspot.com",
    messagingSenderId: "488491769413",
    appId: "1:488491769413:web:9fb95b61f9ac6be8a5cd2c",
    measurementId: "G-FWD7TM9K06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

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
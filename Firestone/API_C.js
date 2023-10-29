// ==UserScript==
// @name         API_C
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Connects Bonk.io to Firebase Firestore
// @author       Char
// @match        https://bonk.io/gameframe-release.html
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @require      https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js
// @require      https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js
// ==/UserScript==

/** @var GM_xmlhttpRequest */

// unfinished so far

const FIREBASE_SDK_URL = "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

GM_xmlhttpRequest({
    method: "GET",
    url: FIREBASE_SDK_URL,
    onload: (response) => {
        // load Firebase SDK
        eval(response.responseText);

        // initialize
        firebase.initializeApp({
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            databaseURL: "YOUR_DATABASE_URL",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_STORAGE_BUCKET",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        });


        const db = firebase.firestore();

    }
});

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
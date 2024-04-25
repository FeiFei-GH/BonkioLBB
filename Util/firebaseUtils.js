import { collection, doc, getFirestore, setDoc, addDoc, getDoc }  from "firebase/firestore";
import { initializeApp } from "firebase/app";
import dotenv from "dotenv";
dotenv.config();

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY ,
    authDomain: process.env.FIREBASE_AUTHENTICATION_DOMAIN ,
    projectId: process.env.FIREBASE_PROJECT_ID ,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Firebase Initialization
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

if (app && database) {
    console.log("Firebase Connection Established\n");
} else {
    console.log("Error: Firebase Connection Failed\n");
}

/* Adds new Player to Firebase.
*
* @param {string}   pName       Name of Player
* @param {int}      pLevel      Level of Player
* @param {string}   pAvatar     Avatar of Player
*
* @return {0,1}     0 if success, 1 if failure
*/
export async function LBB_FDB_addPlayer(pName, pLevel, pAvatar) {
    const playersRef = collection(database, "players");
    let cleanedName = pName.replace("/", "_");
    console.log("Adding Player " + cleanedName + "...\n")
    try {
        await setDoc(doc(playersRef, cleanedName), {
            /*name: cleanedName,
            level: 0,
            totalPoints: 0,
            permLvl: pLevel,
            avatar: pAvatar*/
        });
        console.log("Added Player " + pName + ".\n")
    } catch (e) {
        console.log("Error: Could not add Player " + pName + ".\n");
        return 1;
    }
    return 0;
}

/* Retrieves existing Player from Firebase.
*
* @param {string}   pName       Name of Player
*
* @return {playerData,null} returns playerData if exists, otherwise null
*/
export async function LBB_FDB_getPlayer(pName) {
    let cleanedName = pName.replace("/", "_");
    const docRef = collection(database, "players", cleanedName);
    const playerSnapshot = await getDoc(docRef);
    if (playerSnapshot.exists()) {
        let playerData = {
            name: pName,
            level: playerSnapshot.data().level,
            avatar: playerSnapshot.data().avatar,
            totalPoints: playerSnapshot.data().totalPoints,
            permLvl: playerSnapshot.data().permLevel
        }
        return playerData;
    } else {
        console.log("Error: Player " + pName + " does not exist.\n");
        return null;
    }
}

/* Changes existing Player's point total.
*
* @param {string}   pName       Name of Player
* @param {int}      ptChange    +/- point change Value
*
* @return {playerData,null} returns playerData if exists, otherwise null
*/
export async function LBB_FDB_changePlayerPoints(pName, ptChange) {
    let cleanedName;
    cleanedName = pName.replace("/", "_");
    const docRef = collection(database, "players", cleanedName);
    const playerSnapshot = await getDoc(docRef);
    //
    if (playerSnapshot.exists()) {
        let playerData = {
            name: pName,
            level: playerSnapshot.data().level,
            avatar: playerSnapshot.data().avatar,
            totalPoints: playerSnapshot.data().totalPoints + ptChange,
            permLvl: playerSnapshot.data().permLevel
        }
        return playerData;
    } else {
        console.log("Error: Player " + pName + " does not exist.\n");
        return null;
    }
}


/* Changes existing Player's permissions level.
*
* @param {string}   pName       Name of Player
* @param {int}      permLvl    New Permission level
*
* @return {playerData,null} returns playerData if exists, otherwise null
*/



/* Adds new Map to Database
*
* @param {int}      mapID      ID of Map
* @param {string}   mapName    Name of Map
* @param {string}   mapAuthor  Author of Map
* @param {string}   mapMode    Mode of Map
* @param {string}   mapDesc    Description of Map
*
* @return {0,1}     0 if success, 1 if failure
*/
export async function LBB_FDB_addMap(mapID, mapName, mapAuthor, mapMode, mapDesc) {
    const mapsRef = collection(database, "maps");
    console.log("Adding Map " + mapName + "...\n")
    try {
        await setDoc(doc(mapsRef, mapID), {
            mapName: mapName,
            mapAuthor: mapAuthor,
            mapMode: mapMode,
            wrTime: 0,
            mapDifficulty: 0,
            rating: 0,
            mapDesc: mapDesc,
            medalTimes: new Map(),
            // playerRecords: new FireBase Collection_
        });
        console.log("Added map " + mapName + ".\n")
    } catch (e) {
        console.log("Error: Could not add map " + mapName + ".\n");
        return 1;
    }
    return 0;
}

/* Retrieves existing Map from Firebase.
*
* @param {string}   mapID       ID of Map
*
* @return {mapData,null} returns mapData if exists, otherwise null
*/
export async function LBB_FDB_getMap(mapID) {
    const docRef = collection(database, "maps", mapID);
    const mapSnapshot = await getDoc(docRef);
    if (mapSnapshot.exists()) {
        let mapData = {
            mapID: mapSnapshot.data().mapID,
            mapName: mapSnapshot.data().mapName,
            mapAuthor: mapSnapshot.data().mapAuthor,
            mapMode: mapSnapshot.data().mapMode,
            wrTime: mapSnapshot.data().wrTime,
            mapDifficulty: mapSnapshot.data().mapDifficulty,
            rating: mapSnapshot.data().rating,
            mapDesc: mapSnapshot.data().mapDesc,
            medalTimes: mapSnapshot.data().medalTimes,
            playerRecords: mapSnapshot.data().playerRecords,
        }
        return mapData;
    } else {
        console.log("Error: Map by " + mapID + " ID does not exist.\n");
        return null;
    }
}

/* changes existing Map mode
*
* @param {string}   mapID       ID of Map
*
* @return {0,1} returns 1 if exists, otherwise 0
*/
export async function LBB_FDB_getMap(mapID, newMode) {
    const docRef = collection(database, "maps", mapID);
    const mapSnapshot = await getDoc(docRef);
    if (mapSnapshot.exists()) {
        await setDoc(doc(docRef, mapID), {
            mapMode: newMode
            // playerRecords: new FireBase Collection_
        });
        return 1;
    } else {
        console.log("Error: Map by " + mapID + " ID does not exist.\n");
        return 0;
    }
}

/* changes existing Map Difficulty
*
* @param {string}   mapID       ID of Map
*
* @return {0,1} returns 1 if exists, otherwise 0
*/
export async function LBB_FDB_getMap(mapID, newDiff) {
    const docRef = collection(database, "maps", mapID);
    const mapSnapshot = await getDoc(docRef);
    if (mapSnapshot.exists()) {
        await setDoc(doc(docRef, mapID), {
            mapDifficulty: newDiff
            // playerRecords: new FireBase Collection_
        });
        return 1;
    } else {
        console.log("Error: Map by " + mapID + " ID does not exist.\n");
        return 0;
    }
}

/* changes existing Map Rating
*
* @param {string}   mapID       ID of Map
*
* @return {0,1} returns 1 if exists, otherwise 0
*/
export async function LBB_FDB_getMap(mapID, newRating) {
    const docRef = collection(database, "maps", mapID);
    const mapSnapshot = await getDoc(docRef);
    if (mapSnapshot.exists()) {
        await setDoc(doc(docRef, mapID), {
            mapDifficulty: newRating
        });
        return 1;
    } else {
        console.log("Error: Map by " + mapID + " ID does not exist.\n");
        return 0;
    }
}
import { initializeApp } from 'firebase/app';
import {getFirestore, collection, doc, getDocs, getDoc} from 'firebase/firestore';
import {writeFile, appendFile} from 'fs'

// File paths
const mapNamesPath = "./data/mapNames.csv";
const mapDataPath = "./data/mapData.csv";

// downloads all firestore map information in CSV format
// Index,Map_Name,Map_Maker,Mode,Version,Multiplayer,Proof_Of_Concept,Parkour_Type
export async function downloadMaps() {
    // Firebase initialization
    console.log("   Authenticating  Firebase...");
    const firebaseConfig = {
        /*  FeiFei's Database Config
        apiKey: "AIzaSyAka60D6au7Y38SeWIBahUPG5tNcYAXSA8",
        authDomain: "bonkleaderboard.firebaseapp.com",
        projectId: "bonkleaderboard",
        storageBucket: "bonkleaderboard.appspot.com",
        messagingSenderId: "621980729647",
        appId: "1:621980729647:web:fa4b5a179f9cdb677161da",
        measurementId: "G-TJC3N4E459"
         */
        apiKey: "AIzaSyDBjDOXr82jzdBnb5vmasz0MX3E7suDv_k",
        authDomain: "bonkio-mod-database.firebaseapp.com",
        projectId: "bonkio-mod-database",
        storageBucket: "bonkio-mod-database.appspot.com",
        messagingSenderId: "950892818313",
        appId: "1:950892818313:web:ecbd99457389ce709afb58",
        measurementId: "G-9CQHHGKRSY"
    };
    const app = initializeApp(firebaseConfig);
    const database = getFirestore(app);
    console.log("   Firebase authenticated.");

    // clear previous data
    writeFile(mapNamesPath, '', (e) =>{});
    writeFile(mapDataPath, '', (e) =>{});
    // create mapNames CSV & mapData CSV
    console.log("   Downloading files...");
    const indexedNames = await getDocs(collection(database, "mapNames"));
    let index = 0;
    let name;
    try {
        indexedNames.forEach(nameDoc => {   // retrieves nameDoc
            name = nameDoc.data().mapName;
            let nameLine = nameDoc.data().id + ',' + name + '\n';
            appendFile(mapNamesPath, nameLine, (e) => {   // write to nameFile
                if (e) {
                    console.error("mapNames writing error: " + + nameDoc.data().id + ", " + name);
                    console.error(e);
                }
            });
            let dataRef = doc(database, "mapData", name);   // retrieve dataDoc
            let dataLine = "";
            getDoc(dataRef).then(dataDoc => {
                dataLine = index.toString() + ',' + name + ',' + dataDoc.data().Mapmaker + ',' + dataDoc.data().Mode + ','
                    + dataDoc.data().Multiplayer + ',' + dataDoc.data().Parkour_Type + ',' + dataDoc.data().Proof_Of_Concept
                    + ',' + dataDoc.data().version +'\n';
            });
            appendFile(mapDataPath, dataLine, (e) => {   // write to dataDoc
                if (e) {
                    console.error("mapDoc writing error: " + name);
                    console.error(e);
                }
            });
            index++;
            if (index % 100 == 0) console.log("index: " + index);
        });
    } catch (e) {
        console.log("Error at: " + name);
        throw e;
    }
    console.log(index + " files downloaded");
    return;
}
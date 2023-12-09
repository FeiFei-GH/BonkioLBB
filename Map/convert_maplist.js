const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'List of bonk.io Parkour Maps - Map List.csv');


class MapInfo {
    constructor(Map_Name, Mapmaker_Name, Mode, Bonk_Version, Team_SoloMap, Require_TAS, Concept_Map, Move_state) {
        this.Map_Name = Map_Name;
        this.Mapmaker_Name = Mapmaker_Name;
        this.Mode = Mode;
        this.Bonk_Version = Bonk_Version;
        this.Team_SoloMap = Team_SoloMap;
        this.Require_TAS = Require_TAS;
        this.Concept_Map = Concept_Map;
        this.Move_state = Move_state;
    }
}
fs.readFile(csvFilePath, 'utf-8', (err, fileContent) => {
    if (err) {
        console.error('read failed:', err);
        return;
    }

    let mapList = [];

    const lines = fileContent.split('\n');
    lines.forEach((line) => {
        const cleanLine = line.trim();
        const elements = line.split(',');
        const mapInfo = new MapInfo(
            elements[0],
            elements[1],
            elements[2],
            elements[3],
            elements[4],
            elements[5],
            elements[6],
            elements[7]
        );
        mapList.push(mapInfo);

    });

    //create a mapList json file
    const jsonFilePath = path.join(__dirname, 'mapList.json');
    fs.writeFile(jsonFilePath, JSON.stringify(mapList, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('write failed:', err);
        } else {
            console.log('JSON file was written successfully');
        }
    });
});

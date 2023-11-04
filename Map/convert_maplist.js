const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'List of bonk.io Parkour Maps - Map List.csv');

fs.readFile(csvFilePath, 'utf-8', (err, fileContent) => {
    if (err) {
        console.error('read failed:', err);
        return;
    }

    const lines = fileContent.split('\n');
    lines.forEach((line) => {
        console.log(line);
    });
});

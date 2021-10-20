var fs = require('fs');
var path = require('path');

const file = "data/games.cs";

try {
    if (fs.existsSync(file)) {
        if (path.extname(file) == '.csv') {
            console.log("\x1b[32m%s\x1b[0m", "Loading file: ", file);
            var rows = fs.readFileSync(file, 'utf-8').split('\n');
            let appids = rows.map(function (row) {
                return parseInt(row.split(',')[0].replace(/"/g, ''));
            })

            appids = appids.filter(function (value) {
                return !Number.isNaN(value);
            });
            console.log("\x1b[44m%s\x1b[0m","Entries: " + appids.length + "\n");
        }   
        else
        {
            console.log('\x1b[31m%s\x1b[0m', "Not a .csv file");
        }
    }
    else
    {
        console.log('\x1b[31m%s\x1b[0m', "File does not exist")
    }
} catch(err) {
    console.log(err);
}
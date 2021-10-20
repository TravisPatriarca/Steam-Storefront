var db = require('./dev-sql.js')
var fetch = require('node-fetch');
const SGDB = require('steamgriddb');
const client = new SGDB('c6bb1de817f19913467760f4511ce14c');
const cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

var index = 0;
var appids = process.argv.slice(2);
const file = appids[0];

try {
    if (fs.existsSync(file)) {
        if (path.extname(file) == '.csv') {
            console.log("\x1b[32m%s\x1b[0m", "Loading file: ", file);
            var rows = fs.readFileSync(file, 'utf-8').split('\n');
            appids = rows.map(function (row) {
                return parseInt(row.split(',')[0].replace(/"/g, ''));
            })

            appids = appids.filter(function (value) {
                return !Number.isNaN(value);
            });
            console.log("\x1b[44m%s\x1b[0m","Entries: " + appids.length);
        }   
        else
        {
            console.log('\x1b[31m%s\x1b[0m', "Not a .csv file");
            process.exit();
        }
    }
    else
    {
        console.log('\x1b[31m%s\x1b[0m', "File does not exist, trying appids\n");
    }
} catch(err) {
    console.log(err);
}

console.log('\x1b[35m%s\x1b[0m',"Processing " + appids.length + " games\n");

config = {
    host: "localhost",
    user: "Travis",
    password: "test1234",
    database: "steam_new"
}
//create connection to database
const con = db.makeDb(config);

getGame();

const genreOptions = {
    headers: {
        cookie: 'birthtime=36000000'
    }
}

async function checkDuplicateEntry(appid) {
    var query = "SELECT * FROM games WHERE appid = " + appid;
    try {
        var result = await con.query(query);
    } catch (err) {
        console.log(err)
    }

    if (result.length > 0) {
        console.log('\x1b[33m%s\x1b[0m', "Appid: ", appid);
        console.log('\x1b[33m%s\x1b[0m', "Name: ", result[0]['name']);
        console.log('\x1b[31m%s\x1b[0m', "Duplicate Entry!!\n");
    }

    return result.length;
}

async function getAlternativeImage(game) {
    var alt_image = await client.getGrids({ type: 'steam', id: game.appid, styles: ['alternate']});

    if (alt_image[0]) {
        console.log('\x1b[33m%s\x1b[0m', "Alternate image obtained");
        game.alt_image_url = alt_image[0]['url'];
    }
    else
    {
        console.log('\x1b[31m%s\x1b[0m', "Alternate image not obtained");
        game.alt_image_url  = "img/undefined.jpg";
    }
}

async function getGameDetails(game) {
    var appid = game.appid;
    var apiurl = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&cc=us&l=en';
    var response = await fetch(apiurl);
    var json = await response.json();

    game.name = json[appid]['data']['name'].replace(/[']/g, "''");
    game.developer = json[appid]['data']['developers'][0].replace(/[']/g, "''");
    game.description = json[appid]['data']['short_description'].replace(/[']/g, "''");
    game.release_date = formatDate(json[appid]['data']['release_date']['date']);
    game.image_url = "https://steamcdn-a.akamaihd.net/steam/apps/" + appid + "/library_600x900_2x.jpg";
    game.header_image_url = "https://cdn.akamai.steamstatic.com/steam/apps/" + appid + "/capsule_616x353.jpg";
    game.is_free = json[appid]['data']['is_free'] ? 1 : 0;

    var screenshotsLength = json[appid]['data']['screenshots'].length;
    for (var i=0; i<screenshotsLength; i++) {
        game.screenshots[i] = json[appid]['data']['screenshots'][i]['path_thumbnail'];
    }
    
    if (!game.is_free && json[appid]['data']['price_overview']) {
        game.initial_price = json[appid]['data']['price_overview']['initial'];
        game.final_price = json[appid]['data']['price_overview']['final'];
        game.discount_percent = json[appid]['data']['price_overview']['discount_percent'];
    }
}

async function getGameReviews(game) {
    var apiurl_reviews = 'https://store.steampowered.com/appreviews/' + game.appid + '?json=1&purchase_type=all&language=all'
    var response = await fetch(apiurl_reviews);
    var json = await response.json();

    game.total_negative = json['query_summary']['total_negative'];
    game.total_positive = json['query_summary']['total_positive'];
    game.total_reviews = json['query_summary']['total_reviews'];
    game.review_percent = game.total_reviews ? Math.floor(game.total_positive/game.total_reviews*100) : 0;
}

async function getGameTags(game) {
    var response = await fetch('https://store.steampowered.com/app/' + game.appid, genreOptions);
    var html = await response.text();
    var $ = cheerio.load(html);
    $('.app_tag').each(function(i, obj) {
        game.tags[i] = $(this).text().trim();
    });
}

async function addGameDB(game) {
    var query1 = "INSERT INTO games (appid, name, developer, description, release_date, screenshot_url_1, \
screenshot_url_2, screenshot_url_3, screenshot_url_4, image_url, header_image_url, initial_price, final_price, \
discount_percent, is_free, url, alt_image_url) VALUES (" + game.appid + ",'" + game.name + "','" + game.developer + "','" + game.description + "'\
,'" + game.release_date +  "','" + game.screenshots[0] + "','" + game.screenshots[1] + "','" + game.screenshots[2] + "','" + game.screenshots[3] + "','" + game.image_url + "','" + game.header_image_url + "'," + game.initial_price + "," + game.final_price + "," + game.discount_percent + ",\
" + game.is_free + ",'" + game.url + "','" + game.alt_image_url + "')";
        
    var query2 = "INSERT INTO game_reviews (appid, total_negative, total_positive, total_reviews, review_percent) VALUES (" + game.appid + ",'" + game.total_negative + "','" + game.total_positive + "','" + game.total_reviews + "','" + game.review_percent + "')";

    var query3 = "INSERT INTO game_genres (appid, genre_1, genre_2, genre_3, genre_4, genre_5, genre_6) VALUES ("+game.appid+",";
    for (let i= 1; i<=6; i++) {
        query3 += "'" + game.tags[i-1] + "'";
        if (i != 6) {
            query3 += ",";
        }
    }
    query3 += ")";
    //console.log(query3);

    try {
        await con.beginTransaction();
         await con.query(query1);
        console.log('\x1b[33m%s\x1b[0m', "Appid: ", game.appid);
        console.log('\x1b[33m%s\x1b[0m', "Name: ", game.name);
        await con.query(query2);
        console.log('\x1b[33m%s\x1b[0m', "Review_percent: ", game.review_percent+"%");
        await con.query(query3);
        console.log('\x1b[33m%s\x1b[0m', "Genres: ", game.tags.slice(0, 6));
        await con.commit();
        console.log('\x1b[32m%s\x1b[0m', "Successfully Added!!\n");
    } catch ( err ) {
        await con.rollback();
        console.log('\x1b[31m%s\x1b[0m', "Transaction failed!!");
        console.log( err );
    }
}

async function getGame() {
    var appid = appids[index];
    var isDup = await checkDuplicateEntry(appid);

    if (!isDup) {
        var game = {
            appid: appid,
            name: "",
            developer: "",
            description: "",
            release_date: "",
            screenshots: [],
            image_url: "",
            alt_image_url: "",
            is_free: 0,
            tags: [],
            url: "https://store.steampowered.com/app/" + appid,
            //price info
            initial_price: -1,
            final_price: 0,
            discount_percent: -1,
            //review info
            total_negative: 0,
            total_positive: 0,
            total_reviews: 0,
            review_percent: 0
        }
        try {            
            await getAlternativeImage(game);
            await getGameDetails(game);
            await getGameReviews(game);
            await getGameTags(game);
            await addGameDB(game);
        }
        catch (error) {
            console.log("\x1b[41m%s\x1b[0m", error.message + ": " + appid , "\n");
        }
    }

    nextGame();
}

function nextGame() {
    if (index != appids.length-1) {
        var wait = 1;
        index++;
        console.log('\x1b[36m%s\x1b[0m', "Waiting " + wait + " seconds before query...\n");
        setTimeout(function() {
            getGame();
        }, wait*1000);
    }
    else {
        console.log('\x1b[31m%s\x1b[0m', "Terminating database connection....\n");
        con.close();
        process.exit();
    }
}

function formatDate(date) {
    var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
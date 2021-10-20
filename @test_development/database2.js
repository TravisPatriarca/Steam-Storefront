var express = require('express');
var mysql = require('mysql');
var fetch = require('node-fetch');
var readline= require('readline-sync');
const { getHeapCodeStatistics } = require('v8');

var app = express();

app.set('port', 3000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var con = mysql.createConnection({
    host: "localhost",
    user: "Travis",
    password: "test1234",
    database: "steam_new"
});

async function fetchMoviesJSON(appid) {
    const response = await fetch('https://store.steampowered.com/api/appdetails?appids=' + appid + '&cc=us&l=en');
    const game = await response.json();
    return game;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

for (;;) {
    var name = "";
    var developer = "";
    var description = "";
    var release_date = "";
    var screenshots = [];
    var image_url = "";
    var initial_price = -1;
    var final_price = -1;
    var discount_percent = -1;
    var total_positive = -1;
    var total_negative = -1;
    var total_reviews = -1;
    var genres = [];
    var is_free = 0;
    var url = "";

    var appid = readline.question("Enter an AppID: ");

    if (appid.localeCompare("exit") == 0)
    break;

    fetchMoviesJSON(appid).then(function(game, appid) { 
        //console.log(game)
        console.log(game['427520']);
        console.log("THE APPID IS:");
        console.log(appid);
        console.log(game[appid]);
    });

        /*name = game[appid]['data']['name'].replace(/[']/g, "''");;
        developer = game[appid]['data']['developers'][0];
        description = game[appid]['data']['short_description'].replace(/[']/g, "''");
        release_date = formatDate(game[appid]['data']['release_date']['date']);
        for (var i=0; i<game[appid]['data']['screenshots'].length; i++) {
            screenshots[i] = game[appid]['data']['screenshots'][i]['path_thumbnail'];
        }
        image_url = "https://steamcdn-a.akamaihd.net/steam/apps/" + appid + "/library_600x900_2x.jpg";
        is_free = game[appid]['data']['is_free'] ? 1 : 0;
        if (!is_free) {
            initial_price = game[appid]['data']['price_overview']['initial'];
            final_price = game[appid]['data']['price_overview']['final'];
            discount_percent = game[appid]['data']['price_overview']['discount_percent'];
        }
        total_positive = -1;
        total_negative = -1;
        total_reviews = -1;
        for (var i=0; i<game[appid]['data']['genres'].length; i++) {
            genres[i] = game[appid]['data']['genres'][i]['description']
        }
        
        url = "https://store.steampowered.com/app/" + appid; 
            
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            
            var sql = "INSERT INTO games (appid, name, developer, description, release_date, screenshot_url_1, \
screenshot_url_2, screenshot_url_3, screenshot_url_4, image_url, initial_price, final_price, \
discount_percent, total_positive, total_negative, total_reviews, genre_1, genre_2, genre_3, genre_4, \
genre_5, genre_6, is_free, url) VALUES (" + appid + ",'" + name + "','" + developer + "','" + description + "'\
,'" + release_date +  "','" + screenshots[0] + "','" + screenshots[1] + "','" + screenshots[2] + "','" + screenshots[3] + "',\
'" + image_url + "'," + initial_price + "," + final_price + "," + discount_percent + "," + total_positive + "," + total_negative + ",\
" + total_reviews + ",'" + genres[0] + "','" + genres[1] + "','" + genres[2] + "','" + genres[3] + "','" + genres[4] + "','" + genres[5] + "',\
" + is_free + ",'" + url + "')";
        
        console.log(sql);
        con.query(sql, function (err, result) {
            if (err) throw err;
                console.log("Appid: " + appid + "\nName: " + name + "\nSuccessfully Added!!");
                con.end(function(err) {
                    console.log("Enable to disconnect from database correctly...");
                });
                process.exit();
            });
        });*/
}


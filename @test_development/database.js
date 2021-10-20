var express = require('express');
var mysql = require('mysql');
var request = require('request');
const SGDB = require('steamgriddb');
const client = new SGDB('c6bb1de817f19913467760f4511ce14c');

var app = express();

app.set('port', 3000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

url = "https://store.steampowered.com/app/" + appid; 
var con = mysql.createConnection({
    host: "localhost",
    user: "Travis",
    password: "test1234",
    database: "steam_new"
});

con.connect(function(err) {
    if (err) throw err;
    console.log('\x1b[32m%s\x1b[0m',"Successfully connected to database!\n");
});

var appids = process.argv.slice(2);
var appid = appids[0];
var name = "";
var developer = "";
var description = "";
var release_date = "";
var screenshots = [];
var image_url = "";
var alt_image_url = "";
var initial_price = -1;
var final_price = -1;
var discount_percent = -1;
var total_positive = -1;
var total_negative = -1;
var total_reviews = -1;
var genres = [];
var is_free = 0;
var url = ""; 

getGame(appids, 0);

function getGame(appids, index) {
    appid = appids[index];
    name = "";
    developer = "";
    description = "";
    release_date = "";
    screenshots = [];
    image_url = "";
    alt_image_url = "";
    initial_price = -1;
    final_price = -1;
    discount_percent = -1;
    total_positive = -1;
    total_negative = -1;
    total_reviews = -1;
    genres = [];
    is_free = 0;
    url = "https://store.steampowered.com/app/" + appid; 
    alt_image_url = "";

    apiurl = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&cc=us&l=en';
                    
    client.getGrids({type: 'steam', id: appid, styles: ['alternate']})
    .then((output) => {
        console.log('\x1b[33m%s\x1b[0m', "Alternate image obtained");
        alt_image_url = output[0]['url'];

        request(apiurl, function(err, response, body) {
            if(!err && response.statusCode < 400) {
                var game = JSON.parse(body);
                
                var sql = "SELECT * FROM games WHERE appid = " + appid;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        console.log('\x1b[33m%s\x1b[0m', "Appid: ", appid);
                        console.log('\x1b[33m%s\x1b[0m', "Name: ", result[0]['name']);
                        console.log('\x1b[31m%s\x1b[0m', "Duplicate Entry!!\n");

                        if (index != appids.length-1) {
                            index++;
                            getGame(appids, index);
                        }
                        else {
                            console.log('\x1b[31m%s\x1b[0m', "Terminating database connection....\n");
                            con.end(function(err) {
                                console.log("Unable to terminate connection: ");
                                console.log(err);
                            });
                            process.exit();
                        }
                    }
                    else
                    {
                        name = game[appid]['data']['name'].replace(/[']/g, "''");
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

                        var sql = "INSERT INTO games (appid, name, developer, description, release_date, screenshot_url_1, \
screenshot_url_2, screenshot_url_3, screenshot_url_4, image_url, initial_price, final_price, \
discount_percent, total_positive, total_negative, total_reviews, genre_1, genre_2, genre_3, genre_4, \
genre_5, genre_6, is_free, url, alt_image_url) VALUES (" + appid + ",'" + name + "','" + developer + "','" + description + "'\
,'" + release_date +  "','" + screenshots[0] + "','" + screenshots[1] + "','" + screenshots[2] + "','" + screenshots[3] + "',\
'" + image_url + "'," + initial_price + "," + final_price + "," + discount_percent + "," + total_positive + "," + total_negative + ",\
" + total_reviews + ",'" + genres[0] + "','" + genres[1] + "','" + genres[2] + "','" + genres[3] + "','" + genres[4] + "','" + genres[5] + "',\
" + is_free + ",'" + url + "','" + alt_image_url + "')";
                    
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log('\x1b[33m%s\x1b[0m', "Appid: ", appid);
                            console.log('\x1b[33m%s\x1b[0m', "Name: ", name);
                            console.log('\x1b[32m%s\x1b[0m', "Successfully Added!!\n");
                            
                            if (index != appids.length-1) {
                                index++;
                                getGame(appids, index);
                            }
                            else {
                                console.log('\x1b[31m%s\x1b[0m', "Terminating database connection....\n");
                                con.end(function(err) {
                                    console.log("Unable to terminate connection: ");
                                    console.log(err);
                                });
                                process.exit();
                            }
                        });
                    }
                });
            }
        });	
    })
    .catch((err) => {
        console.log(err);
    });
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
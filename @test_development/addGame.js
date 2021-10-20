var express = require('express');
var mysql = require('mysql');
var fetch = require('node-fetch');
const SGDB = require('steamgriddb');
const client = new SGDB('c6bb1de817f19913467760f4511ce14c');
const Nightmare = require('nightmare');
const cheerio = require('cheerio');

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
var review_percent = -1;
var genres = [];
var is_free = 0;
var url = ""; 

console.log('\x1b[35m%s\x1b[0m',"Processing " + appids.length + " games\n");

getGame(appids, 0);

const genreOptions = {
    headers: {
        cookie: 'birthtime=36000000'
    }
}

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
    final_price = 0;
    discount_percent = -1;
    review_percent = 0;
    genres = [];
    is_free = 0;
    url = "https://store.steampowered.com/app/" + appid; 
    alt_image_url = "";

    apiurl = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&cc=us&l=en';
    apiurl_reviews = 'https://store.steampowered.com/appreviews/' + appid + '?json=1&purchase_type=all&language=all'
                    
    client.getGrids({type: 'steam', id: appid, styles: ['alternate']})
    .then(function(output) {
        console.log('\x1b[33m%s\x1b[0m', "Alternate image obtained");
        if (output[0])
            return output[0]['url'];
        else
            return "img/undefined.jpg";
    })
    .then(function(alt_image_url) {
        fetch(apiurl)
            .then(game => game.json())
            .then(function(game) {
                fetch(apiurl_reviews)
                .then(gameReviews => gameReviews.json())
                .then(function (gameReviews) {
                    var sql = "SELECT * FROM games WHERE appid = " + appid;
 
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        if (result.length > 0) {
                            console.log('\x1b[33m%s\x1b[0m', "Appid: ", appid);
                            console.log('\x1b[33m%s\x1b[0m', "Name: ", result[0]['name']);
                            console.log('\x1b[31m%s\x1b[0m', "Duplicate Entry!!\n");
                            nextGame(index);
                        }
                        else
                        {
                            fetch('https://store.steampowered.com/app/' + appid, genreOptions)
                            .then(function (response) {
                                return response.text();
                            })
                            .then(function (html) {
                                var $ = cheerio.load(html);
                                var tags = [];
                                $('.app_tag').each(function(index, obj) {
                                    tags[index] = $(this).text().trim();
                                });
                                name = game[appid]['data']['name'].replace(/[']/g, "''");
                                developer = game[appid]['data']['developers'][0];
                                description = game[appid]['data']['short_description'].replace(/[']/g, "''");
                                release_date = formatDate(game[appid]['data']['release_date']['date']);
                                for (var i=0; i<game[appid]['data']['screenshots'].length; i++) {
                                    screenshots[i] = game[appid]['data']['screenshots'][i]['path_thumbnail'];
                                }
                                image_url = "https://steamcdn-a.akamaihd.net/steam/apps/" + appid + "/library_600x900_2x.jpg";
                                header_image_url = "https://cdn.akamai.steamstatic.com/steam/apps/" + appid + "/capsule_616x353.jpg";
                                is_free = game[appid]['data']['is_free'] ? 1 : 0;
                                if (!is_free && game[appid]['data']['price_overview']) {
                                    initial_price = game[appid]['data']['price_overview']['initial'];
                                    final_price = game[appid]['data']['price_overview']['final'];
                                    discount_percent = game[appid]['data']['price_overview']['discount_percent'];
                                }
                                total_negative = gameReviews['query_summary']['total_negative'];
                                total_positive = gameReviews['query_summary']['total_positive'];
                                total_reviews = gameReviews['query_summary']['total_reviews'];
                                review_percent = Number.isNaN(total_reviews) ? -1 : Math.floor(total_positive/total_reviews*100);
                                for (var i=0; i<game[appid]['data']['genres'].length; i++) {
                                    genres[i] = game[appid]['data']['genres'][i]['description']
                                }
    
                                con.beginTransaction (function(err) {
                                    if (err) { throw err; }
                                    var gamequery = "INSERT INTO games (appid, name, developer, description, release_date, screenshot_url_1, \
screenshot_url_2, screenshot_url_3, screenshot_url_4, image_url, header_image_url, initial_price, final_price, \
discount_percent, genre_1, genre_2, genre_3, genre_4, genre_5, genre_6, is_free, url, alt_image_url) VALUES (" + appid + ",'" + name + "','" + developer + "','" + description + "'\
,'" + release_date +  "','" + screenshots[0] + "','" + screenshots[1] + "','" + screenshots[2] + "','" + screenshots[3] + "','" + image_url + "','" + header_image_url + "'," + initial_price + "," + final_price + "," + discount_percent + ",\
'" + tags[0] + "','" + tags[1] + "','" + tags[2] + "','" + tags[3] + "','" + tags[4] + "','" + tags[5] + "'," + is_free + ",'" + url + "','" + alt_image_url + "')";
                                                            
                                    con.query(gamequery, function (err, result) {
                                        if (err) throw err;
                                        console.log('\x1b[33m%s\x1b[0m', "Appid: ", appid);
                                        console.log('\x1b[33m%s\x1b[0m', "Name: ", name);
                                    });
    
                                    var gamereviewquery = "INSERT INTO gamereviewdetails (appid, total_negative, total_positive, total_reviews, review_percent) VALUES (" + appid + ",'" + total_negative + "','" + total_positive + "','" + total_reviews + "','" + review_percent + "')";
    
                                    con.query(gamereviewquery, function (err, result) {
                                        if (err) throw err;
                                        console.log('\x1b[33m%s\x1b[0m', "Review_percent: ", review_percent+"%");
                                        console.log('\x1b[32m%s\x1b[0m', "Successfully Added!!\n");
                                    });
    
                                    con.commit(function(err) {
                                        if (err) { 
                                            connection.rollback(function() {
                                            throw err;
                                            });
                                        }
                                        nextGame(index);
                                    });
                                });


                            })
                            .catch(function (err) {
                                console.log(err);
                            });                                
                        } 
                    });
                })
                .catch(function(err) {
                    console.log('Error', err);
                });
            })
            .catch(function(err) {
                console.log('Error:', err);
            });
    })
    .catch(function(err) {
        console.log('\x1b[33m%s\x1b[0m', "Appid: ", appid);
        console.log('\x1b[31m%s\x1b[0m', "Game not found!!\n");
        nextGame(index);
    });

}

function nextGame(index) {
    if (index != appids.length-1) {
        var wait = 1;
        index++;
        console.log('\x1b[36m%s\x1b[0m', "Waiting " + wait + " seconds before query...\n");
        setTimeout(function() {
            getGame(appids, index);
        }, wait*1000);
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
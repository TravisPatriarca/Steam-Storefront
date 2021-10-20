"use strict";

const db = require('./dev-sql.js');
const dateFormat = require( 'dateformat' );
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');
const util = require('util');

const config = {
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

async function getAppid() {
    var query = "SELECT * FROM games ORDER BY last_modified ASC LIMIT 1";
    try {
        var result = await con.query(query);
    } catch (err) {
        console.log(err)
    }
    if (result.length > 0)
        return result[0]['appid'];
}

async function getGameDetails(game) {
    var appid = game.appid;
    var apiurl = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&cc=us&l=en';
    var response = await fetch(apiurl);
    if (response.status != 200) {
        fs.appendFileSync('./logs/error.log', dateFormat(new Date(), "dd-mm-yyyy HH:MM:ss") + ": FAILED!!!: [" + game.appid + "] " + game.name + ': ' + response.status + ' - ' + response.statusText + '-' + response.url + '\n', function(err) {
            if (err) {
                return console.log(err);
            }
        });
        console.log(response);
    }
    var json = await response.json();

    game.name = json[appid]['data']['name'].replace(/[']/g, "''");
    game.description = json[appid]['data']['short_description'].replace(/[']/g, "''");
    game.release_date = formatDate(json[appid]['data']['release_date']['date']);
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

async function updateGameDB(game) {
    var datetime = dateFormat( new Date(), "yyyy-mm-dd HH:MM:ss" );
    var query1 = "UPDATE games SET \
name = '" + game.name + "', \
description = '" + game.description + "', \
release_date = '" + game.release_date + "', \
screenshot_url_1 = '" + game.screenshots[0] + "', \
screenshot_url_2 = '" + game.screenshots[1] + "', \
screenshot_url_3 = '" + game.screenshots[2] + "', \
screenshot_url_4 = '" + game.screenshots[3] + "', \
initial_price = " + game.initial_price  + ",\
final_price = " + game.final_price  + ",\
discount_percent = " + game.discount_percent  + ",\
is_free  = " + game.is_free + ", \
last_modified = '" + datetime + "' WHERE appid = " + game.appid;
        
    var query2 = "UPDATE game_reviews SET \
total_negative = " + game.total_negative  + ",\
total_positive = " + game.total_positive  + ",\
total_reviews = " + game.total_reviews  + ",\
review_percent = " + game.review_percent  + " WHERE appid = " + game.appid;

    var query3 = "UPDATE game_genres SET \
genre_1 = '" + game.tags[0] + "', \
genre_2 = '" + game.tags[1] + "', \
genre_3 = '" + game.tags[2] + "', \
genre_4 = '" + game.tags[3] + "', \
genre_5 = '" + game.tags[4] + "', \
genre_6 = '" + game.tags[5] + "' WHERE appid = " + game.appid;

    try {
        await con.beginTransaction();
        await con.query(query1);
        await con.query(query2);
        await con.query(query3);
        await con.commit();
        console.log('\x1b[32m%s\x1b[0m', "Updated: " , "[" + game.appid + "] " + game.name);
        /*fs.appendFileSync('./logs/log.log', dateFormat(new Date(), "dd-mm-yyyy HH:MM:ss") + ": Updated: [" + game.appid + "] " + game.name + '\n', function(err) {
            if (err) {
                return console.log(err);
            }
        });*/
    } catch ( err ) {
        await con.rollback();
        console.log('\x1b[31m%s\x1b[0m', "Update failed: ", "[" + game.appid + "] " + game.name);
        fs.appendFileSync('./logs/error.log', dateFormat(new Date(), "dd-mm-yyyy HH:MM:ss") + ": Update failed: [" + game.appid + "] " + game.name + '\n', function(err) {
            if (err) {
                return console.log(err);
            }
        });
        console.log(err);
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

async function getGame() {
    
    var appid = await getAppid();

    if (appid) {
        var game = {
            appid: appid,
            name: "",
            description: "",
            release_date: "",
            screenshots: [],
            is_free: 0,
            tags: [],
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
            await getGameDetails(game);
            await getGameReviews(game);
            await getGameTags(game);
            await updateGameDB(game);
        } catch (error) {
            fs.appendFileSync('./logs/error.log', dateFormat(new Date(), "dd-mm-yyyy HH:MM:ss") + ": FAILED!!!: [" + game.appid + "] " + game.name + ' ' + error + '\n', function(err) {
                if (err) {
                    return console.log(err);
                }
            });
            console.log(error);

            var datetime = dateFormat( new Date(), "yyyy-mm-dd HH:MM:ss" );
            var query1 = "UPDATE games SET \
last_modified = '" + datetime + "' WHERE appid = " + game.appid;

            try {
                await con.beginTransaction();
                await con.query(query1);
                await con.commit();
            } catch ( err ) {
                await con.rollback();
                console.log('\x1b[31m%s\x1b[0m', "Update failed after failed info: ", "[" + game.appid + "] " + game.name);
                fs.appendFileSync('./logs/error.log', dateFormat(new Date(), "dd-mm-yyyy HH:MM:ss") + ": Update failed after failed info: [" + game.appid + "] " + game.name + '\n', function(err) {
                    if (err) {
                        return console.log(err);
                    }
                });
                console.log(err);
            }
        }
    }
    else
    {
        console.log('\x1b[31m%s\x1b[0m', "No records!!");
        process.exit();
    }

    setTimeout(function() {
        getGame();
    }, 750) 
}
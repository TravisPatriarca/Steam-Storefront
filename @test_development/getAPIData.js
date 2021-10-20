var express = require('express');

var app = express();
var request = require('request');

app.set('port', 3000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var appid = 427520;

var url = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&cc=us&l=en';
request(url, function(err, response, body) {
    if(!err && response.statusCode < 400) {
        var obj = JSON.parse(body);
        console.log(obj[appid]['data']['name']);
    }
});	


return 0;
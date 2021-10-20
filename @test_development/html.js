var fetch = require('node-fetch');
const cheerio = require('cheerio');

/*const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });

console.time("Nightmare");

nightmare
  .goto('https://store.steampowered.com/app/489830')
  .evaluate(function () {
      V_SetCookie('birthtime', 36000000);
      if (typeof HideAgeGate === "function")
        HideAgeGate();
      
    })
    .wait()
    .evaluate(function() {
        return document.body.innerHTML;
    })
    .end()
    .then(function(html) {
        var $ = cheerio.load(html);
        var tags = [];
        $('.app_tag').each(function(index, obj) {
            tags[index] = $(this).text().trim();
        });
        console.log(tags);
        console.timeEnd("Nightmare");

    })
    .catch(error => {
    console.error('Search failed:', error)
  })


const Browser  = require('zombie');
const browser = new Browser();

console.time("Zombie");

browser.setCookie({name: 'birthtime', domain:'store.steampowered.com', value: 36000000})
browser.visit('https://store.steampowered.com/app/489830', function() {
    var $ = cheerio.load(browser.html());
    var tags = [];
    $('.app_tag').each(function(index, obj) {
        tags[index] = $(this).text().trim();
    });
    console.log(tags);
    console.timeEnd("Zombie");
});*/

const opts = {
    headers: {
        cookie: 'birthtime=36000000'
    }
}
fetch('https://store.steampowered.com/app/489830', opts)
    .then(function (response) {
        return response.text();
    })
    .then(function (html) {
        var $ = cheerio.load(html);
        var tags = [];
        $('.app_tag').each(function(index, obj) {
            tags[index] = $(this).text().trim();
        });
        console.log(tags);
    })
    .catch(function (err) {
        console.log(err);
    });



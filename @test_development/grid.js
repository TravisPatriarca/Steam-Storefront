const SGDB = require('steamgriddb');
const client = new SGDB('c6bb1de817f19913467760f4511ce14c');

client.getGrids({type: 'steam', id: 346110, styles: ['alternate']})
    .then((output) => {
        console.log('\x1b[33m%s\x1b[0m', "Alternate image obtained");
        alt_image_url = output[0]['url'];
    })
    .catch((err) => {
        console.log(err);
    });
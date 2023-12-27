const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
var appRoot = path.resolve(__dirname) + "/dunderStuff2/";
const app = express();

/* Middlewares */
app.use(express.static('public'));
app.use(bodyParser.json());
app.use( express.static( __dirname + '/dunderStuff2' ));

/* Routes */
app.get('/', function (req, res) {
    res.sendFile( path.join( __dirname, 'dunderStuff2', 'dunderBotInventoryViewer.html' ));
});
var gRes = null;

//appSendInv = false;
//appSendHp = false;
//bots[0].inventory.on("updateSlot", () => {appSendInv = true;});
//bots[0].inventory.on("health", () => {appSendHp = true;});

app.post('/write', function (req, res) {
    gRes = res;
    const body = req.body; // your request body

    // your "magical" code
    /*console.log(req.body);
    console.log(bots[0].health);
    console.log(bots[0].foodSaturation);
    console.log(bots[0].food);*/
    //console.log(bots[0].oxygenLevel);
    if (bots[0].dunder.network.appSendInv) {
        myObj = JSON.parse(JSON.stringify(bots[0].inventory));
        bots[0].dunder.network.appSendInv = false;
    } else {
        myObj = {};
    }
    if (bots[0].dunder.network.appSendHp) {
    myObj.isHp = true;
    myObj.health = bots[0].health;
    myObj.foodSaturation = bots[0].foodSaturation;
    myObj.food = bots[0].food;
    myObj.inLava = bots[0].entity.isInLava;
    myObj.inWater = bots[0].entity.isInWater;
    myObj.onFire = bots[0].dunder.onFire;
    myObj.isInWeb = bots[0].entity.isInWeb;
    bots[0].dunder.network.appSendHp = false;
    }
    if (bots[0].dunder.network.appSendOxy) {
        //console.log("asdfe");
        myObj.oxygenLevel = bots[0].oxygenLevel;
        bots[0].dunder.network.appSendOxy = false;
    }
    myObj.quickBarSlot = bots[0].quickBarSlot;
    res.send(myObj);
    //console.log(req.body.clickRequests);
    if (req.body.clickRequests && bots[0]) {
        //for (var i = 0; i < Math.floor(req.body.clickRequests.length / 2) * 2; i += 2) {
        for (var i = 0; i < Math.floor(req.body.clickRequests.length); i++) {
            //setTimeout(() => {
                console.log("asdf, " + req.body.clickRequests[i]);
                bots[0].simpleClick.leftMouse(Number(req.body.clickRequests[i]));
                //bots[0].simpleClick.leftMouse(bots[0].inventory[req.body.clickRequests[i]]);
            //}, i*50)
            //console.log(JSON.stringify(bots[0].inventory));
        }
    }
});
/* 3, 2, 1, Launch ! */
app.listen(process.env.PORT || 3000, function() {
});
console.log("e");
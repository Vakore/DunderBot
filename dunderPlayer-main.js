/*
dunderHelper

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//--------------SETTINGS-----------------------
const version = "1.20.1";
const host = "localhost";//localhost
const port = 25565;//25565 is default
const commanders = ["Vakore"];
var botsToSpawn = ["DunderBot", /*"AnotherBot", "ThirdBot", "parkourplayer", "NotSuperBri", "ToadWashington"*/];
var botJoinServerDelay = 2000;//2000 by default to avoid throttled connections
//var playersToBowTo = ["TheMithrandir", "L247Chaos", "E_X_K"];
//------------------SETTINGS--------------------

//require("events").EventEmitter.prototype._maxListeners = 100;
//process.setMaxListeners = 100;
const mcData = require("minecraft-data")(version);
const mineflayer = require("mineflayer");
const {PlayerState} = require("prismarine-physics");
//const inventoryViewer = require('mineflayer-web-inventory');
//const mineflayerViewer = require('prismarine-viewer').mineflayer
var Vec3 = require('vec3').Vec3;

//require("./dunderPlayer-misc.js");
var fs = require('fs');
// file is included here:
eval(fs.readFileSync(__dirname + '\\dunderPlayer-misc.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-blockidentify.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-pathfind.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-followpath.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-locomote.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-message.js')+'');

var bots = [];

var currentBotToMake = 0;

/*var timer = 0;
var second = 0;
setInterval(function() {
    second++;
    timer = 0;
}, botJoinServerDelay);*/

function makeBots(cbtm) {
    bots[cbtm] = mineflayer.createBot({
        host: host,
        port: port,//25565 is the default
        version: version,
       	username: botsToSpawn[cbtm],
        viewDistance:4,
        //auth:"microsoft",
    });
    //inventoryViewer(bots[cbtm]);

    bots[cbtm].dunder = {
        "spawned":false,

        "masterState":"idle",
        "state":"PvE",

        "consumeTimer":0,
        "equipPackets": [],
        "entityHitTimes": [],
        "shooters": [],
        "blockPackets": [],

        "jumpSprintStates":[],
        "jumpTargets":[],
        "jumpTarget":false,
        "bestJumpSprintState":-1,
        "worrySprintJumpTimer":0,

        "shieldCooldown":0,
        "shieldTimer":0,
        "attackTimer":0,
        "antiRightClickTicks":0,

        "lastPosition":new Vec3(0, 0, 0),
        "onFire":false,
        "onfire":0,
        "looktimer":0,
        "targetBucket":false,

        "controls":{
            "sneak":false,
        },

        //pathfinding
        //"chunkColumns":[],
        "lookY":0,
        "needsSpeed":0,
        //"destination":[0, 0, 0],
        "destinationTimer":30,
        "searchingPath":10,
        "lastPos":{"currentMove":0,x:0,y:0,z:0},
        "nodes3d":[],
        "openNodes":[],
        "nodes":[],
        "isDigging":0,
        "goal":{x:0,y:0,z:0,reached:false},
        "maxAttempts":500,
    };
    var bot = bots[cbtm];
    bots[cbtm]._client.on("set_passengers", (packet) => {
        if (bot.entities[packet.entityId] && bot.entities[packet.entityId].position) {
            //console.log(bot.entities[packet.entityId].name + " has passengers ");
            bot.entities[packet.entityId].passengers = packet.passengers;
            for (var i = 0; i < packet.passengers.length; i++) {
                if (bot.entities[packet.passengers[i]] && bot.entities[packet.passengers[i]] == bot.entity) {continue;}
                if (bot.entities[packet.passengers[i]] && bot.entities[packet.passengers[i]].position) {
                    //console.log(bot.entities[packet.passengers[i]].name + ", ");
                    bot.entities[packet.passengers[i]].position = bot.entities[packet.entityId].position.offset(0, 0, 0);
                }
            }
        }
        console.log(packet.passengers);
    });

    /*bot._client.on('position', (packet) => {
        console.log("e");
    });*/

    bots[cbtm].once("spawn", () => {
        bots[cbtm].dunder.jumpTarget = bots[cbtm].entity.position;
        bots[cbtm].dunder.spawned = true;
        //console.log(bot.lookAt);
        //setInterval(runBot, 50, bots[cbtm]);

        //mineflayerViewer(bots[cbtm], { port: 3001 }) // Start the viewing server on port 3000

        // Draw the path followed by the bot
        /*const path = [bots[cbtm].entity.position.clone()]
        bots[cbtm].on('move', () => {
            if (path[path.length - 1].distanceTo(bots[cbtm].entity.position) > 1) {
                path.push(bots[cbtm].entity.position.clone())
                bots[cbtm].viewer.drawLine('path', path)
        }
        })*/
    });

    bots[cbtm].on("physicsTick", () => {
        if (bots[cbtm].dunder.spawned) {
            runBot(bots[cbtm]);
        }
        /*if (bots[cbtm].username == "DunderBot") {
            console.log(second + ", " + timer);
            timer++;
        }*/
    });


    //bot._client.on('entity_metadata', shieldListener);
    bots[cbtm]._client.on('set_cooldown', (data) => {
        console.log(data);
        if (data.itemID == 1116) {
            bots[cbtm].dunder.shieldCooldown = data.cooldownTicks;
            bots[cbtm].dunder.shieldTimer = -1;
        }
    });

    bots[cbtm].on("kicked", (reason, loggedIn) => console.log(reason, loggedIn));
    bots[cbtm].on("error", err => console.log(err));

    bots[cbtm].on('chat', (username, message) => {
      if (username === bots[cbtm].username) return;
      parseMessage(bots[cbtm], username, message);
    });

    currentBotToMake++;
    if (currentBotToMake < botsToSpawn.length) {
        setTimeout(function() {makeBots(currentBotToMake);}, 10000);
    }


};

setTimeout(function() {makeBots(currentBotToMake);}, 100);

//console.log(bots);

var pveThreatList = {"drowned":3.0, "enderman":3.0,"shulker":1.0,"shulker_bullet":3.0, "piglin_brute":3.0, "vindicator":3.0, "endermite":2.0,"silverfish":2.0, "ravager":3.0,"hoglin":1.0,"magma_cube":3.0,"slime":3.0,"zoglin":1.0,"skeleton":0.1,"stray":0.1, "pillager":0.1, "blaze":1.5, "zombified_piglin":3.0, "piglin":1.0, "illusioner":0.1, "vex":3.5, "fireball":4.5, "phantom":3.5,"zombie":3.0,"husk":3.0,"polar_bear":3.0,"zombie_villager":3.0,"spider":3.5,"cave_spider":3.5,"creeper":3.0, "warden":3.0, "guardian":0.1, "elder_guardian":0.1, "evoker":0.1};
var myParticleDebugTimer = 0;
function runBot(bot) {
    bot.physics.waterInertia = 0.8;
    bot.physics.waterGravity = 0.005;
    if (blockWater(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z)) &&
        blockWater(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y + 1), Math.floor(bot.entity.position.z)) /*| swimmingFast &&
        pathfinderOptions.sprint && shouldSwimFast*/) {
        //swimmingFast = true;
        bot.physics.waterInertia = 0.9;
        bot.physics.waterGravity = 0.001;
    }


    myParticleDebugTimer++;
    if (myParticleDebugTimer > 20) {
        myParticleDebugTimer = 0;
        for (var i = 0; i < movesToGo.length; i++) {
            bot.chat("/particle flame " + movesToGo[i].x + " " + movesToGo[i].y + " " + movesToGo[i].z);
        }
    }
    //bot.chat("/particle minecraft:flame ~ ~ ~ 0 0 0 0 1 force");
    var cursorBlock = bot.blockAtCursor(5);
    bot.dunder.onFire = parseEntityAnimation("player", bot.entity.metadata[0])[0];
    bot.dunder.lastPosition = bot.entity.position;
    //changing line 117 of prismarine-physics's index.js to 
    //const blockBB = new AABB(shape[0] - 0.01, shape[1], shape[2] - 0.01, shape[3] + 0.01, shape[4], shape[5] + 0.01)
    //seems to do the trick for fixing collision bugs at x or z -2 and -32

    //console.log(bot.entity.position.z + ", " + bot.entity.velocity.z + ", " + bot.entity.isCollidedHorizontally + ", " + bot.entity.isCollidedVertically + ", " /*+ JSON.stringify(bot.entity)*/);
    bot.setControlState("back", false);
    bot.setControlState("forward", false);
    bot.setControlState("left", false);
    bot.setControlState("right", false);
    bot.setControlState("jump", false);
    bot.setControlState("sprint", false);
    bot.dunder.controls.sneak = false;

    //Decrease timers
    bot.dunder.worrySprintJumpTimer -= (bot.dunder.worrySprintJumpTimer > -10) ? 1 : 0;
    bot.dunder.consumeTimer -= (bot.dunder.consumeTimer > -10) ? 1 : 0;
    bot.dunder.shieldCooldown -= (bot.dunder.shieldCooldown > -10);
    bot.dunder.shieldTimer -= (bot.dunder.shieldTimer > -10) ? 0.05 : 0;
    bot.dunder.antiRightClickTicks -= (bot.dunder.antiRightClickTicks > -10);
    bot.dunder.attackTimer += 0.05;
    bot.dunder.needsSpeed -= (bot.dunder.needsSpeed > -100);
    bot.dunder.isDigging -= (bot.dunder.isDigging > -10);
    if (bot.targetDigBlock) {bot.dunder.isDigging = 2;}

    for (var i in bot.dunder.entityHitTimes) {
        bot.dunder.entityHitTimes[i] -= 0.05;
        if (bot.dunder.entityHitTimes[i] <= 0) {
            delete bot.dunder.entityHitTimes[i];
        }
    }

    for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
        bot.dunder.equipPackets[i].time--;
        if (bot.dunder.equipPackets[i].time < 0) {
            bot.dunder.equipPackets.splice(i, 1);
            continue;
        }
    }

    var target = undefined;
    //Looking at the commander



    //Things to do regardless of state, as they need to always be known in order to choose a state or act in most states

    //Entity riders
for (var i in bot.entities) {
            if (bot.entities[i] == bot.entity) {continue;}
            if (bot.entities[i].isPassenger) {bot.entities[i].isPassenger--;}
            if (bot.entities[i].passengers && bot.entities[i].passengers.length > 0) {
                        //console.log("a");
                for (var j = 0; j < bot.entities[i].passengers.length; j++) {
                        //console.log("b");
                    if (bot.entities[bot.entities[i].passengers[j]]) {
                        //console.log("c");
                        bot.entities[bot.entities[i].passengers[j]].position = bot.entities[i].position.offset(0, 0, 0);
                        bot.entities[bot.entities[i].passengers[j]].isPassenger = 2;
                        bot.entities[bot.entities[i].passengers[j]].vehicleId = i;
                    }
                }
            }
        }
    /*for (var i in bot.entities) {
        if (bot.entities[i] == bot.entity) {continue;}
        if (bot.entities[i].isPassenger) {bot.entities[i].isPassenger--;}
        if (bot.entities[i].passengers && bot.entities[i].passengers.length > 0) {
                    console.log("a");
            for (var j = 0; j < bot.entities[i].passengers.length; j++) {
                    console.log("b");
                if (bot.entities[bot.entities[i].passengers[j]]) {
                    console.log("c");
                    bot.entities[bot.entities[i].passengers[j]].position = bot.entities[i].position.offset(0, 0, 0);
                    bot.entities[bot.entities[i].passengers[j]].isPassenger = 2;
                    bot.entities[bot.entities[i].passengers[j]].vehicleId = i;
                }
            }
        }
    }*/

    //PvE Threats
    var threatList = [];
    for (var i in bot.entities) {
        //console.log(bot.entities[i].metadata);
        if (bot.entities[i].metadata[9] <= 0) {continue;}
        //epic "ignore mob in wall" fail
        //console.log(target.metadata[15]);
        //if (bot.entities[i].vehicleId) {console.log(bot.entities[i].name);}
        if (bot.entities[i].name == "fireball") {
            //console.log(JSON.stringify(bot.entities[i].position));
            bot.entities[i].position.x += bot.entities[i].velocity.x * 1.0;
            bot.entities[i].position.y += bot.entities[i].velocity.y * 1.0;
            bot.entities[i].position.z += bot.entities[i].velocity.z * 1.0;
        } else if ( (bot.entities[i].name == "skeleton" || bot.entities[i].name == "stray" || bot.entities[i].name == "illusioner") ) {
            if (bot.entities[i].metadata[8] == 1) {
                if (!bot.dunder.shooters[bot.entities[i].uuid]) {
                    bot.dunder.shooters[bot.entities[i].uuid] = 0.0;
                }
                bot.dunder.shooters[bot.entities[i].uuid] += 0.05;
            } else {
                delete bot.dunder.shooters[bot.entities[i].uuid];
            }
            /*if (bot.dunder.shooters[bot.entities[i].uuid] >= 0.6) {
                setShieldTimer(bot, 0.25);
            }*/
        }


        var entityDist = dist3d(bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z);
        if (entityDist > 16) {continue;}
        //if (bot.entities[i].name == "slime" && bot.entities[i].metadata[16] > 1) {console.log(bot.entities[i].metadata);}
        if (bot.entities[i].name == "drowned" || bot.entities[i].name == "enderman" && (bot.entities[i].isPassenger || bot.entities[i].metadata[17] == true || bot.entities[i].metadata[18] == true) ||bot.entities[i].name == "pufferfish" || bot.entities[i].name == "shulker" || bot.entities[i].name == "shulker_bullet" || bot.entities[i].name == "blaze" || (bot.entities[i].name == "piglin" || bot.entities[i].name == "zombified_piglin") && bot.entities[i].metadata[15] == 4 || bot.entities[i].name == "pillager" || bot.entities[i].name == "evoker" || bot.entities[i].name == "witch" || bot.entities[i].name == "piglin_brute" || bot.entities[i].name == "vindicator" || bot.entities[i].name == "silverfish" || bot.entities[i].name == "endermite" || bot.entities[i].name == "magma_cube" || bot.entities[i].name == "slime" && (bot.entities[i].metadata[16] > 1 || entityDist < 1.0) || bot.entities[i].name == "wither_skeleton" || bot.entities[i].name == "hoglin" || bot.entities[i].name == "zoglin" || bot.entities[i].name == "ravager" || bot.entities[i].name == "skeleton" || bot.entities[i].name == "stray" || bot.entities[i].name == "illusioner" || bot.entities[i].name == "fireball" || entityDist < 8 && (bot.entities[i].name == "phantom" || bot.entities[i].name == "vex") || bot.entities[i].name == "zombie" || bot.entities[i].name == "polar_bear" || bot.entities[i].name == "husk" || bot.entities[i].name == "zombie_villager" || bot.entities[i].name == "spider" || bot.entities[i].name == "cave_spider" || bot.entities[i].name == "creeper" || bot.entities[i].name == "warden" || bot.entities[i].name == "guardian" || bot.entities[i].name == "elder_guardian") {
            threatList.push([bot.entities[i], dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z),
            pveThreatList[bot.entities[i].name]]);//bot, distance, threatCircle
            if (bot.entities[i].name == "creeper" && bot.entities[i].metadata[16] > -1) {
                threatList[threatList.length - 1][2] = 7;
                threatList[threatList.length - 1][1] -= 3;
            } else if (bot.dunder.shooters[bot.entities[i].uuid] >= 0.6) {
                threatList[threatList.length - 1][1] -= 20;
                setShieldTimer(bot, 0.25);
            }
        }
    }

    var myThreat = 0;
    while (myThreat < threatList.length && !botCanSee(bot, threatList[myThreat][0])) {
        myThreat++;
    }
    for (var i = myThreat; i < threatList.length; i++) {
        if (threatList[i][1] < threatList[myThreat][1] && botCanSee(bot, threatList[i][0])) {
            myThreat = i;
        }
    }

    //State switcher

    var closeCommander = findCommander(bot);
    if (bot.dunder.onFire && bot.dunder.onfire < 5) {
        bot.dunder.onfire = 5;
    } else if (!bot.dunder.onFire && bot.dunder.onfire > 0) {
        bot.dunder.onfire--;
    }

    if (true) {
        strictFollow(bot);
        bot.dunder.state = "pathfinding";
    } else if (bot.isSleeping) {
        bot.dunder.state = "sleeping";
    } else if (bot.dunder.onfire > 0) {
        bot.dunder.state = "on_fire";
    } else if (closeCommander && dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, closeCommander.position.x, closeCommander.position.y, closeCommander.position.z) > 16) {
        bot.dunder.state = "follow";
    } else if (myThreat < threatList.length && threatList[myThreat]) {
        bot.dunder.state = "PvE";
    } else if (bot.food <= 18 && (bot.entity.onGround || bot.vehicle || bot.dunder.consumeTimer > 0) && hasItem(bot, foodsBySaturation)) {
        bot.dunder.state = "eat";
    } else if (closeCommander && (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, closeCommander.position.x, closeCommander.position.y, closeCommander.position.z) > 4 || !bot.entity.onGround)) {
        bot.dunder.state = "follow";
    } else if (bot.entity.onGround) {
        bot.dunder.state = "idle";
    }
    
    //State handler
    /*
        TODO FOR FIRE:
        1. place water on best block(i.e. not one lower), mostly done, need to do lava and fire checks
        2. allow bot to attempt to find water and traverse to it either with pathfinding or simualtejump
    */
    var waterBlock = bot.findBlock({
        matching: (block) => (block.stateId === 80),//thank you u9g
        maxDistance: 5,
    });
    bot.dunder.looktimer--;
    if (bot.heldItem && bot.heldItem.name == "bucket" && waterBlock) {
            equipItem(bot, ["bucket"]);
            //bot.lookAt(bot.entity.position, 100);
            if (waterBlock) {
                bot.lookAt(waterBlock.position.offset(0.5, 0.5, 0.5), 100, function() {console.log("e");});
                //console.log(JSON.stringify(waterBlock));
            }
            //console.log(bot.entity.pitch);
            if (/*cursorBlock*/waterBlock && bot.entity.heldItem && (bot.entity.heldItem.name == 'bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                bot.swingArm();
                bot.dunder.looktimer = 5;
            }
    } else if (bot.dunder.state == "on_fire" && hasItem(bot, ["water_bucket"])) {
        if (bot.dunder.onFire && bot.entity.onGround) {
            var fireCandidates = [false, false, false, false];
            for (var i = 0; i < 3; i++) {
                if (Math.floor(bot.entity.position.y) - i <= -64) {
                    i = 3;
                    break;
                }
                if (!fireCandidates[0] && blockSolid(bot, Math.floor(bot.entity.position.x - 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z - 0.3001))) {
                    fireCandidates[0] = bot.blockAt(new Vec3(Math.floor(bot.entity.position.x - 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z - 0.3001)));
                }
                if (!fireCandidates[1] && blockSolid(bot, Math.floor(bot.entity.position.x + 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z - 0.3001))) {
                    fireCandidates[1] = bot.blockAt(new Vec3(Math.floor(bot.entity.position.x + 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z - 0.3001)));
                }
                if (!fireCandidates[2] && blockSolid(bot, Math.floor(bot.entity.position.x - 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z + 0.3001))) {
                    fireCandidates[2] = bot.blockAt(new Vec3(Math.floor(bot.entity.position.x - 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z + 0.3001)));
                }
                if (!fireCandidates[3] && blockSolid(bot, Math.floor(bot.entity.position.x + 0.301),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z + 0.3001))) {//(!!!)Probably need to account for negatives or something
                    fireCandidates[3] = bot.blockAt(new Vec3(Math.floor(bot.entity.position.x + 0.3001),
                             Math.floor(bot.entity.position.y) - i,
                             Math.floor(bot.entity.position.z + 0.3001)));
                }
            }
            var myFireCandidate = -1;
            for (var i = 0; i < fireCandidates.length; i++) {
                if (fireCandidates[i] && (myFireCandidate == -1 || fireCandidates[i].position.y > fireCandidates[myFireCandidate].position.y)) {
                    myFireCandidate = i;
                }
            }

            if (myFireCandidate > -1 && fireCandidates[myFireCandidate]) {
                myFireCandidate = fireCandidates[myFireCandidate];
            }

            equipItem(bot, ["water_bucket"]);
            if (myFireCandidate) {
                bot.lookAt(myFireCandidate.position.offset(0.5, 0, 0.5), 100);
            }
            //console.log(bot.entity.pitch);
            if (myFireCandidate && cursorBlock && cursorBlock.position.equals(myFireCandidate.position) && bot.entity.heldItem && (bot.entity.heldItem.name == 'water_bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                bot.swingArm();
                bot.dunder.looktimer = 1;
            } else if (!myFireCandidate) {console.log("no blocks");}
        }
    } else if (bot.dunder.state == "idle") {
        target = findCommander(bot);
        if (target) {
            bot.dunder.jumpTarget = new Vec3(target.position.x, target.position.y + 1.6, target.position.z);
            bot.lookAt(new Vec3(target.position.x, target.position.y + 1.6, target.position.z), 100);
            bot.dunder.controls.sneak = parseEntityAnimation("player", target.metadata[0])[1];
        }
            //bot.entity.velocity.x = 0;
            //bot.entity.velocity.z = 0;
    } else if (bot.dunder.state == "follow") {
        target = findCommander(bot);
        if ((bot.dunder.jumpTarget || bot.entity.onGround) && target) {
        //console.log(jumpTargets);
        if (bot.entity.onGround && !bot.entity.isInLava && bot.dunder.worrySprintJumpTimer <= 0) {
            bot.dunder.jumpTarget = false;
            bot.dunder.jumpTargets = [];
            bot.dunder.jumpSprintStates = [];
            if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) > 3.0) {
                simulateJump(bot, target, new PlayerState(bot, simControl), 0);
            } else {
                bot.clearControlStates();
            }
        }
        if (bot.dunder.jumpTarget && target && bot.dunder.jumpTarget.shouldJump != undefined && (bot.dunder.bestJumpSprintState > -1 || !bot.dunder.jumpSprintStates[bot.dunder.bestJumpSprintState].isInLava)) {
            bot.setControlState("forward", true);
            bot.setControlState("sprint", true);
            bot.setControlState("jump", bot.dunder.jumpTarget.shouldJump);
            //bot.lookAt(new Vec3(bot.dunder.jumpTarget.x, bot.entity.position.y + 1.6, bot.dunder.jumpTarget.z), 100);
            //console.log(bot.dunder.jumpSprintStates[bot.dunder.bestJumpSprintState].state.yaw);
            bot.look(bot.dunder.jumpSprintStates[bot.dunder.bestJumpSprintState].state.yaw, 0, 100);
            if (bot.dunder.jumpTarget.shouldJump == false && bot.dunder.worrySprintJump < 0) {
                bot.dunder.worrySprintJump = 2;
            }
        } else {
            //bot.entity.velocity.x = 0;
            //bot.entity.velocity.z = 0;
        }
    }
    } else if (bot.dunder.state == "PvE") {
            if (myThreat < threatList.length && threatList[myThreat]) {
                botLocomotePvE();
                equipItem(bot, ["netherite_sword","diamond_sword","netherite_axe","diamond_axe","iron_sword","iron_axe","stone_axe","stone_sword","golden_sword","wooden_axe","wooden_sword","golden_axe"]);
                equipItem(bot, ["shield"], "off-hand");
                target = threatList[myThreat][0];
                if (target) {
                    var targetDist = dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z);
                    var targetDistXZ = dist3d(bot.entity.position.x, 0, bot.entity.position.z, target.position.x, 0, target.position.z);
                    bot.lookAt(new Vec3(target.position.x, target.position.y + target.height - 0.5, target.position.z), 100);
                    //bot.setControlState("forward", true);
                    //bot.setControlState("jump", true);
                    if (targetDistXZ > threatList[myThreat][2]) {
                        moveInDir(bot, new PlayerState(bot, {forward: true, back: false, left: false, right: false, jump: false,sprint: false,sneak: false,}));
                    } else {
                        moveInDir(bot, new PlayerState(bot, {forward: false, back: true, left: false, right: false, jump: false,sprint: false,sneak: false,}));
                    }
                    //console.log(target.isPassenger);
                    if (getHitTimes(bot, target.uuid) <= 0 && botCanHit(bot, target) <= 3.0 && bot.dunder.shieldTimer <= 0 && (bot.dunder.attackTimer >= getAttackSpeed(getHeldItem(bot)) || targetDistXZ < threatList[myThreat][2] * 0.65)) {
                        if (bot.entity.velocity.y >= -0.1) {
                            //bot.setControlState("sprint", false);
                        } else {
                            //bot.setControlState("sprint", true);
                        }
                        attackEntity(bot, target);
                    } else {
                        bot.setControlState("sprint", true);
                    }
                }
            } else {
                setShieldTimer(bot, 0.25);
            }
    } else if (bot.dunder.state == "eat") {
        if (bot.food <= 18 && (bot.entity.onGround || bot.vehicle || bot.dunder.consumeTimer > 0)) {
            equipFood(bot, 1);
            if (bot.dunder.consumeTimer <= 0) {
                bot.deactivateItem();
            } else {
                bot.activateItem();
            }
            bot.dunder.consumeTimer = 3;
            //botMovement = 1;
            bot.clearControlStates();
            bot.dunder.controls.sneak = true;
        }
    }



    if (bot.dunder.shieldTimer > 0 && bot.dunder.antiRightClickTicks <= 0 && bot.inventory.slots[45] && bot.inventory.slots[45].name == "shield") {
        //console.log(bot.inventory.slots[45]);
        //if (!bot.usingHeldItem) {bot.activateItem(true);}
        bot.activateItem(true);
        bot.dunder.controls.sneak = true;
        //console.log("blocking");
    } else if (bot.dunder.consumeTimer > 0) {
        if (!bot.usingHeldItem) {bot.activateItem(false);}
        bot.dunder.controls.sneak = true;
        //console.log("eating");
    }  else {
        //console.log("notblocking");
        bot.deactivateItem();
    }

    bot.setControlState("sneak", bot.dunder.controls.sneak);
};
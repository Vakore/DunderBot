process.setMaxListeners(500);
//funny haha debug - https://stackoverflow.com/questions/45395369/how-to-get-console-log-line-numbers-shown-in-nodejs
/*var log = console.log;
console.log = function() {
    log.apply(console, arguments);
    // Print the stack trace
    console.trace();
};*/

/*
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//--------------SETTINGS-----------------------
var useWebInventory = true;//Port is 3000
var version = "1.20.1";//"1.20.1";
var host = "localhost";//localhost for LAN worlds
var port = 25565;//25565;//25565 is default port for most servers
var commanders = ["Vakore"];//The commander of the bots. Will only listen to chat commands from these players
var botsToSpawn = ["DunderBot"/*, "AnotherBot", "ThirdBot"*/];//Currently only accepts a username as an argument. Note that more than one bot causes unwated bugs and errors that need ironing out. One or two works fine, but three starts to make things unstable.
var botJoinServerDelay = 2000;//2000 by default to avoid throttled connections
var dunderDebug = false;//Show debug information in the console or not.
//------------------SETTINGS--------------------

/*
TODO: rror: Event blockUpdate:(130, 130, -49) did not fire within timeout of 5000ms
Mysterious "pathfind and get stuck" bug
Jump sprint improvements - lookahead to decide not to jump sprint(i.e. will get stuck in "infinite loop", strictFollow instead)
Jump sprint improvements - lookahead to figure out a more optimal way to maintain velocity, and also always jump the first tick grounded rather than the next one.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Dunder Bot Minecraft Player
By Vakore

Type 'goto <player>', 'goto <x> <y> <z>', or 'goto <x> <z>' to enter pathfinding mode and go to those coordinates
Type 'e' to enter generic mode.



Key:
(!) - urgent
(*) - presumed fixed
(#) - confirmed fixed
(@) - fixed but still some work to be done
none - todo

Other TODO:
More strict scores for in path when near block place/destruction and allow jump sprinting more? fix these "place/break random blocks"
Improve PvE based on velocity for threats(ones going toward are more dangerous than ones going backward, and thus need more spacing)
A better "ignore" PvE system when fleeing is required/optimal, i.e. the commander has ran away
Improve break block costs(especially for water)
Fix edge cases for jump sprinting
Finish pathing routines that disallow breaking/placing blocks, add a way to make the goal met if in a certain distance, and a way to decide if the bot can't get within reasonable distance of the goal.

Bucket task system
    - Raycasting to check if desired block is visible


TODO:

(!!!)
- mining down one block occasionally on spawn

- prioritizing picking up items versus mining, ideally both at the same time
- "diagonal staircase with block" edgecase and similar(i.e. lava)
- unreachable block case(path spam)
- unfindable block case("freezes")
- unreachable item case(path spam)
- unfindable item case("freezes")
- for both unreachable cases not having blocks needs to be accounted for eventually(more of a pathfinding thing)

- various crafting bugs(make sure have items needed to craft item before crafting?)
- crafting table placement, ideally pick up as well

- jump sprinting stuck cases when inside tree and path tells to go around it

(*) - randomly stops working on certain paths(believed to be a "block update" bug or "ghost air blocks", should attempt to create
general solution for this anyhow)
(*) - randomly stopping on the path after switching from a mining state

(*) - 'Leaves above' bug for pathfinder
(@) Clutching for pathfinder(and 'don't clutch' such as waterloggables)

Multi-bots: Fix the weird spazzing out for the triple bot test when one of them falls in water

Swimming in pathfinder(remember kelp bug):
1. Exitting water
2. Mining near water
3. Swimming at a decent speed
4. Not drowning

Whatever the 'pillar into sky' bug is
(*) - "goUp" bug on top of waterfalls

(* - Was due to "Dig Up A") "mining down" due to the freestyle ability when falling down slopes
/tp DunderBot 163 93 217
goto 157 90 217

falling down slopes in general
water clutching buggyness
myFireCandidate.offset undefined stuff

Path update handler(someone places/breaks blocks)

Shortcut finder/hill climber for pathfinder
Jump sprinting for pathfinder
Testing/fixing multiple players/lava for pathfinder
Option to not break blocks for pathfinder
Doors(pathfinding, swimming, pvp)?
Separation for following
'Hunt' mode(animals)
Handle arrows for PvE
Handle "speed for PvE(i.e. vex going backwards doesn't need extra spacing, one going forwards a lot does)
PvP mode with teams handler
Bow/arrows in PvP and hueristics for pvp "personalities" (i.e. stuns a lot, lava spams, defensive, aggro, combos versus critspam, etc.)
Group fight tests
PvP + PvE tests
Farming/mining/chopping/herding
Inventory management(throw out trash items for better ones, possibly mess around with modifiying inventory-viewer)

Proximity chat compatibility?
Discord VC compatiblity?
'Scouter' for open spaces for pathfinder?
Figure out that one mine block rejected promise thingy
*/
console.log("================================\nChat commands:\nsleep - find nearby bed and sleep in it\nwake - get out of bed\ne - enter 'generic' mode, does things like auto eat, PvE, following the player. Large work in progress.\ngoto <username> OR goto <x> <z> OR goto <x> <y> <z> - Pathfinds to a location using dunderPlayer-pathfind and exits 'generic' mode.\ntogglejump - toggles jump sprinting when following a path. Jump sprinting is a huge WIP. Defaults to on.\ngoto2 (for syntax see 'goto') - Pathfinds to a location using mineflayer-pathfinder. Can break other things, mainly for testing purposes.\nratfind (for syntax see 'goto') - uses and experimental feature that will probably never get used.\nversion - displays version in console.\n================================");

const dunderBotPlayerVersion = "Dev Build - 12/25/2023";
const dunderBotPathfindDefaults = {
    "nodes":"nodes",
    "openNodes":"openNodes",
    "nodes3d":"nodes3d",
    "bestNode":"bestNode",
    "bestNodeIndex":"bestNodeIndex",
    "attempts":"attempts",
    "movesToGo":"movesToGo",
};
const dunderBotPathfindSkips = {
    "nodes":"skipNodes",
    "openNodes":"skipOpenNodes",
    "nodes3d":"skipNodes3d",
    "bestNode":"skipBestNode",
    "bestNodeIndex":"skipBestNodeIndex",
    "attempts":"skipAttempts",
    "attempts":"skipMaxAttempts",
    "movesToGo":"skipMovesToGo",
};

//require("events").EventEmitter.prototype._maxListeners = 100;
//process.setMaxListeners = 100;
var mcData = require("minecraft-data")(version);
const mineflayer = require("mineflayer");
const {PlayerState} = require("prismarine-physics");
//const inventoryViewer = require('mineflayer-web-inventory');
//const mineflayerViewer = require('prismarine-viewer').mineflayer
var Vec3 = require('vec3').Vec3;

//mineflayer-pathfinder
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
var defaultMove;


//require("./dunderPlayer-misc.js");


var fs = require('fs');
//file is included here:
//eval(fs.readFileSync(__dirname + '\\dunderPlayer-voicechat.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-misc.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-blockidentify.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-pathfind.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-followpath.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-locomote.js')+'');
//eval(fs.readFileSync(__dirname + '\\dunderPlayer-ratfind.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-message.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-task.js')+'');
eval(fs.readFileSync(__dirname + '\\dunderPlayer-index.js')+'');
if (useWebInventory) {eval(fs.readFileSync(__dirname + '\\dunderPlayer-inventory.js')+'');}

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

    //bots[cbtm]._client.on("multi_block");

    bots[cbtm].once('inject_allowed', () => {//https://github.com/PrismarineJS/mineflayer/issues/2588
        mcData.blocksArray[mcData.blocksByName.copper_ore.id].hardness = 3;
        mcData.blocksArray[mcData.blocksByName.copper_ore.id].resistance = 3;

        //handleVC(bots[cbtm]);
    });
    //bots[cbtm].oxygenLevel = 20;
    bots[cbtm].dunderTasks = [];
    bots[cbtm].dunderTaskDetails = {x:0,y:0,z:0};
    bots[cbtm].dunderTaskCompleted = false;
    bots[cbtm].dunderTaskCurrent = "none";

    bots[cbtm].dunder = {
        "network":{
            "appSendHp":false,
            "appSendInv":false,
            "appSendOxy":false,
        },

        "cbtm":cbtm,
        "chatParticles":(cbtm == 0),

        "spawned":false,

        "masterState":"none",//idle
        "state":"PvE",

        "consumeTimer":0,
        "equipPackets": [],
        "entityHitTimes": [],
        "shooters": [],
        "blockPackets": [],

        "jumpSprintStates":[],
        "jumpTargets":[],
        "jumpTarget":false,
        "jumpYaw":0,
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

        "cursorBlock":null,

        "bucketTask":{
            x:0,
            y:0,
            z:0,
            bucket:null,//null, water, lava, empty
            pickupAfterDone:null,//null, water, lava
            
        },

        //pathfinding
        //"chunkColumns":[],
        "lookY":0,
        "needsSpeed":0,
        //"destination":[0, 0, 0],
        "destinationTimer":30,
        "searchingPath":10,
        "lastPos":{"currentMove":0,x:0,y:0,z:0},
        "lastPosOnPath":false,

        "nodes3d":[],
        "openNodes":[],
        "nodes":[],

        "skipNodes3d":[],
        "skipOpenNodes":[],
        "skipNodes":[],

        "worryBlockSkipTimer":0,

        "isDigging":0,
        "goal":{x:0,y:0,z:0,reached:false,isMobile:true},
        "maxAttempts":500,
        "skipMaxAttempts":10,

        "movesToGo":[],
        "skipMovesToGo":[],

        //maximum allowed offshoot of a pathfind, calculated using 3d manhattan distance.
        //"0" would be a pathfind must land on the exact coordinates, 1 would be one block next to the coordinates, and so on
        //(!!!) this may need work when multiple pathfinds conflict with each other in the future to change/override this value
        "pathGoalForgiveness":0,

        "botMove":{
            "forward":false,
            "back":false,
            "left":false,
            "right":false,
            "sneak":false,
            "sprint":false,
            "jump":false,
            "isGrounded":0,
            "faceBackwards":4,
            "mlg":0,
            "bucketTimer":0,
            "bucketTarget":{x:0,y:0,z:0},
            "lastTimer":-10,
        },

        "findingPath":null,
        "foundPath":false,
        "attempts":0,
        "skipAttempts":0,
        "performanceStop":0,

        "bestNodeIndex":0,
        "bestNode":0,
        "skipBestNodeIndex":0,
        "skipBestNode":0,

        "jumpTargetDelay":20,
        "jumpSprintAlongPath":true,
        "lastGroundPos":{x:0,y:0,z:0},

        "pathfinderOptions":{
            "maxFall":3,
            "maxFallClutch":256,
            "canClutch":false,
            "sprint":true,
            "parkour":true,
            "placeBlocks":true,//(!!!) disable these for testing later!
            "breakBlocks":true,//(!!!)
            "lowestY":-65,
        },

        //Ratfinding, unused
        "rats":[],
        "findingRat":null,
        "bestRat":null,
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

        bots[cbtm].inventory.on("updateSlot", () => {bots[cbtm].dunder.network.appSendInv = true;});
        bots[cbtm].on("health", () => {bots[cbtm].dunder.network.appSendHp = true;});
        bots[cbtm].on("breath", () => {bots[cbtm].dunder.network.appSendOxy = true;});
        /*bots[cbtm].world.on('blockUpdate', (oldBlock, newBlock) => {
            console.log('blockUpdate', oldBlock.name, oldBlock.position, newBlock.name, newBlock.position)
        });*/

        //mineflayer-pathfinder
        bots[cbtm].loadPlugin(pathfinder)
        defaultMove = new Movements(bots[cbtm])

        bots[cbtm].dunder.jumpTarget = bots[cbtm].entity.position;
        bots[cbtm].dunder.spawned = true;
        //setTimeout(dunderTaskInitialize, 200, bots[cbtm]);//give it some time

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
            if (bots[cbtm].targetDigBlock && bots[cbtm].targetDigBlock.position &&
                dist3d(bots[cbtm].entity.position.x, bots[cbtm].entity.position.y + 1.6, bots[cbtm].entity.position.z,
                       bots[cbtm].targetDigBlock.position.x + 0.5, bots[cbtm].targetDigBlock.position.y + 0.5, bots[cbtm].targetDigBlock.position.z + 0.5) > 5) {
                bot.stopDigging();
                dunderTaskLog("ILLEGAL DIGGING OCCURED!");
            }
            runBot(bots[cbtm]);
            if (bots[cbtm].dunderTaskCompleted && bots[cbtm].dunderTasks.length > 0) {
                bots[cbtm].dunderTaskCompleted = false;
                acceptDunderTask(bots[cbtm], bots[cbtm].dunderTasks[0][0], bots[cbtm].dunderTasks[0][1]);
                bots[cbtm].dunderTasks.splice(0, 1);
                console.log("accepted " + bots[cbtm].dunderTaskCurrent);
            } else if (bots[cbtm].dunderTasks.length == 0 && !bots[cbtm].dunderTaskCompleted) {
                //bots[cbtm].dunderTaskCurrent = "none";
            }
            dunderTaskManager(bots[cbtm]);
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
        setTimeout(function() {makeBots(currentBotToMake);}, 1000);
    }


};

setTimeout(function() {makeBots(currentBotToMake);}, 100);

//console.log(bots);

//TODO: make blaze goal closer to blaze when blaze is higher in the air
//(!!!) fix blaze fireball position prediction
var pveThreatList = {"drowned":3.0, "enderman":3.0,"shulker":2.0,"shulker_bullet":3.0, "piglin_brute":3.0, "vindicator":3.0, "endermite":2.0,"silverfish":2.0, "ravager":3.0,"hoglin":1.0,"magma_cube":3.0,"slime":3.0,"zoglin":1.0,"skeleton":0.5,"stray":0.1, "pillager":0.1, "blaze":2.0, "zombified_piglin":3.0, "piglin":1.0, "illusioner":0.1, "vex":3.5, "fireball":4.5, "phantom":3.5,"zombie":3.0,"husk":3.0,"polar_bear":3.0,"zombie_villager":3.0,"spider":3.0,"cave_spider":3.0,"creeper":3.0, "warden":3.0, "guardian":0.1, "elder_guardian":0.1, "evoker":0.5, "arrow":0.1, "small_fireball":0.1};
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

    if (bot.dunder.chatParticles) {
        myParticleDebugTimer++;
        if (myParticleDebugTimer > 20) {
            myParticleDebugTimer = 0;
            for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
                bot.chat("/particle flame " + bot.dunder.movesToGo[i].x + " " + bot.dunder.movesToGo[i].y + " " + bot.dunder.movesToGo[i].z);
            }
        }
    }
    //bot.chat("/particle minecraft:flame ~ ~ ~ 0 0 0 0 1 force");
    bot.dunder.cursorBlock = bot.blockAtCursor(5);
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
    bot.dunder.searchingPath -= (bot.dunder.searchingPath > -100);
    bot.dunder.jumpTargetDelay -= (bot.dunder.jumpTargetDelay > -10);
    bot.dunder.worryBlockSkipTimer -= (bot.dunder.worryBlockSkipTimer > -10);
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
        if (bot.entities[i].name == "small_fireball") {
            //console.log(JSON.stringify(bot.entities[i].position));
            if (!bot.entities[i].ogPosition) {
                bot.entities[i].ogPosition = {
                    "x":bot.entities[i].position.x,
                    "y":bot.entities[i].position.y,
                    "z":bot.entities[i].position.z,
                };
            }
            bot.entities[i].position.x += bot.entities[i].velocity.x * 1;
            bot.entities[i].position.y += bot.entities[i].velocity.y * 1;
            bot.entities[i].position.z += bot.entities[i].velocity.z * 1;
            //bot.entities[i].velocity.x *= 1.05;
            //bot.entities[i].velocity.y *= 1.05;
            //bot.entities[i].velocity.z *= 1.05;
            //bot.chat("/particle flame " + bot.entities[i].position.x + " " + bot.entities[i].position.y + " " + bot.entities[i].position.z);
        }
        if ( (bot.entities[i].name == "skeleton" || bot.entities[i].name == "stray" || bot.entities[i].name == "illusioner") ) {
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
        } else if (bot.entities[i].name == "blaze") {
            if (bot.entities[i].metadata[16] == 1) {
                if (!bot.dunder.shooters[bot.entities[i].uuid]) {
                    bot.dunder.shooters[bot.entities[i].uuid] = 0.0;
                }
                bot.dunder.shooters[bot.entities[i].uuid] += 0.05 / 4;
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
        if (bot.entities[i].name == "drowned" || bot.entities[i].name == "enderman" && (bot.entities[i].isPassenger || bot.entities[i].metadata[17] == true || bot.entities[i].metadata[18] == true) || bot.entities[i].name == "pufferfish" || bot.entities[i].name == "shulker" || (bot.entities[i].name == "arrow" || bot.entities[i].name == "small_fireball") && projectileIsThreat(bot, bot.entities[i]) || bot.entities[i].name == "shulker_bullet" || bot.entities[i].name == "blaze" || (bot.entities[i].name == "piglin" || bot.entities[i].name == "zombified_piglin") && bot.entities[i].metadata[15] == 4 || bot.entities[i].name == "pillager" || bot.entities[i].name == "evoker" || bot.entities[i].name == "witch" || bot.entities[i].name == "piglin_brute" || bot.entities[i].name == "vindicator" || bot.entities[i].name == "silverfish" || bot.entities[i].name == "endermite" || bot.entities[i].name == "magma_cube" || bot.entities[i].name == "slime" && (bot.entities[i].metadata[16] > 1 || entityDist < 1.0) || bot.entities[i].name == "wither_skeleton" || bot.entities[i].name == "hoglin" || bot.entities[i].name == "zoglin" || bot.entities[i].name == "ravager" || bot.entities[i].name == "skeleton" || bot.entities[i].name == "stray" || bot.entities[i].name == "illusioner" || bot.entities[i].name == "fireball" || entityDist < 8 && (bot.entities[i].name == "phantom" || bot.entities[i].name == "vex") || bot.entities[i].name == "zombie" || bot.entities[i].name == "polar_bear" || bot.entities[i].name == "husk" || bot.entities[i].name == "zombie_villager" || bot.entities[i].name == "spider" || bot.entities[i].name == "cave_spider" || bot.entities[i].name == "creeper" || bot.entities[i].name == "warden" || bot.entities[i].name == "guardian" || bot.entities[i].name == "elder_guardian") {
            threatList.push([bot.entities[i], dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z),
            pveThreatList[bot.entities[i].name]]);//bot, distance, threatCircle
            //console.log(bot.entities[i].velocity);
            if (bot.entities[i].name == "creeper" && bot.entities[i].metadata[16] > -1) {
                threatList[threatList.length - 1][2] = 7;
                threatList[threatList.length - 1][1] -= 3;
            } else if (bot.dunder.shooters[bot.entities[i].uuid] >= 0.6 || (bot.entities[i].name == "arrow" || bot.entities[i].name == "small_fireball")) {
                threatList[threatList.length - 1][1] -= 20;
                setShieldTimer(bot, 0.25-0.15);
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

    if (bot.dunder.masterState == "ratfinding") {
        bot.dunder.state = "ratfind";
        target = bot.dunder.bestRat;
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
    } else if (bot.dunder.masterState == "pathfinding2") {
        bot.dunder.state = "pathfinding2";
    } else if (bot.dunder.masterState == "mining") {
        bot.dunder.state = "mining";
        if (bot.dunderTaskDetails.x != null && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) && (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) > 5 || !bot.entity.onGround || !bot.dunderTaskDetails.failedPathfind && !visibleFromPos(bot, bot.entity.position, new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) && !(dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) <= 5 && bot.dunder.movesToGo.length <= 1 && bot.dunder.movesToGo[0] && visibleFromPos(bot, new Vec3(bot.dunder.movesToGo[0].x, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z), new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) )) {
            bot.dunder.goal.x = bot.dunderTaskDetails.x;
            bot.dunder.goal.y = bot.dunderTaskDetails.y;
            bot.dunder.goal.z = bot.dunderTaskDetails.z;
            bot.dunder.goal.reached = false;
            if (bot.dunder.movesToGo.length <= 1 && !bot.dunder.findingPath) {
                 if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) > 5) {
                     if (bot.dunderTaskDetails.failedPathfind && bot.dunderTaskDetails.failedPathfind.x == Math.floor(bot.dunderTaskDetails.x) && bot.dunderTaskDetails.failedPathfind.y == Math.floor(bot.dunderTaskDetails.y) && bot.dunderTaskDetails.failedPathfind.z == Math.floor(bot.dunderTaskDetails.z)) {
                         for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                             bot.dunderTaskDetails.veinExcluders[bot.dunderTaskDetails.blocksList[i].x + "_" + bot.dunderTaskDetails.blocksList[i].y + "_" + bot.dunderTaskDetails.blocksList[i].z] = true;
                         }
                         //console.log(bot.dunderTaskDetails.x + "_" + bot.dunderTaskDetails.y + "_" + bot.dunderTaskDetails.z);
                         bot.dunderTaskDetails.veinExcluders[bot.dunderTaskDetails.x + "_" + bot.dunderTaskDetails.y + "_" + bot.dunderTaskDetails.z] = true;
                         bot.dunderTaskDetails.blocksList = [];
                         bot.dunderTaskDetails.x = null;
                     } else {
                         //console.log(bot.dunderTaskDetails.failedPathfind + ", " + bot.dunderTaskDetails);
                         bot.dunder.pathGoalForgiveness = 3;
                         findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(bot.dunderTaskDetails.x), Math.floor(bot.dunderTaskDetails.y), Math.floor(bot.dunderTaskDetails.z), false, false);
                     }
                 } else {
                     console.log("trying");
                     bot.dunder.pathGoalForgiveness = 3;
                     findPath(bot, dunderBotPathfindDefaults, 500, Math.floor(bot.dunderTaskDetails.x), Math.floor(bot.dunderTaskDetails.y), Math.floor(bot.dunderTaskDetails.z), false, false, {mustBeVisible:true});
                 }
            } else if (bot.dunder.movesToGo.length > 0) {
                console.log("gimmie block");
                strictFollow(bot);
            }
        } else if (bot.dunderTaskDetails.x != null && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) {
             if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) <= 5) {
                equipTool(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
                bot.lookAt(new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z).offset(0.5, 0.5, 0.5), 100);
                digBlock(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
            }
        } else if (bot.dunderTaskDetails.x != null || bot.dunderTaskDetails.y == null) {
            bot.dunderTaskDetails.x = null;
            if (bot.dunderTaskDetails.blocksList.length > 0) {
                bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[0].x;
                bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[0].y;
                bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[0].z;
                let lastI = 0;
                for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z,
                               bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z,
                               bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z) || blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z))) && !blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) ) {
                       bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[i].x
                       bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[i].y;
                       bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[i].z;
                       lastI = i;
                    }
                }
                //console.log(bot.dunderTaskDetails.blocksList);
                dunderTaskLog("thungy " + bot.dunderTaskDetails.blocksListCount);
                bot.dunderTaskDetails.blocksList.splice(lastI, 1);
                bot.dunderTaskDetails.blocksListCount--;
                //console.log(bot.dunderTaskDetails.blocksList);
                dunderTaskLog("finished mining block, "  + bot.dunderTaskDetails.count + " left. Next: " + bot.dunderTaskDetails.x + ", " + bot.dunderTaskDetails.y + ", " + bot.dunderTaskDetails.z + ", " + bot.dunderTaskDetails.blocksListCount);
                if (bot.dunderTaskDetails.blocksListCount <= -1) {
                    dunderTaskLog("Actually, we're done.")
                    bot.dunderTaskDetails.x = null;
                    bot.dunderTaskDetails.blocksList = [];
                }
            }
        } else {
            bot.dunderTaskDetails.itemsList = [];
            for (var i in bot.entities) {
                if (bot.entities[i].name == "item") {
                    if (!bot.entities[i].excluded && blockSolid(bot, bot.entities[i].position.x, bot.entities[i].position.y-1.0, bot.entities[i].position.z) && bot.entities[i].metadata && bot.entities[i].metadata[8] && bot.entities[i].metadata[8].itemId && bot.dunderTaskDetails.itemCondition(bot.registry.items[bot.entities[i].metadata[8].itemId].name)) {
                        //dunderTaskLog("item found " + bot.registry.items[bot.entities[i].metadata[8].itemId].name);
                        bot.dunderTaskDetails.itemsList.push(bot.entities[i]);
                    }
                }
            }

            if (bot.dunderTaskDetails.itemsList.length > 0 && hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition) < bot.dunderTaskDetails.itemTotal) {
                bot.dunder.goal.x = Math.round(bot.dunderTaskDetails.itemsList[0].position.x);
                bot.dunder.goal.y = Math.floor(bot.dunderTaskDetails.itemsList[0].position.y);
                bot.dunder.goal.z = Math.round(bot.dunderTaskDetails.itemsList[0].position.z);
                bot.dunder.goal.reached = false;
                if (bot.dunder.movesToGo.length <= 1 && !bot.dunder.findingPath && (!bot.dunderTaskDetails.failedPathfind || bot.dunderTaskDetails.failedPathfind && (bot.dunderTaskDetails.failedPathfind.x != bot.dunder.goal.x || bot.dunderTaskDetails.failedPathfind.y != bot.dunder.goal.y || bot.dunderTaskDetails.failedPathfind.z != bot.dunder.goal.z))) {
                    bot.dunder.pathGoalForgiveness = 0;
                    findPath(bot, dunderBotPathfindDefaults, 500, Math.floor(bot.dunder.goal.x), Math.floor(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z), false, false);
                    //console.log(bot.dunderTaskDetails.failedPathfind);
                } else if (bot.dunderTaskDetails.failedPathfind && (bot.dunderTaskDetails.failedPathfind.x == bot.dunder.goal.x && bot.dunderTaskDetails.failedPathfind.y == bot.dunder.goal.y && bot.dunderTaskDetails.failedPathfind.z == bot.dunder.goal.z)) {
                    bot.dunderTaskDetails.itemsList[0].excluded = true;
                } else {
                    console.log("gimmie the item");
                    strictFollow(bot);
                }
            } else {
                let botItemMineCount = hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition);
                if (botItemMineCount < bot.dunderTaskDetails.itemTotal) {
                    bot.dunderTaskDetails.blocksList = findVein(bot, bot.dunderTaskDetails.options);
                    bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.blocksList.length;
                    if (bot.dunderTaskDetails.blocksListCount > bot.dunderTaskDetails.itemTotal - botItemMineCount) {
                        bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.itemTotal - botItemMineCount;
                    }
                    bot.dunderTaskDetails.y = null;
                    if (bot.dunderTaskDetails.blocksList.length > 0) {
                        dunderTaskLog("found more! " + bot.dunderTaskDetails.blocksList);
                    } else {
                        dunderTaskLog("Could not find any nearby veins.");
                        bot.dunderTaskCompleted = true;
                    }
                } else {
                    dunderTaskLog("finished mining vein." + hasItemCount(bot, bot.dunderTaskDetails.itemCondition) + " " + bot.dunderTaskDetails.itemTotal);
                    bot.dunderTaskCompleted = true;
                }
            }
        }
    } else if (bot.dunder.masterState == "pathfinding" /*&& myThreat >= myThreatList.length*/) {
        strictFollow(bot);
        bot.dunder.state = "pathfinding";
            /*if (bot.dunder.worryBlockSkipTimer < 0) {
                bot.dunder.worryBlockSkipTimer = 10;
                var worryBlockCount = 0;
                var earliestSkip = 0;
                var lattestSkip = bot.dunder.lastPos.currentMove;
                for (var i = bot.dunder.lastPos.currentMove; i > bot.dunder.lastPos.currentMove - (6 + ((worryBlockCount > 0) ? 1 : 0) + ((worryBlockCount > 1) ? 1 : 0)) && i > 0; i--) {
                    //console.log(movesToGo[i].blockActions + ", " + movesToGo[i].blockDestructions);
                    if (bot.dunder.movesToGo[i] && (bot.dunder.movesToGo[i].blockActions && bot.dunder.movesToGo[i].blockActions.length > 0 || bot.dunder.movesToGo[i].blockDestructions && bot.dunder.movesToGo[i].blockDestructions.length > 0)) {
                        //shouldJumpSprintOnPath = false;
                        //bot.dunder.jumpTargetDelay = 5;
                        //console.log("Block break");
                        worryBlockCount++;
                        if (earliestSkip == 0) {earliestSkip = i;}
                        lattestSkip = i;
                    }
                }

                if (worryBlockCount > 0 && worryBlockCount < 3) {
                    console.log("Can we skip from " + earliestSkip + " to after " + lattestSkip);

                    var worryBlockSkippable = false;//findPath(bot, dunderBotPathfindSkips, 10, Math.floor(bot.dunder.movesToGo[lattestSkip].x), Math.floor(bot.dunder.movesToGo[lattestSkip].y), Math.floor(bot.dunder.movesToGo[lattestSkip].z));
                    if (worryBlockSkippable) {
                        console.log("skip it!");
                    } else {
                        console.log("can't skip... (never checked, program it lol)");
                    }
                    
                }
            }*/
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
    var raycastedLiquid = null;
    if (waterBlock) {
        //console.log(waterBlock.position.offset(0.5, 0.5, 0.5).minus(bot.entity.position.offset(0, 1.65, 0)).normalize() + "\n" + (new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize()));

        raycastedLiquid = bot.world.raycast(bot.entity.position.offset(0, 1.65, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
            //console.log(leBlock.name);
            if (leBlock && leBlock.name == "water") {
                //console.log("ye!" + leBlock.name);
                return true;
            }
        });
        //if (raycastedLiquid) {console.log(raycastedLiquid.name);}
        //bot.lookAt(waterBlock.position.offset(0.5, 0.5, 0.5), 100);
    }

    bot.dunder.looktimer--;
    if (bot.heldItem && bot.heldItem.name == "bucket" && waterBlock && bot.entity.velocity.y > -0.3518) {
            equipItem(bot, ["bucket"]);
            //bot.lookAt(bot.entity.position, 100);
            if (waterBlock) {
                bot.lookAt(waterBlock.position.offset(0.5, 0.5, 0.5), 100, function() {console.log("e");});
                //console.log(JSON.stringify(waterBlock));
            }
            //console.log(bot.entity.pitch);
            if (/*bot.dunder.cursorBlock*/waterBlock && raycastedLiquid && raycastedLiquid.position.equals(waterBlock.position) && bot.entity.heldItem && (bot.entity.heldItem.name == 'bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                bot.swingArm();
                bot.dunder.looktimer = 1;
            }
    } else if (bot.dunder.state == "on_fire" && hasItem(bot, ["water_bucket"/*, "axolotl_bucket"*/])) {
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
            if (myFireCandidate && bot.dunder.cursorBlock && bot.dunder.cursorBlock.position.equals(myFireCandidate.position) && bot.entity.heldItem && (bot.entity.heldItem.name == 'water_bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                bot.swingArm();
                bot.dunder.looktimer = 1;
                console.log("cursorblock: " + bot.dunder.cursorBlock.position);
            } else if (!myFireCandidate) {console.log("no blocks");}
        }
    } else if (bot.dunder.state == "idle") {
            bot.dunder.goal.reached = true;
            bot.dunder.movesToGo.splice(0, bot.dunder.movesToGo.length);
            //console.log(bot.dunder.movesToGo);
        //console.log("e");
        target = findCommander(bot);
        if (target) {
            bot.dunder.jumpTarget = new Vec3(target.position.x, target.position.y + 1.6, target.position.z);
            bot.lookAt(new Vec3(target.position.x, target.position.y + 1.6, target.position.z), 100);
            bot.dunder.controls.sneak = parseEntityAnimation("player", target.metadata[0])[1];
        }
            //bot.entity.velocity.x = 0;
            //bot.entity.velocity.z = 0;
    } else if (bot.dunder.state == "follow") {
        bot.dunder.goal.isMobile = true;
        target = findCommander(bot);
        if (target && dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) > 3.0 && target.onGround &&
            (!bot.dunder.findingPath || dist3d(bot.dunder.goal.x, bot.dunder.goal.y, bot.dunder.goal.z, target.position.x, target.position.y, target.position.z) > 3.0)) {
            strictFollow(bot);
            bot.dunder.goal.reached = false;
            bot.dunder.goal = getEntityFloorPos(bot, target.position, bot.dunder.goal);

            //bot.chat("/particle minecraft:spit " + bot.dunder.goal.x + " " + bot.dunder.goal.y + " " + bot.dunder.goal.z);
            if (bot.dunder.movesToGo.length == 0 && target.onGround) {findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(bot.dunder.goal.x), Math.floor(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z));console.log("ln 795");}//(!!!) fix the path spam
        } else if (target && target.onGround && bot.dunder.movesToGo.length <= 2) {
            bot.dunder.goal.reached = true;
            bot.dunder.movesToGo.splice(0, bot.dunder.movesToGo.length);
            //console.log(bot.dunder.movesToGo);
        }

        if (target && bot.entity.onGround) {
        }

        if (false && (bot.dunder.jumpTarget || bot.entity.onGround) && target) {
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
            } else if (target && bot.entity.isInWater) {
                bot.lookAt(target.position.offset(0, 1.65, 0), 100);
                //if () {
                    bot.setControlState("forward", true);
                    bot.setControlState("sprint", true);
                //}

                if (target.position.y > bot.entity.position.y + 0.1) {
                    bot.setControlState("jump", true);
                } else if (target.position.y < bot.entity.position.y - 0.1) {
                    bot.setControlState("sneak", true);
                    if (bot.entity.velocity.y > -1.0) {bot.entity.velocity.y -= 0.01;}
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
                    if (!target.ogPosition) {
                        bot.lookAt(new Vec3(target.position.x + target.velocity.x * 0, target.position.y + target.height - 0.5, target.position.z + target.velocity.z * 0), 100);
                    } else {
                        console.log(JSON.stringify(target.ogPosition));
                        bot.lookAt(new Vec3(target.ogPosition.x, target.ogPosition.y, target.ogPosition.z), 100);
                    }
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
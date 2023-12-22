const mineflayer = require("mineflayer");
const {PlayerState} = require("prismarine-physics");
var Vec3 = require('vec3').Vec3;

const bot = mineflayer.createBot({
    host: "localhost",
    port: 25565,
    //host: "minecraft.next-gen.dev",
    //port: 25565,//25565 is the default
    username: "DunderBot",
    version: "1.20.1",
    //version: "1.17.1",
});

var playerData = [
];

function dist3d(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) + (z2 - z1)*(z2 - z1));
};

function botCanHit(elTarget) {
    var returner = dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, elTarget.position.x, elTarget.position.y, elTarget.position.z);
    if (returner > dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, elTarget.position.x, elTarget.position.y + elTarget.height, elTarget.position.z)) {
        returner = dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, elTarget.position.x, elTarget.position.y + elTarget.height, elTarget.position.z);
    }

    if (bot.entity.position.y + 1.6 > elTarget.position.y && bot.entity.position.y + 1.6 < elTarget.position.y + elTarget.height) {
        returner = dist3d(bot.entity.position.x, 0, bot.entity.position.z, elTarget.position.x, 0, elTarget.position.z);
    }
    return returner;
};

var equipPackets = [];
function equipItem(bot, itemNames, dest) {
    //console.log(bot.inventory);
    var inven = bot.inventory.slots;
    var equippedItem = -1;
    var equipTries = 0;
    if (dest == undefined) {dest = "hand";}
    while (equippedItem < 0 && equipTries < itemNames.length) {
        //console.log(itemNames[equipTries]);
        for (var i = 0; i < inven.length; i++) {
            if (inven[i] == null) {
                continue;
            } else if (inven[i].name == itemNames[equipTries]) {
                equippedItem = i;
                i = inven.length;
            } else {
                //console.log(inven[i].name);
            }
        }
        equipTries++;
    }
    if (equippedItem == bot.quickBarSlot + 36 && dest == "hand") {
        equippedItem = -1;
        //console.log("no need");
    }
    for (var i = 0; i < equipPackets.length; i++) {
        if (equipPackets[i].slot == equippedItem && equipPackets[i].destination == dest) {
            equippedItem = -1;
        }
    }
    if (equippedItem > 0) {
        var needsToGo = true;
        for (var i = 36; i < 43; i++) {
            if (inven[i] == null) {
                needsToGo = false;
            }
        }
        equipPackets.push({"slot":equippedItem, "destination":dest, "time":70});
        //attackTimer = 0;
        bot.equip(inven[equippedItem], dest, function(e) {
            //console.log("canEquip: " + e);
            for (var i = 0; i < equipPackets.length; i++) {
                if (equipPackets[i].slot == equippedItem && equipPackets[i].destination == dest) {
                    equipPackets.splice(i, 1);
                }
            }
            console.log(bot.quickBarSlot + ", " + equippedItem);
            //attackTimer = 0;
        });
    }
    //console.log(itemNames + ", " + equippedItem);
};

var botRange = 3;
var attackTimer = 0;
var strafeDir = 0;
var strafeTimer = 0;
var moveTimer = 0;
var jumpTimer = 0;
var blockPackets = [];
var botDestinationTimer = 30;
var botSearchingPath = 10;
var botLookAtY = 0;
var botHostile = false;
var jumpTarget = false;
var jumpTargets = [];

var botPvpRandoms = {
    "aggroAmount":0.25,
    "aggroChangeHits":10,
};

function attackEntity(bot, target) {
    bot.attack(target, true);
    attackTimer = 0;
};

var botPvpRandomsDamages = {
    "0.15":0,
    "0.25":0,
    "0.3":0,
    "0.35":0,
    "0.5":0,
};
var botLastHp = 20;

function run() {
        if (botLastHp > bot.health && botHostile) {
            botPvpRandomsDamages[JSON.stringify(botPvpRandoms.aggroAmount)] += Math.abs(botLastHp - bot.health);
        }
        botLastHp = JSON.parse(JSON.stringify(bot.health));
        for (var i = 0; i < equipPackets.length; i++) {
            equipPackets[i].time--;
            if (equipPackets[i].time < 0) {
                equipPackets.splice(i, 1);
                continue;
            }
        }
        attackTimer += 0.05;
        var target = bot.nearestEntity();
        /*var target;
        for (var i = 0; i < bot.entities.length; i++) {
            if (JSON.stringify(bot.entities[i].type) == '"player"') {
                target = bot.entities[i];
            }
        }*/
        //var elStunTimeout;
        if (target && botHostile) {
            if (playerData[target.username]) {
                /*if (playerData[target.username].blocking) {
                    playerData[target.username].blockTimer = 1;
                } else if (playerData[target.username].blockTimer > 0) {
                    playerData[target.username].blockTimer--;
                }*/
                if (playerData[target.username].blocking && botCanHit(target) <= botRange) {
                    equipItem(bot, ["diamond_axe","iron_axe","stone_axe","golden_axe","wooden_axe"]);
                    //bot.attack(target, true);
                    attackEntity(bot, target);
                    setTimeout(() => {
                        attackEntity(bot, target);
                    }, 50);
                } else {
                    equipItem(bot, ["diamond_sword","iron_sword","stone_sword","golden_sword","wooden_sword"]);
                }
            }
            if (strafeTimer < 0) {
                strafeDir = Math.floor(Math.random() * 4 - 0.001) - 1;
                strafeTimer = Math.floor(Math.random() * 200);
            }
            bot.setControlState("left", false);
            bot.setControlState("right", false);
            if (strafeDir < 0 && botCanHit(target) <= Math.sqrt(30)) {
                bot.setControlState("left", true);
                //bot.setControlState("jump", false);
            } else if (strafeDir >= 0 && botCanHit(target) <= Math.sqrt(30)) {
                bot.setControlState("right", true);
                //bot.setControlState("jump", false);
            }
            strafeTimer--;
            bot.setControlState("sneak", (attackTimer < 0.25));
            if (JSON.stringify(target.type) == '"player"' && JSON.stringify(target.username) != '"Vakore2"') {
                if (bot.entity.position.y + 1.6 > target.position.y && bot.entity.position.y + 1.6 < target.position.y + target.height) {
                    bot.lookAt(new Vec3(target.position.x, bot.entity.position.y + 1.6, target.position.z));
                } else if (bot.entity.position.y + 1.6 < target.position.y) {
                    bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                } else if (bot.entity.position.y + 1.6 > target.position.y + target.height) {
                    bot.lookAt(new Vec3(target.position.x, target.position.y + target.height, target.position.z));
                }
                //bot.lookAt(target.position.offset(0, 1.6, 0));
            }
            if (JSON.stringify(target.type) == '"player"' && JSON.stringify(target.username) != '"Vakore2"' && attackTimer < botPvpRandoms.aggroAmount | botCanHit(target) <= botRange) {
                strafeTimer--;
                if (attackTimer >= 0.45 && botCanHit(target) <= botRange) {
                    bot.setControlState("back", false);
                    bot.setControlState("forward", true);
                    if (bot.entity.velocity.y < 0 && !bot.entity.onGround) {
                        bot.setControlState("sprint", false);
                    } else {
                        bot.setControlState("sprint", true);
                    }
                    //bot.setControlState("sneak", true);
                    attackEntity(bot, target);
                    botPvpRandoms.aggroChangeHits--;
                    if (botPvpRandoms.aggroChangeHits < 0) {
                        var whatToAggro = Math.random();
                        botPvpRandoms.aggroChangeHits = 3;
                        if (whatToAggro < 0.1) {
                            botPvpRandoms.aggroAmount = 0.15;
                            botPvpRandoms.aggroChangeHits += Math.floor(Math.random() * 5);
                        } else if (whatToAggro < 0.45) {
                            botPvpRandoms.aggroAmount = 0.25;
                            botPvpRandoms.aggroChangeHits += Math.floor(Math.random() * 7);
                        } else if (whatToAggro < 0.65) {
                            botPvpRandoms.aggroAmount = 0.3;
                            botPvpRandoms.aggroChangeHits -= 2;
                            botPvpRandoms.aggroChangeHits += Math.floor(Math.random() * 4);
                        } else if (whatToAggro < 0.85) {
                            botPvpRandoms.aggroAmount = 0.35;
                            botPvpRandoms.aggroChangeHits -= 2;
                            botPvpRandoms.aggroChangeHits += Math.floor(Math.random() * 3);
                        } else {
                            botPvpRandoms.aggroAmount = 0.5;
                            botPvpRandoms.aggroChangeHits += Math.floor(Math.random() * 2);
                        }
                        console.log(JSON.stringify(botPvpRandoms));
                        console.log(JSON.stringify(botPvpRandomsDamages));
                    }
                    //console.log(botCanHit(target) + ", " + dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, target.position.x, target.position.y + 1.6, target.position.z));
                    strafeDir = Math.floor(Math.random() * 4 - 0.001) - 1;
                    //console.log(JSON.stringify(target.username));
                } else {
                    bot.setControlState("sprint", false);
                    bot.setControlState("back", true);
                    bot.setControlState("forward", false);
                }
                bot.setControlState("jump", false);
            } else {
                if (botCanHit(target) >= Math.sqrt(28)) {
                    bot.setControlState("jump", true);
                }
                bot.setControlState("forward", true);
                bot.setControlState("back", false);
                bot.setControlState("sprint", true);
            }
        }
        var target = bot.nearestEntity();
        if (target && JSON.stringify(target.type) == '"player"' && botCanHit(target) <= botRange && attackTimer >= 0.6) {
            attackEntity(bot, target);
        }
    };

function run2() {
    
};
bot.once("spawn", () => {
    console.log(bot.lookAt);
    setInterval(run, 50);
});

            var simControl = {
                forward: true,
                back: false,
                left: false,
                right: false,
                jump: true,
                sprint: true,
                sneak: false,
            };
var myStates = [];
function simulateJump(stateBase, searchCount, theParent) {
    //bot.chat("/particle minecraft:flame ~ ~ ~");
            //bot.entity.yaw
          var target = bot.nearestEntity();
          bot.lookAt(new Vec3(target.position.x, bot.entity.position.y + 1.6, target.position.z), 360);
          var myStateBase = stateBase;
          var myDelta = new Vec3(target.position.x - myStateBase.pos.x, target.position.y - myStateBase.pos.y, target.position.z - myStateBase.pos.z);
          myStateBase.yaw = Math.atan2(-myDelta.x, -myDelta.z);
          for (var j = myStateBase.yaw - Math.PI / 2 + Math.PI / 8; j < myStateBase.yaw + Math.PI / 2; j += Math.PI / 8) {
            //var myState = new PlayerState(bot, simControl);//Clone stuff here
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            //myState.vel = new Vec3(myState.vel.x, myState.vel.y, myState.vel.z);
            //console.log(JSON.stringify(myState));
            myState.yaw = j;
            for (var i = 0; i < 30; i++) {
                bot.physics.simulatePlayer(myState, bot.world);
                if (myState.onGround | myState.isInWater | myState.isInLava) {i = 30;}
                //bot.chat("/particle minecraft:flame " + myState.pos.x + " " + myState.pos.y + " " + myState.pos.z);
                //console.log(JSON.stringify(myState.pos));
            }
            if (myState.onGround) {
                myStates.push({state:myState,parent:theParent,open:true});
            }
          }
        if (myStates.length > 0) {
          var myBestState = 0;
          for (var i = 0; i < myStates.length; i++) {
              if (myStates[i].open == true && dist3d(myStates[i].state.pos.x, myStates[i].state.pos.y, myStates[i].state.pos.z,
                         target.position.x, target.position.y, target.position.z) <
                  dist3d(myStates[myBestState].state.pos.x, myStates[myBestState].state.pos.y, myStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z)) {
                  //console.log(myStates[i].open);
                  myBestState = i;
              }
          }
          //bot.chat("/particle minecraft:spit " + myStates[myBestState].state.pos.x + " " + myStates[myBestState].state.pos.y + " " + myStates[myBestState].state.pos.z);
          if (dist3d(myStates[myBestState].state.pos.x, myStates[myBestState].state.pos.y, myStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z) < 1.5 || searchCount <= 0) {
              console.log("decent jumps found");
              var mySearcher = myStates[myBestState];
              while (mySearcher.parent) {
                  jumpTargets.push(mySearcher.state.pos);
                  mySearcher = mySearcher.parent;
              }
              jumpTargets.push(mySearcher.state.pos);
              bot.lookAt(new Vec3(mySearcher.state.pos.x, /*mySearcher.state.pos.y*/target.position.y + 1.6, mySearcher.state.pos.z), 100);
              jumpTarget = mySearcher.state.pos;
          } else if (searchCount > 0) {
              console.log(JSON.stringify(myStates[myBestState].open));
              myStates[myBestState].open = false;
              simulateJump(myStates[myBestState].state, searchCount - 1, myStates[myBestState]);
          }
        } else {
            bot.chat("nothing to jump on...");
        }
};

function parseMessage(username, msg) {
    console.log("<" + username + "> " + msg);
    msg = msg.split(" ");
    switch (msg[0].toLowerCase()) {
        case "gg":
            bot.chat("gg " + username);
        break;
        case "gf":
            bot.chat("gf " + username);
        break;
        case "gl":
            bot.chat("gl hf " + username);
        break;
        case "glhf":
            bot.chat("gl hf " + username);
        break;
        case "ez":
            bot.chat("Hax");
        break;
        case "l":
            bot.chat("L is real!");
        break;
        case "version":
            bot.chat("Uh... really really really early alpha.");
        break;
        case "inventory":
            equipItem(bot, [msg[1]], msg[2]);
        break;
        case "setrange":
            botRange = Number(msg[1]);
            bot.chat("Range set to " + botRange);
        break;
        case "walk":
            bot.setControlState("forward", true);
        break;
        case "run":
            bot.setControlState("forward", true);
            bot.setControlState("sprint", true);
        break;
        case "jump":
            bot.setControlState("jump", true);
            bot.setControlState("jump", false);
        break;
        case "stop":
            jumpTarget = false;
            jumpTargets = [];
            bot.clearControlStates();
            botHostile = false;
            console.log(JSON.stringify(botPvpRandoms));
            console.log(JSON.stringify(botPvpRandomsDamages));
        break;
        case "fight":
            botHostile = true;
        break;
        case "equip":
            bot.activateItem();
        break;
        case "simulatejump":
            jumpTarget = false;
            jumpTargets = [];
            myStates = [];
            var mySimCount = 2;
            if (parseInt(msg[1])) {
                mySimCount = parseInt(msg[1]);
                console.log("mySimCount is " + msg[1]);
            }
            simulateJump(new PlayerState(bot, simControl), mySimCount);
        break;
    }
};

  bot.on("physicsTick", () => {
    var target = bot.nearestEntity();
    if (jumpTarget) {
        console.log(jumpTargets);
        if (/*dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, jumpTarget.x, jumpTarget.y, jumpTarget.z) < 0.5 || */bot.entity.onGround) {
            /*jumpTargets.splice(jumpTargets.length - 1, 1);
            if (jumpTargets.length > 0) {
                jumpTarget = jumpTargets[jumpTargets.length - 1];
            } else {
                jumpTarget = false;
                bot.setControlState("forward", false);
                bot.setControlState("sprint", false);
                bot.setControlState("jump", false);
            }*/
            jumpTarget = false;
            jumpTargets = [];
            myStates = [];
            simulateJump(new PlayerState(bot, simControl), 2);
        }
        if (jumpTarget && target) {
            bot.setControlState("forward", true);
            bot.setControlState("sprint", true);
            bot.setControlState("jump", true);
            bot.lookAt(new Vec3(jumpTarget.x, /*jumpTarget.y*/target.position.y + 1.6, jumpTarget.z), 100);
        }
    }
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    parseMessage(username, message);
  });

    //Thanks to Ezcha#7675 for the shieldListener example.
    const shieldListener = (packet) => {
        if (!packet.entityId || !packet.metadata || packet.metadata.length === 0) return;
        if (!packet.metadata[0].key || packet.metadata[0].key !== 8) return;
        //if (!bot.entities[packet.entityId]) {console.log("error no entity with such packet id"); return;}
        //try 0x1B for entity status
        const entity = bot.entities[packet.entityId];
            if (entity.username == "Vakore") {
        console.log(entity.type + ", " + packet.metadata[0].value);
            }
        if (entity.type === 'player') {
            if (!playerData[entity.username]) {
                playerData[entity.username] = {
                    "blocking":false,
                    "blockTimer":0,
                };
            }
            if (packet.metadata[0].value === 3) {
                playerData[entity.username].blocking = true;
                //equipItem(bot, ["diamond_axe","iron_axe","stone_axe","golden_axe","wooden_axe"]);
            } else {//2 is unequip shield but if the player swaps to a different animation(bow) it won't send
                //equipItem(bot, ["diamond_sword","iron_sword","stone_sword","golden_sword","wooden_sword"]);
                playerData[entity.username].blocking = false;
            }
            if (entity.username == "Vakore") {
                console.log(JSON.stringify(entity.username) + ", " + playerData[entity.username].blocking);
            }
        }
    }
    bot._client.on('entity_metadata', shieldListener);

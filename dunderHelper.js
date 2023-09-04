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
const commanderName = "Vakore";
//------------------SETTINGS--------------------


//require("events").EventEmitter.prototype._maxListeners = 100;
//process.setMaxListeners = 100;
const mcData = require("minecraft-data")(version);
const mineflayer = require("mineflayer");
const {PlayerState} = require("prismarine-physics");
//const inventoryViewer = require('mineflayer-web-inventory');
var Vec3 = require('vec3').Vec3;

const bot = mineflayer.createBot({
    host: host,
    port: port,//25565 is the default
    version: version,
    username: "DunderBot",
    viewDistance:3,
    //auth:"microsoft",
});
//inventoryViewer(bot);

/*
add to digging.js to prevent arm swing bug
    swingInterval = setInterval(() => {
      if (bot.targetDigBlock) {
        bot.swingArm()
      } else {
        clearInterval(swingInterval);
      }
    }, 350)
*/

var botVersion = "dunderHelper v0.01 by Vakore. Made for 1.18.2";
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
function hasItem(bot, itemNames) {
    var inven = bot.inventory.slots;
    var returner = false;
    var findTries = 0;
    while (!returner && findTries < itemNames.length) {
        //console.log(itemNames[equipTries]);
        for (var i = 0; i < inven.length && !returner; i++) {
            if (inven[i] == null) {
                continue;
            } else if (inven[i].name == itemNames[findTries]) {
                returner = true;
            }
        }
        findTries++;
    }
    return returner;
};

function equipItem(bot, itemNames, dest) {
    var finalItemName = null;
    //console.log(bot.inventory);
    var inven = bot.inventory.slots;
    var equippedItem = -1;
    var equipTries = 0;
    if (dest == undefined) {dest = "hand";}
    while (equippedItem < 0 && equipTries < itemNames.length) {
        if (dest == "hand" && bot.heldItem && itemNames[equipTries] == bot.heldItem.name ||
            dest == "off-hand" && bot.inventory.slots[45] && itemNames[equipTries] == bot.inventory.slots[45].name) {
            //console.log("holdingThat!");
            return;
        }
        //console.log(itemNames[equipTries]);
        for (var i = 0; i < inven.length; i++) {
            if (inven[i] == null) {
                continue;
            } else if (inven[i].name == itemNames[equipTries]) {
                finalItemName = itemNames[equipTries];
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
    if (inven[equippedItem] == bot.heldItem) {
        //console.log("hi");
    } else if (equippedItem > 0 && inven[equippedItem] != bot.heldItem) {
        var needsToGo = true;
        for (var i = 36; i < 43; i++) {
            if (inven[i] == null) {
                needsToGo = false;
            }
        }
        equipPackets.push({"slot":equippedItem, "destination":dest, "time":10});
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
    return finalItemName;
};

var foodsByName = [];
for (var i in mcData.foodsByName) {
    foodsByName.push(mcData.foodsByName[i]);
}
var foodsBySaturation = [];
foodsByName.sort((a, b) => b.saturation - a.saturation);
for (var i in foodsByName) {
    foodsBySaturation.push(foodsByName[i].name);
}
//foodsByName.sort((a, b) => b.saturation - a.saturation);
/*for (var i in foodsByName) {
    foodsBySaturation.push(foodsByName[i].name);
}*/
function equipFood() {
    equipItem(bot, foodsBySaturation);//TODO: Ignore certain items except for certain circumstances. i.e. don't eat a gapple if rotten flesh unless in combat.
    //console.log(foodsBySaturation);
};


function getPlacedBlock(x, y, z) {
    var returnTrue = false;
    for (var i = 0; i < blockPackets.length; i++) {
        if (blockPackets[i].x == x && blockPackets[i].y == y && blockPackets[i].z == z) {
            returnTrue = true;
            i = blockPackets.length;
        }
    }
    return returnTrue;
};

function digBlock(bot, x, y, z) {
    var canMine = true;
    /*for (var i = 0; i < equipPackets.length; i++) {
        if (equipPackets[i].destination == "hand") {
            canMine = false;
        }
    }*/
    //botLookAtY = y;
    bot.swingArm();
    if (canMine && !bot.targetDigBlock) {
        //botDestinationTimer = 30 + (getDigTime(bot, x, y, z, bot.entity.isInWater, true) / 50);
        //console.log(getDigTime(bot, x, y, z, false, !inWater) + ", " + botDestinationTimer);
        bot.dig(bot.blockAt(new Vec3(x, y, z))).catch(e => {});
    }
};


var garbageBlocks = ["diorite","granite","andesite","basalt","netherrack","dirt","stone","cobblestone",
                     "warped_planks","crimson_planks","jungle_planks","dark_oak_planks","acacia_planks","birch_planks","spruce_planks","oak_planks"];
function placeBlock(bot, x, y, z, placeBackwards, ignoreGarbage) {
    //console.log("stopping on own terms");
    bot.stopDigging();
    var canPlace = false;
    var placeOffSet = new Vec3(0, 0, 0);
    if (!ignoreGarbage) {equipItem(bot, garbageBlocks, "hand");}
    //(!!!) might need to make them negative
    if (bot.blockAt(new Vec3(x, y, z)).shapes.length > 0) {
        canPlace = false;
    } else if (getPlacedBlock(x, y + 1, z) || bot.blockAt(new Vec3(x, y + 1, z))) {
        canPlace = true;
        placeOffSet = new Vec3(0, 1, 0);
    } else if (getPlacedBlock(x, y - 1, z) ||bot.blockAt(new Vec3(x, y - 1, z)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(0, -1, 0);
    } else if (getPlacedBlock(x + 1, y, z) || bot.blockAt(new Vec3(x + 1, y, z)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(1, 0, 0);
    } else if (getPlacedBlock(x - 1, y, z) || bot.blockAt(new Vec3(x - 1, y, z)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(-1, 0, 0);
    } else if (getPlacedBlock(x, y, z + 1) || bot.blockAt(new Vec3(x, y, z + 1)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(0, 0, 1);
    } else if (getPlacedBlock(x, y, z - 1) || bot.blockAt(new Vec3(x, y, z - 1)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(0, 0, -1);
    }
    for (var i = 0; i < blockPackets.length; i++) {
        if (blockPackets[i].x == x && blockPackets[i].y == y && blockPackets[i].z == z) {
            canPlace = false;
            i = blockPackets.length;
        }
    }
    if (bot.targetDigBlock) {canPlace = false;}
    if (canPlace) {
        blockPackets.push({"x":x,"y":y,"z":z});//used in case of weirdness from the server
        bot.lookAt(new Vec3(x, y, z), 100);
        //attackTimer = 0;
        bot.placeBlock(bot.blockAt(new Vec3(x, y, z)), placeOffSet).then(function(e) {
            //attackTimer = 0;
            //console.log("alerted " + e);
            for (var i = 0; i < blockPackets.length; i++) {
                if (blockPackets[i].x == x && blockPackets[i].y == y && blockPackets[i].z == z) {
                    blockPackets.splice(i, 1);
                    i = blockPackets.length;
                }
            }
        });
        var swingArmPls = true;
        for (var i = 0; i < blockPackets.length; i++) {
            if (blockPackets[i].x == x && blockPackets[i].y == y && blockPackets[i].z == z) {
                swingArmPls = false;
            }
        }
       if (swingArmPls) {
           //bot.swingArm();
       }
       //bot.swingArm();
    }
    //console.log("placed block: " + canPlace);
};

function placeThing(bot, thingName) {
    if (equipItem(bot, [thingName]) == thingName || bot.heldItem && bot.heldItem.name && bot.heldItem.name == thingName) {
        placeBlock(bot, Math.floor(bot.entity.position.x - 1), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z), false, true);
    } else {
        console.log("e");
    }
};

var botRange = 3;
var attackTimer = 0;
var bucketTimer = 0;
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
var botMode = "follow";
var botMasterMode = "follow";
var botMovement = 0;

var botPvpRandoms = {
    "aggroAmount":0.25,
    "aggroChangeHits":10,
};

var antiRightClickTicks = 0;
function attackEntity(bot, target) {
    bot.attack(target, true);
    attackTimer = 0;
    antiRightClickTicks = 2;
};

var botPvpRandomsDamages = {
    "0.15":0,
    "0.25":0,
    "0.3":0,
    "0.35":0,
    "0.5":0,
};
var botLastHp = 20;
/*
0 = nothing
+1 = fire
+2 = sneak
+8 = sprint
+24 = swim
*/
var commanders = [commanderName];
function findCommander() {
    var leTarget;
    for (var i in bot.entities) {
        if (bot.entities[i] == bot.entity) {continue;}
        if (JSON.stringify(bot.entities[i].type) == '"player"') {
            //console.log(JSON.stringify(bot.entities[i]));
            for (var j = 0; j < commanders.length; j++) {
                if (bot.entities[i].username == commanders[j]) {
                    leTarget = bot.entities[i];
                }
            }
        }
    }
    return leTarget;
};

function parseEntityAnimation(entityType, metanum) {
    var returner = [false,false,false,false,false];//fire, sneak, sprint, swim
    if (metanum - 24 >= 0) {
        returner[3] = true;
        metanum -= 24;
    }
    if (metanum - 8 >= 0) {
        returner[2] = true;
        metanum -= 8;
    }
    if (metanum - 2 >= 0) {
        metanum -= 2;
        returner[1] = true;
    }
    if (metanum - 1 >= 0) {
        metanum -= 1;
        returner[0] = true;
    }
    return returner;
};

function isFood(theId) {
    var returner = false;
    for (var i = 0; i < mcData.foodsArray.length; i++) {
        if (mcData.foodsArray[i].id == theId) {
            returner = true;
            i = mcData.foods.length;
        }
    }
    return returner;
};

var weaponTimer = 0;

function getHeldItem(e) {
    if (bot.heldItem && bot.heldItem.name) {return bot.heldItem.name;}
    return "";
};
var toolAttackSpeeds = {
    "wooden_sword":1.6,
    "golden_sword":1.6,
    "stone_sword":1.6,
    "iron_sword":1.6,
    "diamond_sword":1.6,
    "netherite_sword":1.6,

    "wooden_axe":0.8,
    "golden_axe":1.0,
    "stone_axe":0.8,
    "iron_axe":0.9,
    "diamond_axe":1.0,
    "netherite_axe":1.0,

    "wooden_pickaxe":1.2,
    "golden_pickaxe":1.2,
    "stone_pickaxe":1.2,
    "iron_pickaxe":1.2,
    "diamond_pickaxe":1.2,
    "netherite_pickaxe":1.2,

    "wooden_shovel":1.0,
    "golden_shovel":1.0,
    "stone_shovel":1.0,
    "iron_shovel":1.0,
    "diamond_shovel":1.0,
    "netherite_shovel":1.0,

    "wooden_hoe":1.0,
    "golden_hoe":1.0,
    "stone_hoe":2.0,
    "iron_hoe":3.0,
    "diamond_hoe":4.0,
    "netherite_hoe":4.0,

    "trident":1.1,
};
function getAttackSpeed(item) {
    if (!item) {
        return 0.5;
    } else if (toolAttackSpeeds[item] == undefined) {
        return 0.5;
    } else {
        var attackSpeedFormula = (1.0 / toolAttackSpeeds[item]) - 0.025;
        if (attackSpeedFormula < 0.5) {attackSpeedFormula = 0.5;}
        return attackSpeedFormula;
    }
};
//console.log(JSON.stringify(emitter.setMaxListeners));
var oreNames = [
    "iron_ore",
    "deepslate_iron_ore",
    "raw_iron_block",
    "raw_iron",
    "iron_ingot",//gotta have that instasmelt compatibility
    "gold_ore",
    "deepslate_gold_ore",
    "raw_gold_block",
    "raw_gold",
    "diamond",
    "diamond_ore",
    "deepslate_diamond_ore",
    "lapis_lazuli",
    "lapis_ore",
    "deepslate_lapis_ore",
    //"obsidian",
];
function isOre(name) {
    var returner = false;
    for (var i = 0; i < oreNames.length; i++) {
        if (name == oreNames[i]) {
            returner = true;
            i = oreNames.length;
        }
    }
    return returner;
};

var woodNames = [
    "oak_log",
    "birch_log",
    "acacia_log",
    "spruce_log",
    "dark_oak_log",
    "jungle_log",
    "warped_stem",
    "crimson_stem",
];
function isWood(name) {
    var returner = false;
    for (var i = 0; i < woodNames.length; i++) {
        if (name == woodNames[i]) {
            returner = true;
            i = woodNames.length;
        }
    }
    return returner;
};

var leafNames = [
    "flowering_azalea_leaves",
    "azalea_leaves",
    "oak_leaves",
    "birch_leaves",
    "acacia_leaves",
    "spruce_leaves",
    "dark_oak_leaves",
    "jungle_leaves",
    "nether_wart_block",
    "warped_wart_block",
    "vine",
    "lily_pad",
];
function isLeaf(name) {
    var returner = false;
    for (var i = 0; i < leafNames.length; i++) {
        if (name == leafNames[i]) {
            returner = true;
            i = leafNames.length;
        }
    }
    return returner;
};

//mob hunting stuff
var lingerTarget;
var lingerTimer = 0;
var commanderWantsArson = 0;

//digging stuff
var globalTargetBlock;
var globalTargetBlocks;
var globalBlockTimer = 0;
var globalBlockAttempts = 0;
var globalBlockStuckTimer = 0;

//fighting stuff
var shieldTimer = 0;
var botShieldCooldown = 0;

var consumeTimer = 0;
function setShieldTimer(bot, num) {
    if (botShieldCooldown < 0 && bot.inventory.slots[45] && bot.inventory.slots[45].name == "shield") {
        shieldTimer = num;
    }
};
var hitTimers = {};
var hoglinTimers = {};

var entityArmTicks = 0;
bot.on("entitySwingArm", (entity) => {
    if (entity.name == "enderman" || entity.name == "hoglin" || entity.name == "zoglin" || entity.name == "ravager") {
        hoglinTimers[entity.uuid] = (entity.name != "ravager" && entity.name != "enderman") ? 25 : 15;
    }
    //console.log(entityArmTicks);
    //entityArmTicks = 0;
});


bot._client.on("set_passengers", (packet) => {
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

function botCanSee(bot, entity) {
    //console.log(entity.position.offset(0, entity.height / 2, 0).minus(bot.entity.position.offset(0, 1.6, 0)).normalize());
    var theRaycast = bot.world.raycast(bot.entity.position.offset(0, 1.6, 0), entity.position.offset(0, entity.height / 2, 0).minus(bot.entity.position.offset(0, 1.6, 0)).normalize(), 16);
    var returner = true;
    if (theRaycast && dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, theRaycast.intersect.x, theRaycast.intersect.y, theRaycast.intersect.z) <
        dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, entity.position.x, entity.position.y, entity.position.z) - 0.5) {
        returner = false;
    }
    return returner;
};

function botCanSeeBlock(bot, block) {
    var returner = true;
    /*console.log((bot.blockAt(block.position.offset(-1, 0, 0)).shapes.length > 0)  + ", " +
        (bot.blockAt(block.position.offset(1, 0, 0)).shapes.length > 0)  + ", " +
        (bot.blockAt(block.position.offset(0, -1, 0)).shapes.length > 0)  + ", " +
        (bot.blockAt(block.position.offset(0, 1, 0)).shapes.length > 0)  + ", " +
        (bot.blockAt(block.position.offset(0, 0, -1)).shapes.length > 0) + ", " +
        (bot.blockAt(block.position.offset(0, 0, 1)).shapes.length > 0));*/
    if (
        bot.blockAt(block.position.offset(-1, 0, 0)) && bot.blockAt(block.position.offset(-1, 0, 0)).shapes.length > 0 &&
        bot.blockAt(block.position.offset(1, 0, 0)) && bot.blockAt(block.position.offset(1, 0, 0)).shapes.length > 0 &&
        bot.blockAt(block.position.offset(0, -1, 0)) && bot.blockAt(block.position.offset(0, -1, 0)).shapes.length > 0 &&
        bot.blockAt(block.position.offset(0, 1, 0)) && bot.blockAt(block.position.offset(0, 1, 0)).shapes.length > 0 &&
        bot.blockAt(block.position.offset(0, 0, -1)) && bot.blockAt(block.position.offset(0, 0, -1)).shapes.length > 0 &&
        bot.blockAt(block.position.offset(0, 0, 1)) && bot.blockAt(block.position.offset(0, 0, 1)).shapes.length > 0) {
        returner = false;
    }
    return returner;
};

var threatList = [];

function playerUsingItem(entity, name) {
    if (!entity) {return false;}
    if (entity.equipment[0] && entity.metadata[8] == 1 && entity.equipment[0].name == name ||
        entity.equipment[1] && entity.metadata[8] == 3 && entity.equipment[1].name == name) {
        return true;
    }
    return false;
}


/*bot.activateItem = function (offHand = false) {
    bot.usingHeldItem = true
    if (bot.supportFeature('useItemWithBlockPlace')) {
      console.log("e");
      bot._client.write('block_place', {
        location: new Vec3(-1, 255, -1),
        direction: -1,
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: -1,
        cursorY: -1,
        cursorZ: -1
      })
    } else if (bot.supportFeature('useItemWithOwnPacket')) {
      console.log("w");
      bot._client.write('use_item', {
        hand: offHand ? 1 : 0
      })
    }
  }*/

function shareTeam(name) {
    var returner = false;
    var otherTeam = -Infinity;
    var botTeam = Infinity;
                //console.log(bot.username);
    for (var i in bot.teams) {
        for (var j in bot.teams[i].membersMap) {
            if (name == j) {
                otherTeam = i;
            } else if (bot.username == j) {
                botTeam = i;
            }
        }
    }
    if (botTeam == otherTeam) {returner = true;}
    return returner;
};


function prepareCrafting(bot) {
    if (bot.inventory.selectedItem) {
        for (var i = 9; i < bot.inventory.slots.length; i++) {
            if (!bot.inventory.slots[i]) {
                console.log("Putting item " + bot.inventory.selectedItem + " in slot " + i + " containing " + bot.inventory.slots[i]);
                var slotToClick = i;
                bot.clickWindow(slotToClick, 0, 0);
                i = bot.inventory.slots.length;
            }
        }
    }
};

function run() {
        //console.log(botMode + ", " + botMasterMode);
        for (var i in bot.entities) {
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
        }
        //entityArmTicks++;
        botShieldCooldown -= (botShieldCooldown > -10);
        commanderWantsArson -= (commanderWantsArson > -10);
        lingerTimer -= (lingerTimer > -10);
        weaponTimer -= (weaponTimer > -10);
        bucketTimer -= (bucketTimer > -10);
        globalBlockTimer -= (globalBlockTimer > -10);
        globalBlockStuckTimer -= (globalBlockStuckTimer > -10);
        botMovement = 0;
        var target;
        attackTimer += 0.05;
        shieldTimer -= (shieldTimer > -10) ? 0.05 : 0;
        if (botShieldCooldown > 0) {shieldTimer = -1;}
        antiRightClickTicks -= (antiRightClickTicks > -10)
        consumeTimer -= (consumeTimer > -10) ? 1 : 0;
        for (var i in hitTimers) {
            hitTimers[i] -= 0.05;
            if (hitTimers[i] <= 0) {
                delete hitTimers[i];
                continue;
            }
        }
        for (var i in hoglinTimers) {
            hoglinTimers[i] --;
            if (hoglinTimers[i] <= 0) {
                delete hoglinTimers[i];
                continue;
            }
        }
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
        if (botMode == "stay") {
            botMovement = 1;
            target = findCommander();
            if (target) {
                bot.lookAt(new Vec3(target.position.x, target.position.y + 1.6, target.position.z), 100);
                bot.setControlState("sneak", parseEntityAnimation("player", target.metadata[0])[1]);
            }
        }

        if (botMasterMode == "axestrat") {
            botMode = "axestrat";
            botMovement = 1;
        } else if (botMasterMode == "pvp") {
            botMode = "pvp";
            botMovement = 1;
        } else if (botMasterMode == "dumpOres") {
            botMode == "dumpOres";
            botMovement = 1;
            bot.clearControlStates();
            if (findCommander()) {bot.lookAt(findCommander().position.offset(0, 1.6, 0));}
            var inven = bot.inventory.slots;
            for (var i = 0; i < inven.length; i++) {
                if (inven[i] == null) {
                    continue;
                } else if (isOre(inven[i].name)) {
                    bot.tossStack(inven[i]);
                } else {
                    //console.log(inven[i].name);
                }
            }
        } else if (botMasterMode == "mine") {
            botMode = "mine";
            if (globalTargetBlock && globalTargetBlock != bot.blockAt(globalTargetBlock.position)) {globalTargetBlock = bot.blockAt(globalTargetBlock.position);}
          if (globalBlockTimer <= 0 && (!globalTargetBlock || globalTargetBlock && !isOre(globalTargetBlock.name))) {
            if (consumeTimer < 0) {equipItem(bot, ["netherite_pickaxe", "diamond_pickaxe","iron_pickaxe","stone_pickaxe","golden_pickaxe","wooden_pickaxe"]);}
            globalTargetBlock = undefined;
            globalTargetBlocks = bot.findBlocks({
                matching: (block) => (isOre(block.name) && (bot.heldItem && bot.heldItem.type && block.harvestTools[bot.heldItem.type])),
                maxDistance: 5,
                count:10,
            });
            for (var i = 0; i < globalTargetBlocks.length; i++) {
                //console.log();
                if (!botCanSeeBlock(bot, bot.blockAt(new Vec3(globalTargetBlocks[i].x, globalTargetBlocks[i].y, globalTargetBlocks[i].z)))) {
                    globalTargetBlocks.splice(i, 1);
                    i--;
                }
            }
            if (!globalTargetBlocks || globalTargetBlocks.length <= 0) {
                globalBlockTimer = 30;
            } else if (globalTargetBlocks[0]) {
                globalBlockStuckTimer = 30;
                globalBlockTimer = 0;
                globalTargetBlock = bot.blockAt(new Vec3(globalTargetBlocks[0].x, globalTargetBlocks[0].y, globalTargetBlocks[0].z));
            }
          }
          if (globalBlockTimer > 0) {
              if (lingerTarget) {lingerTarget = bot.entities[lingerTarget.id];}
              if (lingerTarget && lingerTarget.name != "item") {lingerTarget = null;}
              if (!lingerTarget) {
                  for (var i in bot.entities) {
                      //console.log(i + "\n" + JSON.stringify(bot.entities[i]))
                      if (bot.entities[i].name != "item" || bot.entities[i].name == "item" && bot.entities[i].metadata[8] && bot.entities[i].metadata[8].itemId && !isOre(mcData.items[bot.entities[i].metadata[8].itemId].name)) {
                          //if (bot.entities[i].name == "item") {console.log(mcData.items[bot.entities[i].metadata[8].itemId].name);}
                          continue;
                      } else if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z) > 8 ||
                                 Math.abs(bot.entities[i].position.y - bot.entity.position.y) > 2) {
                          continue;
                      } else {
                          if (!lingerTarget || lingerTarget &&
                              dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z) <
                              dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, lingerTarget.position.x, lingerTarget.position.y, lingerTarget.position.z)) {
                              lingerTarget = bot.entities[i];
                              globalBlockStuckTimer = 30;
                          }                               
                      }
                  }
              }
              if (!lingerTarget) {
                  botMode = "follow";
              }
          }
        } else if (botMasterMode == "pve") {
            botMode = "pve";
            threatList = [];
            for (var i in bot.entities) {
                //console.log(bot.entities[i].metadata);
                if (bot.entities[i].metadata[9] <= 0) {continue;}
                //epic "ignore mob in wall" fail
                /*if (bot.entities[i].metadata[15] != 4 && !{"spider":1, "cave_spider":1, "vex":1, "pufferfish":1, "witch":1, "pillager":1, "slime":1, "magma_cube":1, "phantom":1, "shulker":1, "shulker_bullet":1, "blaze":1, "fireball":1}[bot.entities[i].name]) {
                    continue;
                }*/

                //console.log(target.metadata[15]);
                //if (bot.entities[i].vehicleId) {console.log(bot.entities[i].name);}
                if (bot.entities[i].name == "fireball") {
                    //console.log(JSON.stringify(bot.entities[i].position));
                    bot.entities[i].position.x += bot.entities[i].velocity.x * 1.0;
                    bot.entities[i].position.y += bot.entities[i].velocity.y * 1.0;
                    bot.entities[i].position.z += bot.entities[i].velocity.z * 1.0;
                }
                var entityDist = dist3d(bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z);
                if (entityDist > 16) {continue;}
                //if (bot.entities[i].name == "slime" && bot.entities[i].metadata[16] > 1) {console.log(bot.entities[i].metadata);}
                if (bot.entities[i].name == "drowned" || bot.entities[i].name == "enderman" && (bot.entities[i].isPassenger || bot.entities[i].metadata[17] == true || bot.entities[i].metadata[18] == true) ||bot.entities[i].name == "pufferfish" || bot.entities[i].name == "shulker" || bot.entities[i].name == "shulker_bullet" || bot.entities[i].name == "blaze" || (bot.entities[i].name == "piglin" || bot.entities[i].name == "zombified_piglin") && bot.entities[i].metadata[15] == 4 || bot.entities[i].name == "pillager" || bot.entities[i].name == "evoker" || bot.entities[i].name == "witch" || bot.entities[i].name == "piglin_brute" || bot.entities[i].name == "vindicator" || bot.entities[i].name == "silverfish" || bot.entities[i].name == "endermite" || bot.entities[i].name == "magma_cube" || bot.entities[i].name == "slime" && (bot.entities[i].metadata[16] > 1 || entityDist < 1.0) || bot.entities[i].name == "wither_skeleton" || bot.entities[i].name == "hoglin" || bot.entities[i].name == "zoglin" || bot.entities[i].name == "ravager" || bot.entities[i].name == "skeleton" || bot.entities[i].name == "stray" || bot.entities[i].name == "illusioner" || bot.entities[i].name == "fireball" || entityDist < 8 && (bot.entities[i].name == "phantom" || bot.entities[i].name == "vex") || bot.entities[i].name == "zombie" || bot.entities[i].name == "polar_bear" || bot.entities[i].name == "husk" || bot.entities[i].name == "zombie_villager" || bot.entities[i].name == "spider" || bot.entities[i].name == "cave_spider" || bot.entities[i].name == "creeper") {
                    threatList.push([bot.entities[i], dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z),
                                     {"drowned":3.0, "enderman":3.0,"shulker":1.0,"shulker_bullet":3.0, "piglin_brute":3.0, "vindicator":3.0, "endermite":2.0,"silverfish":2.0, "ravager":3.0,"hoglin":1.0,"magma_cube":3.0,"slime":3.0,"zoglin":1.0,"skeleton":0.0,"stray":0.0, "pillager":0.0, "blaze":1.0, "zombified_piglin":3.0, "piglin":1.0, "illusioner":0.0, "vex":3.5, "fireball":4.5, "phantom":3.5,"zombie":3.0,"husk":3.0,"polar_bear":3.0,"zombie_villager":3.0,"spider":3.5,"cave_spider":3.5,"creeper":3.0}[bot.entities[i].name]]);//bot, distance, threatCircle
                    if (bot.entities[i].name == "creeper" && bot.entities[i].metadata[16] > -1) {
                        threatList[threatList.length - 1][2] = 7;
                    }
                }
            }

                    //if (entityDist <= 16 && !botCanSee(bot, bot.entities[i])) {continue;}
            //My code may be spaghetti but I'm at least going to attempt to optimize possibly expensive calculations like raycasting to see if a mob is behind a wall or not
            //Ignores mobs behind walls
            var myThreat = 0;
            while (myThreat < threatList.length && !botCanSee(bot, threatList[myThreat][0])) {
                myThreat++;
            }
            for (var i = myThreat; i < threatList.length; i++) {
                if (threatList[i][1] < threatList[myThreat][1] && botCanSee(bot, threatList[i][0])) {
                    myThreat = i;
                }
            }
            if (myThreat >= threatList.length) {
                botMode = "follow";
                botMovement = 0;
                //console.log("huh");
            } else {
                botMovement = 1;
            }
        } else if (botMasterMode == "chop") {
            botMode = "chop";
            var shouldIncrementGBT = false;
            if (globalBlockTimer < 0) {
                lingerTarget = undefined;
                for (var i in bot.entities) {
                  if (bot.entities[i].name == "item") {
                    if (bot.entities[i].metadata && bot.entities[i].metadata.length >= 9  && bot.entities[i].metadata[8].itemId && isWood(mcData.items[bot.entities[i].metadata[8].itemId].name) &&
                        (lingerTarget == undefined || lingerTarget != undefined &&
                        dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, lingerTarget.position.x, lingerTarget.position.y, lingerTarget.position.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z))) {
                        lingerTarget = bot.entities[i];
                        shouldIncrementGBT = true;
                    }
                  }
                }
            }
            if ((!globalTargetBlock || globalTargetBlock && !isWood(globalTargetBlock.name)) && globalBlockTimer < 0 && globalBlockAttempts < 3) {
                globalBlockTimer = 30;
                globalBlockAttempts++;
                globalTargetBlocks = bot.findBlocks({
                    matching: (block) => (isWood(block.name)),
                    maxDistance: 10,
                    count:10,
                });
                var myCommander = findCommander();
                if (globalTargetBlocks && globalTargetBlocks.length > 0) {
                    for (var i = 0; i < globalTargetBlocks.length; i++) {
                        if (globalTargetBlocks[i].y > bot.entity.position.y + 5 || myCommander && Math.abs(globalTargetBlocks[i].x - myCommander.position.x) < 4 && Math.abs(globalTargetBlocks[i].z - myCommander.position.z) < 4) {
                            globalTargetBlocks.splice(i, 1);
                            i--;
                            continue;
                        }
                    }
                    if (globalTargetBlocks.length > 0) {
                        globalTargetBlock = bot.blockAt(globalTargetBlocks[0]);
                    }
                    console.log(globalTargetBlocks);
                } else {
                    globalTargetBlock = undefined;
                }
                /*globalTargetBlock = bot.findBlock({
                    matching: (block) => (block.name == "oak_log"),
                    maxDistance: 10,
                    count:1,
                });*/
            } else if (globalTargetBlock && isWood(globalTargetBlock.name)) {
                globalTargetBlock = bot.blockAt(globalTargetBlock.position);
                globalBlockAttempts = 0;
            }
            if (shouldIncrementGBT && !globalTargetBlock) {
                globalBlockTimer = 30;
            }
            if (globalBlockAttempts >= 2) {
                bot.chat("no wood");
                botMasterMode = "follow";
                botMode = "follow";
            }
        } else if (botMasterMode == "hunt") {
          var commander = findCommander();
          if (commander && dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, commander.position.x, commander.position.y, commander.position.z) > 20) {
              botMasterMode = "follow";
          } else if (commander && commander.equipment && (commander.equipment[0] || commander.equipment[1])) {
              if (commander.equipment[0]) {
                  if (commander.equipment[0].name == "lava_bucket" || commander.equipment[0].name == "flint_and_steel") {
                      commanderWantsArson = 100;
                  }
              }
              if (commander.equipment[1]) {
                  if (commander.equipment[1].name == "lava_bucket" || commander.equipment[1].name == "flint_and_steel") {
                      commanderWantsArson = 100;
                  }
              }
          } else if (!commander) {
              botMasterMode = "follow";
          }
          if (!lingerTarget || lingerTarget.metadata[9] <= 0 || lingerTimer < 0) {
            lingerTarget = undefined;
            for (var i in bot.entities) {
                if (bot.entities[i] == bot.entity) {continue;}
                //if (JSON.stringify(bot.entities[i].type) == '"object"' && bot.entities[i].name == "item" && dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z) < 5) {console.log(mcData.items[bot.entities[i].metadata[8].itemId]);}
                if (JSON.stringify(bot.entities[i].type) == '"object"' && bot.entities[i].name == "item" && bot.entities[i].metadata[8] && (isFood(bot.entities[i].metadata[8].itemId) || mcData.items[bot.entities[i].metadata[8].itemId].name == "leather") ||
                    JSON.stringify(bot.entities[i].type) == '"mob"' && (bot.entities[i].name == "pig" || bot.entities[i].name == "cow" || bot.entities[i].name == "sheep" || bot.entities[i].name == "chicken" || bot.entities[i].name == "rabbit") && bot.entities[i].metadata[9] > 0) {
                    if ((lingerTarget == undefined || lingerTarget != undefined &&
                    dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, lingerTarget.position.x, lingerTarget.position.y, lingerTarget.position.z) >
                    dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z)) &&
                        (hasItem(bot, ["flint_and_steel"]) || parseEntityAnimation("animal", bot.entities[i].metadata[0])[0] || bot.isRaining || commanderWantsArson <= 0) && (bot.blockAt(bot.entities[i].position) && bot.blockAt(bot.entities[i].position).name != "water" || !bot.blockAt(bot.entities[i].position))) {
                        target = bot.entities[i];
                        lingerTarget = bot.entities[i];
                    }
                }
            }
            if (lingerTarget) {
                lingerTimer = 40;
            } else {
                lingerTimer = 5;
            }
           } else {
               target = lingerTarget;
           }
            if (!target || target && (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) > 10 || !bot.isRaining && !hasItem(bot, ["flint_and_steel"]) && commanderWantsArson > 0 && !parseEntityAnimation("animal", target.metadata[0])[0])) {
                botMode = "follow";
            } else if (target) {
                botMode = "hunt";
            }
        } else if (botMasterMode == "follow" || botMasterMode == "followHunt") {//TODO: make sure the bot won't get stuck in water
            botMode = "follow";
            globalBlockAttempts = 0;
            var commander = findCommander();
            for (var i in bot.entities) {
                if (bot.entities[i].type != "player" || bot.entities[i] == bot.entity) {continue;}
                //console.log(bot.entities[i].username + ", " + commander.username);
                if ((!commander || bot.entities[i].username != commander.username) && !shareTeam(bot.entities[i].username) &&
                    dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z) < 16) {
                    botMode = "pvp";
                    botMovement = 1;
                }
            }
            /*if (commander && botMasterMode == "followHunt" && dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, commander.position.x, commander.position.y, commander.position.z) < 5) {
                botMasterMode = "hunt";
            } else {
                botMasterMode = "follow";
            }*/
        } else if (botMasterMode == "stay") {
            botMode = "stay";
        } else if (botMasterMode == "pillar") {
            botMode = "pillar";
            bot.clearControlStates();
            bot.setControlState("jump", true);
            botMovement = 1;
            placeBlock(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z), false);
        } else if (botMasterMode == "digdown") {
            botMode = "digdown";
            bot.clearControlStates();
            botMovement = 1;
            digBlock(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y - 1), Math.floor(bot.entity.position.z));
        }

        if (botMode == "axestrat") {
            //console.log(bot.usingHeldItem);
            bot.clearControlStates();
            for (var i in bot.entities) {
                if (bot.entities[i] == bot.entity || bot.entities[i].username && bot.entities[i].username == "onion") {continue;}
                if (bot.entities[i].type == "player") {
                    target = bot.entities[i];
                }
            }
            //console.log(target.type);
            bot.setControlState("jump", false);
            strafeTimer--;
            if (strafeTimer < 0) {
                strafeDir = Math.floor(Math.random() * 4) - 2;
                strafeTimer = Math.floor(Math.random() * 50);
            }
            if (target) {
                var botTargetDist = dist3d(target.position.x, target.position.y, target.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z);
                //console.log(target.metadata[8] + ", " + JSON.stringify(target.equipment[0]) + ", " + JSON.stringify(target.equipment[1]));
                //console.log(target.metadata[8] + ", " + ((target.equipment[0]) ? target.equipment[0].name : "empty") + ", " + ((target.equipment[1]) ? target.equipment[1].name : "empty"));
                //console.log(playerUsingItem(target, "shield"));
                if (botShieldCooldown > 0) {
                    bot.lookAt(bot.entity.position.offset((bot.entity.position.x - target.position.x), 1.6, (bot.entity.position.z - target.position.z)), 100);
                } else {
                    bot.lookAt(target.position.offset(0, 1.6, 0), 100);
                }
                if (botTargetDist >= 3.0) {
                    moveInDir(new PlayerState(bot, {forward: true,back: false, left: (strafeDir < 0.5 * -10), right: (strafeDir >= 0.5 * 10), jump: false,sprint: false,sneak: false,}));
                } else {
                    moveInDir(new PlayerState(bot, {forward: false,back: false, left: (strafeDir < 0.5 * -10), right: (strafeDir >= 0.5 * 10), jump: false,sprint: false,sneak: false,}));
                    //moveInDir(new PlayerState(bot, {forward: false, back: true, left: (strafeDir < 0.5), right: (strafeDir >= 0.5), jump: false,sprint: false,sneak: false,}));
                }
                if (playerUsingItem(target, "bow") && botTargetDist >= 5.0) {setShieldTimer(bot, 0.4);}
                //bot.setControlState("jump", true);
                bot.setControlState("sprint", true);
            }
            /*if (!playerUsingItem(target, "shield")) {
                equipItem(bot, ["netherite_sword","diamond_sword","iron_sword","stone_sword","golden_sword","wooden_sword"]);
            }*/
            setShieldTimer(bot, 0.2);
            equipItem(bot, ["shield"], "off-hand");
            if (target && botCanHit(target) <= botRange && (attackTimer >= getAttackSpeed(getHeldItem(bot)) || playerUsingItem(target, "shield")) && (shieldTimer <= 0 || attackTimer >= getAttackSpeed(getHeldItem(bot)) && !bot.usingHeldItem)) {
                if (bot.entity.velocity.y < -0.1) {bot.setControlState("sprint", false);}
                if (playerUsingItem(target, "shield")) {
                    equipItem(bot, ["netherite_axe", "diamond_axe","iron_axe","stone_axe","golden_axe","wooden_axe"]);
                } else {
                    setShieldTimer(bot, 0.4);
                }
                attackEntity(bot, target);
                strafeDir = Math.floor(Math.random() * 4) - 2;
            }
        } else if (botMode == "pvp") {
            //console.log(parseEntityAnimation("player", bot.entity.metadata[0])[0]);//bot is on fire
            bot.clearControlStates();
            for (var i in bot.entities) {
                if (bot.entities[i] == bot.entity || bot.entities[i].username && shareTeam(bot.entities[i].username)) {continue;}
                if (bot.entities[i].type == "player") {
                    target = bot.entities[i];
                }
            }
            //console.log(JSON.stringify(target));
            //console.log(bot.teams);
            //console.log(target.type);
            bot.setControlState("jump", false);
            strafeTimer--;
            if (strafeTimer < 0) {
                strafeDir = Math.floor(Math.random() * 4) - 2;
                strafeTimer = Math.floor(Math.random() * 50);
            }
            if (target) {
                var botTargetDist = dist3d(target.position.x, target.position.y, target.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z);
                //console.log(target.metadata[8] + ", " + JSON.stringify(target.equipment[0]) + ", " + JSON.stringify(target.equipment[1]));
                //console.log(target.metadata[8] + ", " + ((target.equipment[0]) ? target.equipment[0].name : "empty") + ", " + ((target.equipment[1]) ? target.equipment[1].name : "empty"));
                //console.log(playerUsingItem(target, "shield"));
                if (weaponTimer <= 0) {
                    bot.lookAt(target.position.offset(0, 1.6, 0), 100);
                } else {
                    if (weaponTimer > 3) {
                        bot.lookAt(new Vec3(Math.floor(target.position.x) + 0.5, Math.floor(target.position.y) + 0.5, Math.floor(target.position.z) + 0.5), true);
                    } else {
                        bot.lookAt(lingerTarget.position, true);
                    }
                }
                if (botTargetDist >= 3.0) {
                    moveInDir(new PlayerState(bot, {forward: true,back: false, left: (strafeDir < 0.5), right: (strafeDir >= 0.5), jump: false,sprint: false,sneak: false,}));
                } else {
                    moveInDir(new PlayerState(bot, {forward: false,back: false, left: (strafeDir < 0.5), right: (strafeDir >= 0.5), jump: false,sprint: false,sneak: false,}));
                    //moveInDir(new PlayerState(bot, {forward: false, back: true, left: (strafeDir < 0.5), right: (strafeDir >= 0.5), jump: false,sprint: false,sneak: false,}));
                }
                if (playerUsingItem(target, "bow") && botTargetDist >= 5.0) {setShieldTimer(bot, 0.4);}
                bot.setControlState("sprint", true);
                //bot.setControlState("jump", true);
            }
            if (!playerUsingItem(target, "shield") && weaponTimer < 0) {
                equipItem(bot, ["netherite_sword","diamond_sword","iron_sword","stone_sword","golden_sword","wooden_sword"]);
            }
            equipItem(bot, ["shield"], "off-hand");
            if (target && dist3d(target.position.x, target.position.y, target.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < 5 &&
                Math.random() * 1000 > 400 && weaponTimer < 0 && attackTimer < 0.15 && parseEntityAnimation("player", target.metadata[0])[0] == false) {
                weaponTimer = 10;
            }
          if (target && dist3d(target.position.x, target.position.y, target.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < 5) {
            if (weaponTimer == 10) {
                if (bot.blockAt(target.position) && bot.blockAt(target.position).name != "air" &&
                    bot.blockAt(target.position).name != "cave_air" && bot.blockAt(target.position).name != "void_air") {
                    weaponTimer = -10;
                } else {
                    var fireItem = equipItem(bot, ["lava_bucket", "flint_and_steel", "fire_charge"]);
                    if (fireItem == "flint_and_steel" || fireItem == "fire_charge") {
                        weaponTimer = 5;
                    } else if (fireItem != "lava_bucket") {
                        weaponTimer = -10;
                    }
                    //if (getHeldItem(bot) == "lava_bucket") {weaponTimer = 5;console.log("e");}
                }
            } else if (weaponTimer == 7) {
                //bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                bot.stopDigging();
            } else if (weaponTimer == 5 || weaponTimer == 4 || weaponTimer == 3) {
                if (weaponTimer == 4) {
                    lingerTarget = {position:new Vec3(Math.floor(target.position.x) + 0.5, Math.floor(target.position.y) + 0.5, Math.floor(target.position.z) + 0.5),};
                } else if (weaponTimer == 4) {
                    weaponTimer = -10;
                }
                if (getHeldItem(bot) == "flint_and_steel" || getHeldItem(bot) == "fire_charge") {
                    //console.log("place pls");
                    //bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                    bot.placeBlock(bot.blockAt(target.position.offset(0, 1, 0)), new Vec3(0, -1, 0));
                    weaponTimer = -1;
                    attackTimer = 0;
                } else if (getHeldItem(bot) == "lava_bucket" && (weaponTimer == 4 || weaponTimer == 3) ||
                           getHeldItem(bot) == "bucket" && weaponTimer == 3) {
                    console.log("lava");
                    bot.deactivateItem();
                    shieldTimer = -10;
                    bot.activateItem();
                }
            } else if (weaponTimer == 1 && getHeldItem(bot) == "bucket") {
                var lavaBlock = bot.findBlock({
                    matching: (block) => (block.stateId == 50),
                    maxDistance: 5,
                });
                if (lavaBlock) {
                    lingerTarget = {position:lavaBlock.position};
                    weaponTimer = 4;
                }
            }
          }
            if (target && weaponTimer < 0 && botCanHit(target) <= botRange && (attackTimer >= getAttackSpeed(getHeldItem(bot)) || playerUsingItem(target, "shield")) && shieldTimer <= 0) {
                if (playerUsingItem(target, "shield")) {
                    equipItem(bot, ["netherite_axe", "diamond_axe","iron_axe","stone_axe","golden_axe","wooden_axe"]);
                } else {
                    setShieldTimer(bot, 0.4);
                }
                if (bot.entity.velocity.y < -0.1) {bot.setControlState("sprint", false);}
                attackEntity(bot, target);
                strafeDir = Math.floor(Math.random() * 4) - 2;
            }
        } else if (botMode == "pve") {
            bot.setControlState("back", false);
            bot.setControlState("forward", false);
            bot.setControlState("left", false);
            bot.setControlState("right", false);
            bot.setControlState("jump", false);
            bot.setControlState("sprint", false);
            bot.setControlState("sneak", false);
            //simple "look and runaway" thing
            //also I was intending on making circles around every threat and make the bot try to find the best position... but this is DunderBot not SmartBot.
            //That means I will be keeping it stupid for now, and likely the foreseeable future.
            /*for (var i = 0; i < threatList.length; i++) {
                target = threatList[i][0];
                if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) < threatList[i][2]) {
                    bot.lookAt(bot.entity.position.offset((bot.entity.position.x - target.position.x), 1.6, (bot.entity.position.z - target.position.z)), 100);
                    bot.setControlState("forward", true);
                    bot.setControlState("sprint", true);
                }
            }*/
            if (myThreat < threatList.length && threatList[myThreat]) {
                equipItem(bot, ["netherite_sword","diamond_sword","netherite_axe","diamond_axe","iron_sword","iron_axe","stone_axe","stone_sword","golden_sword","wooden_axe","wooden_sword","golden_axe"]);
                equipItem(bot, ["shield"], "off-hand");
                target = threatList[myThreat][0];
                var targetDist = dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z);
                var targetDistXZ = dist3d(bot.entity.position.x, 0, bot.entity.position.z, target.position.x, 0, target.position.z);
                if (target.name != "enderman") {
                    bot.lookAt(target.position.offset(0, target.height - 0.2, 0), 100);
                } else {
                    bot.lookAt(target.position.offset(0, 1.6, 0), 100);
                }
                //console.log(target.height);
                //if (target.name == "zombie") {console.log(targetDistXZ);}
                if ({"drowned":1, "enderman":1, "pufferfish":1, "shulker":1, "shulker_bullet":1, "blaze":1, "piglin":1, "zombified_piglin":1, "pillager":1, "evoker":1, "witch":1, "vindicator":1, "piglin_brute":1, "silverfish":1, "endermite":1, "magma_cube":1, "slime":1, "wither_skeleton":1, "ravager":1, "hoglin":1, "zoglin":1, "skeleton":1, "stray":1, "illusioner":1, "creeper":1, "zombie":1, "polar_bear":1, "husk":1, "zombie_villager":1, "fireball":1, "phantom":1, "vex":1, "spider":1, "cave_spider":1}[target.name]) {
                    if (target.name == "blaze" && target.metadata[16] == 1 || (target.name == "pillager" || target.name == "piglin") && target.equipment[0] && target.equipment[0].name != undefined && target.equipment[0].name == "crossbow" && target.equipment[0].nbt.value.Charged && target.equipment[0].nbt.value.Charged.value == 1 || (target.name == "skeleton" || target.name == "stray" || target.name == "illusioner") && target.metadata[8] == 1) {
                        setShieldTimer(bot, 0.25);
                    }
                    //TODO: add "meleeThreat" variable to make it more aggro on ranged mobs when no melee ones are in a radius of 8 or so blocks
                    if (targetDistXZ < 4 && target.name == "fireball" || targetDistXZ < 3 && /*!(target.name == "piglin" && target.equipment[0] && target.equipment[0].name != undefined && target.equipment[0].name == "crossbow") && */target.name != "pillager" && target.name != "evoker" && target.name != "witch" && target.name != "skeleton" && target.name != "stray" && target.name != "illusioner" && target.name != "zoglin" && target.name != "hoglin" || (target.name == "skeleton" || target.name == "zoglin") && targetDistXZ < 1 || target.name == "creeper" && target.metadata[16] > -1 && targetDistXZ < 7 || (target.name == "spider" || target.name == "cave_spider" || target.name == "phantom" || target.name == "fireball" || target.name == "vex") && targetDistXZ < 3.5) {
                       //bot.setControlState("back", true);
                       moveInDir(new PlayerState(bot, {forward: false,back: true,left: false,right: false,jump: false,sprint: false,sneak: false,}));
                    } else if ((target.name != "spider" && target.name != "cave_spider") && target.name != "shulker_bullet" && target.name != "phantom" && target.name != "fireball" && target.name != "vex") {
                       //bot.setControlState("forward", true);
                       moveInDir(new PlayerState(bot, {forward: true,back: false,left: false,right: false,jump: false,sprint: false,sneak: false,}));
                       if (target.name == "witch" || target.name == "evoker") {//edge case danger
                           //bot.setControlState("jump", true);
                       }
                       if (!botCanHit(target) || bot.entity.onGround || bot.entity.velocity.y >= -0.1) {
                           bot.setControlState("sprint", true);
                       }
                    }
                    if ((target.name == "enderman" && !target.isPassenger || target.name == "hoglin" || target.name == "zoglin" || target.name == "ravager") && !hoglinTimers[target.uuid]) {
                        setShieldTimer(bot, 0.1);
                    }
                    if (shieldTimer <= 0 && !hitTimers[target.uuid] && (botCanHit(target) <= botRange) && (attackTimer >= getAttackSpeed(getHeldItem(bot)) || targetDistXZ < {"drowned":1.5, "enderman":3.0, "pufferfish":3.0, "shulker":0.0, "shulker_bullet":3.0, "blaze":0.0, "zombified_piglin":2.5, "piglin":((target.name == "piglin" && target.equipment[0] && target.equipment[0].name != undefined && target.equipment[0].name == "crossbow") ? 0.0 : 3.0), "pillager":0.0, "evoker":0.0, "witch":0.0, "piglin_brute":2.5, "vindicator":2.5, "silverfish":1.5, "endermite":1.5, "ravager":0.0, "hoglin":0.0, "zoglin":0.0, "magma_cube":2.5,"slime":2.0,"wither_skeleton":2.5, "zoglin":1.0,"skeleton":0.0, "stray":0.0, "illusioner":0.0, "creeper":0.0,"zombie":1.5,"husk":1.5,"polar_bear":1.5,"zombie_villager":1.5,"spider":2.0,"cave_spider":2.0,"fireball":3.0, "phantom":2.5,"vex":2.5}[target.name]) /*&& (bot.entity.onGround || bot.entity.velocity.y < -0.1)*/) {//bot is not smart enough to know when not to crit yet
                        if (attackTimer >= getAttackSpeed(getHeldItem(bot))) {
                            bot.setControlState("back", false);
                            //bot.setControlState("forward", true);
                            moveInDir(new PlayerState(bot, {forward: true,back: false,left: false,right: false,jump: false,sprint: false,sneak: false,}));
                            if ((target.name != "skeleton" && target.name != "pillager" && target.name != "stray" && target.name != "illusioner") && (bot.entity.onGround || bot.entity.velocity.y >= -0.1)) {
                                bot.setControlState("sprint", true);
                            }
                        }
                        attackEntity(bot, target);
                        /*if (target.name == "zoglin") {
                            setShieldTimer(bot, 0.5);
                        }*/
                        if (target.name != "fireball") {//fireballs are weird
                            hitTimers[target.uuid] = 0.5;
                        }
                    }
                }
            }
            if (bot.entity.isInWater) {bot.setControlState("jump", true);}
        } else if (botMode == "hunt") {
          //console.log(weaponTimer);
          if (target) {
            if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) < 5) {
                botMovement = 1;
            }
            if (botMovement == 1) {
              if (target.type == "mob") {
                if (weaponTimer <= 0) {
                    bot.lookAt(new Vec3(target.position.x, target.position.y + 0.5, target.position.z), 100);
                }
                bot.setControlState("forward", true);
                if (botCanHit(target) > botRange + 0.2) {
                    bot.setControlState("sprint", true);
                } else {
                    bot.setControlState("sprint", false);
                }
                bot.setControlState("back", false);
                if (botCanHit(target) <= botRange + 0.6) {
                    if (parseEntityAnimation("animal", target.metadata[0])[0] || (commanderWantsArson <= 0 && !hasItem(bot, ["flint_and_steel"])) || bot.isRaining) {
                        bot.setControlState("jump", true);
                    } else {
                        bot.setControlState("forward", false);
                        bot.setControlState("back", true);
                        bot.setControlState("jump", false);
                    }
                }
                //console.log(bot.isRaining);
                if (attackTimer >= getAttackSpeed(getHeldItem(bot)) && botCanHit(target) <= botRange && bot.entity.velocity.y < -0.1 && (parseEntityAnimation("animal", target.metadata[0])[0] || bot.isRaining || (commanderWantsArson <= 0 && !hasItem(bot, ["flint_and_steel"])))) {
                    attackEntity(bot, target);
                    bot.stopDigging();
                    bot.setControlState("sprint", false);
                    //if (target.metadata && target.metadata.length >= 10) {console.log(target.metadata[9]);}
                } else if (!bot.isRaining && botCanHit(target) <= 5 && parseEntityAnimation("animal", target.metadata[0])[0] == false && weaponTimer <= 0 && hasItem(bot, ["flint_and_steel"])) {
                    weaponTimer = 10;
                    attackTimer = 0;
                    //console.log(bot.blockAt(target.position));
                } else if (weaponTimer <= 0 /*&& getHeldItem(bot) != "stone_sword"*/) {
                    equipItem(bot, ["netherite_sword","diamond_sword","netherite_axe","diamond_axe","iron_sword","iron_axe","stone_axe","stone_sword","golden_sword","wooden_axe","wooden_sword","golden_axe"]);
                }
                if (weaponTimer == 10) {
                    equipItem(bot, ["flint_and_steel"/*, "lava_bucket"*/]);//DunderHelper using lava_bucket at 3am(GONE WRONG! Not Clickbait!)
                } else if (weaponTimer == 7) {
                    bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                    bot.stopDigging();
                } else if (weaponTimer == 6) {
                    if (bot.blockAt(target.position) && bot.blockAt(target.position).name != "air" &&
                        bot.blockAt(target.position).name != "cave_air" && bot.blockAt(target.position).name != "void_air") {
                        //console.log(bot.blockAt(target.position).name);
                        bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                        digBlock(bot, target.position.x, target.position.y, target.position.z);
                        weaponTimer++;
                    }
                } else if (weaponTimer == 5) {
                    if (getHeldItem(bot) == "flint_and_steel") {
                        //console.log("place pls");
                        bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                        bot.placeBlock(bot.blockAt(target.position.offset(0, 1, 0)), new Vec3(0, -1, 0));
                    } else if (getHeldItem(bot) == "lava_bucket") {
                        bot.activateItem();
                    }
                } else if (weaponTimer == 4) {
                    if (getHeldItem(bot) == "bucket") {
                        bot.activateItem();
                    }
                } else if (weaponTimer <= 3 && weaponTimer >= 1 && getHeldItem(bot) == "bucket") {
                    //weaponTimer = 3;
                    var waterBlock = bot.findBlock({//lava block but called water because ctrl + z from previous projects go brr
                        matching: (block) => (block.stateId == 50),//thank you u9g
                        maxDistance: 5,
                    });
                    if (waterBlock) {
                        //console.log(JSON.stringify(waterBlock));
                        //botMove.bucketTimer = 5;
                        //botMove.bucketTarget.x = waterBlock.position.x + 0.5;
                        //botMove.bucketTarget.y = waterBlock.position.y + 0.5;
                        //botMove.bucketTarget.z = waterBlock.position.z + 0.5;
                        bot.lookAt(new Vec3(waterBlock.position.x + 0.5, waterBlock.position.y + 0.5, waterBlock.position.z + 0.5), 100);
                        if (bucketTimer <= 0 /*&& bot.blockAtCursor(5) && bot.blockAtCursor(5).position.x == waterBlock.position.x && bot.blockAtCursor(5).position.y == waterBlock.position.y && bot.blockAtCursor(5).position.z == waterBlock.position.z*/) {
                            //bot.activateItem(false);
                            bucketTimer = 3;
                        }
                        //console.log("Getting the water bucket back");
                    }
                } else if (weaponTimer == 0) {
                    var fireBlock = bot.findBlock({
                        matching: (block) => (block.name == "fire"),//thank you u9g
                        maxDistance: 5,
                    });
                    if (fireBlock) {
                        digBlock(bot, fireBlock.position.x, fireBlock.position.y, fireBlock.position.z);
                    }
                }
             } else if (target.type == "object" && target.name == "item") {
                 //console.log("item: " + mcData.items[target.metadata[8].itemId].name);
                 bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z), 100);
                 bot.setControlState("forward", true);
                 bot.setControlState("sprint", true);
                 bot.setControlState("jump", false);
                 if (target.position.y > bot.entity.position.y) {
                     console.log(target.position.y);
                     console.log(bot.entity.position.y);
                     bot.setControlState("jump", true);
                 }
                 if (lingerTimer > 5) {lingerTimer = 5;}
             }
            }
          }
        } else if (botMode == "follow") {
            var commander = findCommander();
            for (var i in bot.entities) {
                if (bot.entities[i] == bot.entity) {continue;}
                //console.log(bot.entities[i]);
                if (JSON.stringify(bot.entities[i].type) == '"player"') {
                    target = bot.entities[i];
                }
            }
            if (target && attackTimer > 2) {
                //console.log(parseEntityAnimation("player", target.metadata[0]));
                attackTimer = 1;
            }

            if (commander && commander.isPassenger && bot.entities[commander.vehicleId] && botCanHit(bot.entities[commander.vehicleId]) <= 3.0 && !bot.entity.isPassenger) {
                bot.mount(bot.entities[commander.vehicleId]);
                botMode = "boat";
            } else if ((commander && !commander.isPassenger || !commander) && bot.entity.isPassenger) {
                bot.dismount();
                bot.entity.isPassenger = 0;
            } else if (commander && bot.entities[commander.vehicleId] && bot.entity.isPassenger) {
                botMode = "boat";
                bot.look(bot.entities[commander.vehicleId].yaw, 0, 100);
            } else if (bot.vehicle) {
                bot.dismount();
                bot.entity.isPassenger = 0;
            }

            //console.log("Hunger: " + bot.food + "/20");
            if (bot.food <= 18 && (bot.entity.onGround || bot.vehicle || consumeTimer > 0)) {
                equipFood(bot, 1);
                if (consumeTimer <= 0) {bot.deactivateItem();}
                consumeTimer = 3;
                botMovement = 1;
                bot.clearControlStates();
                bot.setControlState("sneak", true);
            }
        } else if (botMode == "mine") {
            bot.clearControlStates();

            if (bot.food <= 18 && (bot.entity.onGround || bot.vehicle || consumeTimer > 0)) {//TODO: add check if the bot has food
                equipFood(bot, 1);
                if (consumeTimer <= 0) {bot.deactivateItem();}
                consumeTimer = 3;
                botMovement = 1;
                bot.setControlState("sneak", true);
            }
            if (consumeTimer < 0) {equipItem(bot, ["netherite_pickaxe", "diamond_pickaxe","iron_pickaxe","stone_pickaxe","golden_pickaxe","wooden_pickaxe"]);}
            var oreBlock = globalTargetBlock;
            var botBlockAtCursor = bot.blockAtCursor(5);
            console.log(globalBlockStuckTimer);
            if (bot.targetDigBlock && isOre(bot.targetDigBlock.name)) {
                oreBlock = bot.targetDigBlock;
                bot.lookAt(oreBlock.position.offset(0.5, 0.5, 0.5), 100);
                globalBlockStuckTimer = 30;
            } else if (globalBlockStuckTimer < 0 && botBlockAtCursor) {
                if (oreBlock) {bot.lookAt(oreBlock.position.offset(0.5, 0.5, 0.5), 100);}
                console.log("e");
                if (globalBlockStuckTimer < -5) {
                    botBlockAtCursor = bot.blockAtCursor(5);
                    oreBlock = botBlockAtCursor;
                }
            }
            if (oreBlock) {
                if (!botBlockAtCursor || botBlockAtCursor &&
                    (botBlockAtCursor.position.x != oreBlock.position.x || botBlockAtCursor.position.y != oreBlock.position.y ||
                     botBlockAtCursor.position.z != oreBlock.position.z)) {
                    bot.setControlState("sprint", true);
                    if (consumeTimer <= 0) {moveInDir(new PlayerState(bot, {forward: true,back: false,left: false,right: false,jump: false,sprint: false,sneak: false,}));}
                }
                bot.lookAt(oreBlock.position.offset(0.5, 0.5, 0.5), 100);
                if (botBlockAtCursor && (((isOre(botBlockAtCursor.name) || globalBlockStuckTimer < 0) || botBlockAtCursor.position.x == oreBlock.position.x && botBlockAtCursor.position.y == oreBlock.position.y + 1 && botBlockAtCursor.position.z == oreBlock.position.z) && bot.heldItem && botBlockAtCursor.harvestTools && botBlockAtCursor.harvestTools[bot.heldItem.type])) {
                    digBlock(bot, botBlockAtCursor.position.x, botBlockAtCursor.position.y, botBlockAtCursor.position.z);
                }
                globalBlockTimer = -2;
            } else {
                if (lingerTarget) {
                    globalBlockTimer = 2;
                    bot.lookAt(new Vec3(Math.floor(lingerTarget.position.x) + 0.5, lingerTarget.position.y, Math.floor(lingerTarget.position.z) + 0.5), 100);
                    bot.setControlState("sprint", true);
                    if (consumeTimer <= 0) {moveInDir(new PlayerState(bot, {forward: true,back: false,left: false,right: false,jump: false,sprint: false,sneak: false,}), new Vec3(Math.floor(lingerTarget.position.x), lingerTarget.position.y, Math.floor(lingerTarget.position.z)));}
                }
            }
        } else if (botMode == "chop") {//handle item stuff better, especially when there are no blocks to mine and it wont seek the item
            equipItem(bot, ["golden_axe","netherite_axe", "diamond_axe","iron_axe","stone_axe","wooden_axe"]);
            var woodBlock = globalTargetBlock;
            var blockDirX = 0;
            var blockDirZ = 0;
            var shouldGetItem = (lingerTarget && woodBlock != undefined &&
                dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, woodBlock.position.x, woodBlock.position.y, woodBlock.position.z) >
                dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, lingerTarget.position.x, lingerTarget.position.y, lingerTarget.position.z));
            if (!woodBlock && lingerTarget) {shouldGetItem = true;}
            if (!shouldGetItem) {shouldGetItem = false;}
            if (!shouldGetItem && woodBlock) {
                blockDirX = Math.sign(woodBlock.position.x - Math.floor(bot.entity.position.x));
                blockDirZ = Math.sign(woodBlock.position.z - Math.floor(bot.entity.position.z));
            } else if (shouldGetItem) {
                blockDirX = Math.sign(lingerTarget.position.x - Math.floor(bot.entity.position.x));
                blockDirZ = Math.sign(lingerTarget.position.z - Math.floor(bot.entity.position.z));
            }
            var travelDir;
            //if (blockDirX != 0 || blockDirZ != 0) {
                if (bot.blockAt(bot.entity.position.offset(blockDirX, 0, 0)) && bot.blockAt(bot.entity.position.offset(blockDirX, 0, 0)).shapes.length > 0) {
                    travelDir = bot.blockAt(bot.entity.position.offset(blockDirX, 0, 0));
                    shouldGetItem = false;
                } else if (bot.blockAt(bot.entity.position.offset(0, 0, blockDirZ)) && bot.blockAt(bot.entity.position.offset(0, 0, blockDirZ)).shapes.length > 0) {
                    travelDir = bot.blockAt(bot.entity.position.offset(0, 0, blockDirZ));
                    shouldGetItem = false;
                } else if (bot.blockAt(bot.entity.position.offset(blockDirX, 0, blockDirZ)) && bot.blockAt(bot.entity.position.offset(blockDirX, 0, blockDirZ)).shapes.length > 0) {
                    travelDir = bot.blockAt(bot.entity.position.offset(blockDirX, 0, blockDirZ));
                    shouldGetItem = false;
                } /*else if (bot.blockAt(bot.entity.position.offset(0, 2, 0)) && bot.blockAt(bot.entity.position.offset(0, 2, 0)).shapes.length > 0) {
                    travelDir = bot.blockAt(bot.entity.position.offset(0, 2, 0));
                    shouldGetItem = false;
                }*/
            //}
            var blockIsTravelDir = false;
            if ((blockDirX != 0 || blockDirZ != 0) && travelDir && isLeaf(travelDir.name)) {
                woodBlock = travelDir;
                blockIsTravelDir = true;
            }
            /*if (!woodBlock && lingerTarget) {
                bot.lookAt(lingerTarget.position, 100);
                bot.setControlState("forward", (Math.floor(bot.entity.position.x) != lingerTarget.position.x || (Math.floor(bot.entity.position.z) != lingerTarget.position.z)));
                bot.setControlState("sprint", (Math.floor(bot.entity.position.x) != lingerTarget.position.x || (Math.floor(bot.entity.position.z) != lingerTarget.position.z)));
            } else */if (woodBlock) {
                if (!lingerTarget || !shouldGetItem) {
                    bot.lookAt(woodBlock.position.offset(0.5, 0.5, 0.5), 100);
                    bot.setControlState("forward", (Math.floor(bot.entity.position.x) != woodBlock.position.x || (Math.floor(bot.entity.position.z) != woodBlock.position.z)));
                    bot.setControlState("sprint", (Math.floor(bot.entity.position.x) != woodBlock.position.x || (Math.floor(bot.entity.position.z) != woodBlock.position.z)));
                } else if (lingerTarget) {
                    bot.lookAt(lingerTarget.position, 100);
                    bot.setControlState("forward", (Math.floor(bot.entity.position.x) != lingerTarget.position.x || (Math.floor(bot.entity.position.z) != lingerTarget.position.z)));
                    bot.setControlState("sprint", (Math.floor(bot.entity.position.x) != lingerTarget.position.x || (Math.floor(bot.entity.position.z) != lingerTarget.position.z)));
                } else {
                    bot.setControlState("forward", true);
                    bot.setControlState("sprint", true);
                }
                var botBlockAtCursor = bot.blockAtCursor(5);
                if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, woodBlock.position.x, woodBlock.position.y, woodBlock.position.z) < 5) {
                    if (botBlockAtCursor && botBlockAtCursor.position.x == woodBlock.position.x && botBlockAtCursor.position.y == woodBlock.position.y && botBlockAtCursor.position.z == woodBlock.position.z) {
                        digBlock(bot, woodBlock.position.x, woodBlock.position.y, woodBlock.position.z);
                    } else if (botBlockAtCursor && (isLeaf(botBlockAtCursor.name) || isWood(botBlockAtCursor.name)) && bot.entity.onGround) {
                        //bot.lookAt(woodBlock.position.offset(0.5, 0.5, 0.5), 200);
                        digBlock(bot, botBlockAtCursor.position.x, botBlockAtCursor.position.y, botBlockAtCursor.position.z);
                    }
                    //bot.setControlState("forward", false);
                    //bot.setControlState("sprint", false);
                    if (travelDir && travelDir.name != "oak_log" && travelDir.name != "oak_leaves" && travelDir.shapes.length > 0 && !bot.targetDigBlock) {
                        bot.setControlState("jump", true);
                    } else {
                        bot.setControlState("jump", false);
                    }
                } else if (!blockIsTravelDir && botBlockAtCursor && (isLeaf(botBlockAtCursor.name) || isWood(botBlockAtCursor.name))) {
                    //bot.lookAt(woodBlock.position.offset(0.5, 0.5, 0.5), 200)
                     if (travelDir&& travelDir.name != "oak_log" && travelDir.name != "oak_leaves" && travelDir.shapes.length > 0 && !bot.targetDigBlock) {
                        bot.setControlState("jump", true);
                    } else {
                        bot.setControlState("jump", false);
                    }
                    digBlock(bot, botBlockAtCursor.position.x, botBlockAtCursor.position.y, botBlockAtCursor.position.z);
                } else {
                    if (travelDir && travelDir.name != "oak_log" && travelDir.name != "oak_leaves" && travelDir.shapes.length > 0 && !bot.targetDigBlock) {
                        bot.setControlState("jump", true);
                    } else {
                        bot.setControlState("jump", shouldGetItem);
                    }
                }
                if (!botBlockAtCursor || botBlockAtCursor && bot.targetDigBlock && (bot.targetDigBlock.position.x != botBlockAtCursor.position.x || bot.targetDigBlock.position.y != botBlockAtCursor.position.y || bot.targetDigBlock.position.z != botBlockAtCursor.position.z)) {
                    bot.stopDigging();
                } 
            }
        }
        //var elStunTimeout;
        if (target && botHostile) {
            if (playerData[target.username]) {
                /*if (playerData[target.username].blocking) {
                    playerData[target.username].blockTimer = 1;
                } else if (playerData[target.username].blockTimer > 0) {
                    playerData[target.username].blockTimer--;
                }*/
                if (playerData[target.username].blocking && botCanHit(target) <= botRange) {
                    equipItem(bot, ["netherite_axe", "diamond_axe","iron_axe","stone_axe","golden_axe","wooden_axe"]);
                    //bot.attack(target, true);
                    attackEntity(bot, target);
                    setTimeout(() => {
                        attackEntity(bot, target);
                    }, 50);
                } else {
                    equipItem(bot, ["netherite_sword", "diamond_sword","iron_sword","stone_sword","golden_sword","wooden_sword"]);
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
            //bot.setControlState("sneak", (attackTimer < 0.25));
            if ((JSON.stringify(target.type) == '"player"' && JSON.stringify(target.username) != '"Vakore2"' ||  JSON.stringify(target.type) == '"mob"' && JSON.stringify(target.type) != '"object"')) {
                if (bot.entity.position.y + 1.6 > target.position.y && bot.entity.position.y + 1.6 < target.position.y + target.height) {
                    //bot.lookAt(new Vec3(target.position.x, bot.entity.position.y + 1.6, target.position.z));
                } else if (bot.entity.position.y + 1.6 < target.position.y) {
                    //bot.lookAt(new Vec3(target.position.x, target.position.y, target.position.z));
                } else if (bot.entity.position.y + 1.6 > target.position.y + target.height) {
                    //bot.lookAt(new Vec3(target.position.x, target.position.y + target.height, target.position.z));
                }
                //bot.lookAt(target.position.offset(0, 1.6, 0));
            }
            if (JSON.stringify(target.type) == '"player"' && target.username != commanderName && attackTimer < botPvpRandoms.aggroAmount | botCanHit(target) <= botRange) {
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
                    //attackEntity(bot, target);
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
        //console.log(target.type);
        if (target && (JSON.stringify(target.type) == '"player"' && target.username != commanderName || JSON.stringify(target.type) == '"mob"' && JSON.stringify(target.type) != '"object"') && botCanHit(target) <= botRange && attackTimer >= 0.6) {
            //attackEntity(bot, target);
        }
        //console.log("" + bot.activateItem);
        if (shieldTimer > 0 && antiRightClickTicks <= 0 && bot.inventory.slots[45] && bot.inventory.slots[45].name == "shield") {
            //console.log(bot.inventory.slots[45]);
            //if (!bot.usingHeldItem) {bot.activateItem(true);}
            bot.activateItem(true);
            bot.setControlState("sneak", true);
            //console.log("blocking");
        } else if (consumeTimer > 0) {
            if (!bot.usingHeldItem) {bot.activateItem(false);}
            bot.setControlState("sneak", true);
            //console.log("eating");
        } else {
            //console.log("notblocking");
            bot.deactivateItem();
        }

    };

function run2() {
    
};
bot.once("spawn", () => {
    //console.log(bot.lookAt);
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

function moveInDir(stateBase, targetPos) {
    if (!targetPos) {targetPos = {x:Infinity,y:Infinity,z:Infinity};}
    //var myStateBase = JSON.parse(JSON.stringify(stateBase));
    //console.log(JSON.stringify(stateBase));
    var myState = JSON.parse(JSON.stringify(stateBase));
    myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
    //var myState = stateBase;
    /*var maxVelX = 0;
    var maxVelZ = 0;
    var myVelStoreX = 0;
    var myVelStoreZ = 0;*/

    var toValid = 1;
    var toJump = false;

    for (var i = 0; i < 10; i++) {
        /*if (i < 5) {
            myVelStoreX = myState.vel.x;
            myVelStoreZ = myState.vel.z;
            if (maxVelX < Math.abs(myState.vel.x)) {maxVelX = Math.abs(myState.vel.x);}
            if (maxVelZ < Math.abs(myState.vel.z)) {maxVelZ = Math.abs(myState.vel.z);}
        }*/
        bot.physics.simulatePlayer(myState, bot.world);
        if ((i < 5) && (!myState.onGround && !myState.isInWater) || myState.isInLava) {
            toValid = (myState.isInLava) ? -1 : 0;
        } else if (i >= 5 && toValid == 0 && myState.onGround || myState.isInWater) {
            toValid = 1;
        }
        //if (maxVelX > Math.abs(myState.vel.x) * 1.1 || maxVelZ > Math.abs(myState.vel.z) * 1.1) {
        if (i < 5 && myState.isCollidedHorizontally && (Math.floor(myState.pos.x) != targetPos.x || Math.floor(myState.pos.z) != targetPos.z || Math.floor(myState.pos.y) != targetPos.y)) {/*maxVelX > 0 && myVelStoreX == 0 || maxVelZ > 0 && myVelStoreZ == 0*/
            //i = 10;
            toJump = true;
        }
    }
    if (toValid >= 1) {
        if (toJump) {bot.setControlState("jump", true);}
        bot.setControlState("forward", myState.control.forward);
        bot.setControlState("left", myState.control.left);
        bot.setControlState("right", myState.control.right);
        bot.setControlState("back", myState.control.back);
    } else if (myState.onGround) {
        bot.setControlState("sneak", true);
        /*myState = JSON.parse(JSON.stringify(stateBase));
        myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
        myState.control.right = true;
        var toValid = 1;
        var toJump = false;

        for (var i = 0; i < 10; i++) {
            bot.physics.simulatePlayer(myState, bot.world);
            if ((i < 5) && (!myState.onGround && !myState.isInWater) || myState.isInLava) {
                toValid = (myState.isInLava) ? -1 : 0;
            } else if (i >= 5 && toValid == 0 && myState.onGround || myState.isInWater) {
                toValid = 1;
            }
            if (myState.isCollidedHorizontally) {
                i = 10;
                toJump = true;
            }
        }
        if (toValid >= 1) {
            if (toJump) {bot.setControlState("jump", true);}
            bot.setControlState("forward", true);
            bot.setControlState("right", true);
        }*/
    }
};

var myStates = [];
function simulateJump(target, stateBase, searchCount, theParent) {
    //bot.chat("/particle minecraft:flame ~ ~ ~");
            //bot.entity.yaw
          //var target = bot.nearestEntity();
          //bot.lookAt(new Vec3(target.position.x, bot.entity.position.y + 1.6, target.position.z), 360);
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
              //console.log("decent jumps found");
              var mySearcher = myStates[myBestState];
              while (mySearcher.parent) {
                  jumpTargets.push(mySearcher.state.pos);
                  mySearcher = mySearcher.parent;
              }
              jumpTargets.push(mySearcher.state.pos);
              bot.lookAt(new Vec3(mySearcher.state.pos.x, /*mySearcher.state.pos.y*/target.position.y + 1.6, mySearcher.state.pos.z), 100);
              jumpTarget = mySearcher.state.pos;
          } else if (searchCount > 0) {
              //console.log(JSON.stringify(myStates[myBestState].open));
              myStates[myBestState].open = false;
              simulateJump(target, myStates[myBestState].state, searchCount - 1, myStates[myBestState]);
          }
        } else {
            //bot.chat("nothing to jump on...");
        }
};

function parseMessage(username, msg) {
    console.log("<" + username + "> " + msg);
    msg = msg.split(" ");
    //console.log(username == "Vakore");
  if (username == commanderName) {
    //console.log(username == "Vakore");
    switch (msg[0].toLowerCase()) {
        case "commands":
            bot.chat("axestrat - fight the nearest player by axe maining(WIP)");
            bot.chat("pvp - fight the nearest player, including you(WIP, barely usable)");
            bot.chat("pve - fight the nearest mob, and only the nearest mob(WIP, decently usable)");
            bot.chat("hunt - kill animals for food, even setting them on fire(lava is WIP)");
            bot.chat("chop - find a tree to chop that isn't right next to you(buggy and WIP, decently usable)");
            bot.chat("mine - follow you around and mine valuable ores. (buggy and WIP, decently usable outside of water)");
            bot.chat("dumpores - throws all ores in front of itself (does its job)");
            bot.chat("follow - follows you around and autoeats, even going in the same boat as you (WIP but usable outside of water and tight spaces)");
            bot.chat("stay - stays put");
            bot.chat("inventory <item> <dest> - equip item. Example: inventory shield off-hand");
            bot.chat("equip - right clicks item(not blocks)");
            bot.chat("setrange - sets the range of the bot. WIP as it was for an older pvp version since spacing is currently hardcoded.");
            bot.chat("version - gets bot version");
        break;

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
            bot.chat("Version: " + botVersion);
            //bot.chat("GitHub: None Yet");
        break;
        case "inventory":
            equipItem(bot, [msg[1]], msg[2]);
        break;
        case "selecteditem":
            prepareCrafting(bot);
            /*if (bot.inventory.selectedItem) {
                for (var i = 9; i < bot.inventory.slots.length; i++) {
                    if (!bot.inventory.slots[i]) {
                        console.log("Putting item " + bot.inventory.selectedItem + " in slot " + i + " containing " + bot.inventory.slots[i]);
                        var slotToClick = i;
                        setTimeout(() => {bot.clickWindow(slotToClick, 0, 0);}, 150);
                        i = bot.inventory.slots.length;
                    }
                }
            }*/
        break;

        case "craftAttempt2":
            prepareCrafting(bot);
            var myRecipies = [];
            for (var i in mcData.items) {
                //console.log(i);
                if (mcData.items[i].name == msg[1]) {
                    myRecipes = bot.recipesFor(mcData.items[i].id, null, null, null);
                    i = Infinity;
                }
            }
            if (!myRecipes) {break;}
            if (myRecipes.length <= 0) {
                //console.log("hey");
                for (var i in mcData.items) {
                    //console.log(i);
                    if (mcData.items[i].name == msg[1]) {
                        myRecipes = bot.recipesFor(mcData.items[i].id, null, null, {"type":158,"metadata":0,"light":0,"skyLight":0,"biome":{"id":1,"name":"plains","category":"plains","temperature":0.800000011920929,"precipitation":"rain","depth":0.125,"dimension":"overworld","displayName":"Plains","color":7907327,"rainfall":0.4000000059604645},"position":{"x":-136,"y":66,"z":4768},"stateId":3413,"computedStates":{},"name":"crafting_table","hardness":2.5,"displayName":"Crafting Table","shapes":[[0,0,0,1,1,1]],"boundingBox":"block","transparent":false,"diggable":true,"material":"mineable/axe","drops":[],"_properties":{}});
                        i = Infinity;
                    }
                }
            }
            if (myRecipes.length > 0) {
                console.log(JSON.stringify(myRecipes[0]));
                //console.log(myRecipes[0].inShape);
                var myCraftItems = {};
                var myCraftLetterID = 1;
                var myLetters = ["-", "A","B","C","D","E","F","G","H","I"];
                var myCraftString = "";
                var myRequiredItems = [];
                //myCraftString += "\n";//For user display
                for (var i = 0; i < myRecipes[0].inShape.length; i++) {
                    for (var j = 0; j < myRecipes[0].inShape[i].length; j++) {
                      if (myRecipes[0].inShape[i][j].id > -1) {
                        if (!myCraftItems[myRecipes[0].inShape[i][j].id]) {
                            console.log(myRecipes[0].inShape[i][j].id);
                            myCraftItems[myRecipes[0].inShape[i][j].id] = myCraftLetterID;
                            myRequiredItems.push(myRecipes[0].inShape[i][j].id);
                            myCraftLetterID++;
                        }
                        myCraftString += myLetters[myCraftItems[myRecipes[0].inShape[i][j].id]];
                      } else {
                        myCraftString += "-";
                      }
                        //console.log(myRecipes[0].inShape[i][j]);
                    }
                    while(myCraftString.length < (i + 1) * (myRecipes[0].requiresTable ? 3 : 2)) {//For user display set '* 3' to '* 4'
                        myCraftString += "-";
                    }
                    //myCraftString += "\n";//For user display
                }
                //console.log(bot.inventory[0]);
            /*
            12
            34  -> 0
            */
                for (var i in bot.inventory.slots) {
                    console.log(i + " " + ((bot.inventory.slots[i] && bot.inventory.slots[i].type) ? ("Name: " + bot.inventory.slots[i].name + ", id: " + bot.inventory.slots[i].type) : "null"));
                    if (bot.inventory.slots[i] && !myRecipes[0].requiresTable) {
                        for (var j = 0; j < myRequiredItems.length; j++) {
                            if (!(bot.inventory.slots[i] && bot.inventory.slots[i].type)) {continue;}
                            if (myRequiredItems[j] == bot.inventory.slots[i].type) {
                                console.log("Found item at slot " + i + " with id " + bot.inventory.slots[i].type);
                                var slotToClick = i;
                                setTimeout(function() {
                                    bot.clickWindow(slotToClick, 0, 0);
                                    console.log("slotToClick: " + slotToClick);
                                    var recursiveCraft = function(start) {
                                        if (!bot.inventory.selectedItem) {
                                            for (var k = 1; k < 5; k++) {
                                                if (!(bot.inventory[k] && myLetters[myCraftItems[bot.inventory[k]]] == myCraftString[k - 1] ||
                                                    !bot.inventory[k] && myLetters[k - 1] == "-")) {
                                                    k = 100;
                                                }
                                                if (k >= 100) {console.log("crafting finished anyways.");}
                                            }
                                            console.log("Uh no more items.");
                                        }
                                        setTimeout(() => {
                                            if (bot.inventory.selectedItem) {
                                                var c = start;
                                                for (c = c; c < 5; c++) {
                                                    if (!bot.inventory[c] && myLetters[myCraftItems[bot.inventory.selectedItem.type]] == myCraftString[c - 1]) {
                                                        console.log("C: " + c);
                                                        bot.clickWindow(c, 1, 0);
                                                        recursiveCraft(c + 1);
                                                        c = 100;
                                                    }
                                                }
                                                console.log("C2: " + c);
                                                if (c < 100) {
                                                    console.log("output: " + bot.inventory[0]);
                                                    prepareCrafting(bot);
                                                    setTimeout(() => {
                                                        bot.clickWindow(0, 0, 0);
                                                        setTimeout(() => {
                                                            prepareCrafting(bot);
                                                        }, 50);
                                                    }, 50);
                                                }
                                            }
                                        }, 100);
                                    };
                                    recursiveCraft(1);
                                }, 100);
                            }
                        }
                    }
                }
                console.log(bot.inventory.selectedItem);
                console.log("Recipe:\n" + myCraftString);
                console.log(myRecipes[0].requiresTable);
            }
        break;

        case "craft":
            /*
                0. Put bot.inventory.selectedItem away
                1. Find the recipe
                2. If no recipe end, otherwise continue
                3. Form shape of recipe. If shapeless, create a new shape.
                4. Find item that goes into the recipe.
                5. Place item that goes into the recipe for every tile needed.
                6. If selectedItem is not null put it away. Otherwise skip this step.
                7. If no more items are needed, proceed. Otherwise go back to step 4.
                8. Once all slots and selectedItem has been put away grab the result.
                9. Put selectedItem away.
            */
            //0. Put bot.inventory.selectedItem away
            prepareCrafting(bot);

            //1. Find the recipe.
            var myRecipies = [];
            for (var i in mcData.items) {
                //console.log(i);
                if (mcData.items[i].name == msg[1]) {
                    myRecipes = bot.recipesFor(mcData.items[i].id, null, null, null);
                    i = Infinity;
                }
            }

            //2. If no recipe end. Otherwise continue.
            if (!myRecipes) {break;}

            //3. Form shape of recipe. If shapeless, create a new shape.
            if (myRecipes.length > 0) {
                console.log(JSON.stringify(myRecipes[0]));
                //console.log(myRecipes[0].inShape);
                var myCraftItems = {};
                var myCraftLetterID = 1;
                var myLetters = ["-", "A","B","C","D","E","F","G","H","I"];
                var myCraftString = "";
                var myRequiredItems = [];
                //Shaped Recipe formation
                if (myRecipes[0].inShape) {
                    console.log("Has shape");
                    for (var i = 0; i < myRecipes[0].inShape.length; i++) {
                        for (var j = 0; j < myRecipes[0].inShape[i].length; j++) {
                            if (myRecipes[0].inShape[i][j].id > -1) {
                                if (!myCraftItems[myRecipes[0].inShape[i][j].id]) {
                                    //console.log(myRecipes[0].inShape[i][j].id);
                                    myCraftItems[myRecipes[0].inShape[i][j].id] = myCraftLetterID;
                                    myRequiredItems.push(myRecipes[0].inShape[i][j].id);
                                    myCraftLetterID++;
                                }
                                myCraftString += myLetters[myCraftItems[myRecipes[0].inShape[i][j].id]];
                            } else {
                              myCraftString += "-";
                            }
                        }
                        while(myCraftString.length < (i + 1) * (myRecipes[0].requiresTable ? 3 : 2)) {
                            myCraftString += "-";
                        }
                    }
                } else {
                    console.log("Shapeless");
                    for (var i = 0; i < myRecipes[0].ingredients.length; i++) {
                        if (!myCraftItems[myRecipes[0].ingredients[i].id]) {
                            //console.log(myRecipes[0].ingredients[i].id);
                            myCraftItems[myRecipes[0].ingredients[i].id] = myCraftLetterID;
                            myRequiredItems.push(myRecipes[0].ingredients[i].id);
                            myCraftLetterID++;
                        }
                        myCraftString += myLetters[myCraftItems[myRecipes[0].ingredients[i].id]];
                    }
                    while(myCraftString.length < 4 || myCraftString.length > 4 && myCraftString.length < 9) {
                        myCraftString += "-";
                    }
                }
                console.log(myCraftString);
            }

            //4. Find item that goes into the recipe.
function clickAnItem(bot, items) {
    for (var i = 0; i < items.length; i++) {
        for (var j = 9; j < bot.inventory.length; j++) {
            if (bot.inventory[j] && bot.inventory[j].id == items[i]) {
                var slotToClick = j;
                bot.clickWindow(slotToClick, 0, 0);
                j = bot.inventory.length;
                i = items.length;
            }
        }
    }
};
            clickAnItem(bot, myRequiredItems);
            //5. Place item that goes into the recipe for every tile needed.
            if (bot.inventory.selectedItem) {//probably make this a function
                for (var i = 1; i < 5; i++) {
                    if (!bot.inventory[i] && myLetters[myCraftItems[bot.inventory.selectedItem.type]] == myCraftString[i - 1]) {
                    
                    }
                }
            } else {console.log("no selected item");}
            //6. If selectedItem is not null put it away. Otherwise skip this step.
            //7. If no more items are needed, proceed. Otherwise go back to step 4.

            //8. Once all slots and selectedItem has been put away grab the result.
            //9. Put selectedItem away.
        break;


        case "clickslot":
                for (var i in bot.inventory.slots) {
                    console.log(i + " " + ((bot.inventory.slots[i] && bot.inventory.slots[i].type) ? ("Name: " + bot.inventory.slots[i].name + ", id: " + bot.inventory.slots[i].type) : "null"));
                }
                console.log(bot.inventory.selectedItem);
                bot.clickWindow(Number(msg[1]), Number(msg[2]), 0);
        break;
        case "buggycraft":
                try {
            var myRecipes = [];
            //console.log(JSON.stringify(mcData.items));
            for (var i in mcData.items) {
                //console.log(i);
                if (mcData.items[i].name == msg[1]) {
                    myRecipes = bot.recipesFor(mcData.items[i].id, null, null, null);
                    i = Infinity;
                }
            }
            if (myRecipes.length <= 0) {
                //console.log("hey");
                for (var i in mcData.items) {
                    //console.log(i);
                    if (mcData.items[i].name == msg[1]) {
                        myRecipes = bot.recipesFor(mcData.items[i].id, null, null, {"type":158,"metadata":0,"light":0,"skyLight":0,"biome":{"id":1,"name":"plains","category":"plains","temperature":0.800000011920929,"precipitation":"rain","depth":0.125,"dimension":"overworld","displayName":"Plains","color":7907327,"rainfall":0.4000000059604645},"position":{"x":-136,"y":66,"z":4768},"stateId":3413,"computedStates":{},"name":"crafting_table","hardness":2.5,"displayName":"Crafting Table","shapes":[[0,0,0,1,1,1]],"boundingBox":"block","transparent":false,"diggable":true,"material":"mineable/axe","drops":[],"_properties":{}});
                        i = Infinity;
                    }
                }
            }
            if (myRecipes.length > 0) {
                if (myRecipes[0].requiresTable) {
                    console.log(msg[1] + " requires a crafting table. Craft it yourself.");
                    placeThing(bot, "crafting_table");
                    /*var craftingTableBlock = bot.findBlock({
                        matching: (block) => (block.name == "crafting_table"),
                        maxDistance: 5,
                    });
                    if (craftingTableBlock) {
                        console.log(myRecipes);
                        bot.craft(myRecipes[0], 1, craftingTableBlock);
                        console.log("sucess!");
                    }*/
                } else {
                    console.log(myRecipes);
                    bot.craft(myRecipes[0], 1).then(function(e) {
                        console.log("Crafted " + msg[1] + "! " + e);
                    });
                }
            } else {
                console.log("No recipe for " + msg[1] + " found. Either spelt wrong, don't have the resources for it, or does not exist.");
            }
                } catch(e) {}
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
            //botHostile = true;
        break;
        case "follow":
            botMasterMode = "follow";
            bot.setControlState("sneak", false);
        break;
        case "hunt":
            botMasterMode = "hunt";
            bot.setControlState("sneak", false);
        break;
        case "chop":
            globalTargetBlock = null;
            globalTargetBlocks = null;
            globalBlockTimer = 0;
            globalBlockAttempts = 0;
            globalBlockStuckTimer = 0;
            botMasterMode = "chop";
            bot.setControlState("sneak", false);
        break;
        case "pve":
            botMasterMode = "pve";
            bot.setControlState("sneak", false);
        break;
        case "axestrat":
            botMasterMode = "axestrat";
            bot.setControlState("sneak", false);
        break;
        case "pvp":
            botMasterMode = "pvp";
            bot.setControlState("sneak", false);
        break;
        case "equip":
            bot.activateItem();
        break;
        case "stay":
            botMasterMode = "stay";
        break;
        case "tick": run();break;
        case "mine":
            botMasterMode = "mine";
            globalBlockAttempts = 0;
            globalTargetBlocks = [];
            globalTargetBlock = null;
        break;
        case "dumpores":
            botMasterMode = "dumpOres";
        break;
        case "pillar":
            botMasterMode = "pillar";
        break;
        case "digdown":
            botMasterMode = "digdown";
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
            case "helditem":
                console.log(JSON.stringify(bot.heldItem));
            break;
            case "foods":
                console.log(mcData.foodsArray);
            break;
            case "standingin":
                console.log(JSON.stringify(bot.blockAt(
                            new Vec3(Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z))
                )));
            break;

            case "placeblock":
                //console.log("e");
                bot.placeBlock(bot.blockAt(new Vec3(Math.floor(Number(msg[1])), Math.floor(Number(msg[2])), Math.floor(Number(msg[3])))), new Vec3(0, -1, 0));
            break;
    }
  }
};

bot.on('windowOpen', (window) => {
    const axes = window.slots.filter(x => x != null).filter(x => x.name == "diamond_axe");
    console.log(JSON.stringify(window.slots));
    console.log(JSON.stringify(axes[0]));
    //console.log(JSON.parse(JSON.stringify(axes[0])).slot);
    bot.clickWindow(1-1,0,0);
    bot.closeWindow(window);
});

  bot.on("physicsTick", () => {
    //var target = bot.nearestEntity();
    var target;
  if (botMode == "follow") {
    for (var i in bot.entities) {
        if (bot.entities[i] == bot.entity) {continue;}
        //if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z) < 10) {console.log(JSON.stringify(bot.entities[i]));}
        if (JSON.stringify(bot.entities[i].type) == '"player"') {
            target = bot.entities[i];
        }
    }
  } else if (botMode == "hunt") {
    for (var i in bot.entities) {
        if (bot.entities[i] == bot.entity) {continue;}
        //console.log(bot.entities[i]);
        if (JSON.stringify(bot.entities[i].type) == '"mob"') {
          //if (bot.entities[i].name == "sheep" || bot.entities[i].name == "cow" || bot.entities[i].name == "pig" || bot.entities[i].name == "chicken" || bot.entities[i].name == "rabbit") {
            if (target == undefined || target != undefined &&
            dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) >
            dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.entities[i].position.x, bot.entities[i].position.y, bot.entities[i].position.z)) {
                target = bot.entities[i];
            }
         //}
        }
    }
  }
  if (target && botMovement == 0) {
    bot.clearControlStates();
    if (target.metadata && target.metadata.length >= 10) {
        //console.log(target.metadata[9]);
    }
    if (jumpTarget) {
        //console.log(jumpTargets);
        if (bot.entity.onGround) {
            jumpTarget = false;
            jumpTargets = [];
            myStates = [];
            if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) > 3.0) {
                simulateJump(target, new PlayerState(bot, simControl), 1);
            } else {
                bot.clearControlStates();
            }
        }
        if (jumpTarget && target) {
            bot.setControlState("forward", true);
            bot.setControlState("sprint", true);
            bot.setControlState("jump", true);
            bot.lookAt(new Vec3(jumpTarget.x, /*jumpTarget.y*//*target.*/bot.entity.position.y + 1.6, jumpTarget.z), 100);
        }
    } else if (!bot.entity.isInLava && !bot.entity.isInWater && bot.entity.onGround && dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, target.position.x, target.position.y, target.position.z) > 3.0) {
        simulateJump(target, new PlayerState(bot, simControl), 1);
    } else if (bot.entity.isInWater) {
        bot.setControlState("jump", true);
        bot.setControlState("forward", true);
        bot.setControlState("sprint", true);
        bot.lookAt(new Vec3(target.position.x, target.position.y + 1.6, target.position.z), 100);
    } else {
        bot.clearControlStates();
        bot.lookAt(new Vec3(target.position.x, target.position.y + 1.6, target.position.z), 100);
    }
  } else if (botMovement == 0) {
        bot.clearControlStates();
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
        //console.log(entity.type + ", " + packet.metadata[0].value);
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
    //bot._client.on('entity_metadata', shieldListener);
    bot._client.on('set_cooldown', (data) => {
        console.log(data);
        if (data.itemID == 1116) {
            botShieldCooldown = data.cooldownTicks;
        }
    });

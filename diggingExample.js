/*
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


//--------------SETTINGS-----------------------
const version = "1.20.1";//"1.20.1";
const host = "localhost";//localhost for LAN worlds
const port = 25565;//25565;//25565 is default port for most servers
//--------------SETTINGS-----------------------
const mineflayer = require("mineflayer");
const Vec3 = require("vec3")
var bot = mineflayer.createBot({
    host: host,
    port: port,//25565 is the default
    version: version,
    username: "diggerBot",
    viewDistance:4,
    //auth:"microsoft",
});

var garbageBlocks = ["diorite","granite","andesite","basalt","netherrack","dirt","stone","cobblestone","warped_planks","crimson_planks","jungle_planks","dark_oak_planks","acacia_planks","birch_planks","spruce_planks","oak_planks"];

function getHeldItem(bot) {
    if (bot.heldItem && bot.heldItem.name) {return bot.heldItem.name;}
    return "";
};

function equipItem(bot, itemNames, dest) {
    var finalItemName = null;
    //console.log(bot.inventory);
    var inven = bot.inventory.items();
    var equippedItem = -1;
    var equipTries = 0;
    if (dest == undefined) {dest = "hand";}
    while (equippedItem < 0 && equipTries < itemNames.length) {
        if (dest == "hand" && getHeldItem(bot).length > 0 && itemNames[equipTries] == bot.heldItem.name ||
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
                //console.log(itemNames[equipTries] + ", " + inven[i].name);
            }
        }
        equipTries++;
    }
    if (equippedItem == bot.quickBarSlot + 36 && dest == "hand") {
        equippedItem = -1;
        //console.log("no need");
    }
    for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
        if (bot.dunder.equipPackets[i].slot == equippedItem && bot.dunder.equipPackets[i].destination == dest) {
            equippedItem = -1;
        }
    }
    if (inven[equippedItem] == bot.heldItem) {
        //console.log("hi");
    } else if (equippedItem >= 0 && inven[equippedItem] != bot.heldItem) {
        var needsToGo = true;
        for (var i = 36; i < 43; i++) {
            if (inven[i] == null) {
                needsToGo = false;
            }
        }
        bot.dunder.equipPackets.push({"slot":equippedItem, "destination":dest, "time":10});
        //attackTimer = 0;
        bot.equip(inven[equippedItem], dest, function(e) {
            //console.log("canEquip: " + e);
            for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
                if (bot.dunder.equipPackets[i].slot == equippedItem && bot.dunder.equipPackets[i].destination == dest) {
                    bot.dunder.equipPackets.splice(i, 1);
                }
            }
            //console.log(bot.quickBarSlot + ", " + equippedItem);
            //attackTimer = 0;
        });
    }
    //console.log("jkl: " + itemNames + ", " + equippedItem);
    return finalItemName;
};


function getPlacedBlock(bot, x, y, z) {
    var returnTrue = false;
    for (var i = 0; i < bot.dunder.blockPackets.length; i++) {
        if (bot.dunder.blockPackets[i].x == x && bot.dunder.blockPackets[i].y == y && bot.dunder.blockPackets[i].z == z) {
            returnTrue = true;
            i = bot.dunder.blockPackets.length;
        }
    }
    return returnTrue;
};

function placeBlock(bot, x, y, z, placeBackwards) {
    //console.log("stopping on own terms");
    bot.stopDigging();
    var canPlace = false;
    var placeOffSet = new Vec3(0, 0, 0);
    equipItem(bot, garbageBlocks, "hand");
    //(!!!) might need to make them negative
    if (bot.blockAt(new Vec3(x, y, z)).shapes.length > 0) {
        canPlace = false;
    } else if (getPlacedBlock(bot, x, y + 1, z) || bot.blockAt(new Vec3(x, y + 1, z))) {
        canPlace = true;
        placeOffSet = new Vec3(0, 1, 0);
    } else if (getPlacedBlock(bot, x, y - 1, z) ||bot.blockAt(new Vec3(x, y - 1, z)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(0, -1, 0);
    } else if (getPlacedBlock(bot, x + 1, y, z) || bot.blockAt(new Vec3(x + 1, y, z)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(1, 0, 0);
    } else if (getPlacedBlock(bot, x - 1, y, z) || bot.blockAt(new Vec3(x - 1, y, z)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(-1, 0, 0);
    } else if (getPlacedBlock(bot, x, y, z + 1) || bot.blockAt(new Vec3(x, y, z + 1)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(0, 0, 1);
    } else if (getPlacedBlock(bot, x, y, z - 1) || bot.blockAt(new Vec3(x, y, z - 1)).shapes.length > 0) {
        canPlace = true;
        placeOffSet = new Vec3(0, 0, -1);
    }
    for (var i = 0; i < bot.dunder.blockPackets.length; i++) {
        if (bot.dunder.blockPackets[i].x == x && bot.dunder.blockPackets[i].y == y && bot.dunder.blockPackets[i].z == z) {
            canPlace = false;
            i = bot.dunder.blockPackets.length;
        }
    }
    if (bot.targetDigBlock || !bot.entity.heldItem) {canPlace = false;}
    if (canPlace) {
        bot.dunder.blockPackets.push({"x":x,"y":y,"z":z});//used in case of weirdness from the server
        bot.lookAt(new Vec3(x, y, z), 100);
        //attackTimer = 0;
        var placeBlockVar = bot.placeBlock(bot.blockAt(new Vec3(x, y, z)), placeOffSet);
        placeBlockVar.catch(function(e) {console.log("place block error: \n" + e);});
        placeBlockVar.then(function(e) {
            //attackTimer = 0;
            //console.log("alerted " + e);
            for (var i = 0; i < bot.dunder.blockPackets.length; i++) {
                if (bot.dunder.blockPackets[i].x == x && bot.dunder.blockPackets[i].y == y && bot.dunder.blockPackets[i].z == z) {
                    bot.dunder.blockPackets.splice(i, 1);
                    i = bot.dunder.blockPackets.length;
                }
            }
        });
        var swingArmPls = true;
        for (var i = 0; i < bot.dunder.blockPackets.length; i++) {
            if (bot.dunder.blockPackets[i].x == x && bot.dunder.blockPackets[i].y == y && bot.dunder.blockPackets[i].z == z) {
                swingArmPls = false;
            }
        }
       if (swingArmPls) {
           bot.swingArm();
       }
       bot.swingArm();
    }
    //console.log("placed block: " + canPlace);
};


bot.on("spawn", () => {
    bot.dunder = {
        "blockPackets":[],
        "equipPackets":[],
        "mode":"pillar",
    };
    bot.on("physicsTick", () => {
        for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
            bot.dunder.equipPackets[i].time--;
            if (bot.dunder.equipPackets[i].time < 0) {
                bot.dunder.equipPackets.splice(i, 1);
                continue;
            }
        }

        if (bot.dunder.mode == "pillar") {
            bot.setControlState("jump", true);
            placeBlock(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y - 0.1), Math.floor(bot.entity.position.z));
        }
    });
});
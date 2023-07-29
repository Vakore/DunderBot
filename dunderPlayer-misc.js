function setShieldTimer(bot, num) {
    if (bot.dunder.shieldCooldown < 0 && bot.inventory.slots[45] && bot.inventory.slots[45].name == "shield") {
        bot.dunder.shieldTimer = num;
    }
};


//Inventory management
function getHeldItem(bot) {
    if (bot.heldItem && bot.heldItem.name) {return bot.heldItem.name;}
    return "";
};

function hasItem(bot, itemNames) {
    var doesHaveItem = false;
    var inven = bot.inventory.slots;
    for (var i = 0; (i < inven.length) && !doesHaveItem; i++) {
        for (var j = 0; (j < itemNames.length) && !doesHaveItem; j++) {
            if (inven[i] == null) {
                continue;
            }
            if (inven[i].name == itemNames[j]) {
                doesHaveItem = true;
            }
        }
    }
    return doesHaveItem;
    //console.log(bot.inventory.items());
};

function equipItem(bot, itemNames, dest) {
    var finalItemName = null;
    //console.log(bot.inventory);
    var inven = bot.inventory.items();
    var equippedItem = -1;
    var equipTries = 0;
    if (dest == undefined) {dest = "hand";}
    while (equippedItem < 0 && equipTries < itemNames.length) {
        console.log("asdf");
        if (dest == "hand" && getHeldItem(bot).length > 0 && itemNames[equipTries] == bot.heldItem.name ||
            dest == "off-hand" && bot.inventory.slots[45] && itemNames[equipTries] == bot.inventory.slots[45].name) {
            console.log("holdingThat!");
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
                console.log("yay");
            } else {
                console.log(itemNames[equipTries] + ", " + inven[i].name);
            }
        }
        equipTries++;
    }
    if (equippedItem == bot.quickBarSlot + 36 && dest == "hand") {
        equippedItem = -1;
        console.log("no need");
    }
    for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
        if (bot.dunder.equipPackets[i].slot == equippedItem && bot.dunder.equipPackets[i].destination == dest) {
            equippedItem = -1;
        }
    }
    if (inven[equippedItem] == bot.heldItem) {
        console.log("hi");
    } else if (equippedItem >= 0 && inven[equippedItem] != bot.heldItem) {
        var needsToGo = true;
        for (var i = 36; i < 43; i++) {
            if (inven[i] == null) {
                needsToGo = false;
                console.log("j");
            }
        }
        console.log("bbb");
        bot.dunder.equipPackets.push({"slot":equippedItem, "destination":dest, "time":10});
        //attackTimer = 0;
        bot.equip(inven[equippedItem], dest, function(e) {
            console.log("canEquip: " + e);
            for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
                if (bot.dunder.equipPackets[i].slot == equippedItem && bot.dunder.equipPackets[i].destination == dest) {
                    bot.dunder.equipPackets.splice(i, 1);
                }
            }
            console.log(bot.quickBarSlot + ", " + equippedItem);
            //attackTimer = 0;
        });
    }
    console.log("jkl: " + itemNames + ", " + equippedItem);
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
function equipFood(bot) {
    equipItem(bot, foodsBySaturation);//TODO: Ignore certain items except for certain circumstances. i.e. don't eat a gapple if rotten flesh unless in combat.
    //console.log(foodsBySaturation);
};

var digStrengths = {
    /*"rock"*/"mineable/pickaxe":["netherite_pickaxe","diamond_pickaxe","iron_pickaxe","stone_pickaxe","golden_pickaxe","wooden_pickaxe"],
    /*"wood"*/"mineable/axe":["netherite_axe","diamond_axe","iron_axe","stone_axe","golden_axe","wooden_axe"],
    /*"dirt"*/"mineable/shovel":["netherite_shovel","diamond_shovel","iron_shovel","stone_shovel","golden_shovel","wooden_shovel"],
    /*"plant"*/"mineable/hoe":["netherite_hoe","diamond_hoe","iron_hoe","stone_hoe","golden_hoe","wooden_hoe","shears"],
    "web":["netherite_sword","diamond_sword","iron_sword","stone_sword","golden_sword","wooden_sword","shears"],
};
function equipTool(bot, x, y, z) {
    console.log("why");
    var material = bot.blockAt(new Vec3(x, y, z));
    if (material && material.material != undefined && digStrengths[material.material] != undefined) {
        equipItem(bot, digStrengths[material.material]);
    } else {
        console.log("eh");
    }
};


//"visuals"
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

function botCanHit(bot, elTarget) {
    var returner = dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, elTarget.position.x, elTarget.position.y, elTarget.position.z);
    if (returner > dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, elTarget.position.x, elTarget.position.y + elTarget.height, elTarget.position.z)) {
        returner = dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, elTarget.position.x, elTarget.position.y + elTarget.height, elTarget.position.z);
    }

    if (bot.entity.position.y + 1.6 > elTarget.position.y && bot.entity.position.y + 1.6 < elTarget.position.y + elTarget.height) {
        returner = dist3d(bot.entity.position.x, 0, bot.entity.position.z, elTarget.position.x, 0, elTarget.position.z);
    }
    return returner;
};

function attackEntity(bot, target) {
    bot.attack(target, true);
    bot.dunder.attackTimer = 0;
    bot.dunder.antiRightClickTicks = 2;
    for (var i = 0; i < bots.length; i++) {
        if (!bots[i].dunder.spawned) {continue;}
        bots[i].dunder.entityHitTimes[target.uuid] = 0.5;
    }
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


//mining/building
function digBlock(bot, x, y, z) {
    var canMine = true;
        //console.log(bot.dunder.equipPackets.length);
    for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
        if (bot.dunder.equipPackets[i].destination == "hand") {
            //canMine = false;
        }
    }
    bot.dunder.lookY = y;
    if (canMine && !bot.targetDigBlock) {
        bot.dunder.destinationTimer = 30 + (getDigTime(bot, x, y, z, bot.entity.isInWater, true) / 50);
        console.log(getDigTime(bot, x, y, z, false, true) + ", " + bot.dunder.destinationTimer);
        bot.dig(bot.blockAt(new Vec3(x, y, z))).catch(e => {});
    }
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
        bot.placeBlock(bot.blockAt(new Vec3(x, y, z)), placeOffSet).then(function(e) {
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

function getHitTimes(bot, uuid) {
    var hitTime = 0;
    if (bot.dunder.entityHitTimes[uuid] != undefined) {
        hitTime = bot.dunder.entityHitTimes[uuid];
    }
    return hitTime;
};


function findCommander(bot) {
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

//Math

function dist3d(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) + (z2 - z1)*(z2 - z1));
};

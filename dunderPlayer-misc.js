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

function hasItemCount(bot, match) {
    var returner = 0;
    var inven = bot.inventory.slots;
    for (var i = 0; (i < inven.length); i++) {
        if (inven[i] == null) {
            continue;
        } else if (match(inven[i].name)) {
            returner += inven[i].count;
        }
    }
    return returner;
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

function afterFuncAfterFunc(bot, equippedItem, dest, e) {
        //console.log("canEquip: " + e);
        for (var i = 0; i < bot.dunder.equipPackets.length; i++) {
            if (bot.dunder.equipPackets[i].slot == equippedItem && bot.dunder.equipPackets[i].destination == dest) {
                bot.dunder.equipPackets.splice(i, 1);
            }
        }
        if (e) {e();}
        //console.log(bot.quickBarSlot + ", " + equippedItem);
        //attackTimer = 0;
};

function equipItem(bot, itemNames, dest, afterFunc) {
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
        /*if (dest == "hand") {
            bot.heldItem = inven[equippedItem];
        }*/
        bot.equip(inven[equippedItem], dest).then(afterFuncAfterFunc(bot, equippedItem, dest, afterFunc));
    }
    //console.log("jkl: " + itemNames + ", " + equippedItem);
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
    //console.log("why");
    var material = bot.blockAt(new Vec3(x, y, z));
    if (material && material.material != undefined && digStrengths[material.material] != undefined) {
        equipItem(bot, digStrengths[material.material]);
    } else {
        //console.log("eh");
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

function botCanSee(bot, entity, node) {
    //console.log(entity.position.offset(0, entity.height / 2, 0).minus(bot.entity.position.offset(0, 1.6, 0)).normalize());
    let theRaycast = null;
    if (node) {
        let dupeWorld = JSON.parse(JSON.stringify(bot.world));
        theRaycast = dupeWorld.raycast(bot.entity.position.offset(0, 1.6, 0), entity.position.offset(0, entity.height / 2, 0).minus(bot.entity.position.offset(0, 1.6, 0)).normalize(), 16);
    } else {
        theRaycast = bot.world.raycast(bot.entity.position.offset(0, 1.6, 0), entity.position.offset(0, entity.height / 2, 0).minus(bot.entity.position.offset(0, 1.6, 0)).normalize(), 16);
    }
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
    if (target.name == "arrow" || target.name == "small_fireball") {
        return false;
    }
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

//
function projectileIsThreat(bot, entity) {
    if (!entity.oldPosition) {
        entity.oldPosition = new Vec3(entity.position.x, entity.position.y, entity.position.z);
        entity.fakeVelocity = new Vec3(entity.velocity.x, entity.velocity.y, entity.velocity.z);
        return false;
    } else {
        entity.fakeVelocity.x = entity.position.x - entity.oldPosition.x;
        entity.fakeVelocity.y = entity.position.y - entity.oldPosition.y;
        entity.fakeVelocity.z = entity.position.z - entity.oldPosition.z;
    }
    //console.log(JSON.stringify(entity));
    if (dist3d(entity.oldPosition.x, entity.oldPosition.y, entity.oldPosition.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < dist3d(entity.position.x, entity.position.y, entity.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z)) {
        entity.oldPosition.x = entity.position.x;
        entity.oldPosition.y = entity.position.y;
        entity.oldPosition.z = entity.position.z;
        return false;
    }

    entity.oldPosition.x = entity.position.x;
    entity.oldPosition.y = entity.position.y;
    entity.oldPosition.z = entity.position.z;



    if (Math.abs(entity.fakeVelocity.x) + Math.abs(entity.fakeVelocity.z) > 0.15) {
        return true;
    }
    return false;
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
        //bot.dunder.isDigging = 2;
        bot.dunder.destinationTimer = 30 + (getDigTime(bot, x, y, z, bot.entity.isInWater, true) / 50);
        //console.log(getDigTime(bot, x, y, z, false, true) + ", " + bot.dunder.destinationTimer);
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

function placeBlock(bot, x, y, z, placeBackwards, extraOptions = {}) {
    //console.log("stopping on own terms");
    bot.stopDigging();
    var canPlace = false;
    var placeOffSet = new Vec3(0, 0, 0);
    if (!extraOptions || !extraOptions.useBlocks) {
        equipItem(bot, garbageBlocks, "hand");
    } else {
        equipItem(bot, extraOptions.useBlocks, "hand");
    }
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
    if (bot.targetDigBlock /*|| !bot.entity.heldItem*/) {canPlace = false;}
    if (canPlace) {
        bot.dunder.blockPackets.push({"x":x,"y":y,"z":z,"endFunc":extraOptions.endFunc});//used in case of weirdness from the server
        botLookAt(bot, new Vec3(x, y, z), 100);
        //attackTimer = 0;
        bot.placeBlock(bot.blockAt(new Vec3(x, y, z)), placeOffSet).then(function(e) {
            //attackTimer = 0;
            //console.log(bot.entity.position);
            for (var i = 0; i < bot.dunder.blockPackets.length; i++) {
                if (bot.dunder.blockPackets[i].x == x && bot.dunder.blockPackets[i].y == y && bot.dunder.blockPackets[i].z == z) {
                    if (bot.dunder.blockPackets[i].endFunc) {
                        bot.dunder.blockPackets[i].endFunc();
                    }
                    bot.dunder.blockPackets.splice(i, 1);
                    i = bot.dunder.blockPackets.length;
                }
            }
        }).catch(function(e) {console.log("place block error: \n" + e);});
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



function getEntityFloorPos(bot, position, obj) {
    if (!obj) {
        obj = {x:0,y:0,z:0};
    }
    obj.x = Math.floor(position.x);
    obj.y = Math.floor(position.y)-1;
    obj.z = Math.floor(position.z);
    if (!blockStand(bot, obj.x, obj.y, obj.z)) {
        if (blockStand(bot, obj.x, obj.y - 1, obj.z)) {
            obj.y--;
        } else {
            if (blockStand(bot, obj.x - 1, obj.y, obj.z)) {
                obj.x--;
            } else if (blockStand(bot, obj.x + 1, obj.y, obj.z)) {
                obj.x++;
            } else if (blockStand(bot, obj.x, obj.y, obj.z - 1)) {
                obj.z--;
            } else if (blockStand(bot, obj.x, obj.y, obj.z + 1)) {
                obj.z++;
            } else if (blockStand(bot, obj.x - 1, obj.y, obj.z - 1)) {
                obj.x--;
                obj.z--;
            } else if (blockStand(bot, obj.x + 1, obj.y, obj.z - 1)) {
                obj.x++;
                obj.z--;
            } else if (blockStand(bot, obj.x - 1, obj.y, obj.z + 1)) {
                obj.x--;
                obj.z++;
            } else if (blockStand(bot, obj.x + 1, obj.y, obj.z + 1)) {
                obj.x++;
                obj.z++;
            } else if (blockStand(bot, obj.x, obj.y - 2, obj.z)) {
                obj.y -= 2;
            } else if (blockStand(bot, obj.x, obj.y - 3, obj.z)) {
                obj.y -= 3;
            }
        }
    }
    obj.y++;
    return obj;
};

function visibleFromPos(bot, pos1, pos2, zeNode) {
    //console.log(entity.position.offset(0, entity.height / 2, 0).minus(bot.entity.position.offset(0, 1.6, 0)).normalize());
    let theRaycast = null;
    if (false && zeNode) {
        console.log("hi");
        let dupeWorld = JSON.parse(JSON.stringify(bot.world));
        console.log("uh");
        /*while (zeNode.parent) {
            for (var i = 0; i < zeNode.brokenBlocks.length; i++) {
                dupeWorld.setBlock(new Vec3(zeNode.brokenBlocks[i][0], zeNode.brokenBlocks[i][1], zeNode.brokenBlocks[i][2]), new Block(registry.blocksByName.air, registry.biomesByName.plains, 0));
            }
            zeNode = zeNode.parent;
        console.log("thingamajig2");
        }*/
        theRaycast = dupeWorld.raycast(pos1.offset(0, 1.6, 0), pos2.offset(0.5, 0.5, 0.5).minus(pos1.offset(0, 1.6, 0)).normalize(), 16);
        console.log("thingamajig");
    } else {
        theRaycast = bot.world.raycast(pos1.offset(0, 1.6, 0), pos2.offset(0.5, 0.5, 0.5).minus(pos1.offset(0, 1.6, 0)).normalize(), 16);
        //It would be more efficient to modify the iterator or whatever in prismarine-world, however I'm too lazy to implement that
        while (zeNode && theRaycast.position.x != pos2.x && theRaycast.position.y != pos2.y && theRaycast.position.z != pos2.z) {
            let walkThrough = 1;
            for (var i = 0; i < zeNode.brokenBlocks.length; i++) {
                if (zeNode.brokenBlocks[i][0] == theRaycast.position.x && zeNode.brokenBlocks[i][1] == theRaycast.position.y && zeNode.brokenBlocks[i][2] == theRaycast.position.z) {
                    walkThrough = 0;
                    i = zeNode.brokenBlocks.length;
                    theRaycast = bot.world.raycast(theRaycast.position, pos2.offset(0.5, 0.5, 0.5).minus(theRaycast.position).normalize(), 16);
                }
            }
            if (walkThrough == 0) {
                zeNode = false;
            }
        }
    }
    var returner = false;
    //console.log(theRaycast.position + ", " + pos2);
    if (theRaycast && theRaycast.intersect && /*theRaycast.position.x == pos2.x && theRaycast.position.y == pos2.y && theRaycast.position.z == pos2.z*/
        theRaycast.intersect.x >= pos2.x - 0.0 && theRaycast.intersect.x <= pos2.x + 1.0 &&
        theRaycast.intersect.y >= pos2.y - 0.0 && theRaycast.intersect.y <= pos2.y + 1.0 &&
        theRaycast.intersect.z >= pos2.z - 0.0 && theRaycast.intersect.z <= pos2.z + 1.0 /*&&
        (theRaycast.intersect.x == pos2.x - 0.0 || theRaycast.intersect.x == pos2.x + 1.0) +
        (theRaycast.intersect.x == pos2.x - 0.0 || theRaycast.intersect.x == pos2.x + 1.0) +
        (theRaycast.intersect.x == pos2.x - 0.0 || theRaycast.intersect.x == pos2.x + 1.0) < 2*/
      /*dist3d(pos1.x, pos1.y, pos1.z, theRaycast.intersect.x, theRaycast.intersect.y, theRaycast.intersect.z) <
        dist3d(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z) - 0.5*/) {
        returner = true;
    }
    return returner;
};




function placeCraftingTable(bot) {
            let craftingCheckers = {};
            craftingCheckers[Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y) + "." + Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y),
                z:Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y) + "." + Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y),
                z:Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y) + "." + Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y),
                z:Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y) + "." + Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y),
                z:Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+1) + "." + Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+1),
                z:Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+1) + "." + Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+1),
                z:Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+1) + "." + Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+1),
                z:Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+1) + "." + Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+1),
                z:Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+2) + "." + Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+2),
                z:Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+2) + "." + Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+2),
                z:Math.floor(bot.entity.position.z - bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+2) + "." + Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x - bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+2),
                z:Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };

            craftingCheckers[Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth) + "." + Math.floor(bot.entity.position.y+2) + "." + Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth)] = {
                x:Math.floor(bot.entity.position.x + bot.physics.playerHalfWidth),
                y:Math.floor(bot.entity.position.y+2),
                z:Math.floor(bot.entity.position.z + bot.physics.playerHalfWidth),
                valid:false,
                open:true,
            };
            let craftingCheckers2 = [];
            for (var i in craftingCheckers) {
                craftingCheckers2.push(craftingCheckers[i]);
                //bot.chat("/particle minecraft:spit " + craftingCheckers[i].x + " " + craftingCheckers[i].y + " " + craftingCheckers[i].z);
            }
            let currentCraftingCheckers2Length = craftingCheckers2.length;
            let placeLocation = [];
            for (var i = 0; i < currentCraftingCheckers2Length; i++) {
                if (craftingCheckers2[i].open) {
                    let validPushers = [true, true, true, true];
                    for (var j = 0; j < craftingCheckers2.length; j++) {
                        if (craftingCheckers2[j].x == craftingCheckers2[i].x-1 && craftingCheckers2[j].z == craftingCheckers2[i].z && craftingCheckers2[j].y == craftingCheckers2[i].y) {
                            validPushers[0] = false;
                        }
                        if (craftingCheckers2[j].x == craftingCheckers2[i].x+1 && craftingCheckers2[j].z == craftingCheckers2[i].z && craftingCheckers2[j].y == craftingCheckers2[i].y) {
                            validPushers[1] = false;
                        }
                        if (craftingCheckers2[j].x == craftingCheckers2[i].x && craftingCheckers2[j].z == craftingCheckers2[i].z-1 && craftingCheckers2[j].y == craftingCheckers2[i].y) {
                            validPushers[2] = false;
                        }
                        if (craftingCheckers2[j].x == craftingCheckers2[i].x && craftingCheckers2[j].z == craftingCheckers2[i].z+1 && craftingCheckers2[j].y == craftingCheckers2[i].y) {
                            validPushers[3] = false;
                        }
                    }

                    if (i < Infinity && validPushers[0]) {
                        craftingCheckers2.push({
                            x:craftingCheckers2[i].x-1,
                            y:craftingCheckers2[i].y,
                            z:craftingCheckers2[i].z,
                            open:true,
                        });
                        if (blockAir(bot, craftingCheckers2[i].x-1, craftingCheckers2[i].y, craftingCheckers2[i].z)) {
                            placeLocation = [craftingCheckers2[i].x-1, craftingCheckers2[i].y, craftingCheckers2[i].z];
                            i = Infinity;
                        }
                    }

                    if (i < Infinity && validPushers[1]) {
                        craftingCheckers2.push({
                            x:craftingCheckers2[i].x+1,
                            y:craftingCheckers2[i].y,
                            z:craftingCheckers2[i].z,
                            open:true,
                        });
                        if (blockAir(bot, craftingCheckers2[i].x+1, craftingCheckers2[i].y, craftingCheckers2[i].z)) {
                            placeLocation = [craftingCheckers2[i].x+1, craftingCheckers2[i].y, craftingCheckers2[i].z];
                            i = Infinity;
                        }
                    }

                    if (i < Infinity && validPushers[2]) {
                        craftingCheckers2.push({
                            x:craftingCheckers2[i].x,
                            y:craftingCheckers2[i].y,
                            z:craftingCheckers2[i].z-1,
                            open:true,
                        });
                        if (blockAir(bot, craftingCheckers2[i].x, craftingCheckers2[i].y, craftingCheckers2[i].z-1)) {
                            placeLocation = [craftingCheckers2[i].x, craftingCheckers2[i].y, craftingCheckers2[i].z-1];
                            i = Infinity;
                        }
                    }

                    if (i < Infinity && validPushers[3]) {
                        craftingCheckers2.push({
                            x:craftingCheckers2[i].x,
                            y:craftingCheckers2[i].y,
                            z:craftingCheckers2[i].z+1,
                            open:true,
                        });
                        if (blockAir(bot, craftingCheckers2[i].x, craftingCheckers2[i].y, craftingCheckers2[i].z+1)) {
                            placeLocation = [craftingCheckers2[i].x, craftingCheckers2[i].y, craftingCheckers2[i].z+1];
                            i = Infinity;
                        }
                    }
                }
            }
            if (placeLocation.length > 0) {
                equipItem(bot, ["crafting_table"], "hand", () => {}/*, () => {placeBlock(bot, placeLocation[0], placeLocation[1], placeLocation[2], false, {useBlocks:["crafting_table"]})}*/);
                setTimeout( () => {placeBlock(bot, placeLocation[0], placeLocation[1], placeLocation[2], false, {useBlocks:["crafting_table"],endFunc:function() {console.log("finished");bot.dunderTaskCompleted = true;} })}, 100);
                console.log("pls? " + bot.heldItem);
            } else {
                console.log("epic embed fail");
            }
};




function findVein(bot, options) {
            var pathToBlocks = bot.findBlocks({
                matching: options.block,
                maxDistance: options.distance,
                useExtraInfo: options.useExtraInfo || false,
                count:1//(options.count) ? options.count : 1
            });
            
            //vein stuff
            if (pathToBlocks.length > 0) {
                let maxSpreadCount = 20;
                let openMineNodes = 1;
                let mineNodes = [[pathToBlocks[0], true]];
                for (var i = 0; i < mineNodes.length && i < maxSpreadCount; i++) {
                    if (mineNodes[i][1]) {
                        mineNodes[i][1] = false;
                        let validPushers = [true, true, true, true, true, true];
                        for (var j = 0; j < mineNodes.length; j++) {
                            if (mineNodes[j][0].x == mineNodes[i][0].x-1 && mineNodes[j][0].z == mineNodes[i][0].z && mineNodes[j][0].y == mineNodes[i][0].y) {
                                validPushers[0] = false;
                            }
                            if (mineNodes[j][0].x == mineNodes[i][0].x+1 && mineNodes[j][0].z == mineNodes[i][0].z && mineNodes[j][0].y == mineNodes[i][0].y) {
                                validPushers[1] = false;
                            }
                            if (mineNodes[j][0].x == mineNodes[i][0].x && mineNodes[j][0].z == mineNodes[i][0].z-1 && mineNodes[j][0].y == mineNodes[i][0].y) {
                                validPushers[2] = false;
                            }
                            if (mineNodes[j][0].x == mineNodes[i][0].x && mineNodes[j][0].z == mineNodes[i][0].z+1 && mineNodes[j][0].y == mineNodes[i][0].y) {
                                validPushers[3] = false;
                            }
                            if (mineNodes[j][0].x == mineNodes[i][0].x && mineNodes[j][0].z == mineNodes[i][0].z && mineNodes[j][0].y == mineNodes[i][0].y-1) {
                                validPushers[4] = false;
                            }
                            if (mineNodes[j][0].x == mineNodes[i][0].x && mineNodes[j][0].z == mineNodes[i][0].z && mineNodes[j][0].y == mineNodes[i][0].y+1) {
                                validPushers[5] = false;
                            }
                        }

                        if (validPushers[0] && options.block( bot.blockAt( mineNodes[i][0].offset(-1, 0, 0) ) )) {
                            mineNodes.push([bot.blockAt( mineNodes[i][0].offset(-1, 0, 0) ).position, true]);
                        }
                        if (validPushers[1] && options.block( bot.blockAt( mineNodes[i][0].offset(1, 0, 0) ) )) {
                            mineNodes.push([bot.blockAt( mineNodes[i][0].offset(1, 0, 0) ).position, true]);
                        }
                        if (validPushers[2] && options.block( bot.blockAt( mineNodes[i][0].offset(0, 0, -1) ) )) {
                            mineNodes.push([bot.blockAt( mineNodes[i][0].offset(0, 0, -1) ).position, true]);
                        }
                        if (validPushers[3] && options.block( bot.blockAt( mineNodes[i][0].offset(0, 0, 1) ) )) {
                            mineNodes.push([bot.blockAt( mineNodes[i][0].offset(0, 0, 1) ).position, true]);
                        }
                        if (validPushers[4] && options.block( bot.blockAt( mineNodes[i][0].offset(0, -1, 0) ) )) {
                            mineNodes.push([bot.blockAt( mineNodes[i][0].offset(0, -1, 0) ).position, true]);
                        }
                        if (validPushers[5] && options.block( bot.blockAt( mineNodes[i][0].offset(0, 1, 0) ) )) {
                            mineNodes.push([bot.blockAt( mineNodes[i][0].offset(0, 1, 0) ).position, true]);
                        }
                    }
                }

                for (var i = 1; i < mineNodes.length; i++) {
                    pathToBlocks.push(mineNodes[i][0]);
                }
                //while (openMineNodes > 0 && maxSpreadCount > 0) {
                //    maxSpreadCount--;  
                //}
            }
            return pathToBlocks;
};


//Math

function dist3d(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) + (z2 - z1)*(z2 - z1));
};
function distMan3d(x1, y1, z1, x2, y2, z2) {//Ideally a cheaper function
    return Math.abs(x2 - x1) + Math.abs(y2 - y1) + Math.abs(z2 - z1);
};



//bucket task stuff
function getHighestBlockBelow(bot, entity) {
    let useWidth = 0.3001;
    if (!entity) {
        entity = bot.entity;
    } else {
        if (entity.name != "player") {
            useWidth = (entity.width / 2) - 0.1;
        }
    }
    //console.log(useWidth);
                var fireCandidates = [false, false, false, false];
                for (var i = 0; i < 23; i++) {
                    if (Math.floor(entity.position.y) - i <= -64) {
                        i = 23;
                        break;
                    }
                    if (!fireCandidates[0] && blockSolid(bot, Math.floor(entity.position.x - useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z - useWidth))) {
                        fireCandidates[0] = bot.blockAt(new Vec3(Math.floor(entity.position.x - useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z - useWidth)));
                    }
                    if (!fireCandidates[1] && blockSolid(bot, Math.floor(entity.position.x + useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z - useWidth))) {
                        fireCandidates[1] = bot.blockAt(new Vec3(Math.floor(entity.position.x + useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z - useWidth)));
                    }
                    if (!fireCandidates[2] && blockSolid(bot, Math.floor(entity.position.x - useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z + useWidth))) {
                        fireCandidates[2] = bot.blockAt(new Vec3(Math.floor(entity.position.x - useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z + useWidth)));
                    }
                    if (!fireCandidates[3] && blockSolid(bot, Math.floor(entity.position.x + 0.301),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z + useWidth))) {//(!!!)Probably need to account for negatives or something
                        fireCandidates[3] = bot.blockAt(new Vec3(Math.floor(entity.position.x + useWidth),
                                 Math.floor(entity.position.y) - i,
                                 Math.floor(entity.position.z + useWidth)));
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
                    bot.dunder.bucketTask.pos = myFireCandidate.position.offset(0, 0, 0);
                }
};
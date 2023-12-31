function canDigBlock(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var isTitle = false;
    if (myBlock) {
        isTitle = bot.canDigBlock(myBlock);
    }
    return isTitle;
};

function breakAndPlaceBlock(bot, x, y, z, checkStand) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var shouldItBreak = false;
    if (myBlock.shapes.length == 0 | checkStand & myBlock.shapes.length != 0 & !blockStand(bot, x, y, z) && myBlock.name != "air" && myBlock.name != "cave_air" && myBlock.type != "void_air" &&
        myBlock.name != "lava" && myBlock.name != "flowing_lava" && myBlock.name != "water" && myBlock.name != "flowing_water") {
        shouldItBreak = true;
    }
    return shouldItBreak;
};

function isBlock(bot, x, y, z, zeNode) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var walkThrough = 1;
    if (myBlock == undefined) {console.log(x + ", " + y + ", " + z + ", " + myBlock);}
    if (myBlock.type == 0) {
        walkThrough = 0;
    } else if (myBlock.displayName == "Lava" || myBlock.displayName == "Flowing_Lava") {
        walkThrough = 2;
    } else if (myBlock.displayName == "Water") {
        walkThrough = 3;
    } else if (myBlock.shapes.length == 0) {
        walkThrough = 0;
    }
    if (zeNode) {while (zeNode.parent) {
        for (var i = 0; i < zeNode.brokenBlocks.length; i++) {
            if (zeNode.brokenBlocks[i][0] == x && zeNode.brokenBlocks[i][1] == y && zeNode.brokenBlocks[i][2] == z) {
                walkThrough = 0;
                i = zeNode.brokenBlocks.length;
            } else {
                continue;
            }
        }
        zeNode = zeNode.parent;
    }}
    return walkThrough;
};

function blockDiggable(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var isTitle = true;
    if (!myBlock || !myBlock.hardness) {isTitle = false;}
    return isTitle;
};

function blockStand(bot, x, y, z, zeNode) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockStand: " + myBlock.shapes.length);
    var isTitle = false;
    if (myBlock && myBlock.shapes.length == 1 && myBlock.shapes[0][0] <= 0.126 && myBlock.shapes[0][2] <= 0.126 &&
        myBlock.shapes[0][3] >= 1 - 0.126 && myBlock.shapes[0][4] >= 1 - 0.126 && myBlock.shapes[0][4] <= 1 + 0.126 && myBlock.shapes[0][5] >= 1 - 0.126) {
        isTitle = true;
    }
    if (zeNode && isTitle) {//1/17/2022
        while (zeNode.parent) {
            for (var i = 0; i < zeNode.brokenBlocks.length; i++) {
                if (zeNode.brokenBlocks[i][0] == x && zeNode.brokenBlocks[i][1] == y && zeNode.brokenBlocks[i][2] == z) {
                    isTitle = false;
                    i = zeNode.brokenBlocks.length;
                } else {
                    continue;
                }
            }
            zeNode = zeNode.parent;
        }
    }
    return isTitle;
};

function blockWalk(bot, x, y, z, zeNode, waterAllowed, lavaAllowed) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockStand: " + myBlock.shapes.length);
    var isTitle = false;
    if (myBlock && myBlock.type != 94 && !blockWater(bot, x, y, z) | waterAllowed && !blockLava(bot, x, y, z) | lavaAllowed) {
        if (myBlock && myBlock.shapes.length == 0 || myBlock && myBlock.shapes.length == 1 && myBlock.shapes[0].length == 6 && myBlock.shapes[0][4] <= 0.2) {
            isTitle = true;
            //console.log(myBlock.shapes.length);
            //if (myBlock.shapes.length == 1) {console.log(myBlock.shapes[0].length);}
        }
    }
    if (zeNode) {
        while (zeNode.parent) {
            for (var i = 0; i < zeNode.brokenBlocks.length; i++) {
                if (zeNode.brokenBlocks[i][0] == x && zeNode.brokenBlocks[i][1] == y && zeNode.brokenBlocks[i][2] == z) {
                    isTitle = false;
                    i = zeNode.brokenBlocks.length;
                } else {
                    continue;
                }
            }
            zeNode = zeNode.parent;
        }
    }
    return isTitle;
};

function slabSwimTarget(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var myValue = 0;
    if (myBlock && myBlock.shapes.length == 1 && myBlock.shapes[0].length == 6 && myBlock.shapes[0][4]) {
        myValue = myBlock.shapes[0][4];
    }
    return myValue;
};

function blockSolid(bot, x, y, z, zeNode) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockSolid: " + myBlock.shapes.length);
    var isTitle = false;
    if (myBlock && myBlock.shapes.length > 0 | myBlock.type == 94) {
        isTitle = true;
    }
    if (zeNode) {
        while (zeNode.parent) {
            for (var i = 0; i < zeNode.brokenBlocks.length; i++) {
                if (zeNode.brokenBlocks[i][0] == x && zeNode.brokenBlocks[i][1] == y && zeNode.brokenBlocks[i][2] == z) {
                    isTitle = false;
                    i = zeNode.brokenBlocks.length;
                } else {
                    continue;
                }
            }
            zeNode = zeNode.parent;
        }
    }
    return isTitle;
    
};
function blockAir(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockAir: " + myBlock.shapes.length);
    var isTitle = false;
    //water, lava, and seagrass, are all not air.
    if (myBlock && (myBlock.name == "water" || myBlock.name == "lava" || myBlock.name == "cobweb" || myBlock.name == "seagrass")/*myBlock.type == 27 | myBlock.type == 26 | myBlock.type == 94 | myBlock.type == 98 | myBlock.type == 99 | myBlock.type == 574 | myBlock.type == 575*/) {
        isTitle = false;
    } else if (myBlock && myBlock.shapes.length == 0) {
        isTitle = true;
    }
    return isTitle;
};
function blockCobweb(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockAir: " + myBlock.shapes.length);
    var isTitle = false;
    if (myBlock && myBlock.name == "cobweb") {
        isTitle = true;
    }
    return isTitle;
};

function blockLilypad(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var isTitle = false;
    if (myBlock && myBlock.name == "lily_pad") {
        isTitle = true;
    }
    return isTitle;
};

function getDigTime(bot, x, y, z, inWater, useTools) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var myDigTime = 0;
    var myItem = null;
    var equipTries = 0;
    if (useTools && myBlock && myBlock.material) {
        var inven = bot.inventory.slots;
        var itemNames = digStrengths[myBlock.material];
        if (itemNames) {
            while (myItem == null && equipTries < itemNames.length) {
                //console.log(itemNames[equipTries]);
                for (var i = 0; i < inven.length; i++) {
                    if (inven[i] == null) {
                        continue;
                   } else if (inven[i].name == itemNames[equipTries]) {
                        myItem = inven[i].type;
                        i = inven.length;
                    } else {
                        //console.log(inven[i].name);
                    }
                }
                equipTries++;
            }
        }
    }

    if (myBlock) {
        //if (myItem) {console.log(myItem);}
        myDigTime = myBlock.digTime(myItem, false, inWater, false, [], {});//heldItemType, creative, inWater, notOnGround, enchs, pots
        if (blockWater(bot, x, y, z) || blockLava(bot, x, y, z)) {
            myDigTime = 0;
        } else if (myBlock.hardness >= 100 || myBlock.hardness == null) {
            myDigTime = 9999999;
        }
        //console.log(myBlock.name + ": " + myBlock.hardness);
    }
    return myDigTime;
};



function blockAir(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockAir: " + myBlock.shapes.length);
    var isTitle = false;
    if (myBlock && (myBlock.name == "water" || myBlock.name == "lava" || myBlock.name == "cobweb")/*(myBlock.type == 27 || myBlock.type == 26 || myBlock.type == 94)*/) {//!!!
        isTitle = false;
    } else if (myBlock && myBlock.shapes.length == 0) {
        isTitle = true;
    }
    return isTitle;
};
function blockCobweb(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    //console.log("blockAir: " + myBlock.shapes.length);
    var isTitle = false;
    if (myBlock && myBlock.name == "cobweb") {//!!!
        isTitle = true;
    }
    return isTitle;
};
function blockWater(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var isTitle = false;
    if (myBlock && myBlock.name == "water") {//!!!
        isTitle = true;
    }
    return isTitle;
};
function blockLava(bot, x, y, z) {
    var myBlock = bot.blockAt(new Vec3(x, y, z));
    var isTitle = false;
    if (myBlock && myBlock.name == "lava") {//!!!
        isTitle = true;
    }
    return isTitle;
};


function blockExposed(bot, block) {
    var returner = true;
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
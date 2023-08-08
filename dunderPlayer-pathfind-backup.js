//OLD STUFF
var chunkColumns = [];
function checkChunk(x, z) {
    var isTitle = false;
    if (chunkColumns[Math.floor(z / 16)] && chunkColumns[Math.floor(z / 16)][Math.floor(x / 16)]) {
        isTitle = true;
    }
    return isTitle;
};

var pathfinderOptions = {
    "maxFall":3,
    "maxFallClutch":256,
    "canClutch":true,
    "sprint":true,
    "parkour":true,
    "place":true,
    "break":true,
    "lowestY":-65,
};

var garbageBlocks = ["diorite","granite","andesite","basalt","netherrack","dirt","stone","cobblestone","warped_planks","crimson_planks","jungle_planks","dark_oak_planks","acacia_planks","birch_planks","spruce_planks","oak_planks"];
function isSwim(swimme) {
    var isTitle = false;
    if (swimme == "start" || swimme == "swimFast" || swimme == "swimSlow" || swimme == "lava" ||
        swimme == "fallWater" || swimme == "fallLava") {
        isTitle = true;
    }
    return isTitle;
};

//var nodes = [];
//var openNodes = [];
//var nodes3d = [];
//var lastPos = {"currentMove":0,x:0,y:0,z:0};

function addNode(bot, parent, fcost, hcost, x, y, z, moveType, brokenBlocks, brokeBlocks) {
    var parentFCost = fcost;
    if (parent) {
        parentFCost += parent.fCost;
    }
    pushHeap(bot, {"parent":parent, "fCost":parentFCost, "hCost":hcost, "x":x, "y":y, "z":z, "open":true, "moveType":moveType, "brokenBlocks":brokenBlocks, "brokeBlocks":brokeBlocks});
    if (bot.dunder.nodes3d[y] == undefined) {bot.dunder.nodes3d[y] = [];}
    if (bot.dunder.nodes3d[y][z] == undefined) {bot.dunder.nodes3d[y][z] = [];}
    bot.dunder.nodes3d[y][z][x] = bot.dunder.nodes[bot.dunder.nodes.length - 1];
};


function pushHeap(bot, obj) {
    bot.dunder.nodes.push(obj);
    bot.dunder.openNodes.push(bot.dunder.nodes[bot.dunder.nodes.length - 1]);
    if (bot.dunder.openNodes.length > 1) {
        var current = bot.dunder.openNodes.length - 1;
        var parent = Math.floor((current - 1) / 2);
        while (current > 0 && (bot.dunder.openNodes[parent].fCost + bot.dunder.openNodes[parent].hCost) > (bot.dunder.openNodes[current].fCost + bot.dunder.openNodes[current].hCost)) {
            var storer = bot.dunder.openNodes[current];
            bot.dunder.openNodes[current] = bot.dunder.openNodes[parent];
            bot.dunder.openNodes[parent] = storer;
            current = parent;
            parent = Math.floor((current - 1) / 2);
        }
    }
};

function popHeap(bot, obj) {
    bot.dunder.openNodes.splice(0, 1);
    if (bot.dunder.openNodes.length > 1) {
        bot.dunder.openNodes.unshift(bot.dunder.openNodes[bot.dunder.openNodes.length - 1]);
        bot.dunder.openNodes.splice(bot.dunder.openNodes.length - 1, 1);
    }
  if (bot.dunder.openNodes.length > 0) {
    var current = 0;
    var childLeft = (current * 2) + 1;
    var childRight = (current * 2) + 2;
    var keepGoing = true;
    while (keepGoing) {
        var currentScore = bot.dunder.openNodes[current].fCost + bot.dunder.openNodes[current].hCost;
        var childLeftScore = 9999999999;
        var childRightScore = 9999999999;
        if (bot.dunder.openNodes.length - 1 >= childLeft) {childLeftScore = bot.dunder.openNodes[childLeft].fCost + bot.dunder.openNodes[childLeft].hCost;}
        if (bot.dunder.openNodes.length - 1 >= childRight) {childRightScore = bot.dunder.openNodes[childRight].fCost + bot.dunder.openNodes[childRight].hCost;}
        if (childLeftScore < currentScore || childRightScore < currentScore) {
            var swapMeWith = childLeft;
            if (childLeftScore > childRightScore) {
                swapMeWith = childRight;
            }
            var storer = bot.dunder.openNodes[swapMeWith];
            bot.dunder.openNodes[swapMeWith] = bot.dunder.openNodes[current];
            bot.dunder.openNodes[current] = storer;
            current = swapMeWith;
            childLeft = (current * 2) + 1;
            childRight = (current * 2) + 2;
        } else {
            keepGoing = false;
        }
    }
  }
};



function validNode(bot, node, x, y, z, endX, endY, endZ, type) {
    var waterSwimCost = 4;
    var placeBlockCost = 20;//30
    //var breakBlockCost = 0;//0.045
    var breakBlockCost = 50 / 1000;
    //console.log(attempts);
    var breakBlockCost2 = 10;//0.045
    /*if (attempts > 2000) {
        //breakBlockCost = 10 / 1000;
        breakBlockCost2 = 0;
    }*/
    /*if (y < 0) {
        breakBlockCost /= 4;
    } else if (y < 50) {
        breakBlockCost
    }*/
    //breakBlockCost = 0;
    /*if (botPathfindTimer > 20 * 4) {
        breakBlockCost = 1 / 1000;
        breakBlockCost2 = 0;
        placeBlockCost = 14;
        //console.log("way too long");
    } else if (botPathfindTimer > 20 * 2) {
        breakBlockCost = 3 / 1000;
        breakBlockCost2 = 0;
        placeBlockCost = 17;
        console.log("too long");
    }*/
    if (y <= 60) {
        //breakBlockCost = 0.00035;
        //placeBlockCost = 20;
    } else if (y >= 90) {
        //placeBlockCost = 3;
        //breakBlockCost = 20;
    }
    var ownerNodeUndefined = false;
    var myFCost = 0;
    var legalMove = false;
    var ughType = 0;
    var brokenBlocks = [];
    var brokeBlocks = false;
    var placedBlocks = false;
    var myBlockActions = [];
    var moveType = "walk";

    if (Math.abs(node.x - x) == 1 && Math.abs(node.z - z) == 1 && node.y == y) {//DIAGNOL WALK
        moveType = "walkDiag";
        ughType = 1;
        myFCost = 14;
        if (blockWalk(bot, node.x, y, z) & blockAir(bot, node.x, y + 1, z) |
            blockWalk(bot, x, y, node.z) & blockAir(bot, x, y + 1, node.z) && 
            blockWalk(bot, x, y, z) && blockAir(bot, x, y + 1, z) && 
            blockStand(bot, x, y - 1, z, node)) {legalMove = true;}
        if (legalMove &&
            blockCobweb(bot, node.x, y, z) | blockCobweb(bot, node.x, y + 1, z) |
            blockCobweb(bot, x, y, node.z) | blockCobweb(bot, x, y + 1, node.z)) {
                myFCost += 45;
                //console.log("Semi-Blocked move: " + x + ", " + y + ", " + z);
            }
        /*if (legalMove &&
            blockSolid(bot, node.x, y, z) | blockSolid(bot, node.x, y + 1, z) |
            blockSolid(bot, x, y, node.z) | blockSolid(bot, x, y + 1, node.z)) {
                //myFCost += 35;
                //console.log("Semi-Blocked move: " + x + ", " + y + ", " + z);
            }*/
        if (legalMove && blockLava(bot, node.x, y, z) || blockLava(bot, node.x, y + 1, z) ||
            blockLava(bot, x, y, node.z) || blockLava(bot, x, y + 1, node.z)) {
            legalMove = false;
        }
        if (!legalMove) {
            //validNode(node, x, y + 1, z, endX, endY, endZ);
            var blockWaterCount = blockWater(bot, x, y, z) + blockWater(bot, x, y + 1, z);
            var blockAirCount = blockAir(bot, x, y, z) + blockAir(bot, x, y + 1, z);
            //console.log(blockWaterCount + " : " + blockAirCount);
            if (blockWaterCount == 2 || blockWaterCount == 1 && blockAirCount == 1) {
                legalMove = true;
                if (/*!blockWater(bot, node.x, y, z) && !blockAir(bot, node.x, y, z) ||
                    !blockWater(bot, node.x, y + 1, z) && !blockAir(bot, node.x, y + 1, z) ||
                    !blockWater(bot, x, y, node.z) && !blockAir(bot, x, y, node.z) ||
                    !blockWater(bot, x, y + 1, node.z) && !blockAir(bot, x, y + 1, node.z)*/
                    blockSolid(bot, x, y, node.z) || blockSolid(bot, x, y + 1, node.z) ||
                    blockSolid(bot, node.x, y, z) || blockSolid(bot, node.x, y + 1, z)) {
                    legalMove = false;         
                } else if (pathfinderOptions.sprint && node.moveType == "swimFast" | blockWater(bot, x, y, z) & blockWater(bot, x, y + 1, z)) {
                    moveType = "swimFast";
                } else {
                    moveType = "swimSlow";
                    myFCost += 5;
                    if (blockSolid(bot, x, y + 2, z) || blockSolid(bot, node.x, y + 2, node.z) ||
                        blockSolid(bot, node.x, y + 2, z) || blockSolid(bot, x, y + 2, node.z)) {
                        myFCost += 35;
                    }
                    if (blockWater(bot, x, y + 1, z)) {myFCost *= 2;}
                }
            }
            if (!legalMove) {
                var blockLavaCount = blockLava(bot, x, y, z) + blockLava(bot, x, y + 1, z);
                if (blockLavaCount == 2 || blockLavaCount == 1 && blockAirCount == 1) {
                    legalMove = true;
                    if (!blockLava(bot, node.x, y, z) && !blockWalk(bot, node.x, y, z) ||
                        !blockLava(bot, node.x, y + 1, z) && !blockAir(bot, node.x, y + 1, z) ||
                        !blockLava(bot, x, y, node.z) && !blockWalk(bot, x, y, node.z) ||
                        !blockLava(bot, x, y + 1, node.z) && !blockAir(bot, x, y + 1, node.z)) {
                        legalMove = false;         
                    } else {
                        moveType = "lava";
                        if (node.moveType != "lava") {
                            myFCost += 1000;
                        } else {
                            myFCost += 20;
                        }
                    }
                }
            }
            if (!blockSolid(bot, x, y - 1, z) && !blockSolid(bot, x, y, z)) {
                validNode(bot, node, x, y - 1, z, endX, endY, endZ);
            }
            if (pathfinderOptions.parkour && !legalMove && !blockStand(bot, x, y - 1, z, node) && blockAir(bot, x, y, z)) {//JUMP DIAGNOL
                moveType = "walkDiagJump";
                //parkour move
                var stepDir = {"x":x - node.x, "z":z - node.z};
                if (blockAir(bot, x, y + 1, z) && blockAir(bot, x, y + 2, z)) {
                    //x += stepDir.x;
                    //z += stepDir.z;
                    var checkCount = 0;
                    if (/*!blockStand(bot, x, y - 1, z) ||*/
                        !blockAir(bot, node.x, y + 2, node.z) ||
                        !blockWalk(bot, x, y, z) ||
                        !blockAir(bot, x, y + 1, z) ||
                        !blockAir(bot, x, y + 2, z) ||
                        !blockWalk(bot, x - stepDir.x, y, z) ||
                        !blockAir(bot, x - stepDir.x, y + 1, z) ||
                        !blockAir(bot, x - stepDir.x, y + 2, z) ||
                        !blockWalk(bot, x, y, z - stepDir.z) ||
                        !blockAir(bot, x, y + 1, z - stepDir.z) ||
                        !blockAir(bot, x, y + 2, z - stepDir.z)) {
                        checkCount = 3;
                    }
                    while (!legalMove && checkCount < 2) {
                        checkCount++;
                        x += stepDir.x;
                        z += stepDir.z;
                        if (/*!blockStand(bot, x, y - 1, z) ||*/
                            !blockWalk(bot, x, y, z) ||
                            !blockAir(bot, x, y + 1, z) ||
                            !blockAir(bot, x, y + 2, z) ||
                            !blockWalk(bot, x - stepDir.x, y, z) ||
                            !blockAir(bot, x - stepDir.x, y + 1, z) ||
                            !blockAir(bot, x - stepDir.x, y + 2, z) ||
                            !blockWalk(bot, x, y, z - stepDir.z) ||
                            !blockAir(bot, x, y + 1, z - stepDir.z) ||
                            !blockAir(bot, x, y + 2, z - stepDir.z)) {
                            checkCount += 3;
                            //console.log("boo " + x + ", " + y + ", " + z);
                        } else if (blockStand(bot, x, y - 1, z, node)) {
                            legalMove = true;
                            //console.log("e " + x + ", " + y + ", " + z);
                        }
                        if (checkCount == 1 && !pathfinderOptions.sprint) {checkCount = 3;}
                    }
                }
            }
        }
        

            /*if (!legalMove && moveType != "swimFast" && moveType != "swimSlow" && moveType != "lava") {
                console.log("move by diag");
                validNode(node, x, y + 1, z, endX, endY, endZ);
            }*/
    } else if (Math.abs(node.x - x) == 1 | Math.abs(node.z - z) == 1 && node.y == y) {//STRAIGHT WALK
        moveType = "walk";
        ughType = 2;
        myFCost = 10;
        if (blockWalk(bot, x, y, z) && blockAir(bot, x, y + 1, z) && blockStand(bot, x, y - 1, z, node)) {legalMove = true;}
        var oldX = x;
        var oldZ = z;
        if (!legalMove) {
            validNode(bot, node, x, y + 1, z, endX, endY, endZ);
            moveType = "walkJump";
            //Parkour move
            var stepDir = {"x":x - node.x, "z":z - node.z};
            var blockWaterCount = blockWater(bot, x, y, z) + blockWater(bot, x, y + 1, z);
            var blockAirCount = blockAir(bot, x, y, z) + blockAir(bot, x, y + 1, z);
            if (blockWaterCount == 2 || blockWaterCount == 1 && blockAirCount == 1) {
                legalMove = true;
                if (pathfinderOptions.sprint && node.moveType == "swimFast" | blockWater(bot, x, y, z) & blockWater(bot, x, y + 1, z)) {
                    moveType = "swimFast";
                } else {
                    moveType = "swimSlow";
                    if (blockWater(bot, x, y + 1, z)) {myFCost *= 2;}
                }
            }
            if (!legalMove) {
                var blockLavaCount = blockLava(bot, x, y, z) + blockLava(bot, x, y + 1, z);
                if (blockLavaCount == 2 || blockLavaCount == 1 && blockAirCount == 1) {
                    legalMove = true;
                    moveType = "lava";
                    if (node.moveType != "lava") {
                        myFCost += 1000;
                    } else {
                        myFCost += 20;
                    }
                }
            }
            if (!blockSolid(bot, x, y - 1, z) && !blockSolid(bot, x, y, z)) {
                validNode(bot, node, x, y - 1, z, endX, endY, endZ);
            }
            if (pathfinderOptions.parkour && !legalMove && blockAir(bot, x, y - 1, z) && blockAir(bot, x, y, z)) {
                //validNode(node, x, y - 1, z, endX, endY, endZ);
                var checkCount = 0;
                if (!blockAir(bot, node.x, node.y + 2, node.z) ||
                    !blockAir(bot, x, y, z) && !blockWalk(bot, x, y, z) | !blockAir(bot, x, y + 2, z) ||
                    !blockAir(bot, x, y + 1, z)) {
                    checkCount = 3;
                    //console.log("fail");
                }
                while (!legalMove && checkCount < 3) {
                    checkCount++;
                    x += stepDir.x;
                    z += stepDir.z;
                    if (!blockAir(bot, x, y, z) && !blockWalk(bot, x, y, z) | !blockAir(bot, x, y + 2, z) || !blockAir(bot, x, y + 1, z) || !blockAir(bot, x - stepDir.x, y + 2, z - stepDir.z)) {
                        checkCount += 3;
                    } else if (blockStand(bot, x, y - 1, z, node)) {
                        legalMove = true;
                        //myFCost += checkCount * 8;
                    }
                    if (checkCount == 1 && !pathfinderOptions.sprint) {checkCount = 3;}
                }
            }
        }
        if (!legalMove/* && blockAir(bot, x, y, z) && blockAir(bot, x, y + 1, z)*/) {
            var myExplorer = node;
            var placedBlocksInPast = 0; 
            var brokenBlocksInPast = 0; 
            var exploreCount = 0;
            var pastConforms = {
                "conforms":false,
                "x0":0,
                "x1":0,
                "y0":0,
                "y1":0,
                "z0":0,
                "z1":0,
            };
            if (myExplorer && myExplorer.parent && myExplorer.parent) {
                pastConforms = {
                    "conforms":true,
                    "x0":x - myExplorer.parent.x,
                    "x1":node.x - myExplorer.parent.parent.x,
                    "y0":y - myExplorer.parent.y,
                    "y1":node.y - myExplorer.parent.parent.y,
                    "z0":z - myExplorer.parent.z,
                    "z1":node.z - myExplorer.parent.parent.z,
                };
            }
            while (myExplorer.parent != undefined && exploreCount < 14) {
                if (myExplorer.placedBlocks) {placedBlocksInPast++;}
                if (myExplorer.brokenBlocks) {brokenBlocksInPast++;}
                if (pastConforms.conforms && myExplorer.parent.parent) {
                    if (myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] /*|
                        myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] */|
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] &&
                        myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |
                        /*myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |*/
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))]) {
                        pastConforms.conforms = false;
                        //console.log((((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0)) + ": " + (myExplorer.x - myExplorer.parent.parent.x) + ", " + (myExplorer.y - myExplorer.parent.parent.y) + ", " + (myExplorer.z - myExplorer.parent.parent.z) + ", " + JSON.stringify(pastConforms) + ", doesn't conform");
                    }
                }
                myExplorer = myExplorer.parent;
                if (myExplorer.parent) {
                    if (myExplorer.placedBlocks) {placedBlocksInPast++;}
                    if (myExplorer.brokenBlocks) {brokenBlocksInPast++;}
                    myExplorer = myExplorer.parent;
                }
                exploreCount++;
            }
            //if (placedBlocksInPast >= 5) {placeBlockCost = 4;}
            //if (pastConforms.conforms) {placeBlockCost /= 4;}
            if ((y < 0 || pastConforms.conforms) && brokenBlocksInPast >= 10) {
                breakBlockCost /= 100;
                breakBlockCost2 = 0;
            }
            if (pastConforms.conforms && placedBlocksInPast >= 5) {
                placeBlockCost /= 4;
            }
            x = oldX;
            z = oldZ;
            var inWater = false;
            if (node.moveType == "swimSlow" || node.moveType == "swimFast") {inWater = true;}
            //if (blockSolid(bot, x, y, z)) {console.log(bot.blockAt(new Vec3(x, y, z)).displayName);console.log(bot.blockAt(new Vec3(x, y, z)).digTime(null, false, inWater, inWater, [], {}) * breakBlockCost);}
            //if (blockSolid(bot, x, y + 1, z)) {console.log(bot.blockAt(new Vec3(x, y + 1, z)).displayName);console.log(bot.blockAt(new Vec3(x, y + 1, z)).digTime(null, false, inWater, inWater, [], {}) * breakBlockCost);}
            myFCost += (blockSolid(bot, x, y, z) /*&& !blockWalk(bot, x, y, z)*/) * breakBlockCost * getDigTime(bot, x, y, z, false, true);
            myFCost += (blockSolid(bot, x, y + 1, z)) * breakBlockCost * getDigTime(bot, x, y + 1, z, false, true);
            //breakBlockCost2 *= 2;
            myFCost += (blockSolid(bot, x, y, z) /*&& !blockWalk(bot, x, y, z)*/) * breakBlockCost2;
            myFCost += (blockSolid(bot, x, y + 1, z)) * breakBlockCost2;
            //console.log(myFCost);
            if (!blockWater(bot, x, y, z) && !blockWater(bot, x, y + 1, z) && !blockLava(bot, x, y, z) && !blockLava(bot, x, y + 1, z)) {
                var placeBlockNeeded = (blockStand(bot, x, y - 1, z, node) != true);
                if (placeBlockNeeded) { 
                    myFCost += placeBlockNeeded * placeBlockCost;
                    myBlockActions.push([x, y - 1, z]);
                }
            }
            if (blockSolid(bot, x, y, z) && !blockWalk(bot, x, y, z)) {brokenBlocks.push([x, y, z]);brokeBlocks = true;}
            if (blockSolid(bot, x, y + 1, z)) {brokenBlocks.push([x, y + 1, z]);brokeBlocks = true;}
            legalMove = true;
            if (getDigTime(bot, x, y, z, false, false) == 9999999 || getDigTime(bot, x, y + 1, z, false, false) == 9999999) {legalMove = false;}
            moveType = "walk";
            if (pathfinderOptions.sprint && blockWater(bot, x, y, z) && blockWater(bot, x, y + 1, z)) {
                moveType = "swimFast";
            } else if (blockWater(bot, x, y, z) || blockWater(bot, x, y + 1, z)) {
                moveType = "swimSlow";
                if (blockWater(bot, x, y + 1, z)) {myFCost += 35;}
            } else if (blockLava(bot, x, y, z) || blockLava(bot, x, y + 1, z)) {
                //console.log("THIS IS LAVA YEAH " + myFCost);
                if (node.moveType != "lava" && node.moveType != "fallLava") {
                    myFCost += 1000;
                } else {
                    myFCost += 20;
                }
                moveType = "lava";
            }
        }
        //if (legalMove && x == 57 | x == 58 && z == -90) {console.log(x + ", " + y + ", " + z + ", " + moveType + ", " + myFCost);}
    } else if (false && Math.abs(node.x - x) == 1 && Math.abs(node.z - z) == 1 && node.y + 1 == y) {//JUMP DIAGNOL
        ughType = 3;
        moveType = "walkJump";
        myFCost = 14;
        if (blockAir(bot, x, y, z) &&
            blockAir(bot, x, y + 1, z) &&
            blockStand(bot, x, y - 1, z, node) &&
            blockAir(bot, node.x, y, node.z) &&
            blockAir(bot, node.x, y + 1, node.z) &&
            (blockAir(bot, node.x, y, z) || blockAir(bot, node.x, y + 1, z)) &&/*| used for allowing jumps diagnol blocks in the way*/
            blockAir(bot, x, y, node.z) && blockAir(bot, x, y + 1, node.z)) {legalMove = true;}
        
        /*if (!legalMove) {
            if (isBlock(bot, x, y - 1, z) != 1 && isBlock(bot, x, y, z) != 1) {//JUMP DIAGNOL
                //parkour move
                var stepDir = {"x":x - node.x, "z":z - node.z};
                if (isBlock(bot, x, y - 1, z) != 1 && isBlock(bot, x, y, z) != 1) {
                    //x += stepDir.x;
                    //z += stepDir.z;
                    var checkCount = 0;
                    if (isBlock(bot, node.x, node.y + 2, node.z) != 0 ||
                        isBlock(bot, x, y, z) != 0 ||
                        isBlock(bot, x, y + 1, z) != 0 ||
                        isBlock(bot, x - stepDir.x, y, z) != 0 ||
                        isBlock(bot, x - stepDir.x, y + 1, z) != 0 ||
                        isBlock(bot, x - stepDir.x, y + 2, z) != 0 ||
                        isBlock(bot, x, y, z - stepDir.z) != 0 ||
                        isBlock(bot, x, y + 1, z - stepDir.z) != 0 ||
                        isBlock(bot, x, y + 2, z - stepDir.z) != 0) {
                        checkCount = 3;
                    }
                    while (!legalMove && checkCount < 1) {
                        checkCount++;
                        x += stepDir.x;
                        z += stepDir.z;
                        if (isBlock(bot, x, y, z) != 0 || isBlock(bot, x, y + 1, z) != 0 ||
                            isBlock(bot, x - stepDir.x, y + 2, z - stepDir.z) != 0 ||
                            isBlock(bot, x - stepDir.x, y, z) != 0 ||
                            isBlock(bot, x - stepDir.x, y + 1, z) != 0 ||
                            isBlock(bot, x - stepDir.x, y + 2, z) != 0 ||
                            isBlock(bot, x, y, z - stepDir.z) != 0 ||
                            isBlock(bot, x, y + 1, z - stepDir.z) != 0 ||
                            isBlock(bot, x, y + 2, z - stepDir.z) != 0) {
                            checkCount += 3;
                            //console.log("boo " + x + ", " + y + ", " + z);
                        } else if (isBlock(bot, x, y - 1, z) == 1) {
                            legalMove = true;
                            //console.log("e " + x + ", " + y + ", " + z);
                        }
                    }
                }
            }
        }*/
    } else if (Math.abs(node.x - x) == 1 | Math.abs(node.z - z) == 1 && node.y + 1 == y) {//JUMP STRAIGHT
        moveType = "walkJump";
        ughType = 4;  
        myFCost = 10;
        if (blockWalk(bot, x, y, z) &&
            blockAir(bot, x, y + 1, z) &&
            blockStand(bot, x, y - 1, z, node) &&
            blockAir(bot, node.x, node.y + 1, node.z) &&
            blockAir(bot, node.x, node.y + 2, node.z)) {legalMove = true;}
            //Parkour move
            var stepDir = {"x":x - node.x, "z":z - node.z};

            var blockWaterCount = blockWater(bot, x, y, z) + blockWater(bot, x, y + 1, z);
            var blockAirCount = blockAir(bot, x, y, z) + blockAir(bot, x, y + 1, z);

            if (blockWaterCount == 2 | blockWaterCount == 1 & blockAirCount == 1 &&
                !blockSolid(bot, node.x, y, node.z) &&
                !blockSolid(bot, node.x, y + 1, node.z)) {
                if (blockSolid(bot, x, y, z) || blockSolid(bot, x, y, z)) {
                    legalMove = false;
                } else {
                    legalMove = true;
                    if (pathfinderOptions.sprint && node.moveType == "swimFast" | blockWater(bot, x, y, z) & blockWater(bot, x, y + 1, z)) {
                        moveType = "swimFast";
                    } else {
                        moveType = "swimSlow";
                        if (blockWater(bot, x, y + 1, z)) {myFCost *= 2;}
                    }
                }
            }
            var blockLavaCount = 0;
            if (!legalMove) {
                blockLavaCount = blockLava(bot, x, y, z) + blockLava(bot, x, y + 1, z);
                if (blockLavaCount == 2 || blockLavaCount == 1 && blockAirCount == 1) {
                    if (!blockSolid(bot, node.x, y, node.z) &&
                        !blockSolid(bot, node.x, y + 1, node.z)) {
                        legalMove = true;
                    }
                    moveType = "lava";
                    if (node.moveType != "lava") {
                        myFCost += 1000;
                    } else {
                        myFCost += 20;
                    }
                }
            }
            //if (blockSolid(bot, node.x, y, node.z) || blockSolid(bot, node.x, y + 1, node.z)) {
                //legalMove = false;
            //}

            var oldX = x;
            var oldZ = z;
            if (pathfinderOptions.parkour && !legalMove && blockAir(bot, x, y - 1, z) && blockAir(bot, x, y, z)) {
                //parkour move
                var stepDir = {"x":x - node.x, "z":z - node.z};
                var checkCount = 0;
                /*if (blockStand(bot, x, y - 1, z, node)) {
                    myFCost += (blockSolid(bot, x, y, z)) * breakBlockCost;
                    myFCost += (blockSolid(bot, x, y + 1, z)) * breakBlockCost;
                    myFCost += (blockAir(bot, node.x, node.y + 2, node.z)) * breakBlockCost;
                    if (blockSolid(bot, x, y, z)) {brokenBlocks.push([x, y, z]);}
                    if (blockSolid(bot, x, y + 1, z)) {brokenBlocks.push([x, y + 1, z]);}
                    if (blockSolid(bot, node.x, node.y + 2, node.z)) {brokenBlocks.push([node.x, node.y + 2, node.z]);}
                    legalMove = true;
                    moveType = "walkJump";
                } else */if (blockSolid(bot, node.x, node.y + 2, node.z) ||
                    blockSolid(bot, x, y, z) ||
                    blockSolid(bot, x, y + 1, z)) {
                    checkCount = 3;
                }
                while (!legalMove && checkCount < 2) {
                    checkCount++;
                    x += stepDir.x;
                    z += stepDir.z;
                    if (blockSolid(bot, x, y, z) || blockSolid(bot, x, y + 1, z) ||
                        blockSolid(bot, x - stepDir.x, y + 2, z - stepDir.z)) {
                        checkCount += 3;
                        //console.log("boo " + x + ", " + y + ", " + z);
                    } else if (blockStand(bot, x, y - 1, z, node)) {
                        legalMove = true;
                        moveType = "walkJump";
                    }
                }
                if (!legalMove) {
                    x = oldX;
                    z = oldZ;
                }
            }
        if (!legalMove && blockStand(bot, x, y - 1, z, node) | blockLavaCount > 0 | blockWaterCount > 0) {
            var inWater = false;
            if (node.moveType == "swimSlow" || node.moveType == "swimFast") {inWater = true;}
            //if (blockSolid(bot, x, y, z)) {console.log(bot.blockAt(new Vec3(x, y, z)).displayName);console.log(bot.blockAt(new Vec3(x, y, z)).digTime(null, false, inWater, inWater, [], {}) * breakBlockCost);}
            //if (blockSolid(bot, x, y + 1, z)) {console.log(bot.blockAt(new Vec3(x, y + 1, z)).displayName);console.log(bot.blockAt(new Vec3(x, y + 1, z)).digTime(null, false, inWater, inWater, [], {}) * breakBlockCost);}
            var myExplorer = node;
            var brokenBlocksInPast = 0; 
            var exploreCount = 0;
            var pastConforms = {
                "conforms":false,
                "x0":0,
                "x1":0,
                "y0":0,
                "y1":0,
                "z0":0,
                "z1":0,
            };
            if (myExplorer && myExplorer.parent) {
                pastConforms = {
                    "conforms":true,
                    "x0":x - myExplorer.parent.x,
                    "x1":node.x - myExplorer.parent.parent.x,
                    "y0":y - myExplorer.parent.y,
                    "y1":node.y - myExplorer.parent.parent.y,
                    "z0":z - myExplorer.parent.z,
                    "z1":node.z - myExplorer.parent.parent.z,
                };
            }
            while (myExplorer.parent != undefined && exploreCount < 6) {
                if (myExplorer.brokenBlocks) {brokenBlocksInPast++;}
                if (pastConforms.conforms && myExplorer.parent.parent) {
                    if (myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] |
                        myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] |
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] &&
                        myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |
                        myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))]) {
                        pastConforms.conforms = false;
                    }
                }
                myExplorer = myExplorer.parent;
                exploreCount++;
            }
            //if (brokenBlocksInPast >= 5) {breakBlockCost /= 2;}
            if ((y < 0 || pastConforms.conforms) && brokenBlocksInPast >= 5) {
                breakBlockCost /= 50;
                breakBlockCost2 = 0;
            }
            myFCost += (blockSolid(bot, x, y, z) && !blockWalk(bot, x, y, z)) * breakBlockCost * getDigTime(bot, x, y, z, false, true);
            myFCost += (blockSolid(bot, x, y + 1, z)) * breakBlockCost * getDigTime(bot, x, y + 1, z, false, true);
            myFCost += (blockSolid(bot, node.x, node.y + 2, node.z)) * breakBlockCost * getDigTime(bot, node.x, node.y + 2, node.z, false, true);

            myFCost += (blockSolid(bot, x, y, z) && !blockWalk(bot, x, y, z)) * breakBlockCost2;
            myFCost += (blockSolid(bot, x, y + 1, z)) * breakBlockCost2;
            myFCost += (blockSolid(bot, node.x, node.y + 2, node.z)) * breakBlockCost2;

            if (!blockWater(bot, x, y, z) && !blockWater(bot, x, y + 1, z) && !blockLava(bot, x, y, z) && !blockLava(bot, x, y + 1, z)) {
                var placeBlockNeeded = (blockStand(bot, x, y - 1, z, node) != true);
                if (placeBlockNeeded) {
                    myFCost += placeBlockNeeded * placeBlockCost;
                    myBlockActions.push([x, y - 1, z]);
                }
            }
            if (blockSolid(bot, x, y, z) && !blockWalk(bot, x, y, z)) {brokenBlocks.push([x, y, z]);brokeBlocks = true;}
            if (blockSolid(bot, x, y + 1, z)) {brokenBlocks.push([x, y + 1, z]);brokeBlocks = true;}
            if (blockSolid(bot, node.x, node.y + 2, node.z)) {brokenBlocks.push([node.x, node.y + 2, node.z]);brokeBlocks = true;}
            legalMove = true;
            if (getDigTime(bot, node.x, node.y + 2, node.z, false, false) == 9999999 || getDigTime(bot, x, y, z, false, false) == 9999999 || getDigTime(bot, x, y + 1, z, false, false) == 9999999) {legalMove = false;}
            moveType = "walkJump";
            if (pathfinderOptions.sprint && blockWater(bot, x, y, z) && blockWater(bot, x, y + 1, z)) {
                moveType = "swimFast";
            } else if (blockWater(bot, x, y, z) || blockWater(bot, x, y + 1, z)) {
                moveType = "swimSlow";
                if (blockWater(bot, x, y + 1, z)) {myFCost += 35;}
            } else if (blockLava(bot, x, y, z) || blockLava(bot, x, y + 1, z)) {
                //console.log("THIS IS LAVA YEAH " + myFCost);
                if (node.moveType != "lava" && node.moveType != "fallLava") {
                    myFCost += 1000;
                } else {
                    myFCost += 20;
                }
                moveType = "lava";
            }
        }
        if (legalMove && x == 57 | x == 58 && z == -90) {console.log(x + ", " + y + ", " + z + ", " + moveType + ", " + myFCost);}
    } else if (Math.abs(node.x - x) == 1 && Math.abs(node.z - z) == 1 && node.y - 1 == y) {//FALL DIAGNOL
        //console.log("fall diagnol " + x + ", " + y + ", " + z);
        ughType = 5;
        myFCost = 14;
        moveType = "fall";
        if (!blockSolid(bot, x, y, z) &&
            !blockSolid(bot, x, y + 1, z) &&
            !blockSolid(bot, x, y + 2, z) &&
            !blockSolid(bot, node.x, y + 2, z) & blockWalk(bot, node.x, y + 1, z, false, true, true) |
            !blockSolid(bot, x, y + 2, node.z) & blockWalk(bot, x, y + 1, node.z, false, true, true)) {
            var oldY = y;
            var failed = false;
            var attempts = 0;
            while (y > pathfinderOptions.lowestY && y > oldY - pathfinderOptions.maxFall & !pathfinderOptions.canClutch | y > oldY - pathfinderOptions.maxFallClutch & pathfinderOptions.canClutch && !legalMove && !failed) {
                attempts++;
                if (blockStand(bot, x, y - 1, z, node) || blockWater(bot, x, y, z) || blockLava(bot, x, y, z)) {
                    legalMove = true;
                    if (blockWater(bot, x, y, z)) {
                        myFCost += waterSwimCost + 0.1;
                        if (node.moveType != "swimSlow" && node.moveType != "swimFast" && node.moveType != "fallWater") {
                            moveType = "fallWater";
                        } else if (blockWater(bot, x, y + 1, z)) {
                            moveType = "swimFast";
                        } else {
                            moveType = "swimSlow";
                        }
                    } else if (blockLava(bot, x, y, z)) {
                        if (node.moveType != "lava" && node.moveType != "fallLava") {
                            myFCost += 1000;
                            moveType = "fallLava";
                        } else {
                            myFCost += 24;
                            moveType = "lava";
                        }
                    }
                } else if (!blockSolid(bot, x, y - 1, z)) {
                    y--;
                } else {
                    failed = true;
                }
            }
            if (moveType != "fallLava" && moveType != "lava" &&
                blockLava(bot, x, y, z) |
                blockLava(bot, x, y + 1, z) |
                blockLava(bot, x, y + 2, z) |
                blockLava(bot, node.x, y + 2, z) | blockLava(bot, node.x, y + 1, z) |
                blockLava(bot, x, y + 2, node.z) | blockLava(bot, x, y + 1, node.z)) {
                legalMove = false;
            }
            //console.log("legal fall " + isBlock(bot, x, y - 1, z)).displayName);
        }
    } else if (Math.abs(node.x - x) == 1 | Math.abs(node.z - z) == 1 && node.y - 1 == y) {//FALL STRAIGHT
        var inWater = false;
        ughType = 6;
        myFCost = 10;
        moveType = "fall";
        if (!blockSolid(bot, x, y, z) &&
            !blockSolid(bot, x, y + 1, z) &&
            !blockSolid(bot, x, y + 2, z)) {
            var oldY = y;
            var failed = false;
            var attempts = 0;
            while (y > pathfinderOptions.lowestY && y > oldY - pathfinderOptions.maxFall & !pathfinderOptions.canClutch | y > oldY - pathfinderOptions.maxFallClutch & pathfinderOptions.canClutch && !legalMove && !failed) {
                attempts++;
                if (blockStand(bot, x, y - 1, z, node) || blockWater(bot, x, y, z) || blockWater(bot, x, y + 1, z) || blockLava(bot, x, y, z)) {
                    legalMove = true;
                    if (blockWater(bot, x, y, z)) {
                        myFCost += waterSwimCost + 0.1;
                        if (node.moveType != "swimSlow" && node.moveType != "swimFast" && node.moveType != "fallWater") {
                            moveType = "fallWater";
                        } else if (blockWater(bot, x, y + 1, z)) {
                            moveType = "swimFast";
                        } else {
                            moveType = "swimSlow";
                        }
                        inWater = true;
                    } else if (blockLava(bot, x, y, z)) {
                        if (node.moveType != "lava" && node.moveType != "fallLava") {
                            myFCost += 1000;
                            moveType = "fallLava";
                        } else {
                            myFCost += 24;
                            moveType = "lava";
                        }
                    }
                } else if (!blockSolid(bot, x, y - 1, z)) {
                    y--;
                } else {
                    failed = true;
                }
            }
            if (moveType != "fallLava" && moveType != "lava" &&
                blockLava(bot, x, y, z) |
                blockLava(bot, x, y + 1, z) |
                blockLava(bot, x, y + 2, z)) {
                legalMove = false;
            }
            if (y != oldY && pathfinderOptions.parkour) {
                validNode(bot, node, x, oldY - 1, z, endX, endY, endZ);
            } 
            if (!legalMove) {
                y = oldY;
            }
            if (blockSolid(bot, x, oldY, z)) {
                blocksBroken = true;
                myFCost += getDigTime(bot, x, oldY, z, false, true) * breakBlockCost;
                myFCost += breakBlockCost2;
                brokenBlocks.push([x, oldY, z]);
            }
            //console.log("legal fall " + isBlock(bot, x, y - 1, z)).displayName);
            //if (getDigTime(bot, x, y, z, false, false) == 9999999 || getDigTime(bot, x, y + 1, z, false, false) == 9999999) {legalMove = false;}
        }
    } else if (Math.abs(node.x - x) == 1 | Math.abs(node.z - z) == 1 && node.y - 2 == y) {//FALL STRAIGHT JUMP
        ughType = 6;
        myFCost = 11;
        moveType = "walkJump";
        y++;
        var stepDir = {"x":x - node.x, "z":z - node.z};
        x += (x - node.x);
        z += (z - node.z);
            if (blockStand(bot, x, y - 1, z, node) || blockWater(bot, x, y, z) || blockLava(bot, x, y, z)) {
                legalMove = true;
                if (blockLava(bot, x, y, z)) {
                    if (node.moveType != "lava" && node.moveType != "fallLava") {
                        myFCost += 1000;
                        moveType = "fallLava";
                    } else {
                        legalMove = false;
                    }
                }
            } else {
                failed = true;
            }
            if (moveType != "fallLava" && moveType != "lava" &&
                blockLava(bot, x, y, z) |
                blockLava(bot, x, y + 1, z) |
                blockLava(bot, x, y + 2, z)) {
                legalMove = false;
            }
            if (!legalMove && blockAir(bot, x, y - 1, z) && blockAir(bot, x, y, z)) {
                //parkour move
                var oldX = x;
                var oldZ = z;
                var checkCount = 0;
                if (blockSolid(bot, node.x, node.y + 2, node.z) ||
                    blockSolid(bot, x, y, z) ||
                    blockSolid(bot, x, y + 1, z)) {
                    checkCount = 3;
                }
                while (!legalMove && checkCount < 2) {
                    checkCount++;
                    x += stepDir.x;
                    z += stepDir.z;
                    if (blockSolid(bot, x, y, z) || blockSolid(bot, x, y + 1, z) ||
                        blockSolid(bot, x - stepDir.x, y + 2, z - stepDir.z) ||
                        blockSolid(bot, x - stepDir.x, y + 3, z - stepDir.z)) {
                        checkCount += 3;
                        //console.log("boo " + x + ", " + y + ", " + z);
                    } else if (blockStand(bot, x, y - 1, z, node)) {
                        legalMove = true;
                        moveType = "walkJump";
                    }
                }
                if (!legalMove) {
                    x = oldX;
                    z = oldZ;
                }
            }
            if (getDigTime(bot, x, y, z, false, false) == 9999999 || getDigTime(bot, x, y + 1, z, false, false) == 9999999) {legalMove = false;}
        //console.log(legalMove + " oppertune " + x + ", " + y + ", " + z);
    } else if (Math.abs(node.x - x) == 0 && Math.abs(node.z - z) == 0 && node.y - 1 == y) {//JUST FALL
        ughType = 7;
        myFCost = 10;
        var inWater = false;
        moveType = "fall";
        //console.log("straight fall");
        if (node.moveType == "swimFast") {inWater = true;}
            var myExplorer = node;
            var brokenBlocksInPast = 0; 
            var exploreCount = 0;
            var pastConforms = {
                "conforms":false,
                "x0":0,
                "x1":0,
                "y0":0,
                "y1":0,
                "z0":0,
                "z1":0,
            };
            if (myExplorer && myExplorer.parent) {
                pastConforms = {
                    "conforms":true,
                    "x0":x - myExplorer.parent.x,
                    "x1":node.x - myExplorer.parent.parent.x,
                    "y0":y - myExplorer.parent.y,
                    "y1":node.y - myExplorer.parent.parent.y,
                    "z0":z - myExplorer.parent.z,
                    "z1":node.z - myExplorer.parent.parent.z,
                };
            }
            while (myExplorer.parent != undefined && exploreCount < 7) {
                if (myExplorer.brokenBlocks) {brokenBlocksInPast++;}
                if (pastConforms.conforms && myExplorer.parent.parent) {
                    if (myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] |
                        /*myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] |*/
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] &&
                        myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |
                        /*myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |*/
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))]) {
                        pastConforms.conforms = false;
                    }
                }
                myExplorer = myExplorer.parent;
                exploreCount++;
            }
            //if (brokenBlocksInPast >= 5) {breakBlockCost /= 5;}
            if ((y < 0 || pastConforms.conforms) && brokenBlocksInPast >= 5) {
                breakBlockCost /= 50;
                breakBlockCost2 = 0;
            }
        if (blockSolid(bot, x, y, z)) {
            brokeBlocks = true;
            myFCost += getDigTime(bot, x, y, z, false, true) * breakBlockCost;
            myFCost += breakBlockCost2;
            //console.log("bbc , mfc : " + breakBlockCost + ", " + myFCost + "\t" + pastConforms.conforms);
            brokenBlocks.push([x, y, z]);
        }
        //if (true) {
            var oldY = y;
            var failed = false;
            var attempts = 0;
            if (myFCost == 9999999) {
                legalMove = false;
                failed = true;
                console.log("e");
            } else {
                //myFCost += 3;
            }
            while (y > pathfinderOptions.lowestY && y > oldY - pathfinderOptions.maxFall & !pathfinderOptions.canClutch | y > oldY - pathfinderOptions.maxFallClutch & pathfinderOptions.canClutch && !legalMove && !failed) {
                attempts++;
                if (blockStand(bot, x, y - 1, z, node) || blockWater(bot, x, y, z) || blockLava(bot, x, y, z)) {
                    legalMove = true;
                    if (blockWater(bot, x, y, z)) {
                        myFCost += waterSwimCost + 0.1;
                        if (node.moveType != "swimSlow" && node.moveType != "swimFast" && node.moveType != "fallWater") {
                            moveType = "fallWater";
                        } else if (blockWater(bot, x, y + 1, z)) {
                            moveType = "swimFast";
                        } else {
                            moveType = "swimSlow";
                        }
                    } else if (blockLava(bot, x, y, z)) {
                        if (node.moveType != "lava" && node.moveType != "fallLava") {
                            myFCost += 1200;
                            moveType = "fallLava";
                        } else {
                            myFCost += 20;
                            moveType = "lava";
                        }
                    }
                } else if (!blockSolid(bot, x, y - 1, z)) {
                    y--;
                } else {
                    failed = true;
                }
            }
        //}
        //if (legalMove && x == 57 | x == 58 && z == -90) {console.log(x + ", " + y + ", " + z + ", " + moveType + ", " + myFCost);}
            if (getDigTime(bot, x, y, z, false, false) == 9999999) {legalMove = false;}
    } else if (node.x - x == 0 && node.z - z == 0 && node.y + 1 == y) {//Just Jump
            var myExplorer = node;
            var placedBlocksInPast = 0;
            var brokenBlocksInPast = 0; 
            var exploreCount = 0;
            var pastConforms = {
                "conforms":false,
                "x0":0,
                "x1":0,
                "y0":0,
                "y1":0,
                "z0":0,
                "z1":0,
            };
            if (myExplorer && myExplorer.parent) {
                pastConforms = {
                    "conforms":true,
                    "x0":x - myExplorer.parent.x,
                    "x1":node.x - myExplorer.parent.parent.x,
                    "y0":y - myExplorer.parent.y,
                    "y1":node.y - myExplorer.parent.parent.y,
                    "z0":z - myExplorer.parent.z,
                    "z1":node.z - myExplorer.parent.parent.z,
                };
            }
            while (myExplorer.parent != undefined && exploreCount < 7) {
                if (myExplorer.placedBlocks) {placedBlocksInPast++;}
                if (myExplorer.brokenBlocks) {brokenBlocksInPast++;}
                if (pastConforms.conforms && myExplorer.parent.parent) {
                    if (myExplorer.moveType != "goUp" || myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] |
                        /*myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] |*/
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 1 : 0))] &&
                        myExplorer.x - myExplorer.parent.parent.x != pastConforms[("x" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |
                        /*myExplorer.y - myExplorer.parent.parent.y != pastConforms[("y" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))] |*/
                        myExplorer.z - myExplorer.parent.parent.z != pastConforms[("z" + ((Math.floor(exploreCount) == Math.floor(exploreCount / 2) * 2) ? 0 : 1))]) {
                        pastConforms.conforms = false;
                    }
                }
                myExplorer = myExplorer.parent;
                exploreCount++;
            }
            //if (placedBlocksInPast >= 5) {placeBlockCost = 4;}
            if ((y < 0 || pastConforms.conforms) && brokenBlocksInPast >= 5) {
                breakBlockCost /= 100;
                breakBlockCost2 = 0;
            }
            if (pastConforms.conforms && placedBlocksInPast >= 5) {
                placeBlockCost /= 4;
            }

        myFCost = 5;
        moveType = "goUp";
        var inWater = false;
        if (blockLava(bot, x, y, z) | blockLava(bot, x, y + 1, z)) {
            if (node.moveType != "lava" && node.moveType != "fallLava") {
                myFCost += 1000;
                moveType = "fallLava";
            } else {
                myFCost += 20;
                moveType = "lava";
            }
        } else if (blockWater(bot, x, y, z) | blockWater(bot, x, y + 1, z)) {
            myFCost += waterSwimCost;
            if (blockWater(bot, x, y + 1, z)) {
                moveType = "swimFast";
            } else {
                moveType = "swimSlow";
            }
            inWater = true;
        } else {
            myFCost += placeBlockCost;
            myBlockActions.push([x, y - 1, z]);
        }
        if (blockSolid(bot, x, y + 1, z)) {
            blocksBroken = true;
            myFCost += getDigTime(bot, x, y, z, false, true) * breakBlockCost;
            //console.log(myFCost);
            myFCost += breakBlockCost2;
            brokenBlocks.push([x, y + 1, z]);
        }
        legalMove = true;
        if (getDigTime(bot, x, y + 1, z, false, false) == 9999999 || moveType == "goUp" && node && (node.moveType == "swimFast" || node.moveType == "swimSlow")) {legalMove = false;console.log("asdf");}
        //console.log("goUp " + myFCost);
    }
    var distToGoal = 0;
    if (endZ != undefined) {
        //distToGoal = dist3d(x, y, z, endX, endY, endZ) * (3);
        //distToGoal = dist3d(x, y, z, endX, endY, endZ) * (25);//DEFAULT
        //distToGoal = dist3d(x, 0, z, endX, 0, endZ) * (25) + dist3d(0, y, 0, 0, endY, 0) * (10);
        distToGoal = dist3d(x, 0, z, endX, 0, endZ) * (25);//Optimized?
        if (distToGoal / 25 < 100) {
            distToGoal += dist3d(0, y, 0, 0, endY, 0) * (18);
        } else {
            distToGoal += 4608;
        }
        //distToGoal = dist3d(x, 0, z, endX, 0, endZ) * (10);
        //distToGoal += Math.abs(y - endY) * 10;
        //distToGoal += dist3d(0, y, 0, 0, endY, 0) * (10);
    } else {
        distToGoal = dist3d(x, 0, z, endX, 0, endY) * (25);
    }
    if (bot.dunder.nodes3d[y] == undefined || bot.dunder.nodes3d[y][z] == undefined || bot.dunder.nodes3d[y][z][x] == undefined) {
        ownerNodeUndefined = true;
    } else if (node.fCost + myFCost + distToGoal < bot.dunder.nodes3d[y][z][x].fCost + bot.dunder.nodes3d[y][z][x].hCost) {
        ownerNodeUndefined = true;
    }
    if (legalMove && ownerNodeUndefined) {
        addNode(bot, node, myFCost, distToGoal, x, y, z, moveType, brokenBlocks, brokeBlocks, placedBlocks, myBlockActions);
        //console.log("D: " + Math.floor(distToGoal) + ", F: " + myFCost + ", M: " + moveType + ", XYZ: " + x + " " + y + " " + z);
    } else {
        //console.log("X: " + x + ", Y: " + y + ", Z: " + z + ", D: " + dist3d(x, y, z, endX, endY, endZ) * 10);
    }
    
};
//movesToGo = [];

var bestNodeIndex = 0;
function findPath(bot, maxAttemptCount, endX, endY, endZ, correction, extension) {
    bot.dunder.maxAttempts = maxAttemptCount;
    if (bot.dunder.movesToGo.length == 0) {extension = false;}
    if (endY == "no") {
        endY = endZ;
        endZ = undefined;
    }
    var leColumns = bot.world.getColumns();
    chunkColumns = [];
    for (var i = 0; i < leColumns.length; i++) {
        if (!chunkColumns[leColumns[i].chunkZ]) {
            chunkColumns[leColumns[i].chunkZ] = [];
        }
        chunkColumns[leColumns[i].chunkZ][leColumns[i].chunkX] = true;
    }
    //console.log("BEFORE: " + JSON.stringify(bot.dunder.lastPos) + ", " + JSON.stringify(bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]) + ", length: " + bot.dunder.movesToGo.length);
    bot.clearControlStates();
    //var currentMovePos = {"x":bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x,"y":bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y,"z":bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z};
    var movesToGoLength = bot.dunder.movesToGo.length;
    if (!extension) {
        bot.dunder.lastPos = {"currentMove":0,"x":Math.floor(bot.entity.position.x), "y":Math.floor(bot.entity.position.y), "z":Math.floor(bot.entity.position.z), "mType":"start"};
    }
    if (!correction && !extension) {
        bot.dunder.nodes = [];
        bot.dunder.nodes3d = [];
        bot.dunder.openNodes = [];
        bot.dunder.movesToGo = [];
    } else if (correction) {
        bot.dunder.nodes = [];
        bot.dunder.nodes3d = [];
        bot.dunder.openNodes = [];
        var bestOne = [0, 10000];
        for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
            if (dist3d(bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z, Math.round(bot.entity.position.x), Math.floor(bot.entity.position.y - 1), Math.round(bot.entity.position.z)) < bestOne[1]) {
                bestOne = [i, dist3d(bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z, Math.round(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.round(bot.entity.position.z))];
            }
        }
        if (bestOne[0] + 1 < bot.dunder.movesToGo.length) {
            bot.dunder.movesToGo.splice(bestOne[0] + 1, bot.dunder.movesToGo.length);
        }
        endX = bot.dunder.movesToGo[bestOne[0]].x;
        endY = bot.dunder.movesToGo[bestOne[0]].y;
        endZ = bot.dunder.movesToGo[bestOne[0]].z;
        console.log("endPos: " + bot.dunder.movesToGo[bestOne[0]]);
    } else if (extension) {
        //if (bot.dunder.maxAttempts == 500) {
            bot.dunder.nodes = [];
            bot.dunder.openNodes = [];
            bot.dunder.nodes3d = [];
        //}
        var bestOne = [0, 100000];
        for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
            if (dist3d(bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z, endX, endY, endZ) < bestOne[1]) {
                bestOne = [i, dist3d(bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z, endX, endY, endZ)];
            }
        }
        //var bestOne = [0, dist3d(bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].x, bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].y, bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].z, endX, endY, endZ)];
        bestOne[0] += 10;
        if (bestOne[0] > bot.dunder.movesToGo.length - 6) {bestOne[0] = bot.dunder.movesToGo.length - 6;}
        if (bestOne[0] >= 0) {
            bot.dunder.lastPos.currentMove -= (bestOne[0] + 1);
            bot.dunder.movesToGo.splice(0, bestOne[0] + 1);
        }
        /*if (bot.dunder.movesToGo.length < 10) {
            bot.dunder.movesToGo = [];
            console.log(bot.dunder.movesToGo.length);
            bot.dunder.lastPos = {"currentMove":0,"x":Math.floor(bot.entity.position.x), "y":Math.floor(bot.entity.position.y), "z":Math.floor(bot.entity.position.z), "mType":};
            extension = false;
        }*/
     } /*else if (extension) {
        bot.dunder.nodes = [];
        bot.dunder.openNodes = [];
        bot.dunder.nodes3d = [];
        var bestOne = [0, 10000];
        for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
            if (dist3d(bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z, endX, endY, endZ) < bestOne[1]) {
                bestOne = [i, dist3d(bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z, endX, endY, endZ)];
            }
        }
        if (bestOne[0] += 7) {
            if (bestOne[0] > bot.dunder.movesToGo.length - 1) {bestOne[0] = bot.dunder.movesToGo.length - 1;}
        }
        bot.dunder.movesToGo.splice(0, bestOne[0] + 1);
        var foundCurrentMove = false;
        if (bot.dunder.movesToGo.length - 1 < bot.dunder.lastPos.currentMove && bot.dunder.lastPos.currentMove) {
            console.log(bot.dunder.lastPos.currentMove);
            for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
                if (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove] &&
                    bot.dunder.movesToGo[i].x == bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x &&
                    bot.dunder.movesToGo[i].y == bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y &&
                    bot.dunder.movesToGo[i].z == bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z) {
                    bot.dunder.lastPos.currentMove = i;
                    foundCurrentMove = true;
                }
            }
        }
        if (!foundCurrentMove) {
            //bot.dunder.lastPos.currentMove -= Math.abs(bot.dunder.movesToGo.length - movesToGoLength);
            bot.dunder.lastPos.currentMove = bot.dunder.movesToGo.length - 1;
            if (bot.dunder.lastPos.currentMove < 0) {bot.dunder.lastPos.currentMove = 0;}
        }
        console.log("lastPos found: " + foundCurrentMove + ", " + bot.dunder.lastPos.currentMove);
        //endX = bot.dunder.movesToGo[bestOne[0]].x;
        //endY = bot.dunder.movesToGo[bestOne[0]].y;
        //endZ = bot.dunder.movesToGo[bestOne[0]].z;
        //console.log(bot.dunder.movesToGo[bestOne[0]]);
    }*/

    var foundPath = false;
    if (!extension || bot.dunder.movesToGo.length == 0) {
        addNode(bot, false, 0, 0, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z), "start", [], false, false, []);
    } else if (bot.dunder.movesToGo.length > 0) {
        console.log("x: " + bot.dunder.movesToGo[0].x + ", y: " + bot.dunder.movesToGo[0].y + ", z: " + bot.dunder.movesToGo[0].z + " " + bot.dunder.movesToGo.length)
        addNode(bot, false, 0, 0, bot.dunder.movesToGo[0].x, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z, "start", [], false, false, []);
    }
    var attempts = 0;
    var maxAttempts = 0;
    var bestNode = bot.dunder.nodes[0];
    //console.log(bestNode.blockActions);
    bot.dunder.findingPath = setInterval(function() {
    bestNodeIndex = 0;
    //console.log("searching...");
    bot.dunder.searchingPath = 10;
    if (!extension) {
        bot.dunder.destinationTimer = 30;
    }
    moveTimer = 10;
    var performanceStop = process.hrtime();
    while (!foundPath && attempts < 7500 && (process.hrtime(performanceStop)[0] * 1000000000 + process.hrtime(performanceStop)[1]) / 1000000 < 40) {
        attempts++;
        /*for (var i = 0; i < bot.dunder.nodes.length; i++) {
            if (!bot.dunder.nodes[i].open) {continue;}
            if (bot.dunder.nodes[i].fCost + bot.dunder.nodes[i].hCost < bestNode.fCost + bestNode.hCost || !bestNode.open) {
                bestNode = bot.dunder.nodes[i];
            }
        }*/
        bestNodeIndex = 0;
        bestNode = bot.dunder.openNodes[0];
        //console.log(bestNode.blockActions);
        /*for (var i = 0; i < bot.dunder.openNodes.length; i++) {
            if (i > 0 && !bestNode.open) {console.log(JSON.stringify(bestNode) + ", :/ " + i);}
            if (bot.dunder.openNodes[i].fCost == undefined || i > 1 && (bot.dunder.openNodes[i].fCost + bot.dunder.openNodes[i].hCost) < (bot.dunder.openNodes[Math.floor((i - 1) / 2)].fCost + bot.dunder.openNodes[Math.floor((i - 1) / 2)].hCost)) {console.log("Time for debugging: " + i);}
            if (bot.dunder.openNodes[i].fCost + bot.dunder.openNodes[i].hCost < bestNode.fCost + bestNode.hCost || !bestNode.open) {
                bestNode = bot.dunder.openNodes[i];
                bestNodeIndex = i;
            }
        }*/
        if (bestNodeIndex != 0) {
            console.log("OOF: openNode length: " + bot.dunder.openNodes.length + ", bestNodeIndex: " + bestNodeIndex);
        }
        //bestNodeIndex = 0;
        //bot.dunder.openNodes.splice(bestNodeIndex, 1);
        popHeap(bot, bestNode);
        //console.log(bestNode.blockActions);
        var bestNodeWasOpen;
        var chunkAvailible = false;
        if (!bestNode) {
            console.log("Ran out of legal moves.");
        } else { 
            bestNodeWasOpen = bestNode.open;
            bestNode.open = false;
            if (checkChunk(bestNode.x, bestNode.z)) {
                chunkAvailible = true;
            }
        }
        if (bestNode && (attempts > bot.dunder.maxAttempts || endZ != undefined && bestNode.x == endX && bestNode.y == endY && bestNode.z == endZ ||
            endZ == undefined && bestNode.x == endX && bestNode.z == endY || !chunkAvailible)) {
            botPathfindTimer = 0;
            foundPath = true;
            console.log("Found path in " + attempts + " attempts.");
            var atHome = false;
            var steps = 0;
                var ogreSection = bot.dunder.movesToGo.length - 1;//original reference erray(thats how you spell array :P) section
                var extender = [];
                while (!atHome | steps < 1000 && bestNode.parent != undefined) {
                    //console.log(bestNode.blockActions);
                    //console.log(steps);
                    //console.log(JSON.stringify(bestNode));
                    if (!extension) {
                        bot.dunder.movesToGo.push({"mType":bestNode.moveType,"x":bestNode.x, "y":bestNode.y, "z":bestNode.z, "blockActions":bestNode.blockActions, "blockDestructions":bestNode.brokenBlocks});
                        console.log(JSON.stringify(bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].blockDestructions));
                    } else {
                        extender.push({"mType":bestNode.moveType,"x":bestNode.x, "y":bestNode.y, "z":bestNode.z, "blockActions":bestNode.blockActions, "blockDestructions":bestNode.brokenBlocks});
                        //bot.dunder.movesToGo.unshift({"x":bestNode.x, "y":bestNode.y, "z":bestNode.z});
                    }
                  if (correction) {
                    for (var i = 0; i < ogreSection; i++) {
                        if (bot.dunder.movesToGo[i] == bestNode.x && bot.dunder.movesToGo[i] == bestNode.x && bot.dunder.movesToGo[i] == bestNode.x) {
                            while (bot.dunder.movesToGo[ogreSection].x != bestNode.x && bot.dunder.movesToGo[ogreSection].y != bestNode.y && bot.dunder.movesToGo[ogreSection].z != bestNode.z) {
                                bot.dunder.movesToGo.splice(ogreSection, 1);
                                ogreSection--;
                            }
                            i = ogreSection;
                        } else {
                            continue;
                        }
                    }
                  } else if (extension) {
                      for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
                          if (bot.dunder.movesToGo[i].x == extender[extender.length - 1].x &&
                              bot.dunder.movesToGo[i].y == extender[extender.length - 1].y &&
                              bot.dunder.movesToGo[i].z == extender[extender.length - 1].z) {
                              extender.splice(extender.length - 1, 1);
                              i = bot.dunder.movesToGo.length;
                              //continue;
                          }
                      }
                  }
                    if (bestNode) {
                        console.log("x: " + bestNode.x + " y: " + bestNode.y + "z: " + bestNode.z);
                        bestNode = bestNode.parent;
                    }
                    steps++;
                }
                if (extension) {
                    bot.dunder.lastPos.currentMove += extender.length;
                    bot.dunder.movesToGo = extender.concat(bot.dunder.movesToGo);
                }
                //bot.chat("I can be there in " + steps + " steps.");
            } else if (bestNodeWasOpen && bestNode) {
                if (bot.dunder.chatParticles) {bot.chat("/particle soul_fire_flame " + bestNode.x + " " + bestNode.y + " " + bestNode.z);}
                /*if (bestNode.parent) {
                    console.log("bestNode.parent fCost vs this node fCost: " + (bestNode.fCost - bestNode.parent.fCost));
                }*/
                //bot.chat("/setblock " + bestNode.x + " " + bestNode.y + " " + bestNode.z + " dirt");
                if (chunkAvailible) {
                    //walking
                    validNode(bot, bestNode, bestNode.x - 1, bestNode.y, bestNode.z, endX, endY, endZ);
                    validNode(bot, bestNode, bestNode.x + 1, bestNode.y, bestNode.z, endX, endY, endZ);
                    validNode(bot, bestNode, bestNode.x, bestNode.y, bestNode.z - 1, endX, endY, endZ);
                    validNode(bot, bestNode, bestNode.x, bestNode.y, bestNode.z + 1, endX, endY, endZ);
                    //walking(diagnol)
                    validNode(bot, bestNode, bestNode.x - 1, bestNode.y, bestNode.z - 1, endX, endY, endZ);
                    validNode(bot, bestNode, bestNode.x + 1, bestNode.y, bestNode.z - 1, endX, endY, endZ);
                    validNode(bot, bestNode, bestNode.x - 1, bestNode.y, bestNode.z + 1, endX, endY, endZ);
                    validNode(bot, bestNode, bestNode.x + 1, bestNode.y, bestNode.z + 1, endX, endY, endZ);

                    //Falling
                    validNode(bot, bestNode, bestNode.x, bestNode.y - 1, bestNode.z, endX, endY, endZ);
                    //Jumping
                    validNode(bot, bestNode, bestNode.x, bestNode.y + 1, bestNode.z, endX, endY, endZ);
                } else {
                    foundPath = true;
                    console.log("chunk border!");
                }
                /*validNode(bot, bestNode, bestNode.x - 1, bestNode.y - 1, bestNode.z, endX, endY, endZ);
                validNode(bot, bestNode, bestNode.x + 1, bestNode.y - 1, bestNode.z, endX, endY, endZ);
                validNode(bot, bestNode, bestNode.x, bestNode.y - 1, bestNode.z - 1, endX, endY, endZ);
                validNode(bot, bestNode, bestNode.x, bestNode.y - 1, bestNode.z + 1, endX, endY, endZ);
                //Falling(diagnol)
                validNode(bot, bestNode, bestNode.x - 1, bestNode.y - 1, bestNode.z + 1, endX, endY, endZ);
                validNode(bot, bestNode, bestNode.x + 1, bestNode.y - 1, bestNode.z + 1, endX, endY, endZ);
                validNode(bot, bestNode, bestNode.x - 1, bestNode.y - 1, bestNode.z - 1, endX, endY, endZ);
                validNode(bot, bestNode, bestNode.x + 1, bestNode.y - 1, bestNode.z - 1, endX, endY, endZ);*/
            }
            //bot.dunder.openNodes.splice(bestNodeIndex, 1);
        }
        if (!bestNode || foundPath || maxAttempts >= 7500 /*|| botPathfindTimer > 20 * 3*/) {
            bot.dunder.searchingPath = 0;
            botPathfindTimer = 0;
            clearInterval(bot.dunder.findingPath);
            if (!extension) {
                bot.dunder.lastPos.currentMove = bot.dunder.movesToGo.length - 1;
            }
            console.log("AFTER: " + JSON.stringify(bot.dunder.lastPos) + ", " + JSON.stringify(bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]) + ", length: " + bot.dunder.movesToGo.length);
            if (attempts > bot.dunder.maxAttempts) {
               console.log(bot.dunder.maxAttempts);
               console.log("Did not find full path quickly, taking the best known one known so far...");
               console.log(bot.dunder.goal);
               //experimental
               /*setTimeout(() => {
               findPath(bot, bot.dunder.maxAttempts + 500, Math.floor(bot.dunder.goal.x), Math.round(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z), false, true);}, 200);*/
            }
        }
    }, 50);
};
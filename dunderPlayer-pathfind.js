var chunkColumns = [];
function checkChunk(x, z) {
    var isTitle = false;
    if (chunkColumns[Math.floor(z / 16)] && chunkColumns[Math.floor(z / 16)][Math.floor(x / 16)]) {
        isTitle = true;
    }
    return isTitle;
};

var myWaterCost = 5;//35

/*var pathfinderOptions = {
    "maxFall":3,
    "maxFallClutch":256,
    "canClutch":!true,
    "sprint":true,
    "parkour":true,
    "placeBlocks":true,
    "break":true,
    "lowestY":-65,
};*/

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

function addNode(bot, objStuff, parent, fcost, hcost, x, y, z, moveType, brokenBlocks, brokeBlocks, placedBlocks, blockActions) {
    var parentFCost = fcost / ((bot.dunder.attempts > 1000) ? (bot.dunder.attempts / 1000) : 1);
    if (parent) {
        parentFCost += parent.fCost;
    }//(!!!) made change, see parentFCost / number below
    pushHeap(bot, objStuff, {"parent":parent, "fCost":parentFCost, "hCost":hcost, "x":x, "y":y, "z":z, "open":true, "moveType":moveType, "brokenBlocks":brokenBlocks, "brokeBlocks":brokeBlocks, "blockActions":blockActions});

    //old 3d array
    //if (bot.dunder[objStuff.nodes3d][y] == undefined) {bot.dunder[objStuff.nodes3d][y] = [];}
    //if (bot.dunder[objStuff.nodes3d][y][z] == undefined) {bot.dunder[objStuff.nodes3d][y][z] = [];}
    //bot.dunder[objStuff.nodes3d][y][z][x] = bot.dunder[objStuff.nodes][bot.dunder[objStuff.nodes].length - 1];
    //new object thing
    bot.dunder[objStuff.nodes3d][y + "," + z + "," + x] = bot.dunder[objStuff.nodes][bot.dunder[objStuff.nodes].length - 1];

};


function pushHeap(bot, objStuff, obj) {
    bot.dunder[objStuff.nodes].push(obj);
    bot.dunder[objStuff.openNodes].push(bot.dunder[objStuff.nodes][bot.dunder[objStuff.nodes].length - 1]);
    if (bot.dunder[objStuff.openNodes].length > 1) {
        var current = bot.dunder[objStuff.openNodes].length - 1;
        var parent = Math.floor((current - 1) / 2);
        while (current > 0 && (bot.dunder[objStuff.openNodes][parent].fCost + bot.dunder[objStuff.openNodes][parent].hCost) > (bot.dunder[objStuff.openNodes][current].fCost + bot.dunder[objStuff.openNodes][current].hCost)) {
            var storer = bot.dunder[objStuff.openNodes][current];
            bot.dunder[objStuff.openNodes][current] = bot.dunder[objStuff.openNodes][parent];
            bot.dunder[objStuff.openNodes][parent] = storer;
            current = parent;
            parent = Math.floor((current - 1) / 2);
        }
    }
};

function popHeap(bot, objStuff, obj) {
    bot.dunder[objStuff.openNodes].splice(0, 1);
    if (bot.dunder[objStuff.openNodes].length > 1) {
        bot.dunder[objStuff.openNodes].unshift(bot.dunder[objStuff.openNodes][bot.dunder[objStuff.openNodes].length - 1]);
        bot.dunder[objStuff.openNodes].splice(bot.dunder[objStuff.openNodes].length - 1, 1);
    }
  if (bot.dunder[objStuff.openNodes].length > 0) {
    var current = 0;
    var childLeft = (current * 2) + 1;
    var childRight = (current * 2) + 2;
    var keepGoing = true;
    while (keepGoing) {
        var currentScore = bot.dunder[objStuff.openNodes][current].fCost + bot.dunder[objStuff.openNodes][current].hCost;
        var childLeftScore = Infinity;
        var childRightScore = Infinity;
        if (bot.dunder[objStuff.openNodes].length - 1 >= childLeft) {childLeftScore = bot.dunder[objStuff.openNodes][childLeft].fCost + bot.dunder[objStuff.openNodes][childLeft].hCost;}
        if (bot.dunder[objStuff.openNodes].length - 1 >= childRight) {childRightScore = bot.dunder[objStuff.openNodes][childRight].fCost + bot.dunder[objStuff.openNodes][childRight].hCost;}
        if (childLeftScore < currentScore || childRightScore < currentScore) {
            var swapMeWith = childLeft;
            if (childLeftScore > childRightScore) {
                swapMeWith = childRight;
            }
            var storer = bot.dunder[objStuff.openNodes][swapMeWith];
            bot.dunder[objStuff.openNodes][swapMeWith] = bot.dunder[objStuff.openNodes][current];
            bot.dunder[objStuff.openNodes][current] = storer;
            current = swapMeWith;
            childLeft = (current * 2) + 1;
            childRight = (current * 2) + 2;

            //console.log("no random " + childLeftScore + ":" + childRightScore + ", " + current + ", \n\n\n\n" + JSON.stringify(bot.dunder[objStuff.openNodes][current]));
            //if (current == Infinity) {process.exit();}
        } else {
            keepGoing = false;
        }
    }
  }
};



function validNode(bot, objStuff, node, x, y, z, endX, endY, endZ, type) {
    var waterSwimCost = 4;
    var placeBlockCost = 20;//30
    //var breakBlockCost = 0;//0.045
    var breakBlockCost = 50 / 1000;
    //breakBlockCost = 99999;
    //placeBlockCost = 99999;
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
                } else if (bot.dunder.pathfinderOptions.sprint && node.moveType == "swimFast" | blockWater(bot, x, y, z) & blockWater(bot, x, y + 1, z)) {
                    moveType = "swimFast";
                } else {
                    moveType = "swimSlow";
                    myFCost += 5;
                    if (blockSolid(bot, x, y + 2, z) || blockSolid(bot, node.x, y + 2, node.z) ||
                        blockSolid(bot, node.x, y + 2, z) || blockSolid(bot, x, y + 2, node.z)) {
                        myFCost += myWaterCost;
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
                validNode(bot, objStuff, node, x, y - 1, z, endX, endY, endZ);
            }
            if (bot.dunder.pathfinderOptions.parkour && !legalMove && !blockStand(bot, x, y - 1, z, node) && blockAir(bot, x, y, z)) {//JUMP DIAGNOL
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
                        if (checkCount == 1 && !bot.dunder.pathfinderOptions.sprint) {checkCount = 3;}
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
            validNode(bot, objStuff, node, x, y + 1, z, endX, endY, endZ);
            moveType = "walkJump";
            //Parkour move
            var stepDir = {"x":x - node.x, "z":z - node.z};
            var blockWaterCount = blockWater(bot, x, y, z) + blockWater(bot, x, y + 1, z);
            var blockAirCount = blockAir(bot, x, y, z) + blockAir(bot, x, y + 1, z);
            if (blockWaterCount == 2 || blockWaterCount == 1 && blockAirCount == 1) {
                legalMove = true;
                if (bot.dunder.pathfinderOptions.sprint && node.moveType == "swimFast" | blockWater(bot, x, y, z) & blockWater(bot, x, y + 1, z)) {
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
                validNode(bot, objStuff, node, x, y - 1, z, endX, endY, endZ);
            }
            if (bot.dunder.pathfinderOptions.parkour && !legalMove && blockAir(bot, x, y - 1, z) && blockAir(bot, x, y, z)) {
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
                    if (checkCount == 1 && !bot.dunder.pathfinderOptions.sprint) {checkCount = 3;}
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
            var placeBlockNeeded = false;
            if (!blockWater(bot, x, y, z) && !blockWater(bot, x, y + 1, z) && !blockLava(bot, x, y, z) && !blockLava(bot, x, y + 1, z)) {
                placeBlockNeeded = (blockStand(bot, x, y - 1, z, node) != true);
                if (placeBlockNeeded) { 
                    myFCost += placeBlockNeeded * placeBlockCost;
                    myBlockActions.push([x, y - 1, z]);
                }
            }
            if (blockSolid(bot, x, y, z) && !blockWalk(bot, x, y, z)) {brokenBlocks.push([x, y, z]);brokeBlocks = true;}
            if (blockSolid(bot, x, y + 1, z)) {brokenBlocks.push([x, y + 1, z]);brokeBlocks = true;}
            legalMove = (!(placeBlockNeeded && !bot.dunder.pathfinderOptions.placeBlocks) && !(brokeBlocks && !bot.dunder.pathfinderOptions.breakBlocks));
            //console.log(legalMove + ", " + placeBlockNeeded + ", " + !bot.dunder.pathfinderOptions.placeBlocks + ", " + !(placeBlockNeeded && !bot.dunder.pathfinderOptions.placeBlocks));
            if (getDigTime(bot, x, y, z, false, false) == 9999999 || getDigTime(bot, x, y + 1, z, false, false) == 9999999) {legalMove = false;}
            moveType = "walk";
            if (bot.dunder.pathfinderOptions.sprint && blockWater(bot, x, y, z) && blockWater(bot, x, y + 1, z)) {
                moveType = "swimFast";
            } else if (blockWater(bot, x, y, z) || blockWater(bot, x, y + 1, z)) {
                moveType = "swimSlow";
                if (blockWater(bot, x, y + 1, z)) {myFCost += myWaterCost;}
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
                    if (bot.dunder.pathfinderOptions.sprint && node.moveType == "swimFast" | blockWater(bot, x, y, z) & blockWater(bot, x, y + 1, z)) {
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
            if (bot.dunder.pathfinderOptions.parkour && !legalMove && blockAir(bot, x, y - 1, z) && blockAir(bot, x, y, z)) {
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

            var placeBlockNeeded = false;
            if (!blockWater(bot, x, y, z) && !blockWater(bot, x, y + 1, z) && !blockLava(bot, x, y, z) && !blockLava(bot, x, y + 1, z)) {
                placeBlockNeeded = (blockStand(bot, x, y - 1, z, node) != true);
                if (placeBlockNeeded) {
                    myFCost += placeBlockNeeded * placeBlockCost;
                    myBlockActions.push([x, y - 1, z]);
                }
            }
            if (blockSolid(bot, x, y, z) && !blockWalk(bot, x, y, z)) {brokenBlocks.push([x, y, z]);brokeBlocks = true;}
            if (blockSolid(bot, x, y + 1, z)) {brokenBlocks.push([x, y + 1, z]);brokeBlocks = true;}
            if (blockSolid(bot, node.x, node.y + 2, node.z)) {brokenBlocks.push([node.x, node.y + 2, node.z]);brokeBlocks = true;}
            legalMove = !(brokeBlocks && !bot.dunder.pathfinderOptions.breakBlocks);//(!(placeBlockNeeded && !bot.dunder.pathfinderOptions.placeBlocks));
            if (getDigTime(bot, node.x, node.y + 2, node.z, false, false) == 9999999 || getDigTime(bot, x, y, z, false, false) == 9999999 || getDigTime(bot, x, y + 1, z, false, false) == 9999999) {legalMove = false;}
            moveType = "walkJump";
            if (bot.dunder.pathfinderOptions.sprint && blockWater(bot, x, y, z) && blockWater(bot, x, y + 1, z)) {
                moveType = "swimFast";
            } else if (blockWater(bot, x, y, z) || blockWater(bot, x, y + 1, z)) {
                moveType = "swimSlow";
                if (blockWater(bot, x, y + 1, z)) {myFCost += myWaterCost;}
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
            while (y > bot.dunder.pathfinderOptions.lowestY && y > oldY - bot.dunder.pathfinderOptions.maxFall & !bot.dunder.pathfinderOptions.canClutch | y > oldY - bot.dunder.pathfinderOptions.maxFallClutch & bot.dunder.pathfinderOptions.canClutch && !legalMove && !failed) {
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
            while (y > bot.dunder.pathfinderOptions.lowestY && y > oldY - bot.dunder.pathfinderOptions.maxFall & !bot.dunder.pathfinderOptions.canClutch | y > oldY - bot.dunder.pathfinderOptions.maxFallClutch & bot.dunder.pathfinderOptions.canClutch && !legalMove && !failed) {
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
            if (y != oldY && bot.dunder.pathfinderOptions.parkour) {
                validNode(bot, objStuff, node, x, oldY - 1, z, endX, endY, endZ);
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
            while (y > bot.dunder.pathfinderOptions.lowestY && y > oldY - bot.dunder.pathfinderOptions.maxFall & !bot.dunder.pathfinderOptions.canClutch | y > oldY - bot.dunder.pathfinderOptions.maxFallClutch & bot.dunder.pathfinderOptions.canClutch && !legalMove && !failed) {
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
        legalMove = !(!isSwim(moveType) && !bot.dunder.pathfinderOptions.placeBlocks);//true;
        if (getDigTime(bot, x, y + 1, z, false, false) == 9999999 || moveType == "goUp" && node && isSwim(node.moveType)) {legalMove = false;/*console.log("asdf");*/}
        //console.log("goUp " + myFCost);
    }
    var distToGoal = 0;
    if (endZ != undefined) {
        //distToGoal = dist3d(x, y, z, endX, endY, endZ) * (3);
        //distToGoal = dist3d(x, y, z, endX, endY, endZ) * (25);//DEFAULT
        //distToGoal = dist3d(x, 0, z, endX, 0, endZ) * (25) + dist3d(0, y, 0, 0, endY, 0) * (10);
        distToGoal = dist3d(x, 0, z, endX, 0, endZ) * (25);//Optimized?
        if (distToGoal / 25 < 32 || dist3d(bot.entity.position.x, 0, bot.entity.position.z, endX, 0, endZ) < 48) {
            distToGoal += dist3d(0, y, 0, 0, endY, 0) * (18);
        } else {
            distToGoal += dist3d(0, y, 0, 0, endY, 0) * (3);
        }
        //distToGoal = dist3d(x, 0, z, endX, 0, endZ) * (10);
        //distToGoal += Math.abs(y - endY) * 10;
        //distToGoal += dist3d(0, y, 0, 0, endY, 0) * (10);
    } else {
        distToGoal = dist3d(x, 0, z, endX, 0, endY) * (25);
    }
    if (/*bot.dunder[objStuff.nodes3d][y] == undefined || bot.dunder[objStuff.nodes3d][y][z] == undefined || bot.dunder[objStuff.nodes3d][y][z][x] == undefined*/!bot.dunder[objStuff.nodes3d][y + "," + z + "," + x]) {
        ownerNodeUndefined = true;
    } else if (node.fCost + myFCost + distToGoal < bot.dunder[objStuff.nodes3d][y + "," + z + "," + x].fCost + bot.dunder[objStuff.nodes3d][y + "," + z + "," + x].hCost) {
        ownerNodeUndefined = true;
    }
    if (legalMove && ownerNodeUndefined) {
        addNode(bot, objStuff, node, myFCost, distToGoal, x, y, z, moveType, brokenBlocks, brokeBlocks, placedBlocks, myBlockActions);
        //console.log("D: " + Math.floor(distToGoal) + ", F: " + myFCost + ", M: " + moveType + ", XYZ: " + x + " " + y + " " + z);
    } else {
        //console.log("X: " + x + ", Y: " + y + ", Z: " + z + ", D: " + dist3d(x, y, z, endX, endY, endZ) * 10);
    }
    
};
//movesToGo = [];

//var bestNodeIndex = 0;
function findPath(bot, objStuff, maxAttemptCount, endX, endY, endZ, correction, extension, extraOptions) {
    bot.dunder.pathfinderOptions.canClutch = hasItem(bot, ["water_bucket"]);
    bot.dunder.lastPosOnPath = true;
    console.log(bot.dunder.cbtm + " is looking for a path... correction, extension, maxAttemptCount: " + correction + ", " + extension + ", " + maxAttemptCount);
    bot.dunder[objStuff.maxAttempts] = maxAttemptCount;
    if (bot.dunder[objStuff.movesToGo].length == 0) {extension = false;}
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
    //console.log("BEFORE: " + JSON.stringify(bot.dunder.lastPos) + ", " + JSON.stringify(bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove]) + ", length: " + bot.dunder[objStuff.movesToGo].length);
    bot.clearControlStates();
    //var currentMovePos = {"x":bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove].x,"y":bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove].y,"z":bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove].z};
    var movesToGoLength = bot.dunder[objStuff.movesToGo].length;
    if (!extension) {
        bot.dunder.lastPos = {"currentMove":0,"x":Math.floor(bot.entity.position.x), "y":Math.floor(bot.entity.position.y), "z":Math.floor(bot.entity.position.z), "mType":"start"};
    }
    if (!correction && !extension) {
        bot.dunder[objStuff.nodes] = [];
        bot.dunder[objStuff.nodes3d] = {};
        bot.dunder[objStuff.openNodes] = [];
        bot.dunder[objStuff.movesToGo] = [];
    } else if (correction) {
        bot.dunder[objStuff.nodes] = [];
        bot.dunder[objStuff.nodes3d] = {};
        bot.dunder[objStuff.openNodes] = [];
        var bestOne = [0, 10000];
        for (var i = 0; i < bot.dunder[objStuff.movesToGo].length; i++) {
            if (dist3d(bot.dunder[objStuff.movesToGo][i].x, bot.dunder[objStuff.movesToGo][i].y, bot.dunder[objStuff.movesToGo][i].z, Math.round(bot.entity.position.x), Math.floor(bot.entity.position.y - 1), Math.round(bot.entity.position.z)) < bestOne[1]) {
                bestOne = [i, dist3d(bot.dunder[objStuff.movesToGo][i].x, bot.dunder[objStuff.movesToGo][i].y, bot.dunder[objStuff.movesToGo][i].z, Math.round(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.round(bot.entity.position.z))];
            }
        }

        //(!!!)
        bestOne[0] -= 5;
        if (bestOne[0] < 0) {bestOne[0] = 0;} 
        //(!!!)

        if (bestOne[0] + 1 < bot.dunder[objStuff.movesToGo].length) {
            bot.dunder[objStuff.movesToGo].splice(bestOne[0] + 1, bot.dunder[objStuff.movesToGo].length);
        }
        endX = bot.dunder[objStuff.movesToGo][bestOne[0]].x;
        endY = bot.dunder[objStuff.movesToGo][bestOne[0]].y;
        endZ = bot.dunder[objStuff.movesToGo][bestOne[0]].z;
        if (bestOne[0] == 0) {bot.dunder[objStuff.movesToGo] = [];}//(!!!)
        //console.log("endPos: " + bot.dunder[objStuff.movesToGo][bestOne[0]]);
    } else if (extension) {
        //if (bot.dunder[objStuff.maxAttempts] == 500) {
            bot.dunder[objStuff.nodes] = [];
            bot.dunder[objStuff.openNodes] = [];
            bot.dunder[objStuff.nodes3d] = {};
        //}
        var bestOne = [0, 100000];
        for (var i = 0; i < bot.dunder[objStuff.movesToGo].length; i++) {
            if (dist3d(bot.dunder[objStuff.movesToGo][i].x, bot.dunder[objStuff.movesToGo][i].y, bot.dunder[objStuff.movesToGo][i].z, endX, endY, endZ) < bestOne[1]) {
                bestOne = [i, dist3d(bot.dunder[objStuff.movesToGo][i].x, bot.dunder[objStuff.movesToGo][i].y, bot.dunder[objStuff.movesToGo][i].z, endX, endY, endZ)];
            }
        }
        //var bestOne = [0, dist3d(bot.dunder[objStuff.movesToGo][bot.dunder[objStuff.movesToGo].length - 1].x, bot.dunder[objStuff.movesToGo][bot.dunder[objStuff.movesToGo].length - 1].y, bot.dunder[objStuff.movesToGo][bot.dunder[objStuff.movesToGo].length - 1].z, endX, endY, endZ)];
        bestOne[0] += 10;
        if (bestOne[0] > bot.dunder[objStuff.movesToGo].length - 6) {bestOne[0] = bot.dunder[objStuff.movesToGo].length - 6;}
        if (bestOne[0] >= 0) {
            bot.dunder.lastPos.currentMove -= (bestOne[0] + 1);
            bot.dunder[objStuff.movesToGo].splice(0, bestOne[0] + 1);
        }
        /*if (bot.dunder[objStuff.movesToGo].length < 10) {
            bot.dunder[objStuff.movesToGo] = [];
            console.log(bot.dunder[objStuff.movesToGo].length);
            bot.dunder.lastPos = {"currentMove":0,"x":Math.floor(bot.entity.position.x), "y":Math.floor(bot.entity.position.y), "z":Math.floor(bot.entity.position.z), "mType":};
            extension = false;
        }*/
     } /*else if (extension) {
        bot.dunder[objStuff.nodes] = [];
        bot.dunder[objStuff.openNodes] = [];
        bot.dunder[objStuff.nodes3d] = {};
        var bestOne = [0, 10000];
        for (var i = 0; i < bot.dunder[objStuff.movesToGo].length; i++) {
            if (dist3d(bot.dunder[objStuff.movesToGo][i].x, bot.dunder[objStuff.movesToGo][i].y, bot.dunder[objStuff.movesToGo][i].z, endX, endY, endZ) < bestOne[1]) {
                bestOne = [i, dist3d(bot.dunder[objStuff.movesToGo][i].x, bot.dunder[objStuff.movesToGo][i].y, bot.dunder[objStuff.movesToGo][i].z, endX, endY, endZ)];
            }
        }
        if (bestOne[0] += 7) {
            if (bestOne[0] > bot.dunder[objStuff.movesToGo].length - 1) {bestOne[0] = bot.dunder[objStuff.movesToGo].length - 1;}
        }
        bot.dunder[objStuff.movesToGo].splice(0, bestOne[0] + 1);
        var foundCurrentMove = false;
        if (bot.dunder[objStuff.movesToGo].length - 1 < bot.dunder.lastPos.currentMove && bot.dunder.lastPos.currentMove) {
            console.log(bot.dunder.lastPos.currentMove);
            for (var i = 0; i < bot.dunder[objStuff.movesToGo].length; i++) {
                if (bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove] &&
                    bot.dunder[objStuff.movesToGo][i].x == bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove].x &&
                    bot.dunder[objStuff.movesToGo][i].y == bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove].y &&
                    bot.dunder[objStuff.movesToGo][i].z == bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove].z) {
                    bot.dunder.lastPos.currentMove = i;
                    foundCurrentMove = true;
                }
            }
        }
        if (!foundCurrentMove) {
            //bot.dunder.lastPos.currentMove -= Math.abs(bot.dunder[objStuff.movesToGo].length - movesToGoLength);
            bot.dunder.lastPos.currentMove = bot.dunder[objStuff.movesToGo].length - 1;
            if (bot.dunder.lastPos.currentMove < 0) {bot.dunder.lastPos.currentMove = 0;}
        }
        console.log("lastPos found: " + foundCurrentMove + ", " + bot.dunder.lastPos.currentMove);
        //endX = bot.dunder[objStuff.movesToGo][bestOne[0]].x;
        //endY = bot.dunder[objStuff.movesToGo][bestOne[0]].y;
        //endZ = bot.dunder[objStuff.movesToGo][bestOne[0]].z;
        //console.log(bot.dunder[objStuff.movesToGo][bestOne[0]]);
    }*/

    bot.dunder.foundPath = false;
    if (!extension || bot.dunder[objStuff.movesToGo].length == 0) {
        addNode(bot, objStuff, false, 0, 0, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z), "start", [], false, false, []);
    } else if (bot.dunder[objStuff.movesToGo].length > 0) {
        //console.log("x: " + bot.dunder[objStuff.movesToGo][0].x + ", y: " + bot.dunder[objStuff.movesToGo][0].y + ", z: " + bot.dunder[objStuff.movesToGo][0].z + " " + bot.dunder[objStuff.movesToGo].length)
        addNode(bot, objStuff, false, 0, 0, bot.dunder[objStuff.movesToGo][0].x, bot.dunder[objStuff.movesToGo][0].y, bot.dunder[objStuff.movesToGo][0].z, "start", [], false, false, []);
    }
    bot.dunder[objStuff.attempts] = 0;
    var maxAttempts = 0;
    bot.dunder[objStuff.bestNode] = bot.dunder[objStuff.nodes][0];
    //console.log(bot.dunder[objStuff.bestNode].blockActions);
    //console.log(bot.dunder.findingPath);
    if (bot.dunder.findingPath) {
        clearInterval(bot.dunder.findingPath);
        bot.dunder.findingPath = null;
    }

    if (objStuff.attempts == "attempts") {
        bot.dunder.findingPath = setInterval(function() {doFindingPath(bot, objStuff, extension, correction, endX, endY, endZ, maxAttempts, extraOptions);}, 50);
    } else {
        return doFindingPath(bot, objStuff, extension, correction, endX, endY, endZ, maxAttempts, extraOptions);
    }
};


var doFindingPath = function(bot, objStuff, extension, correction, endX, endY, endZ, maxAttempts, extraOptions) {
        //console.log(bot.dunder.cbtm + " is the bot's ID");
        bot.dunder[objStuff.bestNodeIndex] = 0;
        //console.log("searching...");
        bot.dunder.searchingPath = 10;
        if (!extension) {
            bot.dunder.destinationTimer = 30;
        }
        //moveTimer = 10;
        bot.dunder.performanceStop = process.hrtime();
        while (!bot.dunder.foundPath && bot.dunder[objStuff.attempts] < 7500 && (process.hrtime(bot.dunder.performanceStop)[0] * 1000000000 + process.hrtime(bot.dunder.performanceStop)[1]) / 1000000 < 40 / botsToSpawn.length) {
            bot.dunder[objStuff.attempts]++;
            /*for (var i = 0; i < bot.dunder[objStuff.nodes].length; i++) {
                if (!bot.dunder[objStuff.nodes][i].open) {continue;}
                if (bot.dunder[objStuff.nodes][i].fCost + bot.dunder[objStuff.nodes][i].hCost < bot.dunder[objStuff.bestNode].fCost + bot.dunder[objStuff.bestNode].hCost || !bot.dunder[objStuff.bestNode].open) {
                    bot.dunder[objStuff.bestNode] = bot.dunder[objStuff.nodes][i];
                }
            }*/
            bot.dunder[objStuff.bestNodeIndex] = 0;
            bot.dunder[objStuff.bestNode] = bot.dunder[objStuff.openNodes][0];
            //console.log(bot.dunder[objStuff.bestNode].blockActions);
            /*for (var i = 0; i < bot.dunder[objStuff.openNodes].length; i++) {
                if (i > 0 && !bestNode.open) {console.log(JSON.stringify(bestNode) + ", :/ " + i);}
                if (bot.dunder[objStuff.openNodes][i].fCost == undefined || i > 1 && (bot.dunder[objStuff.openNodes][i].fCost + bot.dunder[objStuff.openNodes][i].hCost) < (bot.dunder[objStuff.openNodes][Math.floor((i - 1) / 2)].fCost + bot.dunder[objStuff.openNodes][Math.floor((i - 1) / 2)].hCost)) {console.log("Time for debugging: " + i);}
                if (bot.dunder[objStuff.openNodes][i].fCost + bot.dunder[objStuff.openNodes][i].hCost < bestNode.fCost + bestNode.hCost || !bestNode.open) {
                    bestNode = bot.dunder[objStuff.openNodes][i];
                    bot.dunder[objStuff.bestNodeIndex] = i;
                }
            }*/
            if (bot.dunder[objStuff.bestNodeIndex] != 0) {
                console.log("OOF: openNode length: " + bot.dunder[objStuff.openNodes].length + ", bot.dunder[objStuff.bestNodeIndex]: " + bot.dunder[objStuff.bestNodeIndex]);
            }
            //bot.dunder[objStuff.bestNodeIndex] = 0;
            //bot.dunder[objStuff.openNodes].splice(bot.dunder[objStuff.bestNodeIndex], 1);
            popHeap(bot, objStuff, bot.dunder[objStuff.bestNode]);
            //console.log(bestNode.blockActions);
            var bestNodeWasOpen;
            var chunkAvailible = false;
            if (!bot.dunder[objStuff.bestNode]) {
                console.log("Ran out of legal moves.");
            } else { 
                bestNodeWasOpen = bot.dunder[objStuff.bestNode].open;
                bot.dunder[objStuff.bestNode].open = false;
                if (checkChunk(bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].z)) {
                    chunkAvailible = true;
                }
            }
            if (bot.dunder[objStuff.bestNode] && (bot.dunder[objStuff.attempts] > bot.dunder[objStuff.maxAttempts] /*&& dist3d(bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z, bot.dunder.goal.x, bot.dunder.goal.y, bot.dunder.goal.z) < dist3d(bot.dunder.lastPos.x, bot.dunder.lastPos.y, bot.dunder.lastPos.z, bot.dunder.goal.x, bot.dunder.goal.y, bot.dunder.goal.z)*/ || endZ != undefined && /*bot.dunder[objStuff.bestNode].x == endX && bot.dunder[objStuff.bestNode].y == endY && bot.dunder[objStuff.bestNode].z == endZ*/ distMan3d(bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z, endX, endY, endZ) <= bot.dunder.pathGoalForgiveness && (!extraOptions || extraOptions && !extraOptions.mustBeVisible || extraOptions && extraOptions.mustBeVisible && visibleFromPos(bot, new Vec3(bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z), new Vec3 (endX, endY, endZ))) ||
                endZ == undefined && bot.dunder[objStuff.bestNode].x == endX && bot.dunder[objStuff.bestNode].z == endY /*dist3d(bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].z, 0, endX, endY, 0) <= bot.dunder.pathGoalForgiveness*/ || !chunkAvailible)) {
                botPathfindTimer = 0;
                bot.dunder.foundPath = true;
                console.log("Found path in " + bot.dunder[objStuff.attempts] + " attempts.");
                var atHome = false;
                var steps = 0;
                var ogreSection = bot.dunder[objStuff.movesToGo].length - 1;//original reference erray(thats how you spell array :P) section
                var extender = [];
                while (!atHome | steps < 1000 && bot.dunder[objStuff.bestNode].parent != undefined) {
                    //console.log(bot.dunder[objStuff.bestNode].blockActions);
                    //console.log(steps);
                    //console.log(JSON.stringify(bot.dunder[objStuff.bestNode]));
                    if (!extension) {
                        bot.dunder[objStuff.movesToGo].push({"mType":bot.dunder[objStuff.bestNode].moveType,"x":bot.dunder[objStuff.bestNode].x, "y":bot.dunder[objStuff.bestNode].y, "z":bot.dunder[objStuff.bestNode].z, "blockActions":bot.dunder[objStuff.bestNode].blockActions, "blockDestructions":bot.dunder[objStuff.bestNode].brokenBlocks});
                        //console.log(JSON.stringify(bot.dunder[objStuff.movesToGo][bot.dunder[objStuff.movesToGo].length - 1].blockDestructions));
                    } else {
                        extender.push({"mType":bot.dunder[objStuff.bestNode].moveType,"x":bot.dunder[objStuff.bestNode].x, "y":bot.dunder[objStuff.bestNode].y, "z":bot.dunder[objStuff.bestNode].z, "blockActions":bot.dunder[objStuff.bestNode].blockActions, "blockDestructions":bot.dunder[objStuff.bestNode].brokenBlocks});
                        //bot.dunder[objStuff.movesToGo].unshift({"x":bot.dunder[objStuff.bestNode].x, "y":bot.dunder[objStuff.bestNode].y, "z":bot.dunder[objStuff.bestNode].z});
                    }
                  if (correction) {
                    for (var i = 0; i < ogreSection; i++) {
                        if (bot.dunder[objStuff.movesToGo][i] == bot.dunder[objStuff.bestNode].x && bot.dunder[objStuff.movesToGo][i] == bot.dunder[objStuff.bestNode].x && bot.dunder[objStuff.movesToGo][i] == bot.dunder[objStuff.bestNode].x) {
                            while (bot.dunder[objStuff.movesToGo][ogreSection].x != bot.dunder[objStuff.bestNode].x && bot.dunder[objStuff.movesToGo][ogreSection].y != bot.dunder[objStuff.bestNode].y && bot.dunder[objStuff.movesToGo][ogreSection].z != bot.dunder[objStuff.bestNode].z) {
                                bot.dunder[objStuff.movesToGo].splice(ogreSection, 1);
                                ogreSection--;
                            }
                            i = ogreSection;
                        } else {
                            continue;
                        }
                    }
                  } else if (extension) {
                      for (var i = 0; i < bot.dunder[objStuff.movesToGo].length; i++) {
                          if (bot.dunder[objStuff.movesToGo][i].x == extender[extender.length - 1].x &&
                              bot.dunder[objStuff.movesToGo][i].y == extender[extender.length - 1].y &&
                              bot.dunder[objStuff.movesToGo][i].z == extender[extender.length - 1].z) {
                              extender.splice(extender.length - 1, 1);
                              i = bot.dunder[objStuff.movesToGo].length;
                              //continue;
                          }
                      }
                  }
                    if (bot.dunder[objStuff.bestNode]) {
                        //console.log("x: " + bot.dunder[objStuff.bestNode].x + " y: " + bot.dunder[objStuff.bestNode].y + "z: " + bot.dunder[objStuff.bestNode].z);
                        bot.dunder[objStuff.bestNode] = bot.dunder[objStuff.bestNode].parent;
                    }
                    steps++;
                }
                if (extension) {
                    bot.dunder.lastPos.currentMove += extender.length;
                    bot.dunder[objStuff.movesToGo] = extender.concat(bot.dunder[objStuff.movesToGo]);
                }
                //bot.chat("I can be there in " + steps + " steps.");
            } else if (bestNodeWasOpen && bot.dunder[objStuff.bestNode]) {
                if (bot.dunder.chatParticles) {bot.chat("/particle soul_fire_flame " + bot.dunder[objStuff.bestNode].x + " " + bot.dunder[objStuff.bestNode].y + " " + bot.dunder[objStuff.bestNode].z);}
                /*if (bestNode.parent) {
                    console.log("bestNode.parent fCost vs this node fCost: " + (bestNode.fCost - bestNode.parent.fCost));
                }*/
                //bot.chat("/setblock " + bot.dunder[objStuff.bestNode].x + " " + bot.dunder[objStuff.bestNode].y + " " + bot.dunder[objStuff.bestNode].z + " dirt");
                if (chunkAvailible) {
                    //walking
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x - 1, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z, endX, endY, endZ);
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x + 1, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z, endX, endY, endZ);
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z - 1, endX, endY, endZ);
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z + 1, endX, endY, endZ);
                    //walking(diagnol)
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x - 1, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z - 1, endX, endY, endZ);
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x + 1, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z - 1, endX, endY, endZ);
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x - 1, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z + 1, endX, endY, endZ);
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x + 1, bot.dunder[objStuff.bestNode].y, bot.dunder[objStuff.bestNode].z + 1, endX, endY, endZ);

                    //Falling
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y - 1, bot.dunder[objStuff.bestNode].z, endX, endY, endZ);
                    //Jumping
                    validNode(bot, objStuff, bot.dunder[objStuff.bestNode], bot.dunder[objStuff.bestNode].x, bot.dunder[objStuff.bestNode].y + 1, bot.dunder[objStuff.bestNode].z, endX, endY, endZ);
                } else {
                    bot.dunder.foundPath = true;
                    console.log("chunk border!");
                }
                /*validNode(bot, objStuff, bestNode, bestNode.x - 1, bestNode.y - 1, bestNode.z, endX, endY, endZ);
                validNode(bot, objStuff, bestNode, bestNode.x + 1, bestNode.y - 1, bestNode.z, endX, endY, endZ);
                validNode(bot, objStuff, bestNode, bestNode.x, bestNode.y - 1, bestNode.z - 1, endX, endY, endZ);
                validNode(bot, objStuff, bestNode, bestNode.x, bestNode.y - 1, bestNode.z + 1, endX, endY, endZ);
                //Falling(diagnol)
                validNode(bot, objStuff, bestNode, bestNode.x - 1, bestNode.y - 1, bestNode.z + 1, endX, endY, endZ);
                validNode(bot, objStuff, bestNode, bestNode.x + 1, bestNode.y - 1, bestNode.z + 1, endX, endY, endZ);
                validNode(bot, objStuff, bestNode, bestNode.x - 1, bestNode.y - 1, bestNode.z - 1, endX, endY, endZ);
                validNode(bot, objStuff, bestNode, bestNode.x + 1, bestNode.y - 1, bestNode.z - 1, endX, endY, endZ);*/
            }
            //bot.dunder[objStuff.openNodes].splice(bot.dunder[objStuff.bestNodeIndex], 1);
        }
        if (!bot.dunder[objStuff.bestNode] || bot.dunder.foundPath || maxAttempts >= 7500 /*|| botPathfindTimer > 20 * 3*/) {
            //bot.dunder.searchingPath = 0;
            botPathfindTimer = 0;

            if (objStuff.attempts != "skipAttempts") {
                clearInterval(bot.dunder.findingPath);
                bot.dunder.findingPath = null;
                console.log("non-skipper");
            } else {
                console.log("skipper");
            }

            if (!extension) {
                bot.dunder.lastPos.currentMove = bot.dunder[objStuff.movesToGo].length - 1;
            }
            //console.log("AFTER: " + JSON.stringify(bot.dunder.lastPos) + ", " + JSON.stringify(bot.dunder[objStuff.movesToGo][bot.dunder.lastPos.currentMove]) + ", length: " + bot.dunder[objStuff.movesToGo].length);
            if (bot.dunder[objStuff.attempts] > bot.dunder[objStuff.maxAttempts]) {
               console.log("\n" + bot.dunder[objStuff.maxAttempts]);
               //console.log("Did not find full path quickly, taking the best known one known so far...");

               console.log("Did not find full path quickly");
               bot.dunderTaskDetails.failedPathfind = {x:endX, y:endY, z:endZ};
               bot.dunder[objStuff.movesToGo] = [];

               console.log(bot.dunder.goal);
               //experimental
               /*setTimeout(() => {
               findPath(bot, dunderBotPathfindDefaults, bot.dunder[objStuff.maxAttempts] + 500, Math.floor(bot.dunder.goal.x), Math.round(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z), false, true);}, 200);*/
            }
        }
    if (objStuff.attempts != "attempts") {
        console.log("asdf " + bot.dunder.foundPath);
        return bot.dunder.foundPath;
    }
};
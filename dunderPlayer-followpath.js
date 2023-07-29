var busyBuilding = false;
function takeCareOfBlock (bot, myMove) {
            //console.log(bot.entity.isInWater);
            if (bot.entity.onGround |
                bot.entity.isInWater |
                bot.entity.isInLava |
                isSwim(myMove.mType)  &&
                myMove.y + 0.2 < bot.entity.position.y &&
                blockSolid(bot, myMove.x, myMove.y, myMove.z) &&
                dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) &&
                canDigBlock(bot, myMove.x, myMove.y, myMove.z) &&
                !bot.targetDigBlock) {
                equipTool(bot, myMove.x, myMove.y, myMove.z);
                digBlock(bot, myMove.x, myMove.y, myMove.z);
                bot.dunder.isDigging = 2;
                console.log("DigDown Strict");
            } else if (bot.entity.onGround |
                bot.entity.isInWater |
                bot.entity.isInLava |
                isSwim(myMove.mType) &&
                myMove.y + 1.2 < bot.entity.position.y &&
                blockSolid(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z) &&
                dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) &&
                canDigBlock(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z) &&
                !bot.targetDigBlock) {
                equipTool(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z);
                digBlock(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z);
                bot.dunder.isDigging = 2;
                console.log("DigDown FreeStyle");
            } else if ((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) & bot.entity.position.y >= myMove.y - 0.25 & bot.entity.position.y <= myMove.y + 0.25 | isSwim(myMove.mType) && !bot.targetDigBlock /*&& botDigDelay <= 0*/) {
                //console.log("DigForward?");
                if (blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z) ) {
                    console.log("DigForward A");
                    equipTool(bot, myMove.x, myMove.y + 1, myMove.z);
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, myMove.x, myMove.y + 1, myMove.z);
                    botMove.forward = false;
                    botMove.sprint = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (!blockWalk(bot, myMove.x, myMove.y, myMove.z) && blockSolid(bot, myMove.x, myMove.y, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y, myMove.z)) {
                    console.log("DigForward B");
                    equipTool(bot, myMove.x, myMove.y, myMove.z);
                    digBlock(bot, myMove.x, myMove.y, myMove.z);
                    botMove.forward = false;
                    botMove.sprint = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                }
            } else if ((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) & bot.entity.position.y >= myMove.y - 1.25 & bot.entity.position.y <= myMove.y + 0.25 | isSwim(myMove.mType) && !bot.targetDigBlock /*&& botDigDelay <= 0*/) {
                //console.log("DigForward?");
                if (blockSolid(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z)) &&
                    canDigBlock(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z)) ) {
                    console.log("Dig Up A");
                    equipTool(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z));
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z));
                    botMove.forward = false;
                    botMove.sprint = false;
                    botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z) ) {
                    console.log("Dig Up B");
                    equipTool(bot, myMove.x, myMove.y + 1, myMove.z);
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, myMove.x, myMove.y + 1, myMove.z);
                    botMove.forward = false;
                    botMove.sprint = false;
                    botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (!blockWalk(bot, myMove.x, myMove.y, myMove.z) && blockSolid(bot, myMove.x, myMove.y, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y, myMove.z)) {
                    console.log("Dig Up C");
                    equipTool(bot, myMove.x, myMove.y, myMove.z);
                    digBlock(bot, myMove.x, myMove.y, myMove.z);
                    botMove.forward = false;
                    botMove.sprint = false;
                    botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                }
            }
            if (/*!botIsDigging &&*/!isSwim(myMove.mType) && !bot.targetDigBlock && !blockStand(bot, myMove.x, myMove.y - 1, myMove.z) &&
                myMove.y == bot.dunder.lastPos.y & dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) /*|
                myMove.y != bot.dunder.lastPos.y & dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= dist3d(0, 0, 0, 3, 3, 3)*/) {
                //console.log("asdf");
                botMove.forward = false;
                botMove.sprint = false;
                botMove.sneak = true;
                if (dist3d(bot.entity.position.x, 0, bot.entity.position.z, bot.dunder.lastPos.x + 0.5, 0, bot.dunder.lastPos.z + 0.5) >= Math.sqrt(0.35)) {botMove.back = true;}
                if (breakAndPlaceBlock(bot, myMove.x, myMove.y - 1, myMove.z, true)) {
                    equipTool(bot, myMove.x, myMove.y - 1, myMove.z);
                    digBlock(bot, myMove.x, myMove.y - 1, myMove.z);
                    console.log("just a sec before bridging...");
                    busyBuilding = true;
                } else if (!bot.targetDigBlock && myMove.mType != "fall") {
                    console.log("e");
                    equipItem(bot, garbageBlocks, "hand");
                    //holdWeapon = false;
                    placeBlock(bot, myMove.x, myMove.y - 1, myMove.z, false/*(myMove.y != bot.dunder.lastPos.y) ? Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z) : undefined*/);
                    /*if (botSpeed <= 0.1 && bot.dunder.lastPos.y <= myMove.y) {
                        bot.entity.position.x = bot.dunder.lastPos.x + 0.5;
                        bot.entity.position.z = bot.dunder.lastPos.z + 0.5;
                    }*/
                    console.log("placeblock");
                    busyBuilding = true;
                    botMove.faceBackwards = 4;
                }
            }
            if (myMove.mType == "goUp") {
                botMove.sprint = false;
                botMove.jump = false;
                if (bot.entity.position.y <= myMove.y - 0.25 && bot.entity.onGround) {
                    botMove.jump = true;
                }
                //console.log((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) + ", " + blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) + ", " + canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z));
                if (/*(bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) &&*/ blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) && canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z)) {
                    console.log("Dig UP UP");
                    equipTool(bot, myMove.x, myMove.y + 1, myMove.z);
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, myMove.x, myMove.y + 1, myMove.z);
                    botMove.forward = false;
                    botMove.sprint = false;
                    botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (breakAndPlaceBlock(bot, myMove.x, myMove.y - 1, myMove.z, true)) {
                    equipTool(bot, myMove.x, myMove.y - 1, myMove.z);
                    //digBlock(bot, myMove.x, myMove.y - 1, myMove.z);
                    console.log("just a sec before pillaring...");
                    busyBuilding = true;
                } else if (bot.entity.position.y > myMove.y - 1 && (blockAir(bot, myMove.x, myMove.y - 1, myMove.z) || blockAir(bot, myMove.x, myMove.y, myMove.z))) {
                    botMove.jump = true;
                    equipItem(bot, garbageBlocks, "hand");
                    //holdWeapon = false;
                    placeBlock(bot, myMove.x, myMove.y - 1, myMove.z, false/*(myMove.y != bot.dunder.lastPos.y) ? Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z) : undefined*/);
                }

            }
};


        var botMove = {
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
        };
        var botIsDigging = false;
        var myWalkAngle = 0;
        var myAngle = 0;

function strictFollow(bot) {
        botMove = {
            "forward":false,
            "back":false,
            "left":false,
            "right":false,
            "sneak":false,
            "sprint":false,
            "jump":false,
            "isGrounded":botMove.isGrounded,
            "faceBackwards":botMove.faceBackwards - 1,
            "mlg":botMove.mlg - 1,
            "bucketTimer":botMove.bucketTimer - 1,
            "bucketTarget":{x:botMove.bucketTarget.x,y:botMove.bucketTarget.y,z:botMove.bucketTarget.z},
            "lastTimer":botMove.lastTimer,
        };
        if (botMove.mlg < -100) {botMove.mlg = -100;}
        if (botMove.bucketTimer < -100) {botMove.bucketTimer = -100;}
        if (botMove.faceBackwards < -100) {botMove.faceBackwards = -100;}
        var botSpeed = Math.sqrt(bot.entity.velocity.x * bot.entity.velocity.x + bot.entity.velocity.z * bot.entity.velocity.z);



        if (movesToGo.length > 0 && bot.dunder.lastPos.currentMove >= 0) {
            var myMove = movesToGo[bot.dunder.lastPos.currentMove];
            //console.log("e" + movesToGo.length + ", " + bot.dunder.lastPos.currentMove);
            bot.chat("/particle damage_indicator " + movesToGo[bot.dunder.lastPos.currentMove].x + " " + movesToGo[bot.dunder.lastPos.currentMove].y + " " + movesToGo[bot.dunder.lastPos.currentMove].z);
            bot.chat("/particle heart " + bot.dunder.lastPos.x + " " + bot.dunder.lastPos.y + " " + bot.dunder.lastPos.z);
            var goalBox = {"x":myMove.x, "y":myMove.y, "z":myMove.z, "w":1, "h":2, "d":1};
            var onPathBoxes = [];
            if (Math.floor(bot.dunder.lastPos.y) == myMove.y) {
                onPathBoxes = [
                    {"x":bot.dunder.lastPos.x, "y":bot.dunder.lastPos.y, "z":bot.dunder.lastPos.z, "w":1, "h":2, "d":1},
                ];
                var myX = Math.floor(bot.dunder.lastPos.x);
                var myZ = Math.floor(bot.dunder.lastPos.z);
                var checkerCount = 0;
                while (myX != myMove.x | myZ != myMove.z && checkerCount < 5) {
                    checkerCount++;
                    if (myX < myMove.x) {
                        myX++;
                    } else if (myX > myMove.x) {
                        myX--;
                    }
                    if (myZ < myMove.z) {
                        myZ++;
                    } else if (myZ > myMove.z) {
                        myZ--;
                    }
                    onPathBoxes.push({"x":myX, "y":myMove.y, "z":myZ, "w":1, "h":2, "d":1});
                }
            } else if (myMove.y < bot.dunder.lastPos.y) {
                if (myMove.x == bot.dunder.lastPos.x && myMove.z == bot.dunder.lastPos.z) {goalBox = {"x":myMove.x, "y":myMove.y - 1, "z":myMove.z, "w":1, "h":2, "d":1};}
                onPathBoxes = [
                    {"x":bot.dunder.lastPos.x, "y":bot.dunder.lastPos.y, "z":bot.dunder.lastPos.z, "w":1, "h":2, "d":1},
                    {"x":myMove.x, "y":myMove.y, "z":myMove.z, "w":1, "h":bot.dunder.lastPos.y - myMove.y + 2, "d":1},
                ];
                var myX = Math.floor(bot.dunder.lastPos.x);
                var myZ = Math.floor(bot.dunder.lastPos.z);
                var checkerCount = 0;
                while (myX != myMove.x | myZ != myMove.z && checkerCount < 5) {
                    checkerCount++;
                    if (myX < myMove.x) {
                        myX++;
                    } else if (myX > myMove.x) {
                        myX--;
                    }
                    if (myZ < myMove.z) {
                        myZ++;
                    } else if (myZ > myMove.z) {
                        myZ--;
                    }
                    onPathBoxes.push({"x":myX, "y":myMove.y - 0.5, "z":myZ, "w":1, "h":3, "d":1});
                }
            } else if (myMove.y > bot.dunder.lastPos.y) {
                onPathBoxes = [
                    {"x":Math.floor(bot.dunder.lastPos.x), "y":Math.floor(bot.dunder.lastPos.y), "z":Math.floor(bot.dunder.lastPos.z), "w":1, "h":3, "d":1},
                    //{"x":myMove.x, "y":myMove.y, "z":myMove.z, "w":1, "h":2,"d":1},
                ];
                var myX = Math.floor(bot.dunder.lastPos.x);
                var myZ = Math.floor(bot.dunder.lastPos.z);
                var checkerCount = 0;
                while (myX != myMove.x | myZ != myMove.z && checkerCount < 5) {
                    checkerCount++;
                    if (myX < myMove.x) {
                        myX++;
                    } else if (myX > myMove.x) {
                        myX--;
                    }
                    if (myZ < myMove.z) {
                        myZ++;
                    } else if (myZ > myMove.z) {
                        myZ--;
                    }
                    onPathBoxes.push({"x":myX, "y":myMove.y - 0.0, "z":myZ, "w":1, "h":2.0, "d":1});
                }
            }
            if (isSwim(myMove.mType)) {
                for (var i = 0; i < onPathBoxes.length; i++) {
                    onPathBoxes[i].y -= 0.5;
                    onPathBoxes[i].h += 1;
                }
                goalBox.y -= 0.5;
                goalBox.h += 1;
            }
            //onPathBoxes.push({"x":movesToGo[movesToGo.length - 1].x - 0.5, "y":movesToGo[movesToGo.length - 1].y - 0.5, "z":movesToGo[movesToGo.length - 1].z - 0.5, "w":2, "h":3, "d":2});

            onPath = false;
            for (var i = 0; i < onPathBoxes.length; i++) {
                var e = onPathBoxes[i];
                if (bot.entity.position.x + 0.52 > e.x && bot.entity.position.x - 0.52 < e.x + e.w &&
                    bot.entity.position.y - 1 < e.y + e.h + 0.2 && bot.entity.position.y + 1 >= e.y &&
                    bot.entity.position.z + 0.52 > e.z && bot.entity.position.z - 0.52 < e.z + e.d) {
                    onPath = true;
                    //console.log(JSON.stringify(onPathBoxes[i]));
                }
            }
            /*if (bot.dunder.jumpTarget) {
                bot.dunder.destinationTimer++;
                onPath = true;
            }*/
            bot.dunder.destinationTimer--;
            if (bot.dunder.destinationTimer < 0) {
                onPath = false;
            }
            if (!onPath) {
                //console.log("GET BACK IN FORMATION SOLDIER");
                if ((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) && movesToGo.length > 0 && bot.dunder.searchingPath < 0) {
                    findPath(bot, movesToGo[0].x, movesToGo[0].y, movesToGo[0].z, true);
                }
            } //else {console.log(bot.dunder.destinationTimer);}

            var myAngle = Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z);
            var myWalkAngle = Math.atan2(myMove.x - bot.entity.position.x + 0.5, bot.entity.position.z - 0.5 - myMove.z);
            if (myWalkAngle < myAngle - Math.PI) {
                myWalkAngle += Math.PI * 2;
                //console.log("fixed positive");
            } else if (myWalkAngle > myAngle + Math.PI) {
                myWalkAngle -= Math.PI * 2;
                //console.log("fixed negative");
            }

            //Executing the path
            var myAngle = Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z);
            var myWalkAngle = Math.atan2(myMove.x - bot.entity.position.x + 0.5, bot.entity.position.z - 0.5 - myMove.z);
            if (myWalkAngle < myAngle - Math.PI) {
                myWalkAngle += Math.PI * 2;
                //console.log("fixed positive");
            } else if (myWalkAngle > myAngle + Math.PI) {
                myWalkAngle -= Math.PI * 2;
                //console.log("fixed negative");
            }

            if (true) {
                botMove.forward = true;
                botMove.sprint = pathfinderOptions.sprint;
                if (bot.targetDigBlock) {botMove.forward = false;}
            }

            var jumpDir = {"x":(Math.floor(bot.dunder.lastPos.x) > myMove.x) ? -1 : 1, "z": (Math.floor(bot.dunder.lastPos.z) > myMove.z) ? -1 : 1};
            if (bot.dunder.lastPos.x == myMove.x) {jumpDir.x = 0;}
            if (bot.dunder.lastPos.z == myMove.z) {jumpDir.z = 0;}

            busyBuilding = false;
            if (!bot.dunder.jumpTarget || true) {
                takeCareOfBlock(bot, myMove);
            }

            /*if (bot.entity.onGround |
                bot.entity.isInWater |
                bot.entity.isInLava |
                isSwim(myMove.mType)  &&
                myMove.y + 0.2 < bot.entity.position.y &&
                blockSolid(bot, myMove.x, myMove.y, myMove.z) &&
                dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) &&
                canDigBlock(bot, myMove.x, myMove.y, myMove.z) &&
                !bot.targetDigBlock) {
                equipTool(bot, myMove.x, myMove.y, myMove.z);
                digBlock(bot, myMove.x, myMove.y, myMove.z);
                bot.dunder.isDigging = 2;
                console.log("DigDown Strict");
            } else if (bot.entity.onGround |
                bot.entity.isInWater |
                bot.entity.isInLava |
                isSwim(myMove.mType) &&
                myMove.y + 1.2 < bot.entity.position.y &&
                blockSolid(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z) &&
                dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) &&
                canDigBlock(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z) &&
                !bot.targetDigBlock) {
                equipTool(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z);
                digBlock(bot, myMove.x, Math.floor(bot.entity.position.y - 0.2), myMove.z);
                bot.dunder.isDigging = 2;
                console.log("DigDown FreeStyle");
            }*/
            if (bot.dunder.isDigging <= 0 && (myMove.mType == "walkJump" || myMove.mType == "walkDiagJump") && bot.entity.onGround && bot.entity.position.y < bot.dunder.lastPos.y + 1) {
                if (Math.abs(myMove.x - bot.dunder.lastPos.x) == 2 || Math.abs(myMove.z - bot.dunder.lastPos.z) == 2) {
                    //don't sprint on 1 block gaps
                    botMove.sprint = false;
                    //console.log("Slow down!");
                } else if ((Math.abs(myMove.x - bot.dunder.lastPos.x) >= 4 || Math.abs(myMove.z - bot.dunder.lastPos.z) >= 4)) {
                    console.log(bot.entity.onGround + ", " + botSpeed);
                    if (botSpeed < 0.125 && bot.dunder.needsSpeed <= -10) {
                        bot.dunder.needsSpeed = 5;
                    }
                }
                var speedEdgeGap = 0.2
                if (bot.dunder.needsSpeed <= 0 && ((Math.abs(myMove.x - bot.dunder.lastPos.x) == 1 || Math.abs(myMove.z - bot.dunder.lastPos.z) == 1) && myMove.y > bot.dunder.lastPos.y ||
                    dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) > Math.sqrt(2) &&
                    (jumpDir.x == 0 ||
                    jumpDir.x > 0 & bot.entity.position.x >= bot.dunder.lastPos.x + 0.5 + jumpDir.x * speedEdgeGap ||
                    jumpDir.x < 0 & bot.entity.position.x <= bot.dunder.lastPos.x + 0.5 + jumpDir.x * speedEdgeGap) &&
                    (jumpDir.z == 0 ||
                    jumpDir.z > 0 & bot.entity.position.z >= bot.dunder.lastPos.z + 0.5 + jumpDir.z * speedEdgeGap ||
                    jumpDir.z < 0 & bot.entity.position.z <= bot.dunder.lastPos.z + 0.5 + jumpDir.z * speedEdgeGap))) {
                    botMove.jump = true;
                } else if (bot.dunder.needsSpeed >= 0 && (jumpDir.x == 0 ||
                    jumpDir.x > 0 & bot.entity.position.x >= bot.dunder.lastPos.x + 0.5 - jumpDir.x * speedEdgeGap ||
                    jumpDir.x < 0 & bot.entity.position.x <= bot.dunder.lastPos.x + 0.5 - jumpDir.x * speedEdgeGap) &&
                    (jumpDir.z == 0 ||
                    jumpDir.z > 0 & bot.entity.position.z >= bot.dunder.lastPos.z + 0.5 - jumpDir.z * speedEdgeGap ||
                    jumpDir.z < 0 & bot.entity.position.z <= bot.dunder.lastPos.z + 0.5 - jumpDir.z * speedEdgeGap)) {
                    botMove.forward = false;
                    botMove.sprint = false;
                    botMove.back = true;
                }
                //Strafe correction

                    var shouldStrafeCorrect = true;
                    for (var i = bot.dunder.lastPos.currentMove; i > bot.dunder.lastPos.currentMove - 5 && i > 0; i--) {
                        if (!movesToGo[i + 1] || movesToGo[i + 1] && movesToGo[i].y <= movesToGo[i + 1].y) {
                            shouldStrafeCorrect = false;
                        }
                    }
                    /*console.log("A");
                    console.log(Math.abs(bot.entity.yaw - (-myWalkAngle)) < 0.25);
                    console.log(Math.abs(bot.entity.yaw - (-myWalkAngle)));
                    console.log("B");
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) - Math.PI * 2) < 0.25);
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) - Math.PI * 2));
                    console.log("C");
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) + Math.PI * 2) < 0.25);
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) + Math.PI * 2));*/
                    if (shouldStrafeCorrect && myMove.y <= bot.dunder.lastPos.y | Math.abs(myWalkAngle - myAngle) < 0.45 |
                        Math.abs(myMove.x - bot.dunder.lastPos.x) >= 2 | Math.abs(myMove.z - bot.dunder.lastPos.z) >= 2 && bot.entity.position.y < myMove.y - 0.2) {//qwerty
                        if (myMove.y > bot.dunder.lastPos.y && myWalkAngle - myAngle > 0.25) {
                            console.log("R");
                            botMove.right = true;
                        } else if (myMove.y > bot.dunder.lastPos.y && myWalkAngle - myAngle < -0.25) {
                            console.log("L");
                            botMove.left = true;
                        }
                    }


            }




                var lastPosSameAmount = true;
                if (movesToGo[bot.dunder.lastPos.currentMove - 1]) {
                    if (Math.abs(movesToGo[bot.dunder.lastPos.currentMove - 1].x - myMove.x) > 1 |
                        Math.abs(movesToGo[bot.dunder.lastPos.currentMove - 1].z - myMove.z) > 1 |
                        ((movesToGo[bot.dunder.lastPos.currentMove - 1].x - myMove.x) > 0) != ((myMove.x - bot.dunder.lastPos.x) > 0) |
                        ((movesToGo[bot.dunder.lastPos.currentMove - 1].z - myMove.z) > 0) != ((myMove.z - bot.dunder.lastPos.z) > 0) |
                        ((movesToGo[bot.dunder.lastPos.currentMove - 1].x - myMove.x) < 0) != ((myMove.x - bot.dunder.lastPos.x) < 0) |
                        ((movesToGo[bot.dunder.lastPos.currentMove - 1].z - myMove.z) < 0) != ((myMove.z - bot.dunder.lastPos.z) < 0)) {
                        lastPosSameAmount = false;
                    }
                }

            //path stuff
            if (myMove.mType == "start" || blockStand(bot, myMove.x, myMove.y - 1, myMove.z) & bot.entity.onGround & myMove.mType != "goUp" | isSwim(myMove.mType) | lastPosSameAmount & myMove.mType != "goUp" |
                myMove.mType == "goUp" & bot.entity.onGround & bot.entity.position.y >= myMove.y - 0.25 &&
                bot.entity.position.x + 0.2 < goalBox.x + 1 && bot.entity.position.x - 0.2 > goalBox.x &&
                bot.entity.position.y < goalBox.y + 2 && bot.entity.position.y + 2 >= goalBox.y &&
                bot.entity.position.z + 0.2 < goalBox.z + 1 && bot.entity.position.z - 0.2 > goalBox.z) {
                bot.dunder.lastPos = {"currentMove":bot.dunder.lastPos.currentMove - 1, "x":myMove.x, "y":myMove.y, "z":myMove.z, "mType":myMove.mType};
                botMove.jump = false;
                botMove.lastTimer = 1;
                if (bot.dunder.lastPos.currentMove < movesToGo.length - 2) {movesToGo.splice(bot.dunder.lastPos.currentMove + 1, movesToGo.length);}
                bot.dunder.destinationTimer = 30;
                //movesToGo.splice(movesToGo.length - 1, 1);
            }
                if (botMove.faceBackwards <= 0) {
                    bot.lookAt(new Vec3(myMove.x + 0.5, bot.dunder.lookY, myMove.z + 0.5), true);
                } else {
                    botMove.forward = !botMove.forward;
                    botMove.back = !botMove.back;
                    if (movesToGo[bot.dunder.lastPos.currentMove]) {
                        bot.lookAt(new Vec3(
                               bot.entity.position.x + (bot.entity.position.x - (movesToGo[bot.dunder.lastPos.currentMove].x + 0.5)),
                               bot.dunder.lookY,
                               bot.entity.position.z + (bot.entity.position.z - (movesToGo[bot.dunder.lastPos.currentMove].z + 0.5))),
                        25);
                    }
                }
            //console.log(movesToGo[bot.dunder.lastPos.currentMove]);
        } else {
            onPath = false;
        }
        if (!bot.targetDigBlock) {
            bot.dunder.lookY = bot.entity.position.y + 1.6;
        } else {
            bot.dunder.lookY = bot.targetDigBlock.position.y;
        }

            if (bot.entity.onGround && botMove.jump) {
                myAngle = Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z);
                myWalkAngle = Math.atan2(myMove.x - bot.entity.position.x + 0.5, bot.entity.position.z - 0.5 - myMove.z);
                //console.log("bot: " + bot.entity.yaw + "\npath: " + myAngle + "\ngoal: " + myWalkAngle);
                //bot.entity.yaw = -myWalkAngle;
            }

            bot.setControlState("jump", botMove.jump);
            bot.setControlState("forward", botMove.forward);
            bot.setControlState("back", botMove.back);
            bot.setControlState("left", botMove.left);
            bot.setControlState("right", botMove.right);
            bot.setControlState("sprint", botMove.sprint);
            //bot.setControlState("sneak", botMove.sneak);
            bot.dunder.controls.sneak = botMove.sneak;

        //extend the path when near the end of a path that hasn't reached the goal yet due to chunk borders
        if (bot.dunder.searchingPath <= 0 && !bot.dunder.goal.reached && movesToGo.length > 0 && movesToGo.length <= 10 && movesToGo[0].x != bot.dunder.goal.x | movesToGo[0].y != bot.dunder.goal.y & bot.dunder.goal.y != "no" | movesToGo[0].z != bot.dunder.goal.z) {
                console.log("Extending path through chunks...");
                if (bot.dunder.goal.y != "no") {
                    findPath(bot, 500, Math.floor(bot.dunder.goal.x), Math.round(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z), false, true);//Extending path here. "moveType" is not defined, line 1471
                } else {
                    findPath(bot, 500, Math.floor(bot.dunder.goal.x), "no", Math.floor(bot.dunder.goal.z), false, true);//Extending path here. "moveType" is not defined, line 1471
                }
        } else if (movesToGo.length > 0 && movesToGo.length <= 10) {
            //console.log("searching: " + botSearchingPath + ", bot.dunder.goal: " + JSON.stringify(bot.dunder.goal) + ", movesToGo: " + movesToGo.length + ", movesToGo[0]: " + JSON.stringify(movesToGo[0]));
        }

};

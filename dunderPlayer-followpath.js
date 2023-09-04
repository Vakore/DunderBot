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
            } else if ((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) /*& bot.entity.position.y >= myMove.y - 0.25 & bot.entity.position.y <= myMove.y + 0.25*/ | isSwim(myMove.mType) && !bot.targetDigBlock /*&& botDigDelay <= 0*/) {
                //console.log("DigForward?");
                if (blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z) ) {
                    console.log("DigForward A");
                    equipTool(bot, myMove.x, myMove.y + 1, myMove.z);
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, myMove.x, myMove.y + 1, myMove.z);
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (!blockWalk(bot, myMove.x, myMove.y, myMove.z) && blockSolid(bot, myMove.x, myMove.y, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y, myMove.z)) {
                    console.log("DigForward B");
                    equipTool(bot, myMove.x, myMove.y, myMove.z);
                    digBlock(bot, myMove.x, myMove.y, myMove.z);
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                }
            } 
            if ((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) & bot.entity.position.y >= myMove.y - 1.25 & bot.entity.position.y <= myMove.y + 0.25 | isSwim(myMove.mType) && !bot.targetDigBlock /*&& botDigDelay <= 0*/) {
                //console.log("DigForward?");
                if (bot.dunder.lastPos.y == myMove.y - 1 && blockSolid(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z)) &&
                    canDigBlock(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z)) ) {
                    console.log("Dig Up A");
                    equipTool(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z));
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, Math.floor(bot.dunder.lastPos.x), myMove.y + 1, Math.floor(bot.dunder.lastPos.z));
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z) ) {
                    console.log("Dig Up B");
                    equipTool(bot, myMove.x, myMove.y + 1, myMove.z);
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, myMove.x, myMove.y + 1, myMove.z);
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (!blockWalk(bot, myMove.x, myMove.y, myMove.z) && blockSolid(bot, myMove.x, myMove.y, myMove.z) &&
                    canDigBlock(bot, myMove.x, myMove.y, myMove.z)) {
                    console.log("Dig Up C");
                    equipTool(bot, myMove.x, myMove.y, myMove.z);
                    digBlock(bot, myMove.x, myMove.y, myMove.z);
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                }
            }
            if (/*!botIsDigging &&*/!isSwim(myMove.mType) && !bot.targetDigBlock && !blockStand(bot, myMove.x, myMove.y - 1, myMove.z) &&
                myMove.y == bot.dunder.lastPos.y & dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) /*|
                myMove.y != bot.dunder.lastPos.y & dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= dist3d(0, 0, 0, 3, 3, 3)*/) {
                //console.log("asdf");
                bot.dunder.botMove.forward = false;
                bot.dunder.botMove.sprint = false;
                bot.dunder.botMove.sneak = true;
                if (dist3d(bot.entity.position.x, 0, bot.entity.position.z, bot.dunder.lastPos.x + 0.5, 0, bot.dunder.lastPos.z + 0.5) >= Math.sqrt(0.35)) {bot.dunder.botMove.back = true;}
                if (breakAndPlaceBlock(bot, myMove.x, myMove.y - 1, myMove.z, true)) {
                    equipTool(bot, myMove.x, myMove.y - 1, myMove.z);
                    digBlock(bot, myMove.x, myMove.y - 1, myMove.z);
                    console.log("just a sec before bridging...");
                    busyBuilding = true;
                } else if (!bot.targetDigBlock && myMove.mType != "fall") {
                    //console.log("e");
                    equipItem(bot, garbageBlocks, "hand");
                    //holdWeapon = false;
                    placeBlock(bot, myMove.x, myMove.y - 1, myMove.z, false/*(myMove.y != bot.dunder.lastPos.y) ? Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z) : undefined*/);
                    /*if (botSpeed <= 0.1 && bot.dunder.lastPos.y <= myMove.y) {
                        bot.entity.position.x = bot.dunder.lastPos.x + 0.5;
                        bot.entity.position.z = bot.dunder.lastPos.z + 0.5;
                    }*/
                    //console.log("placeblock");
                    busyBuilding = true;
                    bot.dunder.botMove.faceBackwards = 4;
                }
            }
            if (myMove.mType == "goUp") {
                bot.dunder.botMove.sprint = false;
                bot.dunder.botMove.jump = false;
                if (bot.entity.isInWater || bot.entity.position.y <= myMove.y - 0.25 && bot.entity.onGround) {
                    bot.dunder.botMove.jump = true;
                }
                //console.log((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) + ", " + blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) + ", " + canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z));
                if (/*(bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) &&*/ blockSolid(bot, myMove.x, myMove.y + 1, myMove.z) && canDigBlock(bot, myMove.x, myMove.y + 1, myMove.z)) {
                    console.log("Dig UP UP");
                    equipTool(bot, myMove.x, myMove.y + 1, myMove.z);
                    //console.log(bot.blockAt(new Vec3(myMove.x, myMove.y + 1, myMove.z)));
                    digBlock(bot, myMove.x, myMove.y + 1, myMove.z);
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.botMove.jump = false;
                    bot.dunder.isDigging = 2;
                    busyBuilding = true;
                } else if (breakAndPlaceBlock(bot, myMove.x, myMove.y - 1, myMove.z, true)) {
                    equipTool(bot, myMove.x, myMove.y - 1, myMove.z);
                    digBlock(bot, myMove.x, myMove.y - 1, myMove.z);
                    console.log("just a sec before pillaring...");
                    bot.dunder.botMove.jump = false;
                    busyBuilding = true;
                } else if (bot.entity.position.y > myMove.y - 1 && (blockAir(bot, myMove.x, myMove.y - 1, myMove.z) || blockAir(bot, myMove.x, myMove.y, myMove.z))) {
                    bot.dunder.botMove.jump = true;
                    equipItem(bot, garbageBlocks, "hand");
                    //holdWeapon = false;
                    placeBlock(bot, myMove.x, myMove.y - 1, myMove.z, false/*(myMove.y != bot.dunder.lastPos.y) ? Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z) : undefined*/);
                }

            }
};


        /*var bot.dunder.botMove = {
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
        };*/
        var botIsDigging = false;
        var myWalkAngle = 0;
        var myAngle = 0;

function strictFollow(bot) {
    //try {
        bot.dunder.botMove = {
            "forward":false,
            "back":false,
            "left":false,
            "right":false,
            "sneak":false,
            "sprint":false,
            "jump":false,
            "isGrounded":bot.dunder.botMove.isGrounded,
            "faceBackwards":bot.dunder.botMove.faceBackwards - 1,
            "mlg":bot.dunder.botMove.mlg - 1,
            "bucketTimer":bot.dunder.botMove.bucketTimer - 1,
            "bucketTarget":{x:bot.dunder.botMove.bucketTarget.x,y:bot.dunder.botMove.bucketTarget.y,z:bot.dunder.botMove.bucketTarget.z},
            "lastTimer":bot.dunder.botMove.lastTimer,
        };
        if (bot.dunder.botMove.mlg < -100) {bot.dunder.botMove.mlg = -100;}
        if (bot.dunder.botMove.bucketTimer < -100) {bot.dunder.botMove.bucketTimer = -100;}
        if (bot.dunder.botMove.faceBackwards < -100) {bot.dunder.botMove.faceBackwards = -100;}
        var botSpeed = Math.sqrt(bot.entity.velocity.x * bot.entity.velocity.x + bot.entity.velocity.z * bot.entity.velocity.z);



        if (bot.dunder.movesToGo.length > 0 && bot.dunder.lastPos.currentMove >= 0) {
            var myMove = bot.dunder.movesToGo[bot.dunder.lastPos.currentMove];
            //console.log("e" + bot.dunder.movesToGo.length + ", " + bot.dunder.lastPos.currentMove);
            if (bot.dunder.chatParticles && bot.dunder.lastPos && bot.dunder.lastPos.currentMove && bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]) {
                bot.chat("/particle damage_indicator " + bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x + " " + bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y + " " + bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z);
                bot.chat("/particle heart " + bot.dunder.lastPos.x + " " + bot.dunder.lastPos.y + " " + bot.dunder.lastPos.z);
            }
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
            //onPathBoxes.push({"x":bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].x - 0.5, "y":bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].y - 0.5, "z":bot.dunder.movesToGo[bot.dunder.movesToGo.length - 1].z - 0.5, "w":2, "h":3, "d":2});

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

            //Jump sprinting on path(WIP)
            if (bot.dunder.jumpTarget && bot.dunder.jumpTargetDelay <= 0 && bot.dunder.movesToGo.length > 2) {
                bot.dunder.destinationTimer++;
                onPath = true;
            } else if (!bot.dunder.lastPosOnPath) {
                onPath = false;
            }

            if (!onPath) {
                if (dunderDebug) {console.log("GET BACK IN FORMATION SOLDIER");}
                if ((bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) && bot.dunder.movesToGo.length > 0 && bot.dunder.searchingPath < 0) {
                    //console.log("OK");
                    if (dunderDebug) {console.log(bot.dunder.movesToGo[0]);}
                    findPath(bot, dunderBotPathfindDefaults, 7500, bot.dunder.movesToGo[0].x, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z, true, false);
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
                bot.dunder.botMove.forward = true;
                bot.dunder.botMove.sprint = bot.dunder.pathfinderOptions.sprint;
                if (bot.targetDigBlock) {
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    //bot.entity.velocity.x = 0;
                    //bot.entity.velocity.z = 0;
                    var stayStill = attemptToStayStill(bot, bot.dunder.lastPos.x + 0.5, bot.dunder.lastPos.y, bot.dunder.lastPos.z + 0.5);
                     bot.dunder.botMove.forward = stayStill.forward;
                     bot.dunder.botMove.back = stayStill.back;
                     bot.dunder.botMove.left = stayStill.left;
                     bot.dunder.botMove.right = stayStill.right;
                     //console.log(JSON.stringify(stayStill));
                }
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
            if (bot.dunder.isDigging <= 0 && (myMove.mType == "walkJump" || myMove.mType == "walkDiagJump") && (bot.entity.onGround || bot.entity.isInWater) && bot.entity.position.y < bot.dunder.lastPos.y + 1) {
              if (!bot.entity.isInWater) {
                if (Math.abs(myMove.x - bot.dunder.lastPos.x) == 2 || Math.abs(myMove.z - bot.dunder.lastPos.z) == 2) {
                    //don't sprint on 1 block gaps
                    bot.dunder.botMove.sprint = false;
                    //console.log("Slow down!");
                } else if ((Math.abs(myMove.x - bot.dunder.lastPos.x) >= 4 || Math.abs(myMove.z - bot.dunder.lastPos.z) >= 4) && botSpeed < 0.13 || Math.abs(myMove.x - bot.dunder.lastPos.x) >= 3 && Math.abs(myMove.z - bot.dunder.lastPos.z) >= 3) {
                    console.log(bot.entity.onGround + ", " + botSpeed);
                    if (botSpeed < 0.15 && bot.dunder.needsSpeed <= -10 && bot.entity.onGround) {
                        bot.dunder.needsSpeed = 5;
                    }
                }
                var speedEdgeGap = 0.2;
                var speedEdgeGap2 = 0.25;
                if (bot.dunder.needsSpeed <= 0 && ((Math.abs(myMove.x - bot.dunder.lastPos.x) == 1 || Math.abs(myMove.z - bot.dunder.lastPos.z) == 1) && myMove.y > bot.dunder.lastPos.y ||
                    dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) > Math.sqrt(2) &&
                    (jumpDir.x == 0 ||
                    jumpDir.x > 0 & bot.entity.position.x >= bot.dunder.lastPos.x + 0.5 + jumpDir.x * speedEdgeGap2 ||
                    jumpDir.x < 0 & bot.entity.position.x <= bot.dunder.lastPos.x + 0.5 + jumpDir.x * speedEdgeGap2) &&
                    (jumpDir.z == 0 ||
                    jumpDir.z > 0 & bot.entity.position.z >= bot.dunder.lastPos.z + 0.5 + jumpDir.z * speedEdgeGap2 ||
                    jumpDir.z < 0 & bot.entity.position.z <= bot.dunder.lastPos.z + 0.5 + jumpDir.z * speedEdgeGap2))) {
                    bot.dunder.botMove.jump = true;
                } else if (bot.dunder.needsSpeed >= 0 && (jumpDir.x == 0 ||
                    jumpDir.x > 0 & bot.entity.position.x >= bot.dunder.lastPos.x + 0.5 - jumpDir.x * speedEdgeGap ||
                    jumpDir.x < 0 & bot.entity.position.x <= bot.dunder.lastPos.x + 0.5 - jumpDir.x * speedEdgeGap) &&
                    (jumpDir.z == 0 ||
                    jumpDir.z > 0 & bot.entity.position.z >= bot.dunder.lastPos.z + 0.5 - jumpDir.z * speedEdgeGap ||
                    jumpDir.z < 0 & bot.entity.position.z <= bot.dunder.lastPos.z + 0.5 - jumpDir.z * speedEdgeGap)) {
                    bot.dunder.botMove.forward = false;
                    bot.dunder.botMove.sprint = false;
                    bot.dunder.botMove.back = true;
                }
              } else {bot.dunder.botMove.jump = true;}
                //Strafe correction

                    var shouldStrafeCorrect = true;
                    for (var i = bot.dunder.lastPos.currentMove; i > bot.dunder.lastPos.currentMove - 5 && i > 0; i--) {
                        if (!bot.dunder.movesToGo[i + 1] || bot.dunder.movesToGo[i + 1] && bot.dunder.movesToGo[i].y <= bot.dunder.movesToGo[i + 1].y) {
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
                            bot.dunder.botMove.right = true;
                        } else if (myMove.y > bot.dunder.lastPos.y && myWalkAngle - myAngle < -0.25) {
                            console.log("L");
                            bot.dunder.botMove.left = true;
                        }
                    }


            } else if (myMove.mType == "swimSlow") {
                shouldSwimFast = false;
                bot.dunder.botMove.forward = true;
                if (bot.entity.position.y < myMove.y + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) || bot.entity.position.y < myMove.y + 1.5 && !blockWater(bot, myMove.x, myMove.y + 1, myMove.z)) {
                    bot.dunder.botMove.jump = true;
                } else if (bot.entity.position.y > myMove.y + 0.2 + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) && blockWater(bot, myMove.x, myMove.y + 1, myMove.z)) {
                    bot.dunder.botMove.sneak = true;
                    if (bot.entity.velocity.y > -1.0) {bot.entity.velocity.y -= 0.01;}
                }
            } else if (myMove.mType == "swimFast" || myMove.mType == "fallWater") {
                if (bot.entity.position.y > myMove.y + 0.3 + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) &&
                    bot.entity.velocity.y > -1.0 /*&& bot.entity.velocity.y < (bot.entity.position.y - (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y + 0.2)) / 2*/) {
                    bot.entity.velocity.y -= 0.05;
                    //console.log("swimDown");
                } else if (bot.entity.position.y < myMove.y + 0.1 + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) && bot.entity.velocity.y < 1.0) {
                    bot.entity.velocity.y += 0.05;
                    //console.log("swimUp");
                }
                var myMoveDir = {x:myMove.x - bot.dunder.lastPos.x, z:myMove.z - bot.dunder.lastPos.z};
                if (blockLilypad(bot, myMove.x, myMove.y + 2, myMove.z)) {
                    digBlock(bot, myMove.x, myMove.y + 2, myMove.z);
                } else if (blockLilypad(bot, myMove.x - myMoveDir.x, myMove.y + 2, myMove.z)) {
                    digBlock(bot, myMove.x - myMoveDir.x, myMove.y + 2, myMove.z);
                } else if (blockLilypad(bot, myMove.x, myMove.y + 2, myMove.z - myMoveDir.z)) {
                    digBlock(bot, myMove.x, myMove.y + 2, myMove.z - myMoveDir.z);
                }
            } else if (myMove.mType == "lava" && bot.entity.position.y < bot.dunder.movesToGo[lastPos.currentMove].y + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z)) {
                bot.dunder.botMove.jump = true;
            }




                var lastPosSameAmount = true;
                if (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1]) {
                    if (Math.abs(bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1].x - myMove.x) > 1 |
                        Math.abs(bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1].z - myMove.z) > 1 |
                        ((bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1].x - myMove.x) > 0) != ((myMove.x - bot.dunder.lastPos.x) > 0) |
                        ((bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1].z - myMove.z) > 0) != ((myMove.z - bot.dunder.lastPos.z) > 0) |
                        ((bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1].x - myMove.x) < 0) != ((myMove.x - bot.dunder.lastPos.x) < 0) |
                        ((bot.dunder.movesToGo[bot.dunder.lastPos.currentMove - 1].z - myMove.z) < 0) != ((myMove.z - bot.dunder.lastPos.z) < 0)) {
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
                bot.dunder.botMove.jump = false;
                bot.dunder.botMove.lastTimer = 1;
                if (bot.dunder.lastPos.currentMove < bot.dunder.movesToGo.length - 2) {bot.dunder.movesToGo.splice(bot.dunder.lastPos.currentMove + 1, bot.dunder.movesToGo.length);}
                bot.dunder.destinationTimer = 30;
                if (isSwim(bot.dunder.lastPos.moveType)) {bot.dunder.destinationTimer += 20;}
                //bot.dunder.movesToGo.splice(bot.dunder.movesToGo.length - 1, 1);
            }
                if (bot.dunder.botMove.faceBackwards <= 0) {
                    bot.lookAt(new Vec3(myMove.x + 0.5, bot.dunder.lookY, myMove.z + 0.5), true);
                } else {
                    bot.dunder.botMove.forward = !bot.dunder.botMove.forward;
                    bot.dunder.botMove.back = !bot.dunder.botMove.back;
                    if (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]) {
                        bot.lookAt(new Vec3(
                               bot.entity.position.x + (bot.entity.position.x - (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x + 0.5)),
                               bot.dunder.lookY,
                               bot.entity.position.z + (bot.entity.position.z - (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z + 0.5))),
                        25);
                    }
                }
            if (dunderDebug) {console.log(bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]);}
        } else {
            onPath = false;
            if (dist3d(bot.dunder.lastPos.x + 0.5, bot.dunder.lastPos.y, bot.dunder.lastPos.z + 0.5, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < 2) {
                var stayStill = attemptToStayStill(bot, bot.dunder.lastPos.x + 0.5, bot.dunder.lastPos.y, bot.dunder.lastPos.z + 0.5);
                bot.dunder.botMove.forward = stayStill.forward;
                bot.dunder.botMove.back = stayStill.back;
                bot.dunder.botMove.left = stayStill.left;
                bot.dunder.botMove.right = stayStill.right;
            }
        }
        if (!bot.targetDigBlock) {
            bot.dunder.lookY = bot.entity.position.y + 1.6;
        } else {
            bot.dunder.lookY = bot.targetDigBlock.position.y;
        }

            if (bot.entity.onGround && bot.dunder.botMove.jump) {
                myAngle = Math.atan2(myMove.x - bot.dunder.lastPos.x, bot.dunder.lastPos.z - myMove.z);
                myWalkAngle = Math.atan2(myMove.x - bot.entity.position.x + 0.5, bot.entity.position.z - 0.5 - myMove.z);
                //console.log("bot: " + bot.entity.yaw + "\npath: " + myAngle + "\ngoal: " + myWalkAngle);
                //bot.entity.yaw = -myWalkAngle;
            }

        //disabling water clutching due to jump sprinting being WIP
        if (false &&bot.entity.velocity.y < -0.3518 && bot.entity.velocity.y <= -0.5518) {
            bot.dunder.lookY = bot.entity.position.y - 20;
        if (bot.dunder.onFire && bot.entity.onGround || true) {
            var fireCandidates = [false, false, false, false];
            for (var i = 0; i < 23; i++) {
                if (Math.floor(bot.entity.position.y) - i <= -64) {
                    i = 23;
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
            if (myFireCandidate && myFireCandidate.position) {
                bot.lookAt(myFireCandidate.position.offset(0.5, 0, 0.5), 200);
            }
            //console.log(bot.entity.pitch);
            if (myFireCandidate && bot.dunder.cursorBlock && bot.dunder.cursorBlock.position.equals(myFireCandidate.position) && dist3d(0, (bot.entity.position.y + 1.75), 0, 0, bot.dunder.cursorBlock.position.y, 0) <= 4.5 && bot.entity.heldItem && (bot.entity.heldItem.name == 'water_bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                bot.swingArm();
                bot.dunder.looktimer = 1;
                console.log("clutch pls");
            } else if (!myFireCandidate) {console.log("no blocks");}
        }
        }

            //Jump sprinting on path(WIP)
            if (bot.dunder.jumpSprintAlongPath) {
                doJumpSprintStuff(bot);
            }

            bot.setControlState("jump", bot.dunder.botMove.jump);
            bot.setControlState("forward", bot.dunder.botMove.forward);
            bot.setControlState("back", bot.dunder.botMove.back);
            bot.setControlState("left", bot.dunder.botMove.left);
            bot.setControlState("right", bot.dunder.botMove.right);
            bot.setControlState("sprint", (bot.dunder.botMove.sprint &&  bot.dunder.botMove.forward));
            //bot.setControlState("sneak", bot.dunder.botMove.sneak);
            bot.dunder.controls.sneak = bot.dunder.botMove.sneak;

        //extend the path when near the end of a path that hasn't reached the goal yet due to chunk borders
        if (bot.dunder.searchingPath <= 0 && !bot.dunder.goal.reached && bot.dunder.movesToGo.length > 0 && bot.dunder.movesToGo.length <= 10 && bot.dunder.movesToGo[0].x != bot.dunder.goal.x | bot.dunder.movesToGo[0].y != bot.dunder.goal.y & bot.dunder.goal.y != "no" | bot.dunder.movesToGo[0].z != bot.dunder.goal.z) {
                if (bot.targetDigBlock) {bot.stopDigging();}
                console.log("Extending path through chunks...");
                if (bot.dunder.goal.y != "no") {
                    findPath(bot, dunderBotPathfindDefaults, 7400, Math.floor(bot.dunder.goal.x), Math.round(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z), false, true);//Extending path here. "moveType" is not defined, line 1471
                    //console.log("uh....");
                } else {
                    //console.log("oqiwth....");
                    findPath(bot, dunderBotPathfindDefaults, 7400, Math.floor(bot.dunder.goal.x), "no", Math.floor(bot.dunder.goal.z), false, true);//Extending path here. "moveType" is not defined, line 1471
                }
        } else if (bot.dunder.movesToGo.length > 0 && bot.dunder.movesToGo.length <= 10) {
            //console.log("searching: " + botSearchingPath + ", bot.dunder.goal: " + JSON.stringify(bot.dunder.goal) + ", bot.dunder.movesToGo: " + bot.dunder.movesToGo.length + ", bot.dunder.movesToGo[0]: " + JSON.stringify(bot.dunder.movesToGo[0]));
        }
    //} catch (e) {
    //    console.error("strictFollow error \n" + e); 
    //}
};












function attemptToStayStill(bot, x, y, z) {
    var myStates = [
        new PlayerState(bot, {forward: true, back: false, left: false, right: false, jump: false,sprint: false,sneak: false,}),
        new PlayerState(bot, {forward: false, back: true, left: false, right: false, jump: false,sprint: false,sneak: false,}),
        new PlayerState(bot, {forward: false, back: false, left: true, right: false, jump: false,sprint: false,sneak: false,}),
        new PlayerState(bot, {forward: false, back: false, left: false, right: true, jump: false,sprint: false,sneak: false,}),
        new PlayerState(bot, {forward: false, back: false, left: false, right: false, jump: false,sprint: false,sneak: false,}),
    ];
    //var myState = JSON.parse(JSON.stringify(stateBase));
    //myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < myStates.length; j++) {
            bot.physics.simulatePlayer(myStates[j], bot.world);
        }
    }
    
    var myBestState = 0;
    for (var i = 1; i < myStates.length; i++) {
        if (dist3d(myStates[i].pos.x, myStates[i].pos.y, myStates[i].pos.z, x, y, z) < dist3d(myStates[myBestState].pos.x, myStates[myBestState].pos.y, myStates[myBestState].pos.z, x, y, z)) {
            myBestState = i;
        }
    }
    
    return [
        {"forward":true,"back":false,"left":false,"right":false},
        {"forward":false,"back":true,"left":false,"right":false},
        {"forward":false,"back":false,"left":true,"right":false},
        {"forward":false,"back":false,"left":false,"right":true},
        {"forward":false,"back":false,"left":false,"right":false},
    ][myBestState];
};

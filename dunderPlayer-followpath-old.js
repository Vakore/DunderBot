function strictFollow(bot) {
        if (movesToGo.length > 0 && lastPos.currentMove >= 0) {
            var myMove = movesToGo[lastPos.currentMove];
            //console.log("e" + movesToGo.length + ", " + lastPos.currentMove);
            bot.chat("/particle damage_indicator " + movesToGo[lastPos.currentMove].x + " " + movesToGo[lastPos.currentMove].y + " " + movesToGo[lastPos.currentMove].z);
            bot.chat("/particle heart " + lastPos.x + " " + lastPos.y + " " + lastPos.z);
            var goalBox = {"x":myMove.x, "y":myMove.y, "z":myMove.z, "w":1, "h":2, "d":1};
            var onPathBoxes = [];
            if (Math.floor(lastPos.y) == myMove.y) {
                onPathBoxes = [
                    {"x":lastPos.x, "y":lastPos.y, "z":lastPos.z, "w":1, "h":2, "d":1},
                ];
                var myX = Math.floor(lastPos.x);
                var myZ = Math.floor(lastPos.z);
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
            } else if (myMove.y < lastPos.y) {
                if (myMove.x == lastPos.x && myMove.z == lastPos.z) {goalBox = {"x":myMove.x, "y":myMove.y - 1, "z":myMove.z, "w":1, "h":2, "d":1};}
                onPathBoxes = [
                    {"x":lastPos.x, "y":lastPos.y, "z":lastPos.z, "w":1, "h":2, "d":1},
                    {"x":myMove.x, "y":myMove.y, "z":myMove.z, "w":1, "h":lastPos.y - myMove.y + 2, "d":1},
                ];
                var myX = Math.floor(lastPos.x);
                var myZ = Math.floor(lastPos.z);
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
            } else if (myMove.y > lastPos.y) {
                onPathBoxes = [
                    {"x":Math.floor(lastPos.x), "y":Math.floor(lastPos.y), "z":Math.floor(lastPos.z), "w":1, "h":3, "d":1},
                    //{"x":myMove.x, "y":myMove.y, "z":myMove.z, "w":1, "h":2,"d":1},
                ];
                var myX = Math.floor(lastPos.x);
                var myZ = Math.floor(lastPos.z);
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
            if (bot.dunder.jumpTarget) {
                botDestinationTimer++;
                onPath = true;
            }
            botDestinationTimer--;
            if (botDestinationTimer < 0) {
                onPath = false;
            }
            if (!onPath) {
                console.log("GET BACK IN FORMATION SOLDIER");
                if (bot.entity.onGround | bot.entity.isInWater | bot.entity.isInLava && movesToGo.length > 0 && botSearchingPath < 0) {
                    findPath(bot, movesToGo[0].x, movesToGo[0].y, movesToGo[0].z, true);
                }
            }

            var myAngle = Math.atan2(myMove.x - lastPos.x, lastPos.z - myMove.z);
            var myWalkAngle = Math.atan2(myMove.x - bot.entity.position.x + 0.5, bot.entity.position.z - 0.5 - myMove.z);
            if (myWalkAngle < myAngle - Math.PI) {
                myWalkAngle += Math.PI * 2;
                //console.log("fixed positive");
            } else if (myWalkAngle > myAngle + Math.PI) {
                myWalkAngle -= Math.PI * 2;
                //console.log("fixed negative");
            }

            //Executing the path
            if (true) {
                botMove.forward = true;
                botMove.sprint = pathfinderOptions.sprint;
                if (bot.targetDigBlock) {botMove.forward = false;}
            }

            var jumpDir = {"x":(Math.floor(lastPos.x) > myMove.x) ? -1 : 1, "z": (Math.floor(lastPos.z) > myMove.z) ? -1 : 1};
            if (lastPos.x == myMove.x) {jumpDir.x = 0;}
            if (lastPos.z == myMove.z) {jumpDir.z = 0;}
            //console.log(myMove);
            //console.log(bot.blockAt(new Vec3(Math.floor(myMove.x), Math.floor(myMove.y), Math.floor(myMove.z))).type);
            //console.log(blockWater(bot, Math.floor(myMove.x), Math.floor(myMove.y), Math.floor(myMove.z)));
            //stuff here(!!!)
            busyBuilding = false;
            if (!bot.dunder.jumpTarget /*&& jumpTargetDelay < 0*/) {
                takeCareOfBlock(myMove);
            }
            /*if (!busyBuilding && movesToGo[lastPos.currentMove - 1]) {
                console.log("WE DOING IT");
                takeCareOfBlock(movesToGo[lastPos.currentMove - 1]);
                if (!busyBuilding && movesToGo[lastPos.currentMove - 2]) {
                    console.log("WE DOING IT AGAIN");
                    takeCareOfBlock(movesToGo[lastPos.currentMove - 2]);
                }
            }*/
            if (myMove.mType == "goUp") {//bruh bruh
                if (bot.entity.position.y <= myMove.y - 0.25 ||
                    blockLava(bot, lastPos.x, lastPos.y, lastPos.z) || blockWater(bot, lastPos.x, lastPos.y, lastPos.z) || 
                    blockLava(bot, lastPos.x, lastPos.y + 1, lastPos.z) || blockWater(bot, lastPos.x, lastPos.y + 1, lastPos.z)) {
                    if (!blockLava(bot, lastPos.x, lastPos.y, lastPos.z) && !blockLava(bot, lastPos.x, lastPos.y + 1, lastPos.z)) {
                        botMove.jump = true;
                    } else if (bot.entity.velocity.y < 1.0 && Math.floor(bot.entity.position.x) == lastPos.x && Math.floor(bot.entity.position.z) == lastPos.z &&
                               Math.floor(bot.entity.position.y) == lastPos.y & blockLava(bot, lastPos.x, lastPos.y, lastPos.z) |
                               Math.floor(bot.entity.position.y) == lastPos.y + 1 & blockLava(bot, lastPos.x, lastPos.y + 1, lastPos.z)) {
                        bot.entity.velocity.y += 0.1;
                        console.log("EEEEEEE");
                        botMove.jump = true;
                    }
                }
                botMove.sprint = false;
                //if (dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.25)) {botMove.forward = false;}
            } else if (myMove.mType == "walk" & dist3d(lastPos.x, 0, lastPos.z, myMove.x, 0, myMove.z) > Math.sqrt(3) | myMove.mType == "walkDiag" & dist3d(lastPos.x, 0, lastPos.z, myMove.x, 0, myMove.z) > Math.sqrt(3) |
                myMove.mType == "walkJump" | myMove.mType == "walkDiagJump" &&
                /*dist3d(lastPos.x, 0, lastPos.z, myMove.x, 0, myMove.z) > Math.sqrt(3) &&*/ dist3d(lastPos.x, 0, lastPos.z, myMove.x, 0, myMove.z) < Math.sqrt(32)) {
                if (myMove.mType == "walk" | myMove.mType == "walkDiag") {console.log("you sure you should be jumping right now?");}
                //console.log("maybe" + (myMove.y >= lastPos.y & (Math.abs(myMove.x - lastPos.x) || Math.abs(myMove.z - lastPos.z))));
                if (Math.abs(myMove.x - lastPos.x) == 1 | Math.abs(myMove.z - lastPos.z) == 1 && myMove.y > lastPos.y ||
                    dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) > Math.sqrt(2) &&
                    jumpDir.x == 0 |
                    jumpDir.x > 0 & bot.entity.position.x >= lastPos.x + 0.5 + jumpDir.x * 0.2 |
                    jumpDir.x < 0 & bot.entity.position.x <= lastPos.x + 0.5 + jumpDir.x * 0.2 &&
                    jumpDir.z == 0 |
                    jumpDir.z > 0 & bot.entity.position.z >= lastPos.z + 0.5 + jumpDir.z * 0.2 |
                    jumpDir.z < 0 & bot.entity.position.z <= lastPos.z + 0.5 + jumpDir.z * 0.2) {
                    //console.log("parkour jump " + (myWalkAngle - myAngle));
                    var shouldStrafeCorrect = true;
                    for (var i = lastPos.currentMove; i > lastPos.currentMove - 5 && i > 0; i--) {
                        if (!movesToGo[i + 1] || movesToGo[i + 1] && movesToGo[i].y <= movesToGo[i + 1].y) {
                            shouldStrafeCorrect = false;
                        }
                    }
                    //console.log(myWalkAngle - myAngle);
                    //console.log(Math.abs(bot.entity.yaw - (-myWalkAngle)));
                    //console.log(bot.entity.yaw);
                    console.log("A");
                    console.log(Math.abs(bot.entity.yaw - (-myWalkAngle)) < 0.25);
                    console.log(Math.abs(bot.entity.yaw - (-myWalkAngle)));
                    console.log("B");
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) - Math.PI * 2) < 0.25);
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) - Math.PI * 2));
                    console.log("C");
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) + Math.PI * 2) < 0.25);
                    console.log(Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) + Math.PI * 2));
                    if (shouldStrafeCorrect && myMove.y <= lastPos.y | Math.abs(myWalkAngle - myAngle) < 0.45 |
                        Math.abs(myMove.x - lastPos.x) >= 2 | Math.abs(myMove.z - lastPos.z) >= 2 && bot.entity.position.y < myMove.y - 0.2) {//qwerty
                        if (myMove.y > lastPos.y && myWalkAngle - myAngle > 0.25) {
                            console.log("R");
                            botMove.right = true;
                        } else if (myMove.y > lastPos.y && myWalkAngle - myAngle < -0.25) {
                            console.log("L");
                            botMove.left = true;
                        }
                    }
                    if (botMove.lastTimer < 0 && botMove.isGrounded >= 0 && (bot.entity.position.y < myMove.y - 0.25 || myMove.y <= lastPos.y/*bot.entity.position.y >= myMove.y - 0.25*/) &&
                        (Math.abs(bot.entity.yaw - (-myWalkAngle)) < 0.25 || Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) - Math.PI * 2) < 0.25 || Math.abs(Math.abs(bot.entity.yaw - (-myWalkAngle)) + Math.PI * 2) < 0.25)) {
                        botMove.jump = true;
                    }
                    if (myMove.y > lastPos.y | dist3d(lastPos.x, 0, lastPos.z, myMove.x, 0, myMove.z) >= Math.sqrt(16) && bot.entity.position.y <= lastPos.y + 1.05) {
                        //bot.entity.velocity.x = Math.sin(myWalkAngle) * 0.22;
                        //bot.entity.velocity.z = -Math.cos(myWalkAngle) * 0.22;
                        //if (myMove.y > lastPos.y) {bot.entity.velocity.y = 0.35;}
                    }
                    botSpeed = Math.sqrt(bot.entity.velocity.x * bot.entity.velocity.x + bot.entity.velocity.z * bot.entity.velocity.z);
                } else if (dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) < Math.sqrt(6) &&
                           dist3d(lastPos.x, 0, lastPos.z, myMove.x, 0, myMove.z) <= Math.sqrt(9) &&
                           blockAir(bot, myMove.x, myMove.y, myMove.z) && myMove.y <= lastPos.y &&
                           Math.abs(myMove.x - lastPos.x) >= 3 | Math.abs(myMove.z - lastPos.z) >= 3 | myMove.y == lastPos.y) {
                    //This is a fall
                    botMove.sprint = false;
                } else if (myMove.y <= lastPos.y && dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5) &&
                           myMove.x == lastPos.z && myMove.z == lastPos.z ||
                           myMove.y < lastPos.y /*&& dist3d(bot.entity.position.x, 0, bot.entity.position.z, myMove.x + 0.5, 0, myMove.z + 0.5) <= Math.sqrt(0.5)*/) {
                    //straight up or straight down
                    botMove.sprint = false;
                }
                var lastPosIsLegit = false;
                var lastPosSameDir = true;
                if (movesToGo[lastPos.currentMove - 1]) {
                    lastPosIsLegit = true;
                    if (movesToGo[lastPos.currentMove - 1].x - myMove.x != jumpDir.x ||
                        movesToGo[lastPos.currentMove - 1].z - myMove.z != jumpDir.z) {
                        lastPosSameDir = false;
                    }
                }
                if (Math.abs(myMove.x - lastPos.x) == 2 | Math.abs(myMove.z - lastPos.z) == 2/* && !lastPosIsLegit | !lastPosSameDir*/) {
                    //don't sprint on 1 block gaps
                    botMove.sprint = false;
                    //console.log("Slow down!");
                }
            } else if (myMove.mType == "swimSlow") {
                shouldSwimFast = false;
                botMove.forward = true;
                if (bot.entity.position.y < myMove.y + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) || bot.entity.position.y < myMove.y + 1.5 && !blockWater(bot, myMove.x, myMove.y + 1, myMove.z)) {
                    botMove.jump = true;
                } else if (bot.entity.position.y > myMove.y + 0.2 + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) && blockWater(bot, myMove.x, myMove.y + 1, myMove.z)) {
                    botMove.sneak = true;
                    if (bot.entity.velocity.y > -1.0) {bot.entity.velocity.y -= 0.01;}
                }
            } else if (myMove.mType == "swimFast" || myMove.mType == "fallWater") {
                if (bot.entity.position.y > myMove.y + 0.3 + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) &&
                    bot.entity.velocity.y > -1.0 /*&& bot.entity.velocity.y < (bot.entity.position.y - (movesToGo[lastPos.currentMove].y + 0.2)) / 2*/) {
                    bot.entity.velocity.y -= 0.05;
                    //console.log("swimDown");
                } else if (bot.entity.position.y < myMove.y + 0.1 + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z) && bot.entity.velocity.y < 1.0) {
                    bot.entity.velocity.y += 0.05;
                    //console.log("swimUp");
                }
                var myMoveDir = {x:myMove.x - lastPos.x, z:myMove.z - lastPos.z};
                if (blockLilypad(bot, myMove.x, myMove.y + 2, myMove.z)) {
                    digBlock(bot, myMove.x, myMove.y + 2, myMove.z);
                } else if (blockLilypad(bot, myMove.x - myMoveDir.x, myMove.y + 2, myMove.z)) {
                    digBlock(bot, myMove.x - myMoveDir.x, myMove.y + 2, myMove.z);
                } else if (blockLilypad(bot, myMove.x, myMove.y + 2, myMove.z - myMoveDir.z)) {
                    digBlock(bot, myMove.x, myMove.y + 2, myMove.z - myMoveDir.z);
                }
            } else if (myMove.mType == "lava" && bot.entity.position.y < movesToGo[lastPos.currentMove].y + slabSwimTarget(bot, myMove.x, myMove.y, myMove.z)) {
                botMove.jump = true;
            }
            if (bot.targetDigBlock) {botIsDigging = 2;}
            if (botIsDigging > 0 && !isSwim(myMove.mType)) {
                botMove.jump = false;
            }

            //if (lookAtNextDelay <= 0) {
            if (botMove.jump) {botMove.faceBackwards = -2;}
            if (botMove.mlg <= 0 && botMove.bucketTimer <= 0 && !bot.dunder.jumpTarget) {
                if (botMove.faceBackwards <= 0) {
                    bot.lookAt(new Vec3(myMove.x + 0.5, botLookAtY, myMove.z + 0.5), true);
                } else {
                    botMove.forward = !botMove.forward;
                    botMove.back = !botMove.back;
                    bot.lookAt(new Vec3(
                               bot.entity.position.x + (bot.entity.position.x - (movesToGo[lastPos.currentMove].x + 0.5)),
                               botLookAtY,
                               bot.entity.position.z + (bot.entity.position.z - (movesToGo[lastPos.currentMove].z + 0.5))),
                    25);
                }
            }
                var lastPosSameAmount = true;
                if (movesToGo[lastPos.currentMove - 1]) {
                    if (Math.abs(movesToGo[lastPos.currentMove - 1].x - myMove.x) > 1 |
                        Math.abs(movesToGo[lastPos.currentMove - 1].z - myMove.z) > 1 |
                        ((movesToGo[lastPos.currentMove - 1].x - myMove.x) > 0) != ((myMove.x - lastPos.x) > 0) |
                        ((movesToGo[lastPos.currentMove - 1].z - myMove.z) > 0) != ((myMove.z - lastPos.z) > 0) |
                        ((movesToGo[lastPos.currentMove - 1].x - myMove.x) < 0) != ((myMove.x - lastPos.x) < 0) |
                        ((movesToGo[lastPos.currentMove - 1].z - myMove.z) < 0) != ((myMove.z - lastPos.z) < 0)) {
                        lastPosSameAmount = false;
                    }
                }
                if (/*Math.abs(myMove.x - lastPos.x) == 1 | Math.abs(myMove.x - lastPos.x) == 2 |
                    Math.abs(myMove.z - lastPos.z) == 1 | Math.abs(myMove.z - lastPos.z) == 2 &&*/
                    lastPosSameAmount) {
                    //console.log("Speed up!");
                } else {
                    lastPosSameAmount = false;
                }

            //path stuff
            if (myMove.mType == "start" || blockStand(bot, myMove.x, myMove.y - 1, myMove.z) & bot.entity.onGround & myMove.mType != "goUp" | isSwim(myMove.mType) | lastPosSameAmount & myMove.mType != "goUp" |
                myMove.mType == "goUp" & bot.entity.onGround & bot.entity.position.y >= myMove.y - 0.25 &&
                bot.entity.position.x + 0.2 < goalBox.x + 1 && bot.entity.position.x - 0.2 > goalBox.x &&
                bot.entity.position.y < goalBox.y + 2 && bot.entity.position.y + 2 >= goalBox.y &&
                bot.entity.position.z + 0.2 < goalBox.z + 1 && bot.entity.position.z - 0.2 > goalBox.z) {
                lastPos = {"currentMove":lastPos.currentMove - 1, "x":myMove.x, "y":myMove.y, "z":myMove.z, "mType":myMove.mType};
                botMove.jump = false;
                botMove.lastTimer = 1;
                if (lastPos.currentMove < movesToGo.length - 2) {movesToGo.splice(lastPos.currentMove + 1, movesToGo.length);}
                botDestinationTimer = 30;
                //movesToGo.splice(movesToGo.length - 1, 1);
            }
        } else {
            onPath = false;
        }
};
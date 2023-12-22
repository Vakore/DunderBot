            var simControl = {
                forward: true,
                back: false,
                left: false,
                right: false,
                jump: true,
                sprint: true,
                sneak: false,
            };

function moveInDir(bot, stateBase, targetPos) {
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
        bot.dunder.controls.sneak = true;
        //console.log("sneak");
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

//Physics
function simulateJump(bot, target, stateBase, searchCount, theParent) {
    //console.log("hi");
    //bot.chat("/particle minecraft:flame ~ ~ ~");
            //bot.entity.yaw
          //var target = bot.nearestEntity();
          //bot.lookAt(new Vec3(target.position.x, bot.entity.position.y + 1.6, target.position.z), 360);
          var myStateBase = stateBase;
          //console.log(bot.username + ", " + target.position + ", " + myStateBase.pos);
          var myDelta = new Vec3(target.position.x - myStateBase.pos.x, target.position.y - myStateBase.pos.y, target.position.z - myStateBase.pos.z);
          myStateBase.yaw = Math.atan2(-myDelta.x, -myDelta.z);

          //Simulate jump sprints
          for (var j = myStateBase.yaw - Math.PI / 2 + Math.PI / 8; j < myStateBase.yaw + Math.PI / 2; j += Math.PI / 8) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = j;
            for (var i = 0; i < 30; i++) {
                bot.physics.simulatePlayer(myState, bot.world);
                if (i < 31 && (myState.onGround || myState.isInWater || myState.isInLava || (i >= 2 && myState.isInWeb))) {i = 30;}
                //bot.chat("/particle minecraft:flame " + myState.pos.x + " " + myState.pos.y + " " + myState.pos.z);
                //console.log(JSON.stringify(myState));
            }
            if (myState.onGround && !myState.isInLava) {
                bot.dunder.jumpSprintStates.push({state:myState,parent:theParent,open:true, shouldJump:true});
            }
          }

          //simulate no-jump sprinting
          for (var j = myStateBase.yaw - (Math.PI / 2 + Math.PI / 8) + (Math.PI / 4); j < (myStateBase.yaw + Math.PI / 2) - Math.PI / 4; j += Math.PI / 8) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.control.jump = false;
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = j;
            for (var i = 0; i < 30; i++) {
                bot.physics.simulatePlayer(myState, bot.world);
                if (i < 31 && ((myState.onGround && i >= 2) || myState.isInWater || myState.isInLava || (i >= 2 && myState.isInWeb))) {i = 30;}
                //bot.chat("/particle minecraft:flame " + myState.pos.x + " " + myState.pos.y + " " + myState.pos.z);
                //console.log(JSON.stringify(myState.pos));
            }
            if (myState.onGround && !myState.isInLava) {
                bot.dunder.jumpSprintStates.push({state:myState,parent:theParent,open:true, shouldJump:false});
            }
          }


        if (bot.dunder.jumpSprintStates.length > 0) {
          var myBestState = 0;
          for (var i = 0; i < bot.dunder.jumpSprintStates.length; i++) {
              if (bot.dunder.jumpSprintStates[myBestState].isInLava || !bot.dunder.jumpSprintStates[i].state.isInLava && bot.dunder.jumpSprintStates[i].state.onGround && bot.dunder.jumpSprintStates[i].open == true && dist3d(bot.dunder.jumpSprintStates[i].state.pos.x, bot.dunder.jumpSprintStates[i].state.pos.y, bot.dunder.jumpSprintStates[i].state.pos.z,
                         target.position.x, target.position.y, target.position.z) <
                  dist3d(bot.dunder.jumpSprintStates[myBestState].state.pos.x, bot.dunder.jumpSprintStates[myBestState].state.pos.y, bot.dunder.jumpSprintStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z)) {
                  //console.log(bot.dunder.jumpSprintStates[i].open);
                  myBestState = i;
              }
          }
          //bot.chat("/particle minecraft:spit " + bot.dunder.jumpSprintStates[myBestState].state.pos.x + " " + bot.dunder.jumpSprintStates[myBestState].state.pos.y + " " + bot.dunder.jumpSprintStates[myBestState].state.pos.z);
          if (dist3d(bot.dunder.jumpSprintStates[myBestState].state.pos.x, bot.dunder.jumpSprintStates[myBestState].state.pos.y, bot.dunder.jumpSprintStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z) < 1.5 || searchCount <= 0) {
              //console.log("decent jumps found");
              var mySearcher = bot.dunder.jumpSprintStates[myBestState];
              while (mySearcher.parent) {
                  bot.dunder.jumpTargets.push(mySearcher.state.pos);
                  mySearcher = mySearcher.parent;
              }
              bot.dunder.jumpTargets.push(mySearcher.state.pos);
              bot.lookAt(new Vec3(mySearcher.state.pos.x, /*mySearcher.state.pos.y*/target.position.y + 1.6, mySearcher.state.pos.z), 100);
              bot.dunder.jumpTarget = mySearcher.state.pos;
              bot.dunder.jumpYaw = mySearcher.state.yaw;
              bot.dunder.jumpTarget.shouldJump = mySearcher.shouldJump;
              bot.dunder.bestJumpSprintState = myBestState;
              if (mySearcher.state.isInLava) {console.log("fire");}
          } else if (searchCount > 0) {
              //console.log(JSON.stringify(bot.dunder.jumpSprintStates[myBestState].open));
              bot.dunder.jumpSprintStates[myBestState].open = false;
              simulateJump(bot, target, bot.dunder.jumpSprintStates[myBestState].state, searchCount - 1, bot.dunder.jumpSprintStates[myBestState]);
          }
        } else {
            //bot.chat("nothing to jump on...");
        }
};


function jumpSprintOnPath(bot, target, stateBase, searchCount, theParent) {

          var target = {"position":{x:0,y:0,z:0}};
          var minimumMove = bot.dunder.lastPos.currentMove - 20;
          if (minimumMove < 0) {
              minimumMove = 0;
          }
          //console.log("minimumMove: " + minimumMove);
          if (!bot.dunder.movesToGo[minimumMove]) {
              return;
          }

          var myStateBase = stateBase;
          var myDelta = new Vec3(bot.dunder.movesToGo[minimumMove].x + 0.5 - myStateBase.pos.x, bot.dunder.movesToGo[minimumMove].y - myStateBase.pos.y, bot.dunder.movesToGo[minimumMove].z + 0.5 - myStateBase.pos.z);
          myStateBase.yaw = Math.atan2(-myDelta.x, -myDelta.z);

          //Simulate jump sprints
          for (var j = myStateBase.yaw - Math.PI / 2 + Math.PI / 8; j < myStateBase.yaw + Math.PI / 2; j += Math.PI / 8) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = j;
            for (var i = 0; i < 30; i++) {
                bot.physics.simulatePlayer(myState, bot.world);
                if (i < 31 && (myState.onGround || myState.isInWater || myState.isInLava || (i >= 2 && myState.isInWeb))) {i = 30;}
                //bot.chat("/particle minecraft:flame " + myState.pos.x + " " + myState.pos.y + " " + myState.pos.z);
            }

            var myScore = 25;
            var tooLow = 0;
            for (var i = bot.dunder.lastPos.currentMove; i >= 0 && i > bot.dunder.movesToGo.length - 20; i--) {
                if (dist3d(myState.pos.x, myState.pos.y, myState.pos.z,
                    bot.dunder.movesToGo[i].x + 0.5, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z + 0.5) <= 5 && myState.pos.y >= bot.dunder.movesToGo[i].y - 2.25) {
                    //myScore += dist3d(myState.pos.x, myState.pos.y, myState.pos.z,
                    //                  bot.dunder.movesToGo[i].x + 0.5, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z + 0.5);
                    myScore -= (27 - (dist3d(myState.pos.x, myState.pos.y, myState.pos.z,
                    bot.dunder.movesToGo[i].x + 0.5, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z + 0.5) / 2)) * (bot.dunder.lastPos.currentMove - i);
                }

                if (i > bot.dunder.movesToGo.length - 5) {
                    tooLow += bot.dunder.movesToGo[i].y - myState.pos.y;
                }

                if (dist3d(bot.dunder.lastGroundPos.x, bot.dunder.lastGroundPos.y, bot.dunder.lastGroundPos.z, myState.pos.x, myState.pos.y, myState.pos.z) < 1.0 && Math.abs(bot.dunder.lastGroundPos.y - myState.pos.y) < 0.5 && dist3d(myState.pos.x, myState.pos.y, myState.pos.z, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x + 0.5, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z + 0.5) < dist3d(bot.dunder.lastGroundPos.x, bot.dunder.lastGroundPos.y, bot.dunder.lastGroundPos.z, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x + 0.5, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z + 0.5)) {
                    myScore += 1500;
                }
                myScore -= Math.sqrt(myState.vel.x * myState.vel.x + myState.vel.z * myState.vel.z) * 3;
            }
            if (Math.abs(tooLow) > 7) {
                myScore += 1500;
                //console.log("e");
            }
            //console.log("2low: " + tooLow);

            if (myState.onGround && !myState.isInLava) {
                bot.dunder.jumpSprintStates.push({state:myState,parent:theParent,open:true, shouldJump:true, score:myScore});
            }
          }

          //simulate no-jump sprinting
          for (var j = myStateBase.yaw - (Math.PI / 2 + Math.PI / 8) + (Math.PI / 4); j < (myStateBase.yaw + Math.PI / 2) - Math.PI / 4; j += Math.PI / 8) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.control.jump = false;
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = j;
            for (var i = 0; i < 30; i++) {
                bot.physics.simulatePlayer(myState, bot.world);
                if (i < 31 && ((myState.onGround && i >= 2) || myState.isInWater || myState.isInLava || (i >= 2 && myState.isInWeb))) {i = 30;}
            }

            var myScore = 25;
            for (var i = bot.dunder.lastPos.currentMove; i >= 0 && i > bot.dunder.movesToGo.length - 20; i--) {
                if (dist3d(myState.pos.x, myState.pos.y, myState.pos.z,
                    bot.dunder.movesToGo[i].x + 0.5, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z + 0.5) <= 5 && myState.pos.y >= bot.dunder.movesToGo[i].y - 2.25) {
                    //myScore += dist3d(myState.pos.x, myState.pos.y, myState.pos.z,
                    //                  bot.dunder.movesToGo[i].x + 0.5, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z + 0.5);
                    myScore -= (27 - (dist3d(myState.pos.x, myState.pos.y, myState.pos.z,
                    bot.dunder.movesToGo[i].x + 0.5, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z + 0.5) / 2)) * (bot.dunder.lastPos.currentMove - i);
                }
                if (myState.pos.y < myState.pos.y - 2.25) {
                    myScore += 1000;
                }
                if (dist3d(bot.dunder.lastGroundPos.x, bot.dunder.lastGroundPos.y, bot.dunder.lastGroundPos.z, myState.pos.x, myState.pos.y, myState.pos.z) < 0.5 && Math.abs(bot.dunder.lastGroundPos.y - myState.pos.y) < 0.5 && dist3d(myState.pos.x, myState.pos.y, myState.pos.z, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x + 0.5, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z + 0.5) < dist3d(bot.dunder.lastGroundPos.x, bot.dunder.lastGroundPos.y, bot.dunder.lastGroundPos.z, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x + 0.5, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z + 0.5)) {
                    myScore += 1500;
                }
                myScore -= Math.sqrt(myState.vel.x * myState.vel.x + myState.vel.z * myState.vel.z) * 3;
            }

            if (myState.onGround && !myState.isInLava) {
                bot.dunder.jumpSprintStates.push({state:myState,parent:theParent,open:true, shouldJump:false, score:myScore});
            }
          }


        if (bot.dunder.jumpSprintStates.length > 0) {
          var myBestState = 0;
          for (var i = 0; i < bot.dunder.jumpSprintStates.length; i++) {
              if (bot.dunder.jumpSprintStates[i].open == true && bot.dunder.jumpSprintStates[i].score < bot.dunder.jumpSprintStates[myBestState].score) {
                  myBestState = i;
              }

              /*if (bot.dunder.jumpSprintStates[myBestState].isInLava || !bot.dunder.jumpSprintStates[i].state.isInLava && bot.dunder.jumpSprintStates[i].state.onGround && bot.dunder.jumpSprintStates[i].open == true && dist3d(bot.dunder.jumpSprintStates[i].state.pos.x, bot.dunder.jumpSprintStates[i].state.pos.y, bot.dunder.jumpSprintStates[i].state.pos.z,
                         target.position.x, target.position.y, target.position.z) <
                  dist3d(bot.dunder.jumpSprintStates[myBestState].state.pos.x, bot.dunder.jumpSprintStates[myBestState].state.pos.y, bot.dunder.jumpSprintStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z)) {
                  //console.log(bot.dunder.jumpSprintStates[i].open);
                  myBestState = i;
              }*/
          }
          //bot.chat("/particle minecraft:spit " + bot.dunder.jumpSprintStates[myBestState].state.pos.x + " " + bot.dunder.jumpSprintStates[myBestState].state.pos.y + " " + bot.dunder.jumpSprintStates[myBestState].state.pos.z);
          if (/*dist3d(bot.dunder.jumpSprintStates[myBestState].state.pos.x, bot.dunder.jumpSprintStates[myBestState].state.pos.y, bot.dunder.jumpSprintStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z) < 1.5 ||*/ searchCount <= 0) {
              //console.log("decent jumps found");
              var mySearcher = bot.dunder.jumpSprintStates[myBestState];
              while (mySearcher.parent) {
                  bot.dunder.jumpTargets.push(mySearcher.state.pos);
                  mySearcher = mySearcher.parent;
              }
              bot.dunder.jumpTargets.push(mySearcher.state.pos);
              bot.lookAt(new Vec3(mySearcher.state.pos.x, /*mySearcher.state.pos.y*/target.position.y + 1.6, mySearcher.state.pos.z), 100);
              bot.dunder.jumpTarget = mySearcher.state.pos;
              //console.log(mySearcher.score);
              bot.dunder.jumpYaw = mySearcher.state.yaw;
              bot.dunder.jumpTarget.shouldJump = mySearcher.shouldJump;
              bot.dunder.bestJumpSprintState = myBestState;
              if (mySearcher.state.isInLava) {console.log("fire");}
              if (mySearcher.score > -131) {
                  bot.dunder.jumpTargetDelay = 15;
              }
          } else if (searchCount > 0) {
              //console.log(JSON.stringify(bot.dunder.jumpSprintStates[myBestState].open));
              //bot.dunder.jumpSprintStates[myBestState].open = false;
              //jumpSprintOnPath(bot, target, bot.dunder.jumpSprintStates[myBestState].state, searchCount - 1, bot.dunder.jumpSprintStates[myBestState]);
          }
        } else {
            //bot.chat("nothing to jump on...");
        }
};






function doJumpSprintStuff(bot) {
            var shouldJumpSprintOnPath = true;
            if (false && bot.dunder.movesToGo[bot.dunder.lastPos.currentMove] && (bot.dunder.lastPos.mType == "walkJump" || bot.dunder.lastPos.mType == "walkDiagJump")) {
                shouldJumpSprintOnPath = false;
                bot.dunder.jumpTargetDelay = 5;
            }
          if (shouldJumpSprintOnPath) {//Don't jump sprint if the parkour jump seems important
            if (bot.dunder.lastPos.currentMove > 0 && bot.dunder.movesToGo.length > 0 && bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]) {
                for (var i = bot.dunder.lastPos.currentMove; i > bot.dunder.lastPos.currentMove - 5 && i > 0; i--) {
                    //console.log(movesToGo[i].blockActions + ", " + movesToGo[i].blockDestructions);
                    if (bot.dunder.movesToGo[i].blockActions && bot.dunder.movesToGo[i].blockActions.length > 0 || bot.dunder.movesToGo[i].blockDestructions.length > 0) {
                        shouldJumpSprintOnPath = false;
                        bot.dunder.jumpTargetDelay = 5;
                        //console.log("Don't jump sprint! block destruction");
                    } else if (false && (bot.dunder.movesToGo[i] == "walkJump" || bot.dunder.movesToGo[i] == "walkDiagJump" ||
                               i > 0 && bot.dunder.movesToGo[i - 1] && (Math.abs(bot.dunder.movesToGo[i - 1].x - bot.dunder.movesToGo[i].x) > 1 || Math.abs(bot.dunder.movesToGo[i - 1].z - bot.dunder.movesToGo[i].z) > 1))) {
                        var myScoutX = bot.dunder.movesToGo[i - 1].x;
                        var myScoutY = bot.dunder.movesToGo[i - 1].y;
                        var myScoutZ = bot.dunder.movesToGo[i - 1].z;
                        while (shouldJumpSprintOnPath && (myScoutX != bot.dunder.movesToGo[i].x || myScoutZ != bot.dunder.movesToGo[i].z)) {
                            if (bot.dunder.movesToGo[i].x > myScoutX) {
                                 myScoutX++;
                            } else if (bot.dunder.movesToGo[i].x < myScoutX) {
                                 myScoutX--;
                            }
                            if (bot.dunder.movesToGo[i].z > myScoutZ) {
                                 myScoutZ++;
                            } else if (bot.dunder.movesToGo[i].z < myScoutZ) {
                                 myScoutZ--;
                            }
                            //add 1.17 support
                            shouldJumpSprintOnPath = false;
                            for (var j = bot.dunder.movesToGo[i].y; !shouldJumpSprintOnPath && j > bot.dunder.movesToGo[i].y - 3 && j > -65; j--) {
                                if (blockStand(bot, myScoutX, j, myScoutZ)) {
                                    shouldJumpSprintOnPath = true;
                                    //console.log("Not too deep, jump sprint");
                                }
                            }
                        }
                        if (!shouldJumpSprintOnPath) {
                            bot.dunder.jumpTargetDelay = 5;
                            console.log("It's a deep pit, dont jump sprint");
                        }
                    }
                }
                if (bot.entity.onGround && shouldJumpSprintOnPath && bot.dunder.lastPos.currentMove > -1 && bot.dunder.jumpTargetDelay <= 0) {
                    bot.dunder.jumpTarget = false;
                    bot.dunder.jumpTargets = [];
                    bot.dunder.jumpSprintStates = [];
                    jumpSprintOnPath(bot, {"position":{x:0,y:0,z:0}}, new PlayerState(bot, simControl), 0);
                }
            }
          }
    if (bot.entity.onGround) {
        bot.dunder.lastGroundPos = {x:bot.entity.position.x, y:bot.entity.position.y, z:bot.entity.position.z};
    }
    //if (bot.dunder.jumpTarget) {console.log(dist3d(bot.dunder.lastGroundPos.x, bot.dunder.lastGroundPos.y, bot.dunder.lastGroundPos.z, bot.dunder.jumpTarget.x, bot.dunder.jumpTarget.y, bot.dunder.jumpTarget.z) + "\n" + JSON.stringify(bot.dunder.lastGroundPos) + ", " + bot.dunder.jumpTarget);}

    //Implement this inside of the "selection" phase so jumps that don't meet this criteria aren't selected, have a plan if none qualify
    if (bot.dunder.jumpTarget && bot.dunder.jumpTarget.shouldJump && dist3d(bot.dunder.lastGroundPos.x, bot.dunder.lastGroundPos.y, bot.dunder.lastGroundPos.z, bot.dunder.jumpTarget.x, bot.dunder.jumpTarget.y, bot.dunder.jumpTarget.z) < 0.5 && Math.abs(bot.dunder.lastGroundPos.y - bot.dunder.jumpTarget.y) < 0.5) {bot.dunder.jumpTargetDelay = 5;}

    if (bot.dunder.jumpTarget && bot.dunder.jumpTargetDelay <= 0 && bot.dunder.movesToGo.length > 2) {
        bot.dunder.botMove.forward = true;
        bot.dunder.botMove.sprint = true;
        bot.dunder.botMove.jump = bot.dunder.jumpTarget.shouldJump;
        bot.dunder.botMove.back = false;
        bot.look(bot.dunder.jumpYaw, 0, 100);
            if (bot.dunder.movesToGo[bot.dunder.lastPos.currentMove]) {
                for (var i = 0; i < bot.dunder.movesToGo.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.dunder.movesToGo[i].x, bot.dunder.movesToGo[i].y, bot.dunder.movesToGo[i].z) <
                        dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].x, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].y, bot.dunder.movesToGo[bot.dunder.lastPos.currentMove].z)) {
                        bot.dunder.lastPos.currentMove = i;
                        bot.dunder.lastPosOnPath = false;
                    }
                }
                bot.dunder.movesToGo.splice(bot.dunder.lastPos.currentMove + 1, bot.dunder.movesToGo.length);
            }   
    } else {
        bot.dunder.jumpTarget = null;
    }
};














//actual locomoting

function botLocomotePvE(bot) {
};
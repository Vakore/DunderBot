function simulateAction(bot, action, target, stateBase, theParent){
          /*let scoutSim = stateBase.pos.offset(0, 0.2, 0);
          let probablyIs = "insider headhitter";
          let probablyAct = 0;//nothing, no walk jump, 

          let calcDelta = new Vec3(-Math.cos(-Math.PI/2 + stateBase.yaw), 0, Math.sin(-Math.PI/2 + stateBase.yaw)).normalize();

          if (blockSolid(bot, scoutSim.x, scoutSim.y + 2, scoutSim.z)) {
              //bot.chat("/particle minecraft:flame " + scoutSim.x + " " + scoutSim.y + " " + scoutSim.z);
              //bot.chat("/particle minecraft:flame " + scoutSim.x + " " + (scoutSim.y + 1) + " " + scoutSim.z);
              probablyAct = 1;
          } else {
              scoutSim.x += calcDelta.x;
              scoutSim.z += calcDelta.z;
              for (var i = 0; i < 4; i++) {
                  bot.chat("/particle minecraft:flame " + scoutSim.x + " " + scoutSim.y + " " + scoutSim.z);
                  bot.chat("/particle minecraft:flame " + scoutSim.x + " " + (scoutSim.y + 1) + " " + scoutSim.z);
                  if (!blockAir(bot, scoutSim.x, scoutSim.y + 1, scoutSim.z)) {
                      probablyIs = "dead end " + ["definitely", "almost certainly", "likely", "worth checking though"][i]
                      i = 5;
                  } else if (!blockAir(bot, scoutSim.x, scoutSim.y + 2, scoutSim.z)) {
                      probablyIs = "walk before headhitter " + ["definitely", "almost certainly", "possibly, but likely just adjust", "likely not, just adjust"][i];
                      i = 5;
                  } else if (!blockAir(bot, scoutSim.x, scoutSim.y, scoutSim.z)) {
                      probablyIs = "up one slope " + ["adjust at best", "likely adjust", "adjust", "will likely need to adjust for setting up next jump"][i];
                      i = 5;
                  } else {
                      probablyIs = "normal";
                      probablyAct = 1;
                  }
                  scoutSim.x += calcDelta.x;
                  scoutSim.z += calcDelta.z;
              }
          }
          dunderTaskLog("The following sprint jump is probably a " + probablyIs);*/


    target = {"position":{x:0,y:0,z:0}};
    let minimumMove = bot.dunder.lastPos.currentMove - 20;
    if (minimumMove < 0) {
        minimumMove = 0;
    }
    //console.log("minimumMove: " + minimumMove);
    if (!bot.dunder.movesToGo[minimumMove]) {
        return null;
    }
    stateBase.jumpTicks = 0;
    var myStateBase = stateBase;
    

    let myState = JSON.parse(JSON.stringify(myStateBase));
    myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
    let myScore = 25;

        //console.log("A" + myState.pos);
    for (var i = 0; i < 30; i++) {
        bot.physics.simulatePlayer(myState, bot.world);
        myState.jumpTicks = 0;
        //console.log("jt " + myState.jumpTicks);
         myScore += 0.05;
        if (i < 31 && ((myState.onGround && (i > 3 || action == 1)) && (action == 0 || action == 1 && i >= 2) || myState.isInWater || myState.isInLava || (i >= 2 && myState.isInWeb))) {
            //console.log(i);
            i = 30;
        }
            //if (i % 3 == 0) {bot.chat("/particle minecraft:flame " + myState.pos.x + " " + myState.pos.y + " " + myState.pos.z);}
        //console.log(JSON.stringify(myState));
        //if (myState.isCollidedHorizontally) {myScore += 0.25;}
    }
        //console.log("B" + myState.pos);

    let oldYaw = myState.yaw;
    let oldSprint = myState.control.sprint;
    if (false && action == 0 && myState.onGround) {
        myState.sprint = true;
        //console.log(myState.pos);

        let minimumMove = bot.dunder.lastPos.currentMove - 20;
        if (minimumMove < 0) {
            minimumMove = 0;
        }
        //console.log("minimumMove: " + minimumMove);
        if (!bot.dunder.movesToGo[minimumMove]) {
        } else {
            var myDelta = new Vec3(bot.dunder.movesToGo[minimumMove].x + 0.5 - myState.pos.x, bot.dunder.movesToGo[minimumMove].y - myState.pos.y, bot.dunder.movesToGo[minimumMove].z + 0.5 - myState.pos.z);
            myStateBase.yaw = Math.atan2(-myDelta.x, -myDelta.z);

            for (var i = 0; i < 30; i++) {
                bot.physics.simulatePlayer(myState, bot.world);
                myScore += 0.05;
                if (i < 31 && (myState.onGround && (action == 0 || action == 1 && i >= 2) || myState.isInWater || myState.isInLava || (i >= 2 && myState.isInWeb))) {i = 30;}
                    //if (i % 3 == 0) {bot.chat("/particle minecraft:flame " + myState.pos.x + " " + myState.pos.y + " " + myState.pos.z);}
            }

            myState.yaw = oldYaw;
            myState.control.sprint = oldSprint;
        }
    }
    

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

        //headhitter reward?
        /*if (myState.onGround && (
            blockSolid(bot, myState.pos.x - 0.3001, myState.pos.y + 2.2, myState.pos.z + 0.3001) ||
            blockSolid(bot, myState.pos.x + 0.3001, myState.pos.y + 2.2, myState.pos.z + 0.3001) ||
            blockSolid(bot, myState.pos.x - 0.3001, myState.pos.y + 2.2, myState.pos.z - 0.3001) ||
            blockSolid(bot, myState.pos.x + 0.3001, myState.pos.y + 2.2, myState.pos.z - 0.3001)
            )) {
            myScore *= 0.95
        }*/

        if (myState.onGround && !myState.isInLava) {
            return {state:myState,parent:theParent,open:true, shouldJump:true, score:myScore};
        } else {
            return {state:myState,parent:theParent,open:true, shouldJump:true, score:myScore + 5000};
        }
};
    //return myScore;

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
          //console.log(myDelta.x + ", " + -Math.cos(-Math.PI/2 + myStateBase.yaw));
          //console.log(myDelta.z + ", " + -Math.sin(-Math.PI/2 + myStateBase.yaw));
          //console.log(-(Math.PI/2 + Math.atan2(-Math.cos(myStateBase.yaw), -Math.sin(myStateBase.yaw))) + " : " + myStateBase.yaw + " : " + (Math.atan2(Math.cos(-Math.PI/2 + myStateBase.yaw), -Math.sin(-Math.PI/2 + myStateBase.yaw))));

          //Simulate jump sprints
          for (var j = 0; j < 7; j++) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = myStateBase.yaw - (Math.PI / 2) + (Math.PI / 8) + ((Math.PI / 8) * [3,4,2,5,1,7,0][j]);
            let pushDis = simulateAction(bot, 0, target, myState, 0);
            if (pushDis) {
                bot.dunder.jumpSprintStates.push(pushDis);
            }
          }
        if (!blockSolid(bot, myStateBase.pos.x, myStateBase.pos.y + 2, myStateBase.pos.z)) {
          for (var j = 0; j < 3; j++) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.control.sprint = false;
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = myStateBase.yaw - (Math.PI / 2) + (Math.PI / 8) + ((Math.PI / 8) * [3,4,2/*,5,1,7,0*/][j]);
            let pushDis = simulateAction(bot, 0, target, myState, 0);
            if (pushDis) {
                bot.dunder.jumpSprintStates.push(pushDis);
            }
          }
        }
          for (var j = 0; j < 3; j++) {
            var myState = JSON.parse(JSON.stringify(myStateBase));
            myState.control.jump = false;
            myState.pos = new Vec3(myState.pos.x, myState.pos.y, myState.pos.z);
            myState.yaw = myStateBase.yaw - (Math.PI / 2) + (Math.PI / 8) + ((Math.PI / 8) * [3,4,2/*,5,1,7,0*/][j]);
            let pushDis = simulateAction(bot, 1, target, myState, 0);
            if (pushDis) {
                bot.dunder.jumpSprintStates.push(pushDis);
            }
          }


        if (bot.dunder.jumpSprintStates.length > 0) {
          var myBestState = 0;
          for (var i = 0; i < bot.dunder.jumpSprintStates.length; i++) {
              if (bot.dunder.jumpSprintStates[i].open == true && bot.dunder.jumpSprintStates[i].score < bot.dunder.jumpSprintStates[myBestState].score) {
                  myBestState = i;
              }
          }
          if (/*dist3d(bot.dunder.jumpSprintStates[myBestState].state.pos.x, bot.dunder.jumpSprintStates[myBestState].state.pos.y, bot.dunder.jumpSprintStates[myBestState].state.pos.z,
                         target.position.x, target.position.y, target.position.z) < 1.5 ||*/ searchCount <= 0) {
              //console.log("decent jumps found");
              var mySearcher = bot.dunder.jumpSprintStates[myBestState];
              while (mySearcher.parent) {
                  bot.dunder.jumpTargets.push(mySearcher.state.pos);
                  mySearcher = mySearcher.parent;
              }
              bot.dunder.jumpTargets.push(mySearcher.state.pos);
              botLookAt(bot, new Vec3(mySearcher.state.pos.x, /*mySearcher.state.pos.y*/target.position.y + 1.6, mySearcher.state.pos.z), 50);
              bot.dunder.jumpTarget = mySearcher.state.pos;
              //console.log(mySearcher.score);
              bot.dunder.jumpYaw = mySearcher.state.yaw;
              bot.dunder.jumpTarget.shouldJump = mySearcher.shouldJump;
              bot.dunder.jumpTarget.shouldJump = mySearcher.state.control.sprint;
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
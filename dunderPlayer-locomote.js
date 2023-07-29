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




















//actual locomoting

function botLocomotePvE(bot) {
};
//This file handles buckets, along with some helper look functions
/*
EDGE CASES:
DONE: 1. Vanish cases for water and lava(sponges, lava to obby because lava, etc.)

2. Hanging cases(bot doesn't pick up water sometimes, experiment with oldYaw and oldPitch?)

3. Inching forward issue when tracking pig
- No longer inching issue, braindead issue/state stuck issue
    Reproduce by spawning a big farish away from the bot when it can see it, then kill the pig

DONE: 4a. Raycast when trying to pickup(i.e. in leaves, behind cobble wall, etc.)
 DONE: 4b. failcases(add this before 4a)

DONE* 5. No bucket cases(i.e. task is to place lava bucket when have none), both tests inside of doBucketMode and before entering
* prevents entering state when no water bucket. This could be problematic and cause more hanging cases than there are already.
* does not take into consideration empty bucket + nearby water
* needs to be added to clutching state when that's made

6. Prefer picking up liquid just placed as opposed to first found

7. fire block/lava block cases

8. Face cases
*/

function botLook(bot, yaw, pitch, priority) {
    if (priority >= bot.dunder.lookToward.priority) {
        bot.dunder.lookToward.priority = priority;
        bot.dunder.lookToward.mode = 0;
        bot.dunder.lookToward.yaw = yaw;
        bot.dunder.lookToward.pitch = pitch;
    }
    //bot.look(yaw, pitch, true);
};

function botLookAt(bot, pos, priority) {
    if (priority >= bot.dunder.lookToward.priority) {
        bot.dunder.lookToward.priority = priority;
        bot.dunder.lookToward.mode = 1;
        bot.dunder.lookToward.pos = pos;
    }
    //bot.lookAt(pos, true);
};



function doBucketMode(bot) {
        console.log(bot.dunder.bucketTask.timeout);
        //bot.dunder.state = "bucketTest";
        bot.dunder.looktimer -= (bot.dunder.looktimer > -10);
        bot.dunder.bucketTask.equipDelay -= (bot.dunder.bucketTask.equipDelay > -10);
        bot.dunder.bucketTask.blockFunc(bot, bot.dunder.bucketTask.entity);
            //do bucket task stuff
        //console.log(bot.dunder.bucketTask.entity);
        let facePos = bot.dunder.bucketTask.intersect;//faceToPos(bot.dunderTask.face);//we need face to closest corner
        if (bot.dunder.bucketTask.pos && dist3d(bot.dunder.oldPosition.x, bot.dunder.oldPosition.y + 1.62, bot.dunder.oldPosition.z, bot.dunder.bucketTask.intersect.x, bot.dunder.bucketTask.intersect.y, bot.dunder.bucketTask.intersect.z) > 5.5) {
            botLookAt(bot, bot.dunder.bucketTask.intersect, 150);
            bot.dunder.bucketTask.active = false;//might need to disable this for water clutching, maybe make it a toggle in dunder.bucketTask
        } else if (bot.dunder.bucketTask.bucketCondition(bot)) {
                if (bot.dunder.bucketTask.pos) {
                    if (bot.dunder.bucketTask.equipDelay < 0) {
                        equipItem(bot, [bot.dunder.bucketTask.bucket]);
                        bot.dunder.bucketTask.equipDelay = 20;
                    }
                    botLookAt(bot, bot.dunder.bucketTask.intersect, 100);
                    //console.log(bot.entity.pitch + ", " + bot.dunder.cursorBlock);
                }
                if (bot.dunder.cursorBlock && bot.dunder.bucketTask.pos) {
                    console.log("e " + (bot.dunder.bucketTask.pos) + " " + (bot.dunder.cursorBlock.position) + "&&" + (bot.dunder.cursorBlock && bot.dunder.cursorBlock.position.equals(bot.dunder.bucketTask.pos)) + "&&" + (dist3d(0, (bot.dunder.oldPosition.y + 1.62), 0, 0, bot.dunder.cursorBlock.position.y+1, 0)) + "&&" + (bot.heldItem) + "&&" + (bot.heldItem && bot.heldItem.name == bot.dunder.bucketTask.bucket) + "&&" +  (bot.dunder.looktimer < 0));
                }

                let monTester = bot.blockAt(bot.dunder.oldPosition.offset(0, 1.62, 0));

                if (!monTester || monTester.name == "air" || monTester.name == "cave_air" || monTester.name == "void_air" && monTester.hardness > 0) {
                    monTester = bot.world.raycast(bot.dunder.oldPosition.offset(0, 1.62, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
                        if (leBlock && leBlock.name != "air" && leBlock.name != "cave_air" && leBlock.name != "void_air" && leBlock.hardness == 0) {
                            return true;
                        }
                    });
                }

                if (monTester) {
                    console.log("place down: " + JSON.stringify(monTester));
                    digBlock(bot, monTester.position.x, monTester.position.y, monTester.position.z);
                    bot.dunder.bucketTask.timeout++;
                } else if (bot.dunder.bucketTask.pos && bot.dunder.cursorBlock && bot.dunder.cursorBlock.position.equals(bot.dunder.bucketTask.pos) && dist3d(0, (bot.dunder.oldPosition.y + 1.62), 0, 0, bot.dunder.cursorBlock.position.y+1, 0) < 5 && bot.heldItem && (bot.heldItem && bot.heldItem.name == bot.dunder.bucketTask.bucket) && bot.dunder.looktimer < 0) {
                    //bot.chat("/particle flame " + bot.dunder.oldPosition.x + " " + bot.dunder.oldPosition.y + " " + bot.dunder.oldPosition.z);
                    //bot.chat("/particle minecraft:soul_fire_flame ~ ~ ~");
                    console.log(bot.dunder.oldPosition.y + ", " + bot.dunder.cursorBlock.position.y + ", " + bot.dunder.bucketTask.pos.y);
                    //bot.dunder.botMove.sneak = true;
                    //setTimeout((bot) => {bot.activateItem(false);}, 50, bot);
                    bot.activateItem(false);
                    swingArm(bot);
                    bot.dunder.looktimer = 1;
                    bot.dunder.bucketTask.timeout = 20;
                    bot.dunder.bucketTask.attemptCount = 3;
                    console.log("clutch pls");
                } //else if (!bot.dunder.bucketTask.pos) {console.log("no blocks");}
        } else if (bot.dunder.bucketTask.bucketCondition2(bot) && bot.heldItem && bot.heldItem.name == 'bucket') {
            var waterBlock = null;
            if (bot.dunder.bucketTask.bucket == "water_bucket" /*&& Math.random() > 0.5*/) {
                waterBlock = bot.findBlock({
                    matching: (block) => (block.stateId === 80),//thank you u9g
                    maxDistance: 7,
                });
            } else if (bot.dunder.bucketTask.bucket == "lava_bucket") {
                waterBlock = bot.findBlock({
                    matching: (block) => (block.stateId === 96),//thank you u9g
                    maxDistance: 7,
                });
            }
            var raycastedLiquid = bot.blockAt(bot.dunder.oldPosition.offset(0, 1.62, 0));
            if (waterBlock) {
                //console.log(waterBlock.position.offset(0.5, 0.5, 0.5).minus(bot.dunder.oldPosition.offset(0, 1.62, 0)).normalize() + "\n" + (new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize()));
                
                if (bot.dunder.bucketTask.bucket == "water_bucket" && (!raycastedLiquid || raycastedLiquid.stateId != 80)) {
                    raycastedLiquid = bot.world.raycast(bot.dunder.oldPosition.offset(0, 1.62, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
                        //console.log(leBlock.name);
                        if (leBlock && (leBlock.name == "water" && leBlock.stateId == 80)) {
                            //console.log("ye!" + leBlock.name);
                            return true;
                        }
                    });
                } else if (bot.dunder.bucketTask.bucket == "lava_bucket" && (!raycastedLiquid || raycastedLiquid.stateId != 96)) {
                    raycastedLiquid = bot.world.raycast(bot.dunder.oldPosition.offset(0, 1.62, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
                        if (leBlock && leBlock.name == "lava" && leBlock.stateId == 96) {
                            return true;
                        }
                    });
                }
                //if (raycastedLiquid) {console.log(raycastedLiquid.name);}
                //bot.lookAt(waterBlock.position.offset(0.5, 0.5, 0.5), 100);
            }
            if (waterBlock) {
                botLookAt(bot, waterBlock.position.offset(0.5, 0.5, 0.5), 100);
            }
            //console.log(bot.entity.pitch);
            let monTester = bot.blockAt(bot.dunder.oldPosition.offset(0, 1.62, 0));

            if (!monTester || monTester.name == "air" || monTester.name == "cave_air" || monTester.name == "void_air" && monTester.hardness > 0) {
                monTester = bot.world.raycast(bot.dunder.oldPosition.offset(0, 1.62, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
                    if (leBlock && leBlock.name != "air" && leBlock.name != "cave_air" && leBlock.name != "void_air" && leBlock.hardness == 0) {
                        return true;
                    }
                });
            }

            if (monTester) {
                console.log("pick up: " + JSON.stringify(monTester));
                digBlock(bot, monTester.position.x, monTester.position.y, monTester.position.z);
                bot.dunder.bucketTask.timeout++;
            } else if (/*bot.dunder.cursorBlock*/waterBlock && raycastedLiquid && raycastedLiquid.position.equals(waterBlock.position) && bot.heldItem && (bot.heldItem.name == 'bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                swingArm(bot);
                bot.dunder.looktimer = 1;
                bot.dunder.bucketTask.timeout = 20;
                bot.dunder.bucketTask.attemptCount--;
                if (bot.dunder.bucketTask.attemptCount <= 0) {
                    console.log("failed bucketTask due to not picking up in 3 attempts");
                    bot.dunder.bucketTask.active = false;
                    bot.dunder.bucketTask.attemptCount = 3;
                    bot.dunder.masterState = bot.dunder.bucketTask.lastState;
                }
            } else if (!waterBlock) {
                bot.dunder.bucketTask.timeout -= 4;
                //bot.dunder.bucketTask.active = false;
                //bot.dunder.masterState = bot.dunder.bucketTask.lastState;
            }
        } else if (hasItemCount(bot, (name) => {return name == bot.dunder.bucketTask.bucket;}) >= bot.dunder.bucketTask.ogCount && (bot.dunder.oldOnGround || bot.dunder.oldIsInWater || bot.dunder.oldIsInLava)) {
            console.log("valid: " + hasItemCount(bot, (name) => {return name == bot.dunder.bucketTask.bucket;}) + ", " + bot.dunder.bucketTask.ogCount);
            bot.dunder.bucketTask.active = false;
            if (bot.dunder.masterState == "bucketTest") {
                bot.dunder.masterState = bot.dunder.bucketTask.lastState;
            }
        }
        bot.dunder.bucketTask.pos = null;
        bot.dunder.botMove.sneak = false;
        if (bot.dunder.oldOnGround || bot.dunder.oldIsInWater || bot.dunder.oldIsInLava) {bot.dunder.bucketTask.timeout--;}
        if (bot.dunder.bucketTask.timeout < 0) {
            console.log(bot.dunder.bucketTask.lastState);
            bot.dunder.masterState = bot.dunder.bucketTask.lastState;
            bot.dunder.bucketTask.active = false;
        }
};
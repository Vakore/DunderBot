//This file handles buckets, along with some helper look functions

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
        //bot.dunder.state = "bucketTest";
        bot.dunder.looktimer -= (bot.dunder.looktimer > -10);
        bot.dunder.bucketTask.equipDelay -= (bot.dunder.bucketTask.equipDelay > -10);
        bot.dunder.bucketTask.blockFunc(bot, bot.dunder.bucketTask.entity);
            //do bucket task stuff
        //console.log(bot.dunder.bucketTask.entity);
        if (bot.dunder.bucketTask.pos && dist3d(bot.entity.position.x, bot.entity.position.y + 1.65, bot.entity.position.z, bot.dunder.bucketTask.pos.x + 0.5, bot.dunder.bucketTask.pos.y + 0.5, bot.dunder.bucketTask.pos.z + 0.5) >= 5) {
            bot.dunder.bucketTask.active = false;
        } else if (bot.dunder.bucketTask.bucketCondition(bot)/*!bot.entity.onGround || bot.dunder.bucketTask.entity && bot.dunder.bucketTask.entity.metadata[9] > 0 && !parseEntityAnimation("pig", bot.dunder.bucketTask.entity.metadata[0])[0]*/) {
                if (bot.dunder.bucketTask.pos) {
                    if (bot.dunder.bucketTask.equipDelay < 0) {
                        equipItem(bot, [bot.dunder.bucketTask.bucket]);
                        bot.dunder.bucketTask.equipDelay = 20;
                    }
                    botLookAt(bot, bot.dunder.bucketTask.pos.offset(0.5, 1.0, 0.5), 100);
                    //console.log(bot.entity.pitch + ", " + bot.dunder.cursorBlock);
                }
                if (bot.dunder.cursorBlock && bot.dunder.bucketTask.pos) {
                    console.log("e " + (bot.dunder.bucketTask.pos) + " " + (bot.dunder.cursorBlock.position) + "&&" + (bot.dunder.cursorBlock && bot.dunder.cursorBlock.position.equals(bot.dunder.bucketTask.pos)) + "&&" + (dist3d(0, (bot.entity.position.y + 1.65), 0, 0, bot.dunder.cursorBlock.position.y, 0)) + "&&" + (bot.heldItem) + "&&" + (bot.heldItem && bot.heldItem.name == bot.dunder.bucketTask.bucket) + "&&" +  (bot.dunder.looktimer < 0));
                }

                let monTester = bot.blockAt(bot.entity.position.offset(0, 1.65, 0));

                if (!monTester || monTester.name == "air" || monTester.name == "cave_air" || monTester.name == "void_air" && monTester.hardness > 0) {
                    monTester = bot.world.raycast(bot.entity.position.offset(0, 1.65, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
                        if (leBlock && leBlock.name != "air" && leBlock.name != "cave_air" && leBlock.name != "void_air" && leBlock.hardness == 0) {
                            return true;
                        }
                    });
                }

                if (monTester) {
                    digBlock(bot, monTester.position.x, monTester.position.y, monTester.position.z);
                    bot.dunder.bucketTask.timeout += 2;
                } else if (bot.dunder.bucketTask.pos && bot.dunder.cursorBlock && bot.dunder.cursorBlock.position.equals(bot.dunder.bucketTask.pos) && dist3d(0, (bot.entity.position.y + 1.65), 0, 0, bot.dunder.cursorBlock.position.y, 0) <= 4.5 && bot.heldItem && (bot.heldItem && bot.heldItem.name == bot.dunder.bucketTask.bucket) && bot.dunder.looktimer < 0) {
                    //bot.dunder.botMove.sneak = true;
                    bot.activateItem(false);
                    bot.swingArm();
                    bot.dunder.looktimer = 1;
                    bot.dunder.bucketTask.timeout = 20;
                    console.log("clutch pls");
                } //else if (!bot.dunder.bucketTask.pos) {console.log("no blocks");}
        } else if (bot.dunder.bucketTask.bucketCondition2(bot) && bot.heldItem && bot.heldItem.name == 'bucket') {
            var waterBlock = null;
            if (bot.dunder.bucketTask.bucket == "water_bucket") {
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
            var raycastedLiquid = bot.blockAt(bot.entity.position.offset(0, 1.65, 0));
            if (waterBlock) {
                //console.log(waterBlock.position.offset(0.5, 0.5, 0.5).minus(bot.entity.position.offset(0, 1.65, 0)).normalize() + "\n" + (new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize()));
                
                if (bot.dunder.bucketTask.bucket == "water_bucket" && (!raycastedLiquid || raycastedLiquid.stateId != 80)) {
                    raycastedLiquid = bot.world.raycast(bot.entity.position.offset(0, 1.65, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
                        //console.log(leBlock.name);
                        if (leBlock && (leBlock.name == "water" && leBlock.stateId == 80)) {
                            //console.log("ye!" + leBlock.name);
                            return true;
                        }
                    });
                } else if (bot.dunder.bucketTask.bucket == "lava_bucket" && (!raycastedLiquid || raycastedLiquid.stateId != 96)) {
                    raycastedLiquid = bot.world.raycast(bot.entity.position.offset(0, 1.65, 0), new Vec3(-Math.sin(bot.entity.yaw) * Math.cos(bot.entity.pitch), Math.sin(bot.entity.pitch), -Math.cos(bot.entity.pitch) * Math.cos(bot.entity.yaw)).normalize(), 5, function(leBlock) {
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
            if (/*bot.dunder.cursorBlock*/waterBlock && raycastedLiquid && raycastedLiquid.position.equals(waterBlock.position) && bot.heldItem && (bot.heldItem.name == 'bucket') && bot.dunder.looktimer < 0) {
                bot.activateItem(false);
                bot.swingArm();
                bot.dunder.looktimer = 1;
                bot.dunder.bucketTask.timeout = 20;
            } else if (!waterBlock) {
                bot.dunder.bucketTask.active = false;
            }
        } else if (hasItemCount(bot, (name) => {return name == bot.dunder.bucketTask.bucket;}) >= bot.dunder.bucketTask.ogCount && (bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava)) {
            bot.dunder.bucketTask.active = false;
            if (bot.dunder.masterState == "bucketTest") {
                bot.dunder.masterState = bot.dunder.bucketTask.lastState;
            }
        }
        bot.dunder.bucketTask.pos = null;
        bot.dunder.botMove.sneak = false;
        if (bot.entity.onGround || bot.entity.isInWater || bot.entity.isInLava) {bot.dunder.bucketTask.timeout--;}
        if (bot.dunder.bucketTask.timeout < 0) {
            bot.dunder.masterState = bot.dunder.bucketTask.lastState;
        }
};
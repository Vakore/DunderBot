/*function doMiningTaskAttempt(bot) {
  if (VEIN TO MINE || TARGET BLOCK) {
    if (TARGET BLOCK) {
      if (CLOSE TO TARGET BLOCK && CAN SEE TARGET BLOCK) {
          MINE TARGET BLOCK
      } else {
        if (NEED PATH TO TARGET BLOCK && NOT FINDING PATH TO TARGET BLOCK && DIDNT FAIL) {
          FIND PATH TO TARGET BLOCK
        } else if (NOT FINDING PATH TO TARGET BLOCK && DIDNT FAIL) {
          FOLLOW PATH TO TARGET BLOCK
        } ELSE IF (DID FAIL) {
          EXCLUDE VEIN
          NO TARGET BLOCK
        }
      }
    } else if (ANOTHER BLOCK IN VEIN && NEED ANOTHER BLOCK) {
      SELECT NEXT TARGET BLOCK FROM VEIN
    }
  } else {
    GET ITEM LIST
    if (ITEM LIST) {
      GET NEAREST ITEM
      if (NEED TO PATH TO ENTITY && NOT FINDING PATH && DIDNT FAIL) {
        FIND PATH TO TARGET ENTITY
      } else if (NOT FINDING PATH TO ENTITY && DIDNT FAIL) {
        FOLLOW PATH TO ENTITY
      } else if (DID FAIL) {
        EXCLUDE ITEM
      }
    } else {
      FIND NEW VEIN
    }
  }
};*/

function doMiningTask(bot) {
  if (bot.dunderTaskDetails.miningBlock && !blockSolid(bot, bot.dunderTaskDetails.miningBlock.x, bot.dunderTaskDetails.miningBlock.y, bot.dunderTaskDetails.miningBlock.z)) {
    bot.dunderTaskDetails.miningBlock = null;
    bot.dunderTaskDetails.count--;
    dunderTaskLog("ASDF " + bot.dunderTaskDetails.count);
  }
  if (bot.dunderTaskDetails.blocksList.length > 0 || bot.dunderTaskDetails.x != null && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) {
    //=console.log("vein to mine OR target block");
    if (bot.dunderTaskDetails.x != null && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) {
      //=console.log("-target block");
      if ((visibleFromPos(bot, bot.entity.position, new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) || bot.dunder.movesToGo[0] && bot.dunder.movesToGo.length <= 1 && dist3d(bot.dunder.movesToGo[0].x + 0.5, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z + 0.5, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < 0.5 && visibleFromPos(bot, new Vec3(bot.dunder.movesToGo[0].x, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z), new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) && dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) <= 4.5) {
        //=console.log("--target block");
        bot.dunderTaskDetails.miningBlock = {x:bot.dunderTaskDetails.x, y:bot.dunderTaskDetails.y, z:bot.dunderTaskDetails.z};
        equipTool(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
        digBlock(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
        botLookAt(bot, new Vec3(bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5), 10);
      } else {
        //=console.log("--no target block");
        if (bot.dunder.movesToGo.length <= 1 && !bot.dunder.findingPath && !bot.dunderTaskDetails.failedPathfind) {
          //=console.log("---FIND PATH TO TARGET BLOCK");
          bot.dunder.goal.x = bot.dunderTaskDetails.x;
          bot.dunder.goal.y = bot.dunderTaskDetails.y;
          bot.dunder.goal.z = bot.dunderTaskDetails.z;
          bot.dunder.goal.reached = false;
          bot.dunder.pathGoalForgiveness = 4;
          console.log(bot.dunder.goal);
          findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(bot.dunderTaskDetails.x), Math.floor(bot.dunderTaskDetails.y), Math.floor(bot.dunderTaskDetails.z), false, false, {mustBeVisible:true});
        } else if (!bot.dunder.findingPath && !bot.dunderTaskDetails.failedPathfind) {
          //=console.log("---FOLLOW PATH TO TARGET BLOCK");
          strictFollow(bot);
        } else if (bot.dunderTaskDetails.failedPathfind) {
          console.log("---EXCLUDE VEIN");
          console.log("---NO TARGET BLOCK");
          for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
            bot.dunderTaskDetails.veinExcluders[bot.dunderTaskDetails.blocksList[i].x + "_" + bot.dunderTaskDetails.blocksList[i].y + "_" + bot.dunderTaskDetails.blocksList[i].z] = true;
          }
          //console.log(bot.dunderTaskDetails.x + "_" + bot.dunderTaskDetails.y + "_" + bot.dunderTaskDetails.z);
          bot.dunderTaskDetails.veinExcluders[bot.dunderTaskDetails.x + "_" + bot.dunderTaskDetails.y + "_" + bot.dunderTaskDetails.z] = true;
          bot.dunderTaskDetails.blocksList = [];
          bot.dunderTaskDetails.x = null;
          bot.dunderTaskDetails.failedPathfind = false;
        }
      }
    } else if (bot.dunderTaskDetails.blocksList.length > 0 && !blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) /*&& NEED ANOTHER BLOCK*/) {
      console.log("--SELECT NEXT TARGET BLOCK FROM VEIN");
                bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[0].x;
                bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[0].y;
                bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[0].z;
                let lastI = 0;
                for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z,
                               bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z,
                               bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z) || blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z))) && !blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) ) {
                       bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[i].x
                       bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[i].y;
                       bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[i].z;
                       lastI = i;
                    }
                }
                bot.dunderTaskDetails.blocksList.splice(lastI, 1);
                dunderTaskLog("finished mining block, "  + bot.dunderTaskDetails.count + " left. Next: " + bot.dunderTaskDetails.x + ", " + bot.dunderTaskDetails.y + ", " + bot.dunderTaskDetails.z + ", " + bot.dunderTaskDetails.blocksListCount);
                if (bot.dunderTaskDetails.count <= 0) {
                    dunderTaskLog("Actually, we're done.")
                    bot.dunderTaskDetails.x = null;
                    bot.dunderTaskDetails.blocksList = [];
                }
    }
  } else {
    console.log("GET ITEM LIST");
    bot.dunderTaskDetails.itemsList = [];
    for (var i in bot.entities) {
      if (bot.entities[i].name == "item") {
        if (!bot.entities[i].excluded && blockSolid(bot, bot.entities[i].position.x, bot.entities[i].position.y-1.0, bot.entities[i].position.z) && bot.entities[i].metadata && bot.entities[i].metadata[8] && bot.entities[i].metadata[8].itemId && bot.dunderTaskDetails.itemCondition(bot.registry.items[bot.entities[i].metadata[8].itemId].name)) {
          //dunderTaskLog("item found " + bot.registry.items[bot.entities[i].metadata[8].itemId].name);
          bot.dunderTaskDetails.itemsList.push(bot.entities[i]);
        }
      }
    }

    let itemToGo = null;
    if (bot.dunderTaskDetails.itemsList.length > 0) {
      console.log("-GET NEAREST ITEM");
      itemToGo = bot.dunderTaskDetails.itemsList[0];
      for (var i = 1; i < bot.dunderTaskDetails.itemsList.length; i++) {
        if (dist3d(bot.dunderTaskDetails.itemsList[i].position.x, bot.dunderTaskDetails.itemsList[i].position.y, bot.dunderTaskDetails.itemsList[i].position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < dist3d(itemToGo.position.x, itemToGo.position.y, itemToGo.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z)) {
          itemToGo = bot.dunderTaskDetails.itemsList[i];
        }
      }

      if (bot.dunder.movesToGo.length <= 1 && !bot.dunder.findingPath && !bot.dunderTaskDetails.failedPathfind) {
        console.log("--FIND PATH TO TARGET ENTITY");
        bot.dunder.goal.x = itemToGo.position.x;
        bot.dunder.goal.y = itemToGo.position.y;
        bot.dunder.goal.z = itemToGo.position.z;
        bot.dunder.goal.reached = false;
        bot.dunder.pathGoalForgiveness = 0;
        console.log(bot.dunder.goal);
        findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(itemToGo.position.x), Math.floor(itemToGo.position.y), Math.floor(itemToGo.position.z), false, false);
      } else if (!bot.dunder.findingPath && !bot.dunderTaskDetails.failedPathfind) {
        console.log("--FOLLOW PATH TO ENTITY");
        strictFollow(bot);
      } else if (bot.dunderTaskDetails.failedPathfind) {
        console.log("--EXCLUDE ITEM");
        itemToGo = bot.dunderTaskDetails.itemsList[0];
        for (var i = 1; i < bot.dunderTaskDetails.itemsList.length; i++) {
          if (dist3d(bot.dunderTaskDetails.itemsList[i].position.x, bot.dunderTaskDetails.itemsList[i].position.y, bot.dunderTaskDetails.itemsList[i].position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < dist3d(itemToGo.position.x, itemToGo.position.y, itemToGo.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z)) {
            itemToGo = bot.dunderTaskDetails.itemsList[i];
          }
        }
        itemToGo.excluded = true;
        bot.dunderTaskDetails.failedPathfind = false;
      }
    } else {
      console.log("-FIND NEW VEIN");
      let botItemMineCount = hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition);
      if (botItemMineCount < bot.dunderTaskDetails.itemTotal) {
        bot.dunderTaskDetails.blocksList = findVein(bot, bot.dunderTaskDetails.options);
        bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.blocksList.length;
        if (bot.dunderTaskDetails.blocksListCount > bot.dunderTaskDetails.itemTotal - botItemMineCount) {
          bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.itemTotal - botItemMineCount;
        }
        if (bot.dunderTaskDetails.blocksList.length > 0) {
          dunderTaskLog("found more! " + bot.dunderTaskDetails.blocksList);
        } else {
          dunderTaskLog("Could not find any nearby veins.");
          bot.dunderTaskCompleted = true;
        }
      } else {
        dunderTaskLog("finished mining vein." + hasItemCount(bot, bot.dunderTaskDetails.itemCondition) + " " + bot.dunderTaskDetails.itemTotal);
        bot.dunderTaskCompleted = true;
      }
    }
  }
};



function doMiningTaskAttempt2(bot) {
    if (bot.dunderTaskDetails.x != null && bot.dunder.movesToGo.length <= 1 && !bot.dunder[dunderBotPathfindDefaults.findingPath] && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) {
        if ((visibleFromPos(bot, bot.entity.position, new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) || bot.dunder.movesToGo[0] && visibleFromPos(bot, new Vec3(bot.dunder.movesToGo[0].x, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z), new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) && dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) <= 4.5) {
            digBlock(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
        } else {
            bot.dunder.goal.x = bot.dunderTaskDetails.x;
            bot.dunder.goal.y = bot.dunderTaskDetails.y;
            bot.dunder.goal.z = bot.dunderTaskDetails.z;
            bot.dunder.goal.reached = false;
            bot.dunder.pathGoalForgiveness = 4;
            console.log(bot.dunder.goal);
            findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(bot.dunderTaskDetails.x), Math.floor(bot.dunderTaskDetails.y), Math.floor(bot.dunderTaskDetails.z), false, false, {mustBeVisible:true});
        }
    } else if (blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) {
        strictFollow(bot);
    } else if (bot.dunderTaskDetails.blocksList.length > 0) {
            if (bot.dunderTaskDetails.blocksList.length > 0) {
                bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[0].x;
                bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[0].y;
                bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[0].z;
                let lastI = 0;
                for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z,
                               bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z,
                               bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z) || blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z))) && !blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) ) {
                       bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[i].x
                       bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[i].y;
                       bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[i].z;
                       lastI = i;
                    }
                }
                bot.dunderTaskDetails.blocksList.splice(lastI, 1);
                dunderTaskLog("finished mining block, "  + bot.dunderTaskDetails.count + " left. Next: " + bot.dunderTaskDetails.x + ", " + bot.dunderTaskDetails.y + ", " + bot.dunderTaskDetails.z + ", " + bot.dunderTaskDetails.blocksListCount);
                if (bot.dunderTaskDetails.count <= 0) {
                    dunderTaskLog("Actually, we're done.")
                    bot.dunderTaskDetails.x = null;
                    bot.dunderTaskDetails.blocksList = [];
                }
            }
    } else if (bot.dunderTaskDetails.x != null) {
        bot.dunderTaskDetails.x = null;
        bot.dunderTaskDetails.itemsList = [];
        for (var i in bot.entities) {
            if (bot.entities[i].name == "item") {
                    if (!bot.entities[i].excluded && blockSolid(bot, bot.entities[i].position.x, bot.entities[i].position.y-1.0, bot.entities[i].position.z) && bot.entities[i].metadata && bot.entities[i].metadata[8] && bot.entities[i].metadata[8].itemId && bot.dunderTaskDetails.itemCondition(bot.registry.items[bot.entities[i].metadata[8].itemId].name)) {
                    //dunderTaskLog("item found " + bot.registry.items[bot.entities[i].metadata[8].itemId].name);
                    bot.dunderTaskDetails.itemsList.push(bot.entities[i]);
                }
            }
        }

        let itemToGo = null;
        if (bot.dunderTaskDetails.itemsList.length > 0) {
            itemToGo = bot.dunderTaskDetails.itemsList[0];
            for (var i = 1; i < bot.dunderTaskDetails.itemsList.length; i++) {
                if (dist3d(bot.dunderTaskDetails.itemsList[i].position.x, bot.dunderTaskDetails.itemsList[i].position.y, bot.dunderTaskDetails.itemsList[i].position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z) < dist3d(itemToGo.position.x, itemToGo.position.y, itemToGo.position.z, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z)) {
                    itemToGo = bot.dunderTaskDetails.itemsList[i];
                }
            }
            bot.dunder.goal.x = itemToGo.position.x;
            bot.dunder.goal.y = itemToGo.position.y;
            bot.dunder.goal.z = itemToGo.position.z;
            bot.dunder.goal.reached = false;
            bot.dunder.pathGoalForgiveness = 0;
            console.log(bot.dunder.goal);
            findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(itemToGo.position.x), Math.floor(itemToGo.position.y), Math.floor(itemToGo.position.z), false, false);
        }
    } else if (!bot.dunder[dunderBotPathfindDefaults.findingPath]) {
        strictFollow(bot);
    }

    if (false) {
            if (bot.dunderTaskDetails.blocksList.length > 0) {
                bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[0].x;
                bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[0].y;
                bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[0].z;
                let lastI = 0;
                for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z,
                               bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z,
                               bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z) || blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z))) && !blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) ) {
                       bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[i].x
                       bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[i].y;
                       bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[i].z;
                       lastI = i;
                    }
                }
                bot.dunderTaskDetails.blocksList.splice(lastI, 1);
                dunderTaskLog("finished mining block, "  + bot.dunderTaskDetails.count + " left. Next: " + bot.dunderTaskDetails.x + ", " + bot.dunderTaskDetails.y + ", " + bot.dunderTaskDetails.z + ", " + bot.dunderTaskDetails.blocksListCount);
                if (bot.dunderTaskDetails.count <= 0) {
                    dunderTaskLog("Actually, we're done.")
                    bot.dunderTaskDetails.x = null;
                    bot.dunderTaskDetails.blocksList = [];
                }
            } else {
                bot.dunderTaskDetails.itemsList = [];
                for (var i in bot.entities) {
                    if (bot.entities[i].name == "item") {
                        if (!bot.entities[i].excluded && blockSolid(bot, bot.entities[i].position.x, bot.entities[i].position.y-1.0, bot.entities[i].position.z) && bot.entities[i].metadata && bot.entities[i].metadata[8] && bot.entities[i].metadata[8].itemId && bot.dunderTaskDetails.itemCondition(bot.registry.items[bot.entities[i].metadata[8].itemId].name)) {
                            //dunderTaskLog("item found " + bot.registry.items[bot.entities[i].metadata[8].itemId].name);
                            bot.dunderTaskDetails.itemsList.push(bot.entities[i]);
                        }
                    }
                }
                //if (bot.dunderTaskDetails.i
                let botItemMineCount = hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition);
                if (botItemMineCount < bot.dunderTaskDetails.itemTotal) {
                    bot.dunderTaskDetails.blocksList = findVein(bot, bot.dunderTaskDetails.options);
                    bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.blocksList.length;
                    if (bot.dunderTaskDetails.blocksListCount > bot.dunderTaskDetails.itemTotal - botItemMineCount) {
                        bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.itemTotal - botItemMineCount;
                    }
                    if (bot.dunderTaskDetails.blocksList.length > 0) {
                        dunderTaskLog("found more! " + bot.dunderTaskDetails.blocksList);
                    } else {
                        dunderTaskLog("Could not find any nearby veins.");
                        bot.dunderTaskCompleted = true;
                    }
                } else {
                    dunderTaskLog("finished mining vein." + hasItemCount(bot, bot.dunderTaskDetails.itemCondition) + " " + bot.dunderTaskDetails.itemTotal);
                    bot.dunderTaskCompleted = true;
                }
            }
    }
};

function doMiningTaskOld(bot) {
        if (bot.dunderTaskDetails.x != null && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) && (dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) > 5 || !bot.entity.onGround || !bot.dunderTaskDetails.failedPathfind && !visibleFromPos(bot, bot.entity.position, new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) && !(dist3d(bot.entity.position.x, bot.entity.position.y + 1.62, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) <= 5 && bot.dunder.movesToGo.length <= 1 && bot.dunder.movesToGo[0] && visibleFromPos(bot, new Vec3(bot.dunder.movesToGo[0].x, bot.dunder.movesToGo[0].y, bot.dunder.movesToGo[0].z), new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) )) {
            bot.dunder.goal.x = bot.dunderTaskDetails.x;
            bot.dunder.goal.y = bot.dunderTaskDetails.y;
            bot.dunder.goal.z = bot.dunderTaskDetails.z;
            bot.dunder.goal.reached = false;
            if (bot.dunder.movesToGo.length <= 1 && !bot.dunder[dunderBotPathfindDefaults.findingPath]) {
                 if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) > 5) {
                     if (bot.dunderTaskDetails.failedPathfind && bot.dunderTaskDetails.failedPathfind.x == Math.floor(bot.dunderTaskDetails.x) && bot.dunderTaskDetails.failedPathfind.y == Math.floor(bot.dunderTaskDetails.y) && bot.dunderTaskDetails.failedPathfind.z == Math.floor(bot.dunderTaskDetails.z)) {
                         for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                             bot.dunderTaskDetails.veinExcluders[bot.dunderTaskDetails.blocksList[i].x + "_" + bot.dunderTaskDetails.blocksList[i].y + "_" + bot.dunderTaskDetails.blocksList[i].z] = true;
                         }
                         //console.log(bot.dunderTaskDetails.x + "_" + bot.dunderTaskDetails.y + "_" + bot.dunderTaskDetails.z);
                         bot.dunderTaskDetails.veinExcluders[bot.dunderTaskDetails.x + "_" + bot.dunderTaskDetails.y + "_" + bot.dunderTaskDetails.z] = true;
                         bot.dunderTaskDetails.blocksList = [];
                         bot.dunderTaskDetails.x = null;
                     } else {
                         //console.log(bot.dunderTaskDetails.failedPathfind + ", " + bot.dunderTaskDetails);
                         bot.dunder.pathGoalForgiveness = 3;
                         findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(bot.dunderTaskDetails.x), Math.floor(bot.dunderTaskDetails.y), Math.floor(bot.dunderTaskDetails.z), false, false);
                     }
                 } else {
                     console.log("trying");
                     bot.dunder.pathGoalForgiveness = 1;
                     findPath(bot, dunderBotPathfindDefaults, 500, Math.floor(bot.dunderTaskDetails.x), Math.floor(bot.dunderTaskDetails.y), Math.floor(bot.dunderTaskDetails.z), false, false, {mustBeVisible:true});
                 }
            } else if (bot.dunder.movesToGo.length > 0) {
                console.log("gimmie block");
                strictFollow(bot);
            }
        } else if (bot.dunderTaskDetails.x != null && blockSolid(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z)) {
             if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z, bot.dunderTaskDetails.x + 0.5, bot.dunderTaskDetails.y + 0.5, bot.dunderTaskDetails.z + 0.5) <= 5) {
                equipTool(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
                botLookAt(bot, new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z).offset(0.5, 0.5, 0.5), 75);
                digBlock(bot, bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z);
            }
        } else if (bot.dunderTaskDetails.x != null || bot.dunderTaskDetails.y == null) {
            bot.dunderTaskDetails.x = null;
            if (bot.dunderTaskDetails.blocksList.length > 0) {
                bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[0].x;
                bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[0].y;
                bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[0].z;
                let lastI = 0;
                for (var i = 0; i < bot.dunderTaskDetails.blocksList.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z,
                               bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z,
                               bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z) || blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.blocksList[i].x, bot.dunderTaskDetails.blocksList[i].y, bot.dunderTaskDetails.blocksList[i].z))) && !blockExposed(bot, bot.blockAt(new Vec3(bot.dunderTaskDetails.x, bot.dunderTaskDetails.y, bot.dunderTaskDetails.z))) ) {
                       bot.dunderTaskDetails.x = bot.dunderTaskDetails.blocksList[i].x
                       bot.dunderTaskDetails.y = bot.dunderTaskDetails.blocksList[i].y;
                       bot.dunderTaskDetails.z = bot.dunderTaskDetails.blocksList[i].z;
                       lastI = i;
                    }
                }
                //console.log(bot.dunderTaskDetails.blocksList);
                dunderTaskLog("thungy " + bot.dunderTaskDetails.blocksListCount);
                bot.dunderTaskDetails.blocksList.splice(lastI, 1);
                bot.dunderTaskDetails.blocksListCount--;
                //console.log(bot.dunderTaskDetails.blocksList);
                dunderTaskLog("finished mining block, "  + bot.dunderTaskDetails.count + " left. Next: " + bot.dunderTaskDetails.x + ", " + bot.dunderTaskDetails.y + ", " + bot.dunderTaskDetails.z + ", " + bot.dunderTaskDetails.blocksListCount);
                if (bot.dunderTaskDetails.blocksListCount <= -1) {
                    dunderTaskLog("Actually, we're done.")
                    bot.dunderTaskDetails.x = null;
                    bot.dunderTaskDetails.blocksList = [];
                }
            }
        } else {
            bot.dunderTaskDetails.itemsList = [];
            for (var i in bot.entities) {
                if (bot.entities[i].name == "item") {
                    if (!bot.entities[i].excluded && blockSolid(bot, bot.entities[i].position.x, bot.entities[i].position.y-1.0, bot.entities[i].position.z) && bot.entities[i].metadata && bot.entities[i].metadata[8] && bot.entities[i].metadata[8].itemId && bot.dunderTaskDetails.itemCondition(bot.registry.items[bot.entities[i].metadata[8].itemId].name)) {
                        //dunderTaskLog("item found " + bot.registry.items[bot.entities[i].metadata[8].itemId].name);
                        bot.dunderTaskDetails.itemsList.push(bot.entities[i]);
                    }
                }
            }

            if (bot.dunderTaskDetails.itemsList.length > 0 && hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition) < bot.dunderTaskDetails.itemTotal) {
                bot.dunder.goal.x = Math.round(bot.dunderTaskDetails.itemsList[0].position.x);
                bot.dunder.goal.y = Math.floor(bot.dunderTaskDetails.itemsList[0].position.y);
                bot.dunder.goal.z = Math.round(bot.dunderTaskDetails.itemsList[0].position.z);
                bot.dunder.goal.reached = false;
                if (bot.dunder.movesToGo.length <= 1 && !bot.dunder.findingPath && (!bot.dunderTaskDetails.failedPathfind || bot.dunderTaskDetails.failedPathfind && (bot.dunderTaskDetails.failedPathfind.x != bot.dunder.goal.x || bot.dunderTaskDetails.failedPathfind.y != bot.dunder.goal.y || bot.dunderTaskDetails.failedPathfind.z != bot.dunder.goal.z))) {
                    bot.dunder.pathGoalForgiveness = 0;
                    findPath(bot, dunderBotPathfindDefaults, 500, Math.floor(bot.dunder.goal.x), Math.floor(bot.dunder.goal.y), Math.floor(bot.dunder.goal.z), false, false);
                    //console.log(bot.dunderTaskDetails.failedPathfind);
                } else if (bot.dunderTaskDetails.failedPathfind && (bot.dunderTaskDetails.failedPathfind.x == bot.dunder.goal.x && bot.dunderTaskDetails.failedPathfind.y == bot.dunder.goal.y && bot.dunderTaskDetails.failedPathfind.z == bot.dunder.goal.z)) {
                    bot.dunderTaskDetails.itemsList[0].excluded = true;
                } else {
                    console.log("gimmie the item");
                    strictFollow(bot);
                }
            } else {
                let botItemMineCount = hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition);
                if (botItemMineCount < bot.dunderTaskDetails.itemTotal) {
                    bot.dunderTaskDetails.blocksList = findVein(bot, bot.dunderTaskDetails.options);
                    bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.blocksList.length;
                    if (bot.dunderTaskDetails.blocksListCount > bot.dunderTaskDetails.itemTotal - botItemMineCount) {
                        bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.itemTotal - botItemMineCount;
                    }
                    bot.dunderTaskDetails.y = null;
                    if (bot.dunderTaskDetails.blocksList.length > 0) {
                        dunderTaskLog("found more! " + bot.dunderTaskDetails.blocksList);
                    } else {
                        dunderTaskLog("Could not find any nearby veins.");
                        bot.dunderTaskCompleted = true;
                    }
                } else {
                    dunderTaskLog("finished mining vein." + hasItemCount(bot, bot.dunderTaskDetails.itemCondition) + " " + bot.dunderTaskDetails.itemTotal);
                    bot.dunderTaskCompleted = true;
                }
            }
        }
};
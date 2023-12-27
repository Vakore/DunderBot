function dunderTaskLog(msg) {
    console.log("\x1b[33m DUNDER TASK MANAGER: " + msg + " \x1b[0m");
};

function createDunderTask(bot, taskType, options) {
    dunderTaskLog("Created task " + taskType);
    bot.dunderTasks.push([taskType, options]);
};

function acceptDunderTask(bot, taskType, options) {
  let validTask = true;
  switch (taskType) {
    case "sleep":
        var bedBlock = bot.findBlock({
            matching: (block) => (bot.isABed(block) && bot.parseBedMetadata(block).occupied == 0),
            maxDistance: 4,
        });

        if (bedBlock) {
            dunderTaskLog("Sleeping in bed...");
            console.log("bed visible: " + visibleFromPos(bot, bot.entity.position, bedBlock.position));
            bot.sleep(bedBlock);
        } else {
            dunderTaskLog("Could not find bed.");
        }
        bot.dunderTaskCurrent = "sleep";
        bot.dunderTaskCompleted = true;
    break;

    case "wake":
        if (bot.isSleeping) {
            bot.wake();
        } else {
            console.log("Already awake!");
        }
        bot.dunderTaskCurrent = "wake";
        bot.dunderTaskCompleted = true;
    break;

    case "setMasterState":
        bot.dunder.pathGoalForgiveness = 0;
        bot.dunder.masterState = options.masterState;
        dunderTaskLog("Set master state to " + bot.dunder.masterState);
        bot.dunderTaskCompleted = true;
    break;

    case "mine":
        if (options.block) {
            dunderTaskLog("Finding block to mine..."); 
            var pathToBlocks = bot.findBlocks({
                matching: options.block,
                maxDistance: options.distance,
                useExtraInfo: options.useExtraInfo || false,
                count:(options.count) ? options.count : 1
            });
            
            var pathToBlock = null;
            if (pathToBlocks.length > 0) {
                pathToBlock = pathToBlocks[0];
                let lastI = 0;
                for (var i = 0; i < pathToBlocks.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z,
                               pathToBlock.x, pathToBlock.y, pathToBlock.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y + 1.6, bot.entity.position.z,
                               pathToBlocks[0].x, pathToBlocks[0].y, pathToBlocks[0].z)) {
                        pathToBlock = pathToBlocks[i];
                        lastI = i;
                    }
                }
                console.log(pathToBlocks);
                pathToBlocks.splice(lastI, 1);
                console.log(pathToBlocks);
            }

            if (pathToBlock) {
                bot.dunderTaskDetails = {blocksList:pathToBlocks, x:pathToBlock.x, y:pathToBlock.y, z:pathToBlock.z, count:(options.count) ? options.count : 1};
                bot.dunder.masterState = "mining";
                bot.dunderTaskCurrent = "mining";
            }
        }
    break;

    case "goto":
        if (options.player) {
            dunderTaskLog("Finding " + options.player + "...");
            var playerTo = bot.players[options.player];
            if (playerTo && playerTo.entity) {
                options.x = Math.floor(playerTo.entity.position.x);
                options.y = Math.round(playerTo.entity.position.y);
                options.z = Math.floor(playerTo.entity.position.z);
            } else {
                dunderTaskLog("PROBLEM! Failed to find " + options.player + "!");
            }
        } else if (options.block) {
            dunderTaskLog("Finding block..."); 
            var pathToBlocks = bot.findBlocks({
                matching: options.block,
                maxDistance: options.distance,
                useExtraInfo: options.useExtraInfo || false,
            });
            
            var pathToBlock = null;
            if (pathToBlocks.length > 0) {
                pathToBlock = pathToBlocks[0];
                //console.log("0987 " + JSON.stringify(pathToBlock));
                for (var i = 0; i < pathToBlocks.length; i++) {
                    if (dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z,
                               pathToBlock.x, pathToBlock.y, pathToBlock.z) >
                        dist3d(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z,
                               pathToBlocks[0].x, pathToBlocks[0].y, pathToBlocks[0].z)) {
                        pathToBlock = pathToBlocks[i];
                    }
                }
            }

            if (pathToBlock) {
                options.x = Math.floor(pathToBlock.x);
                options.y = Math.round(pathToBlock.y);
                options.z = Math.floor(pathToBlock.z);
            } else {
                dunderTaskLog("PROBLEM! Failed to find block!");
            }
        }

        if (!options.searchNodes) {options.searchNodes = 3000;}
        if (!options.x) {validTask = false;}
        if (!options.y) {options.y = "no";}
        if (!options.z) {validTask = false;}

        //advanced
        if (!options.correction) {options.correction = false;}
        if (!options.extension) {options.extension = false;}

        if (validTask) {
            options.x = Math.floor(options.x);
            options.y = Math.floor(options.y);
            options.z = Math.floor(options.z);
            bot.dunder.masterState = "pathfinding";
            dunderTaskLog("Pathfinding to " + options.x + ", " + options.y + ", " + options.z);
            bot.dunder.goal = {x:options.x, y:options.y, z:options.z, reached:false, isMobile:false};
            findPath(bot, dunderBotPathfindDefaults, options.searchNodes, options.x, options.y, options.z, options.correction, options.extension);
            bot.dunderTaskCurrent = "pathfinding";
            if (options.pathGoalForgiveness >= 0) {
                dunderTaskLog(bot.dunder.pathGoalForgiveness)
                bot.dunder.pathGoalForgiveness = options.pathGoalForgiveness;
                dunderTaskLog(bot.dunder.pathGoalForgiveness)
            }
        } else {
            dunderTaskLog("ERROR: invalid task options");
            bot.dunderTaskCompleted = true;
        }
    break;
  }
};


function dunderTaskInitialize(bot) {
    dunderTaskLog("Initiallizing tasks!");
    //createDunderTask(bot, "goto", {"block":(block) => (block.name == "nether_portal" && block.position && blockSolid(bot, block.position.x, block.position.y-1, block.position.z)), "distance":30, "useExtraInfo":true});

  //for (var i = 0; i < 10; i++) {
    //createDunderTask(bot, "goto", {"block":(block) => (block.name.includes("_log")), "distance":30, "pathGoalForgiveness":8});
    //createDunderTask(bot, "goto", {"block":(block) => (block.name.includes("_log")), "distance":9, "pathGoalForgiveness":5});
  createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("_log") && blockExposed(bot, block)), "distance":30, "count":20, "useExtraInfo":true});
  //}
  createDunderTask(bot, "goto", {"block":(block) => (bot.isABed(block) && bot.parseBedMetadata(block).occupied == 0), "distance":30, "pathGoalForgiveness":3});
  createDunderTask(bot, "sleep");
  createDunderTask(bot, "wake");
  createDunderTask(bot, "setMasterState", {"masterState":"idle"});


    /*createDunderTask(bot, "goto", {"block":(block) => (block.name.includes("_log") && blockExposed(bot, block)), "distance":30, "pathGoalForgiveness":0});
    createDunderTask(bot, "goto", {"player":"Vakore", "pathGoalForgiveness":0});
    createDunderTask(bot, "goto", {"block":(block) => (block.name.includes("_log")), "distance":30, "pathGoalForgiveness":0});
    createDunderTask(bot, "setMasterState", {"masterState":"idle"});*/

    //createDunderTask(bot, "sleep");
    bot.dunderTaskCompleted = true;
};
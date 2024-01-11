function dunderTaskLog(msg) {
    console.log("\x1b[33m DUNDER TASK MANAGER: " + msg + " \x1b[0m");
};

function createDunderTask(bot, taskType, options) {
    dunderTaskLog("Created task " + taskType);
    bot.dunderTasks.push([taskType, options]);
};

function veinExcluded(bot, block) {
    console.log(bot.dunderTaskDetails.veinExcluders);
    if (bot.dunderTaskDetails.veinExcluders[block.position.x + "_" + block.position.y + "_" + block.position.z]) {
        return true;
    }
    return false;
};

function acceptDunderTask(bot, taskType, options) {
  let validTask = true;
  switch (taskType) {
    case "closeWindow":
        bot.closeWindow(bot.dunder.currentWindow);
    break;
    case "openContainer":
        let openDisBlock = bot.findBlock({
            matching: (block) => (block.name == options.name),
            distance:5,
            useExtraInfo:true,
        });
        if (openDisBlock) {
            botLookAt(bot, openDisBlock.position.offset(0.5, 0.5, 0.5), 1000);
            botActivateBlock(bot, openDisBlock);
        }
        setTimeout((bot) => {bot.dunderTaskCompleted = true;}, 5000, bot);
        bot.dunder.masterState = "neutral";
        bot.dunder.state = "neutral";
        bot.dunderTaskCurrent = "openContainer";
    break;

    case "equip":
        equipItem(bot, options.items, options.destination);
        setTimeout((bot) => {bot.dunderTaskCompleted = true;}, 100, bot);
        bot.dunder.masterState = "equip";
        bot.dunder.state = "equip";
        bot.dunderTaskCurrent = "equip";
    break;

    case "placeCrafting":
        console.log("qwerty");
        placeCraftingTable(bot);
        //setTimeout((bot) => {bot.dunderTaskCompleted = true;}, 250, bot);
        bot.dunderTaskCurrent = "placeCrafting";
        bot.dunder.masterState = "placecrafting";
        bot.dunder.state = "placecrafting";
    break;
    case "placeFurnace":
        console.log("qwerty furnace");
        placeCraftingTable(bot, "furnace");
        //setTimeout((bot) => {bot.dunderTaskCompleted = true;}, 250, bot);
        bot.dunderTaskCurrent = "placeCrafting";
        bot.dunder.masterState = "placecrafting";
        bot.dunder.state = "placecrafting";
    break;
    case "craft":
        console.log("Craft: " + JSON.stringify(options));
        let item = bot.registry.itemsByName[options.name];
        let craftingTable = bot.findBlock({
            matching: (block) => (block.name == "crafting_table"),
            distance:5,
            useExtraInfo:true,
        });
        let recipes = bot.recipesFor(item.id, null, 1, craftingTable);
        bot.dunderTaskCurrent = "craft";
        bot.craft(recipes[0], 1, craftingTable);
        setTimeout((bot) => {bot.dunderTaskCompleted = true;}, 100, bot);
        bot.dunder.masterState = "craft";
        bot.dunder.state = "craft";
    break;

    case "drop":
        
    break;

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
                bot.dunderTaskDetails = {itemsList:[], blocksList:[], blocksListCount:0, x:null, y:null, z:null, count:(options.count) ? options.count : 1, options:options, itemCondition:options.itemCondition, finishCondition:options.finishCondition, itemTotal:0, veinExcluders:{}};
            options.useblock = options.block;
            options.block = function(b) {return (options.useblock(b) && !veinExcluded(bot, b));}
            dunderTaskLog("Finding block to mine..."); 
            var pathToBlocks = findVein(bot, options);

            var pathToBlock = null;
            if (pathToBlocks.length > 0) {
                bot.dunderTaskDetails.blocksListCount = pathToBlocks.length;
                let botItemMineCount = hasItemCount(bot, bot.dunderTaskDetails.options.itemCondition);
                if (bot.dunderTaskDetails.blocksListCount > bot.dunderTaskDetails.count) {
                    bot.dunderTaskDetails.blocksListCount = bot.dunderTaskDetails.count;
                }
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
                bot.dunderTaskDetails = {itemsList:[], blocksList:pathToBlocks, blocksListCount:bot.dunderTaskDetails.blocksListCount, x:pathToBlock.x, y:pathToBlock.y, z:pathToBlock.z, count:(options.count) ? options.count : 1, options:options, itemCondition:options.itemCondition, finishCondition:options.finishCondition, itemTotal:0, veinExcluders:{}};
                if (bot.dunderTaskDetails.finishCondition != 0) {
                    bot.dunderTaskDetails.itemTotal = hasItemCount(bot, bot.dunderTaskDetails.itemCondition) + bot.dunderTaskDetails.count;
                }
                bot.dunder.masterState = "mining";
                bot.dunderTaskCurrent = "mining";
                console.log(pathToBlocks);
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

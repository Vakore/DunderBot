function parseMessage(bot, username, msg) {
    //console.log("<" + username + "> " + msg);
    msg = msg.split(" ");
  if (commanders.includes(username)) {
    //console.log(username == "Vakore");
    switch (msg[0].toLowerCase()) {
        case "d":
            console.log("DDDDDDDDDD");
            console.log(JSON.stringify(bot.dunder.goal));
        break;
        case "s":
            console.log("SSSSSSSSSS");
            bot.dunder.goal.reached = true;
        break;

        case "help":
            console.log("================================\nChat commands:\nsleep - find nearby bed and sleep in it\nwake - get out of bed\ne - enter 'generic' mode, does things like auto eat, PvE, following the player. Large work in progress.\ngoto <username> OR goto <x> <z> OR goto <x> <y> <z> - Pathfinds to a location using dunderPlayer-pathfind and exits 'generic' mode.\ntogglejump - toggles jump sprinting when following a path. Jump sprinting is a huge WIP. Defaults to on.\ngoto2 (for syntax see 'goto') - Pathfinds to a location using mineflayer-pathfinder. Can break other things, mainly for testing purposes.\nratfind (for syntax see 'goto') - uses and experimental feature that will probably never get used.\nversion - displays version in console.\n================================");
        break;

        case "commands":
            bot.chat("Commanders: " + commanders);
        break;

        case "version":
            console.log(dunderBotPlayerVersion);
        break;

        //Manners
        case "gg":
            bot.chat("gg " + username);
        break;
        case "gf":
            bot.chat("gf " + username);
        break;
        case "gl":
            bot.chat("gl hf " + username);
        break;
        case "glhf":
            bot.chat("gl hf " + username);
        break;
        case "ez":
            bot.chat("Hax");
        break;

        //utility
        case "inventory":
            equipItem(bot, [msg[1]], msg[2]);
        break;


       case "sleep":
        var bedBlock = bot.findBlock({
            matching: (block) => (bot.isABed(block) && bot.parseBedMetadata(block).occupied == 0),
            maxDistance: 3,
        });

        if (bedBlock) {
            //console.log(JSON.stringify(bot.parseBedMetadata(bedBlock)));
            bot.sleep(bedBlock);
        } else {
            console.log("Cannot find a bed!");
            var bedBlock = bot.findBlock({
                matching: (block) => (bot.isABed(block) && bot.parseBedMetadata(block).occupied == 0),
                maxDistance: 30,
            });
            if (bedBlock) {
                bot.dunder.goal = getEntityFloorPos(bot, bedBlock.position, bot.dunder.goal);
                findPath(bot, dunderBotPathfindDefaults, 1500, Math.floor(bedBlock.position.x), Math.floor(bedBlock.position.y), Math.floor(bedBlock.position.z));
            }
        }
       break;

       case "wake":
           if (bot.isSleeping) {
               bot.wake();
           } else {
               console.log("Already awake!");
           }
       break;

       case "repeattasks":
           dunderTaskInitialize(bot);
       break;

        //state setter
        case "idle":
            bot.dunder.masterState = "idle";
            bot.dunder.state = "idle";
        break;
        case "pve":
            bot.dunder.state = "PvE";
        break;
        case "eat":
            bot.dunder.state = "eat";
        break;

        //"it got stuck" commands
        case "simulatejump":
          var target = findCommander(bot);
          if (target) {
            bot.dunder.jumpTarget = false;
            bot.dunder.jumpTargets = [];
            bot.dunder.jumpSprintStates = [];
            var mySimCount = 2;
            if (parseInt(msg[1])) {
                mySimCount = parseInt(msg[1]);
                console.log("mySimCount is " + msg[1]);
            }
            //console.log(target);
            //console.log(simControl);
            simulateJump(bot, target, new PlayerState(bot, simControl), mySimCount);
          }
        break;

       case "debugpath":
           dunderTaskLog(JSON.stringify(bot.dunder.movesToGo));
           dunderTaskLog(JSON.stringify(bot.dunder.goal));
           dunderTaskLog(JSON.stringify(bot.dunder.lastPos));
       break;

       case "teams":
           console.log(bot.teams);
           console.log("---------------");
           console.log(bot.teamMap);
       break;
       case "e":
           bot.dunder.pathGoalForgiveness = 0;
           bot.dunder.masterState = "idle";
           bot.dunder.state = "idle";
       break;

       case "togglejump":
           bot.dunder.jumpSprintAlongPath = !bot.dunder.jumpSprintAlongPath;
           console.log("jumpSprintAlongPath has been set from " + !bot.dunder.jumpSprintAlongPath + " to " + bot.dunder.jumpSprintAlongPath);
       break;

       case "ratfind":
                bot.dunder.masterState = "ratfinding";//for mineflayer-pathfinder set to "pathfinding2"
                var validSyntax = false;
                var findPathX = 0, findPathY = 0, findPathZ = 0;
                    if (msg[1] == "me") {
                        console.log("Finding you...");
                        var playerTo = bot.players[username];
                        if (playerTo && playerTo.entity) {
                            findPathX = Math.floor(playerTo.entity.position.x);
                            findPathY = Math.round(playerTo.entity.position.y);
                            findPathZ = Math.floor(playerTo.entity.position.z);
                            validSyntax = true;
                        }
                    } else if (msg.length == 2) {
                        console.log("Finding " + msg[1] + "...");
                        var playerTo = bot.players[msg[1]];
                        if (playerTo && playerTo.entity) {
                            findPathX = Math.floor(playerTo.entity.position.x);
                            findPathY = Math.round(playerTo.entity.position.y);
                            findPathZ = Math.floor(playerTo.entity.position.z);
                            validSyntax = true;
                        }
                    } else if (msg.length >= 3) {
                        findPathX = Math.floor(Number(msg[1]));
                        findPathY = Math.round(Number(msg[2]));
                        if (msg.length == 4) {
                            findPathZ = Math.floor(Number(msg[3]));
                        } else {
                            findPathZ = undefined;
                        }
                        
                        if (findPathX != NaN && findPathY != NaN/* && findPathZ != NaN*/) {
                            validSyntax = true;
                        }
                    }
                if (validSyntax) {
                    console.log("Finding path. My current position is X: " + Math.floor(bot.entity.position.x) + 
                         ", Y: " + Math.floor(bot.entity.position.y) +
                         ", Z: " + Math.floor(bot.entity.position.z));
                    if (findPathZ != undefined) {
                        bot.dunder.goal = {x:findPathX, y:findPathY, z:findPathZ, reached:false, isMobile:false};
                    } else {
                        bot.dunder.goal = {x:findPathX, y:"no", z:findPathY, reached:false, isMobile:false};
                    }
                    //mineflayer-pathfinder
                    //bot.pathfinder.setMovements(defaultMove)
                    //bot.pathfinder.setGoal(new GoalNear(findPathX, findPathY, findPathZ, 1))
                    ratFind(bot, bot.entity.position.x, bot.entity.position.y, bot.entity.position.z, findPathX, findPathY, findPathZ);
                }
            break;

            case "goto2":
                bot.dunder.masterState = "pathfinding2";//for mineflayer-pathfinder set to "pathfinding2"
                var validSyntax = false;
                var findPathX = 0, findPathY = 0, findPathZ = 0;
                    if (msg[1] == "me") {
                        console.log("Finding you...");
                        var playerTo = bot.players[username];
                        if (playerTo && playerTo.entity) {
                            findPathX = Math.floor(playerTo.entity.position.x);
                            findPathY = Math.round(playerTo.entity.position.y);
                            findPathZ = Math.floor(playerTo.entity.position.z);
                            validSyntax = true;
                        }
                    } else if (msg.length == 2) {
                        console.log("Finding " + msg[1] + "...");
                        var playerTo = bot.players[msg[1]];
                        if (playerTo && playerTo.entity) {
                            findPathX = Math.floor(playerTo.entity.position.x);
                            findPathY = Math.round(playerTo.entity.position.y);
                            findPathZ = Math.floor(playerTo.entity.position.z);
                            validSyntax = true;
                        }
                    } else if (msg.length >= 3) {
                        findPathX = Math.floor(Number(msg[1]));
                        findPathY = Math.round(Number(msg[2]));
                        if (msg.length == 4) {
                            findPathZ = Math.floor(Number(msg[3]));
                        } else {
                            findPathZ = undefined;
                        }
                        
                        if (findPathX != NaN && findPathY != NaN/* && findPathZ != NaN*/) {
                            validSyntax = true;
                        }
                    }
                if (validSyntax) {
                    console.log("Finding path. My current position is X: " + Math.floor(bot.entity.position.x) + 
                         ", Y: " + Math.floor(bot.entity.position.y) +
                         ", Z: " + Math.floor(bot.entity.position.z));
                    if (findPathZ != undefined) {
                        bot.dunder.goal = {x:findPathX, y:findPathY, z:findPathZ, reached:false, isMobile:false};
                    } else {
                        bot.dunder.goal = {x:findPathX, y:"no", z:findPathY, reached:false, isMobile:false};
                    }
                    //mineflayer-pathfinder
                    bot.pathfinder.setMovements(defaultMove)
                    bot.pathfinder.setGoal(new GoalNear(findPathX, findPathY, findPathZ, 1))
                    //findPath(bot, dunderBotPathfindDefaults, 4500, findPathX, findPathY, findPathZ);
                    //bot.entity.position.x = Math.floor(bot.entity.position.x) + 0.5;
                    //bot.entity.position.z = Math.floor(bot.entity.position.z) + 0.5;
                }
            break;

            case "goto":
                bot.dunder.masterState = "pathfinding";//for mineflayer-pathfinder set to "pathfinding2"
                var validSyntax = false;
                var findPathX = 0, findPathY = 0, findPathZ = 0;
                    if (msg[1] == "me") {
                        console.log("Finding you...");
                        var playerTo = bot.players[username];
                        if (playerTo && playerTo.entity) {
                            findPathX = Math.floor(playerTo.entity.position.x);
                            findPathY = Math.round(playerTo.entity.position.y);
                            findPathZ = Math.floor(playerTo.entity.position.z);
                            validSyntax = true;
                        }
                    } else if (msg[1] == "*") {
                        var inven = bot.inventory.slots;
                        console.log("Searching for compass...");
                        for (var i = 0; i < inven.length; i++) {
                            if (inven[i] == null) {
                                continue;
                            } else if (inven[i].name == "compass") {
                                    console.log(JSON.stringify(inven[i].name));
                                if (inven[i].nbt && inven[i].nbt.value && inven[i].nbt.value.LodestonePos) {
                                    console.log(JSON.stringify(inven[i].nbt.value.LodestonePos));
                                    findPathX = inven[i].nbt.value.LodestonePos.value.X.value;
                                    //findPathY = inven[i].nbt.value.LodestonePos.value.Y.value + 
                                    findPathY = inven[i].nbt.value.LodestonePos.value.Y.value + 1;//"no";
                                    findPathZ = inven[i].nbt.value.LodestonePos.value.Z.value;
                                    validSyntax = true;
                                    i = inven.length;
                                }
                            } else {
                                //console.log(inven[i].name);
                            }
                        }
                    } else if (msg.length == 2) {
                        console.log("Finding " + msg[1] + "...");
                        var playerTo = bot.players[msg[1]];
                        if (playerTo && playerTo.entity) {
                            findPathX = Math.floor(playerTo.entity.position.x);
                            findPathY = Math.round(playerTo.entity.position.y);
                            findPathZ = Math.floor(playerTo.entity.position.z);
                            validSyntax = true;
                        }
                    } else if (msg.length >= 3) {
                        findPathX = Math.floor(Number(msg[1]));
                        findPathY = Math.round(Number(msg[2]));
                        if (msg.length == 4) {
                            findPathZ = Math.floor(Number(msg[3]));
                        } else {
                            findPathZ = undefined;
                        }
                        
                        if (findPathX != NaN && findPathY != NaN/* && findPathZ != NaN*/) {
                            validSyntax = true;
                        }
                    }
                if (validSyntax) {
                    console.log("Finding path. My current position is X: " + Math.floor(bot.entity.position.x) + 
                         ", Y: " + Math.floor(bot.entity.position.y) +
                         ", Z: " + Math.floor(bot.entity.position.z));
                    if (findPathZ != undefined) {
                        bot.dunder.goal = {x:findPathX, y:findPathY, z:findPathZ, reached:false, isMobile:false};
                    } else {
                        bot.dunder.goal = {x:findPathX, y:"no", z:findPathY, reached:false, isMobile:false};
                    }
                    //mineflayer-pathfinder
                    //bot.pathfinder.setMovements(defaultMove)
                    //bot.pathfinder.setGoal(new GoalNear(findPathX, findPathY, findPathZ, 1))
                    findPath(bot, dunderBotPathfindDefaults, 4500, findPathX, findPathY, findPathZ);
                    //bot.entity.position.x = Math.floor(bot.entity.position.x) + 0.5;
                    //bot.entity.position.z = Math.floor(bot.entity.position.z) + 0.5;
                }
            break;




case "standingin":
                console.log(JSON.stringify(bot.blockAt(
                            new Vec3(Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z))
                )));
                console.log("is it standable? " + blockStand(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z)));
                console.log("Fists: " + getDigTime(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z), false, false));
                console.log("Sharpest Tool: " + getDigTime(bot, Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z), false, true));
            break;

           case "activate":
               bot.activateItem();
           break;
           case "deactivate":
               bot.deactivateItem();
           break;
    }
  }
};

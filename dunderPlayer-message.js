function parseMessage(bot, username, msg) {
    //console.log("<" + username + "> " + msg);
    msg = msg.split(" ");
  if (commanders.includes(username)) {
    //console.log(username == "Vakore");
    switch (msg[0].toLowerCase()) {
        case "commands":
            bot.chat("Commanders: " + commanders);
        break;

        case "version":
            bot.chat(dunderBotPlayerVersion);
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
        }
       break;

       case "wake":
           if (bot.isSleeping) {
               bot.wake();
           } else {
               console.log("Already awake!");
           }
       break;

        //state setter
        case "idle":
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

       case "teams":
           console.log(bot.teams);
           console.log("---------------");
           console.log(bot.teamMap);
       break;
            case "e":
                bot.masterState = "idle";
            break;

            case "goto":
                bot.masterState = "pathfinding";
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
                        bot.dunder.goal = {x:findPathX, y:findPathY, z:findPathZ, reached:false};
                    } else {
                        bot.dunder.goal = {x:findPathX, y:"no", z:findPathY, reached:false};
                    }
                    findPath(bot, 500, findPathX, findPathY, findPathZ);
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
    }
  }
};

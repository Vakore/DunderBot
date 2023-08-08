function ratFind(bot, startX, startY, startZ, endX, endY, endZ) {
    if (bot.dunder.findingRat) {
        clearRatTimeout(bot);
    }

    console.log(bot.dunder.cbtm + " is looking for a rat path");
    bot.dunder.rats = [
        {x:startX, y:startY, z:startZ, dirX:-1, dirZ:1, dead:false},
        {x:startX, y:startY, z:startZ, dirX:0, dirZ:1, dead:false},
        {x:startX, y:startY, z:startZ, dirX:1, dirZ:1, dead:false},
        {x:startX, y:startY, z:startZ, dirX:-1, dirZ:0, dead:false},
        {x:startX, y:startY, z:startZ, dirX:1, dirZ:0, dead:false},
        {x:startX, y:startY, z:startZ, dirX:-1, dirZ:-1, dead:false},
        {x:startX, y:startY, z:startZ, dirX:0, dirZ:-1, dead:false},
        {x:startX, y:startY, z:startZ, dirX:1, dirZ:-1, dead:false},
    ];
    //var currentRatCount = bot.dunder.rats.length;
    /*for (var i = 0; i < currentRatCount; i++) {
        bot.dunder.rats.push(
            {x:bot.dunder.rats[i].x + bot.dunder.rats[i].dirZ, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z + bot.dunder.rats[i].dirX, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
            {x:bot.dunder.rats[i].x + bot.dunder.rats[i].dirZ * 2, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z + bot.dunder.rats[i].dirX * 2, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
            {x:bot.dunder.rats[i].x + bot.dunder.rats[i].dirZ * 3, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z + bot.dunder.rats[i].dirX * 3, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
            //{x:bot.dunder.rats[i].x + bot.dunder.rats[i].dirZ * 4, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z + bot.dunder.rats[i].dirX * 4, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},

            {x:bot.dunder.rats[i].x - bot.dunder.rats[i].dirZ, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z - bot.dunder.rats[i].dirX, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
            {x:bot.dunder.rats[i].x - bot.dunder.rats[i].dirZ * 2, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z - bot.dunder.rats[i].dirX * 2, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
            {x:bot.dunder.rats[i].x - bot.dunder.rats[i].dirZ * 3, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z - bot.dunder.rats[i].dirX * 3, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
            //{x:bot.dunder.rats[i].x - bot.dunder.rats[i].dirZ * 4, y:bot.dunder.rats[i].y, z:bot.dunder.rats[i].z - bot.dunder.rats[i].dirX * 4, dirX:bot.dunder.rats[i].dirX, dirZ:bot.dunder.rats[i].dirZ, dead:false},
        );
    }*/

    var leColumns = bot.world.getColumns();
    chunkColumns = [];
    for (var i = 0; i < leColumns.length; i++) {
        if (!chunkColumns[leColumns[i].chunkZ]) {
            chunkColumns[leColumns[i].chunkZ] = [];
        }
        chunkColumns[leColumns[i].chunkZ][leColumns[i].chunkX] = true;
    }

    bot.dunder.findingRat = setInterval(function () {
        var ratFindAmount = 0;
        while(ratFindAmount < 4) { 
            ratFindAmount++;
            doFindingRat(bot, endX, endY, endZ);
        }
    }, 50);

    /*setTimeout(function() {
        clearRatTimeout(bot);
    }, 500)*/
};

function clearRatTimeout(bot) {
    clearInterval(bot.dunder.findingRat);
    bot.dunder.findingRat = null;
};

function doFindingRat(bot, endX, endY, endZ) {
        console.log(bot.dunder.cbtm + " is ratfinding");
        for (var i = 0; i < bot.dunder.rats.length; i++) {
            bot.dunder.rats[i].x = Math.floor(bot.dunder.rats[i].x);
            bot.dunder.rats[i].y = Math.floor(bot.dunder.rats[i].y);
            bot.dunder.rats[i].z = Math.floor(bot.dunder.rats[i].z);
            if (!checkChunk(bot.dunder.rats[i].x, bot.dunder.rats[i].z) || bot.dunder.rats[i].dead) {
                continue;
            }
            if (Math.random() < 0.9 || true) {
                //console.log(bot.dunder.rats[i].x);
                bot.dunder.rats[i].x += bot.dunder.rats[i].dirX;
                bot.dunder.rats[i].z += bot.dunder.rats[i].dirZ;
                //console.log(bot.dunder.rats[i].x);
            } else {
                //bot.dunder.rats[i].x += (Math.round(Math.random()) == 1) ? 1 : -1;
                //bot.dunder.rats[i].z += (Math.round(Math.random()) == 1) ? 1 : -1;
                bot.dunder.rats[i].x += (Math.round(Math.random() * 2) - 1);
                bot.dunder.rats[i].z += (Math.round(Math.random() * 2) - 1);
            }
            if (!checkChunk(bot.dunder.rats[i].x, bot.dunder.rats[i].z)) {
                continue;
            }
            var whileTries = 0;

            while (blockSolid(bot, bot.dunder.rats[i].x, bot.dunder.rats[i].y, bot.dunder.rats[i].z) && whileTries < 400) {
                whileTries++;
                bot.dunder.rats[i].y++;
            }
            whileTries = 0;
            while (!blockSolid(bot, bot.dunder.rats[i].x, bot.dunder.rats[i].y - 1, bot.dunder.rats[i].z) && whileTries < 400) {
                bot.dunder.rats[i].y--;
            }
        }
        if (bot.dunder.chatParticles) {
            /*for (var i = 0; i < bot.dunder.rats.length; i++) {
                bot.chat("/particle soul_fire_flame " + bot.dunder.rats[i].x + " " + bot.dunder.rats[i].y + " " + bot.dunder.rats[i].z);
            }*/
        }

        var bestRat = 0;
        for (var i = 1; i < bot.dunder.rats.length; i++) {
            if (dist3d(bot.dunder.rats[bestRat].x, 0, bot.dunder.rats[bestRat].z, endX, endY, endZ) > dist3d(bot.dunder.rats[i].x, 0, bot.dunder.rats[i].z, endX, endY, endZ)) {
                bestRat = i;
            }
        }

        
        if (bot.dunder.chatParticles) {
            bot.chat("/particle flame " + bot.dunder.rats[bestRat].x + " " + bot.dunder.rats[bestRat].y + " " + bot.dunder.rats[bestRat].z);
            bot.lookAt(new Vec3(bot.dunder.rats[bestRat].x, bot.dunder.rats[bestRat].y, bot.dunder.rats[bestRat].z), 100);
            if (dist3d(bot.dunder.rats[bestRat].x, bot.dunder.rats[bestRat].y, bot.dunder.rats[bestRat].z, endX, endY, endZ) < 3) {
                bot.dunder.rats[bestRat].dead = true;
            }
            bot.dunder.bestRat = {"position":new Vec3(bot.dunder.rats[bestRat].x, bot.dunder.rats[bestRat].y, bot.dunder.rats[bestRat].z)};
        }

        clearRatTimeout(bot);
};
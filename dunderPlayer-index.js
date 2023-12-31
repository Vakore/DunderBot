console.log("index loaded");//Remove this line if you want, but I recommend leaving it in just so you know when the bot actually starts.

/*
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//Only change values below this line

//--------------SETTINGS-----------------------
useWebInventory = true;//Port is 3000
version = "1.20.1";//"1.20.1";
host = "localhost";//localhost for LAN worlds
port = 25565;//25565;//25565 is default port for most servers
commanders = ["Vakore"];//The commander of the bots. Will only listen to chat commands from these players
botsToSpawn = ["DunderBot"];//Currently only accepts a username as an argument. Note that more than one bot causes unwated bugs and errors that need ironing out. One or two works fine, but three starts to make things unstable.
botJoinServerDelay = 2000;//2000 by default to avoid throttled connections
dunderDebug = false;//False by default. Show debug information in the console or not.
//------------------SETTINGS--------------------


//Do whatever you want below this line. botTaskManager will be called every physics tick, so don't call beefy functions here.
function dunderTaskManager(bot) {
    //dunderTaskLog(bot.masterState + ", " + bot.dunder.masterState + ", " + bot.dunder.state);
    if (bot.dunderTasks.length == 0 && bot.dunderTaskCompleted) {
        //createDunderTask(bot, "goto", {"player":"Vakore"});
    }
};

function dunderTaskInitialize(bot) {
    dunderTaskLog("Initiallizing tasks!");
    /*for (var i in bot.registry) {
    console.log(i);
    }*/
  //createDunderTask(bot, "goto", {"block":(block) => (block.name == "nether_portal" && block.position && blockSolid(bot, block.position.x, block.position.y-1, block.position.z)), "distance":30, "useExtraInfo":true});

  //createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("_log") && blockExposed(bot, block)), "distance":30, "count":20, "useExtraInfo":true});
  //createDunderTask(bot, "goto", {"block":(block) => (bot.isABed(block) && bot.parseBedMetadata(block).occupied == 0), "distance":30, "pathGoalForgiveness":3});
  //createDunderTask(bot, "sleep");
  //createDunderTask(bot, "wake");
  //createDunderTask(bot, "setMasterState", {"masterState":"idle"});
    //finishCondition: positive number indicates adding that many, negative number indicates obtaining that total, 0 indicates just mining blocks
    //createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("diamond_block") && blockExposed(bot, block)), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":2, "itemCondition":function(itemName) {return itemName.includes("diamond_block");}});
    //createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("coal_ore") && blockExposed(bot, block)), "distance":30, "count":20, "useExtraInfo":true, "finishCondition":2, "itemCondition":function(itemName) {return itemName.includes("coal");}});

    //createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("_log") /*&& blockExposed(bot, block)*/), "distance":30, "count":20, "useExtraInfo":true, "finishCondition":2, "itemCondition":function(itemName) {return itemName.includes("_log");}});
    /*createDunderTask(bot, "setMasterState", {"masterState":"idle"});*/

/*createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("oak_log")), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName.includes("oak_log");}});
createDunderTask(bot, "mine", {"block":(block) => (block.name == "stone"), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName == "cobblestone";}});createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("oak_log")), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName.includes("oak_log");}});
createDunderTask(bot, "mine", {"block":(block) => (block.name == "stone"), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName == "cobblestone";}});createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("oak_log")), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName.includes("oak_log");}});
createDunderTask(bot, "mine", {"block":(block) => (block.name == "stone"), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName == "cobblestone";}});
createDunderTask(bot, "setMasterState", {"masterState":"idle"});*/

    createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("oak_log")), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName.includes("oak_log");}});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"crafting_table"});
    createDunderTask(bot, "craft", {"name":"stick"});
    createDunderTask(bot, "placeCrafting");
    createDunderTask(bot, "craft", {"name":"wooden_pickaxe"});

    createDunderTask(bot, "mine", {"block":(block) => (block.name == "crafting_table"), "distance":30, "count":1, "useExtraInfo":true, "finishCondition":1, "itemCondition":function(itemName) {return itemName == "crafting_table";}});
    createDunderTask(bot, "mine", {"block":(block) => (block.name == "stone"), "distance":30, "count":3, "useExtraInfo":true, "finishCondition":3, "itemCondition":function(itemName) {return itemName == "cobblestone";}});

    createDunderTask(bot, "placeCrafting");
    createDunderTask(bot, "craft", {"name":"stone_axe"});
    createDunderTask(bot, "mine", {"block":(block) => (block.name == "crafting_table"), "distance":30, "count":1, "useExtraInfo":true, "finishCondition":1, "itemCondition":function(itemName) {return itemName == "crafting_table";}});

    createDunderTask(bot, "mine", {"block":(block) => (block.name.includes("oak_log")), "distance":30, "count":10, "useExtraInfo":true, "finishCondition":10, "itemCondition":function(itemName) {return itemName.includes("oak_log");}});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "craft", {"name":"oak_planks"});
    createDunderTask(bot, "placeCrafting");
    createDunderTask(bot, "craft", {"name":"oak_door"});
    createDunderTask(bot, "equip", {"items":["oak_door"],destination:"off-hand"});
    createDunderTask(bot, "equip", {"items":["stone_axe"],destination:"hand"});
    bot.dunderTaskCompleted = true;
};
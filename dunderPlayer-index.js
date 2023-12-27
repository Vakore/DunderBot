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
useWebInventory = false;//Port is 3000
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
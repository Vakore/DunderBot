# DunderBot
By Vakore

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

A minecraft bot I am working on. It is not that smart at the moment, and breaks frequently, however I am working on improving it.

Type 'goto (player)', 'goto (x) (y) (z)', or 'goto (x) (z)' to enter pathfinding mode and go to those coordinates
Type 'e' to enter generic mode.

Go to dunderPlayer-main and edit the settings on the top to run the program.

To show pathfinding debug particles go to line 128 of dunderPlayer-main and change 'chatParticles' to true, make sure cheats are on. To turn these off set it to false. Currently on by default.

Version - Alpha 8/10/2023

NOTE: Not all of these files are necessary to run the bot(the 'backup' and 'old' files), as these are backups for myself.

Features:

Pathfinding mode:
Breaking blocks
Placing blocks(alawys assumes infinite blocks)
Water clutches
Pathfinding outside of chunks
WIP swimming
Jump sprinting along the path. Currently WIP.

Generic Mode:
Decent PvE, able to use shield, still WIP
Auto eating, will not eat if there is a mob threat nearby, WIP
Sprint jumping to follow the player. Eventually this and pathfind mode will be combined into one as a global movement mode, I've done this before in previous iterations of this project I'm just trying to get everything working at a passable level before implementing this
WIP fire extinguishing with a water bucket.

PvP and other things you might want aren't included yet.

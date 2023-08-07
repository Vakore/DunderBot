# DunderBot
By Vakore

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

A minecraft bot I am working on. It is not that smart at the moment, and breaks frequently, however I am working on improving it.

Type 'goto (player)', 'goto (x) (y) (z)', or 'goto (x) (z)' to enter pathfinding mode and go to those coordinates
Type 'e' to enter generic mode.

Version - Alpha 8/6/2023

NOTE: Not all of these files are necessary to run the bot(the 'backup' and 'old' files), as these are backups for myself.

Features:

Pathfinding mode:
Breaking blocks
Placing blocks(alawys assumes infinite blocks)
Water clutches
Pathfinding outside of chunks
Very WIP code that will likely crash or get stuck due to how I'm handling the "couldn't find path in reasonable time" thing, especially underground.
WIP swimming

Generic Mode:
Decent PvE, able to use shield, still WIP
Auto eating, will not eat if there is a mob threat nearby, WIP
Sprint jumping to follow the player. Eventually this and pathfind mode will be combined into one as a global movement mode, I've done this before in previous iterations of this project I'm just trying to get everything working at a passable level before implementing this

PvP and other things you might want aren't included yet.

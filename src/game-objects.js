'use strict';


function Queue(){
  this.queue = [];
  this.enqueue = function(item){
    this.queue.push(item);
  }
  this.dequeue = function(){
    var first = this.queue[0];
    this.queue = this.queue.slice(0);
    return first;
  }
}

function Terrain(name, moveCost, graphic){
  this.name = name;
  this.moveCost = moveCost;
  this.graphic = undefined;
  if (graphic != undefined)
    this.graphic = graphic;
}

function Unit(name, team, loc, move, hp, armor, attack, attack_range, squad_size, graphic){
  this.name = name;
  this.team = team;
  this.loc = loc;
  this.move = move;
  this.hasMoved = false;
  this.hp = hp;
  this.armor = armor;
  this.attack = attack;
  this.attack_range = attack_range;
  this.squad_size = squad_size;
  this.damage = [];
  for (var i = 0; i < this.squad_size; i++)
    this.damage.push(0);
}

function FloodHelper(loc, cost){
  this.loc = loc;
  this.cost = cost;
}

function TerrainBuilder(terrainGrid){
  this.y = terrainGrid.length;
  this.x = terrainGrid[0].length;

  this.terrain = this.fillTerrain(this.empty());

  this.fill = function(){
    for (var j = 0; j < this.trnnY; j++){
      for (var i = 0; i < this.trrnX; i++){
        switch(terrainGrid[j][i]){
          case 'Space':
            this.terrainGrid[j][i] = this.spaceTerrain;
            break;
          case 'Debri':
            this.terrainGrid[j][i] = this.debrisTerrain;
            break;
          case 'Astrd':
            this.terrainGrid[j][i] = this.asteroidTerrain;
        }
      }
  }

  this.empty = function(){
      var grid = [];
        for (var i = 0; i < this.y; i++){
          var row = [];
          for (var j = 0; j < this.x; i++)
            row.push(undefined);
          terrainGrid.push(row);
        }
      return grid;
  }
}

function GameBoard(terrainGrid, unitList){
        this.terrainBuilder = new TerrainBuilder(terrainGrid);

        this.spaceTerrain = new Terrain('Space',  1, undefined);
        this.debrisTerrain = new Terrain('Debri',  2, 'https://www.dropbox.com/s/fvm2pej21m3rk2o/debri.png?raw=1');
        this.asteroidTerrain = new Terrain('Astrd', 99, 'https://www.dropbox.com/s/4ta8cmv9dh5hs8p/astrd.png?raw=1');


        this.units = unitList
        this.selUnit = None
        this.unitMove = []
        this.unitFire = []
        this.enemyZone = []

    def getTerrainAt(this, coord):
        return this.terrainGrid[coord[1]][coord[0]]

    def getUnitAt(this, coord):
        for unit in this.units:
            if unit.loc == coord:
                return unit

    def getTileDiamond(this, cen, dist):
        tiles = []
        j = -dist
        while j <= dist:
            i = -(dist - abs(j))
            while i <= dist - abs(j):
                if cen[0] + i >= 0 and cen[0] + i < this.trrnX and cen[1] + j >= 0 and cen[1] + j < this.trrnY:
                    tiles.append((cen[0] + i, cen[1] + j))
                i = i + 1
            j = j + 1
        return tiles

    def setSelected(this, unit):
        this.selUnit = unit
        if this.selUnit != None:
            this.unitMove = this.getMoveableSqrs(this.selUnit)
        else:
            this.unitMove = []

    def setEnemyZone(this, unit):
        if unit == None:
            this.enemyZone = []
        else:
            this.enemyZone = this.getAttackableSqrs(unit)

    def getNayborLocs(this, loc):
        neighbors = []
        i = loc[0]
        j = loc[1]
        if i - 1 >= 0:
            neighbors.append((i - 1, j))
        if i + 1 < activeBoard.trrnX:
            neighbors.append((i + 1, j))
        if j - 1 >= 0:
            neighbors.append((i, j - 1))
        if j + 1 < activeBoard.trrnY:
            neighbors.append((i, j + 1))
        return neighbors

    def getMoveableSqrs(this, unit):
        #i did not crib this from the internet

        moveableSqrs = []

        frontier = Queue()
        origin = FloodHelper(unit.loc, 0)
        frontier.enqueue(origin)
        visited = {}
        visited[unit.loc] = True

        while len(frontier.queue) > 0:
            current = frontier.dequeue()
            for loc in this.getNayborLocs(current.loc):
                dist = current.cost + activeBoard.getTerrainAt(loc).moveCost
                #if loc not visited and reachable by movement and not occupied by enemy
                unitAt = activeBoard.getUnitAt(loc)
                if loc not in visited and dist <= unit.move and (unitAt == None or unitAt.team == unit.team):
                    frontier.enqueue(FloodHelper(loc, dist))
                    moveableSqrs.append(loc)
                    visited[loc] = True

        #lastly remove sqrs occupied by friendlies, can't land there
        toRemove = []
        for potFriend in activeBoard.units:
            if potFriend.loc in moveableSqrs:
                toRemove.append(potFriend.loc)
        for doomed in toRemove:
            moveableSqrs.remove(doomed)
        #add own space
        moveableSqrs.append(unit.loc)

        return moveableSqrs

    def getAttackableSqrs(this, unit):
        moveableSqrs = this.getMoveableSqrs(unit)
        attackableSqrs = []
        for sqr in moveableSqrs:
            #get adjacent(by range!) squares and add to list
            for tile in this.getTileDiamond(sqr, unit.attack_range):
                if tile not in attackableSqrs:
                    attackableSqrs.append(tile)
        return attackableSqrs


    def setFireSqrs(this, unit):
        if unit != None:
            this.unitFire = this.getTileDiamond(unit.loc, unit.attack_range)
            this.unitFire.remove(unit.loc)
        else:
            this.unitFire = []

    def foundEmpty(this, tile):
        for unit in this.units:
            if tile == unit.loc:
                return False
        return True

    def combat(this, attacker, defender):

        new_dmg = [0 for member in range(defender.squad_size)]
        for a in range(attacker.squad_size):
            new_dmg[random.randrange(len(new_dmg))] += attacker.attack
        for d in range(len(defender.damage)):
            defender.damage[d] += max(0, new_dmg[d]-defender.armor)


        #sort defender.damage lowest to highest
        defender.damage.sort()
        #redefine defender.damage erasing members without remaining hp
        for d in range(len(defender.damage)):
            if defender.damage[d] >= defender.hp:
                #slice the list and break this loop
                defender.damage = defender.damage[:d]
                defender.squad_size = len(defender.damage)
                break
        if defender.squad_size == 0:
            this.units.remove(defender)

}



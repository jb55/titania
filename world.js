
//===----------------------------------------------------------------------===//
// World
//===----------------------------------------------------------------------===//
function World(elem) {
  this.width = 640;
  this.height = 480;
  this.tile_size = 32;
  this.tile_width = this.width / this.tile_size;
  this.tile_height = this.height / this.tile_size;
  this.player = createPlayer();
  this.entities = [];
  this.input = new Input();
  this.firstDraw = true;

  var isElem = elem instanceof Element;
  this.canvas = isElem ? elem : document.getElementById(elem);
  this.ctx = this.canvas.getContext('2d');

  this.ctx.setTransform(1.5, 0, 0, 0.75, 0, 0);
  this.ctx.rotate((Math.PI/180) * 45);
  this.ctx.translate(100, -100);

  // TEST
  initTestWorld(this);

  var self = this;
  this.preload(function() {
    self.ticker = new Ticker(24, function() {
      var redrawTiles = self.getRedrawTiles() || [];
      self.update();
      self.draw(redrawTiles);
    });
    self.ticker.run();
  });
}

//===----------------------------------------------------------------------===//
// initTestWorld
//===----------------------------------------------------------------------===//
function initTestWorld(world) {
  world.map = test_map;
}

//===----------------------------------------------------------------------===//
// World.doCollisions
//===----------------------------------------------------------------------===//
World.prototype.doCollisions = function() {
  collisionPush(this, this.player);
};


//===----------------------------------------------------------------------===//
// World.getTileCoord
//===----------------------------------------------------------------------===//
World.prototype.getTileCoord = function(x, y) {
  x %= this.width;
  y %= this.height;

  x /= this.tile_size;
  y /= this.tile_size;

  x = Math.floor(x);
  y = Math.floor(y);

  return {x: x, y: y};
};


//===----------------------------------------------------------------------===//
// World.getTileFromPoint
//===----------------------------------------------------------------------===//
World.prototype.getTileFromPoint = function(x, y) {
  var tilePoint = this.getTileCoord(x, y);
  return this.getTile(tilePoint.x, tilePoint.y);
};


//===----------------------------------------------------------------------===//
// World.getTile
//===----------------------------------------------------------------------===//
World.prototype.getTile = function(x, y) {
  var row = this.map[y];

  if (!row)
    return TILES[0];

  return TILES[row[x]] || TILES[0];
};


//===----------------------------------------------------------------------===//
// World.getRedrawTiles
//===----------------------------------------------------------------------===//
World.prototype.getRedrawTiles = function() {
  var coords = [];
  var self = this;

  function doEnt(ent) {
    if (!ent.animated) return;
    pushCoordSet(self.getTileCoord(ent.left(), ent.top()), coords);
    pushCoordSet(self.getTileCoord(ent.left(), ent.bottom()), coords);
    pushCoordSet(self.getTileCoord(ent.right(), ent.top()), coords);
    pushCoordSet(self.getTileCoord(ent.right(), ent.bottom()), coords);
    pushCoordSet(self.getTileCoord(ent.center_x(), ent.center_y()), coords);
  }

  // do player
  doEnt(this.player);

  for (var i = 0; i < this.entities.length; i++) {
    doEnt(this.entities[i]);
  };

  return coords;
};


//===----------------------------------------------------------------------===//
// pushCoordSet
//===----------------------------------------------------------------------===//
function pushCoordSet(coord, set) {
  for (var i = 0; i < set.length; i++) {
    var setCoord = set[i];
    if (coord.x == setCoord.x && coord.y == setCoord.y)
      return;
  };
  set.push(coord);
}


//===----------------------------------------------------------------------===//
// World.clear
//===----------------------------------------------------------------------===//
World.prototype.clear = function(redrawTiles) {
  for (var i = 0; i < redrawTiles.length; i++) {
    var x = redrawTiles[i].x;
    var y = redrawTiles[i].y;
    this.ctx.clearRect(x * this.tile_size, y * this.tile_size, this.tile_size, 
                       this.tile_size);
  };
}


//===----------------------------------------------------------------------===//
// World.update
//===----------------------------------------------------------------------===//
World.prototype.update = function() {
  this.player.update(this);
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].update(this);
  };

  // do collisions
  this.doCollisions();
};


//===----------------------------------------------------------------------===//
// World.draw
//===----------------------------------------------------------------------===//
World.prototype.draw = function(redrawTiles) {
  this.clear(redrawTiles);
  this.drawTiles(redrawTiles);
  //this.drawGrid();
  this.drawEntities();
  //drawDebugPoint(this.player, this.ctx);
}


//===----------------------------------------------------------------------===//
// World.preload
//===----------------------------------------------------------------------===//
World.prototype.preload = function(done) {
  var list = TILES.concat(OBJECTS);
  var len = list.length;
  var self = this;
  this.c = 0;

  for (var i = 0; i < len; i++) {
    var entity = list[i];
    entity.img = new Image();
    entity.img.onload = function() {
      self.c += 1;
      if (self.c == len) {
        done();
      }
    }
    entity.img.src = "img/" + entity.name + '.png';
  };
};


//===----------------------------------------------------------------------===//
// World.drawEntities
//===----------------------------------------------------------------------===//
World.prototype.drawEntities = function() {
  this.player.draw(this);
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].draw(this);
  };
};


//===----------------------------------------------------------------------===//
// World.drawGrid
//===----------------------------------------------------------------------===//
World.prototype.drawGrid = function() {
  this.ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";

  // draw vertical lines
  for (var i = 1; i < this.tile_width; ++i) {
    var x = i * this.tile_size;
    drawLine(this.ctx, x, 0, x, this.height);
  }

  // draw horizontal lines
  for (var i = 1; i < this.tile_width; ++i) {
    var y = i * this.tile_size;
    drawLine(this.ctx, 0, y, this.width, y);
  }

  // border
  drawLine(this.ctx, 0, 0, 0, this.height); // left
  drawLine(this.ctx, 0, 0, this.width, 0); // top
  drawLine(this.ctx, this.width-1, 0, this.width-1, this.height-1); // right
  drawLine(this.ctx, 0, this.height-1, this.width-1, this.height-1); // bottom
}



//===----------------------------------------------------------------------===//
// World.drawTiles
//===----------------------------------------------------------------------===//
World.prototype.drawTiles = function (redrawTiles) {

  var self = this;
  function drawImg(x, y) {
    var img = self.getTile(x, y).img;
    self.ctx.drawImage(img, x * self.tile_size, y * self.tile_size);
  }

  if (!this.firstDraw) {
    for (var i = 0; i < redrawTiles.length; i++) {
      var x = redrawTiles[i].x;
      var y = redrawTiles[i].y;
      drawImg(x, y);
    }
  } else {
    for (var x = 0; x < this.tile_width; x++) {
      for (var y = 0; y < this.tile_height; y++) {
        drawImg(x, y);
      }
    }
    this.firstDraw = false;
  }
}


function trace(msg) {
  console.log("***", msg);
}


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

  var isElem = elem instanceof Element;
  this.canvas = isElem ? elem : document.getElementById(elem);
  this.ctx = this.canvas.getContext('2d');

  // TEST
  initTestWorld(this);

  var self = this;
  this.preload(function() {
    self.ticker = new Ticker(25, function() {
      self.update();
      self.draw();
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
// World.clear
//===----------------------------------------------------------------------===//
World.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
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
World.prototype.draw = function() {
  this.clear();
  this.drawTiles();
  //this.drawGrid();
  this.drawEntities();
  drawDebugPoint(this.player, this.ctx);
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
World.prototype.drawTiles = function () {
  for (var x = 0; x < this.tile_width; ++x) {
    for (var y = 0; y < this.tile_height; ++y) {
      var img = this.getTile(x, y).img;
      this.ctx.drawImage(img, x * this.tile_size, y * this.tile_size);
    }
  }
}


function trace(msg) {
  console.log("***", msg);
}

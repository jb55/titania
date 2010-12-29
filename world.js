
//===----------------------------------------------------------------------===//
// World
//===----------------------------------------------------------------------===//
function World(layerElems) {
  this.width = 640;
  this.height = 480;
  this.tile_size = 32;
  this.tile_width = this.width / this.tile_size;
  this.tile_height = this.height / this.tile_size;
  this.player = createPlayer();
  this.entities = [];
  this.input = new Input();
  this.layers = [];
  this.firstDraw = true;

  for (var i = 0; i < layerElems.length; i++) {
    var canvas = document.getElementById(layerElems[i]);
    canvas.width = this.width * 2;
    canvas.height = this.height * 2;
    var ctx = canvas.getContext('2d');
    this.layers.push(ctx);
  };

  this.tileLayer = this.layers[0];
  this.entLayer = this.layers[1];

  // TEST
  initTestWorld(this);

  var self = this;
  this.preload(function() {
    self.ticker = new Ticker(24, function() {
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
World.prototype.clear = function(ctx) {
  ctx.clearRect(0, 0, this.width, this.height);

//for (var i = 0; i < redrawTiles.length; i++) {
//  var x = redrawTiles[i].x;
//  var y = redrawTiles[i].y;
//  ctx.clearRect(x * this.tile_size, y * this.tile_size, this.tile_size, 
//                     this.tile_size);
//};
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
  if (this.firstDraw) {
    function setTransforms(layer) {
      // isometric
      // rotate 45 degrees, scale y by 1.5 and x by 0.75
      layer.setTransform(1.0606, 0.53032, -1.0606, 0.53032, 0, 0);
      layer.translate(300, -230);
    }

    this.clear(this.tileLayer);

    this.tileLayer.setTransform(-1, 0.5, 0, 1, 0, 0);
    this.tileLayer.translate(-600, 340);
    this.tileLayer.scale(1.06, 1.06);
    this.drawTiles(this.tileLayer, /* side images */ true, /*inv*/ true);

    this.tileLayer.setTransform(1, 0.5, 0, 1, 0, 0);
    this.tileLayer.translate(562, -245);
    this.tileLayer.scale(1.06, 1.06);
    this.drawTiles(this.tileLayer, /* side images */ true);

    setTransforms(this.tileLayer);
    setTransforms(this.entLayer);

    this.drawTiles(this.tileLayer);
  }
  //this.drawGrid();
  this.clear(this.entLayer);
  this.drawEntities(this.entLayer);
  //drawDebugPoint(this.player, this.ctx);
  this.firstDraw = false;
}


//===----------------------------------------------------------------------===//
// World.preload
//===----------------------------------------------------------------------===//
World.prototype.preload = function(done) {
  var self = this;
  this.c = 0;
  var len = TILES.length + OBJECTS.length;

  function entOnLoad() {
    self.c += 1;
    if (self.c == len) {
      done();
    }
  }

  function doEnt(entity) {
    if (entity.transparent) {
      entOnLoad();
      return;
    }
    entity.img = new Image();
    entity.img.onload = entOnLoad;
    entity.img.src = "img/" + entity.name + '.png';
    if (entity.side) {
      len += 1;
      entity.side_img = new Image();
      entity.side_img.onload = entOnLoad;
      entity.side_img.src = 'img/' + entity.name + '_side' + '.png';
    }
  }

  // Tiles
  for (var i = 0; i < TILES.length; i++) {
    doEnt(TILES[i]);
  };

  // Objects
  for (var i = 0; i < OBJECTS.length; i++) {
    doEnt(OBJECTS[i]);
  };

};


//===----------------------------------------------------------------------===//
// World.drawEntities
//===----------------------------------------------------------------------===//
World.prototype.drawEntities = function(layer) {
  this.player.draw(this, layer);
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].draw(this, layer);
  };
};


//===----------------------------------------------------------------------===//
// World.drawGrid
//===----------------------------------------------------------------------===//
World.prototype.drawGrid = function(layer) {
  layer.strokeStyle = "rgba(0, 0, 0, 0.25)";

  // draw vertical lines
  for (var i = 1; i < this.tile_width; ++i) {
    var x = i * this.tile_size;
    drawLine(layer, x, 0, x, this.height);
  }

  // draw horizontal lines
  for (var i = 1; i < this.tile_width; ++i) {
    var y = i * this.tile_size;
    drawLine(layer, 0, y, this.width, y);
  }

  // border
  drawLine(layer, 0, 0, 0, this.height); // left
  drawLine(layer, 0, 0, this.width, 0); // top
  drawLine(layer, this.width-1, 0, this.width-1, this.height-1); // right
  drawLine(layer, 0, this.height-1, this.width-1, this.height-1); // bottom
}



//===----------------------------------------------------------------------===//
// World.drawTiles
//===----------------------------------------------------------------------===//
World.prototype.drawTiles = function (ctx, side, inv) {

  for (var y = 0; y < this.tile_height; y++) {

    if (side) {
      if (inv) {
        ctx.translate(this.tile_size, 0);
      } else {
        ctx.translate(-this.tile_size, this.tile_size);
      }
    }

    if (inv) ctx.save();
    for (var x = 0; x < this.tile_width; x++) {
      if (inv) ctx.translate(2*-this.tile_size, this.tile_size);
      var tile = this.getTile(x, y);
      var img = side ? tile.side_img || tile.img : tile.img;
      var j = side ? 0 : 1;

      ctx.drawImage(img, x * this.tile_size, y * this.tile_size * j);
    }
    if (inv) ctx.restore();
  }

}


//===----------------------------------------------------------------------===//
// World
//===----------------------------------------------------------------------===//
function World(elem) {
  this.width = 800;
  this.height = 600;
  this.tile_size = 32;
  this.tile_width = this.width / this.tile_size;
  this.tile_height = this.height / this.tile_size;
  this.player = createPlayer();
  this.entities = [];
  this.input = new Input();

  var canvas = document.getElementById(elem);
  canvas.width = this.width;
  canvas.height = this.height;

  this.gl = initWebGL(canvas,
    [0, 0, 0, 1.0], // clear color
    10000 // depth
  );

  if (!this.gl) {
    // couldn't load WebGL
    console.log('Error loading WebGL');
    return;
  }

  // TEST
  initTestWorld(this);

  var self = this;
  this.preload(this.gl, function() {
    (function loop() {
      WebGLUtils.requestAnimationFrame(canvas, loop);
      self.update();
      self.draw();
    })();
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
World.prototype.clear = function(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BUT);
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
  this.clear(this.gl);
  this.drawTiles();
  this.drawEntities();
}


//===----------------------------------------------------------------------===//
// World.preload
//===----------------------------------------------------------------------===//
World.prototype.preload = function(gl, done) {
  var self = this;
  this.c = 0;
  var len = 0;

  function onLoadAsset(asset) {
    // generate texture
    var texture = generateTexture(gl, asset.img);
    asset.texture = texture;

    self.c += 1;
    if (self.c == len) {
      done();
    }
  }

  function doEnt(entity) {
    var assets = entity.assets || [];
    entity.assets = assets;

    if (entity.transparent) {
      return;
    }

    function doAsset(src) {
      var asset = {};
      len += 1;
      asset.img = new Image();
      asset.img.onload = function() { onLoadAsset(asset); };
      asset.img.src = src;
      assets.push(asset);
    }

    doAsset("img/" + entity.name + '.png');

    if (entity.side) {
      doAsset("img/" + entity.name + '_side.png');
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
World.prototype.drawGrid = function(ctx) {
  // draw vertical lines
  for (var i = 1; i < this.tile_width; ++i) {
    var x = i * this.tile_size;
    drawLine(ctx, x, 0, x, this.height);
  }

  // draw horizontal lines
  for (var i = 1; i < this.tile_width; ++i) {
    var y = i * this.tile_size;
    drawLine(ctx, 0, y, this.width, y);
  }

  // border
  drawLine(ctx, 0, 0, 0, this.height); // left
  drawLine(ctx, 0, 0, this.width, 0); // top
  drawLine(ctx, this.width-1, 0, this.width-1, this.height-1); // right
  drawLine(ctx, 0, this.height-1, this.width-1, this.height-1); // bottom
}



//===----------------------------------------------------------------------===//
// World.drawTiles
//===----------------------------------------------------------------------===//
World.prototype.drawTiles = function (ctx, side, inv) {
}

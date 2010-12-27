
var test_map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

function initTestWorld(world) {
  world.map = test_map;
}

//===----------------------------------------------------------------------===//
// Data
//===----------------------------------------------------------------------===//
TILES = [
  { name: 'grass' },
  { name: 'stone', clip: true }
];

OBJECTS = [
  { name: 'player' }
];

// Directions
var NORTH = 1;
var EAST = 2;
var SOUTH = 3;
var WEST = 4;

// default move amount
var DEFAULT_MOVE = 3;

//===----------------------------------------------------------------------===//
// Entity
//===----------------------------------------------------------------------===//
function Entity() {
  this.x = 0;
  this.y = 0;
  this.img = 0;
}

//===----------------------------------------------------------------------===//
// Entity.bottom
//===----------------------------------------------------------------------===//
Entity.prototype.bottom = function() {
  return this.y + this.h;
};


//===----------------------------------------------------------------------===//
// Entity.center_y
//===----------------------------------------------------------------------===//
Entity.prototype.center_y = function() {
  return this.y + (this.h / 2);
};


//===----------------------------------------------------------------------===//
// Entity.center_x
//===----------------------------------------------------------------------===//
Entity.prototype.center_x = function() {
  return this.x + (this.w / 2);
};


//===----------------------------------------------------------------------===//
// Entity.top
//===----------------------------------------------------------------------===//
Entity.prototype.top = function() {
  return this.y;
};

//===----------------------------------------------------------------------===//
// Entity.left
//===----------------------------------------------------------------------===//
Entity.prototype.left = function() {
  return this.x;
};

//===----------------------------------------------------------------------===//
// Entity.right
//===----------------------------------------------------------------------===//
Entity.prototype.right = function() {
  return this.x + this.w;
};

//===----------------------------------------------------------------------===//
// Entity.update
//===----------------------------------------------------------------------===//
Entity.prototype.update = function() {
  // Do nothing
}

//===----------------------------------------------------------------------===//
// Entity.draw
//===----------------------------------------------------------------------===//
Entity.prototype.draw = function(world) {
  this.drawSprite(world.ctx);
};


//===----------------------------------------------------------------------===//
// Entity.drawSprite
//===----------------------------------------------------------------------===//
Entity.prototype.drawSprite = function(ctx) {
  var img = OBJECTS[this.img].img;
  ctx.drawImage(img, this.x, this.y);
};


//===----------------------------------------------------------------------===//
// moveObject
//   object constraints: x, y
//===----------------------------------------------------------------------===//
function moveObject(object, direction, world, amount) {
  amount = amount || moveAmount(object, direction, world);
  switch(direction) {
    case NORTH:
      object.y -= amount;
      break;
    case EAST:
      object.x += amount;
      break;
    case SOUTH:
      object.y += amount;
      break;
    case WEST:
      object.x -= amount;
      break;
  }
}


//===----------------------------------------------------------------------===//
// World.doCollisions
//===----------------------------------------------------------------------===//
World.prototype.doCollisions = function() {
  collisionPush(this, this.player);
};

//===----------------------------------------------------------------------===//
// oppositeDirection
//===----------------------------------------------------------------------===//
function oppositeDirection(direction) {
  switch(direction) {
    case NORTH: return SOUTH;
    case SOUTH: return NORTH;
    case EAST: return WEST;
    case WEST: return EAST;
  }
}


//===----------------------------------------------------------------------===//
// moveAmount
//   determines how far an object should move
//===----------------------------------------------------------------------===//
function moveAmount(object, direction, world) {
  // handle slowed tile effects, etc
  return DEFAULT_MOVE;
}

function pushDirection(world, object, tileCoord) {
  var tileCx = (tileCoord.x * world.tile_size) + (world.tile_size / 2);
  var tileCy = (tileCoord.y * world.tile_size) + (world.tile_size / 2);
  
  var dx = tileCx - object.center_x();
  var dy = tileCy - object.center_y();

  var pushHoriz = Math.abs(dx) >= Math.abs(dy);

  if (pushHoriz) {
    return dx >= 0 ? WEST : EAST;
  } else {
    return dy >= 0 ? NORTH : SOUTH;
  }

}

//===----------------------------------------------------------------------===//
// collidesWithWorld
//   determines if a point is inside of a collision bounding box
//   object constraints: top(), left(), bottom(), right()
//===----------------------------------------------------------------------===//
function collisionPush(world, object) {
  var push;
  var collided = false;

  function testPoint(x, y) {
    var tileCoord = world.getTileCoord(x, y);
    var tile = world.getTile(tileCoord.x, tileCoord.y);
    var collided = !!tile.clip;

    if (collided) {
      var direction = pushDirection(world, object, tileCoord);
      switch(direction) {
        case EAST:
          move = ((tileCoord.x + 1) * world.tile_size) - x;
          break;
        case WEST:
          move = x - (tileCoord.x * world.tile_size);
          break;
        case SOUTH:
          move = ((tileCoord.y + 1) * world.tile_size) - y;
          break;
        case NORTH:
          move = y - (tileCoord.y * world.tile_size);
          break;
      }

      moveObject(object, direction, world, move);
      return collided;
    }
  }

  testPoint(object.left(), object.top()); // top left
  testPoint(object.right(), object.top()); // top right
  testPoint(object.left(), object.bottom()); // bottom left
  testPoint(object.right(), object.bottom()); // bottom right

  return 0;
}

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
// World.getTile
//===----------------------------------------------------------------------===//
World.prototype.getTileFromPoint = function(x, y) {
  var tilePoint = this.getTileCoord(x, y);
  return this.getTile(tilePoint.x, tilePoint.y);
};


World.prototype.getTile = function(x, y) {
  return TILES[this.map[y][x]];
};


//===----------------------------------------------------------------------===//
// createPlayer
//===----------------------------------------------------------------------===//
function createPlayer(entity) {
  var ent = entity || new Entity();
  ent.w = 16;
  ent.h = 16;
  ent.update = function(world) {
    var keys = world.input.keyboard;
    if (keys.up) moveObject(ent, NORTH, world);
    if (keys.left) moveObject(ent, WEST, world);
    if (keys.right) moveObject(ent, EAST, world);
    if (keys.down) moveObject(ent, SOUTH, world);
  }
  return ent;
}


//===----------------------------------------------------------------------===//
// drawLine
//===----------------------------------------------------------------------===//
function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  // offset by .5 so lines aren't blurry, wtf?
  ctx.moveTo(x1 + .5, y1 + .5);
  ctx.lineTo(x2 + .5, y2 + .5);
  ctx.stroke();
}


//===----------------------------------------------------------------------===//
// drawCircle
//===----------------------------------------------------------------------===//
function drawCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, true);
  ctx.stroke();
}


//===----------------------------------------------------------------------===//
// drawDebugPoint
//===----------------------------------------------------------------------===//
function drawDebugPoint(object, ctx) {
  ctx.strokeStyle = 'red';
  drawCircle(ctx, object.x, object.y, 2);
}


//===----------------------------------------------------------------------===//
// Ticker
//===----------------------------------------------------------------------===//
function Ticker(tick_duration, paint) {
  this.paint = paint;
  this.tick_duration = tick_duration || 25;

  this.start = new Date().getTime();
  this.ticks_elapsed = 0;
  this.current_tick = 0;
}


//===----------------------------------------------------------------------===//
// Ticker.next
//===----------------------------------------------------------------------===//
Ticker.prototype.next = function() {
  var ticks_elapsed = Math.round((this.now - this.start) / this.tick_duration);
  this.lastTicksElapsed = ticks_elapsed - this.current_tick;
  this.current_tick = ticks_elapsed;
  return this.lastTicksElapsed;
}


//===----------------------------------------------------------------------===//
// Ticker.run
//===----------------------------------------------------------------------===//
Ticker.prototype.run = function() {
  var self = this;
  this.now = new Date().getTime();
  var ticks_elapsed = this.next();

  if(ticks_elapsed == 0) {
    setTimeout(function() { self.run(); }, this.tick_duration);
    return;
  }

  this.paint();
  this.time_to_paint = (new Date().getTime()) - this.now;
  this.load = Math.round((this.time_to_paint / this.tick_duration) * 100);

  // We need some pause to let the browser catch up the update. Here at least
  // 12 ms of pause
  var next_paint = Math.max(this.tick_duration - this.time_to_paint, 12);
  setTimeout(function() { self.run(); }, next_paint);
}


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
  this.drawGrid();
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
      var tile_type = this.map[y][x];
      var img = TILES[tile_type].img;
      this.ctx.drawImage(img, x * this.tile_size, y * this.tile_size);
    }
  }
}


//===----------------------------------------------------------------------===//
// Input
//===----------------------------------------------------------------------===//
function Input() {
  this.keyboard = {};
  var self = this;
  this.mousedown = false;
  this.keydown = true;

  // this is handling WASD, and arrows keys
  function update_keyboard(e, val) {
    switch(e.keyCode) {
      case 40:
      case 83:
        self.keyboard['down'] = val;
        break;
      case 38:
      case 87:
        self.keyboard['up'] = val;
        break;
      case 39:
      case 68:
        self.keyboard['right'] = val;
        break;
      case 37:
      case 65:
        self.keyboard['left'] = val;
        break;
      case 32: self.keyboard['space'] = val; break;
      case 17: self.keyboard['ctrl'] = val; break;
      case 13: self.keyboard['enter'] = val; break;
    }
  };

  document.ontouchstart = function(event) {
      self.mousedown = true;
  }

  document.ontouchend = function(event) {
    self.mousedown = false;
  }

  document.ontouchmove = function(event) {}

  document.onmousedown = function(event) {
    self.mousedown = true;
  }

  document.onmouseup = function(event) {
    self.mousedown = false;
  }

  document.onclick = function(event) {
    //self.click(event);
  }

  document.onmousemove = function(event) {
    self.xmouse = event.clientX;
    self.ymouse = event.clientY;
  }

  document.onkeydown = function(e) {
    self.keydown = true;
    update_keyboard(e, true);
  };

  document.onkeyup = function(e) {
    self.keydown = false;
    update_keyboard(e, false);
  };

  // can be used to avoid key jamming
  document.onkeypress = function(e) {
  };

  // make sure self the keyboard is rested when
  // the user leave the page
  window.onblur = function (e) {
      self.keyboard = {}
      self.keydown = false;
      self.mousedown = false;
  }
}


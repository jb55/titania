
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


//===----------------------------------------------------------------------===//
// pushDirection
//===----------------------------------------------------------------------===//
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
          move = x - (tileCoord.x * world.tile_size) - 2;
          break;
        case SOUTH:
          move = ((tileCoord.y + 1) * world.tile_size) - y;
          break;
        case NORTH:
          move = y - (tileCoord.y * world.tile_size) - 2;
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


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
  // handle slowed block effects, etc
  return DEFAULT_MOVE;
}


//===----------------------------------------------------------------------===//
// pushDirection
//===----------------------------------------------------------------------===//
function pushDirection(world, object, blockCoord) {
  var blockCx = (blockCoord.x * world.block_size) + (world.block_size / 2);
  var blockCy = (blockCoord.y * world.block_size) + (world.block_size / 2);

  var dx = blockCx - object.center_x();
  var dy = blockCy - object.center_y();

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
    var blockCoord = world.getBlockCoord(x, y);
    var block = world.getBlock(blockCoord.x, blockCoord.y);
    var collided = !!block.clip;

    if (collided) {
      var direction = pushDirection(world, object, blockCoord);
      switch(direction) {
        case EAST:
          move = ((blockCoord.x + 1) * world.block_size) - x;
          break;
        case WEST:
          move = x - (blockCoord.x * world.block_size) - 2;
          break;
        case SOUTH:
          move = ((blockCoord.y + 1) * world.block_size) - y;
          break;
        case NORTH:
          move = y - (blockCoord.y * world.block_size) - 2;
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



//===----------------------------------------------------------------------===//
// Entity
//===----------------------------------------------------------------------===//
function Entity(node) {
}


//===----------------------------------------------------------------------===//
// Entity.update
//===----------------------------------------------------------------------===//
Entity.prototype.update = function() {
  // Do nothing
}


//===----------------------------------------------------------------------===//
// Entity.render
//===----------------------------------------------------------------------===//
Entity.prototype.render = function(gl) {
  if (this.renderable) {
    this.renderable.render(gl);
  }
};


//===----------------------------------------------------------------------===//
// createPlayer
//===----------------------------------------------------------------------===//
function createPlayer(gl, playerNode) {
  var player = new Entity();

  playerNode.attachObject(player);
  player.animated = true;

  player.update = function(world) {
    var keys = world.input.keyboard;
    if (keys.up) moveObject(player, NORTH, world);
    if (keys.left) moveObject(player, WEST, world);
    if (keys.right) moveObject(player, EAST, world);
    if (keys.down) moveObject(player, SOUTH, world);
  }

  player.sub_entities = [];

  function attachLimb(scale, position) {
    var limb = new Entity();
    limb.renderable = getCubeRenderable(gl);
    limb.renderable.texture = getTexture(gl, 'smoothstone');
    var limbNode = new SceneNode();
    limbNode.setScale(scale);
    limbNode.setPosition(position);
    limbNode.attachObject(limb);
    playerNode.attachObject(limbNode);
    return limb;
  }

  var bodyScale = 1.75;
  var bodyThickness = 0.4;
  var headSize = 0.4;
  var armThickness = 0.1;
  var armPos = -bodyThickness-armThickness;

  player.body = attachLimb([bodyThickness, bodyThickness/2, bodyScale], 
                           [0, 0, 0]); // body

  player.leftArm = attachLimb([armThickness, armThickness, 1], 
                              [-armPos, 0, -armPos]); // left arm

  player.rightArm = attachLimb([armThickness, armThickness, 1], 
                               [armPos, 0, -armPos]); // right arm

  player.head = attachLimb([headSize, headSize, headSize], 
                           [0, 0, bodyScale+headSize]); // head

  player.head.renderable.texture = gl.debugTexture;

  return player;
}


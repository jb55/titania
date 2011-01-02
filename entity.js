

//===----------------------------------------------------------------------===//
// Entity
//===----------------------------------------------------------------------===//
function Entity(node) {
  this.movement_controller = null;
  this.orientation_controller = null;
}


//===----------------------------------------------------------------------===//
// Entity.update
//===----------------------------------------------------------------------===//
Entity.prototype.updateControllers = function() {
  if (this.movement_controller) {
    this.movement_controller.update();
  }
  if (this.orientation_controller) {
    this.orientation_controller.update();
  }
}


//===----------------------------------------------------------------------===//
// Entity.update
//===----------------------------------------------------------------------===//
Entity.prototype.update = function() {
  this.updateControllers();
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

  player.update = function(world) {
  }

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

  player.body = attachLimb(
    [bodyThickness, bodyThickness/2, bodyScale], [0, 0, 0]); // body

  player.leftArm = attachLimb(
    [armThickness, armThickness, 1], [-armPos, 0, -armPos]); // left arm

  player.rightArm = attachLimb(
    [armThickness, armThickness, 1], [armPos, 0, -armPos]); // right arm

  player.head = attachLimb(
    [headSize, headSize, headSize], [0, 0, bodyScale+headSize]); // head

  player.head.renderable.texture = gl.debugTexture;

  return player;
}


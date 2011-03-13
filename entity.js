

//===----------------------------------------------------------------------===//
// Entity
//===----------------------------------------------------------------------===//
function Entity(node) {
  this.movement_controller = null;
  this.orientation_controller = null;
}


//===----------------------------------------------------------------------===//
// Entity.updateControllers
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
function createPlayer(gl, playerNode, geometry) {
  var player = new Entity();

  playerNode.attachObject(player);

  function attachLimb(scale, position) {
    var limb = new Entity();
    limb.texture = getTexture(gl, 'smoothstone');
    limb.geometry = geometry;
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
    [bodyThickness, bodyScale, bodyThickness/2], [0, 0, 0]); // body

  player.leftArm = attachLimb(
    [armThickness, 1, armThickness], [-armPos, -armPos, 0]); // left arm

  player.rightArm = attachLimb(
    [armThickness, 1, armThickness], [armPos, -armPos, 0]); // right arm

  player.head = attachLimb(
    [headSize, headSize, headSize], [0, bodyScale + headSize, 0]); // head

  //player.head.renderable.texture = gl.debugTexture;
  player.head.size = headSize;

  return player;
}

//===----------------------------------------------------------------------===//
// createPerspectiveCamera
//===----------------------------------------------------------------------===//
function createPerspectiveCamera(width, height, fov, depth) {
  var m = perspectiveMatrix(width, height, fov, depth);
  var camera = createCamera(m);
  return camera;
}

//===----------------------------------------------------------------------===//
// createCamera
//===----------------------------------------------------------------------===//
function createCamera(frustum) {
  var camera = new SceneNode();
  camera.frustum = mat4.create(frustum);

  camera.getView = function() {
    return camera.absoluteTransform;
  }

  camera.customUpdate = function(rel) {
    mat4.multiply(camera.frustum, rel, this.relativeTransform);
  }

  return camera;
}

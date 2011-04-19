

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
// Entity.getWidth
//===----------------------------------------------------------------------===//
Entity.prototype.getWidth = function() {
  return 1.0;
};


//===----------------------------------------------------------------------===//
// Entity.getGridPosition
//   @static
//===----------------------------------------------------------------------===//
Entity.getGridPosition = function(terrain, ent) {
  var gs = terrain.gridSize;
  node = ent.sceneNode;
  assert(node, "Entity has no sceneNode");
  var p = node.position;
  var hw = ent.getWidth() / 2;

  var x = Math.floor(p[0] + hw)
    , y = Math.floor(p[1])
    , z = Math.floor(p[2] + hw);

  return vec3.create([x, y, z]);
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
    limb.texture = getTexture(gl, 'terrain');
    limb.geometry = geometry;
    var limbNode = new Ti.SceneNode();
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
}

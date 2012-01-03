

//===----------------------------------------------------------------------===//
// Entity
//===----------------------------------------------------------------------===//
function Entity(node) {
  this.movement_controller = null;
  this.orientation_controller = null;
  this.renderable = true;
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
// Entity.right
//===----------------------------------------------------------------------===//
Entity.prototype.right = function() {
  return this.getSceneNode().position[0] + this.width();
};


//===----------------------------------------------------------------------===//
// Entity.left
//===----------------------------------------------------------------------===//
Entity.prototype.left = function() {
  return this.getSceneNode().position[0];
};


//===----------------------------------------------------------------------===//
// Entity.hw
//===----------------------------------------------------------------------===//
Entity.prototype.hw = function() {
  return this.width() / 2;
};


//===----------------------------------------------------------------------===//
// Entity.bottom
//===----------------------------------------------------------------------===//
Entity.prototype.bottom = function() {
  return this.getSceneNode().position[1];
};


//===----------------------------------------------------------------------===//
// Entity.width
//===----------------------------------------------------------------------===//
Entity.prototype.width = function() {
  return 1.0;
};


//===----------------------------------------------------------------------===//
// Entity.getSceneNode
//===----------------------------------------------------------------------===//
Entity.prototype.getSceneNode = function() {
  return this.sceneNode;
}


//===----------------------------------------------------------------------===//
// Entity.getPosition
//===----------------------------------------------------------------------===//
Entity.prototype.getPosition = function() {
  return this.getSceneNode().getPosition();
}



//===----------------------------------------------------------------------===//
// Entity.getGridPosition
//   @static
//===----------------------------------------------------------------------===//
Entity.getGridPosition = function(terrain, ent) {
  var gs = terrain.gridSize;
  node = ent.getSceneNode();
  assert(node, "Entity has no sceneNode");
  var p = node.position;
  var hw = ent.width() / 2;

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

  var bodyScale = 1.5;
  var bodyThickness = 0.6;
  var headSize = 0.4;
  var armThickness = 0.2;
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

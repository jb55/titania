
//===----------------------------------------------------------------------===//
// SceneNode
//===----------------------------------------------------------------------===//
function SceneNode() {
  this.children = [];
  this.object = null;
  this.position = vec3.create([0, 0, 0]);
  this.scale = vec3.create([1, 1, 1]);
  this.orientation = quat4.create();
  this.parent = null;
  this.relativeTransform = mat4.create();
  this.absoluteTransform = mat4.create();
  mat4.identity(this.relativeTransform);
  mat4.identity(this.absoluteTransform);
  this.visible = true;
  this.markForUpdate();
}

//===----------------------------------------------------------------------===//
// SceneNode.queueUpdate (static)
//===----------------------------------------------------------------------===//
SceneNode.queueUpdate = function(node) {
  if (!SceneNode.queue)
    SceneNode.queue = [];

  SceneNode.queue.push(node);
}

//===----------------------------------------------------------------------===//
// SceneNode.update
//===----------------------------------------------------------------------===//
SceneNode.prototype.update = function() {
  var parent = this.parent;
  if (parent && parent.needsUpdate()) {
    // this should never happen, parents are always pushed on first
    throw "SceneNode's parent should have needed an update";
  }

  var relative = this.relativeTransform;
  var scale = this.scale;
  var position = this.position;

  relative[0] = scale[0];
  relative[1] = 0;
  relative[2] = 0;
  relative[3] = 0;

  relative[4] = 0;
  relative[5] = scale[1];
  relative[6] = 0;
  relative[7] = 0;

  relative[8] = 0;
  relative[9] = 0;
  relative[10] = scale[2];
  relative[11] = 0;

  relative[12] = position[0];
  relative[13] = position[1];
  relative[14] = position[2];
  relative[15] = 1;

  if (parent) {
    mat4.multiply(parent.absoluteTransform, relative, this.absoluteTransform);
  } else {
    mat4.set(this.absoluteTransform, relative);
  }

  this.needs_update = false;
};

//===----------------------------------------------------------------------===//
// SceneNode.needsUpdate
//===----------------------------------------------------------------------===//
SceneNode.prototype.needsUpdate = function() {
  // Don't bother updating invisible nodes
  return this.needs_update;
};


//===----------------------------------------------------------------------===//
// SceneNode.canIgnoreUpdate
//===----------------------------------------------------------------------===//
SceneNode.prototype.canIgnoreUpdate = function() {
  // Don't bother updating invisible nodes
  return false;
};



//===----------------------------------------------------------------------===//
// SceneNode.markForUpdate
//===----------------------------------------------------------------------===//
SceneNode.prototype.markForUpdate = function(scene) {
  if (this.needs_update === true) {
    // already marked for update
    return;
  }

  // mark children
  var children = this.children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.canIgnoreUpdate())
      continue;
    children[i].markForUpdate();
  };

  this.needs_update = true;
  SceneNode.queueUpdate(this);
};


//===----------------------------------------------------------------------===//
// SceneNode.setPosition
//===----------------------------------------------------------------------===//
SceneNode.prototype.setPosition = function(vec) {
  vec3.set(vec, this.position);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.setOrientation
//===----------------------------------------------------------------------===//
SceneNode.prototype.setOrientation = function(quat) {
  quat4.set(quat, this.orientation);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.setScale
//===----------------------------------------------------------------------===//
SceneNode.prototype.setScale = function(vec) {
  vec3.set(vec, this.scale);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.attachObject
//   attach an object to the scene node
//===----------------------------------------------------------------------===//
SceneNode.prototype.attachObject = function(obj) {
  if (obj instanceof SceneNode) {
    obj.parent = this;
    this.children.push(obj);
  } else {
    this.object = obj;
    obj.sceneNode = this;
  }
};


//===----------------------------------------------------------------------===//
// SceneNode.translate
//===----------------------------------------------------------------------===//
SceneNode.prototype.translate = function(transVec) {
  vec3.add(this.position, transVec);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// Scene
//===----------------------------------------------------------------------===//
function Scene(root) {
  this.root = root || new SceneNode();
  Scene.m = mat4.create();
}


//===----------------------------------------------------------------------===//
// Scene.getRootNode
//===----------------------------------------------------------------------===//
Scene.prototype.getRootNode = function() {
  return this.root;
}

//===----------------------------------------------------------------------===//
// Scene.update
//===----------------------------------------------------------------------===//
Scene.prototype.update = function() {
  var queue = SceneNode.queue;
  for (var i = 0; i < queue.length; i++) {
    queue[i].update();
  }
  SceneNode.queue.length = 0;
}

Scene.prototype.render = function(gl, camera) {
  this.renderNode(gl, this.getRootNode(), camera, Scene.m);
}

//===----------------------------------------------------------------------===//
// Scene.render
//===----------------------------------------------------------------------===//
Scene.prototype.renderNode = function(gl, node, camera, m) {
  if (node.object) {
    mat4.multiply(camera, node.absoluteTransform, m);
    setProjectionUniform(gl, m);
    node.object.render(gl);
  }

  var children = node.children;
  for (var i = 0; i < children.length; i++) {
    this.renderNode(gl, children[i], camera, m);
  }
}

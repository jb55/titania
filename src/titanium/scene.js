
//===----------------------------------------------------------------------===//
// SceneNode
//===----------------------------------------------------------------------===//
Ti.SceneNode = function() {
  this.children = [];
  this.object = null;
  this.position = vec3.create([0, 0, 0]);
  this.scale = vec3.create([1, 1, 1]);
  this.zrot = 0;
  this.orientation = quat4.identity();
  this.parent = null;
  this.relativeTransform = mat4.create();
  mat4.identity(this.relativeTransform);
  this.absoluteTransform = mat4.create();
  mat4.identity(this.absoluteTransform);
  this.visible = true;
  this.markForUpdate();
}

//===----------------------------------------------------------------------===//
// SceneNode.queueUpdate (static)
//===----------------------------------------------------------------------===//
Ti.SceneNode.queueUpdate = function(node) {
  if (!Ti.SceneNode.queue)
    Ti.SceneNode.queue = [];

  Ti.SceneNode.queue.push(node);
}

//===----------------------------------------------------------------------===//
// SceneNode.update
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.update = function() {
  var parent = this.parent;
  if (parent && parent.needsUpdate()) {
    parent.update();
  }

  var relative = this.relativeTransform;
  mat4.createTransform(this.position, this.scale, this.orientation, relative)

  if (this.customUpdate) {
    this.customUpdate(relative);
  }

  if (parent) {
    mat4.multiply(parent.absoluteTransform, relative, this.absoluteTransform);
  } else {
    mat4.set(relative, this.absoluteTransform);
  }

  this.needs_update = false;
};

//===----------------------------------------------------------------------===//
// SceneNode.needsUpdate
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.needsUpdate = function() {
  // Don't bother updating invisible nodes
  return this.needs_update;
};


//===----------------------------------------------------------------------===//
// SceneNode.canIgnoreUpdate
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.canIgnoreUpdate = function() {
  // Don't bother updating invisible nodes
  return false;
};



//===----------------------------------------------------------------------===//
// SceneNode.markForUpdate
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.markForUpdate = function(scene) {
  if (this.needs_update === true) {
    // already marked for update
    return;
  }

  // push parent first
  this.needs_update = true;
  Ti.SceneNode.queueUpdate(this);

  // mark children
  var children = this.children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.canIgnoreUpdate())
      continue;
    child.markForUpdate();
  };
};


//===----------------------------------------------------------------------===//
// SceneNode.setPosition
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.setPosition = function(vec) {
  vec3.set(vec, this.position);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.rotate
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.rotate = function(angle, axis) {
  var q = quat4.fromAngleAxis(angle, axis);
  quat4.normalize(q);
  quat4.multiply(this.orientation, q);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.setOrientation
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.setOrientation = function(quat) {
  quat4.set(quat, this.orientation);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.setScale
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.setScale = function(vec) {
  vec3.set(vec, this.scale);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// SceneNode.attachObject
//   attach an object to the scene node
//===----------------------------------------------------------------------===//
Ti.SceneNode.prototype.attachObject = function(obj) {
  if (obj instanceof Ti.SceneNode) {
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
Ti.SceneNode.prototype.translate = function(vec, y, z) {
  if (vec3.equals(vec3.ZERO, vec)) 
    return;
  vec3.add(this.position, vec);
  this.markForUpdate();
};


//===----------------------------------------------------------------------===//
// Scene
//===----------------------------------------------------------------------===//
Ti.Scene = function(root) {
  this.root = root || new Ti.SceneNode();
  this.controllers = [];

  // temporary matrix for scene graph updates
  Ti.Scene.m = mat4.create();
}

//===----------------------------------------------------------------------===//
// Scene.attachController
//===----------------------------------------------------------------------===//
Ti.Scene.prototype.attachController = function(controller) {
  this.controllers.push(controller);
}

//===----------------------------------------------------------------------===//
// Scene.getRootNode
//===----------------------------------------------------------------------===//
Ti.Scene.prototype.getRootNode = function() {
  return this.root;
}

//===----------------------------------------------------------------------===//
// Scene.update
//===----------------------------------------------------------------------===//
Ti.Scene.prototype.update = function() {
  // update controllers
  var controllers = this.controllers;
  for (var i = 0; i < controllers.length; i++) {
    controllers[i].update();
  }

  var queue = Ti.SceneNode.queue;
  for (var i = 0; i < queue.length; i++) {
    queue[i].update();
  }
  Ti.SceneNode.queue.length = 0;
}


//===----------------------------------------------------------------------===//
// Scene.render
//===----------------------------------------------------------------------===//
Ti.Scene.prototype.render = function(gl, camera) {
  this.renderNode(gl, this.getRootNode(), camera.worldMatrix(), Ti.Scene.m);
}


//===----------------------------------------------------------------------===//
// Scene.renderNode
//===----------------------------------------------------------------------===//
Ti.Scene.prototype.renderNode = function(gl, node, camera, m) {
  if (node.object && node.object.render) {
    mat4.multiply(camera, node.absoluteTransform, m);
    setProjectionUniform(gl, m);
    calculateNormals(gl, m);
    Ti.Renderer.renderEntity(gl, node.object);
  }

  var children = node.children;
  for (var i = 0; i < children.length; i++) {
    this.renderNode(gl, children[i], camera, m);
  }
}

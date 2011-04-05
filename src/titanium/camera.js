
Ti.Camera = {};

//===----------------------------------------------------------------------===//
// Camera.worldMatrix
//===----------------------------------------------------------------------===//
Ti.Camera.worldMatrix = function() {
  return this.absoluteTransform;
}


//===----------------------------------------------------------------------===//
// Camera.customUpdate
//   Can be used by the scene to update the scene node
//===----------------------------------------------------------------------===//
Ti.Camera.customUpdate = function(rel) {
  mat4.multiply(this.frustum, rel, this.relativeTransform);
}


//===----------------------------------------------------------------------===//
// Camera.create
//===----------------------------------------------------------------------===//
Ti.Camera.create = function(frustum) {
  var camera = new Ti.SceneNode();
  camera.frustum = mat4.create(frustum);

  camera.worldMatrix = Ti.Camera.worldMatrix;
  camera.customUpdate = Ti.Camera.customUpdate;
  return camera;
}


//===----------------------------------------------------------------------===//
// Camera.createPerspective
//   Creates a perspective camera
//===----------------------------------------------------------------------===//
Ti.Camera.createPerspective = function(fov, width, height, near, far) {
  var frustum = mat4.perspective(fov, width/height, near, far);
  return Ti.Camera.create(frustum);
}



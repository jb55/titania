

//===----------------------------------------------------------------------===//
// unproject
//===----------------------------------------------------------------------===//
Ti.unproject = function(vec, camera) {
  var inv = mat4.create(camera.worldMatrix());
  mat4.inverse(inv);

  if (vec instanceof Array) {
    vec = vec.map(function(v) { return mat4.multiplyVec3(inv, v); });
  } else {
    vec = mat4.multiplyVec3(inv, vec);
  }

  return vec;
}


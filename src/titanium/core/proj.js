

//===----------------------------------------------------------------------===//
// unproject
//===----------------------------------------------------------------------===//
Ti.unproject = function(vec, camera) {
  var inv = mat4.create(camera.absoluteTransform);
  mat4.inverse(inv);

  if (vec instanceof Array) {
    vec = vec.map(function(v) { return mat4.multiplyVec3(inv, v); });
  } else {
    mat4.multiplyVec3(inv, vec);
  }

  return vec;
}


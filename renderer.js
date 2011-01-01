
var g_cubePrimitive = null;

//===----------------------------------------------------------------------===//
// Renderable
//===----------------------------------------------------------------------===//
function Renderable() {
  this.mesh = null;
  this.material = null;
}

//===----------------------------------------------------------------------===//
// Renderable.render
//===----------------------------------------------------------------------===//
Renderable.prototype.render = function(gl) {
};


//===----------------------------------------------------------------------===//
// renderCube
//===----------------------------------------------------------------------===//
function renderCube(gl, cubeMesh) {
  gl.drawElements(gl.TRIANGLES, cubeMesh.numIndices, gl.UNSIGNED_BYTE, 0);
}


//===----------------------------------------------------------------------===//
// getCubePrimitive
//===----------------------------------------------------------------------===//
function getCubePrimitive(gl) {
  if (g_cubePrimitive)
    return g_cubePrimitive;

  var renderable = new Renderable();
  renderable.mesh = makeBox(gl);
  g_cubePrimitive = renderable;
  g_cubePrimitive.render = function(gl) { 
    renderCube(gl, g_cubePrimitive.mesh); 
  };
}


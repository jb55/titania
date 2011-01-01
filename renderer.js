
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
function getCubeMesh(gl) {
  if (g_cubePrimitive)
    return g_cubePrimitive;

  g_cubePrimitive = makeBox(gl);
  return g_cubePrimitive;
}


function getCubeRenderable(gl) {
  var renderable = new Renderable();
  renderable.mesh = getCubeMesh(gl);
  renderable.render = function(gl) { 
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    renderCube(gl, this.mesh); 
  };
  return renderable;
}

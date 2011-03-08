
function Renderer() {
}

//===----------------------------------------------------------------------===//
// renderEntity
//===----------------------------------------------------------------------===//
Renderer.renderEntity = function(gl, ent) {
  gl.bindTexture(gl.TEXTURE_2D, ent.texture);
  if (ent.geometry) {
    ent.geometry.bind(gl);
    ent.geometry.render(gl, gl.TRIANGLES, gl.UNSIGNED_SHORT);
  }
}

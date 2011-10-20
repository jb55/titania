
Ti.Renderer = {};

//===----------------------------------------------------------------------===//
// renderEntity
//===----------------------------------------------------------------------===//
Ti.Renderer.renderEntity = function(gl, ent) {

  if (ent.texture)
    gl.bindTexture(gl.TEXTURE_2D, ent.texture);

  if (ent.geometry) {
    ent.geometry.bind(gl);
    ent.geometry.render(gl, gl.TRIANGLES, gl.UNSIGNED_SHORT);
  }

}

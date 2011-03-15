
function getTexture(gl, textureName) {
  if (!gl.textures)
    gl.textures = {};
  var texture = gl.textures[textureName] || (gl.textures[textureName] = 
     loadImageTexture(gl, 'img/' + textureName + '.png'));
  return texture;
}

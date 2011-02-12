
//===----------------------------------------------------------------------===//
// Geometry
//===----------------------------------------------------------------------===//
function Geometry(gl, vertices, texCoords, normals, indices, numElements) {
  if (normals) {
    this.normalBuffer = 
      VBO.createNormalBuffer(gl, normals);
  }

  if (texCoords) {
    this.texCoordBuffer = 
      VBO.createTexCoordBuffer(gl, texCoords);
  }

  this.vertexBuffer = 
    VBO.createVertexBuffer(gl, vertices);

  if (indices) {
    this.indexBuffer = VBO.createIndexBuffer(gl, indices);
    this.numElements = numElements || indices.length;
  } else {
    this.numElements = numElements || vertices.length;
  }
}


//===----------------------------------------------------------------------===//
// Geometry.bind
//===----------------------------------------------------------------------===//
Geometry.prototype.bind = function(gl) {
  this.vertexBuffer.bind(gl);

  if (this.texCoordBuffer)
    this.texCoordBuffer.bind(gl);

  if (this.normalBuffer)
    this.normalBuffer.bind(gl);

  if (this.indexBuffer)
    this.indexBuffer.bind(gl);
}


//===----------------------------------------------------------------------===//
// Geometry.render
//===----------------------------------------------------------------------===//
Geometry.prototype.render = function(gl, kind, indexBufferType) {
  if (this.indexBuffer) {
    gl.drawElements(kind, this.numElements, 
                    indexBufferType || gl.UNSIGNED_SHORT, 0);
  } else {
    gl.drawArrays(kind, 0, this.numElements / 3);
  }
}


//===----------------------------------------------------------------------===//
// updateBuffer
//===----------------------------------------------------------------------===//
function updateBuffer(gl, bufferType, buffer, offset, data, usage) {
  var needsRealloc = data.length + offset > buffer.length;

  gl.bindBuffer(bufferType, buffer);

  // Send a hint to the driver to not reallocate if we dont need to
  if (!needsRealloc)
    gl.bufferData(bufferType, null, usage || gl.DYNAMIC_DRAW);

  if (offset > 0) {
  }
  
}


//===----------------------------------------------------------------------===//
// Geometry.updateIBO
//===----------------------------------------------------------------------===//
Geometry.prototype.updateIBO = function(gl, offset, data) {
}

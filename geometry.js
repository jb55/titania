
//===----------------------------------------------------------------------===//
// Geometry
//===----------------------------------------------------------------------===//
function Geometry(gl, vertices, texCoords, normals, indices, numElements) {
  if (normals) {
    this.normalBuffer = 
      VBO.createNormalBuffer(gl, normals, normals.options);
  }

  if (texCoords) {
    this.texCoordBuffer = 
      VBO.createTexCoordBuffer(gl, texCoords, texCoords.options);
  }

  if (vertices) {
    this.vertexBuffer = 
      VBO.createVertexBuffer(gl, vertices, vertices.options);
  }

  if (indices) {
    this.indexBuffer = VBO.createIndexBuffer(gl, indices, indices.options);
    this.numElements = numElements || indices.length;
  } else if(vertices) {
    this.numElements = numElements || vertices.length;
  }
}

//===----------------------------------------------------------------------===//
// Geometry.copy
//   Weak copy, does not physically copy hardware buffers
//===----------------------------------------------------------------------===//
Geometry.copy = function(gl) {
  var newGeo = new Geometry(gl);
  newGeo.vertexBuffer = gl.vertexBuffer;
  newGeo.indexBuffer = gl.indexBuffer;
  newGeo.texCoordBuffer = gl.texCoordBuffer;
  newGeo.normalBuffer = gl.normalBuffer;
  newGeo.numElements = gl.numElements;
  return newGeo;
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


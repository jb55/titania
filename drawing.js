
function VBO(gl, vertices, texCoords, normals, indices, numElements) {

  if (normals) {
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  }

  if (texCoords) {
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  if (indices) {
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.numElements = numElements || indices.length;
  } else {
    this.numElements = numElements || vertices.length;
  }
  

}

VBO.prototype.bind = function(gl) {
  gl.enableVertexAttribArray(2);

  // Set up all the vertex attributes for vertices, normals and texCoords
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

  if (this.texCoordBuffer) {
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
  }

  if (this.normalBuffer) {
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  }
  
  if (this.indexBuffer) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

}

VBO.prototype.render = function(gl, kind, indexBufferType) {
  if (this.indexBuffer) {
    gl.drawElements(kind, this.numElements, 
                    indexBufferType || gl.UNSIGNED_BYTE, 0);
  } else {
    gl.drawArrays(kind, 0, this.numElements / 3);
  }
}

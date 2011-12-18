

//===----------------------------------------------------------------------===//
// VBO
//===----------------------------------------------------------------------===//
Ti.VBO = function(gl, elems, options) {
  var usage = options.usage || gl.STATIC_DRAW;
  this.type = options.type || gl.ARRAY_BUFFER;
  this.slot = "slot" in options ? options.slot : -1;
  this.components = options.components;
  this.buffer = gl.createBuffer();
  var type = this.type;

  gl.bindBuffer(type, this.buffer);
  gl.bufferData(type, elems, usage);
  gl.bindBuffer(type, null);
}


//===----------------------------------------------------------------------===//
// VBO.createNormalBuffer
//===----------------------------------------------------------------------===//
Ti.VBO.createNormalBuffer = function(gl, elems, options) {
  return new Ti.VBO(gl, elems, Ti.utils.merge({
    components: 3,
    slot: 0
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.createTexCoordBuffer
//===----------------------------------------------------------------------===//
Ti.VBO.createTexCoordBuffer = function(gl, elems, options) {
  return new Ti.VBO(gl, elems, Ti.utils.merge({
    components: 2,
    slot: 1
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.createVertexBuffer
//===----------------------------------------------------------------------===//
Ti.VBO.createVertexBuffer = function(gl, elems, options) {
  return new Ti.VBO(gl, elems, Ti.utils.merge({
    components: 3,
    slot: 2
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.createIndexBuffer
//===----------------------------------------------------------------------===//
Ti.VBO.createIndexBuffer = function(gl, elems, options) {
  return new Ti.VBO(gl, elems, Ti.utils.merge({
    type: gl.ELEMENT_ARRAY_BUFFER
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.bind
//===----------------------------------------------------------------------===//
Ti.VBO.prototype.bind = function(gl) {
  if (!Ti.VBO.lastBinds)
    Ti.VBO.lastBinds = {};

  // lazy bind
  if (this.buffer == Ti.VBO.lastBinds[this.slot])
    return;

  if (this.type == gl.ELEMENT_ARRAY_BUFFER) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  } else {
    gl.enableVertexAttribArray(this.slot);
    gl.bindBuffer(this.type, this.buffer);
    gl.vertexAttribPointer(this.slot, this.components, gl.FLOAT, false, 0, 0);
  }

  Ti.VBO.lastBinds[this.slot] = this.buffer;
}


//===----------------------------------------------------------------------===//
// VBO.update
//===----------------------------------------------------------------------===//
Ti.VBO.prototype.update = function(data, offset) {
  var needsRealloc = data.length + offset > buffer.length;
  gl.bindBuffer(this.type, this.buffer);

  if (needsRealloc) {
    //gl.bufferData(
  }
}

//===----------------------------------------------------------------------===//
// updateBuffer
//   Makes changes to a vertex buffer object
//===----------------------------------------------------------------------===//
Ti.VBO.updateBuffer = function(gl, bufferType, buffer, offset, data, usage) {
  if (!needsRealloc) {
    gl.bufferData(bufferType, null, usage || gl.DYNAMIC_DRAW);
  }

  if (offset > 0) {
  }

}

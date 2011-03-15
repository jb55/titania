

//===----------------------------------------------------------------------===//
// VBO
//===----------------------------------------------------------------------===//
function VBO(gl, elems, options) {
  console.log(options);
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
VBO.createNormalBuffer = function(gl, elems, options) {
  return new VBO(gl, elems, utils.merge({
    components: 3, 
    slot: 0
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.createTexCoordBuffer
//===----------------------------------------------------------------------===//
VBO.createTexCoordBuffer = function(gl, elems, options) {
  return new VBO(gl, elems, utils.merge({
    components: 2, 
    slot: 1
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.createVertexBuffer
//===----------------------------------------------------------------------===//
VBO.createVertexBuffer = function(gl, elems, options) {
  return new VBO(gl, elems, utils.merge({
    components: 3, 
    slot: 2
  }, options)); 
}


//===----------------------------------------------------------------------===//
// VBO.createIndexBuffer
//===----------------------------------------------------------------------===//
VBO.createIndexBuffer = function(gl, elems, options) {
  return new VBO(gl, elems, utils.merge({
    type: gl.ELEMENT_ARRAY_BUFFER
  }, options));
}


//===----------------------------------------------------------------------===//
// VBO.bind
//===----------------------------------------------------------------------===//
VBO.prototype.bind = function(gl) {
  if (!VBO.lastBinds)
    VBO.lastBinds = {};

  // lazy bind
  if (this.buffer == VBO.lastBinds[this.slot])
    return;

  if (this.type == gl.ELEMENT_ARRAY_BUFFER) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  } else {
    gl.enableVertexAttribArray(this.slot);
    gl.bindBuffer(this.type, this.buffer);
    gl.vertexAttribPointer(this.slot, this.components, gl.FLOAT, false, 0, 0);
  }

  VBO.lastBinds[this.slot] = this.buffer;
}


//===----------------------------------------------------------------------===//
// VBO.update
//===----------------------------------------------------------------------===//
VBO.prototype.update = function(data, offset) {
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
function updateBuffer(gl, bufferType, buffer, offset, data, usage) {
  if (!needsRealloc) {
    gl.bufferData(bufferType, null, usage || gl.DYNAMIC_DRAW);
  }

  if (offset > 0) {
  }
  
}

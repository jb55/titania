
//===----------------------------------------------------------------------===//
// generateTexture
//===----------------------------------------------------------------------===//
function generateTexture(gl, image, texture) {
  if (!texture) {
    texture = gl.createTexture();
    texture.image = image;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.generateMipmap(gl.TEXTURE_2D)
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

//
// loadShader
//
// 'shaderId' is the id of a <script> element containing the shader source string.
// Load this shader and return the WebGLShader object corresponding to it.
//
function loadShader(ctx, shaderId)
{
  var shaderScript = document.getElementById(shaderId);
  if (!shaderScript) {
    ctx.console.log("*** Error: shader script '"+shaderId+"' not found");
    return null;
  }

  if (shaderScript.type == "x-shader/x-vertex")
    var shaderType = ctx.VERTEX_SHADER;
  else if (shaderScript.type == "x-shader/x-fragment")
    var shaderType = ctx.FRAGMENT_SHADER;
  else {
    ctx.console.log("*** Error: shader script '"+shaderId+"' of undefined type '"+shaderScript.type+"'");
    return null;
  }

  // Create the shader object
  var shader = ctx.createShader(shaderType);
  if (shader == null) {
    console.log("*** Error: unable to create shader '"+shaderId+"'");
    return null;
  }

  // Load the shader source
  ctx.shaderSource(shader, shaderScript.text);

  // Compile the shader
  ctx.compileShader(shader);

  // Check the compile status
  var compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
  if (!compiled) {
      // Something went wrong during compilation; get the error
      var error = ctx.getShaderInfoLog(shader);
      ctx.console.log("*** Error compiling shader '"+shaderId+"':"+error);
      ctx.deleteShader(shader);
      return null;
  }

  return shader;
}


//===----------------------------------------------------------------------===//
// initWebGL
//===----------------------------------------------------------------------===//
function initWebGL(canvas, vshader, fshader, attribs, clearColor, clearDepth,
                   debug) {
  var gl = WebGLUtils.create3DContext(canvas);

  if (debug)
    gl = WebGLDebugUtils.makeDebugContext(gl);

  gl.console = ("console" in window) ? window.console : { log: function() { } };

  var vertexShader = loadShader(gl, vshader);
  var fragmentShader = loadShader(gl, fshader);

  if (!vertexShader || !fragmentShader)
      return null;

  // Create the program object
  gl.program = gl.createProgram();

  if (!gl.program)
      return null;

  // Attach our two shaders to the program
  gl.attachShader (gl.program, vertexShader);
  gl.attachShader (gl.program, fragmentShader);

  // Bind attributes
  for (var i = 0; i < attribs.length; ++i)
      gl.bindAttribLocation (gl.program, i, attribs[i]);

  // Link the program
  gl.linkProgram(gl.program);

  // Check the link status
  var linked = gl.getProgramParameter(gl.program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    var error = gl.getProgramInfoLog (gl.program);
    console.log("Error in program linking:"+error);

    gl.deleteProgram(gl.program);
    gl.deleteProgram(fragmentShader);
    gl.deleteProgram(vertexShader);

    return null;
  }

  gl.useProgram(gl.program);

  gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
  gl.clearDepth(clearDepth);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return gl;
}


//===----------------------------------------------------------------------===//
// perspectiveMatrix
//  create a perspective matrix
//===----------------------------------------------------------------------===//
function perspectiveMatrix(width, height, fov, depth) {
  return mat4.perspective(fov || 30, width / height, 1, depth || 10000);
}


//===----------------------------------------------------------------------===//
// isometricMatrix
//===----------------------------------------------------------------------===//
function isometricMatrix() {
  var m = mat4.create();
  m[0] = 0.70715;
  m[1] = 0.40826;
  m[2] = 0.57736;
  m[3] = 0;
  m[4] = 0;
  m[5] = 0.81649;
  m[6] =-0.57736;
  m[7] = 0;
  m[8] = -0.70715;
  m[9] = 0.40826;
  m[10] =-0.57736;
  m[11] = 0;
  m[12] = 1;
  m[13] = 1;
  m[14] = 1;
  m[15] = 1;
  return m;
}


//===----------------------------------------------------------------------===//
// makeBox
//===----------------------------------------------------------------------===//
function makeBox(ctx)
{
  // box
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  //
  // vertex coords array
  var vertices = new Float32Array(
    [ 1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
      1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
      1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 top
     -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
     -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 bottom
      1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]   // v4-v7-v6-v5 back
  );

  // normal array
  var normals = new Float32Array(
    [ 0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,     // v0-v1-v2-v3 front
      1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,     // v0-v3-v4-v5 right
      0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,     // v0-v5-v6-v1 top
     -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,     // v1-v6-v7-v2 left
      0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,     // v7-v4-v3-v2 bottom
      0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1 ]    // v4-v7-v6-v5 back
   );

  // texCoord array
  var texCoords = new Float32Array(
    [ 1, 1,   0, 1,   0, 0,   1, 0,    // v0-v1-v2-v3 front
      0, 1,   0, 0,   1, 0,   1, 1,    // v0-v3-v4-v5 right
      1, 0,   1, 1,   0, 1,   0, 0,    // v0-v5-v6-v1 top
      1, 1,   0, 1,   0, 0,   1, 0,    // v1-v6-v7-v2 left
      0, 0,   1, 0,   1, 1,   0, 1,    // v7-v4-v3-v2 bottom
      0, 0,   1, 0,   1, 1,   0, 1 ]   // v4-v7-v6-v5 back
 );

  // index array
  var indices = new Uint8Array(
    [  0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // top
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // bottom
      20,21,22,  20,22,23 ]   // back
  );

  var box = { };

  box.normalBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, box.normalBuffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, normals, ctx.STATIC_DRAW);

  box.texCoordBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, box.texCoordBuffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, texCoords, ctx.STATIC_DRAW);

  box.vertexBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, box.vertexBuffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);

  box.indexBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, box.indexBuffer);
  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);

  box.numIndices = indices.length;

  return box;
}


//===----------------------------------------------------------------------===//
// bindBuffers
//===----------------------------------------------------------------------===//
function bindBuffers(gl, indexBuffer, vertexBuffer, normalBuffer, 
                     texCoordBuffer) {
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  gl.enableVertexAttribArray(2);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
}


//===----------------------------------------------------------------------===//
// bindObject
//===----------------------------------------------------------------------===//
function bindObject(gl, object) {
  bindBuffers(gl, object.indexBuffer, object.vertexBuffer, object.normalBuffer,
              object.texCoordBuffer);
}


//===----------------------------------------------------------------------===//
// bindTexture
//===----------------------------------------------------------------------===//
function bindTexture(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

//
// loadImageTexture
//
// Load the image at the passed url, place it in a new WebGLTexture object and return the WebGLTexture.
//
function loadImageTexture(ctx, url) {
  var texture = ctx.createTexture();
  texture.image = new Image();
  texture.image.onload = function() { doLoadImageTexture(ctx, texture.image, texture) }
  texture.image.src = url;
  return texture;
}

function doLoadImageTexture(ctx, image, texture) {
  ctx.bindTexture(ctx.TEXTURE_2D, texture);
  ctx.texImage2D(
      ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
  //ctx.generateMipmap(ctx.TEXTURE_2D)
  ctx.bindTexture(ctx.TEXTURE_2D, null);
}


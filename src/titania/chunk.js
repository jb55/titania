

//===----------------------------------------------------------------------===//
// Chunk
//===----------------------------------------------------------------------===//
function Chunk(xs, ys, zs, x, y, z, gridSize) {
  this.xs = xs;
  this.ys = ys;
  this.zs = zs;

  this.x = x;
  this.y = y;
  this.z = z;

  this.renderable = true;

  this.built = false;

  this.gridSize = gridSize || 1.0;
}


//===----------------------------------------------------------------------===//
// Chunk.build
//   builds a chunk given a fn(x,y,z)
//===----------------------------------------------------------------------===//
Chunk.prototype.build = function(gl, genFn) {
  assert(this.built !== true, "Attempting to rebuild the chunk twice");

  var numCubes = this.zs * this.ys * this.xs;
  var numSides = 6;
  var vertPerSide = 4;
  var numVerts = numCubes * numSides * vertPerSide;

  var verts = new Float32Array(numVerts * 3);
  var normals = new Float32Array(numVerts * 3);
  var indices = new Uint16Array(numVerts);
  var texCoords = new Float32Array(numVerts * 2);

  var xs = this.xs;
  var ys = this.ys;
  var zs = this.zs;

  var numElements =
    buildGrid(
        gl
      , xs
      , ys
      , zs
      , this.x
      , this.y
      , this.z
      , verts
      , texCoords
      , indices
      , normals
      , genFn
    );

  indices.options = { usage: gl.DYNAMIC_DRAW };

  // LEAK: do these VBOs need to be released?
  this.geometry =
    new Ti.Geometry(gl, verts, texCoords, normals, indices, numElements);

  this.built = true;

  return this;
};


//===----------------------------------------------------------------------===//
// Chunk.getGeometry
//===----------------------------------------------------------------------===//
Chunk.prototype.getGeometry = function() {
  return this.geometry;
};


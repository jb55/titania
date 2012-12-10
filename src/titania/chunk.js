

//===----------------------------------------------------------------------===//
// Chunk
//===----------------------------------------------------------------------===//
function Chunk(xs, ys, zs, pos, gridSize) {
  this.xs = xs;
  this.ys = ys;
  this.zs = zs;

  this.pos = pos;
  this.coord = Terrain.chunkCoord(pos, xs, ys, zs);

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
      , this.pos[0]
      , this.pos[1]
      , this.pos[2]
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


//===----------------------------------------------------------------------===//
// Chunk.getUnloadedAdjacent
//   returns a list of vectors describing the positions of unloaded chunks
//   adjacent to this one
//===----------------------------------------------------------------------===//
Chunk.prototype.getUnloadedAdjacent = function(chunks) {
  var vectors = [];

  for (var x = -1; x <= 1; ++x) {
    for (var y = -5; y <= 0; ++y) {
      for (var z = -1; z <= 1; ++z) {

        // ignore self
        if (x === 0 && y === 0 && z === 0)
          continue;

        var xp = this.coord[0] + x
          , yp = this.coord[1] + y
          , zp = this.coord[2] + z;

        var chunk = chunks.lookup(xp, yp, zp);

        if (chunk === null)
          vectors.push(Ti.v3(xp, yp, zp));
      }
    }
  }

  return vectors;
}


//===----------------------------------------------------------------------===//
// Chunk.getCoord
//   gets the chunks coordinate
//===----------------------------------------------------------------------===//
Chunk.prototype.getCoord = function() {
  return this.coord;
}

//===----------------------------------------------------------------------===//
// Chunk.getPosition
//   gets the chunks position in the world
//===----------------------------------------------------------------------===//
Chunk.prototype.getPosition = function() {
  return this.pos;
}


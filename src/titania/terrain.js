
//===----------------------------------------------------------------------===//
// BlockTerrain
//===----------------------------------------------------------------------===//
function BlockTerrain(texture, worldEvents) {
  this.texture = texture;
  this.chunkBuilder = function() {}

  this.ys = 6;
  this.xs = 20;
  this.zs = 20;

  worldEvents.on('movement', function(moveEvent){
    var pos = moveEvent.pos;
    var chunks = this.getChunksToLoad(pos);

    if (chunks.length > 0) {
      for (var i = 0; i < chunks.length; ++i) {
        this.chunkBuilder(chunks[i]);
      }
    }
  });
}


//===----------------------------------------------------------------------===//
// BlockTerrain.worldGenFunction
//   returns a block function(x, y, z) that generates a world
//
// noiseFn - a 3d noise function
//===----------------------------------------------------------------------===//
BlockTerrain.worldGenFn = function(noiseFn) {
  return function(x, y, z) {
    var scale = 0.15;
    var val = noiseFn(x * scale, y * scale, z * scale);

    if (val > 0) {
      return BLOCK_GRASS;
    }

    return BLOCK_AIR;
  }
}


//===----------------------------------------------------------------------===//
// BlockTerrain.importMap
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.loadMap = function(gl, data) {
}



//===----------------------------------------------------------------------===//
// BlockTerrain.loadNoiseMap
//   load a 3d-noise-based map
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.loadNoiseMap = function(gl, seed) {
  var seedFn = Ti.Math.seedRandom(seed);
  var noise = Ti.getNoiseFunctions('simplex', seedFn);
  var blockFn = BlockTerrain.worldGenFn(noise.noise3d.bind(noise));

  // tell the chunk builder to build chunks using our noise function
  this.chunkBuilder = function(chunk){
    return chunk.build(gl, blockFn);
  }

}



//===----------------------------------------------------------------------===//
// BlockTerrain.attachChunks
//   attach terrain chunks to a scene node
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.attachChunks = function(root) {
  var left = new Ti.SceneNode();
  left.translate(vec3.create([-this.xs, 0, 0]));
  left.attachObject(this.chunks[0]);

  var right = new Ti.SceneNode();
  right.translate(vec3.create([0, 0, this.zs]));
  right.attachObject(this.chunks[2]);

  var down = new Ti.SceneNode();
  down.translate(vec3.create([-this.xs, 0, this.zs]));
  down.attachObject(this.chunks[1]);

  root.attachObject(left);
  root.attachObject(right);
  root.attachObject(down);
};


//===----------------------------------------------------------------------===//
// clamp
//===----------------------------------------------------------------------===//
function clamp(n, size) {
  if (n < 0) {
    return 0;
  } else if (n >= size) {
    return size-1;
  } else {
    return n;
  }
}


//===----------------------------------------------------------------------===//
// texCoordFromId
//===----------------------------------------------------------------------===//
function texCoordFromId(id, xs, u, v, dest, ind) {
  var lu = (id % xs) * u;
  var ru = lu + u;
  var tv = 1.0 - ((Math.floor(id / xs) * v) + v);
  var bv = tv + v;

  dest[ind++] = lu; // v0
  dest[ind++] = bv;

  dest[ind++] = ru; // v1
  dest[ind++] = bv;

  dest[ind++] = ru; // v2
  dest[ind++] = tv;

  dest[ind++] = lu; // v3
  dest[ind++] = tv;

  return ind;
}

//===----------------------------------------------------------------------===//
// BlockTerrain.renderGeo
//   Bind and render the terrain
//===----------------------------------------------------------------------===//
BlockTerrain.renderGeo = function(gl, geo) {
  geo.render(gl, gl.TRIANGLES, gl.UNSIGNED_SHORT);
}


//===----------------------------------------------------------------------===//
// BlockTerrain.render
//   Bind and render the terrain
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.render = function(gl) {
  BlockTerrain.renderGeo(gl, this.geometry);
}


//===----------------------------------------------------------------------===//
// BlockTerrain.getBlock
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.getBlock = function(vec) {
  if (this.outOfBounds(vec)) return 0;

  var x = vec[0]
    , y = vec[1]
    , z = vec[2];

  return this.blocks[y][x][z];
}


//===----------------------------------------------------------------------===//
// BlockTerrain.surface
//   finds a surface
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.surface = function(vec) {
  var block = this.getBlock(vec)
    , v = vec3.create(vec)
    , isDown = Block.isPassible(block)
    , dir = isDown ? -1 : 1
    , cnd = isDown ?
      function(b) { return Block.isPassible(b); } :
      function(b) { return !Block.isPassible(b); }

  // if in passible, look down. If in impassible, look up.
  while (cnd(block)) {
    v[1] += dir;
    if (this.outOfBounds(v)) {
      return vec[1];
    }
    block = this.getBlock(v);
  }

  if (isDown) {
    v[1] += 1;
  }

  return v[1];
}


//===----------------------------------------------------------------------===//
// BlockTerrain.outOfBounds
//   checks to see if a point is out of bounds
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.outOfBounds = function(vec) {
  var x = vec[0]
    , y = vec[1]
    , z = vec[2];

  return y < 0 ||
         x < 0 ||
         z < 0 ||
         y >= this.ys ||
         x >= this.xs ||
         z >= this.zs;
};


//===----------------------------------------------------------------------===//
// buildGrid
//   builds an xs-by-ys-by-zs grid of vertices
//===----------------------------------------------------------------------===//
function buildGrid(gl, xs, ys, zs, verts, texCoords, indices, normals, get) {
  var vertInd = 0;
  var indexInd = 0;
  var normalsInd = 0;
  var texCoordInd = 0;
  var startIndex = 0;
  var n = 0.5;

  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var boxVerts = new Float32Array(
    [ 1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
      1, 1,-1,   1, 1, 1,   1,-1, 1,   1,-1,-1,    // v5-v0-v3-v4 right
     -1, 1, 1,   1, 1, 1,   1, 1,-1,  -1, 1,-1,    // v1-v0-v5-v6 top
     -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
      1,-1, 1,  -1,-1, 1,  -1,-1,-1,   1,-1,-1,    // v3-v2-v7-v4 bottom
     -1, 1,-1,   1, 1,-1,   1,-1,-1,  -1,-1,-1 ]   // v4-v7-v6-v5 back
  );

  var boxNormals = new Float32Array(
    [ 0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,    // front
      1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,    // right
      0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,    // top
     -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,    // left
      0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,    // bottom
      0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1 ]   // back
   );

  // index array
  var boxIndices = new Uint8Array(
    [  0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // top
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // bottom
      20,21,22,  20,22,23 ]   // back
  );

   // texCoords -> top right, top left, bottom left, bottom right

  var textureWidth = 512
    , textureHeight = 512
    , tileSize = 32
    , tilesX = textureWidth / tileSize
    , tilesY = textureHeight / tileSize
    , tileU = 1 / tilesX
    , tileV = 1 / tilesY
    , cTid
    , id
    , sideId
    , tid;

  // foreach block
  for (var y = 0; y < ys; y++) {
    for (var x = 0; x < xs; x++) {
      for (var z = 0; z < zs; z++) {

        id = get(x, y, z);
        tid = BLOCKS[id].texid;
        sideId = BLOCKS[id].sideTex;

        if (x == 0 && y == 0 && z == 0) {
          tid = 9;
        }

        // foreach face
        for (var i = 0; i < boxVerts.length; i += 12) {
          // foreach vert
          for (var j = 0; j < 12; j += 3) {
            var k = i + j;
            verts[vertInd++] = boxVerts[k] * n + x;
            verts[vertInd++] = boxVerts[k+1] * n + y;
            verts[vertInd++] = boxVerts[k+2] * n + z;

            normals[normalsInd++] = boxNormals[k];
            normals[normalsInd++] = boxNormals[k+1];
            normals[normalsInd++] = boxNormals[k+2];
          }

          // side faces
          if (!(i == 24 || i == 48)) {
            cTid = sideId || tid;
          } else {
            cTid = tid;
          }

          texCoordInd =
            texCoordFromId(cTid, tilesX, tileU, tileV, texCoords, texCoordInd);

          }
        }

        if (id !== 0) {
          for (var i = 0; i < boxIndices.length; i++) {
            indices[indexInd++] = boxIndices[i] + startIndex;
          }
        }

        startIndex += 24;

      }
    }
  }

  return indexInd;
}

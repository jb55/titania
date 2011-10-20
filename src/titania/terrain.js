
//===----------------------------------------------------------------------===//
// BlockTerrain
//===----------------------------------------------------------------------===//
function BlockTerrain(texture, worldEvents) {
  this.texture = texture;
  this.chunkBuilder = function() {}
  this.events = new Ti.EventEmitter();
  this.firstChunkLoaded = false;
  this.gridSize = 1.0;
  var self = this;

  this.ys = 6;
  this.xs = 20;
  this.zs = 20;

  worldEvents.on('movement', function(moveEvent){
    var pos = moveEvent.pos;
    self.buildChunks(pos);
  });
}


//===----------------------------------------------------------------------===//
// BlockTerrain.buildChunks
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.buildChunks = function(pos) {
  var chunks = this.getChunksToLoad(pos);
  var self = this;

  // build each chunk and attach it to the root scene node
  _.each(chunks, function(c) {
    var built = self.buildChunk(c);
    built.texture = self.texture;
    BlockTerrain.attachChunk(built, self.sceneNode);
  });
};



//===----------------------------------------------------------------------===//
// BlockTerrain.buildChunk
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.buildChunk = function(chunk) {
  var builtChunk = this.chunkBuilder(chunk);

  if (!this.firstChunkLoaded) {
    this.firstChunkLoaded = true;
    this.events.emit("first_chunk", builtChunk);
  }

  return builtChunk;
};



//===----------------------------------------------------------------------===//
// BlockTerrain.attachChunk
//===----------------------------------------------------------------------===//
BlockTerrain.attachChunk = function(chunk, root) {
  var node = new Ti.SceneNode();
  node.translate(vec3.create([chunk.x, chunk.y, chunk.z]));
  node.attachObject(chunk);
  root.attachObject(node);
};



//===----------------------------------------------------------------------===//
// BlockTerrain.getChunksToLoad
//
// Given the the players position and state of the currently loaded chunks,
// determine which chunks need to be loaded.
//
// @return
//   A list of chunk objects to load
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.getChunksToLoad = function(pos) {

  var self = this;

  function half(x) {
    return Math.floor(x) / 2;
  }

  function doChunk(pos) {
    return new Chunk(
        self.xs
      , self.ys
      , self.zs
      , pos[0] - half(self.xs)
      , pos[1]
      , pos[2] - half(self.zs)
      , self.gridSize
    );
  }

  if (!this.firstChunkLoaded) {
    var sec = vec3.create([this.xs, 0, 0]);
    var fourth = vec3.create([0, 0, this.zs]);
    var third = vec3.create([this.xs, 0, this.zs]);

    var s = vec3.add(sec, pos);
    var t = vec3.add(third, pos);
    var f = vec3.add(fourth, pos);

    return [doChunk(pos), doChunk(s), doChunk(t), doChunk(f)];
  }

  return [];
}


//===----------------------------------------------------------------------===//
// BlockTerrain.worldGenFunction
//   returns a block function(x, y, z) that generates a world
//
// noiseFn - a 3d noise function
//===----------------------------------------------------------------------===//
BlockTerrain.worldGenFn = function(noiseFn) {
  return function(x, y, z) {
    var scale = 0.1;
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
  return this.loadNoiseMap(gl, 'test-seed');
}



//===----------------------------------------------------------------------===//
// BlockTerrain.loadNoiseMap
//   load a 3d-noise-based map
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.loadNoiseMap = function(gl, seed) {
  var seedFn = Ti.Math.seedRandom(seed);
  var noise = Ti.getNoiseFunctions('simplex', seedFn);
  var blockFn = BlockTerrain.worldGenFn(noise.noise3d.bind(noise));
  this.blockFn = blockFn;
  var self = this;

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
}


//===----------------------------------------------------------------------===//
// BlockTerrain.render
//   Bind and render the terrain
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.render = function(gl) {
}


//===----------------------------------------------------------------------===//
// BlockTerrain.getBlock
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.getBlock = function(vec) {

  if (this.blockFn)
    return this.blockFn(vec[0], vec[1], vec[2]);

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
function buildGrid(gl, xs, ys, zs, xoff, yoff, zoff, verts, texCoords, indices, normals, get) {
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
    , tid
    ;

  // foreach block
  for (var y = 0; y < ys; y++) {
    for (var x = 0; x < xs; x++) {
      for (var z = 0; z < zs; z++) {

        id = get(xoff + x, yoff + y, zoff + z);
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

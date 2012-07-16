
//===----------------------------------------------------------------------===//
// Terrain
//===----------------------------------------------------------------------===//
function Terrain(texture, world) {

  this.texture = texture;
  this.chunkBuilder = function() {}
  this.firstChunkLoaded = false;
  this.chunks = Ti.a3d();
  this.gridSize = 1.0;
  var self = this;

  this.boundary = [
      Ti.v3(0, 0, 0) // bottom left
    , Ti.v3(0, 0, 0) // top right
  ];

  this.ys = 6;
  this.xs = 20;
  this.zs = 20;

  this.on('load_chunks', function(pos){
    var player = world.getPlayer();
    self.buildChunks(player.getPosition());
  });

}
_.extend(Terrain.prototype, Ti.EventEmitter);


//===----------------------------------------------------------------------===//
// Terrain.buildChunks
//===----------------------------------------------------------------------===//
Terrain.prototype.buildChunks = function(pos) {
  var chunks = this.getChunksToLoad(pos);
  var self = this;

  // build each chunk and attach it to the root scene node
  _.each(chunks, function(c) {
    var built = self.buildChunk(c);
    built.texture = self.texture;
    Terrain.attachChunk(built, self.sceneNode);
  });
};



//===----------------------------------------------------------------------===//
// Terrain.buildChunk
//===----------------------------------------------------------------------===//
Terrain.prototype.buildChunk = function(chunk) {
  var builtChunk = this.chunkBuilder(chunk);

  if (!this.firstChunkLoaded) {
    this.firstChunkLoaded = true;
    this.emit("first_chunk", builtChunk);
  }

  return builtChunk;
};


//===----------------------------------------------------------------------===//
// Terrain.pushChunkBoundary
//===----------------------------------------------------------------------===//
Terrain.prototype.pushChunkBoundary = function(p) {
    var lower = this.boundary[0];
    var higher = this.boundary[1];

    var len = vec3.squaredLength(p);

    if (len < 0) {
      lower[0] = Math.min(lower[0], p[0]);
      lower[1] = Math.min(lower[1], p[1]);
      lower[2] = Math.min(lower[2], p[2]);
    } else {
      higher[0] = Math.max(higher[0], p[0]);
      higher[1] = Math.max(higher[1], p[1]);
      higher[2] = Math.max(higher[2], p[2]);
    }

    return len;
}



//===----------------------------------------------------------------------===//
// Terrain.attachChunk
//===----------------------------------------------------------------------===//
Terrain.attachChunk = function(chunk, root) {
  var node = new Ti.SceneNode();
  var pos = chunk.getPosition();
  node.translate(pos);
  node.attachObject(chunk);
  root.attachObject(node);
};


//===----------------------------------------------------------------------===//
// Terrain.getChunksToLoad
//
// Given the the players position and state of the currently loaded chunks,
// determine which chunks need to be loaded.
//
// @return
//   A list of chunk objects to load
//===----------------------------------------------------------------------===//
Terrain.prototype.getChunksToLoad = function(pos) {

  var self = this;

  function half(x) {
    return Math.floor(x) / 2;
  }

  function doChunk(pos_) {
    assert(!self.chunks.get(self.xs, self.ys, self.zs), "Chunk already exists there");

    var chunk = new Chunk(
        self.xs
      , self.ys
      , self.zs
      , pos_
      , self.gridSize
    );

    self.chunks.set(chunk, chunk.getCoord());
    return chunk;
  }

  var triggerDist = 2;

  var isUpper  = vec3.squaredLength(pos) > 0;
  var boundary = isUpper? this.boundary[1] : this.boundary[0];

  // determine if we are coming near a chunk boundary
  var diff           = vec3.subtract(boundary, pos);
  var delta          = vec3.squaredLength(diff);
  var isNearBoundary = delta <= triggerDist;

  if (true || isNearBoundary) {
    var onChunk = this.getChunkFromPos(pos);

    if (!onChunk) {
      // the chunk that the player is on is not loaded, might as well load it!
      var p = this.getChunkPos(pos);
      return [doChunk(p)];
    }

//  var chunkPositions = onChunk.getUnloadedAdjacent(this.chunks);
//  return _.map(chunkPositions, doChunk);
  }

  return [];
}

//===----------------------------------------------------------------------===//
// Terrain.prototype.getChunkCoord
//   returns a chunk coordinate given an arbitrary position
//===----------------------------------------------------------------------===//
Terrain.prototype.getChunkCoord = function(pos) {
  return Terrain.chunkCoord(pos, this.xs, this.ys, this.zs);
}



//===----------------------------------------------------------------------===//
// Terrain.prototype.getChunkCoord
//   returns a chunk coordinate given an arbitrary position
//===----------------------------------------------------------------------===//
Terrain.chunkCoord = function(pos, xs, ys, zs) {
  var xp = Math.floor(pos[0] / xs)
    , yp = Math.floor(pos[1] / ys)
    , zp = Math.floor(pos[2] / zs);
  return Ti.v3(xp, yp, zp);
}



//===----------------------------------------------------------------------===//
// Terrain.prototype.getChunkPos
//   returns a chunk position given an arbitrary position
//===----------------------------------------------------------------------===//
Terrain.prototype.getChunkPos = function(pos) {
  var coord = this.getChunkCoord(pos);

  coord[0] *= this.xs;
  coord[1] *= this.ys;
  coord[2] *= this.zs;

  console.log("getChunkPos: " + coord[0] + " " + coord[1] + " " + coord[2]);

  return coord;
}



//===----------------------------------------------------------------------===//
// Terrain.getChunkFromPos
//   returns a chunk from a location
//
//===----------------------------------------------------------------------===//
Terrain.prototype.getChunkFromPos = function(pos) {
  var x = pos[0]
    , y = pos[1]
    , z = pos[2];

  var coord = this.getChunkCoord(pos);
  return this.chunks.lookup(coord);
}


//===----------------------------------------------------------------------===//
// Terrain.worldGenFunction
//   returns a block function(x, y, z) that generates a world
//
// noiseFn - a 3d noise function
//===----------------------------------------------------------------------===//
Terrain.worldGenFn = function(noiseFn) {
  return function(vec) {
    var x = vec[0]
      , y = vec[1]
      , z = vec[2];

    var scale = 0.05;
    var val = noiseFn(x * scale, y * scale, z * scale);

    if (val > 0) {
      return BLOCK_GRASS;
    }

    return BLOCK_AIR;
  }
}


//===----------------------------------------------------------------------===//
// Terrain.importMap
//===----------------------------------------------------------------------===//
Terrain.prototype.loadMap = function(gl, data) {
  var blockFn = Terrain.noiseMapLoader(gl, 'test-seed');
  //var blockFn = Terrain.mapLoader(gl, data);
  this.blockFn = blockFn;

  this.chunkBuilder = function(chunk){
    return chunk.build(gl, blockFn);
  };
}


//===----------------------------------------------------------------------===//
// Terrain.mapLoader
//
// Returns a chunk loader given some data
//===----------------------------------------------------------------------===//
Terrain.mapLoader = function(gl, data) {
  return function(vec){
    return Terrain.getBlockData(data, vec);
  }
}


//===----------------------------------------------------------------------===//
// Terrain.noiseMapLoader
//   load a 3d-noise-based map
//===----------------------------------------------------------------------===//
Terrain.noiseMapLoader = function(gl, seed) {
  var seedFn = Ti.Math.seedRandom(seed);
  var noise = Ti.getNoiseFunctions('simplex', seedFn);
  var blockFn = Terrain.worldGenFn(noise.noise3d.bind(noise));
  return blockFn;
}



//===----------------------------------------------------------------------===//
// Terrain.attachChunks
//   attach terrain chunks to a scene node
//===----------------------------------------------------------------------===//
Terrain.prototype.attachChunks = function(root) {
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
// Terrain.renderGeo
//   Bind and render the terrain
//===----------------------------------------------------------------------===//
Terrain.renderGeo = function(gl, geo) {
}


//===----------------------------------------------------------------------===//
// Terrain.render
//   Bind and render the terrain
//===----------------------------------------------------------------------===//
Terrain.prototype.render = function(gl) {
}


//===----------------------------------------------------------------------===//
// Terrain.getBlock
//===----------------------------------------------------------------------===//
Terrain.prototype.getBlock = function(vec) {
  return this.blockFn(vec);
}


//===----------------------------------------------------------------------===//
// Terrain.getBlockData
//
// Gets a block from a 3d array of block data
//===----------------------------------------------------------------------===//
Terrain.getBlockData = function(data, vec) {
  var ys = data.length;
  var xs = data[0].length;
  var zs = data[0][0].length;

  if (vec[1] >= ys)
    return BLOCK_AIR;

  var x = Math.abs(vec[0]) % xs
    , y = Math.abs(vec[1]) % ys
    , z = Math.abs(vec[2]) % zs
    ;

  return data[y][x][z];
}



//===----------------------------------------------------------------------===//
// Terrain.surface
//   finds a surface
//===----------------------------------------------------------------------===//
Terrain.prototype.surface = function(vec) {
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
    if (Terrain.outOfBounds(v, this.xs, this.ys, this.zs)) {
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
// Terrain.outOfBounds
//   checks to see if a point is out of bounds
//===----------------------------------------------------------------------===//
Terrain.outOfBounds = function(vec, xs, ys, zs) {
  var x = vec[0]
    , y = vec[1]
    , z = vec[2];

  return y < 0 ||
         x < 0 ||
         z < 0 ||
         y >= ys ||
         x >= xs ||
         z >= zs;
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

  var v3 = Ti.v3(0, 0, 0);

  // foreach block
  for (var y = 0; y < ys; y++) {
    for (var x = 0; x < xs; x++) {
      for (var z = 0; z < zs; z++) {

        v3[0] = xoff + x;
        v3[1] = yoff + y;
        v3[2] = zoff + z;

        id = get(v3);
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

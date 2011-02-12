
//===----------------------------------------------------------------------===//
// BlockTerrain
//===----------------------------------------------------------------------===//
function BlockTerrain(texture) {
  this.texture = texture;
}


//===----------------------------------------------------------------------===//
// BlockTerrain.importMap
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.loadMap = function(gl, data) {
  var yn = data.length;
  if (!yn) return;
  var xn = data[0].length;
  if (!xn) return;
  var zn = data[0][0].length;
  if (!zn) return;

  this.xn = xn;
  this.yn = yn;
  this.zn = zn;

  var numCubes = zn*yn*xn;
  var numSides = 6;
  var vertPerSide = 4;
  var numVerts = numCubes * numSides * vertPerSide;

  var verts = new Float32Array(numVerts * 3);
  var normals = new Float32Array(numVerts * 3);
  var indices = new Uint16Array(numCubes * numSides * 6);
  var texCoords = new Float32Array(numVerts * 2);

  var numElements = 
    buildGrid(gl, data, xn, yn, zn, verts, texCoords, indices, normals);

  //indices.options = { usage: gl.DYNAMIC_DRAW };

  this.geometry = 
    new Geometry(gl, verts, texCoords, normals, indices, numElements);
}

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
function texCoordFromId(id, xn, u, v, dest, ind) {
  var lu = (id % xn) * u;
  var ru = lu + u;
  var tv = 1.0 - ((Math.floor(id / xn) * v) + v);
  var bv = tv + v;

  dest[ind++] = lu; // v3
  dest[ind++] = tv;

  dest[ind++] = ru; // v2
  dest[ind++] = tv;

  dest[ind++] = ru; // v1
  dest[ind++] = bv;

  dest[ind++] = lu; // v0
  dest[ind++] = bv;

  return ind;
}

//===----------------------------------------------------------------------===//
// BlockTerrain.render
//   Bind and render the terrain
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.render = function(gl) {
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  this.geometry.bind(gl);
  this.geometry.render(gl, gl.TRIANGLES, gl.UNSIGNED_SHORT);
}


//===----------------------------------------------------------------------===//
// buildGrid
//   builds an xn-by-yn-by-zn grid of vertices
//===----------------------------------------------------------------------===//
function buildGrid(gl, data, xn, yn, zn, verts, texCoords, indices, normals) {
  var vertInd = 0;
  var indexInd = 0;
  var normalsInd = 0;
  var texCoordInd = 0;
  var startIndex = 0;
  var n = 0.5;

  var dyn = data.length;
  var dxn = data[0].length;
  var dzn = data[0][0].length;

  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var boxVerts = new Float32Array(
    [ 1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
      1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
     -1, 1, 1,   1, 1, 1,   1, 1,-1,  -1, 1,-1,    // v1-v0-v5-v6 top
     -1,-1, 1,  -1, 1, 1,  -1, 1,-1,  -1,-1,-1,    // v2-v1-v6-v7 left
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

  // get block from map data
  function get(x, y, z) {
    if (y >= dyn) return 0;
    if (x >= dxn) return 0;
    if (z >= dzn) return 0;
    return data[y][x][z];
  }

  var textureWidth = 512;
  var textureHeight = 512;
  var tileSize = 32;
  var tilesX = textureWidth / tileSize;
  var tilesY = textureHeight / tileSize;
  var tileU = 1 / tilesX;
  var tileV = 1 / tilesY;
  var id;
  var tid;

  for (var y = 0; y < yn; y++) {
    for (var x = 0; x < xn; x++) {
      for (var z = 0; z < zn; z++) {

        if (data) {
          id = get(x, y, z);
          tid = BLOCKS[id].texid;
        }

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

          if (data) {
            texCoordInd = texCoordFromId(tid, tilesX, tileU, tileV, texCoords,
                                         texCoordInd);
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

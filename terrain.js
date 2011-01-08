
//===----------------------------------------------------------------------===//
//
// I'm using the algorithm described here: http://bit.ly/fEoRNW
//
//===----------------------------------------------------------------------===//


//===----------------------------------------------------------------------===//
// BlockTerrain
//===----------------------------------------------------------------------===//
function BlockTerrain(xn, yn, zn) {
  this.xn = xn;
  this.yn = yn;
  this.zn = zn;
}

//===----------------------------------------------------------------------===//
// BlockTerrain.importMap
//===----------------------------------------------------------------------===//
BlockTerrain.prototype.loadMap = function(gl, data) {
  var zn = data.length;
  if (!zn) return;
  var yn = data[0].length;
  if (!yn) return;
  var xn = data[0][0].length;
  if (!xn) return;

  this.xn = xn;
  this.yn = yn;
  this.zn = zn;

  var numCubes = zn*yn*xn;
  var vertPerSide = 4;

  var verts = new Float32Array(numCubes * vertPerSide * 3);
  var texCoords = new Float32Array(numCubes * vertPerSide * 2);
  var indices = new Uint8Array(numCubes * vertPerSide);

  tesselate(data, xn, yn, zn, verts, texCoords, indices);
  this.vbo = new VBO(gl, pos, texCoords, indices);

//var normal = new Float32Array(size);
//var s = new Float32Array(size);
//var t = new Float32Array(size);
  
}

function clamp(n, size) {
  if (n < 0) {
    return 0;
  } else if (n >= size) {
    return size-1;
  } else {
    return n;
  }
}

function texCoordFromId(id, xn, u, v, dest, ind) {
  var lu = (id % xn) * u;
  var ru = lu + u;
  var tv = (Math.floor(id / xn) * v) + v;
  var bv = tv + v;

  dest[ind++] = lu;
  dest[ind++] = bv;

  dest[ind++] = ru;
  dest[ind++] = bv;

  dest[ind++] = ru;
  dest[ind++] = tv;

  dest[ind++] = lu;
  dest[ind++] = tv;

  return ind;
}

function drawTerrain(gl, terrain) {
  
}

function buildGrid(data, xn, yn, zn, verts, texCoords, normals) {
}

//===----------------------------------------------------------------------===//
// tesselate
//===----------------------------------------------------------------------===//
function tesselate(data, xn, yn, zn, pos, texcoord, indices) {
  var value;
  var posInd = 0;
  var texInd = 0;
  var indexInd = 0;
  var n = 1;

  var textureWidth = 512;
  var textureHeight = 512;
  var tileU = 1 / textureWidth;
  var tileV = 1 / textureHeight;
  var tileSize = 32;
  var tilesX = textureWidth / tileSize;

  // get block from map data
  function get(x, y, z) {
    return data[clamp(z, zn)][clamp(y, yn)][clamp(x, xn)];
  }

  function set_data(x0, y0, z0,
                    x1, y1, z1,
                    x2, y2, z2,
                    x3, y3, z3, v) {
    var startIndex = indexInd;

    pos[posInd++] = x0;
    pos[posInd++] = y0;
    pos[posInd++] = z0;

    pos[posInd++] = x1;
    pos[posInd++] = y1;
    pos[posInd++] = z1;

    pos[posInd++] = x2;
    pos[posInd++] = y2;
    pos[posInd++] = z2;

    pos[posInd++] = x3;
    pos[posInd++] = y3;
    pos[posInd++] = z3;

    indices[indexInd++] = startIndex;
    indices[indexInd++] = startIndex + 1;
    indices[indexInd++] = startIndex + 2;

    indices[indexInd++] = startIndex;
    indices[indexInd++] = startIndex + 2;
    indices[indexInd++] = startIndex + 3;
  
    texInd = texCoordFromId(value, tielsX, tileU, tileV, texcoord, texInd);
  }

  for (var z = 0; z < zn; z++) {
    for (var y = 0; y < yn; y++) {
      for (var x = 0; x < xn; x++) {

        // left
        value = get(x-1, y, z);
        if (value > 0) {
          set_data(x-n, y-n, z-n,
                   x-n, y+n, z-n,
                   x-n, y+n, z+n,
                   x-n, y-n, z+n, value);
        }

        // right
        value = get(x+1, y, z);
        if (value > 0) {
          set_data(x+n, y-n, z-n,
                   x+n, y-n, z+n,
                   x+n, y+n, z+n,
                   x+n, y+n, z-n, value);
        }

        value = get(x, y-1, z);
        // if value == dirt, value = grass
        if (value > 0) {
          set_data(x-n, y-n, z-n,
                   x-n, y-n, z+n,
                   x+n, y-n, z+n,
                   x+n, y-n, z-n, value);
        }

        value = get(x, y+1, z);
        if (value > 0) {
          set_data(x-n, y+n, z-n,
                   x+n, y+n, z-n,
                   x+n, y+n, z+n,
                   x-n, y+n, z+n, value);
        }

        // bottom
        value = get(x, y, z-1);
        if (value > 0) {
          set_data(x-n, y-n, z-n,
                   x+n, y-n, z-n,
                   x+n, y+n, z-n,
                   x-n, y+n, z-n, value);
        }

        // top
        value = get(x, y, z-1);
        if (value > 0) {
          set_data(x-n, y-n, z+n,
                   x-n, y+n, z+n,
                   x+n, y+n, z+n,
                   x+n, y-n, z+n, value);
        }


      }
    }
  }
}

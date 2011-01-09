
//===----------------------------------------------------------------------===//
//
// I'm using the algorithm described here: http://bit.ly/fEoRNW
//
//===----------------------------------------------------------------------===//


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
  var numSides = 6;
  var vertPerSide = 6;
  var vertPerCube = numCubes * numSides * vertPerSide;

  var verts = new Float32Array(vertPerCube * 3);
  var normals = new Float32Array(vertPerCube * 3);
  var texCoords = new Float32Array(vertPerCube * 2);

  var numElements = tesselate(data, xn, yn, zn, verts, texCoords, normals);
  this.vbo = new VBO(gl, verts, texCoords, normals, null, numElements);
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
  var tv = 1.0 - ((Math.floor(id / xn) * v) + v);
  var bv = tv + v;

  dest[ind++] = lu; // v0
  dest[ind++] = bv;

  dest[ind++] = ru; // v1
  dest[ind++] = bv;

  dest[ind++] = lu; // v3
  dest[ind++] = tv;

  dest[ind++] = ru; // v1
  dest[ind++] = bv;

  dest[ind++] = ru; // v2
  dest[ind++] = tv;

  dest[ind++] = lu; // v3
  dest[ind++] = tv;

  return ind;
}

BlockTerrain.prototype.render = function(gl) {
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  this.vbo.bind(gl);
  this.vbo.render(gl, gl.TRIANGLES);
}

//===----------------------------------------------------------------------===//
// tesselate
//===----------------------------------------------------------------------===//
function tesselate(data, xn, yn, zn, pos, texcoord, normals) {
  var value;
  var posInd = 0;
  var normalsInd = 0;
  var texInd = 0;
  var n = 0.5;

  var textureWidth = 512;
  var textureHeight = 512;
  var tileSize = 32;
  var tilesX = textureWidth / tileSize;
  var tilesY = textureHeight / tileSize;
  var tileU = 1 / tilesX;
  var tileV = 1 / tilesY;

  // get block from map data
  function get(x, y, z) {
    return data[clamp(z, zn)][clamp(y, yn)][clamp(x, xn)];
  }

  function set_data(x0, y0, z0,
                    x1, y1, z1,
                    x2, y2, z2,
                    x3, y3, z3, v,
                    nx, ny, nz) {

    pos[posInd++] = x0; pos[posInd++] = y0; pos[posInd++] = z0;
    pos[posInd++] = x1; pos[posInd++] = y1; pos[posInd++] = z1;
    pos[posInd++] = x3; pos[posInd++] = y3; pos[posInd++] = z3;

    pos[posInd++] = x1; pos[posInd++] = y1; pos[posInd++] = z1;
    pos[posInd++] = x2; pos[posInd++] = y2; pos[posInd++] = z2;
    pos[posInd++] = x3; pos[posInd++] = y3; pos[posInd++] = z3;

    for (var i = 0; i < 6; ++i) {
      normals[normalsInd++] = nx;
      normals[normalsInd++] = ny;
      normals[normalsInd++] = nz;
    }

    texInd = texCoordFromId(v-1, tilesX, tileU, tileV, texcoord, texInd);

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
                   x-n, y-n, z+n, value,
                   1, 0, 0);
        }

        // right
        value = get(x+1, y, z);
        if (value > 0) {
          set_data(x+n, y-n, z-n,
                   x+n, y-n, z+n,
                   x+n, y+n, z+n,
                   x+n, y+n, z-n, value,
                   -1, 0, 0);
        }

        value = get(x, y-1, z);
        // if value == dirt, value = grass
        if (value > 0) {
          set_data(x-n, y-n, z-n,
                   x-n, y-n, z+n,
                   x+n, y-n, z+n,
                   x+n, y-n, z-n, value,
                   0, 1, 0);
        }

        value = get(x, y+1, z);
        if (value > 0) {
          set_data(x-n, y+n, z-n,
                   x+n, y+n, z-n,
                   x+n, y+n, z+n,
                   x-n, y+n, z+n, value,
                   0, -1, 0);
        }

        // bottom
        value = get(x, y, z-1);
        if (value > 0) {
          set_data(x-n, y-n, z-n,
                   x+n, y-n, z-n,
                   x+n, y+n, z-n,
                   x-n, y+n, z-n, value,
                   0, 0, 1);
        }

        // top
        value = get(x, y, z-1);
        if (value > 0) {
          set_data(x-n, y-n, z+n,
                   x-n, y+n, z+n,
                   x+n, y+n, z+n,
                   x+n, y-n, z+n, value,
                   0, 0, -1);
        }


      }
    }
  }

  return posInd;
}

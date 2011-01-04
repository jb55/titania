
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

  var size = zn*yn*xn;

  var pos = new Float32Array(size * 12);
  var texcoord = new Float32Array(size * 12);

  tesselate(data, xn, yn, zn, pos, texcoord);
  this.vbo = new VBO(gl, pos, texcoord);

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

function drawTerrain(gl, terrain) {
  
}

//===----------------------------------------------------------------------===//
// tesselate
//===----------------------------------------------------------------------===//
function tesselate(data, xn, yn, zn, pos, texcoord) {
  var value;
  var posInd = 0;
  var texInd = 0;
  var n = 1;

  // get block from map data
  function get(x, y, z) {
    return data[clamp(z, zn)][clamp(y, yn)][clamp(x, xn)];
  }

  function set_data(x0, y0, z0,
                    x1, y1, z1,
                    x2, y2, z2,
                    x3, y3, z3, v) {
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

    texcoord[texInd++] = 0;
    texcoord[texInd++] = 0;
    texcoord[texInd++] = value;

    texcoord[texInd++] = 1;
    texcoord[texInd++] = 0;
    texcoord[texInd++] = value;

    texcoord[texInd++] = 1;
    texcoord[texInd++] = 1;
    texcoord[texInd++] = value;

    texcoord[texInd++] = 0;
    texcoord[texInd++] = 1;
    texcoord[texInd++] = value;
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

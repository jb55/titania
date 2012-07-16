
function Array3d() {
  this.a = [[[]]];
}

Ti.a3d = function() {
  return new Array3d();
}

//===----------------------------------------------------------------------===//
// Ti.Array3d.slice
//   returns a slice along the z axis
//===----------------------------------------------------------------------===//
Array3d.prototype.sliceZ = function(z) {
  var a = this.a;
  if (!a[z]) return [];
  return a[z];
}


//===----------------------------------------------------------------------===//
// Ti.Array3d.set
//   sets an element in the 3d array
//===----------------------------------------------------------------------===//
Array3d.prototype.set = function(elem, x, y, z) {
  var a = this.a;

  if (x !== undefined && y === undefined && z === undefined) {
    z = x[2];
    y = x[1];
    x = x[0];
  }

  if (!a[z])    a[z]    = [];
  if (!a[z][y]) a[z][y] = [];

  a[z][y][x] = elem;
}


//===----------------------------------------------------------------------===//
// Ti.Array3d
//===----------------------------------------------------------------------===//
Array3d.prototype.get = function(x, y, z) {
  var a = this.a;

  if (x !== undefined && y === undefined && z === undefined) {
    z = x[2];
    y = x[1];
    x = x[0];
  }

  if (a[z] && a[z][y] && a[z][y][x]) {
    return a[z][y][x];
  }

  return null;
}

Array3d.prototype.lookup = Array3d.prototype.get;





var utils = {};

utils.merge = function(a, b) {
  if (!b) return a;
  if (!a) return b;
  for (var k in b) {
    a[k] = b[k];
  }
  return a;
}


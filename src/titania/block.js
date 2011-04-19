
var BLOCKS = [
   { name: 'air', transparent: true, texid: 11, passible: true }
  ,{ name: 'grass', texid: 0, sideTex: 3  }
  ,{ name: 'smoothstone', texid: 6 }
  ,{ name: 'dirt', texid: 2 }
  ,{ name: 'stone', texid: 1 }
];

var BLOCK_AIR = 0
  , BLOCK_GRASS = 1
  , BLOCK_SMOOTHSTONE = 2
  , BLOCK_DIRT = 3
  , BLOCK_STONE = 4
  ;

var Block = {}

//===----------------------------------------------------------------------===//
// Block.isPassible
//===----------------------------------------------------------------------===//
Block.isPassible = function(block) {
  return BLOCKS[block].passible || false;
}

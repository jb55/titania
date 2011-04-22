
var BLOCKS = [
   { name: 'air', transparent: true, texid: 11, passible: true }
  ,{ name: 'grass', texid: 0, sideTex: 3  }
  ,{ name: 'smoothstone', texid: 6 }
  ,{ name: 'dirt', texid: 2 }
  ,{ name: 'stone', texid: 1 }
  ,{ name: 'log', texid: 21, sideTex: 20 }
  ,{ name: 'diamondore', texid: 50 }
  ,{ name: 'cobble', texid: 16 }
];

var BLOCK_AIR         = 0
  , BLOCK_GRASS       = 1
  , BLOCK_SMOOTHSTONE = 2
  , BLOCK_DIRT        = 3
  , BLOCK_STONE       = 4
  , BLOCK_LOG         = 5
  , BLOCK_DIAMONDORE  = 6
  , BLOCK_COBBLE      = 7
  ;

var Block = {}

//===----------------------------------------------------------------------===//
// Block.isPassible
//===----------------------------------------------------------------------===//
Block.isPassible = function(block) {
  return BLOCKS[block].passible || false;
}

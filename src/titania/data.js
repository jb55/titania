
//===----------------------------------------------------------------------===//
// Data
//===----------------------------------------------------------------------===//
var OBJECTS = [
  { name: 'player' }
];

// default move amount
var DEFAULT_MOVE = 3;

var test_map1 = [
  [1,1,1,1,1,3,1,1,1,1,4,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,2,4,2,2,2,2,2,2,2,1,1,1,1,1,1,1]
 ,[1,1,1,1,2,4,4,4,4,4,4,4,2,1,1,1,1,1,1,1]
 ,[1,1,1,1,2,4,4,4,4,2,4,4,2,1,1,1,1,1,1,1]
 ,[1,1,1,1,2,4,4,4,4,4,2,4,2,1,1,1,1,1,1,4]
 ,[1,1,1,1,2,4,4,4,4,4,4,4,2,1,1,1,1,1,1,4]
 ,[3,1,1,1,2,4,4,2,4,4,4,4,2,1,1,1,1,1,1,3]
 ,[1,1,1,1,2,4,2,4,4,4,4,4,2,1,1,1,1,1,1,1]
 ,[1,1,1,1,2,4,4,4,4,4,4,4,2,1,1,1,1,1,1,1]
 ,[1,1,1,3,2,4,2,2,2,2,2,4,2,1,1,1,1,1,1,1]
 ,[1,1,3,3,4,4,2,1,1,1,1,2,1,1,1,1,1,1,1,1]
 ,[1,1,1,3,2,2,2,1,1,1,1,1,1,2,1,1,1,1,1,1]
 ,[1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1]
 ,[1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1]
];

var test_map2 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,2,0,2,0,0,0,1,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,1,1,1,0,0]
 ,[0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,1,0,0,0]
 ,[0,0,0,0,2,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,2,2,2,2,2,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,2,0,2,0,0,0,0,0,0]
 ,[0,0,0,0,2,2,2,0,0,0,0,0,0,2,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

var test_map3 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,2,2,3,4,2,2,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,1,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,1,1,1,0,0]
 ,[0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,1,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,2,2,6,6,2,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,2,2,0,0,0,0,0,0,2,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

var test_map4 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,2,2,3,4,2,2,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0]
 ,[0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,0,2,2,2,2,2,0,2,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

var test_map5 = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 ,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];


var test_map = [test_map1, test_map2, test_map3, test_map4, test_map5];
//var test_map = [test_map1, test_map1, test_map1, test_map1, test_map1, test_map1, test_map2, test_map1];

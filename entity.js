

//===----------------------------------------------------------------------===//
// Entity
//===----------------------------------------------------------------------===//
function Entity(node) {
}


//===----------------------------------------------------------------------===//
// Entity.update
//===----------------------------------------------------------------------===//
Entity.prototype.update = function() {
  // Do nothing
}


//===----------------------------------------------------------------------===//
// Entity.render
//===----------------------------------------------------------------------===//
Entity.prototype.render = function(gl) {
  var subs = this.sub_entities;
  if (subs && subs.length > 0) {
    for (var i = 0; i < subs.length; i++) {
      subs[i].render(gl);
    };
  }

  if (this.renderable) {
    this.renderable.render(gl);
  }
};


//===----------------------------------------------------------------------===//
// createPlayer
//===----------------------------------------------------------------------===//
function createPlayer(gl, sceneNode) {
  var player = new Entity();

  player.sceneNode = sceneNode;
  player.animated = true;

  player.update = function(world) {
    var keys = world.input.keyboard;
    if (keys.up) moveObject(player, NORTH, world);
    if (keys.left) moveObject(player, WEST, world);
    if (keys.right) moveObject(player, EAST, world);
    if (keys.down) moveObject(player, SOUTH, world);
  }

  player.sub_entities = [];

  // body
  var body = new Entity();
  body.renderable = getCubePrimitive(gl);
  var bodyNode = new SceneNode();
  bodyNode.parent = player.sceneNode;
  bodyNode.scale = [1, 1, 1.5];
  bodyNode.attachObject(body);

  // head
  var head = new Entity();
  head.renderable = getCubePrimitive(gl);
  var headNode = new SceneNode();
  headNode.parent = player.sceneNode;
  headNode.setScale([0.5, 0.5, 0.5]);
  headNode.setPosition([0.5, 0.5, 0.5]);
  headNode.attachObject(head);

  player.sub_entities.push(head);
  player.sub_entities.push(body);

  return player;
}


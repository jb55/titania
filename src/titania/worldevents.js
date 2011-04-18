
//===----------------------------------------------------------------------===//
// WorldEvents
//===----------------------------------------------------------------------===//
function WorldEvents(input, world) {
  this.input = input;
  this.world = world;
  this.handlers = {};
  var self = this;
  this.input.addHandler("click", function(x, y){
    self.clickWorld(x, y);
  });
}


//===----------------------------------------------------------------------===//
// WorldEvents.addHandler
//===----------------------------------------------------------------------===//
WorldEvents.prototype.on = function(event, fn) {
  handlers = this.handlers[event];
  handlers = this.handlers[event] = handlers || [];
  handlers.push(fn);
};


//===----------------------------------------------------------------------===//
// WorldEvents.clickWorld
//===----------------------------------------------------------------------===//
WorldEvents.prototype.clickWorld = function(x, y) {
  var vec = vec3.create([x, y, 0]);
  Ti.unproject(vec, this.world.camera);
  this.handlers["clickWorld"].forEach(function(fn) { fn(vec, x, y); });
};




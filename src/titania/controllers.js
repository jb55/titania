

//===----------------------------------------------------------------------===//
// InputController
//===----------------------------------------------------------------------===//
function InputController(node, moveAmount, input, flags) {
  this.input = input || new Ti.Input();
  this.flags = flags || InputController.DEFAULT;
  this.events = new Ti.EventEmitter();
  this.node = node;
  this.getMoveAmount = !(moveAmount instanceof Function) ?
                       function() { return moveAmount; } : moveAmount;
}

InputController.ROTATE  = 1 << 0;
InputController.REV     = 1 << 1;
InputController.DEFAULT = InputController.ROTATE;


//===----------------------------------------------------------------------===//
// InputController.update
//===----------------------------------------------------------------------===//
InputController.prototype.update = function() {
  var moveAmount = this.getMoveAmount();
  var v = vec3.create();
  var keyboard = this.input.keyboard;
  var isRev = this.flags & InputController.REV;
  var val = isRev ? -1 : 1;

  if (keyboard.up)
    v[2] -= val;

  if (keyboard.down)
    v[2] += val;

  if (keyboard.left)
    v[0] -= val;

  if (keyboard.right)
    v[0] += val;

  if (keyboard.z)
    v[1] -= val;

  if (keyboard.x)
    v[1] += val;

  if (keyboard.q && (this.flags & InputController.ROTATE)) {
    this.node.rotate(0.1, [0, 1, 0]);
  }

  if (!vec3.isZero(v)) {
    vec3.scale(vec3.normalize(v), moveAmount * (keyboard.shift ? 2 : 1), v);
    this.events.emit('move', v);
    this.node.translate(v);
  }

  return v;
}


//===----------------------------------------------------------------------===//
// FacingController
//===----------------------------------------------------------------------===//
function FacingController(node, step, target, threshold) {
  this.node = node;
  this.threshold = threshold || 0.001;

  this.getStepAmount = !(step instanceof Function) ?
                       function() { return step; } : step;

  this.getTarget = !(target instanceof Function) ?
                   function() { return target; } : target;
}


//===----------------------------------------------------------------------===//
// FacingController.update
//===----------------------------------------------------------------------===//
FacingController.prototype.update = function() {
  var target = this.getTarget();

  var a = vec3.create(target);
  vec3.normalize(a);

  var b = vec3.create();
  b[0] = Math.sin(this.node.zrot);
  b[1] = Math.cos(this.node.zrot);

  var dot = vec3.dot(a, b);
  var angle = Math.acos(dot);
  var step = this.getStepAmount(angle);

  //this.node.rotate(1, [0, 0, 1]);
}

//===----------------------------------------------------------------------===//
// BobbingController
//===----------------------------------------------------------------------===//
function BobbingController(node, rate, spin, height) {
  this.node = node;
  this.rate = rate || 0.1;
  this.height = 1/height || 1/2;
  this.spin = spin || 0.01;
  this.bob = 0;
}

//===----------------------------------------------------------------------===//
// BobbingController.update
//===----------------------------------------------------------------------===//
BobbingController.prototype.update = function() {
  this.bob += this.rate;
  var cos = Math.cos(this.bob*this.height)*0.01;
  var v = vec3.create([0, 0, cos]);
  this.node.rotate(this.spin, [0, 0, 1]);
  this.node.translate(v);
}


//===----------------------------------------------------------------------===//
// CollisionController
//===----------------------------------------------------------------------===//
function CollisionController(terrain, entity) {
  this.ent = entity;
  this.terrain = terrain;
}


//===----------------------------------------------------------------------===//
// CollisionController.update
//===----------------------------------------------------------------------===//
CollisionController.prototype.update = function() {
  var ent = this.ent
    , node = ent.sceneNode
    , terrain = this.terrain
    , hw = terrain.gridSize / 2
    , pos = Entity.getGridPosition(terrain, ent)
    , block = terrain.getBlock(pos)
    , targetHeight = terrain.surface(pos)
    , cap = 1
    , relativeHeight = targetHeight - pos[1]
    , skipY = relativeHeight > cap
    , passible = Block.isPassible(block) || !skipY;

  var pushX = 0 /* passible? 0 : (node.position[0] + ent.hw()) - (pos[0] + hw) */
    , pushY = skipY? 0 : targetHeight - ent.bottom()
    , pushZ = 0 /* passible? 0 : (node.position[2] + ent.hw()) - (pos[2] + hw) */
    , push = vec3.create([pushX, pushY, pushZ]);

  node.translate(push);
};


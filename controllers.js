
//===----------------------------------------------------------------------===//
// InputController
//===----------------------------------------------------------------------===//
function InputController(node, moveAmount, input) {
  this.input = input || new Input();
  this.node = node;
  this.getMoveAmount = !(moveAmount instanceof Function) ?
                       function() { return moveAmount; } : moveAmount;
}


//===----------------------------------------------------------------------===//
// InputController.update
//===----------------------------------------------------------------------===//
InputController.prototype.update = function() {
  var moveAmount = this.getMoveAmount();
  var v = vec3.create();
  var keyboard = this.input.keyboard;

  if (keyboard.up)
    v[0] += 1;
  
  if (keyboard.down) 
    v[0] -= 1;

  if (keyboard.left) 
    v[1] -= 1;

  if (keyboard.right) 
    v[1] += 1;

  if (!vec3.isZero(v)) {
    vec3.scale(vec3.normalize(v), moveAmount * (keyboard.shift ? 2 : 1));
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


function BobbingController(node, rate, spin, height) {
  this.node = node;
  this.rate = rate || 0.1;
  this.height = 1/height || 1/2;
  this.spin = spin || 0.01;
  this.bob = 0;
}

BobbingController.prototype.update = function() {
  this.bob += this.rate;
  var cos = Math.cos(this.bob*this.height)*0.01;
  var v = vec3.create([0, 0, cos]);
  this.node.rotate(this.spin, [0, 0, 1]);
  this.node.translate(v);
}

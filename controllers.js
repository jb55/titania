
//===----------------------------------------------------------------------===//
// InputController
//===----------------------------------------------------------------------===//
function InputController(node, moveAmountFn, input) {
  this.input = input || new Input();
  this.node = node;
  this.getMoveAmount = moveAmountFn
}


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
}

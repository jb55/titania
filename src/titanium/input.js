
//===----------------------------------------------------------------------===//
// Input
//===----------------------------------------------------------------------===//
Ti.Input = function(ctx) {
  this.keyboard = {};
  var self = this;
  this.mousedown = false;
  this.keydown = true;
  this.clickHandlers = [];

  if (!ctx)
    ctx = document;

  // this is handling WASD, and arrows keys
  function update_keyboard(e, val) {
    switch(e.keyCode) {
      case 40:
      case 83: self.keyboard['down'] = val; break;
      case 38:
      case 87: self.keyboard['up'] = val; break;
      case 39:
      case 68: self.keyboard['right'] = val; break;
      case 37:
      case 65: self.keyboard['left'] = val; break;
      case 32: self.keyboard['space'] = val; break;
      case 17: self.keyboard['ctrl'] = val; break;
      case 13: self.keyboard['enter'] = val; break;
      case 69: self.keyboard['e'] = val; break;
      case 81: self.keyboard['q'] = val; break;
      case 88: self.keyboard['x'] = val; break;
      case 90: self.keyboard['z'] = val; break;
      case 82: self.keyboard['r'] = val; break;
    }
  };

  ctx.ontouchstart = function(event) {
    self.mousedown = true;
  }

  ctx.ontouchend = function(event) {
    self.mousedown = false;
  }

  ctx.ontouchmove = function(event) {}

  ctx.onmousedown = function(event) {
    self.mousedown = true;
  }

  ctx.onmouseup = function(event) {
    self.mousedown = false;
  }

  ctx.onclick = function(event) {
    var x = self.clickX = event.layerX;
    var y = self.clickY = event.layerY;
    self.clickHandlers.forEach(function(fn){ fn(x, y); });
  }

  ctx.onmousemove = function(event) {
    self.mouseX = event.clientX;
    self.mouseY = event.clientY;
  }

  document.onkeydown = function(e) {
    self.keydown = true;
    update_keyboard(e, true);
    self.keyboard.shift = !!e.shiftKey;
  };

  document.onkeyup = function(e) {
    self.keydown = false;
    update_keyboard(e, false);
    self.keyboard.shift = !!e.shiftKey;
  };

  // can be used to avoid key jamming
  ctx.onkeypress = function(e) {
  };

  // make sure self the keyboard is rested when
  // the user leave the page
  window.onblur = function (e) {
      self.keyboard = {}
      self.keydown = false;
      self.mousedown = false;
  }
}

Ti.Input.prototype.addHandler = function(action, fn) {
  if (action === "click")
    this.clickHandlers.push(fn);
};

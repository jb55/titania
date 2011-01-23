
//===----------------------------------------------------------------------===//
// Input
//===----------------------------------------------------------------------===//
function Input() {
  this.keyboard = {};
  var self = this;
  this.mousedown = false;
  this.keydown = true;

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
      case 89: self.keyboard['z'] = val; break;
      case 82: self.keyboard['r'] = val; break;
    }
  };

  document.ontouchstart = function(event) {
    self.mousedown = true;
  }

  document.ontouchend = function(event) {
    self.mousedown = false;
  }

  document.ontouchmove = function(event) {}

  document.onmousedown = function(event) {
    self.mousedown = true;
  }

  document.onmouseup = function(event) {
    self.mousedown = false;
  }

  document.onclick = function(event) {
    //self.click(event);
  }

  document.onmousemove = function(event) {
    self.xmouse = event.clientX;
    self.ymouse = event.clientY;
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
  document.onkeypress = function(e) {
  };

  // make sure self the keyboard is rested when
  // the user leave the page
  window.onblur = function (e) {
      self.keyboard = {}
      self.keydown = false;
      self.mousedown = false;
  }
}


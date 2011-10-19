
function EventEmitter() {
  this.handlers = {};
}

//===----------------------------------------------------------------------===//
// EventEmitter.on
//===----------------------------------------------------------------------===//
EventEmitter.prototype.on = function(event, fn) {
  var handlers = this.handlers[event];
  handlers = this.handlers[event] = handlers || [];
  handlers.push(fn);
}


//===----------------------------------------------------------------------===//
// EventEmitter.emit
//===----------------------------------------------------------------------===//
EventEmitter.prototype.emit = function() {
  var args = [].slice.call(arguments);
  var event = _.first(args);
  var rest = _.rest(args);
  this.handlers[event].forEach(function(fn) { fn.apply(this, rest); });
}


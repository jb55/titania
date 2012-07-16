
Ti.EventEmitter = {

  _callbacks: function() {
    return this.__callbacks || (this.__callbacks = {});
  },

//===----------------------------------------------------------------------===//
// EventEmitter.on
//===----------------------------------------------------------------------===//
  on: function(event, fn) {
    var callbacks = this._callbacks()[event];
    callbacks = this._callbacks()[event] = callbacks || [];
    callbacks.push(fn);
  },

//===----------------------------------------------------------------------===//
// EventEmitter.emit
//===----------------------------------------------------------------------===//
  emit: function() {
    var args = [].slice.call(arguments);
    var event = _.first(args);
    var rest = _.rest(args);
    _(this._callbacks()[event]).each(function(fn) { fn.apply(this, rest); });
  }

}


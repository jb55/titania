
//===----------------------------------------------------------------------===//
// Ticker
//===----------------------------------------------------------------------===//
function Ticker(tick_duration, paint) {
  this.paint = paint;
  this.tick_duration = tick_duration || 25;

  this.start = new Date().getTime();
  this.ticks_elapsed = 0;
  this.current_tick = 0;
}


//===----------------------------------------------------------------------===//
// Ticker.next
//===----------------------------------------------------------------------===//
Ticker.prototype.next = function() {
  var ticks_elapsed = Math.round((this.now - this.start) / this.tick_duration);
  this.lastTicksElapsed = ticks_elapsed - this.current_tick;
  this.current_tick = ticks_elapsed;
  return this.lastTicksElapsed;
}


//===----------------------------------------------------------------------===//
// Ticker.run
//===----------------------------------------------------------------------===//
Ticker.prototype.run = function() {
  var self = this;
  this.now = new Date().getTime();
  var ticks_elapsed = this.next();

  if(ticks_elapsed == 0) {
    setTimeout(function() { self.run(); }, this.tick_duration);
    return;
  }

  this.paint();
  this.time_to_paint = (new Date().getTime()) - this.now;
  this.load = Math.round((this.time_to_paint / this.tick_duration) * 100);

  // We need some pause to let the browser catch up the update. Here at least
  // 12 ms of pause
  var next_paint = Math.max(this.tick_duration - this.time_to_paint, 12);
  setTimeout(function() { self.run(); }, next_paint);
}


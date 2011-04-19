
Ti.debug = Ti.debug || {};

function assert(cond, msg) {
  if (!cond) throw msg || "Assertion failed";
}

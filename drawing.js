
//===----------------------------------------------------------------------===//
// drawLine
//===----------------------------------------------------------------------===//
function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  // offset by .5 so lines aren't blurry, wtf?
  ctx.moveTo(x1 + .5, y1 + .5);
  ctx.lineTo(x2 + .5, y2 + .5);
  ctx.stroke();
}


//===----------------------------------------------------------------------===//
// drawCircle
//===----------------------------------------------------------------------===//
function drawCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, true);
  ctx.stroke();
}


//===----------------------------------------------------------------------===//
// drawDebugPoint
//===----------------------------------------------------------------------===//
function drawDebugPoint(object, ctx) {
  ctx.strokeStyle = 'red';
  drawCircle(ctx, object.x, object.y, 2);
}


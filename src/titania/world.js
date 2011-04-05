var DEBUG_GLOBAL = {};

//===----------------------------------------------------------------------===//
// World
//===----------------------------------------------------------------------===//
function World(elem, vshader, fshader, fps) {

  var aspect = 9. / 16.;
  var restrict = 0.8;

  this.width = window.innerWidth * restrict;
  this.height = aspect * this.width;
  this.block_size = 32;
  this.block_width = 20;
  this.block_height = 20;
  this.block_depth = 4;
  this.entities = [];
  this.input = new Ti.Input();
  this.scene = new Ti.Scene();
  var canvas = document.getElementById(elem);
  canvas.width = this.width;
  canvas.height = this.height;

  var gl = this.gl = initWebGL(canvas,
    vshader, 
    fshader,
    [ "vNormal", "vColor", "vPosition"],
    [1, 1, 1, 1], // clear color
    10000, // depth
    false //debug
  );

  if (!gl) {
    // couldn't load WebGL
    return false;
  }

  var terrainTexture = getTexture(gl, 'terrain');
  this.terrain = new BlockTerrain(terrainTexture);

  gl.debugTexture = loadImageTexture(gl, "img/debug.png");

  // TEST
  this.setupRenderer(gl);
  initTestWorld(this);

  this.box = makeBox(gl);

  this.terrain.geometry.bind(gl);

  var self = this;
  var framerate = new Framerate(fps);
  this.preload(this.gl, function() {
    (function loop() {
      WebGLUtils.requestAnimationFrame(canvas, loop);
      self.update();
      self.render();
      framerate.snapshot();
    })();
  });

  return true;
}


//===----------------------------------------------------------------------===//
// initTestWorld
//===----------------------------------------------------------------------===//
function initTestWorld(world) {
  var gl = world.gl;
  world.map = test_map;
  world.terrain.loadMap(gl, world.map);
  
  var cubeGeometry = Ti.Geometry.copy(world.terrain.geometry);
  cubeGeometry.numElements = 36;

  // our root scene node
  var rootNode = world.scene.getRootNode();

  // attach terrain to root scene node
  var terrainNode = new Ti.SceneNode();
  terrainNode.attachObject(world.terrain);
  rootNode.attachObject(terrainNode);

  // attach the player to the root scene node
  var playerNode = new Ti.SceneNode();
  terrainNode.attachObject(playerNode);

  var player = world.player = createPlayer(gl, playerNode, cubeGeometry);
  world.entities.push(player);

  //playerNode.translate([10, 10, 1]);

  player.orientation_controller = 
    new FacingController(playerNode);

  var terrainBobbingController =
    new BobbingController(terrainNode, 0.2, 0.01, 2);

  //world.scene.attachController(terrainBobbingController);
  world.scene.attachController(
    new InputController(world.camera, 0.12, world.input, InputController.REV));

  player.movement_controller = 
    new InputController(playerNode, 0.12, world.input);

  var bobbingController = 
    new BobbingController(playerNode, 0.1, 0.01, 2);

}

//===----------------------------------------------------------------------===//
// World.getBlock
//===----------------------------------------------------------------------===//
World.prototype.getBlock = function(x, y, z) {
  var def = BLOCKS[0]; // air
  if (x < 0 || y < 0 || z < 0)
    return def;
  var slice = this.map[z];
  if (!slice)
    return def;
  var row = slice[y];

  if (!row)
    return def;

  return BLOCKS[row[x]] || def;
};

//===----------------------------------------------------------------------===//
// World.clear
//===----------------------------------------------------------------------===//
World.prototype.clear = function(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


//===----------------------------------------------------------------------===//
// World.update
//===----------------------------------------------------------------------===//
World.prototype.update = function() {
  this.updateEntities();
  this.scene.update();
};


//===----------------------------------------------------------------------===//
// World.render
//===----------------------------------------------------------------------===//
World.prototype.render = function() {
  var gl = this.gl;

  // Clear the canvas
  this.clear(gl);

  if (this.input.keyboard.e) {
    this.currentCamera = this.player.headCam;
  } else if (this.input.keyboard.r) {
    this.currentCamera = this.camera;
  }

  this.scene.render(gl, this.currentCamera);

  // Finish up.
}


//===----------------------------------------------------------------------===//
// World.preload
//===----------------------------------------------------------------------===//
World.prototype.preload = function(gl, done) {
  var self = this;
  this.c = 0;
  var len = 0;

  function onLoadAsset(asset) {
    // generate texture
    var texture = generateTexture(gl, asset.img, texture);
    asset.texture = texture;

    self.c += 1;
    if (self.c == len) {
      done();
    }
  }

  function doEnt(entity) {
    var assets = entity.assets || [];
    entity.assets = assets;

    if (entity.transparent) {
      return;
    }

    function doAsset(src) {
      var asset = {};
      len += 1;
      asset.img = new Image();
      asset.img.onload = function() { onLoadAsset(asset); };
      asset.img.src = src;
      assets.push(asset);
    }

    doAsset("img/" + entity.name + '.png');

    if (entity.side) {
      doAsset("img/" + entity.name + '_side.png');
    }

  }

  // Blocks
  for (var i = 0; i < BLOCKS.length; i++) {
    doEnt(BLOCKS[i]);
  };

  // Objects
  for (var i = 0; i < OBJECTS.length; i++) {
    doEnt(OBJECTS[i]);
  };

};


//===----------------------------------------------------------------------===//
// World.updateEntities
//===----------------------------------------------------------------------===//
World.prototype.updateEntities = function(gl) {
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].update();
  };
}

//===----------------------------------------------------------------------===//
// calculateNormals
//===----------------------------------------------------------------------===//
function calculateNormals(gl, mvp) {
  // Construct the normal matrix from the model-view matrix and pass it
  // in
  mat4.inverse(mvp, gl.normalMatrix);
  mat4.transpose(gl.normalMatrix);
  setNormalsUniform(gl, gl.normalMatrix);
}


//===----------------------------------------------------------------------===//
// calculateProjection
//===----------------------------------------------------------------------===//
function calculateProjection(gl) {
  // Construct the model-view * projection matrix and pass it in
  mat4.multiply(gl.projectionMatrix, gl.mvMatrix, gl.mvpMatrix)
  setProjectionUniform(gl, gl.mvpMatrix);
}


//===----------------------------------------------------------------------===//
// setProjection
//===----------------------------------------------------------------------===//
function setProjection(gl, m) {
  mat4.set(gl.mvpMatrix, m);
  setProjectionUniform(gl, m);
}


//===----------------------------------------------------------------------===//
// setNormals
//===----------------------------------------------------------------------===//
function setNormals(gl, m) {
  mat4.set(gl.normalMatrix, m);
  setNormalsUniform(gl, m);
}


//===----------------------------------------------------------------------===//
// setProjectionUniform
//===----------------------------------------------------------------------===//
function setProjectionUniform(gl, m) {
  setUniform(gl, gl.u_mvpMatrixLoc, m);
}


//===----------------------------------------------------------------------===//
// setNormalsUniform
//===----------------------------------------------------------------------===//
function setNormalsUniform(gl, m) {
  setUniform(gl, gl.u_normalMatrixLoc, m);
}


//===----------------------------------------------------------------------===//
// setUniform
//===----------------------------------------------------------------------===//
function setUniform(gl, loc, m) {
  gl.uniformMatrix4fv(loc, false, m);
}



//===----------------------------------------------------------------------===//
// setupRenderer
//===----------------------------------------------------------------------===//
World.prototype.setupRenderer = function(gl) {
  // Set some uniform variables for the shaders
  gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), -1, 1, -0.09);
  gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);

  //gl.enable(gl.CULL_FACE);
  gl.enable(gl.TEXTURE_2D);

  //gl.cullFace(gl.FRONT);

  var size = 20;
  gl.viewport(0, 0, this.width, this.height);

  // set up the isometric projection
  var iso = mat4.create();
  gl.projectionMatrix = mat4.create();
  mat4.identity(iso);
  mat4.rotate(iso, (Math.PI/180)*48.264, [1, 0, 0]);
  mat4.rotate(iso, (Math.PI/180)*-45, [0, 1, 0]);
  //mat4.scale(iso, [1, 1.15, 1]);

  //var frustum = mat4.ortho(size, -size, -size*0.6, size*0.6, -40, 100);
  var frustum = mat4.perspective(45 /* fov */, this.width / this.height, 1, 100);
  mat4.multiply(frustum, iso, gl.projectionMatrix);
  this.camera = Ti.Camera.create(gl.projectionMatrix);

  // zoom out a bit
  this.camera.translate([-5, -10, -5]);

  this.currentCamera = this.camera;

  // Matrices!
  gl.mvMatrix = mat4.create();
  gl.u_normalMatrixLoc = gl.getUniformLocation(gl.program, "u_normalMatrix");
  gl.normalMatrix = mat4.create();
  gl.u_mvpMatrixLoc = gl.getUniformLocation(gl.program, "u_mvpMatrix");
  gl.mvpMatrix = mat4.create();

  gl.u_mvpMatrixLoc = gl.getUniformLocation(gl.program, "u_mvpMatrix");

  // Enable all of the vertex attribute arrays.
  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  gl.enableVertexAttribArray(2);

};

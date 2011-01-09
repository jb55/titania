
//===----------------------------------------------------------------------===//
// World
//===----------------------------------------------------------------------===//
function World(elem, vshader, fshader, fps) {
  this.width = window.innerWidth * 0.9;
  this.height = window.innerHeight * 0.9;
  this.block_size = 32;
  this.block_width = 20;
  this.block_height = 20;
  this.block_depth = 4;
  this.entities = [];
  this.input = new Input();
  this.scene = new Scene();
  var canvas = document.getElementById(elem);
  canvas.width = this.width;
  canvas.height = this.height;

  var gl = this.gl = initWebGL(canvas,
    vshader, 
    fshader,
    [ "vNormal", "vColor", "vPosition"],
    [0.1, 0.1, 0.1, 1], // clear color
    10000, // depth
    true //debug
  );

  if (!gl) {
    // couldn't load WebGL
    return false;
  }

  var terrainTexture = getTexture(gl, 'terrain');
  this.terrain = new BlockTerrain(terrainTexture);

  gl.debugTexture = loadImageTexture(gl, "img/debug.png");

  // TEST
  initTestWorld(this);

  this.box = makeBox(gl);
  this.setupRenderer(gl);

  this.terrain.vbo.bind(gl);

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

  // our root scene node
  var rootNode = world.scene.getRootNode();

  // attach terrain to root scene node
  var terrainNode = new SceneNode();
  terrainNode.attachObject(world.terrain);
  rootNode.attachObject(terrainNode);

  // attach the player to the root scene node
  var playerNode = new SceneNode();
  rootNode.attachObject(playerNode);
  var player = world.player = createPlayer(gl, playerNode);
  world.entities.push(player);

  // add eye camera
  //camera.sceneNode.setPosition([-player.head.size*4, 0, 0]);
  //player.head.sceneNode.attachObject(camera.sceneNode);

  playerNode.translate([2, 2, 2]);

  player.orientation_controller = 
    new FacingController(playerNode);

  player.movement_controller = 
    new InputController(playerNode, 0.12, world.input);

  var bobbingController = 
    new BobbingController(playerNode, 0.1, 0.01, 2);

  var terrainBobbingController =
    new BobbingController(terrainNode, 0.2, 0.01, 2);

  world.scene.attachController(bobbingController);
  world.scene.attachController(terrainBobbingController);
}

//===----------------------------------------------------------------------===//
// World.doCollisions
//===----------------------------------------------------------------------===//
World.prototype.doCollisions = function() {
  collisionPush(this, this.player);
};


//===----------------------------------------------------------------------===//
// World.getBlockCoord
//===----------------------------------------------------------------------===//
World.prototype.getBlockCoord = function(x, y) {
  x %= this.width;
  y %= this.height;

  x /= this.block_size;
  y /= this.block_size;

  x = Math.floor(x);
  y = Math.floor(y);

  return {x: x, y: y};
};


//===----------------------------------------------------------------------===//
// World.getBlockFromPoint
//===----------------------------------------------------------------------===//
World.prototype.getBlockFromPoint = function(x, y) {
  var blockPoint = this.getBlockCoord(x, y);
  return this.getBlock(blockPoint.x, blockPoint.y);
};


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

function setBlockTransform(t, m, x, y, z) {
  t[z][y][x] = m;
}

function getBlockTransform(t, x, y, z) {
  return t[z][y][x];
}

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

  this.scene.render(gl, this.camera);

  // Finish up.
  gl.flush();

//this.clear(this.gl);
//this.renderBlocks(this.gl);
//this.gl.flush();
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
// World.renderEntities
//===----------------------------------------------------------------------===//
World.prototype.renderEntities = function(gl) {
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].render(gl);
  };
}

//===----------------------------------------------------------------------===//
// calculateNormals
//===----------------------------------------------------------------------===//
function calculateNormals(gl, dontSet) {
  // Construct the normal matrix from the model-view matrix and pass it
  // in
  mat4.inverse(gl.mvMatrix, gl.normalMatrix);
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
  gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 0, 1, 0.8);
  gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.TEXTURE_2D);

  gl.cullFace(gl.FRONT);

  var size = 23;
  gl.viewport(0, 0, this.width, this.height);

  // set up the isometric projection
  var iso = mat4.create();
  gl.projectionMatrix = mat4.create();
  mat4.identity(iso);
  mat4.rotate(iso, (Math.PI/180)*90, [0, 0, 1]);
  mat4.rotate(iso, (Math.PI/180)*35.264, [0, 1, 0]);
  mat4.rotate(iso, (Math.PI/180)*45, [0, 0, 1]);
  mat4.translate(iso, [-15, -10, 0]);
  mat4.scale(iso, [1, 1, 1.2]);
  var ortho = mat4.ortho(size, -size, -size*0.6, size*0.6, -40, 100);
  mat4.multiply(ortho, iso, gl.projectionMatrix);
  this.camera = createCamera(gl.projectionMatrix);

//gl.projectionMatrix = perspectiveMatrix(this.width, this.height, 30, 100);
//mat4.translate(gl.projectionMatrix, [-20, -15, -30]);

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

  // Set up all the vertex attributes for vertices, normals and texCoords
  gl.bindBuffer(gl.ARRAY_BUFFER, this.box.vertexBuffer);
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.box.normalBuffer);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.box.texCoordBuffer);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

  // Bind the index array
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.box.indexBuffer);
};

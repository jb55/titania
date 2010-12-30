
//===----------------------------------------------------------------------===//
// World
//===----------------------------------------------------------------------===//
function World(elem, vshader, fshader) {
  this.width = 800;
  this.height = 600;
  this.block_size = 32;
  this.block_width = this.width / this.block_size;
  this.block_height = this.height / this.block_size;
  this.block_depth = 4;
  this.player = createPlayer();
  this.entities = [];
  this.input = new Input();
  this.block_transforms = [];
  this.normal_transforms = [];

  // TEST
  initTestWorld(this);

  this.initBlockTransforms(this.block_transforms);
  this.initBlockTransforms(this.normal_transforms);
  this.cache_transforms = true;

  var canvas = document.getElementById(elem);
  canvas.width = this.width;
  canvas.height = this.height;

  var gl = this.gl = initWebGL(canvas,
    vshader, 
    fshader,
    [ "vNormal", "vColor", "vPosition"],
    [0.1, 0.1, 0.1, 1], // clear color
    10000, // depth
    false //debug
  );

  if (!gl) {
    // couldn't load WebGL
    console.log('Error loading WebGL');
    return;
  }

  this.grassTexture = loadImageTexture(gl, "img/grass.png");
  this.box = makeBox(gl);
  this.setupRenderer(gl);

  var self = this;
  this.preload(this.gl, function() {
    (function loop() {
      WebGLUtils.requestAnimationFrame(canvas, loop);
      //self.update();
      self.draw();
    })();
  });
}



//===----------------------------------------------------------------------===//
// initTestWorld
//===----------------------------------------------------------------------===//
function initTestWorld(world) {
  var gl = world.gl;
  world.map = test_map;
  world.block_depth = test_map.length;
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
  var slice = this.map[z];
  var row = slice[y];

  if (!row)
    return BLOCKS[0];

  return BLOCKS[row[x]] || BLOCKS[0];
};

World.prototype.initBlockTransforms = function(bt) {
  for (var z = 0; z < this.block_depth; z++) {
    bt.push([]);
    for (var y = 0; y < this.block_height; y++) {
      bt[z].push([]);
      for (var x = 0; x < this.block_width; x++) {
        bt[z][y].push(null);
      };
    };
  };
}

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
  this.player.update(this);
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].update(this);
  };

  // do collisions
  //this.doCollisions();
};


//===----------------------------------------------------------------------===//
// World.draw
//===----------------------------------------------------------------------===//
World.prototype.draw = function() {
  var gl = this.gl;

  // Clear the canvas
  this.clear(gl);

  this.drawBlocks(gl);

  // Finish up.
  gl.flush();

//this.clear(this.gl);
//this.drawBlocks(this.gl);
//this.drawEntities();
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
// World.drawEntities
//===----------------------------------------------------------------------===//
World.prototype.drawEntities = function(layer) {
  this.player.draw(this, layer);
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].draw(this, layer);
  };
};


//===----------------------------------------------------------------------===//
// World.drawGrid
//===----------------------------------------------------------------------===//
World.prototype.drawGrid = function(ctx) {
  // draw vertical lines
  for (var i = 1; i < this.block_width; ++i) {
    var x = i * this.block_size;
    drawLine(ctx, x, 0, x, this.height);
  }

  // draw horizontal lines
  for (var i = 1; i < this.block_width; ++i) {
    var y = i * this.block_size;
    drawLine(ctx, 0, y, this.width, y);
  }

  // border
  drawLine(ctx, 0, 0, 0, this.height); // left
  drawLine(ctx, 0, 0, this.width, 0); // top
  drawLine(ctx, this.width-1, 0, this.width-1, this.height-1); // right
  drawLine(ctx, 0, this.height-1, this.width-1, this.height-1); // bottom
}


//===----------------------------------------------------------------------===//
// World.drawBlocks
//===----------------------------------------------------------------------===//
World.prototype.drawBlocks = function(gl) {

  for (var z = 0; z < this.block_depth; z++) {
    for (var y = 0; y < this.block_height; y++) {
      for (var x = 0; x < this.block_width; x++) {
        var block = this.getBlock(x, y, z);
        if (block.transparent)
          continue;

        // Make a model/view matrix.
        var m = getBlockTransform(this.block_transforms, x, y, z);
        if (!this.cache_transforms || !m) {
          gl.mvMatrix.makeIdentity();
          gl.mvMatrix.translate(x*2, y*2, z*2);

          // Construct the normal matrix from the model-view matrix and pass it in
          gl.normalMatrix.load(gl.mvMatrix);
          gl.normalMatrix.invert();
          gl.normalMatrix.transpose();
          gl.normalMatrix.setUniform(gl, gl.u_normalMatrixLoc, false);

          // Construct the model-view * projection matrix and pass it in
          gl.mvpMatrix.load(gl.projectionMatrix);
          gl.mvpMatrix.multiply(gl.mvMatrix);
          gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);

          if (this.cache_transforms) {
            m = new Matrix4(gl.mvpMatrix);
            n = new Matrix4(gl.normalMatrix);

            setBlockTransform(this.block_transforms, m, x, y, z);
            setBlockTransform(this.normal_transforms, n, x, y, z);
          }
        } else {
          var n = getBlockTransform(this.normal_transforms, x, y, z);
          gl.mvpMatrix.load(m);
          gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);
          gl.normalMatrix.load(n);
          gl.normalMatrix.setUniform(gl, gl.u_normalMatrixLoc, false);
        }

        gl.bindTexture(gl.TEXTURE_2D, block.assets[0].texture);

        // Draw the cube
        gl.drawElements(gl.TRIANGLES, this.box.numIndices, gl.UNSIGNED_BYTE, 0);

      }
    }
  }
}


//===----------------------------------------------------------------------===//
// setupRenderer
//===----------------------------------------------------------------------===//
World.prototype.setupRenderer = function(gl) {
  // Set some uniform variables for the shaders
  gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 0, 1, 0.8);
  gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);

  gl.enable(gl.TEXTURE_2D);
  gl.cullFace(gl.BACK);

  var scale = 0.05;
  gl.viewport(0, 0, this.width, this.height);
  //gl.projectionMatrix = orthoMatrix();
  //gl.projectionMatrix.multiply(isometricMatrix());
  gl.projectionMatrix = isometricMatrix();
  gl.projectionMatrix.rotate(-90, 1, 0, 0);
  gl.projectionMatrix.translate(-1, -0.5, 0);
  gl.projectionMatrix.scale(scale, scale, scale);

  // Matrices!
  gl.mvMatrix = new Matrix4();
  gl.u_normalMatrixLoc = gl.getUniformLocation(gl.program, "u_normalMatrix");
  gl.normalMatrix = new Matrix4();
  gl.u_modelViewProjMatrixLoc =
          gl.getUniformLocation(gl.program, "u_modelViewProjMatrix");
  gl.mvpMatrix = new Matrix4();

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

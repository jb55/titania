PROJECT=titania
COMPRESSOR=closure --compilation_level ADVANCED_OPTIMIZATIONS

SRCS= glMatrix.js \
	webgl-debug.js \
	webgl-utils.js \
	glutil.js \
	textures.js \
	scene.js \
	renderer.js \
	data.js \
	drawing.js \
	world.js \
	entity.js \
	input.js \
	collision.js

all: debug
debug: $(PROJECT)_debug.js
release: $(PROJECT)_release.js

$(PROJECT)_debug.js: $(SRCS)
	cat $^ > $@
	ln -sf $@ $(PROJECT).js

$(PROJECT)_release.js: $(PROJECT)_debug.js
	$(COMPRESSOR) < $< > $@
	ln -sf $@ $(PROJECT).js

clean:
	rm -f $(PROJECT)_debug.js $(PROJECT)_release.js

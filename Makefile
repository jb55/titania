PROJECT=titan
COMPRESSOR=closure --compilation_level ADVANCED_OPTIMIZATIONS

SRCS= data.js \
	drawing.js \
	ticker.js \
	world.js \
	entity.js \
	input.js \
	collision.js

all: debug
debug: $(PROJECT)_debug.js
release: $(PROJECT)_release.js

$(PROJECT)_debug.js: $(SRCS)
	cat $^ > $@
	ln -sf $@ titan.js

$(PROJECT)_release.js: $(PROJECT)_debug.js
	$(COMPRESSOR) < $< > $@
	ln -sf $@ titan.js

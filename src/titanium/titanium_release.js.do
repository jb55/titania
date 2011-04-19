SEARCH_DEPS=$(find . -type f -name '*.js' | \
  sed \
    -e "/ti.js/d" \
    -e "/webgl.js/d" \
    -e "/titanium_release.js/d" \
    -e "/titanium_debug.js/d" \
    -e "/titanium.js/d"
)
DEPS="ti.js util/webgl.js $SEARCH_DEPS"
redo-ifchange $DEPS
COMPRESSOR="closure --compilation_level ADVANCED_OPTIMIZATIONS"
cat $DEPS | $COMPRESSOR > $3

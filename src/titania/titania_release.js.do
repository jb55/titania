DEPS=$(find . -type f -name '*.js' | \
  sed \
    -e "/titania.js/d" \
    -e "/titania_release.js/d" \
    -e "/titania_debug.js/d" \
    -e "/debug\//d"
)
redo-ifchange ../titanium/titanium_release.js $DEPS
COMPRESSOR="closure --compilation_level ADVANCED_OPTIMIZATIONS"
cat ../titanium/titanium_release.js $DEPS | $COMPRESSOR > $3

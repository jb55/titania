SEARCH_DEPS=$(find . -type f -name '*.js' | 
  sed \
    -e "/ti.js/d" \
    -e "/titanium_debug.js/d" \
    -e "/titanium_release.js/d" \
    -e "/titanium.js/d"
)
DEPS="ti.js $SEARCH_DEPS"
redo-ifchange $DEPS
cat $DEPS > $3

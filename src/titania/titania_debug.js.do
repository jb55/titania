DEPS=$(find . -type f -name '*.js' | \
  sed \
    -e "/titania_release.js/d" \
    -e "/titania_debug.js/d" \
    -e "/titania.js/d"
)
redo-ifchange ../titanium/titanium_debug.js $DEPS
cat ../titanium/titanium_debug.js $DEPS > $3

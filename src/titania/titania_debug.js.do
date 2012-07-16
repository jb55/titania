redo-ifchange js_deps
DEPS=$(./js_deps)
redo-ifchange ../titanium/titanium_debug.js $DEPS
cat ../titanium/titanium_debug.js $DEPS > $3

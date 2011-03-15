DEPS=$(find . -type f -name '*.js' | sed -E "/titania_(release|debug).js|titania.js/d")
redo-ifchange ../titanium/titanium_debug.js $DEPS
cat ../titanium/titanium_debug.js $DEPS > $3

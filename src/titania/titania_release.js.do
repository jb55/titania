DEPS=$(find . -type f -name '*.js' | sed -E "/titania_(release|debug).js|debug\/|titania.js/d")
redo-ifchange ../titanium/titanium_release.js $DEPS
COMPRESSOR="closure --compilation_level ADVANCED_OPTIMIZATIONS"
cat ../titanium/titanium_release.js $DEPS | $COMPRESSOR > $3

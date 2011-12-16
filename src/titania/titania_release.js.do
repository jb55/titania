DEPS=$(./js_deps)
redo-ifchange ../titanium/titanium_release.js $DEPS
COMPRESSOR="closure"
cat ../titanium/titanium_release.js $DEPS | $COMPRESSOR > $3

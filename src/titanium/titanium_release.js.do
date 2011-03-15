DEPS=$(find . -type f -name '*.js' | sed -E "/titanium_(release|debug).js|debug\/|titanium.js/d")
redo-ifchange $DEPS
COMPRESSOR="closure --compilation_level ADVANCED_OPTIMIZATIONS"
cat $DEPS | $COMPRESSOR > $3

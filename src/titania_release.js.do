DEPS=$(ls *.js | sed -E "/titania_(release|debug).js|debug_|titania.js/d")
redo-ifchange $DEPS
COMPRESSOR="closure --compilation_level ADVANCED_OPTIMIZATIONS"
cat $DEPS | $COMPRESSOR > $3

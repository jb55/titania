DEPS=$(./js_deps)
COMPRESSOR="closure"
cat $DEPS | $COMPRESSOR > $3

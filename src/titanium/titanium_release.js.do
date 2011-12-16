DEPS=$(./js_deps)
redo-ifchange $DEPS
COMPRESSOR="closure"
cat $DEPS | $COMPRESSOR > $3

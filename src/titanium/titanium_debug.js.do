DEPS=$(./js_deps)
redo-ifchange $DEPS
cat $DEPS > $3

DEPS=$(find . -type f -name '*.js' | sed -E "/titanium_(release|debug).js|titanium.js/d")
redo-ifchange $DEPS
cat $DEPS > $3

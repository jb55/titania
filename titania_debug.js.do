DEPS=$(ls *.js | sed -E "/titania_(release|debug).js|titania.js/d")
redo-ifchange $DEPS
cat $DEPS > $3

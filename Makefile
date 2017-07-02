# List of drivers to enable on build

.NOTPARALLEL : all
all: lint beautify build
lint:
	jshint --verbose *.js data/*.js lib/*.js test/*.js
beautify:
	+find index.js lib data test -name "*.js" -a ! -name "flashgot-*.js" \
		| xargs js-beautify -r
	+find . -maxdepth 2 -name "*.json" -o -name ".jshintrc" | xargs -n 1 jsonlint -i
build:
	jpm xpi
run:
	+jpm run
watch:
	+jpm watchpost --post-url http://localhost:8888/
test:
	+jpm test

# List of drivers to enable on build

.NOTPARALLEL : all
all: lint beautify build
lint:
	# jshint --verbose *.js content/*.js options/*.js popup/*.js
beautify:
	+find *.js content options popup test -name "*.js"  \
		| xargs js-beautify -r
	+find . -maxdepth 2 -name "*.json" -o -name ".jshintrc" | xargs -n 1 jsonlint -i
build:
	web-ext build --overwrite-dest
run:
	+web-ext run
watch:
	+jpm watchpost --post-url http://localhost:8888/
test:
	+jpm test

# List of drivers to enable on build

#YTARGS += --manifest-overload=package-youtube-video-player.json

.NOTPARALLEL : all
all: lint beautify build
build-all: build build-yt
lint:
	jshint --verbose */*.js
beautify:
	find . -maxdepth 2 -name "*.js" -a ! -name "flashgot-*.js" \
		| xargs js-beautify -r
	find . -name "*.json" | xargs -n 1 jsonlint -i
build:
	jpm xpi
build-yt:
	jpm xpi $(YTARGS)
run:
	jpm run
run-yt:
	jpm run $(YTARGS)
watch:
	jpm watchpost --post-url http://localhost:8888/
watch-yt:
	jpm watchpost --post-url http://localhost:8888/
test:
	jpm test
test-yt:
	jpm test $(YTARGS)

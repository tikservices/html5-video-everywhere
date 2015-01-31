YTARGS = --static-args='{"drivers":["youtube"]}' --manifest-overload=package-youtube-video-player.json

.NOTPARALLEL : all
all: lint beautify build
build: build-generic build-yt
lint:
	jshint */*.js
beautify:
	js-beautify -r */*.js
	find . -name "*.json" | xargs -n 1 jsonlint -i
build-generic:
	cfx xpi
build-yt:
	cfx xpi $(YTARGS)
run:
	cfx run
run-yt:
	cfx run $(YTARGS)

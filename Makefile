# List of drivers to enable on build
DRIVERS = break,dailymotion,facebook,metacafe,vimeo,youtube

YTARGS += --static-args='{"drivers":["youtube"]}' --manifest-overload=package-youtube-video-player.json
ARGS   += --static-args='{"drivers":["$(shell echo $(DRIVERS) | sed 's/,/","/g')"]}'

.NOTPARALLEL : all
all: lint beautify build
build: build-generic build-yt
lint:
	jshint */*.js
beautify:
	js-beautify -r */*.js
	find . -name "*.json" | xargs -n 1 jsonlint -i
build-generic:
	cfx xpi $(ARGS)
build-yt:
	cfx xpi $(YTARGS)
run:
	cfx run $(ARGS)
run-yt:
	cfx run $(YTARGS)
test:
	cfx test $(ARGS)
test-yt:
	cfx test $(YTARGS)

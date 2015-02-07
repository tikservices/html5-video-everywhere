# List of drivers to enable on build
DRIVERS = break,dailymotion,facebook,metacafe,vimeo,youtube

YTARGS += --static-args='{"drivers":["youtube"]}' --manifest-overload=package-youtube-video-player.json
ARGS   += --static-args='{"drivers":["$(shell echo $(DRIVERS) | sed 's/,/","/g')"]}'

.NOTPARALLEL : all
all: lint beautify build
build: build-generic build-yt
lint:
	jshint --verbose */*.js
beautify:
	find . -maxdepth 2 -name "*.js" -a ! -name "flashgot-*.js" \
		| xargs js-beautify -r
	find . -name "*.json" | xargs -n 1 jsonlint -i
build-generic:
	cfx xpi --force-mobile \
		'$(shell echo $(ARGS) | sed 's/}$$/,"production":true}/')'
build-yt:
	cfx xpi --force-mobile \
		'$(shell echo $(ARGS) | sed 's/}$$/,"production":true}/')'
run:
	cfx run $(ARGS)
run-yt:
	cfx run $(YTARGS)
test:
	cfx test $(ARGS)
test-yt:
	cfx test $(YTARGS)

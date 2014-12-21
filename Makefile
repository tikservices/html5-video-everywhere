all:
	jshint */*.js
	js-beautify -r */*.js
	find . -name "*.json" | xargs -n 1 jsonlint -i
	cfx xpi

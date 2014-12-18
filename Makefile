all:
	js-beautify -r */*.js
	jsonlint -i .jshintrc
	find . -name "*.json" | xargs -n 1 jsonlint -i
	cfx xpi

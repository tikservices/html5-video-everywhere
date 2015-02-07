/**
 * Version: 0.8.0.93 - LeanBack Player
 * Date: 2012-03-05
 *
 * This Software is part of LeanBack Player [HTML5 Media Player UI] by Ronny Mennerich
 * Copyright (c) 2010-2012 Ronny Mennerich <contact@leanbackplayer.com>
 */
;(function(window, undefined) {
var document = window.document, navigator = window.navigator, location = window.location, ua$ = navigator.userAgent;
/**---------------------------------------------------------------*/
/**-------------------- LEANBACK PLAYER BELOW --------------------*/
/**---------------------------------------------------------------*/
/* PLAYER */
var LBP = function(o, v, h5o) {
	/* vars: default player version */
	this.version = "0.8.0.93";

	/* var: default player options */
	this.options = {
		/* if video player should start in fullscreen mode */
		autoFullscreen: false,
		/* set up default language, en = english, de = german, fr = french, ... */
		defaultLanguage: "en",
		/* change to browser language if available */
		setToBrowserLanguage: true,
		/* default timer format, could be "PASSED_DURATION" (default), "PASSED_REMAINING", "PASSED_HOVER_REMAINING" */
		defaultTimerFormat: "PASSED_DURATION",
		/* set up default volume */
		defaultVolume: 6,
		/* set how many volume rates */
		volumeRates: 8,
		/* focus first (video) player on initialization */
		focusFirstOnInit: true,
		/* delayed hiding of LB player controls */
		hideControls: true,
		/* if delayed hiding, hide LB player controls after x seconds */
		hideControlsTimeout: 6,
		/* prevent hiding of controls bar after x seconds (x set in "hideControlsTimeout") */
		hideControlsOnPause: false,
		/* if media element should be paused and unfocused (CSS) on focus lost */
		pauseOnFocusLost: false,
		/* prevent playing more than one media element (player) at same time */
		pauseOnPlayerSwitch: false,
		/* if media element buffering should be stopped/restarted on focus lost/re-focused - overwrites pauseOnPlayerSwitch to true, stores playback-status (playing/paused) to come back (experimental) */
		handleBufferingOnFocusLost: false,
		/* if poster-image should reappear once video ended */
		posterRestore: true,
		/* if there are subtitles, show controls element to change */
		showSubtitles: true,
		/* if true subtitles can be shown in the black bits of screen around video (called WindowBoxing) */
		permitSubtitlesWindowBoxed: false,
		/* if there are subtitles, set a default language; this can also be different from the default interface language */
		defaultSubtitleLanguage: "en",
		/* if false no subtitle is selected by default */
		initSubtitle: true,
		/* set up seek-skip in sec., to jump back or forward x sec. */
		seekSkipSec: 3,
		/* set up seek-skip in percent., to jump back or forward x percent. */
		seekSkipPerc: 10,
		/* if you want to show an embed-code option within the player (experimental) */
		showEmbedCode: false,
		/* if different source qualities available, show controls element to change between them */
		showSources: false,
		/* if browser supports playbackrate, show controls element */
		showPlaybackRates: false,
		/* if playbackrate values should be extended, by default following are available */
		playbackRates: [0.25, 0.5, 1, 2],
		/* path to your logo e.g.: "./images/logo.png"; position to be changed within CSS theme */
		logo: "",
		/* use (default=true) preloading spinner or not (false) */
		useSpinner: true,
		/* use to adapt spinner circles to your needs (CSS) */
		useSpinnerCircles: 7,
		/* trigger: events of html5 media elements (loadstart, progress, suspend, abort, error, emptied, stalled; play, pause; loadedmetadata, loadeddata, waiting, playing, canplay, canplaythrough; seeking, seeked, timeupdate, ended; ratechange, durationchange, volumechange) */
		triggerHTML5Events: [],
		/* default controls to be shown within a video player (Progress is "MUST") */
		defaultControls: ["Play", "Pause", "Stop", "Progress", "Timer", "Volume", "Playback", "Subtitles", "Sources", "Fullscreen"],
		/* default audio controls to be shown within a audio player (Progress is "MUST") */
		defaultAudioControls: ["Play", "Pause", "Stop", "Progress", "Timer", "Volume"],
		/* extended controls to be shown within the player */
		controlsExtra: ["Poster", "Embed", "Logo", "Spinner", "BigPlay"],
		/* show controls below video-viewport if true */
		controlsBelow: false,
		/* set info url to link back on mobile devices */
		infoUrl: "http://www.leanbackplayer.com"
	};
	LBP.mergeObjs(this.options, o);

	/* var: default player vars */
	this.vars = {
		/* var: autoplay */
		autoplay: false,
		/* var: fixLoop */
		fixLoop: false,
		/* var: if player ready */
		playerReady: [],
		/* vars: browser & device checks */
		isBrowserLang: LBP.getBrowserLang(),
		isIE: (LBP.isBrowser === "msie") ? true : false,
		/* vars: object to fix (pre)loading/buffering of sources */
		fixLoadingSource: {},
		initSources: {},
		/* var: set source */
		playableSources: [],
		/* var: player fullscreen */
		fullscreen: false,
		/* var: muted */
		muted: false,
		/* vars: keys */
		keyHolderSHIFT: false,
		keyHolderCRTL: false,
		keyHolderTAB: false,
		keyHolderALT: false,
		/* vars: keyboard action arrays - see fct.initializeKeys */
		keyDownAction: [],
		keyUpAction: [],
		/* vars: type of player */
		audioPlayer: false,
		videoPlayer: false,
		/* vars: to initialize before player is set up, to be used to initialize extensions */
		initialize: [],
		initialized: false,
		/* vars: after init do */
		afterInitialize: [],
		/* var: loaded value for buffering process */
		loaded: 0,
		/* var: stoped value */
		stoped: true,
		/* var: prevent real fullscreen - to not loose player functionality */
		preventRealFullscreen: false,
		/* var: if fullscreen-change event was added */
		fullscreenEvent: false,
		/* var: store translations not available for browser to avoid repeated output in console log */
		lostTranslations: [],
		/* is IFrame */
		isIframe: false,
		/* is CORS IFrame */
		isCorsIframe: false,
		/* CORS IFrame size */
		bsXY: false
	};
	LBP.mergeObjs(this.vars, v);

	/* do: store given html5-object */
	this.html5Obj = h5o;

	/* do: set to browser-language, if available */
	if(!this.options.setToBrowserLanguage || typeof(LBP.Lang[this.vars.isBrowserLang]) === "undefined") {this.vars.isBrowserLang=this.options.defaultLanguage;}

	/* do: init keys */
	this.initializeKeys();

	/* do: init video/audio player */
	if(this.vars.videoPlayer) {this.initializeVPlayer();} else if(this.vars.audioPlayer) {this.initializeAPlayer();}
};
/**---------------------------------------------------------------*/
LBP.prototype.initializeKeys = function() {
	// events: https://developer.mozilla.org/en/DOM/Event/UIEvent/KeyEvent
	LBP.mergeObjs(this.vars.keyDownAction, {
		/* for TAB */
		9: 'if(!this.vars.fullscreen) {LBP.onKeyAction = true; LBP.isMediaEvent = false;} this.vars.keyHolderTAB = true;',
		/* for SHIFT & x */
		16: 'this.vars.keyHolderSHIFT = true; window.clearInterval(this.vars.mouseMoveProc);',
		/* for CRTL & x */
		17: 'this.vars.keyHolderCRTL = true; window.clearInterval(this.vars.mouseMoveProc);',
		/* for ALT & x */
		18: 'this.vars.keyHolderALT = true; window.clearInterval(this.vars.mouseMoveProc);',
		/* for ESC (leave Fullscreen) */
		27: 'if(!this.options.autoFullscreen) {this.setScreen(false);}',
		/* for SPACE (play) */
		32: 'this.onPlay();',
		/* for END */
		35: 'this.html5Obj.play(); this.html5Obj.currentTime = this.html5Obj.duration;',
		/* for POS1 */
		36: 'this.html5Obj.pause(); this.onStop();',
		/* for LEFT (seek-) */
		37: 'if(this.vars.keyHolderCRTL) {this.seekTo("-", false);} else {this.seekTo("-", true);}',
		/* for UP (unmute) */
		38: 'if(this.vars.keyHolderCRTL) {this.setVolume(this.options.defaultVolume);} else {this.setVolume("+");}',
		/* for RIGHT (seek+) */
		39: 'if(this.vars.keyHolderCRTL) {this.seekTo("+", false);} else {this.seekTo("+", true);}',
		/* for DOWN (mute)*/
		40: 'if(this.vars.keyHolderCRTL) {this.setVolume(0);} else {this.setVolume("-");}',
		/* for F (Fullscreen) */
		70: 'if(!this.options.autoFullscreen) {this.setScreen(!this.vars.fullscreen);}',
		/* for M (next media on page) */
		77: 'if(this.html5Obj.volume > 0) {this.setVolume(0);} else {this.setVolume(this.options.defaultVolume);}',
		/* for N (next media on page) */
		78: 'if(this.vars.keyHolderSHIFT && !this.vars.fullscreen) {this.getNextPlayer(); this.vars.keyHolderSHIFT = false;}',
		/* for S (stop) */
		83: 'this.onStop();',
		/* for V (show/hide subtitles; with CTRL: cycle through the available subtitles) */
		86: 'if(this.vars.activeSub !== null) {if(this.vars.keyHolderCRTL) {this.nextSubtitle();} else {this.vars.hideSubtitle = !!this.vars.hideSubtitle; this.setSubtitle(this.vars.hideSubtitle);}}',
		/* for F11 */
		122: 'LBP.onKeyAction = true; LBP.isMediaEvent = true;'
	});
	LBP.mergeObjs(this.vars.keyUpAction, {	
		/*****************/
		/* for SHIFT & x */
		16: 'this.vars.keyHolderSHIFT = false;',
		/* for CRTL & x */
		17: 'this.vars.keyHolderCRTL = false;',
		/* for ALT & x */
		18: 'this.vars.keyHolderALT = false;'
	});
	/***** GoogleTV ****/
	if(LBP.isTV) {
		LBP.mergeObjs(this.vars.keyDownAction, {
			/* play/pause */
			179: 'this.onPlay();',
			/* stop */
			178: 'this.onStop();',
			/* skip back */
			177: 'this.seekTo("-", false);',
			/* skip forward */
			176: 'this.seekTo("+", false);',
			/* rewind */
			227: 'this.seekTo("-", true);',
			/* fast forward */
			228: 'this.seekTo("+", true);'
		});
	}
};
/* fct: initialize audio-player */
LBP.prototype.initializeAPlayer = function() {
	var vid = this.options.vid, pid = this.options.pid;

	/* do: create vars and values if undefined */
	if(typeof(this.vars.buffering) === "undefined") {this.vars.buffering = {proc: null, moveProc: null, end: [], endChanged: 0, storeTime: 0};}
	/* do: overwrite controls set by user */
	if(typeof(this.options.audioControls) !== "undefined") {this.options.defaultControls = this.options.audioControls;}
	else {this.options.defaultControls = this.options.defaultAudioControls;}

	/* do: overwrite default vars not needed in audio player, overwrite timer to smaller one, extra controls not available in audio player */
	LBP.mergeObjs(this.options, {posterRestore: false, showSources: false, showSubtitles: false, autoFullscreen: false, defaultTimerFormat: "PASSED_HOVER_REMAINING", controlsExtra: []});

	/* do: add css class to audio element and audio parent */
	LBP.addCssClass(pid, "h5_lb_player"); LBP.addCssClass(vid, "h5_lb_audio");

	/* fct: fix the preload */
	this.fixPreload();

	/* fct: init controls */
	this.initializeControls();

	/* do: set controls visible */
	this.setControls(true);

	LBP.setCssStyle(LBP.$(vid).parentNode, "height", parseInt(LBP.getElemOffset(vid).height, 10)+"px");

	/* fct: init document events */
	this.initializeDocumentEvents();

	/* if autoplay - play audio now */
	if(this.vars.autoplay && LBP.playerFocused === null) {LBP.focusPlayer(true, vid); this.setPlayerInFocus(vid); this.onPlay();}
	/* do: if is first player and option focusFirstOnInit, focus player */
	else if((typeof(_LBP_Player[0]) === "undefined" || (typeof(_LBP_Player[0]) !== "undefined" && _LBP_Player[0].options.vid === vid)) && this.options.focusFirstOnInit) {LBP.focusPlayer(true, vid);}
};
/* fct: initialize video-player */
LBP.prototype.initializeVPlayer = function() {
	var vid = this.options.vid, pid = this.options.pid;

	/* do: create vars and values if undefined */
	if(typeof(this.vars.buffering) === "undefined") {this.vars.buffering = {proc: null, moveProc: null, end: [], endChanged: 0, storeTime: 0};}
	/* do: overwrite controls set by user */
	if(typeof(this.options.videoControls) !== "undefined") {this.options.defaultControls = this.options.videoControls;}

	/* do: add CSS classes to video parent */
	LBP.addCssClass(pid, "h5_lb_player h5_lb_smallscreen");

	/* do: add video and unfocused CSS class to video tag */
	LBP.addCssClass(vid, "h5_lb_video h5_lb_unfocused");

	/* fct: resize and set video */
	this.sizeScreen();

	/* fct: fix the preload */
	this.fixPreload();

	/* fct: init document events */
	this.initializeDocumentEvents();

	/* do: if autoplay - play video now (works only if autoFullscreen not set) */
	if(this.vars.autoplay && LBP.playerFocused === null) {LBP.focusPlayer(true, vid); this.setPlayerInFocus(vid); this.onPlay(); this.setControlsTask();}

	/* do: if is first player and option focusFirstOnInit, focus player */
	if((typeof(_LBP_Player[0]) === "undefined" || (typeof(_LBP_Player[0]) !== "undefined" && _LBP_Player[0].options.vid === vid)) && this.options.focusFirstOnInit) {LBP.focusPlayer(true, vid);}
	else {this.options.focusFirstOnInit = false;}
};
/* fct: initialize controls */
LBP.prototype.initializeControls = function() {
	var vid = this.options.vid, pid = this.options.pid, pcw = 0;

	/* do: create vars and values if undefined */
	if(typeof(this.vars.showControls) === "undefined") {this.vars.showControls = true;}
	if(typeof(this.vars.hasEvents) === "undefined") {this.vars.hasEvents = false;}
	if(typeof(this.vars.hasControls) === "undefined") {this.vars.hasControls = false;}
	if(typeof(this.vars.initialized) === "undefined") {this.vars.initialized = false;}
	if(typeof(this.vars.afterInitialized) === "undefined") {this.vars.afterInitialized = false;}
	if(typeof(this.vars.controlsEvents) === "undefined") {this.vars.controlsEvents = [];}
	if(typeof(this.vars.domEvents) === "undefined") {this.vars.domEvents = [];}
	if(typeof(this.vars.setWithControls) === "undefined") {this.vars.setWithControls = [];}
	if(typeof(this.vars.mouseAction) === "undefined") {this.vars.mouseAction = true;}
	if(typeof(this.vars.seeking) === "undefined") {this.vars.seeking = {playing: false, subs: !this.vars.hideSubtitle};}
	if(typeof(this.vars.volumeSlide) === "undefined") {this.vars.volumeSlide = false;}
	if(typeof(LBP.domEventsAdded) === "undefined") {LBP.domEventsAdded = false;}

	/* do: if no controls added */
	if(!this.vars.hasEvents) {
		/* do: add controls events */
		this.addControlsEvents(vid, pid);

		/* set: hasEvents=true */
		this.vars.hasEvents = true;
	}
	/* do: do before controls added */
	if(!this.vars.initialized) {
		/* do: check if content to be initialized */
		for(var i=0, il=this.vars.initialize.length; i<il; i++) {
			/* do: create function name to call */
			var fi = this.vars.initialize[i];
			/* do: call function */
			if(typeof(this[fi]) === "function") {this[fi](vid, pid);}
		}
		this.vars.initialized = true;
	}

	/* do: add progress bar to controls (must have) */
	if(!LBP.inArray(this.options.defaultControls, "Progress")) {this.options.defaultControls.push("Progress");}

	/* do: add information tab to controls */
	if(!LBP.inArray(this.options.defaultControls, "Info")) {this.options.defaultControls.push("Info");}

	/* do: if no controls added */
	if(!this.vars.hasControls) {
		/* do: add controls elements */
		this.addControlsElements(vid, pid);

		/* do: draw progress timer */
		this.drawProgressTimer();

		/* do: set (muted) volume */
		this.setVolume(((this.html5Obj.muted)?0:this.options.defaultVolume));

		/* set: hasControls=true */
		this.vars.hasControls = true;
	}

	/* do: innerFct for controls width calculation */
	var calcControlsEl = function(vid) {
		/* do: reset progress controls bar */
		LBP.setCssStyle(vid+"_progress_control", "width", "0px");
		/* do: get all control bar childs cbc to calculate controls width cbw */
		var cbc = LBP.$(vid+"_controls").children, cbw = 0;
		for(var i=0; i<cbc.length; i++) {cbw += cbc[i].offsetWidth;}
		return cbw;
	};

	var calcProgressPhEl = function(vid, w, b) {
		/* do: if placeholder exists, remove it */
		var ph = LBP.$(vid+"_pb_ph"); if(ph !== null) {ph.parentNode.removeChild(ph);}

		/* do: calculate placeholder width */
		var phw = parseInt(w - calcControlsEl(vid) - b, 10);

		/* do: (re)create placeholder element */
		var placeHolder = LBP.createHTMLEl(null, "div", {id: vid+"_pb_ph"});

		/* do: insert placeholder before progress element */
		LBP.$(vid+"_controls").insertBefore(placeHolder, LBP.$(vid+"_progress_control"));

		/* do: set new placeholder style width */
		LBP.setCssStyle(vid+"_pb_ph", "width", phw+"px");
	};

	if(this.vars.videoPlayer) {
		var bsXY = (!!this.vars.bsXY && this.vars.isCorsIframe)?this.vars.bsXY:LBP.getBrowserSizeXY(), w = ((this.vars.fullscreen) ? bsXY.width : LBP.$(vid).offsetWidth), b = parseInt(LBP.$(vid).offsetWidth - LBP.getElemStyle(vid, "width"), 10);

		/* do: show controls to calculate */
		LBP.removeCssClass(vid+"_controls", "elem_visibility_hidden");

		/* do: select between none floating and normal progress bar position */
		if(LBP.getElemStyle(vid+"_progress_control", "float") === "none") {
			/* do: set new placeholder style width */
			calcProgressPhEl(vid, w, b);

			/* do: calculate progress control width */
			pcw = parseInt(w-b, 10);
		} else {
			/* do: calculate controls bar width */
			pcw = parseInt(w - calcControlsEl(vid) - b - LBP.getElemOffset(vid+"_controls").width, 10);
		}
	} else if(this.vars.audioPlayer) {
		/* do: show controls to calculate */
		LBP.removeCssClass(vid+"_controls", "elem_visibility_hidden");

		var b = LBP.getElemBorderWidth(vid+"_controls"), aos = LBP.$(pid).offsetWidth, p = parseInt(aos - b.right - b.left,10), cbw = calcControlsEl(vid);

		/* do: select between none floating and normal progress bar position */
		if(LBP.getElemStyle(vid+"_progress_control", "float") === "none") {
			/* do: set new placeholder style width */
			calcProgressPhEl(vid, aos, 0);

			/* do: set progress control width */
			pcw = aos;
		} else {
			/* do: set progress control width */
			pcw = parseInt(p-cbw,10);
		}
	}

	/* do: calculate progress control element */
	LBP.setCssStyle(vid+"_progress_control", "width", pcw+"px");
	/* do: calculate progress-seeking and -loading bar */
	LBP.setCssStyle(vid+"_progress_bar_bg", "width", parseInt(LBP.$(vid+"_progress_control").offsetWidth - LBP.getElemMarginWidth(vid+"_progress_bar_bg").left - LBP.getElemMarginWidth(vid+"_progress_bar_bg").right, 10)+"px");
	LBP.setCssStyle(vid+"_progress_bar_time", "width", LBP.getElemStyle(vid+"_progress_bar_bg", "width")+"px");

	/* do: if start in fullscreen is set */
	if(this.vars.videoPlayer && this.options.autoFullscreen && LBP.playerFocused === null) {
		LBP.focusPlayer(true, vid); this.setPlayerInFocus(vid); this.setScreen(true);
		/* do: on autoplay play video now */
		if(this.vars.autoplay) {this.onPlay(); this.setControlsTask();}
	}

	/* do: do after content+controls added */
	if(!this.vars.afterInitialized) {
		/* do: check if content to be initialized now */
		for(var j=0, al=this.vars.afterInitialize.length; j<al; j++) {
			/* do: create function name to call */
			var fj = this.vars.afterInitialize[j];
			/* do: call function */
			if(typeof(this[fj]) === "function") {this[fj](vid, pid);}
		}
		this.vars.afterInitialized = true;
	}

	/* do: hide default controls on iPad */
	if(LBP.isIPad) {this.html5Obj.controls = false;}

	/* do: hide controls after initialization */
	if(LBP.inArray(this.options.controlsExtra, "BigPlay")) {this.setControls(false);}
};
LBP.prototype.addControlsEvents = function(vid, pid) {
	(function(p) {
		/* do: trigger events set in options */
		var ev = p.options.triggerHTML5Events;
		for(var i=0; i<ev.length; i++) {
			(function(e) {LBP.addEvent(p.html5Obj, e, function() {LBP.log(Date()+": "+e, "info");});}(ev[i]));
		}
		/* do: trigger if media element and parent container exists, else remove this */
		var removed = function() {
			if(p && (!LBP.$(pid) || !LBP.$(vid)) && _LBP_Player.indexOf(p) !== -1) {
				/* do: remove dom events to avoid problems */
				for(var j=0, cel=p.vars.domEvents.length; j<cel; j++) {var e = p.vars.domEvents[j]; LBP.removeEvent(document, e.e, e.f);}
				/* do: remove controls events to avoid problems */
				for(var j=0, cel=p.vars.controlsEvents.length; j<cel; j++) {var e = p.vars.controlsEvents[j]; LBP.removeEvent(p.html5Obj, e.e, e.f);}
				LBP.mergeObjs(p.html5Obj, {src: ""}); try{p.html5Obj.load();} catch(ex2) {} _LBP_Player.splice(_LBP_Player.indexOf(p), 1); p = null;
			}
		};
		/* do: create dom events to be added for video */
		var d = {};
		d = {e: "DOMNodeRemoved", f: removed}; p.vars.domEvents.push(d); LBP.addEvent(document, d.e, d.f);
		d = {e: "DOMNodeInserted", f: removed}; p.vars.domEvents.push(d); LBP.addEvent(document, d.e, d.f);

		/* do: add html5 object events */
		var e = {};
		e = {e: "seeked", f: function() {p.onBuffering();}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "ended", f: function() {
			if(!p.html5Obj.paused) {p.html5Obj.pause();}
			p.setControls(false); p.setPoster(); p.setBigPlayButton(true); if(!LBP.inArray(p.options.controlsExtra, "BigPlay")) {p.setControls(true);} p.setSpinner(false);
			if(p.vars.fixLoop) {p.onPlay();} else if(!p.options.autoFullscreen) {if(!document.mozFullScreen) {p.setScreen(false); p.vars.stoped = true;}}
		}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "error", f: function() {for(var key in this.error) {if(typeof(this.error[key]) === "function"){continue;} if(this.error[key] === this.error.code && key !== "code" && this.currentSrc !== "" && this.src !== location.href) {LBP.log(Date()+": LeanBack Media Player detected a \""+key+"\"", "warn");}}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		/* do: remove unfocused CSS class */
		e = {e: "playing", f: function() {/*p.options.focusFirstOnInit = false;*/ LBP.removeCssClass(vid, "h5_lb_unfocused");}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		/* do: add event because of Safari issue on source switching */
		e = {e: "timeupdate", f: function() {
			/* do: innerFct to check if content format is number */
			var isNumber = function(n) {return !isNaN(parseFloat(n)) && isFinite(n);}
			/* do: if source was switched and time (event) isn't yet currentTime we need to seek again (mainly a bug in Safari) */
			if(!!p.vars.fixLoadingSource.event && isNumber(p.vars.fixLoadingSource.event) && parseInt(p.vars.fixLoadingSource.event,10) !==  parseInt(p.html5Obj.currentTime,10)) {p.onSeeking(p.vars.fixLoadingSource.event);}
			else if(!!p.vars.fixLoadingSource.event && isNumber(p.vars.fixLoadingSource.event) && parseInt(p.vars.fixLoadingSource.event,10) ===  parseInt(p.html5Obj.currentTime,10)) {p.vars.fixLoadingSource = {};}
		}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);

		/* do: add html5 "on" attributes - prevent "onmousemove" on mobile or touch devices */
		if(!LBP.isMobile) {LBP.mergeObjs(p.html5Obj, {onmousemove: function() {if(LBP.$(vid).focused){p.setControlsTask();}}});}
		LBP.mergeObjs(p.html5Obj, {onclick: function() {if(LBP.isMobile && !p.vars.showControls) {p.setControlsTask(); return;} p.onPlay(); p.setControlsTask();}});
		LBP.fixTouch(p.html5Obj);
	}(this));
};
LBP.prototype.addControlsElements = function(vid, pid) {
	/* do: add extra controls */
	for(var i=0, cel=this.options.controlsExtra.length; i<cel; i++) {
		/* do: create function name to add control */
		var fi = "add"+this.options.controlsExtra[i]+"Control";
		/* do: call function to add control */
		if(typeof(this[fi]) === "function") {this[fi](vid, pid);}
	}

	/* do: create controls parent */
	LBP.createHTMLEl(pid, "div", {id: vid+"_controls", className: "h5_lb_controls", onselectstart: function() {return false;}});
	if(this.vars.audioPlayer) {LBP.addCssClass(vid+"_controls", "h5_lb_controls_audio");}
	if(this.vars.videoPlayer) {LBP.addCssClass(vid+"_controls", "elem_visibility_hidden");}

	/* do: if controls should be shown below video viewport add class */
	if(this.vars.videoPlayer && this.options.controlsBelow) {LBP.addCssClass(vid+"_controls", "h5_lb_controls_below");}

	/* do: add controls */
	for(var j=0, dcl=this.options.defaultControls.length; j<dcl; j++) {
		/* do: create function name to add control */
		var fj = "add"+this.options.defaultControls[j]+"Control";
		/* do: call function to add control */
		if(typeof(this[fj]) === "function") {this[fj](vid, pid);}
	}

	/* do: prevent on mobile or touch devices */
	if(!LBP.isMobile){
		(function(p) {
			/* do: add controls "on" attributes */
			LBP.mergeObjs(vid+"_controls", {onmouseover: function() {window.clearInterval(p.vars.mouseMoveProc);}, onmousemove: function() {window.clearInterval(p.vars.mouseMoveProc);}, onmouseout: function() {p.setControlsTask();}});
			LBP.fixTouch(vid+"_controls");
		}(this));
	}
};
/* fct: renew all controls of media element */
LBP.prototype.renewControlsElements = function() {
	var vid = this.options.vid, p = LBP.$(this.options.pid);

	/* do: get all elements of media parent */
	var c = p.childNodes;
	/* do: remove only controls elements from vid */
	for(var i=0, cl=c.length; i<cl; i++) {
		if(typeof(c[i]) !== "undefined" && typeof(c[i].id) !== "undefined" && c[i].id.length > vid.length && (c[i].id).indexOf(vid) !== -1) {
			(LBP.$(this.options.pid)).removeChild(LBP.$(c[i].id));
			i--;
		}
	}

	/* do: remove controls events to avoid problems */
	for(var j=0, cel=this.vars.controlsEvents.length; j<cel; j++) {
		var e = this.vars.controlsEvents[j]; LBP.removeEvent(this.html5Obj, e.e, e.f);
	}

	/* do: reset controls vars and reinitialize them */
	this.vars.controlsEvents = [];
	this.vars.hasControls = false;
	this.vars.afterInitialized = false;
	this.vars.loaded = 0;
	this.initializeControls();
};
/* fct: show/hide controls and embed-code elements */
LBP.prototype.setControls = function(b) {
	/* innerFct: to show+hide elements with controls bar */
	var setEl = function(e, b) {
		/* do: show elements with controls bar */
		for(var i=0, el=e.length; i<el; i++) {
			if(b) {LBP.showEl(e[i]);} else {LBP.hideEl(e[i]);}
		}
	};

	/* do: clear delayed hiding task */
	window.clearInterval(this.vars.mouseMoveProc);

	var vid = this.options.vid, elements = this.vars.setWithControls;
	if(b) {
		/* do: show controls */
		this.vars.showControls = b; LBP.showEl(vid+"_controls");

		/* do: show elements with controls */
		setEl(elements, !this.vars.stoped);
	} else if(!b && this.options.hideControls){
		/* do: hide controls */
		this.vars.showControls = b; LBP.hideEl(vid+"_controls");

		/* do: hide elements with controls */
		setEl(elements, b);
	}
};
/* fct: reset controls to redraw */
LBP.prototype.resetControls = function() {
	var vid = this.options.vid, pid = this.options.pid, t, show = true;

	/* do: show controls to get width of elements */
	window.clearInterval(this.vars.mouseMoveProc);

	/* do: search available reset-functions of active controls elements */
	for(var i=0, dcl=this.options.defaultControls.length; i<dcl; i++) {
		t = "reset"+this.options.defaultControls[i]+"Control";
		if(typeof(this[t]) === "function") {this[t](vid, pid);}
	}

	/* do: search available reset-functions of active extra controls elements */
	for(var j=0, cel=this.options.controlsExtra.length; j<cel; j++) {
		t = "reset"+this.options.controlsExtra[j]+"Control";
		if(typeof(this[t]) === "function") {this[t](vid, pid);}
	}

	/* do: show and recalculate controls */
	if(!this.vars.showControls){this.setControls(true); show = false;} this.initializeControls();

	/* do: break if not played and no big button shown */
	if(this.html5Obj.currentTime <= 0.01 && !LBP.inArray(this.options.controlsExtra, "BigPlay")) {return;}

	/* do: hide controls immediately if they were hidden else hide delayed */
	if(!show){this.setControls(false);} else {this.setControlsTask();}
};
/* fct: add element to default controls */
LBP.prototype.addToControls = function(cn) {
	var v = "", c = this.options.defaultControls;

	/* do: if last element is fullscreen, add cn before this to controls */
	if(LBP.inArray(c, "Fullscreen") && c[c.length-1] === "Fullscreen") {
		/* do: extract last (fullscreen) */
		v = c.slice((c.length-1));
		/* do: delete extracted and add new element */
		c.splice((c.length-1), 1, cn);
		/* do: add extracted elements */
		this.options.defaultControls = c.concat(v);
	}
	/* do: else add to end */
	else {this.options.defaultControls.push(cn);}
};
/* function - hide controls after x ms  (set through options) */
LBP.prototype.setControlsTask = function() {
	/* do: cancel if no html5 media object */
	if(!this.html5Obj) {return;}

	/* do: cancel if not a video player */
	if(!this.vars.videoPlayer) {return;}

	/* do: cancel if mouseAction false */
	if(!this.vars.mouseAction) {return;}

	/* do: cancel if stoped OR not played and no big button shown OR played to the end */
	if(this.vars.stoped || (parseFloat(this.html5Obj.currentTime) >= parseFloat(this.html5Obj.duration))) {return;}

	/* do: create vars and values if undefined */
	if(typeof(this.vars.mouseMoveProc) === "undefined") {this.vars.mouseMoveProc = null;}

	/* do: show controls */
	this.setControls(true);

	/* do: cancel if option is true and video is paused to not hide controls bar */
	if(!this.options.hideControlsOnPause && this.html5Obj.paused && (parseFloat(this.html5Obj.currentTime) >= 0.01 && parseFloat(this.html5Obj.currentTime) < parseFloat(this.html5Obj.duration))) {return;}

	/* do: hide controls delayed */
	if(this.options.hideControls) {
		window.clearInterval(this.vars.mouseMoveProc); this.vars.mouseMoveProc = null;
		(function(p) {
			p.vars.mouseMoveProc = window.setInterval(function() {
				/* do: hide controls */
				p.setControls(false);
				window.clearInterval(p.vars.mouseMoveProc);
				p.vars.mouseMoveProc = null;
			}, parseInt(p.options.hideControlsTimeout*1000, 10));
		}(this));
	}
};
/* fct: add play control */
LBP.prototype.addPlayControl = function(vid, pid) {
	var elId = vid+"_play_control";

	/* do: create play button */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_play_control", title: this.getTranslation("Play")});
	LBP.createHTMLEl(elId, "div", {id: vid+"_play_inner0"});

	(function(p) {
		/* do: add "on" attributes */
		LBP.mergeObjs(elId, {onclick: function() {p.onPlay();}});

		/* do: add html5 object events */
		var e = {};
		e = {e: "play", f: function() {if(LBP.inArray(p.options.defaultControls, "Pause")) {p.setPlayControl(false);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "pause", f: function() {if(LBP.inArray(p.options.defaultControls, "Play")) {p.setPlayControl(true);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
	}(this));
};
/* fct: add pause control */
LBP.prototype.addPauseControl = function(vid, pid) {
	var elId = vid+"_pause_control";

	/* do: create pause button */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_pause_control", title: this.getTranslation("Pause")});
	LBP.createHTMLEl(elId, "div", {id: vid+"_pause_inner0"});
	LBP.createHTMLEl(elId, "div", {id: vid+"_pause_inner1"});

	(function(p) {
		/* do: add "on" attributes */
		LBP.mergeObjs(elId, {onclick: function() {p.onPlay();}});

		/* do: add html5 object events */
		var e = {};
		e = {e: "play", f: function() {if(LBP.inArray(p.options.defaultControls, "Pause")) {p.setPauseControl(true);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "pause", f: function() {if(LBP.inArray(p.options.defaultControls, "Pause")) {p.setPauseControl(false);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
	}(this));
};
/* fct: add stop control */
LBP.prototype.addStopControl = function(vid, pid) {
	var elId = vid+"_stop_control";

	/* do: create stop button */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_stop_control", title: this.getTranslation("Stop")});
	LBP.createHTMLEl(elId, "div", {id: vid+"_stop_control_inner"});

	/* do: add "on" attributes */
	(function(p) {LBP.mergeObjs(elId, {onclick: function() {p.html5Obj.pause(); p.onStop();}});}(this));
};
/* fct: add progress control */
LBP.prototype.addProgressControl = function(vid, pid) {
	var elId = vid+"_progress_control", celId = vid+"_progress_bar", cssMobile = ((LBP.isMobile)?" elem_visibility_hidden":"");

	/* do: create progress bar elements */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_progress_control"});
	LBP.createHTMLEl(elId, "div", {id: celId+"_bg", className: "progress_bar_bg"});
	LBP.createHTMLEl(elId, "div", {id: celId+"_buffered", className: "progress_bar_buffered"});
	LBP.createHTMLEl(elId, "div", {id: celId+"_played", className: "progress_bar_played"});
	LBP.createHTMLEl(elId, "div", {id: celId+"_time", className: "progress_bar_time"});
	LBP.createHTMLEl(celId+"_time", "div", {id: celId+"_time_line", className: "progress_bar_time_line"+cssMobile});
	LBP.createHTMLEl(celId+"_time", "div", {id: celId+"_time_txt", className: "progress_bar_time_txt"+cssMobile});

	(function(p) {
		/* do: add "on" attributes */
		LBP.mergeObjs(elId, {
			onclick: function(e) {if(typeof(p.vars.subs) === "undefined") {p.vars.seeking.subs = !p.vars.hideSubtitle;} p.onSeeking(e);},
			onmouseover: function(e) {window.clearInterval(p.vars.buffering.moveProc); p.vars.buffering.moveProc = null; p.getProgressPosition(e);},
			onmousemove: function(e) {window.clearInterval(p.vars.buffering.moveProc); p.vars.buffering.moveProc = null; p.getProgressPosition(e);},
			onmouseout: function() {p.vars.buffering.moveProc = window.setInterval(function() {
				/* do: hide progress bar time delayed */
				LBP.hideEl(celId+"_time");
			}, 200);}
		});

		LBP.fixTouch(elId);

		/* do: add html5 object events */
		var e = {};
		e = {e: "progress", f: function(e) {if(p.vars.stoped) {return;} p.vars.loaded = 0; p.onProgress(e);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "timeupdate", f: function() {if(p.vars.stoped) {return;} p.drawProgressBar(); p.drawProgressTimer();}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
	}(this));
};
/* fct: add timer control */
LBP.prototype.addTimerControl = function(vid, pid) {
	var elId = vid+"_timer_control";

	/* do: create vars and values if undefined */
	if(typeof(this.vars.timerControl) === "undefined") {this.vars.timerControl = {proc: false};}

	/* do: create timer */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_timer_control"});
	LBP.createHTMLEl(elId, "div", {id: vid+"_timer_control_inner"});

	/* do: add "on" attributes */
	if(this.options.defaultTimerFormat === "PASSED_HOVER_REMAINING") {
		LBP.setCssStyle(elId, "width", "55px");
		(function(p) {
			LBP.mergeObjs(vid+"_timer_control_inner", {onmouseover: function() {p.vars.timerControl.proc = true; this.innerHTML = "-"+((isNaN(p.html5Obj.duration) || isNaN(p.html5Obj.currentTime)) ? "00:00" : LBP.parseTimer(parseInt(parseInt(p.html5Obj.duration, 10)-parseInt(p.html5Obj.currentTime, 10), 10)));}, onmouseout: function() {p.vars.timerControl.proc = false; this.innerHTML = LBP.parseTimer(parseInt(p.html5Obj.currentTime, 10));}});
		}(this));
	}
};
/* fct: add volume control */
LBP.prototype.addVolumeControl = function(vid, pid) {
	var elId = vid+"_volume_control";

	/* do: on iOS devices the volume is readonly so we return */
	if(LBP.isMobile) {return;}

	/* do: create mute elements */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_volume_control"});
	LBP.createHTMLEl(elId, "div", {id: vid+"_mute", className: "h5_lb_mute", title: this.getTranslation("Mute")});
	for(var m=0; m<7; m++) {
		LBP.createHTMLEl(vid+"_mute", "div", {id: vid+"_mute"+m});
	}

	/* do: prevent to little value for volumeRates; should be at least minimum of 3 */
	if(this.options.volumeRates < 3) {this.options.volumeRates = 3;}

	/* do: create volume holder */
	LBP.createHTMLEl(elId, "div", {id: vid+"_volume", className: "h5_lb_volume"});

	/* do: create volume elements add and handle events */
	(function(p) {
		var elId = vid+"_volume";

		/* do: create volume elements */
		for(var i=1; i<=p.options.volumeRates; i++) {LBP.createHTMLEl(elId, "div", {id: vid+"_vol_"+i, title: p.getTranslation("Volume", [i, p.options.volumeRates])});}

		/* do: handle volume sliding */
		var handleSlide = function(e) {if(p.vars.volumeSlide) {p.setVolume(parseInt(p.options.volumeRates*LBP.getPosition(e, elId)+1,10));}};
		LBP.mergeObjs(elId, {onmousedown: function() {p.vars.volumeSlide = true;}});
		LBP.mergeObjs(elId, {onmousemove: function(e) {handleSlide(e);}});
		LBP.mergeObjs(elId, {onmouseup: function(e) {handleSlide(e); p.vars.volumeSlide = false;}});
		var e = {e: "mouseout", f: function() {p.vars.volumeSlide = false;}};
		p.vars.controlsEvents.push(e); LBP.addEvent(vid, e.e, e.f);

		/* do: to change controls bar element also if using browsers player (mainly Safari < 5.1 in Fullscreen mode) */
		var e = {e: "volumechange", f: function() {var vm = p.vars.muted, hm = p.html5Obj.muted; if(hm && !vm) {p.html5Obj.volume = 0; p.vars.muted = hm;} else if(!hm && vm) {p.setVolume(p.options.defaultVolume); p.vars.muted = hm;} else if(vm === hm && parseFloat(Math.ceil(p.html5Obj.volume*10)/10).toFixed(2) !== parseFloat(p.options.defaultVolume/p.options.volumeRates).toFixed(2)) {p.setVolume(parseFloat(p.html5Obj.volume * p.options.volumeRates));}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
	}(this));
};
/* fct: add playback control */
LBP.prototype.addPlaybackControl = function(vid, pid) {
	/* do: create playbackRate element */
	if(this.options.showPlaybackRates && typeof(this.html5Obj.playbackRate) !== "undefined") {
		var elId = vid+"_playback_control", navId = vid+"_playback_nav";

		/* do: store playback rate */
		if(typeof(this.vars.playbackrate) === "undefined") {this.vars.playbackrate = this.html5Obj.playbackRate;}

		/* do create el */
		LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_playback_control", title: this.getTranslation("PlaybackRate_title")});
		LBP.createHTMLEl(elId, "div", {id: vid+"_playback_control_inner", innerHTML: this.getTranslation("PlaybackRate_inner")});
		LBP.createHTMLEl(vid+"_playback_control_inner", "div", {id: navId, className: "playback_nav"});

		LBP.addCssClass(navId, "elem_visible");
		this.options.playbackRates.reverse();
		(function(p) {
			for(var i = 0; i < p.options.playbackRates.length; i++) {LBP.createHTMLEl(navId, "div", {id: vid+"_pbr_"+i, innerHTML: p.options.playbackRates[i] + "x", title: p.getTranslation("PlaybackRate_to", p.options.playbackRates[i]+"x"), onclick: function() {p.setPlaybackRate(this.id);}});}
		}(this));
		LBP.setCssStyle(navId, "top", "-"+parseInt(LBP.$(navId).offsetHeight + LBP.getElemBorderWidth(navId).top + LBP.getElemBorderWidth(navId).bottom + LBP.getElemPaddingWidth(navId).top + LBP.getElemPaddingWidth(navId).bottom + LBP.getElemMarginWidth(navId).top + LBP.getElemMarginWidth(navId).bottom, 10) + "px");
		LBP.removeCssClass(navId, "elem_visible");

		/* do: add html5 object events */
		(function(p) {
			var e = {e: "ratechange", f: function() {if(p.html5Obj.playbackRate !== p.vars.playbackrate) {p.setPlaybackRate(p.html5Obj.playbackRate);}}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		}(this));
	}
};
/* fct: add subtitle control */
LBP.prototype.addSubtitlesControl = function(vid, pid) {
	/* do: try to get subtitles */
	if(typeof(this.vars.subs) === "undefined" && this.options.showSubtitles) {this.getSubs();}

	/* do: create subtitle element */
	if(this.options.showSubtitles && this.vars.subs && this.vars.activeSub !== null) {
		var elSub = vid+"_subtitle", elId = vid+"_subtitle_control";

		if(!this.options.initSubtitle) {this.vars.hideSubtitle = true;}

		/* do: prevent real fullscreen for safari < 5.1 */
		this.vars.preventRealFullscreen = !0;

		/* do: create el */
		LBP.createHTMLEl(pid, "div", {id: elSub, className: "h5_lb_subtitles"});
		LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_subtitle_control", title: this.getTranslation("Subtitle_title")});
		LBP.createHTMLEl(elId, "div", {id: elId+"_inner", innerHTML: this.getTranslation("Subtitle_inner")});

		/* do: handle controls-below for subtitles */
		var subsControlsBelow = function(p, el) {
			var cssSubBelow = "h5_lb_subtitles_controls_below";
			if(p.vars.fullscreen){LBP.removeCssClass(el, cssSubBelow);}else{LBP.addCssClass(el, cssSubBelow);}
		};
		if(this.options.controlsBelow) {(function(p, el) {LBP.postExtend("setScreen", function() {subsControlsBelow(p, el);}); subsControlsBelow(p, el);}(this, elSub));}

		/* do: draw subtitle menu items */
		if(this.options.showSubtitles && this.vars.activeSub !== null) {this.drawSubsMenu();}

		/* do: we need to add some source code to the (SHIFT) LEFT + RIGHT keyDown action for seeking+subtitles */
		var sbtn = 'this.vars.seeking.subs = !this.vars.hideSubtitle; this.setSubtitle(false);';
		this.vars.keyDownAction[37] += sbtn; this.vars.keyDownAction[39] += sbtn;

		(function(p) {
			/* do: create el */
			LBP.mergeObjs(elSub, {onmousemove: function() {if(LBP.$(vid).focused){p.setControlsTask();}}});

			/* do: add html5 object events */
			var e = {};
			e = {e: "seeked", f: function() {if(LBP.isIPad) {return;} p.setSubtitle(p.vars.seeking.subs);}}; // seems to make the subtitle set to false on iPad
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
			e = {e: "ended", f: function() {p.vars.activeSubId = -1; if(!p.vars.fixLoop) {p.setSubtitle(false);}}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
			e = {e: "timeupdate", f: function() {p.drawSubtitles();}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);

			/* do: add "on" attributes */
			LBP.mergeObjs(elSub, {onmouseup: function(e) {if((e.button||e.which) !== 1) {return;} p.onPlay(); p.setControlsTask();}});

			/* do: add "click" event to progress element */
			if(!!LBP.$(vid+"_progress_control")) {LBP.addEvent(LBP.$(vid+"_progress_control"), "click", function() {p.vars.seeking.subs = !p.vars.hideSubtitle; p.setSubtitle(false);});}
		}(this));
	}
};
/* fct: add sources control */
LBP.prototype.addSourcesControl = function(vid, pid) {
	/* do: break if safari and LBP embedded in CORS IFrame */
	if(LBP.isBrowser === "safari" && this.vars.isCorsIframe) {return;}

	/* do: create sources element */
	if(!LBP.isMobile && this.options.showSources) {
		/* do: trim sources */
		this.trimSources();

		/* do: break if sources < 2 */
		if(this.vars.playableSources.length < 2) {return;}

		/* do: create el */
		var elId = vid+"_sources_control";
		LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_sources_control", title: this.getTranslation("Sources_title")});
		LBP.createHTMLEl(elId, "div", {id: elId+"_inner", innerHTML: this.getTranslation("Sources_inner")});

		/* do: init sources if available */
		if(this.vars.playableSources.length > 1) {this.initializeSources();}
		/* do: hide sources element if length < 2 */
		if(this.vars.playableSources.length < 2) {LBP.hideEl(elId);}
	}
};
/* fct: add info control */
LBP.prototype.addInfoControl = function(vid, pid) {
	var elId = vid+"_info_control";

	/* do: create info el */
	LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_info_control", title: this.getTranslation("Info_title")});
	LBP.createHTMLEl(elId, "div", {id: elId+"_inner", innerHTML: "&nbsp;"});

	/* do: create vars and values if undefined */
	if(typeof(this.vars.infoControlEl) === "undefined") {this.vars.infoControlEl = [];}

	/* do: create vars and values if undefined */
	if(typeof(this.vars.infoControlActivated) === "undefined") {this.vars.infoControlActivated = false;}
	if(typeof(this.vars.infoControlActive) === "undefined") {this.vars.infoControlActive = 0;}

	var ext_length = 0;
	var exts_content = "<ul id=\""+vid+"_ext_ul"+ext_length+"\">";
	for(var ext in LBP.Exts.Name) {
		if(typeof(LBP.Exts.Name[ext]) === "function"){continue;}
		if(typeof(LBP.Exts.Info[ext]) !== "undefined" && !LBP.Exts.Info[ext]) {continue;}
		var e_name = ((LBP.Exts.Name[ext] !== "undefined") ? "<span style=\"font-weight: bold;\">"+LBP.Exts.Name[ext]+"</span>" : ext)+": ";
		var e_vers = ((LBP.Exts.Version[ext] !== "undefined") ? this.getTranslation("Info_content_version", LBP.Exts.Version[ext]) : "?");
		var e_user = ((LBP.Exts.User[ext] !== "undefined") ? LBP.Exts.User[ext] : "NaN");
		var e_url = ((LBP.Exts.URL[ext] !== "undefined") ? " by <a href=\""+LBP.Exts.URL[ext]+"\" onclick=\"window.open(this.href); return false;\" title=\""+this.getTranslation("Info_content_exts_url_visit")+"\">"+e_user+"</a>" : e_user);
		exts_content += "<li id=\""+vid+"_ext_li"+ext_length+"\">"+e_name+e_vers+e_url+"</li>";
		ext_length++;
	}
	exts_content += "</ul>";

	var content_default = this.getTranslation("Info_content_default_player", [this.options.infoUrl, this.version])+" &nbsp;&nbsp;&copy; Copyright 2010-2012, All Rights Reserved.";

	/* do: add extensions information if available */
	if(ext_length > 0) {content_default += this.getTranslation("Info_content_default_exts")+exts_content;}

	/* do: create info content */
	LBP.createHTMLEl(pid, "div", {id: elId+"_content", className: "h5_lb_info_content"});
	LBP.createHTMLEl(elId+"_content", "div", {id: elId+"_content_menu", className: "h5_lb_info_content_menu"});
	LBP.createHTMLEl(elId+"_content", "div", {id: elId+"_content_txt", className: "h5_lb_info_content_txt"});

	/* do: add default (about) info */
	LBP.createHTMLEl(elId+"_content_menu", "div", {id: elId+"_content_menu_default", className: "entry entry_active", innerHTML: this.getTranslation("Info_menu_about")});
	LBP.createHTMLEl(elId+"_content_txt", "div", {id: elId+"_content_menu_default_txt", className: "info_txt about_txt"});
	LBP.createHTMLEl(elId+"_content_menu_default_txt", "span", {id: elId+"_about_headline", className: "headline", innerHTML: this.getTranslation("About_headline")});
	LBP.createHTMLEl(elId+"_content_menu_default_txt", "div", {id: elId+"_about_txt", innerHTML: content_default});

	/* do: prepare open info-url on mobile devices - TODO: try to find issue why we can not add this at the start of function (IE9 mobile does not like it above) */
	if(LBP.isMobile && this.vars.audioPlayer) {
		(function(p) {
			LBP.mergeObjs(elId, {onclick: function() {window.open(p.options.infoUrl); return false;}});
			LBP.fixTouch(elId);
		}(this));
		return;
	}
	
	/* do: add shortcuts info */
	if(!LBP.isMobile) {
		LBP.createHTMLEl(elId+"_content_menu", "div", {id: elId+"_content_menu_shortcuts", className: "entry", innerHTML: this.getTranslation("Info_menu_shortcuts")});
		LBP.createHTMLEl(elId+"_content_txt", "div", {id: elId+"_content_menu_shortcuts_txt", className: "info_txt shortcuts_txt"});
		LBP.createHTMLEl(elId+"_content_menu_shortcuts_txt", "span", {id: elId+"_shortcuts_headline", className: "headline", innerHTML: this.getTranslation("Shortcuts_headline")});
		LBP.createHTMLEl(elId+"_content_menu_shortcuts_txt", "div", {id: elId+"_shortcuts_txt"});
		LBP.createHTMLEl(elId+"_shortcuts_txt", "div", {id: elId+"_shortcuts_txt_ul"});

		/* do: after setting up language we can set up the shortcut content */
		var sc = this.getTranslation("Shortcuts_content"), scv = this.getTranslation("Shortcuts_content_video"), sca = this.getTranslation("Shortcuts_content_audio");
		if(this.vars.videoPlayer && scv) {LBP.mergeObjs(sc, scv);}
		if(this.vars.audioPlayer && sca) {LBP.mergeObjs(sc, sca);}
		for(var i in sc) {
			if(typeof(sc[i]) === "function"){continue;}
			LBP.createHTMLEl(elId+"_shortcuts_txt_ul", "li", {id: elId+"_shortcuts_txt_ul_li", innerHTML: sc[i]});
		}
	}

	/* do: add close button */
	LBP.createHTMLEl(elId+"_content_txt", "button", {id: elId+"_content_btn", className: "btn h5_lb_info_content_btn", innerHTML: this.getTranslation("Btn_close"), title: this.getTranslation("Btn_close")});

	/* do: add "on" attributes */
	(function(p) {
		LBP.mergeObjs(elId, {onclick: function() {p.vars.infoControlActivated = !p.vars.infoControlActivated; if(LBP.getElemStyle(elId+"_content", "display") === "none") {var c = LBP.$(elId+"_content_menu").childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} LBP.addCssClass(elId+"_content_menu_default", "entry_active"); LBP.showEl(elId+"_content_menu_default_txt"); LBP.showEl(elId+"_content");} else {LBP.hideEl(elId+"_content");}}});
		LBP.mergeObjs(elId+"_content_menu_default", {onclick: function() {var c = LBP.$(elId+"_content_menu").childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} p.vars.infoControlActive = 0; LBP.addCssClass(this, "entry_active"); LBP.showEl(this.id+"_txt");}});
		LBP.mergeObjs(elId+"_content_menu_shortcuts", {onclick: function() {var c = LBP.$(elId+"_content_menu").childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} p.vars.infoControlActive = 1; LBP.addCssClass(this, "entry_active"); LBP.showEl(this.id+"_txt");}});
		LBP.mergeObjs(elId+"_content_btn", {onclick: function() {p.vars.infoControlActivated = !p.vars.infoControlActivated; p.vars.infoControlActive = 0; LBP.hideEl(elId+"_content");}});
	}(this));

	/* do: change keyboard shortcuts - SPACE (play) */
	this.vars.keyDownAction[32] = 'if(this.vars.infoControlActivated) {LBP.isMediaEvent = false; LBP.onKeyAction = true;} else {'+this.vars.keyDownAction[32]+'}';

	/* do: change keyboard shortcuts - LEFT (seek-) */
	this.vars.keyDownAction[37] = 'if(this.vars.infoControlActivated) {var c = LBP.$("'+elId+'_content_menu").childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} this.vars.infoControlActive = ((this.vars.infoControlActive > 0) ? parseInt(this.vars.infoControlActive - 1, 10) : parseInt(c.length - 1, 10)); var cid = c[this.vars.infoControlActive].id; LBP.addCssClass(cid, "entry_active"); LBP.showEl(cid+"_txt");} else {'+this.vars.keyDownAction[37]+'}';

	/* do: change keyboard shortcuts - RIGHT (seek+) */
	this.vars.keyDownAction[39] = 'if(this.vars.infoControlActivated) {var c = LBP.$("'+elId+'_content_menu").childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} this.vars.infoControlActive = ((this.vars.infoControlActive < parseInt(c.length-1, 10)) ? parseInt(this.vars.infoControlActive + 1, 10) : 0); var cid = c[this.vars.infoControlActive].id; LBP.addCssClass(cid, "entry_active"); LBP.showEl(cid+"_txt");} else {'+this.vars.keyDownAction[39]+'}';

	/* do: add keyboard shortcut - I (Information) */
	this.vars.keyDownAction[73] = 'this.vars.infoControlActivated = !this.vars.infoControlActivated; this.vars.infoControlActive = 0; if(LBP.getElemStyle("'+elId+'_content", "display") === "none") {var c = LBP.$("'+elId+'_content_menu").childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} LBP.addCssClass("'+elId+'_content_menu_default", "entry_active"); LBP.showEl("'+elId+'_content_menu_default_txt"); LBP.showEl("'+elId+'_content");} else {LBP.hideEl("'+elId+'_content");}';
};
LBP.prototype.addInfoEntry = function(vid, entry, innerHTML) {
	/* do: add entry to infoControl elements if not already */
	if(LBP.inArray(this.vars.infoControlEl, entry)) {return;}

	/* do: add entry to infoControl elements */
	this.vars.infoControlEl.push(entry);

	var elId = vid+"_info_control_content_menu";
	var celId = "_info_control_content";

	/* do: create info content */
	LBP.createHTMLEl(elId, "div", {id: elId+"_"+entry, className: "entry", innerHTML: this.getTranslation("Info_menu_"+entry)});
	LBP.createHTMLEl(vid+celId+"_txt", "div", {id: elId+"_"+entry+"_txt", className: "info_txt", innerHTML: innerHTML});

	/* do: add "on" attributes */
	(function(p) {
		var c_id = parseInt(LBP.$(elId).childNodes.length - 1, 10);
		LBP.mergeObjs(elId+"_"+entry, {onclick: function() {var c = LBP.$(elId).childNodes; for(var i=0; i<c.length; i++) {LBP.removeCssClass(c[i], "entry_active"); LBP.hideEl(c[i].id+"_txt");} p.vars.infoControlActive = c_id; LBP.addCssClass(this, "entry_active"); LBP.showEl(this.id+"_txt");}});
	}(this));
};
/* fct: add fullscreen control */
LBP.prototype.addFullscreenControl = function(vid, pid) {
	/* do: create fullscreen element if not autoFullscreen */
	if(!this.options.autoFullscreen) {
		var elId = vid+"_fullscreen_control";

		/* do: create fullscreen el */
		LBP.createHTMLEl(vid+"_controls", "div", {id: elId, className: "h5_lb_fullscreen_control", title: this.getTranslation("Fullscreen")});
		LBP.createHTMLEl(elId, "div", {id: elId+"_fs1", className: "h5_lb_fullscreen_control_fs1"});
		LBP.createHTMLEl(elId, "div", {id: elId+"_fs2", className: "h5_lb_fullscreen_control_fs2"});

		/* do: add "on" attributes */
		(function(p){LBP.mergeObjs(elId, {onclick: function() {p.setScreen(!p.vars.fullscreen);}}); LBP.fixTouch(elId);}(this));
	}
};
/* fct: add big play extra control */
LBP.prototype.addBigPlayControl = function(vid, pid) {
	var elId = vid+"_big_play_button";

	/* do: create big play button */
	LBP.createHTMLEl(pid, "div", {id: elId, className: "big_play_button", title: this.getTranslation("Play")});
	LBP.createHTMLEl(elId, "div", {id: elId+"_inner"});

	/* do: hide big play button on autoplay */
	if(this.vars.autoplay) {this.setBigPlayButton(false);}

	(function(p) {
		var cssId = vid+"_poster", cssFocus = "h5_lb_unfocused";
		/* do: add "on" attributes & add/remove unfocused CSS class */
		var e = {e: "click", f: function() {window.clearInterval(p.vars.mouseMoveProc); p.onPlay();}};
		p.vars.controlsEvents.push(e); LBP.addEvent(elId, e.e, e.f);
		var e = {e: "mousedown", f: function(e) {LBP.removeCssClass(vid, cssFocus); LBP.removeCssClass(cssId, cssFocus);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(elId, e.e, e.f);
		var e = {e: "mousemove", f: function() {if(!p.options.focusFirstOnInit) {LBP.removeCssClass(vid, cssFocus); LBP.removeCssClass(cssId, cssFocus);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(elId, e.e, e.f);
		var e = {e: "mouseout", f: function() {if(p.vars.stoped && !p.options.focusFirstOnInit){LBP.addCssClass(vid, cssFocus); LBP.addCssClass(cssId, cssFocus);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(elId, e.e, e.f);

		/* do: add html5 object events */
		var e = {e: "ended", f: function() {if(!p.vars.fixLoop) {p.setBigPlayButton(true);}}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
	}(this));
};
/* fct: add embed extra control */
LBP.prototype.addEmbedControl = function(vid, pid) {
	/* do: create embed element if not autoFullscreen */
	if(this.options.showEmbedCode && !this.options.autoFullscreen && !LBP.isMobile) {
		var elId = vid+"_embed";

		/* do: create embed el */
		LBP.createHTMLEl(pid, "div", {id: elId, className: "h5_lb_embed"});
		LBP.createHTMLEl(elId, "span", {id: elId+"_info", className: "h5_lb_embed_inner", innerHTML: this.getTranslation("EmbedInfo")});
		LBP.createHTMLEl(pid, "div", {id: elId+"_code", className: "h5_lb_embed_code"});
		/* do: create textarea */
		LBP.createHTMLEl(elId+"_code", "textarea", {id: elId+"_code_user", className: "h5_lb_embed_code_user"});
		/* do: create hint div */
		LBP.createHTMLEl(elId+"_code", "div", {id: elId+"_code_txt", className: "h5_lb_embed_code_txt", innerHTML: this.getTranslation("EmbedCodeTxt")});
		/* do: create close button */
		LBP.createHTMLEl(elId+"_code", "button", {id: elId+"_code_btn", className: "btn h5_lb_embed_code_btn", onclick: function() {LBP.hideEl(elId+"_code");}, name: this.getTranslation("Btn_close"), innerHTML: this.getTranslation("Btn_close"), title: this.getTranslation("Btn_close")});

		/* do: show+hide with controls bar */
		this.vars.setWithControls.push(elId);

		/* do: add "on" attributes */
		(function(p) {
			LBP.mergeObjs(elId, {onmousemove: function() {
				window.clearInterval(p.vars.embedPro);
				if(LBP.$(elId+"_video") === null) {
					while (LBP.$(elId).hasChildNodes()) { LBP.$(elId).removeChild(LBP.$(elId).firstChild); }
					LBP.createHTMLEl(elId, "div", {id: elId+"_video", className: "h5_lb_embed_inner", onclick: function() {p.createEmbedCode("video");}, innerHTML: p.getTranslation("EmbedVideo"), title: p.getTranslation("EmbedVideoTitle")});
					LBP.createHTMLEl(elId, "div", {id: elId+"_url", className: "h5_lb_embed_inner", onclick: function() {p.createEmbedCode("url");}, innerHTML: p.getTranslation("EmbedURL"), title: p.getTranslation("EmbedURLTitle")});
				}}});
			LBP.mergeObjs(elId, {onmouseout: function() {
					p.vars.embedPro = window.setInterval(function() {
						while (LBP.$(elId).hasChildNodes()) { LBP.$(elId).removeChild(LBP.$(elId).firstChild); }
						LBP.createHTMLEl(elId, "span", {id: elId+"_info", className: "h5_lb_embed_inner", innerHTML: p.getTranslation("EmbedInfo")});
						window.clearInterval(p.vars.embedPro);
					}, 2000);
				}});
		}(this));
	}
};
/* fct: add poster extra control */
LBP.prototype.addPosterControl = function(vid, pid) {
	/* if poster, create img element */
	if(this.html5Obj.poster && LBP.inArray(this.options.controlsExtra, "Poster")) {
		this.vars.poster = LBP.createHTMLEl(pid, "img", {id: vid+"_poster", className: "poster", alt: "poster", src: this.html5Obj.poster});

		/* do: add unfocused CSS class */
		LBP.addCssClass(vid+"_poster", "h5_lb_unfocused");

		/* set up poster */
		this.setPoster();

		(function(p) {
			/* do: add "on" attributes */
			LBP.mergeObjs(p.vars.poster, {onclick: function() {p.onPlay();}});

			/* do: add html5 object events */
			var e = {};
			e = {e: "seeked", f: function() {p.setPoster();}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
			e = {e: "ended", f: function() {p.setPoster();}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
			e = {e: "playing", f: function() {if(!p.vars.stoped) {LBP.removeCssClass(vid+"_poster", "h5_lb_unfocused"); LBP.hideEl(vid+"_poster");}}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
			e = {e: "timeupdate", f: function() {if(!p.vars.stoped) {LBP.removeCssClass(vid+"_poster", "h5_lb_unfocused"); LBP.hideEl(vid+"_poster");}}};
			p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		}(this));
	}
};
/* fct: add logo extra control */
LBP.prototype.addLogoControl = function(vid, pid) {if(this.options.logo) {LBP.createHTMLEl(pid, "img", {id: vid+"_logo", className: "logo", src: this.options.logo}); this.vars.setWithControls.push(vid+"_logo");}};
/* fct: add spinner extra control */
LBP.prototype.addSpinnerControl = function(vid, pid) {
	/* do: create vars and values if undefined */
	if(typeof(this.vars.spinner) === "undefined") {this.vars.spinner = {proc: null, task: null, alpha: 0};}

	/* do: create element */
	var elId = vid+"_spinner";
	LBP.createHTMLEl(pid, "div", {id: vid+"_spinner", className: "h5_lb_spinner"});

	/* do: add html5 object events */
	(function(p) {
		var e = {};
		e = {e: "play", f: function() {p.setSpinner(false);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "playing", f: function() {p.setSpinner(false);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "waiting", f: function() {p.setSpinner(true);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "seeking", f: function() {p.setSpinner(true);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
		e = {e: "seeked", f: function() {p.setSpinner(false);}};
		p.vars.controlsEvents.push(e); LBP.addEvent(p.html5Obj, e.e, e.f);
	}(this));

	/* do: set spinner hidden */
	this.setSpinner(false);
};
/* fct: initialize document events */
LBP.prototype.initializeDocumentEvents = function() {
	if(LBP.domEventsAdded) {
		/* do: init none-IFrame controls */
		this.initializeControls();
		return;
	}
	/** Global Events */
	/* do: something on key down, if media-object has focus */
	document.onkeydown = function(e) {
		if(LBP.playerFocused !== null) {
			try {
				var id0 = LBP.playerFocused.id, o0 = LBP.getPlayer(id0);
				if(LBP.$(id0).focused && o0) { o0.setControlsTask(); o0.onKeydown(e); }
			} catch(ex) {/*do nothing*/}
			return LBP.onKeyAction;
		}
	};
	/* do: something on key press */
	document.onkeypress = function(e) {if(LBP.playerFocused !== null) {return LBP.onKeyAction;}};
	/* do: something on key up */
	document.onkeyup = function(e) {
		if(LBP.playerFocused !== null) {
			try {
				var id1 = LBP.playerFocused.id, o1 = LBP.getPlayer(id1);
				if(LBP.$(id1).focused && o1) { o1.onKeyup(e); }
			} catch(ex) {/*do nothing*/}
		}
		var ev = (e || window.event); ev = (ev.target || ev.srcElement);
		var id2 = ((typeof(ev.getAttribute) !== "undefined" && ev.getAttribute("id") !== null) ? ev.getAttribute("id") : null);
		if(id2 === null && (typeof((ev.parentNode).getAttribute) !== "undefined" && (ev.parentNode).getAttribute("id") !== null)) { id2 = (ev.parentNode).getAttribute("id"); }
		var o2 = LBP.getPlayer(id2);
		if(!LBP.isMediaEvent && LBP.playerFocused !== null && o2) {
			var ovid = LBP.playerFocused.id;
			/* do: blur old and focus new player */
			if(ovid !== o2.options.vid) {LBP.focusPlayer(false, ovid); LBP.focusPlayer(true, o2.options.vid); o2.vars.keyHolderTAB = false;}
			/* do: blur old player if all player lost focus */
			else {LBP.focusPlayer(false, ovid);}
		} else if(LBP.playerFocused === null && o2) {
			/* do: focus player if no player focused */
			LBP.focusPlayer(true, o2.options.vid);
		} else if(!LBP.isMediaEvent && LBP.playerFocused !== null && typeof(o2) === "undefined") {
			/* do: blur old player if player lost focus to other page element */
			LBP.focusPlayer(false, LBP.playerFocused.id);
		} else {return LBP.onKeyAction;}
	};
	/* do: something if window size changed */
	this.vars.onresize = function() {if(typeof(LBP) === "undefined") {return;} if(LBP.playerFocused !== null) {var vid = LBP.playerFocused.id; var o = LBP.getPlayer(vid); if(LBP.$(vid).focused && o){o.setScreen(o.vars.fullscreen);}}};
	/* do: something if window.parent size changed (if player embedded in [CORS] IFrame) */
	try {
		(function(p) {
			LBP.addEvent(window, "message", function(e) {
				var data = JSON.parse(e.data)||false;
				if(!!data && typeof(data.action) !== "undefined" && data.action === "setScreen" && typeof(data.vid) !== "undefined" && data.vid === p.options.vid && typeof(data.value) !== "undefined") {
					p.setScreen(data.value, true, data.cors, data.bsXY);
				} else if(!!data && typeof(data.action) !== "undefined" && data.action === "setCorsStatus" && typeof(data.vid) !== "undefined" && data.vid === p.options.vid && typeof(data.cors) !== "undefined" && typeof(data.iframe) !== "undefined") {
					p.vars.isIframe = data.iframe;
					p.vars.isCorsIframe = data.cors;
					/* do: something if window.parent size changed */
					if(!data.cors && !data.iframe) {
						(function(fct) {
							LBP.addEvent(window.parent, "resize", fct);
							LBP.addEvent(window, "unload", function(){LBP.removeEvent(window.parent, "resize", fct);});
						}(p.vars.onresize));
					} else if(data.cors || data.iframe) {
						/* do: set css class for in-IFrame usage */
						LBP.addCssClass(document.body, "h5_lb_iframe");
						/* do: init IFrame controls */
						if(!p.vars.initialized) {
							p.initializeControls();
						}
					}
				}
			});
		}(this));
		/* do: if IFrame send postMessage to parent to get CORS status */
		var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : false);
		if(!!target) {target.postMessage(JSON.stringify({action: "getCorsStatus", vid: this.options.vid}), "*");}
	} catch(ex1) {}

	/* do: init none-IFrame controls */
	this.initializeControls();
	
	/* do: something if window size changed (also if player embedded in IFrame) */
	try {(function(fct) {LBP.addEvent(window, "resize", fct);}(this.vars.onresize));} catch(ex) {return;}
	
	/* do: something on onmouseup+mousedown, set or remove focus on element */
	document.onmouseup = document.onmousedown = function(e) {
		var e1 = (e || window.event), e2 = (e1.target || e1.srcElement);
		var id4 = ((typeof(e2.getAttribute) !== "undefined" && e2.getAttribute("id") !== null) ? e2.getAttribute("id") : null);
		if(id4 === null && (typeof((e2.parentNode).getAttribute) !== "undefined" && (e2.parentNode).getAttribute("id") !== null)) { id4 = (e2.parentNode).getAttribute("id"); }
		var o4 = LBP.getPlayer(id4);
		if(id4 !== null && o4) {
			if(LBP.playerFocused !== null) {
				var ovid = LBP.playerFocused.id;
				/* do: only if old focused not new focused */
				if(ovid !== o4.options.vid) {
					/* do: focus new player */
					LBP.focusPlayer(true, o4.options.vid);
					/* do: blur old player */
					LBP.focusPlayer(false, ovid);
				}
			}
			/* do: focus player if no player focused */
			else {LBP.focusPlayer(true, o4.options.vid);}
		} else {
			/* do: blur old player */
			if(LBP.playerFocused !== null) {var id5 = LBP.playerFocused.id; var o5 = LBP.getPlayer(id5); LBP.focusPlayer(false, id5);}
		}
	};
	/* do: something on ondragstart */
	document.ondragstart = function(e) {
		var e3 = (e || window.event), e4 = (e3.target || e3.srcElement);
		var id6 = ((typeof(e4.getAttribute) !== "undefined" && e4.getAttribute("id") !== null) ? e4.getAttribute("id") : null);
		if(id6 === null && (typeof((e4.parentNode).getAttribute) !== "undefined" && (e4.parentNode).getAttribute("id") !== null)) { id6 = (e4.parentNode).getAttribute("id"); }
		var o6 = LBP.getPlayer(id6);
		if(id6 !== null && o6) {
			return false;
		}
	};
	/* do: set true to prevent adding dom events with every player again */
	LBP.domEventsAdded = true;
};
/* do: trim playableSrcs array to reduce buffering time on initialization */
LBP.prototype.trimSources = function() {
	var srcs = this.vars.playableSources;

	/* do: return if no srcs or already prebuffered to not change something */
	if(typeof(srcs[0]) === "undefined" || typeof(srcs[0].res) !== "undefined") {return;}

	/* do: prepare and count types/extensions */
	var k = {};
	for(var i=0; i<srcs.length; i++) {
		/* do: check if type available */
		srcs[i].type = ((typeof(srcs[i].type) !== "undefined") ? srcs[i].type : ((/\.(mp4|webm|og[g|v])/i.test(srcs[i].src)) ? RegExp.$1 : null));
		if(typeof(k[srcs[i].type]) === "undefined" || isNaN(k[srcs[i].type])) {k[srcs[i].type]=0}; k[srcs[i].type]++;
	}

	/* do: find most often srcs by type */
	var l = {t: null, c: 0};
	for(var j in k) {if(l.t === null || (l.t !== j && l.c < k[j])) {l = {t: j, c: k[j]};}}
	
	/* do: trim srcs array now */
	var m = [];
	for(var i=0; i<srcs.length; i++) {if(srcs[i].type === l.t) {m.push(srcs[i]);}}

	/* do: overwrite playable source(s) */
	this.vars.playableSrc = m[0].src; this.vars.playableSources = m;
};
/* fct: initialize multiple sources, determine metadata (width, height) */
LBP.prototype.initializeSources = function(j) {
	var i = ((j) ? parseInt(parseInt(j, 10)+1, 10) : 0);

	/* do: set spinner visible */
	this.setSpinner(true);

	/* do: set initialize sources not ready only on first source */
	if(i === 0) {this.vars.playerReady.push('initializeSources');}

	/* do: not load sources again if res+type known (eg. from localStorage ext.) */
	if(i === 0) {
		var check = true;
		for(var c=0, pl=this.vars.playableSources.length; c<pl; c++){
			if(typeof(this.vars.playableSources[c].res) === "undefined" || typeof(this.vars.playableSources[c].type) === "undefined") {check = false;}
		}
		if(check) {this.fixSourcesMenu(); return;}
	}

	this.vars.playableSources[i].video = document.createElement("video");
	var d = new Date(), id = parseInt(d.getTime()*Math.random()*100, 10); // try random id to overwrite cache, hope this works
	LBP.mergeObjs(this.vars.playableSources[i].video, {id: "init"+id+"_"+i, src: this.vars.playableSources[i].src});
	try{this.vars.playableSources[i].video.load();}catch(ex1){}

	/* do: on loadedmetadata store dimensions */
	(function(p) {
		LBP.addEvent(p.vars.playableSources[i].video, "loadedmetadata", function() {
			var id = (/[^_]+$/.exec(this.id))[0];
			p.vars.playableSources[id].res = ((p.vars.playableSources[id].video.videoHeight >= 1080) ? 1080 : ((p.vars.playableSources[id].video.videoHeight >= 720) ? 720 : ((p.vars.playableSources[id].video.videoHeight >= 480) ? 480 : ((p.vars.playableSources[id].video.videoHeight >= 360) ? 360 : ((p.vars.playableSources[id].video.videoHeight >= 235) ? 240 : ((p.vars.playableSources[id].video.videoHeight >= 175) ? 180 : "SD"))))));
			p.vars.playableSources[id].type = ((p.vars.playableSources[id].video.videoHeight >= 1080) ? "HD" : ((p.vars.playableSources[id].video.videoHeight >= 720) ? "HD" : ((p.vars.playableSources[id].video.videoHeight >= 480) ? "SD" : ((p.vars.playableSources[id].video.videoHeight >= 360) ? "SD" : ""))));
			LBP.mergeObjs(this, {src: ""}); try{this.load();}catch(ex2){}

			var r = 0;
			for(var i=0, pl=p.vars.playableSources.length; i<pl; i++){if(typeof p.vars.playableSources[i].res !== "undefined" && typeof p.vars.playableSources[i].type !== "undefined"){if(p.vars.playableSources[i].video !== null) {p.vars.playableSources[i].video = null;} r++;}}
			if(r === p.vars.playableSources.length) {p.fixSourcesMenu();} else if(parseInt(id, 10) < p.vars.playableSources.length) {p.initializeSources(id);}
		});
	}(this));
};
/* fct: set sources menu text */
LBP.prototype.setSourcesMenuTxt = function(id) {
	/* do: create vars and values if undefined */
	if(typeof(this.vars.sourcesProc) === "undefined") {this.vars.sourcesProc = null;}

	/* do: check if player ready to play */
	if(this.vars.playerReady.length > 0) {
		/* do: show spinner */
		this.setSpinner(true);
		/* do: set timeout to check again */
		window.clearTimeout(this.vars.sourcesProc); (function(p) {p.vars.sourcesProc = window.setTimeout(function() {p.setSourcesMenuTxt(id);}, 850);}(this)); return;
	}

	/* do: hide spinner */
	window.clearTimeout(this.vars.sourcesProc);

	if(isNaN(id)) {
		for(var i=0, pl=this.vars.playableSources.length; i<pl; i++) {if(this.vars.playableSources[i].src === id) {id = i; break;}}
	}

	LBP.$(this.options.vid+"_sources_control_inner").childNodes[0].textContent=((!isNaN(this.vars.playableSources[id].res)) ? this.vars.playableSources[id].res+"p" : this.vars.playableSources[id].res);
};
/* fct: reset sources menu items */
LBP.prototype.resetSourcesMenu = function() {
	var navId = this.options.vid+"_sources_nav";

	/* do: clean up sources popup */
	if(LBP.$(navId)){while(LBP.$(navId).hasChildNodes()) {LBP.$(navId).removeChild(LBP.$(navId).firstChild);}}
};
/* fct: draw sources menu items */
LBP.prototype.drawSourcesMenu = function(id) {
	var elId = this.options.vid+"_sources", navId = elId+"_nav", innerEl = elId+"_control_inner";

	/* do: return if no sources-control element or has no childnodes */
	if(!LBP.$(innerEl) || !LBP.$(innerEl).childNodes) {return;}

	/* do: create sources popup only one time */
	if(!LBP.$(navId)) {LBP.createHTMLEl(innerEl, "div", {id: navId, className: "sources_nav"});}

	/* do: create element */
	var txt = ((!isNaN(this.vars.playableSources[id].res)) ? this.vars.playableSources[id].res+"p" : this.vars.playableSources[id].res);
	LBP.createHTMLEl(navId, "div", {id: elId+"_"+id, innerHTML: txt});

	if(this.vars.playableSources[id].type !== null) {LBP.createHTMLEl(elId+"_"+id, "span", {id: elId+"_sup_"+id, innerHTML: " <span>"+this.vars.playableSources[id].type+"</span>"});}

	(function(p) {
		LBP.mergeObjs(elId+"_"+id, {title: p.getTranslation("Sources_to", txt), onclick: function() {if(p.vars.stoped) {return;} p.vars.seeking.subs = !p.vars.hideSubtitle; p.setSubtitle(false); p.fixLoadingSource("onSrcSwitch", null, p.vars.playableSources[id].src); p.setSourcesMenuTxt(id);}});
	}(this));

	LBP.setCssStyle(navId, "top", "-"+parseInt((((LBP.$(navId) && LBP.$(navId).childNodes)?LBP.$(navId).childNodes.length:0)*(LBP.getElemStyle(elId+"_"+id, "height")+LBP.getElemBorderWidth(elId+"_"+id).top + LBP.getElemBorderWidth(elId+"_"+id).bottom+LBP.getElemPaddingWidth(elId+"_"+id).top + LBP.getElemPaddingWidth(elId+"_"+id).bottom))+5, 10)+"px");

	/* do: active source quality on controls button */
	if(this.vars.playableSources[id].src === this.vars.playableSrc) {LBP.$(innerEl).childNodes[0].textContent = txt;}
};
/* fct: fix sources menu */
LBP.prototype.fixSourcesMenu = function() {
	var s = this.vars.playableSources, sns = [], t = [];

	/* do: reset sources popup */
	this.resetSourcesMenu();

	/* do: sort sources from high to low resolution (eg. 720p, 360p, 480p => 720p, 480p, 360p) */
	var Numsort = function(a, b) {return b.res - a.res;}
	for(var i=0, sl=s.length; i<sl; i++) {if(!LBP.inArray(t, s[i].res)) {t.push(s[i].res); sns.push(s[i]);}}

	/* do: overwrite sources array with sorted sources */
	this.vars.playableSources = sns.sort(Numsort); s = this.vars.playableSources;

	/* do: draw sources menu, add elements to controls popup */
	for(var i=0, sl=s.length; i<sl; i++) {
		if(typeof s[i].res !== "undefined"  && typeof s[i].type !== "undefined") {this.drawSourcesMenu(i);}
	}

	/* do: set initialize sources ready */
	this.vars.playerReady.pop(); this.vars.sourcesReady = true;

	/* do: hide spinner if player ready */
	if(this.vars.playerReady.length === 0) {this.setSpinner(false);}
};
/* fct: fix issue with "preload" attribute that most browsers have */
LBP.prototype.fixPreload = function(){
	var preload = this.vars.fixPreload, ff3 = (LBP.isBrowser === "firefox3")?!0:!1;

	/* fix "preload" attribute in firefox 3.x */
	if(ff3 && preload === "auto") {this.html5Obj.autobuffer = preload;}

	/* do: fix buffering in firefox 3.x - also needed in IE9 to overwrite src at runtime */
	switch(preload) {
		case "none":
		case "metadata": LBP.mergeObjs(this.html5Obj, {src: ((ff3)?"":this.vars.playableSrc)}); if(this.vars.isIE || ff3) {try{this.html5Obj.load();}catch(ex1){}} break;
		default: LBP.mergeObjs(this.html5Obj, {src: this.vars.playableSrc}); try{this.html5Obj.load();} catch(ex2) {} this.vars.loaded = 0; break;
	}
};
/* fct: force source loading until canplay event fired */
LBP.prototype.fixLoadingSource = function(a, e, src) {
	/* do: overwrite fixLoadingSource object */
	this.vars.fixLoadingSource = {};

	/* do: set up fixLoadingSource var */
	(function(p) {LBP.mergeObjs(p.vars.fixLoadingSource, {action: a, event: e, fct: function() {p.onCanPlay();}});}(this));

	/* do: show spinner */
	this.setSpinner(true);

	/* do: set loading source not ready */
	this.vars.playerReady.push('loadingSource');

	/* do: store pause status */
	if(!this.html5Obj.paused){this.vars.initSources.playing=true; this.html5Obj.pause();}

	/* do: force loading */
	if(src !== null) {if(e === null) {LBP.mergeObjs(this.vars.fixLoadingSource, {event:parseFloat(this.html5Obj.currentTime)});} LBP.mergeObjs(this.html5Obj, {src: src}); this.vars.playableSrc = src;}
	else if(this.html5Obj.src === "" || this.html5Obj.src === location.href) {LBP.mergeObjs(this.html5Obj, {src: this.vars.playableSrc});}

	try{this.html5Obj.load();}catch(ex){}

	/* do: wait until media is ready to play */
	if(this.vars.isIE) {LBP.addEvent(this.html5Obj, "canplay", this.vars.fixLoadingSource.fct);}
	else {LBP.addEvent(this.html5Obj, "loadeddata", this.vars.fixLoadingSource.fct);}
};
/* fct: onCanPlay */
LBP.prototype.onCanPlay = function() {
	/* do: remove event now */
	if(this.vars.isIE) {LBP.removeEvent(this.html5Obj, "canplay", this.vars.fixLoadingSource.fct);}
	else {LBP.removeEvent(this.html5Obj, "loadeddata", this.vars.fixLoadingSource.fct);}

	/* innerFct: do after this fct */
	var doAfter = function(p) {
		/* do: set loading source ready */
		p.vars.playerReady.pop();
		/* do: hide spinner if player ready */
		// if(p.vars.playerReady.length === 0) {p.setSpinner(false);}
		/* do: clear fixLoadingSource */
		// p.vars.fixLoadingSource = {};
	};

	/* do: call functions depending on action */
	(function(p) {
		switch(p.vars.fixLoadingSource.action) {
			case "onPlay": window.setTimeout(function() {p.onPlay(); doAfter(p);}, 225); break;
			case "onSeeking": window.setTimeout(function() {p.onSeeking(p.vars.fixLoadingSource.event); doAfter(p);}, 225); break;
			case "seekTo": window.setTimeout(function() {if(p.vars.initSources.playing) {p.vars.seeking.playing=true; p.vars.initSources.playing=false;} p.seekTo(p.vars.fixLoadingSource.event.s, p.vars.fixLoadingSource.event.sec); doAfter(p);}, 225); break;
			case "onSrcSwitch": window.setTimeout(function() {if(p.vars.initSources.playing) {p.vars.seeking.playing=true; p.vars.initSources.playing=false;} var t = p.vars.fixLoadingSource.event; doAfter(p); p.seekTo("+", t);}, 225); break;
		}
	}(this));
};
/* fct: if play-/pause-button clicked */
LBP.prototype.onPlay = function() {
	var vid = this.options.vid;

	/* do: create onPlay vars and values if undefined */
	if(typeof(this.vars.onPlayProc) === "undefined") {this.vars.onPlayProc = null;}

	/* do: check if player ready to play */
	if(this.vars.playerReady.length > 0) {
		/* do: show spinner */
		this.setSpinner(true);
		/* do: set timeout to check again */
		window.clearTimeout(this.vars.onPlayProc); (function(p) {p.vars.onPlayProc = window.setTimeout(function() {p.onPlay();}, 350);}(this)); return;
	}

	/* do: clear timeout */
	window.clearTimeout(this.vars.onPlayProc);

	/* do: fix source loading */
	if((this.vars.stoped || this.html5Obj.currentTime <= 0) && !(LBP.canPlayType[LBP.isBrowser]).test(this.html5Obj.currentSrc)) {LBP.hideEl(vid+"_big_play_button"); this.fixLoadingSource("onPlay", null, null); return;}

	/* do: on stop and on POS1-key */
	if(parseFloat(this.html5Obj.currentTime) >= parseFloat(this.html5Obj.duration) && this.html5Obj.duration > 0) {this.html5Obj.currentTime = 0.00;}

	/* do: play or pause */
	if(this.html5Obj.paused) {this.setBigPlayButton(false); LBP.hideEl(vid+"_poster"); this.setControls(true); this.html5Obj.play();}
	else {this.html5Obj.pause(); window.clearInterval(this.vars.mouseMoveProc);}

	/* do: call buffering process if progress event does not fire (eg. already media cached) */
	this.onBuffering();

	/* do: reset stoped var on play/pause */
	this.vars.stoped = false;

	/* do: call controls task to hide delayed */
	(function(p) {p.vars.mouseMoveProc = null; window.setTimeout(function() {p.setControlsTask();}, p.options.hideControlsTimeout)}(this));
};
/* fct: if stop-button/key clicked */
LBP.prototype.onStop = function() {
	var vid = this.options.vid;
	/* do: resize screen */
	this.setScreen(false);

	/* do: reset time and stop media*/
	if(parseFloat(this.html5Obj.currentTime) > 0) {this.vars.stoped = true; this.html5Obj.currentTime = 0.00; this.html5Obj.pause(); this.drawProgressTimer();}

	/* do: reset played progress control; hide controls bar */
	LBP.setCssStyle(vid+"_progress_bar_played", "width", 0);

	/* do: show big play button */
	this.setBigPlayButton(true);
};
/* fct: if browser supports progress-event (Firefox) */
LBP.prototype.onProgress = function(e) {
	if(!this.html5Obj) {return;}
	if(this.html5Obj.buffered) {this.onBuffering(); return;}
	if(e.total > 0) {this.vars.loaded = e.loaded/e.total; this.drawProgressBar();}
};
/* fct: browsers not support the progress-event (Opera, Google Chrome, Safari) */
LBP.prototype.onBuffering = function() {
	window.clearInterval(this.vars.buffering.proc); this.vars.buffering.proc = null;

	/* do: buffer media object is able to do */
	if(this.html5Obj && this.html5Obj.buffered && this.vars.loaded < 1) {
		if((LBP.canPlayType[LBP.isBrowser]).test(this.html5Obj.currentSrc)) {
			/* do: catch errors of type: INDEX_SIZE_ERR */
			try {
				/* do: find and store changes in buffering - fix for FF4+ not working well (buffered.length > 2 if seeking to unbufferung position)*/
				var bl = this.html5Obj.buffered.length; this.vars.buffering.endChanged = -1;
				for(var i=0; i<bl; i++) {
					if(this.vars.buffering.end[i] !== this.html5Obj.buffered.end(i) && this.vars.buffering.endChanged < 0) {this.vars.buffering.endChanged = i;}
					this.vars.buffering.end[i] = this.html5Obj.buffered.end(i);
				}

				/* do: prevent another INDEX_SIZE_ERR if this.vars.buffering.endChanged not changed to >= 0 */
				if(this.vars.buffering.endChanged < 0) {this.vars.buffering.endChanged = (bl < 2)?0:1;}

				/* do: calculate the new "loaded" var */
				var nl = parseFloat(this.html5Obj.buffered.end(this.vars.buffering.endChanged)/this.html5Obj.duration);

				/* do: calculate the progress bar */
				if(this.vars.loaded < nl && this.html5Obj.buffered.end(this.vars.buffering.endChanged) <= this.html5Obj.duration) {
					this.vars.loaded = nl;
					if(nl < 1) {(function(p) {p.vars.buffering.proc = window.setInterval(function() {p.onBuffering();}, 750);}(this));}
					else if(nl === 1) {window.clearInterval(this.vars.buffering.proc); this.vars.buffering.proc = null;}

					/* do: (re)draw progress bar now */
					this.drawProgressBar();
				}
			} catch(ex) {return;}
		} else {return;}
    } else {
		/* do: (re)draw progress bar now */
		this.drawProgressBar();
	}
};
/* fct: handle buffering on focus lost/re-focused (experimental) */
LBP.prototype.handleBufferingOnFocus = function(b) {
	var vid = this.options.vid;

	/* do: return if not a video player */
	if((this.html5Obj.currentTime || this.vars.buffering.storeTime) <= 0.01) {return;}
	if(b) {
		/* do: handle on re-focused */
		this.vars.stoped = false;
		if(this.currentSrc === "" || this.src === location.href) {LBP.mergeObjs(this.html5Obj, {src: this.vars.playableSrc}); try{this.html5Obj.load();} catch(ex2) {}}
		this.onSeeking(this.vars.buffering.storeTime);
		if(this.vars.seeking.playing) {this.onPlay(); this.vars.seeking.playing = false;}
		this.vars.buffering.storeTime = 0;
	} else {
		/* do: handle on focus lost */
		this.vars.stoped = true; this.vars.buffering.storeTime = this.html5Obj.currentTime;
		if(this.vars.loaded < 1) {LBP.mergeObjs(this.html5Obj, {src: ""}); try{this.html5Obj.load();} catch(ex2) {}}
	}
};
/* fct: helper for seeking, sets also the timer-bar to the progress-bar */
LBP.prototype.getProgressPosition = function(e) {
	if(this.vars.stoped) {return;}

	var elId = this.options.vid+"_progress_bar";
	/* do: calculate mousedown-position */
	var pos = LBP.getPosition(e, elId+"_bg");

	/* do: timer-bar in progress-bar */
	if(!isNaN(this.html5Obj.duration) && isFinite(this.html5Obj.duration) && parseFloat(this.html5Obj.duration) > 0.00) {
		LBP.$(elId+"_time_txt").innerHTML = LBP.parseTimer(parseFloat(this.html5Obj.duration * pos));
		LBP.setCssStyle(elId+"_time_txt", "left", parseInt((LBP.getElemStyle(elId+"_bg", "width")*pos)-18, 10)+"px");
		LBP.setCssStyle(elId+"_time_line", "left", parseInt((LBP.getElemStyle(elId+"_bg", "width")*pos)-2, 10)+"px");
		LBP.showEl(elId+"_time");
	} else {LBP.hideEl(elId+"_time");}
};
/* fct: if seeking within src */
LBP.prototype.onSeeking = function(e) {
	var elId = this.options.vid+"_progress_bar", t = e;

	/* do: return if not played or just ended */
	if(this.vars.stoped) {return;}

	/* do: if currentSrc not playable fixLoadingSource */
	if(!(LBP.canPlayType[LBP.isBrowser]).test(this.html5Obj.currentSrc)) {this.setBigPlayButton(false); this.fixLoadingSource("onSeeking", e, null); return;}

	/* do: calculate seeking position */
	if(!!e.clientX) {
		var o = LBP.$(elId+"_bg"); var pLeft = o.offsetLeft;
		while(o = o.offsetParent) {pLeft += o.offsetLeft;}
		var pos = Math.max(0, Math.min(1, (e.clientX - pLeft + 1) / LBP.$(elId+"_bg").offsetWidth));
		t = parseFloat(this.html5Obj.duration * pos);
	}

	/* do: overwrite currentTime with time to seek to and catch errors of type: INDEX_SIZE_ERR (error here mainly in Safari) */
	try {this.html5Obj.currentTime = t; this.onBuffering();}
	catch(ex) {
		/* do: store media paused value */
		if(!this.html5Obj.paused) {this.vars.seeking.playing=true; this.html5Obj.pause();}
		/* do: seek(to) until media is ready */
		var s = ((t > this.html5Obj.currentTime) ? "+" : "-"); this.seekTo(s, t);
	}
};
/* fct: seek with jump (+/-) x sec./perc. */
LBP.prototype.seekTo = function(s, sec) {
	/* do: return if not played or just ended */
	if(this.vars.stoped) {return;}

	/* do: store media paused value */
	if(!this.html5Obj.paused) {this.vars.seeking.playing=true; this.html5Obj.pause();}

	/* do: show spinner */
	this.setSpinner(true);

	/* do: calculate seek to in sec or percent */
	var seek = ((typeof(sec) !== "boolean") ? parseFloat(sec) : ((sec) ? this.options.seekSkipSec : parseFloat((this.html5Obj.duration*(this.options.seekSkipPerc/100)))));

	/* do: overwrite currentTime with time to seek to and catch errors of type: INDEX_SIZE_ERR (error here mainly in Safari) */
	try{if((s === "-") && this.html5Obj.currentTime === 0 && seek === 0) {this.onStop();} else {var t = this.html5Obj.currentTime; this.html5Obj.currentTime = ((s === "+") ? ((parseFloat(t + seek) < this.html5Obj.duration) ? parseFloat(t + seek) : t) : Math.abs(parseFloat(t - seek)));} if(this.vars.seeking.playing) {this.onPlay(); this.vars.seeking.playing = false;} this.onBuffering();} catch(ex) {(function(p) {window.setTimeout(function() {p.seekTo(s, sec);}, 550);}(this));}
};
/* fct: draw fullscreen-icon */
LBP.prototype.drawFullscreenIcon = function() {
	/* do: cancel if audio player */
	if(!this.vars.videoPlayer || !LBP.inArray(this.options.defaultControls, "Fullscreen")) {return;}

	if(!this.options.autoFullscreen) {
		var elId = this.options.vid+"_fullscreen_control";
		/* do: show icon depending on fullscreen status */
		if(this.vars.fullscreen) {
			LBP.hideEl(elId+"_fs1"); LBP.showEl(elId+"_fs2");
			if(!LBP.isMobile) {LBP.mergeObjs(elId, {onmouseover: function() {LBP.showEl(elId+"_fs1"); LBP.hideEl(elId+"_fs2");}, onmouseout: function() {LBP.hideEl(elId+"_fs1"); LBP.showEl(elId+"_fs2");}});}
			LBP.$(elId).setAttribute("title", this.getTranslation("Smallscreen"));
		} else {
			LBP.showEl(elId+"_fs1"); LBP.hideEl(elId+"_fs2");
			if(!LBP.isMobile) {LBP.mergeObjs(elId, {onmouseover: function() {LBP.hideEl(elId+"_fs1"); LBP.showEl(elId+"_fs2");}, onmouseout: function() {LBP.showEl(elId+"_fs1"); LBP.hideEl(elId+"_fs2");}});}
			LBP.$(elId).setAttribute("title", this.getTranslation("Fullscreen"));
		}
	}
};
/* fct: draw progress-bar */
LBP.prototype.drawProgressBar = function() {
	var vid = this.options.vid;

	/* do: cancel if stoped */
	if(this.vars.stoped) {return;}

	/* do: calculate and set progress bar "buffered" */
	if(this.vars.loaded > 0.98) {this.vars.loaded = 1;} // need to fake it, sometimes on replay the buffering will lose pixel
	LBP.setCssStyle(vid+"_progress_bar_buffered", "width", parseInt(LBP.getElemStyle(vid+"_progress_bar_bg", "width")*parseFloat(this.vars.loaded), 10)+"px");
	/* do: calculate and set progress bar "played" */
	LBP.setCssStyle(vid+"_progress_bar_played", "width", parseInt(LBP.getElemStyle(vid+"_progress_bar_bg", "width")*(parseFloat(this.html5Obj.currentTime)/parseFloat(this.html5Obj.duration)), 10)+"px");
};
/* fct: draw progress-timer */
LBP.prototype.drawProgressTimer = function() {
	/* do: get timer element */
	var timer = LBP.$(this.options.vid+"_timer_control_inner");

	/* do: return if no timer added to controls */
	if(!LBP.inArray(this.options.defaultControls, "Timer") || !timer) {return;}

	/* do: calculate media times */
	var current = parseInt(this.html5Obj.currentTime, 10);
	var duration = parseInt(this.html5Obj.duration, 10);
	var passed = parseInt(duration - current, 10);

	/* do: create timer output depending on format */
	switch(this.options.defaultTimerFormat) {
		case "PASSED_REMAINING":
			timer.innerHTML = ((parseFloat(this.html5Obj.currentTime).toFixed(2) === 0.00) ? "00:00" : LBP.parseTimer(current) + " / " + "-" + ((isNaN(this.html5Obj.duration)) ? "00:00" : LBP.parseTimer(passed)));
			break;
		case "PASSED_HOVER_REMAINING":
			timer.innerHTML = "00:00";
			if(!this.vars.timerControl.proc) {
				if((LBP.canPlayType[LBP.isBrowser]).test(this.html5Obj.currentSrc)) {
					timer.innerHTML = ((parseFloat(this.html5Obj.currentTime).toFixed(2) === 0.00) ? "00:00" : LBP.parseTimer(current));
				}
			} else {
				if((LBP.canPlayType[LBP.isBrowser]).test(this.html5Obj.currentSrc)) {
					timer.innerHTML = "-"+((isNaN(this.html5Obj.duration) || isNaN(this.html5Obj.currentTime)) ? "00:00" : LBP.parseTimer(passed));
				}
			}
			break;
		default:
			timer.innerHTML = ((parseFloat(this.html5Obj.currentTime).toFixed(2) === 0.00) ? "00:00" : LBP.parseTimer(current)) + " / " + ((isNaN(this.html5Obj.duration)) ? "00:00" : LBP.parseTimer(duration));
			break;
	}
};
/* fct: switch between small-screen and full-screen/-window mode */
LBP.prototype.setScreen = function(fs, pm, cors, bsXY) {
	var vid = this.options.vid, b = document.body, chk = this.vars.isIframe, p = LBP.$(this.options.pid), fP = false, d = document.documentElement, pm = pm||false, cors = cors||false, bsXY = bsXY||null;

	/* do: cancel if audio player or video stoped or in autoFullscreen mode */
	if(!this.vars.videoPlayer || (this.vars.stoped && !this.options.autoFullscreen)) {return;}
	
	/* do: use postMessage to resize cross-domain IFrame */
	if(this.vars.isCorsIframe) {
		if(chk && !pm) {
			var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : false);
			if(!!target && this.vars.fullscreen !== fs) {target.postMessage(JSON.stringify({action: "setScreen", value: fs, vid: this.options.vid}), "*");}
			return;
		} else if(chk && pm) {this.vars.bsXY = bsXY;}
	}
	
	/* do: if in IFrame and not CORS, add "allowfullscreen" attribute to IFrame */
	if(chk && !this.vars.isCorsIframe) {
		var ifr = window.frameElement, fP = (LBP.isTag(ifr, "iframe"))?ifr:ifr.offsetParent, d = (chk?window.parent.document.documentElement:document.documentElement);;
		fP.setAttribute("webkitallowfullscreen", !0); fP.setAttribute("mozallowfullscreen", !0); fP.setAttribute("allowfullscreen", !0);
	}

	/* do: if WK full-screen supported */
	if(typeof(this.html5Obj.webkitEnterFullscreen) !== "undefined" || typeof(this.html5Obj.webkitExitFullscreen) !== "undefined") {
		/* do: enter/cancel WK full-screen */
		try {
			/* do: Safari 5.1+, Chrome 15+ */
			if(typeof(p.webkitRequestFullScreen) !== "undefined") {
				if(document.webkitIsFullScreen && !fs) {document.webkitCancelFullScreen();}
				else if(fs) {
					var par = !0, ver = 0;
					/* do: parameter bug in Safari 5.1(.1-.x) */
					if(LBP.isBrowser === "safari") {
						(/version\/(\d+\.\d+\.\d+|\d+\.\d+)/i.test(ua$)); par = (parseInt((((ver = RegExp.$1.replace(/\./g, "")) < 3)?ver+"0":ver), 10) < 513)?!1:!0;
					}
					p.webkitRequestFullScreen(((par)?Element.ALLOW_KEYBOARD_INPUT:null));
				}
			}
			/* do: Safari < 5.1, Chrome < 15 or !preventRealFullscreen */
			else if(typeof(p.webkitRequestFullScreen) === "undefined" && !this.vars.preventRealFullscreen) {this.html5Obj.webkitEnterFullscreen(); return;}
		} catch(ex) {}
	}

	/* do: if FF full-screen supported */
	if(typeof(this.html5Obj.mozRequestFullScreen) !== "undefined" || typeof(document.mozCancelFullScreen) !== "undefined" && document.mozFullScreenEnabled) {
		/* do: enter/cancel FF full-screen */
		try {
			/* do: FF 10+ */
			var df = document.mozFullScreen, dfe = document.mozFullScreenElement;
			if(!df && dfe === null && !this.vars.fullscreen && fs) {try {p.requestFullScreenWithKeys();} catch(ex) {p.mozRequestFullScreen();}}
			else if(df && dfe !== null && this.vars.fullscreen && !fs) {document.mozCancelFullScreen();}
		} catch(ex) {}
	}
	
	document.cancelFullScreen = document.webkitCancelFullScreen || document.mozCancelFullScreen || document.cancelFullScreen;
	
	if(typeof(document.cancelFullScreen) !== "undefined" && !this.vars.fullscreenEvent && !this.vars.isCorsIframe) {
		var fsObj = (chk)?document:p;
		(function(p, o) {
			/* do: add fullscreenchange event */
			var e = {};
			e = {e: "mozfullscreenchange", f: function() {if(!document.mozFullScreen) {p.setScreen(false);}}};
			p.vars.domEvents.push(e); LBP.addEvent(o, e.e, e.f);
			e = {e: "webkitfullscreenchange", f: function() {if(!document.webkitIsFullScreen) {p.setScreen(false);}}};
			p.vars.domEvents.push(e); LBP.addEvent(o, e.e, e.f);
		}(this, fsObj));
		
		this.vars.fullscreenEvent = true;
	}

	/* do: set full-screen/-window */
	if(fs) {
		/* do: store document overflow style */
		if(typeof(LBP.overflow) === "undefined") {LBP.overflow = d.style.overflow;}
		/* do: set document body CSS class for full-screen */
		LBP.addCssClass(b, "h5_lb_fullscreen_fix");
		/* do: hide scroll bars */
		LBP.setCssStyle(d, "overflow", "hidden");
		/* do: remove CSS class and reset to full-screen */
		LBP.removeCssClass(p, "h5_lb_smallscreen");
		LBP.addCssClass(p, "h5_lb_fullscreen");
		/* do: remove CSS class from controls bar if shown below video viewport */
		if(this.options.controlsBelow) {LBP.removeCssClass(vid+"_controls", "h5_lb_controls_below");}
		/* do: if IFrame */
		if(fP) {
			/* do: get browser dimensions */
			var bsXY = (!!bsXY && !!cors)?bsXY:LBP.getBrowserSizeXY(true);
			/* do: add CSS class for full-screen also to IFrame-parent */
			LBP.addCssClass(fP, "h5_lb_fullscreen");
			/* do: store IFrame-parent style */
			if(typeof(this.vars.frameParent) === "undefined") {this.vars.frameParent = {style: fP.getAttribute("style"), fP: fP};}
			/* do: set IFrame-parent style for full-screen */
			LBP.setCssStyle(fP, ["height", "width"], [bsXY.height+"px", bsXY.width+"px"]);
			/* do: reset IFrame css class */
			LBP.removeCssClass(ifr, "h5_lb_player_smallscreen");
			LBP.addCssClass(ifr, "h5_lb_player_fullscreen");
		}
		/* do: video is full-screen */
		this.vars.fullscreen = true;
		/* do: resize and set Video */
		this.sizeScreen();
		/* do: reset controls */
		this.resetControls();
	}
	/* do: set small-screen */
	else if(!fs && this.vars.fullscreen) {
		/* do: video is not full-screen */
		this.vars.fullscreen = false;
		/* do: resize and set video */
		this.sizeScreen();
		/* do: reset controls */
		this.resetControls();
		/* do: if IFrame */
		if(fP) {
			/* do: remove CSS class for full-screen from IFrame-parent */
			LBP.removeCssClass(fP, "h5_lb_fullscreen");
			/* do: set IFrame-parents style for small-screen */
			var fPS = this.vars.frameParent;
			if(fPS) {fPS.fP.removeAttribute("style"); fPS.fP.setAttribute("style", fPS.style);}
			/* do: reset IFrame css class */
			LBP.removeCssClass(ifr, "h5_lb_player_fullscreen");
			LBP.addCssClass(ifr, "h5_lb_player_smallscreen");
		}
		/* do: add CSS class from controls bar if shown below video viewport */
		if(this.options.controlsBelow) {LBP.addCssClass(vid+"_controls", "h5_lb_controls_below");}
		/* do: style outer html5_player div */
		LBP.removeCssClass(p, "h5_lb_fullscreen");
		LBP.addCssClass(p, "h5_lb_smallscreen");
		/* do: reset document overflow style */
		LBP.setCssStyle(d, "overflow", LBP.overflow);
		/* do: reset document body CSS class */
		LBP.removeCssClass(b, "h5_lb_fullscreen_fix");
		/* do: set video in browser-focus */
		if(LBP.$(vid).focused) {this.setPlayerInFocus(vid);}
	}
	/* do: redraw progress bar and timer */
	this.drawProgressBar(); this.drawProgressTimer();
	/* do: redraw full-screen icon */
	this.drawFullscreenIcon();
	/* do: set poster */
	this.setPoster();
};
/* fct: (re)size video */
LBP.prototype.sizeScreen = function() {
	/* do: create vars width+height if undefined */
	if(typeof(this.vars.videoWidth) === "undefined") {this.vars.videoWidth = null;}
	if(typeof(this.vars.videoHeight) === "undefined") {this.vars.videoHeight = null;}

	/* do: if vars=null get values from html5 object */
	if(this.vars.videoHeight === null && this.vars.videoWidth === null) {
		this.vars.videoHeight = this.html5Obj.height; this.vars.videoWidth = this.html5Obj.width;
	}
	if(!LBP.isIPad || ((this.vars.videoHeight <= this.html5Obj.videoHeight || this.vars.videoHeight > this.html5Obj.videoHeight || this.html5Obj.videoHeight === 0) || (this.vars.videoWidth <= this.html5Obj.videoWidth || this.vars.videoWidth > this.html5Obj.videoWidth || this.html5Obj.videoWidth === 0))) {
		this.html5Obj.height = this.vars.videoHeight; this.html5Obj.width = this.vars.videoWidth;
	} else if(this.html5Obj.videoHeight > 0 || this.html5Obj.videoWidth > 0) {
		this.html5Obj.height = this.html5Obj.videoHeight; this.html5Obj.width = this.html5Obj.videoWidth;
	}

	var s = {h: this.vars.videoHeight, w: this.vars.videoWidth}, ps = s, mt = 0, ml = 0;
	/* do: resize poster to fullscreen ratio of video */
	if(this.vars.fullscreen) {var bsXY = (!!this.vars.bsXY && this.vars.isCorsIframe)?this.vars.bsXY:LBP.getBrowserSizeXY(); ps = {h: bsXY.height, w: bsXY.width}; s = LBP.resizeToBrowser(s.h, s.w, bsXY); mt = parseInt((bsXY.height-s.h)/2, 10); ml = "-"+parseInt(s.w/2, 10);}

	/* do: set CSS style of video and video parent position and dimenstions */
	LBP.setCssStyle(this.options.vid, ["height", "width", "marginTop"], [s.h+"px", s.w+"px", mt+"px"]);
	LBP.setCssStyle(this.options.pid, ["height", "width"], [ps.h+"px", ps.w+"px"]);

	/* do: set subtitle-position to videos viewport */
	if(!this.options.permitSubtitlesWindowBoxed && this.vars.fullscreen) {
		LBP.setCssStyle(this.options.vid+"_subtitle", ["height", "width", "marginTop", "top", "left"], [s.h+"px", s.w+"px", mt+"px", "-1px", parseInt(((ps.w - s.w)/2)-1, 10)+"px"]);
	} else if(!this.options.permitSubtitlesWindowBoxed && !this.vars.fullscreen) {
		LBP.setCssStyle(this.options.vid+"_subtitle", ["height", "width", "marginTop", "top", "left"], [s.h+"px", s.w+"px", mt+"px", "0", "0"]);
	}
};
/* fct: handle play control button */
LBP.prototype.setPlayControl = function(b) {
	var play = this.options.vid+"_play_control";

	/* do: show play control */
	if(b) {LBP.showEl(play);}
	/* do: hide play control */
	else {LBP.hideEl(play);}
};
/* fct: handle pause control button */
LBP.prototype.setPauseControl = function(b) {
	var pause = this.options.vid+"_pause_control";

	/* do: show pause control */
	if(b) {LBP.showEl(pause);}
	/* do: hide pause control */
	else {LBP.hideEl(pause);}
};
/* fct: handle big play button */
LBP.prototype.setBigPlayButton = function(b) {
	var vid = this.options.vid, btn = vid+"_big_play_button";
	/* do: show big play button */
	if(b) {LBP.showEl(btn);}
	/* do: hide big play button */
	else {LBP.hideEl(btn);}
};
/* fct: set up poster if available */
LBP.prototype.setPoster = function() {
	var vid = this.options.vid, elId = vid+"_poster";
	if(!this.vars.poster) {return;}
	/* do: on playing hide poster */
	if((LBP.$(vid).focused && !this.options.posterRestore) && (!this.html5Obj.paused || (parseFloat(this.html5Obj.currentTime) > 0 && parseFloat(this.html5Obj.currentTime) < parseFloat(this.html5Obj.duration)))) {LBP.hideEl(elId);}
	/* do: on stoped reappear poster */
	if(this.options.posterRestore && (parseFloat(this.html5Obj.currentTime) <= 0 || parseFloat(this.html5Obj.currentTime) >= parseFloat(this.html5Obj.duration))) {LBP.showEl(elId);}
	/* do: fit poster size to video size */
	this.sizePoster();
};
/* fct: fit poster size to video size, if poster available */
LBP.prototype.sizePoster = function() {
    if(this.vars.poster === false || this.vars.poster.style.display === 'none') {return;}

	var s = {h: this.vars.videoHeight, w: this.vars.videoWidth}, mt = 0, ml = 0;
	/* do: resize poster to fullscreen ratio of video */
	if(this.vars.fullscreen) {var bsXY = (!!this.vars.bsXY && this.vars.isCorsIframe)?this.vars.bsXY:LBP.getBrowserSizeXY(this.vars.isCorsIframe); s = LBP.resizeToBrowser(s.h, s.w, bsXY); mt = parseInt((bsXY.height-s.h)/2, 10); ml = parseInt((bsXY.width-s.w)/2, 10);}

	/* do: set CSS style of poster position and dimenstions */
	LBP.setCssStyle(this.vars.poster, ["height", "width", "marginTop", "marginLeft"], [s.h+"px", s.w+"px", mt+"px", ml+"px"]);
};
/* fct: show/hide spinner (bool) */
LBP.prototype.setSpinner = function(b) {
	var elId = this.options.vid+"_spinner";

	/* do: cancel if not using spinner or is audio player */
	if(!LBP.inArray(this.options.controlsExtra, "Spinner") || !LBP.$(elId) || !this.options.useSpinner || !this.vars.videoPlayer){return;}

	/* do: cancel if readyState is 0 or we just got an error */
	if(this.html5Obj.readyState === 0 || this.html5Obj.error !== null){return;}

	(function(p) {
		/* do: create and load spinner if not already done */
		if(b){if(p.vars.spinner.proc === null){LBP.showEl(elId); p.vars.spinner.proc = window.setInterval(function() {p.loadSpinner(p.createSpinner());}, 90); window.clearInterval(p.vars.spinner.task); p.vars.spinner.task = window.setInterval(function() {p.setSpinner(false); window.clearInterval(p.vars.spinner.task); p.vars.spinner.task = null;}, 30000);}}
		/* do: clear and hide spinner */
		else if(!b){window.clearInterval(p.vars.spinner.proc); p.vars.spinner.proc = null; window.clearInterval(p.vars.spinner.task); p.vars.spinner.task = null; LBP.hideEl(elId);}
	}(this));
};
/* fct: create spinner */
LBP.prototype.createSpinner = function() {
	var op = this.options, p = LBP.$(op.vid+"_spinner"), sp = [];
	/* do: cancel if p is not an object */
	if(!p) {return sp;}
	/* do: get spinner childs if available */
	if(p.hasChildNodes()) {return p.childNodes;}
	/* do: create 7 new child div's */
	for(var i = 0; i<op.useSpinnerCircles; i++) {var c=document.createElement("div"); p.appendChild(c); sp.push(c);}
	return sp;
};
/* fct: calculate spinner */
LBP.prototype.loadSpinner = function(sp) {
	for(var i = 1; i <= sp.length; i++) {
		/* e.g.: 0.628 = 2*Pi/div's per circles = 2*Pi/10 (9=0.689132) */
		LBP.setCssStyle(sp[(i-1)], ["top", "left", "opacity"], [parseFloat((sp.length*2+3)*Math.cos(this.vars.spinner.alpha+(2*Math.PI/sp.length)*i))+"px", parseFloat((sp.length*2+3)*Math.sin(this.vars.spinner.alpha+(2*Math.PI/sp.length)*i))+"px", parseFloat((10-(i-1))/10).toFixed(2)]);
	}
	/* set new angular velocity for next interval */
	this.vars.spinner.alpha=this.vars.spinner.alpha-0.35;
};
/* fct: set volume and draw volume-controls */
LBP.prototype.setVolume = function(v) {
	var vid = this.options.vid;

	/* do: on iOS devices the volume is readonly so we return */
	if(LBP.isMobile) {return;}

	/* do: cancel if stoped */
	if(this.vars.stoped && this.vars.afterInitialized) {return;}

	/* do: try to get the volume "v" */
	if(v === "+" && this.options.defaultVolume < this.options.volumeRates) {v = parseInt(this.options.defaultVolume+1, 10);}
	else if(v === "-" && this.options.defaultVolume > 0) {v = parseInt(this.options.defaultVolume-1, 10);}
	else if(v === null) {if(this.options.defaultVolume === 0) {v = this.options.volumeRates;} else {v = 0;}}
	else if(isNaN(v)) {v = parseInt(v.substr(v.lastIndexOf("_")+1, v.length), 10);}

	/* do: break here if v is still NaN */
	if(isNaN(v)) {return;}

	/* do: if v or defaultVolume greater than volumeRates overwrite v*/
	if((v || this.options.defaultVolume) > this.options.volumeRates) {v = this.options.defaultVolume = this.options.volumeRates;}
	
	/* do: set volume to media element */
	this.html5Obj.volume = parseFloat(v/this.options.volumeRates);

	/* do: store volume "v" as default and set volume to media element; unmute media element - due to issue with chrome need to parse v to integer after Math.floor */
	if(v > 0) {this.options.defaultVolume = v; this.html5Obj.muted = false;}

	/* do: return if no volume element */
	if(!LBP.inArray(this.options.defaultControls, "Volume")) {return;}

	/* do: set volume css classes */
	for(var i=1; i<=this.options.volumeRates; i++) {LBP.$(vid+"_vol_"+i).setAttribute("class", "isnot");}
	for(var j = 1; j <= v; j++) {LBP.$(vid+"_vol_"+j).setAttribute("class", "is");}

	/* do: set mute css classes */
	if(v <= 0) {for(var k = 0; k <= 3; k++) {LBP.$(vid+"_mute"+k).setAttribute("class", "isnot");}}
	else {for(var l = 0; l <= 3; l++) {LBP.$(vid+"_mute"+l).setAttribute("class", "is");}}

	/* do: hide some mute circles */
	LBP.showEl(vid+"_mute5"); LBP.showEl(vid+"_mute6");
	if(parseFloat(v/this.options.volumeRates) <= 0.34) {LBP.hideEl(vid+"_mute5"); LBP.hideEl(vid+"_mute6");}
	else if(parseFloat(v/this.options.volumeRates) > 0.34 && parseFloat(v/this.options.volumeRates) <= 0.67) {LBP.hideEl(vid+"_mute6");}

	/* do: change "on" attributes on mute element */
	(function(p) {LBP.mergeObjs(vid+"_mute", {onclick: function() {if(p.vars.stoped && p.vars.afterInitialized) {return;} p.html5Obj.muted = !p.html5Obj.muted;}}); LBP.$(vid+"_mute").setAttribute("title", p.getTranslation((p.html5Obj.muted)?"UnMute":"Mute"));}(this));
};
/* fct: set playback-rate; HINT: not yet supported in Opera (http://dev.opera.com/articles/view/everything-you-need-to-know-about-html5-video-and-audio/) */
LBP.prototype.setPlaybackRate = function(pbr) {
	/* do: return if media paused - playbackrate change does not work if paused */
	if(this.html5Obj.paused) {return;}

	/* do: set new playback rate and change controls bar element */
	pbr = ((!isNaN(pbr)) ? pbr : this.options.playbackRates[parseInt(pbr.substr(pbr.lastIndexOf("_")+1, pbr.length), 10)]);
	this.html5Obj.playbackRate = pbr; this.vars.playbackrate = this.html5Obj.playbackRate;
	LBP.$(this.options.vid+"_playback_control_inner").childNodes[0].textContent = pbr + "x";
};
/* fct: show/hide subtitle if available */
LBP.prototype.setSubtitle = function(v) {
	var elId = this.options.vid+"_subtitle";
	if(!this.options.showSubtitles || LBP.$(elId) === null || (parseFloat(this.html5Obj.currentTime) === 0 && !this.vars.stoped) || parseFloat(this.html5Obj.currentTime) >= parseFloat(this.html5Obj.duration)) {return;}

	if(v && this.vars.activeSub !== null) {if(this.vars.activeSubId >= 0) {LBP.showEl(elId);} this.vars.hideSubtitle = false; this.drawSubtitles(); this.vars.seeking.subs = null;}
	else if(!v && this.vars.activeSub !== null){LBP.hideEl(elId); this.vars.hideSubtitle = true; this.vars.activeSubId = -1;}
	/* do: set controls item to active subtitle lang */
	if(this.vars.seeking.subs === null) {this.resetSubsControlItem(!this.vars.hideSubtitle);}
};
/* fct: get next available subtitle */
LBP.prototype.nextSubtitle = function() {
	var subs = [], i = 0, al = null, nl = 0;
	/* do: find next possible subtitle language or set to first (0) */
	for(var t in this.vars.subs) {if(typeof(this.vars.subs[t]) === "function"){continue;} if(t === this.vars.activeSubLang) {al=i;} subs[i]=t; i++;}
	for(var j=0, k=subs.length; j<k;j++) {if(subs[j+1] === null) {nl = 0; break;} else if(j > al){nl = j; break;}}

	i = 0;
	/* do: set found subtitle language to active subtitle language */
	for(var u in this.vars.subs) {if(typeof(this.vars.subs[u]) === "function"){continue;} if(i === nl){al = u;} i++;}
	this.vars.activeSubLang = al; this.vars.activeSub = [];

	var tr = this.vars.subs[al].track;
	/* do: get subtitle tracks for new language */
	for(var v in tr) {if(typeof(tr[v]) === "function"){continue;} this.vars.activeSub.push(tr[v]);}

	/* do: reset activeSubId and try to get for new subtitle lang */
	this.vars.activeSubId = -1; this.drawSubtitles();
	/* do: set controls item to active subtitle lang */
	this.resetSubsControlItem(!this.vars.hideSubtitle);
};
/* fct: draw subtitle */
LBP.prototype.drawSubtitles = function() {
	var elId = this.options.vid+"_subtitle", elTrack = elId+"_track", elContent = elId+"_content", sid=0, asl=0; LBP.hideEl(elId); LBP.$(elId).innerHTML = '';
	/* do: hide subtitle */
	if(this.vars.hideSubtitle) {return;}
	if(this.vars.activeSub !== null && parseFloat(this.html5Obj.currentTime) >= parseFloat(this.html5Obj.duration)) {this.setSubtitle(false);}
	/* do: else get subtitles at current time */
	else if(this.vars.activeSub !== null && !this.html5Obj.seeking) {
		if(this.vars.subs[this.vars.activeSubLang].mimetype !== "vtt") {
			/* do: return if currentTime < first subtitle time */
			if(this.html5Obj.currentTime < this.vars.activeSub[0].from) {return;}

			/* do: increase sid to not loop through all subtitles in activeSub (now max 3 loops) */
			if(this.vars.activeSubId > 0){sid = this.vars.activeSubId;}

			/* do: searching for the active subtitle */
			for(var s = sid, asl=this.vars.activeSub.length; s<asl; s++) {
				if(typeof(this.vars.activeSub[s]) === "function"){continue;}

				/* do: break if in current subtitle */
				if(this.vars.activeSub[s].from >= this.html5Obj.currentTime && this.html5Obj.currentTime <= this.vars.activeSub[s].to) {break;}

				/* do: show current subtitle */
				if(parseFloat(this.vars.activeSubId) <= parseFloat(s)) {
					this.vars.activeSubId = s; LBP.$(elId).innerHTML = '';
					LBP.createHTMLEl(elId, "div", {id: elTrack, className: "plain"});
					LBP.createHTMLEl(elTrack, "div", {id: elContent, innerHTML: this.vars.activeSub[s].txt});
					LBP.showEl(elId);
				}

				/* do: don't show subtitles in times where no subtitle is set */
				if(this.vars.activeSubId >= 0 && this.html5Obj.currentTime > this.vars.activeSub[this.vars.activeSubId].to) {LBP.$(elId).innerHTML = ''; LBP.hideEl(elId);}
			}
		} else {
			var isSubs = !1;
			/* do: searching for the active subtitles */
			for(var s = 0; s<this.vars.activeSub.length; s++) {
				if(typeof(this.vars.activeSub[s]) === "function"){continue;}
				/* do: show subtitle if from > currentTime && to < currentTime */
				if(this.html5Obj.currentTime >= this.vars.activeSub[s].from && this.html5Obj.currentTime < this.vars.activeSub[s].to) {
					isSubs = !0; var sub = this.vars.activeSub[s], set = sub.set;
					LBP.createHTMLEl(elId, "div", {id: elTrack+"_"+s, className: "plain vtt"});
					LBP.createHTMLEl(elTrack+"_"+s, "div", {id: elContent+"_"+s, innerHTML: sub.txt});
					if(typeof(set) !== "undefined") {
						if(0 in set.track) {LBP.$(elTrack+"_"+s).setAttribute("style", set.track.join('; '));}
						if(0 in set.content) {LBP.$(elContent+"_"+s).setAttribute("style", set.content.join('; '));}
					}
				}
			}
			if(isSubs) {LBP.showEl(elId);}
		}
	}
};
/* fct: load subtitles */
LBP.prototype.getSubs = function(tr) {
	var vid = this.options.vid, tracks = [];

	/* do: show spinner */
	this.setSpinner(true);

	/* do: set getting subs not ready */
	this.vars.playerReady.push('getSubs');

	/* do: get subtitles from HTML track element */
	if(!tr){tracks = LBP.$(vid).getElementsByTagName("track");}
	/* do: else create subtitles as HTML track element with informations in "tr" */
	else {
		/* do: create tracks from tr */
		for(var s=0, trl=tr.length; s<trl; s++) {
			tracks.push(LBP.createHTMLEl(null, "track", {enabled: "true", src: tr[s].src, type: tr[s].type, kind: tr[s].kind, srclang: tr[s].srclang, label: tr[s].label}));
		}
	}
	if(tracks.length > 0) {
		/* do: create vars if undefined */
		if(typeof(this.vars.hideSubtitle) === "undefined") {this.vars.hideSubtitle = false;}
		if(typeof(this.vars.subs) === "undefined") {this.vars.subs = null;}
		if(typeof(this.vars.activeSub) === "undefined") {this.vars.activeSub = null;}
		if(typeof(this.vars.activeSubId) === "undefined") {this.vars.activeSubId = -1;}
		/* do: (re)set vars subs to array */
		this.vars.subs = [];
	}

	for(var i=0, tl=tracks.length; i<tl; i++) {
		/* do: check if track has not has kind-attribute or kind-attribute of value "subtitles" - HTML5 spec says: "The attribute may be omitted. The missing value default is the subtitles state." */
		if(!tracks[i].hasAttribute("kind") || (tracks[i].hasAttribute("kind") && tracks[i].getAttribute("kind").toLowerCase() === "subtitles")) {
			/* do: only one track per language */
			var src = tracks[i].getAttribute("src");
			var srclang = tracks[i].getAttribute("srclang").split("-")[0];
			var label = tracks[i].getAttribute("label");
			var mt = tracks[i].getAttribute("type").split("/")[1];
			if(!this.vars.subs[srclang] && mt) {
				/* do: resolve plain text subtitles */
				if(LBP.inArray(["plain", "x-srt", "x-subrip", "vobsub", "vtt"], mt)) {this.resolveSubs(src, srclang, label, mt);}
				/* do: resolve xml subtitles */
				else if(mt === "xml") {this.resolveXMLSubs(src, srclang, label, mt);}
				/* do: resolve ttaf xml subtitles */
				else if(mt === "ttaf+xml") {this.resolveXMLTTSubs(src, srclang, label, mt);}
			}
		}
	}

	/* do: set getting subs ready */
	this.vars.playerReady.pop();

	/* do: hide spinner if player ready */
	if(this.vars.playerReady.length === 0) {this.setSpinner(false);}

	/* do: if tracks available set active */
	if(tracks.length > 0){this.setActiveSubs();}
};
/* fct: set activ subtitle */
LBP.prototype.setActiveSubs = function() {
	if(typeof(this.vars.subs) === "undefined") {return;}
	/* do: search for subtitles if only available in other languages (not browser-language or options-language) */
	var j = 0, l = ""; for(var t in this.vars.subs) {if(typeof(this.vars.subs[t]) === "function"){continue;} j++; if(l===""){l=t; break;}}
	/* inner-fct: to minimize code */
	var setActiveSub = function(p) {
		var n = 0; p.vars.activeSub = [];
		for(var w in p.vars.subs[p.vars.activeSubLang].track) {
			if(typeof(p.vars.subs[p.vars.activeSubLang].track[w]) === "function"){continue;}
			p.vars.activeSub[n] = p.vars.subs[p.vars.activeSubLang].track[w];
			n++;
		}
	};
	var subs = this.vars.subs;
	/* do: if subtitles available in options-language for subtitles */
	if(subs[this.options.defaultSubtitleLanguage] && subs[this.options.defaultSubtitleLanguage].track[0]) {
		this.vars.activeSubLang = this.options.defaultSubtitleLanguage; this.vars.hideSubtitle = false;
		/* call: inline function */
		setActiveSub(this);
	}
	/* do: if subtitles available in browser-language */
	else if(subs[this.vars.isBrowserLang] && subs[this.vars.isBrowserLang].track[0]) {
		this.vars.activeSubLang = this.vars.isBrowserLang; this.vars.hideSubtitle = false;
		/* call: inline function */
		setActiveSub(this);
	}
	/* do: else if subtitles only available in options-language */
	else if(subs[this.options.defaultLanguage] && subs[this.options.defaultLanguage].track[0]) {
		this.vars.activeSubLang = this.options.defaultLanguage; this.vars.hideSubtitle = false;
		/* call: inline function */
		setActiveSub(this);
	}
	/* do: else if subtitles only available in other language */
	else if(j > 0) {
		this.vars.activeSubLang = l; this.vars.hideSubtitle = false;
		/* call: inline function */
		setActiveSub(this);
	}
	return;
};
/* fct: draw subtitle menu items */
LBP.prototype.drawSubsMenu = function() {
	var vid = this.options.vid, navId = vid+"_subtitle_nav";
	LBP.createHTMLEl(vid+"_subtitle_control_inner", "div", {id: navId, className: "subtitle_nav"});
	LBP.setCssStyle(navId, "top", "-12px");

	(function(p) {
		for(var t in p.vars.subs) {
			if(typeof(p.vars.subs[t]) === "function"){continue;}
			if(LBP.$("subs_"+t) === null && p.vars.subs[t].track[0]) {
				LBP.createHTMLEl(navId, "div", {id: vid+"_subs_"+t, innerHTML: p.vars.subs[t].label, title: p.getTranslation("Subtitle_to", p.vars.subs[t].label), onclick: function() {p.vars.hideSubtitle = false; p.resetSubs(this.id);}});
				/* do: set controls item to active subtitle lang */
				if(p.vars.activeSubLang === t) {p.resetSubsControlItem(!p.vars.hideSubtitle);}
			}
		}
		LBP.createHTMLEl(navId, "div", {id: vid+"_subs_off", innerHTML: p.getTranslation("Subtitle_set"), title: p.getTranslation("Subtitle_off"), onclick: function() {p.setSubtitle(false); p.resetSubsControlItem(false); LBP.hideEl(LBP.$(navId));}});
		LBP.addCssClass(navId, "elem_visible");
		LBP.setCssStyle(navId, "top", "-"+parseInt(LBP.$(navId).offsetHeight + LBP.getElemBorderWidth(navId).top + LBP.getElemBorderWidth(navId).bottom + LBP.getElemPaddingWidth(navId).top + LBP.getElemPaddingWidth(navId).bottom + LBP.getElemMarginWidth(navId).top + LBP.getElemMarginWidth(navId).bottom, 10) + "px");
		LBP.removeCssClass(navId, "elem_visible");
	}(this));
};
/* fct: reset subtitle on user-click */
LBP.prototype.resetSubs = function(lang) {
	var vid = this.options.vid;
	lang = lang.replace(vid+"_subs_", "");
	if(this.vars.subs[lang]) {
		this.vars.activeSubLang = lang; this.vars.activeSub = [];
		var tr = this.vars.subs[lang].track;
		for(var t in tr) {if(typeof(tr[t]) === "function"){continue;} this.vars.activeSub.push(tr[t]);}
		/* do: reset activeSubId and try to get for new subtitle lang */
		this.vars.activeSubId = -1; this.drawSubtitles();
		/* do: set controls item to active subtitle lang */
		this.resetSubsControlItem(!this.vars.hideSubtitle);
	}
};
/* fct: set controls item to active subtitle lang */
LBP.prototype.resetSubsControlItem = function(b) {
	var vid = this.options.vid, o = LBP.$(vid+"_subtitle_control_inner"); if(o === null) {return;}
	o.childNodes[0].textContent = ((b) ? this.vars.activeSubLang : this.getTranslation("Subtitle_inner"));
};
/* fct: resolve subtitle tracks */
LBP.prototype.resolveSubs = function(src, lang, label, mt) {
	/* do: load subtitle tracks */
	var xhr = LBP.XHR(src);
	if(xhr == null || xhr.status === 404) {return;}
	var tracks = xhr.responseText;
	tracks = LBP.trimSubs(tracks.replace(/\r\n|\r|\n/g, '\n'));
	tracks = tracks.split('\n\n');

	/* innerFct: resolve vtt track */
	var resolveVTT = function(that, st) {
		var txt = st[2];

		/* innerFct: resolve cue settings in VTT tracks */
		var resolveSettings = function(that, s, t, dir, doT) {
			/* do: cue settings */
			var txt_align = /A:(start|middle|end)/i;			// (1.)
			var txt_size = /S:([0-9]{0,3})(%)*/i;				// (2.)
			var line_position = /L:([0-9-]{0,4})(%)*/i;			// (3.)
			var txt_position = /T:([0-9]{0,3})(%)*/i;			// (4.)
			var txt_vertical = /D:(vertical(-lr)|vertical)/i;	// (5.)

			var set = {track: [], content: [], fixed: {l: !1, t: !1}}, ta = !1, ts = !1, lp = !1, tp = !1;
			var cssta = "text-align: ", cssva =  "vertical-align: ", cssw = "width: ", cssh = "height: ", cssi = " !important", cssl = "left", cssc = "center", cssr = "right", csst = "top", cssb = "bottom", tas = "start", tam = "middle", tae = "end";

			/** Some notes:
				1.) alignment + positioning:
					- with CSS3 it will be possible to align an object directly (see: http://dev.w3.org/csswg/css3-images/#object-position)
				2.) text orientation for vertical:
					- with CSS3 it will be possible to specify orientation of characters within a line (see: http://dev.w3.org/csswg/css3-writing-modes/#text-orientation0)
			*/

			/* do: (1.a) get text alignment (A:[start|middle|end]) - resolve completely in (5.) */
			if(txt_align.test(s)) {ta = {$1: RegExp.$1};}
			/* do: (1.b) add default for text alignment settings for vertical if not added with settings */
			else if(txt_vertical.test(s)) {ta = {$1: "middle"};}

			/* do: (2.) get text size (S:[number]%, where [number] is a positive integer and "%" is optional) - resolve completely in (5.) */
			if(txt_size.test(s)) {ts = {$1: parseInt(RegExp.$1,10), $2: RegExp.$2};}

			/* do: (3.) get line position (L:[number]%, where [number] is a positive integer OR L:[number], where [number] is a positive or negative integer) - resolve completely in (5.) */
			if(line_position.test(s)) {lp = {$1: parseInt(RegExp.$1,10), $2: RegExp.$2};}

			/* do: (4.a) get text position (T:[number]%, where [number] is a positive integer and "%" is optional) - resolve completely in (5.) */
			if(txt_position.test(s)) {tp = {$1: parseInt(RegExp.$1,10), $2: RegExp.$2};}
			/* do: (4.b) add default for text position settings for vertical if not added with settings */
			else if(txt_vertical.test(s)) {tp = {$1: 50, $2: "%"};}

			/* do: (5.1) resolve vertical text (D:vertical [vertical growing left] OR D:vertical-lr [vertical growing right]) for (1.) - (4.) */
			if(txt_vertical.test(s)) {
				/* do: get vertical-"lr" setting */
				var va = RegExp.$2;
				/* do: reverse directions for positioning */
				if(dir) {csst = "bottom"; cssb = "top";}
				/* do: (1.) A: now */
				var a = ' style="'+cssva+csst;
				if(ta) {
					a = ' style="'+cssva;
					switch(ta.$1) {
						case tas: a += csst; break;
						case tam: a += cssc; break;
						case tae: a += cssb; break;
					}
				}
				a += cssi+'; float: left !important; text-align: center; padding: 0 2px;"';
				/* do: try to make text vertical */
				var nt = "", th = "#tep4zpTYevdPs#", thl = th.length, t = (((t.replace('\n', th+"\n"+th)).replace(/(&amp;|&lt;|&rt;)/g, th+"$1"+th)).replace(/</g, th+'<')).replace(/>/g, '>'+th);
				var status = false;
				for(var i=0; i<t.length; i++) {
					var ex1 = t.substr(i, thl), ex2 = t.substr(parseInt(i+1,10), thl);
					if(ex1 == th) {status = !status; i += parseInt(thl-1,10); continue;}
					nt += t.charAt(i)+((!status && ex2 != th)?"<br/>":"");
				}
				t = nt;
				/* do: resolve text to be vertical */
				var tdb = "<span"+a+">", tde = "</span>", tdbre = /<br[\s]{0,1}\/><\/span>/g, vat = t.split('\n');
				/* do: resolve the growing of text with(out) "lr" */
				if(!va) {vat.reverse();}
				/* do: create new vertical text rows */
				t = ((tdb+vat.join(tde+tdb)+tde).replace(tdbre, tde)).replace(tdb+tde, '');
				/* do: create some hidden subtitle tracks to get dimensions (width, height) */
				var subs = LBP.createHTMLEl(that.options.pid, "div", {className: "h5_lb_subtitles"}), track = LBP.createHTMLEl(subs, "div", {className: "plain vtt"}), content = LBP.createHTMLEl(track, "div", {innerHTML: LBP.wrapSubs(LBP.trimSubs(t))}); subs.style.display = "block";
				var txt = {owidth: content.offsetWidth, oheight: content.offsetHeight};
				/* do: (2.) S: now */
				if(ts && ts.$1 >= 0 && ts.$1 <= 100 && ts.$2 && !doT) {
					var h = parseInt(that.vars.videoHeight*(ts.$1/100),10);
					LBP.setCssStyle(content, "height", h+"px"); txt = {owidth: content.offsetWidth, oheight: content.offsetHeight};
					set.content.push(cssh + h +"px"+cssi);
				}
				/* do: (3.) L: now */
				set.track.push(cssta+cssr+cssi);
				if(lp && !doT && (!lp.$2 || (lp.$2 && lp.$1 >= 0 && lp.$1 <= 100))) {
					set.track.pop();
					if(lp.$1 > 50 && lp.$2) {
						var p = (lp.$1 == 100) ? -1 : 0;
						set.track.push(cssta+cssl+cssi); set.track.push(cssl+": "+ parseInt(100-lp.$1,10) + ((lp.$2) ? "%" : "px") +cssi);
						if(lp.$2 && lp.$1 <= 100) {set.content.push("margin-"+cssl+": "+ parseInt(-(((txt.owidth*(100-lp.$1))/100) + p),10) + "px" +cssi);}
					} else {
						var p = (lp.$1 == 0) ? 1 : 0;
						set.track.push(cssta+cssr+cssi); set.track.push(cssr+": "+ lp.$1 + ((lp.$2) ? "%" : "px") +cssi);
						if(lp.$2 && lp.$1 >= 0) {set.content.push("margin-"+cssr+": "+ parseInt(-(((txt.owidth*lp.$1)/100) + p),10) + "px" +cssi);}
					}
				}
				/* do: (4.) T: now */
				set.track.push(csst+": 0" +cssi); set.track.push("margin-"+csst+": 0" +cssi);
				if(tp && !doT && (tp.$2 && tp.$1 >= 0 && tp.$1 <= 100)) {
					set.track.pop(); set.track.pop();
					tp.$1 = (dir) ? parseInt(-(tp.$1-100),10) : tp.$1;
					set.track.push("top: "+ tp.$1 + ((tp.$2) ? "%" : "px") +cssi);
					if(tp.$2 && tp.$1 >= 0) {
						var p = (tp.$1 == 0 || tp.$1 == 100) ? -1 : 0;
						set.content.push("top: "+ parseInt(-(((txt.oheight*tp.$1)/100) + p),10) + "px" +cssi);
					}
				}
			}
			/* do: (5.2) resolve horizontal text for (1.) - (4.) */
			else {
				/* do: create some hidden subtitle tracks to get dimensions (width, height) */
				var subs = LBP.createHTMLEl(that.options.pid, "div", {className: "h5_lb_subtitles"}), track = LBP.createHTMLEl(subs, "div", {className: "plain vtt"}), content = LBP.createHTMLEl(track, "div", {innerHTML: LBP.wrapSubs(LBP.trimSubs(t))}); subs.style.display = "block";
				var txt = {owidth: content.offsetWidth, oheight: content.offsetHeight};

				/* do: reverse directions for alignment and positioning */
				if(dir) {cssl = "right"; cssr = "left";}

				/* do: (1.) A: now */
				if(ta && !doT) {
					switch(ta.$1) {
						case tas: set.content.push(cssta+cssl+cssi); break;
						case tam: set.content.push(cssta+cssc+cssi); break;
						case tae: set.content.push(cssta+cssr+cssi); break;
					}
				}
				/* do: (2.) S: now */
				if(ts && ts.$1 >= 0 && ts.$1 <= 100 && ts.$2 && !doT) {
					var w = parseInt(that.vars.videoWidth*(ts.$1/100),10);
					LBP.setCssStyle(content, "width", w+"px"); txt = {owidth: content.offsetWidth, oheight: content.offsetHeight};
					set.content.push(cssw + w +"px"+cssi); set.content.push("white-space: normal"+cssi);
				}
				/* do: (3.) L: now */
				if(lp && !doT) {
					if(!lp.$2 || (lp.$2 && lp.$1 >= 0 && lp.$1 <= 100)) {
						set.track.push("top: "+ lp.$1 + ((lp.$2) ? "%" : "px") +cssi);
						if(lp.$2 && lp.$1 >= 0) {
							var p = (lp.$1 == 0 || lp.$1 == 100) ? -1 : 0;
							set.content.push("top: "+ parseInt(-(((txt.oheight*lp.$1)/100) + p),10) + "px" +cssi);
						}
					}
				}
				/* do: (4.) T: now */
				if(tp && !doT) {
					if(tp.$2 && tp.$1 >= 0 && tp.$1 <= 100) {
						set.track.push(cssta+cssl+cssi); set.track.push(cssl+": "+ tp.$1 + ((tp.$2) ? "%" : "px") +cssi);
						if(tp.$2 && tp.$1 >= 0) {
							var p = (tp.$1 == 0 || tp.$1 == 100) ? -1 : 0; if(dir) {p = (tp.$1 == 0) ? 1 : ((tp.$1 == 100) ? -1 : 0);}
							set.content.push("margin-"+cssl+": "+ parseInt(-(((txt.owidth*tp.$1)/100) + p),10) + "px" +cssi);
						}
					}
				}
			}
			/* do: delete hidden subtitle tracks */
			subs.parentNode.removeChild(subs);

			return ((!doT) ? set : t);
		};

		/* do: (1.1) put together cue text lines in st[i] where i>2 with linebreak */
		if(st.length > 2) {for(var i=3; i<st.length; i++){txt += '\n'+st[i];}}

		/* do: (1.2) determine direction of text */
		var ltrChars            = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
			rtlChars            = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
			ltrDirCheckRe       = new RegExp('^[^'+rtlChars+']*['+ltrChars+']','ig'),
			rtlDirCheckRe       = new RegExp('^[^'+ltrChars+']*['+rtlChars+']','ig'),
			dir 				= rtlDirCheckRe.test(txt);

		/* do: (2.1) resolve cue text replacements of "<,>,&" and text tags of "<b>,<i>,<u>,<ruby>,<rt>" */
		if(txt) {txt = (((txt.replace(/&/g, "&amp;")).replace(/>/g, "&gt;")).replace(/</g, "&lt;")).replace(/\&lt;(\/|){0,1}(b|i|u|ruby|rt)\&gt;/g, '<$1$2>');}

		/* do: (2.2) resolve cue CLASS tags c.CLASSNAME.CLASSNAME */
		var cb = /&lt;c.([a-z0-9-_.]+)&gt;/i, ce = /&lt;\/c&gt;/gi;
		while(cb.test(txt)) {txt = (txt.replace(cb, '<span class="'+(RegExp.$1).replace(/\./g, ' ')+'">')).replace(ce, '</span>');}

		/* do: (2.3) resolve cue VOICE tags v VOICENAME */
		var vb = /&lt;v\s([a-z0-9-_.\s]+)&gt;/i, ve = /&lt;\/v&gt;/gi;
		while(vb.test(txt)) {txt = (txt.replace(vb, '<q title="'+RegExp.$1+'">')).replace(ve, '</q>');}

		/* do: (3) resolve intermediate cue timestamps (its) within cue text; recreate cue and resolve cue settings */
		var t = /^((?:\d+:){0,1}\d\d:\d\d.\d\d\d) --> ((?:\d+:){0,1}\d\d:\d\d.\d\d\d)/.exec(st[1]);	// cue time
		var ts = /([|\n]{0,1})(?:&lt;((?:\d+:){0,1}\d\d:\d\d.\d\d\d)&gt;)/g; // cue txt timestamps

		if(st.length > 2) {
			var its = !1, l = [], nst = [];
			while(ts.test(txt)) {its = !0; l.push(RegExp.$2);}

			if(its) {
				var tt = /(\sclass="((?:\d+:){0,1}\d\d:\d\d.\d\d\d)")/g; // cue txt timestamps
				var ctxt = txt.replace(ts, '</span>$1<span class="$2">')+'</span>';
				var ct1, ct2; if(!LBP.inArray(l, t[1])) {l.unshift(t[1]); ctxt = '<span class="'+t[1]+'">'+ctxt;} else {ctxt = '<span>'+ctxt;}; ctxt = ctxt.replace("<span><\/span>", "");

				for(var i=0; i<l.length; i++) {
					var getTimeTxt = function() {
						var stxt = ctxt;
						while(tt.test(ctxt)) {
							var stime = LBP.toSec(l[i]), ttime = LBP.toSec(RegExp.$2);
							stxt = (stxt.replace('<span class="'+RegExp.$2+'><\/span>', "")).replace(RegExp.$1, ((stime > ttime) ? ' class="cue_past"' : ((stime < ttime) ? ' class="cue_future"' : "")));
						}
						return stxt;
					};
					if(l[i+1]) {nst.push([st[0], l[i]+" --> "+l[i+1], resolveSettings(that, st[1], getTimeTxt(), dir, !0), resolveSettings(that, st[1], getTimeTxt(), dir, !1)]);}
					else {nst.push([st[0], l[i]+" --> "+t[2], resolveSettings(that, st[1], getTimeTxt(), dir, !0), resolveSettings(that, st[1], getTimeTxt(), dir, !1)]);}
				}
				st = nst;
			}
		}
		/* do: recreate cue (from 2.) and resolve cue settings if its=false */
		if(!its) {st = [st[0], st[1], resolveSettings(that, st[1], txt, dir, !0), resolveSettings(that, st[1], txt, dir, !1)];}

		return st;
	};

	/* innerFct: add track as subtitle */
	var addTrack = function(mt, st, v) {
		var isSub = !1, stl, t = "", time, txt = st[2], set;
		var regex = /^((?:\d\d:){2}\d\d,\d\d\d) --> ((?:\d\d:){2}\d\d,\d\d\d)/;	// .srt
		var regex_vtt = /^((?:\d+:){0,1}\d\d:\d\d.\d\d\d) --> ((?:\d+:){0,1}\d\d:\d\d.\d\d\d)/; // .vtt
		var regex_sbv = /^(\d{1,2}:\d\d:\d\d.\d\d\d),(\d{1,2}:\d\d:\d\d.\d\d\d)/; // .sbv + .sub

		if((mt === "vtt" && regex_vtt.test(st[1])) || regex.test(st[1])) { // . srt + .vtt
			isSub = !0;
			/* do: resolve time from RegExp */
			time = ((mt === "vtt")?regex_vtt:regex).exec(st[1]);

			/* do: if .vtt store settings */
			if(mt === "vtt") {set = st[3];}
			/* do: else on .srt */
			else {
				/* do: put together cue text lines in st[i] where i>2 with linebreak */
				if(st.length > 2) {for(var i=3; i<st.length; i++) {txt += '\n'+st[i];}}
				/* do: add linebreak for separator "|" */
				if(typeof(txt) === "undefined") {return;}
				txt = txt.replace(/\|/g, '\n');
			}
		}
		else if(regex_sbv.test(st[0])) {isSub = !0; time = regex_sbv.exec(st[0]); txt = st[1];} // .sbv + .sub
		/* do: add track */
		if(isSub) {v.push({from: LBP.toSec(time[1]), to: LBP.toSec(time[2]), txt: LBP.wrapSubs(txt), set: set});}
	};

	/* do: create track object */
	this.vars.subs[lang] = {label: label, mimetype: mt, track: []};

	/* do: needed to ensure we got .vtt-file with "WEBVTT" signature as first line */
	var isVTT = !1;

	/* do: resolve track content */
	for(var s in tracks) {
		if(typeof(tracks[s]) === "function"){continue;}
		var st = tracks[s].split('\n');
		/* do: add tracks to player */

		if(LBP.inArray(["plain", "x-srt", "x-subrip", "vobsub"], mt)) {addTrack(mt, st, this.vars.subs[lang].track);}
		/* do: resolve vtt track informations */
		else if(mt === "vtt") {
			/* do: verify for the .vtt-file "WEBVTT" signature or continue */
			if(!isVTT) {if(/^WEBVTT$/.test(st[0])) {isVTT = !0;} continue;}
			/* do: resolve vtt track */
			st = resolveVTT(this, st);

			/* do: add vtt track to player */
			if(typeof(st[0]) !== "string") {
				for(var j = 0; j < st.length; j++) {addTrack(mt, st[j], this.vars.subs[lang].track);}
			} else {addTrack(mt, st, this.vars.subs[lang].track);}
		}
	}
};
/* fct: resolve xml-subtitle */
LBP.prototype.resolveXMLSubs = function(src, lang, label, mt){
	var xhr = LBP.XHR(src);
	if(xhr == null || xhr.status === 404) {return;}
	var xml = (new DOMParser()).parseFromString(xhr.responseText, "text/xml");

	/* do: create track object */
	this.vars.subs[lang] = {label: label, mimetype: mt, track: []};

	/* do: resolve track content */
	var s, st, nodes = xml.childNodes[0].childNodes;
	for(s in nodes) {
		if(typeof(nodes[s]) === "function"){continue;}
		if(!isNaN(s)) {
			var id = null, tf, tt, t = "";
			for(st in nodes[s].childNodes) {
				if(typeof(nodes[s].childNodes[st]) === "function"){continue;}
				if(!isNaN(st)) {
					var c = nodes[s].childNodes[st].textContent;
					switch(nodes[s].childNodes[st].tagName) {
						case "id": id = parseInt(c, 10); break;
						case "from": tf = LBP.toSec(c); break;
						case "to": tt = LBP.toSec(c); break;
						case "content": t = LBP.wrapSubs(LBP.trimSubs(c)); break;
					}
				}
			}
			/* do: add track */
			if(id !== null) {this.vars.subs[lang].track.push({from: tf, to: tt, txt: t});}
		}
	}
};
/* fct: resolve xml_ttai1-subtitle */
LBP.prototype.resolveXMLTTSubs = function(src, lang, label, mt){
	var xhr = LBP.XHR(src);
	if(xhr == null || xhr.status === 404) {return;}
	var xml = (new DOMParser()).parseFromString(xhr.responseText, "text/xml");

	/* do: create track object */
	this.vars.subs[lang] = {label: label, mimetype: mt, track: []};

	/* do: resolve track content */
	var s, st, stp, nodes = xml.childNodes[0].childNodes;
	for(s in nodes) {
		if(typeof(nodes[s]) === "function"){continue;}
		if(!isNaN(s) && LBP.isTag(nodes[s], "body")) {
			for(st in nodes[s].childNodes) {
				if(typeof(nodes[s].childNodes[st]) === "function"){continue;}
				if(!isNaN(st) && LBP.isTag(nodes[s].childNodes[st], "div")) {
					for(stp in nodes[s].childNodes[st].childNodes) {
						if(typeof(nodes[s].childNodes[st].childNodes[stp]) === "function"){continue;}
						if(!isNaN(st) && LBP.isTag(nodes[s].childNodes[st].childNodes[stp], "p")) {
							var tf, tt, t = "";
							tf = LBP.toSec(nodes[s].childNodes[st].childNodes[stp].getAttribute("begin").replace(/[a-zA-Z]/, ""));
							tt = LBP.toSec(nodes[s].childNodes[st].childNodes[stp].getAttribute("end").replace(/[a-zA-Z]/, ""));
							t = LBP.wrapSubs(LBP.trimSubs(nodes[s].childNodes[st].childNodes[stp].textContent));
							/* do: add track */
							this.vars.subs[lang].track.push({from: tf, to: tt, txt: t});
						}
					}
				}
			}
		}
	}
};
/* fct: do something if special keys pressed */
LBP.prototype.onKeydown = function(e) {
	LBP.onKeyAction = false;
	/* do: check of media focused */
	if(LBP.playerFocused.id === this.options.vid) {LBP.isMediaEvent = true;}
	/* do: get key */
	var kc  = ((window.event) ? window.event.keyCode : e.keyCode);
	/* do: get action on key */
	if(this.vars.keyDownAction[kc] !== undefined) {eval(this.vars.keyDownAction[kc]);}
	else {LBP.onKeyAction = true; if(!this.vars.fullscreen){LBP.isMediaEvent = false;}}
};
/* fct: do something if special keys released */
LBP.prototype.onKeyup = function(e) {
	/* do: get key */
	var kc  = ((window.event) ? window.event.keyCode : e.keyCode);
	/* do: get action on key */
	if(this.vars.keyUpAction[kc] !== undefined) {eval(this.vars.keyUpAction[kc]);}
};
/* fct: set video element in window focus */
LBP.prototype.setPlayerInFocus = function(vid) {
	/* do: if fullscreen break here */
	if(this.vars.fullscreen) {return;}
	var el = LBP.$(vid);
	if(el !== null) {
		if(LBP.playerFocused !== null) {
			/* do: get old player id */
			var ovid = LBP.playerFocused.id;
			if(ovid !== vid) {
				/* do: focus new player */
				LBP.focusPlayer(true, vid);
				/* do: blur old player */
				LBP.focusPlayer(false, ovid);
			}
		} else {
			/* do: focus player element */
			LBP.focusPlayer(true, vid);
		}

		/* do: get position of focused player */
		var selectedPosX = 0, selectedPosY = 0, top = 50;
		while(el !== null) {
			selectedPosX += el.offsetLeft; selectedPosY += el.offsetTop;
			el = el.offsetParent;
		}
		/* do: scroll to focused player */
		window.scrollTo(selectedPosX, selectedPosY - top);
	}
};
/* fct: try to find next suitable video player */
LBP.prototype.getNextPlayer = function() {
	if(LBP.playerFocused !== null) {
		var pl = _LBP_Player, i = pl.indexOf(this), vid = LBP.playerFocused.id;
		if(vid === this.options.vid && i < parseInt(pl.length-1,10)) {this.setPlayerInFocus(pl[parseInt(i+1, 10)].options.vid);}
		else {this.setPlayerInFocus(pl[0].options.vid);}
	}
};
/* fct: create and set embed code (experimental) */
LBP.prototype.createEmbedCode = function(type) {
	var vid = this.options.vid, isEmbedded = false, elId = vid+"_embed";

	/* do: overwrite/clear innerHTML of source code element */
	LBP.$(elId+"_code_user").innerHTML = "";

	/* do: get domain url */
	var url = document.URL;
	var pos_url = url.lastIndexOf('/');
	url = url.substring(0, pos_url+1);

	/* do: create embed code for player */
	var lbp = "";

	/* do: create js-source link elements */
	var jsCode = document.getElementsByTagName("script");
	for(var i=0, j=jsCode.length; i<j; i++) {if((jsCode[i].src).toLowerCase().indexOf('leanbackplayer') > -1) {
		if((jsCode[i].src).match(/(\?embed\s*)/)) {isEmbedded = true;}
		var pos_js = (jsCode[i].src).lastIndexOf('?'); // check for "?" when they are cached or embedded
		pos_js = ((pos_js > 0) ? pos_js : (jsCode[i].src).length);
		var jsSrc = (jsCode[i].src).substring(0, pos_js);
		var js = document.createElement("script");
		LBP.mergeObjs(js, {type: "text/javascript", src: jsSrc+"?embed"});
		var p_js = document.createElement("div"); p_js.appendChild(js);
		lbp += p_js.innerHTML+"\r\n";
	}}

	/* do: create css-style link elements */
	var cssStyles = document.getElementsByTagName("link");
	for(var k=0, l=cssStyles.length; k<l; k++) { if((cssStyles[k].href).toLowerCase().indexOf('leanbackplayer') > -1) {
		var pos_css = (cssStyles[k].href).lastIndexOf('?'); // check for "?" when they are cached
		pos_css = ((pos_css > 0) ? pos_css : (cssStyles[k].href).length);
		var cssHref = (cssStyles[k].href).substring(0, pos_css);
		var css = document.createElement("link");
		LBP.mergeObjs(css, {rel: "stylesheet", media: "screen", type: "text/css", title: "theme", href: cssHref+"?embed"});
		var p_css = document.createElement("div"); p_css.appendChild(css);
		lbp += p_css.innerHTML+"\r\n";
	}}

	/* do: store real embed code for changes */
	var txt = this.vars.embedCode;

	/* do: change sources (href,src,poster) and rewrite/remove/change of the leanback-player-video child elements */
	if(!isEmbedded) {
		txt = txt.replace(/(\s)\s+/g, "$1"); // remove double whitespaces
		txt = txt.replace(/&quot;/g, "'"); // change quotation marks
		txt = txt.replace(/(type=)"(\.*); (codecs=)'(\.*)'"/g, '$1\'$2; $3"$4"\'');	// rewrite types of video-elements sources
	}

	/* do: add options + setup of LBP and extensions */
	// TODO: embed LBP options
	for(var e in LBP.Exts.Setup) {
		LBP.log("Experimental embed-code output follows:", "info");
		LBP.log(e);
		LBP.log(LBP[e]);
	}

	/* do: show embed element */
	LBP.showEl(elId+"_code");
	/* do: add content to embed element and select for copy+paste */
	switch(type) {
		case "video": LBP.$(elId+"_code_user").value = lbp+"\r\n<div class=\"leanback-player-video\">"+txt+"</div>"; LBP.$(elId+"_code_user").select(); break;
		case "url": LBP.$(elId+"_code_user").value = document.URL; LBP.$(elId+"_code_user").select(); break;
	}
};
/* fct: get translation from files else debug info to console */
LBP.prototype.getTranslation = function(v, s) {
	/* do: check if Lang is set, write debugging info for developers to console */
	if(typeof(LBP.Lang) === "undefined") {LBP.log("object \"LBP.Lang\" undefined", "info"); return "";}

	/* inner-fct: replace if neccessary and get translation */
	var checkReplacements = function(str, s) {
		if(typeof(str) === "object" || typeof(s) === "undefined") {return str;}
		/* do: replace all strings from array s in str */
		else if(typeof(s) === "object" && s.length) {for(var i=0, j=s.length; i<j; i++) {str = str.replace("$"+i, s[i]);} return str;}
		/* do: replace string s in str */
		else if(typeof(s) === "string") {return str.replace("$0", s);}
	};
	/* do: check if value is available in browser language translation */
	if(typeof(LBP.Lang[this.vars.isBrowserLang][v]) !== "undefined") {return checkReplacements(LBP.Lang[this.vars.isBrowserLang][v], s);}
	/* do: check if value is available in default language translation, write debugging info for developers to console */
	else if(typeof(LBP.Lang[this.options.defaultLanguage][v]) !== "undefined") {if(!LBP.inArray(this.vars.lostTranslations, v)) {this.vars.lostTranslations.push(v); LBP.log("translation of \""+v+"\" not available in browser language", "info");} return checkReplacements(LBP.Lang[this.options.defaultLanguage][v], s);}

	/* do: write debugging info for developers to console */
	if(!LBP.inArray(this.vars.lostTranslations, v)) {this.vars.lostTranslations.push(v); LBP.log("translation of \""+v+"\" not available in any language", "info");}

	/* do: else return empty string */
	return "##"+v+"##";
};
/** ------------------------------ */
/* fct: get an element by given id or CSS-class */
LBP.$ = function(id) {
	var $id = null, exp = /^(?:(\.))(.*)$/;
	if(exp.test(id)) {$id = {$1: RegExp.$1, $2: RegExp.$2};}

	if(!$id && typeof(document.getElementById(id)) !== null) {return document.getElementById(id);}
	else if($id && $id.$1 && typeof(document.getElementsByClassName($id.$2)) !== null && document.getElementsByClassName($id.$2).length > 0) {return document.getElementsByClassName($id.$2);}
	return null;
};
/* fct: log o to browser console */
LBP.log = function(o, t) {
	/* do: "firebug" like console using function t (info, error, ...) */
	if(typeof(window.console) === 'object' && typeof(t) !== "undefined" && typeof(window.console[t]) !== "undefined") {window.console[t](o); return;}
	/* do: Opera postError */
	else if(typeof(window.opera) === 'object' && typeof(window.opera.postError) !== "undefined") {window.opera.postError(o); return;}
	/* do: Window console */
	else if(typeof(window.console) === 'object' && typeof(window.console.log) !== "undefined") {window.console.log(o); return;}
};
/* fct: monkey patching with pre-processing */
LBP.preExtend = function(fn, src) {
	/* do: monkey patching fct.onStop */
	var oldFn = LBP.prototype[fn];
	LBP.prototype[fn] = function() {
		/* do: perform pre-processing */
		src.call(this, arguments);
		/* do: call the original function */
		oldFn.apply(this, arguments);
	};
};
/* fct: monkey patching with post-processing */
LBP.postExtend = function(fn, src) {
	/* do: monkey patching fct.onStop */
	var oldFn = LBP.prototype[fn];
	LBP.prototype[fn] = function() {
		/* do: call the original function */
		oldFn.apply(this, arguments);
		/* do: perform post-processing */
		src.call(this, arguments);
	};
};
/* fct: add event to given object */
LBP.addEvent = function(obj, type, fn) {
	var o = ((typeof(obj) === "object") ? obj : LBP.$(obj));
	if(o.addEventListener) {o.addEventListener(type, fn, false);}
	else if(o.attachEvent) {
		o['e'+type+fn] = fn;
		o[type+fn] = function(){o['e'+type+fn](window.event);};
		o.attachEvent('on'+type, o[type+fn]);
	} else {
		LBP.log("Adding Event \""+type+"\" to object failed. No event attaching mechanism available or same-origin-policy prevents to access element.", "warn");
	}
};
/* fct: remove event from given object */
LBP.removeEvent = function(obj, type, fn) {
	var o = ((typeof(obj) === "object") ? obj : LBP.$(obj));
	if(o.removeEventListener) {o.removeEventListener(type, fn, false);}
	else if(o.detachEvent) {
		o.detachEvent('on'+type, o[type+fn]);
		o[type+fn] = null;
	} else {
		LBP.log("Removing Event \""+type+"\" from object failed. No event detaching mechanism available or same-origin-policy prevents to access element.", "warn");
	}
};
/* fct: check if element e in array a */
LBP.inArray = function(ar, e) {
    for(var i=0, arl=ar.length; i<arl; i++) {if(ar[i] === e) {return true;}} return false;
};
/* fct: create element and append element as child to object */
LBP.createHTMLEl = function(obj, tagName, attr) {
	var o = ((typeof(obj) === "object") ? obj : LBP.$(obj));
	var el = document.createElement(tagName); el = LBP.mergeObjs(el, attr);
	if(typeof(o) === "object" && o !== null) {o.appendChild(el);}
	return el;
};
/* fct: check if content-tag t is @tag */
LBP.isTag = function(t, tag) {return (t.tagName && t.tagName.toLowerCase() === tag);};
/* fct: merge two objects */
LBP.mergeObjs = function(e, obj2) {var el = ((typeof(e) !== "string") ? e : LBP.$(e)); if(typeof(el) !== "undefined" && el !== null) {for(var p in obj2) {try{if(!!el.setAttribute && typeof(el[p]) === "undefined" && !p.match(/on/)) {el.setAttribute(p, obj2[p]);} el[p] = obj2[p];} catch(ex) {LBP.log("Setting property \""+p+"\" failed with message:\n-> "+ex, "warn");}}} return el; };
/* fct: add css class to element */
LBP.addCssClass = function(e, c) {
	var el = ((typeof(e) === "object") ? e : LBP.$(e)), cn; if(el === null) {return;}
	cn = ((el.className.length > 0) ? el.className.split(" ") : []);
	if(LBP.inArray(cn, c)) {return;}
	else {cn.push(c); LBP.mergeObjs(el, {className: cn.join(" ")});}
};
/* fct: add css class to element */
LBP.removeCssClass = function(e, c) {
	var el = ((typeof(e) === "object") ? e : LBP.$(e)), cn; if(el === null) {return;}
	cn = ((el.className.length > 0) ? el.className.split(" ") : []);
	if(!LBP.inArray(cn, c)) {return;}
	for(var i=0; i<cn.length; i++) {if(cn[i] === c){cn.splice(i,1); i--;}} LBP.mergeObjs(el, {className: cn.join(" ")});
};
/* fct: set css style to element */
LBP.setCssStyle = function(e, s, v) {
	var el = ((typeof(e) === "object") ? e : LBP.$(e)); if(el === null) {return;}
	/* do: check if s + v are arrays of styles */
	if((typeof(s) === "object" && s.length) && (typeof(v) === "object" && v.length)) {for(var i=0, sl=s.length; i<sl; i++) {if(typeof(el.style) !== "undefined"){el.style[s[i]] = v[i];}}}
	/* do: set one style only */
	else if(typeof(el.style) !== "undefined"){el.style[s] = v;}
};
/* fct: get player object by id */
LBP.getPlayer = function(id) {
	if(id === null) {return;}
    for(var i=0, j=_LBP_Player.length; i<j; i++) {if(id.indexOf(_LBP_Player[i].options.vid) !== -1) {return _LBP_Player[i];}}
	return;
};
/* fct: blur/focus player */
LBP.focusPlayer = function(f, vid) {
	/* innerFct: blur player */
	var blurPlayer = function(o, vid) {
		/* do: blur player */
		LBP.$(vid).focused = false;
		if(o.vars.videoPlayer) {
			/* do: add unfocused CSS class */
			LBP.addCssClass(vid, "h5_lb_unfocused");
			LBP.addCssClass(vid+"_poster", "h5_lb_unfocused");
		}
		/* do: hide info control */
		if(LBP.$(vid+"_info_control_content") !== null) {
			o.vars.infoControlActivated = false; o.vars.infoControlActive = 0;
			LBP.hideEl(vid+"_info_control_content");
		}
		/* do: clear delayed hiding task */
		window.clearInterval(o.vars.mouseMoveProc);
		/* do: store paused status */
		o.vars.seeking.playing = !o.html5Obj.paused;
		/* do: pause player */
		if(!o.html5Obj.paused) {o.onPlay();} o.vars.stoped = true;
		// LBP.showEl(vid+"_big_play_button");
		/* do: show controls */
		o.setControls(true);
		/* do: hide controls only if video player and big play button is active */
		if(o.vars.videoPlayer && LBP.inArray(o.options.controlsExtra, "BigPlay")) {o.setBigPlayButton(true); o.setControls(false);}
		/* do: hide subtitles */
		o.vars.seeking.subs = !o.vars.hideSubtitle; o.setSubtitle(false);
		/* do: handle buffering */
		if(o.options.handleBufferingOnFocusLost) {
			/* do: now handle buffering (delayed) */
			if(o.options.handleBufferingOnFocusLost) {
				window.setTimeout(function() {o.handleBufferingOnFocus(false);}, 250);
			}
		}
		/* do: set poster */
		o.setPoster();
	};

	/* do: if fullscreen */
	var o = LBP.getPlayer(vid);
	if(typeof(o) !== "undefined" && o.vars.fullscreen) {return;}
	if(f) {
		/* do: focus player */
		LBP.$(vid).focused = true; LBP.$(vid).focus();
		/* do: remove unfocused CSS class */
		LBP.removeCssClass(vid, "h5_lb_unfocused");
		LBP.removeCssClass(vid+"_poster", "h5_lb_unfocused");
		LBP.playerFocused = LBP.$(vid);
		if(o){
			/* do: show subtitles (depending on status of var) */
			o.setSubtitle(o.vars.seeking.subs);
			/* do: handle buffering */
			if(o.options.handleBufferingOnFocusLost) {
				o.handleBufferingOnFocus(true);
			}
		}

		/* do: unfocus and pause if pauseOnPlayerSwitch and clicked outside before */
		if(LBP.playerWasFocused !== null) {
			var avid = LBP.playerWasFocused.id;
			var ao = LBP.getPlayer(avid);
			if(ao && avid !== vid && ao.options.pauseOnPlayerSwitch) {
				/* do: blur player */
				blurPlayer(ao, vid);
			}
			LBP.playerWasFocused = null;
		}
	} else {
		/* do: get active player id */
		var avid = LBP.playerFocused.id;
		if(o) {
			/* do: store subtitle status */
			o.vars.seeking.subs = !o.vars.hideSubtitle;
			/* do: pause old player if new player just focused or pauseOnFocusLost- or handleBuffering-option is true */
			if((avid !== vid && o.options.pauseOnPlayerSwitch) || o.options.pauseOnFocusLost || o.options.handleBufferingOnFocusLost) {
				/* do: blur player */
				blurPlayer(o, vid);
			}
		}
		/* do: overwrite global playerFocused var if not set to another player */
		if(avid === vid){o.vars.seeking.subs = !o.vars.hideSubtitle; LBP.playerWasFocused = LBP.playerFocused; LBP.playerFocused = null; LBP.isMediaEvent = false;}
	}
};
/* fct: get browser language */
LBP.getBrowserLang = function() {
	var n = navigator, bl = ((n.language)?n.language:(n.browserLanguage)?n.browserLanguage:(n.userLanguage)?n.userLanguage:(n.isBrowserLang)?n.isBrowserLang:"en").replace(/[-_]/g, "-"), blc = bl.lastIndexOf('-');
	return ((blc>0)?bl.substring(0, blc):bl);
};
/* fct: get position from e.clientX relativ to elements (id) width */
LBP.getPosition = function(e, id) {
	var o = LBP.$(id), pLeft = o.offsetLeft, w = LBP.getElemStyle(id, "width"), ew = (isNaN(w) || w <= 0)?o.offsetWidth:w;
	while(o = o.offsetParent) {pLeft += o.offsetLeft;}
	/* do: calculate + return position */
	return Math.max(0, Math.min(1, (e.clientX - pLeft) / ew));
};
/* fct: get size of browser */
LBP.getBrowserSizeXY = function(b) {
	var b = b||false;
	/* do: prevent same-origin-policy and documentElement error */
	try {
		var intH = 0, intW = 0, chk = ((location !== window.parent.location)||false), w = (b?window.parent : window), d = (b?window.parent.document:document), dEl, dB;
		/* do: TV devices */
		if(LBP.isTV) {intH = screen.height; intW = screen.width;}
		/* do: non-IE */
		else if(typeof w.innerWidth  === 'number' ) {intH = w.innerHeight; intW = w.innerWidth;}
		/* do: IE 6+ in 'standards compliant mode' */
		else if((dEl = d.documentElement) && (dEl.clientWidth || dEl.clientHeight)) {intH = dEl.clientHeight; intW = dEl.clientWidth;}
		/* do: IE 4 compatible */
		else if((dB = d.body) && (dB.clientWidth || dB.clientHeight)) {intH = dB.clientHeight; intW = dB.clientWidth;}

		return {width: parseInt(intW, 10), height: parseInt(intH, 10)};
	} catch(ex) {LBP.log(ex.message, "warn"); return;}
};
/* fct: keep size ratio on resizing */
LBP.resizeToBrowser = function(h,w, bsXY) {
	var bsXY = (!!bsXY)?bsXY:LBP.getBrowserSizeXY(), maxH = bsXY.height, maxW = bsXY.width, maxR = maxH/maxW, ratio = h/w;
	/* do: size to browser width+height */
	var newW = Math.round(w*(maxH/h)), newH = Math.round(h*(maxW/w));
	if(newW > maxW) {return {h: newH, w: maxW};}
	else {return {h: maxH, w: newW};}
};
/* fct: receive (CORS) IFrame postMessage events */
LBP.receiveIframeEvent = function(e) {
	var data = JSON.parse(e.data)||false;
	if(!!data && data.action === "setScreen") {
		LBP.setIframeParentScreen(e);
	} else if(!!data && data.action === "getCorsStatus") {
		var target = (e.source.postMessage) ? e.source : false, vid = data.vid, ifr = LBP.$(vid)||false;
		if(target && ifr) {
			var cors = (ifr.src.indexOf(window.location.host) === -1), iframe = cors;
			if(!cors) {iframe = (target.location !== window.location);}
			target.postMessage(JSON.stringify({action: "setCorsStatus", vid: vid, cors: cors, iframe: iframe}), "*");
		}
	}
};
/* fct: set (CORS) IFrame parent and notify via postMessage to IFrame player */
LBP.setIframeParentScreen = function(e) {
	var src = e.source, data = JSON.parse(e.data), fs = data.value, target = src.postMessage ? src : false;
	
	/* do: if not yet, create an IFrame object */
	if(!!LBP.$(data.vid) && typeof(_LBP_IFrames[data.vid]) === "undefined") {_LBP_IFrames[data.vid] = {fullscreen: false, hasEvent: false};}
	
	if(fs !== _LBP_IFrames[data.vid].fullscreen) {
		/* do: store fullscreen-value to IFrame object */
		_LBP_IFrames[data.vid].fullscreen = fs;
		
		/* do: set some vars */
		var vid = data.vid, b, d = document.documentElement, ifr = LBP.$(vid);
		
		/* do: get browser dimensions */
		var bsXY = LBP.getBrowserSizeXY(), cors = (ifr.src.indexOf(window.location.host) === -1);

		/* do: set full-screen/-window */
		if(fs && cors) {
			/* do: store document overflow style (scroll bars) */
			if(typeof(_LBP_IFrames[vid].overflow) === "undefined") {_LBP_IFrames[vid].overflow = d.style.overflow;}
			/* do: hide document overflow (scroll bars) */
			LBP.setCssStyle(d, "overflow", "hidden");
			/* do: store IFrame style */
			if(typeof(_LBP_IFrames[vid].style) === "undefined") {_LBP_IFrames[vid].style = LBP.$(data.vid).getAttribute("style");}
			/* do: set full-window style */
			LBP.setCssStyle(ifr, ["height", "width"], [bsXY.height+"px", bsXY.width+"px"]);
			/* do: reset IFrame css class */
			LBP.removeCssClass(ifr, "h5_lb_player_smallscreen");
			LBP.addCssClass(ifr, "h5_lb_player_fullscreen");
		}
		/* do: set small-screen */
		else if(!fs && cors) {
			/* do: reset document overflow (scroll bars) */
			LBP.setCssStyle(d, "overflow", _LBP_IFrames[vid].overflow);
			/* do: reset IFrame style */
			LBP.$(vid).setAttribute("style", _LBP_IFrames[vid].style);
			/* do: reset IFrame css class */
			LBP.removeCssClass(ifr, "h5_lb_player_fullscreen");
			LBP.addCssClass(ifr, "h5_lb_player_smallscreen");
			
		}
		
		/* do: postMessage to IFrame (target) to set up IFrame  inner-content */
		if(!!target) {target.postMessage(JSON.stringify({action: "setScreen", value: data.value, vid: vid, bsXY: (!fs)?null:bsXY, cors: cors}), "*");}
		
		if(!_LBP_IFrames[vid].hasEvent) {
			/* do: something if window size changed */
			(function(e, data, _LBP_IFrames) {LBP.addEvent(window, "resize", function() {if(data.value && _LBP_IFrames[data.vid].fullscreen) {_LBP_IFrames[data.vid].fullscreen = !_LBP_IFrames[data.vid].fullscreen; LBP.setIframeParentScreen(e);}});}(e, data, _LBP_IFrames));
			_LBP_IFrames[vid].hasEvent = true;
		}
	}
};
/* fct: try to fix iPads "on"click event */
LBP.fixTouch = function(o) {
	if(!LBP.isMobile || !window.Touch) {return;}

	var el = ((typeof(o) === "object") ? o : LBP.$(o));
	/* do: try to fix elements "on"click event */
	LBP.mergeObjs(el, {ontouchstart: function(e) {if(this.onclick !== null){this.onclick(e.touches.item(0)); e.preventDefault();}}});
};
/* fct: show element */
LBP.showEl = function(el) {if(LBP.$(el) !== null) {LBP.$(el).style.display = "block";}};
/* fct: hide element */
LBP.hideEl = function(el) {if(LBP.$(el) !== null) {LBP.$(el).style.display = "none";}};
/* fct: get css-style attribute of element */
LBP.getElemStyle = function(el, attr) {
	var el = ((typeof(el) === "object") ? el : LBP.$(el)), y; if(el === null) {return 0;}
	/* do: if currentStyle get value; also fix css styles of attribute (cssAttr) */
	if(el.currentStyle) {var cssAttr = "css"+attr.charAt(0).toUpperCase()+attr.slice(1); y = ((el.currentStyle[attr]) ? el.currentStyle[attr] : el.currentStyle[cssAttr]);}
	/* do: else if computedStyle get value */
	else if(window.getComputedStyle){y = document.defaultView.getComputedStyle(el,null).getPropertyValue(attr);}
	return ((typeof(y) === "undefined" || y === null) ? false : ((y !== null && y.lastIndexOf("px") !== -1) ? parseInt(y,10) : y));
};
/* fct: get elements offset height + width */
LBP.getElemOffset = function(el) {
	/* do: calculate height with all paddings and borders */
	var pT = LBP.getElemPaddingWidth(el).top;
	var pB = LBP.getElemPaddingWidth(el).bottom;
	var bT = LBP.getElemBorderWidth(el).top;
	var bB = LBP.getElemBorderWidth(el).bottom;
	var mT = LBP.getElemMarginWidth(el).top;
	var mB = LBP.getElemMarginWidth(el).bottom;
	var h = parseInt(((LBP.$(el) !== null) ? LBP.$(el).style.height : 0), 10);
	if(isNaN(h)) {h=0;}
	/* do: calculate width with all paddings and borders */
	var pL = LBP.getElemPaddingWidth(el).left;
	var pR = LBP.getElemPaddingWidth(el).right;
	var bL = LBP.getElemBorderWidth(el).left;
	var bR = LBP.getElemBorderWidth(el).right;
	var mL = LBP.getElemMarginWidth(el).left;
	var mR = LBP.getElemMarginWidth(el).right;
	var w = parseInt(((LBP.$(el) !== null) ? LBP.$(el).style.width : 0), 10);
	if(isNaN(w)) {w=0;}

	return {height: parseInt(pT + bT + mT + pB + bB + mB + h, 10), width: parseInt(pL + bL + mL + pR + bR + mR + w, 10)};
};
/* fct: get elements width with borders */
LBP.getElemBorderWidth = function(el) {
	var t = ((!!LBP.getElemStyle(el, "borderTopWidth")) ? LBP.getElemStyle(el, "borderTopWidth") : LBP.getElemStyle(el, "border-top-width"));
	var r = ((!!LBP.getElemStyle(el, "borderRightWidth")) ? LBP.getElemStyle(el, "borderRightWidth") : LBP.getElemStyle(el, "border-right-width"));
	var b = ((!!LBP.getElemStyle(el, "borderBottomWidth")) ? LBP.getElemStyle(el, "borderBottomWidth") : LBP.getElemStyle(el, "border-bottom-width"));
	var l = ((!!LBP.getElemStyle(el, "borderLeftWidth")) ? LBP.getElemStyle(el, "borderLeftWidth") : LBP.getElemStyle(el, "border-left-width"));

	if(isNaN(t)) {t=0;} if(isNaN(r)) {r=0;} if(isNaN(b)) {b=0;} if(isNaN(l)) {l=0;}
	return {top:t, right:r, bottom:b, left:l};
};
/* fct: get elements width with paddings */
LBP.getElemPaddingWidth = function(el) {
	var t = ((!!LBP.getElemStyle(el, "paddingTop")) ? LBP.getElemStyle(el, "paddingTop") : LBP.getElemStyle(el, "padding-top"));
	var r = ((!!LBP.getElemStyle(el, "paddingRight")) ? LBP.getElemStyle(el, "paddingRight") : LBP.getElemStyle(el, "padding-right"));
	var b = ((!!LBP.getElemStyle(el, "paddingBottom")) ? LBP.getElemStyle(el, "paddingBottom") : LBP.getElemStyle(el, "padding-bottom"));
	var l = ((!!LBP.getElemStyle(el, "paddingLeft")) ? LBP.getElemStyle(el, "paddingLeft") : LBP.getElemStyle(el, "padding-left"));
	if(isNaN(t)) {t=0;} if(isNaN(r)) {r=0;} if(isNaN(b)) {b=0;} if(isNaN(l)) {l=0;}
	return {top:t, right:r, bottom:b, left:l};
};
/* fct: get elements width with paddings */
LBP.getElemMarginWidth = function(el) {
	var t = ((!!LBP.getElemStyle(el, "marginTop")) ? LBP.getElemStyle(el, "marginTop") : LBP.getElemStyle(el, "margin-top"));
	var r = ((!!LBP.getElemStyle(el, "marginRight")) ? LBP.getElemStyle(el, "marginRight") : LBP.getElemStyle(el, "margin-right"));
	var b = ((!!LBP.getElemStyle(el, "marginBottom")) ? LBP.getElemStyle(el, "marginBottom") : LBP.getElemStyle(el, "margin-bottom"));
	var l = ((!!LBP.getElemStyle(el, "marginLeft")) ? LBP.getElemStyle(el, "marginLeft") : LBP.getElemStyle(el, "margin-left"));
	if(isNaN(t)) {t=0;} if(isNaN(r)) {r=0;} if(isNaN(b)) {b=0;} if(isNaN(l)) {l=0;}
	return {top:t, right:r, bottom:b, left:l};
};
/* fct: trim subtitle, replace whitespace at begin/end */
LBP.trimSubs = function(t) {return t.replace(/(^\s+|\s+$)/g, "");};
/* fct: wrap subtitle */
LBP.wrapSubs = function(t) {return t.replace(/\n+/g, "<br/>");};
/* fct: get subtitle-time in seconds */
LBP.toSec = function(t) {var s = 0.0; if(t) {var p=t.split(':'); for(var i=0, pl=p.length; i<pl; i++) {s=s*60+parseFloat(p[i].replace(',','.'));}} return s;};
/* fct: parse time to correct format (hh:)mm:ss */
LBP.parseTimer = function(t) {
	if(isNaN(t)) {return "00:00";}
	var r, h = parseInt(t/3600, 10) % 24, m = parseInt(t/60, 10)%60, s = parseInt(t%60, 10);
	r = (h>0 ? ((h<10 ? "0"+h : h)+":") : "") + (m<10 ? "0"+m : m) +":"+ (s<10 ? "0"+s : s);
	return r;
};
/* fct: create (CORS) XHR */
LBP.XHR = function(src) {
	var xhr = false;
	try {
		try {
			/* do: try to use CORS XHR */
			if(XMLHttpRequest) {xhr = new XMLHttpRequest();	if(xhr) {xhr.open("GET", src, false); if("withCredentials" in xhr) {xhr.withCredentials = "true";}}}
			else if(XDomainRequest) {xhr = new XDomainRequest(); xhr.open("GET", src);}
		} catch(ex0) {try {xhr = new ActiveXObject("Msxml2.XMLHTTP");} catch (ex1) {try {xhr = new ActiveXObject("Microsoft.XMLHTTP");} catch(ex2) {}}}
		if(xhr) {try{xhr.overrideMimeType("text/html; charset=UTF-8");} catch(ex3){} xhr.send();}
	} catch(ex4) {LBP.log(ex4.message, "info"); xhr = {status: 404};}
	return xhr;
};
/**---------------------------------------------------------------*/
/**------------------------ LBP Vars Setup -----------------------*/
/**---------------------------------------------------------------*/
LBP.mergeObjs(LBP, {
	/* var: count player elements, for android */
	playerCount: 0,
	/* var: language */
	Lang: {},
	/* var: extensions information */
	Exts: {Setup: {}, Info: {}, User: {}, URL: {}, Name: {}, Version: {}},
	/* var: focused player */
	playerFocused: null,
	/* var: last focused player */
	playerWasFocused: null,
	/* var: initialize */
	initialize: [],
	/* var: initialize */
	initialized: false,
	/* var: options */
	options: {}
});
/* LBP Player Array */
var _LBP_Player = [];
/* LBP IFrame Array */
var _LBP_IFrames = [];
/**---------------------------------------------------------------*/
/**---------------------- OS & Device Checks ---------------------*/
/**---------------------------------------------------------------*/
/* fct: on mobile devices add a play button */
LBP.onMobileDevice = function(m, src, type) {
	var hasID = true, pid = null;
	if((m.parentNode).getAttribute("id") !== null && (m.parentNode).getAttribute("id") !== "") {pid = (m.parentNode).getAttribute("id");}
	else {pid = "h5vp_id_md"; hasID = false;}
	LBP.mergeObjs(m.parentNode, {id: pid});

	/* do: add css classes to media element and media parent */
	LBP.mergeObjs(pid, {className: "h5_lb_player h5_lb_smallscreen"});
	var t = ((type === "audio") ? "h5_lb_audio" : "h5_lb_video");
	LBP.mergeObjs(m, {className: t});
	/* do: create and add big play button */
	var bid = "mobile_play"+LBP.playerCount;

	/* do: handle media type = video */
	if(type === "video") {
		/* do: (re)create (poster) img + big play button elements and add "on"click events */
		if(LBP.isBlackBerry) {
			LBP.createHTMLEl(pid, "img", {src: m.poster, className: "poster", width: m.width, height: m.height});
			LBP.createHTMLEl(pid, "a", {id: bid, className: "big_play_button", href: src, onclick: function() {location=src;}, title: "Play"}); LBP.createHTMLEl(bid, "div");
			return;
		}
		/* do: add href to open video in native player */
		else if(LBP.isWP7) {LBP.mergeObjs(m, {href: src});}
		/* do: create big play button element and add "on"click event */
		else {
			LBP.createHTMLEl(pid, "div", {id: bid, className: "big_play_button", onclick: function() {m.play();}, title: "Play"}); LBP.createHTMLEl(bid, "div");
			/* do: hide native controls */
			m.controls = false;
		}
	}

	/* do: force first playable source to load */
	m.src = src;
	/* do: clean up */
	if(!hasID) {(m.parentNode).removeAttribute("id");}

	return;
};
/* fct: on iOS add a play button */
LBP.onIOS = function(m, src, type) {
	/* do: prepare */
	var hasID = true, pid = null;
	if((m.parentNode).getAttribute("id") !== null && (m.parentNode).getAttribute("id") !== "") {pid = (m.parentNode).getAttribute("id");}
	else {pid = "h5vp_id_ios"; hasID = false;}
	LBP.mergeObjs(m.parentNode, {id: pid+LBP.playerCount});
	/* do: add CSS classes to video element + video parent */
	LBP.mergeObjs(pid, {className: "h5_lb_player h5_lb_smallscreen"});
	var t = ((type === "audio") ? "h5_lb_audio" : "h5_lb_video");
	LBP.mergeObjs(m, {className: t});
	/* do: clean up */
	if(!hasID) {(m.parentNode).removeAttribute("id");}
	/* do: force first playable source to load */
	m.src = src;
	/* do: add proprietary airplay attribute to media tag to play from device to appleTV */
	m.setAttribute("x-webkit-airplay", "allow");
	/* do: add proprietary playsinline attribute to media tag to indicate that video should play in-line instead of full-screen, enabled in iOS 4+ only in a UIWebView with the allowsInlineMediaPlayback property set to YES */
	m.setAttribute("webkit-playsinline", "true");
	/* as explained in http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/AudioandVideoTagBasics/AudioandVideoTagBasics.html */
	/* video.load() has no effect on iOS */
	m.load();
	/* do: iOS < 4.2 force controls because of poster bug */
	if(LBP.iOSVersion < 4.2) {m.controls = true;}

	return;
};
/* do: set canPlayType extensions for browsers */
LBP.canPlayType = {
	chrome: /(\.m[p|4][3|4|v|a]|\.webm|\.og[v|g|a])/i, /* Google will drop MPEG4 support in upcoming versions */
	firefox: /(\.og[v|g|a]|\.webm)/i, /* also support for .webm in FF4+ */
	firefox3: /(\.og[v|g|a])/i,
	maxthon: /(\.m[p|4][3|4|v|a]|\.webm|\.og[v|g|a])/i,
	mobile: /(\.mp[3|4]|\.m3u8|\.ts)/i, /* mobile browsers (mobile safari, ...) mainly support .mp4; iOS also supports .m3u8- and .ts-streams */
	msie: /(\.m[p|4][3|4|v|a]|\.webm)/i, /* IE9 supports WebM "when the user has installed a VP8 codec"; recognized issues loading .m4v files in IE9 */
	opera: /(\.webm|\.og[v|g|a])/i,
	safari: /(\.m[p|4][3|4|v|a]|\.m3u8|\.ts)/i
};
/* do: check useragents "version/x.y" > @param v */
LBP.isOSVersion = function(v) {return (((/version\/(\d+\.\d+)/i.test(ua$)) && (RegExp.$1) >= v) ? true : false);};
/* do: get mobile devices */
LBP.isMobile = false; // mobile device
LBP.isAndroid = ((ua$.match(/android/i) !== null || navigator.platform.match(/android/i) !== null) && (LBP.isMobile = true)); // Android
LBP.isBlackBerry = (ua$.match(/blackberry/i) !== null && LBP.isOSVersion(6) && (LBP.isMobile = true)); // BlackBerry 6
LBP.isIPad = (ua$.match(/ipad/i) !== null && (LBP.isMobile = true));							// iOS
LBP.isIPhone = (ua$.match(/iphone/i) !== null && (LBP.isMobile = true));						// iOS
LBP.isIPod = (ua$.match(/ipod/i) !== null && (LBP.isMobile = true));							// iOS
LBP.isPlaybook = (ua$.match(/playbook.*rim tablet os/i) !== null && (LBP.isMobile = true));		// BlackBerry PlayBook Tablet
LBP.isWebOS = (ua$.match(/webos|wosbrowser|hpwos/i) !== null && (LBP.isMobile = true));			// HP/Palm webOS
LBP.isWebOS3 = (LBP.isWebOS && (/wosbrowser\/(\d+\.\d+)/i.test(ua$)) && RegExp.$1 >= 234.76 && (LBP.canPlayType.safari = /(\.mp4|\.m4v|\.og[g|a])/i));			// HP/Palm webOS > 3.0.4 (Tablet)
LBP.isWP7 = (ua$.match(/windows\sphone\sos\s7/i) !== null && ((/MSIE\s([0-9]{1,}[\.0-9]{0,})/i.test(ua$)) && (RegExp.$1) >= 9) && (LBP.isMobile = true));	// Microsoft Windows Phone 7.5 (Mango) with IE9.x
/* do: get iOS + Android version of format x.y */
LBP.iOSVersion = ((/os[\s](\d+\_\d+)/i.test(ua$)) ? ((RegExp.$1).replace("_", ".")) : 0);	// iOS < 4.x poster-bug, iOS > 4.2 supports LeanBack Player
LBP.AndroidVersion = ((/android[\s](\d+\.\d+)/i.test(ua$)) ? (RegExp.$1) : 0);				// Android >= 2.3 supports also <audio>-tag
/* do: get desktop browser */
LBP.isBrowser = ((ua$.match(/mobi[l|e|le]/i) !== null && (LBP.isMobile = true)) ? "mobile" : ((ua$.match(/msie/i) !== null) ? "msie" : ((ua$.match(/firefox/i) !== null && ((/fennec/i.test(ua$).$2) ? (LBP.canPlayType.mobile = (/(\.og[v|g|a])/i) && (LBP.isMobile = true)) : true)) ? ((ua$.match(/firefox\/3./i) !== null) ? "firefox3" : "firefox") : ((/chrom(?:(e)|(ium))\/(\d+\.\d+)/i.test(ua$) && ((RegExp.$2) ? LBP.canPlayType.chrome = (/(\.webm|\.og[v|g|a])/i) : true)) ? "chrome" : ((ua$.match(/opera/i) !== null && (!LBP.isMobile && LBP.isOSVersion(10.5) && (LBP.canPlayType.opera = ((!LBP.isOSVersion(10.6)) ? /(\.og[v|g|a])/i : LBP.canPlayType.opera))) || (LBP.isMobile && LBP.isOSVersion(12.0) && (LBP.canPlayType.opera = /(\.mp4|\.og[g|a])/i))) ? "opera" : (((/maxthon\/(\d+\.\d+)/i.test(ua$)) && (RegExp.$1) >= 3) ? "maxthon" : ((ua$.match(/epiphany\/(\d+\.\d+)\.(\d+)/i) !== null && ((RegExp.$1) > 2.30 || ((RegExp.$1) >= 2.30 && (RegExp.$2) >= 6))) ? "safari" : ((ua$.match(/safari/i) !== null) ? "safari" : false))))))));
LBP.isDesktop = (navigator.platform.match(/win[dows|32|64]|mac|unix|linux/i) !== null && !LBP.isMobile);	// desktop browsers
/* do: get TV devices */
LBP.isTV = (navigator.platform.match(/googletv|large\sscreen/i) !== null);			// TV devices like GoogleTV platform
/**---------------------------------------------------------------*/
/**-------------------- Setup & Initialization -------------------*/
/**---------------------------------------------------------------*/
/* fct: check if media is available and sources playable */
LBP.checkSources = function(m, type) {
	/* do: check if src is attribute of media element, need to create a source element as child of media element to go on */
	if(m.hasAttribute("src") && m.getAttribute("src") !== null) {
		var nsrc = m.getAttribute("src"), ext = ((LBP.canPlayType[LBP.isBrowser]).test(nsrc)) ? (RegExp.$1).slice(1, RegExp.$1.length) : null, tp;
		/* do: find suitable mime-type for extension */
		switch(ext) {
			case "3gp": case "3gpp": tp = type+"/3gpp"; break;
			case "mp3": tp = type+"/mpeg"; break;
			case "ts": case "m3u8": case "m4v": case "m4a": case "mp4": case "webm": case "wav": tp = type+"/"+ext; break;
			case "ogg": case "ogv": case "oga": tp = type+"/ogg"; break;
			case "mkv": tp = type+"/x-matroska"; break;
		}
		m.insertBefore(LBP.createHTMLEl(null, "source", {src: nsrc, type: tp}), m.firstChild);
	}

	/* do: get child elements of media element and define some variables */
	var c = ((m.children) ? m.children : m.childNodes), r = {lbp: false, os: false, src: null, srcs: [], flash: {}, html: {}};

	/* innerFct: get element-objects content as HTML code for Flash-/HTML-Fallback - to fix problem (bug?) within IE9 */
	var getElContent = function(m, elObj) {
		var elPar = document.createElement("div"), tag = elObj.tagName.toLowerCase(), el = document.createElement(tag), elh = elObj.innerHTML, attr = elObj.attributes;

		if(typeof(elObj.getAttribute("id")) === "undefined" || elObj.getAttribute("id") === null) {LBP.mergeObjs(elObj, {id: "leanback-player-fallback-"+tag+"-"+Math.random(new Date().getMilliseconds()*Math.random())});}

		/* do: add all element-object attributes to el */
		for(var i=0, j=attr.length; i<j; i++) {el.setAttribute(attr[i].nodeName, attr[i].nodeValue);}
		/* do: add element to a parent div to get innerHTML */
		el.innerHTML = elh; elPar.appendChild(el);

		return {id: elObj.getAttribute("id"), content: elPar.innerHTML, width: m.width, height: m.height};
	};

	/* do: search for Flash-Fallback and HTML-Fallback elements */
	for(var n=0; n<c.length; n++) {
		if(typeof(c[n]) === "undefined" && typeof(c[n].tagName) === "undefined" && n < c.length) {continue;}
		/* do: store if Flash-Fallback object tag was found */
		if(c[n].tagName !== null && typeof(c[n].className) !== "undefined" && c[n].className.toLowerCase() === "leanback-player-flash-fallback") {
			var hasFlash = false;
			try {if(typeof(navigator.plugins["Shockwave Flash"]) !== "undefined") {hasFlash = true;}}
			catch(e){if(typeof(ActiveXObject) !== "undefined" && new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {hasFlash = true;}}
			if(hasFlash) {r.flash = getElContent(m, c[n]);}
		}
		/* do: store if HTML-Fallback div tag was found */
		if(c[n].tagName !== null && typeof(c[n].className) !== "undefined" && c[n].className.toLowerCase() === "leanback-player-html-fallback") {r.html = getElContent(m, c[n]);}
    }

	/* innerFct: get canPlayType */
	var getPlayType = function(t) {return (t !== "" && (t === "probably" || t === "maybe")) ? true : false;};

	/* do: break if not able to run HTML5 media */
	if(!!!document.createElement('video').canPlayType || !!!document.createElement('audio').canPlayType) {return r;}

	/* do: prepair HTML5 media element */
	for(var i=0; i<c.length; i++) {
		if(typeof(c[i]) === "undefined" && typeof(c[i].tagName) === "undefined" && i < c.length) {continue;}
		/* do: get HTML5-Source if source tag was found */
		if(typeof(c[i].className) !== "undefined" && c[i].tagName.toLowerCase() === "source") {
			/* do: normalize tag attributes */
			var tagAttr = c[i].attributes, ntag = {};
			for(var k=0, l=tagAttr.length; k<l; k++) {ntag[tagAttr[k].nodeName] = tagAttr[k].nodeValue;}
			/* do: check for type definition; due to firefox 3.x (and others??) does not like attribute eg. type="video/ogg; codecs='theora, vorbis'", should be type='video/ogg; codecs="theora, vorbis"' */
			var t = (((/\'/).test(ntag.type)) ? (ntag.type).replace(/\'/g, '"') : ntag.type);
			/* do: get canPlayType information with the above type t */
			var playType = getPlayType(m.canPlayType(t));
			/* do: test src type */
			var srcType = (LBP.canPlayType[LBP.isBrowser]).test(ntag.src);

			/* do: check for MS WP7.x and prepare audio for LBP */
			if(LBP.isWP7 && type === "audio") {LBP.isMobile = !0; LBP.isDesktop = !0;}

			/* do: check for Palm PlayBook, WebOS >= 3.0.4 or Android >= 3 and prepare for LBP */
			if((LBP.isPlaybook || LBP.isWebOS3 || (LBP.isAndroid && LBP.AndroidVersion >= 3.1)) && LBP.isMobile && playType && srcType) {
				if(r.src === null) {r.src = ntag.src;}
				r.lbp = true; r.os = false;
				break;
			} else
			/* do: check for Palm BlackBerry, HP WebOS, MS WP7.x or Android devices */
			if(((LBP.isWebOS || LBP.isBlackBerry || LBP.isWP7) && LBP.isMobile && playType && (type === "video" || (type === "audio" && ntag.src.match(/mp3/)))) || (LBP.isAndroid && ((LBP.AndroidVersion >= 2.0 && type == "video") || (LBP.AndroidVersion >= 2.3 && (type == "video" || type == "audio"))) && srcType)) {
				/* @media, @playableSource, @mediatype */
				LBP.onMobileDevice(m, ntag.src, type);
				LBP.playerCount++;
				r.lbp = false; r.os = false;
				break;
			} else
			/* do: check for iOS devices */
			if((((LBP.iOSVersion < 4.2 && LBP.isIPad) || (LBP.iOSVersion >= 4.2 && LBP.isIPad && (typeof(LBP.options.defaultIPadControls) !== "undefined" & LBP.options.defaultIPadControls))) || LBP.isIPhone || LBP.isIPod) && srcType) {
				/* @video, @playableSource, @mediatype */
				LBP.onIOS(m, ntag.src, type);
				LBP.playerCount++;
				r.lbp = false; r.os = true;
				break;
			} else
			/* do: check for other browsers and devices */
			if((playType && (LBP.isDesktop || LBP.isTV) && (LBP.isBrowser && srcType)) || (LBP.isIPad && srcType)) {
				var l = ((r.srcs.length !== "undefined") ? r.srcs.length : 0);
				if(r.src === null) {r.src = ntag.src;}
				if(!LBP.isIPad){r.srcs[l] = {src: ntag.src, type: ((/video\/(mp4|webm|ogg)/i.test(t)) ? RegExp.$1 : null)};}
				r.lbp = true; r.os = false;
			} else
			/* do: return if not a supported desktop browser but HTML5 media is supported */
			if(playType && !LBP.isMobile && LBP.isDesktop && !LBP.isBrowser) {r = {}; break;} else
			/* do: HTML-Fallback for all other (mobile) devices */
			if(LBP.isMobile) {r.flash = {};}
		}
	}
    return r;
};
/* fct: setup players on document */
LBP.setup = function() {
	var o = {};

	/* innerFct: handle some player vars */
	var handlePlayer = function(m, pl, vars, v) {
		/* do: store initialize array to call initialize-functions before controls+content initialized */
		LBP.mergeObjs(vars, {initialize: LBP.initialize});

		/* do: store first playable source */
		LBP.mergeObjs(vars, {playableSrc: v.src});

		/* do: set video player and playable sources */
		if(pl) {LBP.mergeObjs(vars, {videoPlayer: true}); LBP.mergeObjs(vars, {playableSources: v.srcs});}
		/* do: set audio player */
		else {LBP.mergeObjs(vars, {audioPlayer: true});}

		/* do: store option preload from element for firefox < 4 */
		if(m.hasAttribute("preload") && m.getAttribute("preload") !== null) {LBP.mergeObjs(vars, {fixPreload: m.getAttribute("preload")});}

		/* do: store var autoplay */
		if(m.hasAttribute("autoplay") && m.getAttribute("autoplay") !== null) {LBP.mergeObjs(vars, {autoplay: true}); m.pause(); m.autoplay = false;}

		/* do: store option loop from element for firefox < 4 */
		if(m.hasAttribute("loop") && m.getAttribute("loop") !== null) {LBP.mergeObjs(vars, {fixLoop: true}); m.loop = false;}

		/* do: overwrite muted attribute of media element if volume is muted */
		if(m.hasAttribute("muted")) {m.muted = true;}

		/* do: hide default controls if not iPad */
		if(!LBP.isIPad) {m.controls = false;}

		return vars;
	};

	/* video player */
	var vels = document.getElementsByTagName("video")||[];
	for(var j=0; j<vels.length; j++) {
		var vvars = {}, v = vels[j], pv = v.parentNode;
		if(!pv.hasAttribute("class") || (pv.hasAttribute("class") && !pv.getAttribute("class").match(/leanback-player-video/))) {continue;}
		var vv = LBP.checkSources(v, "video");
		if(vv.lbp) {
			LBP.mergeObjs(vvars, {embedCode: pv.innerHTML});
			var pvid = ((pv.getAttribute("id") !== null) ? pv.id : "leanback-video-parent-id"+j);
			LBP.mergeObjs(pv, {id: pvid});
			var vid = ((v.getAttribute("id") !== null) ? v.id : "leanback-video-id"+j);
			LBP.mergeObjs(v, {id: vid, tabIndex: "0"});

			/* do: continue if reference to player already stored */
			if(!!LBP.getPlayer(vid)) {continue;}

			/* do: handle some player vars */
			o = {options: LBP.mergeObjs({vid: vid, pid: pvid}, LBP.options), vars: handlePlayer(v, true, vvars, vv)};

			/* do: create reference for video element to handle */
			_LBP_Player.push(new LBP(o.options, o.vars, v));
		}
		/* do: Fallback to Flash */
		else if(!vv.lbp && !vv.os && typeof(vv.flash) !== "undefined" && typeof(vv.flash.content) !== "undefined") {pv.innerHTML = vv.flash.content; LBP.setCssStyle(pv, ["width", "height"], [vv.flash.width+"px", vv.flash.height+"px"]); j--;}
		/* do: if no HTML5 and no Flash and HTML-Fallback available */
		else if(!vv.lbp && !vv.os && typeof(vv.html) !== "undefined" && typeof(vv.html.content) !== "undefined") {pv.innerHTML = vv.html.content; LBP.setCssStyle(pv, ["width", "height"], [vv.html.width+"px", vv.html.height+"px"]); j--;}
	}

	/* audio player */
	var aels = document.getElementsByTagName("audio")||[];
	for(var i=0; i<aels.length; i++) {
		var avars = {}, a = aels[i], pa = a.parentNode;
		if(!pa.hasAttribute("class") || (pa.hasAttribute("class") && !pa.getAttribute("class").match(/leanback-player-audio/))) {continue;}
		var va = LBP.checkSources(a, "audio");
		if(va.lbp) {
			LBP.mergeObjs(avars, {embedCode: pa.innerHTML});
			var paid = ((pa.getAttribute("id") !== null) ? pa.id : "leanback-audio-parent-id"+i);
			LBP.mergeObjs(pa, {id: paid});
			var aid = ((a.getAttribute("id") !== null) ? a.id : "leanback-audio-id"+i);
			LBP.mergeObjs(a, {id: aid, tabIndex: "0"});

			/* do: continue if reference to player already stored */
			if(!!LBP.getPlayer(aid)) {continue;}

			/* do: handle some player vars */
			o = {options: LBP.mergeObjs({vid: aid, pid: paid}, LBP.options), vars: handlePlayer(a, false, avars, va)};

			/* do: create reference for audio element to handle */
			_LBP_Player.push(new LBP(o.options, o.vars, a));
		}
		/* do: Fallback to Flash */
		else if(!va.lbp && !va.os && typeof(va.flash) !== "undefined" && typeof(va.flash.content) !== "undefined") {pa.innerHTML = va.flash.content; if(va.flash.width && va.flash.height) {LBP.setCssStyle(pa, ["width", "height"], [va.flash.width+"px", va.flash.height+"px"]);} i--;}
		/* do: if no HTML5 and no Flash and HTML-Fallback available */
		else if(!va.lbp && !va.os && typeof(va.html) !== "undefined" && typeof(va.html.content) !== "undefined") {pa.innerHTML = va.html.content; if(va.html.width && va.html.height) {LBP.setCssStyle(pa, ["width", "height"], [va.html.width+"px", va.html.height+"px"]);} i--;}
	}

	/* do: only if LBP not yet initialized - add meta tag element for GoogleTV device to avoid autozoom breaking the controls */
	if(!LBP.initialized) {if(LBP.isTV) {LBP.createHTMLEl(document.getElementsByTagName('head')[0], "meta", {name: "gtv-autozoom", content: "off"});}}
	
	/* IFrame player */
	var iels = document.getElementsByTagName("iframe")||false;
	if(!!iels && iels.length > 0) {
		window.addEventListener("message", LBP.receiveIframeEvent, false);
	}

	/* do: set LBP initialized after first call */
	LBP.initialized = !0;
};
/* fct: check if css ready */
LBP.init = function() {
	/* do: create a div element to test if css is loaded */
	var cssTest = document.createElement("div");
	LBP.mergeObjs(cssTest, {id: "cssTest", className: "h5_lb_css_loaded_test"});
	/* do: add div element to body, or if not to documentElement (IE8-) for this test */
	if(document.body){document.body.appendChild(cssTest);}else{document.documentElement.appendChild(cssTest);}
	/* do: test now is css is loaded */
	if(LBP.getElemStyle("cssTest", "display") === "none") {cssTest.parentNode.removeChild(cssTest); LBP.setup();}
	/* do: short delay to test again */
	else {cssTest.parentNode.removeChild(cssTest); window.setTimeout(LBP.init, 66);}
};
/* fct: on DOM ready call fct.fn */
LBP.onDOMReady = function(fn) {
	var d = document;
	/* do: if W3C-compliant browser - Opera 10.x+, FF 3.x+, Chrome, Safari, IE9 */
	if(d.addEventListener) {d.addEventListener("DOMContentLoaded", fn, false);}
	/* do: if IE (8-) */
	else if(d.attachEvent) {d.attachEvent("onreadystatechange", fn, false);}
	/* do: others go here */
	else if(d.readyState === "interactive" || d.readyState === "complete") {fn();}
};
/* call fct.init on DOM ready */
LBP.onDOMReady(LBP.init);
/**---------------------------------------------------------------*/
/**-------------------- LEANBACK PLAYER ABOVE --------------------*/
/**---------------------------------------------------------------*/
window.LBP = LBP;
// window._LBP_Player = _LBP_Player;
})(this);
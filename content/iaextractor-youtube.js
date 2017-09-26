/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
'use strict';

var youtube = {};

/* Converting video tag to video codec information */
youtube.formatDictionary = (function() {
    const KNOWN = {
        5: ['flv', '240', 'mp3', 64, null],
        6: ['flv', '270', 'mp3', 64, null],
        13: ['3gp', 'N/A', 'aac', null, null],
        17: ['3gp', '144', 'aac', 24, null],
        18: ['mp4', '360', 'aac', 96, null],
        22: ['mp4', '720', 'aac', 192, null],
        34: ['flv', '360', 'aac', 128, null],
        35: ['flv', '280', 'aac', 128, null],
        36: ['3gp', '240', 'aac', 38, null],
        37: ['mp4', '1080', 'aac', 192, null],
        38: ['mp4', '3072', 'aac', 192, null],
        43: ['webm', '360', 'ogg', 128, null],
        44: ['webm', '480', 'ogg', 128, null],
        45: ['webm', '720', 'ogg', 192, null],
        46: ['webm', '1080', 'ogg', 192, null],
        83: ['mp4', '240', 'aac', 96, null],
        82: ['mp4', '360', 'aac', 96, null],
        59: ['mp4', '480', 'aac', 128, null],
        78: ['mp4', '480', 'aac', 128, null],
        85: ['mp4', '520', 'aac', 152, null],
        84: ['mp4', '720', 'aac', 192, null],
        100: ['webm', '360', 'ogg', 128, null],
        101: ['webm', '360', 'ogg', 192, null],
        102: ['webm', '720', 'ogg', 192, null],
        120: ['flv', '720', 'aac', 128, null],
        139: ['m4a', '48', 'aac', 38, 'a'], //Audio-only
        140: ['m4a', '128', 'aac', 128, 'a'], //Audio-only
        141: ['m4a', '256', 'aac', 256, 'a'], //Audio-only
        171: ['webm', '128', 'ogg', 128, 'a'], //Audio-only
        172: ['webm', '256', 'ogg', 192, 'a'], //Audio-only
        249: ['webm', '48', 'opus', 50, 'a'], //Audio-only
        250: ['webm', '48', 'opus', 70, 'a'], //Audio-only
        251: ['webm', '128', 'opus', 160, 'a'], //Audio-only
        160: ['mp4', '144', null, null, 'v'], //Video-only
        133: ['mp4', '240', null, null, 'v'], //Video-only
        134: ['mp4', '360', null, null, 'v'], //Video-only
        135: ['mp4', '480', null, null, 'v'], //Video-only
        298: ['mp4', '720', null, null, 'v'], //Video-only (60fps)
        136: ['mp4', '720', null, null, 'v'], //Video-only
        299: ['mp4', '1080', null, null, 'v'], //Video-only (60fps)
        137: ['mp4', '1080', null, null, 'v'], //Video-only
        138: ['mp4', '2160', null, null, 'v'], //Video-only
        266: ['mp4', '2160', null, null, 'v'], //Video-only
        264: ['mp4', '1440', null, null, 'v'], //Video-only
        278: ['webm', '144', null, null, 'v'], //Video-only
        242: ['webm', '240', null, null, 'v'], //Video-only
        243: ['webm', '360', null, null, 'v'], //Video-only
        244: ['webm', '480', null, null, 'v'], //Video-only
        245: ['webm', '480', null, null, 'v'], //Video-only
        246: ['webm', '480', null, null, 'v'], //Video-only
        302: ['webm', '720', null, null, 'v'], //Video-only (60fps)
        247: ['webm', '720', null, null, 'v'], //Video-only
        303: ['webm', '1080', null, null, 'v'], //Video-only (60fps)
        248: ['webm', '1080', null, null, 'v'], //Video-only
        313: ['webm', '2160', null, null, 'v'], //Video-only
        272: ['webm', '2160', null, null, 'v'], //Video-only
        271: ['webm', '1440', null, null, 'v'], //Video-only
        308: ['webm', '1440', null, null, 'v'], //Video-only (60fps)
        315: ['webm', '2160', null, null, 'v'], //Video-only (60fps)
    };
    return function(obj) {
        var itag = obj.itag;
        if (!KNOWN[itag]) {
            return;
        }
        // get resolution from YouTube server
        var res = obj.size ? /\d+x(\d+)/.exec(obj.size) : null;
        var tmp = {
            container: KNOWN[itag][0],
            resolution: (res && res.length ? res[1] : KNOWN[itag][1]) + 'p',
            audioEncoding: KNOWN[itag][2],
            audioBitrate: KNOWN[itag][3],
            dash: KNOWN[itag][4],
        };
        if (tmp.dash === 'a') {
            tmp.quality = 'Audio-only';
        }
        if (tmp.dash === 'v') {
            tmp.quality = tmp.resolution + ' Video-only';
        }
        return tmp;
    };
})();

youtube.fetch = (url, method = 'GET', raw = false) => {
    /*
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        method: 'fetch',
        type: method,
        url
      }, response => {
        console.error(response)
        if (response && !response.error) {
          resolve(raw ? response.req : response.req.response);
        }
        else {
          reject(response.error ? response.error : 'unknown error');
        }
      });
    });
    */
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open(method, url);
        req.onload = () => resolve(raw ? req : req.response);
        req.onerror = (e) => reject(e);
        req.send();
    });
};

youtube.size = (url, pretify) => {
    function format(bytes, si) {
        const thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let u = -1;
        do {
            bytes /= thresh;
            u += 1;
        }
        while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + units[u];
    }

    return youtube.fetch(url, 'HEAD', true).then(req => {
        let size = req.getResponseHeader('Content-Length');
        size = parseInt(size);
        if (pretify && !isNaN(size)) {
            size = format(size, false);
        }
        return size;
    });
};

youtube.getFormats = (videoID) => {
    console.log('getFormats', videoID);
    return youtube.fetch('https://www.youtube.com/watch?v=' + videoID).then(content => {
        let url_encoded_fmt_stream_map = /url\_encoded\_fmt\_stream\_map\"\:\s*\"([^\"]*)/.exec(content);
        let adaptive_fmts = /adaptive\_fmts\"\:\s*\"([^\"]*)/.exec(content);
        let dashmpd = /\"dashmpd\":\s*\"([^\"]+)\"/.exec(content);
        let player = /\"js\":\s*\"([^\"]+)\"/.exec(content);
        let published_date = /datePublished.*content\="([^\"]+)/.exec(content);
        return {
            url_encoded_fmt_stream_map: url_encoded_fmt_stream_map && url_encoded_fmt_stream_map[1],
            adaptive_fmts: adaptive_fmts && adaptive_fmts[1],
            dashmpd: dashmpd && dashmpd[1] || '',
            player: player && player[1],
            published_date: published_date && published_date[1]
        };
    });
};

youtube.getExtra = (videoID) => {
    console.log('getExtra', videoID);

    function quary(str) {
        var temp = {};
        var vars = str.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === 'url_encoded_fmt_stream_map' || pair[0] === 'adaptive_fmts' || pair[0] === 'dashmpd') {
                temp[pair[0]] = unescape(pair[1]);
            } else {
                temp[pair[0]] = unescape(decodeURIComponent(pair[1]));
            }
            if (pair[0] === 'title' || pair[0] === 'author') { //Issue #4, title problem
                temp[pair[0]] = temp[pair[0]].replace(/\+/g, ' ');
            }
        }
        return temp;
    }

    return youtube.fetch(
        'https://www.youtube.com/get_video_info?hl=en_US&el=detailpage&dash="0"&video_id=' + videoID
    ).then(content => {
        const tmp = quary(content);
        if (tmp.errorcode) {
            throw Error('info server failed with: ' + tmp.reason);
        }
        return tmp;
    });
};

youtube.getInfo = (videoID) => {
    console.log('getInfo', videoID);
    return Promise.all([
        youtube.getFormats(videoID).catch(() => {}),
        youtube.getExtra(videoID).catch(() => {})
    ]).then(([frmts, extra]) => {
        let obj = Object.assign(frmts, extra);
        if (!obj.url_encoded_fmt_stream_map && !obj.adaptive_fmts) {
            throw Error('Cannot detect url_encoded_fmt_stream_map or adaptive_fmts');
        }
        return obj;
    });
};

youtube.decipher = (ccode, s = '') => {
    let sig = s.split('');

    function swap(arr, b) {
        var aa = arr[b % arr.length],
            bb = arr[0];
        arr[0] = aa;
        arr[b] = bb;
        return arr;
    }
    ccode.forEach((c, i) => {
        if (typeof c !== 'string') {
            return;
        }
        switch (c) {
            case 'r':
                sig = sig.reverse();
                break;
            case 's':
                sig = sig.slice(ccode[i + 1]);
                break;
            case 'w':
                sig = swap(sig, ccode[i + 1]);
                break;
        }
    });
    return sig.join('');
};

/* Appending itag 141 to info */
youtube.findOtherItags = (info, ccode) => {
    console.log('findOtherItags', ccode);
    let dashmpd = info.dashmpd;

    if (dashmpd.indexOf(/signature/) === -1) {
        let matchSig = (/\/s\/([a-zA-Z0-9\.]+)\/?/i.exec(dashmpd) || [null, ''])[1];
        dashmpd = dashmpd.replace('/s/' + matchSig + '/', '/signature/' + youtube.decipher(ccode, matchSig, ccode) + '/');
    }
    if (dashmpd) {
        youtube.fetch(dashmpd).then(function(response) {
            function doTag(itag) {
                let regexp = new RegExp('\<baseurl[^\>]*\>(http[^<]+itag[\=\/]' + itag + '[^\<]+)\<\/baseurl\>', 'i');
                let res = regexp.exec(response);
                if (res && res.length) {
                    if (res[1].indexOf('yt_otf') === -1) {
                        let url = res[1].replace(/&amp\;/g, '&');
                        let obj = {
                            itag
                        };
                        let format = youtube.formatDictionary(obj);
                        if (!format) {
                            return;
                        }
                        obj = Object.assign(obj, format, {
                            url
                        });
                        info.formats.push(obj);
                    } else {
                        console.error(`itag=${itag} is skipped; we are not supporting segmentation`);
                    }
                }
            }

            let availableItags = info.formats.map(o => o.itag);
            let itags = (response.match(/itag[\=\/]\d+/g))
                .map(s => s.substr(5))
                .map(i => parseInt(i))
                .filter(i => availableItags.indexOf(i) === -1);
            itags.forEach(doTag);
            return info;
        }, () => info);
    } else {
        return Promise.resolve(info);
    }
};

youtube.extractFormats = (info, ccode) => {
    console.log('extractFormats');
    let objs = [];
    [info.url_encoded_fmt_stream_map, info.adaptive_fmts].
    filter(a => a).join(',').split(',')
        .forEach(elem => {
            let pairs = elem.split('&')
                .map(function(e) {
                    let pair = e.split('=');
                    if (!pair || !pair.length) {
                        return null;
                    }
                    return [
                        pair[0],
                        decodeURIComponent(unescape(unescape(pair[1])))
                    ];
                })
                .filter(e => e)
                .reduce((p, c) => {
                    p[c[0]] = c[1];
                    return p;
                }, {});
            let url = pairs.url,
                itag = parseInt(pairs.itag);
            if (!url || !itag) {
                return;
            }

            if (url.indexOf('ratebypass') === -1) {
                url += '&ratebypass=yes';
            }
            pairs.url = url;
            pairs.itag = itag;
            if (pairs.sig) {
                pairs.url += '&signature=' + pairs.sig;
            }
            if (pairs.s) {
                pairs.url += '&s=' + pairs.s;
            }

            var format = youtube.formatDictionary(pairs);
            if (!format) {
                return;
            }
            for (let j in format) {
                pairs[j] = format[j];
            }
            objs.push(pairs);
        });

    if (!objs || !objs.length) {
        throw Error('extractFormats: No link is found');
    }
    info.formats = objs;
    delete info.url_encoded_fmt_stream_map;
    delete info.adaptive_fmts;

    return youtube.findOtherItags(info, ccode);
};

youtube.doCorrections = (info, ccode) => {
    console.log('doCorrections');
    info.formats.forEach((o, i) => {
        info.formats[i].url = o.url.replace(/\&s\=([^\&]*)/, (a, s) => '&signature=' + youtube.decipher(ccode, s));
    });
    return info;
};

/* local signature detection
 * inspired from https://github.com/gantt/downloadyoutube
 */
youtube.signatureLocal = (info) => {
    console.log('signatureLocal');

    function doMatch(text, regexp) {
        const matches = text.match(regexp);
        return matches ? matches[1] : null;
    }

    function isInteger(n) {
        return (typeof n === 'number' && n % 1 === 0);
    }
    if (!info.player) {
        throw Error('signatureLocal: Cannot resolve signature;1');
    }

    let scriptURL = info.player.replace(/\\/g, '');
    scriptURL = (scriptURL.substr(0, 2) === '//' ? 'https:' : 'https://www.youtube.com/') + scriptURL;
    console.error(scriptURL);
    return youtube.fetch(scriptURL).then((content) => {
        content = content.replace(/\r?\n|\r/g, '');
        let sigFunName =
            doMatch(content, /\.set\s*\("signature"\s*,\s*([a-zA-Z0-9_$][\w$]*)\(/) ||
            doMatch(content, /\.sig\s*\|\|\s*([a-zA-Z0-9_$][\w$]*)\(/) ||
            doMatch(content, /\.signature\s*=\s*([a-zA-Z_$][\w$]*)\([a-zA-Z_$][\w$]*\)/) ||
            doMatch(content, /set\(\"signature\"\,\s([a-zA-Z0-9_$][\w$]*)\(/);

        if (sigFunName === null) {
            throw Error('signatureLocal: Cannot resolve signature;2');
        }
        sigFunName = sigFunName.replace('$', '\\$');
        let regCode = new RegExp(
            'function \\s*' + sigFunName +
            '\\s*\\([\\w$]*\\)\\s*{[\\w$]*=[\\w$]*\\.split\\(""\\);(.+);return [\\w$]*\\.join'
        );
        let regCode2 = new RegExp(
            sigFunName +
            '\\s*\\=\\s*function\\([\\w\\$]*\\)\\s*\\{\\s*[\\w\\$]\\=[\\w\\$]*\\.split\\([^\\)]*\\)\\;(.+?)(?=return)'
        );
        let functionCode = doMatch(content, regCode);

        if (functionCode === null) {
            functionCode = doMatch(content, regCode2);
            if (functionCode === null) {
                throw Error('signatureLocal: Cannot resolve signature;3');
            }
        }

        let revFunName = doMatch(
            content,
            /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.reverse\s*\(\s*\)\s*}/
        );
        let slcFuncName = doMatch(
            content,
            /([\w$]*)\s*:\s*function\s*\(\s*[\w$]*\s*,\s*[\w$]*\s*\)\s*{\s*(?:return\s*)?[\w$]*\.(?:slice|splice)\(.+\)\s*}/
        );
        let regInline = new RegExp(
            '[\\w$]+\\[0\\]\\s*=\\s*[\\w$]+\\[([0-9]+)\\s*%\\s*[\\w$]+\\.length\\]'
        );
        let funcPieces = functionCode.split(/\s*\;\s*/),
            decodeArray = [];

        for (let i = 0; i < funcPieces.length; i++) {
            funcPieces[i] = funcPieces[i].trim();
            let codeLine = funcPieces[i];
            if (codeLine.length > 0) {
                if (codeLine.indexOf(slcFuncName) !== -1) { // slice
                    let slice = /\d+/.exec(codeLine.split(',').pop()); // oE.s4(a,43) or oE["s4"](a,43) or oE['s4'](a,43)
                    if (slice && slice.length) {
                        decodeArray.push('s', slice[0]);
                    } else {
                        throw Error('signatureLocal: Cannot resolve signature;4');
                    }
                } else if (codeLine.indexOf(revFunName) !== -1) { // reverse
                    decodeArray.push('r');
                } else if (codeLine.indexOf('[0]') >= 0) { // inline swap
                    if (i + 2 < funcPieces.length &&
                        funcPieces[i + 1].indexOf('.length') >= 0 &&
                        funcPieces[i + 1].indexOf('[0]') >= 0) {
                        let inline = doMatch(funcPieces[i + 1], regInline);
                        inline = parseInt(inline);
                        decodeArray.push('w', inline);
                        i += 2;
                    } else {
                        throw Error('signatureLocal: Cannot resolve signature;5');
                    }
                } else if (codeLine.indexOf(',') >= 0) { // swap
                    let swap = /\d+/.exec(codeLine.split(',').pop()); // oE.s4(a,43) or oE["s4"](a,43) or oE['s4'](a,43)
                    if (swap && swap.length) {
                        decodeArray.push('w', swap[0]);
                    } else {
                        throw Error('signatureLocal: Cannot resolve signature;6');
                    }
                } else {
                    throw Error('signatureLocal: Cannot resolve signature;7');
                }
            }
        }
        if (decodeArray) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({
                    ccode: decodeArray,
                    player: info.player
                }, () => {
                    let url = youtube.doCorrections({
                        formats: [{
                            url: info.formats[0].url
                        }]
                    }, decodeArray).formats[0].url;
                    youtube.size(url).then(
                        size => {
                            if (size) {
                                resolve(youtube.doCorrections(info, decodeArray));
                            } else {
                                chrome.storage.local.remove(['ccode', 'player'], () => {
                                    reject(Error('signatureLocal: Signature cannot be verified'));
                                });
                            }
                        },
                        e => reject(e)
                    );
                });
            });
        } else {
            throw Error('signatureLocal: Cannot resolve signature;8');
        }
    });
};

youtube.verify = (info, prefs) => {
    console.log('verify');
    var isEncrypted = info.formats[0].s,
        doUpdate = isEncrypted && (!prefs.player || !prefs.ccode || info.player !== prefs.player);

    if (doUpdate) {
        return youtube.signatureLocal(info);
    } else if (isEncrypted && !doUpdate) {
        return youtube.doCorrections(info, prefs.ccode);
    } else {
        return info;
    }
};

/* Sorting audio-only and video-only formats */
youtube.sort = (info) => {
    info.formats = info.formats.sort((a, b) => {
        if (a.dash === 'a' && b.dash === 'a') {
            return b.audioBitrate - a.audioBitrate;
        }
        if (a.dash === 'a' && b.dash === 'v') {
            return 1;
        }
        if (a.dash === 'v' && b.dash === 'a') {
            return -1;
        }
        if (a.dash !== 'a' && a.dash !== 'v' && (b.dash === 'a' || b.dash === 'v')) {
            return -1;
        }
        if (b.dash !== 'a' && b.dash !== 'v' && (a.dash === 'a' || a.dash === 'v')) {
            return 1;
        }
        let tmp = parseInt(b.resolution) - parseInt(a.resolution);
        if (tmp === 0) {
            tmp = parseInt(b.bitrate) - parseInt(a.bitrate);
        }
        return tmp;
    });

    return info;
};

youtube.connrections = (info, pattern) => {
    // dot is used to find extension
    info.title = info.title.replace(/\./g, '-');
    info.formats = info.formats.map(f => {
        f.name = pattern
            .replace('[file_name]', info.title)
            .replace('[extension]', f.dash === 'a' ? f.audioEncoding : f.container)
            .replace('[author]', info.author)
            .replace('[author]', info.author)
            .replace('[video_id]', info.video_id || info.vid)
            .replace('[video_resolution]', f.resolution)
            .replace('[audio_bitrate]', f.audioBitrate)
            .replace('[published_date]', f.published_date);
        // use DASH in title
        if (f.dash) {
            let tmp = f.name.split('.');
            f.name = tmp[0] + ' - DASH' + (tmp[1] ? '.' + tmp[1] : '');
        }
        // OS file name limitations
        f.name = f.name
            .replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '-');
        return f;
    });
    return info;
};

youtube.perform = (videoID) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({
            ccode: ['r', 'r'],
            player: null,
            pattern: '[file_name].[extension]'
        }, prefs => {
            youtube.getInfo(videoID)
                .then(info => youtube.extractFormats(info, prefs.ccode))
                .then(info => youtube.verify(info, prefs))
                .then(youtube.sort)
                .then(info => youtube.connrections(info, prefs.pattern))
                .then(resolve)
                .catch(reject);
        });
    });
};
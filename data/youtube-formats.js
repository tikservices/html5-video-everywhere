// wrap getPreferedFmt selector to YT itag eq, as we the passed fmts object
// later has itags as keys not getPreferredFmt known keys
var FMT_WRAPPER = {
    "high/mp4": "22",
    "medium/mp4": "18",
    "medium/webm": "43"
};
/*
+----+-----------+------------+---------+-------------------------------------------
|FMT | container | resolution | profile | type
+----+-----------+------------+---------+-------------------------------------------
| 18 | mp4       | 360p       | normal  | "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\""
| 22 | mp4       | 720p       | normal  | "video/mp4; codecs=\"avc1.64001F, mp4a.40.2\""
| 43 | webm      | 360p       | normal  | "video/webm; codecs=\"vp8.0, vorbis\""
+----+-----------+------------+---------+------------------------------------------
| 82 | mp4       | 360p       | 3D      |
| 83 | mp4       | 240p       | 3D      |
| 84 | mp4       | 720p       | 3D      |
| 85 | mp4       | 1080p      | 3D      |
|100 | webm      | 360p       | 3D      |
|101 | webm      | 360p       | 3D      |
|102 | webm      | 700p       | 3D      |
|133 | mp4       | 240p       | DASH V  |
|134 | mp4       | 360p       | DASH V  |
|135 | mp4       | 480p       | DASH V  |
|136 | mp4       | 720p       | DASH V  |
|137 | mp4       | 1080p      | DASH V  |
|160 | mp4       | 144p       | DASH V  |
|264 | mp4       | 1440p      | DASH V  |
|.   | .         | .          | .       |
+----+-----------+------------+---------+----------------------------------------
MORE FROM: http://en.wikipedia.org/wiki/YouTube
*/
/***** BEGIN LICENSE BLOCK *****

    FlashGot - a Firefox extension for external download managers integration
    Copyright (C) 2004-2013 Giorgio Maone - g.maone@informaction.com

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
                             
***** END LICENSE BLOCK *****/
/* the following jshint rules are added by Moez Bouhlel to pass 
 * HTML5-Video-EveryWhere build validation */
/* jshint -W033, -W055, -W116, -W016, -W073, -W040, -W071, -W074, -W032, -W004, -W027, -W035, -W052, -W062, -W059, -W084*/
/* jshint strict:false */
/* global onmessage:true, postMessage */
onmessage = function(evt) {
    try {
        var rc = refresh_signature_func(evt.data);
        postMessage({
            type: "result",
            data: rc
        });
    }
    // Log errors here because the stacktrace is lost
    // when they're marshalled to the onerror handler.
    catch (x) {
        log("YoutubeSwf: exception: " + (x.message || x) + "\n" + (x.stack || new Error().stack));
    } finally {
        // Notify the caller we're done. They will terminate us.
        postMessage({
            type: "done"
        });
    }
}

function log(msg) {
    postMessage({
        type: "log",
        data: String(msg)
    });
}



var zip_inflate = function() {
    // http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
    /* Copyright (C) 1999,2012 Masanao Izumo <iz@onicos.co.jp>
     * Version: 1.0.1
     * LastModified: Jun 29 2012
     */

    /* Interface:
     * data = zip_inflate(src);
     */

    /* constant parameters */
    var zip_WSIZE = 32768; // Sliding Window size
    var zip_STORED_BLOCK = 0;
    var zip_STATIC_TREES = 1;
    var zip_DYN_TREES = 2;

    /* for inflate */
    var zip_lbits = 9; // bits in base literal/length lookup table
    var zip_dbits = 6; // bits in base distance lookup table
    var zip_INBUFSIZ = 32768; // Input buffer size
    var zip_INBUF_EXTRA = 64; // Extra buffer

    /* variables (inflate) */
    var zip_slide;
    var zip_wp; // current position in slide
    var zip_fixed_tl = null; // inflate static
    var zip_fixed_td; // inflate static
    var zip_fixed_bl, zip_fixed_bd; // inflate static
    var zip_bit_buf; // bit buffer
    var zip_bit_len; // bits in bit buffer
    var zip_method;
    var zip_eof;
    var zip_copy_leng;
    var zip_copy_dist;
    var zip_tl, zip_td; // literal/length and distance decoder tables
    var zip_bl, zip_bd; // number of bits decoded by tl and td

    var zip_inflate_data;
    var zip_inflate_pos;


    /* constant tables (inflate) */
    var zip_MASK_BITS = new Array(
        0x0000,
        0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
        0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff);
    // Tables for deflate from PKZIP's appnote.txt.
    var zip_cplens = new Array( // Copy lengths for literal codes 257..285
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0);
    /* note: see note #13 above about the 258 in this list. */
    var zip_cplext = new Array( // Extra bits for literal codes 257..285
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99); // 99==invalid
    var zip_cpdist = new Array( // Copy offsets for distance codes 0..29
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
        257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
        8193, 12289, 16385, 24577);
    var zip_cpdext = new Array( // Extra bits for distance codes
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
        7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
        12, 12, 13, 13);
    var zip_border = new Array( // Order of the bit length code lengths
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
    /* objects (inflate) */

    function zip_HuftList() {
        this.next = null;
        this.list = null;
    }

    function zip_HuftNode() {
        this.e = 0; // number of extra bits or operation
        this.b = 0; // number of bits in this code or subcode

        // union
        this.n = 0; // literal, length base, or distance base
        this.t = null; // (zip_HuftNode) pointer to next level of table
    }

    function zip_HuftBuild(b, // code lengths in bits (all assumed <= BMAX)
        n, // number of codes (assumed <= N_MAX)
        s, // number of simple-valued codes (0..s-1)
        d, // list of base values for non-simple codes
        e, // list of extra bits for non-simple codes
        mm // maximum lookup bits
    ) {
        this.BMAX = 16; // maximum bit length of any code
        this.N_MAX = 288; // maximum number of codes in any set
        this.status = 0; // 0: success, 1: incomplete table, 2: bad input
        this.root = null; // (zip_HuftList) starting table
        this.m = 0; // maximum lookup bits, returns actual

        /* Given a list of code lengths and a maximum table size, make a set of
           tables to decode that set of codes.	Return zero on success, one if
           the given code set is incomplete (the tables are still built in this
           case), two if the input is invalid (all zero length codes or an
           oversubscribed set of lengths), and three if not enough memory.
           The code with value 256 is special, and the tables are constructed
           so that no bits beyond that code are fetched when that code is
           decoded. */
        {
            var a; // counter for codes of length k
            var c = new Array(this.BMAX + 1); // bit length count table
            var el; // length of EOB code (value 256)
            var f; // i repeats in table every f entries
            var g; // maximum code length
            var h; // table level
            var i; // counter, current code
            var j; // counter
            var k; // number of bits in current code
            var lx = new Array(this.BMAX + 1); // stack of bits per table
            var p; // pointer into c[], b[], or v[]
            var pidx; // index of p
            var q; // (zip_HuftNode) points to current table
            var r = new zip_HuftNode(); // table entry for structure assignment
            var u = new Array(this.BMAX); // zip_HuftNode[BMAX][]  table stack
            var v = new Array(this.N_MAX); // values in order of bit length
            var w;
            var x = new Array(this.BMAX + 1); // bit offsets, then code stack
            var xp; // pointer into x or c
            var y; // number of dummy codes added
            var z; // number of entries in current table
            var o;
            var tail; // (zip_HuftList)

            tail = this.root = null;
            for (i = 0; i < c.length; i++)
                c[i] = 0;
            for (i = 0; i < lx.length; i++)
                lx[i] = 0;
            for (i = 0; i < u.length; i++)
                u[i] = null;
            for (i = 0; i < v.length; i++)
                v[i] = 0;
            for (i = 0; i < x.length; i++)
                x[i] = 0;

            // Generate counts for each bit length
            el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
            p = b;
            pidx = 0;
            i = n;
            do {
                c[p[pidx]] ++; // assume all entries <= BMAX
                pidx++;
            } while (--i > 0);
            if (c[0] == n) { // null input--all zero length codes
                this.root = null;
                this.m = 0;
                this.status = 0;
                return;
            }

            // Find minimum and maximum length, bound *m by those
            for (j = 1; j <= this.BMAX; j++)
                if (c[j] != 0)
                    break;
            k = j; // minimum code length
            if (mm < j)
                mm = j;
            for (i = this.BMAX; i != 0; i--)
                if (c[i] != 0)
                    break;
            g = i; // maximum code length
            if (mm > i)
                mm = i;

            // Adjust last length count to fill out codes, if needed
            for (y = 1 << j; j < i; j++, y <<= 1)
                if ((y -= c[j]) < 0) {
                    this.status = 2; // bad input: more codes than bits
                    this.m = mm;
                    return;
                }
            if ((y -= c[i]) < 0) {
                this.status = 2;
                this.m = mm;
                return;
            }
            c[i] += y;

            // Generate starting offsets into the value table for each length
            x[1] = j = 0;
            p = c;
            pidx = 1;
            xp = 2;
            while (--i > 0) // note that i == g from above
                x[xp++] = (j += p[pidx++]);

            // Make a table of values in order of bit lengths
            p = b;
            pidx = 0;
            i = 0;
            do {
                if ((j = p[pidx++]) != 0)
                    v[x[j] ++] = i;
            } while (++i < n);
            n = x[g]; // set n to length of v

            // Generate the Huffman codes and for each, make the table entries
            x[0] = i = 0; // first Huffman code is zero
            p = v;
            pidx = 0; // grab values in bit order
            h = -1; // no tables yet--level -1
            w = lx[0] = 0; // no bits decoded yet
            q = null; // ditto
            z = 0; // ditto

            // go through the bit lengths (k already is bits in shortest code)
            for (; k <= g; k++) {
                a = c[k];
                while (a-- > 0) {
                    // here i is the Huffman code of length k bits for value p[pidx]
                    // make tables up to required level
                    while (k > w + lx[1 + h]) {
                        w += lx[1 + h]; // add bits already decoded
                        h++;

                        // compute minimum size table less than or equal to *m bits
                        z = (z = g - w) > mm ? mm : z; // upper limit
                        if ((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
                            // too few codes for k-w bit table
                            f -= a + 1; // deduct codes from patterns left
                            xp = k;
                            while (++j < z) { // try smaller tables up to z bits
                                if ((f <<= 1) <= c[++xp])
                                    break; // enough codes to use up j bits
                                f -= c[xp]; // else deduct codes from patterns
                            }
                        }
                        if (w + j > el && w < el)
                            j = el - w; // make EOB code end at table
                        z = 1 << j; // table entries for j-bit table
                        lx[1 + h] = j; // set table size in stack

                        // allocate and link in new table
                        q = new Array(z);
                        for (o = 0; o < z; o++) {
                            q[o] = new zip_HuftNode();
                        }

                        if (tail == null)
                            tail = this.root = new zip_HuftList();
                        else
                            tail = tail.next = new zip_HuftList();
                        tail.next = null;
                        tail.list = q;
                        u[h] = q; // table starts after link

                        /* connect to last table, if there is one */
                        if (h > 0) {
                            x[h] = i; // save pattern for backing up
                            r.b = lx[h]; // bits to dump before this table
                            r.e = 16 + j; // bits in this table
                            r.t = q; // pointer to this table
                            j = (i & ((1 << w) - 1)) >> (w - lx[h]);
                            u[h - 1][j].e = r.e;
                            u[h - 1][j].b = r.b;
                            u[h - 1][j].n = r.n;
                            u[h - 1][j].t = r.t;
                        }
                    }

                    // set up table entry in r
                    r.b = k - w;
                    if (pidx >= n)
                        r.e = 99; // out of values--invalid code
                    else if (p[pidx] < s) {
                        r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
                        r.n = p[pidx++]; // simple code is just the value
                    } else {
                        r.e = e[p[pidx] - s]; // non-simple--look up in lists
                        r.n = d[p[pidx++] - s];
                    }

                    // fill code-like entries with r //
                    f = 1 << (k - w);
                    for (j = i >> w; j < z; j += f) {
                        q[j].e = r.e;
                        q[j].b = r.b;
                        q[j].n = r.n;
                        q[j].t = r.t;
                    }

                    // backwards increment the k-bit code i
                    for (j = 1 << (k - 1);
                        (i & j) != 0; j >>= 1)
                        i ^= j;
                    i ^= j;

                    // backup over finished tables
                    while ((i & ((1 << w) - 1)) != x[h]) {
                        w -= lx[h]; // don't need to update q
                        h--;
                    }
                }
            }

            /* return actual size of base table */
            this.m = lx[1];

            /* Return true (1) if we were given an incomplete table */
            this.status = ((y != 0 && g != 1) ? 1 : 0);
        } /* end of constructor */
    }


    /* routines (inflate) */

    function zip_GET_BYTE() {
        if (zip_inflate_data.length == zip_inflate_pos) {
            throw new Error("EOF");
            return -1;
        }
        return zip_inflate_data.charCodeAt(zip_inflate_pos++) & 0xff;
    }

    function zip_NEEDBITS(n) {
        while (zip_bit_len < n) {
            zip_bit_buf |= zip_GET_BYTE() << zip_bit_len;
            zip_bit_len += 8;
        }
    }

    function zip_GETBITS(n) {
        return zip_bit_buf & zip_MASK_BITS[n];
    }

    function zip_DUMPBITS(n) {
        zip_bit_buf >>= n;
        zip_bit_len -= n;
    }

    function zip_inflate_codes(buff, off, size) {
        /* inflate (decompress) the codes in a deflated (compressed) block.
           Return an error code or zero if it all goes ok. */
        var e; // table entry flag/number of extra bits
        var t; // (zip_HuftNode) pointer to table entry
        var n;

        if (size == 0)
            return 0;

        // inflate the coded data
        n = 0;
        for (;;) { // do until end of block
            zip_NEEDBITS(zip_bl);
            t = zip_tl.list[zip_GETBITS(zip_bl)];
            e = t.e;
            while (e > 16) {
                if (e == 99)
                    return -1;
                zip_DUMPBITS(t.b);
                e -= 16;
                zip_NEEDBITS(e);
                t = t.t[zip_GETBITS(e)];
                e = t.e;
            }
            zip_DUMPBITS(t.b);

            if (e == 16) { // then it's a literal
                zip_wp &= zip_WSIZE - 1;
                buff[off + n++] = zip_slide[zip_wp++] = t.n;
                if (n == size)
                    return size;
                continue;
            }

            // exit if end of block
            if (e == 15)
                break;

            // it's an EOB or a length

            // get length of block to copy
            zip_NEEDBITS(e);
            zip_copy_leng = t.n + zip_GETBITS(e);
            zip_DUMPBITS(e);

            // decode distance of block to copy
            zip_NEEDBITS(zip_bd);
            t = zip_td.list[zip_GETBITS(zip_bd)];
            e = t.e;

            while (e > 16) {
                if (e == 99)
                    return -1;
                zip_DUMPBITS(t.b);
                e -= 16;
                zip_NEEDBITS(e);
                t = t.t[zip_GETBITS(e)];
                e = t.e;
            }
            zip_DUMPBITS(t.b);
            zip_NEEDBITS(e);
            zip_copy_dist = zip_wp - t.n - zip_GETBITS(e);
            zip_DUMPBITS(e);

            // do the copy
            while (zip_copy_leng > 0 && n < size) {
                zip_copy_leng--;
                zip_copy_dist &= zip_WSIZE - 1;
                zip_wp &= zip_WSIZE - 1;
                buff[off + n++] = zip_slide[zip_wp++] = zip_slide[zip_copy_dist++];
            }

            if (n == size)
                return size;
        }

        zip_method = -1; // done
        return n;
    }

    function zip_inflate_stored(buff, off, size) {
        /* "decompress" an inflated type 0 (stored) block. */
        var n;

        // go to byte boundary
        n = zip_bit_len & 7;
        zip_DUMPBITS(n);

        // get the length and its complement
        zip_NEEDBITS(16);
        n = zip_GETBITS(16);
        zip_DUMPBITS(16);
        zip_NEEDBITS(16);
        if (n != ((~zip_bit_buf) & 0xffff)) {
            throw new Error("n != (~zip_bit_buf) & 0xffff");
            return -1; // error in compressed data
        }
        zip_DUMPBITS(16);

        // read and output the compressed data
        zip_copy_leng = n;

        n = 0;
        while (zip_copy_leng > 0 && n < size) {
            zip_copy_leng--;
            zip_wp &= zip_WSIZE - 1;
            zip_NEEDBITS(8);
            buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
            zip_DUMPBITS(8);
        }

        if (zip_copy_leng == 0)
            zip_method = -1; // done
        return n;
    }

    function zip_inflate_fixed(buff, off, size) {
        /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
           either replace this with a custom decoder, or at least precompute the
           Huffman tables. */

        // if first time, set up tables for fixed blocks
        if (zip_fixed_tl == null) {
            var i; // temporary variable
            var l = new Array(288); // length list for huft_build
            var h; // zip_HuftBuild

            // literal table
            for (i = 0; i < 144; i++)
                l[i] = 8;
            for (; i < 256; i++)
                l[i] = 9;
            for (; i < 280; i++)
                l[i] = 7;
            for (; i < 288; i++) // make a complete, but wrong code set
                l[i] = 8;
            zip_fixed_bl = 7;

            h = new zip_HuftBuild(l, 288, 257, zip_cplens, zip_cplext,
                zip_fixed_bl);
            if (h.status != 0) {
                throw new Error("HufBuild error: " + h.status);
                return -1;
            }
            zip_fixed_tl = h.root;
            zip_fixed_bl = h.m;

            // distance table
            for (i = 0; i < 30; i++) // make an incomplete code set
                l[i] = 5;
            zip_fixed_bd = 5;

            h = new zip_HuftBuild(l, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd);
            if (h.status > 1) {
                zip_fixed_tl = null;
                throw new Error("HufBuild error: " + h.status);
                return -1;
            }
            zip_fixed_td = h.root;
            zip_fixed_bd = h.m;
        }

        zip_tl = zip_fixed_tl;
        zip_td = zip_fixed_td;
        zip_bl = zip_fixed_bl;
        zip_bd = zip_fixed_bd;
        return zip_inflate_codes(buff, off, size);
    }

    function zip_inflate_dynamic(buff, off, size) {
        // decompress an inflated type 2 (dynamic Huffman codes) block.
        var i; // temporary variables
        var j;
        var l; // last length
        var n; // number of lengths to get
        var t; // (zip_HuftNode) literal/length code table
        var nb; // number of bit length codes
        var nl; // number of literal/length codes
        var nd; // number of distance codes
        var ll = new Array(286 + 30); // literal/length and distance code lengths
        var h; // (zip_HuftBuild)

        for (i = 0; i < ll.length; i++)
            ll[i] = 0;

        // read in table lengths
        zip_NEEDBITS(5);
        nl = 257 + zip_GETBITS(5); // number of literal/length codes
        zip_DUMPBITS(5);
        zip_NEEDBITS(5);
        nd = 1 + zip_GETBITS(5); // number of distance codes
        zip_DUMPBITS(5);
        zip_NEEDBITS(4);
        nb = 4 + zip_GETBITS(4); // number of bit length codes
        zip_DUMPBITS(4);
        if (nl > 286 || nd > 30)
            return -1; // bad lengths

        // read in bit-length-code lengths
        for (j = 0; j < nb; j++) {
            zip_NEEDBITS(3);
            ll[zip_border[j]] = zip_GETBITS(3);
            zip_DUMPBITS(3);
        }
        for (; j < 19; j++)
            ll[zip_border[j]] = 0;

        // build decoding table for trees--single level, 7 bit lookup
        zip_bl = 7;
        h = new zip_HuftBuild(ll, 19, 19, null, null, zip_bl);
        if (h.status != 0)
            return -1; // incomplete code set

        zip_tl = h.root;
        zip_bl = h.m;

        // read in literal and distance code lengths
        n = nl + nd;
        i = l = 0;
        while (i < n) {
            zip_NEEDBITS(zip_bl);
            t = zip_tl.list[zip_GETBITS(zip_bl)];
            j = t.b;
            zip_DUMPBITS(j);
            j = t.n;
            if (j < 16) // length of code in bits (0..15)
                ll[i++] = l = j; // save last length in l
            else if (j == 16) { // repeat last length 3 to 6 times
                zip_NEEDBITS(2);
                j = 3 + zip_GETBITS(2);
                zip_DUMPBITS(2);
                if (i + j > n)
                    return -1;
                while (j-- > 0)
                    ll[i++] = l;
            } else if (j == 17) { // 3 to 10 zero length codes
                zip_NEEDBITS(3);
                j = 3 + zip_GETBITS(3);
                zip_DUMPBITS(3);
                if (i + j > n)
                    return -1;
                while (j-- > 0)
                    ll[i++] = 0;
                l = 0;
            } else { // j == 18: 11 to 138 zero length codes
                zip_NEEDBITS(7);
                j = 11 + zip_GETBITS(7);
                zip_DUMPBITS(7);
                if (i + j > n)
                    return -1;
                while (j-- > 0)
                    ll[i++] = 0;
                l = 0;
            }
        }

        // build the decoding tables for literal/length and distance codes
        zip_bl = zip_lbits;
        h = new zip_HuftBuild(ll, nl, 257, zip_cplens, zip_cplext, zip_bl);
        if (zip_bl == 0) // no literals or lengths
            h.status = 1;
        if (h.status != 0) {
            if (h.status == 1)
            ; // **incomplete literal tree**
            return -1; // incomplete code set
        }
        zip_tl = h.root;
        zip_bl = h.m;

        for (i = 0; i < nd; i++)
            ll[i] = ll[i + nl];
        zip_bd = zip_dbits;
        h = new zip_HuftBuild(ll, nd, 0, zip_cpdist, zip_cpdext, zip_bd);
        zip_td = h.root;
        zip_bd = h.m;

        if (zip_bd == 0 && nl > 257) { // lengths but no distances
            // **incomplete distance tree**
            return -1;
        }

        if (h.status == 1) {; // **incomplete distance tree**
        }
        if (h.status != 0)
            return -1;

        // decompress until an end-of-block code
        return zip_inflate_codes(buff, off, size);
    }

    function zip_inflate_start() {
        var i;

        if (zip_slide == null)
            zip_slide = new Array(2 * zip_WSIZE);
        zip_wp = 0;
        zip_bit_buf = 0;
        zip_bit_len = 0;
        zip_method = -1;
        zip_eof = false;
        zip_copy_leng = zip_copy_dist = 0;
        zip_tl = null;
    }

    function zip_inflate_internal(buff, off, size) {
        // decompress an inflated entry
        var n, i;

        n = 0;
        while (n < size) {
            if (zip_eof && zip_method == -1) {
                return n;
            }

            if (zip_copy_leng > 0) {
                if (zip_method != zip_STORED_BLOCK) {
                    // STATIC_TREES or DYN_TREES
                    while (zip_copy_leng > 0 && n < size) {
                        zip_copy_leng--;
                        zip_copy_dist &= zip_WSIZE - 1;
                        zip_wp &= zip_WSIZE - 1;
                        buff[off + n++] = zip_slide[zip_wp++] =
                            zip_slide[zip_copy_dist++];
                    }
                } else {
                    while (zip_copy_leng > 0 && n < size) {
                        zip_copy_leng--;
                        zip_wp &= zip_WSIZE - 1;
                        zip_NEEDBITS(8);
                        buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
                        zip_DUMPBITS(8);
                    }
                    if (zip_copy_leng == 0)
                        zip_method = -1; // done
                }
                if (n == size) {
                    return n;
                }
            }

            if (zip_method == -1) {
                if (zip_eof) {
                    break;
                }

                // read in last block bit
                zip_NEEDBITS(1);
                if (zip_GETBITS(1) != 0)
                    zip_eof = true;
                zip_DUMPBITS(1);

                // read in block type
                zip_NEEDBITS(2);
                zip_method = zip_GETBITS(2);
                zip_DUMPBITS(2);
                zip_tl = null;
                zip_copy_leng = 0;
            }

            switch (zip_method) {
                case 0: // zip_STORED_BLOCK
                    i = zip_inflate_stored(buff, off + n, size - n);
                    break;

                case 1: // zip_STATIC_TREES
                    if (zip_tl != null)
                        i = zip_inflate_codes(buff, off + n, size - n);
                    else
                        i = zip_inflate_fixed(buff, off + n, size - n);
                    break;

                case 2: // zip_DYN_TREES
                    if (zip_tl != null)
                        i = zip_inflate_codes(buff, off + n, size - n);
                    else
                        i = zip_inflate_dynamic(buff, off + n, size - n);
                    break;

                default: // error
                    i = -1;
                    break;
            }

            if (i == -1) {
                if (zip_eof)
                    return 0;
                return -1;
            }
            n += i;
        }
        return n;
    }

    function zip_inflate(data, offset /*= 0*/ ) {
        var out, buff;
        var i, j;

        zip_inflate_start();
        zip_inflate_data = data;
        zip_inflate_pos = offset || 0;
        var last_zip_inflate_pos = -1;

        if (!0) {
            zip_NEEDBITS(8);
            var CMF = zip_GETBITS(8);
            zip_DUMPBITS(8);
            zip_NEEDBITS(8);
            var FLG = zip_GETBITS(8);
            zip_DUMPBITS(8);
            if ((CMF & 0x0f) !== 8) {
                throw new Error("Unsupported compression.");
            }
            if (FLG & 0x20) {
                throw new Error("DICT");
            }
            if ((CMF * 256 + FLG) % 31 !== 0) {
                throw new Error("FCHECK");
            }
        }

        buff = new Array(1024);
        out = "";
        while ((i = zip_inflate_internal(buff, 0, buff.length)) > 0 && last_zip_inflate_pos != zip_inflate_pos) {
            last_zip_inflate_pos = zip_inflate_pos;
            for (j = 0; j < i; j++) out += String.fromCharCode(buff[j]);
        }
        zip_inflate_data = null; // G.C.
        return out;
    }

    return zip_inflate;
}();



function swf_inflate(data) {
    var sig = data.substr(0, 3);
    if (sig === "FWS") {
        return data;
    }
    if (sig !== "CWS") {
        throw new Error("Invalid signature: " + sig);
    }
    var ss = new SwfStream(data);
    ss.skip_bytes(4); // Signature, version.
    var inflated_size = ss.read_uint32();
    var inflated = zip_inflate(data, 8);
    if (inflated.length + 8 !== inflated_size) {
        throw new Error("Inflated size mismatch: expected " + inflated_size + ", got " + inflated.length);
    }
    return "FWS" + data.substring(3, 8) + inflated;
}



function SwfStream(data) {
    var m_bytes = data;
    var m_byte_idx = 0;
    var m_buf = 0;
    var m_buf_bits = 0;

    var byte_align = this.byte_align = function() {
        m_buf_bits = 0;
    };

    var read_bits = this.read_bits = function(count) {
        var rc = 0;
        while (count !== 0) {
            if (m_buf_bits === 0) {
                if (m_byte_idx >= m_bytes.length) {
                    throw new Error("EOF");
                }
                m_buf = m_bytes.charCodeAt(m_byte_idx++) & 0xff;
                m_buf_bits = 8;
            }
            var cpy_bits = Math.min(count, m_buf_bits);
            rc = (rc << cpy_bits) | n_hbits8(m_buf, cpy_bits);
            m_buf = (m_buf << cpy_bits) & 0xff;
            m_buf_bits -= cpy_bits;
            count -= cpy_bits;
        }
        return rc;
    };


    var read_uint8 = this.read_uint8 = function() {
        byte_align();
        return read_bits(8);
    };


    var read_uint16 = this.read_uint16 = function() {
        var b1 = read_uint8();
        var b2 = read_uint8() << 8;
        return b1 | b2;
    };


    var read_uint32 = this.read_uint32 = function() {
        return read_sint32() >>> 0;
    };


    var read_sint32 = this.read_sint32 = function() {
        var b1 = read_uint8();
        var b2 = read_uint8() << 8;
        var b3 = read_uint8() << 16;
        var b4 = read_uint8() << 24;
        return b1 | b2 | b3 | b4;
    };


    var read_fixed8 = this.read_fixed8 = function() {
        var a = read_uint8();
        var b = read_uint8();
        return b + (a / 0x100);
    };

    var read_fixed = this.read_fixed = function() {
        var a = read_uint16();
        var b = read_uint16();
        return b + (a / 0x10000);
    };

    var read_bytes = this.read_bytes = function(count) {
        byte_align();
        if (m_byte_idx + count > m_bytes.length) {
            m_byte_idx = m_bytes.length;
            throw new Error("EOF");
        }
        return m_bytes.slice(m_byte_idx, m_byte_idx += count);
    };


    var skip_bytes = this.skip_bytes = function(count) {
        byte_align();
        m_byte_idx += count;
    };

    var n_hbits8 = this.n_hbits8 = function(n, count) {
        return (n & 0xff) >> (8 - count);
    };


    var n_hbits16 = this.n_hbits16 = function(n, count) {
        return (n & 0xffff) >> (16 - count);
    };


    var n_lbits16 = this.n_lbits16 = function(n, count) {
        return n & ((1 << count) - 1);
    };
};



// namespace_info kinds.
const doabc_CONSTANT_Namespace = 0x08;
const doabc_CONSTANT_PackageNamespace = 0x16;
const doabc_CONSTANT_PackageInternalNs = 0x17;
const doabc_CONSTANT_ProtectedNamespace = 0x18;
const doabc_CONSTANT_ExplicitNamespace = 0x19;
const doabc_CONSTANT_StaticProtectedNs = 0x1A;
const doabc_CONSTANT_PrivateNs = 0x05;

// multiname_info kinds.
const doabc_CONSTANT_QName = 0x07;
const doabc_CONSTANT_QNameA = 0x0D;
const doabc_CONSTANT_RTQName = 0x0F;
const doabc_CONSTANT_RTQNameA = 0x10;
const doabc_CONSTANT_RTQNameL = 0x11;
const doabc_CONSTANT_RTQNameLA = 0x12;
const doabc_CONSTANT_Multiname = 0x09;
const doabc_CONSTANT_MultinameA = 0x0E;
const doabc_CONSTANT_MultinameL = 0x1B;
const doabc_CONSTANT_MultinameLA = 0x1C;

// option_detail kinds: these plus namespace_info kinds.
const doabc_CONSTANT_Int = 0x03;
const doabc_CONSTANT_UInt = 0x04;
const doabc_CONSTANT_Double = 0x06;
const doabc_CONSTANT_Utf8 = 0x01;
const doabc_CONSTANT_True = 0x0B;
const doabc_CONSTANT_False = 0x0A;
const doabc_CONSTANT_Null = 0x0C;
const doabc_CONSTANT_Undefined = 0x00;

// method_info flags.
const doabc_MF_NEED_ARGUMENTS = 0x01;
const doabc_MF_NEED_ACTIVATION = 0x02;
const doabc_MF_NEED_REST = 0x04;
const doabc_MF_HAS_OPTIONAL = 0x08;
const doabc_MF_SET_DXNS = 0x40;
const doabc_MF_HAS_PARAM_NAMES = 0x80;

// traits_info kinds.
const doabc_Trait_Slot = 0;
const doabc_Trait_Method = 1;
const doabc_Trait_Getter = 2;
const doabc_Trait_Setter = 3;
const doabc_Trait_Class = 4;
const doabc_Trait_Function = 5;
const doabc_Trait_Const = 6;

// traits_info attributes.
const doabc_ATTR_Final = 0x01;
const doabc_ATTR_Override = 0x02;
const doabc_ATTR_Metadata = 0x04;

// instance_info flags.
const doabc_CONSTANT_ClassSealed = 0x01;
const doabc_CONSTANT_ClassFinal = 0x02;
const doabc_CONSTANT_ClassInterface = 0x04;
const doabc_CONSTANT_ClassProtectedNs = 0x08;



function doABCReader(bytes) {
    var m_bytes = bytes;
    var m_byte_idx = 0;

    var eof = this.eof = function() {
        return m_byte_idx >= m_bytes.length;
    };


    var read_bytes = this.read_bytes = function(count) {
        var end = m_byte_idx + count;
        if (end > m_bytes.length) {
            m_byte_idx = m_bytes.length;
            throw new Error("EOF");
        }
        var rc = m_bytes.slice(m_byte_idx, end);
        m_byte_idx = end;
        return rc;
    };

    var read_u8 = this.read_u8 = function() {
        if (eof()) {
            throw new Error("EOF");
        }
        return m_bytes.charCodeAt(m_byte_idx++) & 0xff;
    };


    var read_u16 = this.read_u16 = function() {
        var b1 = read_u8();
        var b2 = read_u8();
        return (b2 << 8) | b1;
    };


    var read_s24 = this.read_s24 = function() {
        var b1 = read_u8();
        var b2 = read_u8() << 8;
        var b3 = read_u8() << 16;
        var n = b1 | b2 | b3;
        // 0x800000 is 2^23, 0x1000000 is 2^24.
        if (n >= 0x800000) {
            n -= 0x1000000;
        }
        return n;
    };


    var read_u32 = this.read_u32 = function() {
        var n = 0;
        for (var i = 0; i !== 5; ++i) {
            var b = read_u8();
            const has_next = b & 0x80;
            b &= 0x7f;
            // Sanity check.
            if (i === 4) {
                // The last byte must not have the high bit set.
                if (has_next) {
                    throw new Error("Invalid stream: high bit is set, but no more bytes needed.");
                }
                // The last byte can't have non-zero bits 4-7,
                // i.e. it can't be greater than 0x0f (bin: 00001111),
                // otherwise it would overflow the result value: 4*7 bits
                // in the previous bytes = 28, so there's only 4 bits left,
                // namely, 0-3.
                if (b > 0x0f) {
                    throw new Error("Invalid stream: too many bits set in the last byte.");
                }
            } // Sanity check.
            n |= b << (i * 7);
            if (!has_next) {
                break;
            }
        }
        return n >>> 0;
    };


    var read_u30 = this.read_u30 = function() {
        // 0x3fffffff is 2^30 - 1.
        return read_u32() & 0x3fffffff;
    };


    var read_s32 = this.read_s32 = function() {
        return read_u32() | 0;
    };

    var read_d64 = this.read_d64 = function() {
        // static const boolean little_endian = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
        var _static = arguments.callee;
        if (_static["doABCReader::little_endian"] === undefined) {
            _static["doABCReader::little_endian"] = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
        }
        var b = new Array(8);
        for (var i = 0; i !== 8; ++i) {
            b[i] = read_u8();
        }
        if (!_static["doABCReader::little_endian"]) {
            b.reverse();
        }
        return new Float64Array(new Uint8Array(b).buffer)[0];
    };


    var read_cpool_info = this.read_cpool_info = function() {
        var cp = new doabc_cpool_info();

        var cnt;

        cnt = read_u30();
        if (cnt !== 0) {
            cp.integers = new Array(cnt);
            cp.integers[0] = 0;
            for (var i = 1; i !== cnt; ++i) {
                cp.integers[i] = read_s32();
            }
        }

        cnt = read_u30();
        if (cnt !== 0) {
            cp.uintegers = new Array(cnt);
            cp.uintegers[0] = 0;
            for (var i = 1; i !== cnt; ++i) {
                cp.uintegers[i] = read_u32();
            }
        }

        cnt = read_u30();
        if (cnt !== 0) {
            cp.doubles = new Array(cnt);
            cp.doubles[0] = 0;
            for (var i = 1; i !== cnt; ++i) {
                cp.doubles[i] = read_d64();
            }
        }

        cnt = read_u30();
        if (cnt !== 0) {
            cp.strings = new Array(cnt);
            cp.strings[0] = "";
            for (var i = 1; i !== cnt; ++i) {
                cp.strings[i] = read_string_info();
            }
        }

        cnt = read_u30();
        if (cnt !== 0) {
            cp.namespaces = new Array(cnt);
            cp.namespaces[0] = new doabc_namespace_info();
            for (var i = 1; i !== cnt; ++i) {
                cp.namespaces[i] = read_namespace_info();
            }
        }

        cnt = read_u30();
        if (cnt !== 0) {
            cp.ns_sets = new Array(cnt);
            cp.ns_sets[0] = new doabc_ns_set_info();
            for (var i = 1; i !== cnt; ++i) {
                cp.ns_sets[i] = read_ns_set_info();
            }
        }

        cnt = read_u30();
        if (cnt !== 0) {
            cp.multinames = new Array(cnt);
            cp.multinames[0] = new doabc_multiname_info();
            for (var i = 1; i !== cnt; ++i) {
                cp.multinames[i] = read_multiname_info();
            }
        }

        return cp;
    };


    var read_string_info = this.read_string_info = function() {
        var size = read_u30();
        return size !== 0 ? utf8_decode(read_bytes(size)) : "";
    };


    var read_namespace_info = this.read_namespace_info = function() {
        var o = {}; //new doabc_namespace_info();
        o.kind = read_u8();
        o.name = read_u30();
        return o;
    };


    var read_ns_set_info = this.read_ns_set_info = function() {
        var o = {}; //new doabc_ns_set_info();
        var cnt = read_u8();
        o.ns = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.ns[i] = read_u30();
        }
        return o;
    };


    var read_multiname_info = this.read_multiname_info = function() {
        var o;
        var kind = read_u8();
        switch (kind) {
            case doabc_CONSTANT_QName:
            case doabc_CONSTANT_QNameA:
                o = read_multiname_info_QName();
                break;
            case doabc_CONSTANT_RTQName:
            case doabc_CONSTANT_RTQNameA:
                o = read_multiname_info_RTQName();
                break;
            case doabc_CONSTANT_RTQNameL:
            case doabc_CONSTANT_RTQNameLA:
                o = read_multiname_info_RTQNameL();
                break;
            case doabc_CONSTANT_Multiname:
            case doabc_CONSTANT_MultinameA:
                o = read_multiname_info_Multiname();
                break;
            case doabc_CONSTANT_MultinameL:
            case doabc_CONSTANT_MultinameLA:
                o = read_multiname_info_MultinameL();
                break;
            default:
                throw new Error("Unexpected multiname kind: " + kind);
        }
        o.kind = kind;
        return o;
    };


    var read_method_info = this.read_method_info = function() {
        var o = {}; //new doabc_method_info();

        var cnt = read_u30();
        o.return_type = read_u30();

        o.param_types = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.param_types[i] = read_u30();
        }

        o.name = read_u30();
        o.flags = read_u8();

        if (o.flags & doabc_MF_HAS_OPTIONAL) {
            var cnt = read_u30();
            o.options = new Array(cnt);
            for (var i = 0; i !== cnt; ++i) {
                o.options[i] = read_option_detail();
            }
        }

        if (o.flags & doabc_MF_HAS_PARAM_NAMES) {
            var cnt = read_u30();
            o.param_names = new Array(cnt);
            for (var i = 0; i !== cnt; ++i) {
                o.param_names[i] = read_u30();
            }
        }

        return o;
    };


    var read_metadata_info = this.read_metadata_info = function() {
        var o = {}; //new doabc_metadata_info();
        o.name = read_u30();
        var cnt = read_u30();
        o.items = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.items[i] = read_item_info();
        }
        return o;
    };


    var read_instance_info = this.read_instance_info = function() {
        var o = {}; //new doabc_instance_info();
        var cnt;

        o.name = read_u30();
        o.super_name = read_u30();
        o.flags = read_u8();

        if (o.flags & doabc_CONSTANT_ClassProtectedNs) {
            o.protectedNs = read_u30();
        }

        cnt = read_u30();
        o.interfaces = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.interfaces[i] = read_u30();
        }

        o.iinit = read_u30();

        cnt = read_u30();
        o.traits = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.traits[i] = read_traits_info();
        }

        return o;
    };


    var read_class_info = this.read_class_info = function() {
        var o = {}; //new doabc_class_info();
        o.cinit = read_u30();
        var cnt = read_u30();
        o.traits = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.traits[i] = read_traits_info();
        }
        return o;
    };


    var read_script_info = this.read_script_info = function() {
        var o = {}; //new doabc_script_info();
        o.init = read_u30();
        var cnt = read_u30();
        o.traits = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.traits[i] = read_traits_info();
        }
        return o;
    };


    var read_method_body_info = this.read_method_body_info = function() {
        var o = {}; //new doabc_method_body_info();
        var cnt;

        o.method = read_u30();
        o.max_stack = read_u30();
        o.local_count = read_u30();
        o.init_scope_depth = read_u30();
        o.max_scope_depth = read_u30();

        cnt = read_u30();
        o.code = read_bytes(cnt);

        cnt = read_u30();
        o.exceptions = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.exceptions[i] = read_exception_info();
        }

        cnt = read_u30();
        o.traits = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            o.traits[i] = read_traits_info();
        }

        return o;
    };


    var read_option_detail = this.read_option_detail = function() {
        var o = {}; //new doabc_option_detail();
        o.val = read_u30();
        o.kind = read_u8();
        return o;
    };


    var read_item_info = this.read_item_info = function() {
        var o = {}; //new doabc_item_info();
        o.key = read_u30();
        o.val = read_u30();
        return o;
    };


    var read_exception_info = this.read_exception_info = function() {
        var o = {}; //new doabc_exception_info();
        o.from = read_u30();
        o.to = read_u30();
        o.target = read_u30();
        o.exc_type = read_u30();
        o.var_name = read_u30();
        return o;
    };


    var read_traits_info = this.read_traits_info = function() {
        var o = {}; //new doabc_traits_info();
        o.name = read_u30();

        var kind = read_u8();
        o.kind = kind & 0x0f;
        o.attrs = (kind >> 4) & 0x0f;

        switch (o.kind) {
            case doabc_Trait_Slot:
            case doabc_Trait_Const:
                o.trait = read_trait_slot();
                break;
            case doabc_Trait_Class:
                o.trait = read_trait_class();
                break;
            case doabc_Trait_Function:
                o.trait = read_trait_function();
                break;
            case doabc_Trait_Method:
            case doabc_Trait_Getter:
            case doabc_Trait_Setter:
                o.trait = read_trait_method();
                break;
            default:
                throw new Error("Unexpected trait kind: " + o.kind);
        }

        if (o.attrs & doabc_ATTR_Metadata) {
            var cnt = read_u8();
            o.metadata = new Array(cnt);
            for (var i = 0; i !== cnt; ++i) {
                o.metadata[i] = read_u30();
            }
        }

        return o;
    };


    var read_trait_slot = this.read_trait_slot = function() {
        var o = {}; //new doabc_trait_slot();
        o.slot_id = read_u30();
        o.type_name = read_u30();
        o.vindex = read_u30();
        if (o.vindex !== 0) {
            o.vkind = read_u8();
        }
        return o;
    };


    var read_trait_class = this.read_trait_class = function() {
        var o = {}; //new doabc_trait_class();
        o.slot_id = read_u30();
        o.classi = read_u30();
        return o;
    };


    var read_trait_function = this.read_trait_function = function() {
        var o = {}; //new doabc_trait_function();
        o.slot_id = read_u30();
        o.func = read_u30();
        return o;
    };


    var read_trait_method = this.read_trait_method = function() {
        var o = {}; //new doabc_trait_method();
        o.disp_id = read_u30();
        o.method = read_u30();
        return o;
    };


    var read_multiname_info_QName = this.read_multiname_info_QName = function() {
        var o = {}; //new doabc_multiname_info_QName();
        o.ns = read_u30();
        o.name = read_u30();
        return o;
    };


    var read_multiname_info_RTQName = this.read_multiname_info_RTQName = function() {
        var o = {}; //new doabc_multiname_info_RTQName();
        o.name = read_u30();
        return o;
    };


    var read_multiname_info_RTQNameL = this.read_multiname_info_RTQNameL = function() {
        // This kind has no associated data.
        return {}; //new doabc_multiname_info_RTQNameL();
    };


    var read_multiname_info_Multiname = this.read_multiname_info_Multiname = function() {
        var o = {}; //new doabc_multiname_info_Multiname();
        o.name = read_u30();
        o.ns_set = read_u30();
        return o;
    };


    var read_multiname_info_MultinameL = this.read_multiname_info_MultinameL = function() {
        var o = {}; //new doabc_multiname_info_MultinameL();
        o.ns_set = read_u30();
        return o;
    };
}


function doabc_namespace_info() {
    this.kind = 0;
    this.name = 0;
}


function doabc_ns_set_info() {
    this.ns = [];
}


function doabc_multiname_info() {
    this.kind = 0;
}


function doabc_cpool_info() {
    this.integers = [];
    this.uintegers = [];
    this.doubles = [];
    this.strings = [];
    this.namespaces = [];
    this.ns_sets = [];
    this.multinames = [];
}

doabc_cpool_info.prototype = {
    get_item: function(cont, idx) {
        if (idx < 0 || idx >= cont.length) {
            throw new Error("Index out of range: " + idx);
        }
        return cont[idx];
    },

    resolve_integer: function(idx) {
        return this.get_item(this.integers, idx);
    },

    resolve_uinteger: function(idx) {
        return this.get_item(this.uintegers, idx);
    },

    resolve_string: function(idx) {
        return this.get_item(this.strings, idx);
    },

    resolve_ns: function(idx) {
        return this.resolve_string(this.get_item(this.namespaces, idx).name);
    },

    resolve_multiname: function(idx) {
        var s = "";

        var mi = this.get_item(this.multinames, idx);
        switch (mi.kind) {
            case doabc_CONSTANT_QName:
            case doabc_CONSTANT_QNameA:
                if (mi.ns !== 0) {
                    s = this.resolve_ns(mi.ns);
                }
                if (s.length !== 0) {
                    s += ".";
                }
                s += this.resolve_string(mi.name);
                break;
            case doabc_CONSTANT_RTQName:
            case doabc_CONSTANT_RTQNameA:
                s = this.resolve_string(mi.name);
                break;
            case doabc_CONSTANT_RTQNameL:
            case doabc_CONSTANT_RTQNameLA:
                // This kind has no associated data.
                break;
            case doabc_CONSTANT_Multiname:
            case doabc_CONSTANT_MultinameA:
                // TODO: Implement.
                throw new Error("Not implemented: doabc_CONSTANT_Multiname(A)");
                break;
            case doabc_CONSTANT_MultinameL:
            case doabc_CONSTANT_MultinameLA:
                // TODO: Implement.
                throw new Error("Not implemented: doabc_CONSTANT_MultinameL(A)");
                break;
            default:
                throw new Error("Unexpected multiname kind: " + mi.kind);
        }
        return s;
    },

};



function doABCFile() {
    this.major_version = 0;
    this.minor_version = 0;
    this.constant_pool = null;
    this.methods = [];
    this.metadata = [];
    this.instances = [];
    this.classes = [];
    this.scripts = [];
    this.method_bodies = [];
}
doABCFile.prototype = {
    get_method_body: function(idx) {
        var mb = null;
        this.method_bodies.some(function(o) {
            return o.method === idx && (mb = o);
        });
        return mb;
    },

    get_method_body_by_name_index: function(cls_name_idx, name_idx) {
        var inst_idx = this.get_instance_index_by_name_index(cls_name_idx);
        if (inst_idx === -1) {
            throw new Error("Class not found: " + cls_name_idx);
        }
        return this.get_method_body_by_name_index0(name_idx, this.instances[inst_idx].traits,
            this.classes[inst_idx].traits);
    },
    get_method_body_by_name_index0: function(name_idx, traits) {
        var cp = this.constant_pool;
        for (var i = 1, len = arguments.length; i < len; ++i) {
            var traits = arguments[i];
            for (var j = 0, jlen = traits.length; j !== jlen; ++j) {
                var ti = traits[j];
                if (ti.kind !== doabc_Trait_Method || cp.multinames[ti.name].kind !== doabc_CONSTANT_QName) {
                    continue;
                }
                if (ti.name === name_idx) {
                    return this.get_method_body(ti.trait.method);
                }
            }
        }
        throw new Error("Method not found: " + name_idx);
    },

    get_instance_index_by_name_index: function(name_idx) {
        var cp = this.constant_pool,
            a = this.instances;
        for (var i = 0, len = a.length; i !== len; ++i) {
            var ii = a[i];
            if (cp.multinames[ii.name].kind !== doabc_CONSTANT_QName) {
                continue;
            }
            if (ii.name === name_idx) {
                return i;
            }
        }
        return -1;
    }
};

// ActionScript 3 opcodes.
const AS3_OP_PUSHSCOPE = 0x30;
const AS3_OP_PUSHSTRING = 0x2c;
const AS3_OP_PUSHBYTE = 0x24;
const AS3_OP_PUSHSHORT = 0x25;
const AS3_OP_PUSHINT = 0x2d;
const AS3_OP_PUSHUINT = 0x2e;
const AS3_OP_GETLOCAL_0 = 0xd0;
const AS3_OP_GETLOCAL_1 = 0xd1;
const AS3_OP_GETLOCAL_2 = 0xd2;
const AS3_OP_GETLOCAL_3 = 0xd3;
const AS3_OP_GETLOCAL = 0x62;
const AS3_OP_SETLOCAL_1 = 0xd5;
const AS3_OP_SETLOCAL_2 = 0xd6;
const AS3_OP_SETLOCAL_3 = 0xd7;
const AS3_OP_SETLOCAL = 0x63;
const AS3_OP_CALLPROPERTY = 0x46;
const AS3_OP_CONSTRUCTPROP = 0x4a;
const AS3_OP_CALLPROPVOID = 0x4f;
const AS3_OP_COERCE = 0x80;
const AS3_OP_COERCE_S = 0x85;
const AS3_OP_FINDPROPSTRICT = 0x5d;
const AS3_OP_FINDPROPERTY = 0x5e;
const AS3_OP_RETURNVOID = 0x47;
const AS3_OP_RETURNVALUE = 0x48;
const AS3_OP_GETLEX = 0x60;
const AS3_OP_IFTRUE = 0x11;
const AS3_OP_SETPROPERTY = 0x61;
const AS3_OP_GETPROPERTY = 0x66;
const AS3_OP_MODULO = 0xa4;

function utf8_decode(str) {
    var a = [];
    for (var i = 0, len = str.length; i < len; ++i) {
        var cc = str.charCodeAt(i);
        if (cc > 255) {
            throw new Error("Illegal character: must be in range [0; 255]: " + cc);
        }
        if (cc < 0x80) {
            a.push(str.charAt(i));
            continue;
        }
        var n = 0;
        var num_bytes = 0;
        // 110xxxxx 10xxxxxx
        if ((cc & 0xe0) === 0xc0) {
            num_bytes = 1;
            n = cc & 0x1f;
        }
        // 1110xxxx 10xxxxxx 10xxxxxx
        else if ((cc & 0xf0) === 0xe0) {
            num_bytes = 2;
            n = cc & 0x0f;
        }
        // Other is not supported, because we have only 16 bits for code points.
        // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        else {
            throw new Error("Code point too big.");
        }
        var j = i + 1,
            j_end = j + num_bytes;
        if (j_end > len) {
            throw new Error("Premature end of input string.");
        }
        for (; j !== j_end; ++j) {
            cc = str.charCodeAt(j);
            if (cc > 255) {
                throw new Error("Illegal character: must be in range [0; 255]: " + cc);
            }
            if ((cc & 0xc0) !== 0x80) {
                throw new Error("Illegal character: high bits must be 10: " + cc);
            }
            n <<= 6;
            n |= cc & 0x3f;
        }
        a.push(String.fromCharCode(n));
        i = j_end - 1;
    }
    return a.join("");
}



function get_simple_date_str() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    return "" + y + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d;
}


function Stopwatch() {
    this.start_times = {};
    this.end_times = {};
}
Stopwatch.prototype = {
    start: function(name /*= null*/ ) {
        this.start_times[name] = Date.now();
        this.end_times[name] = 0;
    },

    stop: function(name /*= null*/ ) {
        this.end_times[name] = Date.now();
    },

    time: function(name /*= null*/ ) {
        return (this.end_times[name] || Date.now()) - this.start_times[name];
    }
};


function refresh_signature_func(ctx) {
    var df = parse_swf(ctx);
    if (!df) {
        return;
    }

    var stopwatch = new Stopwatch();
    stopwatch.start();
    var rc = decode(df);
    if (!rc) {
        return;
    }
    var code = [
        "/* Not encoded. */",
        "if (params.stream.sig) { return params.stream.sig; }",
        "/* " + get_simple_date_str() + ": " + String(ctx.file).replace(/[\\*]/g, "_") + " */",
        "var s = params.stream.s;",
        "if (!s) { return ''; }",
        "var swap = params.swap;",
        "var a = s.split('');"
    ];
    for (var i = 0, len = rc.calls.length; i !== len; ++i) {
        var o = rc.calls[i];
        switch (o.name) {
            case "swap":
                code.push("swap(a, " + o.arg + ");");
                break;
            case "clone":
                code.push("a = a.slice(" + o.arg + ");");
                break;
            case "reverse":
                code.push("a.reverse();");
                break;
            default:
                return;
        }
    }
    code.push("return a.join('');");
    stopwatch.stop();
    log("Got signature function in " + stopwatch.time() + " ms.");
    return {
        timestamp: rc.timestamp,
        func_text: code.join(" ")
    };
}


function Decoder(file, reader, states, idx /*= 0*/ ) {
    this.result = {
        timestamp: -1,
        calls: []
    };
    this.file = file;
    this.reset(reader, states, idx);
}
Decoder.prototype = {
    run: function() {
        var done = false;
        while (!done && !this.reader.eof()) {
            var res;
            var o = this.parse_op();
            if (!o) {
                break;
            }
            var sv = this.states[this.idx];
            switch (typeof(sv)) {
                case "number":
                    res = this.advance_if(o.op === sv);
                    break;
                case "function":
                    res = sv.call(this, o.op, o);
                    break;
                default:
                    throw new Error("Invalid state type: " + typeof(sv));
            }
            if (!res) {
                done = res === null;
                break;
            }
        }
        return done ? this.result : null;
    },
    parse_op: function() {
        var o = {};
        var dar = this.reader;
        switch (o.op = dar.read_u8()) {
            case AS3_OP_COERCE_S:
            case AS3_OP_GETLOCAL_0:
            case AS3_OP_GETLOCAL_1:
            case AS3_OP_GETLOCAL_2:
            case AS3_OP_GETLOCAL_3:
            case AS3_OP_MODULO:
            case AS3_OP_PUSHSCOPE:
            case AS3_OP_SETLOCAL_1:
            case AS3_OP_SETLOCAL_2:
            case AS3_OP_SETLOCAL_3:
            case AS3_OP_RETURNVALUE:
            case AS3_OP_RETURNVOID:
                break;
            case AS3_OP_PUSHBYTE:
                o.value = dar.read_u8();
                break;
            case AS3_OP_PUSHSHORT:
                o.value = dar.read_u30();
                break;
            case AS3_OP_COERCE:
            case AS3_OP_FINDPROPERTY:
            case AS3_OP_FINDPROPSTRICT:
            case AS3_OP_GETLEX:
            case AS3_OP_GETLOCAL:
            case AS3_OP_GETPROPERTY:
            case AS3_OP_PUSHINT:
            case AS3_OP_PUSHSTRING:
            case AS3_OP_PUSHUINT:
            case AS3_OP_SETLOCAL:
            case AS3_OP_SETPROPERTY:
                o.index = dar.read_u30();
                break;
            case AS3_OP_IFTRUE:
                o.offset = dar.read_s24();
                break;
            case AS3_OP_CALLPROPERTY:
            case AS3_OP_CALLPROPVOID:
            case AS3_OP_CONSTRUCTPROP:
                o.index = dar.read_u30();
                o.arg_count = dar.read_u30();
                break;
            default:
                return null;
        }
        return o;
    },
    advance_if: function(cond) {
        return cond ? ++this.idx : false;
    },
    switch_if: function(cond, states, idx /*= 0*/ ) {
        if (!cond) {
            return false;
        }
        this.reset(this.reader, states, idx);
        return true;
    },
    done_if: function(cond) {
        return cond ? null : false;
    },
    reset: function(reader, states, idx /*= 0*/ ) {
        this.reader = reader;
        this.states = states;
        this.idx = idx || 0;
    },
};

function decode(df) {
    var cp = df.constant_pool;
    var inst_idx = -1;
    for (var i = 0, len = df.instances.length; i !== len; ++i) {
        var ii = df.instances[i];
        if (cp.multinames[ii.name].kind !== doabc_CONSTANT_QName) {
            continue;
        }
        if (cp.resolve_multiname(ii.name) === "com.google.youtube.util.SignatureDecipher") {
            inst_idx = i;
            break;
        }
    }
    if (inst_idx === -1) {
        return;
    }
    var mb_cinit, mb_decipher;
    var cls = df.classes[inst_idx];
    mb_cinit = df.get_method_body(cls.cinit);
    if (!mb_cinit) {
        return;
    }
    for (var i = 0, len = cls.traits.length; i !== len; ++i) {
        var ti = cls.traits[i];
        if (ti.kind !== doabc_Trait_Method || cp.multinames[ti.name].kind !== doabc_CONSTANT_QName) {
            continue;
        }
        var s_name = cp.resolve_multiname(ti.name);
        if (s_name === "decipher") {
            if (mb_decipher) {
                return;
            }
            mb_decipher = df.get_method_body(ti.trait.method);
            if (!mb_decipher) {
                return;
            }
        }
    }
    if (!mb_decipher) {
        return;
    }

    var ctx = {
        cls_name_idx: -1,
        func_name_idx: -1,
        name_by_index: {},
        call_arg: null
    };
    var PS_TIMESTAMP = [
        function(op, o) {
            return op !== AS3_OP_FINDPROPERTY || cp.resolve_multiname(o.index) !== "TIMESTAMP" || this.advance_if(true);
        },
        function(op, o) {
            return this.advance_if(op === AS3_OP_PUSHSHORT && (this.result.timestamp = o.value, 1)) || this.advance_if(op === AS3_OP_PUSHINT && (this.result.timestamp = cp.resolve_integer(o.index), 1)) || this.advance_if(op === AS3_OP_PUSHUINT && (this.result.timestamp = cp.resolve_uinteger(o.index), 1));
        },
        function(op) {
            if (op !== AS3_OP_SETPROPERTY) {
                return false;
            }
            this.reset(new doABCReader(mb_decipher.code), PS_DECIPHER);
            return true;
        }
    ];
    var PS_DECIPHER = [
        AS3_OP_GETLOCAL_0,
        AS3_OP_PUSHSCOPE,
        AS3_OP_GETLEX,
        AS3_OP_IFTRUE,
        AS3_OP_FINDPROPERTY,
        function(op, o) {
            return this.advance_if(op === AS3_OP_FINDPROPSTRICT && (ctx.cls_name_idx = o.index));
        },
        AS3_OP_CONSTRUCTPROP,
        AS3_OP_SETPROPERTY,
        AS3_OP_GETLEX,
        AS3_OP_GETLOCAL_1,
        function(op, o) {
            return this.advance_if(op === AS3_OP_PUSHSTRING && cp.resolve_string(o.index).length === 0);
        },
        function(op, o) {
            return this.advance_if(op === AS3_OP_CALLPROPERTY && cp.resolve_multiname(o.index) === "http://adobe.com/AS3/2006/builtin.split");
        },
        function(op, o) {
            return this.advance_if(op === AS3_OP_CALLPROPERTY && (ctx.func_name_idx = o.index));
        },
        function(op, o) {
            return this.advance_if(op === AS3_OP_PUSHSTRING && cp.resolve_string(o.index).length === 0);
        },
        function(op, o) {
            return this.advance_if(op === AS3_OP_CALLPROPERTY && cp.resolve_multiname(o.index) === "http://adobe.com/AS3/2006/builtin.join");
        },
        function(op) {
            if (op !== AS3_OP_RETURNVALUE) {
                return false;
            }
            var mb = this.file.get_method_body_by_name_index(ctx.cls_name_idx, ctx.func_name_idx);
            if (!mb) {
                return false;
            }
            this.reset(new doABCReader(mb.code), PS_FUNC);
            return true;
        }
    ];
    var PS_FUNC = [
        AS3_OP_GETLOCAL_0,
        function(op) {
            return this.switch_if(op === AS3_OP_PUSHSCOPE, PS_FUNC_BRANCH);
        },
    ];
    var PS_FUNC_BRANCH = [
        function(op) {
            return this.switch_if(op === AS3_OP_GETLOCAL_0, PS_FUNC_CALL) || this.advance_if(op === AS3_OP_GETLOCAL_1);
        },
        function(op) {
            return this.done_if(op === AS3_OP_RETURNVALUE);
        }
    ];
    var PS_FUNC_CALL = [
        AS3_OP_GETLOCAL_1,
        function(op, o) {
            return this.advance_if(op === AS3_OP_PUSHBYTE && (ctx.call_arg = o.value, 1));
        },
        function(op, o) {
            if (op !== AS3_OP_CALLPROPERTY) {
                return false;
            }
            var func_name_idx = o.index;
            var func_name = ctx.name_by_index[func_name_idx];
            if (!func_name) {
                var mb = this.file.get_method_body_by_name_index(ctx.cls_name_idx, func_name_idx);
                if (!mb) {
                    return false;
                }
                var PS_TEST = [
                    AS3_OP_GETLOCAL_0,
                    AS3_OP_PUSHSCOPE,
                    AS3_OP_GETLOCAL_1,
                    function(op) {
                        return this.done_if((op === AS3_OP_GETLOCAL_2 && (this.result = "clone")) || (op === AS3_OP_CALLPROPVOID && (this.result = "reverse")) || (op === AS3_OP_PUSHBYTE && (this.result = "swap")));
                    }
                ];
                var d = new Decoder(df, new doABCReader(mb.code), PS_TEST);
                if (d.run()) {
                    func_name = d.result;
                }
                if (!func_name) {
                    return false;
                }
                ctx.name_by_index[func_name_idx] = func_name;
            }
            this.result.calls.push({
                name: func_name,
                arg: ctx.call_arg
            });
            return this.advance_if(true);
        },
        function(op) {
            return op === AS3_OP_COERCE || this.switch_if(op === AS3_OP_SETLOCAL_1, PS_FUNC_BRANCH);
        }
    ];

    var d = new Decoder(df, new doABCReader(mb_cinit.code), PS_TIMESTAMP);
    return d.run();
}



function parse_swf(ctx) {
    var stopwatch = new Stopwatch();

    stopwatch.start();
    var swf_inflated = swf_inflate(ctx.bytes);
    stopwatch.stop();
    log("SWF inflated in " + stopwatch.time() + " ms.");
    ctx.bytes = null;

    stopwatch.start();
    var bs = new SwfStream(swf_inflated);
    bs.skip_bytes(8); // Signature, version, size.
    var num_bits = bs.read_bits(5);
    bs.read_bits(num_bits);
    bs.read_bits(num_bits);
    bs.read_bits(num_bits);
    bs.read_bits(num_bits);
    bs.skip_bytes(4); // Frame rate, frame count.

    var df = null;
    for (;;) {
        var t = bs.read_uint16();
        var tag_type = bs.n_hbits16(t, 10);
        var tag_len = bs.n_lbits16(t, 6);
        if (tag_len === 0x3f) {
            tag_len = bs.read_sint32();
        }
        if (0 === tag_type) {
            break;
        }
        if (tag_type !== 82) {
            bs.skip_bytes(tag_len);
            continue;
        }

        var bytes = bs.read_bytes(tag_len);
        var dar = new doABCReader(bytes);
        for (var i = 0; i !== 4; ++i) {
            dar.read_u8();
        }
        while (dar.read_u8() !== 0) {}
        df = new doABCFile();
        df.minor_version = dar.read_u16();
        df.major_verison = dar.read_u16();
        df.constant_pool = dar.read_cpool_info();

        var cnt;
        cnt = dar.read_u30();
        df.methods = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            df.methods[i] = dar.read_method_info();
        }

        cnt = dar.read_u30();
        df.metadata = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            df.metadata[i] = dar.read_metadata_info();
        }

        cnt = dar.read_u30();
        df.instances = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            df.instances[i] = dar.read_instance_info();
        }
        df.classes = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            df.classes[i] = dar.read_class_info();
        }

        cnt = dar.read_u30();
        df.scripts = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            df.scripts[i] = dar.read_script_info();
        }

        cnt = dar.read_u30();
        df.method_bodies = new Array(cnt);
        for (var i = 0; i !== cnt; ++i) {
            df.method_bodies[i] = dar.read_method_body_info();
        }

        break;
    }
    stopwatch.stop();
    log("SWF parsed in " + stopwatch.time() + " ms.");

    return df;
}

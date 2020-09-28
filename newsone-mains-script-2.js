/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector
 * Version 1.0.4 | Apr 1 2013
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 */

//AMD and CommonJS initialization copied from https://github.com/zohararad/audio5js
(function(root, ns, factory) {
    "use strict";

    if (typeof (module) !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(ns, root);
    } else if (typeof (define) === 'function' && define.amd) {
        // AMD
        define("factory", function() {
            return factory(ns, root);
        });
    } else {
        root[ns] = factory(ns, root);
    }

}(window, 'detectZoom', function() {

    /**
     * Use devicePixelRatio if supported by the browser
     * @return {Number}
     * @private
     */
    var devicePixelRatio = function() {
        return window.devicePixelRatio || 1;
    };

    /**
     * Fallback function to set default values
     * @return {Object}
     * @private
     */
    var fallback = function() {
        return {
            zoom: 1,
            devicePxPerCssPx: 1
        };
    };
    /**
     * IE 8 and 9: no trick needed!
     * TODO: Test on IE10 and Windows 8 RT
     * @return {Object}
     * @private
     **/
    var ie8 = function() {
        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * For IE10 we need to change our technique again...
     * thanks https://github.com/stefanvanburen
     * @return {Object}
     * @private
     */
    var ie10 = function() {
        var zoom = Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Mobile WebKit
     * the trick: window.innerWIdth is in CSS pixels, while
     * screen.width and screen.height are in system pixels.
     * And there are no scrollbars to mess up the measurement.
     * @return {Object}
     * @private
     */
    var webkitMobile = function() {
        var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;
        var zoom = deviceWidth / window.innerWidth;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Desktop Webkit
     * the trick: an element's clientHeight is in CSS pixels, while you can
     * set its line-height in system pixels using font-size and
     * -webkit-text-size-adjust:none.
     * device-pixel-ratio: http://www.webkit.org/blog/55/high-dpi-web-sites/
     *
     * Previous trick (used before http://trac.webkit.org/changeset/100847):
     * documentElement.scrollWidth is in CSS pixels, while
     * document.width was in system pixels. Note that this is the
     * layout width of the document, which is slightly different from viewport
     * because document width does not include scrollbars and might be wider
     * due to big elements.
     * @return {Object}
     * @private
     */
    var webkit = function() {
        var important = function(str) {
            return str.replace(/;/g, " !important;");
        };

        var div = document.createElement('div');
        div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
        div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));

        // The container exists so that the div will be laid out in its own flow
        // while not impacting the layout, viewport size, or display of the
        // webpage as a whole.
        // Add !important and relevant CSS rule resets
        // so that other rules cannot affect the results.
        var container = document.createElement('div');
        container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
        container.appendChild(div);

        document.body.appendChild(container);
        var zoom = 1000 / div.clientHeight;
        zoom = Math.round(zoom * 100) / 100;
        document.body.removeChild(container);

        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
     * (Note that this is a different interpretation than Webkit's device
     * pixel ratio, which is the ratio device dpi / system dpi).
     *
     * Also, for Mozilla, there is no difference between the zoom factor and the device ratio.
     *
     * @return {Object}
     * @private
     */
    var firefox4 = function() {
        var zoom = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom
        };
    };

    /**
     * Firefox 18.x
     * Mozilla added support for devicePixelRatio to Firefox 18,
     * but it is affected by the zoom level, so, like in older
     * Firefox we can't tell if we are in zoom mode or in a device
     * with a different pixel ratio
     * @return {Object}
     * @private
     */
    var firefox18 = function() {
        return {
            zoom: firefox4().zoom,
            devicePxPerCssPx: devicePixelRatio()
        };
    };

    /**
     * works starting Opera 11.11
     * the trick: outerWidth is the viewport width including scrollbars in
     * system px, while innerWidth is the viewport width including scrollbars
     * in CSS px
     * @return {Object}
     * @private
     */
    var opera11 = function() {
        var zoom = window.top.outerWidth / window.top.innerWidth;
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Use a binary search through media queries to find zoom level in Firefox
     * @param property
     * @param unit
     * @param a
     * @param b
     * @param maxIter
     * @param epsilon
     * @return {Number}
     */
    var mediaQueryBinarySearch = function(property, unit, a, b, maxIter, epsilon) {
        var matchMedia;
        var head, style, div;
        if (window.matchMedia) {
            matchMedia = window.matchMedia;
        } else {
            head = document.getElementsByTagName('head')[0];
            style = document.createElement('style');
            head.appendChild(style);

            div = document.createElement('div');
            div.className = 'mediaQueryBinarySearch';
            div.style.display = 'none';
            document.body.appendChild(div);

            matchMedia = function(query) {
                style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
                var matched = getComputedStyle(div, null).textDecoration == 'underline';
                style.sheet.deleteRule(0);
                return {
                    matches: matched
                };
            }
            ;
        }
        var ratio = binarySearch(a, b, maxIter);
        if (div) {
            head.removeChild(style);
            document.body.removeChild(div);
        }
        return ratio;

        function binarySearch(a, b, maxIter) {
            var mid = (a + b) / 2;
            if (maxIter <= 0 || b - a < epsilon) {
                return mid;
            }
            var query = "(" + property + ":" + mid + unit + ")";
            if (matchMedia(query).matches) {
                return binarySearch(mid, b, maxIter - 1);
            } else {
                return binarySearch(a, mid, maxIter - 1);
            }
        }
    };

    /**
     * Generate detection function
     * @private
     */
    var detectFunction = (function() {
        var func = fallback;
        //IE8+
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            func = ie8;
        }// IE10+ / Touch
        else if (window.navigator.msMaxTouchPoints) {
            func = ie10;
        }//Mobile Webkit
        else if ('orientation'in window && typeof document.body.style.webkitMarquee === 'string') {
            func = webkitMobile;
        }//WebKit
        else if (typeof document.body.style.webkitMarquee === 'string') {
            func = webkit;
        }//Opera
        else if (navigator.userAgent.indexOf('Opera') >= 0) {
            func = opera11;
        }//Last one is Firefox
        //FF 18.x
        else if (window.devicePixelRatio) {
            func = firefox18;
        }//FF 4.0 - 17.x
        else if (firefox4().zoom > 0.001) {
            func = firefox4;
        }

        return func;
    }());

    return ({

        /**
         * Ratios.zoom shorthand
         * @return {Number} Zoom level
         */
        zoom: function() {
            return detectFunction().zoom;
        },

        /**
         * Ratios.devicePxPerCssPx shorthand
         * @return {Number} devicePxPerCssPx level
         */
        device: function() {
            return detectFunction().devicePxPerCssPx;
        }
    });
}));

var wpcom_img_zoomer = {
    clientHintSupport: {
        gravatar: false,
        files: false,
        photon: false,
        mshots: false,
        staticAssets: false,
        latex: false,
        imgpress: false,
    },
    useHints: false,
    zoomed: false,
    timer: null,
    interval: 1000,
    // zoom polling interval in millisecond

    // Should we apply width/height attributes to control the image size?
    imgNeedsSizeAtts: function(img) {
        // Do not overwrite existing width/height attributes.
        if (img.getAttribute('width') !== null || img.getAttribute('height') !== null)
            return false;
        // Do not apply the attributes if the image is already constrained by a parent element.
        if (img.width < img.naturalWidth || img.height < img.naturalHeight)
            return false;
        return true;
    },

    hintsFor: function(service) {
        if (this.useHints === false) {
            return false;
        }
        if (this.hints() === false) {
            return false;
        }
        if (typeof this.clientHintSupport[service] === "undefined") {
            return false;
        }
        if (this.clientHintSupport[service] === true) {
            return true;
        }
        return false;
    },

    hints: function() {
        try {
            var chrome = window.navigator.userAgent.match(/\sChrome\/([0-9]+)\.[.0-9]+\s/)
            if (chrome !== null) {
                var version = parseInt(chrome[1], 10)
                if (isNaN(version) === false && version >= 46) {
                    return true
                }
            }
        } catch (e) {
            return false
        }
        return false
    },

    init: function() {
        var t = this;
        try {
            t.zoomImages();
            t.timer = setInterval(function() {
                t.zoomImages();
            }, t.interval);
        } catch (e) {}
    },

    stop: function() {
        if (this.timer)
            clearInterval(this.timer);
    },

    getScale: function() {
        var scale = detectZoom.device();
        // Round up to 1.5 or the next integer below the cap.
        if (scale <= 1.0)
            scale = 1.0;
        else if (scale <= 1.5)
            scale = 1.5;
        else if (scale <= 2.0)
            scale = 2.0;
        else if (scale <= 3.0)
            scale = 3.0;
        else if (scale <= 4.0)
            scale = 4.0;
        else
            scale = 5.0;
        return scale;
    },

    shouldZoom: function(scale) {
        var t = this;
        // Do not operate on hidden frames.
        if ("innerWidth"in window && !window.innerWidth)
            return false;
        // Don't do anything until scale > 1
        if (scale == 1.0 && t.zoomed == false)
            return false;
        return true;
    },

    zoomImages: function() {
        var t = this;
        var scale = t.getScale();
        if (!t.shouldZoom(scale)) {
            return;
        }
        t.zoomed = true;
        // Loop through all the <img> elements on the page.
        var imgs = document.getElementsByTagName("img");

        for (var i = 0; i < imgs.length; i++) {
            // Wait for original images to load
            if ("complete"in imgs[i] && !imgs[i].complete)
                continue;

            // Skip images that have srcset attributes.
            if (imgs[i].hasAttribute('srcset')) {
                continue;
            }

            // Skip images that don't need processing.
            var imgScale = imgs[i].getAttribute("scale");
            if (imgScale == scale || imgScale == "0")
                continue;

            // Skip images that have already failed at this scale
            var scaleFail = imgs[i].getAttribute("scale-fail");
            if (scaleFail && scaleFail <= scale)
                continue;

            // Skip images that have no dimensions yet.
            if (!(imgs[i].width && imgs[i].height))
                continue;

            // Skip images from Lazy Load plugins
            if (!imgScale && imgs[i].getAttribute("data-lazy-src") && (imgs[i].getAttribute("data-lazy-src") !== imgs[i].getAttribute("src")))
                continue;

            if (t.scaleImage(imgs[i], scale)) {
                // Mark the img as having been processed at this scale.
                imgs[i].setAttribute("scale", scale);
            } else {
                // Set the flag to skip this image.
                imgs[i].setAttribute("scale", "0");
            }
        }
    },

    scaleImage: function(img, scale) {
        var t = this;
        var newSrc = img.src;

        var isFiles = false;
        var isLatex = false;
        var isPhoton = false;

        // Skip slideshow images
        if (img.parentNode.className.match(/slideshow-slide/))
            return false;

        // Skip CoBlocks Lightbox images
        if (img.parentNode.className.match(/coblocks-lightbox__image/))
            return false;

        // Scale gravatars that have ?s= or ?size=
        if (img.src.match(/^https?:\/\/([^\/]*\.)?gravatar\.com\/.+[?&](s|size)=/)) {
            if (this.hintsFor("gravatar") === true) {
                return false;
            }
            newSrc = img.src.replace(/([?&](s|size)=)(\d+)/, function($0, $1, $2, $3) {
                // Stash the original size
                var originalAtt = "originals"
                  , originalSize = img.getAttribute(originalAtt);
                if (originalSize === null) {
                    originalSize = $3;
                    img.setAttribute(originalAtt, originalSize);
                    if (t.imgNeedsSizeAtts(img)) {
                        // Fix width and height attributes to rendered dimensions.
                        img.width = img.width;
                        img.height = img.height;
                    }
                }
                // Get the width/height of the image in CSS pixels
                var size = img.clientWidth;
                // Convert CSS pixels to device pixels
                var targetSize = Math.ceil(img.clientWidth * scale);
                // Don't go smaller than the original size
                targetSize = Math.max(targetSize, originalSize);
                // Don't go larger than the service supports
                targetSize = Math.min(targetSize, 512);
                return $1 + targetSize;
            });
        }
        // Scale mshots that have width
        else if (img.src.match(/^https?:\/\/([^\/]+\.)*(wordpress|wp)\.com\/mshots\/.+[?&]w=\d+/)) {
            if (this.hintsFor("mshots") === true) {
                return false;
            }
            newSrc = img.src.replace(/([?&]w=)(\d+)/, function($0, $1, $2) {
                // Stash the original size
                var originalAtt = 'originalw'
                  , originalSize = img.getAttribute(originalAtt);
                if (originalSize === null) {
                    originalSize = $2;
                    img.setAttribute(originalAtt, originalSize);
                    if (t.imgNeedsSizeAtts(img)) {
                        // Fix width and height attributes to rendered dimensions.
                        img.width = img.width;
                        img.height = img.height;
                    }
                }
                // Get the width of the image in CSS pixels
                var size = img.clientWidth;
                // Convert CSS pixels to device pixels
                var targetSize = Math.ceil(size * scale);
                // Don't go smaller than the original size
                targetSize = Math.max(targetSize, originalSize);
                // Don't go bigger unless the current one is actually lacking
                if (scale > img.getAttribute("scale") && targetSize <= img.naturalWidth)
                    targetSize = $2;
                if ($2 != targetSize)
                    return $1 + targetSize;
                return $0;
            });

            // Update height attribute to match width
            newSrc = newSrc.replace(/([?&]h=)(\d+)/, function($0, $1, $2) {
                if (newSrc == img.src) {
                    return $0;
                }
                // Stash the original size
                var originalAtt = 'originalh'
                  , originalSize = img.getAttribute(originalAtt);
                if (originalSize === null) {
                    originalSize = $2;
                    img.setAttribute(originalAtt, originalSize);
                }
                // Get the height of the image in CSS pixels
                var size = img.clientHeight;
                // Convert CSS pixels to device pixels
                var targetSize = Math.ceil(size * scale);
                // Don't go smaller than the original size
                targetSize = Math.max(targetSize, originalSize);
                // Don't go bigger unless the current one is actually lacking
                if (scale > img.getAttribute("scale") && targetSize <= img.naturalHeight)
                    targetSize = $2;
                if ($2 != targetSize)
                    return $1 + targetSize;
                return $0;
            });
        }
        // Scale simple imgpress queries (s0.wp.com) that only specify w/h/fit
        else if (img.src.match(/^https?:\/\/([^\/.]+\.)*(wp|wordpress)\.com\/imgpress\?(.+)/)) {
            if (this.hintsFor("imgpress") === true) {
                return false;
            }
            var imgpressSafeFunctions = ["zoom", "url", "h", "w", "fit", "filter", "brightness", "contrast", "colorize", "smooth", "unsharpmask"];
            // Search the query string for unsupported functions.
            var qs = RegExp.$3.split('&');
            for (var q in qs) {
                q = qs[q].split('=')[0];
                if (imgpressSafeFunctions.indexOf(q) == -1) {
                    return false;
                }
            }
            // Fix width and height attributes to rendered dimensions.
            img.width = img.width;
            img.height = img.height;
            // Compute new src
            if (scale == 1)
                newSrc = img.src.replace(/\?(zoom=[^&]+&)?/, '?');
            else
                newSrc = img.src.replace(/\?(zoom=[^&]+&)?/, '?zoom=' + scale + '&');
        }
        // Scale files.wordpress.com, LaTeX, or Photon images (i#.wp.com)
        else if ((isFiles = img.src.match(/^https?:\/\/([^\/]+)\.files\.wordpress\.com\/.+[?&][wh]=/)) || (isLatex = img.src.match(/^https?:\/\/([^\/.]+\.)*(wp|wordpress)\.com\/latex\.php\?(latex|zoom)=(.+)/)) || (isPhoton = img.src.match(/^https?:\/\/i[\d]{1}\.wp\.com\/(.+)/))) {
            if (false !== isFiles && this.hintsFor("files") === true) {
                return false
            }
            if (false !== isLatex && this.hintsFor("latex") === true) {
                return false
            }
            if (false !== isPhoton && this.hintsFor("photon") === true) {
                return false
            }
            // Fix width and height attributes to rendered dimensions.
            img.width = img.width;
            img.height = img.height;
            // Compute new src
            if (scale == 1) {
                newSrc = img.src.replace(/\?(zoom=[^&]+&)?/, '?');
            } else {
                newSrc = img.src;

                var url_var = newSrc.match(/([?&]w=)(\d+)/);
                if (url_var !== null && url_var[2]) {
                    newSrc = newSrc.replace(url_var[0], url_var[1] + img.width);
                }

                url_var = newSrc.match(/([?&]h=)(\d+)/);
                if (url_var !== null && url_var[2]) {
                    newSrc = newSrc.replace(url_var[0], url_var[1] + img.height);
                }

                var zoom_arg = '&zoom=2';
                if (!newSrc.match(/\?/)) {
                    zoom_arg = '?zoom=2';
                }
                img.setAttribute('srcset', newSrc + zoom_arg + ' ' + scale + 'x');
            }
        }
        // Scale static assets that have a name matching *-1x.png or *@1x.png
        else if (img.src.match(/^https?:\/\/[^\/]+\/.*[-@]([12])x\.(gif|jpeg|jpg|png)(\?|$)/)) {
            if (this.hintsFor("staticAssets") === true) {
                return false;
            }
            // Fix width and height attributes to rendered dimensions.
            img.width = img.width;
            img.height = img.height;
            var currentSize = RegExp.$1
              , newSize = currentSize;
            if (scale <= 1)
                newSize = 1;
            else
                newSize = 2;
            if (currentSize != newSize)
                newSrc = img.src.replace(/([-@])[12]x\.(gif|jpeg|jpg|png)(\?|$)/, '$1' + newSize + 'x.$2$3');
        }
        else {
            return false;
        }

        // Don't set img.src unless it has changed. This avoids unnecessary reloads.
        if (newSrc != img.src) {
            // Store the original img.src
            var prevSrc, origSrc = img.getAttribute("src-orig");
            if (!origSrc) {
                origSrc = img.src;
                img.setAttribute("src-orig", origSrc);
            }
            // In case of error, revert img.src
            prevSrc = img.src;
            img.onerror = function() {
                img.src = prevSrc;
                if (img.getAttribute("scale-fail") < scale)
                    img.setAttribute("scale-fail", scale);
                img.onerror = null;
            }
            ;
            // Finally load the new image
            img.src = newSrc;
        }

        return true;
    }
};

wpcom_img_zoomer.init();
;/* global ione3Vuukle */

var VUUKLE_CONFIG = ione3Vuukle.config;

// (function() {
//     var d = document
//       , s = d.createElement('script');

//     s.src = 'https://cdn.vuukle.com/platform.js';
//     s.async = 1;
//     (d.head || d.body).appendChild(s);
// }
// )();
window.addEventListener( 'load', function() {
  setTimeout( function() {
    var s = document.createElement("script"), el = document.getElementsByTagName("script")[0]; s.async = true;
    s.src = 'https://cdn.vuukle.com/platform.js';
    el.parentNode.insertBefore(s, el);
  }, 2700 );
} );
;/*! ione3 - v0.1.0
 * https://interactiveone.com
 * Copyright (c) 2020; * Licensed GPLv2+ */

!function(e, t) {
    var i = function(o, h) {
        "use strict";
        if (!h.getElementsByClassName)
            return;
        var f, g, y = h.documentElement, n = o.Date, s = o.HTMLPictureElement, a = "addEventListener", m = "getAttribute", t = o[a], p = o.setTimeout, i = o.requestAnimationFrame || p, r = o.requestIdleCallback, u = /^picture$/i, l = ["load", "error", "lazyincluded", "_lazyloaded"], d = {}, v = Array.prototype.forEach, c = function(e, t) {
            return d[t] || (d[t] = new RegExp("(\\s|^)" + t + "(\\s|$)")),
            d[t].test(e[m]("class") || "") && d[t]
        }, w = function(e, t) {
            c(e, t) || e.setAttribute("class", (e[m]("class") || "").trim() + " " + t)
        }, b = function(e, t) {
            var i;
            (i = c(e, t)) && e.setAttribute("class", (e[m]("class") || "").replace(i, " "))
        }, k = function(t, i, e) {
            var o = e ? a : "removeEventListener";
            e && k(t, i),
            l.forEach(function(e) {
                t[o](e, i)
            })
        }, T = function(e, t, i, o, s) {
            var n = h.createEvent("Event");
            return i || (i = {}),
            i.instance = f,
            n.initEvent(t, !o, !s),
            n.detail = i,
            e.dispatchEvent(n),
            n
        }, S = function(e, t) {
            var i;
            !s && (i = o.picturefill || g.pf) ? (t && t.src && !e[m]("srcset") && e.setAttribute("srcset", t.src),
            i({
                reevaluate: !0,
                elements: [e]
            })) : t && t.src && (e.src = t.src)
        }, C = function(e, t) {
            return (getComputedStyle(e, null) || {})[t]
        }, $ = function(e, t, i) {
            for (i = i || e.offsetWidth; i < g.minSize && t && !e._lazysizesWidth; )
                i = t.offsetWidth,
                t = t.parentNode;
            return i
        }, _ = (I = [],
        z = [],
        P = I,
        L = function() {
            var e = P;
            for (P = I.length ? z : I,
            E = !(A = !0); e.length; )
                e.shift()();
            A = !1
        }
        ,
        O = function(e, t) {
            A && !t ? e.apply(this, arguments) : (P.push(e),
            E || (E = !0,
            (h.hidden ? p : i)(L)))
        }
        ,
        O._lsFlush = L,
        O), e = function(i, e) {
            return e ? function() {
                _(i)
            }
            : function() {
                var e = this
                  , t = arguments;
                _(function() {
                    i.apply(e, t)
                })
            }
        }, x = function(e) {
            var t, i, o = function() {
                t = null,
                e()
            }, s = function() {
                var e = n.now() - i;
                e < 99 ? p(s, 99 - e) : (r || o)(o)
            };
            return function() {
                i = n.now(),
                t || (t = p(s, 99))
            }
        };
        var A, E, I, z, P, L, O;
        !function() {
            var e, t = {
                lazyClass: "lazyload",
                loadedClass: "lazyloaded",
                loadingClass: "lazyloading",
                preloadClass: "lazypreload",
                errorClass: "lazyerror",
                autosizesClass: "lazyautosizes",
                srcAttr: "data-src",
                srcsetAttr: "data-srcset",
                sizesAttr: "data-sizes",
                minSize: 40,
                customMedia: {},
                init: !0,
                expFactor: 1.5,
                hFac: .8,
                loadMode: 2,
                loadHidden: !0,
                ricTimeout: 0,
                throttleDelay: 125
            };
            for (e in g = o.lazySizesConfig || o.lazysizesConfig || {},
            t)
                e in g || (g[e] = t[e]);
            o.lazySizesConfig = g,
            p(function() {
                g.init && j()
            })
        }();
        var H = (re = /^img$/i,
        le = /^iframe$/i,
        de = "onscroll"in o && !/(gle|ing)bot/.test(navigator.userAgent),
        ce = 0,
        pe = 0,
        ue = -1,
        he = function(e) {
            pe--,
            (!e || pe < 0 || !e.target) && (pe = 0)
        }
        ,
        fe = function(e) {
            return null == Z && (Z = "hidden" == C(h.body, "visibility")),
            Z || "hidden" != C(e.parentNode, "visibility") && "hidden" != C(e, "visibility")
        }
        ,
        ge = function(e, t) {
            var i, o = e, s = fe(e);
            for (V -= t,
            J += t,
            X -= t,
            K += t; s && (o = o.offsetParent) && o != h.body && o != y; )
                (s = 0 < (C(o, "opacity") || 1)) && "visible" != C(o, "overflow") && (i = o.getBoundingClientRect(),
                s = K > i.left && X < i.right && J > i.top - 1 && V < i.bottom + 1);
            return s
        }
        ,
        ye = function() {
            var e, t, i, o, s, n, a, r, l, d, c, p, u = f.elements;
            if ((q = g.loadMode) && pe < 8 && (e = u.length)) {
                for (t = 0,
                ue++,
                d = !g.expand || g.expand < 1 ? 500 < y.clientHeight && 500 < y.clientWidth ? 500 : 370 : g.expand,
                f._defEx = d,
                c = d * g.expFactor,
                p = g.hFac,
                Z = null,
                ce < c && pe < 1 && 2 < ue && 2 < q && !h.hidden ? (ce = c,
                ue = 0) : ce = 1 < q && 1 < ue && pe < 6 ? d : 0; t < e; t++)
                    if (u[t] && !u[t]._lazyRace)
                        if (de)
                            if ((r = u[t][m]("data-expand")) && (n = 1 * r) || (n = ce),
                            l !== n && (Y = innerWidth + n * p,
                            Q = innerHeight + n,
                            a = -1 * n,
                            l = n),
                            i = u[t].getBoundingClientRect(),
                            (J = i.bottom) >= a && (V = i.top) <= Q && (K = i.right) >= a * p && (X = i.left) <= Y && (J || K || X || V) && (g.loadHidden || fe(u[t])) && (G && pe < 3 && !r && (q < 3 || ue < 4) || ge(u[t], n))) {
                                if (Se(u[t]),
                                s = !0,
                                9 < pe)
                                    break
                            } else
                                !s && G && !o && pe < 4 && ue < 4 && 2 < q && (B[0] || g.preloadAfterLoad) && (B[0] || !r && (J || K || X || V || "auto" != u[t][m](g.sizesAttr))) && (o = B[0] || u[t]);
                        else
                            Se(u[t]);
                o && !s && Se(o)
            }
        }
        ,
        ee = ye,
        ie = 0,
        oe = g.throttleDelay,
        se = g.ricTimeout,
        ne = function() {
            te = !1,
            ie = n.now(),
            ee()
        }
        ,
        ae = r && 49 < se ? function() {
            r(ne, {
                timeout: se
            }),
            se !== g.ricTimeout && (se = g.ricTimeout)
        }
        : e(function() {
            p(ne)
        }, !0),
        me = function(e) {
            var t;
            (e = !0 === e) && (se = 33),
            te || (te = !0,
            (t = oe - (n.now() - ie)) < 0 && (t = 0),
            e || t < 9 ? ae() : p(ae, t))
        }
        ,
        ve = function(e) {
            var t = e.target;
            t._lazyCache ? delete t._lazyCache : (he(e),
            w(t, g.loadedClass),
            b(t, g.loadingClass),
            k(t, be),
            T(t, "lazyloaded"))
        }
        ,
        we = e(ve),
        be = function(e) {
            we({
                target: e.target
            })
        }
        ,
        ke = function(e) {
            var t, i = e[m](g.srcsetAttr);
            (t = g.customMedia[e[m]("data-media") || e[m]("media")]) && e.setAttribute("media", t),
            i && e.setAttribute("srcset", i)
        }
        ,
        Te = e(function(t, e, i, o, s) {
            var n, a, r, l, d, c;
            (d = T(t, "lazybeforeunveil", e)).defaultPrevented || (o && (i ? w(t, g.autosizesClass) : t.setAttribute("sizes", o)),
            a = t[m](g.srcsetAttr),
            n = t[m](g.srcAttr),
            s && (r = t.parentNode,
            l = r && u.test(r.nodeName || "")),
            c = e.firesLoad || "src"in t && (a || n || l),
            d = {
                target: t
            },
            w(t, g.loadingClass),
            c && (clearTimeout(U),
            U = p(he, 2500),
            k(t, be, !0)),
            l && v.call(r.getElementsByTagName("source"), ke),
            a ? t.setAttribute("srcset", a) : n && !l && (le.test(t.nodeName) ? function(t, i) {
                try {
                    t.contentWindow.location.replace(i)
                } catch (e) {
                    t.src = i
                }
            }(t, n) : t.src = n),
            s && (a || l) && S(t, {
                src: n
            })),
            t._lazyRace && delete t._lazyRace,
            b(t, g.lazyClass),
            _(function() {
                var e = t.complete && 1 < t.naturalWidth;
                c && !e || (e && w(t, "ls-is-cached"),
                ve(d),
                t._lazyCache = !0,
                p(function() {
                    "_lazyCache"in t && delete t._lazyCache
                }, 9))
            }, !0)
        }),
        Se = function(e) {
            var t, i = re.test(e.nodeName), o = i && (e[m](g.sizesAttr) || e[m]("sizes")), s = "auto" == o;
            (!s && G || !i || !e[m]("src") && !e.srcset || e.complete || c(e, g.errorClass) || !c(e, g.lazyClass)) && (t = T(e, "lazyunveilread").detail,
            s && D.updateElem(e, !0, e.offsetWidth),
            e._lazyRace = !0,
            pe++,
            Te(e, t, s, o, i))
        }
        ,
        Ce = function() {
            if (!G)
                if (n.now() - F < 999)
                    p(Ce, 999);
                else {
                    var e = x(function() {
                        g.loadMode = 3,
                        me()
                    });
                    G = !0,
                    g.loadMode = 3,
                    me(),
                    t("scroll", function() {
                        3 == g.loadMode && (g.loadMode = 2),
                        e()
                    }, !0)
                }
        }
        ,
        {
            _: function() {
                F = n.now(),
                f.elements = h.getElementsByClassName(g.lazyClass),
                B = h.getElementsByClassName(g.lazyClass + " " + g.preloadClass),
                t("scroll", me, !0),
                t("resize", me, !0),
                o.MutationObserver ? new MutationObserver(me).observe(y, {
                    childList: !0,
                    subtree: !0,
                    attributes: !0
                }) : (y[a]("DOMNodeInserted", me, !0),
                y[a]("DOMAttrModified", me, !0),
                setInterval(me, 999)),
                t("hashchange", me, !0),
                ["focus", "mouseover", "click", "load", "transitionend", "animationend", "webkitAnimationEnd"].forEach(function(e) {
                    h[a](e, me, !0)
                }),
                /d$|^c/.test(h.readyState) ? Ce() : (t("load", Ce),
                h[a]("DOMContentLoaded", me),
                p(Ce, 2e4)),
                f.elements.length ? (ye(),
                _._lsFlush()) : me()
            },
            checkElems: me,
            unveil: Se
        })
          , D = (W = e(function(e, t, i, o) {
            var s, n, a;
            if (e._lazysizesWidth = o,
            o += "px",
            e.setAttribute("sizes", o),
            u.test(t.nodeName || ""))
                for (s = t.getElementsByTagName("source"),
                n = 0,
                a = s.length; n < a; n++)
                    s[n].setAttribute("sizes", o);
            i.detail.dataAttr || S(e, i.detail)
        }),
        R = function(e, t, i) {
            var o, s = e.parentNode;
            s && (i = $(e, s, i),
            (o = T(e, "lazybeforesizes", {
                width: i,
                dataAttr: !!t
            })).defaultPrevented || (i = o.detail.width) && i !== e._lazysizesWidth && W(e, s, o, i))
        }
        ,
        N = x(function() {
            var e, t = M.length;
            if (t)
                for (e = 0; e < t; e++)
                    R(M[e])
        }),
        {
            _: function() {
                M = h.getElementsByClassName(g.autosizesClass),
                t("resize", N)
            },
            checkElems: N,
            updateElem: R
        })
          , j = function() {
            j.i || (j.i = !0,
            D._(),
            H._())
        };
        var M, W, R, N;
        var B, G, U, q, F, Y, Q, V, X, K, J, Z, ee, te, ie, oe, se, ne, ae, re, le, de, ce, pe, ue, he, fe, ge, ye, me, ve, we, be, ke, Te, Se, Ce;
        return f = {
            cfg: g,
            autoSizer: D,
            loader: H,
            init: j,
            uP: S,
            aC: w,
            rC: b,
            hC: c,
            fire: T,
            gW: $,
            rAF: _
        }
    }(e, e.document);
    e.lazySizes = i,
    "object" == typeof module && module.exports && (module.exports = i)
}(window),
function(e) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery"], e) : "undefined" != typeof exports ? module.exports = e(require("jquery")) : e(jQuery)
}(function(l) {
    "use strict";
    var a, r = window.Slick || {};
    a = 0,
    (r = function(e, t) {
        var i, o, s, n = this;
        if (n.defaults = {
            accessibility: !0,
            adaptiveHeight: !1,
            appendArrows: l(e),
            appendDots: l(e),
            arrows: !0,
            asNavFor: null,
            prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
            nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
            autoplay: !1,
            autoplaySpeed: 3e3,
            centerMode: !1,
            centerPadding: "50px",
            cssEase: "ease",
            customPaging: function(e, t) {
                return '<button type="button" data-role="none">' + (t + 1) + "</button>"
            },
            dots: !1,
            dotsClass: "slick-dots",
            draggable: !0,
            easing: "linear",
            edgeFriction: .35,
            fade: !1,
            focusOnSelect: !1,
            infinite: !0,
            initialSlide: 0,
            lazyLoad: "ondemand",
            mobileFirst: !1,
            pauseOnHover: !0,
            pauseOnDotsHover: !1,
            respondTo: "window",
            responsive: null,
            rows: 1,
            rtl: !1,
            slide: "",
            slidesPerRow: 1,
            slidesToShow: 1,
            slidesToScroll: 1,
            speed: 500,
            swipe: !0,
            swipeToSlide: !1,
            touchMove: !0,
            touchThreshold: 5,
            useCSS: !0,
            variableWidth: !1,
            vertical: !1,
            verticalSwiping: !1,
            waitForAnimate: !0
        },
        n.initials = {
            animating: !1,
            dragging: !1,
            autoPlayTimer: null,
            currentDirection: 0,
            currentLeft: null,
            currentSlide: 0,
            direction: 1,
            $dots: null,
            listWidth: null,
            listHeight: null,
            loadIndex: 0,
            $nextArrow: null,
            $prevArrow: null,
            slideCount: null,
            slideWidth: null,
            $slideTrack: null,
            $slides: null,
            sliding: !1,
            slideOffset: 0,
            swipeLeft: null,
            $list: null,
            touchObject: {},
            transformsEnabled: !1,
            unslicked: !1
        },
        l.extend(n, n.initials),
        n.activeBreakpoint = null,
        n.animType = null,
        n.animProp = null,
        n.breakpoints = [],
        n.breakpointSettings = [],
        n.cssTransitions = !1,
        n.hidden = "hidden",
        n.paused = !1,
        n.positionProp = null,
        n.respondTo = null,
        n.rowCount = 1,
        n.shouldClick = !0,
        n.$slider = l(e),
        n.$slidesCache = null,
        n.transformType = null,
        n.transitionType = null,
        n.visibilityChange = "visibilitychange",
        n.windowWidth = 0,
        n.windowTimer = null,
        i = l(e).data("slick") || {},
        n.options = l.extend({}, n.defaults, i, t),
        n.currentSlide = n.options.initialSlide,
        n.originalSettings = n.options,
        (o = n.options.responsive || null) && -1 < o.length) {
            for (s in n.respondTo = n.options.respondTo || "window",
            o)
                o.hasOwnProperty(s) && (n.breakpoints.push(o[s].breakpoint),
                n.breakpointSettings[o[s].breakpoint] = o[s].settings);
            n.breakpoints.sort(function(e, t) {
                return !0 === n.options.mobileFirst ? e - t : t - e
            })
        }
        void 0 !== document.mozHidden ? (n.hidden = "mozHidden",
        n.visibilityChange = "mozvisibilitychange") : void 0 !== document.webkitHidden && (n.hidden = "webkitHidden",
        n.visibilityChange = "webkitvisibilitychange"),
        n.autoPlay = l.proxy(n.autoPlay, n),
        n.autoPlayClear = l.proxy(n.autoPlayClear, n),
        n.changeSlide = l.proxy(n.changeSlide, n),
        n.clickHandler = l.proxy(n.clickHandler, n),
        n.selectHandler = l.proxy(n.selectHandler, n),
        n.setPosition = l.proxy(n.setPosition, n),
        n.swipeHandler = l.proxy(n.swipeHandler, n),
        n.dragHandler = l.proxy(n.dragHandler, n),
        n.keyHandler = l.proxy(n.keyHandler, n),
        n.autoPlayIterator = l.proxy(n.autoPlayIterator, n),
        n.instanceUid = a++,
        n.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/,
        n.init(!0),
        n.checkResponsive(!0)
    }
    ).prototype.addSlide = r.prototype.slickAdd = function(e, t, i) {
        var o = this;
        if ("boolean" == typeof t)
            i = t,
            t = null;
        else if (t < 0 || t >= o.slideCount)
            return !1;
        o.unload(),
        "number" == typeof t ? 0 === t && 0 === o.$slides.length ? l(e).appendTo(o.$slideTrack) : i ? l(e).insertBefore(o.$slides.eq(t)) : l(e).insertAfter(o.$slides.eq(t)) : !0 === i ? l(e).prependTo(o.$slideTrack) : l(e).appendTo(o.$slideTrack),
        o.$slides = o.$slideTrack.children(this.options.slide),
        o.$slideTrack.children(this.options.slide).detach(),
        o.$slideTrack.append(o.$slides),
        o.$slides.each(function(e, t) {
            l(t).attr("data-slick-index", e)
        }),
        o.$slidesCache = o.$slides,
        o.reinit()
    }
    ,
    r.prototype.animateHeight = function() {
        var e = this;
        if (1 === e.options.slidesToShow && !0 === e.options.adaptiveHeight && !1 === e.options.vertical) {
            var t = e.$slides.eq(e.currentSlide).outerHeight(!0);
            e.$list.animate({
                height: t
            }, e.options.speed)
        }
    }
    ,
    r.prototype.animateSlide = function(e, t) {
        var i = {}
          , o = this;
        o.animateHeight(),
        !0 === o.options.rtl && !1 === o.options.vertical && (e = -e),
        !1 === o.transformsEnabled ? !1 === o.options.vertical ? o.$slideTrack.animate({
            left: e
        }, o.options.speed, o.options.easing, t) : o.$slideTrack.animate({
            top: e
        }, o.options.speed, o.options.easing, t) : !1 === o.cssTransitions ? (!0 === o.options.rtl && (o.currentLeft = -o.currentLeft),
        l({
            animStart: o.currentLeft
        }).animate({
            animStart: e
        }, {
            duration: o.options.speed,
            easing: o.options.easing,
            step: function(e) {
                e = Math.ceil(e),
                !1 === o.options.vertical ? i[o.animType] = "translate(" + e + "px, 0px)" : i[o.animType] = "translate(0px," + e + "px)",
                o.$slideTrack.css(i)
            },
            complete: function() {
                t && t.call()
            }
        })) : (o.applyTransition(),
        e = Math.ceil(e),
        !1 === o.options.vertical ? i[o.animType] = "translate3d(" + e + "px, 0px, 0px)" : i[o.animType] = "translate3d(0px," + e + "px, 0px)",
        o.$slideTrack.css(i),
        t && setTimeout(function() {
            o.disableTransition(),
            t.call()
        }, o.options.speed))
    }
    ,
    r.prototype.asNavFor = function(t) {
        var e = this.options.asNavFor;
        e && null !== e && (e = l(e).not(this.$slider)),
        null !== e && "object" == typeof e && e.each(function() {
            var e = l(this).slick("getSlick");
            e.unslicked || e.slideHandler(t, !0)
        })
    }
    ,
    r.prototype.applyTransition = function(e) {
        var t = this
          , i = {};
        !1 === t.options.fade ? i[t.transitionType] = t.transformType + " " + t.options.speed + "ms " + t.options.cssEase : i[t.transitionType] = "opacity " + t.options.speed + "ms " + t.options.cssEase,
        !1 === t.options.fade ? t.$slideTrack.css(i) : t.$slides.eq(e).css(i)
    }
    ,
    r.prototype.autoPlay = function() {
        var e = this;
        e.autoPlayTimer && clearInterval(e.autoPlayTimer),
        e.slideCount > e.options.slidesToShow && !0 !== e.paused && (e.autoPlayTimer = setInterval(e.autoPlayIterator, e.options.autoplaySpeed))
    }
    ,
    r.prototype.autoPlayClear = function() {
        this.autoPlayTimer && clearInterval(this.autoPlayTimer)
    }
    ,
    r.prototype.autoPlayIterator = function() {
        var e = this;
        !1 === e.options.infinite ? 1 === e.direction ? (e.currentSlide + 1 === e.slideCount - 1 && (e.direction = 0),
        e.slideHandler(e.currentSlide + e.options.slidesToScroll)) : (e.currentSlide - 1 == 0 && (e.direction = 1),
        e.slideHandler(e.currentSlide - e.options.slidesToScroll)) : e.slideHandler(e.currentSlide + e.options.slidesToScroll)
    }
    ,
    r.prototype.buildArrows = function() {
        var e = this;
        !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow = l(e.options.prevArrow),
        e.$nextArrow = l(e.options.nextArrow),
        e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.appendTo(e.options.appendArrows),
        e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.appendTo(e.options.appendArrows),
        !0 !== e.options.infinite && e.$prevArrow.addClass("slick-disabled"))
    }
    ,
    r.prototype.buildDots = function() {
        var e, t, i = this;
        if (!0 === i.options.dots && i.slideCount > i.options.slidesToShow) {
            for (t = '<ul class="' + i.options.dotsClass + '">',
            e = 0; e <= i.getDotCount(); e += 1)
                t += "<li>" + i.options.customPaging.call(this, i, e) + "</li>";
            t += "</ul>",
            i.$dots = l(t).appendTo(i.options.appendDots),
            i.$dots.find("li").first().addClass("slick-active").attr("aria-hidden", "false")
        }
    }
    ,
    r.prototype.buildOut = function() {
        var e = this;
        e.$slides = e.$slider.children(":not(.slick-cloned)").addClass("slick-slide"),
        e.slideCount = e.$slides.length,
        e.$slides.each(function(e, t) {
            l(t).attr("data-slick-index", e).data("originalStyling", l(t).attr("style") || "")
        }),
        e.$slidesCache = e.$slides,
        e.$slider.addClass("slick-slider"),
        e.$slideTrack = 0 === e.slideCount ? l('<div class="slick-track"/>').appendTo(e.$slider) : e.$slides.wrapAll('<div class="slick-track"/>').parent(),
        e.$list = e.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(),
        e.$slideTrack.css("opacity", 0),
        !0 !== e.options.centerMode && !0 !== e.options.swipeToSlide || (e.options.slidesToScroll = 1),
        l("img[data-lazy]", e.$slider).not("[src]").addClass("slick-loading"),
        e.setupInfinite(),
        e.buildArrows(),
        e.buildDots(),
        e.updateDots(),
        !0 === e.options.accessibility && e.$list.prop("tabIndex", 0),
        e.setSlideClasses("number" == typeof this.currentSlide ? this.currentSlide : 0),
        !0 === e.options.draggable && e.$list.addClass("draggable")
    }
    ,
    r.prototype.buildRows = function() {
        var e, t, i, o, s, n, a, r = this;
        if (o = document.createDocumentFragment(),
        n = r.$slider.children(),
        1 < r.options.rows) {
            for (a = r.options.slidesPerRow * r.options.rows,
            s = Math.ceil(n.length / a),
            e = 0; e < s; e++) {
                var l = document.createElement("div");
                for (t = 0; t < r.options.rows; t++) {
                    var d = document.createElement("div");
                    for (i = 0; i < r.options.slidesPerRow; i++) {
                        var c = e * a + (t * r.options.slidesPerRow + i);
                        n.get(c) && d.appendChild(n.get(c))
                    }
                    l.appendChild(d)
                }
                o.appendChild(l)
            }
            r.$slider.html(o),
            r.$slider.children().children().children().css({
                width: 100 / r.options.slidesPerRow + "%",
                display: "inline-block"
            })
        }
    }
    ,
    r.prototype.checkResponsive = function(e) {
        var t, i, o, s = this, n = !1, a = s.$slider.width(), r = window.innerWidth || l(window).width();
        if ("window" === s.respondTo ? o = r : "slider" === s.respondTo ? o = a : "min" === s.respondTo && (o = Math.min(r, a)),
        s.originalSettings.responsive && -1 < s.originalSettings.responsive.length && null !== s.originalSettings.responsive) {
            for (t in i = null,
            s.breakpoints)
                s.breakpoints.hasOwnProperty(t) && (!1 === s.originalSettings.mobileFirst ? o < s.breakpoints[t] && (i = s.breakpoints[t]) : o > s.breakpoints[t] && (i = s.breakpoints[t]));
            null !== i ? null !== s.activeBreakpoint ? i !== s.activeBreakpoint && (s.activeBreakpoint = i,
            "unslick" === s.breakpointSettings[i] ? s.unslick(i) : (s.options = l.extend({}, s.originalSettings, s.breakpointSettings[i]),
            !0 === e && (s.currentSlide = s.options.initialSlide),
            s.refresh(e)),
            n = i) : (s.activeBreakpoint = i,
            "unslick" === s.breakpointSettings[i] ? s.unslick(i) : (s.options = l.extend({}, s.originalSettings, s.breakpointSettings[i]),
            !0 === e && (s.currentSlide = s.options.initialSlide),
            s.refresh(e)),
            n = i) : null !== s.activeBreakpoint && (s.activeBreakpoint = null,
            s.options = s.originalSettings,
            !0 === e && (s.currentSlide = s.options.initialSlide),
            s.refresh(e),
            n = i),
            e || !1 === n || s.$slider.trigger("breakpoint", [s, n])
        }
    }
    ,
    r.prototype.changeSlide = function(e, t) {
        var i, o, s = this, n = l(e.target);
        switch (n.is("a") && e.preventDefault(),
        n.is("li") || (n = n.closest("li")),
        i = s.slideCount % s.options.slidesToScroll != 0 ? 0 : (s.slideCount - s.currentSlide) % s.options.slidesToScroll,
        e.data.message) {
        case "previous":
            o = 0 === i ? s.options.slidesToScroll : s.options.slidesToShow - i,
            s.slideCount > s.options.slidesToShow && s.slideHandler(s.currentSlide - o, !1, t);
            break;
        case "next":
            o = 0 === i ? s.options.slidesToScroll : i,
            s.slideCount > s.options.slidesToShow && s.slideHandler(s.currentSlide + o, !1, t);
            break;
        case "index":
            var a = 0 === e.data.index ? 0 : e.data.index || n.index() * s.options.slidesToScroll;
            s.slideHandler(s.checkNavigable(a), !1, t),
            n.children().trigger("focus");
            break;
        default:
            return
        }
    }
    ,
    r.prototype.checkNavigable = function(e) {
        var t, i;
        if (i = 0,
        e > (t = this.getNavigableIndexes())[t.length - 1])
            e = t[t.length - 1];
        else
            for (var o in t) {
                if (e < t[o]) {
                    e = i;
                    break
                }
                i = t[o]
            }
        return e
    }
    ,
    r.prototype.cleanUpEvents = function() {
        var e = this;
        e.options.dots && null !== e.$dots && (l("li", e.$dots).off("click.slick", e.changeSlide),
        !0 === e.options.pauseOnDotsHover && !0 === e.options.autoplay && l("li", e.$dots).off("mouseenter.slick", l.proxy(e.setPaused, e, !0)).off("mouseleave.slick", l.proxy(e.setPaused, e, !1))),
        !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow && e.$prevArrow.off("click.slick", e.changeSlide),
        e.$nextArrow && e.$nextArrow.off("click.slick", e.changeSlide)),
        e.$list.off("touchstart.slick mousedown.slick", e.swipeHandler),
        e.$list.off("touchmove.slick mousemove.slick", e.swipeHandler),
        e.$list.off("touchend.slick mouseup.slick", e.swipeHandler),
        e.$list.off("touchcancel.slick mouseleave.slick", e.swipeHandler),
        e.$list.off("click.slick", e.clickHandler),
        l(document).off(e.visibilityChange, e.visibility),
        e.$list.off("mouseenter.slick", l.proxy(e.setPaused, e, !0)),
        e.$list.off("mouseleave.slick", l.proxy(e.setPaused, e, !1)),
        !0 === e.options.accessibility && e.$list.off("keydown.slick", e.keyHandler),
        !0 === e.options.focusOnSelect && l(e.$slideTrack).children().off("click.slick", e.selectHandler),
        l(window).off("orientationchange.slick.slick-" + e.instanceUid, e.orientationChange),
        l(window).off("resize.slick.slick-" + e.instanceUid, e.resize),
        l("[draggable!=true]", e.$slideTrack).off("dragstart", e.preventDefault),
        l(window).off("load.slick.slick-" + e.instanceUid, e.setPosition),
        l(document).off("ready.slick.slick-" + e.instanceUid, e.setPosition)
    }
    ,
    r.prototype.cleanUpRows = function() {
        var e;
        1 < this.options.rows && ((e = this.$slides.children().children()).removeAttr("style"),
        this.$slider.html(e))
    }
    ,
    r.prototype.clickHandler = function(e) {
        !1 === this.shouldClick && (e.stopImmediatePropagation(),
        e.stopPropagation(),
        e.preventDefault())
    }
    ,
    r.prototype.destroy = function(e) {
        var t = this;
        t.autoPlayClear(),
        t.touchObject = {},
        t.cleanUpEvents(),
        l(".slick-cloned", t.$slider).detach(),
        t.$dots && t.$dots.remove(),
        t.$prevArrow && "object" != typeof t.options.prevArrow && t.$prevArrow.remove(),
        t.$nextArrow && "object" != typeof t.options.nextArrow && t.$nextArrow.remove(),
        t.$slides && (t.$slides.removeClass("slick-slide slick-active slick-center slick-visible").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
            l(this).attr("style", l(this).data("originalStyling"))
        }),
        t.$slideTrack.children(this.options.slide).detach(),
        t.$slideTrack.detach(),
        t.$list.detach(),
        t.$slider.append(t.$slides)),
        t.cleanUpRows(),
        t.$slider.removeClass("slick-slider"),
        t.$slider.removeClass("slick-initialized"),
        t.unslicked = !0,
        e || t.$slider.trigger("destroy", [t])
    }
    ,
    r.prototype.disableTransition = function(e) {
        var t = {};
        t[this.transitionType] = "",
        !1 === this.options.fade ? this.$slideTrack.css(t) : this.$slides.eq(e).css(t)
    }
    ,
    r.prototype.fadeSlide = function(e, t) {
        var i = this;
        !1 === i.cssTransitions ? (i.$slides.eq(e).css({
            zIndex: 1e3
        }),
        i.$slides.eq(e).animate({
            opacity: 1
        }, i.options.speed, i.options.easing, t)) : (i.applyTransition(e),
        i.$slides.eq(e).css({
            opacity: 1,
            zIndex: 1e3
        }),
        t && setTimeout(function() {
            i.disableTransition(e),
            t.call()
        }, i.options.speed))
    }
    ,
    r.prototype.filterSlides = r.prototype.slickFilter = function(e) {
        var t = this;
        null !== e && (t.unload(),
        t.$slideTrack.children(this.options.slide).detach(),
        t.$slidesCache.filter(e).appendTo(t.$slideTrack),
        t.reinit())
    }
    ,
    r.prototype.getCurrent = r.prototype.slickCurrentSlide = function() {
        return this.currentSlide
    }
    ,
    r.prototype.getDotCount = function() {
        var e = this
          , t = 0
          , i = 0
          , o = 0;
        if (!0 === e.options.infinite)
            for (; t < e.slideCount; )
                ++o,
                t = i + e.options.slidesToShow,
                i += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
        else if (!0 === e.options.centerMode)
            o = e.slideCount;
        else
            for (; t < e.slideCount; )
                ++o,
                t = i + e.options.slidesToShow,
                i += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
        return o - 1
    }
    ,
    r.prototype.getLeft = function(e) {
        var t, i, o, s = this, n = 0;
        return s.slideOffset = 0,
        i = s.$slides.first().outerHeight(),
        !0 === s.options.infinite ? (s.slideCount > s.options.slidesToShow && (s.slideOffset = s.slideWidth * s.options.slidesToShow * -1,
        n = i * s.options.slidesToShow * -1),
        s.slideCount % s.options.slidesToScroll != 0 && e + s.options.slidesToScroll > s.slideCount && s.slideCount > s.options.slidesToShow && (e > s.slideCount ? (s.slideOffset = (s.options.slidesToShow - (e - s.slideCount)) * s.slideWidth * -1,
        n = (s.options.slidesToShow - (e - s.slideCount)) * i * -1) : (s.slideOffset = s.slideCount % s.options.slidesToScroll * s.slideWidth * -1,
        n = s.slideCount % s.options.slidesToScroll * i * -1))) : e + s.options.slidesToShow > s.slideCount && (s.slideOffset = (e + s.options.slidesToShow - s.slideCount) * s.slideWidth,
        n = (e + s.options.slidesToShow - s.slideCount) * i),
        s.slideCount <= s.options.slidesToShow && (n = s.slideOffset = 0),
        !0 === s.options.centerMode && !0 === s.options.infinite ? s.slideOffset += s.slideWidth * Math.floor(s.options.slidesToShow / 2) - s.slideWidth : !0 === s.options.centerMode && (s.slideOffset = 0,
        s.slideOffset += s.slideWidth * Math.floor(s.options.slidesToShow / 2)),
        t = !1 === s.options.vertical ? e * s.slideWidth * -1 + s.slideOffset : e * i * -1 + n,
        !0 === s.options.variableWidth && (t = (o = s.slideCount <= s.options.slidesToShow || !1 === s.options.infinite ? s.$slideTrack.children(".slick-slide").eq(e) : s.$slideTrack.children(".slick-slide").eq(e + s.options.slidesToShow))[0] ? -1 * o[0].offsetLeft : 0,
        !0 === s.options.centerMode && (t = (o = !1 === s.options.infinite ? s.$slideTrack.children(".slick-slide").eq(e) : s.$slideTrack.children(".slick-slide").eq(e + s.options.slidesToShow + 1))[0] ? -1 * o[0].offsetLeft : 0,
        t += (s.$list.width() - o.outerWidth()) / 2)),
        t
    }
    ,
    r.prototype.getOption = r.prototype.slickGetOption = function(e) {
        return this.options[e]
    }
    ,
    r.prototype.getNavigableIndexes = function() {
        var e, t = this, i = 0, o = 0, s = [];
        for (!1 === t.options.infinite ? e = t.slideCount : (i = -1 * t.options.slidesToScroll,
        o = -1 * t.options.slidesToScroll,
        e = 2 * t.slideCount); i < e; )
            s.push(i),
            i = o + t.options.slidesToScroll,
            o += t.options.slidesToScroll <= t.options.slidesToShow ? t.options.slidesToScroll : t.options.slidesToShow;
        return s
    }
    ,
    r.prototype.getSlick = function() {
        return this
    }
    ,
    r.prototype.getSlideCount = function() {
        var i, o, s = this;
        return o = !0 === s.options.centerMode ? s.slideWidth * Math.floor(s.options.slidesToShow / 2) : 0,
        !0 === s.options.swipeToSlide ? (s.$slideTrack.find(".slick-slide").each(function(e, t) {
            if (t.offsetLeft - o + l(t).outerWidth() / 2 > -1 * s.swipeLeft)
                return i = t,
                !1
        }),
        Math.abs(l(i).attr("data-slick-index") - s.currentSlide) || 1) : s.options.slidesToScroll
    }
    ,
    r.prototype.goTo = r.prototype.slickGoTo = function(e, t) {
        this.changeSlide({
            data: {
                message: "index",
                index: parseInt(e)
            }
        }, t)
    }
    ,
    r.prototype.init = function(e) {
        var t = this;
        l(t.$slider).hasClass("slick-initialized") || (l(t.$slider).addClass("slick-initialized"),
        t.buildRows(),
        t.buildOut(),
        t.setProps(),
        t.startLoad(),
        t.loadSlider(),
        t.initializeEvents(),
        t.updateArrows(),
        t.updateDots()),
        e && t.$slider.trigger("init", [t])
    }
    ,
    r.prototype.initArrowEvents = function() {
        var e = this;
        !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow.on("click.slick", {
            message: "previous"
        }, e.changeSlide),
        e.$nextArrow.on("click.slick", {
            message: "next"
        }, e.changeSlide))
    }
    ,
    r.prototype.initDotEvents = function() {
        var e = this;
        !0 === e.options.dots && e.slideCount > e.options.slidesToShow && l("li", e.$dots).on("click.slick", {
            message: "index"
        }, e.changeSlide),
        !0 === e.options.dots && !0 === e.options.pauseOnDotsHover && !0 === e.options.autoplay && l("li", e.$dots).on("mouseenter.slick", l.proxy(e.setPaused, e, !0)).on("mouseleave.slick", l.proxy(e.setPaused, e, !1))
    }
    ,
    r.prototype.initializeEvents = function() {
        var e = this;
        e.initArrowEvents(),
        e.initDotEvents(),
        e.$list.on("touchstart.slick mousedown.slick", {
            action: "start"
        }, e.swipeHandler),
        e.$list.on("touchmove.slick mousemove.slick", {
            action: "move"
        }, e.swipeHandler),
        e.$list.on("touchend.slick mouseup.slick", {
            action: "end"
        }, e.swipeHandler),
        e.$list.on("touchcancel.slick mouseleave.slick", {
            action: "end"
        }, e.swipeHandler),
        e.$list.on("click.slick", e.clickHandler),
        l(document).on(e.visibilityChange, l.proxy(e.visibility, e)),
        e.$list.on("mouseenter.slick", l.proxy(e.setPaused, e, !0)),
        e.$list.on("mouseleave.slick", l.proxy(e.setPaused, e, !1)),
        !0 === e.options.accessibility && e.$list.on("keydown.slick", e.keyHandler),
        !0 === e.options.focusOnSelect && l(e.$slideTrack).children().on("click.slick", e.selectHandler),
        l(window).on("orientationchange.slick.slick-" + e.instanceUid, l.proxy(e.orientationChange, e)),
        l(window).on("resize.slick.slick-" + e.instanceUid, l.proxy(e.resize, e)),
        l("[draggable!=true]", e.$slideTrack).on("dragstart", e.preventDefault),
        l(window).on("load.slick.slick-" + e.instanceUid, e.setPosition),
        l(document).on("ready.slick.slick-" + e.instanceUid, e.setPosition)
    }
    ,
    r.prototype.initUI = function() {
        var e = this;
        !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow.show(),
        e.$nextArrow.show()),
        !0 === e.options.dots && e.slideCount > e.options.slidesToShow && e.$dots.show(),
        !0 === e.options.autoplay && e.autoPlay()
    }
    ,
    r.prototype.keyHandler = function(e) {
        37 === e.keyCode && !0 === this.options.accessibility ? this.changeSlide({
            data: {
                message: "previous"
            }
        }) : 39 === e.keyCode && !0 === this.options.accessibility && this.changeSlide({
            data: {
                message: "next"
            }
        })
    }
    ,
    r.prototype.lazyLoad = function() {
        var e, t, i = this;
        function o(e) {
            l("img[data-lazy]", e).each(function() {
                var e = l(this)
                  , t = l(this).attr("data-lazy")
                  , i = document.createElement("img");
                i.onload = function() {
                    e.animate({
                        opacity: 1
                    }, 200)
                }
                ,
                i.src = t,
                e.css({
                    opacity: 0
                }).attr("src", t).removeAttr("data-lazy").removeClass("slick-loading")
            })
        }
        !0 === i.options.centerMode ? !0 === i.options.infinite ? t = (e = i.currentSlide + (i.options.slidesToShow / 2 + 1)) + i.options.slidesToShow + 2 : (e = Math.max(0, i.currentSlide - (i.options.slidesToShow / 2 + 1)),
        t = i.options.slidesToShow / 2 + 1 + 2 + i.currentSlide) : (t = (e = i.options.infinite ? i.options.slidesToShow + i.currentSlide : i.currentSlide) + i.options.slidesToShow,
        !0 === i.options.fade && (0 < e && e--,
        t <= i.slideCount && t++)),
        o(i.$slider.find(".slick-slide").slice(e, t)),
        i.slideCount <= i.options.slidesToShow ? o(i.$slider.find(".slick-slide")) : i.currentSlide >= i.slideCount - i.options.slidesToShow ? o(i.$slider.find(".slick-cloned").slice(0, i.options.slidesToShow)) : 0 === i.currentSlide && o(i.$slider.find(".slick-cloned").slice(-1 * i.options.slidesToShow))
    }
    ,
    r.prototype.loadSlider = function() {
        var e = this;
        e.setPosition(),
        e.$slideTrack.css({
            opacity: 1
        }),
        e.$slider.removeClass("slick-loading"),
        e.initUI(),
        "progressive" === e.options.lazyLoad && e.progressiveLazyLoad()
    }
    ,
    r.prototype.next = r.prototype.slickNext = function() {
        this.changeSlide({
            data: {
                message: "next"
            }
        })
    }
    ,
    r.prototype.orientationChange = function() {
        this.checkResponsive(),
        this.setPosition()
    }
    ,
    r.prototype.pause = r.prototype.slickPause = function() {
        this.autoPlayClear(),
        this.paused = !0
    }
    ,
    r.prototype.play = r.prototype.slickPlay = function() {
        this.paused = !1,
        this.autoPlay()
    }
    ,
    r.prototype.postSlide = function(e) {
        var t = this;
        t.$slider.trigger("afterChange", [t, e]),
        t.animating = !1,
        t.setPosition(),
        !(t.swipeLeft = null) === t.options.autoplay && !1 === t.paused && t.autoPlay()
    }
    ,
    r.prototype.prev = r.prototype.slickPrev = function() {
        this.changeSlide({
            data: {
                message: "previous"
            }
        })
    }
    ,
    r.prototype.preventDefault = function(e) {
        e.preventDefault()
    }
    ,
    r.prototype.progressiveLazyLoad = function() {
        var e, t = this;
        0 < l("img[data-lazy]", t.$slider).length && (e = l("img[data-lazy]", t.$slider).first()).attr("src", e.attr("data-lazy")).removeClass("slick-loading").load(function() {
            e.removeAttr("data-lazy"),
            t.progressiveLazyLoad(),
            !0 === t.options.adaptiveHeight && t.setPosition()
        }).error(function() {
            e.removeAttr("data-lazy"),
            t.progressiveLazyLoad()
        })
    }
    ,
    r.prototype.refresh = function(e) {
        var t = this
          , i = t.currentSlide;
        t.destroy(!0),
        l.extend(t, t.initials),
        t.init(),
        e || t.changeSlide({
            data: {
                message: "index",
                index: i
            }
        }, !1)
    }
    ,
    r.prototype.reinit = function() {
        var e = this;
        e.$slides = e.$slideTrack.children(e.options.slide).addClass("slick-slide"),
        e.slideCount = e.$slides.length,
        e.currentSlide >= e.slideCount && 0 !== e.currentSlide && (e.currentSlide = e.currentSlide - e.options.slidesToScroll),
        e.slideCount <= e.options.slidesToShow && (e.currentSlide = 0),
        e.setProps(),
        e.setupInfinite(),
        e.buildArrows(),
        e.updateArrows(),
        e.initArrowEvents(),
        e.buildDots(),
        e.updateDots(),
        e.initDotEvents(),
        !0 === e.options.focusOnSelect && l(e.$slideTrack).children().on("click.slick", e.selectHandler),
        e.setSlideClasses(0),
        e.setPosition(),
        e.$slider.trigger("reInit", [e])
    }
    ,
    r.prototype.resize = function() {
        var e = this;
        l(window).width() !== e.windowWidth && (clearTimeout(e.windowDelay),
        e.windowDelay = window.setTimeout(function() {
            e.windowWidth = l(window).width(),
            e.checkResponsive(),
            e.unslicked || e.setPosition()
        }, 50))
    }
    ,
    r.prototype.removeSlide = r.prototype.slickRemove = function(e, t, i) {
        var o = this;
        if (e = "boolean" == typeof e ? !0 === (t = e) ? 0 : o.slideCount - 1 : !0 === t ? --e : e,
        o.slideCount < 1 || e < 0 || e > o.slideCount - 1)
            return !1;
        o.unload(),
        !0 === i ? o.$slideTrack.children().remove() : o.$slideTrack.children(this.options.slide).eq(e).remove(),
        o.$slides = o.$slideTrack.children(this.options.slide),
        o.$slideTrack.children(this.options.slide).detach(),
        o.$slideTrack.append(o.$slides),
        o.$slidesCache = o.$slides,
        o.reinit()
    }
    ,
    r.prototype.setCSS = function(e) {
        var t, i, o = this, s = {};
        !0 === o.options.rtl && (e = -e),
        t = "left" == o.positionProp ? Math.ceil(e) + "px" : "0px",
        i = "top" == o.positionProp ? Math.ceil(e) + "px" : "0px",
        s[o.positionProp] = e,
        !1 === o.transformsEnabled || (!(s = {}) === o.cssTransitions ? s[o.animType] = "translate(" + t + ", " + i + ")" : s[o.animType] = "translate3d(" + t + ", " + i + ", 0px)"),
        o.$slideTrack.css(s)
    }
    ,
    r.prototype.setDimensions = function() {
        var e = this;
        !1 === e.options.vertical ? !0 === e.options.centerMode && e.$list.css({
            padding: "0px " + e.options.centerPadding
        }) : (e.$list.height(e.$slides.first().outerHeight(!0) * e.options.slidesToShow),
        !0 === e.options.centerMode && e.$list.css({
            padding: e.options.centerPadding + " 0px"
        })),
        e.listWidth = e.$list.width(),
        e.listHeight = e.$list.height(),
        !1 === e.options.vertical && !1 === e.options.variableWidth ? (e.slideWidth = Math.ceil(e.listWidth / e.options.slidesToShow),
        e.$slideTrack.width(Math.ceil(e.slideWidth * e.$slideTrack.children(".slick-slide").length))) : !0 === e.options.variableWidth ? e.$slideTrack.width(5e3 * e.slideCount) : (e.slideWidth = Math.ceil(e.listWidth),
        e.$slideTrack.height(Math.ceil(e.$slides.first().outerHeight(!0) * e.$slideTrack.children(".slick-slide").length)));
        var t = e.$slides.first().outerWidth(!0) - e.$slides.first().width();
        !1 === e.options.variableWidth && e.$slideTrack.children(".slick-slide").width(e.slideWidth - t)
    }
    ,
    r.prototype.setFade = function() {
        var i, o = this;
        o.$slides.each(function(e, t) {
            i = o.slideWidth * e * -1,
            !0 === o.options.rtl ? l(t).css({
                position: "relative",
                right: i,
                top: 0,
                zIndex: 800,
                opacity: 0
            }) : l(t).css({
                position: "relative",
                left: i,
                top: 0,
                zIndex: 800,
                opacity: 0
            })
        }),
        o.$slides.eq(o.currentSlide).css({
            zIndex: 900,
            opacity: 1
        })
    }
    ,
    r.prototype.setHeight = function() {
        var e = this;
        if (1 === e.options.slidesToShow && !0 === e.options.adaptiveHeight && !1 === e.options.vertical) {
            var t = e.$slides.eq(e.currentSlide).outerHeight(!0);
            e.$list.css("height", t)
        }
    }
    ,
    r.prototype.setOption = r.prototype.slickSetOption = function(e, t, i) {
        this.options[e] = t,
        !0 === i && (this.unload(),
        this.reinit())
    }
    ,
    r.prototype.setPosition = function() {
        var e = this;
        e.setDimensions(),
        e.setHeight(),
        !1 === e.options.fade ? e.setCSS(e.getLeft(e.currentSlide)) : e.setFade(),
        e.$slider.trigger("setPosition", [e])
    }
    ,
    r.prototype.setProps = function() {
        var e = this
          , t = document.body.style;
        e.positionProp = !0 === e.options.vertical ? "top" : "left",
        "top" === e.positionProp ? e.$slider.addClass("slick-vertical") : e.$slider.removeClass("slick-vertical"),
        void 0 === t.WebkitTransition && void 0 === t.MozTransition && void 0 === t.msTransition || !0 === e.options.useCSS && (e.cssTransitions = !0),
        void 0 !== t.OTransform && (e.animType = "OTransform",
        e.transformType = "-o-transform",
        e.transitionType = "OTransition",
        void 0 === t.perspectiveProperty && void 0 === t.webkitPerspective && (e.animType = !1)),
        void 0 !== t.MozTransform && (e.animType = "MozTransform",
        e.transformType = "-moz-transform",
        e.transitionType = "MozTransition",
        void 0 === t.perspectiveProperty && void 0 === t.MozPerspective && (e.animType = !1)),
        void 0 !== t.webkitTransform && (e.animType = "webkitTransform",
        e.transformType = "-webkit-transform",
        e.transitionType = "webkitTransition",
        void 0 === t.perspectiveProperty && void 0 === t.webkitPerspective && (e.animType = !1)),
        void 0 !== t.msTransform && (e.animType = "msTransform",
        e.transformType = "-ms-transform",
        e.transitionType = "msTransition",
        void 0 === t.msTransform && (e.animType = !1)),
        void 0 !== t.transform && !1 !== e.animType && (e.animType = "transform",
        e.transformType = "transform",
        e.transitionType = "transition"),
        e.transformsEnabled = null !== e.animType && !1 !== e.animType
    }
    ,
    r.prototype.setSlideClasses = function(e) {
        var t, i, o, s, n = this;
        n.$slider.find(".slick-slide").removeClass("slick-active").attr("aria-hidden", "true").removeClass("slick-center"),
        i = n.$slider.find(".slick-slide"),
        !0 === n.options.centerMode ? (t = Math.floor(n.options.slidesToShow / 2),
        !0 === n.options.infinite && (t <= e && e <= n.slideCount - 1 - t ? n.$slides.slice(e - t, e + t + 1).addClass("slick-active").attr("aria-hidden", "false") : (o = n.options.slidesToShow + e,
        i.slice(o - t + 1, o + t + 2).addClass("slick-active").attr("aria-hidden", "false")),
        0 === e ? i.eq(i.length - 1 - n.options.slidesToShow).addClass("slick-center") : e === n.slideCount - 1 && i.eq(n.options.slidesToShow).addClass("slick-center")),
        n.$slides.eq(e).addClass("slick-center")) : 0 <= e && e <= n.slideCount - n.options.slidesToShow ? n.$slides.slice(e, e + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : i.length <= n.options.slidesToShow ? i.addClass("slick-active").attr("aria-hidden", "false") : (s = n.slideCount % n.options.slidesToShow,
        o = !0 === n.options.infinite ? n.options.slidesToShow + e : e,
        n.options.slidesToShow == n.options.slidesToScroll && n.slideCount - e < n.options.slidesToShow ? i.slice(o - (n.options.slidesToShow - s), o + s).addClass("slick-active").attr("aria-hidden", "false") : i.slice(o, o + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false")),
        "ondemand" === n.options.lazyLoad && n.lazyLoad()
    }
    ,
    r.prototype.setupInfinite = function() {
        var e, t, i, o = this;
        if (!0 === o.options.fade && (o.options.centerMode = !1),
        !0 === o.options.infinite && !1 === o.options.fade && (t = null,
        o.slideCount > o.options.slidesToShow)) {
            for (i = !0 === o.options.centerMode ? o.options.slidesToShow + 1 : o.options.slidesToShow,
            e = o.slideCount; e > o.slideCount - i; e -= 1)
                t = e - 1,
                l(o.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t - o.slideCount).prependTo(o.$slideTrack).addClass("slick-cloned");
            for (e = 0; e < i; e += 1)
                t = e,
                l(o.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t + o.slideCount).appendTo(o.$slideTrack).addClass("slick-cloned");
            o.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                l(this).attr("id", "")
            })
        }
    }
    ,
    r.prototype.setPaused = function(e) {
        var t = this;
        !0 === t.options.autoplay && !0 === t.options.pauseOnHover && ((t.paused = e) ? t.autoPlayClear() : t.autoPlay())
    }
    ,
    r.prototype.selectHandler = function(e) {
        var t = this
          , i = l(e.target).is(".slick-slide") ? l(e.target) : l(e.target).parents(".slick-slide")
          , o = parseInt(i.attr("data-slick-index"));
        if (o || (o = 0),
        t.slideCount <= t.options.slidesToShow)
            return t.$slider.find(".slick-slide").removeClass("slick-active").attr("aria-hidden", "true"),
            t.$slides.eq(o).addClass("slick-active").attr("aria-hidden", "false"),
            !0 === t.options.centerMode && (t.$slider.find(".slick-slide").removeClass("slick-center"),
            t.$slides.eq(o).addClass("slick-center")),
            void t.asNavFor(o);
        t.slideHandler(o)
    }
    ,
    r.prototype.slideHandler = function(e, t, i) {
        var o, s, n, a, r = this;
        if (t = t || !1,
        (!0 !== r.animating || !0 !== r.options.waitForAnimate) && !(!0 === r.options.fade && r.currentSlide === e || r.slideCount <= r.options.slidesToShow))
            if (!1 === t && r.asNavFor(e),
            o = e,
            a = r.getLeft(o),
            n = r.getLeft(r.currentSlide),
            r.currentLeft = null === r.swipeLeft ? n : r.swipeLeft,
            !1 === r.options.infinite && !1 === r.options.centerMode && (e < 0 || e > r.getDotCount() * r.options.slidesToScroll))
                !1 === r.options.fade && (o = r.currentSlide,
                !0 !== i ? r.animateSlide(n, function() {
                    r.postSlide(o)
                }) : r.postSlide(o));
            else if (!1 === r.options.infinite && !0 === r.options.centerMode && (e < 0 || e > r.slideCount - r.options.slidesToScroll))
                !1 === r.options.fade && (o = r.currentSlide,
                !0 !== i ? r.animateSlide(n, function() {
                    r.postSlide(o)
                }) : r.postSlide(o));
            else {
                if (!0 === r.options.autoplay && clearInterval(r.autoPlayTimer),
                s = o < 0 ? r.slideCount % r.options.slidesToScroll != 0 ? r.slideCount - r.slideCount % r.options.slidesToScroll : r.slideCount + o : o >= r.slideCount ? r.slideCount % r.options.slidesToScroll != 0 ? 0 : o - r.slideCount : o,
                r.animating = !0,
                r.$slider.trigger("beforeChange", [r, r.currentSlide, s]),
                r.currentSlide,
                r.currentSlide = s,
                r.setSlideClasses(r.currentSlide),
                r.updateDots(),
                r.updateArrows(),
                !0 === r.options.fade)
                    return !0 !== i ? r.fadeSlide(s, function() {
                        r.postSlide(s)
                    }) : r.postSlide(s),
                    void r.animateHeight();
                !0 !== i ? r.animateSlide(a, function() {
                    r.postSlide(s)
                }) : r.postSlide(s)
            }
    }
    ,
    r.prototype.startLoad = function() {
        var e = this;
        !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow.hide(),
        e.$nextArrow.hide()),
        !0 === e.options.dots && e.slideCount > e.options.slidesToShow && e.$dots.hide(),
        e.$slider.addClass("slick-loading")
    }
    ,
    r.prototype.swipeDirection = function() {
        var e, t, i, o, s = this;
        return e = s.touchObject.startX - s.touchObject.curX,
        t = s.touchObject.startY - s.touchObject.curY,
        i = Math.atan2(t, e),
        (o = Math.round(180 * i / Math.PI)) < 0 && (o = 360 - Math.abs(o)),
        o <= 45 && 0 <= o ? !1 === s.options.rtl ? "left" : "right" : o <= 360 && 315 <= o ? !1 === s.options.rtl ? "left" : "right" : 135 <= o && o <= 225 ? !1 === s.options.rtl ? "right" : "left" : !0 === s.options.verticalSwiping ? 35 <= o && o <= 135 ? "left" : "right" : "vertical"
    }
    ,
    r.prototype.swipeEnd = function(e) {
        var t, i = this;
        if (i.dragging = !1,
        i.shouldClick = !(10 < i.touchObject.swipeLength),
        void 0 === i.touchObject.curX)
            return !1;
        if (!0 === i.touchObject.edgeHit && i.$slider.trigger("edge", [i, i.swipeDirection()]),
        i.touchObject.swipeLength >= i.touchObject.minSwipe)
            switch (i.swipeDirection()) {
            case "left":
                t = i.options.swipeToSlide ? i.checkNavigable(i.currentSlide + i.getSlideCount()) : i.currentSlide + i.getSlideCount(),
                i.slideHandler(t),
                i.currentDirection = 0,
                i.touchObject = {},
                i.$slider.trigger("swipe", [i, "left"]);
                break;
            case "right":
                t = i.options.swipeToSlide ? i.checkNavigable(i.currentSlide - i.getSlideCount()) : i.currentSlide - i.getSlideCount(),
                i.slideHandler(t),
                i.currentDirection = 1,
                i.touchObject = {},
                i.$slider.trigger("swipe", [i, "right"])
            }
        else
            i.touchObject.startX !== i.touchObject.curX && (i.slideHandler(i.currentSlide),
            i.touchObject = {})
    }
    ,
    r.prototype.swipeHandler = function(e) {
        var t = this;
        if (!(!1 === t.options.swipe || "ontouchend"in document && !1 === t.options.swipe || !1 === t.options.draggable && -1 !== e.type.indexOf("mouse")))
            switch (t.touchObject.fingerCount = e.originalEvent && void 0 !== e.originalEvent.touches ? e.originalEvent.touches.length : 1,
            t.touchObject.minSwipe = t.listWidth / t.options.touchThreshold,
            !0 === t.options.verticalSwiping && (t.touchObject.minSwipe = t.listHeight / t.options.touchThreshold),
            e.data.action) {
            case "start":
                t.swipeStart(e);
                break;
            case "move":
                t.swipeMove(e);
                break;
            case "end":
                t.swipeEnd(e)
            }
    }
    ,
    r.prototype.swipeMove = function(e) {
        var t, i, o, s, n, a = this;
        return n = void 0 !== e.originalEvent ? e.originalEvent.touches : null,
        !(!a.dragging || n && 1 !== n.length) && (t = a.getLeft(a.currentSlide),
        a.touchObject.curX = void 0 !== n ? n[0].pageX : e.clientX,
        a.touchObject.curY = void 0 !== n ? n[0].pageY : e.clientY,
        a.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(a.touchObject.curX - a.touchObject.startX, 2))),
        !0 === a.options.verticalSwiping && (a.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(a.touchObject.curY - a.touchObject.startY, 2)))),
        "vertical" !== (i = a.swipeDirection()) ? (void 0 !== e.originalEvent && 4 < a.touchObject.swipeLength && e.preventDefault(),
        s = (!1 === a.options.rtl ? 1 : -1) * (a.touchObject.curX > a.touchObject.startX ? 1 : -1),
        !0 === a.options.verticalSwiping && (s = a.touchObject.curY > a.touchObject.startY ? 1 : -1),
        o = a.touchObject.swipeLength,
        (a.touchObject.edgeHit = !1) === a.options.infinite && (0 === a.currentSlide && "right" === i || a.currentSlide >= a.getDotCount() && "left" === i) && (o = a.touchObject.swipeLength * a.options.edgeFriction,
        a.touchObject.edgeHit = !0),
        !1 === a.options.vertical ? a.swipeLeft = t + o * s : a.swipeLeft = t + o * (a.$list.height() / a.listWidth) * s,
        !0 === a.options.verticalSwiping && (a.swipeLeft = t + o * s),
        !0 !== a.options.fade && !1 !== a.options.touchMove && (!0 === a.animating ? (a.swipeLeft = null,
        !1) : void a.setCSS(a.swipeLeft))) : void 0)
    }
    ,
    r.prototype.swipeStart = function(e) {
        var t, i = this;
        if (1 !== i.touchObject.fingerCount || i.slideCount <= i.options.slidesToShow)
            return !(i.touchObject = {});
        void 0 !== e.originalEvent && void 0 !== e.originalEvent.touches && (t = e.originalEvent.touches[0]),
        i.touchObject.startX = i.touchObject.curX = void 0 !== t ? t.pageX : e.clientX,
        i.touchObject.startY = i.touchObject.curY = void 0 !== t ? t.pageY : e.clientY,
        i.dragging = !0
    }
    ,
    r.prototype.unfilterSlides = r.prototype.slickUnfilter = function() {
        var e = this;
        null !== e.$slidesCache && (e.unload(),
        e.$slideTrack.children(this.options.slide).detach(),
        e.$slidesCache.appendTo(e.$slideTrack),
        e.reinit())
    }
    ,
    r.prototype.unload = function() {
        var e = this;
        l(".slick-cloned", e.$slider).remove(),
        e.$dots && e.$dots.remove(),
        e.$prevArrow && "object" != typeof e.options.prevArrow && e.$prevArrow.remove(),
        e.$nextArrow && "object" != typeof e.options.nextArrow && e.$nextArrow.remove(),
        e.$slides.removeClass("slick-slide slick-active slick-visible").attr("aria-hidden", "true").css("width", "")
    }
    ,
    r.prototype.unslick = function(e) {
        this.$slider.trigger("unslick", [this, e]),
        this.destroy()
    }
    ,
    r.prototype.updateArrows = function() {
        var e = this;
        Math.floor(e.options.slidesToShow / 2),
        !0 === e.options.arrows && !0 !== e.options.infinite && e.slideCount > e.options.slidesToShow && (e.$prevArrow.removeClass("slick-disabled"),
        e.$nextArrow.removeClass("slick-disabled"),
        0 === e.currentSlide ? (e.$prevArrow.addClass("slick-disabled"),
        e.$nextArrow.removeClass("slick-disabled")) : e.currentSlide >= e.slideCount - e.options.slidesToShow && !1 === e.options.centerMode ? (e.$nextArrow.addClass("slick-disabled"),
        e.$prevArrow.removeClass("slick-disabled")) : e.currentSlide >= e.slideCount - 1 && !0 === e.options.centerMode && (e.$nextArrow.addClass("slick-disabled"),
        e.$prevArrow.removeClass("slick-disabled")))
    }
    ,
    r.prototype.updateDots = function() {
        var e = this;
        null !== e.$dots && (e.$dots.find("li").removeClass("slick-active").attr("aria-hidden", "true"),
        e.$dots.find("li").eq(Math.floor(e.currentSlide / e.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden", "false"))
    }
    ,
    r.prototype.visibility = function() {
        var e = this;
        document[e.hidden] ? (e.paused = !0,
        e.autoPlayClear()) : !0 === e.options.autoplay && (e.paused = !1,
        e.autoPlay())
    }
    ,
    l.fn.slick = function() {
        for (var e, t = this, i = arguments[0], o = Array.prototype.slice.call(arguments, 1), s = t.length, n = 0; n < s; n++)
            if ("object" == typeof i || void 0 === i ? t[n].slick = new r(t[n],i) : e = t[n].slick[i].apply(t[n].slick, o),
            void 0 !== e)
                return e;
        return t
    }
}),
function(v, w, b) {
    "use strict";
    var k = v(w)
      , a = w.document
      , T = v(a)
      , S = function() {
        for (var e = 3, t = a.createElement("div"), i = t.getElementsByTagName("i"); t.innerHTML = "\x3c!--[if gt IE " + ++e + "]><i></i><![endif]--\x3e",
        i[0]; )
            ;
        return 4 < e ? e : void 0
    }()
      , C = function() {
        var e = w.pageXOffset !== b ? w.pageXOffset : "CSS1Compat" == a.compatMode ? w.document.documentElement.scrollLeft : w.document.body.scrollLeft
          , t = w.pageYOffset !== b ? w.pageYOffset : "CSS1Compat" == a.compatMode ? w.document.documentElement.scrollTop : w.document.body.scrollTop;
        void 0 === C.x && (C.x = e,
        C.y = t),
        void 0 === C.distanceX ? (C.distanceX = e,
        C.distanceY = t) : (C.distanceX = e - C.x,
        C.distanceY = t - C.y);
        var i = C.x - e
          , o = C.y - t;
        C.direction = i < 0 ? "right" : 0 < i ? "left" : o <= 0 ? "down" : 0 < o ? "up" : "first",
        C.x = e,
        C.y = t
    };
    k.on("scroll", C),
    v.fn.style = function(e) {
        if (!e)
            return null;
        var i, o = v(this), s = o.clone().css("display", "none");
        s.find("input:radio").attr("name", "copy-" + Math.floor(100 * Math.random() + 1)),
        o.after(s);
        var n = function(e, t) {
            var i;
            return e.currentStyle ? i = e.currentStyle[t.replace(/-\w/g, function(e) {
                return e.toUpperCase().replace("-", "")
            })] : w.getComputedStyle && (i = a.defaultView.getComputedStyle(e, null).getPropertyValue(t)),
            i = /margin/g.test(t) ? parseInt(i) === o[0].offsetLeft ? i : "auto" : i
        };
        return "string" == typeof e ? i = n(s[0], e) : (i = {},
        v.each(e, function(e, t) {
            i[t] = n(s[0], t)
        })),
        s.remove(),
        i || null
    }
    ,
    v.fn.extend({
        hcSticky: function(e) {
            return 0 == this.length ? this : (this.pluginOptions("hcSticky", {
                top: 0,
                bottom: 0,
                bottomEnd: 0,
                innerTop: 0,
                innerSticker: null,
                className: "sticky",
                wrapperClassName: "wrapper-sticky",
                stickTo: null,
                responsive: !0,
                followScroll: !0,
                offResolutions: null,
                onStart: v.noop,
                onStop: v.noop,
                on: !0,
                fn: null
            }, e || {}, {
                reinit: function() {
                    v(this).hcSticky()
                },
                stop: function() {
                    v(this).pluginOptions("hcSticky", {
                        on: !1
                    }).each(function() {
                        var e = v(this)
                          , t = e.pluginOptions("hcSticky")
                          , i = e.parent("." + t.wrapperClassName)
                          , o = e.offset().top - i.offset().top;
                        e.css({
                            position: "absolute",
                            top: o,
                            bottom: "auto",
                            left: "auto",
                            right: "auto"
                        }).removeClass(t.className)
                    })
                },
                off: function() {
                    v(this).pluginOptions("hcSticky", {
                        on: !1
                    }).each(function() {
                        var e = v(this)
                          , t = e.pluginOptions("hcSticky")
                          , i = e.parent("." + t.wrapperClassName);
                        e.css({
                            position: "relative",
                            top: "auto",
                            bottom: "auto",
                            left: "auto",
                            right: "auto"
                        }).removeClass(t.className),
                        i.css("height", "auto")
                    })
                },
                on: function() {
                    v(this).each(function() {
                        v(this).pluginOptions("hcSticky", {
                            on: !0,
                            remember: {
                                offsetTop: k.scrollTop()
                            }
                        }).hcSticky()
                    })
                },
                destroy: function() {
                    var e = v(this)
                      , t = e.pluginOptions("hcSticky")
                      , i = e.parent("." + t.wrapperClassName);
                    e.removeData("hcStickyInit").css({
                        position: i.css("position"),
                        top: i.css("top"),
                        bottom: i.css("bottom"),
                        left: i.css("left"),
                        right: i.css("right")
                    }).removeClass(t.className),
                    k.off("resize", t.fn.resize).off("scroll", t.fn.scroll),
                    e.unwrap()
                }
            }),
            e && void 0 !== e.on && (e.on ? this.hcSticky("on") : this.hcSticky("off")),
            "string" == typeof e ? this : this.each(function() {
                var e, t, i, o, s, n, u = v(this), h = u.pluginOptions("hcSticky"), f = 0 < (n = u.parent("." + h.wrapperClassName)).length && (n.css({
                    height: u.outerHeight(!0),
                    width: (s = n.style("width"),
                    0 <= s.indexOf("%") || "auto" == s ? ("border-box" == u.css("box-sizing") || "border-box" == u.css("-moz-box-sizing") ? u.css("width", n.width()) : u.css("width", n.width() - parseInt(u.css("padding-left") - parseInt(u.css("padding-right")))),
                    s) : u.outerWidth(!0))
                }),
                n) || (t = u.style(["width", "margin-left", "left", "right", "top", "bottom", "float", "display"]),
                i = u.css("display"),
                o = v("<div>", {
                    class: h.wrapperClassName
                }).css({
                    display: i,
                    height: u.outerHeight(!0),
                    width: 0 <= t.width.indexOf("%") || "auto" == t.width && "inline-block" != i && "inline" != i ? (u.css("width", parseFloat(u.css("width"))),
                    t.width) : "auto" != t.width || "inline-block" != i && "inline" != i ? "auto" == t["margin-left"] ? u.outerWidth() : u.outerWidth(!0) : u.width(),
                    margin: t["margin-left"] ? "auto" : null,
                    position: (e = u.css("position"),
                    "static" == e ? "relative" : e),
                    float: t.float || null,
                    left: t.left,
                    right: t.right,
                    top: t.top,
                    bottom: t.bottom,
                    "vertical-align": "top"
                }),
                u.wrap(o),
                7 === S && 0 === v("head").find("style#hcsticky-iefix").length && v('<style id="hcsticky-iefix">.' + h.wrapperClassName + " {zoom: 1;}</style>").appendTo("head"),
                u.parent());
                if (!u.data("hcStickyInit")) {
                    u.data("hcStickyInit", !0);
                    var a = !(!h.stickTo || !("document" == h.stickTo || h.stickTo.nodeType && 9 == h.stickTo.nodeType || "object" == typeof h.stickTo && h.stickTo instanceof ("undefined" != typeof HTMLDocument ? HTMLDocument : Document)))
                      , g = h.stickTo ? a ? T : "string" == typeof h.stickTo ? v(h.stickTo) : h.stickTo : f.parent();
                    u.css({
                        top: "auto",
                        bottom: "auto",
                        left: "auto",
                        right: "auto"
                    }),
                    k.load(function() {
                        u.outerHeight(!0) > g.height() && (f.css("height", u.outerHeight(!0)),
                        u.hcSticky("reinit"))
                    });
                    var y = function(e) {
                        u.hasClass(h.className) || (e = e || {},
                        u.css({
                            position: "fixed",
                            top: e.top || 0,
                            left: e.left || f.offset().left
                        }).addClass(h.className),
                        h.onStart.apply(u[0]),
                        f.addClass("sticky-active"))
                    }
                      , m = function(e) {
                        (e = e || {}).position = e.position || "absolute",
                        e.top = e.top || 0,
                        e.left = e.left || 0,
                        "fixed" != u.css("position") && parseInt(u.css("top")) == e.top || (u.css({
                            position: e.position,
                            top: e.top,
                            left: e.left
                        }).removeClass(h.className),
                        h.onStop.apply(u[0]),
                        f.removeClass("sticky-active"))
                    }
                      , r = !1
                      , l = !1
                      , d = function() {
                        if (p(),
                        c(),
                        h.on) {
                            if (h.responsive) {
                                l || (l = u.clone().attr("style", "").css({
                                    visibility: "hidden",
                                    height: 0,
                                    overflow: "hidden",
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    marginTop: 0,
                                    marginBottom: 0
                                }),
                                f.after(l));
                                var e = f.style("width")
                                  , t = l.style("width");
                                "auto" == t && "auto" != e && (t = parseInt(u.css("width"))),
                                t != e && f.width(t),
                                r && clearTimeout(r),
                                r = setTimeout(function() {
                                    r = !1,
                                    l.remove(),
                                    l = !1
                                }, 250)
                            }
                            if ("fixed" == u.css("position") ? u.css("left", f.offset().left) : u.css("left", 0),
                            u.outerWidth(!0) != f.width()) {
                                var i = "border-box" == u.css("box-sizing") || "border-box" == u.css("-moz-box-sizing") ? f.width() : f.width() - parseInt(u.css("padding-left")) - parseInt(u.css("padding-right"));
                                i = i - parseInt(u.css("margin-left")) - parseInt(u.css("margin-right")),
                                u.css("width", i)
                            }
                        }
                    };
                    u.pluginOptions("hcSticky", {
                        fn: {
                            scroll: function(e) {
                                if (h.on && u.is(":visible"))
                                    if (u.outerHeight(!0) >= g.height())
                                        m();
                                    else {
                                        var t, i = h.innerSticker ? v(h.innerSticker).position().top : h.innerTop ? h.innerTop : 0, o = f.offset().top, s = g.height() - h.bottomEnd + g.offset().top, n = f.offset().top - h.top + i, a = u.outerHeight(!0) + h.bottom, r = k.height(), l = k.scrollTop(), d = u.offset().top, c = d - l;
                                        if (void 0 !== h.remember && h.remember) {
                                            var p = d - h.top - i;
                                            r < a - i && h.followScroll ? p < l && l + r <= p + u.height() && (h.remember = !1) : h.remember.offsetTop > p ? l <= p && (y({
                                                top: h.top - i
                                            }),
                                            h.remember = !1) : p <= l && (y({
                                                top: h.top - i
                                            }),
                                            h.remember = !1)
                                        } else
                                            n < l ? s + h.bottom - (h.followScroll && r < a ? 0 : h.top) <= l + a - i - (r - (n - i) < a - i && h.followScroll && 0 < (t = a - r - i) ? t : 0) ? m({
                                                top: s - a + h.bottom - o
                                            }) : r < a - i && h.followScroll ? c + a <= r ? "down" == C.direction ? y({
                                                top: r - a
                                            }) : c < 0 && "fixed" == u.css("position") && m({
                                                top: d - (n + h.top - i) - C.distanceY
                                            }) : "up" == C.direction && d >= l + h.top - i ? y({
                                                top: h.top - i
                                            }) : "down" == C.direction && r < d + a && "fixed" == u.css("position") && m({
                                                top: d - (n + h.top - i) - C.distanceY
                                            }) : y({
                                                top: h.top - i
                                            }) : m()
                                    }
                            },
                            resize: d
                        }
                    });
                    var c = function() {
                        if (h.offResolutions) {
                            v.isArray(h.offResolutions) || (h.offResolutions = [h.offResolutions]);
                            var i = !0;
                            v.each(h.offResolutions, function(e, t) {
                                t < 0 ? k.width() < -1 * t && (i = !1,
                                u.hcSticky("off")) : k.width() > t && (i = !1,
                                u.hcSticky("off"))
                            }),
                            i && !h.on && u.hcSticky("on")
                        }
                    };
                    c(),
                    k.on("resize", d);
                    var p = function() {
                        var i = !1;
                        v._data(w, "events").scroll != b && v.each(v._data(w, "events").scroll, function(e, t) {
                            t.handler == h.fn.scroll && (i = !0)
                        }),
                        i || (h.fn.scroll(!0),
                        k.on("scroll", h.fn.scroll))
                    };
                    p()
                }
            }))
        }
    })
}(jQuery, this),
function(n, e) {
    "use strict";
    n.fn.extend({
        pluginOptions: function(t, i, o, s) {
            return this.data(t) || this.data(t, {}),
            t && void 0 === i ? this.data(t).options : "object" == typeof (o = o || i || {}) || void 0 === o ? this.each(function() {
                var e = n(this);
                e.data(t).options ? e.data(t, n.extend(e.data(t), {
                    options: n.extend(e.data(t).options, o || {})
                })) : (e.data(t, {
                    options: n.extend(i, o || {})
                }),
                s && (e.data(t).commands = s))
            }) : "string" == typeof o ? this.each(function() {
                n(this).data(t).commands[o].call(this)
            }) : this
        }
    })
}(jQuery),
function(n) {
    "use strict";
    n.fn.fitVids = function(e) {
        var i = {
            customSelector: null,
            ignore: null
        };
        if (!document.getElementById("fit-vids-style")) {
            var t = document.head || document.getElementsByTagName("head")[0]
              , o = document.createElement("div");
            o.innerHTML = '<p>x</p><style id="fit-vids-style">.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}</style>',
            t.appendChild(o.childNodes[1])
        }
        return e && n.extend(i, e),
        this.each(function() {
            var e = ['iframe[src*="player.vimeo.com"]', 'iframe[src*="youtube.com"]', 'iframe[src*="youtube-nocookie.com"]', 'iframe[src*="kickstarter.com"][src*="video.html"]', "object", "embed"];
            i.customSelector && e.push(i.customSelector);
            var s = ".fitvidsignore";
            i.ignore && (s = s + ", " + i.ignore);
            var t = n(this).find(e.join(","));
            (t = (t = t.not("object object")).not(s)).each(function(e) {
                var t = n(this);
                if (!(0 < t.parents(s).length || "embed" === this.tagName.toLowerCase() && t.parent("object").length || t.parent(".fluid-width-video-wrapper").length)) {
                    t.css("height") || t.css("width") || !isNaN(t.attr("height")) && !isNaN(t.attr("width")) || (t.attr("height", 9),
                    t.attr("width", 16));
                    var i = ("object" === this.tagName.toLowerCase() || t.attr("height") && !isNaN(parseInt(t.attr("height"), 10)) ? parseInt(t.attr("height"), 10) : t.height()) / (isNaN(parseInt(t.attr("width"), 10)) ? t.width() : parseInt(t.attr("width"), 10));
                    if (!t.attr("id")) {
                        var o = "fitvid" + e;
                        t.attr("id", o)
                    }
                    t.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", 100 * i + "%"),
                    t.removeAttr("height").removeAttr("width")
                }
            })
        })
    }
}(window.jQuery || window.Zepto),
function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self).Headroom = t()
}(this, function() {
    "use strict";
    function e() {
        return "undefined" != typeof window
    }
    function u(e) {
        return (a = e) && a.document && 9 === a.document.nodeType ? (o = (i = e).document,
        s = o.body,
        n = o.documentElement,
        {
            scrollHeight: function() {
                return Math.max(s.scrollHeight, n.scrollHeight, s.offsetHeight, n.offsetHeight, s.clientHeight, n.clientHeight)
            },
            height: function() {
                return i.innerHeight || n.clientHeight || s.clientHeight
            },
            scrollY: function() {
                return void 0 !== i.pageYOffset ? i.pageYOffset : (n || s.parentNode || s).scrollTop
            }
        }) : (t = e,
        {
            scrollHeight: function() {
                return Math.max(t.scrollHeight, t.offsetHeight, t.clientHeight)
            },
            height: function() {
                return Math.max(t.offsetHeight, t.clientHeight)
            },
            scrollY: function() {
                return t.scrollTop
            }
        });
        var t, i, o, s, n, a
    }
    function t(e, o, s) {
        var t, i = function() {
            var t = !1;
            try {
                var e = {
                    get passive() {
                        t = !0
                    }
                };
                window.addEventListener("test", e, e),
                window.removeEventListener("test", e, e)
            } catch (e) {
                t = !1
            }
            return t
        }(), n = !1, a = u(e), r = a.scrollY(), l = {};
        function d() {
            var e = Math.round(a.scrollY())
              , t = a.height()
              , i = a.scrollHeight();
            l.scrollY = e,
            l.lastScrollY = r,
            l.direction = r < e ? "down" : "up",
            l.distance = Math.abs(e - r),
            l.isOutOfBounds = e < 0 || i < e + t,
            l.top = e <= o.offset,
            l.bottom = i <= e + t,
            l.toleranceExceeded = l.distance > o.tolerance[l.direction],
            s(l),
            r = e,
            n = !1
        }
        function c() {
            n || (n = !0,
            t = requestAnimationFrame(d))
        }
        var p = !!i && {
            passive: !0,
            capture: !1
        };
        return e.addEventListener("scroll", c, p),
        d(),
        {
            destroy: function() {
                cancelAnimationFrame(t),
                e.removeEventListener("scroll", c, p)
            }
        }
    }
    function o(e, t) {
        var i;
        t = t || {},
        Object.assign(this, o.options, t),
        this.classes = Object.assign({}, o.options.classes, t.classes),
        this.elem = e,
        this.tolerance = (i = this.tolerance) === Object(i) ? i : {
            down: i,
            up: i
        },
        this.initialised = !1,
        this.frozen = !1
    }
    return o.prototype = {
        constructor: o,
        init: function() {
            return o.cutsTheMustard && !this.initialised && (this.addClass("initial"),
            this.initialised = !0,
            setTimeout(function(e) {
                e.scrollTracker = t(e.scroller, {
                    offset: e.offset,
                    tolerance: e.tolerance
                }, e.update.bind(e))
            }, 100, this)),
            this
        },
        destroy: function() {
            this.initialised = !1,
            Object.keys(this.classes).forEach(this.removeClass, this),
            this.scrollTracker.destroy()
        },
        unpin: function() {
            !this.hasClass("pinned") && this.hasClass("unpinned") || (this.addClass("unpinned"),
            this.removeClass("pinned"),
            this.onUnpin && this.onUnpin.call(this))
        },
        pin: function() {
            this.hasClass("unpinned") && (this.addClass("pinned"),
            this.removeClass("unpinned"),
            this.onPin && this.onPin.call(this))
        },
        freeze: function() {
            this.frozen = !0,
            this.addClass("frozen")
        },
        unfreeze: function() {
            this.frozen = !1,
            this.removeClass("frozen")
        },
        top: function() {
            this.hasClass("top") || (this.addClass("top"),
            this.removeClass("notTop"),
            this.onTop && this.onTop.call(this))
        },
        notTop: function() {
            this.hasClass("notTop") || (this.addClass("notTop"),
            this.removeClass("top"),
            this.onNotTop && this.onNotTop.call(this))
        },
        bottom: function() {
            this.hasClass("bottom") || (this.addClass("bottom"),
            this.removeClass("notBottom"),
            this.onBottom && this.onBottom.call(this))
        },
        notBottom: function() {
            this.hasClass("notBottom") || (this.addClass("notBottom"),
            this.removeClass("bottom"),
            this.onNotBottom && this.onNotBottom.call(this))
        },
        shouldUnpin: function(e) {
            return "down" === e.direction && !e.top && e.toleranceExceeded
        },
        shouldPin: function(e) {
            return "up" === e.direction && e.toleranceExceeded || e.top
        },
        addClass: function(e) {
            this.elem.classList.add.apply(this.elem.classList, this.classes[e].split(" "))
        },
        removeClass: function(e) {
            this.elem.classList.remove.apply(this.elem.classList, this.classes[e].split(" "))
        },
        hasClass: function(e) {
            return this.classes[e].split(" ").every(function(e) {
                return this.classList.contains(e)
            }, this.elem)
        },
        update: function(e) {
            e.isOutOfBounds || !0 !== this.frozen && (e.top ? this.top() : this.notTop(),
            e.bottom ? this.bottom() : this.notBottom(),
            this.shouldUnpin(e) ? this.unpin() : this.shouldPin(e) && this.pin())
        }
    },
    o.options = {
        tolerance: {
            up: 0,
            down: 0
        },
        offset: 0,
        scroller: e() ? window : null,
        classes: {
            frozen: "headroom--frozen",
            pinned: "headroom--pinned",
            unpinned: "headroom--unpinned",
            top: "headroom--top",
            notTop: "headroom--not-top",
            bottom: "headroom--bottom",
            notBottom: "headroom--not-bottom",
            initial: "headroom"
        }
    },
    o.cutsTheMustard = !!(e() && function() {}
    .bind && "classList"in document.documentElement && Object.assign && Object.keys && requestAnimationFrame),
    o
}),
function(e, i, t) {
    "use strict";
    i(".module-more-link").each(function(e) {
        i(this).find("a").on("click", function(e) {
            ione3.sendGAEvent("more-link", "click", i(this).attr("href"))
        })
    });
    var o = document.location.protocol + "//" + document.location.hostname;
    "https:" !== document.location.protocol && i("body").on("click", 'a[href^="http"]:not([href*="' + o + '"])', function(e) {
        var t = i(this).attr("href");
        ione3.sendGAEvent("outbound", "click", t)
    })
}(0, jQuery),
function(e, t, i) {
    "use strict";
    t(".featured-video").length && t(".featured-video").fitVids()
}(0, jQuery),
function(e, t, i) {
    "use strict";
    t(".fsb-toggle").on("click", function(e) {
        e.preventDefault(),
        t(".fsb-toggle").toggleClass("closed"),
        t(".footer-share-bar").toggleClass("closed"),
        t(".footer-share-bar").hasClass("closed") ? t(".fsb-toggle .fsb-text").text("open") : t(".footer-share-bar").hasClass("closed") || t(".fsb-toggle .fsb-text").text("close")
    })
}(0, jQuery),
function(l, d, e) {
    "use strict";
    if (d("#header").length) {
        d(document).ready(function() {
            var e = document.getElementById("header")
              , t = document.getElementById("secondary-header");
            d(e).addClass("has-secondary-header-fixed"),
            void 0 !== l.ione3_secondary_header_not_collapse && ("bottom" === l.ione3_secondary_header_not_collapse.position ? e.insertBefore(t, e.childNodes[e.childNodes.length - 1].nextSibling) : e.insertBefore(t, e.childNodes[0])),
            d.fn.fitVids && d(".single .post-content, .custom-layout-column, #primary #article").fitVids({
                customSelector: 'iframe[src*="//d.yimg.com"],iframe[src*="//www.dailymotion.com"],object[data*="//cdnapi.kaltura.com"],iframe[src*="//player.theplatform.com"]'
            })
        }),
        d(l).on("load", function(e) {
            var t = document.getElementById("header")
              , i = document.getElementById("secondary-header")
              , o = document.getElementById("ad-pushdown")
              , s = document.getElementById("ione-container")
              , n = function() {
                if (i) {
                    var e = i.offsetHeight + i.offsetTop;
                    return o && (e += o.offsetHeight),
                    e
                }
                return o ? o.offsetHeight : 0
            }();
            if (void 0 !== l.ione3_secondary_header_not_collapse) {
                n = 0;
                var a = d(".main-header-inner");
                d(".super-wrapper").css({
                    "padding-top": parseInt(i.offsetHeight + a.height(), 10) + "px"
                }),
                d(".page .post-super-wrapper").css({
                    "padding-top": parseInt(i.offsetHeight + a.height(), 10) + "px"
                }),
                d("#infinite-scroll-container").css({
                    "padding-top": parseInt(i.offsetHeight + a.height(), 10) + "px"
                })
            }
            var r = new Headroom(t,{
                offset: n,
                classes: {
                    initial: "header--initial",
                    pinned: "header--pinned",
                    unpinned: "header--unpinned",
                    top: "header--unfixed",
                    notTop: "header--fixed"
                },
                onPin: function() {
                    d(this.elem).trigger("pinned")
                },
                onUnpin: function() {
                    d(this.elem).trigger("unpinned")
                },
                onTop: function() {
                    s.style.paddingTop = 0
                },
                onNotTop: function() {
                    s.style.paddingTop = t.offsetHeight + "px"
                }
            });
            void 0 === l.ione3_ct_checks && r.init()
        });
        var o, s, t = d(document.getElementById("header")), n = ".main-nav__item", i = ".main-nav__item-link", a = "main-nav__item--focus", r = ".main-nav__dropdown a";
        t.on("mouseenter", n, function(e) {
            var t = d(this)
              , i = t.find("img");
            clearTimeout(s),
            t.siblings(".main-nav__item--focus").length ? (d(n).removeClass(a),
            t.addClass(a),
            ione3.sendGAEvent("main-nav", "mouseover", t.find(".main-nav__item-link").text())) : o = setTimeout(function() {
                d(n).removeClass(a),
                t.addClass(a),
                ione3.sendGAEvent("main-nav", "mouseover", t.find(".main-nav__item-link").text())
            }, 500),
            i.each(function() {
                var e = d(this);
                e.attr("src") || e.attr("src", e.data("lazy"))
            })
        }).on("mouseleave", n, function(e) {
            var t = d(this);
            clearTimeout(o),
            s = setTimeout(function() {
                t.removeClass(a)
            }, 300)
        }),
        t.on("focus", i, function(e) {
            d(this).parents(n).addClass(a)
        }).on("blur", i, function(e) {
            d(this).parents(n).removeClass(a)
        }).on("click", i, function(e) {
            ione3.sendGAEvent("main-nav", "click", d(this).text())
        }),
        t.on("focus", r, function(e) {
            d(this).parents(n).addClass(a)
        }).on("blur", r, function(e) {
            d(this).parents(n).removeClass(a)
        }).on("click", r, function(e) {
            ione3.sendGAEvent("main-nav-dropdown", "click", d(this).attr("href"))
        })
    }
}(this, jQuery),
window.ione3 = function(r, e, t) {
    "use strict";
    var i = {
        "phone-wide": 576,
        wordpress: 601,
        tablet: 769,
        "tablet-wide": 1024,
        desk: 1440,
        "desk-wide": 1920
    };
    return {
        hasAdminBar: function() {
            return "1" === ione3Theme.admin_bar
        },
        isIE: function() {
            return document.all && document.compatMode || r.navigator.msPointerEnabled
        },
        largerThan: function(e) {
            var t = function(e) {
                if (e in i)
                    return i[e]
            }(e);
            return r.innerWidth >= t
        },
        debounce: function(t, i, o) {
            var s, n, a, r, l, d = Date.now || function() {
                return (new Date).getTime()
            }
            , c = function() {
                var e = d - r;
                e < i && 0 <= e ? s = setTimeout(c, i - e) : (s = null,
                o || (l = t.apply(a, n),
                s || (a = n = null)))
            };
            return function() {
                a = this,
                n = arguments,
                r = d;
                var e = o && !s;
                return s || (s = setTimeout(c, i)),
                e && (l = t.apply(a, n),
                a = n = null),
                l
            }
        },
        doComscore: function() {
            if ("object" == typeof r.comscore && r.comscore.id) {
                r._comscore = r._comscore || [],
                r._comscore.push({
                    c1: "2",
                    c2: comscore.id
                });
                var e = document.createElement("script")
                  , t = document.getElementsByTagName("script")[0];
                e.async = !0,
                e.src = ("https:" === document.location.protocol ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js",
                t.parentNode.insertBefore(e, t)
            }
        },
        sendGAPageviewData: function(e, t, i, o, s, n) {
            var a;
            a = {
                page: s = s.replace(/(https?:\/\/|\/\/)[^\/]+/i, ""),
                title: n,
                contentGroup1: location.hostname,
                contentGroup2: e,
                contentGroup3: t,
                contentGroup4: i,
                contentGroup5: o
            },
            ga("send", "pageview", a),
            ga("global.send", "pageview", a)
        },
        sendGAEvent: function(e, t, i) {
            var o = {
                hitType: "event",
                eventCategory: e,
                eventAction: t,
                eventLabel: i,
                nonInteraction: !0
            };
            try {
                ga("send", o),
                ga("global.send", o)
            } catch (e) {}
        },
        callIris: function(o) {
            var t, i, e, s = s || {}, n = r.anvVideo || {};
            if ("" === n.iris_client_token)
                return !1;
            function a(e, t) {
                var i = "";
                t && (i = t),
                ione3.sendGAEvent("anvato_single", e, i)
            }
            i = function(e) {
                try {
                    return AnvatoPlayer(o.pInstance).getCurrentTime(function(e) {
                        r.irisCurrentTime = e
                    }),
                    r.irisCurrentTime
                } catch (e) {
                    return 0
                }
            }
            ,
            t = function(e) {
                try {
                    return AnvatoPlayer(o.pInstance).getDuration(function(e) {
                        r.irisCurrentDuration = e
                    }),
                    r.irisCurrentDuration
                } catch (e) {
                    return 0
                }
            }
            ,
            (e = {
                settings: {
                    number: 10,
                    player_id: o.pInstance,
                    ssl: !0,
                    player_version: "anvato",
                    client_token: n.iris_client_token,
                    platform: "anvato",
                    platform_id: o.video,
                    start_up_next: !1,
                    end_up_next: !1
                },
                iris_buttons: {
                    thumbs_up: !1,
                    thumbs_down: !1,
                    skip_forward: !1,
                    skip_back: !1,
                    skip_on_thumbs_down: !0
                },
                debug: !1,
                global: "iris1"
            }).player_elements = {
                player_element: document.getElementById(o.pInstance)
            },
            r.irisCurrentTime = 0,
            r.irisCurrentDuration = 0,
            r.canSkipVideo = !0,
            a("setup_1_player_ready"),
            (s = "" === n.iris_client_token ? {
                registerFunction: function() {},
                registerEvent: function() {},
                getPlaylist: function() {
                    return []
                },
                emit: function() {},
                addCallback: {
                    watch: function() {}
                }
            } : initializeIrisPlugin(e)).registerFunction("currentTime", i),
            s.registerFunction("currentDuration", t),
            s.registerFunction("play", function(e) {
                var t, i;
                t = e.platform_id,
                i = e.playback_token,
                AnvatoPlayer(o.pInstance).play({
                    id: t,
                    token: i
                })
            }),
            s.registerEvent("ENDED"),
            s.registerEvent("PLAYING"),
            s.addCallback.watch(function(e) {
                AnvatoPlayer(o.pInstance).getState(function(e) {
                    "playingAdContent" !== e && "pausedAdContent" !== e || s.emit("AD_START")
                })
            }),
            AnvatoPlayer(o.pInstance).setListener(function(e) {
                switch (e.name) {
                case "AD_STARTED":
                    a("setup_5_ad_started"),
                    s.emit("AD_START");
                    break;
                case "AD_CLICKED":
                    a("ad_clicked"),
                    AnvatoPlayer(o.pInstance).pause();
                    break;
                case "AD_SKIPPED":
                    a("ad_skipped");
                    break;
                case "ALL_ADS_COMPLETED":
                    a("setup_6_ad_complete"),
                    s.emit("AD_END");
                    break;
                case "PLAYING_START":
                    s.emit("PLAYING");
                    break;
                case "VIDEO_STARTED":
                    a("view_first_frame", e.args[0]);
                    break;
                case "VIDEO_FIRST_QUARTILE":
                    a("view_quartile_1", e.args[0]);
                    break;
                case "VIDEO_MID_POINT":
                    a("view_quartile_2", e.args[0]);
                    break;
                case "VIDEO_THIRD_QUARTILE":
                    a("view_quartile_3", e.args[0]);
                    break;
                case "VIDEO_COMPLETED":
                    a("view_content_ended", e.args[0]),
                    r.irisCurrentTime = 0,
                    r.irisCurrentDuration = 0,
                    s.emit("ENDED", {
                        type: "next_auto",
                        percentageWatched: (i() / t()).toFixed(2)
                    });
                    break;
                case "PLAYER_ERROR":
                    "PLAY920" !== e.args[0] && a("error", e.args[0] + " - " + e.args[1])
                }
            })
        }
    }
}(this, jQuery),
function(e, t, i) {
    "use strict";
    "/listen-live/" !== location.pathname && "/listen-live" !== location.pathname || t("a").attr("target", "_blank")
}(0, jQuery),
function(n, d, e) {
    "use strict";
    function t(e, t) {
        var i = {
            baseURL: n.ione3Gallery.baseURL,
            onInit: function() {}
        };
        this.options = d.extend({}, i, t),
        this.element = e,
        this.$listicle = d(e),
        this.$item = d(".ione-listicle__item", this.$listicle),
        this.galleryTitle = this.$listicle.data("title"),
        this.galleryURL = this.$listicle.data("gallery-url"),
        this.baseURL = this.options.baseURL,
        this.reportedSlides = [],
        this.init()
    }
    t.prototype = {
        init: function() {
            var e = this;
            e.$listicle.fitVids(),
            d(n).on("scroll", _.throttle(function() {
                e.initEvent()
            }, 250)),
            d("img[data-lazy]", e.$item).each(function() {
                d(this).attr("src", d(this).data("lazy"))
            })
        },
        initEvent: function() {
            var a = this
              , r = d(n).scrollTop()
              , l = d("#header").outerHeight() + 80;
            a.$item.each(function(e) {
                var t = d(this)
                  , i = t.outerHeight(!0)
                  , o = t.offset().top
                  , s = o + i
                  , n = t.data("image-id");
                o <= r + l && r + l < s && a.updateURL(n, t)
            })
        },
        slugify: function(e) {
            return _.isUndefined(e) ? "" : _.isUndefined(e) ? "" : e.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "")
        },
        updateURL: function(e, t) {
            var i, o = this, s = d(n).scrollTop();
            if (i = "media_playlist" === ione3Gallery.gallery_type ? o.baseURL + "item/" + e : o.baseURL + "playlist/" + o.slugify(o.galleryTitle) + "/item/" + e,
            t.addClass("listicle-active").siblings().removeClass("listicle-active"),
            i !== n.location.href && "media_playlist" === ione3Gallery.gallery_type && (history.replaceState ? history.replaceState(null, null, i) : n.location.href = i),
            !t.data("state-updated")) {
                if (100 < s && !_.includes(o.reportedSlides, e)) {
                    if (o.reportedSlides.push(e),
                    n.ga) {
                        "media_playlist" === ione3Gallery.gallery_type ? "media_playlist" : "embedded-playlist",
                        ga("set", {
                            dimension10: "gallery-nonve",
                            dimension15: null
                        }),
                        ione3.sendGAPageviewData(ione_tag_manager.ga.categories, ione_tag_manager.ga.post_type, ione_tag_manager.ga.tags, ione_tag_manager.ga.author, i, this.galleryTitle);
                        try {
                            PARSELY.beacon.trackPageView({
                                url: o.baseURL,
                                urlref: i,
                                js: 1
                            })
                        } catch (e) {}
                    }
                    ione3.doComscore(),
                    n._tfa && n._tfa.push({
                        notify: "action",
                        name: "gallery_view"
                    })
                }
                t.data("state-updated", !0),
                t.siblings().data("state-updated", !1)
            }
        },
        resetURL: function() {
            this.baseURL !== n.location.href && (history.pushState ? history.pushState(null, null, this.baseURL) : location.hash = "")
        }
    },
    d.extend(d.fn, {
        ione3listicle: function(e) {
            return this.each(function() {
                d.data(this, "ione3_listicle") || d.data(this, "ione3_listicle", new t(this,e))
            })
        }
    }),
    d(document).ready(function() {
        d(".ione-listicle").ione3listicle()
    })
}(this, jQuery),
function(e, t, i) {
    "use strict";
    var o = t(document.getElementById("js-mobile-anchor"))
      , s = t(document.getElementById("mobile-anchor-close-box"));
    o.length && s.click(function() {
        o.css("transition-duration", ".25s"),
        o.css("transform", "translate(0,100px)"),
        setTimeout(function() {
            t("body").removeClass("mobile-anchor-displayed")
        }, 300)
    }),
    t(document).on("redisplay-mobile-anchor-unit", function() {
        t(document.getElementById("js-mobile-anchor")).length && void 0 !== e.renderedGptSlots["div-gpt-anchor-ad"] && (googletag.pubads().refresh([e.renderedGptSlots["div-gpt-anchor-ad"]]),
        t("body").addClass("mobile-anchor-displayed"),
        t(document.getElementById("js-mobile-anchor")).css("transition-duration", ".25s").css("transform", "translate(0,0)"))
    })
}(this, jQuery),
function(i, o, e) {
    "use strict";
    var s = "addthis-animated slideInDown at4-show at4-visible visible";
    o(i).on("load", function() {
        o("#at-share-dock").removeClass(s).hide()
    }),
    o(document).ready(function() {
        i.ione3Scroll.is_single && "post" === i.ione3Scroll.post_type && o(".post-super-wrapper .post").length && o(i).on("scroll", _.throttle(function() {
            var e, t;
            e = o("#at-share-dock"),
            t = o(".post-super-wrapper .post").first().offset().top,
            o(i).width() <= 979 ? o(i).scrollTop() > t ? e.hasClass("visible") || e.addClass(s).fadeIn() : (e.hasClass("at4-show") || e.hasClass("at4-visible")) && e.removeClass(s).hide() : e.removeClass(s).hide()
        }, 100))
    })
}(this, jQuery),
function(t, i, e) {
    "use strict";
    var o = i(document.getElementById("menu-toggle"))
      , s = (i(document.getElementById("push-menu__close")),
    i("body"))
      , n = i(document.getElementById("header"))
      , a = i(document.getElementById("secondary-header"))
      , r = i(document.getElementById("push-menu"));
    o.on("click", function(e) {
        e.preventDefault(),
        n.hasClass("header--fixed") && n.css({
            position: "absolute",
            top: i(t).scrollTop() + "px"
        }),
        s.addClass("has-push-menu--open"),
        ione3.sendGAEvent("push-menu", "click", "open")
    }),
    s.on("click", ".push-menu-overlay, #menu-close, #push-menu__close", function() {
        s.removeClass("has-push-menu--open"),
        ione3.sendGAEvent("push-menu", "click", "close"),
        t.setTimeout(function() {
            n.attr("style", "")
        }, 400)
    }),
    r.find("a").each(function() {
        i(this).on("focus", function() {
            s.addClass("has-push-menu--open")
        })
    }),
    a.find("a").each(function() {
        i(this).on("focus", function() {
            s.removeClass("has-push-menu--open")
        })
    }),
    n.find("a").each(function() {
        i(this).on("focus", function() {
            s.removeClass("has-push-menu--open")
        })
    }),
    Modernizr.touchevents && (i(document).on("touchmove", ".has-push-menu--open", function(e) {
        e.preventDefault()
    }),
    i(document).on("touchmove", ".push-menu", function(e) {
        e.stopPropagation()
    })),
    i(document).on("keyup", function(e) {
        27 === e.keyCode && i(".push-menu-overlay").click()
    })
}(this, jQuery),
function(e, t, i) {
    "use strict";
    t(".ione-scrolltocomments").length && t(".ione-scrolltocomments").each(function(e) {
        t(this).on("click", function(e) {
            e.preventDefault(),
            t("html, body").animate({
                scrollTop: t("#comments").offset().top - t("#header").outerHeight() - 70
            }, 500)
        })
    })
}(0, jQuery),
function(e, t, i) {
    "use strict";
    var o = t(document.getElementById("global-search"));
    t(document).on("click", "#global-search-toggle", function(e) {
        e.preventDefault(),
        o.toggleClass("-active"),
        ione3.sendGAEvent("Site Search", "click", "Open"),
        t(document).trigger("searchmode:activate")
    }),
    t(document).on("click", "#global-search-close", function(e) {
        e.preventDefault(),
        o.removeClass("-active"),
        ione3.sendGAEvent("Site Search", "click", "Close"),
        t(document).trigger("searchmode:deactivate")
    })
}(0, jQuery),
function(h, p, e) {
    "use strict";
    function t(e, t) {
        var i = {
            open: !1,
            baseURL: ione3Gallery.baseURL,
            baseID: ione3Scroll.post_id,
            onInit: function() {}
        };
        this.options = p.extend({}, i, t),
        this.element = e,
        this.$galleryWrap = p(e),
        this.$gallery = p(".ione-gallery__slideshow", this.$galleryWrap),
        this.$gallerySidebar = p(".ione-gallery__sidebar", this.$galleryWrap),
        this.$galleryTitle = p(".ione-gallery__title", this.$galleryWrap),
        this.$galleryDescription = p(".ione-gallery__description", this.$galleryWrap),
        this.$galleryClose = p(".ione-gallery__close", this.$galleryWrap),
        this.galleryNext = this.$gallery.data("next-gallery") || "",
        this.galleryPrev = this.$gallery.data("prev-gallery") || "",
        this.galleryTitle = this.$gallery.data("title"),
        this.galleryDescription = this.$gallery.data("description"),
        this.galleryCategories = this.$gallery.data("categories"),
        this.galleryTags = this.$gallery.data("tags"),
        this.galleryAuthor = this.$gallery.data("author"),
        this.$galleryShare = p("#ione-gallery-share", this.$galleryWrap),
        this.galleryURL = this.$gallery.data("gallery-url"),
        this.baseURL = this.options.baseURL,
        this.galleryLength = this.$gallery.data("count"),
        this.galleryType = ione3Gallery.gallery_type,
        this.$inGallery = p(".in-gallery-ad", this.$galleryWrap),
        this.baseID = this.options.baseID,
        this.bannerRefreshed = !1,
        this.longBannerRefreshed = !1,
        this.innerRefreshed = !1,
        this.reportedSlides = [],
        this.init()
    }
    t.prototype = {
        init: function() {
            var e, t = this;
            (t.options.onInit.call(t),
            (t.options.open && ione3.largerThan("tablet-wide") || t.itemRequested() && ione3.largerThan("tablet-wide")) && t.open(),
            "#open-gallery" === h.location.hash && ione3.largerThan("tablet-wide") && (t.open(),
            t.updateURL(t.$gallery.find("> div").eq(0).data("image-id"))),
            t.createOrDestroy(),
            p(h).on("resize", function() {
                t.createOrDestroy(),
                t.$gallery.slick("setPosition")
            }),
            t.$gallery.fitVids(),
            t.initClicks(),
            t.initStates(),
            t.isPlaylist()) ? t.$galleryWrap.addClass("standalone") : (t.$galleryWrap.addClass("embedded"),
            0 < p(".ione-gallery__mobile-featured").find("img").length ? (e = p(".ione-gallery__mobile-featured").find("img").clone()).attr("src", e.data("lazy")).css("opacity", 1) : e = p('<div class="ione-gallery__mobile-holder"></div>'),
            e.appendTo(t.$galleryWrap.find(".ione-gallery__mobile-launcher").find(".video-poster")))
        },
        initAllBanners: function() {
            var e = this
              , t = [];
            e.bannerRefreshed && e.longBannerRefreshed || ("media_playlist" === e.galleryType || e.options.open || e.itemRequested() ? (t = ["div-gpt-gallery-long-banner" + e.baseID, "div-gpt-gallery" + e.baseID],
            e.bannerRefreshed = !0) : t = ["div-gpt-gallery-long-banner" + e.baseID],
            e.longBannerRefreshed = !0),
            ioneAds.refreshSlots(t)
        },
        initClicks: function() {
            var t = this;
            t.$galleryWrap.on("click", ".ione-gallery__mobile-launcher", function(e) {
                e.preventDefault(),
                t.openMobile()
            }),
            t.$galleryWrap.on("click", ".ione-gallery__close-mobile", function(e) {
                e.preventDefault(),
                t.closeMobile()
            }),
            t.$galleryWrap.on("click", ".skip-ad", function(e) {
                e.preventDefault(),
                t.adShowNav()
            }),
            t.$galleryClose.on("click", function() {
                t.close()
            })
        },
        initStates: function() {
            var i = this;
            i.$galleryWrap.on("click", ".ione-gallery__slideshow", function() {
                ione3.largerThan("tablet-wide") && (i.$galleryWrap.hasClass("-clicked") || i.toggle())
            }).on("mouseenter", function() {
                var e = i.$gallery.outerHeight(!0) + i.$galleryWrap.find(".ione-gallery__main-title").outerHeight(!0) + 45;
                if (ione3.largerThan("tablet-wide"))
                    if (i.$galleryWrap.hasClass("-clicked"))
                        i.$galleryWrap.find(".ione-gallery-inner").attr("style", ""),
                        i.$gallerySidebar.css("height", "100%");
                    else {
                        if (!i.bannerRefreshed) {
                            var t = ["div-gpt-gallery" + i.baseID, "div-gpt-inner-gallery" + i.baseID];
                            ioneAds.refreshSlots(t),
                            i.bannerRefreshed = !0
                        }
                        clearTimeout(i.hideTimer),
                        i.displayTimer = setTimeout(function() {
                            i.$galleryWrap.addClass("-hover"),
                            i.$galleryWrap.find(".ione-gallery-inner").height(e)
                        }, 600)
                    }
            }).on("mouseleave", function() {
                i.hideTimer = setTimeout(function() {
                    i.$galleryWrap.removeClass("-hover"),
                    i.$galleryWrap.find(".ione-gallery-inner").attr("style", ""),
                    i.$galleryWrap.attr("style", "")
                }, 600),
                clearTimeout(i.displayTimer)
            })
        },
        createOrDestroy: function() {
            ione3.largerThan("tablet-wide") ? this.create() : this.destroy()
        },
        create: function() {
            var l = this
              , d = h.$pdk
              , c = h.anvp;
            p(h).off("scroll.ione3gallery"),
            l.$gallery.hasClass("slick-initialized") || (l.$gallery.on("init", function(e) {
                var t = l.$gallery.find(".slick-active")
                  , i = t.data("title") || l.galleryTitle
                  , o = t.data("description") || ""
                  , s = parseInt(l.getCurrentSlide(), 10);
                l.updateSlideState(t, i, o, s),
                0 === l.getInitialSlide() && l.goToPrev(),
                l.getInitialSlide() === parseInt(l.galleryLength - 1, 10) && l.goToNext(),
                t.find("iframe.tpEmbed").length && (t.find(".fluid-width-video-wrapper").wrap('<div class="ione-embed-wrap"></div>'),
                d.controller.addEventListener("OnMediaStart", function(e) {
                    d.controller.pause(!0)
                }))
            }),
            l.$gallery.on("afterChange", function(e, t, i) {
                var o = parseInt(i + 1, 10)
                  , s = t.$slides.eq(i)
                  , n = s.data("image-id")
                  , a = s.data("title") || l.galleryTitle
                  , r = s.data("description") || "";
                l.updateURL(n),
                l.updateSlideState(s, a, r, o),
                l.$gallery.find(".arrow-prev-gallery").length && (l.$gallery.find(".arrow-prev-gallery").remove(),
                l.$gallery.find(".icon-arrow-left").show()),
                l.$gallery.find(".arrow-next-gallery").length && (l.$gallery.find(".arrow-next-gallery").remove(),
                l.$gallery.find(".icon-arrow-right").show()),
                l.galleryLength === parseInt(i + 1, 10) && l.goToNext(o),
                1 === parseInt(i + 1, 10) && l.goToPrev(),
                0 === s.has("iframe.tpEmbed").length && d ? d.controller.pause(!0) : d && d.controller.pause(!1)
            }),
            l.$gallery.on("beforeChange", function(e, t, i, o) {
                var s = t.$slides.eq(i);
                l.refreshAds(o, t.$slides.eq(o)),
                l.resetVideo(s);
                var n = s.find("iframe[src*=youtu]");
                n.length && n.get(0).contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
                var a = s.find("iframe[src*=vimeo]");
                if (a.length && a[0].contentWindow.postMessage('{"method":"pause"}', "*"),
                0 === s.has("iframe.tpEmbed").length && d && d.controller.pause(!0),
                s.has("iframe[id^=anvato]").length && c) {
                    var r = s.find("iframe[id^=anvato]").attr("id");
                    new AnvatoPlayer(r).pause()
                }
            }),
            l.$gallery.slick({
                lazyLoad: "ondemand",
                prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
                nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
                fade: !0,
                focusOnSelect: !0,
                initialSlide: l.getInitialSlide(),
                adaptiveHeight: l.ieSlideFix()
            }))
        },
        destroy: function() {
            var l = this;
            l.$galleryWrap.attr("style", ""),
            l.$galleryWrap.find(".ione-gallery-inner").attr("style", ""),
            l.$galleryWrap.removeClass("-hover").removeClass("-clicked"),
            p("body").css("overflow", "auto"),
            l.$gallery.hasClass("slick-initialized") ? l.$gallery.hasClass("slick-initialized") && (l.$gallery.slick("unslick"),
            l.$gallery.find("> div").attr("style", ""),
            l.loadLazyImages()) : (l.$gallery.find("> div").attr("style", ""),
            l.isPlaylist() && l.$gallery.find("> div").slice(0, 3).each(function() {
                var e = p(this)
                  , t = e.find(".ad")
                  , i = e.find(".gallery-taboola");
                e.find("img").attr("src") && e.find("> img").length || (e.find("> img").length && e.find("img").attr("src", e.find("img").data("lazy")),
                e.addClass("mobile-loaded"),
                l.refreshMobileAds(l, t, i))
            })),
            l.isPlaylist() && (p("body").addClass("gallery-not-loaded"),
            p(h).on("scroll.ione3gallery", h._.throttle(function() {
                var r = p(h).scrollTop();
                l.$gallery.find("> div").each(function(e, t) {
                    var i = p(this)
                      , o = i.outerHeight(!0)
                      , s = i.offset().top
                      , n = s + o
                      , a = i.data("image-id");
                    s <= r + 160 && r + 160 < n && !i.data("state-updated") && (l.updateURL(a),
                    i.data("state-updated", !0),
                    0 < i.index() && i.index() % ione3Gallery.refresh_anchor == 0 && googletag.pubads().refresh([h.renderedGptSlots["div-gpt-anchor"]]),
                    i.siblings().data("state-updated", !1),
                    i.nextAll().slice(0, 3).each(function() {
                        var e = p(this)
                          , t = e.find(".ad")
                          , i = e.find(".gallery-taboola")
                          , o = e.find(".gallery-outbrain-no-ads");
                        e.find("img").attr("src") && e.find("> img").length || (e.find("> img").length && e.find("img").not(".ob-rec-image").attr("src", e.find("img").data("lazy")),
                        setTimeout(function() {
                            e.addClass("mobile-loaded"),
                            e.prev('[data-has-ad="1"]').addClass("next-items-loaded")
                        }, 2e3),
                        l.refreshMobileAds(l, t, i, o))
                    }),
                    e === l.galleryLength - 1 && p("body").removeClass("gallery-not-loaded"))
                })
            }, 250)))
        },
        loadLazyImages: function() {
            this.$gallery.find("img").each(function() {
                var e = p(this);
                e.attr("src") || e.not(".ob-rec-image").attr("src", e.data("lazy"))
            })
        },
        toggle: function() {
            var e = this;
            ione3.largerThan("tablet-wide") && (e.$galleryWrap.hasClass("-clicked") ? (e.close(),
            e.$galleryWrap.trigger("mouseenter")) : (clearTimeout(e.displayTimer),
            e.open()),
            e.$gallery.slick("setPosition"))
        },
        openMobile: function() {
            var e, a = this;
            a.$galleryWrap.attr("style", ""),
            a.$galleryWrap.find(".ione-gallery-inner").attr("style", ""),
            a.$galleryWrap.addClass("-mobile-clicked"),
            p("body").css("overflow", "hidden"),
            p(document).one("keydown", function(e) {
                27 === e.keyCode && a.closeMobile()
            }),
            a.$gallery.find("> div").slice(0, 3).each(function() {
                var e = p(this)
                  , t = e.find(".ad")
                  , i = e.find(".gallery-taboola");
                e.find("img").attr("src") && e.find("> img").length || (e.find("> img").length && e.find("img").not(".ob-rec-image").attr("src", e.find("img").data("lazy")),
                e.addClass("mobile-loaded"),
                a.refreshMobileAds(a, t, i))
            }),
            e = a.$gallery.find("> div").eq(0).data("image-id"),
            a.updateURL(e),
            a.$gallery.find("> div").eq(0).data("state-updated", !0),
            p(document).trigger("redisplay-mobile-anchor-unit"),
            a.$galleryWrap.on("scroll", h._.throttle(function() {
                var n = p(h).scrollTop();
                a.$gallery.find("> div").each(function() {
                    var e = p(this)
                      , t = e.outerHeight(!0)
                      , i = e.offset().top
                      , o = i + t
                      , s = e.data("image-id");
                    i <= n + 80 && n + 80 < o && !e.data("state-updated") && (a.updateURL(s),
                    e.data("state-updated", !0),
                    0 < e.index() && e.index() % ione3Gallery.refresh_anchor == 0 && p(document).trigger("redisplay-mobile-anchor-unit"),
                    e.siblings().data("state-updated", !1),
                    e.nextAll().slice(0, 3).each(function() {
                        var e = p(this)
                          , t = e.find(".ad")
                          , i = e.find(".gallery-taboola")
                          , o = e.find(".gallery-outbrain-no-ads");
                        e.find("img").attr("src") && e.find("> img").length || (e.find("> img").length && e.find("img").not(".ob-rec-image").attr("src", e.find("img").data("lazy")),
                        setTimeout(function() {
                            e.addClass("mobile-loaded"),
                            e.prev('[data-has-ad="1"]').addClass("next-items-loaded")
                        }, 2e3),
                        a.refreshMobileAds(a, t, i, o))
                    }))
                })
            }, 250))
        },
        closeMobile: function() {
            this.$galleryWrap.removeClass("-mobile-clicked"),
            p("body").css("overflow", "auto"),
            this.resetURL(),
            this.$galleryWrap.off("scroll")
        },
        open: function() {
            var t = this;
            t.initAllBanners(),
            t.$galleryWrap.attr("style", ""),
            t.$galleryWrap.find(".ione-gallery-inner").attr("style", ""),
            t.$galleryWrap.removeClass("-hover").addClass("-clicked"),
            p("body").css("overflow", "hidden"),
            t.$gallerySidebar.css("height", "100%"),
            p(document).one("keydown", function(e) {
                27 === e.keyCode && t.close()
            })
        },
        close: function() {
            this.$galleryWrap.removeClass("-clicked"),
            p("body").css("overflow", "auto"),
            this.$gallery.hasClass("slick-initialized") && this.$gallery.slick("setPosition"),
            this.resetURL()
        },
        getCurrentSlide: function() {
            return this.itemRequested() ? this.convertIDtoIndex() : parseInt(this.$gallery.find(".slick-active").data("slick-index") + 1, 10)
        },
        itemRequested: function() {
            return 0 <= this.convertIDtoIndex()
        },
        slugify: function(e) {
            return _.isUndefined(e) ? "" : e.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "")
        },
        convertIDtoIndex: function() {
            var e = h.location.href
              , t = /item\/(\d+)/i.exec(e);
            if (null === t)
                return -1;
            if (t.length) {
                var i = t[1];
                return parseInt(this.$gallery.find('[data-image-id="' + i + '"]').index(), 10)
            }
            return -1
        },
        getInitialSlide: function() {
            return this.itemRequested() ? this.convertIDtoIndex() : 0
        },
        showThumbnails: function() {
            return p("body").hasClass("is-cassius") ? 0 : 9
        },
        ieSlideFix: function() {
            return !!ione3.isIE()
        },
        updateSlideState: function(e, t, i, o) {
            this.updateImageDesc(t, i),
            this.updateShare(t, o)
        },
        resetURL: function() {
            var e = this;
            history.pushState ? history.pushState(null, null, e.baseURL) : location.hash = "",
            e.$galleryShare.length && e.$galleryShare.find("a").each(function() {
                p(this).attr("addthis:url", e.baseURL),
                p(this).attr("addthis:title", e.galleryTitle)
            })
        },
        resetVideo: function(e) {
            var t = e.find("video.wp-video-shortcode");
            t.length && (t[0].player.setCurrentTime(0),
            t[0].player.pause())
        },
        updateURL: function(e) {
            var t, i, o = this;
            t = o.isPlaylist() ? encodeURI(o.baseURL + "item/" + e) : encodeURI(o.baseURL + "playlist/" + o.slugify(o.galleryTitle) + "/item/" + e),
            h.location.href !== t && ((ione3.largerThan("tablet-wide") || o.isPlaylist()) && (history.pushState ? history.pushState(null, null, t) : h.location.href = t),
            _.includes(o.reportedSlides, e) || (o.reportedSlides.push(e),
            h.ga && (i = "media_playlist" === o.galleryType ? o.galleryType : "embedded_gallery",
            ione3.sendGAPageviewData(o.galleryCategories, i, o.galleryTags, o.galleryAuthor, t, o.galleryTitle)),
            ione3.doComscore(),
            "object" == typeof comscore && p.ajax(h.comscore.pv + "?" + parseInt(1e13 * Math.random())),
            h._tfa && h._tfa.push({
                notify: "action",
                name: "gallery_view"
            })))
        },
        updateImageDesc: function(e, t) {
            this.$galleryTitle.text(e),
            this.$galleryDescription.html(t)
        },
        adTempHideNav: function(e) {
            var t = this
              , i = h.ione3Gallery.nav_delay || 3e3;
            t.disableNav(),
            t.adTimer = setTimeout(function() {
                t.enableNav()
            }, i)
        },
        adShowNav: function() {
            this.enableNav(),
            clearTimeout(this.adTimer)
        },
        updateShare: function(e, t) {
            this.$galleryShare.length && this.itemRequested() && this.$galleryShare.find("a").each(function() {
                p(this).attr("addthis:url", h.location.href),
                p(this).attr("addthis:title", e)
            })
        },
        disableNav: function() {
            this.$galleryWrap.addClass("ad-active")
        },
        enableNav: function() {
            this.$galleryWrap.removeClass("ad-active")
        },
        refreshAds: function(e, t) {
            var i = this
              , o = [];
            t.data("has-ad") && (i.adTempHideNav(t),
            o.push("div-gpt-inner-gallery" + i.baseID)),
            ione3Gallery.refresh_728 === ione3Gallery.refresh_300 ? 0 < e && e % ione3Gallery.refresh_728 == 0 && o.push("div-gpt-gallery-long-banner" + i.baseID, "div-gpt-gallery" + i.baseID) : (0 < e && e % ione3Gallery.refresh_728 == 0 && o.push("div-gpt-gallery-long-banner" + i.baseID),
            0 < e && e % ione3Gallery.refresh_300 == 0 && o.push("div-gpt-gallery" + i.baseID)),
            o.length && ioneAds.refreshSlots(o)
        },
        refreshMobileAds: function(e, t, i, o) {
            if (t.length && !t.data("refreshed") && (ioneAds.refreshSlots(["div-gpt-" + t.data("adId")]),
            t.data("refreshed", !0)),
            i.length && !i.data("refreshed")) {
                var s = i.data("mode")
                  , n = i.data("container")
                  , a = i.data("placement")
                  , r = i.data("target_type");
                h._taboola = h._taboola || [],
                h._taboola.push({
                    mode: s,
                    container: n,
                    placement: a,
                    target_type: r
                }),
                i.data("refreshed", !0)
            }
            if (void 0 !== o && o.length) {
                var l = ione3Gallery.outbrain
                  , d = o.data("widget_id")
                  , c = o.data("template")
                  , p = e.galleryURL;
                void 0 !== l.isTesting && l.isTesting && (p = l.testURL);
                var u = document.createElement("div");
                u.setAttribute("class", "OUTBRAIN"),
                u.setAttribute("data-widget-id", d),
                u.setAttribute("data-ob-template", c),
                u.setAttribute("data-src", p),
                o.removeClass("gallery-outbrain-no-ads").addClass("gallery-outbrain").html(u),
                h.OBR.extern.researchWidget()
            }
        },
        isPlaylist: function() {
            return p("body").hasClass("single-media_playlist")
        },
        goToPrev: function() {
            var t = this;
            if ("" !== t.galleryPrev && t.isPlaylist()) {
                var e = t.$gallery.find(".icon-arrow-left");
                e.hide(),
                e.clone(!1).addClass("arrow-prev-gallery").appendTo(t.$gallery).show(function() {
                    p(this).one("click", function(e) {
                        e.preventDefault(),
                        h.location.href = t.galleryPrev + "#open-gallery"
                    })
                })
            }
        },
        goToNext: function(e) {
            var a = this;
            if ("" !== a.galleryNext) {
                var t = 0
                  , i = a.$gallery.find(".icon-arrow-right");
                i.hide();
                var o = i.clone(!1);
                o.addClass("arrow-next-gallery").appendTo(a.$gallery),
                parseInt(e - 1, 10) % ione3Gallery.refresh_728 != 0 && parseInt(e - 1, 10) % ione3Gallery.refresh_300 != 0 || (t = 1e3),
                o.delay(t).show(0, function() {
                    p(this).one("click", function(e) {
                        e.preventDefault(),
                        a.isPlaylist() ? h.location.href = a.galleryNext + "#open-gallery" : p.ajax({
                            url: ajax_url,
                            type: "POST",
                            xhrFields: {
                                withCredentials: !0
                            },
                            data: {
                                action: "retrieve_gallery",
                                security: ione3Gallery.ione3_gallery_nonce,
                                gallery_url: a.galleryNext
                            }
                        }).done(function(e) {
                            var t = p(e)
                              , i = t.find(".ione-gallery__slideshow")
                              , o = (t.find(".ione-gallery-inner"),
                            i.data("title"))
                              , s = a.baseURL + "playlist/" + a.slugify(o)
                              , n = i.data("gallery-id");
                            history.pushState ? history.pushState(null, null, s) : location.href = s,
                            "media_playlist" === a.galleryType ? h.ga("set", "contentGroup3", a.galleryType) : h.ga("set", "contentGroup3", "embedded_gallery"),
                            h.ga("send", "pageview", {
                                page: s,
                                title: o
                            }),
                            h.ga("global.send", "pageview", {
                                page: s,
                                title: o
                            }),
                            ione3.doComscore(),
                            "object" == typeof comscore && p.ajax(h.comscore.pv + "?" + parseInt(1e13 * Math.random())),
                            h._tfa && h._tfa.push({
                                notify: "action",
                                name: "gallery_view"
                            }),
                            a.$galleryWrap.after(t),
                            a.$galleryWrap.remove(),
                            t.ione3gallery({
                                open: !0,
                                baseID: n,
                                onInit: function() {
                                    addthis.init()
                                }
                            })
                        }).fail(function() {}).always(function() {})
                    })
                })
            }
        }
    },
    p.extend(p.fn, {
        ione3gallery: function(e) {
            return this.each(function() {
                p.data(this, "ione3_gallery") || p.data(this, "ione3_gallery", new t(this,e))
            })
        }
    }),
    p(document).on("ready", function() {
        p(".ione-gallery").ione3gallery()
    })
}(this, jQuery),
function(k, T, e) {
    "use strict";
    T(document).ready(function() {
        var h, f, g = !1, c = 0, p = [], y = T(document.getElementById("footer")), m = T(".post-super-wrapper").eq(0), v = T(document.getElementById("infinite-scroll-container")), w = T(document.getElementById("ione3-wallpaper"));
        function b(e) {
            return e = (e = e.map(function(e) {
                return JSON.stringify(e).replace(/"/g, "")
            })).join(",")
        }
        m.length && "post" === ione3Scroll.post_type && ione3Scroll.activated && ione3Scroll.is_single && (f = setInterval(function() {
            g ? (y.siblings(".sailthru-signup-widget").css("visibility", "hidden"),
            y.css("visibility", "hidden").addClass("loading-footer")) : (y.siblings(".sailthru-signup-widget").css("visibility", "visible"),
            y.css("visibility", "visible").removeClass("loading-footer"))
        }, 50),
        T(k).on("scroll", _.throttle(function() {
            var e, t, i, u, o, s = T(k).scrollTop(), n = T(k).height(), a = T("#footer").offset().top - 2 * n, r = m.outerHeight(!0), l = m.data("permalink"), d = m.data("title");
            m.hasClass("has-wallpaper-ad") && (h = !0),
            a <= s && !1 === g && (p.length < 5 ? (g = !0,
            i = (t = T(".post-super-wrapper").eq(p.length)).data("id"),
            u = t.offset().top + t.outerHeight(!0),
            -1 === T.inArray(i, p) && p.push(i),
            o = ione3Scroll.sis_api_url,
            T.ajax({
                type: "GET",
                url: o,
                dataType: "json",
                data: {
                    exclude: p,
                    postid: i
                },
                success: function(e) {
                    var t, i, o, s, n, c, a, r, l, p = 0;
                    (t = e.html) && "0" !== t ? (googletag.pubads().updateCorrelator(),
                    s = (o = T.parseHTML(t, document, !0))[0],
                    n = o[4],
                    c = T(s),
                    a = T(n),
                    r = c.data("permalink"),
                    l = c.data("id"),
                    c.data("title"),
                    v.append(o),
                    T(document).trigger("infinite-scroll-render-" + l),
                    !0 === h && c.addClass("has-wallpaper-ad"),
                    i = function() {
                        var e;
                        "undefined" != typeof instgrm && instgrm.Embeds && instgrm.Embeds.process ? instgrm.Embeds.process() : ((e = document.createElement("script")).async = !0,
                        e.defer = !0,
                        e.src = "//platform.instagram.com/en_US/embeds.js",
                        document.getElementsByTagName("body")[0].appendChild(e))
                    }
                    ,
                    "undefined" != typeof jQuery && "undefined" != typeof infiniteScroll && jQuery(document.body).on("post-load", i),
                    i(),
                    T(".ione-gallery", c).ione3gallery({
                        baseURL: r,
                        baseID: l
                    }),
                    T(".ione-listicle", c).ione3listicle({
                        baseURL: r
                    }),
                    c.fitVids({
                        customSelector: 'iframe[src*="//d.yimg.com"],iframe[src*="//www.dailymotion.com"],object[data*="//cdnapi.kaltura.com"],iframe[src*="//player.theplatform.com"]'
                    }),
                    _.isUndefined(k.FB) || FB.XFBML.parse(),
                    a.find('div[data-mode="organic-thumbnails-f"]').each(function() {
                        var e = T(this)
                          , t = e.data("mode")
                          , i = e.data("container")
                          , o = e.data("placement")
                          , s = e.data("target_type");
                        e.data("fired") || (k._taboola.push({
                            mode: t,
                            container: i,
                            placement: o,
                            target_type: s
                        }),
                        e.data("fired", !0))
                    }),
                    void 0 !== k.OBR && k.OBR.length && k.OBR.extern.researchWidget(),
                    T(k).on("scroll", _.debounce(function() {
                        var e, t = c, i = t.outerHeight(!0), o = T(k).scrollTop(), s = t.data("categories"), n = t.data("tags"), a = t.data("posttype"), r = t.data("author"), l = t.data("permalink"), d = t.data("title");
                        e = p < o ? t.offset().top + i : t.offset().top + i / 2,
                        u <= (p = o) && o < e && k.location.href !== l && (T(document).trigger("posts-loaded"),
                        k.document.title = d,
                        history.pushState ? history.pushState(null, d, l) : k.location.href = l,
                        l = l.replace(/(https?:\/\/|\/\/)[^\/]+/i, ""),
                        s = b(s),
                        n = b(n),
                        ione3.sendGAPageviewData(s, a, n, r, l, d),
                        ione3.sendGAEvent("infinite-scroll", "scroll", l),
                        ione3.doComscore(),
                        "object" == typeof comscore && T.ajax(k.comscore.pv + "?" + parseInt(1e13 * Math.random())),
                        T(document).trigger("redisplay-mobile-anchor-unit"),
                        k.addthis.update("share", "url", l),
                        k.addthis.update("share", "title", d),
                        k.addthis.layers.refresh(),
                        w.hide(),
                        T(".widget_ione-taboola", t).each(function() {
                            var e = T(this).find("> div")
                              , t = e.data("mode")
                              , i = e.data("container")
                              , o = e.data("placement")
                              , s = e.data("target_type");
                            e.data("fired") || (k._taboola.push({
                                mode: t,
                                container: i,
                                placement: o,
                                target_type: s
                            }),
                            e.data("fired", !0))
                        }),
                        T(".ad-single-side", t).find(".taboola").each(function() {
                            var e = T(this).find("> div")
                              , t = e.data("mode")
                              , i = e.data("container")
                              , o = e.data("placement")
                              , s = e.data("target_type");
                            e.data("fired") || (k._taboola.push({
                                mode: t,
                                container: i,
                                placement: o,
                                target_type: s
                            }),
                            e.data("fired", !0))
                        }),
                        k._taboola.push({
                            article: "auto",
                            url: l
                        }),
                        k._taboola.push({
                            flush: !0
                        }))
                    }, 150)),
                    g = !1) : (g = !0,
                    clearInterval(f),
                    y.siblings(".sailthru-signup-widget").css("visibility", "visible"),
                    y.css("visibility", "visible").removeClass("loading-footer"))
                }
            })) : (clearInterval(f),
            y.siblings(".sailthru-signup-widget").css("visibility", "visible"),
            y.css("visibility", "visible").removeClass("loading-footer"))),
            e = c < s ? m.offset().top + r : m.offset().top + r / 2,
            (c = s) < e && k.location.href !== l && (k.document.title = d,
            history.pushState ? history.pushState(null, d, l) : location.hash = l,
            l = l.replace(/(https?:\/\/|\/\/)[^\/]+/i, ""),
            T(document).trigger("redisplay-mobile-anchor-unit"),
            k.addthis.update("share", "url", l),
            k.addthis.update("share", "title", d),
            k.addthis.layers.refresh(),
            w.show())
        }, 250)))
    })
}(this, jQuery),
function(t, i, e) {
    "use strict";
    function o(e) {
        var t = i("#header, .io-header");
        this.stickyContainer = i(e),
        this.stickyWidgets = i(".third-ad, .ione-sticky-widget"),
        t.length && (this.offsetTop = t.offset().top + t.outerHeight() + 20),
        this.stickAds()
    }
    o.prototype = {
        offsetTop: 0,
        stickAds: function() {
            this.stickyWidgets.hcSticky({
                stickTo: this.stickyContainer,
                top: this.offsetTop,
                followScroll: !1,
                offResolutions: [-1024]
            }),
            i(document).trigger("ione-sticky-widgets-loaded")
        },
        updateOffset: function() {
            this.stickyWidgets.hcSticky({
                top: this.offsetTop + this.getVeOffset()
            })
        },
        getVeOffset: function() {
            var e = i("#player-wrapper")
              , t = 0;
            return 0 === e.length ? 0 : (e.hasClass("sticky") && (t = e.outerHeight()),
            t)
        }
    },
    i(document).ready(function() {
        var e = new o(".post-wrapper-content, .container-with-sidebar-wrapper");
        i(t).on("scroll", _.throttle(function() {
            e.updateOffset()
        }, 500))
    })
}(this, jQuery),
function(e, o, t) {
    "use strict";
    o(document).on("click", ".ione-tab__tabs li a", function(e) {
        e.preventDefault();
        var t = o(e.currentTarget)
          , i = o(t.attr("href"));
        t.parent("li").addClass("-active").siblings("li").removeClass("-active"),
        t.parent("li").attr("aria-active", !0).siblings("li").attr("aria-active", !1),
        i.fadeIn().siblings().hide(),
        i.attr("aria-hidden", !1).siblings().attr("aria-hidden", !0)
    })
}(0, jQuery),
function(e, n, t) {
    "use strict";
    n(document).on("click", ".ione-toggle__trigger", function(e) {
        e.preventDefault();
        var t = n(e.currentTarget).closest(".ione-toggle")
          , i = t.data("class") + " ione-toggle__expanded" || "ione-toggle__expanded"
          , o = t.find(".ione-toggle__content");
        o.slideToggle(200, function() {
            o.is(":visible") ? o.attr("aria-hidden", "false") : o.attr("aria-hidden", "true"),
            t.toggleClass(i)
        })
    }),
    n(document).on("click", ".ione-toggle-triggerlink", function(e) {
        e.preventDefault();
        var t = n(e.currentTarget).data("name")
          , i = n('.ione-toggle[data-name="' + t + '"]')
          , o = i.find(".ione-toggle__content")
          , s = i.data("class") + " ione-toggle__expanded" || "ione-toggle__expanded";
        i.length && (n("html, body").animate({
            scrollTop: i.offset().top - n("#header").outerHeight() - 50
        }, 500),
        o.not(":visible") && o.slideDown(200, function() {
            i.addClass(s),
            o.attr("aria-hidden", "false")
        }))
    })
}(0, jQuery),
function(e, r, t) {
    "use strict";
    var i, o, s = r(".top-slider"), n = r(".newsone-top-slider"), a = r(".video-slider"), l = r(".contributor-slider"), d = r(".photos-slider"), c = r(".quote-slider"), p = r(".superfeature-slider"), u = r(".superfeature-slider-2col"), h = r(".lead-slider"), f = r(".lead-slider-thumbs"), g = r(".smooth-slider"), y = function() {
        ione3.largerThan("phone-wide") || r("body").hasClass("single") || r("body").hasClass("is-cassius") ? s.hasClass("slick-initialized") || (r("body").hasClass("single") ? o = i = 3 : (i = 5,
        o = 4),
        s.slick({
            prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
            nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
            lazyLoad: "ondemand",
            slidesToShow: i,
            slidesToScroll: i,
            responsive: [{
                breakpoint: 1440,
                settings: {
                    slidesToShow: o,
                    slidesToScroll: o
                }
            }, {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            }, {
                breakpoint: 1e3,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            }, {
                breakpoint: 500,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    adaptiveHeight: !0
                }
            }]
        })) : r("body").hasClass("single") || s.hasClass("slick-initialized") && s.slick("unslick")
    };
    y(),
    r(e).on("resize", function() {
        y()
    }),
    n.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        lazyLoad: "ondemand",
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [{
            breakpoint: 1200,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 769,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    }),
    a.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        lazyLoad: "ondemand",
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [{
            breakpoint: 769,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 576,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                adaptiveHeight: !0
            }
        }]
    });
    var m = function() {
        return r("body").hasClass("is-cassius") ? 4 : l.hasClass("contributor-layout-square") ? 3 : 4
    };
    l.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        lazyLoad: "ondemand",
        slidesToShow: m(),
        slidesToScroll: m(),
        responsive: [{
            breakpoint: 1025,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }, {
            breakpoint: 769,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 576,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    }),
    d.parents(".container-with-sidebar-wrapper").length ? d.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        lazyLoad: "ondemand",
        centerMode: !0,
        centerPadding: "150px",
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [{
            breakpoint: 1024,
            settings: {
                centerPadding: "80px"
            }
        }, {
            breakpoint: 480,
            settings: {
                centerPadding: "60px"
            }
        }]
    }) : d.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        lazyLoad: "ondemand",
        centerMode: !0,
        centerPadding: "300px",
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [{
            breakpoint: 1024,
            settings: {
                centerPadding: "100px"
            }
        }, {
            breakpoint: 480,
            settings: {
                centerPadding: "60px"
            }
        }]
    }),
    c.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        slidesToShow: 3,
        lazyLoad: "ondemand",
        slidesToScroll: 3,
        adaptiveHeight: !0,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    }),
    p.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: !1
    }),
    u.on("init", function(e) {
        u.addClass("after-init")
    }),
    u.slick({
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>',
        slidesToShow: 1,
        centerMode: !0,
        centerPadding: "40px",
        speed: 1,
        dots: !0,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                centerMode: !1
            }
        }]
    }),
    h.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: !0,
        autoplaySpeed: 4e3,
        fade: !0,
        pauseOnHover: !0,
        adaptiveHeight: !0,
        asNavFor: ".lead-slider-thumbs",
        prevArrow: '<i class="icon-arrow-left _arrows -left"></i>',
        nextArrow: '<i class="icon-arrow-right _arrows -right"></i>'
    });
    var v = f.find("> div").length;
    f.slick({
        asNavFor: ".lead-slider",
        slidesToShow: v,
        arrows: !1,
        focusOnSelect: !0
    }),
    g.each(function() {
        var e, t = r(this).find(".pn-Advancer_Left"), i = r(this).find(".pn-Advancer_Right"), o = r(this).find(".smooth-slider-content-wrapper"), s = o.get(0).scrollWidth - r(this).width(), n = !!("ontouchstart"in document.documentElement), a = function() {
            var e = o.scrollLeft();
            0 === e && t.fadeOut(200),
            s === e && i.fadeOut(200),
            t.is(":visible") || t.fadeIn(200),
            i.is(":visible") || i.fadeIn(200)
        };
        n || (a(),
        o.scroll(_.debounce(function() {
            requestAnimationFrame(a)
        }, 50)),
        i.hover(function() {
            e = setInterval(function() {
                o.animate({
                    scrollLeft: "+=50"
                }, 100)
            }, 100)
        }, function() {
            clearInterval(e)
        }),
        t.hover(function() {
            e = setInterval(function() {
                o.animate({
                    scrollLeft: "-=50"
                }, 100)
            }, 100)
        }, function() {
            clearInterval(e)
        }))
    }),
    r(".icon-arrow-left", s).on("click", function(e) {
        ione3.sendGAEvent("left", "click", "SDC")
    }),
    r(".icon-arrow-right", s).on("click", function(e) {
        ione3.sendGAEvent("right", "click", "SDC")
    }),
    r(".icon-arrow-left", a).on("click", function(e) {
        ione3.sendGAEvent("left", "click", "video-widget")
    }),
    r(".icon-arrow-right", a).on("click", function(e) {
        ione3.sendGAEvent("right", "click", "video-widget")
    }),
    r(".icon-arrow-left", l).on("click", function(e) {
        ione3.sendGAEvent("left", "click", "contributor slider item")
    }),
    r(".icon-arrow-right", l).on("click", function(e) {
        ione3.sendGAEvent("right", "click", "contributor slider item")
    }),
    r(".icon-arrow-left", p).on("click", function(e) {
        ione3.sendGAEvent("left", "click", "superfeature slider")
    }),
    r(".icon-arrow-right", p).on("click", function(e) {
        ione3.sendGAEvent("right", "click", "superfeature slider")
    }),
    r(".icon-arrow-left", d).on("click", function(e) {
        ione3.sendGAEvent("left", "click", "ione generic flex photos")
    }),
    r(".icon-arrow-right", d).on("click", function(e) {
        ione3.sendGAEvent("right", "click", "ione generic flex photos")
    }),
    r(".icon-arrow-left", h).on("click", function(e) {
        ione3.sendGAEvent("left", "click", "dynamic lead slider")
    }),
    r(".icon-arrow-right", h).on("click", function(e) {
        ione3.sendGAEvent("right", "click", "dynamic lead slider")
    })
}(this, jQuery),
function(t) {
    "use strict";
    var i = "Default";
    "undefined" != typeof iOneSocialMenu && void 0 !== iOneSocialMenu.category && (i = iOneSocialMenu.category),
    t(".social-menu .menu-item a").each(function() {
        t(this).attr("target", "_blank")
    }).on("click", function() {
        var e;
        e = t(this).parents(".social-menu-footer").length ? "Footer" : i,
        "function" == typeof ione3.sendGAEvent && ione3.sendGAEvent("Follow", t(this).text(), e)
    })
}(jQuery),
function(e, t, i) {
    "use strict";
    var o, s = jQuery(document.getElementById("trending-widget"));
    s.on("mouseenter", function() {
        o = setTimeout(function() {
            s.addClass("trending-widget--expanded")
        }, 300)
    }).on("mouseleave", function() {
        clearTimeout(o),
        s.removeClass("trending-widget--expanded")
    })
}(),
function(p, u, e) {
    "use strict";
    var t = u("#video-grid")
      , h = u("#main-video-player")
      , f = u("#video-title")
      , g = u("#video-timestamp")
      , y = u("#video-excerpt")
      , m = u("#addthis-placeholder")
      , r = u("#video-load-more")
      , v = u("#video-full-post")
      , w = u("#ad-footer")
      , b = u("#ad-footer2")
      , k = u("#ad-sidebar1")
      , l = !1;
    t.on("click", "a.post-link", function(e) {
        e.preventDefault();
        var t = u(this)
          , i = t.prop("href")
          , o = t.data("url")
          , s = t.data("excerpt")
          , n = t.find(".post-meta__title").text()
          , a = t.find(".timestamp").text()
          , r = u("<div></div>", {
            class: "addthis_jumbo_share",
            id: "addthis_jumbo_share",
            "data-url": i,
            "data-title": n
        })
          , l = t.data("post-url")
          , d = u("<a>", {
            text: "View full post",
            href: l,
            id: "video-full-post",
            class: "view-more"
        })
          , c = u("<a>", {
            text: n,
            href: l
        });
        h.attr("src", o),
        f.empty().append(c),
        y.text(s),
        y.append(d),
        g.text(a),
        v.attr("href", l),
        m.empty().append(r),
        "undefined" != typeof addthis && addthis.layers.refresh(),
        u("html, body").animate({
            scrollTop: h.offset().top - 112
        }, 1e3),
        history.pushState(null, n, i),
        document.title = n,
        ione3.sendGAPageviewData(ione_tag_manager.ga.categories, "post", "", "", i, n),
        ione3.doComscore(),
        "object" == typeof comscore && u.ajax(p.comscore.pv + "?" + parseInt(1e13 * Math.random())),
        googletag.pubads().refresh([renderedGptSlots["div-gpt-" + w.data("adId")], renderedGptSlots["div-gpt-" + b.data("adId")], renderedGptSlots["div-gpt-" + k.data("adId")]])
    }),
    r.on("click", function(e) {
        if (!0 === l)
            return !1;
        var t = ione_video_grid_settings.ajax_url
          , i = r.attr("data-next-page")
          , o = ione_video_grid_settings.categoryid
          , s = ione_video_grid_settings.max_pages
          , n = Number(i) + 1
          , a = {
            action: "load_more_video_hub",
            category: o,
            security: ione_video_grid_settings.security,
            next_page: i
        };
        return l = !0,
        u.ajax({
            type: "GET",
            url: t,
            xhrFields: {
                withCredentials: !0
            },
            data: a,
            success: function(e) {
                e.data && r ? (u(e.data).insertBefore(r),
                l = !1,
                s < n ? r.hide() : r.attr("data-next-page", n)) : r.hide()
            }
        }),
        !1
    })
}(this, jQuery);
;/*! This file is auto-generated */
!function(n) {
    var s = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global;
    if ("function" == typeof define && define.amd)
        define(["underscore", "jquery", "exports"], function(t, e, i) {
            s.Backbone = n(s, i, t, e)
        });
    else if ("undefined" != typeof exports) {
        var t, e = require("underscore");
        try {
            t = require("jquery")
        } catch (t) {}
        n(s, exports, e, t)
    } else
        s.Backbone = n(s, {}, s._, s.jQuery || s.Zepto || s.ender || s.$)
}(function(t, h, x, e) {
    var i = t.Backbone
      , o = Array.prototype.slice;
    h.VERSION = "1.4.0",
    h.$ = e,
    h.noConflict = function() {
        return t.Backbone = i,
        this
    }
    ,
    h.emulateHTTP = !1,
    h.emulateJSON = !1;
    var a, n = h.Events = {}, u = /\s+/, l = function(t, e, i, n, s) {
        var r, o = 0;
        if (i && "object" == typeof i) {
            void 0 !== n && "context"in s && void 0 === s.context && (s.context = n);
            for (r = x.keys(i); o < r.length; o++)
                e = l(t, e, r[o], i[r[o]], s)
        } else if (i && u.test(i))
            for (r = i.split(u); o < r.length; o++)
                e = t(e, r[o], n, s);
        else
            e = t(e, i, n, s);
        return e
    };
    n.on = function(t, e, i) {
        this._events = l(s, this._events || {}, t, e, {
            context: i,
            ctx: this,
            listening: a
        }),
        a && (((this._listeners || (this._listeners = {}))[a.id] = a).interop = !1);
        return this
    }
    ,
    n.listenTo = function(t, e, i) {
        if (!t)
            return this;
        var n = t._listenId || (t._listenId = x.uniqueId("l"))
          , s = this._listeningTo || (this._listeningTo = {})
          , r = a = s[n];
        r || (this._listenId || (this._listenId = x.uniqueId("l")),
        r = a = s[n] = new g(this,t));
        var o = c(t, e, i, this);
        if (a = void 0,
        o)
            throw o;
        return r.interop && r.on(e, i),
        this
    }
    ;
    var s = function(t, e, i, n) {
        if (i) {
            var s = t[e] || (t[e] = [])
              , r = n.context
              , o = n.ctx
              , a = n.listening;
            a && a.count++,
            s.push({
                callback: i,
                context: r,
                ctx: r || o,
                listening: a
            })
        }
        return t
    }
      , c = function(t, e, i, n) {
        try {
            t.on(e, i, n)
        } catch (t) {
            return t
        }
    };
    n.off = function(t, e, i) {
        return this._events && (this._events = l(r, this._events, t, e, {
            context: i,
            listeners: this._listeners
        })),
        this
    }
    ,
    n.stopListening = function(t, e, i) {
        var n = this._listeningTo;
        if (!n)
            return this;
        for (var s = t ? [t._listenId] : x.keys(n), r = 0; r < s.length; r++) {
            var o = n[s[r]];
            if (!o)
                break;
            o.obj.off(e, i, this),
            o.interop && o.off(e, i)
        }
        return x.isEmpty(n) && (this._listeningTo = void 0),
        this
    }
    ;
    var r = function(t, e, i, n) {
        if (t) {
            var s, r = n.context, o = n.listeners, a = 0;
            if (e || r || i) {
                for (s = e ? [e] : x.keys(t); a < s.length; a++) {
                    var h = t[e = s[a]];
                    if (!h)
                        break;
                    for (var u = [], l = 0; l < h.length; l++) {
                        var c = h[l];
                        if (i && i !== c.callback && i !== c.callback._callback || r && r !== c.context)
                            u.push(c);
                        else {
                            var d = c.listening;
                            d && d.off(e, i)
                        }
                    }
                    u.length ? t[e] = u : delete t[e]
                }
                return t
            }
            for (s = x.keys(o); a < s.length; a++)
                o[s[a]].cleanup()
        }
    };
    n.once = function(t, e, i) {
        var n = l(d, {}, t, e, this.off.bind(this));
        return "string" == typeof t && null == i && (e = void 0),
        this.on(n, e, i)
    }
    ,
    n.listenToOnce = function(t, e, i) {
        var n = l(d, {}, e, i, this.stopListening.bind(this, t));
        return this.listenTo(t, n)
    }
    ;
    var d = function(t, e, i, n) {
        if (i) {
            var s = t[e] = x.once(function() {
                n(e, s),
                i.apply(this, arguments)
            });
            s._callback = i
        }
        return t
    };
    n.trigger = function(t) {
        if (!this._events)
            return this;
        for (var e = Math.max(0, arguments.length - 1), i = Array(e), n = 0; n < e; n++)
            i[n] = arguments[n + 1];
        return l(f, this._events, t, void 0, i),
        this
    }
    ;
    var f = function(t, e, i, n) {
        if (t) {
            var s = t[e]
              , r = t.all;
            s && r && (r = r.slice()),
            s && p(s, n),
            r && p(r, [e].concat(n))
        }
        return t
    }
      , p = function(t, e) {
        var i, n = -1, s = t.length, r = e[0], o = e[1], a = e[2];
        switch (e.length) {
        case 0:
            for (; ++n < s; )
                (i = t[n]).callback.call(i.ctx);
            return;
        case 1:
            for (; ++n < s; )
                (i = t[n]).callback.call(i.ctx, r);
            return;
        case 2:
            for (; ++n < s; )
                (i = t[n]).callback.call(i.ctx, r, o);
            return;
        case 3:
            for (; ++n < s; )
                (i = t[n]).callback.call(i.ctx, r, o, a);
            return;
        default:
            for (; ++n < s; )
                (i = t[n]).callback.apply(i.ctx, e);
            return
        }
    }
      , g = function(t, e) {
        this.id = t._listenId,
        this.listener = t,
        this.obj = e,
        this.interop = !0,
        this.count = 0,
        this._events = void 0
    };
    g.prototype.on = n.on,
    g.prototype.off = function(t, e) {
        (this.interop ? (this._events = l(r, this._events, t, e, {
            context: void 0,
            listeners: void 0
        }),
        this._events) : (this.count--,
        0 !== this.count)) || this.cleanup()
    }
    ,
    g.prototype.cleanup = function() {
        delete this.listener._listeningTo[this.obj._listenId],
        this.interop || delete this.obj._listeners[this.id]
    }
    ,
    n.bind = n.on,
    n.unbind = n.off,
    x.extend(h, n);
    var v = h.Model = function(t, e) {
        var i = t || {};
        e = e || {},
        this.preinitialize.apply(this, arguments),
        this.cid = x.uniqueId(this.cidPrefix),
        this.attributes = {},
        e.collection && (this.collection = e.collection),
        e.parse && (i = this.parse(i, e) || {});
        var n = x.result(this, "defaults");
        i = x.defaults(x.extend({}, n, i), n),
        this.set(i, e),
        this.changed = {},
        this.initialize.apply(this, arguments)
    }
    ;
    x.extend(v.prototype, n, {
        changed: null,
        validationError: null,
        idAttribute: "id",
        cidPrefix: "c",
        preinitialize: function() {},
        initialize: function() {},
        toJSON: function(t) {
            return x.clone(this.attributes)
        },
        sync: function() {
            return h.sync.apply(this, arguments)
        },
        get: function(t) {
            return this.attributes[t]
        },
        escape: function(t) {
            return x.escape(this.get(t))
        },
        has: function(t) {
            return null != this.get(t)
        },
        matches: function(t) {
            return !!x.iteratee(t, this)(this.attributes)
        },
        set: function(t, e, i) {
            if (null == t)
                return this;
            var n;
            if ("object" == typeof t ? (n = t,
            i = e) : (n = {})[t] = e,
            i = i || {},
            !this._validate(n, i))
                return !1;
            var s = i.unset
              , r = i.silent
              , o = []
              , a = this._changing;
            this._changing = !0,
            a || (this._previousAttributes = x.clone(this.attributes),
            this.changed = {});
            var h = this.attributes
              , u = this.changed
              , l = this._previousAttributes;
            for (var c in n)
                e = n[c],
                x.isEqual(h[c], e) || o.push(c),
                x.isEqual(l[c], e) ? delete u[c] : u[c] = e,
                s ? delete h[c] : h[c] = e;
            if (this.idAttribute in n && (this.id = this.get(this.idAttribute)),
            !r) {
                o.length && (this._pending = i);
                for (var d = 0; d < o.length; d++)
                    this.trigger("change:" + o[d], this, h[o[d]], i)
            }
            if (a)
                return this;
            if (!r)
                for (; this._pending; )
                    i = this._pending,
                    this._pending = !1,
                    this.trigger("change", this, i);
            return this._pending = !1,
            this._changing = !1,
            this
        },
        unset: function(t, e) {
            return this.set(t, void 0, x.extend({}, e, {
                unset: !0
            }))
        },
        clear: function(t) {
            var e = {};
            for (var i in this.attributes)
                e[i] = void 0;
            return this.set(e, x.extend({}, t, {
                unset: !0
            }))
        },
        hasChanged: function(t) {
            return null == t ? !x.isEmpty(this.changed) : x.has(this.changed, t)
        },
        changedAttributes: function(t) {
            if (!t)
                return !!this.hasChanged() && x.clone(this.changed);
            var e, i = this._changing ? this._previousAttributes : this.attributes, n = {};
            for (var s in t) {
                var r = t[s];
                x.isEqual(i[s], r) || (n[s] = r,
                e = !0)
            }
            return !!e && n
        },
        previous: function(t) {
            return null != t && this._previousAttributes ? this._previousAttributes[t] : null
        },
        previousAttributes: function() {
            return x.clone(this._previousAttributes)
        },
        fetch: function(i) {
            i = x.extend({
                parse: !0
            }, i);
            var n = this
              , s = i.success;
            return i.success = function(t) {
                var e = i.parse ? n.parse(t, i) : t;
                if (!n.set(e, i))
                    return !1;
                s && s.call(i.context, n, t, i),
                n.trigger("sync", n, t, i)
            }
            ,
            L(this, i),
            this.sync("read", this, i)
        },
        save: function(t, e, i) {
            var n;
            null == t || "object" == typeof t ? (n = t,
            i = e) : (n = {})[t] = e;
            var s = (i = x.extend({
                validate: !0,
                parse: !0
            }, i)).wait;
            if (n && !s) {
                if (!this.set(n, i))
                    return !1
            } else if (!this._validate(n, i))
                return !1;
            var r = this
              , o = i.success
              , a = this.attributes;
            i.success = function(t) {
                r.attributes = a;
                var e = i.parse ? r.parse(t, i) : t;
                if (s && (e = x.extend({}, n, e)),
                e && !r.set(e, i))
                    return !1;
                o && o.call(i.context, r, t, i),
                r.trigger("sync", r, t, i)
            }
            ,
            L(this, i),
            n && s && (this.attributes = x.extend({}, a, n));
            var h = this.isNew() ? "create" : i.patch ? "patch" : "update";
            "patch" != h || i.attrs || (i.attrs = n);
            var u = this.sync(h, this, i);
            return this.attributes = a,
            u
        },
        destroy: function(e) {
            e = e ? x.clone(e) : {};
            function i() {
                n.stopListening(),
                n.trigger("destroy", n, n.collection, e)
            }
            var n = this
              , s = e.success
              , r = e.wait
              , t = !(e.success = function(t) {
                r && i(),
                s && s.call(e.context, n, t, e),
                n.isNew() || n.trigger("sync", n, t, e)
            }
            );
            return this.isNew() ? x.defer(e.success) : (L(this, e),
            t = this.sync("delete", this, e)),
            r || i(),
            t
        },
        url: function() {
            var t = x.result(this, "urlRoot") || x.result(this.collection, "url") || J();
            if (this.isNew())
                return t;
            var e = this.get(this.idAttribute);
            return t.replace(/[^\/]$/, "$&/") + encodeURIComponent(e)
        },
        parse: function(t, e) {
            return t
        },
        clone: function() {
            return new this.constructor(this.attributes)
        },
        isNew: function() {
            return !this.has(this.idAttribute)
        },
        isValid: function(t) {
            return this._validate({}, x.extend({}, t, {
                validate: !0
            }))
        },
        _validate: function(t, e) {
            if (!e.validate || !this.validate)
                return !0;
            t = x.extend({}, this.attributes, t);
            var i = this.validationError = this.validate(t, e) || null;
            return !i || (this.trigger("invalid", this, i, x.extend(e, {
                validationError: i
            })),
            !1)
        }
    });
    function w(t, e, i) {
        i = Math.min(Math.max(i, 0), t.length);
        var n, s = Array(t.length - i), r = e.length;
        for (n = 0; n < s.length; n++)
            s[n] = t[n + i];
        for (n = 0; n < r; n++)
            t[n + i] = e[n];
        for (n = 0; n < s.length; n++)
            t[n + r + i] = s[n]
    }
    var m = h.Collection = function(t, e) {
        e = e || {},
        this.preinitialize.apply(this, arguments),
        e.model && (this.model = e.model),
        void 0 !== e.comparator && (this.comparator = e.comparator),
        this._reset(),
        this.initialize.apply(this, arguments),
        t && this.reset(t, x.extend({
            silent: !0
        }, e))
    }
      , E = {
        add: !0,
        remove: !0,
        merge: !0
    }
      , _ = {
        add: !0,
        remove: !1
    };
    x.extend(m.prototype, n, {
        model: v,
        preinitialize: function() {},
        initialize: function() {},
        toJSON: function(e) {
            return this.map(function(t) {
                return t.toJSON(e)
            })
        },
        sync: function() {
            return h.sync.apply(this, arguments)
        },
        add: function(t, e) {
            return this.set(t, x.extend({
                merge: !1
            }, e, _))
        },
        remove: function(t, e) {
            e = x.extend({}, e);
            var i = !x.isArray(t);
            t = i ? [t] : t.slice();
            var n = this._removeModels(t, e);
            return !e.silent && n.length && (e.changes = {
                added: [],
                merged: [],
                removed: n
            },
            this.trigger("update", this, e)),
            i ? n[0] : n
        },
        set: function(t, e) {
            if (null != t) {
                (e = x.extend({}, E, e)).parse && !this._isModel(t) && (t = this.parse(t, e) || []);
                var i = !x.isArray(t);
                t = i ? [t] : t.slice();
                var n = e.at;
                null != n && (n = +n),
                n > this.length && (n = this.length),
                n < 0 && (n += this.length + 1);
                var s, r, o = [], a = [], h = [], u = [], l = {}, c = e.add, d = e.merge, f = e.remove, p = !1, g = this.comparator && null == n && !1 !== e.sort, v = x.isString(this.comparator) ? this.comparator : null;
                for (r = 0; r < t.length; r++) {
                    s = t[r];
                    var m = this.get(s);
                    if (m) {
                        if (d && s !== m) {
                            var _ = this._isModel(s) ? s.attributes : s;
                            e.parse && (_ = m.parse(_, e)),
                            m.set(_, e),
                            h.push(m),
                            g && !p && (p = m.hasChanged(v))
                        }
                        l[m.cid] || (l[m.cid] = !0,
                        o.push(m)),
                        t[r] = m
                    } else
                        c && (s = t[r] = this._prepareModel(s, e)) && (a.push(s),
                        this._addReference(s, e),
                        l[s.cid] = !0,
                        o.push(s))
                }
                if (f) {
                    for (r = 0; r < this.length; r++)
                        l[(s = this.models[r]).cid] || u.push(s);
                    u.length && this._removeModels(u, e)
                }
                var y = !1
                  , b = !g && c && f;
                if (o.length && b ? (y = this.length !== o.length || x.some(this.models, function(t, e) {
                    return t !== o[e]
                }),
                this.models.length = 0,
                w(this.models, o, 0),
                this.length = this.models.length) : a.length && (g && (p = !0),
                w(this.models, a, null == n ? this.length : n),
                this.length = this.models.length),
                p && this.sort({
                    silent: !0
                }),
                !e.silent) {
                    for (r = 0; r < a.length; r++)
                        null != n && (e.index = n + r),
                        (s = a[r]).trigger("add", s, this, e);
                    (p || y) && this.trigger("sort", this, e),
                    (a.length || u.length || h.length) && (e.changes = {
                        added: a,
                        removed: u,
                        merged: h
                    },
                    this.trigger("update", this, e))
                }
                return i ? t[0] : t
            }
        },
        reset: function(t, e) {
            e = e ? x.clone(e) : {};
            for (var i = 0; i < this.models.length; i++)
                this._removeReference(this.models[i], e);
            return e.previousModels = this.models,
            this._reset(),
            t = this.add(t, x.extend({
                silent: !0
            }, e)),
            e.silent || this.trigger("reset", this, e),
            t
        },
        push: function(t, e) {
            return this.add(t, x.extend({
                at: this.length
            }, e))
        },
        pop: function(t) {
            var e = this.at(this.length - 1);
            return this.remove(e, t)
        },
        unshift: function(t, e) {
            return this.add(t, x.extend({
                at: 0
            }, e))
        },
        shift: function(t) {
            var e = this.at(0);
            return this.remove(e, t)
        },
        slice: function() {
            return o.apply(this.models, arguments)
        },
        get: function(t) {
            if (null != t)
                return this._byId[t] || this._byId[this.modelId(this._isModel(t) ? t.attributes : t)] || t.cid && this._byId[t.cid]
        },
        has: function(t) {
            return null != this.get(t)
        },
        at: function(t) {
            return t < 0 && (t += this.length),
            this.models[t]
        },
        where: function(t, e) {
            return this[e ? "find" : "filter"](t)
        },
        findWhere: function(t) {
            return this.where(t, !0)
        },
        sort: function(t) {
            var e = this.comparator;
            if (!e)
                throw new Error("Cannot sort a set without a comparator");
            t = t || {};
            var i = e.length;
            return x.isFunction(e) && (e = e.bind(this)),
            1 === i || x.isString(e) ? this.models = this.sortBy(e) : this.models.sort(e),
            t.silent || this.trigger("sort", this, t),
            this
        },
        pluck: function(t) {
            return this.map(t + "")
        },
        fetch: function(i) {
            var n = (i = x.extend({
                parse: !0
            }, i)).success
              , s = this;
            return i.success = function(t) {
                var e = i.reset ? "reset" : "set";
                s[e](t, i),
                n && n.call(i.context, s, t, i),
                s.trigger("sync", s, t, i)
            }
            ,
            L(this, i),
            this.sync("read", this, i)
        },
        create: function(t, e) {
            var n = (e = e ? x.clone(e) : {}).wait;
            if (!(t = this._prepareModel(t, e)))
                return !1;
            n || this.add(t, e);
            var s = this
              , r = e.success;
            return e.success = function(t, e, i) {
                n && s.add(t, i),
                r && r.call(i.context, t, e, i)
            }
            ,
            t.save(null, e),
            t
        },
        parse: function(t, e) {
            return t
        },
        clone: function() {
            return new this.constructor(this.models,{
                model: this.model,
                comparator: this.comparator
            })
        },
        modelId: function(t) {
            return t[this.model.prototype.idAttribute || "id"]
        },
        values: function() {
            return new b(this,k)
        },
        keys: function() {
            return new b(this,I)
        },
        entries: function() {
            return new b(this,S)
        },
        _reset: function() {
            this.length = 0,
            this.models = [],
            this._byId = {}
        },
        _prepareModel: function(t, e) {
            if (this._isModel(t))
                return t.collection || (t.collection = this),
                t;
            var i = new (((e = e ? x.clone(e) : {}).collection = this).model)(t,e);
            return i.validationError ? (this.trigger("invalid", this, i.validationError, e),
            !1) : i
        },
        _removeModels: function(t, e) {
            for (var i = [], n = 0; n < t.length; n++) {
                var s = this.get(t[n]);
                if (s) {
                    var r = this.indexOf(s);
                    this.models.splice(r, 1),
                    this.length--,
                    delete this._byId[s.cid];
                    var o = this.modelId(s.attributes);
                    null != o && delete this._byId[o],
                    e.silent || (e.index = r,
                    s.trigger("remove", s, this, e)),
                    i.push(s),
                    this._removeReference(s, e)
                }
            }
            return i
        },
        _isModel: function(t) {
            return t instanceof v
        },
        _addReference: function(t, e) {
            this._byId[t.cid] = t;
            var i = this.modelId(t.attributes);
            null != i && (this._byId[i] = t),
            t.on("all", this._onModelEvent, this)
        },
        _removeReference: function(t, e) {
            delete this._byId[t.cid];
            var i = this.modelId(t.attributes);
            null != i && delete this._byId[i],
            this === t.collection && delete t.collection,
            t.off("all", this._onModelEvent, this)
        },
        _onModelEvent: function(t, e, i, n) {
            if (e) {
                if (("add" === t || "remove" === t) && i !== this)
                    return;
                if ("destroy" === t && this.remove(e, n),
                "change" === t) {
                    var s = this.modelId(e.previousAttributes())
                      , r = this.modelId(e.attributes);
                    s !== r && (null != s && delete this._byId[s],
                    null != r && (this._byId[r] = e))
                }
            }
            this.trigger.apply(this, arguments)
        }
    });
    var y = "function" == typeof Symbol && Symbol.iterator;
    y && (m.prototype[y] = m.prototype.values);
    var b = function(t, e) {
        this._collection = t,
        this._kind = e,
        this._index = 0
    }
      , k = 1
      , I = 2
      , S = 3;
    y && (b.prototype[y] = function() {
        return this
    }
    ),
    b.prototype.next = function() {
        if (this._collection) {
            if (this._index < this._collection.length) {
                var t, e = this._collection.at(this._index);
                if (this._index++,
                this._kind === k)
                    t = e;
                else {
                    var i = this._collection.modelId(e.attributes);
                    t = this._kind === I ? i : [i, e]
                }
                return {
                    value: t,
                    done: !1
                }
            }
            this._collection = void 0
        }
        return {
            value: void 0,
            done: !0
        }
    }
    ;
    var T = h.View = function(t) {
        this.cid = x.uniqueId("view"),
        this.preinitialize.apply(this, arguments),
        x.extend(this, x.pick(t, H)),
        this._ensureElement(),
        this.initialize.apply(this, arguments)
    }
      , P = /^(\S+)\s*(.*)$/
      , H = ["model", "collection", "el", "id", "attributes", "className", "tagName", "events"];
    x.extend(T.prototype, n, {
        tagName: "div",
        $: function(t) {
            return this.$el.find(t)
        },
        preinitialize: function() {},
        initialize: function() {},
        render: function() {
            return this
        },
        remove: function() {
            return this._removeElement(),
            this.stopListening(),
            this
        },
        _removeElement: function() {
            this.$el.remove()
        },
        setElement: function(t) {
            return this.undelegateEvents(),
            this._setElement(t),
            this.delegateEvents(),
            this
        },
        _setElement: function(t) {
            this.$el = t instanceof h.$ ? t : h.$(t),
            this.el = this.$el[0]
        },
        delegateEvents: function(t) {
            if (!(t = t || x.result(this, "events")))
                return this;
            for (var e in this.undelegateEvents(),
            t) {
                var i = t[e];
                if (x.isFunction(i) || (i = this[i]),
                i) {
                    var n = e.match(P);
                    this.delegate(n[1], n[2], i.bind(this))
                }
            }
            return this
        },
        delegate: function(t, e, i) {
            return this.$el.on(t + ".delegateEvents" + this.cid, e, i),
            this
        },
        undelegateEvents: function() {
            return this.$el && this.$el.off(".delegateEvents" + this.cid),
            this
        },
        undelegate: function(t, e, i) {
            return this.$el.off(t + ".delegateEvents" + this.cid, e, i),
            this
        },
        _createElement: function(t) {
            return document.createElement(t)
        },
        _ensureElement: function() {
            if (this.el)
                this.setElement(x.result(this, "el"));
            else {
                var t = x.extend({}, x.result(this, "attributes"));
                this.id && (t.id = x.result(this, "id")),
                this.className && (t.class = x.result(this, "className")),
                this.setElement(this._createElement(x.result(this, "tagName"))),
                this._setAttributes(t)
            }
        },
        _setAttributes: function(t) {
            this.$el.attr(t)
        }
    });
    function $(i, n, t, s) {
        x.each(t, function(t, e) {
            n[e] && (i.prototype[e] = function(n, t, s, r) {
                switch (t) {
                case 1:
                    return function() {
                        return n[s](this[r])
                    }
                    ;
                case 2:
                    return function(t) {
                        return n[s](this[r], t)
                    }
                    ;
                case 3:
                    return function(t, e) {
                        return n[s](this[r], A(t, this), e)
                    }
                    ;
                case 4:
                    return function(t, e, i) {
                        return n[s](this[r], A(t, this), e, i)
                    }
                    ;
                default:
                    return function() {
                        var t = o.call(arguments);
                        return t.unshift(this[r]),
                        n[s].apply(n, t)
                    }
                }
            }(n, t, e, s))
        })
    }
    var A = function(e, t) {
        return x.isFunction(e) ? e : x.isObject(e) && !t._isModel(e) ? C(e) : x.isString(e) ? function(t) {
            return t.get(e)
        }
        : e
    }
      , C = function(t) {
        var e = x.matches(t);
        return function(t) {
            return e(t.attributes)
        }
    };
    x.each([[m, {
        forEach: 3,
        each: 3,
        map: 3,
        collect: 3,
        reduce: 0,
        foldl: 0,
        inject: 0,
        reduceRight: 0,
        foldr: 0,
        find: 3,
        detect: 3,
        filter: 3,
        select: 3,
        reject: 3,
        every: 3,
        all: 3,
        some: 3,
        any: 3,
        include: 3,
        includes: 3,
        contains: 3,
        invoke: 0,
        max: 3,
        min: 3,
        toArray: 1,
        size: 1,
        first: 3,
        head: 3,
        take: 3,
        initial: 3,
        rest: 3,
        tail: 3,
        drop: 3,
        last: 3,
        without: 0,
        difference: 0,
        indexOf: 3,
        shuffle: 1,
        lastIndexOf: 3,
        isEmpty: 1,
        chain: 1,
        sample: 3,
        partition: 3,
        groupBy: 3,
        countBy: 3,
        sortBy: 3,
        indexBy: 3,
        findIndex: 3,
        findLastIndex: 3
    }, "models"], [v, {
        keys: 1,
        values: 1,
        pairs: 1,
        invert: 1,
        pick: 0,
        omit: 0,
        chain: 1,
        isEmpty: 1
    }, "attributes"]], function(t) {
        var i = t[0]
          , e = t[1]
          , n = t[2];
        i.mixin = function(t) {
            var e = x.reduce(x.functions(t), function(t, e) {
                return t[e] = 0,
                t
            }, {});
            $(i, t, e, n)
        }
        ,
        $(i, x, e, n)
    }),
    h.sync = function(t, e, n) {
        var i = R[t];
        x.defaults(n = n || {}, {
            emulateHTTP: h.emulateHTTP,
            emulateJSON: h.emulateJSON
        });
        var s = {
            type: i,
            dataType: "json"
        };
        if (n.url || (s.url = x.result(e, "url") || J()),
        null != n.data || !e || "create" !== t && "update" !== t && "patch" !== t || (s.contentType = "application/json",
        s.data = JSON.stringify(n.attrs || e.toJSON(n))),
        n.emulateJSON && (s.contentType = "application/x-www-form-urlencoded",
        s.data = s.data ? {
            model: s.data
        } : {}),
        n.emulateHTTP && ("PUT" === i || "DELETE" === i || "PATCH" === i)) {
            s.type = "POST",
            n.emulateJSON && (s.data._method = i);
            var r = n.beforeSend;
            n.beforeSend = function(t) {
                if (t.setRequestHeader("X-HTTP-Method-Override", i),
                r)
                    return r.apply(this, arguments)
            }
        }
        "GET" === s.type || n.emulateJSON || (s.processData = !1);
        var o = n.error;
        n.error = function(t, e, i) {
            n.textStatus = e,
            n.errorThrown = i,
            o && o.call(n.context, t, e, i)
        }
        ;
        var a = n.xhr = h.ajax(x.extend(s, n));
        return e.trigger("request", e, a, n),
        a
    }
    ;
    var R = {
        create: "POST",
        update: "PUT",
        patch: "PATCH",
        delete: "DELETE",
        read: "GET"
    };
    h.ajax = function() {
        return h.$.ajax.apply(h.$, arguments)
    }
    ;
    var M = h.Router = function(t) {
        t = t || {},
        this.preinitialize.apply(this, arguments),
        t.routes && (this.routes = t.routes),
        this._bindRoutes(),
        this.initialize.apply(this, arguments)
    }
      , N = /\((.*?)\)/g
      , j = /(\(\?)?:\w+/g
      , O = /\*\w+/g
      , U = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    x.extend(M.prototype, n, {
        preinitialize: function() {},
        initialize: function() {},
        route: function(i, n, s) {
            x.isRegExp(i) || (i = this._routeToRegExp(i)),
            x.isFunction(n) && (s = n,
            n = ""),
            s = s || this[n];
            var r = this;
            return h.history.route(i, function(t) {
                var e = r._extractParameters(i, t);
                !1 !== r.execute(s, e, n) && (r.trigger.apply(r, ["route:" + n].concat(e)),
                r.trigger("route", n, e),
                h.history.trigger("route", r, n, e))
            }),
            this
        },
        execute: function(t, e, i) {
            t && t.apply(this, e)
        },
        navigate: function(t, e) {
            return h.history.navigate(t, e),
            this
        },
        _bindRoutes: function() {
            if (this.routes) {
                this.routes = x.result(this, "routes");
                for (var t, e = x.keys(this.routes); null != (t = e.pop()); )
                    this.route(t, this.routes[t])
            }
        },
        _routeToRegExp: function(t) {
            return t = t.replace(U, "\\$&").replace(N, "(?:$1)?").replace(j, function(t, e) {
                return e ? t : "([^/?]+)"
            }).replace(O, "([^?]*?)"),
            new RegExp("^" + t + "(?:\\?([\\s\\S]*))?$")
        },
        _extractParameters: function(t, e) {
            var i = t.exec(e).slice(1);
            return x.map(i, function(t, e) {
                return e === i.length - 1 ? t || null : t ? decodeURIComponent(t) : null
            })
        }
    });
    var z = h.History = function() {
        this.handlers = [],
        this.checkUrl = this.checkUrl.bind(this),
        "undefined" != typeof window && (this.location = window.location,
        this.history = window.history)
    }
      , q = /^[#\/]|\s+$/g
      , F = /^\/+|\/+$/g
      , B = /#.*$/;
    z.started = !1,
    x.extend(z.prototype, n, {
        interval: 50,
        atRoot: function() {
            return this.location.pathname.replace(/[^\/]$/, "$&/") === this.root && !this.getSearch()
        },
        matchRoot: function() {
            return this.decodeFragment(this.location.pathname).slice(0, this.root.length - 1) + "/" === this.root
        },
        decodeFragment: function(t) {
            return decodeURI(t.replace(/%25/g, "%2525"))
        },
        getSearch: function() {
            var t = this.location.href.replace(/#.*/, "").match(/\?.+/);
            return t ? t[0] : ""
        },
        getHash: function(t) {
            var e = (t || this).location.href.match(/#(.*)$/);
            return e ? e[1] : ""
        },
        getPath: function() {
            var t = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
            return "/" === t.charAt(0) ? t.slice(1) : t
        },
        getFragment: function(t) {
            return null == t && (t = this._usePushState || !this._wantsHashChange ? this.getPath() : this.getHash()),
            t.replace(q, "")
        },
        start: function(t) {
            if (z.started)
                throw new Error("Backbone.history has already been started");
            if (z.started = !0,
            this.options = x.extend({
                root: "/"
            }, this.options, t),
            this.root = this.options.root,
            this._wantsHashChange = !1 !== this.options.hashChange,
            this._hasHashChange = "onhashchange"in window && (void 0 === document.documentMode || 7 < document.documentMode),
            this._useHashChange = this._wantsHashChange && this._hasHashChange,
            this._wantsPushState = !!this.options.pushState,
            this._hasPushState = !(!this.history || !this.history.pushState),
            this._usePushState = this._wantsPushState && this._hasPushState,
            this.fragment = this.getFragment(),
            this.root = ("/" + this.root + "/").replace(F, "/"),
            this._wantsHashChange && this._wantsPushState) {
                if (!this._hasPushState && !this.atRoot()) {
                    var e = this.root.slice(0, -1) || "/";
                    return this.location.replace(e + "#" + this.getPath()),
                    !0
                }
                this._hasPushState && this.atRoot() && this.navigate(this.getHash(), {
                    replace: !0
                })
            }
            if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
                this.iframe = document.createElement("iframe"),
                this.iframe.src = "javascript:0",
                this.iframe.style.display = "none",
                this.iframe.tabIndex = -1;
                var i = document.body
                  , n = i.insertBefore(this.iframe, i.firstChild).contentWindow;
                n.document.open(),
                n.document.close(),
                n.location.hash = "#" + this.fragment
            }
            var s = window.addEventListener || function(t, e) {
                return attachEvent("on" + t, e)
            }
            ;
            if (this._usePushState ? s("popstate", this.checkUrl, !1) : this._useHashChange && !this.iframe ? s("hashchange", this.checkUrl, !1) : this._wantsHashChange && (this._checkUrlInterval = setInterval(this.checkUrl, this.interval)),
            !this.options.silent)
                return this.loadUrl()
        },
        stop: function() {
            var t = window.removeEventListener || function(t, e) {
                return detachEvent("on" + t, e)
            }
            ;
            this._usePushState ? t("popstate", this.checkUrl, !1) : this._useHashChange && !this.iframe && t("hashchange", this.checkUrl, !1),
            this.iframe && (document.body.removeChild(this.iframe),
            this.iframe = null),
            this._checkUrlInterval && clearInterval(this._checkUrlInterval),
            z.started = !1
        },
        route: function(t, e) {
            this.handlers.unshift({
                route: t,
                callback: e
            })
        },
        checkUrl: function(t) {
            var e = this.getFragment();
            if (e === this.fragment && this.iframe && (e = this.getHash(this.iframe.contentWindow)),
            e === this.fragment)
                return !1;
            this.iframe && this.navigate(e),
            this.loadUrl()
        },
        loadUrl: function(e) {
            return !!this.matchRoot() && (e = this.fragment = this.getFragment(e),
            x.some(this.handlers, function(t) {
                if (t.route.test(e))
                    return t.callback(e),
                    !0
            }))
        },
        navigate: function(t, e) {
            if (!z.started)
                return !1;
            e && !0 !== e || (e = {
                trigger: !!e
            }),
            t = this.getFragment(t || "");
            var i = this.root;
            "" !== t && "?" !== t.charAt(0) || (i = i.slice(0, -1) || "/");
            var n = i + t;
            t = t.replace(B, "");
            var s = this.decodeFragment(t);
            if (this.fragment !== s) {
                if (this.fragment = s,
                this._usePushState)
                    this.history[e.replace ? "replaceState" : "pushState"]({}, document.title, n);
                else {
                    if (!this._wantsHashChange)
                        return this.location.assign(n);
                    if (this._updateHash(this.location, t, e.replace),
                    this.iframe && t !== this.getHash(this.iframe.contentWindow)) {
                        var r = this.iframe.contentWindow;
                        e.replace || (r.document.open(),
                        r.document.close()),
                        this._updateHash(r.location, t, e.replace)
                    }
                }
                return e.trigger ? this.loadUrl(t) : void 0
            }
        },
        _updateHash: function(t, e, i) {
            if (i) {
                var n = t.href.replace(/(javascript:|#).*$/, "");
                t.replace(n + "#" + e)
            } else
                t.hash = "#" + e
        }
    }),
    h.history = new z;
    v.extend = m.extend = M.extend = T.extend = z.extend = function(t, e) {
        var i, n = this;
        return i = t && x.has(t, "constructor") ? t.constructor : function() {
            return n.apply(this, arguments)
        }
        ,
        x.extend(i, n, e),
        i.prototype = x.create(n.prototype, t),
        (i.prototype.constructor = i).__super__ = n.prototype,
        i
    }
    ;
    var J = function() {
        throw new Error('A "url" property or function must be specified')
    }
      , L = function(e, i) {
        var n = i.error;
        i.error = function(t) {
            n && n.call(i.context, e, t, i),
            e.trigger("error", e, t, i)
        }
    };
    return h
});
;/*! This file is auto-generated */
window.wp = window.wp || {},
function(i) {
    var e = "undefined" == typeof _wpUtilSettings ? {} : _wpUtilSettings;
    wp.template = _.memoize(function(t) {
        var n, s = {
            evaluate: /<#([\s\S]+?)#>/g,
            interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
            escape: /\{\{([^\}]+?)\}\}(?!\})/g,
            variable: "data"
        };
        return function(e) {
            return (n = n || _.template(i("#tmpl-" + t).html(), s))(e)
        }
    }),
    wp.ajax = {
        settings: e.ajax || {},
        post: function(e, t) {
            return wp.ajax.send({
                data: _.isObject(e) ? e : _.extend(t || {}, {
                    action: e
                })
            })
        },
        send: function(e, n) {
            var t, s;
            return _.isObject(e) ? n = e : (n = n || {}).data = _.extend(n.data || {}, {
                action: e
            }),
            n = _.defaults(n || {}, {
                type: "POST",
                url: wp.ajax.settings.url,
                context: this
            }),
            (t = (s = i.Deferred(function(t) {
                n.success && t.done(n.success),
                n.error && t.fail(n.error),
                delete n.success,
                delete n.error,
                t.jqXHR = i.ajax(n).done(function(e) {
                    "1" !== e && 1 !== e || (e = {
                        success: !0
                    }),
                    _.isObject(e) && !_.isUndefined(e.success) ? t[e.success ? "resolveWith" : "rejectWith"](this, [e.data]) : t.rejectWith(this, [e])
                }).fail(function() {
                    t.rejectWith(this, arguments)
                })
            })).promise()).abort = function() {
                return s.jqXHR.abort(),
                this
            }
            ,
            t
        }
    }
}(jQuery);
;/*! This file is auto-generated */
window.wp = window.wp || {},
function(e) {
    wp.Backbone = {},
    wp.Backbone.Subviews = function(e, t) {
        this.view = e,
        this._views = _.isArray(t) ? {
            "": t
        } : t || {}
    }
    ,
    wp.Backbone.Subviews.extend = Backbone.Model.extend,
    _.extend(wp.Backbone.Subviews.prototype, {
        all: function() {
            return _.flatten(_.values(this._views))
        },
        get: function(e) {
            return e = e || "",
            this._views[e]
        },
        first: function(e) {
            var t = this.get(e);
            return t && t.length ? t[0] : null
        },
        set: function(n, e, t) {
            var i, s;
            return _.isString(n) || (t = e,
            e = n,
            n = ""),
            t = t || {},
            s = e = _.isArray(e) ? e : [e],
            (i = this.get(n)) && (t.add ? _.isUndefined(t.at) ? s = i.concat(e) : (s = i).splice.apply(s, [t.at, 0].concat(e)) : (_.each(s, function(e) {
                e.__detach = !0
            }),
            _.each(i, function(e) {
                e.__detach ? e.$el.detach() : e.remove()
            }),
            _.each(s, function(e) {
                delete e.__detach
            }))),
            this._views[n] = s,
            _.each(e, function(e) {
                var t = e.Views || wp.Backbone.Subviews
                  , i = e.views = e.views || new t(e);
                i.parent = this.view,
                i.selector = n
            }, this),
            t.silent || this._attach(n, e, _.extend({
                ready: this._isReady()
            }, t)),
            this
        },
        add: function(e, t, i) {
            return _.isString(e) || (i = t,
            t = e,
            e = ""),
            this.set(e, t, _.extend({
                add: !0
            }, i))
        },
        unset: function(e, t, i) {
            var n;
            return _.isString(e) || (i = t,
            t = e,
            e = ""),
            t = t || [],
            (n = this.get(e)) && (t = _.isArray(t) ? t : [t],
            this._views[e] = t.length ? _.difference(n, t) : []),
            i && i.silent || _.invoke(t, "remove"),
            this
        },
        detach: function() {
            return e(_.pluck(this.all(), "el")).detach(),
            this
        },
        render: function() {
            var i = {
                ready: this._isReady()
            };
            return _.each(this._views, function(e, t) {
                this._attach(t, e, i)
            }, this),
            this.rendered = !0,
            this
        },
        remove: function(e) {
            return e && e.silent || (this.parent && this.parent.views && this.parent.views.unset(this.selector, this.view, {
                silent: !0
            }),
            delete this.parent,
            delete this.selector),
            _.invoke(this.all(), "remove"),
            this._views = [],
            this
        },
        replace: function(e, t) {
            return e.html(t),
            this
        },
        insert: function(e, t, i) {
            var n, s = i && i.at;
            return _.isNumber(s) && (n = e.children()).length > s ? n.eq(s).before(t) : e.append(t),
            this
        },
        ready: function() {
            this.view.trigger("ready"),
            _.chain(this.all()).map(function(e) {
                return e.views
            }).flatten().where({
                attached: !0
            }).invoke("ready")
        },
        _attach: function(e, t, i) {
            var n, s = e ? this.view.$(e) : this.view.$el;
            return s.length && (n = _.chain(t).pluck("views").flatten().value(),
            _.each(n, function(e) {
                e.rendered || (e.view.render(),
                e.rendered = !0)
            }, this),
            this[i.add ? "insert" : "replace"](s, _.pluck(t, "el"), i),
            _.each(n, function(e) {
                e.attached = !0,
                i.ready && e.ready()
            }, this)),
            this
        },
        _isReady: function() {
            for (var e = this.view.el; e; ) {
                if (e === document.body)
                    return !0;
                e = e.parentNode
            }
            return !1
        }
    }),
    wp.Backbone.View = Backbone.View.extend({
        Subviews: wp.Backbone.Subviews,
        constructor: function(e) {
            this.views = new this.Subviews(this,this.views),
            this.on("ready", this.ready, this),
            this.options = e || {},
            Backbone.View.apply(this, arguments)
        },
        remove: function() {
            var e = Backbone.View.prototype.remove.apply(this, arguments);
            return this.views && this.views.remove(),
            e
        },
        render: function() {
            var e;
            return this.prepare && (e = this.prepare()),
            this.views.detach(),
            this.template && (e = e || {},
            this.trigger("prepare", e),
            this.$el.html(this.template(e))),
            this.views.render(),
            this
        },
        prepare: function() {
            return this.options
        },
        ready: function() {}
    })
}(jQuery);
;/*! ione3 - v0.1.0
 * https://interactiveone.com
 * Copyright (c) 2020; * Licensed GPLv2+ */

var $ = $ || jQuery;
window.wp = window.wp || {},
window.ione = window.ione || {},
ione.debug = !0,
ione.model = {},
ione.view = {},
ione.collections = {},
ione.log = function() {
    0
}
,
ione.log("Loading iOne search"),
ione.init = function() {
    jQuery(document).ready(function() {
        var e;
        ione.log("Setting up the search UI."),
        e = new ione.model.searchFrameState({
            baseUrl: ioneSearch.baseUrl,
            ajaxUrl: ioneSearch.ajaxUrl,
            ajaxNonce: ioneSearch.ajaxNonce
        }),
        ione.view.searchframe = new ione.view.searchFrame(e)
    })
}
,
ione.init(),
ione.model.searchResult = Backbone.Model.extend({
    defaults: {
        selected: !1
    }
}),
ione.model.searchResultsLocation = Backbone.Model.extend({}),
ione.model.searchResults = Backbone.Model.extend({}),
ione.model.searchResultsCollection = Backbone.Model.extend({}),
ione.model.searchPagination = Backbone.Model.extend({}),
ione.model.searchFrameState = Backbone.Model.extend({
    defaults: {
        search: "",
        searchfocused: !1,
        searchLoading: !1,
        selectIndex: -1,
        currentlySelected: null,
        maxPages: null,
        currentPage: 1,
        moveToPage: null
    },
    initialize: function(e) {
        ione.log("Initializing the searchFrameState model."),
        this.baseUrl = e.baseUrl,
        window.history && window.history.pushState && (this.router = new ione.Router({
            model: this
        }),
        Backbone.history.start({
            pushState: !0
        }))
    }
}),
ione.collections.searchResults = Backbone.Collection.extend({
    model: ione.model.searchResult,
    initialize: function(e) {
        ione.log("Initializing searchResults Collection."),
        this.frameModel = e,
        this.listenTo(this.frameModel, "search:change", this.fetchAndUpdate),
        this.listenTo(this.frameModel, "search:change", this.trackSearch),
        this.listenTo(this.frameModel, "keyboard:next", this.keyboardNext),
        this.listenTo(this.frameModel, "keyboard:prev", this.keyboardPrev)
    },
    keyboardNext: function() {
        var e = this.frameModel.get("currentlySelected");
        e !== this.size() - 1 && (null === e ? e = 0 : (this.at(e).set({
            isHovered: ""
        }),
        e++),
        ione.log("down:", e),
        this.updateCurrentlySelected(e),
        this.frameModel.trigger("collection:change"))
    },
    keyboardPrev: function() {
        var e = this.frameModel.get("currentlySelected");
        if (null !== e) {
            if (this.at(e).set({
                isHovered: ""
            }),
            -1 === --e)
                return this.frameModel.trigger("searchbox:focus"),
                void this.frameModel.trigger("collection:change");
            ione.log("currentlySelected:", e),
            e < 0 ? this.frameModel.trigger("searchbox:focus") : (this.updateCurrentlySelected(e),
            this.frameModel.trigger("collection:change"))
        }
    },
    updateCurrentlySelected: function(e) {
        this.at(e).set({
            isHovered: "hover"
        }),
        this.frameModel.set("currentlySelected", e)
    },
    fetchAndUpdate: function() {
        var t = this;
        this.frameModel.set("searchLoading", !0),
        this.fetch({
            success: function(e) {
                ione.log("fetch success, triggering collection:change pagination:change"),
                t.frameModel.set("searchLoading", !1),
                t.frameModel.trigger("collection:change"),
                t.frameModel.trigger("pagination:change")
            }
        })
    },
    trackSearch: function() {
        var e = this.frameModel.get("search");
        e.length && (ione.log("Sent pageview data to Google Analytics."),
        ione3.sendGAPageviewData(null, null, null, null, document.location.pathname + "?s=" + encodeURIComponent(e), "Search: " + e, {
            dimension7: "search",
            dimension8: document.location + "?s=" + encodeURIComponent(e)
        }))
    },
    sync: function(e, t, i) {
        return ione.log("Syncing search results:"),
        i.localCache = !0,
        i.url = this.frameModel.get("ajaxUrl") + "?_ajax_nonce=" + this.frameModel.get("ajaxNonce") + "&action=ione3_search&paged=" + this.frameModel.get("moveToPage") + "&search=" + encodeURI(this.frameModel.get("search")),
        i.xhrFields = {
            withCredentials: !0
        },
        Backbone.sync(e, t, i)
    },
    parse: function(e) {
        if (null != e && void 0 !== e.data.stories)
            return this.frameModel.set("maxPages", e.data.maxPages),
            this.frameModel.set("currentPage", e.data.currentPage),
            e.data.stories
    }
}),
ione.View = wp.Backbone.View.extend({
    inject: function(e) {
        this.render(),
        $(e).html(this.el),
        this.views.ready()
    },
    injectAfter: function(e) {
        this.render(),
        $(e).after(this.el),
        this.views.ready()
    },
    prepare: function() {
        return !_.isUndefined(this.model) && _.isFunction(this.model.toJSON) ? this.model.toJSON() : {}
    }
}),
ione.view.searchFrame = ione.View.extend({
    className: "ionesearch-inner",
    template: wp.template("ionesearch-frame"),
    initialize: function(e) {
        var t = this;
        this.model = e,
        ione.log("Initializing the searchFrame view."),
        $("#global-search").length && (this.searchbox = new ione.view.searchBox(e),
        this.views.add(".ionesearch-box", this.searchbox),
        this.searchbox.injectAfter(".ionesearch-box-placeholder"),
        $(document).on("searchmode:activate", function() {
            t.activateSearch(t),
            $("body").css("overflow", "hidden")
        }),
        $(document).on("searchmode:deactivate", function() {
            $("body").removeAttr("style")
        }),
        ione.collections.searchResultsCollection = new ione.collections.searchResults(e),
        ione.view.searchCollectionView = new ione.view.searchCollection(e),
        this.views.add(".ionesearch-results-container", ione.view.searchCollectionView),
        ione.view.searchCollectionView.inject("#ione-searchresults-placeholder"))
    },
    activateSearch: function(e) {
        var t;
        ione.log("activateSearch"),
        t = e.searchbox.$el.find("input.global-search-field"),
        ione.log(t[0]),
        t.val(""),
        t[0].focus(),
        this.model.trigger("search:emptied")
    },
    render: function() {
        return _.isEmpty(arguments) || (ione.log("Rendering the searchFrameState view."),
        wp.Backbone.View.prototype.render.apply(this, arguments),
        this.views.ready()),
        this
    }
}),
ione.view.searchBox = ione.View.extend({
    template: wp.template("ionesearch-box"),
    className: "ionesearch-box",
    events: {
        "focus input.global-search-field": "searchFocus",
        "keyup input.global-search-field": "searchKeyboard",
        "keydown input.global-search-field": "searchKeyboard",
        "submit form.ionesearch-box-form": "searchChanged"
    },
    initialize: function(e) {
        this.model = e,
        ione.log("Initializing searchBox View"),
        this.debouncedTriggerSearch = _.debounce(this.triggerSearch, 100),
        $("body").on("click", ".ionesearch-form", function(e) {
            e.stopPropagation()
        }),
        this.listenTo(this.model, "search:close", this.debouncedSearchClose),
        this.listenTo(this.model, "searchbox:focus", this.handleDoFocus),
        this.listenTo(this.model, "change:searchLoading", this.searchLoadingChanged)
    },
    searchLoadingChanged: function() {
        this.model.get("searchLoading") ? this.$el.parent().prepend('<span id="ionesearch-loading" class="ionesearch-loading animated"></span>') : (this.$el.parent().find("#ionesearch-loading").remove(),
        this.$el.parent().scrollTop(0))
    },
    searchFocus: function() {
        ione.log("searchFocus"),
        this.model.set("currentlySelected", null),
        this.model.trigger("search:focus")
    },
    searchBlur: function(e) {
        ione.log("searchBlur"),
        e.model.trigger("search:blur")
    },
    debouncedSearchClose: function() {
        _.delay(this.searchBlur, 500, this)
    },
    searchChanged: function(e) {
        ione.log("Search changed event."),
        e.preventDefault(),
        this.debouncedTriggerSearch()
    },
    searchKeyboard: function(e) {
        "keyup" === e.type && 27 === e.keyCode ? this.debouncedSearchClose() : 40 === e.keyCode || 38 === e.keyCode ? (e.preventDefault(),
        this.model.trigger("search:keyboard", e)) : null === this.model.get("currentlySelected") || 37 !== e.keyCode && 39 !== e.keyCode ? 3 <= this.model.get("search").length && (9 === e.keyCode || 16 !== e.keyCode && 9 === e.keyCode) && (e.preventDefault(),
        this.model.trigger("search:keyboard", e)) : (e.preventDefault(),
        this.model.trigger("search:keyboard", e))
    },
    triggerSearch: function() {
        var e;
        ione.log("searchBox:triggerSearch"),
        e = this.$el.find("input.global-search-field").prop("value"),
        this.model.set("search", e),
        "" !== e && 0 < e.length ? (this.model.set("moveToPage", 0),
        this.model.trigger("search:change")) : (ione.log("triggering search:emptied"),
        this.model.trigger("search:emptied"))
    },
    handleDoFocus: function() {
        ione.log("searchBox::handleDoFocus"),
        this.model.set("currentlySelected", null),
        this.$el.find("input").focus()
    },
    render: function() {
        return this.$el.html(this.template(this.model.attributes)),
        this
    }
}),
ione.view.searchCollection = ione.View.extend({
    tagName: "ul",
    className: "ionesearch-results",
    template: wp.template("ionesearch-collection"),
    events: {
        keydown: "keyboardNavigation",
        keyup: "keyboardNavigation"
    },
    initialize: function(e) {
        ione.log("Initializing searchCollection"),
        this.model = e,
        this.keys = [],
        this.listenTo(this.model, "search:focus", this.handleSearchBoxFocus),
        this.listenTo(this.model, "search:blur", this.handleSearchBoxBlur),
        this.listenTo(this.model, "collection:change", this.handleCollectionChange),
        this.listenTo(this.model, "search:emptied", this.showInitialState),
        this.listenTo(this.model, "search:keyboard", this.keyboardNavigation)
    },
    keyboardNavigation: function(e) {
        this.keys = [],
        this.keys[e.keyCode] = "keydown" === e.type,
        this.keys[38] || e.shiftKey && this.keys[9] ? (e.preventDefault(),
        this.model.trigger("keyboard:prev")) : this.keys[40] || this.keys[9] ? (e.preventDefault(),
        this.model.trigger("keyboard:next")) : this.keys[32] ? (e.preventDefault(),
        window.location.href = e.target.href || e.srcElement.href) : this.keys[27] && this.model.trigger("search:close")
    },
    handleSearchBoxFocus: function() {
        ione.log("Search box focus."),
        this.model.get("searchfocused") || (this.$el.show(),
        this.model.set("searchfocused", !0),
        "" !== this.model.get("search") && this.model.trigger("search:change"))
    },
    addSearchResultView: function(e) {
        this.views.add("#ione-searchresults-stories-placeholder", new ione.view.searchResult({
            result: e
        }))
    },
    addSearchResultPersonView: function(e) {
        this.views.add("#ione-searchresults-people-placeholder", new ione.view.searchResultPeople({
            result: e
        }))
    },
    addSearchPaginationView: function(e) {
        this.views.add("#ione-searchpagination-placeholder", new ione.view.searchPagination({
            frameState: this.model
        },{
            result: e
        }))
    },
    handleSearchBoxBlur: function() {
        ione.log("Handle search blur"),
        this.model.get("searchfocused") && (this.$el.parents("div#global-search").removeClass("-active"),
        $(document).trigger("searchmode:deactivate"),
        this.model.set("searchfocused", !1))
    },
    handleCollectionChange: function() {
        var e, t, i, o, s;
        if (ione.log("handleCollectionChange"),
        this.views.unset(),
        this.views.render(),
        e = _.filter(ione.collections.searchResultsCollection.models, function(e) {
            if (_.isUndefined(e.get("position")))
                return !0
        }),
        t = _.filter(ione.collections.searchResultsCollection.models, function(e) {
            if (!_.isUndefined(e.get("position")))
                return !0
        }),
        _.isEmpty(e) && _.isEmpty(t))
            return this.$el.empty(),
            !0;
        this.$el.html(this.template(this.model.attributes)),
        i = this.$el.find(".results__stories"),
        o = this.$el.find(".results__people"),
        _.isEmpty(e) ? i.hide() : _.each(e, this.addSearchResultView, this),
        _.isEmpty(t) ? o.hide() : _.each(t, this.addSearchResultPersonView, this),
        !_.isEmpty(t) && _.isEmpty(e) && o.css("float", "none"),
        (s = {
            maxPages: this.model.get("maxPages"),
            currentPage: this.model.get("currentPage"),
            nextPage: 2,
            previousPage: 1
        }).currentPage < s.maxPages ? s.nextPage = s.currentPage + 1 : s.currentPage === s.maxPages && (s.nextPage = s.maxPages),
        1 < s.currentPage ? s.previousPage = s.currentPage - 1 : 1 === s.currentPage && (s.previousPage = 1),
        this.addSearchPaginationView(s)
    },
    showInitialState: function() {
        ione.log("showInitialState"),
        ione.collections.searchResultsCollection.reset(),
        this.$el.empty(),
        this.views.unset(),
        this.views.render()
    },
    render: function() {
        return this
    }
}),
ione.view.searchResult = ione.View.extend({
    tagName: "li",
    className: "ionesearch-result",
    template: wp.template("ionesearch-result"),
    initialize: function(e) {
        var t, i = this;
        ione.log("Initializing ione.view.searchResult."),
        this.model = new ione.model.searchResult(e.result.attributes || e.result),
        this.model.attributes.location && this.$el.addClass("ionesearch-result-location ionesearch-navigable"),
        (this.model.attributes.title || this.model.attributes.keyword) && this.$el.addClass("ionesearch-result-story"),
        this.model.attributes.keyword && this.$el.addClass("ionesearch-loadmore"),
        t = this.render,
        this.render = function() {
            t.call(this),
            "hover" === this.model.attributes.isHovered && _.delay(function() {
                i.handleDoFocus(i)
            })
        }
    },
    handleDoFocus: function(e) {
        ione.log("searchResult handleDoFocus"),
        e.$el.find("a").focus()
    }
}),
ione.view.searchResultPeople = ione.View.extend({
    tagName: "li",
    className: "ionesearch-result",
    template: wp.template("ionesearch-result-people"),
    initialize: function(e) {
        var t, i = this;
        ione.log("Initializing ione.view.searchResultPeople."),
        this.model = new ione.model.searchResult(e.result.attributes || e.result),
        this.model.attributes.location && this.$el.addClass("ionesearch-result-location ionesearch-navigable"),
        (this.model.attributes.title || this.model.attributes.keyword) && this.$el.addClass("ionesearch-result-people"),
        this.model.attributes.keyword && this.$el.addClass("ionesearch-loadmore"),
        t = this.render,
        this.render = function() {
            t.call(this),
            "hover" === this.model.attributes.isHovered && _.delay(function() {
                i.handleDoFocus(i)
            })
        }
    },
    handleDoFocus: function(e) {
        ione.log("searchResultPeople handleDoFocus"),
        e.$el.find("a").focus()
    }
}),
ione.view.searchPagination = ione.View.extend({
    tagName: "div",
    className: "ionesearch-pagination-inner",
    template: wp.template("ionesearch-pagination"),
    events: {
        "click .search-nav-button.active": "searchPaginate"
    },
    initialize: function(e, t) {
        var i;
        this.frameState = e.frameState,
        this.model = new ione.model.searchPagination(t.result.attributes || t.result),
        i = this.render,
        this.render = function() {
            i.call(this)
        }
    },
    searchPaginate: function(e) {
        ione.log("Search paginate event."),
        this.frameState.set("moveToPage", e.currentTarget.getAttribute("value")),
        this.frameState.trigger("search:change")
    }
}),
ione.Router = Backbone.Router.extend({
    initialize: function(e) {
        this.model = e.model,
        this.listenTo(this.model, "change", this.updateUrl)
    },
    baseUrl: function(e) {
        return _.memoize(function() {
            return this.model.get("baseUrl") + e
        })
    }
});
;/* global FB, jpfbembed */
(function(window) {
    var facebookEmbed = function() {
        var fbroot, src, newScript, firstScript;

        if ('undefined' !== typeof FB && FB.XFBML) {
            FB.XFBML.parse();
        } else {
            fbroot = document.createElement('div');
            fbroot.id = 'fb-root';
            document.getElementsByTagName('body')[0].appendChild(fbroot);

            src = '//connect.facebook.net/' + jpfbembed.locale + '/sdk.js#xfbml=1';
            if (jpfbembed.appid) {
                src += '&appId=' + jpfbembed.appid;
            }
            src += '&version=v2.3';

            newScript = document.createElement('script');
            newScript.setAttribute('src', src);
            firstScript = document.querySelector('script');
            firstScript.parentNode.insertBefore(newScript, firstScript);
        }
    };

    window.fbAsyncInit = function() {
        FB.init({
            appId: jpfbembed.appid,
            version: 'v2.3',
        });

        FB.XFBML.parse();
    }
    ;

    if ('undefined' !== typeof infiniteScroll) {
        document.body.addEventListener('post-load', facebookEmbed);
    }
    window.addEventListener( 'load', function() {
      setTimeout( function() {
        facebookEmbed();
      }, 1500 );
    } );
    
}
)(this);
;!(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
    if (!d.getElementById(id)) {
        js = d.createElement(s);
        js.id = id;
        js.src = p + '://platform.twitter.com/widgets.js';
        fjs.parentNode.insertBefore(js, fjs);
    }
}
)(document, 'script', 'twitter-wjs');
;(function() {
    var ajaxurl = window.ajaxurl || '/wp-admin/admin-ajax.php', data = window.wpcomVipAnalytics, dataQs, percent;

    if (typeof XMLHttpRequest === 'undefined') {
        return;
    }

    if (!data) {
        return;
    }

    percent = ~~data.percentToTrack;
    if (percent && percent < 100 && (~~((Math.random() * 100) + 1) > percent)) {
        return;
    }

    dataQs = 'action=wpcom_vip_analytics';

    for (var key in data) {
        if (key === 'percentToTrack') {
            continue;
        }
        if (data.hasOwnProperty(key)) {
            dataQs += '&' + encodeURIComponent(key).replace(/%20/g, '+') + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+');
        }
    }

    function sendInfo() {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', ajaxurl, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(dataQs);
    }

    // Delay for some time after the document is ready to ping
    function docReady() {
        setTimeout(function() {
            sendInfo();
        }, 1500);
    }

    if (document.readyState === 'complete') {
        docReady.apply();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', docReady, false);
    } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', docReady);
    }
}
)();
;(function(e, h, l, c) {
    e.fn.sonar = function(o, n) {
        if (typeof o === "boolean") {
            n = o;
            o = c
        }
        return e.sonar(this[0], o, n)
    }
    ;
    var f = l.body
      , a = "scrollin"
      , m = "scrollout"
      , b = function(r, n, t) {
        if (r) {
            f || (f = l.body);
            var s = r
              , u = 0
              , v = f.offsetHeight
              , o = h.innerHeight || l.documentElement.clientHeight || f.clientHeight || 0
              , q = l.documentElement.scrollTop || h.pageYOffset || f.scrollTop || 0
              , p = r.offsetHeight || 0;
            if (!r.sonarElemTop || r.sonarBodyHeight !== v) {
                if (s.offsetParent) {
                    do {
                        u += s.offsetTop
                    } while (s = s.offsetParent)
                }
                r.sonarElemTop = u;
                r.sonarBodyHeight = v
            }
            n = n === c ? 0 : n;
            return (!(r.sonarElemTop + (t ? 0 : p) < q - n) && !(r.sonarElemTop + (t ? p : 0) > q + o + n))
        }
    }
      , d = {}
      , j = 0
      , i = function() {
        setTimeout(function() {
            var s, o, t, q, p, r, n;
            for (t in d) {
                o = d[t];
                for (r = 0,
                n = o.length; r < n; r++) {
                    q = o[r];
                    s = q.elem;
                    p = b(s, q.px, q.full);
                    if (t === m ? !p : p) {
                        if (!q.tr) {
                            if (s[t]) {
                                e(s).trigger(t);
                                q.tr = 1
                            } else {
                                o.splice(r, 1);
                                r--;
                                n--
                            }
                        }
                    } else {
                        q.tr = 0
                    }
                }
            }
        }, 25)
    }
      , k = function(n, o) {
        n[o] = 0
    }
      , g = function(r, p) {
        var t = p.px
          , q = p.full
          , s = p.evt
          , o = b(r, t, q)
          , n = 0;
        r[s] = 1;
        if (s === m ? !o : o) {
            setTimeout(function() {
                e(r).trigger(s === m ? m : a)
            }, 0);
            n = 1
        }
        d[s].push({
            elem: r,
            px: t,
            full: q,
            tr: n
        });
        if (!j) {
            e(h).bind("scroll", i);
            j = 1
        }
    };
    e.sonar = b;
    d[a] = [];
    e.event.special[a] = {
        add: function(n) {
            var p = n.data || {}
              , o = this;
            if (!o[a]) {
                g(this, {
                    px: p.distance,
                    full: p.full,
                    evt: a
                })
            }
        },
        remove: function(n) {
            k(this, a)
        }
    };
    d[m] = [];
    e.event.special[m] = {
        add: function(n) {
            var p = n.data || {}
              , o = this;
            if (!o[m]) {
                g(o, {
                    px: p.distance,
                    full: p.full,
                    evt: m
                })
            }
        },
        remove: function(n) {
            k(this, m)
        }
    }
}
)(jQuery, window, document);
;(function($) {
    lazy_load_init();
    $('body').bind('post-load', lazy_load_init);
    // Work with WP.com infinite scroll

    function lazy_load_init() {
        $('img[data-lazy-src]').bind('scrollin', {
            distance: 200
        }, function() {
            lazy_load_image(this);
        });

        // We need to force load gallery images in Jetpack Carousel and give up lazy-loading otherwise images don't show up correctly
        $('[data-carousel-extra]').each(function() {
            $(this).find('img[data-lazy-src]').each(function() {
                lazy_load_image(this);
            });
        });
    }

    function lazy_load_image(img) {
        var $img = jQuery(img)
          , src = $img.attr('data-lazy-src')
          , srcset = $img.attr('data-lazy-srcset')
          , sizes = $img.attr('data-lazy-sizes');

        if (!src || 'undefined' === typeof (src))
            return;

        $img.unbind('scrollin')// remove event binding
        .hide().removeAttr('data-lazy-src').removeAttr('data-lazy-srcset').removeAttr('data-lazy-sizes').attr('data-lazy-loaded', 'true');

        img.src = src;
        if (srcset) {
            img.srcset = srcset;
        }
        if (sizes) {
            img.sizes = sizes;
        }
        $img.fadeIn();
    }
}
)(jQuery);
;
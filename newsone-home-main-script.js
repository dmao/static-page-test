/*! This file is auto-generated */
(function() {
    function r() {}
    var n = this
      , t = n._
      , e = Array.prototype
      , o = Object.prototype
      , u = Function.prototype
      , i = e.push
      , c = e.slice
      , s = o.toString
      , a = o.hasOwnProperty
      , f = Array.isArray
      , l = Object.keys
      , p = u.bind
      , h = Object.create
      , v = function(n) {
        return n instanceof v ? n : this instanceof v ? void (this._wrapped = n) : new v(n)
    };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = v),
    exports._ = v) : n._ = v,
    v.VERSION = "1.8.3";
    var y = function(u, i, n) {
        if (void 0 === i)
            return u;
        switch (null == n ? 3 : n) {
        case 1:
            return function(n) {
                return u.call(i, n)
            }
            ;
        case 2:
            return function(n, t) {
                return u.call(i, n, t)
            }
            ;
        case 3:
            return function(n, t, r) {
                return u.call(i, n, t, r)
            }
            ;
        case 4:
            return function(n, t, r, e) {
                return u.call(i, n, t, r, e)
            }
        }
        return function() {
            return u.apply(i, arguments)
        }
    }
      , d = function(n, t, r) {
        return null == n ? v.identity : v.isFunction(n) ? y(n, t, r) : v.isObject(n) ? v.matcher(n) : v.property(n)
    };
    v.iteratee = function(n, t) {
        return d(n, t, 1 / 0)
    }
    ;
    function g(c, f) {
        return function(n) {
            var t = arguments.length;
            if (t < 2 || null == n)
                return n;
            for (var r = 1; r < t; r++)
                for (var e = arguments[r], u = c(e), i = u.length, o = 0; o < i; o++) {
                    var a = u[o];
                    f && void 0 !== n[a] || (n[a] = e[a])
                }
            return n
        }
    }
    function m(n) {
        if (!v.isObject(n))
            return {};
        if (h)
            return h(n);
        r.prototype = n;
        var t = new r;
        return r.prototype = null,
        t
    }
    function b(t) {
        return function(n) {
            return null == n ? void 0 : n[t]
        }
    }
    var x = Math.pow(2, 53) - 1
      , _ = b("length")
      , j = function(n) {
        var t = _(n);
        return "number" == typeof t && 0 <= t && t <= x
    };
    function w(a) {
        return function(n, t, r, e) {
            t = y(t, e, 4);
            var u = !j(n) && v.keys(n)
              , i = (u || n).length
              , o = 0 < a ? 0 : i - 1;
            return arguments.length < 3 && (r = n[u ? u[o] : o],
            o += a),
            function(n, t, r, e, u, i) {
                for (; 0 <= u && u < i; u += a) {
                    var o = e ? e[u] : u;
                    r = t(r, n[o], o, n)
                }
                return r
            }(n, t, r, u, o, i)
        }
    }
    v.each = v.forEach = function(n, t, r) {
        var e, u;
        if (t = y(t, r),
        j(n))
            for (e = 0,
            u = n.length; e < u; e++)
                t(n[e], e, n);
        else {
            var i = v.keys(n);
            for (e = 0,
            u = i.length; e < u; e++)
                t(n[i[e]], i[e], n)
        }
        return n
    }
    ,
    v.map = v.collect = function(n, t, r) {
        t = d(t, r);
        for (var e = !j(n) && v.keys(n), u = (e || n).length, i = Array(u), o = 0; o < u; o++) {
            var a = e ? e[o] : o;
            i[o] = t(n[a], a, n)
        }
        return i
    }
    ,
    v.reduce = v.foldl = v.inject = w(1),
    v.reduceRight = v.foldr = w(-1),
    v.find = v.detect = function(n, t, r) {
        var e;
        if (void 0 !== (e = j(n) ? v.findIndex(n, t, r) : v.findKey(n, t, r)) && -1 !== e)
            return n[e]
    }
    ,
    v.filter = v.select = function(n, e, t) {
        var u = [];
        return e = d(e, t),
        v.each(n, function(n, t, r) {
            e(n, t, r) && u.push(n)
        }),
        u
    }
    ,
    v.reject = function(n, t, r) {
        return v.filter(n, v.negate(d(t)), r)
    }
    ,
    v.every = v.all = function(n, t, r) {
        t = d(t, r);
        for (var e = !j(n) && v.keys(n), u = (e || n).length, i = 0; i < u; i++) {
            var o = e ? e[i] : i;
            if (!t(n[o], o, n))
                return !1
        }
        return !0
    }
    ,
    v.some = v.any = function(n, t, r) {
        t = d(t, r);
        for (var e = !j(n) && v.keys(n), u = (e || n).length, i = 0; i < u; i++) {
            var o = e ? e[i] : i;
            if (t(n[o], o, n))
                return !0
        }
        return !1
    }
    ,
    v.contains = v.includes = v.include = function(n, t, r, e) {
        return j(n) || (n = v.values(n)),
        "number" == typeof r && !e || (r = 0),
        0 <= v.indexOf(n, t, r)
    }
    ,
    v.invoke = function(n, r) {
        var e = c.call(arguments, 2)
          , u = v.isFunction(r);
        return v.map(n, function(n) {
            var t = u ? r : n[r];
            return null == t ? t : t.apply(n, e)
        })
    }
    ,
    v.pluck = function(n, t) {
        return v.map(n, v.property(t))
    }
    ,
    v.where = function(n, t) {
        return v.filter(n, v.matcher(t))
    }
    ,
    v.findWhere = function(n, t) {
        return v.find(n, v.matcher(t))
    }
    ,
    v.max = function(n, e, t) {
        var r, u, i = -1 / 0, o = -1 / 0;
        if (null == e && null != n)
            for (var a = 0, c = (n = j(n) ? n : v.values(n)).length; a < c; a++)
                r = n[a],
                i < r && (i = r);
        else
            e = d(e, t),
            v.each(n, function(n, t, r) {
                u = e(n, t, r),
                (o < u || u === -1 / 0 && i === -1 / 0) && (i = n,
                o = u)
            });
        return i
    }
    ,
    v.min = function(n, e, t) {
        var r, u, i = 1 / 0, o = 1 / 0;
        if (null == e && null != n)
            for (var a = 0, c = (n = j(n) ? n : v.values(n)).length; a < c; a++)
                (r = n[a]) < i && (i = r);
        else
            e = d(e, t),
            v.each(n, function(n, t, r) {
                ((u = e(n, t, r)) < o || u === 1 / 0 && i === 1 / 0) && (i = n,
                o = u)
            });
        return i
    }
    ,
    v.shuffle = function(n) {
        for (var t, r = j(n) ? n : v.values(n), e = r.length, u = Array(e), i = 0; i < e; i++)
            (t = v.random(0, i)) !== i && (u[i] = u[t]),
            u[t] = r[i];
        return u
    }
    ,
    v.sample = function(n, t, r) {
        return null == t || r ? (j(n) || (n = v.values(n)),
        n[v.random(n.length - 1)]) : v.shuffle(n).slice(0, Math.max(0, t))
    }
    ,
    v.sortBy = function(n, e, t) {
        return e = d(e, t),
        v.pluck(v.map(n, function(n, t, r) {
            return {
                value: n,
                index: t,
                criteria: e(n, t, r)
            }
        }).sort(function(n, t) {
            var r = n.criteria
              , e = t.criteria;
            if (r !== e) {
                if (e < r || void 0 === r)
                    return 1;
                if (r < e || void 0 === e)
                    return -1
            }
            return n.index - t.index
        }), "value")
    }
    ;
    function A(o) {
        return function(e, u, n) {
            var i = {};
            return u = d(u, n),
            v.each(e, function(n, t) {
                var r = u(n, t, e);
                o(i, n, r)
            }),
            i
        }
    }
    v.groupBy = A(function(n, t, r) {
        v.has(n, r) ? n[r].push(t) : n[r] = [t]
    }),
    v.indexBy = A(function(n, t, r) {
        n[r] = t
    }),
    v.countBy = A(function(n, t, r) {
        v.has(n, r) ? n[r]++ : n[r] = 1
    }),
    v.toArray = function(n) {
        return n ? v.isArray(n) ? c.call(n) : j(n) ? v.map(n, v.identity) : v.values(n) : []
    }
    ,
    v.size = function(n) {
        return null == n ? 0 : j(n) ? n.length : v.keys(n).length
    }
    ,
    v.partition = function(n, e, t) {
        e = d(e, t);
        var u = []
          , i = [];
        return v.each(n, function(n, t, r) {
            (e(n, t, r) ? u : i).push(n)
        }),
        [u, i]
    }
    ,
    v.first = v.head = v.take = function(n, t, r) {
        if (null != n)
            return null == t || r ? n[0] : v.initial(n, n.length - t)
    }
    ,
    v.initial = function(n, t, r) {
        return c.call(n, 0, Math.max(0, n.length - (null == t || r ? 1 : t)))
    }
    ,
    v.last = function(n, t, r) {
        if (null != n)
            return null == t || r ? n[n.length - 1] : v.rest(n, Math.max(0, n.length - t))
    }
    ,
    v.rest = v.tail = v.drop = function(n, t, r) {
        return c.call(n, null == t || r ? 1 : t)
    }
    ,
    v.compact = function(n) {
        return v.filter(n, v.identity)
    }
    ;
    var O = function(n, t, r, e) {
        for (var u = [], i = 0, o = e || 0, a = _(n); o < a; o++) {
            var c = n[o];
            if (j(c) && (v.isArray(c) || v.isArguments(c))) {
                t || (c = O(c, t, r));
                var f = 0
                  , l = c.length;
                for (u.length += l; f < l; )
                    u[i++] = c[f++]
            } else
                r || (u[i++] = c)
        }
        return u
    };
    function k(i) {
        return function(n, t, r) {
            t = d(t, r);
            for (var e = _(n), u = 0 < i ? 0 : e - 1; 0 <= u && u < e; u += i)
                if (t(n[u], u, n))
                    return u;
            return -1
        }
    }
    function F(i, o, a) {
        return function(n, t, r) {
            var e = 0
              , u = _(n);
            if ("number" == typeof r)
                0 < i ? e = 0 <= r ? r : Math.max(r + u, e) : u = 0 <= r ? Math.min(r + 1, u) : r + u + 1;
            else if (a && r && u)
                return n[r = a(n, t)] === t ? r : -1;
            if (t != t)
                return 0 <= (r = o(c.call(n, e, u), v.isNaN)) ? r + e : -1;
            for (r = 0 < i ? e : u - 1; 0 <= r && r < u; r += i)
                if (n[r] === t)
                    return r;
            return -1
        }
    }
    v.flatten = function(n, t) {
        return O(n, t, !1)
    }
    ,
    v.without = function(n) {
        return v.difference(n, c.call(arguments, 1))
    }
    ,
    v.uniq = v.unique = function(n, t, r, e) {
        v.isBoolean(t) || (e = r,
        r = t,
        t = !1),
        null != r && (r = d(r, e));
        for (var u = [], i = [], o = 0, a = _(n); o < a; o++) {
            var c = n[o]
              , f = r ? r(c, o, n) : c;
            t ? (o && i === f || u.push(c),
            i = f) : r ? v.contains(i, f) || (i.push(f),
            u.push(c)) : v.contains(u, c) || u.push(c)
        }
        return u
    }
    ,
    v.union = function() {
        return v.uniq(O(arguments, !0, !0))
    }
    ,
    v.intersection = function(n) {
        for (var t = [], r = arguments.length, e = 0, u = _(n); e < u; e++) {
            var i = n[e];
            if (!v.contains(t, i)) {
                for (var o = 1; o < r && v.contains(arguments[o], i); o++)
                    ;
                o === r && t.push(i)
            }
        }
        return t
    }
    ,
    v.difference = function(n) {
        var t = O(arguments, !0, !0, 1);
        return v.filter(n, function(n) {
            return !v.contains(t, n)
        })
    }
    ,
    v.zip = function() {
        return v.unzip(arguments)
    }
    ,
    v.unzip = function(n) {
        for (var t = n && v.max(n, _).length || 0, r = Array(t), e = 0; e < t; e++)
            r[e] = v.pluck(n, e);
        return r
    }
    ,
    v.object = function(n, t) {
        for (var r = {}, e = 0, u = _(n); e < u; e++)
            t ? r[n[e]] = t[e] : r[n[e][0]] = n[e][1];
        return r
    }
    ,
    v.findIndex = k(1),
    v.findLastIndex = k(-1),
    v.sortedIndex = function(n, t, r, e) {
        for (var u = (r = d(r, e, 1))(t), i = 0, o = _(n); i < o; ) {
            var a = Math.floor((i + o) / 2);
            r(n[a]) < u ? i = a + 1 : o = a
        }
        return i
    }
    ,
    v.indexOf = F(1, v.findIndex, v.sortedIndex),
    v.lastIndexOf = F(-1, v.findLastIndex),
    v.range = function(n, t, r) {
        null == t && (t = n || 0,
        n = 0),
        r = r || 1;
        for (var e = Math.max(Math.ceil((t - n) / r), 0), u = Array(e), i = 0; i < e; i++,
        n += r)
            u[i] = n;
        return u
    }
    ;
    function S(n, t, r, e, u) {
        if (!(e instanceof t))
            return n.apply(r, u);
        var i = m(n.prototype)
          , o = n.apply(i, u);
        return v.isObject(o) ? o : i
    }
    v.bind = function(n, t) {
        if (p && n.bind === p)
            return p.apply(n, c.call(arguments, 1));
        if (!v.isFunction(n))
            throw new TypeError("Bind must be called on a function");
        var r = c.call(arguments, 2)
          , e = function() {
            return S(n, e, t, this, r.concat(c.call(arguments)))
        };
        return e
    }
    ,
    v.partial = function(u) {
        var i = c.call(arguments, 1)
          , o = function() {
            for (var n = 0, t = i.length, r = Array(t), e = 0; e < t; e++)
                r[e] = i[e] === v ? arguments[n++] : i[e];
            for (; n < arguments.length; )
                r.push(arguments[n++]);
            return S(u, o, this, this, r)
        };
        return o
    }
    ,
    v.bindAll = function(n) {
        var t, r, e = arguments.length;
        if (e <= 1)
            throw new Error("bindAll must be passed function names");
        for (t = 1; t < e; t++)
            n[r = arguments[t]] = v.bind(n[r], n);
        return n
    }
    ,
    v.memoize = function(e, u) {
        var i = function(n) {
            var t = i.cache
              , r = "" + (u ? u.apply(this, arguments) : n);
            return v.has(t, r) || (t[r] = e.apply(this, arguments)),
            t[r]
        };
        return i.cache = {},
        i
    }
    ,
    v.delay = function(n, t) {
        var r = c.call(arguments, 2);
        return setTimeout(function() {
            return n.apply(null, r)
        }, t)
    }
    ,
    v.defer = v.partial(v.delay, v, 1),
    v.throttle = function(r, e, u) {
        var i, o, a, c = null, f = 0;
        u = u || {};
        function l() {
            f = !1 === u.leading ? 0 : v.now(),
            c = null,
            a = r.apply(i, o),
            c || (i = o = null)
        }
        return function() {
            var n = v.now();
            f || !1 !== u.leading || (f = n);
            var t = e - (n - f);
            return i = this,
            o = arguments,
            t <= 0 || e < t ? (c && (clearTimeout(c),
            c = null),
            f = n,
            a = r.apply(i, o),
            c || (i = o = null)) : c || !1 === u.trailing || (c = setTimeout(l, t)),
            a
        }
    }
    ,
    v.debounce = function(t, r, e) {
        var u, i, o, a, c, f = function() {
            var n = v.now() - a;
            n < r && 0 <= n ? u = setTimeout(f, r - n) : (u = null,
            e || (c = t.apply(o, i),
            u || (o = i = null)))
        };
        return function() {
            o = this,
            i = arguments,
            a = v.now();
            var n = e && !u;
            return u = u || setTimeout(f, r),
            n && (c = t.apply(o, i),
            o = i = null),
            c
        }
    }
    ,
    v.wrap = function(n, t) {
        return v.partial(t, n)
    }
    ,
    v.negate = function(n) {
        return function() {
            return !n.apply(this, arguments)
        }
    }
    ,
    v.compose = function() {
        var r = arguments
          , e = r.length - 1;
        return function() {
            for (var n = e, t = r[e].apply(this, arguments); n--; )
                t = r[n].call(this, t);
            return t
        }
    }
    ,
    v.after = function(n, t) {
        return function() {
            if (--n < 1)
                return t.apply(this, arguments)
        }
    }
    ,
    v.before = function(n, t) {
        var r;
        return function() {
            return 0 < --n && (r = t.apply(this, arguments)),
            n <= 1 && (t = null),
            r
        }
    }
    ,
    v.once = v.partial(v.before, 2);
    var E = !{
        toString: null
    }.propertyIsEnumerable("toString")
      , M = ["valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
    function I(n, t) {
        var r = M.length
          , e = n.constructor
          , u = v.isFunction(e) && e.prototype || o
          , i = "constructor";
        for (v.has(n, i) && !v.contains(t, i) && t.push(i); r--; )
            (i = M[r])in n && n[i] !== u[i] && !v.contains(t, i) && t.push(i)
    }
    v.keys = function(n) {
        if (!v.isObject(n))
            return [];
        if (l)
            return l(n);
        var t = [];
        for (var r in n)
            v.has(n, r) && t.push(r);
        return E && I(n, t),
        t
    }
    ,
    v.allKeys = function(n) {
        if (!v.isObject(n))
            return [];
        var t = [];
        for (var r in n)
            t.push(r);
        return E && I(n, t),
        t
    }
    ,
    v.values = function(n) {
        for (var t = v.keys(n), r = t.length, e = Array(r), u = 0; u < r; u++)
            e[u] = n[t[u]];
        return e
    }
    ,
    v.mapObject = function(n, t, r) {
        t = d(t, r);
        for (var e, u = v.keys(n), i = u.length, o = {}, a = 0; a < i; a++)
            o[e = u[a]] = t(n[e], e, n);
        return o
    }
    ,
    v.pairs = function(n) {
        for (var t = v.keys(n), r = t.length, e = Array(r), u = 0; u < r; u++)
            e[u] = [t[u], n[t[u]]];
        return e
    }
    ,
    v.invert = function(n) {
        for (var t = {}, r = v.keys(n), e = 0, u = r.length; e < u; e++)
            t[n[r[e]]] = r[e];
        return t
    }
    ,
    v.functions = v.methods = function(n) {
        var t = [];
        for (var r in n)
            v.isFunction(n[r]) && t.push(r);
        return t.sort()
    }
    ,
    v.extend = g(v.allKeys),
    v.extendOwn = v.assign = g(v.keys),
    v.findKey = function(n, t, r) {
        t = d(t, r);
        for (var e, u = v.keys(n), i = 0, o = u.length; i < o; i++)
            if (t(n[e = u[i]], e, n))
                return e
    }
    ,
    v.pick = function(n, t, r) {
        var e, u, i = {}, o = n;
        if (null == o)
            return i;
        v.isFunction(t) ? (u = v.allKeys(o),
        e = y(t, r)) : (u = O(arguments, !1, !1, 1),
        e = function(n, t, r) {
            return t in r
        }
        ,
        o = Object(o));
        for (var a = 0, c = u.length; a < c; a++) {
            var f = u[a]
              , l = o[f];
            e(l, f, o) && (i[f] = l)
        }
        return i
    }
    ,
    v.omit = function(n, t, r) {
        if (v.isFunction(t))
            t = v.negate(t);
        else {
            var e = v.map(O(arguments, !1, !1, 1), String);
            t = function(n, t) {
                return !v.contains(e, t)
            }
        }
        return v.pick(n, t, r)
    }
    ,
    v.defaults = g(v.allKeys, !0),
    v.create = function(n, t) {
        var r = m(n);
        return t && v.extendOwn(r, t),
        r
    }
    ,
    v.clone = function(n) {
        return v.isObject(n) ? v.isArray(n) ? n.slice() : v.extend({}, n) : n
    }
    ,
    v.tap = function(n, t) {
        return t(n),
        n
    }
    ,
    v.isMatch = function(n, t) {
        var r = v.keys(t)
          , e = r.length;
        if (null == n)
            return !e;
        for (var u = Object(n), i = 0; i < e; i++) {
            var o = r[i];
            if (t[o] !== u[o] || !(o in u))
                return !1
        }
        return !0
    }
    ;
    var N = function(n, t, r, e) {
        if (n === t)
            return 0 !== n || 1 / n == 1 / t;
        if (null == n || null == t)
            return n === t;
        n instanceof v && (n = n._wrapped),
        t instanceof v && (t = t._wrapped);
        var u = s.call(n);
        if (u !== s.call(t))
            return !1;
        switch (u) {
        case "[object RegExp]":
        case "[object String]":
            return "" + n == "" + t;
        case "[object Number]":
            return +n != +n ? +t != +t : 0 == +n ? 1 / +n == 1 / t : +n == +t;
        case "[object Date]":
        case "[object Boolean]":
            return +n == +t
        }
        var i = "[object Array]" === u;
        if (!i) {
            if ("object" != typeof n || "object" != typeof t)
                return !1;
            var o = n.constructor
              , a = t.constructor;
            if (o !== a && !(v.isFunction(o) && o instanceof o && v.isFunction(a) && a instanceof a) && "constructor"in n && "constructor"in t)
                return !1
        }
        e = e || [];
        for (var c = (r = r || []).length; c--; )
            if (r[c] === n)
                return e[c] === t;
        if (r.push(n),
        e.push(t),
        i) {
            if ((c = n.length) !== t.length)
                return !1;
            for (; c--; )
                if (!N(n[c], t[c], r, e))
                    return !1
        } else {
            var f, l = v.keys(n);
            if (c = l.length,
            v.keys(t).length !== c)
                return !1;
            for (; c--; )
                if (f = l[c],
                !v.has(t, f) || !N(n[f], t[f], r, e))
                    return !1
        }
        return r.pop(),
        e.pop(),
        !0
    };
    v.isEqual = function(n, t) {
        return N(n, t)
    }
    ,
    v.isEmpty = function(n) {
        return null == n || (j(n) && (v.isArray(n) || v.isString(n) || v.isArguments(n)) ? 0 === n.length : 0 === v.keys(n).length)
    }
    ,
    v.isElement = function(n) {
        return !(!n || 1 !== n.nodeType)
    }
    ,
    v.isArray = f || function(n) {
        return "[object Array]" === s.call(n)
    }
    ,
    v.isObject = function(n) {
        var t = typeof n;
        return "function" == t || "object" == t && !!n
    }
    ,
    v.each(["Arguments", "Function", "String", "Number", "Date", "RegExp", "Error"], function(t) {
        v["is" + t] = function(n) {
            return s.call(n) === "[object " + t + "]"
        }
    }),
    v.isArguments(arguments) || (v.isArguments = function(n) {
        return v.has(n, "callee")
    }
    ),
    "function" != typeof /./ && "object" != typeof Int8Array && (v.isFunction = function(n) {
        return "function" == typeof n || !1
    }
    ),
    v.isFinite = function(n) {
        return isFinite(n) && !isNaN(parseFloat(n))
    }
    ,
    v.isNaN = function(n) {
        return v.isNumber(n) && n !== +n
    }
    ,
    v.isBoolean = function(n) {
        return !0 === n || !1 === n || "[object Boolean]" === s.call(n)
    }
    ,
    v.isNull = function(n) {
        return null === n
    }
    ,
    v.isUndefined = function(n) {
        return void 0 === n
    }
    ,
    v.has = function(n, t) {
        return null != n && a.call(n, t)
    }
    ,
    v.noConflict = function() {
        return n._ = t,
        this
    }
    ,
    v.identity = function(n) {
        return n
    }
    ,
    v.constant = function(n) {
        return function() {
            return n
        }
    }
    ,
    v.noop = function() {}
    ,
    v.property = b,
    v.propertyOf = function(t) {
        return null == t ? function() {}
        : function(n) {
            return t[n]
        }
    }
    ,
    v.matcher = v.matches = function(t) {
        return t = v.extendOwn({}, t),
        function(n) {
            return v.isMatch(n, t)
        }
    }
    ,
    v.times = function(n, t, r) {
        var e = Array(Math.max(0, n));
        t = y(t, r, 1);
        for (var u = 0; u < n; u++)
            e[u] = t(u);
        return e
    }
    ,
    v.random = function(n, t) {
        return null == t && (t = n,
        n = 0),
        n + Math.floor(Math.random() * (t - n + 1))
    }
    ,
    v.now = Date.now || function() {
        return (new Date).getTime()
    }
    ;
    function B(t) {
        function r(n) {
            return t[n]
        }
        var n = "(?:" + v.keys(t).join("|") + ")"
          , e = RegExp(n)
          , u = RegExp(n, "g");
        return function(n) {
            return n = null == n ? "" : "" + n,
            e.test(n) ? n.replace(u, r) : n
        }
    }
    var T = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    }
      , R = v.invert(T);
    v.escape = B(T),
    v.unescape = B(R),
    v.result = function(n, t, r) {
        var e = null == n ? void 0 : n[t];
        return void 0 === e && (e = r),
        v.isFunction(e) ? e.call(n) : e
    }
    ;
    var q = 0;
    v.uniqueId = function(n) {
        var t = ++q + "";
        return n ? n + t : t
    }
    ,
    v.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    function K(n) {
        return "\\" + D[n]
    }
    var z = /(.)^/
      , D = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "\u2028": "u2028",
        "\u2029": "u2029"
    }
      , L = /\\|'|\r|\n|\u2028|\u2029/g;
    v.template = function(i, n, t) {
        !n && t && (n = t),
        n = v.defaults({}, n, v.templateSettings);
        var r = RegExp([(n.escape || z).source, (n.interpolate || z).source, (n.evaluate || z).source].join("|") + "|$", "g")
          , o = 0
          , a = "__p+='";
        i.replace(r, function(n, t, r, e, u) {
            return a += i.slice(o, u).replace(L, K),
            o = u + n.length,
            t ? a += "'+\n((__t=(" + t + "))==null?'':_.escape(__t))+\n'" : r ? a += "'+\n((__t=(" + r + "))==null?'':__t)+\n'" : e && (a += "';\n" + e + "\n__p+='"),
            n
        }),
        a += "';\n",
        n.variable || (a = "with(obj||{}){\n" + a + "}\n"),
        a = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + a + "return __p;\n";
        try {
            var e = new Function(n.variable || "obj","_",a)
        } catch (n) {
            throw n.source = a,
            n
        }
        function u(n) {
            return e.call(this, n, v)
        }
        var c = n.variable || "obj";
        return u.source = "function(" + c + "){\n" + a + "}",
        u
    }
    ,
    v.chain = function(n) {
        var t = v(n);
        return t._chain = !0,
        t
    }
    ;
    function P(n, t) {
        return n._chain ? v(t).chain() : t
    }
    v.mixin = function(r) {
        v.each(v.functions(r), function(n) {
            var t = v[n] = r[n];
            v.prototype[n] = function() {
                var n = [this._wrapped];
                return i.apply(n, arguments),
                P(this, t.apply(v, n))
            }
        })
    }
    ,
    v.mixin(v),
    v.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(t) {
        var r = e[t];
        v.prototype[t] = function() {
            var n = this._wrapped;
            return r.apply(n, arguments),
            "shift" !== t && "splice" !== t || 0 !== n.length || delete n[0],
            P(this, n)
        }
    }),
    v.each(["concat", "join", "slice"], function(n) {
        var t = e[n];
        v.prototype[n] = function() {
            return P(this, t.apply(this._wrapped, arguments))
        }
    }),
    v.prototype.value = function() {
        return this._wrapped
    }
    ,
    v.prototype.valueOf = v.prototype.toJSON = v.prototype.value,
    v.prototype.toString = function() {
        return "" + this._wrapped
    }
    ,
    "function" == typeof define && define.amd && define("underscore", [], function() {
        return v
    })
}
).call(this);
;/*! ione3 - v0.1.0
 * https://interactiveone.com
 * Copyright (c) 2020; * Licensed GPLv2+ */

!function(e) {
    var t, i, n, r, s, o, a, c = navigator.userAgent;
    e.HTMLPictureElement && /ecko/.test(c) && c.match(/rv\:(\d+)/) && RegExp.$1 < 45 && addEventListener("resize", (i = document.createElement("source"),
    n = function(e) {
        var t, n, r = e.parentNode;
        "PICTURE" === r.nodeName.toUpperCase() ? (t = i.cloneNode(),
        r.insertBefore(t, r.firstElementChild),
        setTimeout(function() {
            r.removeChild(t)
        })) : (!e._pfLastSize || e.offsetWidth > e._pfLastSize) && (e._pfLastSize = e.offsetWidth,
        n = e.sizes,
        e.sizes += ",100vw",
        setTimeout(function() {
            e.sizes = n
        }))
    }
    ,
    r = function() {
        var e, t = document.querySelectorAll("picture > img, img[srcset][sizes]");
        for (e = 0; e < t.length; e++)
            n(t[e])
    }
    ,
    s = function() {
        clearTimeout(t),
        t = setTimeout(r, 99)
    }
    ,
    o = e.matchMedia && matchMedia("(orientation: landscape)"),
    a = function() {
        s(),
        o && o.addListener && o.addListener(s)
    }
    ,
    i.srcset = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    /^[c|i]|d$/.test(document.readyState || "") ? a() : document.addEventListener("DOMContentLoaded", a),
    s))
}(window),
function(e, s, u) {
    "use strict";
    var i, l, c;
    s.createElement("picture");
    var S = {}
      , o = !1
      , t = function() {}
      , n = s.createElement("img")
      , h = n.getAttribute
      , f = n.setAttribute
      , d = n.removeAttribute
      , a = s.documentElement
      , r = {}
      , T = {
        algorithm: ""
    }
      , p = "data-pfsrc"
      , m = p + "set"
      , g = navigator.userAgent
      , x = /rident/.test(g) || /ecko/.test(g) && g.match(/rv\:(\d+)/) && 35 < RegExp.$1
      , C = "currentSrc"
      , v = /\s+\+?\d+(e\d+)?w/
      , A = /(\([^)]+\))?\s*(.+)/
      , y = e.picturefillCFG
      , b = "font-size:100%!important;"
      , E = !0
      , w = {}
      , _ = {}
      , I = e.devicePixelRatio
      , R = {
        px: 1,
        in: 96
    }
      , z = s.createElement("a")
      , M = !1
      , k = /^[ \t\n\r\u000c]+/
      , L = /^[, \t\n\r\u000c]+/
      , O = /^[^ \t\n\r\u000c]+/
      , P = /[,]+$/
      , N = /^\d+$/
      , D = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/
      , F = function(e, t, n, r) {
        e.addEventListener ? e.addEventListener(t, n, r || !1) : e.attachEvent && e.attachEvent("on" + t, n)
    }
      , B = function(t) {
        var n = {};
        return function(e) {
            return e in n || (n[e] = t(e)),
            n[e]
        }
    };
    function U(e) {
        return " " === e || "\t" === e || "\n" === e || "\f" === e || "\r" === e
    }
    var $, j, H, q, W, V, Q, G, J, K, X, Z, Y, ee, te, ne, re, ie, se, oe = ($ = /^([\d\.]+)(em|vw|px)$/,
    j = B(function(e) {
        return "return " + function() {
            for (var e = arguments, t = 0, n = e[0]; ++t in e; )
                n = n.replace(e[t], e[++t]);
            return n
        }((e || "").toLowerCase(), /\band\b/g, "&&", /,/g, "||", /min-([a-z-\s]+):/g, "e.$1>=", /max-([a-z-\s]+):/g, "e.$1<=", /calc([^)]+)/g, "($1)", /(\d+[\.]*[\d]*)([a-z]+)/g, "($1 * e.$2)", /^(?!(e.[a-z]|[0-9\.&=|><\+\-\*\(\)\/])).*/gi, "") + ";"
    }),
    function(e, t) {
        var n;
        if (!(e in w))
            if (w[e] = !1,
            t && (n = e.match($)))
                w[e] = n[1] * R[n[2]];
            else
                try {
                    w[e] = new Function("e",j(e))(R)
                } catch (e) {}
        return w[e]
    }
    ), ae = function(e, t) {
        return e.w ? (e.cWidth = S.calcListLength(t || "100vw"),
        e.res = e.w / e.cWidth) : e.res = e.d,
        e
    }, ce = function(e) {
        if (o) {
            var t, n, r, i = e || {};
            if (i.elements && 1 === i.elements.nodeType && ("IMG" === i.elements.nodeName.toUpperCase() ? i.elements = [i.elements] : (i.context = i.elements,
            i.elements = null)),
            r = (t = i.elements || S.qsa(i.context || s, i.reevaluate || i.reselect ? S.sel : S.selShort)).length) {
                for (S.setupRun(i),
                M = !0,
                n = 0; n < r; n++)
                    S.fillImg(t[n], i);
                S.teardownRun(i)
            }
        }
    };
    function ue(e, t) {
        return e.res - t.res
    }
    function le(e, t) {
        var n, r, i;
        if (e && t)
            for (i = S.parseSet(t),
            e = S.makeUrl(e),
            n = 0; n < i.length; n++)
                if (e === S.makeUrl(i[n].url)) {
                    r = i[n];
                    break
                }
        return r
    }
    e.console && console.warn,
    C in n || (C = "src"),
    r["image/jpeg"] = !0,
    r["image/gif"] = !0,
    r["image/png"] = !0,
    r["image/svg+xml"] = s.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1"),
    S.ns = ("pf" + (new Date).getTime()).substr(0, 9),
    S.supSrcset = "srcset"in n,
    S.supSizes = "sizes"in n,
    S.supPicture = !!e.HTMLPictureElement,
    S.supSrcset && S.supPicture && !S.supSizes && (H = s.createElement("img"),
    n.srcset = "data:,a",
    H.src = "data:,a",
    S.supSrcset = n.complete === H.complete,
    S.supPicture = S.supSrcset && S.supPicture),
    S.supSrcset && !S.supSizes ? (q = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    W = s.createElement("img"),
    V = function() {
        2 === W.width && (S.supSizes = !0),
        l = S.supSrcset && !S.supSizes,
        o = !0,
        setTimeout(ce)
    }
    ,
    W.onload = V,
    W.onerror = V,
    W.setAttribute("sizes", "9px"),
    W.srcset = q + " 1w,data:image/gif;base64,R0lGODlhAgABAPAAAP///wAAACH5BAAAAAAALAAAAAACAAEAAAICBAoAOw== 9w",
    W.src = q) : o = !0,
    S.selShort = "picture>img,img[srcset]",
    S.sel = S.selShort,
    S.cfg = T,
    S.DPR = I || 1,
    S.u = R,
    S.types = r,
    S.setSize = t,
    S.makeUrl = B(function(e) {
        return z.href = e,
        z.href
    }),
    S.qsa = function(e, t) {
        return "querySelector"in e ? e.querySelectorAll(t) : []
    }
    ,
    S.matchesMedia = function() {
        return e.matchMedia && (matchMedia("(min-width: 0.1em)") || {}).matches ? S.matchesMedia = function(e) {
            return !e || matchMedia(e).matches
        }
        : S.matchesMedia = S.mMQ,
        S.matchesMedia.apply(this, arguments)
    }
    ,
    S.mMQ = function(e) {
        return !e || oe(e)
    }
    ,
    S.calcLength = function(e) {
        var t = oe(e, !0) || !1;
        return t < 0 && (t = !1),
        t
    }
    ,
    S.supportsType = function(e) {
        return !e || r[e]
    }
    ,
    S.parseSize = B(function(e) {
        var t = (e || "").match(A);
        return {
            media: t && t[1],
            length: t && t[2]
        }
    }),
    S.parseSet = function(e) {
        return e.cands || (e.cands = function(r, h) {
            function e(e) {
                var t, n = e.exec(r.substring(o));
                if (n)
                    return t = n[0],
                    o += t.length,
                    t
            }
            var f, d, t, n, i, s = r.length, o = 0, p = [];
            function a() {
                var e, t, n, r, i, s, o, a, c, u = !1, l = {};
                for (r = 0; r < d.length; r++)
                    s = (i = d[r])[i.length - 1],
                    o = i.substring(0, i.length - 1),
                    a = parseInt(o, 10),
                    c = parseFloat(o),
                    N.test(o) && "w" === s ? ((e || t) && (u = !0),
                    0 === a ? u = !0 : e = a) : D.test(o) && "x" === s ? ((e || t || n) && (u = !0),
                    c < 0 ? u = !0 : t = c) : N.test(o) && "h" === s ? ((n || t) && (u = !0),
                    0 === a ? u = !0 : n = a) : u = !0;
                u || (l.url = f,
                e && (l.w = e),
                t && (l.d = t),
                n && (l.h = n),
                n || t || e || (l.d = 1),
                1 === l.d && (h.has1x = !0),
                l.set = h,
                p.push(l))
            }
            function c() {
                for (e(k),
                t = "",
                n = "in descriptor"; ; ) {
                    if (i = r.charAt(o),
                    "in descriptor" === n)
                        if (U(i))
                            t && (d.push(t),
                            t = "",
                            n = "after descriptor");
                        else {
                            if ("," === i)
                                return o += 1,
                                t && d.push(t),
                                void a();
                            if ("(" === i)
                                t += i,
                                n = "in parens";
                            else {
                                if ("" === i)
                                    return t && d.push(t),
                                    void a();
                                t += i
                            }
                        }
                    else if ("in parens" === n)
                        if (")" === i)
                            t += i,
                            n = "in descriptor";
                        else {
                            if ("" === i)
                                return d.push(t),
                                void a();
                            t += i
                        }
                    else if ("after descriptor" === n)
                        if (U(i))
                            ;
                        else {
                            if ("" === i)
                                return void a();
                            n = "in descriptor",
                            o -= 1
                        }
                    o += 1
                }
            }
            for (; ; ) {
                if (e(L),
                s <= o)
                    return p;
                f = e(O),
                d = [],
                "," === f.slice(-1) ? (f = f.replace(P, ""),
                a()) : c()
            }
        }(e.srcset, e)),
        e.cands
    }
    ,
    S.getEmValue = function() {
        var e;
        if (!i && (e = s.body)) {
            var t = s.createElement("div")
              , n = a.style.cssText
              , r = e.style.cssText;
            t.style.cssText = "position:absolute;left:0;visibility:hidden;display:block;padding:0;border:none;font-size:1em;width:1em;overflow:hidden;clip:rect(0px, 0px, 0px, 0px)",
            a.style.cssText = b,
            e.style.cssText = b,
            e.appendChild(t),
            i = t.offsetWidth,
            e.removeChild(t),
            i = parseFloat(i, 10),
            a.style.cssText = n,
            e.style.cssText = r
        }
        return i || 16
    }
    ,
    S.calcListLength = function(e) {
        if (!(e in _) || T.uT) {
            var t = S.calcLength(function(e) {
                var t, n, r, i, s, o, a, c = /^(?:[+-]?[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?(?:ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmin|vmax|vw)$/i, u = /^calc\((?:[0-9a-z \.\+\-\*\/\(\)]+)\)$/i;
                for (r = (n = function(e) {
                    var t, n = "", r = [], i = [], s = 0, o = 0, a = !1;
                    function c() {
                        n && (r.push(n),
                        n = "")
                    }
                    function u() {
                        r[0] && (i.push(r),
                        r = [])
                    }
                    for (; ; ) {
                        if ("" === (t = e.charAt(o)))
                            return c(),
                            u(),
                            i;
                        if (a) {
                            if ("*" === t && "/" === e[o + 1]) {
                                a = !1,
                                o += 2,
                                c();
                                continue
                            }
                            o += 1
                        } else {
                            if (U(t)) {
                                if (e.charAt(o - 1) && U(e.charAt(o - 1)) || !n) {
                                    o += 1;
                                    continue
                                }
                                if (0 === s) {
                                    c(),
                                    o += 1;
                                    continue
                                }
                                t = " "
                            } else if ("(" === t)
                                s += 1;
                            else if (")" === t)
                                s -= 1;
                            else {
                                if ("," === t) {
                                    c(),
                                    u(),
                                    o += 1;
                                    continue
                                }
                                if ("/" === t && "*" === e.charAt(o + 1)) {
                                    a = !0,
                                    o += 2;
                                    continue
                                }
                            }
                            n += t,
                            o += 1
                        }
                    }
                }(e)).length,
                t = 0; t < r; t++)
                    if (s = (i = n[t])[i.length - 1],
                    a = s,
                    c.test(a) && 0 <= parseFloat(a) || u.test(a) || "0" === a || "-0" === a || "+0" === a) {
                        if (o = s,
                        i.pop(),
                        0 === i.length)
                            return o;
                        if (i = i.join(" "),
                        S.matchesMedia(i))
                            return o
                    }
                return "100vw"
            }(e));
            _[e] = t || R.width
        }
        return _[e]
    }
    ,
    S.setRes = function(e) {
        var t;
        if (e)
            for (var n = 0, r = (t = S.parseSet(e)).length; n < r; n++)
                ae(t[n], e.sizes);
        return t
    }
    ,
    S.setRes.res = ae,
    S.applySetCandidate = function(e, t) {
        if (e.length) {
            var n, r, i, s, o, a, c, u, l, h, f, d, p, m, g, v, A, y, b, E, w = t[S.ns], _ = S.DPR;
            if (a = w.curSrc || t[C],
            (c = w.curCan || (h = t,
            f = a,
            !(d = e[0].set) && f && (d = (d = h[S.ns].sets) && d[d.length - 1]),
            (p = le(f, d)) && (f = S.makeUrl(f),
            h[S.ns].curSrc = f,
            (h[S.ns].curCan = p).res || ae(p, p.set.sizes)),
            p)) && c.set === e[0].set && ((l = x && !t.complete && c.res - .1 > _) || (c.cached = !0,
            c.res >= _ && (o = c))),
            !o)
                for (e.sort(ue),
                o = e[(s = e.length) - 1],
                r = 0; r < s; r++)
                    if ((n = e[r]).res >= _) {
                        o = e[i = r - 1] && (l || a !== S.makeUrl(n.url)) && (m = e[i].res,
                        g = n.res,
                        v = _,
                        A = e[i].cached,
                        E = b = y = void 0,
                        "saveData" === T.algorithm ? 2.7 < m ? E = v + 1 : (b = (g - v) * (y = Math.pow(m - .6, 1.5)),
                        A && (b += .1 * y),
                        E = m + b) : E = 1 < v ? Math.sqrt(m * g) : m,
                        v < E) ? e[i] : n;
                        break
                    }
            o && (u = S.makeUrl(o.url),
            w.curSrc = u,
            w.curCan = o,
            u !== a && S.setSrc(t, o),
            S.setSize(t))
        }
    }
    ,
    S.setSrc = function(e, t) {
        var n;
        e.src = t.url,
        "image/svg+xml" === t.set.type && (n = e.style.width,
        e.style.width = e.offsetWidth + 1 + "px",
        e.offsetWidth + 1 && (e.style.width = n))
    }
    ,
    S.getSet = function(e) {
        var t, n, r, i = !1, s = e[S.ns].sets;
        for (t = 0; t < s.length && !i; t++)
            if ((n = s[t]).srcset && S.matchesMedia(n.media) && (r = S.supportsType(n.type))) {
                "pending" === r && (n = r),
                i = n;
                break
            }
        return i
    }
    ,
    S.parseSets = function(e, t, n) {
        var r, i, s, o, a = t && "PICTURE" === t.nodeName.toUpperCase(), c = e[S.ns];
        (c.src === u || n.src) && (c.src = h.call(e, "src"),
        c.src ? f.call(e, p, c.src) : d.call(e, p)),
        (c.srcset === u || n.srcset || !S.supSrcset || e.srcset) && (r = h.call(e, "srcset"),
        c.srcset = r,
        o = !0),
        c.sets = [],
        a && (c.pic = !0,
        function(e, t) {
            var n, r, i, s, o = e.getElementsByTagName("source");
            for (n = 0,
            r = o.length; n < r; n++)
                (i = o[n])[S.ns] = !0,
                (s = i.getAttribute("srcset")) && t.push({
                    srcset: s,
                    media: i.getAttribute("media"),
                    type: i.getAttribute("type"),
                    sizes: i.getAttribute("sizes")
                })
        }(t, c.sets)),
        c.srcset ? (i = {
            srcset: c.srcset,
            sizes: h.call(e, "sizes")
        },
        c.sets.push(i),
        (s = (l || c.src) && v.test(c.srcset || "")) || !c.src || le(c.src, i) || i.has1x || (i.srcset += ", " + c.src,
        i.cands.push({
            url: c.src,
            d: 1,
            set: i
        }))) : c.src && c.sets.push({
            srcset: c.src,
            sizes: null
        }),
        c.curCan = null,
        c.curSrc = u,
        c.supported = !(a || i && !S.supSrcset || s && !S.supSizes),
        o && S.supSrcset && !c.supported && (r ? (f.call(e, m, r),
        e.srcset = "") : d.call(e, m)),
        c.supported && !c.srcset && (!c.src && e.src || e.src !== S.makeUrl(c.src)) && (null === c.src ? e.removeAttribute("src") : e.src = c.src),
        c.parsed = !0
    }
    ,
    S.fillImg = function(e, t) {
        var n, r, i, s, o, a = t.reselect || t.reevaluate;
        (e[S.ns] || (e[S.ns] = {}),
        n = e[S.ns],
        a || n.evaled !== c) && (n.parsed && !t.reevaluate || S.parseSets(e, e.parentNode, t),
        n.supported ? n.evaled = c : (r = e,
        s = S.getSet(r),
        o = !1,
        "pending" !== s && (o = c,
        s && (i = S.setRes(s),
        S.applySetCandidate(i, r))),
        r[S.ns].evaled = o))
    }
    ,
    S.setupRun = function() {
        M && !E && I === e.devicePixelRatio || (E = !1,
        I = e.devicePixelRatio,
        w = {},
        _ = {},
        S.DPR = I || 1,
        R.width = Math.max(e.innerWidth || 0, a.clientWidth),
        R.height = Math.max(e.innerHeight || 0, a.clientHeight),
        R.vw = R.width / 100,
        R.vh = R.height / 100,
        c = [R.height, R.width, I].join("-"),
        R.em = S.getEmValue(),
        R.rem = R.em)
    }
    ,
    S.supPicture ? (ce = t,
    S.fillImg = t) : (Y = e.attachEvent ? /d$|^c/ : /d$|^c|^i/,
    ee = function() {
        var e = s.readyState || "";
        te = setTimeout(ee, "loading" === e ? 200 : 999),
        s.body && (S.fillImgs(),
        (Q = Q || Y.test(e)) && clearTimeout(te))
    }
    ,
    te = setTimeout(ee, s.body ? 9 : 99),
    ne = a.clientHeight,
    F(e, "resize", (G = function() {
        E = Math.max(e.innerWidth || 0, a.clientWidth) !== R.width || a.clientHeight !== ne,
        ne = a.clientHeight,
        E && S.fillImgs()
    }
    ,
    J = 99,
    Z = function() {
        var e = new Date - X;
        e < J ? K = setTimeout(Z, J - e) : (K = null,
        G())
    }
    ,
    function() {
        X = new Date,
        K || (K = setTimeout(Z, J))
    }
    )),
    F(s, "readystatechange", ee)),
    S.picturefill = ce,
    S.fillImgs = ce,
    S.teardownRun = t,
    ce._ = S,
    e.picturefillCFG = {
        pf: S,
        push: function(e) {
            var t = e.shift();
            "function" == typeof S[t] ? S[t].apply(S, e) : (T[t] = e[0],
            M && S.fillImgs({
                reselect: !0
            }))
        }
    };
    for (; y && y.length; )
        e.picturefillCFG.push(y.shift());
    e.picturefill = ce,
    "object" == typeof module && "object" == typeof module.exports ? module.exports = ce : "function" == typeof define && define.amd && define("picturefill", function() {
        return ce
    }),
    S.supPicture || (r["image/webp"] = (re = "image/webp",
    ie = "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==",
    (se = new e.Image).onerror = function() {
        r[re] = !1,
        ce()
    }
    ,
    se.onload = function() {
        r[re] = 1 === se.width,
        ce()
    }
    ,
    se.src = ie,
    "pending"))
}(window, document),
function(s, f, d) {
    function p(e, t) {
        return typeof e === t
    }
    function m() {
        return "function" != typeof f.createElement ? f.createElement(arguments[0]) : A ? f.createElementNS.call(f, "http://www.w3.org/2000/svg", arguments[0]) : f.createElement.apply(f, arguments)
    }
    function i(e, t, n, r) {
        var i, s, o, a, c, u = "modernizr", l = m("div"), h = ((c = f.body) || ((c = m(A ? "svg" : "body")).fake = !0),
        c);
        if (parseInt(n, 10))
            for (; n--; )
                (o = m("div")).id = r ? r[n] : u + (n + 1),
                l.appendChild(o);
        return (i = m("style")).type = "text/css",
        i.id = "s" + u,
        (h.fake ? h : l).appendChild(i),
        h.appendChild(l),
        i.styleSheet ? i.styleSheet.cssText = e : i.appendChild(f.createTextNode(e)),
        l.id = u,
        h.fake && (h.style.background = "",
        h.style.overflow = "hidden",
        a = v.style.overflow,
        v.style.overflow = "hidden",
        v.appendChild(h)),
        s = t(l, e),
        h.fake ? (h.parentNode.removeChild(h),
        v.style.overflow = a,
        v.offsetHeight) : l.parentNode.removeChild(l),
        !!s
    }
    function a(e, t) {
        return function() {
            return e.apply(t, arguments)
        }
    }
    function o(e) {
        return e.replace(/([A-Z])/g, function(e, t) {
            return "-" + t.toLowerCase()
        }).replace(/^ms-/, "-ms-")
    }
    function g(e, t) {
        var n = e.length;
        if ("CSS"in s && "supports"in s.CSS) {
            for (; n--; )
                if (s.CSS.supports(o(e[n]), t))
                    return !0;
            return !1
        }
        if ("CSSSupportsRule"in s) {
            for (var r = []; n--; )
                r.push("(" + o(e[n]) + ":" + t + ")");
            return i("@supports (" + (r = r.join(" or ")) + ") { #modernizr { position: absolute; } }", function(e) {
                return "absolute" == function(e, t, n) {
                    var r;
                    if ("getComputedStyle"in s) {
                        r = getComputedStyle.call(s, e, t);
                        var i = s.console;
                        null !== r ? n && (r = r.getPropertyValue(n)) : i && i[i.error ? "error" : "log"].call(i, "getComputedStyle returning null, its possible modernizr test results are inaccurate")
                    } else
                        r = !t && e.currentStyle && e.currentStyle[n];
                    return r
                }(e, null, "position")
            })
        }
        return d
    }
    function r(e, t, n, r, i) {
        var s = e.charAt(0).toUpperCase() + e.slice(1)
          , o = (e + " " + T.join(s + " ") + s).split(" ");
        return p(t, "string") || p(t, "undefined") ? function(e, t, n, r) {
            function i() {
                o && (delete C.style,
                delete C.modElem)
            }
            if (r = !p(r, "undefined") && r,
            !p(n, "undefined")) {
                var s = g(e, n);
                if (!p(s, "undefined"))
                    return s
            }
            for (var o, a, c, u, l, h = ["modernizr", "tspan", "samp"]; !C.style && h.length; )
                o = !0,
                C.modElem = m(h.shift()),
                C.style = C.modElem.style;
            for (c = e.length,
            a = 0; a < c; a++)
                if (u = e[a],
                l = C.style[u],
                !!~("" + u).indexOf("-") && (u = u.replace(/([a-z])-([a-z])/g, function(e, t, n) {
                    return t + n.toUpperCase()
                }).replace(/^-/, "")),
                C.style[u] !== d) {
                    if (r || p(n, "undefined"))
                        return i(),
                        "pfx" != t || u;
                    try {
                        C.style[u] = n
                    } catch (e) {}
                    if (C.style[u] != l)
                        return i(),
                        "pfx" != t || u
                }
            return i(),
            !1
        }(o, t, r, i) : function(e, t, n) {
            var r;
            for (var i in e)
                if (e[i]in t)
                    return !1 === n ? e[i] : p(r = t[e[i]], "function") ? a(r, n || t) : r;
            return !1
        }(o = (e + " " + y.join(s + " ") + s).split(" "), t, n)
    }
    function e(e, t, n) {
        return r(e, d, d, t, n)
    }
    var c = []
      , u = []
      , t = {
        _version: "3.6.0",
        _config: {
            classPrefix: "",
            enableClasses: !0,
            enableJSClass: !0,
            usePrefixes: !0
        },
        _q: [],
        on: function(e, t) {
            var n = this;
            setTimeout(function() {
                t(n[e])
            }, 0)
        },
        addTest: function(e, t, n) {
            u.push({
                name: e,
                fn: t,
                options: n
            })
        },
        addAsyncTest: function(e) {
            u.push({
                name: null,
                fn: e
            })
        }
    }
      , l = function() {};
    l.prototype = t,
    (l = new l).addTest("svg", !!f.createElementNS && !!f.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect);
    var n = t._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];
    t._prefixes = n;
    var v = f.documentElement
      , A = "svg" === v.nodeName.toLowerCase();
    A || function(e, c) {
        function u() {
            var e = p.elements;
            return "string" == typeof e ? e.split(" ") : e
        }
        function l(e) {
            var t = a[e[n]];
            return t || (t = {},
            o++,
            e[n] = o,
            a[o] = t),
            t
        }
        function h(e, t, n) {
            return t || (t = c),
            d ? t.createElement(e) : (n || (n = l(t)),
            !(r = n.cache[e] ? n.cache[e].cloneNode() : s.test(e) ? (n.cache[e] = n.createElem(e)).cloneNode() : n.createElem(e)).canHaveChildren || i.test(e) || r.tagUrn ? r : n.frag.appendChild(r));
            var r
        }
        function r(e) {
            e || (e = c);
            var t, n, r, i, s, o, a = l(e);
            return !p.shivCSS || f || a.hasCSS || (a.hasCSS = (i = "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}",
            s = (r = e).createElement("p"),
            o = r.getElementsByTagName("head")[0] || r.documentElement,
            s.innerHTML = "x<style>" + i + "</style>",
            !!o.insertBefore(s.lastChild, o.firstChild))),
            d || (t = e,
            (n = a).cache || (n.cache = {},
            n.createElem = t.createElement,
            n.createFrag = t.createDocumentFragment,
            n.frag = n.createFrag()),
            t.createElement = function(e) {
                return p.shivMethods ? h(e, t, n) : n.createElem(e)
            }
            ,
            t.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + u().join().replace(/[\w\-:]+/g, function(e) {
                return n.createElem(e),
                n.frag.createElement(e),
                'c("' + e + '")'
            }) + ");return n}")(p, n.frag)),
            e
        }
        var f, d, t = e.html5 || {}, i = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i, s = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i, n = "_html5shiv", o = 0, a = {};
        !function() {
            try {
                var e = c.createElement("a");
                e.innerHTML = "<xyz></xyz>",
                f = "hidden"in e,
                d = 1 == e.childNodes.length || function() {
                    c.createElement("a");
                    var e = c.createDocumentFragment();
                    return void 0 === e.cloneNode || void 0 === e.createDocumentFragment || void 0 === e.createElement
                }()
            } catch (e) {
                d = f = !0
            }
        }();
        var p = {
            elements: t.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",
            version: "3.7.3",
            shivCSS: !1 !== t.shivCSS,
            supportsUnknownElements: d,
            shivMethods: !1 !== t.shivMethods,
            type: "default",
            shivDocument: r,
            createElement: h,
            createDocumentFragment: function(e, t) {
                if (e || (e = c),
                d)
                    return e.createDocumentFragment();
                for (var n = (t = t || l(e)).frag.cloneNode(), r = 0, i = u(), s = i.length; r < s; r++)
                    n.createElement(i[r]);
                return n
            },
            addElements: function(e, t) {
                var n = p.elements;
                "string" != typeof n && (n = n.join(" ")),
                "string" != typeof e && (e = e.join(" ")),
                p.elements = n + " " + e,
                r(t)
            }
        };
        e.html5 = p,
        r(c),
        "object" == typeof module && module.exports && (module.exports = p)
    }(void 0 !== s ? s : this, f);
    var h = "Moz O ms Webkit"
      , y = t._config.usePrefixes ? h.toLowerCase().split(" ") : [];
    t._domPrefixes = y;
    var b, E = (b = !("onblur"in f.documentElement),
    function(e, t) {
        var n;
        return !!e && (t && "string" != typeof t || (t = m(t || "div")),
        !(n = (e = "on" + e)in t) && b && (t.setAttribute || (t = m("div")),
        t.setAttribute(e, ""),
        n = "function" == typeof t[e],
        t[e] !== d && (t[e] = d),
        t.removeAttribute(e)),
        n)
    }
    );
    t.hasEvent = E,
    l.addTest("pointerevents", function() {
        var e = !1
          , t = y.length;
        for (e = l.hasEvent("pointerdown"); t-- && !e; )
            E(y[t] + "pointerdown") && (e = !0);
        return e
    }),
    l.addTest("rgba", function() {
        var e = m("a").style;
        return e.cssText = "background-color:rgba(150,255,150,.5)",
        -1 < ("" + e.backgroundColor).indexOf("rgba")
    });
    var w = "CSS"in s && "supports"in s.CSS
      , _ = "supportsCSS"in s;
    l.addTest("supports", w || _);
    var S = t.testStyles = i;
    l.addTest("touchevents", function() {
        var t;
        if ("ontouchstart"in s || s.DocumentTouch && f instanceof DocumentTouch)
            t = !0;
        else {
            var e = ["@media (", n.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");
            S(e, function(e) {
                t = 9 === e.offsetTop
            })
        }
        return t
    });
    var T = t._config.usePrefixes ? h.split(" ") : [];
    t._cssomPrefixes = T;
    var x = {
        elem: m("modernizr")
    };
    l._q.push(function() {
        delete x.elem
    });
    var C = {
        style: x.elem.style
    };
    l._q.unshift(function() {
        delete C.style
    }),
    t.testAllProps = r,
    t.testAllProps = e,
    l.addTest("csstransforms", function() {
        return -1 === navigator.userAgent.indexOf("Android 2.") && e("transform", "scale(1)", !0)
    }),
    l.addTest("csstransforms3d", function() {
        return !!e("perspective", "1px", !0)
    }),
    function() {
        var e, t, n, r, i, s;
        for (var o in u)
            if (u.hasOwnProperty(o)) {
                if (e = [],
                (t = u[o]).name && (e.push(t.name.toLowerCase()),
                t.options && t.options.aliases && t.options.aliases.length))
                    for (n = 0; n < t.options.aliases.length; n++)
                        e.push(t.options.aliases[n].toLowerCase());
                for (r = p(t.fn, "function") ? t.fn() : t.fn,
                i = 0; i < e.length; i++)
                    1 === (s = e[i].split(".")).length ? l[s[0]] = r : (!l[s[0]] || l[s[0]]instanceof Boolean || (l[s[0]] = new Boolean(l[s[0]])),
                    l[s[0]][s[1]] = r),
                    c.push((r ? "" : "no-") + s.join("-"))
            }
    }(),
    function(e) {
        var t = v.className
          , n = l._config.classPrefix || "";
        if (A && (t = t.baseVal),
        l._config.enableJSClass) {
            var r = new RegExp("(^|\\s)" + n + "no-js(\\s|$)");
            t = t.replace(r, "$1" + n + "js$2")
        }
        l._config.enableClasses && (t += " " + n + e.join(" " + n),
        A ? v.className.baseVal = t : v.className = t)
    }(c),
    delete t.addTest,
    delete t.addAsyncTest;
    for (var I = 0; I < l._q.length; I++)
        l._q[I]();
    s.Modernizr = l
}(window, document),
function(m, g) {
    "use strict";
    if ("IntersectionObserver"in m && "IntersectionObserverEntry"in m && "intersectionRatio"in m.IntersectionObserverEntry.prototype)
        "isIntersecting"in m.IntersectionObserverEntry.prototype || Object.defineProperty(m.IntersectionObserverEntry.prototype, "isIntersecting", {
            get: function() {
                return 0 < this.intersectionRatio
            }
        });
    else {
        var t = [];
        e.prototype.THROTTLE_TIMEOUT = 100,
        e.prototype.POLL_INTERVAL = null,
        e.prototype.USE_MUTATION_OBSERVER = !0,
        e.prototype.observe = function(t) {
            if (!this._observationTargets.some(function(e) {
                return e.element == t
            })) {
                if (!t || 1 != t.nodeType)
                    throw new Error("target must be an Element");
                this._registerInstance(),
                this._observationTargets.push({
                    element: t,
                    entry: null
                }),
                this._monitorIntersections(),
                this._checkForIntersections()
            }
        }
        ,
        e.prototype.unobserve = function(t) {
            this._observationTargets = this._observationTargets.filter(function(e) {
                return e.element != t
            }),
            this._observationTargets.length || (this._unmonitorIntersections(),
            this._unregisterInstance())
        }
        ,
        e.prototype.disconnect = function() {
            this._observationTargets = [],
            this._unmonitorIntersections(),
            this._unregisterInstance()
        }
        ,
        e.prototype.takeRecords = function() {
            var e = this._queuedEntries.slice();
            return this._queuedEntries = [],
            e
        }
        ,
        e.prototype._initThresholds = function(e) {
            var t = e || [0];
            return Array.isArray(t) || (t = [t]),
            t.sort().filter(function(e, t, n) {
                if ("number" != typeof e || isNaN(e) || e < 0 || 1 < e)
                    throw new Error("threshold must be a number between 0 and 1 inclusively");
                return e !== n[t - 1]
            })
        }
        ,
        e.prototype._parseRootMargin = function(e) {
            var t = (e || "0px").split(/\s+/).map(function(e) {
                var t = /^(-?\d*\.?\d+)(px|%)$/.exec(e);
                if (!t)
                    throw new Error("rootMargin must be specified in pixels or percent");
                return {
                    value: parseFloat(t[1]),
                    unit: t[2]
                }
            });
            return t[1] = t[1] || t[0],
            t[2] = t[2] || t[0],
            t[3] = t[3] || t[1],
            t
        }
        ,
        e.prototype._monitorIntersections = function() {
            this._monitoringIntersections || (this._monitoringIntersections = !0,
            this.POLL_INTERVAL ? this._monitoringInterval = setInterval(this._checkForIntersections, this.POLL_INTERVAL) : (n(m, "resize", this._checkForIntersections, !0),
            n(g, "scroll", this._checkForIntersections, !0),
            this.USE_MUTATION_OBSERVER && "MutationObserver"in m && (this._domObserver = new MutationObserver(this._checkForIntersections),
            this._domObserver.observe(g, {
                attributes: !0,
                childList: !0,
                characterData: !0,
                subtree: !0
            }))))
        }
        ,
        e.prototype._unmonitorIntersections = function() {
            this._monitoringIntersections && (this._monitoringIntersections = !1,
            clearInterval(this._monitoringInterval),
            this._monitoringInterval = null,
            r(m, "resize", this._checkForIntersections, !0),
            r(g, "scroll", this._checkForIntersections, !0),
            this._domObserver && (this._domObserver.disconnect(),
            this._domObserver = null))
        }
        ,
        e.prototype._checkForIntersections = function() {
            var a = this._rootIsInDom()
              , c = a ? this._getRootRect() : {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: 0,
                height: 0
            };
            this._observationTargets.forEach(function(e) {
                var t = e.element
                  , n = v(t)
                  , r = this._rootContainsTarget(t)
                  , i = e.entry
                  , s = a && r && this._computeTargetAndRootIntersection(t, c)
                  , o = e.entry = new u({
                    time: m.performance && performance.now && performance.now(),
                    target: t,
                    boundingClientRect: n,
                    rootBounds: c,
                    intersectionRect: s
                });
                i ? a && r ? this._hasCrossedThreshold(i, o) && this._queuedEntries.push(o) : i && i.isIntersecting && this._queuedEntries.push(o) : this._queuedEntries.push(o)
            }, this),
            this._queuedEntries.length && this._callback(this.takeRecords(), this)
        }
        ,
        e.prototype._computeTargetAndRootIntersection = function(e, t) {
            if ("none" != m.getComputedStyle(e).display) {
                for (var n, r, i, s, o, a, c, u, l = v(e), h = A(e), f = !1; !f; ) {
                    var d = null
                      , p = 1 == h.nodeType ? m.getComputedStyle(h) : {};
                    if ("none" == p.display)
                        return;
                    if (h == this.root || h == g ? (f = !0,
                    d = t) : h != g.body && h != g.documentElement && "visible" != p.overflow && (d = v(h)),
                    d && (n = d,
                    r = l,
                    void 0,
                    i = Math.max(n.top, r.top),
                    s = Math.min(n.bottom, r.bottom),
                    o = Math.max(n.left, r.left),
                    a = Math.min(n.right, r.right),
                    u = s - i,
                    !(l = 0 <= (c = a - o) && 0 <= u && {
                        top: i,
                        bottom: s,
                        left: o,
                        right: a,
                        width: c,
                        height: u
                    })))
                        break;
                    h = A(h)
                }
                return l
            }
        }
        ,
        e.prototype._getRootRect = function() {
            var e;
            if (this.root)
                e = v(this.root);
            else {
                var t = g.documentElement
                  , n = g.body;
                e = {
                    top: 0,
                    left: 0,
                    right: t.clientWidth || n.clientWidth,
                    width: t.clientWidth || n.clientWidth,
                    bottom: t.clientHeight || n.clientHeight,
                    height: t.clientHeight || n.clientHeight
                }
            }
            return this._expandRectByRootMargin(e)
        }
        ,
        e.prototype._expandRectByRootMargin = function(n) {
            var e = this._rootMarginValues.map(function(e, t) {
                return "px" == e.unit ? e.value : e.value * (t % 2 ? n.width : n.height) / 100
            })
              , t = {
                top: n.top - e[0],
                right: n.right + e[1],
                bottom: n.bottom + e[2],
                left: n.left - e[3]
            };
            return t.width = t.right - t.left,
            t.height = t.bottom - t.top,
            t
        }
        ,
        e.prototype._hasCrossedThreshold = function(e, t) {
            var n = e && e.isIntersecting ? e.intersectionRatio || 0 : -1
              , r = t.isIntersecting ? t.intersectionRatio || 0 : -1;
            if (n !== r)
                for (var i = 0; i < this.thresholds.length; i++) {
                    var s = this.thresholds[i];
                    if (s == n || s == r || s < n != s < r)
                        return !0
                }
        }
        ,
        e.prototype._rootIsInDom = function() {
            return !this.root || i(g, this.root)
        }
        ,
        e.prototype._rootContainsTarget = function(e) {
            return i(this.root || g, e)
        }
        ,
        e.prototype._registerInstance = function() {
            t.indexOf(this) < 0 && t.push(this)
        }
        ,
        e.prototype._unregisterInstance = function() {
            var e = t.indexOf(this);
            -1 != e && t.splice(e, 1)
        }
        ,
        m.IntersectionObserver = e,
        m.IntersectionObserverEntry = u
    }
    function u(e) {
        this.time = e.time,
        this.target = e.target,
        this.rootBounds = e.rootBounds,
        this.boundingClientRect = e.boundingClientRect,
        this.intersectionRect = e.intersectionRect || {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0
        },
        this.isIntersecting = !!e.intersectionRect;
        var t = this.boundingClientRect
          , n = t.width * t.height
          , r = this.intersectionRect
          , i = r.width * r.height;
        this.intersectionRatio = n ? i / n : this.isIntersecting ? 1 : 0
    }
    function e(e, t) {
        var n, r, i, s = t || {};
        if ("function" != typeof e)
            throw new Error("callback must be a function");
        if (s.root && 1 != s.root.nodeType)
            throw new Error("root must be an Element");
        this._checkForIntersections = (n = this._checkForIntersections.bind(this),
        r = this.THROTTLE_TIMEOUT,
        i = null,
        function() {
            i || (i = setTimeout(function() {
                n(),
                i = null
            }, r))
        }
        ),
        this._callback = e,
        this._observationTargets = [],
        this._queuedEntries = [],
        this._rootMarginValues = this._parseRootMargin(s.rootMargin),
        this.thresholds = this._initThresholds(s.threshold),
        this.root = s.root || null,
        this.rootMargin = this._rootMarginValues.map(function(e) {
            return e.value + e.unit
        }).join(" ")
    }
    function n(e, t, n, r) {
        "function" == typeof e.addEventListener ? e.addEventListener(t, n, r || !1) : "function" == typeof e.attachEvent && e.attachEvent("on" + t, n)
    }
    function r(e, t, n, r) {
        "function" == typeof e.removeEventListener ? e.removeEventListener(t, n, r || !1) : "function" == typeof e.detatchEvent && e.detatchEvent("on" + t, n)
    }
    function v(e) {
        var t;
        try {
            t = e.getBoundingClientRect()
        } catch (e) {}
        return t ? (t.width && t.height || (t = {
            top: t.top,
            right: t.right,
            bottom: t.bottom,
            left: t.left,
            width: t.right - t.left,
            height: t.bottom - t.top
        }),
        t) : {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0
        }
    }
    function i(e, t) {
        for (var n = t; n; ) {
            if (n == e)
                return !0;
            n = A(n)
        }
        return !1
    }
    function A(e) {
        var t = e.parentNode;
        return t && 11 == t.nodeType && t.host ? t.host : t
    }
}(window, document);
;/* global _, IntersectionObserver */

var ioneViewTimeTracker = function(timeLimit, onLimitCallback) {
    this.timeLimit = timeLimit;
    this.onLimitCallback = onLimitCallback;
    this.idsVisible = [];
    this.idsViewTime = {};
    this.isViewportActive = true;
    this.observer = new IntersectionObserver(this.onIntersecting.bind(this),{
        root: null,
        rootMargin: '0px',
        threshold: [0.0, 0.5]
    });
};

ioneViewTimeTracker.prototype = {

    init: function() {
        document.addEventListener('visibilitychange', this.onViewportVisibilityChange.bind(this));

        if (this.timeLimit) {
            setInterval(this.onTick.bind(this), 1000);
        }
    },

    observe: function(element) {
        this.observer.observe(element);
    },

    unobserve: function(element) {
        var elementVisibleIndex = this.idsVisible.indexOf(element.id);

        this.observer.unobserve(element);

        if (element.id && -1 !== elementVisibleIndex) {
            this.idsVisible.splice(elementVisibleIndex, 1);
        }
    },

    onViewportVisibilityChange: function() {
        this.isViewportActive = !document.hidden;
    },

    idsOverLimit: function() {
        var self = this;

        return _.keys(_.pick(this.idsViewTime, function(viewTime) {
            return (viewTime >= self.timeLimit);
        }));
    },

    onTick: function() {
        var idsOverLimit, self = this;

        if (!this.isViewportActive) {
            return;
        }

        _.each(this.idsVisible, function(elementId) {
            if ('undefined' === typeof self.idsViewTime[elementId]) {
                self.idsViewTime[elementId] = 0;
            }

            self.idsViewTime[elementId] += 1;
        });

        idsOverLimit = this.idsOverLimit();

        if (idsOverLimit.length) {
            _.each(idsOverLimit, function(elementId) {
                self.idsViewTime[elementId] = 0;
            });

            this.onLimitCallback(idsOverLimit);
        }
    },

    onIntersecting: function(entries) {
        var self = this;

        _.each(entries, function(entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                if (-1 === self.idsVisible.indexOf(entry.target.id)) {
                    self.idsVisible.push(entry.target.id);
                }
            } else {
                self.idsVisible = _.without(self.idsVisible, entry.target.id);
            }
        });
    }

};
;/* global jQuery, googletag, ionegpt, _, ioneAds, renderedGptSlots, IntersectionObserver, ioneViewTimeTracker */
(function() {
    var referrerCookie, referrerDomain, siteDomain;
    var referrer = '';
    var countValue = 0;
    var utmData = {};
    var allowedUTMs = ['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_campaign'];
    var cookieName = 'ione_viewcount';
    var cookieData, vars;

    window.ioneAdUtils = {
        getPlatform: function() {
            var ua = navigator.userAgent;

            if (ua.match(/Android/i)) {
                return 'mobile';
            }

            if (ua.match(/iPhone/i)) {
                return 'mobile';
            }

            if (ua.match(/IEMobile/i)) {
                return 'mobile';
            }

            if (ua.match(/iPad/i)) {
                return 'tablet';
            }

            return 'desktop';
        },
        getEnvironment: function() {
            var url = document.location.href;
            if (-1 !== url.indexOf('.dev')) {
                return 'dev';
            }
            if (-1 !== url.indexOf('ione.nyc')) {
                return 'stage';
            }
            return 'production';
        },
        readCookie: function(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            var i, c;

            for (i = 0; i < ca.length; i++) {
                c = ca[i];
                while (' ' === c.charAt(0)) {
                    c = c.substring(1, c.length);
                }
                if (0 === c.indexOf(nameEQ)) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        },
        createCookie: function(name, value, hours) {
            var date, cookie;
            var expires = '';
            if (hours) {
                date = new Date();
                date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
                expires = '; expires=' + date.toGMTString();
            }
            cookie = name + '=' + value + expires + '; path=/';
            document.cookie = cookie;
        },
        eraseCookie: function(name) {
            this.CreateCookie(name, '', -1);
        },
        getQueryVars: function() {
            var string = window.location.href;
            var vars = {};
            var hash = [];
            var i, hashes;

            if (-1 === string.search(/\?/i)) {
                return [];
            }

            // Store GET params as vars[]
            hashes = string.slice(string.indexOf('?') + 1).split('&');
            for (i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        viewCount: function() {
            return countValue;
        },
        getUTM: function(key) {
            if ('undefined' === typeof utmData[key]) {
                return '';
            }

            return utmData[key];
        },
        getReferrer: function() {
            return referrer;
        }
    };

    function getDomain(url) {
        var element = document.createElement('a');
        element.href = url;
        return element.hostname;
    }

    // Init UTM data
    cookieData = JSON.parse(window.ioneAdUtils.readCookie('utm_cookie'));
    if (null === cookieData || 0 === Object.keys(cookieData).length) {
        vars = window.ioneAdUtils.getQueryVars();
        allowedUTMs.forEach(function(element) {
            if ('undefined' !== typeof vars[element]) {
                utmData[element] = vars[element];
            }
        });
        window.ioneAdUtils.createCookie('utm_cookie', JSON.stringify(utmData), 0.5);
    } else {
        utmData = cookieData;
    }

    // Init Count Value
    countValue = parseInt(window.ioneAdUtils.readCookie(cookieName));
    if (isNaN(countValue)) {
        countValue = 0;
    } else {
        countValue++;
    }
    window.ioneAdUtils.createCookie(cookieName, encodeURIComponent(countValue), 0.5);

    // Init Referrer data
    referrerCookie = window.ioneAdUtils.readCookie('referrer_cookie');
    if (null === referrerCookie) {
        referrerDomain = getDomain(window.document.referrer);
        siteDomain = getDomain(ionegpt.utils.home_url);

        if (siteDomain !== referrerDomain) {
            referrer = referrerDomain;
            window.ioneAdUtils.createCookie('referrer_cookie', referrer, 0.5);
        }
    } else {
        referrer = referrerCookie;
    }
}
)();

(function($) {
    var adConfig = {};

    googletag = window.googletag || {};
    googletag.cmd = googletag.cmd || [];

    /**
	 * Keep track of all the defined slots.
	 * @todo Move to ioneAds.
	 */
    window.renderedGptSlots = {};

    window.ioneAds = {
        slotConfig: {},
        slotsDfpDefined: [],
        slotsRendered: [],
        eventsRender: {},
        onReadyQueue: [],
        observer: null,
        viewableTimeObserver: null,
        config: {
            isMobile: false,
            lazyloadEnable: false,
            lazyloadMargin: 0,
            lazyLoadPosDesktop: [],
            lazyLoadPosMobile: [],
            bidTimeout: 2000,
            viewableRefreshInterval: null,
            aps: {
                enable: false,
                libUrl: null,
                pubId: null
            }
        },
        ready: false,

        init: function(config) {
            this.config = $.extend(this.config, config);

            if (this.config.lazyloadEnable) {
                this.observer = new IntersectionObserver(this.onLazyLoadCallback,{
                    rootMargin: this.config.lazyloadMargin + '% 0%'
                });
            }

            // Make sure the global apstag is always available.
            window.apstag = this.defineApsTag();

            if (this.config.aps.enable && this.config.aps.libUrl) {
                window.apstag.init({
                    pubID: this.config.aps.pubId,
                    adServer: 'googletag'
                });

                ioneAds.loadScript(this.config.aps.libUrl, true);
            }

            if (window.ione_tag_manager && window.ione_tag_manager.sonobi_lib) {
                // Sonobi must be loaded syncronously (!) and before DFP!
                ioneAds.loadScript(window.ione_tag_manager.sonobi_lib);
            }

            if (window.ione_tag_manager && window.ione_tag_manager.indexexchange_lib) {
                // Index supports async, nice!
                ioneAds.loadScript(window.ione_tag_manager.indexexchange_lib, true);
            }
            // TODO delay 
            // ioneAds.loadScript('//www.googletagservices.com/tag/js/gpt.js', true);
            window.addEventListener( 'load', function() {
              setTimeout( function() {
                ioneAds.loadScript('//www.googletagservices.com/tag/js/gpt.js', true);
              }, 2000 );
            } );

            // Ensure all ad slots have been parsed before sending anything to DFP.
            $(document).ready(function() {
                ioneAds.refreshOnReady();
            });

            this.viewableTimeObserver = new ioneViewTimeTracker(this.config.viewableRefreshInterval,function(elementIds) {
                this.log('Refreshing', elementIds.join(', '), 'because of view time.');
                this.refreshSlots(elementIds, [['refresh', 'yes']]);
            }
            .bind(this));

            if (this.config.viewableRefreshInterval > 5) {
                this.viewableTimeObserver.init();
            }
        },

        isReady: function() {
            return ioneAds.ready;
        },

        isMobile: function() {
            return (true === ioneAds.config.isMobile);
        },

        isLazyloadEnabled: function() {
            return (true === ioneAds.config.lazyloadEnable);
        },

        loadScript: function(libUrl, loadAsync) {
            var node = document.getElementsByTagName('script')[0];
            var gads = document.createElement('script');

            gads.type = 'text/javascript';
            gads.src = libUrl;

            if (loadAsync) {
                gads.async = true;
            }

            node.parentNode.insertBefore(gads, node);
        },

        posShouldLazyLoad: function(posValue) {
            if (ioneAds.isMobile() && -1 !== ioneAds.config.lazyLoadPosMobile.indexOf(posValue)) {
                return true;
            }

            return (-1 !== ioneAds.config.lazyLoadPosDesktop.indexOf(posValue));
        },

        slotShouldLazyLoad: function(slot) {
            return (ioneAds.isLazyloadEnabled() && ioneAds.posShouldLazyLoad(slot.targets.pos));
        },

        defineSlot: function(slot) {
            if (ioneAds.slotConfig[slot.div]) {
                return;
            }

            ioneAds.slotConfig[slot.div] = slot;

            if (slot.event_render) {
                ioneAds.queueRenderOnEvent(slot.event_render, [slot.div]);
            } else if (ioneAds.slotShouldLazyLoad(slot)) {
                // Mark lazyloaded slots with a private event for grouping purposes.
                ioneAds.queueRenderOnEvent('_lazyload', [slot.div]);
                ioneAds.observer.observe(document.getElementById(slot.div));
            } else {
                ioneAds.defineSlotDfp(slot.div);
            }
        },

        defineSlotDfp: function(divId) {
            var slot = {};

            if (!ioneAds.slotConfig[divId] || ioneAds.isSlotDfpDefined(divId)) {
                return;
            }

            ioneAds.log('DFP define', divId);
            ioneAds.slotsDfpDefined.push(divId);
            ioneAds.viewableTimeObserver.observe(document.getElementById(divId));

            slot = ioneAds.slotConfig[divId];

            googletag.cmd.push(function() {
                var gptSlot;

                if (slot.sizes.length > 0) {
                    gptSlot = googletag.defineSlot(slot.path, slot.sizes, slot.div);
                } else {
                    gptSlot = googletag.defineOutOfPageSlot(slot.path, slot.div);
                }

                gptSlot.addService(googletag.pubads()).addService(googletag.companionAds());

                _.each(slot.targets, function(target, key) {
                    ioneAds.log('DFP targeting for', divId, ':', key, '=', target);
                    gptSlot.setTargeting(key, target);
                });

                renderedGptSlots[slot.div] = gptSlot;

                googletag.display(slot.div);
            });
        },

        apsSlotIds: function(slots) {
            return slots.map(function(slot) {
                return slot.slotID ? slot.slotID : null;
            });
        },

        apsSlotSupported: function(slot) {
            // Exclude 1x1 and out-of-page slots from APS.
            if (slot.targets && slot.targets.pos && slot.sizes.length) {
                return ('skin' !== slot.targets.pos);
            }

            return false;
        },

        apsDefineSlot: function(slot) {
            if (ioneAds.apsSlotSupported(slot)) {
                return {
                    slotID: slot.div,
                    slotName: slot.path,
                    sizes: slot.sizes,
                    slotParams: {
                        pos: slot.targets.pos
                    }
                };
            }

            return null;
        },

        apsSlotsFromDivIds: function(divIds) {
            var apsSlots = divIds.map(function(divId) {
                if (ioneAds.slotConfig[divId]) {
                    return ioneAds.apsDefineSlot(ioneAds.slotConfig[divId]);
                }

                return null;
            });

            return _.filter(apsSlots);
        },

        getDfpSlotByDivs: function(divIds) {
            if ('object' !== typeof divIds || !divIds.length) {
                return [];
            }

            return _.filter(divIds, function(divId) {
                return ('object' === typeof renderedGptSlots[divId]);
            }).map(function(divId) {
                return renderedGptSlots[divId];
            });
        },

        queueRenderOnEvent: function(eventName, divIds) {
            if (!ioneAds.eventsRender[eventName]) {
                ioneAds.eventsRender[eventName] = [];

                $(document).one(eventName, function() {
                    ioneAds.triggerRender(eventName);
                });
            }

            if (divIds.length) {
                ioneAds.log('Queueing', divIds.join(', '), 'to render on event', eventName);
                ioneAds.eventsRender[eventName] = ioneAds.eventsRender[eventName].concat(divIds);
            }
        },

        triggerRender: function(eventName) {
            if (ioneAds.eventsRender[eventName]) {
                ioneAds.refreshSlots(ioneAds.eventsRender[eventName]);
            }
        },

        isSlotRendered: function(divId) {
            return (-1 !== ioneAds.slotsRendered.indexOf(divId));
        },

        isSlotRenderOnEvent: function(divId) {
            var eventRenderSlotIds = ioneAds.getEventRenderSlotIds();

            return (-1 !== eventRenderSlotIds.indexOf(divId));
        },

        isSlotDfpDefined: function(divId) {
            return (-1 !== ioneAds.slotsDfpDefined.indexOf(divId));
        },

        shouldRefreshSlotOnViewability: function(divId) {
            return (!ioneAds.isSlotRendered(divId));
        },

        refreshOnReady: function() {
            var definedSlotIds = _.keys(ioneAds.slotConfig);
            var eventRenderSlotIds = ioneAds.getEventRenderSlotIds();
            var onloadSlotIds = _.difference(definedSlotIds, eventRenderSlotIds);
            var onReadySlotIds = ioneAds.getSlotIdsRenderedOnEvent('ione-document-ready');

            ioneAds.refreshSlots(onloadSlotIds.concat(onReadySlotIds));
        },

        getSlotIdsRenderedOnEvent: function(eventName) {
            if (ioneAds.eventsRender[eventName]) {
                return ioneAds.eventsRender[eventName];
            }

            return [];
        },

        getEventRenderSlotIds: function() {
            var divIds = [];

            _.each(ioneAds.eventsRender, function(refreshDivIds) {
                divIds = divIds.concat(refreshDivIds);
            });

            return divIds;
        },

        refreshSlots: function(divIds, targetingPairs) {
            // Ensure all slots are defined and marked as rendered.
            _.each(divIds, function(divId) {
                ioneAds.defineSlotDfp(divId);
                ioneAds.slotsRendered.push(divId);
            });

            ioneAds.fetchBids(divIds, function() {
                googletag.cmd.push(function() {
                    var dfpSlots = ioneAds.getDfpSlotByDivs(divIds);

                    if (targetingPairs && targetingPairs.length) {
                        _.each(targetingPairs, function(targetingPair) {
                            _.each(dfpSlots, function(dfpSlot) {
                                dfpSlot.setTargeting(targetingPair[0], targetingPair[1]);
                            });
                        });
                    }

                    if (dfpSlots.length) {
                        if (targetingPairs && targetingPairs.length) {
                            googletag.pubads().refresh(dfpSlots);
                        } else {
                            googletag.pubads().refresh(dfpSlots, {
                                changeCorrelator: false
                            });
                        }
                    }

                    ioneAds.log('DFP refreshing', divIds.join(', '));
                });
            }, ioneAds.config.bidTimeout);
        },

        fetchBids: function(divIds, callback, timeout) {
            var apsSlots = [];

            if (ioneAds.config.aps.enable) {
                apsSlots = ioneAds.apsSlotsFromDivIds(divIds);

                if (apsSlots.length) {
                    ioneAds.log('APS: Requesting bids:', ioneAds.apsSlotIds(apsSlots).join(', '));

                    return window.apstag.fetchBids({
                        slots: apsSlots,
                        timeout: timeout
                    }, function(bids) {
                        googletag.cmd.push(function() {
                            ioneAds.log('APS: Setting bids:', ioneAds.apsSlotIds(bids).join(', '));
                            window.apstag.setDisplayBids();
                            callback();
                        });
                    });
                }
            }

            return callback();
        },

        onLazyLoadCallback: function(entries, observer) {
            // @todo unobserve all divs that have been rendered.
            var divIdsVisible = _.filter(entries, function(entry) {
                return (entry.isIntersecting && ioneAds.shouldRefreshSlotOnViewability(entry.target.id));
            }).map(function(entry) {
                return entry.target.id;
            });

            if (divIdsVisible.length) {
                ioneAds.log('Refreshing', divIdsVisible.join(', '), 'because of viewability');
                ioneAds.refreshSlots(divIdsVisible);
            }
        },

        log: function() {
            if ('1' === window.ionegpt.debug) {
                window.console.log.apply(window.console, arguments);
            }
        },

        onDfpSlotRendered: function(event) {
            var slotDiv = event.slot.getSlotElementId();
            var postSponsorPostId = slotDiv.match(/div-gpt-post-sponsor-title-(\d+)/);

            if (!event.isEmpty && 'div-gpt-anchor' === slotDiv) {
                $('body').addClass('mobile-anchor-displayed');
            }

            if (!event.isEmpty && postSponsorPostId && postSponsorPostId.length) {
                $('.ione-widget-container .post-' + postSponsorPostId[1]).addClass('post-has-sponsor-ad');
            }
        },

        defineApsTag: function() {
            return {
                _Q: [],
                init: function() {
                    this._Q.push(['i', arguments]);
                },
                fetchBids: function() {
                    this._Q.push(['f', arguments]);
                },
                setDisplayBids: function() {},
                targetingKeys: function() {
                    return [];
                }
            };
        },

        queueApiTasks: {

            /**
			 * Disable the time-observed-based refresh for specific ad slots.
			 *
			 * @param {string} divId element ID attribute value.
			 */
            viewableTimeObserverDisableForSlot: function(divId) {
                var adSlotElement = document.getElementById(divId);

                if (adSlotElement && this.viewableTimeObserver && this.viewableTimeObserver.unobserve) {
                    ioneAds.log('Disabling viewable refresh for', divId);
                    this.viewableTimeObserver.unobserve(adSlotElement);
                }
            }

        },

        queueApiPush: function(task) {
            if (task && ioneAds.queueApiTasks && ioneAds.queueApiTasks[task]) {
                return ioneAds.queueApiTasks[task].apply(ioneAds, // Context for `this` passed to the task.
                [].slice.call(arguments, 1)// All but the first argument which is the task name.
                );
            }

            return null;
        }
    };

    if (window.ione_tag_manager) {
        if (window.ione_tag_manager.is_mobile) {
            adConfig.isMobile = true;
        }
        if (window.ione_tag_manager.lazyload_enable) {
            adConfig.lazyloadEnable = true;
        }
        if (window.ione_tag_manager.lazyload_pos_desktop) {
            adConfig.lazyLoadPosDesktop = window.ione_tag_manager.lazyload_pos_desktop;
        }
        if (window.ione_tag_manager.lazyload_pos_mobile) {
            adConfig.lazyLoadPosMobile = window.ione_tag_manager.lazyload_pos_mobile;
        }
        if ('number' === typeof window.ione_tag_manager.lazyload_margin) {
            adConfig.lazyloadMargin = window.ione_tag_manager.lazyload_margin;
        }
        if (window.ione_tag_manager.aps_lib) {
            adConfig.aps = {
                enable: window.ione_tag_manager.aps_enable,
                libUrl: window.ione_tag_manager.aps_lib,
                pubId: window.ione_tag_manager.aps_pub_id
            };
        }
        if (window.ione_tag_manager.viewable_refresh_interval) {
            adConfig.viewableRefreshInterval = window.ione_tag_manager.viewable_refresh_interval;
        }
    }

    ioneAds.init(adConfig);

    /**
	 * Implement a public API for ad related tasks.
	 *
	 * Sample usage in ad creatives:
	 *
	 * 	window.parent.ioneAdQueue = window.parent.ioneAdQueue || [];
	 *  window.parent.ioneAdQueue.push( 'taskName', 'arg1', 'arg2' );
	 *
	 * where the `taskName` is the key registered in ioneAds.queueApiTasks.
	 */
    window.ioneAdQueue = window.ioneAdQueue || [];
    window.ioneAdQueue.push = ioneAds.queueApiPush;

    googletag.cmd.push(function() {
        var cX;
        googletag.pubads().setTargeting('Test', window.ioneAdUtils.getEnvironment()).setTargeting('rosviews', window.ioneAdUtils.viewCount().toString()).setTargeting('utm_medium', window.ioneAdUtils.getUTM('utm_medium')).setTargeting('utm_campaign', window.ioneAdUtils.getUTM('utm_campaign')).setTargeting('referral_url', window.ioneAdUtils.getReferrer()).setTargeting('utm_source', window.ioneAdUtils.getUTM('utm_source'));

        if ('object' === typeof window.ionegpt && window.ionegpt.attrs) {
            _.each(ionegpt.attrs, function(value, key) {
                ioneAds.log('Global targeting:', key, '=', value);
                googletag.pubads().setTargeting(key, value);
            });
        }

        googletag.pubads().disableInitialLoad();
        googletag.pubads().collapseEmptyDivs(true);
        googletag.pubads().enableSingleRequest();
        googletag.pubads().enableVideoAds();
        googletag.companionAds().setRefreshUnfilledSlots(true);

        googletag.enableServices();

        googletag.pubads().addEventListener('slotRenderEnded', ioneAds.onDfpSlotRendered);
    });
}
)(jQuery);
;/*global window, document, */
(function(window) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        let sailthruWidget = document.querySelectorAll('#sailthru-subscribe-id--1');
        sailthruWidget.forEach(function(el, index) {
            el.id = '#sailthru-subscribe-id-' + index;
        });
    });
}
)(window);
;(function($) {
    "use strict";
    $(function() {
        $('#sailthru-modal').hide();

        $(".show_shortcode").on("click", function(e) {
            e.preventDefault();
            var posTop = $(this).offset().top;
            var modal = $("#sailthru-modal");
            modal.css("top", '100px');
            modal.css("left", Math.max(0, (($(window).width() - $(modal).outerWidth()) / 2) + $(window).scrollLeft()) + "px");

            $('.sailthru_shortcode_hidden .sailthru-signup-widget-close').show();
            modal.fadeIn();

        });

        $('#sailthru-modal .sailthru-signup-widget-close').click(function() {
            $('#sailthru-modal ').fadeOut();
        });

        // when a user clicks subscribe
        $(".sailthru-add-subscriber-form").submit(function(e) {

            e.preventDefault();
            var user_input = $(this).serialize();
            var form = $(this);
            $.ajax({
                url: sailthru_vars.ajaxurl,
                type: 'post',
                data: user_input,
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: function(data, status) {
                    if (data.success == false) {
                        $('#' + form.attr('id') + " .sailthru-add-subscriber-errors").html(data.message);
                    } else {
                        $('#sailthru-modal .sailthru-signup-widget-close').fadeIn();
                        $(form).html('');
                        $(form).parent().find(".success").show();
                    }
                }
            });

        });

    });
}(jQuery));
;
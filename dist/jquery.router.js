(function ($) {
    $.router = $.extend({}, {routes: {}, current: {uri: "", url: ""}, hashed: true});
    $.router.add = function (uri, callback) {
        if (uri.lastIndexOf("/") == uri.length - 1) {
            uri = uri.substring(0, uri.length - 1);
        }
        var isRoot = uri.indexOf("/") == 0;
        if (!isRoot) {
            uri = this.current.uri + "/" + uri;
        }
        this.routes[uri] = {
            uri: uri,
            parts: uri.substr(1).split("/"),
            callback: callback,
            parent: isRoot ? "" : this.current.uri
        };
        if (!this.hashed) {
            handle(window.location.hash);
        }
    };
    $.router.remove = function (uri) {
        var isRoot = uri.indexOf("/") == 0;
        if (isRoot) {
            var todoDelStates = [];
            $.each(this.routes, function (k, v) {
                if (uri == v.parent) {
                    todoDelStates.push(k);
                }
            });
            $.each(todoDelStates, function (i, v) {
                delete this.routes[v];
            });
        } else {
            uri = this.current.uri + "/" + uri;
        }
        delete $.router.routes[uri];
    };

    var handle = function (url) {
        var router = $.router;
        router.hashed = false;

        url = url.replace(/#/g, "");
        var todo = {route: undefined, params: undefined, matchParts: undefined};
        todo.route = router.routes[url];
        if (todo.route === undefined) {
            var tochks = [];
            if (url.indexOf(router.current.url) == 0) {
                if (url.length == router.current.url.length) {
                    tochks.push(router.routes[router.current.uri]);
                } else {
                    $.each(router.routes, function (k, v) {
                        if (router.current.uri == v.parent) {
                            tochks.push(v);
                        }
                    });
                }
            } else {
                $.each(router.routes, function (k, v) {
                    tochks.push(v);
                });
                url = url.substr(router.current.url + 1);
            }
            var urlParts = url.substr(1).split("/");
            var urlPartsLen = urlParts.length;
            for (var i = 0, l = tochks.length; i < l; i++) {
                var uriParts = tochks[i].parts;
                var params = {};
                var match = false;
                var matchParts = [];
                for (var j = 0, k = uriParts.length; j < k; j++) {
                    if (j < urlPartsLen) {
                        if (urlParts[j] == uriParts[j]) {
                            match = true;
                            matchParts.push(urlParts[j]);
                        } else {
                            if (uriParts[j].indexOf(':') == 0) {
                                params[uriParts[j].substr(1)] = decodeURI(urlParts[j]);
                                match = true;
                                matchParts.push(urlParts[j]);
                            } else {
                                match = false;
                                break;
                            }
                        }
                    } else {
                        if (j > 0) {
                            match = true;
                        }
                        break;
                    }
                }
                if (match) {
                    todo.route = tochks[i];
                    todo.params = params;
                    todo.matchParts = matchParts;
                }
            }
        }
        if (todo.route) {
            var matchUrl = todo.matchParts ? "/" + todo.matchParts.join("/") : null;
            router.hashed =  matchUrl == url;
            router.current = {uri: todo.route.uri, url: todo.matchParts ? matchUrl : url};
            todo.route.callback(todo.params);
        }
    };
    $(window).bind('hashchange', function () {
        handle(window.location.hash);
    });
    var hashurl = window.location.hash.replace(/#/g, "");
    if (hashurl) {
        handle(hashurl);
    }
}(jQuery));
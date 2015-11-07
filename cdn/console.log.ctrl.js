javascript: ! function () {
    window.originalConsole = window.console;
    window.console = {};
    var $ = function (selector) {
        if (typeof selector == 'string') return document.querySelector(selector);
        return selector
    }
 
    var var_dump = function (command, context, parents, n) {
        if(!command || (typeof command == 'string' && command.length == 0)) return command;
        var context = context || window;
        var parents = parents || '';
        var n = (n==0?0:n) || 1;

        var startTime = new Date();
        var line_count = 0;
        var thisFunction = arguments.callee;
        var text = '';
        var obj = null;
        var isVisited = false;
        var fullname = '';
 
        try {
            obj = line_count == 0 ? eval.call(context, command) : command;
        } catch (e) {
            return e
        }
 
        line_count == 0 && (thisFunction.historyArguments = []);
        thisFunction.historyArguments.push(obj);
 
        if (typeof obj == 'string') return '\"' + obj + '\"';
        if (typeof obj != 'object') return obj;
 
        if (obj && isArray(obj)) {
            text = '[' + function () {
                if (obj.length >= 2) {
                    return obj.reduce(function (preVal, curVal) {
                        return function () {
                            if (typeof preVal != 'object') return preVal;
                            return thisFunction(preVal, obj, '', 0)
                        }() + ',' + function () {
                            if (typeof curVal == 'string') return '\"' + curVal + '\"';
                            if (typeof curVal != 'object') return curVal;
                            return thisFunction(curVal, obj, '', 0)
                        }()
                    });
                } else if (obj.length == 1) {
                    return thisFunction(obj[0], obj, '', 0)
                } else {
                    return ''
                }
            }() + ']';
            line_count++;
            return text
        }
 
        if (obj && (typeof obj == 'object')) {
            if (n <= 0) return obj;
            for (i in obj) {
                isVisited = thisFunction.historyArguments.indexOf(obj[i]) != -1;
                fullname = (parents != '' ? parents + '.' : '') + i;
 
                text += (fullname + ': ' + function () {
                    if (typeof obj[i] == 'string') return '\"' + obj[i] + '\"';
                    if (typeof obj[i] != 'object') return obj[i];
                    if (n <= 1) return obj[i];
                    if (isVisited) return obj[i];
                    return '\n' + thisFunction(obj[i], obj, fullname, n - 1)
                }() + '\n');
 
                line_count++;
            }
            return text
        }
    };
 
    var t = textarea = document.createElement("textarea");
    textarea.id = "yuan_console";
    var first_line = '  ------ from Yuanoook.com ------ \n> ';
 
    textarea.val = function () {
        if (arguments.length == 0) {
            return textarea.value
        } else {
            textarea.value = arguments[0];
            return textarea.ready();
        }
    }
 
    textarea.css = function () {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'string') return textarea.style[arguments[0]];
            if (typeof arguments[0] == 'object') {
                for (i in arguments[0]) {
                    textarea.style[i] = arguments[0][i]
                }
                return textarea
            }
        } else if (arguments.length == 2) {
            textarea.style[arguments[0]] = arguments[1];
            return textarea;
        }
    }

    textarea.attr = function () {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'string') return textarea.getAttribute(arguments[0]);
            if (typeof arguments[0] == 'object') {
                for (i in arguments[0]) {
                    textarea.setAttribute(i, arguments[0][i])
                }
                return textarea
            }
        } else if (arguments.length == 2) {
            textarea.setAttribute(arguments[0], arguments[1]);
            return textarea;
        }
    }
 
    textarea.appendTo = function () {
        $(arguments[0]).appendChild(textarea);
        return textarea
    }
 
    textarea.on = function () {
        var events = arguments[0].split(' ');
        var handler = arguments[1];
        events.forEach(function (event) {
            textarea.addEventListener(event, handler);
        });
        return textarea;
    }
 
    textarea.write = function (params) {
        return textarea.val(function () {
            if (t.value.length == t.selectionEnd) return t.value;
            return t.value.substring(0, t.selectionStart).replace(/\n$/, '') + t.value.substring(t.selectionStart)
        }().replace(/\n>\s$|\n$|$/, (params.islog ? '\n  ' : '\n< ')) + params.msg + '\n> ').ready();
    }
 
    textarea.clear = function () {
        return textarea.val(first_line).ready();
    }
 
    textarea.absClear = function () {
        return textarea.val('> ').ready();
    }
 
    textarea.fix = function () {
        return textarea.val(t.value.replace(/\n$/, '')).ready();;
    }
 
    textarea.big = function () {
        return textarea.css({
            top: 0,
            width: '100%',
            height: '100%'
        }).ready();
    };
 
    textarea.ready = function () {
        textarea.selectionStart = textarea.selectionEnd = t.value.length;
        textarea.scrollTop = textarea.scrollHeight;
        textarea.focus();
        return textarea
    }
 
    textarea.burger = function () {
        textarea.css({
            top: '33%',
            height: '33%'
        });
        if (arguments.length == 1) {
            textarea.css({
                width: '50%'
            })
            if (arguments[0] == 'left') {
                return textarea.css({
                    left: 0,
                    right: '50%'
                }).ready()
            } else if (arguments[0] == 'right') {
                return textarea.css({
                    left: '50%',
                    right: 0
                }).ready()
            }
        }
        return textarea.css({
            width: '100%',
            left: 0,
            right: 0
        }).ready()
    }
 
    textarea.small = function () {
        return textarea.css({
            left: 0,
            top: '47%',
            width: '100px',
            height: '15px'
        });
    };
 
 
    textarea.init = function () {
        textarea.n = 1;
        return textarea.css({
            position: 'fixed',
            left: 0,
            border: 0,
            outline: 'none',
            background: 'black',
            color: 'white',
            fontFamily: 'Consolas,Liberation Mono,Menlo,Courier,Microsoft Yahei,monospace',
            zIndex: 100000000000
        }).burger().clear().appendTo($('body')).ready();
    }
 
    textarea.on('keyup', function (event) {
        if (event.keyCode != 13 && event.keyCode != 8) return;
 
        var command, result;
        var n = textarea.n;
 
        if (event.keyCode == 13) {
 
            command = function () {
                return ( function(){
                    var subCommand = t.value.substring(0, t.selectionStart).match(/>\s([^\n]*?)\n$/);
                    return (subCommand ? subCommand[1] : '')
                }() + function () {
                    var subCommand = t.value.substring(t.selectionStart).match(/^(.*)/);
                    return (subCommand ? subCommand[1] : '')
                }() ).replace(/^\s*|\s*$/g, '');
            }();
 
            if (command == '') {
                textarea.fix();
                return
            } else if (command == ',') {
                textarea.absClear();
                return
            } else if (command == ';') {
                textarea.small().val(t.value.replace(/;\n$/, ''));;
                return
            } else if (command == ';;') {
                textarea.big().val(t.value.replace(/;;\n$/, ''));
                return
            } else if (command == ';;;') {
                textarea.burger().val(t.value.replace(/;;;\n$/, ''));
                return
            } else if (command == ';;;;') {
                textarea.burger('left').val(t.value.replace(/;;;;\n$/, ''));
                return
            } else if (command == ';;;;;') {
                textarea.burger('right').val(t.value.replace(/;;;;;\n$/, ''));
                return
            } else if (command.replace(/;$/, '') == "clear()" && typeof clear == 'undefined') {
                textarea.clear();
                return
            } else if (/^\?/.test(command)) {
                n = Math.abs(parseInt(command.replace(/^\?/, '')));
                textarea.n = n == 0 ? 0 : (n ? n : 1);
                textarea.val(t.value.replace(/\n$/, '\n> '));
                console.log('------ export deepness: ' + textarea.n + ' -----');
                return
            } else if (isUrl(command)) {
                insertScript(command);
                return
            }
 
            result = var_dump(command, window, '', textarea.n);
 
            if (typeof result == 'string') result = result.replace(/\n*$/, '').replace(/\n/g, '\n  ');
 
            textarea.write({
                'msg': result,
                'islog': false
            });
        } else if (event.keyCode == 8) {
 
        }
 
    });

    textarea.on('resize',textarea.ready );
 
    window.console.log = function (msg) {
        if (arguments.length == 0) return;
        textarea.write({
            'msg': function(){
                if(typeof msg == 'string') return msg;
                else msg = var_dump(msg);
                return typeof msg == 'string' ? msg.replace(/\n([^\s])/g,'\n  $1') : msg
            }(),
            'islog': true
        });
        originalConsole.log(msg);
    };
 
    window.console.clear = function () {
        textarea.clear();
        textarea.write({
            'msg': 'Console was cleared',
            'islog': true
        });
        originalConsole.clear();
    };
 
    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
 
    function isUrl(url) {
        return /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i.test(url)
    }
 
    function insertScript(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.addEventListener('load', function () {
            console.log(url + ' 准备就绪！');
            callback && callback()
        });
        $('body').appendChild(script)
    }
 
    if(document.readyState=='complete') textarea.init();
    else document.addEventListener('readystatechange', function () {
        if (document.readyState != 'complete') return;
        textarea.init()
    });
 
    window.addEventListener('resize',textarea.ready);
 
    window.addEventListener('error', function (e) {
        console.log( e );
    })
}();

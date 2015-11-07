!function(b){!function(Ajs) {
                var oScript = document.createElement("script");
                oScript.src = Ajs.shift();
                oScript.charset = 'utf-8';
                b.appendChild(oScript);
                console.log("正在加载：" + oScript.src);
                Ajs.length && (oScript.onload = arguments.callee.bind(null, Ajs)); ! Ajs.length && alert('yuan.layout.js ready');
        }([
        	"http://www.yuanoook.com/cdn/jquery.min.js",
     		"http://www.yuanoook.com/cdn/drag.live.js",
        	"http://www.yuanoook.com/cdn/yuan.layout.js"
        ]);
}(document.body || document.querySelector('body'));
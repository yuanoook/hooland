/*! drag.js v0.1 | (c)  2015 yuanoook.com | HowToUse → http://github.com/yuanoook.com/drag */
!function(){

var z=1;

function Drag()
{
	//初始化
	this.initialize.apply(this, arguments)
}
Drag.prototype = {
	//初始化，接收各种参数。比如：拖拽句柄，限制容器，是否限制/是否锁定，开始拖拽/正在拖拽/拖拽结束 的回调函数
	initialize : function (drag, options)
	{
		this.drag = this.$(drag);
		this._x = this._y = 0;
		this._moveDrag = this.bind(this, this.moveDrag); //指定方法的
		this._stopDrag = this.bind(this, this.stopDrag);
		
		this.setOptions(options);
		
		this.handle = this.$(this.options.handle);
		this.maxContainer = this.$(this.options.maxContainer);
		
		this.maxTop = Math.max(this.maxContainer.clientHeight, this.maxContainer.scrollHeight) - this.drag.offsetHeight;
		this.maxLeft = Math.max(this.maxContainer.clientWidth, this.maxContainer.scrollWidth) - this.drag.offsetWidth;
		
		this.limit = this.options.limit;
		this.lockX = this.options.lockX;
		this.lockY = this.options.lockY;
		this.lock = this.options.lock;
		
		this.onStart = function(){ eval('!'+this.options.onStart+'()') };
		this.onMove = function(){ eval('!'+this.options.onMove+'()') };
		this.onStop = function(){ eval('!'+this.options.onStop+'()') };
		
        //*********************************
        //changeLayout 的主要作用就是把目标块儿拽出来，执行绝对定位
        //这里可能出现的问题是，破坏了正常的文档流
        //最好的处理方式，在后面不接其他兄弟元素
        //*********************************
		this.changeLayout();
		
		this.addHandler(this.handle, "mousedown", this.bind(this, this.startDrag));
		this.addHandler(this.handle, "touchstart", this.bind(this, this.startDrag));

        //*******************关键技术：如何强制传递的函数在确定的上下文中运行*************
        
        //有时候，我们传递给某某一个函数，希望他在指定的上下文中运行
        //上面这一行的 bind 字眼，很重要。它让我们处理调用函数的时候，在指定上下文中运行。
        //下面的代码可以替代掉上面的一行代码
		//this.addHandler(this.handle, "mousedown", this.startDrag.bind(this))
        //下次在处理 setTimeout setInterval 的时候，可以采取这种方式

        //其实，这是一种 GOTO 语句的变相实现，但是 GOTO 语句显得太随便了
        //需要复杂一点，却又更灵活，来限制很掌控这种 类GOTO 语句的使用

        //********************************************************************************
	},
	changeLayout : function ()
	{
		this.drag.style.top = this.drag.offsetTop + "px";
		this.drag.style.left = this.drag.offsetLeft + "px";
		this.drag.style.position = "absolute";
		this.drag.style.margin = "0"
	},
    //**********************************
    //mousedown 之后开始执行 startDrag
    //**********************************
	startDrag : function (event)
	{
		this.handle.style.cursor = "move";
		var event = event || window.event;
		
        //event.clientX 鼠标/触摸 事件相对于当前 "客户可视窗口（包括 iframe）" 的 X 坐标
        //event.screenX 鼠标/触摸 事件相对于当前 "屏幕显示器窗口"              的 X 坐标
        //event.offsetX 鼠标/触摸 事件相对于当前 "具体事件对象"                的 X 坐标
        //参考 http://www.w3school.com.cn/jsref/dom_obj_event.asp
		
		this.point(event);

		this._x = this.clientX - this.drag.offsetLeft;
		this._y = this.clientY - this.drag.offsetTop;

		
        //绑定 document 的 mousemove 和 mouseup

		this.addHandler(document, "mousemove", this._moveDrag);
		this.addHandler(document, "mouseup", this._stopDrag);
		this.addHandler(document, "touchmove", this._moveDrag);
		this.addHandler(document, "touchend", this._stopDrag);
		
        //event.preventDefault 表示阻止事件的默认操作 prevent 阻止 default 默认操作
        //参考 http://www.w3school.com.cn/jsref/event_preventdefault.asp

        //this.handle.setCapture 表示设置鼠标事件捕获 不论鼠标事件是否在当前目标区域内发生
        //参考 http://baike.baidu.com/view/1080215.htm?fr=aladdin
        this.drag.style.zIndex = z++;
		event.preventDefault && event.preventDefault();
		event.cancelBubble = true;
		this.handle.setCapture && this.handle.setCapture();
		
        //开始拖拽时，执行相关回调函数
		this.onStart()
	},
	moveDrag : function (event)
	{
		var event = event || window.event;
		
		this.point(event);

		//确定相对位置
		var iTop = this.clientY - this._y;
		var iLeft = this.clientX - this._x;

		if (this.lock) return; //如果被锁定，直接回去。
		
		this.limit && (iTop < 0 && (iTop = 0), iLeft < 0 && (iLeft = 0), iTop > this.maxTop && (iTop = this.maxTop), iLeft > this.maxLeft && (iLeft = this.maxLeft)); //如果有边界限制，执行防溢界处理
		
		this.lockY || (this.drag.style.top = iTop + "px"); //如果 锁定了 Y 轴，那么将不会执行 top 偏移
		this.lockX || (this.drag.style.left = iLeft + "px"); //如果 锁定了 X 轴，那么将不会执行 left 偏移
		
		event.preventDefault && event.preventDefault();
		event.cancelBubble = true;
		
        //正在拖拽时，执行相关回调函数
		this.onMove()
	},
	stopDrag : function ()
	{
		this.handle.style.cursor = "default";
		this.removeHandler(document, "mousemove", this._moveDrag);
		this.removeHandler(document, "mouseup", this._stopDrag);
		this.removeHandler(document, "touchmove", this._moveDrag);
		this.removeHandler(document, "touchend", this._stopDrag);
		
		this.handle.releaseCapture && this.handle.releaseCapture();
		
        //停止拖拽时，执行相关回调函数
        this.drag.focus();
		this.onStop()
	},
	//参数设置，参数初始化，这里的策略非常厉害，先初始化默认参数，然后再把传入的参数有的，改过来。
	setOptions : function (options)
	{
		this.options =
		{
			handle:			this.drag, //事件对象
			limit:			false, //锁定范围
			lock:			false, //锁定位置
			lockX:			false, //锁定水平位置
			lockY:			false, //锁定垂直位置
			maxContainer:	document.documentElement || document.body, //指定限制容器
			onStart:		function () {}, //开始时回调函数
			onMove:			function () {}, //拖拽时回调函数
			onStop:			function () {}  //停止时回调函数
		};
		for (var p in options) this.options[p] = options[p]
	},
    

    //下面是定义的一些基础工具，包括元素选择器，事件绑定与解绑。

	//获取id
	$ : function (id)
	{
		return typeof id === "string" ? document.getElementById(id) : id
	},
	//添加绑定事件
	addHandler : function (oElement, sEventType, fnHandler)
	{
		return oElement.addEventListener ? oElement.addEventListener(sEventType, fnHandler, false) : oElement.attachEvent("on" + sEventType, fnHandler)
	},
	//删除绑定事件
	removeHandler : function (oElement, sEventType, fnHandler)
	{
		return oElement.removeEventListener ? oElement.removeEventListener(sEventType, fnHandler, false) : oElement.detachEvent("on" + sEventType, fnHandler)
	},
	//绑定事件到对象
    //这个初看起来很多余，但是实际上很有用，它所起到的作用就是，指定了函数的作用域链。
    //让函数确定无疑的在某种上下文中执行，而不是在调用环境中
    //当然这在 全局作用域 window/global下面、函数体没有使用到 this 关键字 等情况下是看不出差异的
    //但有时候我们调用函数，会丢失掉我们想要的上下文情景，比如说在 事件绑定/setInterval/setTimeout
    //特别是在处理闭包、即是说函数调用的环境和函数定义的环境不一样的时候，就必须用到
    //
    //在新的 ECMAScript5 （ IE9+支持 ） 中，这里其实没有必要这么麻烦，因为有新的 Function.bind(obj)
	bind : function (object, fnHandler)
	{
        if(fnHandler.bind) return fnHandler.bind(object); //( Function.bind 乃 ECMAScript 5 新增、IE9+ 支持 )
		return function ()
		{
			return fnHandler.apply(object, arguments)
		}
	},

	point : function( event ){
		this.clientX = (event.clientX===0 ? .00001 : event.clientX) || event.targetTouches[0].clientX;
		this.clientY = (event.clientY===0 ? .00001 : event.clientY) || event.targetTouches[0].clientY;
	}
};

function letsDrag(x){
	var me = arguments.callee;

	var oDrags = me.oDrags || [];
	me.oDrags =  document.querySelectorAll("[data-drag]");

	oDrags = [].filter.call(me.oDrags, function(oDrag){
		return [].indexOf.call(oDrags,oDrag) == -1; 
	});

	[].forEach.call(oDrags,function(oDrag){
		eval("options = " + (oDrag.getAttribute('data-drag') || "{}") );
		new Drag(oDrag,options);
	})
}

var addHandler = Drag.prototype.addHandler;

addHandler(window, 'message', function(event){
	if( event.data == 'letsDrag' ) letsDrag();
});

addHandler(window, 'load', function(){
	window.postMessage('letsDrag','*');
});

}(window);
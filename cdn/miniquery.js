!function (E) {
    E.prototype.css = function () {
     	if (arguments.length == 1){       
	        if (typeof arguments[0] == 'string') return this.style[arguments[0]] || getComputedStyle(this)[arguments[0]];
            if (typeof arguments[0] == 'object') {
                for (i in arguments[0]) {
                    this.style[i] = arguments[0][i]
                }
                return this 
            }
        } else if (arguments.length == 2) {
            this.style[arguments[0]] = arguments[1];
            return this;
        }
    }
 
    E.prototype.attr = function () {
        if (arguments.length == 1) {
            if (typeof arguments[0] == 'string') return this.getAttribute(arguments[0]);
            if (typeof arguments[0] == 'object') {
                for (i in arguments[0]) {
                    this.setAttribute(i, arguments[0][i])
                }
                return this;
            }
        } else if (arguments.length == 2) {
            this.setAttribute(arguments[0], arguments[1]);
            return this;
        }
    }

    E.prototype.hasClass = function(){
        return new RegExp('(^|\\s+)'+arguments[0]+'(\\s+|$)').test( this.attr('class') )
    }

    E.prototype.removeClass = function(){
        if(!this.hasClass(arguments[0])) return this;
        return this.attr('class', this.attr('class').replace(new RegExp('(^|\\s+)'+arguments[0]+'(\\s+|$)'),' ').replace(/(^\s*)|(\s*$)/g,""))
    }

    E.prototype.addClass = function(){
        if(this.hasClass(arguments[0])) return this;
        return this.attr('class', this.attr('class').replace(/\s*$/,' ' + arguments[0]).replace(/(^\s*)|(\s*$)/g,""))
    }

    E.prototype.toggleClass = function(){
        return this.hasClass(arguments[0]) ? this.removeClass(arguments[0]) : this.addClass(arguments[0]);
    }

    E.prototype.appendTo = function () {
        arguments[0].appendChild(this);
        return this
    }

    E.prototype.append = function () {
        this.appendChild(arguments[0]);
        return this
    }
 
    E.prototype.on = function () {
        var that = this;
        var events = arguments[0].split(' ');
        var handler = arguments[1];
        events.forEach(function (event) {
            that.addEventListener(event, handler);
        });
        return this;
    }

    E.prototype.html = function () {
        if (arguments.length == 0) {
            return this.innerHTML
        } else if (arguments.length == 1) {
            this.innerHTML = arguments[0];
            return this;
        }
    }

    E.prototype.click = function () {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", true, false);
        this.dispatchEvent(evt);
        return this;
    }

    E.prototype.lclick = function (info) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("lclick", true, false);

        if(info){
            this.lclickInfo = info;
        }

	console.log(info);

        this.dispatchEvent(evt);
        return this;
    }

    E.prototype.remove = function(){
        this.parentElement.removeChild(this);
    }

    E.prototype.moveTo = function(pos){
        var oThis = this.css('z-index', z++);
        clearInterval(this.timer);
        this.timer = setInterval(doMove, 30);

        function doMove(){
            var bEnd = true,
                cTop = parseInt(oThis.css('top')),
                cLeft = parseInt(oThis.css('left'));

            var tSpeed = (pos.top - cTop)/4,
                lSpeed = (pos.left - cLeft)/4;

                tSpeed = tSpeed > 0 ? Math.ceil(tSpeed) : Math.floor(tSpeed);
                lSpeed = lSpeed > 0 ? Math.ceil(lSpeed) : Math.floor(lSpeed);

            pos.top == cTop || (bEnd = false, oThis.css('top', (parseInt(oThis.css('top')) + tSpeed) + 'px'));
            pos.left == cLeft || (bEnd = false, oThis.css('left', (parseInt(oThis.css('left')) + lSpeed) + 'px'));

            bEnd && clearInterval(oThis.timer);
            dontBeShy(oThis);
        }

        return this;
    }

    E.prototype.travel = function(pos,speed){
        tmp.css({
            top: pos.top + 'px',
            left: pos.left + 'px'
        });

        var oThis = this.css('z-index', z++),
            Gm = 10000,
            cPos = {
                top: parseInt(oThis.css('top')),
                left:parseInt(oThis.css('left'))
            }

        clearInterval(this.timer);
        this.timer = setInterval(doMove, 30);

        function doMove(){
            var r = Math.sqrt( Math.pow(cPos.top-pos.top,2) + Math.pow(cPos.left-pos.left,2) );
            var g = Gm/(r*r);
            var a = {
                v: g*(pos.top - cPos.top)/r,
                h: g*(pos.left- cPos.left)/r
            }

            speed.v += a.v;
            speed.h += a.h;

            cPos = {
                top: cPos.top + speed.v,
                left:cPos.left + speed.h
            }
            oThis.css({
                top: cPos.top + 'px',
                left: cPos.left + 'px'
            });

            cPos.top==pos.top && cPos.left==pos.left && clearInterval(oThis.timer);
        }
    }

}(window.Element);

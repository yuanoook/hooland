function onMove(){
    //console.log(new Date().getTime() + ' : top ' + $('[data-drag').position().top + ' left ' + $('[data-drag').position().left );
}

!function($){
    $.prototype.extend({
        clip:function(top,right,bottom,left){
            return $(this).css('clip','rect('+top+'px,'+right+'px,'+bottom+'px,'+left+'px)');
        }
    });
}(jQuery);

$(function(){
    $('#add_local_img').on('change',function(){
        var fakeUrl = getFileUrl( $(this).attr('id') );
        importLayout( fakeUrl );
    });

    $(window).on('dragover',function(event) {
        return false;
    });

    $(window).on('drop',function(event) {
        event = event.originalEvent;
        var img_file = event.dataTransfer.files.item(0);
        var position = {x:event.clientX, y:event.clientY};

        fReader = new FileReader();
        fReader.readAsDataURL(img_file);
        fReader.onload = function(event) {
            importLayout( event.target.result , position );
        };
        return false;
    });
});

function importLayout( src, position ){
    var position = position || {x:0, y:0};
    var img = new Image();
    img.src = src;
    if (img.complete) {
		setLayout( img, position );
	} else {
		img.onload = function () {
			setLayout( img, position );
			img.onload = null;
		};
	};
};

function setLayout( layout, position ){
    var stage = $('div#yuan_layout').length == 0 ? $('<div>').attr('id','yuan_layout') : $('div#yuan_layout');

    stage.css({
        position:'fixed',
        top: 0,
        left: 0,
        overflow: 'visible',
        zIndex: 100000000000000
    }).appendTo( $('body') );

    var layoutCopy = "";
    layoutCopy  += "<div class='posa hide' data-drag='{onMove:onMove}'>";
    layoutCopy  +=      "<div class='posa'></div>";
    layoutCopy  += "</div>";

    var layer = $( layoutCopy );

    var target = layer.clone().removeClass('hide').css({
        position: 'absolute',
        top: position.y-layout.height/2 || 0,
        left: position.x-layout.width/2 || 0
    }).appendTo( stage );
    var goal = target.children().eq(0).css({
        position: 'absolute'
    });

    target.add(goal).css({
        width: layout.width + 'px',
        height: layout.height + 'px'
    }).clip(0,layout.width,layout.height,0);

    target.css('background', '-webkit-linear-gradient(top, rgba(0,0,0,.7),rgba(0,0,0,.7)),' + 'url(' + layout.src + ')');

    goal.css('background-image', 'url(' + layout.src + ')').on('dblclick', function(){
        target.clip(0,layout.width,layout.height,0);

        $('<div>').css({
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            opacity: 0,
            cursor: 'crosshair',
            zIndex: 1000000000000000
        }).on('mousedown touchstart',function(event){
            $(this).css('cursor', 'crosshair');

            point(event);

            this._x = event.clientX;
		    this._y = event.clientY;
            
            var helper = $('<div>').css({
                position: 'absolute',
                boxSizing: 'border-box',
                top: this._y,
                left: this._x,
                width: 0,
                height: 0,
                border: '1px dotted #fff'
            }).insertAfter(this);

            $(this).on('mousemove touchmove', function(event){

                point(event);

                helper.css({
                    top: Math.min(event.clientY, this._y),
                    left: Math.min(event.clientX, this._x),
                    width: Math.abs(event.clientX - this._x),
                    height: Math.abs(event.clientY - this._y)
                });
            }).on('mouseup touchend', function(){

                var t = target.position();
                t.width = target.width(), t.height = target.height();
                var h = helper.position();
                h.width = helper.width(), h.height = helper.height();

                var top = h.top - t.top;
                var left = h.left - t.left;
                var bottom = top + h.height;
                var right = left + h.width;

                top = Math.max(top, 0);
                left = Math.max(left, 0);
                bottom = Math.min(bottom, t.height);
                right = Math.min(right, t.width);

                if(right - left < 20 || bottom-top < 20) return helper.remove();
                /*
                goal.click(function(){
                    target.clip(top, right, bottom, left);
                    $(this).css('cursor','move');
                }).clip(top, right, bottom, left).css('cursor','pointer');
                */

                goal.add(target).clip(top, right, bottom, left);

                helper.remove();
                $(this).remove();
            });
        }).insertAfter(target);
        
        return false;
    });

    window.postMessage('letsDrag','*');
}

function point( event ){
        event.clientX = (event.clientX===0 ? .00001 : event.clientX) || event.targetTouches[0].clientX;
        event.clientY = (event.clientY===0 ? .00001 : event.clientY) || event.targetTouches[0].clientY;
}
 
function getFileUrl(sourceId){
    return window.URL.createObjectURL($('#'+sourceId)[0].files[0]);
}
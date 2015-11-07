javascript:!function(){
	if(/ipaiban/.test(location.host)){
		fix_img('editor');
	}else if(/135editor/.test(location.host)){
		fix_img('WxMsgContent');
	}

	function fix_img(editorName){
		//return alert('暂时不能使用，正在拼命维修..');
		var mtb = prompt('请输入图片上下间距 \(px\) \n或者不填写，将会在图片上下添加换行\n');
		var editor = UE.getEditor( editorName );
		var content = editor.getContent();

		var tmpDiv = $('<div>').append( $(content) );
		var imgs = tmpDiv.find('img');
		imgs.prev('br').remove();
		imgs.next('br').remove();
		imgs.css('margin','0');
		content = tmpDiv.html();		

		if( parseInt(mtb)==mtb ){
			content = $('<div>').append( $(content) ).find('img').css('margin',mtb+'px 0').end().html();
		}else{
			content = $('<div>').append( $(content) ).find('img').after( $('<br/>') ).before('<br/>').end().html();
		}
		editor.setContent( content );
	}
}();

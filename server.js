var http = require('http');
var url = require('url');

function start(route, handle){
	var server = http.createServer(onRequest);
	server.listen(80);
	
	function onRequest(request,response){
		var sub_pathname = url.parse(request.url).pathname.split('/')[1];
	    request.query = url.parse(request.url, true).query;
		route(handle, sub_pathname, response, request);
	}
}
exports.start = start;
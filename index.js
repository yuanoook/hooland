var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {};
for (var i in requestHandlers) handle[i] = requestHandlers[i];

server.start(router.route, handle);
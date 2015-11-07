var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 7000}),
    mongo = require('./mongoServer'),
    pool = [];

wss.on('connection', function(ws) {
    pool.push(ws);
    ws.on('message', function(message) {
    	var arg = JSON.parse(message);

        if(arg.remove){
            for(i in pool) pool[i].send(JSON.stringify(arg));
            return;
        }

    	arg.success = function(results){
    		for(i in pool) pool[i].send(JSON.stringify([results, message]));
    	};
    	arg.fail = function(err){
    		ws.send(JSON.stringify(err));
    	};
    	mongo.update(arg);
    });
    ws.on('close', function(message) {
        var i = pool.indexOf(ws);
        i>-1 && pool.splice(i,1);
    });
});

function wwsfly(){
	console.log('wwsfly');
}

module.experts = wwsfly;

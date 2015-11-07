var fs = require('fs'),
	formidable = require('formidable'),
    mongo = require('./mongoServer'),
    gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick : true });

var path = './files/';
var thumb = './thumbnail/';

    flyWssPrepare();

function index(response){
	var head = fs.readFileSync('./html/head.html','utf-8'); 
	var foot = fs.readFileSync('./html/foot.html','utf-8');
	var html;
	fs.readFile('./html/space.html','utf-8',function(err,content){  
    	if(err){  
			res(response,500,'text/plain',JSON.stringify(err))
    	}else{
    		html = head + content + foot;
			res(response,200,'text/html; charset=utf-8',html)
    	}  
	});
}

function flyWssPrepare(){
    var WebSocketServer = require('ws').Server,
        wss = new WebSocketServer({port: 7000}),
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
}

function query(response, request){
    var arg = {
        'success': function(results){
            var res_json = JSON.stringify(results);
            res(response, 200, 'text/json', res_json)
        },
        'fail': function(err){
            var res_json = JSON.stringify(err);
            res(response, 200, 'text/json', res_json)
        }
    };

    mongo.query(arg);
}

function remove(response, request){
    var id = request.query.id;
    var arg = {
        '_id': id,
        'success': function(result){
            var res_json = JSON.stringify(result);
            res(response, 200, 'text/json', res_json)
        },
        'fail': function(err){
            var res_json = JSON.stringify(err);
            res(response, 200, 'text/json', res_json)
        }
    }

    mongo.remove(arg)
}

function insert(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fileds, files) {
	
	if(!fileds.hash) return res(response, 200, 'text/plain', JSON.stringify(fileds));
    	
        var time = new Date().getTime();
        var name = fileds.name || files.file.name;

        var hash = fileds.hash;
        var posx = fileds.posx;
        var posy = fileds.posy;

        var type = fileds.type;
    	var size = fileds.size;

    	var path_hash = path + hash;

        //如果没有 name 传入近来，表示是新文件的讯号，需要把新文件保存到文件库
        if(!fileds.name) fs.renameSync(files.file.path, path_hash);

        //专治腾讯QQ浏览器上传的文件没有后缀的问题，先粗暴处理为 png 图片j
        //@TODO 通过二进制文件头来判断文件类型（如果不能直接判断文件类型）
        console.log(name);
        if(/^[^\.]*$/.test(name)){
            name +='.png';
            type = 'image/png';
        } 
        console.log(name);

        var arg = {
        	hash: hash,
        	time: time,
        	name: name,
        	path: './files/',
        	posx: posx,
        	posy: posy,
        	type: type,
        	size: size
        };

        arg.arguments = arguments;

        arg.fail = function (error) {
         	var res_json = JSON.stringify(error);
            	res(response, 200, 'text/json', res_json)
       	}
       	arg.success = function (result) {
            
    		arg.result = result;
       		var res_json = JSON.stringify(arg);
	
		    res(response, 200, 'text/plain', res_json)
       	}
 
        mongo.insert(arg);
	});
}

function exists(response, request){
    var hash = request.query.hash;
    var path_hash = path + hash;
    content = {
        exists: fs.existsSync(path_hash)
    }
    res(response,200,'text/json',JSON.stringify(content))
}

function file(response, request){
    var hash = request.query.hash;
    var path_hash = path + hash;

    var thumbnail = request.query.thumbnail || false,
        download = request.query.download || false,
        result;
    if(download) result = JSON.parse(decodeURIComponent(request.query.result)) || {};

    if(thumbnail) return resthumb(hash, response);

    fs.readFile(path_hash, 'binary' ,function(err,file){
        if(err){
            res(response,500,'text/plain',JSON.stringify(err))
        }else{
            if(download) response.writeHead(200, {
                'Content-Disposition': 'attachment; filename='+result.n,
                'Content-Type': result.t,
                'Content-Length': result.s
            });
            else response.writeHead(200);

            response.write(file, 'binary');
            response.end();
        }
    });
}

function savetext(response, request){
    var form = new formidable.IncomingForm();
    form.parse(request, function (err, fileds, files) {
        var hash = request.query.hash;
        var path_hash = path + hash;
        var file_exists = fs.existsSync(path_hash);
console.log(err);	
            if(err){
                res(response,500,'text/plain',JSON.stringify(err));
            }
console.log(fileds);

        if(!file_exists){
            res(response, 500, 'text/json', JSON.stringify({
                err: 'no file exists'
            }));
            return;
        }

        fs.writeFile(path_hash, fileds.file, function(err,file){
            if(err){
                res(response,500,'text/plain',JSON.stringify(err));
            }else{
                res(response,200,'text/plain',JSON.stringify({
                st: '0'
            }));
            }
        });
    });
}

function resthumb(hash, response){
    var path_hash = path + hash;
    var thumb_hash = thumb + hash;
    if( !fs.existsSync(thumb_hash) ){
        console.log(hash + '...略缩库里面没有啊...')
        imageMagick(path_hash).resize(400, 400).write(thumb_hash, function(err){
            if(err) return res(response,500,'text/plain',JSON.stringify(err));  
            responsethumb();
        });
        return;
    }
    console.log(hash + '...库里面有啊...')
    responsethumb();

    function responsethumb(){
        fs.readFile(thumb_hash, function(err, file){
            if(err) return res(response,500,'text/plain',JSON.stringify(err));  

            response.writeHead(200, {'Content-Type':''});
            response.write(file ,'binary');
            response.end();
        });
    }
}

function cdn(response,request){
    var cdn_path = '.' + ( request.url.replace(/\?.*$/,'') );
    fs.readFile(cdn_path, 'binary' ,function(err,file){
        if(err){
            res(response,500,'text/plain',JSON.stringify(err))
        }else{
            var type = {
                'js' : 'text/javascript',
                'css': 'text/css',
                'html':'text/html'
            }[cdn_path.replace(/^.*\./,'')];

            res(response, 200, type ,file ,true)
        }
    });
}

function res(response,code,content_type,content,isBinary){
	response.writeHead(code, {'Content-Type':content_type});
	isBinary ? response.write(content, 'binary') : response.write(content);
	response.end();
}

exports[''] = index;
exports.query = query;
exports.insert = insert;
exports.remove = remove;
exports.file = file;
exports.savetext = savetext;
exports.exists = exists;
exports.cdn = cdn;

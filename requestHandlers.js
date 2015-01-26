var fs = require('fs'),
	formidable = require('formidable'),
    mongo = require('./mongoServer'),
    gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick : true });

var path = './files/';
var thumb = './thumbnail/';

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

        if(!fileds.name) fs.renameSync(files.file.path, path_hash);

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
    var cdn_path = '.' + request.url;
    fs.readFile(cdn_path, 'binary' ,function(err,file){
        if(err){
            res(response,500,'text/plain',JSON.stringify(err))
        }else{
            res(response,200,'text/javascript; charset=utf-8',file)
        }
    });
}

function res(response,code,content_type,content){
	response.writeHead(code, {'Content-Type':content_type});
	response.write(content);
	response.end();
}

exports[''] = index;
exports.query = query;
exports.insert = insert;
exports.remove = remove;
exports.file = file;
exports.exists = exists;
exports.cdn = cdn;
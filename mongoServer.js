var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var files;
MongoClient.connect("mongodb://yuanoook:3wloving@localhost:7001/yuanspace", {
    db: {
        native_parser: false
    },
    server: {
        socketOptions: {
            connectTimeoutMS: 500
        }
    },
    replSet: {},
    mongos: {}
}, function (err, db) {
    files = db.collection("files");
});
 
function insert() {
    var hash = arguments[0]['hash'];
    var time = arguments[0]['time'];
    var name = arguments[0]['name'];
    var path = arguments[0]['path'];
    var posx = arguments[0]['posx'];
    var posy = arguments[0]['posy'];
    var type = arguments[0]['type'];
    var size = arguments[0]['size'];
    var s_callback = arguments[0]['success'] || function () {};
    var f_callback = arguments[0]['fail'] || function () {};

    files.save({
        h: hash,
        i: time,
        n: name,
        p: path,
        x: posx,
        y: posy,
        t: type,
        s: size
    }, function (err, result) {
        if (err) {
            f_callback(err);
        } else {
            s_callback(result);
        }
    });
 
}
 
function remove() {
    var _id = arguments[0]['_id'];
    var s_callback = arguments[0]['success'] || function () {};
    var f_callback = arguments[0]['fail'] || function () {};
    files.remove({_id: ObjectID(_id)},function (err, result) {
        if (err) {
            f_callback(err);
        } else {
            s_callback(result);
        }
    });
}
 
function query() {
    var s_callback = arguments[0]['success'] || function () {};
    var f_callback = arguments[0]['fail'] || function () {};
    files.find().toArray(function(err,results){
        if(err) return f_callback(err);
        return s_callback(results);
    });
}

function update(){
    var _id = arguments[0]['_id'];
    var s_callback = arguments[0]['success'] || function () {};
    var f_callback = arguments[0]['fail'] || function () {};

    delete arguments[0]['success'];
    delete arguments[0]['fail'];
    delete arguments[0]['_id'];

    files.update({_id: ObjectID(_id)}, arguments[0], function(err,results){
        if(err) return f_callback(err);
        return s_callback(results);
    });
}
 
exports.insert = insert;
exports.remove = remove;
exports.query = query;
exports.update = update;
/*******************
********************

HTML5 / Javascript: 
get hash of files using drag and drop

Developed by Marco Antonio Alvarez => https://github.com/marcu87/hashme

Debug from yuanoook.com
*******************/
!function(window){

function hashMe(file, callbackFunction) {
    var _binStart = "";
    var _binEnd = "";
    var callback = "";
    var fileManager1 = new FileReader;
    var fileManager2 = new FileReader;
    var _hash = "";
    
    var setBinAndHash = function (startOrEnd, binData) {
        
        switch (startOrEnd) {
            case 0:
                _binStart = binData;
                break;
            case 1:
                _binEnd = binData
        }
        
        _binStart && _binEnd && md5sum(_binStart, _binEnd)
    };
    
    var md5sum = function (start, end) {
        _hash = rstr2hex(rstr_md5(start + end));
        callback(_hash);
    };
    
    var getHash = function() {
        return _hash;
    };
    
    var calculateHashOfFile = function (file) {
      
        fileManager1.onload = function (f) {
            setBinAndHash(0, f.target.result );
        };
        
        fileManager2.onload = function (f) {
            setBinAndHash(1, f.target.result );
        };
      
        var start = file.slice(0, 65536);
        var end = file.slice(file.size - 65536, file.size);
        
        fileManager1.readAsBinaryString(start);
        fileManager2.readAsBinaryString(end);
    };
    
    calculateHashOfFile(file);
    callback = callbackFunction;

};

window.hashMe = hashMe;
}(window);
const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');

exports.checkParameter = function(req, res, requiredParams, cb) {
    var obj = req.body.params;
    var result = true;

    Object.keys(obj).forEach(function(v, k) {
        requiredParams.forEach(function(val, key) {
            result = (obj.hasOwnProperty(val)) ? true : false;
        });
    });
    
    if (result) {
        cb();
    } else {
        var response = this.duplicateObject(msg.ERR_BAD_REQUEST);
        logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, response.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    }
}

exports.duplicateObject = function(tmpObject) {
    var resultObj = {};
    for (var key in tmpObject){
        resultObj[key] = tmpObject[key];
    }
    return resultObj;
}

exports.normalizeWordCloud = function(data, cb) {
    var wordCloud = [];
    
    data.forEach(element => {
        var x = element.count - data[data.length-1].count;
        var y = data[0].count - data[data.length-1].count;
        var weight =  x/y;
        if (weight < 0.25){
            weight = 25;
        }
        else if (weight < 0.5){
            weight = 50;
        }
        else if (weight < 0.75){
            weight = 75;
        }
        else {
            weight = 100;
        }
        wordCloud.push({
            "name": element.name,
            "weight": weight,
            "count": element.count
        });
    });

    cb(wordCloud);
}
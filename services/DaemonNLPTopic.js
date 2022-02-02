var path            = require('path');
var querystring     = require('querystring');
var appDir          = path.dirname(require.main.filename);
var config          = require(appDir + '/Config');
var utils           = require(appDir + '/Utils');
var mongo           = require(appDir + '/libraries/MongoDriver');
var logger          = require(appDir + '/Logger');
var http            = require(appDir + '/libraries/HttpHandler');

exports.doExecuteDaemon = function () {
    exports.getAllRequest(function(resStatus){
        setTimeout(function(){
            exports.doExecuteDaemon();
        }, 5000);
    });
};

exports.getAllRequest = function(cb){
    mongo.searchDataByProjectLimitSort(config.DB_COLL_CONVERSATION, {"topics": {"$exists": false}}, {}, 300, {"conversationDtm": -1}, function(resRegister){
        if(resRegister[0] && resRegister != false){
            exports.getResult(resRegister, function(respResult){
                cb(true);
            });
        }else{
            cb(true);
        }
    });
};

exports.getResult = function(data, cb){
    exports.topics(data, 0, function(topicsPost){
        logger.info(__filename, "Success Get " + topicsPost + " Topics Data /daemonNLPAsync", "", "", "");
        cb(true);
    });
};

exports.topics = function(docs, page, cb){
    if(page < docs.length){
        var idNLP = docs[page]._id;
        var textNLP = [];
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"topics": []}, function(resUpdate){
                exports.topics(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var countText = docs[page].contentText.split(" ");
            if(countText.length > 1){
                textNLP[0] = docs[page].contentText;
                var API_CONFIG = utils.duplicateObject(config.NLP);
                var param = JSON.stringify({
                    "action":"detection", 
                    "subAction":"getTopic",
                    "text": docs[page].contentText
                });

                http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                    if(resAPISentimentData){
                        if(resAPISentimentData.code == 0 && resAPISentimentData.content.keywords){
                            var topics = resAPISentimentData.content.keywords
                            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"topics": topics}, function(resUpdate){
                                exports.topics(docs, page+1, function(resLoop){
                                    cb(resLoop);
                                });
                            });
                        }else{
                            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"topics": []}, function(resUpdate){
                                exports.topics(docs, page+1, function(resLoop){
                                    cb(resLoop);
                                });
                            });
                        }  
                    }else{
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"topics": []}, function(resUpdate){
                            exports.topics(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }
                });
            }else{
                mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"topics": []}, function(resUpdate){
                    exports.topics(docs, page+1, function(resLoop){
                        cb(resLoop);
                    });
                });
            }
        }
    }else{
        cb(page);
    }
};
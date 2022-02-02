var path            = require('path');
var querystring     = require('querystring');
var appDir          = path.dirname(require.main.filename);
var config          = require(appDir + '/Config');
var utils           = require(appDir + '/Utils');
var mongo           = require(appDir + '/libraries/MongoDriver');
var logger          = require(appDir + '/Logger');
var http            = require(appDir + '/libraries/HttpHandler');

exports.doExecuteDaemon = function () {
    logger.info(__filename, "Daemon NLP Async Checked...", "", "", "");
    exports.getAllRequest(function(resStatus){
        setTimeout(function(){
            exports.doExecuteDaemon();
        }, 1000);
    });
};

exports.getAllRequest = function(cb){
    mongo.searchDataByProjectLimitSort(config.DB_COLL_CONVERSATION, {"$or": [{"hoax" : {"$exists": false}}, {"radicalism": {"$exists": false}}, {"sarcasm": {"$exists": false}}, {"porn": {"$exists": false}}, {"propaganda": {"$exists": false}}, {"advertisement": {"$exists": false}}]}, {}, 300, {"conversationDtm": -1}, function(resRegister){
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
    exports.radicalism(data, 0, function(respRadicalPost){
        logger.info(__filename, "Success Get " + respRadicalPost + " Radicalism Data /daemonNLPAsync", "", "", "");
        exports.hoax(data, 0, function(respHoaxPost){
            logger.info(__filename, "Success Get " + respHoaxPost + " Hoax Data /daemonNLPAsync", "", "", "");
            exports.sarcasm(data, 0, function(sarcasmPost){
                logger.info(__filename, "Success Get " + sarcasmPost + " Sarcasm Data /daemonNLPAsync", "", "", "");
                exports.porn(data, 0, function(pornPost){
                    logger.info(__filename, "Success Get " + pornPost + " Porn Data /daemonNLPAsync", "", "", "");
                    exports.propaganda(data, 0, function(propagandaPost){
                        logger.info(__filename, "Success Get " + propagandaPost + " Propaganda Data /daemonNLPAsync", "", "", "");
                        exports.advertisement(data, 0, function(advertisementPost){
                            logger.info(__filename, "Success Get " + advertisementPost + " Advertisement Data /daemonNLPAsync", "", "", "");
                            cb(true);
                        });
                    });
                });
            });
        });
    }); 
};

exports.radicalism = function(docs, page, cb){
    if(page < docs.length){
        var textNLP = docs[page].contentText;
        var idNLP = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"radicalism": 0}, function(resUpdate){
                exports.radicalism(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);
            var param = JSON.stringify({
                "action":"detection", 
                "subAction":"getRadicalism",
                "text": textNLP
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "radical"){
                            var radicalism = 1;
                        }else if(resAPISentimentData.content.final_result == "nonradical"){
                            var radicalism = 0;
                        }else{
                            var radicalism = null;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"radicalism": radicalism}, function(resUpdate){
                            exports.radicalism(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.radicalism(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.radicalism(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.hoax = function(docs, page, cb){
    if(page < docs.length){
        var textNLP = docs[page].contentText;
        var idNLP = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"hoax": 0}, function(resUpdate){
                exports.hoax(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);
            var param = JSON.stringify({
                "action":"detection", 
                "subAction":"getHoax",
                "text": textNLP
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "hoax"){
                            var hoax = 1;
                        }else if(resAPISentimentData.content.final_result == "nonhoax"){
                            var hoax = 0;
                        }else{
                            var hoax = null;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"hoax": hoax}, function(resUpdate){
                            exports.hoax(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.hoax(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.hoax(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.sarcasm = function(docs, page, cb){
    if(page < docs.length){
        var textNLP = docs[page].contentText;
        var idNLP = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"sarcasm": 0}, function(resUpdate){
                exports.sarcasm(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);
            var param = JSON.stringify({
                "action":"detection", 
                "subAction":"getOffensive", 
                "text": textNLP
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "sarcasm" || resAPISentimentData.content.final_result == "offensive"){
                            var sarcasm = 1;
                        }else if(resAPISentimentData.content.final_result == "nonsarcasm" || resAPISentimentData.content.final_result == "nonoffensive"){
                            var sarcasm = 0;
                        }else{
                            var sarcasm = null;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"sarcasm": sarcasm}, function(resUpdate){
                            exports.sarcasm(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.sarcasm(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.sarcasm(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.porn = function(docs, page, cb){
    if(page < docs.length){
        var textNLP = docs[page].contentText;
        var idNLP = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"porn": 0}, function(resUpdate){
                exports.porn(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);
            var param = JSON.stringify({
                "action":"detection", 
                "subAction":"getPorn",
                "text": textNLP
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "porn"){
                            var porn = 1;
                        }else if(resAPISentimentData.content.final_result == "nonporn"){
                            var porn = 0;
                        }else{
                            var porn = null;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"porn": porn}, function(resUpdate){
                            exports.porn(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.porn(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.porn(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.propaganda = function(docs, page, cb){
    if(page < docs.length){
        var textNLP = docs[page].contentText;
        var idNLP = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"propaganda": 0}, function(resUpdate){
                exports.propaganda(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);
            var param = JSON.stringify({
                "action":"detection", 
                "subAction":"getPropaganda",
                "text": textNLP
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "dakwah"){
                            var propaganda = 1;
                        }else if(resAPISentimentData.content.final_result == "nondakwah"){
                            var propaganda = 0;
                        }else{
                            var propaganda = null;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"propaganda": propaganda}, function(resUpdate){
                            exports.propaganda(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.propaganda(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.propaganda(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.advertisement = function(docs, page, cb){
    if(page < docs.length){
        var textNLP = docs[page].contentText;
        var idNLP = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"advertisement": 0}, function(resUpdate){
                exports.advertisement(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);
            var param = JSON.stringify({
                "action":"detection", 
                "subAction":"getAdvertise", 
                "text": textNLP
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, param, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "ads"){
                            var advertisement = 1;
                        }else if(resAPISentimentData.content.final_result == "nonads"){
                            var advertisement = 0;
                        }else{
                            var advertisement = null;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idNLP}, {"advertisement": advertisement}, function(resUpdate){
                            exports.advertisement(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.advertisement(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.advertisement(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};
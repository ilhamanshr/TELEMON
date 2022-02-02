var path            = require('path');
var os              = require('os');
var querystring     = require('querystring');
var randomstring    = require("randomstring");
var appDir          = path.dirname(require.main.filename);
var config          = require(appDir + '/Config');
var utils           = require(appDir + '/Utils');
var mongo           = require(appDir + '/libraries/MongoDriver');
var logger          = require(appDir + '/Logger');
var http            = require(appDir + '/libraries/HttpHandler');
var sw              = require('stopword');
var fs              = require('fs');
var nGram           = require("n-gram");
var response        = {code: 0, message: "OK"};

exports.doExecuteDaemon = function () {
    exports.getAllRequest(function(resStatus){
        setTimeout(function(){
            exports.doExecuteDaemon();
        }, 10000);
    });
};

exports.getAllRequest = function(cb){
    mongo.searchDataByProjectLimitSort(config.DB_COLL_CONVERSATION, {"$or": [{"sentiment" : {"$exists" : false }}, {"oneGram" : {"$exists" : false }}, {"biGram" : {"$exists" : false }}, {"triGram" : {"$exists" : false }}, {"urls" : {"$exists" : false }}, {"hashtags" : {"$exists" : false }}]}, {}, 300, {"conversationDtm": -1}, function(respText){
        if(respText[0] && respText != false){
            exports.getResult(respText, function(respGetResult){
                cb(true);
            });
        }else{
            cb(true);
        }
    });
};

exports.getResult = function(data, cb){
    exports.conversationSentiment(data, 0, function(respSentimentPost){
        logger.info(__filename, "Success Get " + respSentimentPost + " Sentiment Data /DaemonConversationDetail", "", "", "");
        fs.readFile('stopwords_01102020.txt', 'utf8', function(err, dataNGram){
            if(err){
                logger.error(__filename, "Error Backend! /daemonNLPAsync " + JSON.stringify(err));
            }else{
                var cleanStopWords  = dataNGram.split("\n");
                exports.nGramText(data, 0, cleanStopWords, function(nGramProcc){
                    logger.info(__filename, "Success Get " + nGramProcc + " NGram Data /daemonNLPAsync", "", "", "");
                    exports.getUrls(function(urls){
                        if(urls > 0){
                            logger.info(__filename, "Success Get " + urls + " Urls /daemonNLPAsync", "", "", "");
                        }
                        exports.getHastags(function(hashtags){
                            if(hashtags > 0){
                                logger.info(__filename, "Success Get " + hashtags + " Hashtags /daemonNLPAsync", "", "", "");
                            }
                            cb(true);
                        });
                    });
                });
            }
        });
    }); 
};

exports.conversationSentiment = function(docs, page, cb){
    if(page < docs.length){
        var textSentiment = docs[page].contentText;
        var idSentiment = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idSentiment}, {"sentiment": 0}, function(resUpdate){
                exports.conversationSentiment(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var API_CONFIG = utils.duplicateObject(config.NLP);

            var paramPostSentiment = JSON.stringify({
                "action":"detection", 
                "subAction":"getSentiment",
                "text": textSentiment
            });
            http.apiRequest("daemon", "daemon", API_CONFIG, paramPostSentiment, {}, function(resAPISentimentData){
                if(resAPISentimentData){
                    if(resAPISentimentData.code == 0 && resAPISentimentData.content.final_result){
                        if(resAPISentimentData.content.final_result == "positive"){
                            var sentiment = 1;
                        }else if(resAPISentimentData.content.final_result == "negative"){
                            var sentiment = -1;
                        }else{
                            var sentiment = 0;
                        }
                        mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idSentiment}, {"sentiment": sentiment}, function(resUpdate){
                            exports.conversationSentiment(docs, page+1, function(resLoop){
                                cb(resLoop);
                            });
                        });
                    }else{
                        exports.conversationSentiment(docs, page, function(resLoop){
                            cb(resLoop);
                        });
                    }
                }else{
                    exports.conversationSentiment(docs, page, function(resLoop){
                        cb(resLoop);
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.nGramText = function(docs, page, cleanStopWords, cb){
    if(page < docs.length){
        var idSentiment = docs[page]._id;

        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idSentiment}, {"oneGram": [], "biGram": [], "triGram": []}, function(resUpdate){
                exports.nGramText(docs, page+1, cleanStopWords, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var textNGram = docs[page].contentText.toLowerCase();
            var gramProccess = [];
            textNGram = textNGram.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
            textNGram = textNGram.replace(/#[a-zA-Z0-9]+/g, "");
            textNGram = textNGram.replace(/@[a-zA-Z0-9]+/g, "");
            textNGram = textNGram.replace(/[^a-zA-Z ]/g, "");
            textNGram = textNGram.replace(/[\n]/g, "");
            textNGram = textNGram.replace(/[\t]/g, "");
            textNGram = textNGram.trim();
            textNGram = textNGram.split(" ");
            textNGram.forEach(function(element){
                var trimInside = element.trim();
                gramProccess.push(trimInside);
            });
            
            var cleanText = sw.removeStopwords(gramProccess, cleanStopWords);
            var resultText = [];
            cleanText.forEach(element => {
                if(element != "" && element.length < 30){
                    resultText.push(element)
                }
            });


            if(resultText[0]){
                var oneGram = [];
                nGram(1)(resultText).forEach(function(element){
                    var join = element.join(" ");
                    oneGram.push(join);
                });

                var biGram = [];
                nGram.bigram(resultText).forEach(function(element){
                    var join = element.join(" ");
                    biGram.push(join);
                });

                var triGram = [];
                nGram.trigram(resultText).forEach(function(element){
                    var join = element.join(" ");
                    triGram.push(join);
                });
            }else{
                var oneGram = [];
                var biGram = [];
                var triGram = [];
            }
            
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idSentiment}, {"oneGram": oneGram, "biGram": biGram, "triGram": triGram}, function(resUpdate){
                exports.nGramText(docs, page+1, cleanStopWords, function(resLoop){
                    cb(resLoop);
                });
            });
        }
    }else{
        cb(page);
    }
};

exports.getUrls = function(cb){
    var filter = {
        "urls": {"$exists": false}
    }

    mongo.searchDataByProjectLimitSort(config.DB_COLL_CONVERSATION, filter, {}, 300, {"conversationDtm": -1}, function(respUrls){
        if(respUrls[0]){
            exports.updateUrls(respUrls, 0, function(respResult){
                cb(respResult);
            });
        }else{
            cb(0);
        }
    });
};

exports.updateUrls = function(data, page, cb){
    if(page < data.length){
        var text = data[page].contentText;
        var id = data[page]._id;

        if(!data[page].contentText || data[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : id}, {"urls": []}, function(resUpdate){
                exports.updateUrls(data, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            text = text.replace(/[\n]/g, " ");
            text = text.replace(/[\t]/g, " ");
            var urls = text.match(/(?:https?|ftp):\/\/[\n\S]+/g);
            
            if(urls == null){
                urls = [];
            }else{
                urls = urls.filter((v, i, a) => a.indexOf(v) === i);
            }
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : id}, {"urls": urls}, function(resUpdate){
                if(resUpdate == true){
                    exports.updateUrls(data, page+1, function(resLoop){
                        cb(resLoop);
                    });
                }else{
                    mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : id}, {"urls": []}, function(resUpdate){
                        exports.updateUrls(data, page+1, function(resLoop){
                            cb(resLoop);
                        });
                    });
                }
            });
        }
    }else{
        cb(page);
    }
};

exports.getHastags = function(cb){
    var filter = {
        "hashtags": {"$exists": false}
    }

    mongo.searchDataByProjectLimitSort(config.DB_COLL_CONVERSATION, filter, {}, 300, {"conversationDtm": -1}, function(respHashtags){
        if(respHashtags[0]){
            exports.updateHashtags(respHashtags, 0, function(respResult){
                cb(respResult);
            });
        }else{
            cb(0);
        }
    });
};

exports.updateHashtags = function(data, page, cb){
    if(page < data.length){
        var text = data[page].contentText;
        var id = data[page]._id;

        if(!data[page].contentText || data[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : id}, {"hashtags": []}, function(resUpdate){
                exports.updateHashtags(data, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            text = text.replace(/[\n]/g, " ");
            text = text.replace(/[\t]/g, " ");
            var hashtags = text.match(/#[a-zA-Z0-9]+/gi);
            if(hashtags == null){
                hashtags = [];
            }else{
                hashtags = hashtags.filter((v, i, a) => a.indexOf(v) === i);
            }
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : id}, {"hashtags": hashtags}, function(resUpdate){
                exports.updateHashtags(data, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }
    }else{
        cb(page);
    }
};
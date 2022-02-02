const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const model     = require(BASE_DIR + '/models/General');

var response = utils.duplicateObject(msg.ERR_RESPONSE);

class GeneralController {

    static async getHashtagList(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                
                model.getHashtagList(req.body, function(result) {
                    if (result && result.length > 0 && result[0].hasOwnProperty("hashtags") && result[0].hashtags.length > 0) {
                        response["message"] = "Get hashtag list success";
                        response["content"] = result[0].hashtags;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Hashtag not available";
                        response["content"] = [];
                    }

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTopicList(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                
                model.getTopicList(req.body, function(result) {
                    if (result && result.length > 0 && result[0].hasOwnProperty("topics") && result[0].topics.length > 0) {
                        response["message"] = "Get topic list success";
                        response["content"] = result[0].topics;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Topic not available";
                        response["content"] = [];
                    }

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getPosterList(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                
                model.getPosterList(req.body, function(result) {
                    if (result && result.length > 0) {
                        response["message"] = "Get poster list success";
                        response["content"] = result;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Poster not available";
                        response["content"] = [];
                    }

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getGroupList(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                
                model.getSummaryGroupList(req.body, function(result) {
                    if (result && result.length > 0) {
                        response["message"] = "Get group list success";
                        response["content"] = result;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Group not available";
                        response["content"] = [];
                    }

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getGroupChannelList(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                
                model.getGroupChannelList(req.body, function(result) {
                    if (result && result.length > 0) {
                        response["message"] = "Get group and channel list success";
                        response["content"] = result;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Group and channel not available";
                        response["content"] = [];
                    }

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getChannelList(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                
                model.getSummaryChannelList(req.body, function(result) {
                    if (result && result.length > 0) {
                        response["message"] = "Get group list success";
                        response["content"] = result;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Group not available";
                        response["content"] = [];
                    }

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getSummary(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                
                model.getSummary(req.body, function(result) {
                    response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                    response["content"] = result;
        
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }
    
    static async getTopWord(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopWord(req.body, function(result) {
                    if (result && result.length == 0) {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Top word not available in this period, please change the period.";
                        response["content"] = [];
                    } else if (! result) {
                        response = utils.duplicateObject(msg.ERROR_RESPONSE);
                        response["message"] = "Get top word failed";
                    } else {
                        utils.normalizeWordCloud(result, function(wordCloud) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get top word success";
                            response["content"] = [{
                                "name": "Total",
                                "type": "wordcloud",
                                "data" : wordCloud
                            }]
                        });
                    }
        
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTopHashtag(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopHashtag(req.body, function(result) {
                    if (result && result.length == 0) {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Top hashtag not available in this period, please change the period.";
                        response["content"] = [];
                    } else if (! result) {
                        response = utils.duplicateObject(msg.ERROR_RESPONSE);
                        response["message"] = "Get top hashtag failed";
                    } else {
                        utils.normalizeWordCloud(result, function(wordCloud) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get top hashtag success";
                            response["content"] = [{
                                "name": "Total",
                                "type": "wordcloud",
                                "data" : wordCloud
                            }]
                        });
                    }
        
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTopTopic(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopTopic(req.body, function(result) {
                    if (result && result.length == 0) {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Top topic not available in this period, please change the period.";
                        response["content"] = [];
                    } else if (! result) {
                        response = utils.duplicateObject(msg.ERROR_RESPONSE);
                        response["message"] = "Get top topic failed";
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                        response["message"] = "Get top topic success";
                        response["content"] = result;
                    }
        
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTopUrl(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopUrl(req.body, function(result) {
                    if (result && result.length == 0) {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Top URL not available in this period, please change the period.";
                        response["content"] = [];
                    } else if (! result) {
                        response = utils.duplicateObject(msg.ERROR_RESPONSE);
                        response["message"] = "Get top URL failed";
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                        response["message"] = "Get top URL success";
                        response["content"] = result;
                    }
        
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTopPoster(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopPoster(req.body, function(result) {
                    if (cb) {
                        cb(result);
                    } else {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Top poster not available in this period, please change the period.";
                            response["content"] = [];
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get top poster failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get top poster success";
                            response["content"] = result;
                        }
            
                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
            
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    }
                });
            });
        });
    }

    static async getTopGroup(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopGroup(req.body, function(result) {
                    if (cb) {
                        cb(result);
                    } else {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Top group not available in this period, please change the period.";
                            response["content"] = [];
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get top group failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get top group success";
                            response["content"] = result;
                        }
                        
                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    }
                });
            });
        });
    }

    static async getTopChannel(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getTopChannel(req.body, function(result) {
                    if (cb) {
                        cb(result);
                    } else {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Top channel not available in this period, please change the period.";
                            response["content"] = [];
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get top channel failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get top channel success";
                            response["content"] = result;
                        }
                        
                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    }
                });
            });
        });
    }

    static async getTimelineMulti(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                var arrValue = ["Total"];
                if ("words" in req.body.params) arrValue = req.body.params.words;
                if ("hashtags" in req.body.params) arrValue = req.body.params.hashtags;
                if ("topics" in req.body.params) arrValue = req.body.params.topics;

                model.getTimelineMulti(req.body, arrValue, [], 0, function(result) {
                    response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
        
                    if (result.length) {
                        response["message"] = "Get overall timeline success";
                        response["content"] = result;
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["content"] = [];
                    }
        
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTimelineMultiGroup(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getGroupInfo(req.body, function(resultList) {
                    if (resultList) {
                        model.getTimelineMulti(req.body, resultList, [], 0, function(result) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get overall timeline success";
                            response["content"] = result;
                            
                            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
    
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        });
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["content"] = [];
                        
                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    }
                });
            });
        });
    }

    static async getSentiment(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getSentiment(req.body, function(result) {
                    if (result && result.length == 0) {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Sentiment analysis not available in this period, please change the period.";
                        response["content"] = [{
                            "name": "Sentiment Analysis",
                            "colorByPoint": true,
                            "data": [],
                        }];
                    } else if (! result) {
                        response["message"] = "Get sentiment analysis failed";
                    } else {
                        var resultPie = result;
                        resultPie.forEach(function(val, key) {
                            var keyString = val.name + "";
                            if (msg.SENTIMENT_BY_KEY.hasOwnProperty(keyString)) resultPie[key].name = msg.SENTIMENT_BY_KEY[keyString];
                        });
                        resultPie.forEach(function(val, key) {
                            if (val.name == null) resultPie.splice(key,1);
                        });
                        response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                        response["message"] = "Get sentiment analysis success";
                        response["content"] = [{
                            "name": "Sentiment Analysis",
                            "colorByPoint": true,
                            "data": resultPie
                        }];
                    }
                    
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getSentimentMulti(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                var arrValue = ["Total"];
                if ("words" in req.body.params) arrValue = req.body.params.words;
                if ("hashtags" in req.body.params) arrValue = req.body.params.hashtags;
                if ("topics" in req.body.params) arrValue = req.body.params.topics;

                model.getSentimentMulti(req.body, arrValue, [], 0, function(result) {
                    response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
        
                    response["message"] = "Get sentiment success";
                    response["content"] = {
                        "categories": ["Positive", "Neutral", "Negative"],
                        "series": result
                    };
                    
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
        
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getSentimentMultiGroup(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getGroupInfo(req.body, function(resultList) {
                    var categories = ["Positive", "Neutral", "Negative"];

                    if (resultList) {
                        delete req.body.params["chatIds"];
                        model.getSentimentMulti(req.body, resultList, [], 0, function(result) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
    
                            response["message"] = "Get sentiment success";
                            response["content"] = {
                                "categories": categories,
                                "series": result
                            };
                            
                            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
    
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        });
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["content"] = {
                            "categories": categories,
                            "series": result
                        };

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
            
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    }
                });
            });
        });
    }

    static async getNlpMulti(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                var arrValue = ["Total"];
                if ("words" in req.body.params) arrValue = req.body.params.words;
                if ("hashtags" in req.body.params) arrValue = req.body.params.hashtags;
                if ("topics" in req.body.params) arrValue = req.body.params.topics;

                model.getNlpMulti(req.body, arrValue, [], 0, function(result) {
                    response = utils.duplicateObject(msg.SUCCESS_RESPONSE);

                    response["message"] = "Get NLP success";
                    response["content"] = {
                        "categories": ["Radicalism", "Hoax", "Sarcasm", "Porn", "Propaganda", "Advertisement"],
                        "series": result
                    };
                    
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getNlpMultiGroup(req, res, requiredParams) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getGroupInfo(req.body, function(resultList) {
                    var categories = ["Radicalism", "Hoax", "Sarcasm", "Porn", "Propaganda", "Advertisement"];

                    if (resultList) {
                        model.getNlpMulti(req.body, resultList, [], 0, function(result) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
    
                            response["message"] = "Get NLP success";
                            response["content"] = {
                                "categories": categories,
                                "series": result
                            };
                            
                            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
    
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        });
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["content"] = {
                            "categories": categories,
                            "series": []
                        };

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
            
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    }
                });
            });
        });
    }

    static async getMemberRelation(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                if ("categoryId" in req.body.params) {
                    var filter = { "_id": req.body.params.categoryId };
                    mongo.searchDataBy(config.DB_COLL_GROUP_CATEGORY, filter, function(resultGroupCategory) {
                        if (resultGroupCategory && resultGroupCategory.length > 0) {
                            model.getMemberRelationData(req.body, resultGroupCategory[0].chatIds, function(result) {
                                cb(result);
                            });
                        } else {
                            cb([]);
                        }
                    });
                } else {
                    model.getMemberRelationData(req.body, function(result) {
                        cb(result);
                    });
                }
            });
        });
    }

    static async getPosterOntology(req, res, requiredParams, cb) {
        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getPosterOntologyData(req.body, function(result) {
                    cb(result);
                });
            });
        });
    }

}

module.exports = GeneralController;
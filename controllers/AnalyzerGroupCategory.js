const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const model     = require(BASE_DIR + '/models/General');
const modelAGC  = require(BASE_DIR + '/models/AnalyzerGroupCategory');
const modelMGC  = require(BASE_DIR + '/models/ManagementGroupCategory');
const ctrl      = require(BASE_DIR + '/controllers/General');

class AnalyzerGroupCategoryController {
    
    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "limit": 15, "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "limit", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelAGC.getTopWord(bodyReq, function(result) {
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
        });
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "limit": 15, "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "limit", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelAGC.getTopHashtag(bodyReq, function(result) {
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
        });
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "offset": 0, "limit": 10, "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelAGC.getTopTopic(bodyReq, function(result) {
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
        });
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "limit": 10, "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "limit", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelAGC.getTopUrl(bodyReq, function(result) {
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
        });
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "offset": 0, "limit": 10, "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelAGC.getTopPoster(bodyReq, function(result) {

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
                    });
                });
            });
        });
    }

    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelMGC.getInfo(bodyReq, function(resultGroupCategory) {
                        if (!resultGroupCategory || resultGroupCategory.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Overall timeline not available";
                            response["content"] = [];
                        } else {
                            model.getTimelineMulti(bodyReq, resultGroupCategory[0].groups, [], 0, function(result) {
                                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                                response["message"] = "Get overall timeline success";
                                response["content"] = result;
                                
                                logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(response));
                            });
                        }
                    });
                });
            });
        });
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelMGC.getInfo(bodyReq, function(resultGroupCategory) {
                        if (!resultGroupCategory || resultGroupCategory.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Sentiment not available";
                            response["content"] = [];
                        } else {
                            model.getSentimentMulti(bodyReq, resultGroupCategory[0].groups, [], 0, function(result) {
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
                        }
                    });
                });
            });
        });
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-08-31", "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    modelMGC.getInfo(bodyReq, function(resultGroupCategory) {
                        if (!resultGroupCategory || resultGroupCategory.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "NLP not available";
                            response["content"] = [];
                        } else {
                            model.getNlpMulti(bodyReq, resultGroupCategory[0].groups, [], 0, function(result) {
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
                        }
                    });
                });
            });
        });
    }

    static async getMemberRelation(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroupCategory", "subAction": "getMemberRelation", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "type": "all", "limit": "all", "categoryId": "YEkukRpFVIPex8b2E2J0Udfun82QhjSl"} }'
        /** 
            "type"  : "all"/"related"
            "limit" : (number)/"all"
        **/
        var required = ["type", "limit", "categoryId"];
        var response = utils.duplicateObject(msg.ERR_RESPONSE);

        ctrl.getMemberRelation(req, res, required, function(result) {
            if (result && result.length == 0) {
                response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                response["message"] = "Get member relation not available";
                response["content"] = [];
            } else if (! result) {
                response = utils.duplicateObject(msg.ERROR_RESPONSE);
                response["message"] = "Get member relation failed";
            } else {
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                response["message"] = "Get member relation success";
                response["content"] = {
                    "count": result.length,
                    "results": result
                };
            }
    
            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
    }
}

module.exports = AnalyzerGroupCategoryController;
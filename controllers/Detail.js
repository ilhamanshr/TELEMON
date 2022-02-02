const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const model     = require(BASE_DIR + '/models/Detail');

class DetailController {
    
    static async getTopicDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getTopicDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "topic": "download" } }'
        /** Optional Parameter:
            "search"  : "sample"
            "word"    : "sample"
            "hashtag" : "#sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "topic"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getTopicDetail(bodyReq, function(count, result) {
                        var feature = "topic";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getWordDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getWordDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "word": "download", "type": 1 } }'
        /**
            Type: 1 (oneGram), 2 (biGram), 3 (triGram)
            Optional Parameter:
            "search"  : "sample"
            "topic"   : "sample"
            "hashtag" : "#sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "word", "type"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getWordDetail(bodyReq, function(count, result) {
                        var feature = "word";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getHashtagDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getHashtagDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "hashtag": "#2021" } }'
        /** Optional Parameter:
            "search"  : "sample"
            "word"    : "sample"
            "topic"   : "sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "hashtag"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getHashtagDetail(bodyReq, function(count, result) {
                        var feature = "hashtag";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getUrlDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getUrlDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "url": "https://bit.ly/3mDbziP" } }'
        /** Optional Parameter:
            "search"  : "sample"
            "word"    : "sample"
            "hashtag" : "#sample"
            "topic"   : "sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "url"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getUrlDetail(bodyReq, function(count, result) {
                        var feature = "shared link";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getSentimentDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getSentimentDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "sentiment": -1 } }'
        /** 
            Sentiment: -1 / 0 / 1
            Optional Parameter:
            "search"  : "sample"
            "word"    : "sample"
            "hashtag" : "#sample"
            "topic"   : "sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "sentiment"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getSentimentDetail(bodyReq, function(count, result) {
                        var feature = "sentiment";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getNlpDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getNlpDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "category": "radicalism" } }'
        /** 
            Category: radicalism / hoax / sarcasm / porn / propaganda / advertisement
            Optional Parameter:
            "search"  : "sample"
            "word"    : "sample"
            "hashtag" : "#sample"
            "topic"   : "sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "category"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getNlpDetail(bodyReq, function(count, result) {
                        var feature = "NLP";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getTimelineDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getTimelineDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "offset": 0, "limit": 10, "search": "", "date": "2021-08-24" } }'
        /** Optional Parameter:
            "search"  : "sample"
            "word"    : "sample"
            "hashtag" : "#sample"
            "topic"   : "sample"
            "poster"  : (posterId)
            "group"   : (chatId)
            "channel" : (chatId)
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["offset", "limit", "date"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getTimelineDetail(bodyReq, function(count, result) {
                        var feature = "chat of the date";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getConversationDetail(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Detail", "subAction": "getConversationDetail", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "", "conversationIds": ["u27fMRCs2DS77OsBKDwnbVrVc9oWfcrk_-546947889_12186550272", "j89NFIT51b0vlhQB52EPrcYOUp6KtmdP_-546947889_24185405440", "K0xRl8YxYWyITgGLqH67xxSwYCdQfYfU_-546947889_12059672576"] } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit", "conversationIds"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getConversationDetail(bodyReq, function(count, result) {
                        var feature = "chat";
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Detail "+ feature +" not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get "+ feature +" detail failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get "+ feature +" detail success";
                            response["content"] = {
                                "count": count,
                                "results": result
                            };
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }
}

module.exports = DetailController;
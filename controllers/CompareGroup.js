const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const logger    = require(BASE_DIR + '/Logger');
const utils     = require(BASE_DIR + '/Utils');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const ctrl      = require(BASE_DIR + '/controllers/General');
const model     = require(BASE_DIR + '/models/General');

class CompareGroupController {

    static async getGroupList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getGroupList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'

        var requiredParams = [];
        ctrl.getGroupList(req, res, requiredParams);
    }
    
    static async getSummary(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getSummary", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "chatId"];

        ctrl.getSummary(req, res, required);
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit", "chatId"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "chatId"];

        ctrl.getTopHashtag(req, res, required);
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "chatId"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "chatId"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "chatId": -546947889 } }'

        var required = ["dateFrom", "dateUntil", "offset", "limit", "chatId"];

        ctrl.getTopPoster(req, res, required);
    }
    
    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367, -546947889, -525929513, -1001390476210] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];

        ctrl.getTimelineMultiGroup(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367, -546947889, -525929513, -1001390476210] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];

        ctrl.getSentimentMultiGroup(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367, -546947889, -525929513, -1001390476210] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];
        var response = utils.duplicateObject(msg.ERR_RESPONSE);

        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, required, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                
                model.getGroupInfo(req.body, function(resultList) {
                    var categories = ["Radicalism", "Hoax", "Sarcasm", "Porn", "Propaganda", "Advertisement"];
                    
                    if (resultList) {
                        delete req.body.params["chatIds"];
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

    static async getMemberRelation(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareGroup", "subAction": "getMemberRelation", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "type": "all", "limit": "all", "chatIds": [-1001212543367, -546947889, -525929513, -1001390476210] } }'
        /** 
            "type"  : "all"/"related"
            "limit" : (number)/"all"
        **/
        var required = ["type", "limit", "chatIds"];
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

module.exports = CompareGroupController;
const e = require('express');
const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const ctrl      = require(BASE_DIR + '/controllers/General');
const modelAG   = require(BASE_DIR + '/models/AnalyzerGroup');

class AnalyzerGroupController {

    static async getGroupList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getGroupList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'

        var requiredParams = [];
        ctrl.getGroupList(req, res, requiredParams);
    }
    
    static async getInfo(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getInfo", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatId": -546947889 } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var required = ["dateFrom", "dateUntil", "chatId"];

        ctrl.getTopGroup(req, res, required, function(result) {
            if (result && result.length == 0) {
                response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                response["message"] = "Group info not available";
                response["content"] = {};
            } else if (! result) {
                response = utils.duplicateObject(msg.ERROR_RESPONSE);
                response["message"] = "Get group info failed";
            } else {
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                response["message"] = "Get group info success";
                response["content"] = result[0];
            }
            
            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit", "chatId"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "chatId"];

        ctrl.getTopHashtag(req, res, required);
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "chatId"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "chatId"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "chatId": -546947889 } }'

        var required = ["dateFrom", "dateUntil", "offset", "limit", "chatId"];

        ctrl.getTopPoster(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatId": -1001212543367 } }'
        
        var required = ["dateFrom", "dateUntil"];
        
        ctrl.getSentiment(req, res, required);
    }
    
    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];

        ctrl.getTimelineMultiGroup(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];

        ctrl.getNlpMultiGroup(req, res, required);
    }

    static async getOntologyData(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerGroup", "subAction": "getOntologyData", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-08-01", "dateUntil": "2021-09-01", "type": "mention", "limit": 10, "groups": [["",-1001212543367,1212543367,"kacung"]] } }'
        //type = "mention", "reply", "all"
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        var self = this;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "groups", "type"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                    var limitDuplicate = parseInt(bodyReq.params.limit);
                    var typeDuplicate = bodyReq.params.type;
                    self.getOntologyDataByType(bodyReq, [], 0, bodyReq.params.type, function(result) {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Member relation not available in this period, please change the period.";
                            response["content"] = { "count": 0, "results": [] };
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get member relation failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get member relation success";
                            if (typeDuplicate.toLowerCase() == "all"){
                                var newResult = result.sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
                                newResult = result.slice(0, limitDuplicate);
                            }else{
                                var newResult = result;
                            }
                            
                            response["content"] = {
                                "count": newResult.length,
                                "results": newResult
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

    static async getOntologyDataByType(bodyReq, result, page, type, cb) {
        var self = this;
        
        if (type.toLowerCase() != "all"){
            modelAG.getOntology(bodyReq, function(respOntology) {
                cb(respOntology);
            });
        }else{
            var loopLength = ["Reply", "Mention"];
            if (page < loopLength.length) {
                bodyReq["params"]["type"] = loopLength[page];
                
                modelAG.getOntology(bodyReq, function(respOntology) {
                    var mergeArray = [...result, ...respOntology]
                    result = mergeArray;
                    self.getOntologyDataByType(bodyReq, result, page+1, type, function(respLoop) {
                        cb(respLoop);
                    });
                });
            }else{
                cb(result);
            }
        }
    }
}

module.exports = AnalyzerGroupController;
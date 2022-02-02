const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const ctrl      = require(BASE_DIR + '/controllers/General');

class AnalyzerChannelController {

    static async getChannelList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getChannelList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'

        var requiredParams = [];
        ctrl.getChannelList(req, res, requiredParams);
    }

    static async getInfo(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getInfo", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatId": -1001443864412 } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var required = ["dateFrom", "dateUntil", "chatId"];

        ctrl.getTopChannel(req, res, required, function(result) {
            if (result && result.length == 0) {
                response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                response["message"] = "Channel info not available";
                response["content"] = {};
            } else if (! result) {
                response = utils.duplicateObject(msg.ERROR_RESPONSE);
                response["message"] = "Get channel info failed";
            } else {
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                response["message"] = "Get channel info success";
                response["content"] = result[0];
            }
            
            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit", "chatId"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200, "chatId": -546947889 } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var required = ["dateFrom", "dateUntil", "limit", "chatId"];

        ctrl.getTopHashtag(req, res, required, function(result) {
        });
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "chatId"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "chatId": -546947889 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "chatId"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "chatId": -546947889 } }'

        var required = ["dateFrom", "dateUntil", "offset", "limit", "chatId"];

        ctrl.getTopPoster(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatId": -1001212543367 } }'
        
        var required = ["dateFrom", "dateUntil"];
        
        ctrl.getSentiment(req, res, required);
    }
    
    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];
        
        ctrl.getTimelineMultiGroup(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerChannel", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "chatIds": [-1001212543367] } }'
        
        var required = ["dateFrom", "dateUntil", "chatIds"];
        
        ctrl.getNlpMultiGroup(req, res, required);
    }

}

module.exports = AnalyzerChannelController;
const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const msg       = require(BASE_DIR + '/Messages');
const ctrl      = require(BASE_DIR + '/controllers/General');

class AnalyzerTopicController {

    static async getTopicList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopicList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24" } }'
        
        var requiredParams = ["dateFrom", "dateUntil"];
        ctrl.getTopicList(req, res, requiredParams);
    }

    static async getSummary(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getSummary", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "topic": "anime" } }'
        
        var required = ["dateFrom", "dateUntil", "topic"];

        ctrl.getSummary(req, res, required);
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200, "topic": "anime" } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit", "topic"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200, "topic": "anime" } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "topic"];

        ctrl.getTopHashtag(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "topic": "anime" } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "topic"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "topic": "call" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "topic"];

        ctrl.getTopPoster(req, res, required);
    }

    static async getTopGroup(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopGroup", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "topic": "anime" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "topic"];

        ctrl.getTopGroup(req, res, required);
    }

    static async getTopChannel(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTopChannel", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "topic": "anime" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var required = ["dateFrom", "dateUntil", "offset", "limit", "topic"];

        ctrl.getTopChannel(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerHashtag", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "topic": "anime" } }'
        
        var required = ["dateFrom", "dateUntil", "topic"];
        
        ctrl.getSentiment(req, res, required);
    }

    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "topics": ["anime"] } }'
        
        var required = ["dateFrom", "dateUntil", "topics"];

        ctrl.getTimelineMulti(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "AnalyzerTopic", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "topics": ["anime"] } }'
        
        var required = ["dateFrom", "dateUntil", "topics"];
        
        ctrl.getNlpMulti(req, res, required);
    }

}

module.exports = AnalyzerTopicController;
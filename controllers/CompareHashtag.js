const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const ctrl      = require(BASE_DIR + '/controllers/General');

class CompareHashtagController {

    static async getHashtagList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getHashtagList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24" } }'
        
        var requiredParams = ["dateFrom", "dateUntil"];
        ctrl.getHashtagList(req, res, requiredParams);
    }
    
    static async getSummary(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getSummary", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "hashtag": "#1" } }'
        
        var required = ["dateFrom", "dateUntil", "hashtag"];

        ctrl.getSummary(req, res, required);
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200, "hashtag": "#1" } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit", "hashtag"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "hashtag": "#1" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "hashtag"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "hashtag": "#1" } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "hashtag"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "hashtag": "#1" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "hashtag"];

        ctrl.getTopPoster(req, res, required);
    }

    static async getTopGroup(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTopGroup", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "hashtag": "#1" } }'

        var required = ["dateFrom", "dateUntil", "offset", "limit", "hashtag"];

        ctrl.getTopGroup(req, res, required);
    }

    static async getTopChannel(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTopChannel", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "hashtag": "#1" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "hashtag"];

        ctrl.getTopChannel(req, res, required);
    }

    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "hashtags": ["#1", "#2"] } }'
        
        var required = ["dateFrom", "dateUntil", "hashtags"];

        ctrl.getTimelineMulti(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "hashtags": ["#1", "#2"] } }'
        
        var required = ["dateFrom", "dateUntil", "hashtags"];

        ctrl.getSentimentMulti(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareHashtag", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "hashtags": ["#1", "#2"] } }'
        
        var required = ["dateFrom", "dateUntil", "hashtags"];
        
        ctrl.getNlpMulti(req, res, required);
    }

}

module.exports = CompareHashtagController;
const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const ctrl      = require(BASE_DIR + '/controllers/General');

class CompareWordController {
    
    static async getSummary(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getSummary", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "word": "download" } }'

        var required = ["dateFrom", "dateUntil", "word"];

        ctrl.getSummary(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200, "word": "download" } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "word"];

        ctrl.getTopHashtag(req, res, required);
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "word": "download" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "word"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "word": "download" } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "word"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "word": "download" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "word"];

        ctrl.getTopPoster(req, res, required);
    }

    static async getTopGroup(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTopGroup", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "word": "download" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "word"];

        ctrl.getTopGroup(req, res, required);
    }

    static async getTopChannel(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTopChannel", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "word": "download" } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "word"];

        ctrl.getTopChannel(req, res, required);
    }

    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "words": ["download", "anime"] } }'
        
        var required = ["dateFrom", "dateUntil", "words"];

        ctrl.getTimelineMulti(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "words": ["download", "anime"] } }'
        
        var required = ["dateFrom", "dateUntil", "words"];
        
        ctrl.getSentimentMulti(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "CompareWord", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "words": ["download", "anime"] } }'
        
        var required = ["dateFrom", "dateUntil", "words"];
        
        ctrl.getNlpMulti(req, res, required);
    }

}

module.exports = CompareWordController;
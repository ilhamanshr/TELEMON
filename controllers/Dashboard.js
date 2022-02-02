const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const ctrl      = require(BASE_DIR + '/controllers/General');
const modelD    = require(BASE_DIR + '/models/Dashboard');

class DashboardController {
    
    static async getSummaryAll(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getSummaryAll", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        
        sso.validateSession(req, res, function(user) {

            var requiredParams = [];

            utils.checkParameter(req, res, requiredParams, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);

                modelD.getSummaryAll(req.body, function(result) {
                    response["content"] = result;

                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getSummaryActive(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getSummaryActive", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);

        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");
                    response = utils.duplicateObject(msg.SUCCESS_RESPONSE);

                    modelD.getSummaryActive(req.body, function(result) {
                        response["content"] = result;

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getTopChat(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopChat", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10 } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var required = ["dateFrom", "dateUntil", "offset", "limit"];

        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, required, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                modelD.getTopChat(req.body, function(result) {
                    if (result && result.length == 0) {
                        response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                        response["message"] = "Top chat not available in this period, please change the period.";
                        response["content"] = [];
                    } else if (! result) {
                        response = utils.duplicateObject(msg.ERROR_RESPONSE);
                        response["message"] = "Get top chat failed";
                    } else {
                        response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                        response["message"] = "Get top chat success";
                        response["content"] = result;
                    }
                    
                    logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                });
            });
        });
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200 } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200 } }'
        
        var required = ["dateFrom", "dateUntil", "limit"];

        ctrl.getTopHashtag(req, res, required);
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10 } }'
        
        var required = ["dateFrom", "dateUntil", "limit"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopPoster(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopPoster", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit"];

        ctrl.getTopPoster(req, res, required);
    }

    static async getTopGroup(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopGroup", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit"];

        ctrl.getTopGroup(req, res, required);
    }

    static async getTopChannel(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTopChannel", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit"];

        ctrl.getTopChannel(req, res, required);
    }

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24" } }'
        
        var required = ["dateFrom", "dateUntil"];
        
        ctrl.getSentiment(req, res, required);
    }

    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24" } }'
        
        var required = ["dateFrom", "dateUntil"];

        ctrl.getTimelineMulti(req, res, required);
    }

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Dashboard", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24" } }'
        
        var required = ["dateFrom", "dateUntil"];
        
        ctrl.getNlpMulti(req, res, required);
    }

}

module.exports = DashboardController;
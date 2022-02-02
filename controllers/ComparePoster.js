const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const ctrl      = require(BASE_DIR + '/controllers/General');
const model     = require(BASE_DIR + '/models/General');

class ComparePosterController {

    static async getPosterList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getPosterList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "offset": 0, "limit": 3 } }'
        /** Optional Parameter:
            "offset" : 0
            "limit"  : 10
            "search" : "sample"
        **/
        
        var requiredParams = [];
        ctrl.getPosterList(req, res, requiredParams);
    }
    
    static async getSummary(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getSummary", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "posterId": 753094136 } }'

        var required = ["dateFrom", "dateUntil", "posterId"];

        ctrl.getSummary(req, res, required);
    }

    static async getTopWord(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTopWord", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "type": 1, "limit": 200, "posterId": 753094136 } }'
        
        var required = ["dateFrom", "dateUntil", "type", "limit", "posterId"];

        ctrl.getTopWord(req, res, required);
    }

    static async getTopTopic(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTopTopic", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "posterId": 753094136 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "posterId"];

        ctrl.getTopTopic(req, res, required);
    }

    static async getTopHashtag(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTopHashtag", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 200, "posterId": 753094136 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "posterId"];

        ctrl.getTopHashtag(req, res, required);
    }

    static async getTopUrl(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTopUrl", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": 10, "posterId": 753094136 } }'
        
        var required = ["dateFrom", "dateUntil", "limit", "posterId"];

        ctrl.getTopUrl(req, res, required);
    }

    static async getTopGroup(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTopGroup", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "posterId": 753094136 } }'
        
        var required = ["dateFrom", "dateUntil", "offset", "limit", "posterId"];

        ctrl.getTopGroup(req, res, required);
    }

    static async getTopChannel(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTopChannel", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "posterId": 753094136 } }'

        var required = ["dateFrom", "dateUntil", "offset", "limit", "posterId"];

        ctrl.getTopChannel(req, res, required);
    }

    static async getTimeline(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getTimeline", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "posterIds": [753094136, 1175897952] } }'
        
        var required = ["dateFrom", "dateUntil", "posterIds"];
        var response = utils.duplicateObject(msg.ERR_RESPONSE);

        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, required, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getPosterInfo(req.body, function(posters) {
                    if (posters) {
                        model.getTimelineMulti(req.body, posters, [], 0, function(result) {
                            if (result.length) {
                                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
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

    static async getSentiment(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getSentiment", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "posterIds": [1165993179, 20945079, 753094136] } }'
        
        var required = ["dateFrom", "dateUntil", "posterIds"];
        var response = utils.duplicateObject(msg.ERR_RESPONSE);

        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, required, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getPosterInfo(req.body, function(posters) {
                    var categories = ["Positive", "Neutral", "Negative"];

                    if (posters) {
                        model.getSentimentMulti(req.body, posters, [], 0, function(result) {
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

    static async getNlp(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getNlp", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "posterIds": [1165993179, 20945079, 753094136] } }'
        
        var required = ["dateFrom", "dateUntil", "posterIds"];
        var response = utils.duplicateObject(msg.ERR_RESPONSE);

        sso.validateSession(req, res, function(user) {
            utils.checkParameter(req, res, required, function() {
                logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                model.getPosterInfo(req.body, function(posters) {
                    var categories = ["Radicalism", "Hoax", "Sarcasm", "Porn", "Propaganda", "Advertisement"];

                    if (posters) {
                        model.getNlpMulti(req.body, posters, [], 0, function(result) {
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

    static async getPosterOntology(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ComparePoster", "subAction": "getPosterOntology", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "limit": "10", "posterIds": [753094136, 1175897952] } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var required = ["dateFrom", "dateUntil", "posterIds"];

        ctrl.getPosterOntology(req, res, required, function(result) {
            if (result && result.length == 0) {
                response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                response["message"] = "Poster relation not available in this period, please change the period.";
                response["content"] = [];
            } else if (! result) {
                response = utils.duplicateObject(msg.ERROR_RESPONSE);
                response["message"] = "Get poster relation failed";
            } else {
                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                response["message"] = "Get poster relation success";
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

module.exports = ComparePosterController;
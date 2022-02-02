const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const model     = require(BASE_DIR + '/models/Search');
const ctrl      = require(BASE_DIR + '/controllers/General');

class SearchController {

    static async getGroupChannelList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Search", "subAction": "getGroupChannelList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'

        var requiredParams = [];
        ctrl.getGroupChannelList(req, res, requiredParams);
    }
    
    static async searchChat(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Search", "subAction": "searchChat", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "dateFrom": "2021-07-24", "dateUntil": "2021-08-24", "offset": 0, "limit": 10, "search": "" } }'
        /** Optional Parameter:
            "search"  : "sample"
            "poster"  : "(posterId) / (msisdn)"
            "group"   : ["(accountId)", (chatId), (oppositeId), "(groupName)"]
            "channel" : ["(accountId)", (chatId), (oppositeId), "(channelName)"]
        **/
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["dateFrom", "dateUntil", "offset", "limit"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.searchChat(bodyReq, function(count, result) {
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

module.exports = SearchController;
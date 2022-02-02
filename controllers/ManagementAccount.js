const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const config    = require(BASE_DIR + '/Config');
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const http      = require(BASE_DIR + '/libraries/HttpHandler');
const model     = require(BASE_DIR + '/models/ManagementAccount');

class ManagementAccountController {
    
    static async getAccountList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementAccount", "subAction": "getAccountList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = [];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getAccountList(bodyReq, function(result) {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Account not available";
                            response["content"] = [];
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get account list failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get account list success";
                            response["content"] = result;
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async sendCode(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementAccount", "subAction": "sendCode", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "phoneNumber": "6281703789001" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["phoneNumber"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    var API = utils.duplicateObject(config.API_TELEMON_ENGINE);
                    var params = JSON.stringify({
                        "action"    : "WebHook",
                        "subAction" : "sendCode", 
                        "body"      : {
                            "msisdn": bodyReq.params.phoneNumber.toString(),
                            "clientId": null
                        }
                    });

                    http.apiRequest(req.id, req.body.clientIp, API, params, {}, function(resApi) {
                        if (resApi.code == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["content"]["clientId"] = resApi.content;
                        } else {
                            response["message"] = resApi.message;
                            response["content"] = null;
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async submitCode(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementAccount", "subAction": "submitCode", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "phoneNumber": "6281703789001", "code": "57803", "clientId": "j89NFIT51b0vlhQB52EPrcYOUp6KtmdP" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["phoneNumber", "code", "clientId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    var API = utils.duplicateObject(config.API_TELEMON_ENGINE);
                    var params = JSON.stringify({
                        "action"    : "WebHook",
                        "subAction" : "submitLogin", 
                        "body"      : {
                            "msisdn": bodyReq.params.phoneNumber.toString(),
                            "code": bodyReq.params.code.toString(),
                            "clientId": bodyReq.params.clientId.toString()
                        }
                    });

                    http.apiRequest(req.id, req.body.clientIp, API, params, {}, function(resApi) {
                        if (resApi.code == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["content"]["clientId"] = resApi.content;
                        } else if (resApi.code == -18) {
                            response = resApi;
                            response["content"] = { "clientId": resApi.content };
                        } else {
                            response["message"] = resApi.message;
                            response["content"] = null;
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async submitPassword(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementAccount", "subAction": "submitPassword", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "phoneNumber": "6281703789001", "password": "83439", "clientId": "j89NFIT51b0vlhQB52EPrcYOUp6KtmdP" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["phoneNumber", "password", "clientId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    var API = utils.duplicateObject(config.API_TELEMON_ENGINE);
                    var params = JSON.stringify({
                        "action"    : "WebHook",
                        "subAction" : "submitPassword", 
                        "body"      : {
                            "msisdn": bodyReq.params.phoneNumber.toString(),
                            "password": bodyReq.params.password.toString(),
                            "clientId": bodyReq.params.clientId.toString()
                        }
                    });

                    http.apiRequest(req.id, req.body.clientIp, API, params, {}, function(resApi) {
                        if (resApi.code == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["content"]["clientId"] = resApi.content;
                        } else {
                            response["message"] = resApi.message;
                            response["content"] = null;
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async changeStatus(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementAccount", "subAction": "changeStatus", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "accountId": "u27fMRCs2DS77OsBKDwnbVrVc9oWfcrk", "status": 0 } }'
        /** Status Parameter:
            "status": 1 / 0 / -1
        **/

        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["accountId", "status"];
                
                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    if (bodyReq.params.status === -1) {
                        model.changeStatus(bodyReq, function(result) {
                            if (result) {
                                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                                response["message"] = "Account has been deleted";
                            } else {
                                response["message"] = "Delete account failed";
                            }
    
                            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        });
                    } else {
                        var API = utils.duplicateObject(config.API_TELEMON_ENGINE);
                        var params = JSON.stringify({
                            "action"    : "WebHook",
                            "subAction" : (bodyReq.params.status === 1) ? "startSession" : "stopSession", 
                            "body"      : {
                                "pid": bodyReq.params.accountId
                            }
                        });
                        
                        http.apiRequest(req.id, req.body.clientIp, API, params, {}, function(resApi) {
                            response = resApi;

                            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            setTimeout(() => {    
                                res.end(JSON.stringify(response));
                            }, 5000);
                        });
                    }
                });
            });
        });
    }

}

module.exports = ManagementAccountController;
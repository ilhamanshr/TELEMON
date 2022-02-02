const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const utils     = require(BASE_DIR + '/Utils');
const logger    = require(BASE_DIR + '/Logger');
const msg       = require(BASE_DIR + '/Messages');
const sso       = require(BASE_DIR + '/libraries/SSO');
const ctrl      = require(BASE_DIR + '/controllers/General');
const model     = require(BASE_DIR + '/models/ManagementGroupCategory');

class ManagementGroupCategoryController {
    
    static async getGroupCategoryList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementGroupCategory", "subAction": "getGroupCategoryList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = [];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getGroupCategoryList(bodyReq, function(result) {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Group category not available";
                            response["content"] = [];
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get group category list failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get group category list success";
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

    static async getGroupChannelList(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementGroupCategorys", "subAction": "getGroupChannelList", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": {} }'

        var requiredParams = [];
        ctrl.getGroupChannelList(req, res, requiredParams);
    }

    static async insertGroupCategory(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementGroupCategory", "subAction": "insertGroupCategory", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "categoryName": "Tes", "categoryDescription": "Tes deskripsi", "chatIds": ["d6QuMPHTdw0R3F3bQLQHeLQ8WNuZUaXThtv0ZqxBN", "jasdhasdw0R3F3bQLQHeLQ8WNuZUaXThtv0ZqxBN"] } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {
                
                var requiredParams = ["categoryName", "categoryDescription", "chatIds"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    bodyReq["username"] = user.username;
                    model.insertGroupCategory(bodyReq, function(result) {
                        if (result) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Group category has been added";
                        } else {
                            response["message"] = "Add group category failed";
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async getInfo(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementGroupCategory", "subAction": "getInfo", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "categoryId": "U1K5M0mEwu2y9Hmz1oIbud1hEB8ijRcU" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {
                
                var requiredParams = ["categoryId"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.getInfo(bodyReq, function(result) {
                        if (result && result.length == 0) {
                            response = utils.duplicateObject(msg.SUCCESS_DATA_NOT_FOUND);
                            response["message"] = "Group category not available";
                            response["content"] = {};
                        } else if (! result) {
                            response = utils.duplicateObject(msg.ERROR_RESPONSE);
                            response["message"] = "Get group category info failed";
                        } else {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Get group category info success";
                            response["content"] = result[0];
                        }

                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(response));
                    });
                });
            });
        });
    }

    static async updateGroupCategory(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementGroupCategory", "subAction": "updateGroupCategory", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "categoryId": "DT5huav6nUffZO1fBr1sIqrsQQGV21Nv", "categoryName": "tes ganti", "categoryDescription": "ganti deskripsi" } }'
        /** Optional Parameter:
            "categoryDescription": "sample"
            "chatIds": [(chatId), (chatId)]
        **/

        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {
                
                var requiredParams = ["categoryId", "categoryName"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.updateGroupCategory(bodyReq, function(result) {
                        if (result) {
                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = "Update group category success";
                            response["content"] = {};
                        } else {
                            response["message"] = "Update group category failed";
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
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "ManagementGroupCategory", "subAction": "changeStatus", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "categoryId": "DT5huav6nUffZO1fBr1sIqrsQQGV21Nv", "status": 0 } }'
        /** Status Parameter:
            "status": 1 / 0 / -1
        **/

        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {
                
                var requiredParams = ["categoryId", "status"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    model.changeStatus(bodyReq, function(result) {
                        if (result) {
                            var message = "Group category has been deleted";
                            if (parseInt(bodyReq.params.status) == 1) message = "Group category has been enabled";
                            if (parseInt(bodyReq.params.status) == 0) message = "Group category has been disabled";

                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                            response["message"] = message;
                        } else {
                            response["message"] = "Change group category status failed";
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

module.exports = ManagementGroupCategoryController;
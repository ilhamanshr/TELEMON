const fs            = require('fs');
const mime          = require('mime');
const path          = require('path');
const genThumbnail  = require('simple-thumbnail');
const BASE_DIR      = path.dirname(require.main.filename);
const config        = require(BASE_DIR + '/Config');
const utils         = require(BASE_DIR + '/Utils');
const logger        = require(BASE_DIR + '/Logger');
const msg           = require(BASE_DIR + '/Messages');
const http          = require(BASE_DIR + '/libraries/HttpHandler');
const sso           = require(BASE_DIR + '/libraries/SSO');

class MediaController {
    
    static async getMedia(req, res) {
        //curl -k https://localhost:1111/api -X POST -H "Content-Type: application/json" --data-raw '{ "action": "Media", "subAction": "getMedia", "token": "", "userAgent": "Sample user agent", "permission": "default", "params": { "mediaKey": "/media/6325343489533935974.mp4" } }'
        
        var response = utils.duplicateObject(msg.ERR_RESPONSE);
        var bodyReq  = req.body;
        
        sso.checkTokenPermissionRequired(req, res, req.body.clientIp, function() {
            sso.validateSession(req, res, function(user) {

                var requiredParams = ["mediaKey"];

                utils.checkParameter(req, res, requiredParams, function() {
                    logger.info(__filename, JSON.stringify(req.body), req.id, req.body.clientIp, "Received request from client");

                    var API = utils.duplicateObject(config.API_TELEMON_ENGINE);
                    var params = JSON.stringify({
                        "action"    : "WebHook",
                        "subAction" : "getAppDir", 
                        "body"      : {}
                    });
                    
                    http.apiRequest(req.id, req.body.clientIp, API, params, {}, function(resApi) {
                        try {
                            if (resApi.code === 0) {
                                var pathMedia = resApi.content + bodyReq.params.mediaKey;
                                var fileName  = path.basename(pathMedia);
                                var mimeType  = mime.lookup(pathMedia);
                                //=============================================================//
                                // res.setHeader('Content-Type', 'application/octet-stream');  //
                                // res.sendFile(pathMedia);                                    //
                                // res.status(200);                                            //
                                //=============================================================//
                                if (bodyReq.params.hasOwnProperty("thumbnail") && bodyReq.params.thumbnail && mimeType.includes("video")){

                                    let filepath = BASE_DIR + '/'+fileName+".png";

                                    genThumbnail(pathMedia, filepath, '250x?')
                                    .then(function(){
                                        fs.readFile(filepath, 'base64', function(err, data) {
                                            if (err) {
                                                response = utils.duplicateObject(msg.ERR_DATA_NOT_FOUND);
                                                response["message"] = "Media not available";
                                                response["content"] = null;
                                            } else {
                                                response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                                                response["message"] = "Get Media success";
                                                response["content"] = {
                                                    "mimetype": "image/png",
                                                    "filename": path.basename(filepath),
                                                    "base64": data
                                                }
                                                fs.unlinkSync(filepath);
                                            }
    
                                            logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");
    
                                            res.writeHead(200, { 'Content-Type': 'application/json' });
                                            res.end(JSON.stringify(response));
                                        });                                        
                                    })
                                    .catch(function(err){
                                        response = utils.duplicateObject(msg.ERR_DATA_NOT_FOUND);
                                        response["message"] = "Media not available";
                                        response["content"] = null;
                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify(response));
                                    });
                                } else {
                                    fs.readFile(pathMedia, 'base64', function(err, data) {
                                        if (err) {
                                            response = utils.duplicateObject(msg.ERR_DATA_NOT_FOUND);
                                            response["message"] = "Media not available";
                                            response["content"] = null;
                                        } else {
                                            response = utils.duplicateObject(msg.SUCCESS_RESPONSE);
                                            response["message"] = "Get Media success";
                                            response["content"] = {
                                                "mimetype": mimeType,
                                                "filename": fileName,
                                                "base64": data
                                            }
                                        }

                                        logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify(response));
                                    });
                                }
                            } else {
                                response = resApi;
                                response["content"] = null;

                                logger.info(__filename, JSON.stringify(response), req.id, req.body.clientIp, "Response to client");

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(response));
                            }
                        } catch (err) {
                            response['message'] = JSON.stringify(err);
                            logger.error(__filename, JSON.stringify(err));
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        }
                    });
                });
            });
        });
    }
}

module.exports = MediaController;
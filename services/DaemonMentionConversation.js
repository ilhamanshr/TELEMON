var path            = require('path');
Object.assign       = require('object-assign');
var appDir          = path.dirname(require.main.filename);
var config          = require(appDir + '/Config');
var utils           = require(appDir + '/Utils');
var mongo           = require(appDir + '/libraries/MongoDriver');
var logger          = require(appDir + '/Logger');

var response        = {code: 0, message: "OK"};

exports.doExecuteDaemon = function () {
    exports.getAllRequest(function(resStatus){
        setTimeout(function(){
            exports.doExecuteDaemon();
        }, 10000);
    });
};

exports.getAllRequest = function(cb){
    mongo.searchDataByProjectLimitSort(config.DB_COLL_CONVERSATION, {"mentions": {"$exists": false}}, {"contentText": 1}, 500, {"conversationDtm": -1}, function(resRegister){
        if(resRegister[0] && resRegister != false){
            exports.getResult(resRegister, function(respResult){
                cb(true);
            });
        }else{
            cb(true);
        }
    });
};

exports.getResult = function(data, cb){
    exports.mentionConversation(data, 0, function(mentionConversation){
        logger.info(__filename, "Success Get " + mentionConversation + " Mention Conversation Data /DaemonMentionConversation", "", "", "");
        cb(true);
    });        
};

exports.mentionConversation = function(docs, page, cb){
    if(page < docs.length){
        var idDocs = docs[page]._id;
        if(!docs[page].contentText || docs[page].contentText == ""){
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idDocs}, {"mentions": []}, function(resUpdate){
                exports.mentionConversation(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }else{
            var contentSplit = docs[page].contentText.split(" ");
            contentSplit = contentSplit.filter((text) => text.startsWith("@"));
            contentSplit = contentSplit.map(s => s.slice(1));
            mongo.updateData(config.DB_COLL_CONVERSATION, {"_id" : idDocs}, {"mentions": contentSplit}, function(resUpdate){
                exports.mentionConversation(docs, page+1, function(resLoop){
                    cb(resLoop);
                });
            });
        }
    }else{
        cb(page);
    }
};
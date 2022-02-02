var path            = require('path');
var os              = require('os');
var querystring     = require('querystring');
var randomstring    = require("randomstring");
var appDir          = path.dirname(require.main.filename);
var config          = require(appDir + '/Config');
var utils           = require(appDir + '/Utils');
var mongo           = require(appDir + '/libraries/MongoDriver');
var logger          = require(appDir + '/Logger');
var sw              = require('stopword');
var fs              = require('fs');
var nGram           = require("n-gram");
var response        = {code: 0, message: "OK"};

exports.doExecuteDaemon = function () {
    exports.getAllRequest(function(resStatus){
        setTimeout(function(){
            exports.doExecuteDaemon();
        }, 3600000);
    });
};

exports.getAllRequest = function(cb){
    var agg = [];

    agg.push({
        "$match": {
            "$and": [{"upgradedToSuperGroupId": {"$exists" : true}}, {"upgradedToSuperGroupId": {"$ne" : 0}}]
        }
    });

    agg.push({
        "$group": {
            "_id": "$groupID",
            "newGroupId": {"$first": "$upgradedToSuperGroupId"}
        }
    });

    agg.push({
        "$lookup" : { 
            "from" : "chats", 
            "let": {"groupID": "$_id"}, 
            "pipeline" : [{"$match": {"$expr": {"$eq": ["$oppositeId", "$$groupID"]}}}, {"$sort": {"createdDtm": 1}}, {"$limit": 1}], 
            "as" : "oldGroupDetail"
        }
    });

    agg.push({
        "$unwind": {
            "path": "$oldGroupDetail",
            "preserveNullAndEmptyArrays": true
        }
    });


    agg.push({
        "$lookup" : { 
            "from" : "chats", 
            "let": {"groupID": "$newGroupId"}, 
            "pipeline" : [{"$match": {"$expr": {"$eq": ["$oppositeId", "$$groupID"]}}}, {"$sort": {"createdDtm": 1}}, {"$limit": 1}], 
            "as" : "newGroupDetail"
        }
    });

    agg.push({
        "$unwind": {
            "path": "$newGroupDetail",
        }
    });

    agg.push({
        "$limit": 1
    });

    mongo.getAggregateData(config.DB_COLL_GROUP, agg, function(respText){
        if(respText[0] && respText != false){
            var chatIdRefresh = ("oldGroupDetail" in respText[0] ? respText[0].oldGroupDetail.chatId : "not found");
            mongo.updateManyData(config.DB_COLL_CONVERSATION, {"chatId" : chatIdRefresh}, {"chatId": respText[0].newGroupDetail.chatId}, function(resUpdate){
                mongo.removeData(config.DB_COLL_CHAT, {"oppositeId": respText[0]._id}, function(respRemove){
                    mongo.removeData(config.DB_COLL_GROUP, {"groupID": respText[0]._id}, function(respRemove){
                        cb(true);
                    })
                })
            });
        }else{
            cb(true);
        }
    });
};
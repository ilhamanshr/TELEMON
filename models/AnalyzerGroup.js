const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');

require("util").inspect.defaultOptions.depth = null;

class AnalyzerGroupModel {
    
    static async getOntology(bodyReq, cb) {
        var agg = [];
        
        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);
        
        agg.push({
            "$match": {
                "conversationDtm" : { 
                    "$gte" : dateFrom, 
                    "$lte" : dateUntil
                },
                "chatId": {"$in": bodyReq.params.chatIds},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$conversationDtm", "contentText": "$contentText"},  
                "contentText" : {"$first" : "$contentText"},
                "contentType" : {"$first" : "$contentType"},
                "contentValue" : {"$first" : "$contentValue"},
                "conversationDtm" : {"$first" : "$conversationDtm"},
                "chatId" : {"$first" : "$chatId"},
                "conversationId" : {"$first" : "$conversationId"},
                "replyMessageId" : {"$first" : "$replyMessageId"},
                "senderUserId" : {"$first" : "$senderUserId"},
                "mentions" : {"$first" : "$mentions"},
            }
        });
        
        if(bodyReq.params.type.toLowerCase() == "reply"){
            agg[0]["$match"]["replyMessageId"] = {"$ne": 0}

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"senderUserId": "$senderUserId"}, 
                    "pipeline" : [{"$match": {"$expr": {"$eq": ["$id", "$$senderUserId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}], 
                    "as" : "contactDetail"
                }
            });

            agg.push({
                "$unwind": {
                    "path": "$contactDetail",
                    "preserveNullAndEmptyArrays": true
                }
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "conversations", 
                    "let": {"replyMessageId": "$replyMessageId", "chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$eq": ["$conversationId", "$$replyMessageId"]}]}}},{"$group": {"_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$conversationDtm", "contentText": "$contentText"}, "senderUserId" : {"$first" : "$senderUserId"}, "contentText" : {"$first" : "$contentText"}, "contentType" : {"$first" : "$contentType"}, "contentValue" : {"$first" : "$contentValue"}}}, {"$lookup": {"from" : "contacts", "let": {"senderUserId": "$senderUserId"}, "pipeline" : [{"$match": {"$expr": {"$eq": ["$id", "$$senderUserId"]}}}, {"$limit": 1}], "as" : "contactId"}}, {"$unwind": {"path": "$contactId", "preserveNullAndEmptyArrays": true}}],
                    "as" : "replyMsg"
                }
            });

            agg.push({
                "$unwind": {
                    "path": "$replyMsg",
                    "preserveNullAndEmptyArrays": true
                }
            });

            agg.push({ 
                "$project" : { 
                    "_id": 0,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "posterId": "$senderUserId",
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "userType" : {"$ifNull" : [ "$contactDetail.type", "" ]},
                    "reply.profilePicture": {"$ifNull" : [ "$replyMsg.contactId.profilePhoto.big", null ]},
                    "reply.posterId": "$replyMsg.senderUserId",
                    "reply.name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$replyMsg.contactId.firstName", " ", "$replyMsg.contactId.lastName"]}, "" ]}}}, 
                    "reply.phoneNumber" : {"$ifNull" : [ "$replyMsg.contactId.msisdn", "" ]}, 
                    "reply.username" : {"$ifNull" : [ "$replyMsg.contactId.username", "" ]},
                    "reply.userType" : {"$ifNull" : [ "$replyMsg.contactId.type", "" ]},
                }
            });

            agg.push({
                "$group": {
                    "_id" : {"posterIdA" : "$posterId", "posterIdB" : "$reply.posterId"},  
                    "profilePicture" : {"$first" : "$profilePicture"},
                    "posterId" : {"$first" : "$posterId"},
                    "name" : {"$first" : "$name"},
                    "phoneNumber" : {"$first" : "$phoneNumber"},
                    "username" : {"$first" : "$username"},
                    "userType" : {"$first" : "$userType"},
                    "reply" : {"$first" : "$reply"},
                    "count": {"$sum": 1},
                }
            });

            agg.push({
                "$project": {
                    "_id" : 0
                }
            });
        }

        if(bodyReq.params.type.toLowerCase() == "mention"){
            agg[0]["$match"]["mentions.0"] = {"$exists": true}

            agg.push({
                "$unwind": {
                    "path": "$mentions",
                }
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"senderUserId": "$senderUserId"}, 
                    "pipeline" : [{"$match": {"$expr": {"$eq": ["$id", "$$senderUserId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}], 
                    "as" : "contactDetail"
                }
            });

            agg.push({
                "$unwind": {
                    "path": "$contactDetail",
                    "preserveNullAndEmptyArrays": true
                }
            });

            agg.push({ 
                "$lookup": {
                    "from" : "contacts", 
                    "let": {"username": "$mentions"}, 
                    "pipeline" : [{"$match": {"$expr": {"$eq": ["$username", "$$username"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}], 
                    "as" : "contactId"
                },
            });

            agg.push({
                "$unwind": {
                    "path": "$contactId",
                    "preserveNullAndEmptyArrays": true
                }
            });

            agg.push({ 
                "$project" : { 
                    "_id": 0,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "posterId": "$senderUserId",
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "userType" : {"$ifNull" : [ "$contactDetail.type", "" ]},
                    "mention.profilePicture": {"$ifNull" : [ "$contactId.profilePhoto.big", null ]},
                    "mention.posterId": "$mentions",
                    "mention.name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactId.firstName", " ", "$contactId.lastName"]}, "" ]}}}, 
                    "mention.phoneNumber" : {"$ifNull" : [ "$contactId.msisdn", "" ]}, 
                    "mention.username" : {"$ifNull" : [ "$contactId.username", "" ]},
                    "mention.userType" : {"$ifNull" : [ "$contactId.type", "" ]},
                }
            });

            agg.push({
                "$group": {
                    "_id" : {"posterIdA" : "$posterId", "posterIdB" : "$mention.posterId"},  
                    "profilePicture" : {"$first" : "$profilePicture"},
                    "posterId" : {"$first" : "$posterId"},
                    "name" : {"$first" : "$name"},
                    "phoneNumber" : {"$first" : "$phoneNumber"},
                    "username" : {"$first" : "$username"},
                    "userType" : {"$first" : "$userType"},
                    "mention" : {"$first" : "$mention"},
                    "count": {"$sum": 1},
                }
            });

            agg.push({
                "$project": {
                    "_id" : 0
                }
            });
        }

        agg.push({
            "$sort": {
                "count" : -1
            }
        });

        if("limit" in bodyReq.params){
            agg.push({
                "$limit" : parseInt(bodyReq.params.limit)
            });
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resAgg) {
            cb(resAgg);
        });
    }
}

module.exports = AnalyzerGroupModel;
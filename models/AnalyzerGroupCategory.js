const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const config 	= require(BASE_DIR + '/Config');
const mongo 	= require(BASE_DIR + '/libraries/MongoDriver');
const model 	= require(BASE_DIR + '/models/General');

class AnalyzerGroupCategorylModel {

    static async getTopWord(bodyReq, cb) {
        var clause = { "_id": bodyReq.params.categoryId };

        mongo.searchDataBy(config.DB_COLL_GROUP_CATEGORY, clause, function(resultGroupCategory) {
            if (!resultGroupCategory || resultGroupCategory.length == 0) {
                cb([]);
            } else {
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
                        "chatId": {"$in": resultGroupCategory[0].chatIds},
                        "contentType": {"$ne": "messageChatAddMembers"},
                    }
                });

                agg.push({ 
                    "$sort" : { 
                        "createDtm": -1,
                    }
                });

                agg.push({
                    "$project": {
                        "date":  "$conversationDtm",
                        "oneGram": "$oneGram",
                        "biGram": "$biGram",
                        "triGram": "$triGram",
                        "conversationId": 1,
                        "accountId": 1,
                        "chatId": 1,
                        "senderUserId": 1,
                        "conversationDtm": 1,
                        "contentText": 1
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                        "oneGram" : {"$first" : "$oneGram"},
                        "biGram" : {"$first" : "$biGram"},
                        "triGram" : {"$first" : "$triGram"}
                    }
                });

                var gram = "$oneGram";
                if (bodyReq.params.type == 2) gram = "$biGram";
                if (bodyReq.params.type == 3) gram = "$triGram";

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "gram": gram
                    }
                });

                agg.push({
                    "$unwind" : {
                        "path" : "$gram",
                    }
                });

                agg.push({
                    "$project": {
                        "gram": { "$toLower": "$gram" }
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : "$gram",
                        "count": {"$sum": 1}
                    }
                });

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "name": "$_id",
                        "count": "$count"
                    }
                });

                agg.push({
                    "$sort" : { 
                        "count" : -1
                    }
                });

                agg.push({
                    "$limit" : parseInt(bodyReq.params.limit)
                });

                mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                    cb(result);
                });
            }
        });
    }

    static async getTopHashtag(bodyReq, cb) {
        var clause = { "_id": bodyReq.params.categoryId };

        mongo.searchDataBy(config.DB_COLL_GROUP_CATEGORY, clause, function(resultGroupCategory) {
            if (!resultGroupCategory || resultGroupCategory.length == 0) {
                cb([]);
            } else {
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
                        "chatId": {"$in": resultGroupCategory[0].chatIds},
                        "contentType": {"$ne": "messageChatAddMembers"},
                    }
                });

                agg.push({ 
                    "$sort" : { 
                        "createDtm": -1,
                    }
                });

                agg.push({
                    "$project": {
                        "date":  "$conversationDtm",
                        "hashtags": "$hashtags",
                        "conversationId": 1,
                        "accountId": 1,
                        "chatId": 1,
                        "senderUserId": 1,
                        "contentText": 1
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                        "hashtags" : {"$first" : "$hashtags"},
                    }
                });

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "gram": "$hashtags"
                    }
                });

                agg.push({
                    "$unwind" : {
                        "path" : "$gram",
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : "$gram",
                        "count": {"$sum": 1}
                    }
                });

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "name": "$_id",
                        "count": "$count"
                    }
                });

                agg.push({
                    "$sort" : { 
                        "count" : -1
                    }
                });

                agg.push({
                    "$limit" : parseInt(bodyReq.params.limit)
                });

                mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                    cb(result);
                });
            }
        });
    }

    static async getTopTopic(bodyReq, cb) {
        var clause = { "_id": bodyReq.params.categoryId };

        mongo.searchDataBy(config.DB_COLL_GROUP_CATEGORY, clause, function(resultGroupCategory) {
            if (!resultGroupCategory || resultGroupCategory.length == 0) {
                cb([]);
            } else {
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
                        "chatId": {"$in": resultGroupCategory[0].chatIds},
                        "contentType": {"$ne": "messageChatAddMembers"},
                    }
                });

                agg.push({ 
                    "$sort" : { 
                        "createDtm": -1,
                    }
                });

                agg.push({
                    "$project": {
                        "date" : "$conversationDtm", 
                        "conversationId" : 1,
                        "accountId": 1, 
                        "chatId" : 1, 
                        "topics" : 1,
                        "senderUserId": 1,
                        "contentText": 1
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                        "topics" : {"$first" : "$topics"},
                    }
                });

                agg.push({
                    "$unwind" : {
                        "path" : "$topics",
                    }
                });

                agg.push({
                    "$project": { 
                        "topics" : { "$toLower": "$topics" }
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : "$topics",
                        "count": {"$sum": 1}
                    }
                });

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "topic": "$_id",
                        "count": "$count"
                    }
                });

                agg.push({
                    "$sort" : { 
                        "count" : -1
                    }
                });

                if(bodyReq.params.offset){
                    agg.push({
                        "$skip" : parseInt(bodyReq.params.offset)
                    }); 
                }

                agg.push({
                    "$limit" : parseInt(bodyReq.params.limit)
                });

                mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                    cb(result);
                });
            }
        });
    }

    static async getTopUrl(bodyReq, cb) {
        var clause = { "_id": bodyReq.params.categoryId };

        mongo.searchDataBy(config.DB_COLL_GROUP_CATEGORY, clause, function(resultGroupCategory) {
            if (!resultGroupCategory || resultGroupCategory.length == 0) {
                cb([]);
            } else {
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
                        "chatId": {"$in": resultGroupCategory[0].chatIds},
                        "contentType": {"$ne": "messageChatAddMembers"},
                    }
                });

                agg.push({ 
                    "$sort" : { 
                        "createDtm": -1,
                    }
                });

                agg.push({
                    "$project": {
                        "date":  "$conversationDtm",
                        "urls": "$urls",
                        "conversationId": 1,
                        "accountId": 1,
                        "chatId": 1,
                        "senderUserId": 1,
                        "contentText": 1
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                        "urls" : {"$first" : "$urls"},
                    }
                });

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "gram": "$urls"
                    }
                });

                agg.push({
                    "$unwind" : {
                        "path" : "$gram",
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : "$gram",
                        "count": {"$sum": 1}
                    }
                });

                agg.push({
                    "$project": {
                        "_id" : 0,
                        "url": "$_id",
                        "count": "$count"
                    }
                });

                agg.push({
                    "$sort" : { 
                        "count" : -1
                    }
                });

                agg.push({
                    "$limit" : parseInt(bodyReq.params.limit)
                });

                mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                    cb(result);
                });
            }
        });
    }

    static async getTopPoster(bodyReq, cb) {
        var clause = { "_id": bodyReq.params.categoryId };

        mongo.searchDataBy(config.DB_COLL_GROUP_CATEGORY, clause, function(resultGroupCategory) {
            if (!resultGroupCategory || resultGroupCategory.length == 0) {
                cb([]);
            } else {
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
                        "chatId": {"$in": resultGroupCategory[0].chatIds},
                        "senderUserId": {"$ne": null},
                        "contentType": {"$ne": "messageChatAddMembers"},
                    }
                });

                agg.push({ 
                    "$sort" : { 
                        "createDtm": -1,
                    }
                });

                agg.push({
                    "$project": {
                        "date" : "$conversationDtm", 
                        "conversationId" : 1, 
                        "chatId" : 1, 
                        "poster" : "$senderUserId",
                        "author": 1,
                        "senderUserId": 1,
                        "contentText": 1
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},
                        "poster" : {"$first" : "$poster"},
                        "chatId" : {"$first" : "$chatId"},
                        "accountId" : {"$first" : "$accountId"}
                    }
                });

                agg.push({
                    "$group": {
                        "_id" : "$poster",
                        "posterId": {"$first": "$poster"},
                        "chatId" : {"$first" : "$chatId"},
                        "accountId" : {"$first" : "$accountId"},
                        "totalConversation": {"$sum": 1}
                    }
                });

                agg.push({
                    "$sort": {
                        "totalConversation": -1
                    }
                });

                if(bodyReq.params.offset >= 0){
                    agg.push({
                        "$skip": bodyReq.params.offset
                    });
                }
                
                if(bodyReq.params.limit != "" && bodyReq.params.limit > 0){
                    agg.push({
                        "$limit": bodyReq.params.limit
                    });
                }

                agg.push({ 
                    "$lookup" : { 
                        "from" : "contacts", 
                        "let": {"posterId": "$posterId"},
                        "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$id", "$$posterId"]}, {"$ne": ["$type", "userTypeDeleted"]}]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
                        "as" : "contactDetail"
                    }
                });

                agg.push({
                    "$unwind": {
                        "path": "$contactDetail"
                    }
                });

                agg.push({ 
                    "$lookup" : { 
                        "from" : "spam_poster", 
                        "localField" : "contactDetail.msisdn", 
                        "foreignField" : "phoneNumber", 
                        "as" : "spamPoster"
                    }
                });

                agg.push({
                    "$unwind": {
                        "path": "$spamPoster",
                        "preserveNullAndEmptyArrays": true
                    }
                });

                agg.push({ 
                    "$project" : { 
                        "_id": 0,
                        "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                        "chatId" : 1,
                        "accountId": 1,
                        "posterId": 1,
                        "totalConversation": 1,
                        "spamPoster": {"$cond" : {"if" : {"$eq" : ["$spamPoster.status", 1]}, "then" : 1, "else" : 0}},
                        "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                        "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                        "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                        "userType" : {"$ifNull" : [ "$contactDetail.type", "" ]},
                    }
                });

                mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                    cb(result);
                });
            }
        });
    }

}

module.exports = AnalyzerGroupCategorylModel;
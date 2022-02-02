const path      = require('path');
const BASE_DIR  = path.dirname(require.main.filename);
const config 	= require(BASE_DIR + '/Config');
const mongo 	= require(BASE_DIR + '/libraries/MongoDriver');

class GeneralModel {
    
    static async getSummaryPosterList(bodyReq, cb) {
        var agg = [];
    
        agg.push({
            "$match": {
                "type": {"$ne": "userTypeDeleted"}
            }
        });

        agg.push({
            "$sort": { "updateDtm": -1 }
        });

        agg.push({
            "$group": {
                "_id" : "$id",  
                "accountId" : {"$first" : "$accountId"},
                "posterId" : {"$first" : "$id"},
                "profilePicture" : {"$first" : "$profilePhoto.big"},
                "poster" : {"$first" : "$msisdn"},
                "firstName" : {"$first" : "$firstName"},
                "lastName" : {"$first" : "$lastName"},
                "username" : {"$first" : "$username"},
                "dateUpdate" : {"$first" : "$updateDtm"},
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "accountId": 1,
                "posterId": 1,
                "profilePicture": {"$ifNull" : [ "$profilePicture", null ]},
                "poster" : 1, 
                "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$firstName", " ", "$lastName"]}, "" ]}}}, 
                "username" : 1,
                "dateUpdate": 1
            }
        });

        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg.push({ 
                "$lookup" : { 
                    "from" : "conversations", 
                    "let": {"posterId": "$posterId"},
                    "pipeline": [{"$match": {"$expr": {"$and": [{"$eq": ["$senderUserId", "$$posterId"]}, {"$in": ["$chatId", bodyReq.params.chatIds]}]}}}, {"$limit": 1}],
                    "as" : "category"
                }
            });

            agg.push({ 
                "$unwind" : { 
                    "path" : "$category"
                }
            });
        }

        agg.push({
            "$count": "count"
        });

        mongo.getAggregateData(config.DB_COLL_CONTACT, agg, function(result) {
            cb(result);
        });
    }

    static async getSummaryPosterActiveList(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "senderUserId": {"$ne": null},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$group": {
                "_id" : "$senderUserId",
                "accountId": {"$first": "$accountId"}
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "contacts", 
                "let": {"posterId": "$_id"},
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
            "$count": "count"
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
        
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getSummaryAccountList(bodyReq, cb) {
        var agg = [];
    
        agg.push({
            "$match": {
                "status": (bodyReq.params.hasOwnProperty("dateFrom") && bodyReq.params.hasOwnProperty("dateUntil")) ? 1 : { "$gte": 0 },
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "contacts", 
                "let": {"msisdn": "$msisdn", "accountId": "$_id"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$accountId", "$$accountId"]}, {"$eq": ["$isMe", true]}/*, {"$eq": ["$msisdn", "$$msisdn"]}*/]}}}],
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
            "$project" : { 
                "_id": 0,
                "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                "accountId": "$_id",
                "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                "phoneNumber" : {"$ifNull" : [ "$msisdn", "" ]}, 
                "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                "dateCreate" : {"$ifNull" : [ "$createDtm", "" ]},
                "dateUpdate" : {"$ifNull" : [ "$updateDtm", "" ]},
                "status": "$status",
            }
        });
    
        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg.push({
                "$match" : {
                    "$or" : [
                        {"name" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
                        {"phoneNumber" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
                        {"username" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
                    ]
                }
            })
        }
    
        agg.push({
            "$sort": {
                "status": -1,
                "dateCreate": -1
            }
        });
    
        agg.push({
            "$count": "count"
        });
    
        if (bodyReq.subAction == "getAccountList") agg.splice(-1,1);
        
        mongo.getAggregateData(config.DB_COLL_ACCOUNT, agg, function(result) {
            cb(result);
        });
    }

    static async getSummaryGroupList(bodyReq, cb) {
        var agg = [];
    
        agg.push({
            "$match": {
                "chatType": /group/i,
            }
        });

        agg.push({
            "$sort": {
                "createDtm": -1
            }
        });

        agg.push({
            "$group": {
                "_id" : "$oppositeId",  
                "accountId" : {"$first" : "$accountId"},
                "chatId" : {"$first" : "$chatId"},
                "serialized" : {"$first" : "$_id"},
                "groupName" : {"$first" : "$title"},
                "oppositeId" : {"$first" : "$oppositeId"},
                "lastMessage" : {"$first" : "$lastMessage"},
                "dateUpdate" : {"$first" : "$createDtm"},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({
            "$project": {
                "accountId" : 1,
                "chatId" : 1,
                "serialized" : 1,
                "groupName" : 1,
                "oppositeId" : 1,
                "lastMessage" : 1,
                "dateUpdate" : 1,
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$groupDetail.photos", 0]}, null ]},
                "groupDescription" : {"$ifNull" : [ "$groupDetail.description", "" ]},
                "totalMember" : "$groupDetail.memberCount",
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "accountId" : 1,
                "chatId" : 1,
                "serialized" : 1,
                "groupName" : 1,
                "oppositeId" : 1,
                "lastMessage" : 1,
                "dateUpdate" : 1,
                "profilePicture" : {"$ifNull" : [ "$profilePicture.fileGenerated", null ]},
                "groupDescription" : 1,
                "totalMember" : 1,
            }
        });

        agg.push({
            "$count": "count"
        });

        if (bodyReq.subAction == "getGroupList") {
            agg.splice(-1,1);
            if("search" in bodyReq.params){
                agg[0]["$match"]["title"] = {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')};
            }
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        if("offset" in bodyReq.params && bodyReq.params.offset != ""){
            agg.push({ 
                "$skip" : parseInt(bodyReq.params.offset)
            });
        }

        if("limit" in bodyReq.params && bodyReq.params.limit != ""){
            agg.push({ 
                "$limit" : parseInt(bodyReq.params.limit)
            });
        }

        mongo.getAggregateData(config.DB_COLL_CHAT, agg, function(result) {
            cb(result);
        });
    }

    static async getGroupChannelList(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "chatType": {"$in": ["channel", "basicGroup", "superGroup"]}
            }
        });

        agg.push({
            "$sort": {
                "createDtm": -1
            }
        });

        agg.push({
            "$group": {
                "_id" : "$oppositeId",  
                "accountId" : {"$first" : "$accountId"},
                "chatId" : {"$first" : "$chatId"},
                "serialized" : {"$first" : "$_id"},
                "name" : {"$first" : "$title"},
                "oppositeId" : {"$first" : "$oppositeId"},
                "lastMessage" : {"$first" : "$lastMessage"},
                "dateUpdate" : {"$first" : "$createDtm"},
                "chatType" : {"$first" : "$chatType"},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "accountId" : 1,
                "chatId" : 1,
                "serialized" : 1,
                "name" : 1,
                "oppositeId" : 1,
                "lastMessage" : 1,
                "dateUpdate" : 1,
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$groupDetail.photos.fileGenerated", 0]}, null ]},
                "description" : {"$ifNull" : [ "$groupDetail.description", "" ]},
                "totalMember" : "$groupDetail.memberCount",
                "chatType" : 1,
            }
        });

        mongo.getAggregateData(config.DB_COLL_CHAT, agg, function(result) {
            cb(result);
        });
    }

    static async getGroupInfo(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "chatId": { "$in": bodyReq.params.chatIds },
                "chatType": { "$ne": "private" }
            }
        });

        agg.push({
            "$group": {
                "_id": "$chatId",
                "details": {
                    "$push": {
                    "accountId": "$accountId",
                    "dateCreate": "$createDtm",
                    "lastMessage": "$lastMessage",
                    "oppositeId": "$oppositeId",
                    "title": "$title"
                    }
                }
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "chatId": "$_id",
                "details": "$details"
            }
        });
        
        mongo.getAggregateData(config.DB_COLL_CHAT, agg, function(result) {
            if (result && result.length && bodyReq.params.chatIds.length > 1) {
                var sortedArray = [];
                bodyReq.params.chatIds.forEach(function(val, key) {
                    result.forEach(function(v, k) {
                        if (v.hasOwnProperty("chatId") && v.chatId == val) {
                            sortedArray.push(v);
                            return false;
                        }
                    });
                });

                cb(sortedArray);
            } else {
                cb(result);
            }
        });
    }

    static async getSummaryGroupActiveList(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
                "senderUserId": {"$ne": null}
            }
        });

        agg.push({
            "$group": {
                "_id" : "$chatId",
                "accountId" : {"$first" : "$accountId"},
                "chatId" : {"$first" : "$chatId"},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "chats", 
                "let": {"chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$or": [{"$eq": ["$chatType", "superGroup"]}, {"$eq": ["$chatType", "basicGroup"]}]}]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                "as" : "chatsDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatsDetail",
            }
        });
    
        agg.push({
            "$count": "count"
        });

        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getSummaryChannelList(bodyReq, cb) {
        var agg = [];
    
        agg.push({
            "$match": {
                "chatType": "channel",
            }
        });

        agg.push({
            "$sort": {
                "createDtm": -1
            }
        });

        agg.push({
            "$group": {
                "_id" : "$oppositeId",  
                "accountId" : {"$first" : "$accountId"},
                "chatId" : {"$first" : "$chatId"},
                "serialized" : {"$first" : "$_id"},
                "channelName" : {"$first" : "$title"},
                "oppositeId" : {"$first" : "$oppositeId"},
                "lastMessage" : {"$first" : "$lastMessage"},
                "dateUpdate" : {"$first" : "$createDtm"},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "channelDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$channelDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({
            "$project": {
                "accountId" : 1,
                "chatId" : 1,
                "serialized" : 1,
                "channelName" : 1,
                "oppositeId" : 1,
                "lastMessage" : 1,
                "dateUpdate" : 1,
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$channelDetail.photos", 0]}, null ]},
                "channelDescription" : {"$ifNull" : [ "$channelDetail.description", "" ]},
                "totalMember" : "$channelDetail.memberCount",
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "accountId" : 1,
                "chatId" : 1,
                "serialized" : 1,
                "channelName" : 1,
                "oppositeId" : 1,
                "lastMessage" : 1,
                "dateUpdate" : 1,
                "profilePicture" : {"$ifNull" : [ "$profilePicture.fileGenerated", null ]},
                "channelDescription" : 1,
                "totalMember" : 1,
            }
        });

        agg.push({
            "$count": "count"
        });

        if (bodyReq.subAction == "getChannelList") {
            agg.splice(-1,1);
            if("search" in bodyReq.params){
                agg[0]["$match"]["title"] = {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')};
            }
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        if("offset" in bodyReq.params && bodyReq.params.offset != ""){
            agg.push({ 
                "$skip" : parseInt(bodyReq.params.offset)
            });
        }

        if("limit" in bodyReq.params && bodyReq.params.limit != ""){
            agg.push({ 
                "$limit" : parseInt(bodyReq.params.limit)
            });
        }

        mongo.getAggregateData(config.DB_COLL_CHAT, agg, function(result) {
            cb(result);
        });
    }

    static async getSummaryChannelActiveList(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "senderUserId": null,
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$group": {
                "_id" : "$chatId",
                "accountId" : {"$first" : "$accountId"},
                "chatId" : {"$first" : "$chatId"},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "chats", 
                "let": {"chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$eq": ["$chatType", "channel"]}]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                "as" : "chatsDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatsDetail",
            }
        });
    
        agg.push({
            "$count": "count"
        });

        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopWord(bodyReq, cb) {
        var agg = [];
    
        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);

        var gram = "$oneGram";
        if (bodyReq.params.type == 2) gram = "$biGram" ;
        if (bodyReq.params.type == 3) gram = "$triGram";

        var keyGram = gram.replace('$', '');

        agg.push({
            "$match": {
                "conversationDtm" : { 
                    "$gte" : dateFrom, 
                    "$lte" : dateUntil
                },
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$unwind" : {
                "path" : gram,
            }
        });
        
        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "conversationId": 1,
                "senderUserId": 1,
                "chatId": 1,
                "contentText": 1
            }
        });

        agg[2]["$project"][keyGram] = gram;

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"}, 
            }
        });

        agg[3]["$group"]["_id"][keyGram] = gram

        agg.push({
            "$project": {
                "_id" : 0,
                "gram": "$_id." + keyGram
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

        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopTopic(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$unwind" : {
                "path" : "$topics",
            }
        });

        agg.push({
            "$project": { 
                "date" : "$conversationDtm", 
                "conversationId" : 1,
                "senderUserId": 1, 
                "chatId" : 1,
                "topics" : { "$toLower": "$topics" },
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "topics" : "$topics", "contentText": "$contentText"},
            }
        });

        agg.push({
            "$group": {
                "_id" : "$_id.topics",
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

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
        
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopUrl(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "urls": "$urls",
                "conversationId": 1,
                "senderUserId": 1,
                "chatId": 1,
                "contentText": 1
            }
        });

        agg.push({
            "$unwind" : {
                "path" : "$urls",
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "urls" : "$urls", "contentText": "$contentText"},
            }
        });

        agg.push({
            "$project": {
                "_id" : 0,
                "gram": "$_id.urls"
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

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopHashtag(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "hashtags": "$hashtags",
                "conversationId": 1,
                "senderUserId": 1,
                "chatId": 1,
                "contentText": 1
            }
        });

        agg.push({
            "$unwind" : {
                "path" : "$hashtags",
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "hashtags" : "$hashtags", "contentText": "$contentText"},
            }
        });

        agg.push({
            "$project": {
                "_id" : 0,
                "gram": "$_id.hashtags"
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

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopGroup(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "senderUserId": {"$ne": null},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId": "$senderUserId", "conversationDtm": "$conversationDtm", "contentText": "$contentText"},  
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first": "$accountId"},
                "group": {"$first": "$chatId"}
            }
        });

        agg.push({
            "$group": {
                "_id" : "$group",  
                "accountId": {"$first": "$accountId"},
                "chatId": {"$first" : "$chatId"},
                "totalConversation": {"$sum": 1}
            }
        });

        agg.push({
            "$lookup": {
                "from": "chats",
                "let": {"chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr":  {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                "as": "chatDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups",
                "let": {"oppositeId": "$chatDetail.oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groupMembers", 
                "let": {"oppositeId": "$chatDetail.oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$groupID", "$$oppositeId"]}, {"$eq": ["$status", "chatMemberStatusCreator"]}]}}}, {"$limit": 1}],
                "as" : "groupCreator"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupCreator",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "contacts", 
                "let": {"posterId": "$groupCreator.contactId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$id", "$$posterId"]}, {"$ne": ["$type", "userTypeDeleted"]}]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
            "$project" : { 
                "_id": 0, 
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$groupDetail.photos.fileGenerated", 0]}, null ]},
                "groupName" : "$chatDetail.title",
                "posterId" : "$contactDetail.id",
                "groupOwnerName": { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                "groupOwnerPhoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]},
                "groupOwnerUsername" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                "groupOwnerId" : {"$ifNull" : [ "$groupCreator.contactId", "" ]},
                "groupDescription" : {"$ifNull" : [ "$groupDetail.description", "" ]},
                "totalMember" : "$groupDetail.memberCount",
                "totalConversation" : 1,
                "chatId" : 1,
                "serialized" : "$chatDetail._id",
                "accountId" : 1,
                "lastMessage" : {"$ifNull" : [ "$chatDetail.lastMessage", "" ]},
                "oppositeId" : "$chatDetail.oppositeId",
            }
        });

        agg.push({
            "$sort": {
                "totalConversation": -1
            }
        });

        if("offset" in bodyReq.params && bodyReq.params.offset != ""){
            agg.push({ 
                "$skip" : bodyReq.params.offset
            });
        }

        if("limit" in bodyReq.params && bodyReq.params.limit != ""){
            agg.push({ 
                "$limit" : bodyReq.params.limit
            });
        }

        if (bodyReq.subAction == "getInfo") {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
        
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopChannel(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "senderUserId": null,
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId": "$senderUserId", "conversationDtm": "$conversationDtm", "contentText": "$contentText"},  
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first": "$accountId"},
                "channel": {"$first": "$chatId"}
            }
        });

        agg.push({
            "$group": {
                "_id" : "$channel",  
                "accountId": {"$first": "$accountId"},
                "chatId": {"$first" : "$chatId"},
                "totalConversation": {"$sum": 1},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "chats", 
                "let": {"chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$eq": ["$chatType", "channel"]}]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                "as" : "chatDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$chatDetail.oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "channelDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$channelDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$project" : { 
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$channelDetail.photos", 0]}, null ]},
                "channelName" : "$chatDetail.title",
                "channelDescription" : {"$ifNull" : [ "$channelDetail.description", "" ]},
                "totalMember" : "$channelDetail.memberCount",
                "totalConversation" : 1,
                "chatId" : 1,
                "serialized" : "$chatDetail._id",
                "accountId" : 1,
                "lastMessage" : "$chatDetail.lastMessage",
                "oppositeId" : "$chatDetail.oppositeId",
            }
        });

        agg.push({ 
            "$project" : { 
                "_id": 0, 
                "profilePicture" : {"$ifNull" : [ "$profilePicture.fileGenerated", null ]},
                "channelName" : 1,
                "channelDescription" : 1,
                "totalMember" : 1,
                "totalConversation" : 1,
                "chatId" : 1,
                "serialized" : 1,
                "accountId" : 1,
                "lastMessage" : 1,
                "oppositeId" : 1,
            }
        });

        agg.push({
            "$sort": {
                "totalConversation": -1
            }
        });

        if (bodyReq.subAction == "getInfo") {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        if("offset" in bodyReq.params && bodyReq.params.offset != ""){
            agg.push({ 
                "$skip" : bodyReq.params.offset
            });
        }

        if("limit" in bodyReq.params && bodyReq.params.limit != ""){
            agg.push({ 
                "$limit" : bodyReq.params.limit
            });
        }
        
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getTopPoster(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "senderUserId": {"$ne": null},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date" : "$conversationDtm", 
                "conversationId" : 1, 
                "chatId" : 1, 
                "poster" : "$senderUserId",
                "author": 1,
                "accountId": 1,
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
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

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getSentiment(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "sentiment": 1,
                "conversationId": 1,
                "senderUserId": 1,
                "chatId": 1,
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "sentiment" : {"$first" : "$sentiment"},
            }
        });

        agg.push({
            "$group": {
                "_id" : "$sentiment",
                "count": {"$sum": 1}
            }
        });

        agg.push({
            "$project": {
                "_id" : 0,
                "name": "$_id",
                "y": "$count"
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
        
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }
    
    static async getTimelineMulti(bodyReq, arr, resultFinal, ind, cb) {
        var self = this;

        if (ind < arr.length) {
            var data = arr[ind];
            var dataSeries = {
                "name": "",
                "data": []
            }

            var clause = "";
            if (typeof data === "string") {
                dataSeries["name"] = data;
                clause = data;
            }
            if (typeof data === "object" && "posterId" in data && data.posterId) {
                dataSeries["name"] = (data.details.length) ? data.details[0].name : "";
                clause = data.posterId;
            }
            if (typeof data === "object" && "chatId" in data && data.chatId) {
                if ("groupName" in data) {
                    dataSeries["name"] = data.groupName;
                } else {
                    dataSeries["name"] = (data.details.length) ? data.details[0].title : "";
                }
                clause = data.chatId;
            }
            
            if (clause) {
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
                        "chatId": {"$lt": 0},
                        "contentType": {"$ne": "messageChatAddMembers"},
                    }
                });
        
                agg.push({
                    "$project": {
                        "date": "$conversationDtm",
                        "conversationId": 1,
                        "chatId": 1,
                        "accountId": 1,
                        "senderUserId": 1, 
                        "contentText": 1
                    }
                });
        
                agg.push({
                    "$group": {
                        "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                        "date" : {"$first" : "$date"},
                    }
                });
        
                agg.push({
                    "$project": { 
                        "yearMonthDay" : { 
                            "$dateToString" : { 
                                "format" : "%Y-%m-%d", 
                                "date" : "$date"
                            }
                        }, 
                        "date" : 1
                    }
                });
        
                agg.push({
                    "$group": {
                        "_id" : "$yearMonthDay",
                        "date" : {
                            "$first": "$date"
                        }, 
                        "count": {
                            "$sum": 1
                        }
                    }
                });
        
                agg.push({
                    "$sort" : { 
                        "date" : 1
                    }
                });
        
                agg.push({
                    "$project": { 
                        "_id": 0, 
                        "date" : "$_id",
                        "count": "$count"
                    }
                });
                
                if (typeof clause === "string" && "words" in bodyReq.params) {
                    agg[0]["$match"]["oneGram"] = { "$regex": new RegExp('^'+ clause +'$', 'i') };
                    dataSeries["word"] = clause;
                }
                if (typeof clause === "string" && "hashtags" in bodyReq.params) {
                    agg[0]["$match"]["hashtags"] = { "$regex": new RegExp('^'+ clause +'$', 'i') };
                    dataSeries["hashtag"] = clause;
                }
                if (typeof clause === "string" && "topics" in bodyReq.params) {
                    agg[0]["$match"]["topics"] = { "$regex": new RegExp('^'+ clause +'$', 'i') };
                    dataSeries["topic"] = clause;
                }
                if (typeof data === "object" && "posterId" in data && data.posterId) {
                    agg[0]["$match"]["senderUserId"] = clause;
                    dataSeries["posterId"] = clause;
                }
                if (typeof data === "object" && "chatId" in data && data.chatId) {
                    agg[0]["$match"]["chatId"] = clause;
                    dataSeries["chatId"] = clause;
                }
                
                mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                    if (result && result.length > 0) {
                        result.forEach(element => {
                            var timePush = [new Date(element.date).getTime(), element.count]
                            dataSeries["data"].push(timePush);
                        });
                    }
                    
                    resultFinal.push(dataSeries);
                    self.getTimelineMulti(bodyReq, arr, resultFinal, (ind + 1), function(resLoop) {
                        cb(resLoop);
                    });
                });
            } else {
                resultFinal.push(dataSeries);
                self.getTimelineMulti(bodyReq, arr, resultFinal, (ind + 1), function(resLoop) {
                    cb(resLoop);
                });
            }
        } else {
            cb(resultFinal);
        }
    }

    static async getSentimentMulti(bodyReq, arr, resultFinal, ind, cb) {
        var self = this;

        if (ind < arr.length) {
            var data = arr[ind];
            var dataSeries = {
                "name": "",
                "data": [0, 0, 0]
            }
            
            var clause = "";
            if (typeof data === "string") {
                dataSeries["name"] = data;
                clause = data;
            }
            if (typeof data === "object" && "posterId" in data && data.posterId) {
                dataSeries["name"] = (data.details.length) ? data.details[0].name : "";
                clause = data.posterId;
            }
            if (typeof data === "object" && "chatId" in data && data.chatId) {
                if ("groupName" in data) {
                    dataSeries["name"] = data.groupName;
                } else {
                    dataSeries["name"] = (data.details.length) ? data.details[0].title : "";
                }
                clause = data.chatId;
            }
            
            if (clause) {
                if (typeof clause === "string" && "words" in bodyReq.params) {
                    bodyReq.params['word'] = clause;
                }
                if (typeof clause === "string" && "hashtags" in bodyReq.params) {
                    bodyReq.params['hashtag'] = clause;
                }
                if (typeof clause === "string" && "topics" in bodyReq.params) {
                    bodyReq.params['topic'] = clause;
                }
                if (typeof data === "object" && "posterId" in data && data.posterId) {
                    bodyReq.params['posterId'] = clause;
                }
                if (typeof data === "object" && "chatId" in data && data.chatId) {
                    bodyReq.params['chatId'] = clause;
                }

                self.getSentiment(bodyReq, function(resultSentiment) {
                    if (resultSentiment && resultSentiment.length) {
                        resultSentiment.forEach(function(val, key) {
                            if (val.name == 1) dataSeries["data"][0] = val.y;
                            if (val.name == 0) dataSeries["data"][1] = val.y;
                            if (val.name == -1) dataSeries["data"][2] = val.y;
                        });
                    }
    
                    resultFinal.push(dataSeries);
                    self.getSentimentMulti(bodyReq, arr, resultFinal, (ind + 1), function(resLoop) {
                        cb(resLoop);
                    });
                });
            } else {
                resultFinal.push(dataSeries);
                self.getSentimentMulti(bodyReq, arr, resultFinal, (ind + 1), function(resLoop) {
                    cb(resLoop);
                });
            }
        } else {
            cb(resultFinal);
        }
    }

    static async getNlpMulti(bodyReq, arr, resultFinal, ind, cb) {
        var self = this;

        if (ind < arr.length) {
            var data = arr[ind];
            var dataSeries = {
                "name": "",
                "data": [0, 0, 0, 0, 0, 0]
            }

            var clause = "";
            if (typeof data === "string") {
                dataSeries["name"] = data;
                clause = data;
            }
            if (typeof data === "object" && "posterId" in data && data.posterId) {
                dataSeries["name"] = (data.details.length) ? data.details[0].name : "";
                clause = data.posterId;
            }
            if (typeof data === "object" && "chatId" in data && data.chatId) {
                if ("groupName" in data) {
                    dataSeries["name"] = data.groupName;
                } else {
                    dataSeries["name"] = (data.details.length) ? data.details[0].title : "";
                }
                clause = data.chatId;
            }
            
            if (clause) {
                if (typeof clause === "string" && "words" in bodyReq.params) {
                    bodyReq.params['word'] = clause;
                }
                if (typeof clause === "string" && "hashtags" in bodyReq.params) {
                    bodyReq.params['hashtag'] = clause;
                }
                if (typeof clause === "string" && "topics" in bodyReq.params) {
                    bodyReq.params['topic'] = clause;
                }
                if (typeof data === "object" && "posterId" in data && data.posterId) {
                    bodyReq.params['posterId'] = clause;
                }
                if (typeof data === "object" && "chatId" in data && data.chatId) {
                    bodyReq.params['chatId'] = clause;
                }

                self.getRadicalism(bodyReq, function(resultRadicalism) {
                    self.getHoax(bodyReq, function(resultHoax) {
                        self.getSarcasm(bodyReq, function(resultSarcasm) {
                            self.getPorn(bodyReq, function(resultPorn) {
                                self.getPropaganda(bodyReq, function(resultPropaganda) {
                                    self.getAdvertisement(bodyReq, function(resultAdvertisement) {
                                        resultRadicalism    = (resultRadicalism && resultRadicalism.length && resultRadicalism[0].Positive) ? resultRadicalism[0].Positive : 0;
                                        resultHoax          = (resultHoax && resultHoax.length && resultHoax[0].Positive) ? resultHoax[0].Positive : 0;
                                        resultSarcasm       = (resultSarcasm && resultSarcasm.length && resultSarcasm[0].Positive) ? resultSarcasm[0].Positive : 0;
                                        resultPorn          = (resultPorn && resultPorn.length && resultPorn[0].Positive) ? resultPorn[0].Positive : 0;
                                        resultPropaganda    = (resultPropaganda && resultPropaganda.length && resultPropaganda[0].Positive) ? resultPropaganda[0].Positive : 0;
                                        resultAdvertisement = (resultAdvertisement && resultAdvertisement.length && resultAdvertisement[0].Positive) ? resultAdvertisement[0].Positive : 0;
    
                                        dataSeries["data"] = [resultRadicalism, resultHoax, resultSarcasm, resultPorn, resultPropaganda, resultAdvertisement];
    
                                        resultFinal.push(dataSeries);
                                        self.getNlpMulti(bodyReq, arr, resultFinal, (ind + 1), function(resLoop) {
                                            cb(resLoop);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                resultFinal.push(dataSeries);
                self.getNlpMulti(bodyReq, arr, resultFinal, (ind + 1), function(resLoop) {
                    cb(resLoop);
                });
            }
        } else {
            cb(resultFinal);
        }
    }

    static async getRadicalism(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "radicalism": 1,
                "conversationId": 1,
                "chatId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "radicalism" : {"$first" : "$radicalism"},
            }
        });

        agg.push({
            "$group": {
                "_id" : null,  
                "Positive": {"$sum": {"$cond": [ {"$eq": [ "$radicalism", 1 ]} , 1, 0 ] } },
                "Negative": {"$sum": {"$cond": [ {"$eq": [ "$radicalism", 0 ]} , 1, 0 ] } },
            }
        });

        agg.push({
            "$project": {
                "_id" : 0
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
        
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result)
        });
    }

    static async getHoax(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date": "$conversationDtm",
                "hoax": "$hoax",
                "conversationId": 1,
                "chatId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "hoax" : {"$first" : "$hoax"},
            }
        });

        agg.push({
            "$group": {
                "_id" : null,  
                "Positive": {"$sum": {"$cond": [ {"$eq": [ "$hoax", 1 ]} , 1, 0 ] } },
                "Negative": {"$sum": {"$cond": [ {"$eq": [ "$hoax", 0 ]} , 1, 0 ] } },
            }
        });

        agg.push({
            "$project": {
                "_id" : 0
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getSarcasm(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "sarcasm": 1,
                "conversationId": 1,
                "chatId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "sarcasm" : {"$first" : "$sarcasm"},
            }
        });

        agg.push({
            "$group": {
                "_id" : null,  
                "Positive": {"$sum": {"$cond": [ {"$eq": [ "$sarcasm", 1 ]} , 1, 0 ] } },
                "Negative": {"$sum": {"$cond": [ {"$eq": [ "$sarcasm", 0 ]} , 1, 0 ] } },
            }
        });

        agg.push({
            "$project": {
                "_id" : 0
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getPorn(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "porn": 1,
                "conversationId": 1,
                "chatId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "porn" : {"$first" : "$porn"},
            }
        });

        agg.push({
            "$group": {
                "_id" : null,  
                "Positive": {"$sum": {"$cond": [ {"$eq": [ "$porn", 1 ]} , 1, 0 ] } },
                "Negative": {"$sum": {"$cond": [ {"$eq": [ "$porn", 0 ]} , 1, 0 ] } },
            }
        });

        agg.push({
            "$project": {
                "_id" : 0
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
    
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getPropaganda(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "propaganda": 1,
                "conversationId": 1,
                "chatId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "propaganda" : {"$first" : "$propaganda"},
            }
        });

        agg.push({
            "$group": {
                "_id" : null,  
                "Positive": {"$sum": {"$cond": [ {"$eq": [ "$propaganda", 1 ]} , 1, 0 ] } },
                "Negative": {"$sum": {"$cond": [ {"$eq": [ "$propaganda", 0 ]} , 1, 0 ] } },
            }
        });

        agg.push({
            "$project": {
                "_id" : 0
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getAdvertisement(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });

        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "advertisement": 1,
                "conversationId": 1,
                "chatId": 1,
                "senderUserId": 1,
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText" : "$contentText"},  
                "advertisement" : {"$first" : "$advertisement"},
            }
        });

        agg.push({
            "$group": {
                "_id" : null,  
                "Positive": {"$sum": {"$cond": [ {"$eq": [ "$advertisement", 1 ]} , 1, 0 ] } },
                "Negative": {"$sum": {"$cond": [ {"$eq": [ "$advertisement", 0 ]} , 1, 0 ] } },
            }
        });

        agg.push({
            "$project": {
                "_id" : 0
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getHashtagList(bodyReq, cb) {
        var agg = [];

        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);
    
        agg.push({
            "$unwind": {
                "path": "$hashtags",
            }
        });
    
        agg.push({
            "$match": {
                "conversationDtm" : { 
                    "$gte" : dateFrom, 
                    "$lte" : dateUntil
                },
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });
    
        if("search" in bodyReq.params){
            agg[1]["$match"]["hashtags"] = {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[1]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
    
        agg.push({
            "$sort": {
                "hashtags": 1,
            }
        });
    
        agg.push({
            "$group": {
                "_id": "$hashtags",
            }
        });
    
        if("offset" in bodyReq.params){
            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });
        }
    
        if("limit" in bodyReq.params){
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });
        }
    
        agg.push({
            "$group": {
                "_id": null,
                "hashtags": {"$addToSet": "$_id"}
            }
        });
    
        agg.push({
            "$project": {
                "_id": 0,
            }
        });
    
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }
    
    static async getTopicList(bodyReq, cb) {
        var agg = [];

        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);
    
        agg.push({
            "$unwind": {
                "path": "$topics",
            }
        });
    
        agg.push({
            "$match": {
                "conversationDtm" : { 
                    "$gte" : dateFrom, 
                    "$lte" : dateUntil
                },
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });
    
        if("search" in bodyReq.params){
            agg[1]["$match"]["topics"] = {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[1]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }
    
        agg.push({
            "$sort": {
                "topics": -1,
            }
        });
    
        agg.push({
            "$group": {
                "_id": "$topics",
            }
        });
    
        if("offset" in bodyReq.params){
            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });
        }
    
        if("limit" in bodyReq.params){
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });
        }
    
        agg.push({
            "$group": {
                "_id": null,
                "topics": {"$addToSet": "$_id"}
            }
        });
    
        agg.push({
            "$project": {
                "_id": 0,
            }
        });
    
        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getPosterList(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "type": {"$ne": "userTypeDeleted"}
            }
        });

        if ("search" in bodyReq.params && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"firstName" : {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')}},
                {"lastName" : {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')}},
                {"username" : {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')}},
                {"msisdn" : {$regex: new RegExp('.*' + bodyReq.params.search + '.*', 'i')}},
            ];
        }

        agg.push({
            "$sort": {
                "updateDtm": -1
            }
        });

        agg.push({
            "$group": {
                "_id" : "$id",  
                "accountId" : {"$first" : "$accountId"},
                "posterId" : {"$first" : "$id"},
                "profilePicture" : {"$first" : "$profilePhoto.big"},
                "phoneNumber" : {"$first" : "$msisdn"},
                "firstName" : {"$first" : "$firstName"},
                "lastName" : {"$first" : "$lastName"},
                "username" : {"$first" : "$username"},
                "dateUpdate" : {"$first" : "$updateDtm"},
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "accountId": 1,
                "posterId": 1,
                "profilePicture": {"$ifNull" : [ "$profilePicture", null ]},
                "phoneNumber" : 1, 
                "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$firstName", " ", "$lastName"]}, "" ]}}}, 
                "username" : 1,
                "dateUpdate": 1
            }
        });

        if ("offset" in bodyReq.params) {
            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });
        }

        if ("limit" in bodyReq.params) {
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });
        }
    
        mongo.getAggregateData(config.DB_COLL_CONTACT, agg, function(result) {
            cb(result);
        });
    }

    static async getPosterInfo(bodyReq, cb) {
        var agg = [];
        
        agg.push({
            "$match": {
                "id": {"$in": bodyReq.params.posterIds},
                "type": {"$ne": "userTypeDeleted"}
            }
        });

        agg.push({
            "$sort": {
                "updateDtm": -1
            }
        });

        agg.push({
            "$group": {
                "_id": "$id",
                "poster": {
                    "$push": {
                        "name": { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$firstName", " ", "$lastName"]}, "" ]}}}, 
                        "username": {"$ifNull": [ "$username", "" ]},
                        "phoneNumber": {"$ifNull": [ "$msisdn", "" ]},
                        "isVerified": "$isVerified",
                        "dateUpdate": "$updateDtm"
                    }
                } 
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "posterId": "$_id",
                "details": "$poster"
            }
        });
    
        mongo.getAggregateData(config.DB_COLL_CONTACT, agg, function(result) {
            if (result && result.length && bodyReq.params.posterIds.length > 1) {
                var sortedArray = [];
                bodyReq.params.posterIds.forEach(function(val, key) {
                    result.forEach(function(v, k) {
                        if (v.hasOwnProperty("posterId") && v.posterId == val) {
                            sortedArray.push(v);
                            return false;
                        }
                    });
                });

                cb(sortedArray);
            } else {
                cb(result);
            }
        });
    }

    static async getSummary(bodyReq, cb) {
        var self = this;
        self.getChatSummary(bodyReq, function(resultChat) {
            self.getTopPoster(bodyReq, function(resultPoster) {
                self.getGroupSummary(bodyReq, function(resultGroup) {
                    self.getChannelSummary(bodyReq, function(resultChannel) {
                        var content = {
                            "totalConversation" : (resultChat && resultChat.length) ? resultChat.length : 0,
                            "totalPoster"       : (resultPoster && resultPoster.length) ? resultPoster.length : 0,
                            "totalGroup"        : (resultGroup && resultGroup.length) ? resultGroup.length : 0,
                            "totalChannel"      : (resultChannel && resultChannel.length) ? resultChannel.length : 0,
                        }
                        cb(content);
                    });
                });
            });
        });
    }

    static async getChatSummary(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });
        
        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });
        
        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "date" : {"$first" : "$date"},  
                "accountId" : {"$first" : "$accountId"},
                "chatId" : {"$first" : "$chatId"},
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
            if (bodyReq.params.hasOwnProperty("chatId")) {
                agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
            }
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$')};
            if (bodyReq.params.hasOwnProperty("chatId")) {
                agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
            }
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
            if (bodyReq.params.hasOwnProperty("chatId")) {
                agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
            }
        }
        if (bodyReq.params.hasOwnProperty("posterId")){
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
            if (bodyReq.params.hasOwnProperty("chatId")) {
                agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
            }
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getGroupSummary(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });
        
        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
            }
        });

        agg.push({
            "$group": {
                "_id" : "$chatId",
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "totalConversation": {"$sum": 1}
            }
        });

        agg.push({ 
            "$sort" : { 
                "totalConversation": -1,
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
                "from" : "chats", 
                "let": {"chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$or": [{"$eq": ["$chatType", "superGroup"]}, {"$eq": ["$chatType", "basicGroup"]}]}]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                "as" : "chatsDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatsDetail",
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$chatsDetail.oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groupMembers", 
                "let": {"oppositeId": "$chatsDetail.oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$groupID", "$$oppositeId"]}, {"$eq": ["$status", "chatMemberStatusCreator"]}]}}}, {"$limit": 1}],
                "as" : "groupCreator"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupCreator",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "contacts", 
                "let": {"posterId": "$groupCreator.contactId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$id", "$$posterId"]}, {"$ne": ["$type", "userTypeDeleted"]}]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
            "$project" : { 
                "_id": 0,
                "groupName" : {"$ifNull" : [ "$chatsDetail.title", "" ]}, 
                "groupOwner" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                "groupDescription" : {"$ifNull" : [ "$groupDetail.description", "" ]}, 
                "totalMember" : "$groupDetail.memberCount", 
                "totalConversation" : 1,
                "chatId" : "$_id", 
                "accountId" : 1, 
                "oppositeId": "$chatsDetail.oppositeId",
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$groupDetail.photos.fileGenerated", 0]}, null ]},
                "lastMessage" : "$chatsDetail.lastMessage",
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")){
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getChannelSummary(bodyReq, cb) {
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
                "chatId": {"$lt": 0},
                "senderUserId": null,
                "contentType": {"$ne": "messageChatAddMembers"},
            }
        });
        
        agg.push({
            "$project": {
                "date":  "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "senderUserId": 1, 
                "contentText": 1
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},  
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                
            }
        });

        agg.push({
            "$group": {
                "_id" : "$chatId",
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "totalConversation": {"$sum": 1}
            }
        });

        agg.push({ 
            "$sort" : { 
                "totalConversation": -1,
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
                "from" : "chats", 
                "let": {"chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$eq": ["$chatType", "channel"]}]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                "as" : "chatsDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatsDetail",
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$chatsDetail.oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$project" : { 
                "_id": 0,
                "channelName" : {"$ifNull" : [ "$chatsDetail.title", "" ]}, 
                "channelOwner" : "", 
                "channelDescription" : {"$ifNull" : [ "$groupDetail.description", "" ]}, 
                "totalMember" : "$groupDetail.memberCount", 
                "totalConversation" : 1,
                "chatId" : "$_id", 
                "accountId" : 1, 
                "oppositeId": "$chatsDetail.oppositeId",
                "profilePicture" : {"$ifNull" : [ {"$arrayElemAt" : ["$groupDetail.photos.fileGenerated", 0]}, null ]},
                "lastMessage" : "$chatsDetail.lastMessage",
            }
        });

        if (bodyReq.params.hasOwnProperty("word")) {
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("hashtag")) {
            agg[0]["$match"]["hashtags"] = {$regex: new RegExp('^' + bodyReq.params.hashtag + '$')};
        }
        if (bodyReq.params.hasOwnProperty("topic")) {
            agg[0]["$match"]["topics"] = {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')};
        }
        if (bodyReq.params.hasOwnProperty("posterId")){
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

    static async getMemberRelationData(bodyReq, cb) {
        var agg = [];
        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);
        var limit = (bodyReq.params.limit.toLowerCase() != "all") ? parseInt(bodyReq.params.limit) : 0;

        agg.push({
            "$match": {
                "chatId": {"$in": bodyReq.params.chatIds},
            }
        });

        agg.push({ 
            "$group" : { 
                "_id" : "$chatId", 
                "chatId": {"$first": "$chatId"},
                "oppositeId": {"$first": "$oppositeId"},
                "title": {"$first": "$title"},
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groups", 
                "let": {"oppositeId": "$oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$limit": 1}],
                "as" : "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "groupMembers", 
                "let": {"oppositeId": "$oppositeId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$oppositeId"]}}}, {"$group": {"_id": {"contactId": "$contactId", "groupID": "$groupID"}, "contactId": {"$first": "$contactId"}}}],
                "as" : "groupMember"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupMember",
            }
        });

        agg.push({ 
            "$lookup" : { 
                "from" : "contacts", 
                "let": {"posterId": "$groupMember.contactId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$id", "$$posterId"]}, {"$ne": ["$type", "userTypeDeleted"]}]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
                "as" : "contactDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$contactDetail",
            }
        });

        agg.push({
            "$lookup": {
                "from": "conversations",
                "let": {"member": "$groupMember.contactId", "chatId": "$chatId"},
                "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$senderUserId", "$$member"]}, {"$eq": ["$chatId", "$$chatId"]}, {"$gte": ["$conversationDtm", dateFrom]}, {"$lte": ["$conversationDtm", dateUntil]}]}}}, {"$group": {"_id" : {"senderUserId" : "$senderUserId", "chatId" : "$chatId", "conversationDtm" : "$conversationDtm", "contentText": "$contentText"}}}],
                "as": "totalConversation"
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "groupName": "$title",
                "groupProfilePicture": {"$ifNull" : [ {"$arrayElemAt" : ["$groupDetail.photos.fileGenerated", 0]}, null ]},
                "memberId": {"$ifNull": ["$groupMember.contactId", ""]},
                "memberName": {"$ifNull": [{"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, ""]},
                "memberUsername": {"$ifNull": ["$contactDetail.username", ""]},
                "memberPhoneNumber": {"$ifNull": ["$contactDetail.msisdn", ""]},
                "memberProfilePicture": {"$ifNull": ["$contactDetail.profilePhoto.big", null]},
                "chatId": 1,
                "oppositeId": 1,
                "totalConversation": {"$cond": { "if": { "$isArray": "$totalConversation" }, "then": { "$size": "$totalConversation" }, "else": 0}},
            }
        });

        if (bodyReq.params.type.toLowerCase() == "related") {
            agg.push({
                "$group": {
                    "_id": "$memberId",
                    "count": {"$sum": 1},
                    "groupDetail": {
                        "$push": {
                            "groupName": "$groupName",
                            "groupProfilePicture": "$groupProfilePicture",
                            "memberId": "$memberId",
                            "memberName": "$memberName",
                            "memberUsername": "$memberUsername",
                            "memberPhoneNumber": "$memberPhoneNumber",
                            "memberProfilePicture": "$memberProfilePicture",
                            "chatId": "$chatId",
                            "oppositeId": "$oppositeId",
                            "totalConversation": "$totalConversation",
                        }
                    }
                }
            });

            agg.push({
                "$match": {
                    "count": {"$gt": 1}
                }
            });

            agg.push({
                "$unwind": {
                    "path": "$groupDetail"
                }
            });

            agg.push({
                "$project": {
                    "_id": 0,
                    "groupName": "$groupDetail.groupName",
                    "groupProfilePicture": "$groupDetail.groupProfilePicture",
                    "memberId": "$groupDetail.memberId",
                    "memberName": "$groupDetail.memberName",
                    "memberUsername": "$groupDetail.memberUsername",
                    "memberPhoneNumber": "$groupDetail.memberPhoneNumber",
                    "memberProfilePicture": "$groupDetail.memberProfilePicture",
                    "chatId": "$groupDetail.chatId",
                    "oppositeId": "$groupDetail.oppositeId",
                    "totalConversation": "$groupDetail.totalConversation",
                }
            });
        }

        agg.push({
            "$sort": { "totalConversation": -1 }
        });

        if (limit && bodyReq.params.type.toLowerCase() == "related") {
            limit = limit*2;
        }
        
        if (limit && bodyReq.params.limit.toLowerCase() != "all") {
            agg.push({
                "$limit": limit
            });
        }

        mongo.getAggregateData(config.DB_COLL_CHAT, agg, function(result) {
            cb(result);
        }); 
    }

    static async getPosterOntologyData(bodyReq, cb) {
        var agg = [];
        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);
        
        agg.push({ 
            "$match" : { 
                "contactId" : { 
                    "$in" : bodyReq.params.posterIds
                }
            }
        });

        agg.push({ 
            "$group" : { 
                "_id" : { 
                    "groupID" : "$groupID", 
                    "posterId" : "$contactId"
                }
            }
        });

        agg.push({
            "$lookup": {
                "from": "groups",
                "let": {"groupID": "$_id.groupID"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$groupID", "$$groupID"]}}}, {"$group": {"_id": "$groupID", "groupDescription": {"$first": "$description"}, "totalMember": {"$first": "$memberCount"}, "profilePicture": {"$first": {"$arrayElemAt" : ["$photos.fileGenerated", 2]}}}}],
                "as": "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({
            "$lookup": {
                "from": "chats",
                "let": {"groupID": "$_id.groupID"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$oppositeId", "$$groupID"]}}}, {"$group": {"_id": "$oppositeId", "groupName": {"$first": "$title"}, "chatId": {"$first": "$chatId"}}}],
                "as": "chatDetail"
            }
        });
        
        agg.push({
            "$unwind": {
                "path": "$chatDetail",
                "preserveNullAndEmptyArrays": true
            }
        });

        agg.push({
            "$lookup": {
                "from": "contacts",
                "let": {"contactId": "$_id.posterId"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$contactId"]}}}, {"$sort": {"updateDtm": -1}}, {"$group": {"_id": "$id", "phoneNumber": {"$first": "$msisdn"}, "profilepicture": {"$first": {"$ifNull" : [ "$profilePhoto.big", null ]}}, "name": {"$first": {"$ifNull" : [ {"$concat" : ["$firstName", " ", "$lastName"]}, "" ]}}, "username": {"$first": {"$ifNull" : [ "$username", "" ]}}}}],
                "as": "contactDetail"
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
                "from": "conversations",
                "let": {"posterId": "$_id.posterId", "chatId": "$chatDetail.chatId"},
                "pipeline": [{"$match": {"$expr": {"$and": [{"$eq": ["$senderUserId", "$$posterId"]}, {"$eq": ["$chatId", "$$chatId"]}, {"$gte": ["$conversationDtm", dateFrom]}, {"$lte": ["$conversationDtm", dateUntil]}]}}}, {"$group": {"_id": "$conversationId"}}],
                "as": "totalConversation"
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "posterId": "$_id.posterId",
                "posterName": { "$trim": { "input": "$contactDetail.name"}},
                "posterPhoneNumber": "$contactDetail.phoneNumber",
                "posterProfilepicture": "$contactDetail.profilepicture",
                "posterUsername": "$contactDetail.username",
                "posterTotalConversation": {"$cond": { "if": { "$isArray": "$totalConversation" }, "then": { "$size": "$totalConversation" }, "else": 0}},
                "oppositeId": "$_id.groupID",
                "chatId": "$chatDetail.chatId",
                "groupName": "$chatDetail.groupName",
                "groupDescription": "$groupDetail.groupDescription",
                "groupMember": "$groupDetail.totalMember",
                "groupProfilePicture": "$groupDetail.profilePicture",
            }
        });

        if("limit" in bodyReq.params && bodyReq.params.limit != ""){
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });
        }

        if(bodyReq.params.hasOwnProperty("chatIds")){
            agg.push({ 
                "$match": { 
                    "chatId": {"$in": bodyReq.params.chatIds}
                }
            });
        }
        
        mongo.getAggregateData(config.DB_COLL_GROUP_MEMBER, agg, function(result) {
            cb(result);
        });
    }
}

module.exports = GeneralModel;
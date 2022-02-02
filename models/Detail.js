const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');

class DetailModel {
    
    static async getTopicDetail(bodyReq, cb) {
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
                "topics": {$regex: new RegExp('^' + bodyReq.params.topic + '$', 'i')},
            }
        });

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
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
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);

            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });

            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });

            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });

            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getWordDetail(bodyReq, cb) {
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
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
            }
        });

        agg.push({
            "$count": "count"
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

        if(bodyReq.params.type == 1){
            agg[0]["$match"]["oneGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }else if(bodyReq.params.type == 2){
            agg[0]["$match"]["biGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }else if(bodyReq.params.type == 3){
            agg[0]["$match"]["triGram"] = {$regex: new RegExp('^' + bodyReq.params.word + '$', 'i')};
        }

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        if (bodyReq.params.hasOwnProperty("filter") && Object.keys(bodyReq.params.filter).length > 0) {
            if (bodyReq.params.filter.hasOwnProperty("sentiment")) {
                agg[0]["$match"]["sentiment"] = bodyReq.params.filter.sentiment;
            }
            if (bodyReq.params.filter.hasOwnProperty("nlp") && bodyReq.params.filter.nlp.length) {
                var stackMatchNlp = [];
                bodyReq.params.filter.nlp.forEach(function(val, key) {
                    val = val.toLowerCase();
                    matchNlp = {};
                    matchNlp[val] = 1;
                    matchNlp.push(matchNlp);
                });
                agg[0]["$match"]["$or"] = stackMatchNlp;
            }
            if (bodyReq.params.filter.hasOwnProperty("message") && bodyReq.params.filter.message) {
                agg[0]["$match"]["$or"] = [
                    {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.filter.message.toLowerCase() + '.*', 'i')}},
                ]
            }
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });

            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });

            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });

            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getHashtagDetail(bodyReq, cb) {
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
                "hashtags": bodyReq.params.hashtag,
            }
        });

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
            }
        });

        agg.push({
            "$count": "count"
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

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });
    
            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });
    
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });
        
            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getUrlDetail(bodyReq, cb) {
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
                "urls": {"$in": [bodyReq.params.url]},
            }
        });

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
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

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });

            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });

            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });

            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getSentimentDetail(bodyReq, cb) {
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
                "sentiment": parseInt(bodyReq.params.sentiment)
            }
        });

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
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

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });
    
            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });
    
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}]}}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });

            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getNlpDetail(bodyReq, cb) {
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

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });
    
        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
            }
        });

        agg.push({
            "$count": "count"
        });

        if(bodyReq.params.category.toLowerCase() == "radicalism"){
            agg[0]["$match"]["radicalism"] = {"$eq" : 1};
        }else if(bodyReq.params.category.toLowerCase() == "hoax"){
            agg[0]["$match"]["hoax"] = {"$eq" : 1};
        }else if(bodyReq.params.category.toLowerCase() == "sarcasm"){
            agg[0]["$match"]["sarcasm"] = {"$eq" : 1};
        }else if(bodyReq.params.category.toLowerCase() == "porn"){
            agg[0]["$match"]["porn"] = {"$eq" : 1};
        }else if(bodyReq.params.category.toLowerCase() == "propaganda"){
            agg[0]["$match"]["propaganda"] = {"$eq" : 1};
        }else if(bodyReq.params.category.toLowerCase() == "advertisement"){
            agg[0]["$match"]["advertisement"] = {"$eq" : 1};
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
        if (bodyReq.params.hasOwnProperty("chatId")) {
            agg[0]["$match"]["chatId"] = bodyReq.params.chatId;
        }
        if (bodyReq.params.hasOwnProperty("posterId")) {
            agg[0]["$match"]["senderUserId"] = bodyReq.params.posterId;
        }
        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });

            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });

            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });
        
            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getTimelineDetail(bodyReq, cb) {
        var agg = [];

        var dateFrom = new Date(bodyReq.params.date);
        var dateUntil = new Date(bodyReq.params.date).getTime() + 1000 * 60 * 60 * 23;
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

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentText" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
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

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort": {
                    "dateConversation": -1
                }
            });
    
            agg.push({
                "$skip": parseInt(bodyReq.params.offset)
            });
    
            agg.push({
                "$limit": parseInt(bodyReq.params.limit)
            });
    
            agg.push({ 
                "$lookup" : { 
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
                    "as" : "chatsDetail"
                }
            });
        
            agg.push({
                "$unwind": {
                    "path": "$chatsDetail",
                }
            });

            agg.push({
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId"
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

    static async getConversationDetail(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "_id" : {"$in": bodyReq.params.conversationIds},
            }
        });

        if (bodyReq.params.hasOwnProperty("search") && bodyReq.params.search) {
            agg[0]["$match"]["$or"] = [
                {"contentType" : {$regex: new RegExp('.*' + bodyReq.params.search.toLowerCase() + '.*', 'i')}},
            ]
        }

        agg.push({
            "$project": {
                "dateConversation": "$conversationDtm",
                "conversationId": 1,
                "chatId": 1,
                "accountId": 1,
                "poster": "$senderUserId",
                "contentText": 1,
                "contentType": 1,
                "mediaKey": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": {"$arrayElemAt":["$contentValue.fileGenerated",0]}},
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "$contentValue.fileGenerated" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.fileGenerated"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": "$contentValue"},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": "$contentValue"},
                        ],
                        "default": null
                    }
                },
                "mimetype": {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$contentType", "messagePhoto" ] }, "then": "image/jpeg" },
                            { "case": { "$eq": [ "$contentType", "messageVideo" ] }, "then": "$contentValue.mimeType" },
                            { "case": { "$eq": [ "$contentType", "messageSticker" ] }, "then": "image/webp" },
                            { "case": { "$eq": [ "$contentType", "messageLocation" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messageDocument" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAudio" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageVoiceNote" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageAnimation" ] }, "then": "$contentValue.mimeType"},
                            { "case": { "$eq": [ "$contentType", "messageContact" ] }, "then": null},
                            { "case": { "$eq": [ "$contentType", "messagePoll" ] }, "then": null},
                        ],
                        "default": null
                    }
                },
                "filename": {"$ifNull": ["$contentValue.fileName", null]},
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "sentiment": 1,
            }
        });
    
        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$dateConversation", "contentText": "$contentText"},  
                "dateConversation":  {"$first" : "$dateConversation"},
                "conversationId": {"$first" : "$conversationId"},
                "chatId": {"$first" : "$chatId"},
                "accountId": {"$first" : "$accountId"},
                "contentText": {"$first" : "$contentText"},
                "contentType": {"$first" : "$contentType"},
                "poster": {"$first" : "$poster"},
                "mediaKey": {"$first" : "$mediaKey"},
                "mimetype": {"$first" : "$mimetype"},
                "filename": {"$first": "$filename"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "sentiment": {"$first": "$sentiment"},
            }
        });

        agg.push({
            "$count": "count"
        });

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(resultCount) {
            agg.splice(-1,1);
            
            agg.push({
                "$sort" : { 
                    "date" : -1
                }
            });

            agg.push({
                "$skip" : parseInt(bodyReq.params.offset)
            });

            agg.push({
                "$limit" : parseInt(bodyReq.params.limit)
            });

            agg.push({ 
                "$lookup" : { 
                    "from" : "chats", 
                    "let": {"chatId": "$chatId"},
                    "pipeline": [{"$match": {"$expr": {"$and" : [{"$eq": ["$chatId", "$$chatId"]}, {"$or": [{"$eq": ["$chatType", "superGroup"]}, {"$eq": ["$chatType", "basicGroup"]}, {"$eq": ["$chatType", "channel"]}]}]}}}, {"$sort": {"createDtm": -1}}, {"$limit": 1}],
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
                    "from" : "contacts", 
                    "let": {"posterId": "$poster"},
                    "pipeline": [{"$match": {"$expr": {"$eq": ["$id", "$$posterId"]}}}, {"$sort": {"updateDtm": -1}}, {"$limit": 1}],
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
                "$project": {
                    "_id": 0,
                    "dateConversation": 1,
                    "conversationId": 1,
                    "chatId": 1,
                    "accountId": 1,
                    "posterId": "$poster",
                    "contentText": 1,
                    "contentType": 1,
                    "mediaKey": 1,
                    "mimetype": 1,
                    "filename": 1,
                    "radicalism": 1,
                    "hoax": 1,
                    "sarcasm": 1,
                    "porn": 1,
                    "propaganda": 1,
                    "advertisement": 1,
                    "sentiment": 1,
                    "profilePicture": {"$ifNull" : [ "$contactDetail.profilePhoto.big", null ]},
                    "name" : { "$trim": { "input": {"$ifNull" : [ {"$concat" : ["$contactDetail.firstName", " ", "$contactDetail.lastName"]}, "" ]}}}, 
                    "phoneNumber" : {"$ifNull" : [ "$contactDetail.msisdn", "" ]}, 
                    "username" : {"$ifNull" : [ "$contactDetail.username", "" ]},
                    "groupType": "$chatsDetail.chatType",
                    "groupName": "$chatsDetail.title",
                    "oppositeId": "$chatsDetail.oppositeId",
                }
            });

            mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
                resultCount = (resultCount && resultCount.length && resultCount[0]) ? resultCount[0].count : 0;
                cb(resultCount, result);
            });
        });
    }

}

module.exports = DetailModel;
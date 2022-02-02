const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');
const model         = require(BASE_DIR + '/models/General');

class DashboardModel {
    
    static async getSummaryAll(bodyReq, cb) {
        model.getSummaryAccountList(bodyReq, function(resultAccount) {
            model.getSummaryAccountList({ "params": { "dateFrom": "", "dateUntil": "" } }, function(resultAccountActive) {
                model.getSummaryPosterList(bodyReq, function(resultPoster) {
                    model.getSummaryGroupList(bodyReq, function(resultGroup) {
                        model.getSummaryChannelList(bodyReq, function(resultChannel) {
                            var content = {
                                "totalAccount"       : (resultAccount && resultAccount.length && resultAccount[0]) ? resultAccount[0].count : 0,
                                "totalAccountActive" : (resultAccountActive && resultAccountActive.length && resultAccountActive[0]) ? resultAccountActive[0].count : 0,
                                "totalPoster"        : (resultPoster && resultPoster.length && resultPoster[0]) ? resultPoster[0].count : 0,
                                "totalGroup"         : (resultGroup && resultGroup.length && resultGroup[0]) ? resultGroup[0].count : 0,
                                "totalChannel"       : (resultChannel && resultChannel.length && resultChannel[0]) ? resultChannel[0].count : 0,
                            }
                            cb(content);
                        });
                    });
                });
            });
        });
    }

    static async getSummaryActive(bodyReq, cb) {
        model.getSummaryAccountList({ "params": { "dateFrom": "", "dateUntil": "" } }, function(resultAccount) {
            model.getSummaryPosterActiveList(bodyReq, function(resultPoster) {
                model.getSummaryGroupActiveList(bodyReq, function(resultGroup) {
                    model.getSummaryChannelActiveList(bodyReq, function(resultChannel) {
                        var content = {
                            "totalAccountActive" : (resultAccount && resultAccount.length && resultAccount[0]) ? resultAccount[0].count : 0,
                            "totalPosterActive"  : (resultPoster && resultPoster.length && resultPoster[0]) ? resultPoster[0].count : 0,
                            "totalGroupActive"   : (resultGroup && resultGroup.length && resultGroup[0]) ? resultGroup[0].count : 0,
                            "totalChannelActive" : (resultChannel && resultChannel.length && resultChannel[0]) ? resultChannel[0].count : 0,
                        }
                        cb(content);
                    });
                });
            });
        });
    }

    static async getTopChat(bodyReq, cb) {
        var agg = [];
    
        var dateFrom = new Date(bodyReq.params.dateFrom);
        var dateUntil = new Date(bodyReq.params.dateUntil).getTime() + 1000 * 60 * 60 * 23;
        dateUntil += 1000 * 60 * 59;
        dateUntil += 1000 * 59;
        dateUntil += 999;
        dateUntil = new Date(dateUntil);
        var limit = parseInt(bodyReq.params.limit);
        var offset = parseInt(bodyReq.params.offset);

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
                "date" : "$conversationDtm", 
                "accountId": 1,
                "conversationId" : 1, 
                "chatId" : 1, 
                "sentiment": 1,
                "poster" : "$senderUserId",
                "contentText": {"$ifNull": ["$contentText", ""]},
                "contentType" : 1, 
                "contentValue" : 1, 
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
            }
        });

        agg.push({
            "$group": {
                "_id" : {"senderUserId" : "$poster", "chatId" : "$chatId", "conversationDtm" : "$date", "contentText": "$contentText"},
                "sentiment": {"$first": "$sentiment"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "contentText": {"$first": "$contentText"},
                "contentType" : {"$first": "$contentType"}, 
                "contentValue" : {"$first": "$contentValue"}, 
                "conversationId": {"$first": "$_id"},
                "chatId": {"$first": "$chatId"},
                "accountId": {"$first": "$accountId"},
            }
        });

        agg.push({
            "$group": {
                "_id" : {"contentText": "$contentText", "contentType": "$contentType", "contentValue": "$contentValue"},
                "count": {"$sum": 1},
                "sentiment": {"$first": "$sentiment"},
                "radicalism": {"$first": "$radicalism"},
                "hoax": {"$first": "$hoax"},
                "sarcasm": {"$first": "$sarcasm"},
                "porn": {"$first": "$porn"},
                "propaganda": {"$first": "$propaganda"},
                "advertisement": {"$first": "$advertisement"},
                "conversationIds": {"$push": "$conversationId"},
                "chatId": {"$first": "$chatId"},
            }
        });

        agg.push({
            "$match": {
                "_id" : {"$ne": ""}
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "contentText": "$_id.contentText",
                "contentType" : "$_id.contentType", 
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
                "count": 1,
                "sentiment": 1,
                "radicalism": 1,
                "hoax": 1,
                "sarcasm": 1,
                "porn": 1,
                "propaganda": 1,
                "advertisement": 1,
                "conversationIds": 1,
            }
        });

        agg.push({
            "$sort": {
                "count": -1
            }
        });

        agg.push({
            "$skip": offset
        });

        agg.push({
            "$limit": limit
        });

        if (bodyReq.params.hasOwnProperty("chatIds")) {
            agg[0]["$match"]["chatId"] = {"$in": bodyReq.params.chatIds};
        }

        mongo.getAggregateData(config.DB_COLL_CONVERSATION, agg, function(result) {
            cb(result);
        });
    }

}

module.exports = DashboardModel;
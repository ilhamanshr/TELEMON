const randomstring  = require("randomstring");
const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');

class ManagementGroupCategoryModel {
    
    static async getGroupCategoryList(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "$or": [{
                    "status": 1
                }, {
                    "status": 0
                }]
            }
        });

        agg.push({
            "$sort": {
                "dateCreate": -1
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "categoryId": "$_id",
                "categoryName": "$categoryName",
                "categoryDescription": {"$ifNull": ["$categoryDescription", ""]},
                "dateCreate": "$dateCreate",
                "dateUpdate": "$dateUpdate",
                "status": "$status",
                "chatIds": "$chatIds"
            }
        });
        
        mongo.getAggregateData(config.DB_COLL_GROUP_CATEGORY, agg, function(result) {
            cb(result);
        });
    }
    
    static async insertGroupCategory(bodyReq, cb) {
        var dateNow = new Date().getTime() + 1000 * 60 * 60 * 7;
        dateNow = new Date(dateNow);

        var doc = {
            "_id": randomstring.generate(),
            "categoryName": bodyReq.params.categoryName,
            "categoryDescription": bodyReq.params.categoryDescription,
            "status": 1,
            "userCreate": bodyReq.username,
            "userUpdate": bodyReq.username,
            "dateCreate": dateNow,
            "dateUpdate": dateNow,
            "chatIds": bodyReq.params.chatIds
        }

        mongo.insertData(config.DB_COLL_GROUP_CATEGORY, doc, function(result) {
            cb(result);
        });
    }

    static async changeStatus(bodyReq, cb) {
        var status = -1;
        if (parseInt(bodyReq.params.status) == 1) status = 1;
        if (parseInt(bodyReq.params.status) == 0) status = 0;

        var clause = { "_id": bodyReq.params.categoryId }
        var doc = { "status": status }

        mongo.updateData(config.DB_COLL_GROUP_CATEGORY, clause, doc, function(result) {
            cb(result);
        });
    }

    static async getInfo(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "_id": bodyReq.params.categoryId
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatIds"
            }
        });

        agg.push({
            "$lookup": {
                "from": "chats",
                "let": {"chatId": "$chatIds"},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$chatId", "$$chatId"]}}}, {"$limit": 1}],
                "as": "chatDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$chatDetail"
            }
        });

        agg.push({
            "$lookup": {
                "from": "groups",
                "let": {"oppositeId": "$chatDetail.oppositeId"},
                "pipeline": [{"$match":{"$expr":{"$eq":["$groupID","$$oppositeId"]}}}, {"$limit": 1}],
                "as": "groupDetail"
            }
        });

        agg.push({
            "$unwind": {
                "path": "$groupDetail"
            }
        });

        agg.push({
            "$group": {
                "_id": "$_id",
                "categoryName" : {"$first": "$categoryName"}, 
                "categoryDescription" : {"$first": "$categoryDescription"},
                "status" :  {"$first": "$status"}, 
                "userCreate" :  {"$first": "$userCreate"}, 
                "userUpdate" :  {"$first": "$userUpdate"}, 
                "dateCreate" :  {"$first": "$dateCreate"}, 
                "dateUpdate" :  {"$first": "$dateUpdate"},
                "groups": {"$push": {
                    "chatId": "$chatIds",
                    "groupName": "$chatDetail.title",
                    "groupDescription": "$groupDetail.description",
                    "groupId": "$groupDetail.groupID",
                    "totalMember": "$groupDetail.memberCount",
                    "photos": "$groupDetail.photos"
                }} 
            }
        });

        agg.push({
            "$project": {
                "_id": 0,
                "categoryId": "$_id",
                "categoryName": "$categoryName",
                "categoryDescription": {"$ifNull": ["$categoryDescription", ""]},
                "status": "$status",
                "userCreate": "$userCreate",
                "userUpdate": "$userUpdate",
                "dateUpdate": "$dateUpdate",
                "groups": "$groups"
            }
        });
        
        mongo.getAggregateData(config.DB_COLL_GROUP_CATEGORY, agg, function(result) {
            cb(result);
        });
    }

    static async updateGroupCategory(bodyReq, cb) {
        var clause = { "_id": bodyReq.params.categoryId }

        var doc = {};
        doc["categoryName"] = (bodyReq.params.hasOwnProperty("categoryName") && bodyReq.params.categoryName) ? bodyReq.params.categoryName : "";
        doc["categoryDescription"] = (bodyReq.params.hasOwnProperty("categoryDescription") && bodyReq.params.categoryDescription) ? bodyReq.params.categoryDescription : "";
        doc["chatIds"] = (bodyReq.params.hasOwnProperty("chatIds") && bodyReq.params.chatIds) ? bodyReq.params.chatIds : [];
        
        mongo.updateData(config.DB_COLL_GROUP_CATEGORY, clause, doc, function(result) {
            cb(result);
        });
    }

}

module.exports = ManagementGroupCategoryModel;
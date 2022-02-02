const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');
const GeneralModel  = require(BASE_DIR + '/models/General');

class CompareModel {

    static async getTopWord(bodyReq, cb) {
        GeneralModel.getTopWord(bodyReq, function(result) {
            cb(result);
        });
    }

    static async getTopHashtag(bodyReq, cb) {
        GeneralModel.getTopHashtag(bodyReq, function(result) {
            cb(result);
        });
    }

    static async getTopTopic(bodyReq, cb) {
        GeneralModel.getTopTopic(bodyReq, function(result) {
            cb(result);
        });
    }

    static async getTopUrl(bodyReq, cb) {
        GeneralModel.getTopUrl(bodyReq, function(result) {
            cb(result);
        });
    }

    static async getTopPoster(bodyReq, cb) {
        GeneralModel.getTopPoster(bodyReq, function(result) {
            cb(result);
        });
    }

    static async getTopGroup(bodyReq, cb) {
        this.getGroupSummary(bodyReq, function(result) {
            cb(result);
        });
    }

    static async getTopChannel(bodyReq, cb) {
        this.getChannelSummary(bodyReq, function(result) {
            cb(result);
        });
    }
}

module.exports = CompareModel;
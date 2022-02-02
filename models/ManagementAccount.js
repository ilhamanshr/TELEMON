const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');
const GeneralModel  = require(BASE_DIR + '/models/General');

class ManagementAccountModel {
    
    static async getAccountList(bodyReq, cb) {
        GeneralModel.getSummaryAccountList(bodyReq, function(result) {
            cb(result);
        });
    }

    static async changeStatus(bodyReq, cb) {
        var status = -1;

        var clause = { "_id": bodyReq.params.accountId }
        var doc = { "status": status }

        mongo.updateData(config.DB_COLL_ACCOUNT, clause, doc, function(result) {
            cb(result);
        });
    }

}

module.exports = ManagementAccountModel;
const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config 	    = require(BASE_DIR + '/Config');
const mongo 	    = require(BASE_DIR + '/libraries/MongoDriver');

class AnalyzerPosterModel {
    
    static async getTotalGroupByPoster(bodyReq, cb) {
        var agg = [];

        agg.push({
            "$match": {
                "contactId" : bodyReq.params.posterId
            }
        });

        agg.push({
            "$group": {
                "_id" : "$groupID",  
            }
        });

        mongo.getAggregateData(config.DB_COLL_GROUP_MEMBER, agg, function(result) {
            if (result && result.length > 0) {
                cb(result);
            } else {
                cb([]);
            }
        });
    }

}

module.exports = AnalyzerPosterModel;
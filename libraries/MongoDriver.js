const path          = require('path');
const BASE_DIR      = path.dirname(require.main.filename);
const config        = require(BASE_DIR + '/Config');
const logger        = require(BASE_DIR + '/Logger');
const mongodb       = require('mongodb').MongoClient;

exports.createConnection = function (cb) {
    mongodb.connect(config.DB_CONN, {
        useNewUrlParser     : true,
        useUnifiedTopology  : true
    }, function (err, client) {
        if (err) {
            logger.error(__filename, err);
            cb(null);
        } else {
            logger.debug(__filename, "Connected to database server "+ config.DB_CONN +"/"+ config.DB_NAME, "", "", "");
            cb(client.db(config.DB_NAME));
        }
    });   
};

exports.getCollections = function (cb) {
    (global.DBConnection).listCollections().toArray(function(err, collInfos) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(collInfos);
        }
    });
};

exports.createIndexProject = function (collectionName, indexBuild, cb) {
    (global.DBConnection).collection(collectionName).createIndex(indexBuild, function(err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.createProjectCollection = function (collName, cb) {
    (global.DBConnection).createCollection(collName, function(errCreate, resCreate) {
        if (errCreate) {
            logger.error(__filename, errCreate);
            cb(false);
        } else {
            cb(true);
        }
    });
};

exports.insertData = function (collectionName, docs, cb) {
    (global.DBConnection).collection(collectionName).insertOne(docs, function (errInsert, resultInsert) {
        if (errInsert) {
            logger.error(__filename, errInsert);
            cb(false);
        } else {
            cb(true);
        }
    });
};

exports.updateData = function (collectionName, clause, docs, cb) {
    (global.DBConnection).collection(collectionName).updateOne(clause, {'$set': docs}, function (errUpdate, resultUpdate) {
        if (errUpdate) {
            logger.error(errUpdate);
            cb(false);
        } else {
            logger.debug(__filename, `Successfully update data`, "", "", resultUpdate.result.nModified);
            cb(true);
        }
    });
};

exports.updateManyData = function (collectionName, clause, docs, cb) {
    (global.DBConnection).collection(collectionName).updateMany(clause, {'$set': docs}, function (errUpdate, resultUpdate) {
        if (errUpdate) {
            logger.error(errUpdate);
            cb(false);
        } else {
            logger.debug(__filename, `Successfully update many data`, "", "", resultUpdate);
            if (resultUpdate.result.nModified > 0) {
                cb(true);
            } else {
                cb(false);
            }
        }
    });
};

exports.replaceData = function (collectionName, clause, docs, cb) { 
    (global.DBConnection).collection(collectionName).updateOne(clause, {'$set': docs}, {upsert: true}, function (errUpdate, resultUpdate) {
        if (errUpdate) {
            logger.error(errUpdate);
            cb(false);
        } else {
            cb(true);
        }
    });   
};

exports.getDataCount = function (collectionName, filter, cb) {
    (global.DBConnection).collection(collectionName).find(filter).count(function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(null);
        } else {
            cb(result);
        }
    });
};

exports.collDataCounter = function (collectionName, filter, cb) {
    (global.DBConnection).collection(collectionName).countDocuments(filter, function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.searchDataBy = function (collectionName, filter, cb) {
    (global.DBConnection).collection(collectionName).find(filter).toArray(function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.searchDataByOffsetLimit = function (collectionName, filter, offset, limit, cb) {
	(global.DBConnection).collection(collectionName).find(filter).limit(limit).skip(offset).toArray(function (err, result) {
	    if (err) {
	        logger.error(__filename, err);
	        cb(false);
	    } else {
	        cb(result);
        }
	});
};

exports.searchDataByOffsetLimitSort = function (collectionName, filter, sort, offset, limit, cb) {
	if(limit > 0){
	    (global.DBConnection).collection(collectionName).find(filter).limit(limit).skip(offset).sort(sort).toArray(function (err, result) {
	        if (err) {
	            logger.error(__filename, err);
	            cb(false);
	        } else {
	            cb(result);
	        }
	    });
	}else{
		exports.searchDataBySort(collectionName, filter, sort, function(result){
			cb(result);
		});
	}
};


exports.searchDataBySort = function (collectionName, filter, sort, cb) {
    (global.DBConnection).collection(collectionName).find(filter).sort(sort).toArray(function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.getAggregateData = function (collectionName, aggData, cb) {
    var opt = {
        "cursor": {},
        "allowDiskUse": true,
        "explain": false
    };

    (global.DBConnection).collection(collectionName).aggregate(aggData, opt).toArray( function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.removeData = function (collectionName, clause, cb) {
    (global.DBConnection).collection(collectionName).deleteMany(clause, function (errRemove, resultRemove) {
        if (errRemove) {
            logger.error(__filename, errRemove);
            cb(false);
        } else {
            logger.debug(__filename, `Successfully remove data`, "", "", resultRemove.result.nModified);
            cb(true);
        }
    });
};

exports.searchDataByProject = function (collectionName, filter, project, cb) {
    (global.DBConnection).collection(collectionName).find(filter).project(project).toArray(function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.searchDataByProjectLimit = function (collectionName, filter, project, limit, cb) {
    (global.DBConnection).collection(collectionName).find(filter).project(project).limit(limit).toArray(function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};

exports.searchDataByProjectLimitSort = function (collectionName, filter, project, limit, sort, cb) {
    (global.DBConnection).collection(collectionName).find(filter).project(project).limit(limit).sort(sort).toArray(function (err, result) {
        if (err) {
            logger.error(__filename, err);
            cb(false);
        } else {
            cb(result);
        }
    });
};
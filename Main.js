require('dotenv').config();

const path                          = require('path');
const BASE_DIR                      = path.dirname(require.main.filename);
const logger                        = require(BASE_DIR + '/Logger');
const mongo                         = require(BASE_DIR + '/libraries/MongoDriver');
const server                        = require(BASE_DIR + '/Server');
const daemonNLPAsync                = require(BASE_DIR + '/services/DaemonNLPAsync'); 
const daemonNLPTopic                = require(BASE_DIR + '/services/DaemonNLPTopic'); 
const daemonConversation            = require(BASE_DIR + '/services/DaemonConversationDetail');
const daemonMentionConversation     = require(BASE_DIR + '/services/DaemonMentionConversation');
const daemonRefreshChatId           = require(BASE_DIR + '/services/DaemonRefreshChatId');

if (process.env.ENVIRONMENT === "PRODUCTION") {
    process.on('uncaughtException', function (exception) {
        logger.error(__filename, exception);
    });
}

global.DBConnection = null;

mongo.createConnection(function(db){
    if (db) {
        global.DBConnection = db;

        logger.info(__filename, "Worker "+ process.pid +" started", "", "", "");
        
        daemonNLPAsync.doExecuteDaemon();
        daemonNLPTopic.doExecuteDaemon();
        daemonConversation.doExecuteDaemon();
        daemonMentionConversation.doExecuteDaemon();
        daemonRefreshChatId.doExecuteDaemon();
        
        server.start();
    }
});
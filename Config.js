/** APPLICATION CONFIGURATION **/

exports.APP_SSL             = true;
exports.APP_PORT            = 1111;

exports.APP_VERSION         = "1.0";
exports.APP_NAME            = "API Telegram Monitoring";
exports.APP_DESCRIPTION     = "Telegram Monitoring REST API";
exports.APP_AUTHOR          = "GOD";
exports.APP_LOGO            = "";
exports.APP_ICON            = "";
exports.APP_ID              = exports.APP_NAME.split(" ").join("_") + "_" + exports.APP_PORT;


/** SSO CONFIGURATION **/

exports.SSO_CLIENT_ID       = process.env.CLIENT_ID;
exports.SSO_CLIENT_SECRET   = process.env.CLIENT_SECRET;

/** DATABASE CONFIGURATION **/

exports.DB_CONN                     = process.env.DB_CONNECTION;
exports.DB_NAME                     = process.env.DB_NAME;

exports.DB_COLL_ACCOUNT             = "accounts";
exports.DB_COLL_CHAT                = "chats";
exports.DB_COLL_CONTACT             = "contacts";
exports.DB_COLL_CONVERSATION        = "conversations";
exports.DB_COLL_GROUP_MEMBER        = "groupMembers";
exports.DB_COLL_GROUP               = "groups";
exports.DB_COLL_GROUP_CATEGORY      = "groupCategory";
exports.DB_COLL_APP_CONFIG          = "app_config";
exports.DB_COLL_SPAM_POSTER         = "spam_poster";


/** API CONFIGURATION **/

exports.API_SSO = {
    API_SSL      : true,
    API_HOST     : process.env.API_SSO_HOST,
    API_PORT     : process.env.API_SSO_PORT,
    API_PATH     : "",
    API_METHOD   : "POST",
    API_USERNAME : "",
    API_PASSWORD : "",
    API_TIMEOUT  : 600000
}

exports.API_TELEMON_ENGINE = {
    API_SSL      : true,
    API_HOST     : process.env.API_TELEMON_ENGINE_HOST,
    API_PORT     : process.env.API_TELEMON_ENGINE_PORT,
    API_PATH     : process.env.API_TELEMON_ENGINE_PATH,
    API_METHOD   : "POST",
    API_USERNAME : process.env.API_TELEMON_ENGINE_USERNAME,
    API_PASSWORD : process.env.API_TELEMON_ENGINE_PASSWORD,
    API_TIMEOUT  : 600000
}

exports.NLP = {
    API_SSL 		   : false,
    API_HOST           : process.env.API_NLP_HOST,
    API_PORT           : process.env.API_NLP_PORT,
    API_PATH           : process.env.API_NLP_PATH,
    API_METHOD		   : "POST",
    API_USERNAME       : process.env.API_NLP_USERNAME,
    API_PASSWORD       : process.env.API_NLP_PASSWORD,
    API_CONTENT_TYPE   : "application/json",
}
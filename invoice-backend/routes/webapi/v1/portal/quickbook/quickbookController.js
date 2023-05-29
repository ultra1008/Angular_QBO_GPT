let common = require('../../../../../controller/common/common');
var QuickBooks = require('node-quickbooks')
var OAuthClient = require('intuit-oauth')
var QuickBooks = require('node-quickbooks')
var MongoClient = require('mongodb').MongoClient;
let config = require('../../../../../config/config');
let collectionConstant = require('../../../../../config/collectionConstant');
let tenantsSchema = require('../../../../../model/tenants');
let db_connection = require('../../../../../controller/common/connectiondb');
QuickBooks.setOauthVersion('2.0');

// Instance of client
var url = `mongodb://${config.DB_HOST}:${config.DB_PORT}/`
var oauthClient = null
var companycode = ""
const port = 4207

// AuthorizationUrl

module.exports.savequickBookInfo = async function (req, res) {
    console.log(req.session);

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        client_id = req.body.quickbooks_client_id;
        client_secret = req.body.quickbooks_client_secret;
        environment = req.body.environment;
        redirectUri = req.body.redirectUri;
        companycode = req.body.companycode;
        oauthClient = new OAuthClient({
            clientId: client_id,
            clientSecret: client_secret,
            environment: environment,                                // ‘sandbox’ or ‘production’
            redirectUri: redirectUri
        });
        var authUri = oauthClient.authorizeUri({ scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.Payment, OAuthClient.scopes.OpenId, OAuthClient.scopes.Profile], state: 'intuit-test' });
        console.log(authUri);
        res.send({ status: true, authUri: authUri });
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.callback = async function (req, res) {
    console.log('==== Callback======', req);
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        authResponse = await oauthClient.createToken(req.url);
        realmId = oauthClient.getToken().realmId;
        console.log("this is my console");
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);

        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
        var updateObject = {
            $set: {
                client_id: config.client_id,
                client_secret: config.client_secret,
                access_token: JSON.parse(oauth2_token_json).access_token,
                realmId: realmId,
                refresh_token: JSON.parse(oauth2_token_json).refresh_token
            }
        };
        await tenantsConnection.updateOne({ companycode: companycode }, updateObject);
        res.render(__dirname + '/sendfile/quickbooks-authorization.component.ejs', { client_id: '' });
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

module.exports.refreshToken = async function (companycode) {
    console.log("refreshToken call =======> ");
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
            console.log("The access_token is valid");
        }
        if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
            console.log("Iam in here!!!");
            oauthClient.refresh()
                .then(async function (authResponse) {
                    console.log('The Refresh Token is  ' + JSON.stringify(authResponse.getJson()));
                    oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                    let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
                    var updateObject = {
                        $set: {
                            access_token: JSON.parse(oauth2_token_json).access_token,
                            refresh_token: JSON.parse(oauth2_token_json).refresh_token
                        }
                    };
                    await tenantsConnection.updateOne({ companycode: companycode }, updateObject);
                })
                .catch(function (e) {
                    console.error(e);
                });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

module.exports.isConnectToQBO = async function (req, res) {
    console.log('~~~~~~~~ isConnectToQBO');
    if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
        console.log('~~~~~~~~ isConnectToQBO 1');
        res.send({ isConnect: true });
    }
    else if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
        console.log('~~~~~~~~ isConnectToQBO 2');
        res.send({ isConnect: false });
    }
    else {
        console.log('~~~~~~~~ isConnectToQBO 3');
        res.send({ isConnect: false });
    }
};

module.exports.logout = async function (req, res) {
    console.log('~~~~~~~~ logout');
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        const companycode = req.body.companycode;
        console.log("this is companycode");
        console.log(companycode);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantsSchema);
        var updateObject = {
            $set: {
                access_token: '',
                refresh_token: ''
            }
        };
        if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
            oauthClient.revoke()
                .then(async function (response) {
                    oauthClient = null;
                    await tenantsConnection.updateOne({ companycode: companycode }, updateObject);
                });
        }
        if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
            oauthClient = null;
            await tenantsConnection.updateOne({ companycode: companycode }, updateObject);
        }
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

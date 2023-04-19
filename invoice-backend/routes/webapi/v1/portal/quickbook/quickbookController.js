let common = require('../../../../../controller/common/common');
var QuickBooks = require('node-quickbooks');
var OAuthClient = require('intuit-oauth');
var Tokens = require('csrf');
var csrf = new Tokens();
var request = require('request');
var ejs = require('ejs');
var QuickBooks = require('node-quickbooks');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const puppeteer = require('puppeteer');
let config = require('../../../../../config/config');
let collectionConstant = require('../../../../../config/collectionConstant');
let tenantsSchema = require('../../../../../model/tenants');
let db_connection = require('../../../../../controller/common/connectiondb');
QuickBooks.setOauthVersion('2.0');

// Instance of client
var oauthClient = null;
var companycode = "";
const port = 4207;

// AuthorizationUrl

module.exports.savequickBookInfo = async function (req, res) {
    console.log(req.session);

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        client_id = req.body.quickbooks_client_id;
        client_secret = req.body.quickbooks_client_secret;
        companycode = req.body.companycode;
        oauthClient = new OAuthClient({
            clientId: config.client_id,
            clientSecret: config.client_secret,
            environment: 'sandbox',                                // ‘sandbox’ or ‘production’
            redirectUri: 'https://localhost:4207/webapi/v1/callback/'
        });
        var authUri = oauthClient.authorizeUri({ scope: [OAuthClient.scopes.Accounting], state: 'intuit-test' });
        res.send({ status: true, authUri: authUri });
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.callback = async function (req, res) {
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
    /* MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("rovuk_admin");
        dbo.collection("tenants").updateOne({ companycode: companycode }, { $set: { 'client_id': config.client_id, 'client_secret': config.client_secret, 'access_token': JSON.parse(oauth2_token_json).access_token, 'realmId': realmId, 'refresh_token': JSON.parse(oauth2_token_json).refresh_token } }, function (err, result) {
            if (err) throw err;
            // console.log(result);
            db.close();
        });
    }); */
    // var qbo = new QuickBooks(config.client_id,
    //     config.client_secret,
    //     JSON.parse(oauth2_token_json).access_token,
    //     false, // no token secret for oAuth 2.0
    //     realmId,
    //     false, // use the sandbox?
    //     false, // enable debugging?
    //     null, // set minorversion, or null for the latest version
    //     '2.0', //oAuth version
    //     JSON.parse(oauth2_token_json).refresh_token);
    // qbo.getCompanyInfo(realmId, function(err, info){
    //     console.log(info)
    // })
    // res.send("Welcome")
};

module.exports.refreshToken = async function (companycode) {
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
    /* if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
        console.log("The access_token is valid");
    }
    if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
        console.log("Iam in here!!!");
        oauthClient.refresh()
            .then(function (authResponse) {
                console.log('The Refresh Token is  ' + JSON.stringify(authResponse.getJson()));
                oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("rovuk_admin");
                    dbo.collection("tenants").updateOne({ companycode: companycode }, { $set: { 'access_token': JSON.parse(oauth2_token_json).access_token, 'refresh_token': JSON.parse(oauth2_token_json).refresh_token } }, function (err, result) {
                        if (err) throw err;
                        console.log(result);
                        db.close();
                    });
                });
            })
            .catch(function (e) {
                console.error(e);
            });
    } */
};

module.exports.isConnectToQBO = async function (req, res) {
    if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
        res.send({ isConnect: true });
    }
    else if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
        res.send({ isConnect: false });
    }
    else {
        res.send({ isConnect: false });
    }
};

module.exports.logout = async function (req, res) {
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
    /* const companycode = req.body.companycode;
   console.log("this is companycode");
   console.log(companycode);
   if (oauthClient !== null && oauthClient.isAccessTokenValid()) {
       MongoClient.connect(url, function (err, db) {
           if (err) throw err;
           var dbo = db.db("rovuk_admin");
           oauthClient.revoke()
               .then(function (response) {
                   oauthClient = null;
                   dbo.collection("tenants").updateOne({ companycode: companycode }, { $set: { 'access_token': '', 'refresh_token': '' } }, function (err, result) {
                       if (err) throw err;
                       console.log(result);
                       res.send({ msg: "success" });
                       db.close();
                   });
               })
               .catch(function (e) {

               });
       });
   }
   if (oauthClient !== null && !oauthClient.isAccessTokenValid()) {
       oauthClient = null;
       dbo.collection("tenants").updateOne({ companycode: companycode }, { $set: { 'access_token': '', 'refresh_token': '' } }, function (err, result) {
           if (err) throw err;
           console.log(result);
           res.send({ msg: "success" });
           db.close();
       });
   } */

};

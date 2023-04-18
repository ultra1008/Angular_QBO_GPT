let common = require('../../../../../controller/common/common');
var QuickBooks = require('node-quickbooks')
var OAuthClient = require('intuit-oauth')
var QuickBooks = require('node-quickbooks')
var MongoClient = require('mongodb').MongoClient;
let config = require('../../../../../config/config');

QuickBooks.setOauthVersion('2.0');

// Instance of client
var url = `mongodb://${config.DB_HOST}:${config.DB_PORT}/`
var oauthClient = null
var companycode = ""
const port = 4207

// AuthorizationUrl

module.exports.savequickBookInfo = async function (req, res) {
    console.log(req.session)
    
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
            redirectUri: config.redirectUri
        });
        var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
        res.send({status:true, authUri:authUri});
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports. callback = async function (req, res) {
    authResponse = await oauthClient.createToken(req.url)
    realmId = oauthClient.getToken().realmId;
    console.log("this is my console")
    oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rovuk_admin");
        dbo.collection("tenants").updateOne({ companycode: companycode },{$set : {'client_id': config.client_id, 'client_secret': config.client_secret, 'access_token':JSON.parse(oauth2_token_json).access_token,'realmId':realmId,'refresh_token':JSON.parse(oauth2_token_json).refresh_token}},function(err, result) {
            if (err) throw err;
            // console.log(result);
            db.close();
        });
    });
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
    res.render(__dirname + '/sendfile/quickbooks-authorization.component.ejs',{client_id:''});
};

module.exports. refreshToken = async function (companycode) {
    if(oauthClient !== null&&oauthClient.isAccessTokenValid()) {
        console.log("The access_token is valid");
     }
     if(oauthClient !== null&&!oauthClient.isAccessTokenValid()){
        console.log("Iam in here!!!")
        oauthClient.refresh()
        .then(function(authResponse){
            console.log('The Refresh Token is  '+ JSON.stringify(authResponse.getJson()));
            oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("rovuk_admin");
                dbo.collection("tenants").updateOne({ companycode: companycode },{$set : { 'access_token':JSON.parse(oauth2_token_json).access_token,'refresh_token':JSON.parse(oauth2_token_json).refresh_token}},function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    db.close();
                });
            });
        })
        .catch(function(e) {
            console.error(e);
        });
    }
};

module.exports. isConnectToQBO = async function (req, res) {
    if(oauthClient !== null&&oauthClient.isAccessTokenValid()) {
        res.send({isConnect:true})
     }
    else if(oauthClient !== null&&!oauthClient.isAccessTokenValid()){
        res.send({isConnect:false})
    }
    else {
        res.send({isConnect:false})
    }
};

module.exports.logout = async function (req, res) {
    const companycode = req.body.companycode
    console.log("this is companycode")
    console.log(companycode)
    if(oauthClient !== null&&oauthClient.isAccessTokenValid()) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("rovuk_admin");
            oauthClient.revoke()
            .then(function(response){
                oauthClient = null
                dbo.collection("tenants").updateOne({ companycode: companycode },{$set : { 'access_token':'','refresh_token':''}},function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    res.send({msg:"success"})
                    db.close();
                });
            })
            .catch(function(e){

            })
        });
     }
     if(oauthClient !== null&&!oauthClient.isAccessTokenValid()){
        oauthClient = null
        dbo.collection("tenants").updateOne({ companycode: companycode },{$set : { 'access_token':'','refresh_token':''}},function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send({msg:"success"})
            db.close();
        });
    }
    
};

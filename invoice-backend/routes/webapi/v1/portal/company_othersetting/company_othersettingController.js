let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
let superadminCollection = require('./../../../../../config/superadminCollection');
let rest_Api = require('../../../../../config/db_rest_api');
var formidable = require('formidable');
var fs = require('fs');
var companyCollection = "company";
var tenantsCollection = "tenants";
var userSchema = require('./../../../../../model/user');
var rolesandpermissionsSchema = require('./../../../../../model/rolesandpermissions');

var bucketOpration = require('./../../../../../controller/common/s3-wasabi');

module.exports.compnayinformation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    console.log("decodedToken", decodedToken);
    if (decodedToken) {
        try {
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            res.send({ message: translator.getStr('CompanyListing'), data: company_data, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayupdateinformation = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let reqObject = req.body;
            let id = reqObject._id;
            delete reqObject["_id"];
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.update(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { _id: ObjectID(id) }, reqObject);
            console.log("company_data", company_data.result.n);
            if (company_data.result.nModified == 1) {
                res.send({ message: translator.getStr('CompanyUpdated'), data: company_data.result, status: true });
            }
            else if (company_data.result.nModified == 0 && company_data.result.ok) {
                res.send({ message: translator.getStr('CompanyAlreadyUpdated'), data: company_data.result, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


module.exports.editCompany = function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var form = new formidable.IncomingForm();
        var fields = [];
        var notFonud = 0;
        var newOpenFile;
        // var fileType;
        var fileName;
        form.parse(req)
            .on('file', function (name, file) {
                notFonud = 1;
                fileName = file;
            }).on('field', function (name, field) {
                fields[name] = field;
            })
            .on('error', function (err) {
                throw err;
            }).on('end', function () {
                newOpenFile = this.openedFiles;
                var body = JSON.parse(fields.reqObject);
                console.log("fields", fields);
                var compnayCode_tmp = fields.editcopmanycode.toLowerCase();
                var id = fields._id;
                delete body['_id'];
                DB.update(companyCollection, { _id: ObjectID(id) }, body, function (err, resultUpdate) {
                    if (err) {
                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                    } else {
                        if (notFonud == 1) {
                            var temp_path = newOpenFile[0].path;
                            var file_name = newOpenFile[0].name;
                            dirKeyName = "logo/" + file_name;
                            var fileBody = fs.readFileSync(temp_path);
                            params = { Bucket: compnayCode_tmp, Key: dirKeyName, Body: fileBody, ACL: 'public-read-write' };
                            console.log(params);
                            bucketOpration.uploadFile(params, function (err, resultUpload) {
                                if (err) {
                                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                                } else {
                                    console.log(resultUpload);
                                    urlProfile = config.wasabisys_url + "/" + compnayCode_tmp + "/" + dirKeyName;
                                    DB.update(companyCollection, { _id: ObjectID(id) }, { companylogo: urlProfile }, function (err, resultupdate) {
                                        if (err) {
                                            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                                        } else {
                                            res.send({ message: translator.getStr("CompanyUpdated"), data: resultUpdate, status: true });
                                        }
                                    });
                                }
                            });
                        } else {
                            res.send({ message: translator.getStr("CompanyUpdated"), data: resultUpdate, status: true });
                        }

                    }
                });
            });
    } else {
        res.send({ message: "Invalid user for this action", status: false });
    }
};

module.exports.compnaysmtp = async function (req, res) {
    console.log('compnaysmtp call');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            res.send({ message: translator.getStr('CompanySMTP'), data: company_data, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayupdatesmtp = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let reqObject = req.body;
            let id = reqObject._id;
            delete reqObject["_id"];
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.update(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { company_id: ObjectID(id) }, reqObject);
            if (company_data.result.nModified == 1) {
                res.send({ message: translator.getStr('CompanySMPTUpdated'), data: company_data.result, status: true });
            }
            else if (company_data.result.nModified == 0 && company_data.result.ok) {
                res.send({ message: translator.getStr('CompanySMPTAlreadyUpdated'), data: company_data.result, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.sendIframeCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        try {
            let requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            await rest_Api.update(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode }, { vendor_registration_url: requestObject.regitration_url });
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: `${company_data.companyname} team`,
                TITLE: `${translator.getStr('iFrame_IntegrationWith')} ${company_data.companyname}`,
                COPY_CODE: translator.getStr('Copy_Code'),
                TEXT1: `${translator.getStr('EmailTemplateHello')} ${company_data.companyname},`,
                TEXT2: translator.getStr('Iframe_LINK_COPY_DESCRIPTION'),
                HTML_FREAM: requestObject.iframecode,
                REGISTRATION_LINK: requestObject.regitration_url,

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
            };
            const file_data = fs.readFileSync('./controller/emailtemplates/sendIfameCode.html', 'utf8');
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            let mailsend = await sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, requestObject.emailsList, "Iframe Code", HtmlData,
                talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);
            console.log("mailsend: ", mailsend);

            res.send({ message: translator.getStr('SEND_MAIL_TEAMPLETE'), status: true });

        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.compnayUsage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let reqObject = req.body;
            let BucketName = decodedToken.companycode.toLowerCase();
            let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
            let roleConnection = connection_db_api.model(collectionConstant.ROLEANDPERMISSION, rolesandpermissionsSchema);
            let totalUserCount = await userConnection.countDocuments({ is_delete: 0 });
            let admin_role = await roleConnection.findOne({ role_name: config.ROLEADMIN }, { _id: 1 });
            let supervisor_role = await roleConnection.findOne({ role_name: config.ROLE_SUPERVISOR }, { _id: 1 });
            let totalAdminCount = await userConnection.countDocuments({ is_delete: 0, userroleId: ObjectID(admin_role._id) });
            let totalSuervisorCount = await userConnection.countDocuments({ is_delete: 0, userroleId: ObjectID(supervisor_role._id) });
            let totalUser = Number(totalUserCount) - Number(totalAdminCount) - Number(totalSuervisorCount);
            let resObject = {
                totalUser: totalUser,
                totalSuervisor: totalSuervisorCount,
                bucket_size: 0
            };
            bucketOpration.getBucketSize(BucketName, function (err_bucket, result_bucket) {
                if (err_bucket) {
                    res.send({ message: translator.getStr('SomethingWrong'), data: resObject, status: true });
                } else {
                    console.log(result_bucket);
                    resObject.bucket_size = result_bucket;
                    res.send({ message: translator.getStr('CompanyWasabiUsage'), data: resObject, status: true });
                }
            });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
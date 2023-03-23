var userSchema = require('./../../../../../model/user');
var rolesSchema = require('./../../../../../model/roles');
var languageSchema = require('./../../../../../model/language');
var loginHistorySchema = require('./../../../../../model/loginHistory');
var rolesandpermissionsSchema = require('./../../../../../model/rolesandpermissions');
var settingSchema = require('./../../../../../model/settings');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let sendEmail = require('./../../../../../controller/common/sendEmail');
let collectionConstant = require('./../../../../../config/collectionConstant');
let config = require('./../../../../../config/config');
const fs = require('fs');
var handlebars = require('handlebars');
let rest_Api = require('./../../../../../config/db_rest_api');
const { isNull } = require('util');
let companyCollection = "company";
let tenantsCollection = "tenants";
var emailOTPSchema = require('./../../../../../model/email_otp');
let db_rest_api = require('../../../../../config/db_rest_api');
let superadminCollection = require('./../../../../../config/superadminCollection');
var invoiceRoleSchema = require('./../../../../../model/invoice_roles');
var roleSchema = require('./../../../../../model/diversity_roles');

module.exports.sendOTPforLogin = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let connection_db_api;
    try {
        var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode });
        console.log("company_data", company_data);
        if (company_data != null) {
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode });
            connection_db_api = await db_connection.connection_db_api(talnate_data);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
            if (one_user) {
                let emailOTPConnection = connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);
                let sixdidgitnumber = common.randomString(6);

                requestObject.sent_on = Math.round(new Date().getTime() / 1000);
                requestObject.user_id = one_user._id;
                requestObject.otp = sixdidgitnumber;
                console.log("sixdidgitnumber", sixdidgitnumber);
                let send_email_otp = new emailOTPConnection(requestObject);
                let save_email_otp = await send_email_otp.save();
                if (save_email_otp) {
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: `${company_data.companyname} team`,

                        TITLE: 'One Time Password (OTP) verification',
                        LINE1: new handlebars.SafeString(`Your One Time Password (OTP) is <b>${sixdidgitnumber}</b>.`),
                        LINE2: 'Make sure to enter it in the web browser, since your account can’t be accessed without it.',

                        COMPANYNAME: `${translator.getStr('EmailAppInvitationCompanyCode')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailAppInvitationCompanyName')} ${company_data.companycode}`,
                    };
                    const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/emailOTP.html', 'utf8');
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    let mailsend = await sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, [requestObject.useremail], "OTP Verification", HtmlData,
                        talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                        talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);
                    res.send({ message: 'One Time Password (OTP) sent successfully.', status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                res.send({ message: translator.getStr('UserNotFound'), status: false });
            }
        }
        else {
            res.send({ message: 'Company Not found!', status: false });
        }

    } catch (e) {
        console.log("-----", e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    }
};

module.exports.submitEmailOTPforLogin = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let connection_db_api;
    try {
        var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode });
        let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode });
        connection_db_api = await db_connection.connection_db_api(talnate_data);

        let emailOTPConnection = connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);
        let roleConnection = connection_db_api.model(collectionConstant.INVOICE_ROLES, roleSchema);
        let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);

        let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
        if (one_user) {

            let get_otp = await emailOTPConnection.findOne({ user_id: one_user._id, is_delete: 0 }).sort({ sent_on: -1 });
            console.log("get_otp: ", get_otp);
            if (get_otp) {
                if (get_otp.otp == requestObject.otp) {
                    await emailOTPConnection.updateMany({ user_id: one_user._id }, { is_delete: 1 });
                    let UserData = await userConnection.aggregate([
                        {
                            $match:
                            {
                                useremail: requestObject.useremail,
                                is_delete: 0,
                                userstatus: 1
                            },
                        },
                        {
                            $lookup: {
                                from: collectionConstant.INVOICE_ROLES,
                                localField: "userroleId",
                                foreignField: "role_id",
                                as: "role"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.JOB_TITLE,
                                localField: "userjob_title_id",
                                foreignField: "_id",
                                as: "jobtitle"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.DEPARTMENTS,
                                localField: "userdepartment_id",
                                foreignField: "_id",
                                as: "department"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.PAYROLL_GROUP,
                                localField: "user_id_payroll_group",
                                foreignField: "_id",
                                as: "payrollgroup"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.JOB_TYPE,
                                localField: "userjob_type_id",
                                foreignField: "_id",
                                as: "jobtype"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.INVOICE_USER,
                                localField: "usersupervisor_id",
                                foreignField: "_id",
                                as: "supervisor"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.LOCATIONS,
                                localField: "userlocation_id",
                                foreignField: "_id",
                                as: "location"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.INVOICE_USER,
                                localField: "usermanager_id",
                                foreignField: "_id",
                                as: "manager"
                            }
                        },
                        {
                            $lookup: {
                                from: collectionConstant.CREDITCARD,
                                localField: "card_type",
                                foreignField: "_id",
                                as: "card"
                            }
                        },
                        {
                            $unwind: {
                                path: "$card",
                                preserveNullAndEmptyArrays: true
                            },
                        },
                        {
                            $project: {
                                role_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$role.role_name" },
                                                {
                                                    $arrayElemAt: ["$role.role_name", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                supervisor_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$supervisor.userfullname" },
                                                {
                                                    $arrayElemAt: ["$supervisor.userfullname", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                manager_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$manager.userfullname" },
                                                {
                                                    $arrayElemAt: ["$manager.userfullname", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                location_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$location.location_name" },
                                                {
                                                    $arrayElemAt: ["$location.location_name", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                userjob_type_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$jobtype.job_type_name" },
                                                {
                                                    $arrayElemAt: ["$jobtype.job_type_name", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                userjob_title_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$jobtitle.job_title_name" },
                                                {
                                                    $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                department_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$department.department_name" },
                                                {
                                                    $arrayElemAt: ["$department.department_name", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                user_payroll_group_name: {
                                    $ifNull: [
                                        {
                                            $cond: [
                                                { $isArray: "$payrollgroup.payroll_group_name" },
                                                {
                                                    $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                                }, ""
                                            ]
                                        }, ""
                                    ]
                                },
                                userroleId: 1,
                                password: 1,
                                useremail: 1,
                                username: 1,
                                usermiddlename: 1,
                                userlastname: 1,
                                userfullname: 1,
                                userssn: 1,
                                userdevice_pin: 1,
                                userphone: 1,
                                usersecondary_email: 1,
                                usergender: 1,
                                userdob: 1,
                                userstatus: 1,
                                userpicture: 1,
                                usermobile_picture: 1,
                                userfulladdress: 1,
                                userstreet1: 1,
                                userstreet2: 1,
                                usercity: 1,
                                user_state: 1,
                                userzipcode: 1,
                                usercountry: 1,
                                userstartdate: 1,
                                usersalary: 1,
                                usermanager_id: 1,
                                usersupervisor_id: 1,
                                userlocation_id: 1,
                                userjob_title_id: 1,
                                userdepartment_id: 1,
                                userjob_type_id: 1,
                                usernon_exempt: 1,
                                usermedicalBenifits: 1,
                                useradditionalBenifits: 1,
                                useris_password_temp: 1,
                                userterm_conditions: 1,
                                userweb_security_code: 1,
                                user_payroll_rules: 1,
                                user_id_payroll_group: 1,
                                usercostcode: 1,
                                userqrcode: 1,
                                userfirebase_id: 1,
                                login_from: 1,
                                card_type_name: { $ifNull: ["$card.name", ""] },
                                card_type: 1,
                                api_setting: 1,
                                signature: 1,
                                allow_for_projects: 1,
                                user_languages: 1,
                                show_id_card_on_qrcode_scan: 1,
                                compliance_officer: 1,
                            }
                        }
                    ]);
                    UserData = UserData[0];
                    let roles_tmp = await roleConnection.findOne({ role_id: ObjectID(UserData.userroleId) });
                    var resObject_db = {
                        "DB_HOST": talnate_data.DB_HOST,
                        "DB_NAME": talnate_data.DB_NAME,
                        "DB_PORT": talnate_data.DB_PORT,
                        "DB_USERNAME": talnate_data.DB_USERNAME,
                        "DB_PASSWORD": talnate_data.DB_PASSWORD,
                        "companycode": talnate_data.companycode,
                        "token": ""
                    };
                    let resObject = {
                        ...resObject_db,
                        UserData
                    };
                    var resLast = {
                        "token": "",
                        UserData,
                        settings: {},
                        role_permission: [],
                        questions: [],
                        companydata: company_data
                    };
                    var token = await common.generateJWT(resObject);
                    resLast.token = token;
                    resLast.role_permission = roles_tmp.role_permission;
                    res.send({ message: 'One Time Password (OTP) matched successfully.', data: resLast, status: true });
                } else {
                    res.send({ message: 'Make sure you entered correct One Time Password (OTP).', status: false });
                }
            } else {
                res.send({ message: 'Make sure you entered correct One Time Password (OTP).', status: false });
            }
        } else {
            res.send({ message: translator.getStr('UserNotFound'), status: false });
        }
    } catch (e) {
        console.log("-----", e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    }
};

module.exports.ChangePassword = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let userOne = await userConnection.findOne({ _id: ObjectID(decodedToken.UserData._id), is_delete: 0, userstatus: 1 });
            if (userOne == null) {
                res.send({ message: translator.getStr('UserNotFound'), error: null, status: false });
            } else {
                if (common.validPassword(req.body.oldpassword, userOne.password)) {
                    var passwordHash = await common.generateHash(req.body.password);
                    var updatesuccess = await userConnection.updateOne({ _id: ObjectID(decodedToken.UserData._id) }, { "password": passwordHash, useris_password_temp: false });
                    if (updatesuccess) {
                        res.send({ message: translator.getStr('PasswordChanged'), data: updatesuccess, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('PasswordNotMatched'), status: false });
                }
            }
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            console.log("db close check: mobile change password");
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.ForgetPassword = async function (req, res) {
    var translator = new common.Language(req.headers.language);
    DB.findOne("tenants", { companycode: req.body.companycode }, async function (err, result) {
        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            try {
                if (result) {
                    let connection_db_api = await db_connection.connection_db_api(result);
                    try {
                        var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
                        let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: req.body.companycode });
                        let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                        let UserData = await userConnection.findOne({ "useremail": req.body.useremail, is_delete: 0, userstatus: 1 });
                        if (UserData == null) {
                            res.send({ message: translator.getStr('UserNotFound'), status: false });
                        } else {
                            let temp_password = common.rendomPassword(8);
                            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                            let update_user = await userConnection.updateOne({ useremail: req.body.useremail }, { password: common.generateHash(temp_password), useris_password_temp: true });
                            if (update_user) {
                                const data = await fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/resetPassword.html', 'utf8');
                                let emailTmp = {
                                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${config.NUMBERPHONE2}`,
                                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                                    THANKS: translator.getStr('EmailTemplateThanks'),
                                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),

                                    TITLE: translator.getStr('EmailResetPasswordTitle'),
                                    HI_USERNAME: `${translator.getStr('EmailTemplateHi')} ${UserData.username},`,
                                    TEXT1: translator.getStr('EmailResetPasswordText1'),
                                    TEXT2: translator.getStr('EmailResetPasswordText2'),
                                    TEXT3: translator.getStr('EmailResetPasswordText3'),
                                    TEMP_PASSWORD: `${translator.getStr('EmailResetPasswordTempPassword')} ${temp_password}`,

                                    COMPANYNAME: `${translator.getStr('EmailAppInvitationCompanyName')} ${company_data.companyname}`,
                                    COMPANYCODE: `${translator.getStr('EmailAppInvitationCompanyCode')} ${company_data.companycode}`,
                                };
                                var template = handlebars.compile(data);
                                var HtmlData = await template(emailTmp);
                                let tenant_smtp_security = result.tenant_smtp_security == "Yes" || result.tenant_smtp_security == "YES" || result.tenant_smtp_security == "yes" ? true : false;
                                let mailsend = await sendEmail.sendEmail_client(result.tenant_smtp_username, req.body.useremail, "Rovuk Forgot Password", HtmlData,
                                    result.tenant_smtp_server, result.tenant_smtp_port, result.tenant_smtp_reply_to_mail, result.tenant_smtp_password, result.tenant_smtp_timeout,
                                    tenant_smtp_security);
                                if (mailsend) {
                                    res.send({ message: translator.getStr('CheckMailForgotPassword'), status: true, update_user: update_user });
                                } else {
                                    res.send({ message: translator.getStr('CompanyNotFound'), status: false });
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }

                } else {
                    res.send({ message: translator.getStr('CompanyNotFound'), status: false });
                }
            } catch (e) {
                console.log(e);
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            }
        }
    });
};

module.exports.login = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language(req.headers.language);
    DB.findOne(superadminCollection.COMPANY, { companycode: requestObject.companycode }, function (err, resultfind) {

        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            if (resultfind != null) {
                DB.findOne(superadminCollection.TENANTS, { companycode: requestObject.companycode }, async function (err, result) {

                    if (err) {
                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                    } else {
                        let connection_db_api;
                        try {

                            if (result) {
                                connection_db_api = await db_connection.connection_db_api(result);
                                let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                                let roleConnection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
                                let UserData = await userConnection.aggregate([
                                    {
                                        $match:
                                        {
                                            useremail: requestObject.useremail,
                                            is_delete: 0,
                                            userstatus: 1
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.INVOICE_ROLES,
                                            localField: "userroleId",
                                            foreignField: "role_id",
                                            as: "role"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.JOB_TITLE,
                                            localField: "userjob_title_id",
                                            foreignField: "_id",
                                            as: "jobtitle"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.DEPARTMENTS,
                                            localField: "userdepartment_id",
                                            foreignField: "_id",
                                            as: "department"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.PAYROLL_GROUP,
                                            localField: "user_id_payroll_group",
                                            foreignField: "_id",
                                            as: "payrollgroup"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.JOB_TYPE,
                                            localField: "userjob_type_id",
                                            foreignField: "_id",
                                            as: "jobtype"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.INVOICE_USER,
                                            localField: "usersupervisor_id",
                                            foreignField: "_id",
                                            as: "supervisor"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.LOCATIONS,
                                            localField: "userlocation_id",
                                            foreignField: "_id",
                                            as: "location"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.INVOICE_USER,
                                            localField: "usermanager_id",
                                            foreignField: "_id",
                                            as: "manager"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: collectionConstant.CREDITCARD,
                                            localField: "card_type",
                                            foreignField: "_id",
                                            as: "card"
                                        }
                                    },
                                    {
                                        $unwind: {
                                            path: "$card",
                                            preserveNullAndEmptyArrays: true
                                        },
                                    },
                                    {
                                        $project: {
                                            role_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$role.role_name" },
                                                            {
                                                                $arrayElemAt: ["$role.role_name", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            supervisor_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$supervisor.userfullname" },
                                                            {
                                                                $arrayElemAt: ["$supervisor.userfullname", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            manager_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$manager.userfullname" },
                                                            {
                                                                $arrayElemAt: ["$manager.userfullname", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            location_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$location.location_name" },
                                                            {
                                                                $arrayElemAt: ["$location.location_name", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            userjob_type_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$jobtype.job_type_name" },
                                                            {
                                                                $arrayElemAt: ["$jobtype.job_type_name", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            userjob_title_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$jobtitle.job_title_name" },
                                                            {
                                                                $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            department_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$department.department_name" },
                                                            {
                                                                $arrayElemAt: ["$department.department_name", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            user_payroll_group_name: {
                                                $ifNull: [
                                                    {
                                                        $cond: [
                                                            { $isArray: "$payrollgroup.payroll_group_name" },
                                                            {
                                                                $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                                            }, ""
                                                        ]
                                                    }, ""
                                                ]
                                            },
                                            userroleId: 1,
                                            password: 1,
                                            useremail: 1,
                                            username: 1,
                                            usermiddlename: 1,
                                            userlastname: 1,
                                            userfullname: 1,
                                            userssn: 1,
                                            userdevice_pin: 1,
                                            userphone: 1,
                                            usersecondary_email: 1,
                                            usergender: 1,
                                            userdob: 1,
                                            userstatus: 1,
                                            userpicture: 1,
                                            usermobile_picture: 1,
                                            userfulladdress: 1,
                                            userstreet1: 1,
                                            userstreet2: 1,
                                            usercity: 1,
                                            user_state: 1,
                                            userzipcode: 1,
                                            usercountry: 1,
                                            userstartdate: 1,
                                            usersalary: 1,
                                            usermanager_id: 1,
                                            usersupervisor_id: 1,
                                            userlocation_id: 1,
                                            userjob_title_id: 1,
                                            userdepartment_id: 1,
                                            userjob_type_id: 1,
                                            usernon_exempt: 1,
                                            usermedicalBenifits: 1,
                                            useradditionalBenifits: 1,
                                            useris_password_temp: 1,
                                            userterm_conditions: 1,
                                            userweb_security_code: 1,
                                            user_payroll_rules: 1,
                                            user_id_payroll_group: 1,
                                            usercostcode: 1,
                                            userqrcode: 1,
                                            userfirebase_id: 1,
                                            login_from: 1,
                                            card_type_name: { $ifNull: ["$card.name", ""] },
                                            card_type: 1,
                                            api_setting: 1,
                                            signature: 1,
                                            allow_for_projects: 1,
                                            user_languages: 1,
                                            show_id_card_on_qrcode_scan: 1,
                                            compliance_officer: 1,
                                        }
                                    }
                                ]);
                                UserData = UserData[0];

                                if (UserData == null) {
                                    res.send({ message: translator.getStr('UserNotFound'), status: false });
                                } else {
                                    let roles_tmp = await roleConnection.findOne({ role_name: 'Admin' });
                                    var psss_tnp = await common.validPassword(requestObject.password, UserData.password);
                                    if (psss_tnp) {
                                        var resObject_db = {
                                            "DB_HOST": result.DB_HOST,
                                            "DB_NAME": result.DB_NAME,
                                            "DB_PORT": result.DB_PORT,
                                            "DB_USERNAME": result.DB_USERNAME,
                                            "DB_PASSWORD": result.DB_PASSWORD,
                                            "companycode": result.companycode,
                                            "token": ""
                                        };
                                        let resObject = {
                                            ...resObject_db,
                                            UserData
                                        };
                                        //console.log("resObject", resObject)
                                        var resLast = {
                                            "token": "",
                                            UserData,
                                            settings: {},
                                            role_permission: [],
                                            questions: [],
                                            companydata: resultfind
                                        };
                                        var token = await common.generateJWT(resObject);
                                        resLast.token = token;
                                        resLast.role_permission = roles_tmp.role_permission;
                                        res.send({ message: translator.getStr('UserListing'), data: resLast, status: true });

                                    } else {
                                        res.send({ message: translator.getStr('WrongPassword'), status: false });
                                    }
                                    // }

                                }
                            } else {
                                res.send({ message: translator.getStr('CompanyNotFound'), status: false });
                            }

                        } catch (e) {
                            console.log("-----", e);
                            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
                        }
                    }
                });
            } else {
                res.send({ message: translator.getStr('CompanyNotFound'), error: err, status: false });
            }
        }
    });
};

module.exports.userlogout = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let loginHistoryConnection = connection_db_api.model(collectionConstant.LOGINHISTORY, loginHistorySchema);
            requestObject.user_id = decodedToken.UserData._id;
            requestObject.created_at = Math.round(new Date().getTime() / 1000);
            requestObject.updated_at = requestObject.created_at;
            requestObject.logout_at = requestObject.created_at;
            requestObject.is_login = false;
            requestObject.userfirebase_token = "";
            let add_logout = new loginHistoryConnection(requestObject);
            let save_logout = await add_logout.save();
            if (save_logout) {
                requestObject.inserted_id = save_logout._id;
                res.send({ message: "Logout successfully ", data: save_logout, status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            console.log("db close check: mobile logout");
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getProfile = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let one_Compnay = await rest_Api.findOne(connection_MDM_main, companyCollection, { companystatus: 1, companycode: decodedToken.companycode });
            let UserData = await userConnection.aggregate([
                {
                    $match:
                    {
                        _id: ObjectID(decodedToken.UserData._id),
                        is_delete: 0,
                        userstatus: 1
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.ROLEANDPERMISSION,
                        localField: "userroleId",
                        foreignField: "_id",
                        as: "role"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TITLE,
                        localField: "userjob_title_id",
                        foreignField: "_id",
                        as: "jobtitle"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.DEPARTMENTS,
                        localField: "userdepartment_id",
                        foreignField: "_id",
                        as: "department"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.PAYROLL_GROUP,
                        localField: "user_id_payroll_group",
                        foreignField: "_id",
                        as: "payrollgroup"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.JOB_TYPE,
                        localField: "userjob_type_id",
                        foreignField: "_id",
                        as: "jobtype"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.USER,
                        localField: "usersupervisor_id",
                        foreignField: "_id",
                        as: "supervisor"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.LOCATIONS,
                        localField: "userlocation_id",
                        foreignField: "_id",
                        as: "location"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.USER,
                        localField: "usermanager_id",
                        foreignField: "_id",
                        as: "manager"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.CREDITCARD,
                        localField: "card_type",
                        foreignField: "_id",
                        as: "card"
                    }
                },
                {
                    $project: {
                        role_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$role.role_name" },
                                        {
                                            $arrayElemAt: ["$role.role_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        supervisor_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$supervisor.userfullname" },
                                        {
                                            $arrayElemAt: ["$supervisor.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        manager_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$manager.userfullname" },
                                        {
                                            $arrayElemAt: ["$manager.userfullname", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        location_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$location.location_name" },
                                        {
                                            $arrayElemAt: ["$location.location_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtype.job_type_name" },
                                        {
                                            $arrayElemAt: ["$jobtype.job_type_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userjob_title_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$jobtitle.job_title_name" },
                                        {
                                            $arrayElemAt: ["$jobtitle.job_title_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        department_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$department.department_name" },
                                        {
                                            $arrayElemAt: ["$department.department_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        user_payroll_group_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$payrollgroup.payroll_group_name" },
                                        {
                                            $arrayElemAt: ["$payrollgroup.payroll_group_name", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        card_type_name: {
                            $ifNull: [
                                {
                                    $cond: [
                                        { $isArray: "$card.name" },
                                        {
                                            $arrayElemAt: ["$card.namee", 0]
                                        }, ""
                                    ]
                                }, ""
                            ]
                        },
                        userroleId: 1,
                        password: 1,
                        useremail: 1,
                        username: 1,
                        usermiddlename: 1,
                        userlastname: 1,
                        userfullname: 1,
                        userssn: 1,
                        userdevice_pin: 1,
                        userphone: 1,
                        usersecondary_email: 1,
                        usergender: 1,
                        userdob: 1,
                        userstatus: 1,
                        userpicture: 1,
                        usermobile_picture: 1,
                        userfulladdress: 1,
                        userstreet1: 1,
                        userstreet2: 1,
                        usercity: 1,
                        user_state: 1,
                        userzipcode: 1,
                        usercountry: 1,
                        userstartdate: 1,
                        usersalary: 1,
                        usermanager_id: 1,
                        usersupervisor_id: 1,
                        userlocation_id: 1,
                        userjob_title_id: 1,
                        userdepartment_id: 1,
                        userjob_type_id: 1,
                        usernon_exempt: 1,
                        usermedicalBenifits: 1,
                        useradditionalBenifits: 1,
                        useris_password_temp: 1,
                        userterm_conditions: 1,
                        userweb_security_code: 1,
                        user_payroll_rules: 1,
                        user_id_payroll_group: 1,
                        usercostcode: 1,
                        userqrcode: 1,
                        userfirebase_id: 1,
                        card_type: 1,
                        api_setting: 1,
                        signature: 1,
                        allow_for_projects: 1,
                        user_languages: 1,
                        show_id_card_on_qrcode_scan: 1,
                    }
                }
            ]);
            if (UserData.length == 0) {
                res.send({ message: translator.getStr('UserNotFound'), status: false });
            } else {
                UserData = UserData[0];
                let temp_languages = [];
                let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
                if (UserData['user_languages']) {
                    for (let i = 0; i < UserData['user_languages'].length; i++) {
                        let language = await lanaguageCollection.findOne({ _id: ObjectID(UserData['user_languages'][i]) }, { name: 1, _id: 1 });
                        temp_languages.push(language.name);
                    }
                }
                UserData['user_languages_name'] = temp_languages;
                let obj = config.PAYROLL_CYCLE.find(o => o.value === Number(UserData['user_payroll_rules']));
                if (obj == null || obj == undefined || obj == "") {
                    UserData['payroll_cycle_name'] = "";
                } else {
                    UserData['payroll_cycle_name'] = obj['viewValue'];
                }
                var get_settings = await connection_db_api.model(collectionConstant.SETTINGS, settingSchema);
                let get_roles = await connection_db_api.model(collectionConstant.ROLEANDPERMISSION, rolesandpermissionsSchema);
                let roles_tmp = await get_roles.findOne({ _id: UserData.userroleId });
                var settings_tmp = await get_settings.findOne({});
                var resLast = {
                    UserData,
                    CompanyData: {
                        company_id: one_Compnay._id,
                        company_code: one_Compnay.companycode,
                        company_logo: one_Compnay.companylogo,
                        company_name: one_Compnay.companyname,
                        company_email: one_Compnay.companyemail,
                        company_phone: one_Compnay.companyphone,
                        company_address: one_Compnay.companyaddress,
                        company_address_city: one_Compnay.companyaddresscity,
                        company_address_state: one_Compnay.companyaddressstate,
                        company_address_zip: one_Compnay.companyaddresszip,
                        conatact_person_name: one_Compnay.conatactpersonname,
                        conatact_person_title: one_Compnay.conatactpersontitle,
                        conatact_person_email: one_Compnay.conatactpersonemail,
                        conatact_person_phone1: one_Compnay.conatactpersonphone1,
                    }
                };
                res.send({ message: "User Profile.", data: resLast, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.update_mobile_picture = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let update_user = await userConnection.updateOne({ "_id": decodedToken.UserData._id }, { usermobile_picture: req.body.usermobile_picture });
            if (update_user) {
                res.send({ message: translator.getStr('UserPictureAdded'), data: update_user, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.update_term_conditions = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let update_user = await userConnection.updateOne({ "_id": decodedToken.UserData._id }, { userterm_conditions: false });
            if (update_user) {
                res.send({ message: translator.getStr('TermsNConditionAccepted'), data: update_user, status: true });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }

};




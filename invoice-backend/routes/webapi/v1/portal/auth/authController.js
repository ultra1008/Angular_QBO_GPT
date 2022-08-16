var settingSchema = require('./../../../../../model/settings');
var userSchema = require('./../../../../../model/user');
var invoiceRoleSchema = require('./../../../../../model/invoice_roles');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
let superadminCollection = require('./../../../../../config/superadminCollection');
var loginHistorySchema = require('./../../../../../model/loginHistory');
var emailOTPSchema = require('./../../../../../model/email_otp');
let rest_Api = require('./../../../../../config/db_rest_api');
var roleSchema = require('./../../../../../model/diversity_roles');

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
                                let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
                                let roleConnection = connection_db_api.model(collectionConstant.SUPPLIER_ROLE, invoiceRoleSchema);
                                //let UserData = await userConnection.findOne({ "useremail": requestObject.useremail , is_delete : 0 , userstatus : 1 });
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
                                            from: collectionConstant.SUPPLIER_ROLE,
                                            localField: "userroleId",
                                            foreignField: "role_id",
                                            as: "role"
                                        }
                                    },
                                    /* {
                                        $unwind: {
                                            path: "$role",
                                            preserveNullAndEmptyArrays: true
                                        },
                                    }, */
                                    {
                                        $lookup: {
                                            from: collectionConstant.JOB_TITLE,
                                            localField: "userjob_title_id",
                                            foreignField: "_id",
                                            as: "jobtitle"
                                        }
                                    },
                                    /*  {
                                         $unwind: {
                                             path: "$jobtitle",
                                             preserveNullAndEmptyArrays: true
                                         },
                                     }, */
                                    {
                                        $lookup: {
                                            from: collectionConstant.DEPARTMENTS,
                                            localField: "userdepartment_id",
                                            foreignField: "_id",
                                            as: "department"
                                        }
                                    },
                                    /* {
                                        $unwind: {
                                            path: "$department",
                                            preserveNullAndEmptyArrays: true
                                        },
                                    }, */
                                    {
                                        $lookup: {
                                            from: collectionConstant.PAYROLL_GROUP,
                                            localField: "user_id_payroll_group",
                                            foreignField: "_id",
                                            as: "payrollgroup"
                                        }
                                    },
                                    //  {
                                    //      $unwind: {
                                    //         path:"$payrollgroup",
                                    //         preserveNullAndEmptyArrays: true
                                    //     },
                                    //  }, 
                                    {
                                        $lookup: {
                                            from: collectionConstant.JOB_TYPE,
                                            localField: "userjob_type_id",
                                            foreignField: "_id",
                                            as: "jobtype"
                                        }
                                    },
                                    // {
                                    //     $unwind: {
                                    //         path:"$jobtype",
                                    //         preserveNullAndEmptyArrays: true
                                    //     },
                                    // },
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
                                    // {
                                    //     $unwind: {
                                    //         path:"$location",
                                    //         preserveNullAndEmptyArrays: true
                                    //     },
                                    // },
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
                                    //   let roles_tmp = await roleConnection.findOne({ _id: ObjectID(UserData.userroleId) });
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
                                        // resLast.role_permission = roles_tmp.role_permission;
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
                        } finally {
                            //connection_db_api.close()
                        }
                    }
                });
            } else {
                res.send({ message: translator.getStr('SponsorNotExist'), error: err, status: false });
            }
        }
    });
};

module.exports.changepassword = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var requestObject = req.body;
        DB.findOne(superadminCollection.TENANTS, { companycode: decodedToken.companycode }, async function (err, result) {
            if (err) {
                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
            } else {
                let connection_db_api;
                try {
                    connection_db_api = await db_connection.connection_db_api(result);
                    let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
                    let userOne = await userConnection.findOne({ _id: ObjectID(decodedToken.UserData._id), is_delete: 0, userstatus: 1 });
                    if (userOne == null) {
                        res.send({ message: translator.getStr('UserNotFound'), status: false });
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
                    console.log("-----", e);
                    res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
                } finally {
                    //connection_db_api.close()
                }
            }
        });
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }

};

module.exports.savelogindetails = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            let loginHistoryConnection = connection_db_api.model(collectionConstant.LOGINHISTORY, loginHistorySchema);
            requestObject.created_at = Math.round(new Date().getTime() / 1000);
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let add_login_history = new loginHistoryConnection(requestObject);
            let save_login_history = await add_login_history.save();
            if (save_login_history) {
                let MAP_DIV = "<div></div>";
                let MAP_LINK = config.SITE_URL + "/#/map-for-all?user_lat=" + requestObject.location_lat + "&user_lng=" + requestObject.location_lng;
                if ((requestObject.location_lat != "" && requestObject.location_lng != "") &&
                    (requestObject.location_lat != 0 && requestObject.location_lng != 0) &&
                    (requestObject.location_lat != 0.0 && requestObject.location_lng != 0.0) &&
                    (requestObject.location_lat != undefined && requestObject.location_lng != undefined) &&
                    (requestObject.location_lat != null && requestObject.location_lng != null)) {
                    MAP_DIV = "<img src='https://s3.us-west-1.wasabisys.com/rovukdata/location_map.png' width='70%'style='padding-top: 15px;' />";
                    MAP_DIV += `<div><a href=${MAP_LINK} target='_blank' style='color: green;'>${translator.getStr('EmailLoginSeeLocation')}</a></div>`;
                }
                let emailTmp = {
                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                    THANKS: translator.getStr('EmailTemplateThanks'),
                    ROVUK_TEAM: `${company_data.companyname} team`,
                    EMAILTITLE: translator.getStr('EmailLoginTitle'),
                    USERNAME: `${translator.getStr('EmailLoginHello')} ${decodedToken.UserData.userfullname}`,
                    LOGINLOCATION: `${translator.getStr('EmailLoginLoginFromNewDevice')} ${requestObject.location}`,
                    TIME: `${translator.getStr('EmailLoginTime')} ${requestObject.created_date}`,
                    IPADDRESS: `${translator.getStr('EmailLoginIP')} ${requestObject.ip_address}`,
                    MAP_DIV: new handlebars.SafeString(MAP_DIV),
                    IF_NOT_YOU: translator.getStr('EmailLoginIfNotYou'),
                    CHANGE_PASSWORD: translator.getStr('EmailLoginChangePassword'),
                    ANY_QUESTION: translator.getStr('EmailLoginAnyQuestion'),

                    COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                    COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                };
                const file_data = fs.readFileSync('./controller/emailtemplates/loginFromNewDevice.html', 'utf8');
                var template = handlebars.compile(file_data);
                var HtmlData = await template(emailTmp);
                let mailsend = await sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, [decodedToken.UserData.useremail], "Login from a new device", HtmlData,
                    talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                    talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);

                // let mailsend = await sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, [get_all_po[0]['vendor']['vendor_email']], "Rovuk Purchase Order Request", HtmlData,
                //     config.tenants.tenant_smtp_server, config.tenants.tenant_smtp_port, config.tenants.tenant_smtp_reply_to_mail,
                //     config.tenants.tenant_smtp_password, config.tenants.tenant_smtp_timeout, config.tenants.tenant_smtp_security);
                res.send({ message: translator.getStr('LoginDetails'), status: true });
            } else {
                console.log("Something went wrong.!", e);
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
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
                res.send({ message: translator.getStr('Logout'), data: save_logout, status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
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

module.exports.sponsorforgetpassword = async function (req, res) {
    var requestObject = req.body;
    DB.findOne(superadminCollection.COMPANY, { companycode: requestObject.companycode }, function (err, resultfind) {
        DB.findOne(superadminCollection.TENANTS, { companycode: requestObject.companycode }, async function (err, resulttanent) {
            if (err) {
                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
            } else {
                var translator = new common.Language('en');
                let connection_db_api = await db_connection.connection_db_api(resulttanent);
                try {
                    let supplierUserSchemaConnection = connection_db_api.model(collectionConstant.USER, userSchema);
                    let find_one_vendor = await supplierUserSchemaConnection.findOne({ useremail: requestObject.useremail });
                    if (find_one_vendor == null) {
                        res.send({ message: translator.getStr('EmailNotExists'), status: false });
                    } else {
                        let temp_password = common.rendomPassword(8);

                        let update_user = await supplierUserSchemaConnection.updateOne({ useremail: req.body.useremail }, { password: common.generateHash(temp_password), useris_password_temp: true });
                        console.log("useremail", req.body.useremail, update_user);
                        const data = await fs.readFileSync('./controller/emailtemplates/resetPassword.html', 'utf8');
                        let emailTmp = {
                            HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                            SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                            ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                            THANKS: translator.getStr('EmailTemplateThanks'),
                            ROVUK_TEAM: ` ${resultfind.companyname} ${translator.getStr('team_mail_all')}`,

                            TITLE: `${translator.getStr('vendor_mail_forgotpass_title1')} ${resultfind.companyname} ${translator.getStr('vendor_mail_forgotpass_title2')}`,
                            HI_USERNAME: `${translator.getStr('Hello_mail')}`,
                            TEXT1: translator.getStr('vendor_mail_forgotpass_line1_1'),
                            TEXT2: translator.getStr('vendor_mail_forgotpass_line3_1'),
                            TEMP_PASSWORD: `${translator.getStr('vendor_mail_forgotpass_line2_1')} ${temp_password}`,

                            COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${resultfind.companyname}`,
                            COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${resultfind.companycode}`,
                        };
                        let tmp_subject = `${resultfind.companyname} ${translator.getStr('vendor_mail_forgotpass_subject')}`;
                        var template = handlebars.compile(data);
                        var HtmlData = await template(emailTmp);
                        let tenant_smtp_security = config.tenants.tenant_smtp_security == "Yes" || config.tenants.tenant_smtp_security == "YES" || config.tenants.tenant_smtp_security == "yes" ? true : false;
                        let mailsend = await sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, find_one_vendor.useremail, tmp_subject, HtmlData,
                            config.tenants.tenant_smtp_server, config.tenants.tenant_smtp_port, config.tenants.tenant_smtp_reply_to_mail, config.tenants.tenant_smtp_password, config.tenants.tenant_smtp_timeout,
                            tenant_smtp_security);
                        if (mailsend) {
                            res.send({ message: translator.getStr('CheckMailForgotPassword'), status: true, update_user: update_user });
                        } else {
                            res.send({ message: translator.getStr('CompanyNotFound'), status: false });
                        }
                    }
                } catch (e) {
                    console.log("e", e);
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                } finally {
                    connection_db_api.close();
                }
            }
        });
    });
    /* var decodedToken = common.decodedJWT(req.headers.authorization);
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
                res.send({ message: translator.getStr('Logout'), data: save_logout, status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    } */
};

module.exports.sendUserPassword = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
            let UserData = await userConnection.findOne({ _id: decodedToken.UserData._id });
            if (UserData == null) {
                res.send({ message: translator.getStr('UserNotFound'), status: false });
            } else {
                let update_user = await userConnection.updateOne({ _id: decodedToken.UserData._id }, { password: common.generateHash(requestObject.password), useris_password_temp: true });
                const data = await fs.readFileSync('./controller/emailtemplates/resetPassword.html', 'utf8');
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
                    TEMP_PASSWORD: `${translator.getStr('EmailResetPasswordTempPassword')} ${requestObject.password}`,

                    // COMPANYNAME: `${translator.getStr('EmailAppInvitationCompanyName')} ${company_data.companyname}`,
                    // COMPANYCODE: `${translator.getStr('EmailAppInvitationCompanyCode')} ${company_data.companycode}`,
                };
                var template = handlebars.compile(data);
                var HtmlData = await template(emailTmp);
                let mailsend = await sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, [UserData.useremail], "Rovuk Forgot Password", HtmlData,
                    talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail, talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout,
                    talnate_data.tenant_smtp_security);
                if (mailsend) {
                    res.send({ message: translator.getStr('CheckMailNewPassword'), status: true, update_user: update_user });
                } else {
                    res.send({ message: translator.getStr('CompanyNotFound'), status: false });
                }
            }
        } catch (e) {
            console.log("error:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getCompanySetting = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    DB.findOne(superadminCollection.TENANTS, { companycode: requestObject.companycode }, async function (err, result) {
        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            let connection_db_api;
            try {
                connection_db_api = await db_connection.connection_db_api(result);
                let settingConnection = connection_db_api.model(collectionConstant.SETTINGS, settingSchema);
                let get_setting = await settingConnection.findOne();
                if (get_setting) {
                    res.send({ message: translator.getStr('CompanySetting'), data: get_setting.settings, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } catch (e) {
                console.log("-----", e);
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            } finally {
                //connection_db_api.close()
            }
        }
    });
};

module.exports.sendSupplierOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let connection_db_api;
    try {
        var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode });
        let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode });
        connection_db_api = await db_connection.connection_db_api(talnate_data);

        let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);
        let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
        if (one_user) {
            let emailOTPConnection = connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);
            let sixdidgitnumber = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);

            requestObject.sent_on = Math.round(new Date().getTime() / 1000);
            requestObject.user_id = one_user._id;
            requestObject.otp = sixdidgitnumber;
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

                    COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                    COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                };
                const file_data = fs.readFileSync('./controller/emailtemplates/emailOTP.html', 'utf8');
                var template = handlebars.compile(file_data);
                var HtmlData = await template(emailTmp);
                let mailsend = await sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, [requestObject.useremail], "OTP Verification", HtmlData,
                    talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                    talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);
                res.send({ message: 'One Time Password (OTP) sent successfully.', status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } else {
            res.send({ message: translator.getStr('UserNotFound'), status: false });
        }
    } catch (e) {
        console.log("-----", e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        //connection_db_api.close()
    }
};

module.exports.submitEmailOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let connection_db_api;
    try {
        var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode });
        let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode });
        connection_db_api = await db_connection.connection_db_api(talnate_data);

        let emailOTPConnection = connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);
        let roleConnection = connection_db_api.model(collectionConstant.SUPPLIER_ROLE, roleSchema);
        let userConnection = connection_db_api.model(collectionConstant.USER, userSchema);

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
                                from: collectionConstant.SUPPLIER_ROLE,
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
                    //console.log("resObject", resObject)
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
                    // res.send({ message: translator.getStr('UserListing'), data: resLast, status: true });



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
    } finally {
        //connection_db_api.close()
    }
};
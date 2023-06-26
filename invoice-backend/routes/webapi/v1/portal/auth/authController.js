var settingSchema = require('./../../../../../model/settings');
var userSchema = require('./../../../../../model/user');
var languageSchema = require('./../../../../../model/language');
var invoiceRoleSchema = require('./../../../../../model/invoice_roles');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var loginHistorySchema = require('./../../../../../model/loginHistory');
var emailOTPSchema = require('./../../../../../model/email_otp');
let rest_Api = require('./../../../../../config/db_rest_api');
var roleSchema = require('./../../../../../model/diversity_roles');
var view_capture_Schema = require('./../../../../../model/view_capture');
var companySchema = require('../../../../../model/company');
var tenantSchema = require('../../../../../model/tenants');

module.exports.login = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language(req.headers.language);
    DB.findOne(collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode }, function (err, resultfind) {
        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            requestObject.useremail = requestObject.useremail.toLowerCase();
            if (resultfind != null) {
                DB.findOne(collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode }, async function (err, result) {
                    if (err) {
                        res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                    } else {
                        let connection_db_api;
                        try {

                            if (result) {
                                connection_db_api = await db_connection.connection_db_api(result);
                                let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                                let roleConnection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
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
                                            from: collectionConstant.INVOICE_ROLES,
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
                                    // {
                                    //     $unwind: {
                                    //         path:"$location",
                                    //         preserveNullAndEmptyArrays: true
                                    //     },
                                    // },
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
                                    // let roles_tmp = await roleConnection.findOne({ role_name: 'Admin' });
                                    let roles_tmp = await roleConnection.findOne({ role_id: ObjectID(UserData.userroleId) });
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
                                        res.send({ message: translator.getStr('LoginSuccess'), data: resLast, status: true });
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
                res.send({ message: translator.getStr('CompanyNotFound'), error: err, status: false });
            }
        }
    });
};

module.exports.getProfile = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let one_Compnay = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let one_user = await userConnection.aggregate([
                {
                    $match:
                    {
                        _id: ObjectID(decodedToken.UserData._id),
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
                // {
                //     $unwind: {
                //         path:"$location",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
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
            if (one_user) {
                if (one_user.length > 0) {
                    one_user = one_user[0];
                    let temp_languages = [];
                    let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
                    if (one_user['user_languages']) {
                        for (let i = 0; i < one_user['user_languages'].length; i++) {
                            let language = await lanaguageCollection.findOne({ _id: ObjectID(one_user['user_languages'][i]) }, { name: 1, _id: 1 });
                            temp_languages.push(language.name);
                        }
                    }
                    one_user['user_languages_name'] = temp_languages;
                    let obj = config.PAYROLL_CYCLE.find(o => o.value === Number(one_user['user_payroll_rules']));
                    if (obj == null || obj == undefined || obj == "") {
                        one_user['payroll_cycle_name'] = "";
                    } else {
                        one_user['payroll_cycle_name'] = obj['viewValue'];
                    }
                    var settingConnection = await connection_db_api.model(collectionConstant.INVOICE_SETTING, settingSchema);
                    let roleConnection = await connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
                    let roles_tmp = await roleConnection.findOne({ role_id: ObjectID(one_user.userroleId) });
                    var settings_tmp = await settingConnection.findOne({});
                    var resLast = {
                        UserData: one_user,
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
                        },
                        settings: {},
                        role_permission: [],
                        questions: []
                    };
                    resLast.role_permission = roles_tmp.role_permission;
                    resLast.settings = settings_tmp.settings;
                    res.send({ message: translator.getStr('UserListing'), data: resLast, status: true });
                } else {
                    res.send({ message: translator.getStr('UserNotFound'), status: false });
                }
            } else {
                res.send({ message: translator.getStr('UserNotFound'), status: false });
            }
        } catch (e) {
            console.log("e:", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            console.log("db close check: mobile get profile");
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.changepassword = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);

    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var requestObject = req.body;
        DB.findOne(collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode }, async function (err, result) {
            if (err) {
                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
            } else {
                let connection_db_api;
                try {
                    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
                    let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);

                    connection_db_api = await db_connection.connection_db_api(result);
                    let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                    let userOne = await userConnection.findOne({ _id: ObjectID(decodedToken.UserData._id), is_delete: 0, userstatus: 1 });
                    if (userOne == null) {
                        res.send({ message: translator.getStr('UserNotFound'), status: false });
                    } else {
                        if (common.validPassword(req.body.oldpassword, userOne.password)) {
                            var passwordHash = await common.generateHash(req.body.password);
                            var updatesuccess = await userConnection.updateOne({ _id: ObjectID(decodedToken.UserData._id) }, { "password": passwordHash, useris_password_temp: false });
                            if (updatesuccess) {
                                let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });
                                let companyUserObj = {
                                    'invoice_user.$.password': passwordHash,
                                };
                                let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(decodedToken.UserData._id) }, { $set: companyUserObj });

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

            let loginHistoryConnection = connection_db_api.model(collectionConstant.INVOICE_LOGINHISTORY, loginHistorySchema);
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
                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                    EMAILTITLE: translator.getStr('EmailLoginTitle'),
                    USERNAME: `${translator.getStr('EmailLoginHello')} ${decodedToken.UserData.userfullname}`,
                    LOGINLOCATION: `${translator.getStr('EmailLoginLoginFromNewDevice')} ${requestObject.location}`,
                    TIME: `${translator.getStr('EmailLoginTime')} ${requestObject.created_date}`,
                    IPADDRESS: `${translator.getStr('EmailLoginIP')} ${requestObject.ip_address}`,
                    MAP_DIV: new handlebars.SafeString(MAP_DIV),
                    IF_NOT_YOU: translator.getStr('EmailLoginIfNotYou'),
                    CHANGE_PASSWORD: translator.getStr('EmailLoginChangePassword'),
                    ANY_QUESTION: translator.getStr('EmailLoginAnyQuestion'),
                    COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                    COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                    COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                };
                const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/loginFromNewDevice.html', 'utf8');
                var template = handlebars.compile(file_data);
                var HtmlData = await template(emailTmp);
                sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, [decodedToken.UserData.useremail], "Login from a new device", HtmlData,
                    talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                    talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);
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

            let loginHistoryConnection = connection_db_api.model(collectionConstant.INVOICE_LOGINHISTORY, loginHistorySchema);
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

module.exports.forgetpassword = async function (req, res) {
    var requestObject = req.body;
    DB.findOne(collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode }, function (err, resultfind) {
        DB.findOne(collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode }, async function (err, resulttanent) {
            if (err) {
                res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
            } else {
                var translator = new common.Language('en');
                let connection_db_api = await db_connection.connection_db_api(resulttanent);
                req.body.useremail = req.body.useremail.toLowerCase();
                let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
                try {
                    let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
                    let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
                    let find_one_vendor = await userConnection.findOne({ useremail: requestObject.useremail });
                    if (find_one_vendor == null) {
                        res.send({ message: translator.getStr('EmailNotExists'), status: false });
                    } else {
                        let temp_password = common.rendomPassword(8);
                        let passwordHash = common.generateHash(temp_password);
                        let update_user = await userConnection.updateOne({ useremail: req.body.useremail }, { password: passwordHash, useris_password_temp: true });
                        if (update_user) {
                            let company_data = await companyConnection.findOne({ companycode: requestObject.companycode });
                            let one_user = await userConnection.findOne({ useremail: req.body.useremail });
                            let companyUserObj = {
                                'invoice_user.$.password': passwordHash,
                            };
                            let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(one_user._id) }, { $set: companyUserObj });

                            const data = await fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/resetPassword.html', 'utf8');
                            let emailTmp = {
                                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                                THANKS: translator.getStr('EmailTemplateThanks'),
                                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                                TITLE: translator.getStr('MailForgotPassword_Title'),
                                HI_USERNAME: translator.getStr('Hello_mail'),
                                TEXT1: translator.getStr('vendor_mail_forgotpass_line1_1'),
                                TEXT2: translator.getStr('vendor_mail_forgotpass_line3_1'),
                                TEMP_PASSWORD: `${translator.getStr('vendor_mail_forgotpass_line2_1')} ${temp_password}`,

                                BUTTON_TEXT: translator.getStr('EmailInvitationLogIn'),
                                LINK: config.SITE_URL + "/login",

                                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${resultfind.companyname}`,
                                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${resultfind.companycode}`,
                            };
                            let tmp_subject = translator.getStr('MailForgotPassword_Subject');
                            var template = handlebars.compile(data);
                            var HtmlData = await template(emailTmp);
                            let tenant_smtp_security = config.smartaccupay_tenants.tenant_smtp_security == "Yes" || config.smartaccupay_tenants.tenant_smtp_security == "YES" || config.smartaccupay_tenants.tenant_smtp_security == "yes" ? true : false;
                            let mailsend = await sendEmail.sendEmail_client(config.smartaccupay_tenants.tenant_smtp_username, find_one_vendor.useremail, tmp_subject, HtmlData,
                                config.smartaccupay_tenants.tenant_smtp_server, config.smartaccupay_tenants.tenant_smtp_port, config.smartaccupay_tenants.tenant_smtp_reply_to_mail, config.smartaccupay_tenants.tenant_smtp_password, config.smartaccupay_tenants.tenant_smtp_timeout,
                                tenant_smtp_security);
                            if (mailsend) {
                                res.send({ message: translator.getStr('CheckMailForgotPassword'), status: true, update_user: update_user });
                            } else {
                                res.send({ message: translator.getStr('CompanyNotFound'), status: false });
                            }
                        }
                    }
                } catch (e) {
                    console.log("e", e);
                    res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
                } finally {
                    connection_db_api.close();
                }
            }
        });
    });
};

module.exports.sendUserPassword = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
            let tenantConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);

            let talnate_data = await tenantConnection.findOne({ companycode: decodedToken.companycode });
            let company_data = await companyConnection.findOne({ companycode: decodedToken.companycode });

            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            // let UserData = await userConnection.findOne({ _id: decodedToken.UserData._id });
            let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
            if (one_user == null) {
                res.send({ message: translator.getStr('UserNotFound'), status: false });
            } else {
                var passwordHash = common.generateHash(requestObject.password);
                let update_user = await userConnection.updateOne({ _id: one_user._id }, { password: passwordHash, useris_password_temp: true });
                if (update_user) {
                    let companyUserObj = {
                        'invoice_user.$.password': passwordHash,
                    };
                    let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(company_data._id), 'invoice_user.user_id': ObjectID(one_user._id) }, { $set: companyUserObj });

                    const data = await fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/resetPassword.html', 'utf8');
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE} `,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${config.NUMBERPHONE2} `,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')} `,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                        TITLE: translator.getStr('EmailResetPasswordTitle'),
                        HI_USERNAME: `${translator.getStr('EmailTemplateHi')} ${one_user.username}, `,
                        TEXT1: translator.getStr('EmailResetPasswordText1'),
                        TEXT2: translator.getStr('EmailResetPasswordText2'),
                        TEXT3: translator.getStr('EmailResetPasswordText3'),
                        TEMP_PASSWORD: `${translator.getStr('EmailResetPasswordTempPassword')} ${requestObject.password} `,

                        // COMPANYNAME: `${ translator.getStr('EmailAppInvitationCompanyName') } ${ company_data.companyname } `,
                        // COMPANYCODE: `${ translator.getStr('EmailAppInvitationCompanyCode') } ${ company_data.companycode } `,
                    };
                    var template = handlebars.compile(data);
                    var HtmlData = await template(emailTmp);
                    sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, [requestObject.useremail], "SmartAccuPay Forgot Password", HtmlData,
                        talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail, talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout,
                        talnate_data.tenant_smtp_security);
                    res.send({ message: translator.getStr('CheckMailNewPassword'), status: true, update_user: update_user });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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
    DB.findOne(collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode }, async function (err, result) {
        if (err) {
            res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
        } else {
            let connection_db_api;
            try {
                connection_db_api = await db_connection.connection_db_api(result);
                let settingConnection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingSchema);
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

module.exports.sendOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let connection_db_api;
    try {
        requestObject.useremail = requestObject.useremail.toLowerCase();
        var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: requestObject.companycode });
        let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: requestObject.companycode });
        connection_db_api = await db_connection.connection_db_api(talnate_data);

        let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
        if (one_user) {
            let emailOTPConnection = connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);
            //let sixdidgitnumber = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);
            let sixdidgitnumber = common.generateRandomOTP();
            requestObject.sent_on = Math.round(new Date().getTime() / 1000);
            requestObject.user_id = one_user._id;
            requestObject.otp = sixdidgitnumber;
            console.log("OTP", sixdidgitnumber);
            let send_email_otp = new emailOTPConnection(requestObject);
            let save_email_otp = await send_email_otp.save();
            if (save_email_otp) {
                let emailTmp = {
                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE} `,
                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2} `,
                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')} `,
                    THANKS: translator.getStr('EmailTemplateThanks'),
                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                    COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                    TITLE: 'One Time Password (OTP) verification',
                    LINE1: new handlebars.SafeString(`Your One Time Password(OTP) is<b> ${sixdidgitnumber}</b>.`),
                    LINE2: 'Make sure to enter it in the web browser, since your account can’t be accessed without it.',

                    COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname} `,
                    COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode} `,
                };
                const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/emailOTP.html', 'utf8');
                var template = handlebars.compile(file_data);
                var HtmlData = await template(emailTmp);
                sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, [requestObject.useremail], "OTP Verification", HtmlData,
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

module.exports.submitOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let connection_db_api;
    try {
        requestObject.useremail = requestObject.useremail.toLowerCase();
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

//view capture
module.exports.view_capture = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        try {
            var requestBody = req.body;
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            let view_capture_Connection = await connection_db_api.model(collectionConstant.VIEW_CAPTURE, view_capture_Schema);
            requestBody.update_date = Math.floor(new Date().getTime() / 1000.0);
            requestBody.create_date = Math.floor(new Date().getTime() / 1000.0);
            requestBody.performby_id = decodedToken.UserData._id;

            var add_view_capture = new view_capture_Connection(requestBody);
            var save_view_capture = await add_view_capture.save();
            if (save_view_capture) {
                res.send({ message: "View capture save successfull.", data: save_view_capture, status: true });
            } else {
                res.send({ message: "View capture not save.", status: true });
            }
        }
        catch (error) {
            console.log('error', error);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get view capture
module.exports.get_view_capture = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        try {

            var requestBody = req.body;
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            // let tenants_Connection = await connection_db_api.model(collectionConstant.TENANTS, tenant_Schema);

            // if (requestBody._id != "") {
            //     var one_tenant = await tenants_Connection.findOne({ company_id: ObjectID(requestBody._id) });
            //     connection_db_api = await db_connection.connection_db_api(one_tenant);
            // }

            let view_capture_Connection = await connection_db_api.model(collectionConstant.VIEW_CAPTURE, view_capture_Schema);

            let perpage = 10;
            let current_page = requestBody.current_page;
            var start = (parseInt(requestBody.current_page) - 1) * perpage;

            var query_where = {};
            var performby_ids = new Array();

            if (requestBody.performby_id.length > 0) {

                if (requestBody.start_date != 0 && requestBody.end_date != 0) {

                    for (let i = 0; i < requestBody.performby_id.length; i++) {
                        performby_ids[i] = ObjectID(requestBody.performby_id[i]);
                    }

                    query_where = {
                        performby_id: { $in: performby_ids },
                        create_date: { $gte: requestBody.start_date, $lte: requestBody.end_date }
                    };

                } else {
                    for (let i = 0; i < requestBody.performby_id.length; i++) {
                        performby_ids[i] = ObjectID(requestBody.performby_id[i]);
                    }
                    query_where = {
                        performby_id: { $in: performby_ids }
                    };
                }

            } else if (requestBody.start_date != 0 && requestBody.end_date != 0) {

                query_where = {
                    create_date: { $gte: requestBody.start_date, $lte: requestBody.end_date }
                };

            }

            let get_view_capture = await view_capture_Connection.aggregate([
                {
                    $match: query_where
                },
                {
                    $lookup: {
                        from: collectionConstant.USER,
                        localField: "performby_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: "$user"
                    }
                },

                {
                    $project: {
                        performby_id: 1,
                        performby: {
                            _id: {
                                $ifNull: [
                                    "$user._id",
                                    ""
                                ]
                            },
                            username: {
                                $ifNull: [
                                    "$user.username",
                                    ""
                                ]
                            },
                            user_picture: {
                                $ifNull: [
                                    "$user.userpicture",
                                    ""
                                ]
                            },
                        },
                        create_date: 1,
                        update_date: 1,
                        module: 1,
                        data_name: 1,
                        action: 1,
                        text: 1,
                        reason: 1,
                        extra: 1,
                        for: 1
                    }
                },
                { $sort: { create_date: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            let count = 0;
            count = await view_capture_Connection.countDocuments(query_where);
            pager = {
                current_page: requestBody.current_page,
                last_page: Math.ceil(count / perpage),
                total_records: count,
            };
            res.send({ status: true, data: get_view_capture, pager: pager });

        } catch (error) {
            console.log(error);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

// Check credentials in company
module.exports.getLoginCompanyList = async function (req, res) {
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        var requestObject = req.body;
        requestObject.useremail = requestObject.useremail.toLowerCase();

        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
        let match = {
            'invoice_user.useremail': requestObject.useremail,
            'invoice_user.userstatus': 1,
            'invoice_user.is_delete': 0,
        };
        var get_company = await companyConnection.find(match);
        var data = [];
        for (let i = 0; i < get_company.length; i++) {
            let user = get_company[i].invoice_user.find(o => o.useremail === requestObject.useremail);
            if (user) {
                var psss_tnp = await common.validPassword(requestObject.password, user.password);
                if (psss_tnp && user.userstatus == 1 && user.is_delete == 0) {
                    data.push(get_company[i]);
                }
            }
        }
        console.log("data.length", data.length);
        if (data.length == 0) {
            res.send({ message: 'Invalid username or password', status: false });
        } else if (data.length == 1) {
            var get_tenants = await tenantsConnection.findOne({ company_id: data[0]._id });
            let connection_db_api = await db_connection.connection_db_api(get_tenants);
            if (get_tenants) {
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
                    // {
                    //     $unwind: {
                    //         path:"$location",
                    //         preserveNullAndEmptyArrays: true
                    //     },
                    // },
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
                    "DB_HOST": get_tenants.DB_HOST,
                    "DB_NAME": get_tenants.DB_NAME,
                    "DB_PORT": get_tenants.DB_PORT,
                    "DB_USERNAME": get_tenants.DB_USERNAME,
                    "DB_PASSWORD": get_tenants.DB_PASSWORD,
                    "companycode": get_tenants.companycode,
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
                    companydata: data[0]
                };
                var token = await common.generateJWT(resObject);
                resLast.token = token;
                resLast.role_permission = roles_tmp.role_permission;
                res.send({ message: translator.getStr('LoginSuccess'), status: true, data, user_data: resLast });
            } else {
                res.send({ message: translator.getStr('UserNotFound'), status: false });
            }
        } else {
            res.send({ message: translator.getStr('CompanyListing'), status: true, data });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), status: false });
    } finally {
        // connection_db_api.close();
    }
};

module.exports.sendEmailOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        requestObject.useremail = requestObject.useremail.toLowerCase();
        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);

        var get_company = await companyConnection.find({ 'invoice_user.useremail': requestObject.useremail });
        if (get_company.length === 0) {
            res.send({ message: translator.getStr('UserNotFound'), status: false });
        } else {
            let emailOTPConnection = admin_connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);
            //let sixdidgitnumber = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);
            let sixdidgitnumber = common.generateRandomOTP();
            requestObject.sent_on = Math.round(new Date().getTime() / 1000);
            requestObject.otp = sixdidgitnumber;
            console.log("OTP", sixdidgitnumber);
            let send_email_otp = new emailOTPConnection(requestObject);
            let save_email_otp = await send_email_otp.save();
            if (save_email_otp) {
                let emailTmp = {
                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE} `,
                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2} `,
                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')} `,
                    THANKS: translator.getStr('EmailTemplateThanks'),
                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                    COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                    TITLE: 'One Time Password (OTP) verification',
                    LINE1: new handlebars.SafeString(`Your One Time Password(OTP) is <b> ${sixdidgitnumber}</b>`),
                    LINE2: 'Make sure to enter it in the web browser, since your account can’t be accessed without it.',

                    COMPANYNAME: ``,
                    COMPANYCODE: ``,
                };
                const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/emailOTP.html', 'utf8');
                var template = handlebars.compile(file_data);
                var HtmlData = await template(emailTmp);
                sendEmail.sendEmail_client(config.smartaccupay_tenants.tenant_smtp_username, [requestObject.useremail], "OTP Verification", HtmlData,
                    config.smartaccupay_tenants.tenant_smtp_server, config.smartaccupay_tenants.tenant_smtp_port, config.smartaccupay_tenants.tenant_smtp_reply_to_mail,
                    config.smartaccupay_tenants.tenant_smtp_password, config.smartaccupay_tenants.tenant_smtp_timeout, config.smartaccupay_tenants.tenant_smtp_security);
                res.send({ message: 'One Time Password (OTP) sent successfully.', status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        }
    } catch (e) {
        console.log("-----", e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

module.exports.submitEmailOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        requestObject.useremail = requestObject.useremail.toLowerCase();
        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
        let emailOTPConnection = admin_connection_db_api.model(collectionConstant.EMAIL_OTP, emailOTPSchema);

        var get_company = await companyConnection.find({ 'invoice_user.useremail': requestObject.useremail });
        if (get_company.length === 0) {
            res.send({ message: translator.getStr('UserNotFound'), status: false });
        } else {
            let get_otp = await emailOTPConnection.findOne({ useremail: requestObject.useremail, is_delete: 0 }).sort({ sent_on: -1 });
            if (get_otp) {
                if (get_otp.otp == requestObject.otp) {
                    await emailOTPConnection.updateMany({ useremail: requestObject.useremail }, { is_delete: 1 });

                    if (get_company.length == 1) {
                        var get_tenants = await tenantsConnection.findOne({ company_id: get_company[0]._id });
                        let connection_db_api = await db_connection.connection_db_api(get_tenants);
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
                            // {
                            //     $unwind: {
                            //         path:"$location",
                            //         preserveNullAndEmptyArrays: true
                            //     },
                            // },
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
                            "DB_HOST": get_tenants.DB_HOST,
                            "DB_NAME": get_tenants.DB_NAME,
                            "DB_PORT": get_tenants.DB_PORT,
                            "DB_USERNAME": get_tenants.DB_USERNAME,
                            "DB_PASSWORD": get_tenants.DB_PASSWORD,
                            "companycode": get_tenants.companycode,
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
                            companydata: get_company[0]
                        };
                        var token = await common.generateJWT(resObject);
                        resLast.token = token;
                        resLast.role_permission = roles_tmp.role_permission;
                        res.send({ message: translator.getStr('LoginSuccess'), status: true, data: get_company, user_data: resLast });
                    } else {
                        res.send({ message: 'One Time Password (OTP) matched successfully.', data: get_company, status: true });
                    }
                } else {
                    res.send({ message: 'Make sure you entered correct One Time Password (OTP).', status: false });
                }
            } else {
                res.send({ message: 'Make sure you entered correct One Time Password (OTP).', status: false });
            }
        }
    } catch (e) {
        console.log("-----", e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

module.exports.loginWithEmailOTP = async function (req, res) {
    var requestObject = req.body;
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        requestObject.useremail = requestObject.useremail.toLowerCase();
        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);

        var get_company = await companyConnection.findOne({ _id: requestObject._id });
        if (get_company) {
            var get_tenants = await tenantsConnection.findOne({ company_id: get_company._id });
            let connection_db_api = await db_connection.connection_db_api(get_tenants);
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
                // {
                //     $unwind: {
                //         path:"$location",
                //         preserveNullAndEmptyArrays: true
                //     },
                // },
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
                "DB_HOST": get_tenants.DB_HOST,
                "DB_NAME": get_tenants.DB_NAME,
                "DB_PORT": get_tenants.DB_PORT,
                "DB_USERNAME": get_tenants.DB_USERNAME,
                "DB_PASSWORD": get_tenants.DB_PASSWORD,
                "companycode": get_tenants.companycode,
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
                companydata: get_company
            };
            var token = await common.generateJWT(resObject);
            resLast.token = token;
            resLast.role_permission = roles_tmp.role_permission;
            res.send({ message: translator.getStr('LoginSuccess'), status: true, data: get_company, user_data: resLast });
        } else {
            res.send({ message: translator.getStr('UserNotFound'), status: false });
        }
    } catch (e) {
        console.log("-----", e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        admin_connection_db_api.close();
    }
};

module.exports.emailForgotPassword = async function (req, res) {
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        var requestObject = req.body;
        requestObject.useremail = requestObject.useremail.toLowerCase();

        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
        let match = {
            'invoice_user.useremail': requestObject.useremail,
            'invoice_user.userstatus': 1,
            'invoice_user.is_delete': 0,
        };
        var get_company = await companyConnection.find(match);
        var data = [];
        for (let i = 0; i < get_company.length; i++) {
            let user = get_company[i].invoice_user.find(o => o.useremail === requestObject.useremail);
            if (user) {
                data.push(get_company[i]);
                /* var psss_tnp = await common.validPassword(requestObject.password, user.password);
                console.log("psss_tnp", psss_tnp);
                console.log("user", user);
                if (psss_tnp && user.userstatus == 1 && user.is_delete == 0) {
                    data.push(get_company[i]);
                } */
            }
        }
        if (data.length == 1) {
            var get_tenants = await tenantsConnection.findOne({ company_id: data[0]._id });
            let connection_db_api = await db_connection.connection_db_api(get_tenants);
            let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);

            let temp_password = common.rendomPassword(8);
            let passwordHash = common.generateHash(temp_password);

            let update_user = await userConnection.updateOne({ useremail: requestObject.useremail }, { password: passwordHash, useris_password_temp: true });
            if (update_user) {
                let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
                let companyUserObj = {
                    'invoice_user.$.password': passwordHash,
                };
                let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(data[0]._id), 'invoice_user.user_id': ObjectID(one_user._id) }, { $set: companyUserObj });

                const data = await fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/resetPassword.html', 'utf8');
                let emailTmp = {
                    HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE} `,
                    SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2} `,
                    ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')} `,
                    THANKS: translator.getStr('EmailTemplateThanks'),
                    ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                    COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                    TITLE: translator.getStr('MailForgotPassword_Title'),
                    HI_USERNAME: translator.getStr('Hello_mail'),
                    TEXT1: translator.getStr('vendor_mail_forgotpass_line1_1'),
                    TEXT2: translator.getStr('vendor_mail_forgotpass_line3_1'),
                    TEMP_PASSWORD: `${translator.getStr('vendor_mail_forgotpass_line2_1')} ${temp_password} `,

                    BUTTON_TEXT: translator.getStr('EmailInvitationLogIn'),
                    LINK: config.SITE_URL + "/login",

                    COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${data[0].companyname} `,
                    COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${data[0].companycode} `,
                };
                let tmp_subject = translator.getStr('MailForgotPassword_Subject');
                var template = handlebars.compile(data);
                var HtmlData = await template(emailTmp);
                let tenant_smtp_security = config.smartaccupay_tenants.tenant_smtp_security == "Yes" || config.smartaccupay_tenants.tenant_smtp_security == "YES" || config.smartaccupay_tenants.tenant_smtp_security == "yes" ? true : false;
                sendEmail.sendEmail_client(config.smartaccupay_tenants.tenant_smtp_username, one_user.useremail, tmp_subject, HtmlData,
                    config.smartaccupay_tenants.tenant_smtp_server, config.smartaccupay_tenants.tenant_smtp_port, config.smartaccupay_tenants.tenant_smtp_reply_to_mail, config.smartaccupay_tenants.tenant_smtp_password, config.smartaccupay_tenants.tenant_smtp_timeout,
                    tenant_smtp_security);
                res.send({ message: translator.getStr('CheckMailForgotPassword'), status: true, data: data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } else {
            res.send({ message: translator.getStr('CompanyListing'), status: true, data: data });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
    } finally {
        // connection_db_api.close();
    }
};

module.exports.sendEmailForgotPassword = async function (req, res) {
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        var requestObject = req.body;
        requestObject.useremail = requestObject.useremail.toLowerCase();

        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
        let match = {
            'invoice_user.useremail': requestObject.useremail,
            'invoice_user.userstatus': 1,
            'invoice_user.is_delete': 0,
        };
        var get_company = await companyConnection.findOne({ _id: ObjectID(requestObject._id) });
        var get_tenants = await tenantsConnection.findOne({ company_id: get_company._id });
        let connection_db_api = await db_connection.connection_db_api(get_tenants);
        let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);

        let temp_password = common.rendomPassword(8);
        let passwordHash = common.generateHash(temp_password);

        let update_user = await userConnection.updateOne({ useremail: requestObject.useremail }, { password: passwordHash, useris_password_temp: true });
        if (update_user) {
            let one_user = await userConnection.findOne({ useremail: requestObject.useremail });
            let companyUserObj = {
                'invoice_user.$.password': passwordHash,
            };
            let update_invoice_user = await companyConnection.updateOne({ _id: ObjectID(get_company._id), 'invoice_user.user_id': ObjectID(one_user._id) }, { $set: companyUserObj });

            const data = await fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/resetPassword.html', 'utf8');
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE} `,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2} `,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')} `,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                COPYRIGHTNAME: `${config.COPYRIGHTNAME}`,

                TITLE: translator.getStr('MailForgotPassword_Title'),
                HI_USERNAME: translator.getStr('Hello_mail'),
                TEXT1: translator.getStr('vendor_mail_forgotpass_line1_1'),
                TEXT2: translator.getStr('vendor_mail_forgotpass_line3_1'),
                TEMP_PASSWORD: `${translator.getStr('vendor_mail_forgotpass_line2_1')} ${temp_password} `,

                BUTTON_TEXT: translator.getStr('EmailInvitationLogIn'),
                LINK: config.SITE_URL + "/login",

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${get_company.companyname} `,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${get_company.companycode} `,
            };
            let tmp_subject = translator.getStr('MailForgotPassword_Subject');
            var template = handlebars.compile(data);
            var HtmlData = await template(emailTmp);
            let tenant_smtp_security = config.smartaccupay_tenants.tenant_smtp_security == "Yes" || config.smartaccupay_tenants.tenant_smtp_security == "YES" || config.smartaccupay_tenants.tenant_smtp_security == "yes" ? true : false;
            sendEmail.sendEmail_client(config.smartaccupay_tenants.tenant_smtp_username, one_user.useremail, tmp_subject, HtmlData,
                config.smartaccupay_tenants.tenant_smtp_server, config.smartaccupay_tenants.tenant_smtp_port, config.smartaccupay_tenants.tenant_smtp_reply_to_mail, config.smartaccupay_tenants.tenant_smtp_password, config.smartaccupay_tenants.tenant_smtp_timeout,
                tenant_smtp_security);
            res.send({ message: translator.getStr('CheckMailForgotPassword'), status: true, data: get_company });
        } else {
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), status: false });
    } finally {
        // connection_db_api.close();
    }
};

module.exports.getMyCompanyList = async function (req, res) {
    var translator = new common.Language('en');
    let admin_connection_db_api = await db_connection.connection_db_api(config.ADMIN_CONFIG);
    try {
        var requestObject = req.body;
        requestObject.useremail = requestObject.useremail.toLowerCase();

        let companyConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_COMPANY, companySchema);
        let tenantsConnection = admin_connection_db_api.model(collectionConstant.SUPER_ADMIN_TENANTS, tenantSchema);
        let match = {
            'invoice_user.useremail': requestObject.useremail,
            'invoice_user.userstatus': 1,
            'invoice_user.is_delete': 0,
        };
        var get_company = await companyConnection.find(match);
        var data = [];
        for (let i = 0; i < get_company.length; i++) {
            let user = get_company[i].invoice_user.find(o => o.useremail === requestObject.useremail);
            if (user) {
                if (user.userstatus == 1 && user.is_delete == 0) {
                    data.push(get_company[i]);
                }
            }
        }
        res.send({ message: translator.getStr('CompanyListing'), status: true, data });
    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), status: false });
    } finally {
        // connection_db_api.close();
    }
};

var CronJob = require('cron').CronJob;
var config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let rest_Api = require("../../../../../config/db_rest_api");
var invoiceSchema = require('../../../../../model/invoice');
var invoiceSettingsSchema = require('../../../../../model/settings');
var invoiceRoleSchema = require('../../../../../model/invoice_roles');
var userSchema = require('../../../../../model/user');
var ObjectID = require('mongodb').ObjectID;
var alertController = require('./../alert/alertController');
var fs = require('fs');
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');

setPendingInvoiceCronTime();

module.exports.pendingInvoiceToAssignedToUserCronAPI = async function () {
    setPendingInvoiceCronTime();
};

async function setPendingInvoiceCronTime() {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let All_Compnay = await rest_Api.find(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companystatus: 1 });
        for (const item_new of All_Compnay) {
            let item = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: item_new.companycode });
            let connection_db_api = await db_connection.connection_db_api(item);
            let invoiceSettingsCollection = connection_db_api.model(collectionConstant.INVOICE_SETTING, invoiceSettingsSchema);
            var get_setting = await invoiceSettingsCollection.findOne({});
            var settings = get_setting.settings;
            // Pending Invoice Assigned To
            if (settings.Pending_items) {
                if (settings.Pending_items.setting_status == 'Active') {
                    var tempCron = settings.Pending_items.setting_value.split(" ");
                    if (tempCron.length == 2) {
                        var cronTime = '';
                        if (tempCron[1] == 'hours') {
                            cronTime = `0 */${tempCron[0]} * * *`;
                        } else if (tempCron[1] == 'days') {
                            cronTime = `0 0 */${tempCron[0]} * *`;
                        }
                        // console.log(item_new.companycode, "Pending Invoice Assigned To **************************cronTime ", cronTime);
                        if (cronTime != '') {
                            // '*/1 * * * *'
                            var pendingInvoiceAssignedToCron = new CronJob(cronTime, async function () {
                                pendingInvoiceToAssignedToUserCronFunction(item_new.companycode);
                            });
                            pendingInvoiceAssignedToCron.start();
                        }
                    }
                }
            }

            // Pending Invoice Not Assigned
            if (settings.Invoice_Not_Assigned) {
                if (settings.Invoice_Not_Assigned.setting_status == 'Active') {
                    var tempCron = settings.Invoice_Not_Assigned.setting_value.split(" ");
                    if (tempCron.length == 2) {
                        var cronTime = '';
                        if (tempCron[1] == 'hours') {
                            cronTime = `0 */${tempCron[0]} * * *`;
                        } else if (tempCron[1] == 'days') {
                            cronTime = `0 0 */${tempCron[0]} * *`;
                        }
                        // console.log(item_new.companycode, "Pending Invoice Not Assigned **************************cronTime ", cronTime);
                        if (cronTime != '') {
                            // '*/1 * * * *'
                            var pendingInvoiceNotAssignedToCron = new CronJob(cronTime, async function () {
                                pendingInvoiceNotAssignedToUserCronFunction(item_new.companycode);
                            });
                            pendingInvoiceNotAssignedToCron.start();
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function pendingInvoiceToAssignedToUserCronFunction(companycode) {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let item_new = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: companycode });
        let item = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: companycode });
        let connection_db_api = await db_connection.connection_db_api(item);
        let invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        var translator = new common.Language(item_new.companylanguage);

        var get_data = await invoicesConnection.aggregate([
            { $match: { is_delete: 0, status: 'Pending' } },
            {
                $lookup: {
                    from: collectionConstant.INVOICE_USER,
                    localField: "assign_to",
                    foreignField: "_id",
                    as: "assign_to"
                }
            },
            { $unwind: "$assign_to" },
            {
                $lookup: {
                    from: collectionConstant.INVOICE_VENDOR,
                    localField: "vendor",
                    foreignField: "_id",
                    as: "vendor"
                }
            },
            { $unwind: "$vendor" },
        ]);
        console.log("Pending Invoice Assigned ********************", companycode, "*********", get_data.length);
        const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');

        for (let i = 0; i < get_data.length; i++) {
            let title = 'Invoice Pending to Process';
            let description = `This is a reminder that your Invoice ${get_data[i].invoice} is pending for further process.`;

            // Alert
            let alertObject = {
                user_id: get_data[i].assign_to._id,
                module_name: 'Invoice',
                module_route: { _id: get_data[i]._id },
                notification_title: title,
                notification_description: description,
            };
            alertController.saveAlert(alertObject, connection_db_api);

            // Email
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),

                TITLE: `${title}`,
                TEXT: new handlebars.SafeString(`<h4>${translator.getStr('EmailTemplateHi')} ${get_data[i].assign_to.userfullname},</h4><h4>${description}</h4>
                <h4>The details for your invoice is below:</h4>
                <h4>${translator.getStr('Invoice_History.invoice')}: ${get_data[i].invoice}</h4>
                <h4>${translator.getStr('Invoice_History.vendor')}: ${get_data[i].vendor.vendor_name}</h4>
                <div style="text-align: center;">
                    <a style="background-color: #023E8A;border: #0077bc solid;color: white;padding: 15px 32px;
                                text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 20%;" 
                                target="_blank" href="${config.SITE_URL}/invoice-form?_id=${get_data[i]._id}">View Invoice</a>
                </div>`),

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${item_new.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${item_new.companycode}`,
            };
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, get_data[i].assign_to.useremail, title, HtmlData,
                item.tenant_smtp_server, item.tenant_smtp_port, item.tenant_smtp_reply_to_mail,
                item.tenant_smtp_password, item.tenant_smtp_timeout, item.tenant_smtp_security);
        }
    } catch (e) {
        console.log(e);
    }
}

async function pendingInvoiceNotAssignedToUserCronFunction(companycode) {
    try {
        let connection_MDM_main = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
        let item_new = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: companycode });
        let item = await rest_Api.findOne(connection_MDM_main, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: companycode });
        let connection_db_api = await db_connection.connection_db_api(item);
        let invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
        let invoiceRoleConnection = connection_db_api.model(collectionConstant.INVOICE_ROLES, invoiceRoleSchema);
        let userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
        var translator = new common.Language(item_new.companylanguage);

        var get_data = await invoicesConnection.aggregate([
            { $match: { is_delete: 0, status: 'Pending', assign_to: { $eq: '' } } },
            {
                $lookup: {
                    from: collectionConstant.INVOICE_VENDOR,
                    localField: "vendor",
                    foreignField: "_id",
                    as: "vendor"
                }
            },
            { $unwind: "$vendor" },
        ]);
        let admin_role = await invoiceRoleConnection.findOne({ role_name: 'Admin' });
        var get_admins = await userConnection.find({ userstatus: 1, is_delete: 0, userroleId: ObjectID(admin_role.role_id) });
        console.log("Pending Invoice Not Assigned ********************", companycode, "*********", get_data.length);
        const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/commonEmailTemplate.html', 'utf8');

        for (let i = 0; i < get_data.length; i++) {
            let title = 'Invoice Pending to Assign';
            let description = `This is a reminder that your Invoice ${get_data[i].invoice} is pending and yet not assigned to anybody for further process.`;

            let emailList = [];
            for (let j = 0; j < get_admins.length; j++) {
                // Alert
                let alertObject = {
                    user_id: get_admins[j]._id,
                    module_name: 'Invoice',
                    module_route: { _id: get_data[i]._id },
                    notification_title: title,
                    notification_description: description,
                };
                alertController.saveAlert(alertObject, connection_db_api);
                emailList.push(get_admins[i].useremail);
            }

            // Email
            let emailTmp = {
                HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                THANKS: translator.getStr('EmailTemplateThanks'),
                ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                ROVUK_TEAM_SEC: translator.getStr('EmailTemplateRovukTeamSec'),
                VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),

                TITLE: `${title}`,
                TEXT: new handlebars.SafeString(`<h4>${translator.getStr('EmailTemplateHi')},</h4><h4>${description}</h4>
                <h4>The details for your invoice is below:</h4>
                <h4>${translator.getStr('Invoice_History.invoice')}: ${get_data[i].invoice}</h4>
                <h4>${translator.getStr('Invoice_History.vendor')}: ${get_data[i].vendor.vendor_name}</h4>
                <div style="text-align: center;">
                    <a style="background-color: #023E8A;border: #0077bc solid;color: white;padding: 15px 32px;
                                text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 20%;" 
                                target="_blank" href="${config.SITE_URL}/invoice-form?_id=${get_data[i]._id}">View Invoice</a>
                </div>`),

                COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${item_new.companyname}`,
                COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${item_new.companycode}`,
            };
            var template = handlebars.compile(file_data);
            var HtmlData = await template(emailTmp);
            sendEmail.sendEmail_client(config.tenants.tenant_smtp_username, emailList, title, HtmlData,
                item.tenant_smtp_server, item.tenant_smtp_port, item.tenant_smtp_reply_to_mail,
                item.tenant_smtp_password, item.tenant_smtp_timeout, item.tenant_smtp_security);
        }
    } catch (e) {
        console.log(e);
    }
}
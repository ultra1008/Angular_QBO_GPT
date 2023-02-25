var invoiceSchema = require('../../../../../model/invoice');
var vendorSchema = require('../../../../../model/vendor');
var processInvoiceSchema = require('../../../../../model/process_invoice');
var invoice_history_Schema = require('../../../../../model/history/invoice_history');
var recentActivitySchema = require('../../../../../model/recent_activities');
var settingsSchema = require('../../../../../model/settings');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
var ObjectID = require('mongodb').ObjectID;
let rest_Api = require('./../../../../../config/db_rest_api');
var _ = require('lodash');
var recentActivity = require('./../recent_activity/recentActivityController');
const excel = require("exceljs");
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var fs = require('fs');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');

// save invoice
module.exports.saveInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_invoice) {
                    requestObject.invoice_id = id;
                    addchangeInvoice_History("Update", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Update',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice updated successfully..", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //ivoice save
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let add_invoice = new invoicesConnection(requestObject);
                let save_invoice = await add_invoice.save();
                if (save_invoice) {
                    requestObject.invoice_id = save_invoice._id;
                    addchangeInvoice_History("Insert", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: save_invoice._id,
                        title: `Invoice #${save_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Insert',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice saved successfully.." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//get invoice
module.exports.getInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        due_date: 1,
                        order_date: 1,
                        ship_date: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_packing_slip: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                    }
                },
            ]);
            var get_count = await processInvoiceConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", 'Pending'] }, 1, 0] },
                        complete: { $cond: [{ $eq: ["$status", 'Complete'] }, 1, 0] },
                    }
                },
                {
                    $group: {
                        _id: null,
                        pending: { $sum: "$pending" },
                        complete: { $sum: "$complete" },
                    }
                }
            ]);
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let checkManagement = _.find(company_data.otherstool, function (n) { return n.key == config.MANAGEMENT_KEY; });
            let isManagement = false;
            if (checkManagement) {
                isManagement = true;
            }
            if (get_data) {
                var count = {
                    pending: 0,
                    complete: 0,
                };
                if (get_count) {
                    if (get_count.length == 0) {
                        get_count = {
                            pending: 0,
                            complete: 0,
                        };
                    } else {
                        get_count = get_count[0];
                    }
                    count = {
                        pending: get_count.pending,
                        complete: get_count.complete,
                    };
                }
                res.send({ status: true, message: "Invoice data", data: get_data, is_management: isManagement, count });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//get invoice
module.exports.getInvoiceList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var match_query = { is_delete: 0 };
            if (requestObject.status) {
                match_query = {
                    is_delete: 0,
                    status: requestObject.status
                };
            }
            var get_data = await invoicesConnection.aggregate([
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        due_date: 1,
                        order_date: 1,
                        ship_date: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                    }
                },
            ]);
            var count = get_data.length;
            if (get_data) {
                res.send({ status: true, message: "Invoice data", data: get_data, count });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//get invoice
module.exports.getOneInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                {
                    $project: {
                        assign_to: 1,
                        vendor: "$vendor",
                        vendor_id: 1,
                        customer_id: 1,
                        invoice: 1,
                        p_o: 1,
                        invoice_date: 1,
                        due_date: 1,
                        order_date: 1,
                        ship_date: 1,
                        terms: 1,
                        total: 1,
                        invoice_total: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        cost_code: 1,
                        receiving_date: 1,
                        notes: 1,
                        status: 1,
                        job_number: 1,
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,
                        packing_slip: 1,
                        receiving_slip: 1,
                        badge: 1,
                        gl_account: 1,
                        // invoice_notes: { $elemMatch: { is_delete: 0 } },
                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        invoice_attachments: 1,
                        has_packing_slip: 1,
                        packing_slip_data: 1,
                        packing_slip_notes: {
                            $filter: {
                                input: '$packing_slip_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        packing_slip_attachments: 1,
                        has_po: 1,
                        po_data: 1,
                        po_notes: {
                            $filter: {
                                input: '$po_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        po_attachments: 1,
                        has_quote: 1,
                        quote_data: 1,
                        quote_notes: {
                            $filter: {
                                input: '$quote_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },
                        quote_attachments: 1,
                    }
                },
            ]);
            if (get_data.length > 0) {
                get_data = get_data[0];
            }
            res.send({ status: true, message: "Invoice data", data: get_data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// delete invoice
module.exports.deleteInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            requestObject.is_delete = 1;
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };

                addchangeInvoice_History("Delete", reqObj, decodedToken, get_one.updated_at);

                res.send({ message: "Invoice deleted successfully", status: true, data: update_data });
            }


        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// invoice status update
module.exports.updateInvoiceStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };
                addchangeInvoice_History("Update", reqObj, decodedToken, get_one.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: requestObject.status,
                    action_from: 'Web',
                }, decodedToken);
                res.send({ message: `Invoice ${requestObject.status.toLowerCase()} successfully`, status: true, data: update_data });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//invoice datatable
module.exports.getInvoiceDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var col = [];
            col.push("invoice", "p_o", "packing_slip", "receiving_slip", "", "notes", "status");

            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);

            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';

            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "created_at": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "invoice": new RegExp(requestObject.search.value, 'i') },
                        { "p_o": new RegExp(requestObject.search.value, 'i') },
                        { "packing_slip": new RegExp(requestObject.search.value, 'i') },
                        { "receiving_slip": new RegExp(requestObject.search.value, 'i') },
                        { "notes": new RegExp(requestObject.search.value, 'i') },
                        { "status": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = { is_delete: 0 };
            if (requestObject.status) {
                match_query = {
                    is_delete: 0,
                    status: requestObject.status
                };
            }
            var aggregateQuery = [
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await invoicesConnection.countDocuments(match_query);
            let all_vendors = await invoicesConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });

            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// history function
async function addchangeInvoice_History(action, data, decodedToken, updatedAt) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        let invoice_Histroy_Connection = connection_db_api.model(historyCollectionConstant.INVOICES_HISTORY, invoice_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = updatedAt;
        data.history_created_by = decodedToken.UserData._id;
        var add_invoice_history = new invoice_Histroy_Connection(data);
        var save_invoice_history = await add_invoice_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        connection_db_api.close();
    }
}

module.exports.getInvoiceExcelReport = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    var local_offset = Number(req.headers.local_offset);
    var timezone = req.headers.timezone;
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let email_list = requestObject.email_list;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let talnate_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_TENANTS, { companycode: decodedToken.companycode });
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });

            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let sort = { vendor_name: 1 };
            let vendorQuery = [];
            let query = [];
            if (requestObject.vendor_ids.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.vendor_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.vendor_ids[i]));
                }
                vendorQuery.push({ "_id": { $in: data_Query } });
                query.push({ "vendor": { $in: data_Query } });
            }

            if (requestObject.status.length != 0) {
                query.push({ "status": { $in: requestObject.status } });
            }
            query = query.length == 0 ? {} : { $and: query };

            let date_query = {};
            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_query = { "created_at": { $gte: requestObject.start_date, $lt: requestObject.end_date } };
            }

            let get_invoice = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 }, },
                { $match: query },
                { $match: date_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
                { $sort: sort }
            ]).collation({ locale: "en_US" });
            console.log("sagar.........get_invoice: ", get_invoice.length);
            let workbook = new excel.Workbook();
            let title_tmp = translator.getStr('Invoice_Report_Title');
            let worksheet = workbook.addWorksheet(title_tmp);
            let xlsx_data = [];
            let result = await common.urlToBase64(company_data.companylogo);
            let logo_rovuk = await common.urlToBase64(config.INVOICE_LOGO);
            for (let i = 0; i < get_invoice.length; i++) {
                let invoice = get_invoice[i];
                xlsx_data.push([invoice.assign_to == undefined || invoice.assign_to == null ? '' : invoice.assign_to.userfullname,
                invoice.vendor.vendor_name, invoice.vendor_id, invoice.customer_id, invoice.invoice, invoice.p_o, invoice.invoice_date,
                invoice.due_date, invoice.order_date, invoice.ship_date, invoice.terms == undefined || invoice.terms == null ? '' : invoice.terms.name,
                invoice.total, invoice.invoice_total, invoice.tax_amount, invoice.tax_id, invoice.sub_total, invoice.amount_due,
                invoice.cost_code, invoice.gl_account, invoice.receiving_date, invoice.notes, invoice.status,
                invoice.job_number, invoice.account_number, invoice.discount, invoice.packing_slip, invoice.receiving_slip]);
            }
            let headers = [
                translator.getStr('Invoice_History.assign_to'),
                translator.getStr('Invoice_History.vendor'),
                translator.getStr('Invoice_History.vendor_id'),
                translator.getStr('Invoice_History.customer_id'),
                translator.getStr('Invoice_History.invoice'),
                translator.getStr('Invoice_History.p_o'),
                translator.getStr('Invoice_History.invoice_date'),
                translator.getStr('Invoice_History.due_date'),
                translator.getStr('Invoice_History.order_date'),
                translator.getStr('Invoice_History.ship_date'),
                translator.getStr('Invoice_History.terms'),
                translator.getStr('Invoice_History.total'),
                translator.getStr('Invoice_History.invoice_total'),
                translator.getStr('Invoice_History.tax_amount'),
                translator.getStr('Invoice_History.tax_id'),
                translator.getStr('Invoice_History.sub_total'),
                translator.getStr('Invoice_History.amount_due'),
                translator.getStr('Invoice_History.cost_code'),
                translator.getStr('Invoice_History.gl_account'),
                translator.getStr('Invoice_History.receiving_date'),
                translator.getStr('Invoice_History.notes'),
                translator.getStr('Invoice_History.status'),
                translator.getStr('Invoice_History.job_number'),
                translator.getStr('Invoice_History.account_number'),
                translator.getStr('Invoice_History.discount'),
                translator.getStr('Invoice_History.packing_slip'),
                translator.getStr('Invoice_History.receiving_slip'),
            ];

            let d = new Date();
            let excel_date = common.fullDate_format();

            //compnay logo
            let myLogoImage = workbook.addImage({
                base64: result,
                extension: 'png',
            });
            worksheet.addImage(myLogoImage, "A1:A6");
            worksheet.mergeCells('A1:A6');

            //supplier logo
            let rovukLogoImage = workbook.addImage({
                base64: logo_rovuk,
                extension: 'png',
            });
            worksheet.mergeCells('N1:N6');
            worksheet.addImage(rovukLogoImage, 'N1:N6');

            // Image between text 1
            let titleRowValue1 = worksheet.getCell('B1');
            titleRowValue1.value = `Vendor detailed report`;
            titleRowValue1.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue1.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B1:M3`);

            // Image between text 2
            let titleRowValue2 = worksheet.getCell('B4');
            titleRowValue2.value = `Generated by: ${decodedToken.UserData.userfullname}`;
            titleRowValue2.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue2.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B4:M6`);

            //header design
            let headerRow = worksheet.addRow(headers);
            headerRow.height = 40;
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.eachCell((cell, number) => {
                cell.font = {
                    bold: true,
                    size: 14,
                    color: { argb: "FFFFFFF" }
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {
                        argb: 'FF023E8A'
                    }
                };
            });
            xlsx_data.forEach(d => {
                let row = worksheet.addRow(d);
            });
            worksheet.getColumn(3).width = 20;
            worksheet.addRow([]);
            worksheet.columns.forEach(function (column, i) {
                column.width = 20;
            });

            let footerRow = worksheet.addRow([translator.getStr('XlsxReportGeneratedAt') + excel_date]);
            footerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.mergeCells(`A${footerRow.number}:N${footerRow.number}`);
            const tmpResultExcel = await workbook.xlsx.writeBuffer();

            let vendor = '';
            let status = '';
            let date_range = '';
            if (requestObject.All_Vendors) {
                vendor = `${translator.getStr('EmailExcelVendors')} ${translator.getStr('EmailExcelAllVendors')}`;
            } else {
                termQuery = termQuery.length == 0 ? {} : { $or: termQuery };
                let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
                let all_vendor = await vendorCollection.find(termQuery, { vendor_name: 1 });
                let temp_data = [];
                for (var i = 0; i < all_vendor.length; i++) {
                    temp_data.push(all_vendor[i]['name']);
                }
                vendor = `${translator.getStr('EmailExcelVendors')} ${temp_data.join(", ")}`;
            }

            if (requestObject.All_Status) {
                status = `${translator.getStr('EmailExcelStatus')} ${translator.getStr('EmailExcelAllStatus')}`;
            } else {
                status = `${translator.getStr('EmailExcelStatus')} ${requestObject.status.join(", ")}`;
            }

            if (requestObject.start_date != 0 && requestObject.end_date != 0) {
                date_range = `${translator.getStr('EmailExcelDateRange')} ${common.MMDDYYYY(requestObject.start_date + local_offset)} - ${common.MMDDYYYY(requestObject.end_date + local_offset)}`;
            }

            let companycode = decodedToken.companycode.toLowerCase();
            // let key_url = config.INVOICE_WASABI_PATH + "/invoice/excel_report/invoice_" + new Date().getTime() + ".xlsx";
            let key_url = config.INVOICE_WASABI_PATH + "/invoice/excel_report/invoice.xlsx";
            let PARAMS = {
                Bucket: companycode,
                Key: key_url,
                Body: tmpResultExcel,
                ACL: 'public-read-write'
            };
            const file_data = fs.readFileSync(config.EMAIL_TEMPLATE_PATH + '/controller/emailtemplates/excelReport.html', 'utf8');
            bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                if (err) {
                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                } else {
                    excelUrl = config.wasabisys_url + "/" + companycode + "/" + key_url;
                    console.log("invoice excelUrl", excelUrl);
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),

                        EMAILTITLE: `${translator.getStr('EmailInvoiceReportTitle')}`,
                        TEXT1: translator.getStr('EmailInvoiceReportText1'),
                        TEXT2: translator.getStr('EmailInvoiceReportText2'),

                        FILE_LINK: excelUrl,

                        SELECTION: new handlebars.SafeString(`<h4>${vendor}</h4><h4>${status}</h4>`),

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    let mailsend = await sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, email_list, translator.getStr('Invoice_Report_Title'), HtmlData,
                        talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                        talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);
                    console.log("mailsend: ", mailsend);
                    res.send({ message: translator.getStr('Report_Sent_Successfully'), status: true });
                }
            });
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

module.exports.getOrphanDocuments = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoiceConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var one_invoice = await invoiceConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
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
            if (one_invoice) {
                if (one_invoice.length > 0) {
                    one_invoice = one_invoice[0];
                }
                let query = {
                    status: 'Process',
                    document_type: { $ne: 'INVOICE' },
                    "process_data.document_pages.fields.VENDOR_NAME": { $regex: one_invoice.vendor.vendor_name, $options: 'i' },
                    "process_data.document_pages.fields.INVOICE_NUMBER": { $regex: one_invoice.invoice, $options: 'i' },
                    // "process_data.document_pages.fields.VENDOR_NAME": /CN SOLUTIONS GROUP LLc/i
                };
                let get_process = await processInvoiceConnection.find(query);
                res.send({ status: true, message: "Invoice data", data: get_process });
            } else {
                res.send({ message: translator.getStr('NoDataWithId'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Orphan Document
module.exports.getOrphanDocumentsDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var settingsConnection = connection_db_api.model(collectionConstant.INVOICE_SETTING, settingsSchema);
            let one_settings = await settingsConnection.findOne({});
            let settings = one_settings.settings.Document_View;
            var col = [];
            col.push("document_type", "po_no", "invoice_no", "vendor_name");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "document_type": 1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "document_type": new RegExp(requestObject.search.value, 'i') },
                        { "po_no": new RegExp(requestObject.search.value, 'i') },
                        { "invoice_no": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_name": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = {
                is_delete: 0,
                status: { $eq: 'Process' }
            };
            let date_query = {};
            // settings.setting_value->created_at
            // settings.setting_status == 'Active'
            if (requestObject.view_option) {
                match_query.created_at = { $gte: Number(settings.setting_value) };
            } else {
                match_query.created_at = { $lte: Number(settings.setting_value) };
                date_query = { created_at: { $lte: Number(settings.setting_value) } };
            }
            console.log("match_query: ", match_query);
            var aggregateQuery = [
                { $match: match_query },
                // { $match: date_query },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                    }
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await processInvoiceConnection.countDocuments(match_query);
            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                let vendorName = '';
                if (vendor.status) {
                    vendorName = vendor.data.vendor_name;
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// View Document
module.exports.getViewDocumentsDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var col = [];
            col.push("document_type", "po_no", "invoice_no", "vendor_name");
            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);
            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';
            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "document_type": 1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "document_type": new RegExp(requestObject.search.value, 'i') },
                        { "po_no": new RegExp(requestObject.search.value, 'i') },
                        { "invoice_no": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_name": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }
            var match_query = { is_delete: 0, status: { $ne: 'Complete' } };
            var aggregateQuery = [
                { $match: match_query },
                {
                    $project: {
                        document_type: {
                            $cond: [
                                { $eq: ["$status", 'Already Exists'] },
                                'Already Exists', "$document_type"
                            ]
                        },
                        po_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.p_o',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.po_number', ''
                                    ]
                                }
                            ]
                        },
                        invoice_no: {
                            $cond: [
                                { $eq: ["$document_type", 'INVOICE'] },
                                '$data.invoice',
                                {
                                    $cond: [
                                        { $in: ['$document_type', ['PACKING_SLIP', 'RECEIVING_SLIP', 'UNKNOWN']] },
                                        '$data.invoice_number',
                                        {
                                            $cond: [
                                                { $eq: ["$document_type", 'UNKNOWN'] },
                                                '$data.invoice_no', ''
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                        data_vendor_id: '$data.vendor',
                        status: 1,
                        process_data: 1,
                        data: 1,
                        pdf_url: 1,
                    }
                },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await processInvoiceConnection.countDocuments(match_query);
            let all_vendors = await processInvoiceConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
            for (let i = 0; i < all_vendors.length; i++) {
                let vendor = await getOneVendor(connection_db_api, all_vendors[i]['data_vendor_id']);
                let vendorName = '';
                if (vendor.status) {
                    vendorName = vendor.data.vendor_name;
                }
                all_vendors[i] = {
                    ...all_vendors[i],
                    vendor_name: vendorName,
                };
            }
            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = requestObject.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (requestObject.search.value) ? all_vendors.length : count;
            res.json(dataResponce);
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete view Document
module.exports.deleteViewDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var update_data = await processInvoiceConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                res.send({ message: "Document deleted successfully", status: true, data: update_data });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

function getOneVendor(connection_db_api, id) {
    return new Promise(async function (resolve, reject) {
        if (id == '') {
            resolve({ status: false });
        } else {
            let vendorCollection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            let get_vendor = await vendorCollection.findOne({ _id: ObjectID(id) });
            if (get_vendor) {
                resolve({ status: true, data: get_vendor });
            } else {
                resolve({ status: false });
            }
        }
    });
};

module.exports.getInvoiceHistoryLog = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let perpage = 10;
            if (requestObject.start) { } else {
                requestObject.start = 0;
            }
            let start = requestObject.start == 0 ? 0 : perpage * requestObject.start;
            var recentActivityConnection = connection_db_api.model(collectionConstant.INVOICE_RECENT_ACTIVITY, recentActivitySchema);
            let get_data = await recentActivityConnection.aggregate([
                { $match: { module: 'Invoice', data_id: ObjectID(requestObject._id) } },
                /*  {
                     $lookup: {
                         from: collectionConstant.INVOICE,
                         localField: "data_id",
                         foreignField: "_id",
                         as: "invoice"
                     }
                 },
                 { $unwind: "$invoice" }, */
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                { $sort: { created_at: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            res.send({ data: get_data, status: true });
        } catch (e) {
            console.log("e", e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

// Save Invoice Notes
module.exports.saveInvoiceNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Update Note',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { invoice_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Invoice',
                        action: 'Insert Note',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Invoice note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete Invoice Notes
module.exports.deleteInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: 'Delete Note',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Invoice note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Update Invoice Attachment
module.exports.saveInvoiceAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Invoice',
                    action: 'Update Attachment',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Invoice attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Save Packing Slip Notes
module.exports.savePackingSlipNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "packing_slip_notes._id": id }, { $set: { "packing_slip_notes.$.updated_by": decodedToken.UserData._id, "packing_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "packing_slip_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Packing Slip',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Packing slip note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { packing_slip_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Packing Slip',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Packing slip note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete Packing Slip Notes
module.exports.deletePackingSlipNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "packing_slip_notes._id": id }, { $set: { "packing_slip_notes.$.updated_by": decodedToken.UserData._id, "packing_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "packing_slip_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Packing Slip Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Packing Slip',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Packing slip note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Update Packing Slip Attachment
module.exports.savePackingSlipAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Packing Slip Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Packing Slip',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Packing slip attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Save Receiving Slip Notes
module.exports.saveReceivingSlipNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "receiving_slip_notes._id": id }, { $set: { "receiving_slip_notes.$.updated_by": decodedToken.UserData._id, "receiving_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "receiving_slip_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Receiving Slip',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Receiving slip note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { receiving_slip_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Receiving Slip',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Receiving slip note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete Receiving Slip Notes
module.exports.deleteReceivingSlipNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "receiving_slip_notes._id": id }, { $set: { "receiving_slip_notes.$.updated_by": decodedToken.UserData._id, "receiving_slip_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "receiving_slip_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Receiving Slip Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Receiving Slip',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Receiving slip note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Update Receiving Slip Attachment
module.exports.saveReceivingSlipAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Receiving Slip Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Receiving Slip',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Receiving slip attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Save PO Notes
module.exports.savePONotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "po_notes.$.updated_by": decodedToken.UserData._id, "po_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "po_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update PO Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'PO',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "PO note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { po_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert PO Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'PO',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "PO note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete PO Notes
module.exports.deletePONote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "po_notes._id": id }, { $set: { "po_notes.$.updated_by": decodedToken.UserData._id, "po_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "po_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete PO Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'PO',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "PO note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Update PO Attachment
module.exports.savePOAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update PO Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'PO',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "PO attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Save Quote Notes
module.exports.saveQuoteNotes = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "quote_notes.$.updated_by": decodedToken.UserData._id, "quote_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "quote_notes.$.notes": requestObject.notes } });
                let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (update_invoice) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Update Quote Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${get_invoice.invoice}`,
                        module: 'Quote',
                        action: 'Update Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Quote note updated successfully.", data: update_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_invoice_note = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { quote_notes: requestObject } });
                let one_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
                if (save_invoice_note) {
                    requestObject.invoice_id = invoice_id;
                    addchangeInvoice_History("Insert Quote Note", requestObject, decodedToken, requestObject.updated_at);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: invoice_id,
                        title: `Invoice #${one_invoice.invoice}`,
                        module: 'Quote',
                        action: 'Insert Note in',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Quote note saved successfully." });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Delete Quote Notes
module.exports.deleteQuoteNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(invoice_id), "quote_notes._id": id }, { $set: { "quote_notes.$.updated_by": decodedToken.UserData._id, "quote_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "quote_notes.$.is_delete": 1 } });
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_invoice) {
                requestObject.invoice_id = invoice_id;
                addchangeInvoice_History("Delete Quote Note", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: invoice_id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Quote',
                    action: 'Delete Note in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Quote note deleted successfully.", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Update Quote Attachment
module.exports.saveQuoteAttachment = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let get_invoice = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
            let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
            if (update_invoice) {
                requestObject.invoice_id = requestObject._id;
                addchangeInvoice_History("Update Quote Attachment", requestObject, decodedToken, requestObject.updated_at);
                recentActivity.saveRecentActivity({
                    user_id: decodedToken.UserData._id,
                    username: decodedToken.UserData.userfullname,
                    userpicture: decodedToken.UserData.userpicture,
                    data_id: requestObject._id,
                    title: `Invoice #${get_invoice.invoice}`,
                    module: 'Quote',
                    action: 'Update Attachment in',
                    action_from: 'Web',
                }, decodedToken);
                res.send({ status: true, message: "Quote attachment updated successfully..", data: update_invoice });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// Update Related document
module.exports.updateInvoiceRelatedDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var module = requestObject.module;
            delete requestObject.module;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var get_invoice = await invoicesConnection.findOne({ _id: ObjectID(id) });
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
            let reqObj = { invoice_id: id, ...get_one._doc };
            addchangeInvoice_History("Update", reqObj, decodedToken, get_one.updated_at);
            recentActivity.saveRecentActivity({
                user_id: decodedToken.UserData._id,
                username: decodedToken.UserData.userfullname,
                userpicture: decodedToken.UserData.userpicture,
                data_id: id,
                title: `Invoice #${get_invoice.invoice} ${module} Update`,
                module: module,
                action: `Update`,
                action_from: 'Web',
            }, decodedToken);
            res.send({ message: `${module} updated successfully.`, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};
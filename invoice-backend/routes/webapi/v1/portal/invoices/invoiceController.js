var invoice_Schema = require('../../../../../model/invoice');
var processInvoiceSchema = require('../../../../../model/process_invoice');
var invoice_history_Schema = require('../../../../../model/history/invoice_history');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
var ObjectID = require('mongodb').ObjectID;
let rest_Api = require('./../../../../../config/db_rest_api');
var _ = require('lodash');

// save invoice
module.exports.saveInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_invoice = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_invoice) {
                    requestObject.invoice_id = id;
                    addchangeInvoice_History("Update", requestObject, decodedToken, requestObject.updated_at);

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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var get_data = await invoicesConnection.find({ is_delete: 0 });
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
                    if (get_count.length > 0) {
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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            var processInvoiceConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, processInvoiceSchema);
            var match_query = { is_delete: 0 };
            if (requestObject.status) {
                match_query = {
                    is_delete: 0,
                    status: requestObject.status
                };
            }
            var get_data = await invoicesConnection.find(match_query);
            let count = get_data.length;
            var connection_MDM = await rest_Api.connectionMongoDB(config.DB_HOST, config.DB_PORT, config.DB_USERNAME, config.DB_PASSWORD, config.DB_NAME);
            let company_data = await rest_Api.findOne(connection_MDM, collectionConstant.SUPER_ADMIN_COMPANY, { companycode: decodedToken.companycode });
            let checkManagement = _.find(company_data.otherstool, function (n) { return n.key == config.MANAGEMENT_KEY; });
            let isManagement = false;
            if (checkManagement) {
                isManagement = true;
            }
            if (get_data) {
                res.send({ status: true, message: "Invoice data", data: get_data, is_management: isManagement, count });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            }
            /* if (get_data) {
                res.send({ status: true, message: "Invoice data", data: get_data, count });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            } */
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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            var get_data = await invoicesConnection.findOne({ _id: ObjectID(requestObject._id) });
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

            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var update_data = await invoicesConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: "There is no data with this id." });
            } else {
                var get_one = await invoicesConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let reqObj = { invoice_id: id, ...get_one._doc };
                addchangeInvoice_History("Update", reqObj, decodedToken, get_one.updated_at);
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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
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
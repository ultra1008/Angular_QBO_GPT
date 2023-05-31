var invoiceSchema = require('./../../../../../model/invoice');
var invoiceProcessSchema = require('./../../../../../model/process_invoice');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
const _ = require("lodash");
var apInvoiceSchema = require('./../../../../../model/ap_invoices');

//get dashboard count
module.exports.getDashboardCount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoicesProcessConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, invoiceProcessSchema);
            var get_data = await invoicesConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        approved: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                        rejected: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                        late: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
                        "vendor_name": 1,
                        "status": 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        pending_invoices: { $sum: "$pending" },
                        approved_invoices: { $sum: "$approved" },
                        rejected_invoices: { $sum: "$rejected" },
                        late_invoices: { $sum: "$late" },
                    }
                },
            ]);
            let get_process = await invoicesProcessConnection.find({ status: 'Process', is_delete: 0 }).count();
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                    get_data.pending_files = get_process;
                } else {
                    get_data = { _id: null, pending_files: 0, pending_invoices: 0, approved_invoices: 0, rejected_invoices: 0, late_invoices: 0, };
                }
                res.send({ status: true, message: "Invoice data", data: get_data });
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

//panding invoice
module.exports.dashboardInvoiceList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var pending_data = await invoicesConnection.find({ is_delete: 0, status: 'Pending' }).sort({ created_at: -1 }).limit(2);
            // var process_data = await invoicesConnection.find({ is_delete: 0, status: 'Generated' }).sort({ created_at: -1 }).limit(3);
            var cancel_data = await invoicesConnection.find({ is_delete: 0, status: 'Rejected' }).sort({ created_at: -1 }).limit(2);
            let data = {
                pending_invoices: pending_data,
                process_invoices: [],
                cancelled_invoices: cancel_data,
            };
            res.send({ status: true, message: 'Invoice data', data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {

        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.getDashboardChart = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    let local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestObject = req.body;
            /* var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var invoicesProcessConnection = connection_db_api.model(collectionConstant.INVOICE_PROCESS, invoiceProcessSchema);
            var get_data = await invoicesConnection.aggregate([
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        approved: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                        rejected: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                        late: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
                        "vendor_name": 1,
                        "status": 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        pending_invoices: { $sum: "$pending" },
                        approved_invoices: { $sum: "$approved" },
                        rejected_invoices: { $sum: "$rejected" },
                        late_invoices: { $sum: "$late" },
                    }
                },
            ]);
            let get_process = await invoicesProcessConnection.find({ status: 'Complete', document_type: { $ne: 'INVOICE' } }).count();
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                    get_data.pending_files = get_process;
                } else {
                    get_data = { _id: null, pending_files: 0, pending_invoices: 0, approved_invoices: 0, rejected_invoices: 0, late_invoices: 0, };
                }
                res.send({ status: true, message: "Invoice data", data: get_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            } */
            let endOfMonth = moment().clone().endOf('month').unix();
            let epoch = [];
            epoch.push(endOfMonth);
            let currentEpoch = moment().unix();
            let limit = requestObject.data_type == "top" ? 3 : 12;
            for (let i = 0; i < limit; i++) {
                let temp_date = moment(moment.unix(currentEpoch)).startOf('month');
                epoch.push(temp_date.unix());
                currentEpoch = moment(moment.unix(currentEpoch)).subtract(1, 'M').unix();
            }
            // epoch = _(epoch).sort();
            epoch = _.reverse(epoch);
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            let get_invoice = await invoicesConnection.aggregate([
                {
                    $match: {
                        is_delete: 0,
                    }
                },
                {
                    $bucket: {
                        groupBy: "$updated_at",
                        boundaries: epoch,
                        default: "Other",
                        output: {
                            data: {
                                $push: {
                                    status: "$status",
                                }
                            }
                        }
                    }
                },
            ]);
            /* let data = [
              { status: 'Pending', data: [65, 59, 80] }, //February,January,December data
              { status: 'Approve', data: [28, 48, 40] }, //February,January,December data
              { status: 'Reject', data: [48, 48, 48] }, //February,January,December data
          ]; */
            epoch = epoch.slice(0, -1);
            let month = [];
            let pendingList = [];
            let approvedList = [];
            let rejectedList = [];
            epoch.forEach((date) => {
                let found = _.find(get_invoice, ['_id', date]);
                if (found) {
                    let pending = _.filter(found.data, function (o) { return o.status == 'Pending'; });
                    let approved = _.filter(found.data, function (o) { return o.status == 'Approved'; });
                    let rejected = _.filter(found.data, function (o) { return o.status == 'Rejected'; });
                    pendingList.push(pending.length);
                    approvedList.push(approved.length);
                    rejectedList.push(rejected.length);
                    month.push(common.FULL_MONTH(date + local_offset));
                }
            });
            let data = [
                {
                    status: 'Pending',
                    data: pendingList
                },
                {
                    status: 'Approved',
                    data: approvedList
                },
                {
                    status: 'Rejected',
                    data: rejectedList
                },
            ];
            res.send({ month, data, status: true });
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

//panding invoice
module.exports.dashboardInvoiceList = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoiceSchema);
            var pending_data = await invoicesConnection.find({ is_delete: 0, status: 'Pending' }).sort({ created_at: -1 }).limit(2);
            // var process_data = await invoicesConnection.find({ is_delete: 0, status: 'Generated' }).sort({ created_at: -1 }).limit(3);
            var cancel_data = await invoicesConnection.find({ is_delete: 0, status: 'Rejected' }).sort({ created_at: -1 }).limit(2);
            let data = {
                pending_invoices: pending_data,
                process_invoices: [],
                cancelled_invoices: cancel_data,
            };
            res.send(data);
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {

        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

module.exports.countInvoiceStatus = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        try {

            var requestObject = req.body;
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            let match = {};
            match = { is_delete: 0 };
            var get_data = await apInvoiceConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        approved: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                        rejected: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                        late: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
                        on_hold: { $cond: [{ $eq: ["$status", "On Hold"] }, 1, 0] },
                        overdue: { $cond: [{ $eq: ["$status", "Overdue"] }, 1, 0] },

                    }
                },
                {
                    $group: {
                        _id: null,
                        pending_invoices: { $sum: "$pending" },
                        approved_invoices: { $sum: "$approved" },
                        rejected_invoices: { $sum: "$rejected" },
                        late_invoices: { $sum: "$late" },
                        on_hold: { $sum: "$on_hold" },
                        overdue: { $sum: "$overdue" },
                    }
                },
            ]);
            let get_process = await apInvoiceConnection.find({ is_delete: 0 }).count();
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                } else {
                    get_data = { pending_invoices: 0, approved_invoices: 0, rejected_invoices: 0, late_invoices: 0, On_Hold: 0, overdue: 0 };
                }
                res.send({ status: true, message: "Invoice data", data: get_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            }
        }
        catch (e) {
            console.log("e", e);
            res.send({ message: 'SomethingWrong', status: false });
        }

    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//panding  and Rejected invoice list
module.exports.dashboardInvoiceListForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var pending_data = await apInvoiceConnection.find({ is_delete: requestObject.is_delete, status: 'Pending' }).sort({ created_at: -1 }).limit(2);
            var cancel_data = await apInvoiceConnection.find({ is_delete: requestObject.is_delete, status: 'Rejected' }).sort({ created_at: -1 }).limit(2);
            let data = {
                pending_invoices: pending_data,
                process_invoices: [],
                cancelled_invoices: cancel_data,
            };
            if (data) {
                res.send(data);
            }
            else {
                res.send([]);
            }

        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};
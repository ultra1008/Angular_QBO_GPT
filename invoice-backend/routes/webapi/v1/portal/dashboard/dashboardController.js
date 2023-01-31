var invoice_Schema = require('./../../../../../model/invoice');
var invoiceProcessSchema = require('./../../../../../model/process_invoice');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

//get dashboard count

module.exports.getDashboardCount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
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
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            var pending_data = await invoicesConnection.find({ is_delete: 0, status: 'Pending' }).sort({ created_at: -1 }).limit(3);
            // var process_data = await invoicesConnection.find({ is_delete: 0, status: 'Generated' }).sort({ created_at: -1 }).limit(3);
            var cancel_data = await invoicesConnection.find({ is_delete: 0, status: 'Rejected' }).sort({ created_at: -1 }).limit(3);
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
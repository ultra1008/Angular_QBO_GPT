var apInvoiceSchema = require('./../../../../../model/ap_invoices');
var userSchema = require('./../../../../../model/user');
var apInvoiceHistorySchema = require('./../../../../../model/history/ap_invoice_history');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let historyCollectionConstant = require('./../../../../../config/historyCollectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');
var _ = require('lodash');

module.exports.getAPInvoiceForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var get_data = await apInvoiceConnection.aggregate([
                { $match: { is_delete: requestObject.is_delete } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to_data"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                {
                    $unwind: {
                        path: "$vendor_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms",
                        foreignField: "_id",
                        as: "terms_data"
                    }
                },
                {
                    $unwind: {
                        path: "$terms_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "gl_account",
                        foreignField: "_id",
                        as: "gl_account_data"
                    }
                },
                {
                    $unwind: {
                        path: "$gl_account_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "job_client_name",
                        foreignField: "_id",
                        as: "job_client_data"
                    }
                },
                {
                    $unwind: {
                        path: "$job_client_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLASS_NAME,
                        localField: "class_name",
                        foreignField: "_id",
                        as: "class_name_data"
                    }
                },
                {
                    $unwind: {
                        path: "$class_name_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                { $sort: { created_at: -1 } },
            ]);
            if (get_data) {
                res.send(get_data);
            } else {
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

module.exports.getOneAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var get_data = await apInvoiceConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "assign_to",
                        foreignField: "_id",
                        as: "assign_to_data"
                    }
                },
                {
                    $unwind: {
                        path: "$assign_to_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                {
                    $unwind: {
                        path: "$vendor_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms",
                        foreignField: "_id",
                        as: "terms_data"
                    }
                },
                {
                    $unwind: {
                        path: "$terms_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "gl_account",
                        foreignField: "_id",
                        as: "gl_account_data"
                    }
                },
                {
                    $unwind: {
                        path: "$gl_account_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "job_client_name",
                        foreignField: "_id",
                        as: "job_client_data"
                    }
                },
                {
                    $unwind: {
                        path: "$job_client_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLASS_NAME,
                        localField: "class_name",
                        foreignField: "_id",
                        as: "class_name_data"
                    }
                },
                {
                    $unwind: {
                        path: "$class_name_data",
                        preserveNullAndEmptyArrays: true
                    },
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_PO,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "po"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_QUOUTE,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "quote"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_PACKING_SLIP,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "packing_slip"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.AP_RECEIVING_SLIP,
                        localField: "_id",
                        foreignField: "invoice_id",
                        as: "receiving_slip"
                    }
                },
                {
                    $project: {
                        assign_to: 1,
                        assign_to_data: "$assign_to_data",
                        vendor: 1,
                        vendor_data: "$vendor_data",
                        is_quickbooks: 1,
                        vendor_id: 1,
                        customer_id: 1,
                        invoice_no: 1,
                        po_no: 1,
                        packing_slip_no: 1,
                        receiving_slip_no: 1,
                        invoice_date_epoch: 1,
                        due_date_epoch: 1,
                        order_date_epoch: 1,
                        ship_date_epoch: 1,
                        terms: 1,
                        terms_data: "$terms_data",
                        invoice_total_amount: 1,
                        tax_amount: 1,
                        tax_id: 1,
                        sub_total: 1,
                        amount_due: 1,
                        gl_account: 1,
                        gl_account_data: "$gl_account_data",
                        receiving_date_epoch: 1,
                        status: 1,
                        reject_reason: 1,
                        job_client_name: 1,
                        job_client_data: "$job_client_data",
                        class_name: 1,
                        class_name_data: "$class_name_data",
                        delivery_address: 1,
                        contract_number: 1,
                        account_number: 1,
                        discount: 1,
                        pdf_url: 1,
                        items: 1,

                        invoice_notes: {
                            $filter: {
                                input: '$invoice_notes',
                                as: 'note',
                                cond: { $eq: ['$$note.is_delete', 0] }
                            }
                        },

                        document_type: 1,
                        created_by: 1,
                        created_at: 1,
                        updated_by: 1,
                        updated_at: 1,
                        is_delete: 1,

                        notes: 1,
                        supporting_documents: { $concatArrays: ["$po", "$quote", "$packing_slip", "$receiving_slip"] }
                    }
                }
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                if (get_data) {
                    get_data.invoice_notes = await getNotesUserDetails(get_data.invoice_notes, userConnection);
                    get_data.supporting_documents = _.orderBy(get_data.supporting_documents, ['created_at'], ['desc']);
                }
                res.send({ status: true, message: "Invoice Listing", data: get_data });
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
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

function getNotesUserDetails(notes, userConnection) {
    return new Promise(async function (resolve, reject) {
        if (notes) {
            if (notes.length == 0) {
                resolve([]);
            } else {
                let tempData = [];
                for (let i = 0; i < notes.length; i++) {
                    var one_user = await userConnection.findOne({ _id: ObjectID(notes[i].created_by) });
                    tempData.push({
                        ...notes[i],
                        userfullname: one_user.userfullname,
                        usermobile_picture: one_user.usermobile_picture,
                        userpicture: one_user.userpicture,
                    });
                    if (i == notes.length - 1) {
                        resolve(tempData);
                    }
                }
            }
        } else {
            resolve([]);
        }
    });
}

module.exports.saveAPInvoice = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_ap_invoice) {
                    res.send({ status: true, message: "Invoice updated successfully.", data: update_ap_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let add_ap_invoice = new apInvoiceConnection(requestObject);
                let save_ap_invoice = await add_ap_invoice.save();
                if (save_ap_invoice) {
                    res.send({ status: true, message: "Invoice added successfully.", data: save_ap_invoice });
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

// Save Invoice Notes
module.exports.saveAPInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.notes": requestObject.notes } });
                if (update_ap_invoice) {
                    res.send({ status: true, message: "Invoice note updated successfully.", data: update_ap_invoice });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                //save invoice note
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let save_ap_invoice_note = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id) }, { $push: { invoice_notes: requestObject } });
                if (save_ap_invoice_note) {
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
module.exports.deleteAPInvoiceNote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apInvoiceConnection = connection_db_api.model(collectionConstant.AP_INVOICE, apInvoiceSchema);
            var invoice_id = requestObject.invoice_id;
            delete requestObject.invoice_id;
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            let update_ap_invoice = await apInvoiceConnection.updateOne({ _id: ObjectID(invoice_id), "invoice_notes._id": id }, { $set: { "invoice_notes.$.updated_by": decodedToken.UserData._id, "invoice_notes.$.updated_at": Math.round(new Date().getTime() / 1000), "invoice_notes.$.is_delete": 1 } });
            let get_ap_invoice = await apInvoiceConnection.findOne({ _id: ObjectID(invoice_id) });
            if (update_ap_invoice) {
                res.send({ status: true, message: "Invoice note deleted successfully.", data: update_ap_invoice });
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

module.exports.getAPInvoiceHistory = async function (req, res) {
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
            var apInvoiceHistoryConnection = connection_db_api.model(historyCollectionConstant.AP_INVOICE_HISTORY, apInvoiceHistorySchema);
            let get_data = await apInvoiceHistoryConnection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        localField: "invoice_id",
                        foreignField: "_id",
                        as: "invoice"
                    }
                },
                { $unwind: "$invoice" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "history_created_by",
                        foreignField: "_id",
                        as: "history_created_by"
                    }
                },
                { $unwind: "$history_created_by" },
                { $sort: { history_created_at: -1 } },
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
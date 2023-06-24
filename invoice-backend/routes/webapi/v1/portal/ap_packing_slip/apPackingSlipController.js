var apPackingSlipSchema = require('./../../../../../model/ap_packagingslips');
var apOtherDocumentSchema = require('./../../../../../model/ap_other_documents');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var apInvoiceController = require('./../ap_invoice/apInvoiceController');
let config = require('./../../../../../config/config');

module.exports.getAPPackingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);
            var get_data = await apPackingSlipConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Packing Slip Listing", data: get_data });
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

module.exports.getOrphanAPPackingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);

            let start = parseInt(requestObject.start);
            var perpage = parseInt(requestObject.length);

            var columnName = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.field : '';
            var columnOrder = (requestObject.sort != undefined && requestObject.sort != '') ? requestObject.sort.order : '';
            var sort = {};
            sort[columnName] = (columnOrder == 'asc') ? 1 : -1;

            let match = { is_delete: 0, is_orphan: true };
            var query = {
                $or: [
                    { "document_type": new RegExp(requestObject.search, 'i') },
                    { "po_no": new RegExp(requestObject.search, 'i') },
                    { "invoice_no": new RegExp(requestObject.search, 'i') },
                    { "vendor_data.vendor_name": new RegExp(requestObject.search, 'i') },
                    { "updated_by.userfullname": new RegExp(requestObject.search, 'i') },
                ]
            };

            var get_data = await apPackingSlipConnection.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "updated_by",
                        foreignField: "_id",
                        as: "updated_by"
                    }
                },
                { $unwind: "$updated_by" },
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
                { $sort: sort },
                { $match: query },
                { $limit: perpage + start },
                { $skip: start },
            ]).collation({ locale: "en_US" });
            let total_count = await apPackingSlipConnection.find(match).countDocuments();
            let pager = {
                start: start,
                length: perpage,
                total: total_count
            };
            res.send({ status: true, data: get_data, pager });
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

module.exports.getOneAPPackingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);
            var get_data = await apPackingSlipConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
                {
                    $lookup: {
                        from: collectionConstant.AP_INVOICE,
                        localField: "invoice_id",
                        foreignField: "_id",
                        as: "invoice"
                    }
                },
                {
                    $unwind: {
                        path: "$invoice",
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
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                res.send({ status: true, message: "Packing Slip Listing", data: get_data });
            } else {
                res.send({ message: translator.getStr('NoDataWithId'), status: false });
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

module.exports.saveAPPackingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let update_ap_packing_slip = await apPackingSlipConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_ap_packing_slip) {
                    let get_one = await apPackingSlipConnection.findOne({ _id: ObjectID(id) });
                    apInvoiceController.sendInvoiceUpdateAlerts(decodedToken, get_one._id, get_one.invoice_id, config.DOCUMENT_TYPES.packingSlip.name, translator);
                    res.send({ status: true, message: "Packing Slip updated successfully.", data: update_ap_packing_slip });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let add_ap_packing_slip = new apPackingSlipConnection(requestObject);
                let save_ap_packing_slip = await add_ap_packing_slip.save();
                if (save_ap_packing_slip) {
                    apInvoiceController.sendInvoiceUpdateAlerts(decodedToken, save_ap_packing_slip._id, save_ap_packing_slip.invoice_id, config.DOCUMENT_TYPES.packingSlip.name, translator);
                    res.send({ status: true, message: "Packing Slip added successfully.", data: save_ap_packing_slip });
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

module.exports.saveAPOtherDocumentPackingSlip = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apPackingSlipConnection = connection_db_api.model(collectionConstant.AP_PACKING_SLIP, apPackingSlipSchema);
            var apOtherDocumentConnection = connection_db_api.model(collectionConstant.AP_OTHER_DOCUMENT, apOtherDocumentSchema);
            var documentId = requestObject.document_id;
            delete requestObject.document_id;

            requestObject.is_orphan = true;
            requestObject.created_at = Math.round(new Date().getTime() / 1000);
            requestObject.created_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            requestObject.updated_by = decodedToken.UserData._id;
            let add_ap_packing_slip = new apPackingSlipConnection(requestObject);
            let save_ap_packing_slip = await add_ap_packing_slip.save();
            if (save_ap_packing_slip) {
                await apOtherDocumentConnection.updateOne({ _id: ObjectID(documentId) }, { is_delete: 1 });
                res.send({ status: true, message: "Packing Slip added successfully.", data: save_ap_packing_slip });
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
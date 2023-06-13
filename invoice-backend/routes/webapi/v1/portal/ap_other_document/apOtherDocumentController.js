var apOtherDocumentSchema = require('./../../../../../model/ap_other_documents');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var apInvoiceController = require('./../ap_invoice/apInvoiceController');
let config = require('./../../../../../config/config');

module.exports.getAPOtherDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var apOtherDocumentConnection = connection_db_api.model(collectionConstant.AP_OTHER_DOCUMENT, apOtherDocumentSchema);
            var get_data = await apOtherDocumentConnection.aggregate([
                { $match: { is_delete: 0, is_orphan: true } },
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
            ]);
            res.send(get_data);
        } catch (e) {
            console.log(e);
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send([]);
    }
};

module.exports.getOneAPOtherDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apOtherDocumentConnection = connection_db_api.model(collectionConstant.AP_OTHER_DOCUMENT, apOtherDocumentSchema);
            var get_data = await apOtherDocumentConnection.findOne({ _id: ObjectID(requestObject._id) });
            res.send({ status: true, message: "Other Document listing", data: get_data });
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
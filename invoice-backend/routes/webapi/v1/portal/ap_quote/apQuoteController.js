var apQuoteSchema = require('./../../../../../model/ap_quotes');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

module.exports.getAPQuote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var apQuoteConnection = connection_db_api.model(collectionConstant.AP_QUOUTE, apQuoteSchema);
            var get_data = await apQuoteConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Quote Listing", data: get_data });
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

module.exports.getOneAPQuote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apQuoteConnection = connection_db_api.model(collectionConstant.AP_QUOUTE, apQuoteSchema);
            var get_data = await apQuoteConnection.aggregate([
                { $match: { _id: ObjectID(requestObject._id) } },
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
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor",
                        foreignField: "_id",
                        as: "vendor_data"
                    }
                },
                { $unwind: "$vendor_data" },
            ]);
            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                }
                res.send({ status: true, message: "Quote Listing", data: get_data });
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

module.exports.saveAPQuote = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var local_offset = Number(req.headers.local_offset);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var apQuoteConnection = connection_db_api.model(collectionConstant.AP_QUOUTE, apQuoteSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let update_ap_quote = await apQuoteConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_ap_quote) {
                    res.send({ status: true, message: "Quote updated successfully.", data: update_ap_quote });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                let add_ap_quote = new apQuoteConnection(requestObject);
                let save_ap_quote = await add_ap_quote.save();
                if (save_ap_quote) {
                    res.send({ status: true, message: "Quote added successfully.", data: save_ap_quote });
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
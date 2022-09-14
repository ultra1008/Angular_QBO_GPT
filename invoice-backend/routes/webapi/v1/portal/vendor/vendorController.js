var vendor_Schema = require('../../../../../model/vendor');
var vendor_history_Schema = require('../../../../../model/history/vendor_history');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');

let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
const { route } = require('../portal_index');
var ObjectID = require('mongodb').ObjectID;

// save vendor

module.exports.savevendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendor_Schema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                var update_vendor = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_vendor) {
                    requestObject.vendor_data_id = id;
                    addChangevendorHistory("Update", requestObject, decodedToken, requestObject.updated_at);
                    res.send({ status: true, message: "Vendor updated successfully..", data: update_vendor });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                // insert vendor
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                var add_vendor = new vendorConnection(requestObject);
                var save_vendor = await add_vendor.save();

                if (save_vendor) {
                    requestObject.vendor_data_id = save_vendor._id;
                    addChangevendorHistory("Insert", requestObject, decodedToken, requestObject.updated_at);
                    res.send({ status: true, message: "vendor saved successfully.." });
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

//get invoice vendor

module.exports.getvendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);

        try {
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendor_Schema);
            var getdata = await vendorConnection.find({ is_delete: 0 });
            if (getdata) {
                res.send({ status: true, message: "Vendor data", data: getdata });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
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

//delete vendor
module.exports.deletevendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendor_Schema);
            var id = requestObject._id;
            delete requestObject._id;

            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var delete_vendor = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (delete_vendor) {
                var get_one = await vendorConnection.findOne({ _id: ObjectID(id) }, { _id: 0, __v: 0 });
                let req_obj = { vendor_data_id: id, ...get_one._doc };
                if (delete_vendor.nModified == 1) {
                    if (requestObject.is_delete == 1) {
                        addChangevendorHistory("Archive", req_obj, decodedToken, requestObject.updated_at);
                        res.send({ message: "Archive successfully", status: true });
                    } else {
                        addChangevendorHistory("Restore", req_obj, decodedToken, requestObject.updated_at);
                        res.send({ message: "Restore successfully", status: true });
                    }
                } else {
                    res.send({ message: "No data with this id", status: false });

                }
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


//data table for invoice vendor

module.exports.getvendordatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);

        try {
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendor_Schema);
            var col = [];
            var user_id = { is_delete: 0 };
            col.push("vendor_name", "vendor_id", "customer_id", "phone", "email", "address", "attachment", "status");

            var start = parseInt(req.body.start) || 0;
            var perpage = parseInt(req.body.length);

            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';

            var sort = {};
            if (req.body.draw == 1) {
                sort = { "createdAt": -1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;

            }
            let query = {};
            if (req.body.search.value) {
                query = {
                    $or: [
                        { "vendor_name": new RegExp(req.body.search.value, 'i') },
                        { "vendor_id": new RegExp(req.body.search.value, 'i') },
                        { "customer_id": new RegExp(req.body.search.value, 'i') },
                        { "phone": new RegExp(req.body.search.value, 'i') },
                        { "email": new RegExp(req.body.search.value, 'i') },
                        { "address": new RegExp(req.body.search.value, 'i') },
                        { "attachment": new RegExp(req.body.search.value, 'i') },
                        { "status": new RegExp(req.body.search.value, 'i') },
                    ]
                };
            }
            var aggregateQuery = [
                { $match: user_id },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = vendorConnection.countDocuments(user_id);
            let all_vendors = await vendorConnection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotle = count;
            dataResponce.recordsFiltered=(req.body.search.value) ? 
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

// vendor history function

async function addChangevendorHistory(action, data, decodedToken, updated_at) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var vendor_history_connection = connection_db_api.model(historyCollectionConstant.VENDOR_HISTORY, vendor_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = updated_at;
        data.history_created_by = decodedToken.UserData._id;
        var add_vendor_history = new vendor_history_connection(data);
        var save_vendor_history = add_vendor_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        // connection_db_api.close();
    }
}
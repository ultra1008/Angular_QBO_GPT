var vendorSchema = require('../../../../../model/vendor');
var termSchema = require('../../../../../model/invoice_term');
var vendor_history_Schema = require('../../../../../model/history/vendor_history');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
const { route } = require('../portal_index');
const { ObjectId } = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
const _ = require("lodash");
let rest_Api = require('./../../../../../config/db_rest_api');
const excel = require("exceljs");
var handlebars = require('handlebars');
let sendEmail = require('./../../../../../controller/common/sendEmail');
var fs = require('fs');
var bucketOpration = require('../../../../../controller/common/s3-wasabi');
var recentActivity = require('./../recent_activity/recentActivityController');
var QuickBooks = require('node-quickbooks');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

QuickBooks.setOauthVersion('2.0');//set the Oauth version

var qbo; //QuickBooks Info

// save vendor
module.exports.saveVendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            requestObject.vendor_email = requestObject.vendor_email.toLowerCase();
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.vendor_updated_by = decodedToken.UserData._id;
                requestObject.vendor_updated_at = Math.round(new Date().getTime() / 1000);
                let one_vendor = await vendorConnection.findOne({ _id: ObjectID(id) }, { _id: 0, image: 0, attachment: 0, is_delete: 0, created_at: 0, created_by: 0, updated_at: 0, updated_by: 0, __v: 0 });
                var update_vendor = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_vendor) {
                    delete requestObject.vendor_created_at;
                    delete requestObject.vendor_created_by;
                    delete requestObject.vendor_updated_at;
                    delete requestObject.vendor_updated_by;
                    delete requestObject.vendor_is_delete;
                    delete requestObject.vendor_image;
                    delete requestObject.vendor_attachment;

                    if (requestObject.vendor_terms) {
                        requestObject.vendor_terms = ObjectID(requestObject.vendor_terms);
                    }

                    // find difference of object 
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, one_vendor._doc);
                    // Check for object id fields and if it changed then replace id with specific value
                    let found_term = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'vendor_terms'; });
                    if (found_term != -1) {
                        let one_term = await termConnection.findOne({ _id: ObjectID(updatedData[found_term].value) });
                        updatedData[found_term].value = one_term.name;
                    }

                    let found_status = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'vendor_status'; });
                    if (found_status != -1) {
                        if (updatedData[found_status].value == 1) {
                            updatedData[found_status].value = 'Active';
                        } else {
                            updatedData[found_status].value = 'Inactive';
                        }
                    }

                    for (let i = 0; i < updatedData.length; i++) {
                        updatedData[i]['key'] = translator.getStr(`Vendor_History.${updatedData[i]['key']}`);
                    }
                    let histioryObject = {
                        data: updatedData,
                        vendor_id: id,
                    };
                    addVendorHistory("Update", histioryObject, decodedToken);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: id,
                        title: requestObject.vendor_name,
                        module: 'Vendor',
                        action: 'Update',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Vendor updated successfully.", data: update_vendor });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                // insert vendor
                requestObject.vendor_created_by = decodedToken.UserData._id;
                requestObject.vendor_created_at = Math.round(new Date().getTime() / 1000);
                requestObject.vendor_updated_by = decodedToken.UserData._id;
                requestObject.vendor_updated_at = Math.round(new Date().getTime() / 1000);
                if (requestObject.isVendorfromQBO) { // if login QBO in integration tab of settings, the values are saved to QBO vendor.
                    qbo.createVendor({
                        DisplayName: requestObject.vendor_name,
                        CompanyName: requestObject.vendor_name,
                        Active: requestObject.status === 1 ? true : false,
                        PrimaryPhone: { FreeFormNumber: requestObject.vendor_phone },
                        PrimaryEmailAddr: { Address: requestObject.vendor_email },
                        BillAddr: {
                            Line1: requestObject.vendor_address,
                            Line2: requestObject.hasOwnProperty("address2") ? requestObject.vendor_address2 : '',
                            City: requestObject.vendor_city,
                            Country: requestObject.hasOwnProperty("country") ? requestObject.vendor_country : '',
                            CountrySubDivisionCode: requestObject.vendor_state,
                            PostalCode: requestObject.vendor_zipcode
                        },
                        AcctNum: requestObject.gl_account,
                        MetaData: {
                            CreateTime: new Date(),
                            LastUpdatedTime: new Date()
                        }
                    }, async function (err, result) {
                        if (err) return;
                    });
                }
                var add_vendor = new vendorConnection(requestObject);
                var save_vendor = await add_vendor.save();
                if (save_vendor) {
                    delete requestObject.vendor_created_at;
                    delete requestObject.vendor_created_by;
                    delete requestObject.vendor_updated_at;
                    delete requestObject.vendor_updated_by;
                    delete requestObject.is_delete;
                    delete requestObject.vendor_image;
                    delete requestObject.vendor_attachment;

                    // find difference of object 
                    let insertedData = await common.setInsertedFieldHistory(requestObject);
                    // Check for object id fields and if it changed then replace id with specific value
                    let found_term = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'vendor_terms'; });
                    if (found_term != -1) {
                        let one_term = await termConnection.findOne({ _id: ObjectID(insertedData[found_term].value) });
                        insertedData[found_term].value = one_term.name;
                    }

                    let found_status = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'vendor_status'; });
                    if (found_status != -1) {
                        if (insertedData[found_status].value == 1) {
                            insertedData[found_status].value = 'Active';
                        } else {
                            insertedData[found_status].value = 'Inactive';
                        }
                    }

                    for (let i = 0; i < insertedData.length; i++) {
                        insertedData[i]['key'] = translator.getStr(`Vendor_History.${insertedData[i]['key']}`);
                    }
                    let histioryObject = {
                        data: insertedData,
                        vendor_id: save_vendor._id,
                    };
                    addVendorHistory("Insert", histioryObject, decodedToken);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: save_vendor._id,
                        title: save_vendor.vendor_name,
                        module: 'Vendor',
                        action: 'Insert',
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ status: true, message: "Vendor saved successfully.", data: save_vendor });
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

//get invoice vendor status count
module.exports.getVendorStatusCount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var getdata = await vendorConnection.aggregate([
                { $match: { is_delete: 0 } },
                {
                    $project: {
                        active: { $cond: [{ $eq: ["$vendor_status", 1] }, 1, 0] },
                        inactive: { $cond: [{ $eq: ["$vendor_status", 2] }, 1, 0] },
                    }
                },
                {
                    $group: {
                        _id: null,
                        active: { $sum: "$active" },
                        inactive: { $sum: "$inactive" },
                    }
                }
            ]);
            if (getdata) {
                if (getdata.length > 0) {
                    getdata = getdata[0];
                }
                res.send({ status: true, message: "Vendor count", data: getdata });
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

//get invoice vendor
module.exports.getVendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
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

//get invoice vendor
module.exports.getVendorForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var getdata = await vendorConnection.find({ is_delete: requestObject.is_delete });
            if (getdata) {
                res.send(getdata);
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

//get one invoice vendor
module.exports.getOneVendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var getdata = await vendorConnection.findOne({ _id: ObjectID(requestObject._id) });
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
module.exports.deleteVendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var id = requestObject._id;
            delete requestObject._id;
            requestObject.vendor_updated_by = decodedToken.UserData._id;
            requestObject.vendor_updated_at = Math.round(new Date().getTime() / 1000);
            var one_vendor = await vendorConnection.findOne({ _id: ObjectID(id) });
            var delete_vendor = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (delete_vendor) {
                let histioryObject = {
                    data: [],
                    vendor_id: id,
                };
                if (delete_vendor.nModified == 1) {
                    let action = '';
                    let message = '';
                    if (requestObject.is_delete == 1) {
                        action = "Archive";
                        message = "Vendor archive successfully";
                    } else {
                        action = "Restore";
                        message = "Vendor restore successfully";
                    }
                    addVendorHistory(action, histioryObject, decodedToken);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: id,
                        title: one_vendor.vendor_name,
                        module: 'Vendor',
                        action: action,
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ message: message, status: true });
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

//datatable for invoice vendor
module.exports.getVendorDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var col = [];
            col.push("isVendorfromQBO", "vendor_name", "vendor_id", "customer_id", "vendor_phone", "vendor_email", "vendor_address", "vendor_attachment", "vendor_status");

            var start = parseInt(requestObject.start) || 0;
            var perpage = parseInt(requestObject.length);

            var columnData = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].column : '';
            var columntype = (requestObject.order != undefined && requestObject.order != '') ? requestObject.order[0].dir : '';

            var sort = {};
            if (requestObject.draw == 1) {
                sort = { "isVendorfromQBO": 1 };
            } else {
                sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;

            }
            let query = {};
            if (requestObject.search.value) {
                query = {
                    $or: [
                        { "vendor_name": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_id": new RegExp(requestObject.search.value, 'i') },
                        { "customer_id": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_phone": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_email": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_address": new RegExp(requestObject.search.value, 'i') },
                        { "vendor_status": new RegExp(requestObject.search.value, 'i') },
                    ]
                };
            }

            var match_query = { is_delete: requestObject.is_delete };
            if (requestObject.vendor_status) {
                if (requestObject.vendor_status != '') {
                    match_query = {
                        is_delete: requestObject.is_delete,
                        vendor_status: requestObject.vendor_status,
                    };
                }
            }
            var aggregateQuery = [
                { $match: match_query },
                // {
                //     $lookup: {
                //         from: collectionConstant.INVOICE_TERM,
                //         localField: "vendor_terms",
                //         foreignField: "_id",
                //         as: "terms"
                //     }
                // },
                // { $unwind: "$terms" },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await vendorConnection.countDocuments(match_query);
            let all_vendors = await vendorConnection.aggregate(aggregateQuery).collation({ locale: "en_US" });
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

//save vendor from QBO to database
module.exports.savevendorstoDB = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    var vendors_link = [];

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        const companycode = req.body.companycode;
        const client = await MongoClient.connect(url);
        var dbo = client.db("rovuk_admin");
        var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
        const result = await dbo.collection("tenants").findOne({ companycode: decodedToken.companycode });
        client_id = result.client_id ? result.client_id : '';
        client_secret = result.client_secret ? result.client_secret : '';
        access_token = result.access_token ? result.access_token : '';
        realmId = result.realmId ? result.realmId : '';
        refresh_token = result.refresh_token ? result.refresh_token : '';
        qbo = new QuickBooks(client_id,
            client_secret,
            access_token,
            false, // no token secret for oAuth 2.0
            realmId,
            true, // use the sandbox?
            false, // enable debugging?
            null, // set minorversion, or null for the latest version
            '2.0', //oAuth version
            refresh_token);
        var dbo = client.db(`rovuk_${companycode.slice(2)}`);
        var returndata = [];
        qbo.findAttachables({
            desc: 'MetaData.LastUpdatedTime'
        }, async (e, attachables) => {
            if (attachables.hasOwnProperty("QueryResponse") && attachables.QueryResponse.hasOwnProperty("Attachable")) {
                for (var k = 0; k < attachables.QueryResponse.Attachable.length; k++) {
                    var linkdata = attachables.QueryResponse.Attachable[k];
                    if (linkdata.ContentType.includes("image/") && linkdata.AttachableRef[0].EntityRef.type === "Vendor") {
                        var data = {};
                        data._id = linkdata.AttachableRef[0].EntityRef.value;
                        data.url = linkdata.TempDownloadUri;
                        vendors_link.push(data);
                    }
                }
            }
            qbo.findVendors({ desc: 'MetaData.LastUpdatedTime' }, async (err, vendors) => {
                isQuickBooksVendor = true;
                console.log("I am no in error");
                await dbo.collection("vendor").deleteMany({ isVendorfromQBO: true });
                if (vendors.queryResponse !== null)
                    vendors.QueryResponse.Vendor.forEach(async function (vendorfromQB) {
                        var vendordata = {};
                        // vendordata._id = vendorfromQB.hasOwnProperty("Id") ? vendorfromQB.Id : '';
                        vendordata.vendor_name = vendorfromQB.DisplayName ? vendorfromQB.DisplayName : '';
                        vendordata.vendor_phone = vendorfromQB.hasOwnProperty("PrimaryPhone") ? vendorfromQB.PrimaryPhone.FreeFormNumber : '';
                        vendordata.isVendorfromQBO = true;
                        vendordata.vendor_email = vendorfromQB.hasOwnProperty("PrimaryEmailAddr") ? vendorfromQB.PrimaryEmailAddr.hasOwnProperty("Address") ? vendorfromQB.PrimaryEmailAddr.Address : '' : '';
                        vendordata.is_delete = 0;
                        vendordata.gl_account = vendorfromQB.AcctNum ? vendorfromQB.AcctNum : '';
                        vendordata.vendor_address = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("Line1") ? vendorfromQB.BillAddr.Line1 : '' : '';
                        vendordata.vendor_address2 = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("Line2") ? vendorfromQB.BillAddr.Line2 : '' : '';
                        vendordata.vendor_city = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("City") ? vendorfromQB.BillAddr.City : '' : '';
                        vendordata.vendor_state = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("CountrySubDivisionCode") ? vendorfromQB.BillAddr.CountrySubDivisionCode : '' : '';
                        vendordata.vendor_zipcode = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("PostalCode") ? vendorfromQB.BillAddr.PostalCode : '' : '';
                        vendordata.vendor_country = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("Country") ? vendorfromQB.BillAddr.Country : '' : '';
                        // vendordata.terms_id = vendorfromQB.hasOwnProperty("TermRef") ? vendorfromQB.TermRef.hasOwnProperty("value") ? vendorfromQB.TermRef.value : '' : '';
                        vendordata.vendor_status = vendorfromQB.Activity ? 0 : 1;
                        Math.round(new Date(vendorfromQB.MetaData.CreateTime).getTime() / 1000);
                        vendordata.vendor_created_at = Math.round(new Date(vendorfromQB.MetaData.CreateTime).getTime() / 1000);
                        vendordata.vendor_description = '';
                        vendordata.vendor_image = '';
                        vendordata.vendor_attachment = [];
                        vendordata.vendor_id = vendorfromQB.hasOwnProperty("Id") ? vendorfromQB.Id : '';
                        for (var j = 0; j < vendors_link.length; j++) {
                            if (vendors_link[j]._id === vendordata.vendor_id)
                                vendordata.vendor_attachment.push(vendors_link[j].url);
                        }
                        vendordata.customer_id = vendorfromQB.hasOwnProperty("BillAddr") ? vendorfromQB.BillAddr.hasOwnProperty("Id") ? vendorfromQB.BillAddr.Id : '' : '';
                        returndata.push(vendordata);
                        var add_vendor = new vendorConnection(vendordata);
                        await add_vendor.save();
                    });
                if (returndata.length > 0) {
                    client.close();
                }
            });
        });

        res.send({ status: true, message: 'success' });
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//vendor active or inactive
module.exports.updateVendorStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;
            var one_vendor = await vendorConnection.findOne({ _id: ObjectID(id) });
            var updateStatus = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (updateStatus) {
                if (updateStatus.nModified == 1) {
                    let action = '';
                    let message = '';
                    let histioryObject = {
                        data: [],
                        vendor_id: id,
                    };
                    if (requestObject.vendor_status == 1) {
                        action = "Active";
                        message = "Vendor status active successfully.";
                    } else {
                        action = "Inactive";
                        message = "Vendor status inactive successfully.";
                    }
                    addVendorHistory(action, histioryObject, decodedToken);
                    recentActivity.saveRecentActivity({
                        user_id: decodedToken.UserData._id,
                        username: decodedToken.UserData.userfullname,
                        userpicture: decodedToken.UserData.userpicture,
                        data_id: id,
                        title: one_vendor.vendor_name,
                        module: 'Vendor',
                        action: action,
                        action_from: 'Web',
                    }, decodedToken);
                    res.send({ message: message, status: true });
                } else {
                    res.send({ message: "No data with this id", status: false });
                }
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

// vendor history function
async function addVendorHistory(action, data, decodedToken) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var vendor_history_connection = connection_db_api.model(historyCollectionConstant.INVOICE_VENDOR_HISTORY, vendor_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = Math.round(new Date().getTime() / 1000);
        data.history_created_by = decodedToken.UserData._id;
        var add_vendor_history = new vendor_history_connection(data);
        var save_vendor_history = add_vendor_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        // connection_db_api.close();
    }
}

module.exports.getVendorHistory = async function (req, res) {
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
            var vendor_history_connection = connection_db_api.model(historyCollectionConstant.INVOICE_VENDOR_HISTORY, vendor_history_Schema);
            let get_data = await vendor_history_connection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_VENDOR,
                        localField: "vendor_id",
                        foreignField: "_id",
                        as: "vendor"
                    }
                },
                { $unwind: "$vendor" },
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

module.exports.getVendorExcelReport = async function (req, res) {
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

            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            let sort = { vendor_name: 1 };
            let termQuery = [];
            let query = [];
            let status_query = {};
            if (requestObject.terms_ids.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.terms_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.terms_ids[i]));
                }
                termQuery.push({ "_id": { $in: data_Query } });
                query.push({ "vendor_terms": { $in: data_Query } });
            }
            if (requestObject.invoice_status.length != 0) {
                status_query = { status: { $in: requestObject.invoice_status } };
            }
            query = query.length == 0 ? {} : { $and: query };

            let get_vendor = await vendorConnection.aggregate([
                { $match: { is_delete: 0 }, },
                { $match: query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "vendor_terms",
                        foreignField: "_id",
                        as: "terms"
                    }
                },
                { $unwind: "$terms" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE,
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$vendor", "$$id"] },
                                            { $eq: ["$is_delete", 0] }
                                        ]
                                    }
                                },
                            },
                            { $match: status_query },
                            {
                                $project: {
                                    Pending: { $cond: [{ $eq: ["$status", 'Pending'] }, 1, 0] },
                                    Approved: { $cond: [{ $eq: ["$status", 'Approved'] }, 1, 0] },
                                    Rejected: { $cond: [{ $eq: ["$status", 'Rejected'] }, 1, 0] },
                                    Late: { $cond: [{ $eq: ["$status", 'Late'] }, 1, 0] },
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    Pending: { $sum: "$Pending" },
                                    Approved: { $sum: "$Approved" },
                                    Rejected: { $sum: "$Rejected" },
                                    Late: { $sum: "$Late" },
                                }
                            }
                        ],
                        as: "invoice"
                    }
                },
                { $sort: sort }
            ]).collation({ locale: "en_US" });
            console.log("sagar.........get_vendor: ", get_vendor.length);
            let workbook = new excel.Workbook();
            let title_tmp = translator.getStr('TaskTitle');
            let worksheet = workbook.addWorksheet(title_tmp);
            let xlsx_data = [];
            let result = await common.urlToBase64(company_data.companylogo);
            let logo_rovuk = await common.urlToBase64(config.INVOICE_LOGO);
            for (let i = 0; i < get_vendor.length; i++) {
                let vendor = get_vendor[i];
                let tempDate = [vendor.vendor_name, vendor.vendor_id, vendor.customer_id, vendor.vendor_phone,
                vendor.vendor_email, vendor.vendor_address, vendor.vendor_address2, vendor.vendor_city, vendor.vendor_state, vendor.vendor_zipcode,
                vendor.vendor_country, vendor.terms.name, vendor.vendor_status, vendor.vendor_description];
                let invoiceCount = {
                    Pending: 0,
                    Approved: 0,
                    Rejected: 0,
                    Late: 0,
                };
                if (vendor.invoice.length > 0) {
                    invoiceCount = vendor.invoice[0];
                }
                if (requestObject.invoice_status.length != 0) {
                    for (let i = 0; i < requestObject.invoice_status.length; i++) {
                        let status = requestObject.invoice_status[i];
                        tempDate.push(invoiceCount[status]);
                    }
                }
                xlsx_data.push(tempDate);
            }
            let headers = [
                translator.getStr('Vendor_History.vendor_name'),
                translator.getStr('Vendor_History.vendor_id'),
                translator.getStr('Vendor_History.customer_id'),
                translator.getStr('Vendor_History.vendor_phone'),
                translator.getStr('Vendor_History.vendor_email'),
                translator.getStr('Vendor_History.vendor_address'),
                translator.getStr('Vendor_History.vendor_address2'),
                translator.getStr('Vendor_History.vendor_city'),
                translator.getStr('Vendor_History.vendor_state'),
                translator.getStr('Vendor_History.vendor_zipcode'),
                translator.getStr('Vendor_History.vendor_country'),
                translator.getStr('Vendor_History.vendor_terms'),
                translator.getStr('Vendor_History.vendor_status'),
                translator.getStr('Vendor_History.vendor_description'),
            ];
            if (requestObject.invoice_status.length != 0) {
                for (let i = 0; i < requestObject.invoice_status.length; i++) {
                    headers.push(translator.getStr(`Vendor_History.${requestObject.invoice_status[i]}`));
                }
            }
            let d = new Date();
            let excel_date = common.fullDate_format();

            //compnay logo
            let myLogoImage = workbook.addImage({
                base64: result,
                extension: 'png',
            });
            worksheet.addImage(myLogoImage, "A1:A6");
            worksheet.mergeCells('A1:A6');

            let middleTextCell = 'M';
            let finalCell = 'N';
            if (requestObject.invoice_status.length == 1) {
                middleTextCell = 'N';
                finalCell = 'O';
            } else if (requestObject.invoice_status.length == 2) {
                middleTextCell = 'O';
                finalCell = 'P';
            } else if (requestObject.invoice_status.length == 3) {
                middleTextCell = 'P';
                finalCell = 'Q';
            } else if (requestObject.invoice_status.length == 4) {
                middleTextCell = 'Q';
                finalCell = 'R';
            }
            //invoice logo
            let rovukLogoImage = workbook.addImage({
                base64: logo_rovuk,
                extension: 'png',
            });
            worksheet.mergeCells(`${finalCell}1:${finalCell}6`);
            worksheet.addImage(rovukLogoImage, `${finalCell}1:${finalCell}6`);

            // Image between text 1
            let titleRowValue1 = worksheet.getCell('B1');
            titleRowValue1.value = `Vendor detailed report`;
            titleRowValue1.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue1.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B1:${middleTextCell}3`);

            // Image between text 2
            let titleRowValue2 = worksheet.getCell('B4');
            titleRowValue2.value = `Generated by: ${decodedToken.UserData.userfullname}`;
            titleRowValue2.font = {
                name: 'Calibri',
                size: 15,
                bold: true,
            };
            titleRowValue2.alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.mergeCells(`B4:${middleTextCell}6`);

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
            worksheet.mergeCells(`A${footerRow.number}:${finalCell}${footerRow.number}`);
            const tmpResultExcel = await workbook.xlsx.writeBuffer();

            let terms = '';
            let status = '';
            if (requestObject.All_Terms) {
                terms = `${translator.getStr('EmailExcelTerms')} ${translator.getStr('EmailExcelAllTerms')}`;
            } else {
                termQuery = termQuery.length == 0 ? {} : { $or: termQuery };
                let termCollection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
                let all_terms = await termCollection.find(termQuery, { name: 1 });
                let temp_data = [];
                for (var i = 0; i < all_terms.length; i++) {
                    temp_data.push(all_terms[i]['name']);
                }
                terms = `${translator.getStr('EmailExcelTerms')} ${temp_data.join(", ")}`;
            }
            if (requestObject.All_Invoice_Status) {
                status = `${translator.getStr('EmailExcelInvoiceStatus')} ${translator.getStr('EmailExcelAllInvoiceStatus')}`;
            } else {
                status = `${translator.getStr('EmailExcelInvoiceStatus')} ${requestObject.invoice_status.join(", ")}`;
            }


            let companycode = decodedToken.companycode.toLowerCase();
            let key_url = config.INVOICE_WASABI_PATH + "/vendor/excel_report/vendor_" + new Date().getTime() + ".xlsx";
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
                    console.log("vendor report excelUrl", excelUrl);
                    let emailTmp = {
                        HELP: `${translator.getStr('EmailTemplateHelpEmailAt')} ${config.HELPEMAIL} ${translator.getStr('EmailTemplateCallSupportAt')} ${config.NUMBERPHONE}`,
                        SUPPORT: `${translator.getStr('EmailTemplateEmail')} ${config.SUPPORTEMAIL} l ${translator.getStr('EmailTemplatePhone')} ${config.NUMBERPHONE2}`,
                        ALL_RIGHTS_RESERVED: `${translator.getStr('EmailTemplateAllRightsReserved')}`,
                        THANKS: translator.getStr('EmailTemplateThanks'),
                        ROVUK_TEAM: translator.getStr('EmailTemplateRovukTeam'),
                        VIEW_EXCEL: translator.getStr('EmailTemplateViewExcelReport'),

                        EMAILTITLE: `${translator.getStr('EmailVendorReportTitle')}`,
                        TEXT1: translator.getStr('EmailVendorReportText1'),
                        TEXT2: translator.getStr('EmailVendorReportText2'),

                        FILE_LINK: excelUrl,

                        SELECTION: new handlebars.SafeString(`<h4>${terms}</h4><h4>${status}</h4>`),

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, email_list, translator.getStr('EmailVendorSubject'), HtmlData,
                        talnate_data.tenant_smtp_server, talnate_data.tenant_smtp_port, talnate_data.tenant_smtp_reply_to_mail,
                        talnate_data.tenant_smtp_password, talnate_data.tenant_smtp_timeout, talnate_data.tenant_smtp_security);

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
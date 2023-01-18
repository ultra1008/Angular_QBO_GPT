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

// save vendor
module.exports.saveVendor = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let one_vendor = await vendorConnection.findOne({ _id: ObjectID(id) }, { _id: 0, image: 0, attachment: 0, is_delete: 0, created_at: 0, created_by: 0, updated_at: 0, updated_by: 0, __v: 0 });
                var update_vendor = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_vendor) {
                    delete requestObject.created_at;
                    delete requestObject.created_by;
                    delete requestObject.updated_at;
                    delete requestObject.updated_by;
                    delete requestObject.is_delete;
                    delete requestObject.image;
                    delete requestObject.attachment;

                    if (requestObject.terms_id) {
                        requestObject.terms_id = ObjectID(requestObject.terms_id);
                    }

                    // find difference of object 
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, one_vendor._doc);
                    // Check for object id fields and if it changed then replace id with specific value
                    let found_term = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'terms_id'; });
                    if (found_term != -1) {
                        let one_term = await termConnection.findOne({ _id: ObjectID(updatedData[found_term].value) });
                        updatedData[found_term].value = one_term.name;
                    }

                    let found_status = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'status'; });
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
                    res.send({ status: true, message: "Vendor updated successfully.", data: update_vendor });
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
                    delete requestObject.created_at;
                    delete requestObject.created_by;
                    delete requestObject.updated_at;
                    delete requestObject.updated_by;
                    delete requestObject.is_delete;
                    delete requestObject.image;
                    delete requestObject.attachment;

                    // find difference of object 
                    let insertedData = await common.setInsertedFieldHistory(requestObject);
                    // Check for object id fields and if it changed then replace id with specific value
                    let found_term = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'terms_id'; });
                    if (found_term != -1) {
                        let one_term = await termConnection.findOne({ _id: ObjectID(insertedData[found_term].value) });
                        insertedData[found_term].value = one_term.name;
                    }

                    let found_status = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'status'; });
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
                        active: { $cond: [{ $eq: ["$status", 1] }, 1, 0] },
                        inactive: { $cond: [{ $eq: ["$status", 2] }, 1, 0] },
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
                } else {

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

            requestObject.updated_by = decodedToken.UserData._id;
            requestObject.updated_at = Math.round(new Date().getTime() / 1000);
            var delete_vendor = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (delete_vendor) {
                let histioryObject = {
                    data: [],
                    vendor_id: id,
                };
                if (delete_vendor.nModified == 1) {
                    if (requestObject.is_delete == 1) {
                        addVendorHistory("Archive", histioryObject, decodedToken);
                        res.send({ message: "Vendor archive successfully", status: true });
                    } else {
                        addVendorHistory("Restore", histioryObject, decodedToken);
                        res.send({ message: "Vendor restore successfully", status: true });
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

//datatable for invoice vendor
module.exports.getVendorDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);

        try {
            var vendorConnection = connection_db_api.model(collectionConstant.INVOICE_VENDOR, vendorSchema);
            var col = [];
            var match_query = { is_delete: req.body.is_delete };
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
                { $match: match_query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms_id",
                        foreignField: "_id",
                        as: "terms"
                    }
                },
                { $unwind: "$terms" },
                { $match: query },
                { $sort: sort },
                { $limit: start + perpage },
                { $skip: start },
            ];
            let count = 0;
            count = await vendorConnection.countDocuments(match_query);
            let all_vendors = await vendorConnection.aggregate(aggregateQuery);

            var dataResponce = {};
            dataResponce.data = all_vendors;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotle = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? all_vendors.length : count;
            // console.log(dataResponce);
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
            var updateStatus = await vendorConnection.updateOne({ _id: ObjectID(id) }, requestObject);
            if (updateStatus) {
                if (updateStatus.nModified == 1) {
                    let histioryObject = {
                        data: [],
                        vendor_id: id,
                    };
                    if (requestObject.status == 1) {
                        addVendorHistory("Active", histioryObject, decodedToken);
                        res.send({ status: true, message: "Vendor status active successfully." });
                    } else {
                        addVendorHistory("Inactive", histioryObject, decodedToken);
                        res.send({ status: true, message: "Vendor status inactive successfully." });
                    }
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
            if (requestObject.terms_ids.length != 0) {
                let data_Query = [];
                for (let i = 0; i < requestObject.terms_ids.length; i++) {
                    data_Query.push(ObjectID(requestObject.terms_ids[i]));
                }
                termQuery.push({ "_id": { $in: data_Query } });
                query.push({ "terms_id": { $in: data_Query } });
            }
            query = query.length == 0 ? {} : { $and: query };

            let get_vendor = await vendorConnection.aggregate([
                { $match: { is_delete: 0 }, },
                { $match: query },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_TERM,
                        localField: "terms_id",
                        foreignField: "_id",
                        as: "terms"
                    }
                },
                { $unwind: "$terms" },
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
                xlsx_data.push([vendor.vendor_name, vendor.vendor_id, vendor.customer_id, vendor.phone,
                vendor.email, vendor.address, vendor.address2, vendor.city, vendor.state, vendor.zipcode,
                vendor.country, vendor.terms.name, vendor.status, vendor.description]);
            }
            let headers = [
                translator.getStr('Vendor_History.vendor_name'),
                translator.getStr('Vendor_History.vendor_id'),
                translator.getStr('Vendor_History.customer_id'),
                translator.getStr('Vendor_History.phone'),
                translator.getStr('Vendor_History.email'),
                translator.getStr('Vendor_History.address'),
                translator.getStr('Vendor_History.address2'),
                translator.getStr('Vendor_History.city'),
                translator.getStr('Vendor_History.state'),
                translator.getStr('Vendor_History.zipcode'),
                translator.getStr('Vendor_History.country'),
                translator.getStr('Vendor_History.terms_id'),
                translator.getStr('Vendor_History.status'),
                translator.getStr('Vendor_History.description'),
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

            let terms = '';
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


            let companycode = decodedToken.companycode.toLowerCase();
            // let key_url = config.INVOICE_WASABI_PATH + "/vendor/excel_report/vendor_" + new Date().getTime() + ".xlsx";
            let key_url = config.INVOICE_WASABI_PATH + "/vendor/excel_report/vendor.xlsx";
            let PARAMS = {
                Bucket: companycode,
                Key: key_url,
                Body: tmpResultExcel,
                ACL: 'public-read-write'
            };
            const file_data = fs.readFileSync('./controller/emailtemplates/excelReport.html', 'utf8');
            bucketOpration.uploadFile(PARAMS, async function (err, resultUpload) {
                if (err) {
                    res.send({ message: translator.getStr('SomethingWrong'), error: err, status: false });
                } else {
                    excelUrl = config.wasabisys_url + "/" + companycode + "/" + key_url;
                    console.log("blueprint plan report excelUrl", excelUrl);
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

                        SELECTION: new handlebars.SafeString(`<h4>${terms}</h4>`),

                        COMPANYNAME: `${translator.getStr('EmailCompanyName')} ${company_data.companyname}`,
                        COMPANYCODE: `${translator.getStr('EmailCompanyCode')} ${company_data.companycode}`,
                    };
                    var template = handlebars.compile(file_data);
                    var HtmlData = await template(emailTmp);
                    let mailsend = await sendEmail.sendEmail_client(talnate_data.tenant_smtp_username, email_list, translator.getStr('EmailVendorSubject'), HtmlData,
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
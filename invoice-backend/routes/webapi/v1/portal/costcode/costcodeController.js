var costcodeSchema = require('../../../../../model/costcode');
var userSchema = require('../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("../../../../../controller/common/common");
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
//let activityController = require("./../todaysActivity/todaysActivityController");
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getallcostcode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            let all_costcode = await costcodeCollection.aggregate([
                { $match: { is_delete: 0, module: 'Invoice' } },
                {
                    $project: {
                        _id: 1,
                        division: 1,
                        module: 1,
                        description: 1,
                        cost_code: "$value"
                    }
                }
            ]);
            res.send({ message: translator.getStr('CostCodeListing'), data: all_costcode, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getcostcode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            let all_costcode = await costcodeCollection.aggregate([
                {
                    $match:
                    {
                        is_delete: 0,
                        module: requestObject.module
                    }
                },
                {
                    $project: {
                        _id: 1,
                        division: 1,
                        module: 1,
                        description: 1,
                        cost_code: "$value"
                    }
                }
            ]);
            res.send({ message: translator.getStr('CostCodeListing'), data: all_costcode, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


module.exports.getCostCodeForDatatable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            var col = [];
            match = { is_delete: 0, module: requestObject.module };
            col.push("division", "value", "description");
            var start = parseInt(req.body.start);
            var perpage = parseInt(req.body.length);
            var columnData = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].column : '';
            var columntype = (req.body.order != undefined && req.body.order != '') ? req.body.order[0].dir : '';
            var sort = {};
            sort[col[columnData]] = (columntype == 'asc') ? 1 : -1;
            var query = {
                $or: [{ "division": new RegExp(req.body.search.value, 'i') },
                { "value": new RegExp(req.body.search.value, 'i') },
                { "description": new RegExp(req.body.search.value, 'i') }]
            };
            var aggregateQuery = [
                { $match: match },
                { $match: query },
                { $limit: perpage },
                { $skip: start },
                { $sort: sort },
            ];
            let count = 0;
            count = await costcodeCollection.countDocuments(match);
            let get_shift = await costcodeCollection.aggregate(aggregateQuery);
            var dataResponce = {};
            dataResponce.data = get_shift;
            dataResponce.draw = req.body.draw;
            dataResponce.recordsTotal = count;
            dataResponce.recordsFiltered = (req.body.search.value) ? get_shift.length : count;
            res.json(dataResponce);
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.savecostcode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            if (requestObject._id) {
                requestObject.value = requestObject.module + "-" + requestObject.division + "-" + requestObject.cost_code;
                let update_doc_type = await costcodeCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_doc_type) {
                    res.send({ message: translator.getStr('CostCodeUpdated'), data: update_doc_type, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                requestObject.value = requestObject.module + "-" + requestObject.division + "-" + requestObject.cost_code;
                let check_cost_code = await costcodeCollection.findOne({ is_delete: 0, module: requestObject.module, value: requestObject.value });
                if (check_cost_code == null) {
                    let add_doc_type = new costcodeCollection(requestObject);
                    let save_doc_type = await add_doc_type.save();
                    if (save_doc_type) {
                        res.send({ message: translator.getStr('CostCodeAdded'), data: save_doc_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: "CostCode alrady exists.", status: false });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.deletecostcode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            console.log("requestObject", requestObject);
            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            let deleteObject = await costcodeCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: requestObject.is_delete });
            let isDelete = deleteObject.nModified;
            console.log("deleteObject", deleteObject);
            if (deleteObject) {
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    if (requestObject.is_delete == 0) {
                        res.send({ status: true, message: 'Cost code deleted successfully.', data: deleteObject });
                    } else {
                        res.send({ status: true, message: 'Cost code restore successfully.', data: deleteObject });
                    }
                    res.send({ message: translator.getStr('CostCodeDeleted'), status: true });
                }
            } else {
                console.log(e);
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.savexlsxcostcode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let errormsg = "", successmsg = "", flg = 0;
            let requestData = req.body;
            let success_data = [], error_data = [], data = [];
            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            if (requestData.data.length != 0) {
                for (let i = 0; i < requestData.data.length; i++) {
                    let requestObject = {
                        description: requestData.data[i].description,
                        cost_code: requestData.data[i].cost_code,
                        division: requestData.data[i].division,
                        module: requestData.module,
                    };
                    requestObject.value = requestObject.module + "-" + requestObject.division + "-" + requestObject.cost_code;
                    let check_cost_code = await costcodeCollection.findOne({ is_delete: 0, module: requestObject.module, value: requestObject.value });
                    if (check_cost_code == null) {
                        requestObject.status = true;
                        requestObject.message = translator.getStr('Data_Correct');
                        success_data.push(requestObject);
                        data.push(requestObject);
                    } else {
                        requestObject.status = false;
                        requestObject.message = translator.getStr('costcode_alrady_exists');
                        error_data.push(requestObject);
                        data.push(requestObject);
                    }
                }
                res.send({ status: true, data: data, error_data: error_data, success_data: success_data });
            } else {
                res.send({ message: translator.getStr('NoDataUploadedFile'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.savecostcodeindb = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let requestData = req.body;
            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            if (requestData.data.length != 0) {
                for (let i = 0; i < requestData.data.length; i++) {
                    let requestObject = {
                        description: requestData.data[i].description,
                        cost_code: requestData.data[i].cost_code,
                        division: requestData.data[i].division,
                        module: requestData.module,
                    };
                    requestObject.value = requestObject.module + "-" + requestObject.division + "-" + requestObject.cost_code;
                    let check_cost_code = await costcodeCollection.findOne({ is_delete: 0, module: requestObject.module, value: requestObject.value });
                    if (check_cost_code == null) {
                        requestObject.status = true;
                        requestObject.message = translator.getStr('Data_Correct');

                        let add_doc_type = new costcodeCollection(requestObject);
                        let save_doc_type = await add_doc_type.save();
                    }
                }
                res.send({
                    status: true, message: translator.getStr('CostCodeAdded')
                });
            } else {
                res.send({ message: translator.getStr('NoDataUploadedFile'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get cost code
module.exports.getCostCodeForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            console.log("requestObject", requestObject);
            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);

            var getdata = await costcodeCollection.find({ is_delete: requestObject.is_delete, module: requestObject.module });
            console.log("getdata", getdata);
            if (getdata) {
                res.send(getdata);
            }
            else {
                res.send([]);
            }

        } catch (e) {
            res.send([]);
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.importCostCode = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let costcodeCollection = connection_db_api.model(collectionConstant.COSTCODES, costcodeSchema);
            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
            // var fileType;
            var fileName;
            form.parse(req)
                .on('file', function (name, file) {
                    notFonud = 1;
                    fileName = file;
                }).on('field', function (name, field) {
                    fields[name] = field;
                })
                .on('error', function (err) {
                    throw err;
                }).on('end', async function () {
                    newOpenFile = this.openedFiles;
                    if (notFonud == 1) {
                        const file = reader.readFile(newOpenFile[0].path);
                        const sheets = file.SheetNames;
                        let data = [];
                        for (let i = 0; i < sheets.length; i++) {
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                            temp.forEach((ress) => {
                                data.push(ress);
                            });
                        }
                        for (let m = 0; m < data.length; m++) {
                            requestObject = {};
                            let onecategory_main = await costcodeCollection.findOne({ cost_code: data[m].cost_code, division: data[m].division });
                            if (onecategory_main == null) {
                                requestObject.cost_code = data[m].cost_code;
                                requestObject.division = data[m].division;
                                requestObject.module = data[m].module;
                                requestObject.description = data[m].description;
                                requestObject.value = data[m].value;
                                requestObject.is_delete = 0;
                                let add_costcode = new costcodeCollection(requestObject);
                                let save_costcode = await add_costcode.save();
                            } else {
                            }
                        }
                        res.send({ status: true, message: translator.getStr('CostCodeAdded') });
                    }
                });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            //connection_db_api.close()
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
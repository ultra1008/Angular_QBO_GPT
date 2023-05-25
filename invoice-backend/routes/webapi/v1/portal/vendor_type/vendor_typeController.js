var vendortypeSchema = require('../../../../../model/vendor_type');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');


// vendor type insert Edit 
module.exports.savevendortype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendortypeConnection = connection_db_api.model(collectionConstant.VENDOR_TYPE, vendortypeSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await vendortypeConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update invoice vendor type
                if (get_data != null) {
                    if (get_data._id == id) {
                        let updatevendortype = await vendortypeConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updatevendortype) {
                            res.send({ status: true, message: "vendor type update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: "vendor type allready exist", status: false });

                    }
                } else {
                    let updatevendortype = await vendortypeConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (updatevendortype) {
                        res.send({ status: true, message: "vendor type update succesfully..!" });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

                    }
                }

            }
            else {
                //insert invoice vendor type

                var nameexist = await vendortypeConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "vendor type allready exist" });
                }
                else {
                    var add_vendortype = new vendortypeConnection(requestObject);
                    var save_vendortype = await add_vendortype.save();
                    res.send({ status: true, message: "vendor type insert successfully..!", data: add_vendortype });
                }

            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        }
        finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};


// get invoice_vendortype

module.exports.getvendortype = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var vendortypeConnection = connection_db_api.model(collectionConstant.VENDOR_TYPE, vendortypeSchema);
            let get_data = await vendortypeConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get vendor type", data: get_data });

        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//delete invoice vendortype

module.exports.deletevendortype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var vendortypeConnection = connection_db_api.model(collectionConstant.VENDOR_TYPE, vendortypeSchema);
            let updated_data = await vendortypeConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            var is_delete = updated_data.nModified;
            if (is_delete == 0) {
                res.send({ status: false, message: "There is no data with this id" });
            }
            else {
                res.send({ status: true, message: "vendor type deleted successfully..!", data: updated_data });

            }
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), rerror: e });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });

    }
};

// bulk upload 
module.exports.importvendortype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var vendortypeConnection = connection_db_api.model(collectionConstant.VENDOR_TYPE, vendortypeSchema);

            var form = new formidable.IncomingForm();
            var fields = [];
            var notFonud = 0;
            var newOpenFile;
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
                        let exitdata = new Array();
                        for (let i = 0; i < sheets.length; i++) {
                            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                            temp.forEach((ress) => {
                                data.push(ress);
                            });
                        }
                        var onecategory_main = "";
                        for (let m = 0; m < data.length; m++) {
                            onecategory_main = await vendortypeConnection.findOne({ name: data[m].name }, { name: 1 });
                            if (onecategory_main != null) {
                                exitdata[m] = onecategory_main.name;
                            }
                        }
                        if (exitdata.length > 0) {
                            res.send({ status: false, exitdata: exitdata, message: "name is allready exist." });
                        }
                        else {
                            for (let m = 0; m < data.length; m++) {
                                onecategory_main = await vendortypeConnection.findOne({ name: data[m].name }, { name: 1 });
                                requestObject = {};
                                requestObject.name = data[m].name;
                                let add_vendortype = new vendortypeConnection(requestObject);
                                let save_vendortype = await add_vendortype.save();

                            }
                            res.send({ status: true, message: "vendor type info add successfully." });
                        }

                    } else {
                        res.send({ status: false, message: translator.getStr('SomethingWrong') });
                    }
                });
        } catch (error) {
            console.log(error);
            res.send({ status: false, message: translator.getStr('SomethingWrong'), error: error });
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.getVendorTypeForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendortypeConnection = connection_db_api.model(collectionConstant.VENDOR_TYPE, vendortypeSchema);
            var getdata = await vendortypeConnection.find({ is_delete: requestObject.is_delete });
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
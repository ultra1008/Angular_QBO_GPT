var classnameSchema = require('../../../../../model/class_name');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');

// class name  insert Edit 
module.exports.saveclassname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var class_nameConnection = connection_db_api.model(collectionConstant.CLASS_NAME, classnameSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await class_nameConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update invoice class name
                if (get_data != null) {
                    if (get_data._id == id) {
                        let updateclass_name = await class_nameConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updateclass_name) {
                            res.send({ status: true, message: "class name update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: "class name allready exist", status: false });

                    }
                } else {
                    let updateclass_name = await class_nameConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (updateclass_name) {
                        res.send({ status: true, message: "class name update succesfully..!" });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

                    }
                }

            }
            else {
                //insert invoice class name

                var nameexist = await class_nameConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "class name allready exist" });
                }
                else {
                    var add_vendortype = new class_nameConnection(requestObject);
                    console.log("requestObject", requestObject);
                    var save_vendortype = await add_vendortype.save();
                    res.send({ status: true, message: "class name insert successfully..!", data: add_vendortype });
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

// get class name

module.exports.getclassname = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var class_nameConnection = connection_db_api.model(collectionConstant.CLASS_NAME, classnameSchema);
            let get_data = await class_nameConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get class name", data: get_data });

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

//delete invoice class name

module.exports.deleteclassname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var class_nameConnection = connection_db_api.model(collectionConstant.CLASS_NAME, classnameSchema);
            let updated_data = await class_nameConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            var is_delete = updated_data.nModified;
            if (is_delete == 0) {
                res.send({ status: false, message: "There is no data with this id" });
            }
            else {
                res.send({ status: true, message: "class name deleted successfully..!", data: updated_data });

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


module.exports.getclassnameForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var class_nameConnection = connection_db_api.model(collectionConstant.CLASS_NAME, classnameSchema);
            var getdata = await class_nameConnection.find({ is_delete: requestObject.is_delete });
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

// bulk upload 
module.exports.importclassname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var class_nameConnection = connection_db_api.model(collectionConstant.CLASS_NAME, classnameSchema);
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
                            onecategory_main = await class_nameConnection.findOne({ name: data[m].name, number: data[m].number }, { name: 1, number: 1 });
                            if (onecategory_main != null) {
                                exitdata[m] = onecategory_main.name;
                            }
                        }
                        if (exitdata.length > 0) {
                            res.send({ status: false, exitdata: exitdata, message: "name is allready exist." });
                        }
                        else {
                            for (let m = 0; m < data.length; m++) {
                                onecategory_main = await class_nameConnection.findOne({ name: data[m].name, number: data[m].number }, { name: 1, number: 1 });
                                requestObject = {};
                                requestObject.name = data[m].name;
                                requestObject.number = data[m].number;
                                requestObject.description = data[m].description;
                                let add_classname = new class_nameConnection(requestObject);
                                let save_classname = await add_classname.save();

                            }
                            res.send({ status: true, message: "class name info add successfully." });
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

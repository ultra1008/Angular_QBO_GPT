var languageSchema = require('../../../../../model/language');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("../../../../../controller/common/common");
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
//let activityController = require("../todaysActivity/todaysActivityController");
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getlanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            let all_language = await lanaguageCollection.find({ is_delete: 0 }).sort({ name: 1 });
            res.send({ message: translator.getStr('LanguageListing'), data: all_language, status: true });
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

module.exports.savelanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            if (requestObject._id) {
                let update_language = await lanaguageCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_language) {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageUpdated'), data: update_language, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let add_language = new lanaguageCollection(requestObject);
                let save_language = await add_language.save();
                if (save_language) {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageAdded'), data: save_language, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.deletelanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            requestObject = req.body;

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            let update_language = await lanaguageCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            let isDelete = update_language.nModified;
            if (update_language) {
                if (isDelete == 0) {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageDeleted'), status: true });
                }
            } else {
                console.log(e);
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

//get Relationship
module.exports.getlanguageForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            var getdata = await lanaguageCollection.find({ is_delete: requestObject.is_delete });
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
module.exports.importlanguage = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);

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
                            onecategory_main = await lanaguageCollection.findOne({ name: data[m].name }, { name: 1 });
                            if (onecategory_main != null) {
                                exitdata[m] = onecategory_main.name;
                            }
                        }
                        if (exitdata.length > 0) {
                            res.send({ status: false, exitdata: exitdata, message: "lanaguage name is allready exist." });
                        }
                        else {
                            for (let m = 0; m < data.length; m++) {
                                onecategory_main = await lanaguageCollection.findOne({ name: data[m].name }, { name: 1 });
                                requestObject = {};
                                requestObject.name = data[m].name;
                                let add_lanaguage = new lanaguageCollection(requestObject);
                                let save_lanaguage = await add_lanaguage.save();

                            }
                            res.send({ status: true, message: "lanaguage info add successfully." });
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

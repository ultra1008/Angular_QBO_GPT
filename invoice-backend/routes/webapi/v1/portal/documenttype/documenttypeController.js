var documenttypeSchema = require('./../../../../../model/document_type');
var userdocSchema = require('./../../../../../model/userdocument');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
var formidable = require('formidable');
const reader = require('xlsx');

module.exports.getalldoctype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
            let all_documenttype = await documenttypeCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('DocumentTypeListing'), data: all_documenttype, status: true });
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

module.exports.saveDocType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
            let get_one = await documenttypeCollection.findOne({ document_type_name: requestObject.document_type_name, is_delete: 0 });
            if (requestObject._id) {
                if (get_one != null) {
                    if (get_one._id == requestObject._id) {
                        let update_doc_type = await documenttypeCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                        console.log(update_doc_type);
                        if (update_doc_type) {
                            res.send({ message: translator.getStr('DocumentTypeUpdated'), data: update_doc_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('DocumentTypeAlreadyExist'), status: false });
                    }
                } else {
                    let update_doc_type = await documenttypeCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                    console.log(update_doc_type);
                    if (update_doc_type) {
                        res.send({ message: translator.getStr('DocumentTypeUpdated'), data: update_doc_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_doc_type = new documenttypeCollection(requestObject);
                    let save_doc_type = await add_doc_type.save();
                    if (save_doc_type) {
                        res.send({ message: translator.getStr('DocumentTypeAdded'), data: save_doc_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('DocumentTypeAlreadyExist'), status: false });
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

module.exports.deleteDocType = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            let userdocCollection = connection_db_api.model(collectionConstant.INVOICE_USER_DOCUMENT, userdocSchema);
            let userdocObject = await userdocCollection.find({ userdocument_type_id: ObjectID(req.body._id) });
            if (userdocObject.length > 0) {
                res.send({ message: translator.getStr('DocumentTypeHasData'), status: false });
            } else {
                let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
                let documentTypeObject = await documenttypeCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 });
                if (documentTypeObject) {
                    res.send({ message: translator.getStr('DocumentTypeDeleted'), status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
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


module.exports.getdoctypeForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
            var getdata = await documenttypeCollection.find({ is_delete: requestObject.is_delete });
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
module.exports.importdoctype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
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
                            onecategory_main = await documenttypeCollection.findOne({ document_type_name: data[m].document_type_name, due_days: data[m].due_days }, { document_type_name: 1, due_days: 1 });
                            if (onecategory_main != null) {
                                exitdata[m] = onecategory_main.document_type_name;
                            }
                        }
                        if (exitdata.length > 0) {
                            res.send({ status: false, exitdata: exitdata, message: "document type name is allready exist." });
                        }
                        else {
                            for (let m = 0; m < data.length; m++) {
                                onecategory_main = await documenttypeCollection.findOne({ document_type_name: data[m].document_type_name, due_days: data[m].due_days, }, { document_type_name: 1, due_days: 1 });
                                requestObject = {};
                                requestObject.document_type_name = data[m].document_type_name;
                                requestObject.is_expiration = data[m].is_expiration;
                                let add_documenttype = new documenttypeCollection(requestObject);
                                let save_documenttype = await add_documenttype.save();

                            }
                            res.send({ status: true, message: "document type info add successfully." });
                        }
                        // for (let m = 0; m < data.length; m++) {
                        //     requestObject = {};
                        //     let getdata = await documenttypeCollection.findOne({ document_type_name: data[m].document_type_name, is_expiration: data[m].is_expiration });
                        //     if (getdata == null) {
                        //         requestObject.document_type_name = data[m].document_type_name;
                        //         requestObject.is_expiration = data[m].is_expiration;
                        //         let add_job_type = new documenttypeCollection(requestObject);
                        //         let save_job_type = await add_job_type.save();
                        //     } else {
                        //         res.send({ status: true, message: "document type name and is_expiration is allready exist." });
                        //     }
                        // }
                        // res.send({ status: true, message: "department info add successfully." });

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
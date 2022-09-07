var documentSchema = require('../../../../../model/document');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

// insert invoice_document

module.exports.saveInvoicedocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var documentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await documentConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update invoice document
                if (get_data != null) {
                    if (get_data._id == id) {
                        let updateDocument = await documentConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updateDocument) {
                            res.send({ status: true, message: "document update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
                        }
                    } else {
                        res.send({ message: "document allready exist", error: e, status: false });

                    }
                } else {

                }

            }
            else {
                //insert invoice document

                var nameexist = await documentConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "name is all ready exist" });
                }
                else {
                    var add_document = new documentConnection(requestObject);
                    var save_document = await add_document.save();
                    res.send({ status: true, message: "Document insert successfully..!", data: save_document });
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


// get invoice_document

module.exports.getInvoiceDocument = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            let get_data = await invoiceDocumentConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get Document", data: get_data });

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

//delete invoice Document

module.exports.deleteInvoiceDocument = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            let invoiceDocumentConnection = connection_db_api.model(collectionConstant.INVOICE_DOCUMENT, documentSchema);
            let updated_data = await invoiceDocumentConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            var is_delete = updated_data.nModified;
            if (is_delete == 0) {
                res.send({ status: false, message: "There Is No Data With This Id" });
            }
            else {
                res.send({ status: true, message: "Document deleted successfully..!", data: updated_data });

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
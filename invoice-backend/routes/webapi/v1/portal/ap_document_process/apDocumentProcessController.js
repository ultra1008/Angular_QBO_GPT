var apDocumentProcessSchema = require('./../../../../../model/ap_document_processes');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getAPDocumentProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
            let get_data = await apDocumentProcessCollection.find({ is_delete: 0 });
            res.send({ message: 'Listing', data: get_data, status: true });
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

module.exports.getOneAPDocumentProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
            let get_data = await apDocumentProcessCollection.findOne({ _id: ObjectID(requestObject._id) });
            res.send({ message: 'Listing', data: get_data, status: true });
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

module.exports.saveAPDocumentProcess = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let apDocumentProcessCollection = connection_db_api.model(collectionConstant.AP_DOCUMENT_PROCESS, apDocumentProcessSchema);
            if (requestObject._id) {
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let update_process = await apDocumentProcessCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_process) {
                    res.send({ message: 'Document sent for process updated successfully.', data: update_process, status: true });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                let saveObj = [];
                for (let i = 0; i < requestObject.pdf_urls.length; i++) {
                    saveObj.push({
                        pdf_url: requestObject.pdf_urls[i],
                        created_by: decodedToken.UserData._id,
                        created_at: Math.round(new Date().getTime() / 1000),
                        updated_by: decodedToken.UserData._id,
                        updated_at: Math.round(new Date().getTime() / 1000),
                    });
                }
                let insert_data = await apDocumentProcessCollection.insertMany(saveObj);
                if (insert_data) {
                    let documentIds = [];
                    for (let i = 0; i < insert_data.length; i++) {
                        documentIds.push(insert_data[i]._id);
                    }
                    var data = await common.sendInvoiceForProcess({
                        pdf_urls: documentIds,
                        company: decodedToken.companycode,
                    });
                    console.log("process document response: ", data);
                    /*let json = JSON.parse(data.body);
                    invoiceProgressController.saveInvoiceProgress({ process_id: json.process_id }, decodedToken);  */
                    res.send({ message: 'Document sent for process added successfully.', data: insert_data, status: true });
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
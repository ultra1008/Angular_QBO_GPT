var template_Schema = require('../../../../../model/template');
var template_history_Schema = require('../../../../../model/history/template_history');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let config = require('../../../../../config/config');
let common = require('../../../../../controller/common/common');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
const { route } = require('../portal_index');
const { ObjectId } = require('mongodb');
const { update } = require('lodash');
var ObjectID = require('mongodb').ObjectID;


//save template

module.exports.savetemplate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var templateConnection = connection_db_api.model(collectionConstant.INVOICE_TEMPLATE, template_Schema);
            var id = requestObject._id;
            delete requestObject._id;

            if (id) {
                // update
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.at = Math.round(new Date().getTime() / 1000);
                var update_template = await templateConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                if (update_template) {
                    requestObject.template_id = id;
                    addChangeTemplateHistory("Insert", requestObject, decodedToken, requestObject.updated_at);
                    res.send({ status: true, message: "Template updated successfully", data: update_template });
                } else {
                    res.send({ status: false, message: translator.getStr('SomethingWrong') });
                }
            } else {
                // insert
                requestObject.created_by = decodedToken.UserData._id;
                requestObject.created_at = Math.round(new Date().getTime() / 1000);
                requestObject.updated_by = decodedToken.UserData._id;
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                var add_template = new templateConnection(requestObject);
                var save_template = await add_template.save();

                if (save_template) {
                    requestObject.template_id = save_template._id;
                    addChangeTemplateHistory("Insert", requestObject, decodedToken, requestObject.updated_at);
                    res.send({ status: true, message: "Template saved successfully", data: update_template });
                } else {
                    res.send({ status: false, message: translator.getStr('SomethingWrong') });
                }
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });

    }

};

//get template

module.exports.gettemplate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.decodedJWT(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var templateConnection = connection_db_api.model(collectionConstant.INVOICE_TEMPLATE, template_Schema);
            var getdata = await templateConnection.find({ is_delete: 0 });
            if (getdata) {
                res.send({ status: true, message: "Template data", data: getdata });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

// Template history

async function addChangeTemplateHistory(action, data, decodedToken, updated_at) {

    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var templateconnection = connection_db_api.model(historyCollectionConstant.TEMPLATE_HISTORY, template_history_Schema);
        data.action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = updated_at;
        data.history_created_by = decodedToken.UserData._id;
        var addtemplate_history = new templateconnection(data);
        var savetemplatehistory = addtemplate_history.save();

    } catch (e) {
        console.log(e);
        res.send({ message: translator.getStr('SomethingWrong'), status: false });
    }
}



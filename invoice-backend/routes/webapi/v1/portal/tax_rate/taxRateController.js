var taxRateSchema = require('./../../../../../model/tax_rate');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

module.exports.getTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            let get_data = await taxRateConnection.find({ is_delete: 0 });
            res.send({ status: true, message: 'Tax rate data', data: get_data });
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

// NOTE: need to check duplication of name before update or save
module.exports.saveTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            let id = requestObject._id;
            delete requestObject._id;
            if (id) {
                //Update
                let update_data = await taxRateConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                res.send({ status: true, message: 'Tax rate updated successfully.', data: update_data });
            } else {
                //Insert 
                let add_tax_rate = new taxRateConnection(requestObject);
                let save_tax_rate = await add_tax_rate.save();
                res.send({ status: true, message: 'Tax rate saved successfully.', data: save_tax_rate });
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

module.exports.deleteTaxRate = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            let taxRateConnection = connection_db_api.model(collectionConstant.INVOICE_TAX_RATE, taxRateSchema);
            let update_data = await taxRateConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            let isDelete = update_data.nModified;
            if (isDelete == 0) {
                res.send({ status: false, message: 'There is no data with this id.' });
            } else {
                res.send({ status: true, message: 'Tax rate deleted successfully.', data: update_data });
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
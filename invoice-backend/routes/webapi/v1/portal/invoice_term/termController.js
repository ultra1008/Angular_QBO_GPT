var termSchema = require('./../../../../../model/invoice_term');
let db_connection = require('./../../../../../controller/common/connectiondb');
let config = require('./../../../../../config/config');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

//save term
module.exports.saveTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            var get_one = await termConnection.findOne({ "name": requestObject.name, is_delete: 0 });
            var id = requestObject._id;
            delete requestObject._id;
            if (id) {
                if (get_one != null) {
                    if (get_one._id == id) {
                        let update_term = await termConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (update_term) {
                            res.send({ status: true, message: "Term update succesfully", data: update_term });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ status: false, message: "Term is already exist" });
                    }
                } else {
                    let update_term = await termConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (update_term) {
                        res.send({ status: true, message: "Term update succesfull", data: update_term });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }

            } else {
                if (get_one == null) {
                    let add_term = new termConnection(requestObject);
                    let save_term = await add_term.save();
                    if (save_term) {
                        res.send({ status: true, message: "Term saved successfully", data: save_term });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ status: false, message: "Term is already exist" });
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

// get term
module.exports.getTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            let get_data = await termConnection.find({ is_delete: 0 }).sort({ name: 1 }).collation({ locale: "en_US" });
            res.send({ status: true, message: "Term data", data: get_data });
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

// delete term
module.exports.deleteTerm = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.Language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            let termConnection = connection_db_api.model(collectionConstant.INVOICE_TERM, termSchema);
            let update_data = await termConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            let isDelete = update_data.nModified;
            if (update_data) {
                if (isDelete == 0) {
                    res.send({ status: false, message: 'There is no data with this id.' });
                } else {
                    res.send({ status: true, message: 'Term deleted successfully.', data: update_data });
                }
            } else {
                res.send({ status: false, message: "something wrong" });
            }
        } catch (e) {
            console.log(e);
            res.send({ status: false, message: "something wrong", error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: "invalid user" });
    }
};
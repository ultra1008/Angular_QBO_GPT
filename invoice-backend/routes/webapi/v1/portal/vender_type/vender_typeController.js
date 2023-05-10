var vendertypeSchema = require('../../../../../model/vender_type');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

// vender type insert Edit 
module.exports.savevendertype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var vendertypeConnection = connection_db_api.model(collectionConstant.VENDER_TYPE, vendertypeSchema);
            let id = requestObject._id;
            delete requestObject._id;

            let get_data = await vendertypeConnection.findOne({ name: requestObject.name, is_delete: 0 });

            if (id) {
                //update invoice vender type
                if (get_data != null) {
                    if (get_data._id == id) {
                        let updatevendertype = await vendertypeConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                        if (updatevendertype) {
                            res.send({ status: true, message: "vender type update successfully..!" });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: "vender type allready exist", status: false });

                    }
                } else {
                    let updatevendertype = await vendertypeConnection.updateOne({ _id: ObjectID(id) }, requestObject);
                    if (updatevendertype) {
                        res.send({ status: true, message: "vender type update succesfully..!" });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });

                    }
                }

            }
            else {
                //insert invoice vender type

                var nameexist = await vendertypeConnection.findOne({ "name": requestObject.name });
                if (nameexist) {
                    res.send({ status: false, message: "vender type allready exist" });
                }
                else {
                    var add_vendertype = new vendertypeConnection(requestObject);
                    var save_vendertype = await add_vendertype.save();
                    res.send({ status: true, message: "vender type insert successfully..!", data: add_vendertype });
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


// get invoice_vendertype

module.exports.getvendertype = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var vendertypeConnection = connection_db_api.model(collectionConstant.VENDER_TYPE, vendertypeSchema);
            let get_data = await vendertypeConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get vender type", data: get_data });

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

//delete invoice vendertype

module.exports.deletevendertype = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var vendertypeConnection = connection_db_api.model(collectionConstant.VENDER_TYPE, vendertypeSchema);
            let updated_data = await vendertypeConnection.updateOne({ _id: ObjectID(id) }, { is_delete: 1 });
            var is_delete = updated_data.nModified;
            if (is_delete == 0) {
                res.send({ status: false, message: "There is no data with this id" });
            }
            else {
                res.send({ status: true, message: "vender type deleted successfully..!", data: updated_data });

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
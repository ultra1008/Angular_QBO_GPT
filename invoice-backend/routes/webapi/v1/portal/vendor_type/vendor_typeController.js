var vendortypeSchema = require('../../../../../model/vendor_type');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

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
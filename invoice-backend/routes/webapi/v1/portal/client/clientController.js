var clientSchema = require('../../../../../model/client');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var client_history_Schema = require('../../../../../model/history/client_history');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
let config = require('../../../../../config/config');
var ObjectID = require('mongodb').ObjectID;

// client insert Edit 
module.exports.saveclient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            let id = requestObject._id;
            delete requestObject._id;
            if (id) {
                let one_client = await clientConnection.findOne({ _id: ObjectID(id) });
                //update invoice client
                let updateclient = await clientConnection.updateOne({ _id: id }, requestObject);
                if (updateclient) {

                    // find difference of object 
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, one_client._doc);
                    for (let i = 0; i < updatedData.length; i++) {
                        updatedData[i]['key'] = translator.getStr(` Client_History.${updatedData[i]['key']}`);
                    }
                    let histioryObject = {
                        data: updatedData,
                        client_id: id,
                    };
                    addClientHistory("Update", histioryObject, decodedToken);

                    res.send({ status: true, message: "client update successfully..!" });
                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
            else {
                //insert invoice client

                var nameexist = await clientConnection.findOne({ "client_name": requestObject.client_name });
                if (nameexist) {
                    res.send({ status: false, message: "client allready exist" });
                }
                else {
                    var add_client = new clientConnection(requestObject);
                    var save_client = await add_client.save();


                    // find difference of object 
                    let insertedData = await common.setInsertedFieldHistory(requestObject);

                    for (let i = 0; i < insertedData.length; i++) {
                        insertedData[i]['key'] = translator.getStr(`Client_History.${insertedData[i]['key']}`);
                    }
                    let histioryObject = {
                        data: insertedData,
                        client_id: save_client.id,
                    };
                    addClientHistory("Insert", histioryObject, decodedToken);
                    res.send({ status: true, message: "client insert successfully..!", data: add_client });

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

// get client
module.exports.getclient = async function (req, res) {

    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            let get_data = await clientConnection.find({ is_delete: 0 });
            res.send({ status: true, message: "Get client", data: get_data });

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

//delete client
module.exports.deleteclient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {

            var requestObject = req.body;
            let id = requestObject._id;
            delete requestObject._id;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);

            requestObject.client_updated_by = decodedToken.UserData._id;
            requestObject.client_updated_at = Math.round(new Date().getTime() / 1000);

            var one_client = await clientConnection.findOne({ _id: ObjectID(id) });

            if (one_client) {
                var delete_client = await clientConnection.updateMany({ _id: id }, { is_delete: requestObject.is_delete });

                if (delete_client) {
                    let action = '';
                    let message = '';
                    if (requestObject.is_delete == 1) {
                        action = "Archive";
                        message = "client archive successfully";
                    } else {
                        action = "Restore";
                        message = "client restore successfully";
                    }

                    let histioryObject = {
                        data: [],
                        client_id: id,
                    };

                    addClientHistory(action, histioryObject, decodedToken);
                    res.send({ message: message, status: true });

                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                res.send({ message: "client not found with this id.", status: false });
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

// client history function
async function addClientHistory(action, data, decodedToken) {
    var connection_db_api = await db_connection.connection_db_api(decodedToken);
    try {
        var client_history_connection = connection_db_api.model(historyCollectionConstant.INVOICE_CLIENT_HISTORY, client_history_Schema);
        data.action = action;
        data.taken_device = config.WEB_ALL;
        data.history_created_at = Math.round(new Date().getTime() / 1000);
        data.history_created_by = decodedToken.UserData._id;
        var add_client_history = new client_history_connection(data);
        var save_client_history = add_client_history.save();
    } catch (e) {
        console.log(e);
    } finally {
        // connection_db_api.close();
    }
}

module.exports.getClinetHistory = async function (req, res) {
    var translator = new common.Language('en');
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let perpage = 10;
            if (requestObject.start) { } else {
                requestObject.start = 0;
            }
            let start = requestObject.start == 0 ? 0 : perpage * requestObject.start;
            var client_history_connection = connection_db_api.model(historyCollectionConstant.INVOICE_CLIENT_HISTORY, client_history_Schema);
            let get_data = await client_history_connection.aggregate([
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_CLIENT,
                        localField: "client_id",
                        foreignField: "_id",
                        as: "client_id"
                    }
                },
                { $unwind: "$client_id" },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "history_created_by",
                        foreignField: "_id",
                        as: "history_created_by"
                    }
                },
                { $unwind: "$history_created_by" },
                { $sort: { history_created_at: -1 } },
                { $limit: perpage + start },
                { $skip: start }
            ]);
            res.send({ data: get_data, status: true });
        } catch (e) {
            console.log("e", e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
//client active or inactive
module.exports.updateClientStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var requestObject = req.body;
            var id = requestObject._id;
            delete requestObject._id;

            var one_client = await clientConnection.findOne({ _id: ObjectID(id) });
            if (one_client) {
                var updateStatus = await clientConnection.updateMany({ _id: requestObject.id }, { client_status: requestObject.client_status });

                if (updateStatus) {
                    let action = '';
                    let message = '';
                    if (requestObject.client_status == 1) {
                        action = "Active";
                        message = "client status active successfully.";
                    } else {
                        action = "Inactive";
                        message = "client status inactive successfully.";
                    }

                    let histioryObject = {
                        data: [],
                        client_id: id,
                    };

                    addClientHistory(action, histioryObject, decodedToken);

                    res.send({ message: message, status: true });

                } else {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else {
                res.send({ message: "client not found with this id.", status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });

        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//multiple client active or inactive
module.exports.updateMultipleClientStatus = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var requestObject = req.body;

            var updateStatus = await clientConnection.updateMany({ _id: { $in: requestObject._id } }, { client_status: requestObject.client_status });

            if (updateStatus) {
                let action = '';
                let message = '';
                if (requestObject.client_status == 1) {
                    action = "Active";
                    message = "client status active successfully.";
                } else {
                    action = "Inactive";
                    message = "client status inactive successfully.";
                }

                for (let i = 0; i < requestObject._id.length; i++) {
                    let histioryObject = {
                        data: [],
                        client_id: requestObject._id[i],
                    };

                    addClientHistory(action, histioryObject, decodedToken);
                }
                res.send({ message: message, status: true });

            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });

        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};

//multiple delete client
module.exports.deleteMultipleClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;

            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);


            requestObject.client_updated_by = decodedToken.UserData._id;
            requestObject.client_updated_at = Math.round(new Date().getTime() / 1000);
            var delete_client = await clientConnection.updateMany({ _id: { $in: requestObject._id } }, { is_delete: requestObject.is_delete });

            if (delete_client) {
                let action = '';
                let message = '';
                if (requestObject.is_delete == 1) {
                    action = "Archive";
                    message = "client archive successfully";
                } else {
                    action = "Restore";
                    message = "client restore successfully";
                }

                for (let i = 0; i < requestObject._id.length; i++) {
                    //var one_client = await clientConnection.findOne({ _id: ObjectID(requestObject._id[i]) });

                    let histioryObject = {
                        data: [],
                        client_id: requestObject._id[i],
                    };

                    addClientHistory(action, histioryObject, decodedToken);
                }
                res.send({ message: message, status: true });

            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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

module.exports.getClientForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            let query_where = {
                is_delete: requestObject.is_delete,

            };
            var getdata = await clientConnection.aggregate([
                {
                    $match: query_where
                },
                {
                    $lookup: {
                        from: collectionConstant.INVOICE_USER,
                        localField: "approver_id",
                        foreignField: "_id",
                        as: "invoice_user"
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: "$invoice_user"
                    }
                },
                {
                    $lookup: {
                        from: collectionConstant.COSTCODES,
                        localField: "client_cost_cost_id",
                        foreignField: "_id",
                        as: "costcode"
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: "$costcode"
                    }
                },
                {
                    $project: {
                        client_name: 1,
                        client_number: 1,
                        client_email: 1,
                        client_status: 1,
                        client_notes: 1,
                        gl_account: 1,
                        is_delete: 1,
                        approver_id: 1,
                        client_cost_cost_id: 1,
                        approver: {
                            _id: "$invoice_user._id",
                            userfullname: "$invoice_user.userfullname",

                        },
                        client_cost_cost: {
                            _id: "$costcode._id",
                            cost_code: "$costcode.cost_code",

                        }
                    }
                }
            ]);
            // var getdata = await clientConnection.find({ is_delete: requestObject.is_delete });
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


//get one invoice client
module.exports.getOneClient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);

            var getdata = await clientConnection.findOne({ _id: requestObject._id });
            if (getdata) {
                res.send({ status: true, message: "Client data", data: getdata });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), status: false, error: e });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};






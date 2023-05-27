var clientSchema = require('../../../../../model/client');
var userSchema = require('../../../../../model/user');
var costCodeSchema = require('../../../../../model/invoice_cost_code');
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
let common = require('../../../../../controller/common/common');
var client_history_Schema = require('../../../../../model/history/client_history');
const historyCollectionConstant = require('../../../../../config/historyCollectionConstant');
let config = require('../../../../../config/config');
var ObjectID = require('mongodb').ObjectID;
var formidable = require('formidable');
const reader = require('xlsx');
const _ = require("lodash");

// client insert Edit 
module.exports.saveclient = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            var userConnection = connection_db_api.model(collectionConstant.INVOICE_USER, userSchema);
            var costCodeConnection = connection_db_api.model(collectionConstant.COSTCODES, costCodeSchema);

            let id = requestObject._id;
            delete requestObject._id;
            if (id) {
                let one_client = await clientConnection.findOne({ _id: ObjectID(id) });
                //update invoice client
                requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                let updateclient = await clientConnection.updateOne({ _id: id }, requestObject);
                if (updateclient) {
                    // find difference of object 
                    let updatedData = await common.findUpdatedFieldHistory(requestObject, one_client._doc);

                    if (requestObject.approver_id !== '') {
                        let found_approver = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'approver_id'; });
                        if (found_approver != -1) {
                            let one_term = await userConnection.findOne({ _id: ObjectID(updatedData[found_approver].value) });
                            updatedData[found_approver].value = one_term.userfullname;
                        }
                    }

                    if (requestObject.client_cost_cost_id !== '') {
                        let found_costcode = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'client_cost_cost_id'; });
                        if (found_costcode != -1) {
                            let one_term = await costCodeConnection.findOne({ _id: ObjectID(updatedData[found_costcode].value) });
                            updatedData[found_costcode].value = one_term.value;
                        }
                    }

                    let found_status = _.findIndex(updatedData, function (tmp_data) { return tmp_data.key == 'client_status'; });
                    if (found_status != -1) {
                        updatedData[found_status].value = updatedData[found_status].value == 1 ? 'Active' : updatedData[found_status].value == 2 ? 'Inactive' : '';
                    }

                    for (let i = 0; i < updatedData.length; i++) {
                        updatedData[i]['key'] = translator.getStr(`Client_History.${updatedData[i]['key']}`);
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
                } else {
                    requestObject.created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.updated_at = Math.round(new Date().getTime() / 1000);
                    var add_client = new clientConnection(requestObject);
                    var save_client = await add_client.save();
                    // find difference of object 
                    let insertedData = await common.setInsertedFieldHistory(requestObject);

                    if (requestObject.approver_id !== '') {
                        let found_approver = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'approver_id'; });
                        if (found_approver != -1) {
                            let one_term = await userConnection.findOne({ _id: ObjectID(insertedData[found_approver].value) });
                            insertedData[found_approver].value = one_term.userfullname;
                        }
                    }

                    if (requestObject.client_cost_cost_id !== '') {
                        let found_costcode = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'client_cost_cost_id'; });
                        if (found_costcode != -1) {
                            let one_term = await costCodeConnection.findOne({ _id: ObjectID(insertedData[found_costcode].value) });
                            insertedData[found_costcode].value = one_term.value;
                        }
                    }

                    let found_status = _.findIndex(insertedData, function (tmp_data) { return tmp_data.key == 'client_status'; });
                    if (found_status != -1) {
                        insertedData[found_status].value = insertedData[found_status].value == 1 ? 'Active' : insertedData[found_status].value == 2 ? 'Inactive' : '';
                    }

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
                        message = "Client archive successfully.";
                    } else {
                        action = "Restore";
                        message = "Client restore successfully.";
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
        var save_client_history = await add_client_history.save();
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
                $sort: { created_at: -1 }

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
                        approver: "$invoice_user",
                        client_cost_cost: "$costcode",
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

// bulk upload 
module.exports.importClientname = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var clientConnection = connection_db_api.model(collectionConstant.INVOICE_CLIENT, clientSchema);
            console.log("hdh");
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
                            onecategory_main = await clientConnection.findOne({ client_name: data[m].client_name }, { client_name: 1 });
                            if (onecategory_main != null) {
                                exitdata[m] = onecategory_main.client_name;
                            }
                        }
                        if (exitdata.length > 0) {
                            res.send({ status: false, exitdata: exitdata, message: "client name is allready exist." });
                        }
                        else {
                            for (let m = 0; m < data.length; m++) {
                                onecategory_main = await clientConnection.findOne({ client_name: data[m].client_name }, { client_name: 1 });
                                requestObject = {};
                                requestObject.client_name = data[m].client_name;
                                requestObject.client_number = data[m].client_number;
                                requestObject.client_email = data[m].client_email;
                                requestObject.client_notes = data[m].client_notes;
                                requestObject.approver_id = data[m].approver_id;
                                requestObject.gl_account = data[m].gl_account;
                                requestObject.client_cost_cost_id = data[m].client_cost_cost_id;
                                let add_clinetname = new clientConnection(requestObject);
                                let save_clinetname = await add_clinetname.save();

                            }
                            res.send({ status: true, message: "client name info add successfully." });
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






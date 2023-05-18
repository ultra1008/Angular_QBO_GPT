var jobtitleSchema = require('./../../../../../model/job_title');
var userSchema = require('./../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getAlljob_title = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let jobtitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobtitleSchema);
            let all_jobtitle = await jobtitleCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('JobTitleListing'), data: all_jobtitle, status: true });
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

module.exports.saveJobTitle = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let jobtitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobtitleSchema);
            let get_one = await jobtitleCollection.findOne({ job_title_name: requestObject.job_title_name, is_delete: 0 });
            if (requestObject._id) {
                if (get_one != null) {
                    if (get_one._id == requestObject._id) {
                        let update_doc_type = await jobtitleCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                        if (update_doc_type) {
                            res.send({ message: translator.getStr('JobTitleUpdated'), data: update_doc_type, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('JobTitleAlreadyExist'), status: false });
                    }
                } else {
                    let update_doc_type = await jobtitleCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                    if (update_doc_type) {
                        res.send({ message: translator.getStr('JobTitleUpdated'), data: update_doc_type, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    let add_job_title = new jobtitleCollection(requestObject);
                    let save_job_title = await add_job_title.save();
                    if (save_job_title) {
                        res.send({ message: translator.getStr('JobTitleAdded'), data: save_job_title, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('JobTitleAlreadyExist'), status: false });
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

module.exports.deleteJobTitle = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let userCollection = connection_db_api.model(collectionConstant.USER, userSchema);
            let userObject = await userCollection.find({ userjob_title_id: ObjectID(req.body._id) });
            if (userObject.length > 0) {
                res.send({ message: translator.getStr('JobTitleHasData'), status: false });
            } else {
                let jobtitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobtitleSchema);
                let jobTitleObject = await jobtitleCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 });
                if (jobTitleObject) {
                    res.send({ message: translator.getStr('JobTitleDeleted'), status: true });
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

module.exports.getJobTitleForTable = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let jobtitleCollection = connection_db_api.model(collectionConstant.JOB_TITLE, jobtitleSchema);
            var getdata = await jobtitleCollection.find({ is_delete: requestObject.is_delete });
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
var jobtypeSchema = require('./../../../../../model/job_type');
var userSchema = require('./../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getAlljob_type = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let jobtypeCollection = connection_db_api.model(collectionConstant.JOB_TYPE, jobtypeSchema);
            let all_jobtype = await jobtypeCollection.find({});
            res.send({ message: translator.getStr('JobTypeListing'), data: all_jobtype, status: true });
        } catch (e)
        {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally
        {
            connection_db_api.close()
        }
    } else
    {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.savejobtype = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            var requestObject = req.body;

            let jobtypeCollection = connection_db_api.model(collectionConstant.JOB_TYPE, jobtypeSchema);
            if (requestObject._id)
            {
                let update_job_type = await jobtypeCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                console.log(update_job_type);
                if (update_job_type)
                {
                    res.send({ message: translator.getStr('JobTypeUpdated'), data: update_job_type, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else
            {
                let add_job_type = new jobtypeCollection(requestObject);
                let save_job_type = await add_job_type.save();
                if (save_job_type)
                {
                    res.send({ message: translator.getStr('JobTypeAdded'), data: save_job_type, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e)
        {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally
        {
            connection_db_api.close()
        }
    } else
    {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};

module.exports.deletejobtype = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let userCollection = connection_db_api.model(collectionConstant.USER, userSchema);
            let userObject = await userCollection.find({ userjob_type_id: ObjectID(req.body._id) });
            if (userObject.length > 0)
            {
                res.send({ message: translator.getStr('JobTypeHasData'), status: false });
            } else
            {
                let jobtypeCollection = connection_db_api.model(collectionConstant.JOB_TYPE, jobtypeSchema);
                let jobTypeObject = await jobtypeCollection.remove({ _id: ObjectID(req.body._id) });
                if (jobTypeObject)
                {
                    res.send({ message: translator.getStr('JobTypeDeleted'), status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e)
        {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally
        {
            connection_db_api.close()
        }
    } else
    {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
var departmentSchema = require('./../../../../../model/departments');
var userSchema = require('./../../../../../model/user');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getalldepartment = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
            let all_department = await departmentCollection.find();
            res.send({ message: translator.getStr('DepartmentListing'), data: all_department, status: true });
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

module.exports.savedepartment = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            var requestObject = req.body;

            let departmentCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
            if (requestObject._id)
            {
                let update_doc_type = await departmentCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                console.log(update_doc_type);
                if (update_doc_type)
                {
                    res.send({ message: translator.getStr('DepartmentUpdated'), data: update_doc_type, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else
            {
                let add_doc_type = new departmentCollection(requestObject);
                let save_doc_type = await add_doc_type.save();
                if (save_doc_type)
                {
                    res.send({ message: translator.getStr('DepartmentAdded'), data: save_doc_type, status: true });
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

module.exports.deleteDepartment = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let userCollection = connection_db_api.model(collectionConstant.USER, userSchema);
            let userObject = await userCollection.find({ userdepartment_id: ObjectID(req.body._id) });
            if (userObject.length > 0)
            {
                res.send({ message: translator.getStr('DepartmentHasData'), status: false });
            } else
            {
                let documenttypeCollection = connection_db_api.model(collectionConstant.DEPARTMENTS, departmentSchema);
                let departmentObject = await documenttypeCollection.remove({ _id: ObjectID(req.body._id) });
                if (departmentObject)
                {
                    res.send({ message: translator.getStr('DepartmentDeleted'), status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            }
        } catch (e)
        {
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
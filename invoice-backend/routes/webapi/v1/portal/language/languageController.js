var languageSchema = require('../../../../../model/language');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var common = require("../../../../../controller/common/common");
let db_connection = require('../../../../../controller/common/connectiondb');
let collectionConstant = require('../../../../../config/collectionConstant');
//let activityController = require("../todaysActivity/todaysActivityController");

module.exports.getlanguage = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            let all_language = await lanaguageCollection.find({ is_delete: 0 }).sort({ name: 1 });
            res.send({ message: translator.getStr('LanguageListing'), data: all_language, status: true });
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

module.exports.savelanguage = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            var requestObject = req.body;

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            if (requestObject._id)
            {
                let update_language = await lanaguageCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                if (update_language)
                {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageUpdated'), data: update_language, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else
            {
                let add_language = new lanaguageCollection(requestObject);
                let save_language = await add_language.save();
                if (save_language)
                {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageAdded'), data: save_language, status: true });
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

module.exports.deletelanguage = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            requestObject = req.body;

            let lanaguageCollection = connection_db_api.model(collectionConstant.LANGUAGE, languageSchema);
            let update_language = await lanaguageCollection.updateOne({ _id: ObjectID(requestObject._id) }, { is_delete: 1 });
            let isDelete = update_language.nModified;
            if (update_language)
            {
                if (isDelete == 0)
                {
                    res.send({ message: translator.getStr('NoDataWithId'), status: false });
                } else
                {
                    //activityController.updateAllUser({ "api_setting.term": true }, decodedToken);
                    res.send({ message: translator.getStr('LanguageDeleted'), status: true });
                }
            } else
            {
                console.log(e);
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
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
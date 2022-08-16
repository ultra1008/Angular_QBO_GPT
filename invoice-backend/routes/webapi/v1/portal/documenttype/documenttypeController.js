var documenttypeSchema = require('./../../../../../model/document_type');
var userdocSchema = require('./../../../../../model/userdocument');
var ObjectID = require('mongodb').ObjectID;
var common = require("./../../../../../controller/common/common");
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getalldoctype = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {

            let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
            let all_documenttype = await documenttypeCollection.find();
            res.send({ message: translator.getStr('DocumentTypeListing'), data: all_documenttype, status: true });
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

module.exports.saveDocType = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            var requestObject = req.body;

            let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
            if (requestObject._id)
            {
                let update_doc_type = await documenttypeCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                console.log(update_doc_type);
                if (update_doc_type)
                {
                    res.send({ message: translator.getStr('DocumentTypeUpdated'), data: update_doc_type, status: true });
                } else
                {
                    res.send({ message: translator.getStr('SomethingWrong'), status: false });
                }
            } else
            {
                let add_doc_type = new documenttypeCollection(requestObject);
                let save_doc_type = await add_doc_type.save();
                if (save_doc_type)
                {
                    res.send({ message: translator.getStr('DocumentTypeAdded'), data: save_doc_type, status: true });
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

module.exports.deleteDocType = async function (req, res)
{
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken)
    {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try
        {
            let connection_db_api = await db_connection.connection_db_api(decodedToken);
            let userdocCollection = connection_db_api.model(collectionConstant.USERDOCUMENT, userdocSchema);
            let userdocObject = await userdocCollection.find({ userdocument_type_id: ObjectID(req.body._id) });
            if (userdocObject.length > 0)
            {
                res.send({ message: translator.getStr('DocumentTypeHasData'), status: false });
            } else
            {
                let documenttypeCollection = connection_db_api.model(collectionConstant.DOCUMENTTYPE, documenttypeSchema);
                let taskObject = await documenttypeCollection.remove({ _id: ObjectID(req.body._id) });
                if (taskObject)
                {
                    res.send({ message: translator.getStr('DocumentTypeDeleted'), status: true });
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
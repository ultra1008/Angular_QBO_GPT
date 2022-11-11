var relationshipSchema = require('../../../../../model/relationships');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('../../../../../controller/common/connectiondb');
let common = require('../../../../../controller/common/common');
let collectionConstant = require('../../../../../config/collectionConstant');

module.exports.getAllRelationships = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            let all_relationships = await relationshipsCollection.find({ is_delete: 0 });
            res.send({ message: translator.getStr('RelationshipListing'), data: all_relationships, status: true });
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

module.exports.saveRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var requestObject = req.body;
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            let get_one = await relationshipsCollection.findOne({ relationship_name: requestObject.relationship_name, is_delete: 0 });
            if (requestObject._id) {
                requestObject.relationship_updated_at = Math.round(new Date().getTime() / 1000);
                requestObject.relationship_updated_by = decodedToken.UserData._id;
                if (get_one != null) {
                    if (get_one._id == requestObject._id) {
                        let update_relationship = await relationshipsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                        if (update_relationship) {
                            res.send({ message: translator.getStr('RelationshipUpdated'), data: update_relationship, status: true });
                        } else {
                            res.send({ message: translator.getStr('SomethingWrong'), status: false });
                        }
                    } else {
                        res.send({ message: translator.getStr('RelationshipAlreadyExist'), status: false });
                    }
                } else {
                    let update_relationship = await relationshipsCollection.updateOne({ _id: ObjectID(requestObject._id) }, requestObject);
                    if (update_relationship) {
                        res.send({ message: translator.getStr('RelationshipUpdated'), data: update_relationship, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                }
            } else {
                if (get_one == null) {
                    requestObject.relationship_created_at = Math.round(new Date().getTime() / 1000);
                    requestObject.relationship_created_by = decodedToken.UserData._id;
                    requestObject.relationship_updated_at = Math.round(new Date().getTime() / 1000);
                    requestObject.relationship_updated_by = decodedToken.UserData._id;
                    let add_relationship = new relationshipsCollection(requestObject);
                    let save_relationship = await add_relationship.save();
                    if (save_relationship) {
                        res.send({ message: translator.getStr('RelationshipAdded'), data: save_relationship, status: true });
                    } else {
                        res.send({ message: translator.getStr('SomethingWrong'), status: false });
                    }
                } else {
                    res.send({ message: translator.getStr('RelationshipAlreadyExist'), status: false });
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

module.exports.deleteRelationship = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = new common.Language(req.headers.language);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            let jobTitleObject = await relationshipsCollection.updateOne({ _id: ObjectID(req.body._id) }, { is_delete: 1 });
            if (jobTitleObject) {
                res.send({ message: translator.getStr('RelationshipDeleted'), status: true });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), status: false });
            }
        } catch (e) {
            console.log("e: ", e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: translator.getStr('InvalidUser'), status: false });
    }
};
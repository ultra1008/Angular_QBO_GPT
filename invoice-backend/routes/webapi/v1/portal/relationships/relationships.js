var relationshipSchema = require('./../../../../../model/relationships');
var ObjectID = require('mongodb').ObjectID;
let db_connection = require('./../../../../../controller/common/connectiondb');
let common = require('./../../../../../controller/common/common');
let collectionConstant = require('./../../../../../config/collectionConstant');

module.exports.getAllRelationships = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    if (decodedToken) {
        let connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            let relationshipsCollection = connection_db_api.model(collectionConstant.RELATIONSHIP, relationshipSchema);
            let all_relationships = await relationshipsCollection.find({});
            res.send({ message: "Relationships", data: all_relationships, status: true });
        } catch (e) {
            console.log(e);
            res.send({ message: "Something went wrong.!", error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    } else {
        res.send({ message: "Invalid user for this action", status: false });
    }
};
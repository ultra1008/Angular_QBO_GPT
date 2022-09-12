var invoice_Schema = require('./../../../../../model/invoice');
let db_connection = require('./../../../../../controller/common/connectiondb');
let collectionConstant = require('./../../../../../config/collectionConstant');
let common = require('./../../../../../controller/common/common');
var ObjectID = require('mongodb').ObjectID;

//get dashboard count

module.exports.getdashboardcount = async function (req, res) {
    var decodedToken = common.decodedJWT(req.headers.authorization);
    var translator = common.Language(req.headers.Language);

    if (decodedToken) {
        var connection_db_api = await db_connection.connection_db_api(decodedToken);
        try {
            var invoicesConnection = connection_db_api.model(collectionConstant.INVOICE, invoice_Schema);
            // var get_data = await invoicesConnection.find({ is_delete: 0 });
            var get_data = await invoicesConnection.aggregate([
                {
                    $project: {
                        pending: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                        generated: { $cond: [{ $eq: ["$status", "Generated"] }, 1, 0] },
                        approved: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                        rejected: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                        late: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
                        // pending: { $eq: ["$status", "Pending"] },
                        "vendor_name": 1,
                        "status": 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        pending: { $sum: "$pending" },
                        generated: { $sum: "$generated" },
                        approved: { $sum: "$approved" },
                        rejected: { $sum: "$rejected" },
                        late: { $sum: "$late" },
                    }
                },
            ]);

            if (get_data) {
                if (get_data.length > 0) {
                    get_data = get_data[0];
                } else {
                    get_data = { _id: null, pending: 0, generated: 0, approved: 0, rejected: 0, late: 0, };
                }
                res.send({ status: true, message: "Invoice data", data: get_data });
            } else {
                res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
            }
        } catch (e) {
            console.log(e);
            res.send({ message: translator.getStr('SomethingWrong'), error: e, status: false });
        } finally {
            connection_db_api.close();
        }
    }
    else {
        res.send({ status: false, message: translator.getStr('InvalidUser') });
    }
};
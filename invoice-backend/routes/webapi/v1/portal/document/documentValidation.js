var validator = require("../../../../../controller/common/validationforrequest");

const deleteDocumentValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "userdocument_url" : "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err,
            });
        } else {
            next();
        }
    });
}

module.exports = {
    deleteDocumentValidation,
}
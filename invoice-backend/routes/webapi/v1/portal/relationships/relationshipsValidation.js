var validator = require("../../../../../controller/common/validationforrequest");

const relationshipValidation = (req, res, next) => {
    const validationRule = {
        "relationship_name": "required|string"
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

const relationshipDeleteValidation = (req, res, next) => {
    const validationRule = {
        "_id": "required|string"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err
            });
        } else {
            next();
        }
    });
}

module.exports = {
    relationshipValidation,
    relationshipDeleteValidation
}
var validator = require("../../../../../controller/common/validationforrequest");

const jobTypeValidation = (req, res, next) => {
    const validationRule = {
        "job_type_name": "required|string"
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

const jobTypeDeleteValidation = (req, res, next) => {
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
    jobTypeValidation,
    jobTypeDeleteValidation
}
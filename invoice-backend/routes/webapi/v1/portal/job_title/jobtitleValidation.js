var validator = require("../../../../../controller/common/validationforrequest");

const jobtitleValidation = (req, res, next) => {
    const validationRule = {
        "job_title_name": "required|string"
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

const jobtitleDeleteValidation = (req, res, next) => {
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
    jobtitleValidation,
    jobtitleDeleteValidation
}
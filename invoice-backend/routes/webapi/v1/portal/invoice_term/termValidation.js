var validator = require('./../../../../../controller/common/validationforrequest');

const saveterm = (req, res, next) => {
    const validationRule = {
        "name": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

const deleteterm = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        }
        else {
            next();
        }
    });
};

module.exports = { saveterm, deleteterm };
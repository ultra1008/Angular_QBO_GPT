var validator = require('./../../../../../controller/common/validationforrequest');

const getOneAPQuote = (req, res, next) => {
    const validationRule = {
        "_id": "required",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

module.exports = {
    getOneAPQuote,
};
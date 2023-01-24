var validator = require("../../../../../controller/common/validationforrequest");

const deleteInvoiceProcess = (req, res, next) => {
    const validationRule = {
        "ids": "required|Array"
    };
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
};

module.exports = {
    deleteInvoiceProcess,
};
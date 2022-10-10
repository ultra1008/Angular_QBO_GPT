var validator = require("../../../../../controller/common/validationforrequest");

const saveInvoice_Document = (req, res, next) => {
    const validationRule = {
        "name": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err
            });
        }
        else {
            next();
        }
    });
};

const deleteInvoice_Document = (req, res, next) => {
    const validationRule = {
        "_id": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: err
            });
        }
        else {
            next();
        }
    });
};
module.exports = { saveInvoice_Document, deleteInvoice_Document };
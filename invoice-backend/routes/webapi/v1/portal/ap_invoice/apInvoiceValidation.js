var validator = require('./../../../../../controller/common/validationforrequest');

const getAPInvoiceForTable = (req, res, next) => {
    const validationRule = {
        "is_delete": "required|integer",
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({ status: false, message: err });
        } else {
            next();
        }
    });
};

const getOneAPInvoice = (req, res, next) => {
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

const saveAPInvoiceNote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "notes": "required",
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

const deleteAPInvoiceNote = (req, res, next) => {
    const validationRule = {
        "invoice_id": "required",
        "_id": "required",
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

module.exports = {
    getAPInvoiceForTable,
    getOneAPInvoice,
    saveAPInvoiceNote,
    deleteAPInvoiceNote,
};
var validator = require('./../../../../../controller/common/validationforrequest');

const getOneInvoice = (req, res, next) => {
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

const deleteInvoice = (req, res, next) => {
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

const updateInvoiceStatus = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "status": "required",
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

const getOrphanDocuments = (req, res, next) => {
    const validationRule = {
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

const getInvoiceHistoryLog = (req, res, next) => {
    const validationRule = {
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

const saveInvoiceNotes = (req, res, next) => {
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

const deleteInvoiceNote = (req, res, next) => {
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

const saveInvoiceAttachment = (req, res, next) => {
    const validationRule = {
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

const savePackingSlipNotes = (req, res, next) => {
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

const deletePackingSlipNote = (req, res, next) => {
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

const savePackingSlipAttachment = (req, res, next) => {
    const validationRule = {
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

const savePONotes = (req, res, next) => {
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

const deletePONote = (req, res, next) => {
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

const savePOAttachment = (req, res, next) => {
    const validationRule = {
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

const saveQuoteNotes = (req, res, next) => {
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

const deleteQuoteNote = (req, res, next) => {
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

const saveQuoteAttachment = (req, res, next) => {
    const validationRule = {
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

const updateInvoiceRelatedDocument = (req, res, next) => {
    const validationRule = {
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
    getOneInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    getOrphanDocuments,
    getInvoiceHistoryLog,
    saveInvoiceNotes,
    deleteInvoiceNote,
    saveInvoiceAttachment,
    savePackingSlipNotes,
    deletePackingSlipNote,
    savePackingSlipAttachment,
    savePONotes,
    deletePONote,
    savePOAttachment,
    saveQuoteNotes,
    deleteQuoteNote,
    saveQuoteAttachment,
    updateInvoiceRelatedDocument,
};

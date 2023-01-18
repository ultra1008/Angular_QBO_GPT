var validator = require('./../../../../../controller/common/validationforrequest');

const getOneVendor = (req, res, next) => {
    const validationRule = {
        "_id": "required",
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, error: error });
        }
        else {
            next();
        }
    });
};

const saveVendor = (req, res, next) => {
    const validationRule = {
        "vendor_name": "required",
        "phone": "required",
        "email": "required",
        "address": "required",
        "city": "required",
        "state": "required",
        "zipcode": "required",
        "terms_id": "required",
        "image": "required",
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, error: error });
        }
        else {
            next();
        }
    });
};

const deleteVendor = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "is_delete": "required|integer"
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, error: error });
        }
        else {
            next();
        }
    });
};

const updateVendorStatus = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "status": "required"
    };
    validator(req.body, validationRule, {}, (error, status) => {
        if (!status) {
            res.send({ status: false, error: error });
        }
        else {
            next();
        }
    });
};

module.exports = {
    getOneVendor,
    saveVendor,
    deleteVendor,
    updateVendorStatus
};
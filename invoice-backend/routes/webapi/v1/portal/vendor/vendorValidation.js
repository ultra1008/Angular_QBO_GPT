var validator = require('./../../../../../controller/common/validationforrequest');


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
        "status": "required",
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
    saveVendor,
    deleteVendor,
    updateVendorStatus
};
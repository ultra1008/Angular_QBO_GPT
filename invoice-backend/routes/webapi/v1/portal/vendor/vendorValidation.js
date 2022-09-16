var validator = require('./../../../../../controller/common/validationforrequest');


const savevendor = (req, res, next) => {
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
        "vendor_id": "required",
        "customer_id": "required",
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

const deletevendor = (req, res, next) => {
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

const vendordatatable = (req, res, next) => {
    const validationRule = {
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

const updateStatus = (req, res, next) => {
    const validationRule = {
        "_id": "required",
        "status": "required|string"

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

module.exports = { savevendor, deletevendor, vendordatatable, updateStatus };
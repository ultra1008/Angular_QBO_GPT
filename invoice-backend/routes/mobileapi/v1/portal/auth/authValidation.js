var validator = require("../../../../../controller/common/validationforrequest");

const sendOTPforLoginValidation = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "companycode": "required|string"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
};
const submitEmailOTPforLoginValidation = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "companycode": "required|string",
        "otp": "required|string"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
};
const ChangePasswordValidation = (req, res, next) => {
    const validationRule = {
        "password": "required|confirmed",
        "oldpassword": "required|string",
        "password_confirmation": "required"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
};
const ForgetPasswordValidation = (req, res, next) => {
    const validationRule = {
        "useremail": "required|email",
        "companycode": "required|string"
    };
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.send({
                status: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
};
module.exports = {
    sendOTPforLoginValidation,
    submitEmailOTPforLoginValidation,
    ChangePasswordValidation,
    ForgetPasswordValidation
};
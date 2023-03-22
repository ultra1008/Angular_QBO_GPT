var express = require('express');
var router = express.Router();

let common = require("./../../../../controller/common/common");

var authController = require('./auth/authController');
var authValidation = require('./auth/authValidation');

router.post("/mobileapi/v1/sendOTPforLogin", authValidation.sendOTPforLoginValidation, authController.sendOTPforLogin);
router.post("/mobileapi/v1/submitEmailOTPforLogin", authValidation.submitEmailOTPforLoginValidation, authController.submitEmailOTPforLogin);
router.post("/mobileapi/v1/ChangePassword", authValidation.ChangePasswordValidation, authController.ChangePassword)
router.post("/mobileapi/v1/ForgetPassword", authValidation.ForgetPasswordValidation, authController.ForgetPassword)

module.exports = router;
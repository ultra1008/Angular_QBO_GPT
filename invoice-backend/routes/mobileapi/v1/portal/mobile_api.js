var express = require('express');
var router = express.Router();

let common = require("./../../../../controller/common/common");

var authController = require('./auth/authController');
var authValidation = require('./auth/authValidation');

router.post("/mobileapi/v1/sendOTPforLogin", authValidation.sendOTPforLoginValidation, authController.sendOTPforLogin);
router.post("/mobileapi/v1/submitEmailOTPforLogin", authValidation.submitEmailOTPforLoginValidation, authController.submitEmailOTPforLogin);
router.post("/mobileapi/v1/ChangePassword", authValidation.ChangePasswordValidation, authController.ChangePassword)
router.post("/mobileapi/v1/ForgetPassword", authValidation.ForgetPasswordValidation, authController.ForgetPassword)
router.post("/mobileapi/v1/login", authValidation.loginValidation, authController.login);
router.post("/mobileapi/v1/userlogout", authController.userlogout);
router.get("/mobileapi/v1/getProfile", authController.getProfile);
router.post("/mobileapi/v1/update_mobile_picture", authValidation.update_mobile_picture, authController.update_mobile_picture);
router.post("/mobileapi/v1/update_term_conditions", authController.update_term_conditions);

module.exports = router;
var express = require('express');
var router = express.Router();

let common = require("./../../../controller/common/common");

// Auth
var authController = require('./auth/authController');
var authValidation = require('./auth/authValidation');
router.post('/mobileapi/v1/login', authValidation.login, authController.login);
router.post("/mobileapi/v1/sendotp", authValidation.sendOTPforLoginValidation, authController.sendOTPforLogin);
router.post("/mobileapi/v1/submitotp", authValidation.submitEmailOTPforLoginValidation, authController.submitEmailOTPforLogin);
router.post("/mobileapi/v1/changepassword", authValidation.changePasswordValidation, authController.changePassword);
router.post("/mobileapi/v1/forgetpassword", common.checkTokenExistOrNot, authValidation.forgetPasswordValidation, authController.forgetPassword);
router.get("/mobileapi/v1/getprofile", common.checkTokenExistOrNot, authController.getProfile);
router.post("/mobileapi/v1/updateuser", common.checkTokenExistOrNot, authController.updateUser);
router.post("/mobileapi/v1/userlogout", common.checkTokenExistOrNot, authController.userLogout);
router.post("/mobileapi/v1/savelogindetails", common.checkTokenExistOrNot, authController.saveLoginDetails);

// Invoice
var invoiceController = require('./invoices/invoiceController');
var invoiceValidation = require('./invoices/invoiceValidation');
router.get('/mobileapi/v1/getinvoicelist', common.checkTokenExistOrNot, invoiceController.getInvoiceList);
router.post('/mobileapi/v1/getstatuswiseinvoice', common.checkTokenExistOrNot, invoiceValidation.getStatusWiseInvoice, invoiceController.getStatusWiseInvoice);
router.post('/mobileapi/v1/getoneinvoice', common.checkTokenExistOrNot, invoiceValidation.getOneInvoice, invoiceController.getOneInvoice);
router.post('/mobileapi/v1/updateinvoicestatus', common.checkTokenExistOrNot, invoiceValidation.updateInvoiceStatus, invoiceController.updateInvoiceStatus);
router.post('/mobileapi/v1/saveinvoicenote', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceNotes, invoiceController.saveInvoiceNotes);
router.post('/mobileapi/v1/deleteinvoicenote', common.checkTokenExistOrNot, invoiceValidation.deleteInvoiceNote, invoiceController.deleteInvoiceNote);
router.post('/mobileapi/v1/updateinvoiceattachment', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceAttachment, invoiceController.saveInvoiceAttachment);
router.post('/mobileapi/v1/savepackingslipnote', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipNotes, invoiceController.savePackingSlipNotes);
router.post('/mobileapi/v1/deletepackingslipnote', common.checkTokenExistOrNot, invoiceValidation.deletePackingSlipNote, invoiceController.deletePackingSlipNote);
router.post('/mobileapi/v1/updatepackingslipattachment', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipAttachment, invoiceController.savePackingSlipAttachment);
router.post('/mobileapi/v1/savereceivingslipnote', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipNotes, invoiceController.saveReceivingSlipNotes);
router.post('/mobileapi/v1/deletereceivingslipnote', common.checkTokenExistOrNot, invoiceValidation.deleteReceivingSlipNote, invoiceController.deleteReceivingSlipNote);
router.post('/mobileapi/v1/updatereceivingslipattachment', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipAttachment, invoiceController.saveReceivingSlipAttachment);
router.post('/mobileapi/v1/saveponote', common.checkTokenExistOrNot, invoiceValidation.savePONotes, invoiceController.savePONotes);
router.post('/mobileapi/v1/deleteponote', common.checkTokenExistOrNot, invoiceValidation.deletePONote, invoiceController.deletePONote);
router.post('/mobileapi/v1/updatepoattachment', common.checkTokenExistOrNot, invoiceValidation.savePOAttachment, invoiceController.savePOAttachment);
router.post('/mobileapi/v1/savequotenote', common.checkTokenExistOrNot, invoiceValidation.saveQuoteNotes, invoiceController.saveQuoteNotes);
router.post('/mobileapi/v1/deletequotenote', common.checkTokenExistOrNot, invoiceValidation.deleteQuoteNote, invoiceController.deleteQuoteNote);
router.post('/mobileapi/v1/updatequoteattachment', common.checkTokenExistOrNot, invoiceValidation.saveQuoteAttachment, invoiceController.saveQuoteAttachment);

// Recent Activity
let recentActivityController = require('./recent_activity/recentActivityController');
router.post('/mobileapi/v1/getrecentactivity', common.checkTokenExistOrNot, recentActivityController.getRecentActivity);

module.exports = router;
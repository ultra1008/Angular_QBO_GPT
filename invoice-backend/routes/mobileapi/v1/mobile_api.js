var express = require('express');
var router = express.Router();

let common = require("./../../../controller/common/common");

// Auth
var authController = require('./auth/authController');
var authValidation = require('./auth/authValidation');
router.post('/mobile/v1/auth/login', authValidation.login, authController.login);
router.post("/mobile/v1/auth/sendotp", authValidation.sendOTPforLoginValidation, authController.sendOTPforLogin);
router.post("/mobile/v1/auth/submitotp", authValidation.submitEmailOTPforLoginValidation, authController.submitEmailOTPforLogin);
router.post("/mobile/v1/auth/changepassword", authValidation.changePasswordValidation, authController.changePassword);
router.post("/mobile/v1/auth/forgetpassword", common.checkTokenExistOrNot, authValidation.forgetPasswordValidation, authController.forgetPassword);
router.get("/mobile/v1/auth/getprofile", common.checkTokenExistOrNot, authController.getProfile);
router.post("/mobile/v1/auth/updateuser", common.checkTokenExistOrNot, authController.updateUser);
router.post("/mobile/v1/auth/userlogout", common.checkTokenExistOrNot, authController.userLogout);
router.post("/mobile/v1/auth/savelogindetails", common.checkTokenExistOrNot, authController.saveLoginDetails);
router.post('/mobile/v1/auth/helpmail', authValidation.helpMail, authController.helpMail);

// Invoice
var invoiceController = require('./invoices/invoiceController');
var invoiceValidation = require('./invoices/invoiceValidation');
router.get('/mobile/v1/invoice/getlist', common.checkTokenExistOrNot, invoiceController.getInvoiceList);
router.post('/mobile/v1/invoice/getstatuswise', common.checkTokenExistOrNot, invoiceValidation.getStatusWiseInvoice, invoiceController.getStatusWiseInvoice);
router.post('/mobile/v1/invoice/getone', common.checkTokenExistOrNot, invoiceValidation.getOneInvoice, invoiceController.getOneInvoice);
router.post('/mobile/v1/invoice/updatestatus', common.checkTokenExistOrNot, invoiceValidation.updateInvoiceStatus, invoiceController.updateInvoiceStatus);
router.post('/mobile/v1/invoice/savenote', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceNotes, invoiceController.saveInvoiceNotes);
router.post('/mobile/v1/invoice/deletenote', common.checkTokenExistOrNot, invoiceValidation.deleteInvoiceNote, invoiceController.deleteInvoiceNote);
router.post('/mobile/v1/invoice/updateattachment', common.checkTokenExistOrNot, invoiceValidation.saveInvoiceAttachment, invoiceController.saveInvoiceAttachment);
router.post('/mobile/v1/invoice/packing_slip/savenote', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipNotes, invoiceController.savePackingSlipNotes);
router.post('/mobile/v1/invoice/packing_slip/deletenote', common.checkTokenExistOrNot, invoiceValidation.deletePackingSlipNote, invoiceController.deletePackingSlipNote);
router.post('/mobile/v1/invoice/packing_slip/updateattachment', common.checkTokenExistOrNot, invoiceValidation.savePackingSlipAttachment, invoiceController.savePackingSlipAttachment);
router.post('/mobile/v1/invoice/receivingslip/savenote', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipNotes, invoiceController.saveReceivingSlipNotes);
router.post('/mobile/v1/invoice/receivingslip/deletenote', common.checkTokenExistOrNot, invoiceValidation.deleteReceivingSlipNote, invoiceController.deleteReceivingSlipNote);
router.post('/mobile/v1/invoice/receivingslip/updateattachment', common.checkTokenExistOrNot, invoiceValidation.saveReceivingSlipAttachment, invoiceController.saveReceivingSlipAttachment);
router.post('/mobile/v1/invoice/po/savenote', common.checkTokenExistOrNot, invoiceValidation.savePONotes, invoiceController.savePONotes);
router.post('/mobile/v1/invoice/po/deletenote', common.checkTokenExistOrNot, invoiceValidation.deletePONote, invoiceController.deletePONote);
router.post('/mobile/v1/invoice/po/updateattachment', common.checkTokenExistOrNot, invoiceValidation.savePOAttachment, invoiceController.savePOAttachment);
router.post('/mobile/v1/invoice/quote/savenote', common.checkTokenExistOrNot, invoiceValidation.saveQuoteNotes, invoiceController.saveQuoteNotes);
router.post('/mobile/v1/invoice/quote/deletenote', common.checkTokenExistOrNot, invoiceValidation.deleteQuoteNote, invoiceController.deleteQuoteNote);
router.post('/mobile/v1/invoice/quote/updateattachment', common.checkTokenExistOrNot, invoiceValidation.saveQuoteAttachment, invoiceController.saveQuoteAttachment);

// Recent Activity
let recentActivityController = require('./recent_activity/recentActivityController');
router.post('/mobile/v1/recentactivity/get', common.checkTokenExistOrNot, recentActivityController.getRecentActivity);

module.exports = router;
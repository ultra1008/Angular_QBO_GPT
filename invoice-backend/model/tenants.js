var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tenantsSchema = new Schema({
    DB_HOST: { type: String, default: "" },
    DB_NAME: { type: String, default: "" },
    DB_PORT: { type: Number, default: 0 },
    DB_USERNAME: { type: String, default: "" },
    DB_PASSWORD: { type: String, default: "" },
    // compnaycode: { type: String, default: "" },
    // compnay_id: { type: String, default: "" },
    tenant_smtp_custom: { type: String, default: "" },
    tenant_smtp_server: { type: String, default: "" },
    tenant_smtp_username: { type: String, default: "" },
    tenant_smtp_password: { type: String, default: "" },
    tenant_smtp_port: { type: Number, default: 0 },
    tenant_smtp_security: { type: String, default: "" },
    tenant_smtp_reply_to_mail: { type: String, default: "" },
    companycode: { type: String, default: "" },
    company_id: { type: mongoose.ObjectId, default: "" },
    quickbooks_client_id: { type: String, default: "" },
    quickbooks_client_secret: { type: String, default: "" },
    tenant_smtp_timeout: { type: String, default: "" },
    googledrive_access_token: { type: String, default: "" },
    googledrive_expiry_date: { type: String, default: "" },
    googledrive_integration_status: { type: Number, default: 0 },
    googledrive_refresh_token: { type: String, default: "" },
    googledrive_scope: { type: String, default: "" },
    googledrive_token_type: { type: String, default: "" },
    googledrive_rovuk_folder_id: { type: String, default: "" },

    is_delete: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = tenantsSchema;
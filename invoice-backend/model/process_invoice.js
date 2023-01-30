var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var processInvoiceSchema = new Schema({
    pdf_url: { type: String, default: "" },
    invoice_id: { type: mongoose.ObjectId, default: "" },
    status: { type: String, default: "Pending" },
    document_type: { type: String, default: "" },
    process_data: { type: Schema.Types.Mixed },

    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = processInvoiceSchema;

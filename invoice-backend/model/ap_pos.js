var mongoose = require('mongoose');

var po_schema = new mongoose.Schema({
    invoice_id: { type: mongoose.ObjectId, default: "" }, // Invoice Id
    pdf_url: { type: String, default: "" }, // Wasabi s3 bucket po document url
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type PO
    date_epoch: { type: Number, default: 0 },
    po_number: { type: String, default: "" },
    customer_id: { type: String, default: "" },
    terms: { type: String, default: "" },
    delivery_date_epoch: { type: Number, default: 0 },
    delivery_address: { type: String, default: "" },
    due_date_epoch: { type: Number, default: 0 },
    quote_number: { type: String, default: "" },
    contract_number: { type: String, default: "" },
    vendor_id: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" },
    sub_total: { type: String, default: "" },
    tax: { type: String, default: "" },
    po_total: { type: String, default: "" },
    items: { type: Array, default: [] },
    is_delete: { type: Number, default: 0 },
    is_orphan: { type: Boolean, default: true }, // false - Orphan document, true - already relationship with invoice document
    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
});

module.exports = po_schema;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var badge = new mongoose.Schema({
    vendor: { type: Boolean, default: false },
    vendor_id: { type: Boolean, default: false },
    customer_id: { type: Boolean, default: false },
    invoice: { type: Boolean, default: false },
    p_o: { type: Boolean, default: false },
    invoice_date: { type: Boolean, default: false },
    due_date: { type: Boolean, default: false },
    order_date: { type: Boolean, default: false },
    ship_date: { type: Boolean, default: false },
    terms: { type: Boolean, default: false },
    total: { type: Boolean, default: false },
    invoice_total: { type: Boolean, default: false },
    tax_amount: { type: Boolean, default: false },
    tax_id: { type: Boolean, default: false },
    sub_total: { type: Boolean, default: false },
    amount_due: { type: Boolean, default: false },
    receiving_date: { type: Boolean, default: false },
    job_number: { type: Boolean, default: false },
    notes: { type: Boolean, default: false },
    contract_number: { type: Boolean, default: false },
    account_number: { type: Boolean, default: false },
    delivery_address: { type: Boolean, default: false },
    discount: { type: Boolean, default: false },
    packing_slip: { type: Boolean, default: false },
    receiving_slip: { type: Boolean, default: false },
});
var badgeValue = {
    vendor: false,
    vendor_id: false,
    customer_id: false,
    invoice: false,
    p_o: false,
    invoice_date: false,
    due_date: false,
    order_date: false,
    ship_date: false,
    terms: false,
    total: false,
    invoice_total: false,
    tax_amount: false,
    tax_id: false,
    sub_total: false,
    amount_due: false,
    receiving_date: false,
    job_number: false,
    notes: false,
    contract_number: false,
    account_number: false,
    delivery_address: false,
    discount: false,
    packing_slip: false,
    receiving_slip: false,
};

var notesSchema = new mongoose.Schema({
    notes: { type: String, default: "" },
    created_at: { type: Number },
    created_by: { type: mongoose.ObjectId },
    updated_at: { type: Number },
    updated_by: { type: mongoose.ObjectId },
    is_delete: { type: Number, default: 0 },
});

var packingSlipBadge = new mongoose.Schema({
    date: { type: Boolean, default: false },
    invoice_number: { type: Boolean, default: false },
    po_number: { type: Boolean, default: false },
    ship_to_address: { type: Boolean, default: false },
    vendor: { type: Boolean, default: false },
    received_by: { type: Boolean, default: false },
});
var packingSlipBadgeValue = {
    date: false,
    invoice_number: false,
    po_number: false,
    ship_to_address: false,
    vendor: false,
    received_by: false,
};
var packing_slip_schema = new mongoose.Schema({
    pdf_url: { type: String, default: "" },
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type
    date: { type: String, default: "" },
    invoice_number: { type: String, default: "" },
    po_number: { type: String, default: "" },
    ship_to_address: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" },
    received_by: { type: String, default: "" },
    is_delete: { type: Number, default: 0 },
    badge: { type: packingSlipBadge, default: packingSlipBadgeValue },
});
var packingSlipData = {
    pdf_url: "",
    document_id: "",
    document_type: "",
    date: "",
    invoice_number: "",
    po_number: "",
    ship_to_address: "",
    vendor: "",
    received_by: "",
    is_delete: 0,
    badge: packingSlipBadgeValue
};

var poBadge = new mongoose.Schema({
    date: { type: Boolean, default: false },
    po_number: { type: Boolean, default: false },
    customer_id: { type: Boolean, default: false },
    terms: { type: Boolean, default: false },
    delivery_date: { type: Boolean, default: false },
    delivery_address: { type: Boolean, default: false },
    due_date: { type: Boolean, default: false },
    quote_number: { type: Boolean, default: false },
    contract_number: { type: Boolean, default: false },
    vendor_id: { type: Boolean, default: false },
    vendor: { type: Boolean, default: false },
    sub_total: { type: Boolean, default: false },
    tax: { type: Boolean, default: false },
    po_total: { type: Boolean, default: false },
});
var poBadgeValue = {
    date: false,
    po_number: false,
    customer_id: false,
    terms: false,
    delivery_date: false,
    delivery_address: false,
    due_date: false,
    quote_number: false,
    contract_number: false,
    vendor_id: false,
    vendor: false,
    sub_total: false,
    tax: false,
    po_total: false,
};
var po_schema = new mongoose.Schema({
    pdf_url: { type: String, default: "" },
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type
    date: { type: String, default: "" },
    po_number: { type: String, default: "" },
    customer_id: { type: String, default: "" },
    terms: { type: String, default: "" },
    delivery_date: { type: String, default: "" },
    delivery_address: { type: String, default: "" },
    due_date: { type: String, default: "" },
    quote_number: { type: String, default: "" },
    contract_number: { type: String, default: "" },
    vendor_id: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" },
    sub_total: { type: String, default: "" },
    tax: { type: String, default: "" },
    po_total: { type: String, default: "" },
    items: { type: Array, default: [] },
    is_delete: { type: Number, default: 0 },
    badge: { type: poBadge, default: poBadgeValue },
});
var poData = {
    pdf_url: "",
    document_id: "",
    document_type: "",
    date: "",
    po_number: "",
    customer_id: "",
    terms: "",
    delivery_date: "",
    delivery_address: "",
    due_date: "",
    quote_number: "",
    contract_number: "",
    vendor_id: "",
    vendor: "",
    sub_total: "",
    tax: "",
    po_total: "",
    items: [],
    is_delete: 0,
    badge: poBadgeValue
};

var quoteBadge = new mongoose.Schema({
    date: { type: Boolean, default: false },
    quote_number: { type: Boolean, default: false },
    terms: { type: Boolean, default: false },
    address: { type: Boolean, default: false },
    vendor: { type: Boolean, default: false },
    shipping_method: { type: Boolean, default: false },
    sub_total: { type: Boolean, default: false },
    tax: { type: Boolean, default: false },
    quote_total: { type: Boolean, default: false },
    receiver_phone: { type: Boolean, default: false },
});
var quoteBadgeValue = {
    date: false,
    quote_number: false,
    terms: false,
    address: false,
    vendor: false,
    shipping_method: false,
    sub_total: false,
    tax: false,
    quote_total: false,
    receiver_phone: false,
};
var quote_schema = new mongoose.Schema({
    pdf_url: { type: String, default: "" },
    document_id: { type: mongoose.ObjectId, default: "" }, // Process document id
    document_type: { type: String, default: "" }, // Process document type
    date: { type: String, default: "" },
    quote_number: { type: String, default: "" },
    terms: { type: String, default: "" },
    address: { type: String, default: "" },
    vendor: { type: mongoose.ObjectId, default: "" },
    shipping_method: { type: String, default: "" },
    sub_total: { type: String, default: "" },
    tax: { type: String, default: "" },
    quote_total: { type: String, default: "" },
    receiver_phone: { type: String, default: "" },
    items: { type: Array, default: [] },
    is_delete: { type: Number, default: 0 },
    badge: { type: quoteBadge, default: quoteBadgeValue },
});
var quoteData = {
    pdf_url: "",
    document_id: "",
    document_type: "",
    date: "",
    quote_number: "",
    terms: "",
    address: "",
    vendor: "",
    shipping_method: "",
    sub_total: "",
    tax: "",
    quote_total: "",
    receiver_phone: "",
    items: "",
    is_delete: 0,
    badge: quoteBadgeValue
};

var invoiceSchema = new Schema({
    assign_to: { type: mongoose.ObjectId, default: "" }, //user
    vendor: { type: mongoose.ObjectId, default: "" },
    vendor_id: { type: String, default: "" },
    customer_id: { type: String, default: "" },
    invoice: { type: String, default: "" },
    p_o: { type: String, default: "" },
    invoice_date: { type: String, default: "" },
    due_date: { type: String, default: "" },
    order_date: { type: String, default: "" },
    ship_date: { type: String, default: "" },
    terms: { type: String, default: "" },
    total: { type: String, default: "" },
    invoice_total: { type: String, default: "" },
    tax_amount: { type: String, default: "" },
    tax_id: { type: String, default: "" },
    sub_total: { type: String, default: "" },
    amount_due: { type: String, default: "" },
    cost_code: { type: mongoose.ObjectId, default: "" },
    gl_account: { type: String },
    receiving_date: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: { type: String, default: "Pending", enum: ['Pending', 'Approved', 'Rejected', 'Late'] },
    job_number: { type: String, default: "" },
    delivery_address: { type: String, default: "" },
    contract_number: { type: String, default: "" },
    account_number: { type: String, default: "" },
    discount: { type: String, default: "" },
    pdf_url: { type: String, default: "" },
    items: { type: Array, default: [] },
    packing_slip: { type: String, default: "" },
    receiving_slip: { type: String, default: "" },

    badge: { type: badge, default: badgeValue },
    invoice_notes: { type: [notesSchema], default: [] },
    invoice_attachments: { type: Array, default: [] },

    has_packing_slip: { type: Boolean, default: false },
    packing_slip_data: { type: packing_slip_schema, default: packingSlipData },
    packing_slip_notes: { type: [notesSchema], default: [] },
    packing_slip_attachments: { type: Array, default: [] },

    has_po: { type: Boolean, default: false },
    po_data: { type: po_schema, default: poData },
    po_notes: { type: [notesSchema], default: [] },
    po_attachments: { type: Array, default: [] },

    has_quote: { type: Boolean, default: false },
    quote_data: { type: quote_schema, default: quoteData },
    quote_notes: { type: [notesSchema], default: [] },
    quote_attachments: { type: Array, default: [] },

    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = invoiceSchema;

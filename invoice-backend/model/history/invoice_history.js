var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoice_history_Schema = new Schema({
    assign_to: { type: mongoose.ObjectId, default: "" },
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

    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },

    history_created_at: { type: Number, default: 0 },
    history_created_by: { type: mongoose.ObjectId, default: "" },
    action: { type: String, enum: ["Insert", "Update", "Delete"] },
    taken_device: { type: String, default: "Web", enum: ["Mobile", "Web"] },
    invoice_id: { type: mongoose.ObjectId, default: "" }
});

module.exports = invoice_history_Schema;

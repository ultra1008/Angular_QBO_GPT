var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var invoiceSchema = new Schema({
    assign_to: { type: mongoose.ObjectId, default: "" }, //user
    vendor_name: { type: String, default: "" },
    vendor_id: { type: String, default: "" },
    customer_id: { type: String, default: "" },
    invoice: { type: String, default: "" },
    p_o: { type: String, default: "" },
    invoice_date: { type: Number, default: 0 },
    due_date: { type: Number, default: 0 },
    order_date: { type: Number, default: 0 },
    ship_date: { type: Number, default: 0 },
    terms: { type: mongoose.ObjectId, default: "" },
    total_to_be_paid: { type: String, default: "" },
    tax_rate: { type: mongoose.ObjectId, default: "" },
    tax_amount: { type: String, default: "" },
    tax_id: { type: String, default: "" },
    sub_total: { type: String, default: "" },
    amount_due: { type: String, default: "" },
    cost_code: { type: mongoose.ObjectId, default: "" },
    gl_account: { type: String },
    receiving_date: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    status: { type: String, default: "Pending", enum: ['Pending', 'Generated', 'Approved', 'Rejected', 'Late'] },


    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = invoiceSchema;

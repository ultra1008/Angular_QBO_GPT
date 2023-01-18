var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var vendorSchema = new Schema({
    vendor_name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    gl_account: { type: String, default: "" },
    address: { type: String, default: "" },
    address2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    country: { type: String, default: "" },
    terms_id: { type: mongoose.ObjectId, default: "" },
    status: { type: Number, default: 1, enum: [1, 2] }, // 1- Active, 2- Inactive
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    attachment: { type: Array, default: [] },
    vendor_id: { type: String, default: "" },
    customer_id: { type: String, default: "" },

    created_by: { type: mongoose.ObjectId, default: "" },
    created_at: { type: Number, default: 0 },
    updated_by: { type: mongoose.ObjectId, default: "" },
    updated_at: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = vendorSchema;
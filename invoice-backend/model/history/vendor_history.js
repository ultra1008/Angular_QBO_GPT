var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var vendorSchema = new Schema({
    vendor_name: { type: String, default: "" },
    phone: { type: Number, default: "" },
    email: { type: String, default: "" },
    gl: { type: String, default: "" },
    address: { type: String, default: "" },
    address2: { type: String, default: "" },
    city: { type: String, default: "" },
    status: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    country: { type: String, default: "" },
    terms_id: { type: mongoose.ObjectId, default: "" },
    status: { type: String, default: "Active", enum: ['Active', 'Inactive'] },
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

    history_created_at: { type: Number, default: 0 },
    history_created_by: { type: mongoose.ObjectId, default: "" },
    action: { type: String, enum: ["Insert", "Update", "Archive", "Restore"] },
    taken_device: { type: String, default: "Web", enum: ["Mobile", "Web"] },
    vendor_data_id: { type: mongoose.ObjectId, default: "" }
});

module.exports = vendorSchema;
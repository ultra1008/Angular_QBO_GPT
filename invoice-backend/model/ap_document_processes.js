var mongoose = require('mongoose');

var processDocumentSchema = new mongoose.Schema({
    pdf_url: { type: String, default: "" },
    status: { type: String, default: "Pending" }, // Pending, Already Exists, Process, Complete
    created_by: { type: mongoose.ObjectId, default: "" }, // User collection
    created_at: { type: Number, default: 0 }, // Unix Time stam Epoch
    updated_by: { type: mongoose.ObjectId, default: "" }, // User collection
    updated_at: { type: Number, default: 0 }, // Unix Time stam Epoch
    is_delete: { type: Number, default: 0 },
});

module.exports = processDocumentSchema;

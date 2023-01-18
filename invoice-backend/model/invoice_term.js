var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var termSchema = new Schema({
    name: { type: String },
    due_days: { type: Number, default: 0 },
    is_discount: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
});

module.exports = termSchema;
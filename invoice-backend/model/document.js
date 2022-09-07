var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var documentSchema = new Schema({
    name: { type: String },
    is_expiration: { type: Boolean, default: false },
    is_delete: { type: Number, default: 0 }
});

module.exports = documentSchema;
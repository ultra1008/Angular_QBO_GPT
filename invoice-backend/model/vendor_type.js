var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var vendortypeSchema = new Schema({
    name: { type: String, default: "" },
    is_delete: { type: Number, default: 0 }
});

module.exports = vendortypeSchema;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var gifSchema = new Schema({
    module_name: { type: String, enum: ["Rovuk 360", "Rovuk Invoicing", "Rovuk Management", "Rovuk Grid", "Rovuk Smalltools", "Rovuk Supplier Diversity"] },
    gif_url: { type: String, default: "" },
});
module.exports = gifSchema;
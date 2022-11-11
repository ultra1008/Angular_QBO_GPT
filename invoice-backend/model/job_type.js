var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jobtypeSchema = new Schema({
    job_type_name: { type: String },
    is_delete: { type: Number, default: 0 },
});

module.exports = jobtypeSchema;
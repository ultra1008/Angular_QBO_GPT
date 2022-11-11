var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var departmentSchema = new Schema({
    department_name: { type: String },
    is_delete: { type: Number, default: 0 },
});

module.exports = departmentSchema;
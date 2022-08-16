var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));

var emailTemplatesSchema = new Schema({
    user_id: { type: mongoose.ObjectId, default: "" },
    otp: { type: String, default: "" },
    sent_on: { type: Number, default: 0 },
    is_delete: { type: Number, default: 0 },
}, { collection: 'email_otp' });

module.exports = emailTemplatesSchema;
var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var settingSchema= new Schema({
    settings: {type : Schema.Types.Mixed},
},{ collection: 'setting' });
   
module.exports = settingSchema
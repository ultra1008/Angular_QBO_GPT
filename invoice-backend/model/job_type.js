var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var jobtypeSchema= new Schema({
    job_type_name: {type:String}
});
   
module.exports = jobtypeSchema
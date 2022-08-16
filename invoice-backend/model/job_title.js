var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var jobtitleSchema= new Schema({
    job_title_name: {type:String}
});
   
module.exports = jobtitleSchema
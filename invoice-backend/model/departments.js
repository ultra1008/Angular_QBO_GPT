var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var departmentSchema= new Schema({
    department_name: {type:String}
});
   
module.exports = departmentSchema
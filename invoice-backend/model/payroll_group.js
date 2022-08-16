var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var payrollgroupSchema= new Schema({
    payroll_group_name: {type:String}
},{ collection: 'payroll_group' });
   
module.exports = payrollgroupSchema
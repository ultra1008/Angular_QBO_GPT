var mongoose=require('mongoose');
var Schema = mongoose.Schema;
var relationshipSchema= new Schema({
    relationship_name : {type:String},
    is_delete: { type: Number, default: 0 }
},{ collection: 'relationship' });
   
module.exports = relationshipSchema
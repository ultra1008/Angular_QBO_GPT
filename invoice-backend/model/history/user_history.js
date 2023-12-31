var mongoose = require('mongoose');
let collectionConstant = require('../../config/collectionConstant');
var Schema = mongoose.Schema;
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast(v => v === '' ? v : castObjectId(v));
var api_setting = new mongoose.Schema({
    location: { type: Boolean, default: false },
    employee: { type: Boolean, default: false },
    color: { type: Boolean, default: false },
    ownership: { type: Boolean, default: false },
    manufacturer: { type: Boolean, default: false },
    frequencysetting: { type: Boolean, default: false },
    statussetting: { type: Boolean, default: false },
    equipment_type: { type: Boolean, default: false },
    costcode: { type: Boolean, default: false },
    packaging: { type: Boolean, default: false },
    weight: { type: Boolean, default: false },
    project: { type: Boolean, default: false },
    expensestypes: { type: Boolean, default: false },
    item: { type: Boolean, default: false },
    equipment: { type: Boolean, default: false },
    vendor: { type: Boolean, default: false }
});
var dvalue = {
    location: false,
    employee: false,
    color: false,
    ownership: false,
    manufacturer: false,
    frequencysetting: false,
    statussetting: false,
    equipment_type: false,
    costcode: false,
    packaging: false,
    weight: false,
    project: false,
    expensestypes: false,
    item: false,
    equipment: false,
    vendor: false
};
var userSchema = new Schema({
    /* userroleId: { type: mongoose.ObjectId, default: "", ref: "roles" },
    useremail: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, default: "" },
    usermiddlename: { type: String, default: "" },
    userlastname: { type: String, default: "" },
    userfullname: { type: String, default: "" },
    userssn: { type: String, default: "" },
    userdevice_pin: { type: String, default: "" },
    userphone: { type: String, default: "" },
    usersecondary_email: { type: String, default: "" },
    usergender: { type: String, default: "" },
    userdob: { type: String, default: "" },
    userstatus: { type: Number, default: 1 },
    userpicture: { type: String, default: "" },
    usermobile_picture: { type: String, default: "" },
    userfulladdress: { type: String, default: "" },
    userstreet1: { type: String, default: "" },
    userstreet2: { type: String, default: "" },
    usercity: { type: String, default: "" },
    user_state: { type: String, default: "" },
    userzipcode: { type: String, default: "" },
    usercountry: { type: String, default: "" },
    userstartdate: { type: String, default: "" },
    usersalary: { type: Number, default: "" },
    usermanager_id: { type: mongoose.ObjectId, default: "", ref: collectionConstant.GRID_USER },
    usersupervisor_id: { type: mongoose.ObjectId, default: "", ref: collectionConstant.GRID_USER },
    userlocation_id: { type: mongoose.ObjectId, default: "" },
    userjob_title_id: { type: mongoose.ObjectId, default: "", ref: collectionConstant.JOB_TITLE },
    userdepartment_id: { type: mongoose.ObjectId, default: "", ref: collectionConstant.DEPARTMENTS },
    userjob_type_id: { type: mongoose.ObjectId, default: "", ref: collectionConstant.JOB_TYPE },
    usernon_exempt: { type: String, default: "" },
    usermedicalBenifits: { type: String, default: "" },
    useradditionalBenifits: { type: String, default: "" },
    useris_password_temp: { type: Boolean, default: true },
    userterm_conditions: { type: Boolean, default: true },
    userweb_security_code: { type: String, default: "" },
    userfirebase_token: { type: String, default: "" },
    usersmalltool_firebase_token: { type: String, default: "" },
    usercreated_at: { type: String, default: "" },
    userupdated_at: { type: String, default: "" },
    usercreated_by: { type: mongoose.ObjectId, default: "", ref: collectionConstant.GRID_USER },
    userupdated_by: { type: mongoose.ObjectId, default: "", ref: collectionConstant.GRID_USER },
    user_payroll_rules: { type: String, default: "" },
    user_id_payroll_group: { type: mongoose.ObjectId, default: "", ref: collectionConstant.PAYROLL_GROUP },
    usercostcode: { type: mongoose.ObjectId, default: "" },
    userqrcode: { type: String, default: "" },
    userfirebase_id: { type: String, default: "" },
    user_no: { type: String, default: "" },
    card_no: { type: String, default: "" },
    card_type: { type: mongoose.ObjectId, default: "" },
    is_delete: { type: Number, default: 0 },
    api_setting: { type: api_setting, default: dvalue },
    allow_for_projects: { type: Boolean, default: true },
    user_languages: { type: Array, default: [] },
    show_id_card_on_qrcode_scan: { type: Boolean, default: true },
    project_email_group: { type: String, default: "none", enum: ['none', 'prime_member', 'sponsor_member'] },
    compliance_officer: { type: Boolean, default: false },
    vendors: { type: [mongoose.ObjectId], default: [] },
    grid_firebase_token: { type: String, default: "" }, */

    data: { type: Array, default: [] },

    user_id: { type: mongoose.ObjectId, default: "" },
    history_created_at: { type: Number },
    history_created_by: { type: mongoose.ObjectId },
    action: { type: String, enum: ["Insert", "Update", "Archive", "Restore"] },
    taken_device: { type: String, enum: ["Mobile", "Web", "iFrame"] },
});

module.exports = userSchema;
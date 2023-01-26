export enum httproutes {

    //Admin module
    ADMIN_EDIT_COMPNAY_WITH_LOGO = "/webapi/v1/superadmin/company/editcompany",
    ADMIN_ONE_COMPNAY = "/webapi/v1/superadmin/company/getonecompnaydata",
    ADMINFORGOTPASSWORD = "/webapi/v1/superadmin/forgetpassword",
    ADMINDOCUMENTTYPE_GET = "/webapi/v1/superadmin/dashboard/getsafetyDocument",
    ADMIN_SAFETY_TALK_SAVE = "/webapi/v1/superadmin/dashboard/addsafetytalk",
    ADMIN_SAFETY_TALK_GET = "/webapi/v1/superadmin/dashboard/safetytalklist",
    ADMIN_SAFETY_TALK_DELETE = "/webapi/v1/superadmin/dashboard/deletesafetytalk",
    ADMIN_SAFETY_TALK_GET_ONE = "/webapi/v1/superadmin/dashboard/onesafetytalk",

    ADMIN_CHECKLIST_SAVE = "/webapi/v1/superadmin/dashboard/savechecklist",
    ADMIN_CHECKLIST_GET = "/webapi/v1/superadmin/dashboard/checklistList",
    ADMIN_CHECKLIST_DELETE = "/webapi/v1/superadmin/dashboard/deletechecklist",
    ADMIN_CHECKLIST_GET_ONE = "/webapi/v1/superadmin/dashboard/onechecklist",
    ADMIN_CHANGEPASSWORD = "/webapi/v1/superadmin/changepassword",
    SUPERADMIN_LOGIN_HISTORY = "/webapi/v1/superadmin/company/getloginhistoryDatatable",
    SUPERADMIN_LOGIN_HISTORY_REPORT = "/webapi/v1/superadmin/company/loginhistoryreport",

    USER_LOGOUT = "/webapi/v1/userlogout",
    USER_LOGIN_HISTORY = "/webapi/v1/savelogindetails",
    USER_FORGET_PASSWORD = "/webapi/v1/sponsorforgetpassword",
    USER_SEND_PASSWORD = "/webapi/v1/senduserpassword",

    ALL_SUPERVISORS_GET = "/webapi/v1/portal/getallsupervisors",

    //ADMIN - Smalltool
    ADMIN_SMALLTOOL_DATATABLE = "/webapi/v1/superadmin/smalltool/datatablesmalltools",
    ADMIN_SMALLTOOLKIT_DATATABLE = "/webapi/v1/superadmin/smalltool/datatabletoolkits",
    ADMIN_SMALLTOOK_ALL = "/webapi/v1/superadmin/smalltool/getsmalltools",
    ADMIN_SMALLTOOL_GETONE = "/webapi/v1/superadmin/smalltool/onesmalltool",
    ADMIN_SMALLTOOLKIT_GETONE = "/webapi/v1/superadmin/smalltool/onesmalltoolkit",
    SMALLTOOL_EXCLE = "/webapi/v1/superadmin/smalltool/importfileinsert",
    SMALLTOOLKIT_EXCLE = "/webapi/v1/superadmin/smalltool/cronforsmalltoolkit",
    EQUIPMENT_EXCLE = "/webapi/v1/superadmin/smalltool/quipmentimportfileinsert",
    EQUIPMENT_EXCLE_EXPORT = "/webapi/v1/superadmin/smalltool/exportxlsxequipment",
    SMALLTOOL_EXCLE_EXPORT = "/webapi/v1/superadmin/smalltool/exportsmalltool",
    SMALLTOOLKIT_EXCLE_EXPORT = "/webapi/v1/superadmin/smalltool/expoerttoolkits",
    //GETMENUFACURESMALLTOOL = "/webapi/v1/superadmin/smalltool/getmenufectures",
    //GETCATEGORIESSMALLTOOL = "/webapi/v1/superadmin/smalltool/getcategories",
    //SAVESMALLTOOL_TOOL = "/webapi/v1/superadmin/smalltool/savesmalltools",
    //SAVESMALLTOOL_TOOLKIT = "/webapi/v1/superadmin/smalltool/getmenufectures",
    GETMENUFACURESMALLTOOL = "/webapi/v1/superadmin/smalltool/getmanufacturer",
    GETCATEGORIESSMALLTOOL = "/webapi/v1/superadmin/smalltool/getcategories",
    GETCATEGORIESSMALLTOOLBYMANUFACTURER = "/webapi/v1/superadmin/smalltool/getcategoriesbymanufacturers",
    SAVESMALLTOOL_TOOL = "/webapi/v1/superadmin/smalltool/savesmalltools",
    SAVESMALLTOOL_TOOLKIT = "/webapi/v1/superadmin/smalltool/savetoolkit",
    SMALLTOOL_MANUFACTURER_EXCLE = "/webapi/v1/superadmin/management/savebulkmanufacturers",
    SMALLTOOL_CATEGORY_EXCLE = "/webapi/v1/superadmin/smalltool/savebulkcategories",
    SMALLTOOLIMAGEUPLOAD = "/webapi/v1/superadmin/smalltool/uploadimage",
    RESEND_MAIL = "/webapi/v1/superadmin/company/resendmailtoadmin",
    //Portal-Employee- Opration
    EMPLOYEE_CHANGEPASSWORD = "/webapi/v1/changepassword",
    EMPLOYEE_PERSONAL_EDIT = "/webapi/v1/portal/savepersonalinfo",
    EMPLOYEE_PERSONAL_MOBILE_PIC_EDIT = "/webapi/v1/portal/savemobilephoto",
    EMPLOYEE_CONTACT_EDIT = "/webapi/v1/portal/savecontactinfo",
    EMPLOYEE_EMPLOYEE_EDIT = "/webapi/v1/portal/saveemployee",
    EMPLOYEE_EMPLOYEE_INFO = "/webapi/v1/portal/saveemployeeinfo",
    EMPLOYEE_DOCUMENT = "/webapi/v1/portal/getuserdocument",
    EMPLOYEE_GET_SPECIFIC = "/webapi/v1/portal/getspecificusers",
    EMPLOYEE_SAVE_SIGNATURE = "/webapi/v1/portal/saveusersignature",

    //Emergency contact
    EMERGENCY_CONTACT_SAVE = "/webapi/v1/portal/saveemergencycontact",
    REALTIONSHIP_GET_ALL = "/webapi/v1/portal/getallrelationships",
    EMERGENCY_CONTACT_USERS = "/webapi/v1/portal/getemergencycontact",
    EMERGENCY_CONTACT_USERS_DELETE = "/webapi/v1/portal/deleteemergencycontact",
    EMERGENCY_CONTACT_SEND_REMINDER = "/webapi/v1/portal/sendemergencycontactreminder",

    //Document opration
    TEAM_DOCUMENT_DELETE = "/webapi/v1/portal/deleteuserdocument",
    TEAM_DOCUMENT_EDIT = "/webapi/v1/portal/edituserdocument",
    TEAM_DELETE = "/webapi/v1/portal/deleteteammember",

    //send invitation
    SEND_INVITATION = "/webapi/v1/portal/sendappinvitation",

    // Shift Module - Portal
    PORTAL_SHIFT_ADD = "/webapi/v1/portal/addShift",
    PORTAL_SHIFT_GET = "/webapi/v1/portal/getShifts",
    PORTAL_SHIFT_DELETE = "/webapi/v1/portal/deleteShift",
    PORTAL_SHIFT_GET_ALL = "/webapi/v1/portal/getallshift",
    PORTAL_SHIFT_NEW_ADD = "/webapi/v1/portal/saveschedule",

    //auth from other app
    LOGIN_FROM_OTHER_APP = "/webapi/v1/loginfromotherapp",

    // Schedule Module - Portal
    PORTAL_SCHEDULE_ADD = "/webapi/v1/portal/addSchedule",
    PORTAL_SCHEDULE_GET = "/webapi/v1/portal/getSchedule",
    PORTAL_SCHEDULE_DELETE = "/webapi/v1/portal/deleteSchedule",
    PORTAL_SCHEDULE_MANY_DELETE = '/webapi/v1/portal/deleteManySchedule',
    PORTAL_SCHEDULE_GET_ALL = "/webapi/v1/portal/getallschedule",
    PORTAL_SCHEDULE_GET_REPORT = "/webapi/v1/portal/getallschedulereport",
    PORTAL_SCHEDULE_GET_BY_DATE = "/webapi/v1/portal/onedayschedule",
    PORTAL_SCHEDULE_EDIT = "/webapi/v1/portal/EditSchedule ",

    // TimeCard Module - Portal
    PORTAL_TIMECARD_MANUALLY_ADD = "/webapi/v1/portal/saveTimecard",
    PORTAL_TIMECARD_GET = "/webapi/v1/portal/getTimecard",
    PORTAL_IMECARD_DELETE = "/webapi/v1/portal/deleteTimecard",
    PORTAL_TIMECARD_GET_ONE = "/webapi/v1/portal/getonetimeCard",
    PORTAL_TIMECARD_STATUS = "/webapi/v1/portal/changetimecardstatus",
    PORTAL_TIMECARD_REPORT = "/webapi/v1/portal/getalltimecardreport",
    PORTAL_TIMECARD_GET_BY_WEEK = "/webapi/v1/portal/getTimecardGridList",
    PORTAL_TIMECARD_APPROVED = "/webapi/v1/portal/updatestatustimecard",

    // Projects Module - Portal
    PORTAL_PROJECT_GET = "/webapi/v1/portal/getprojects",
    ALL_PROJECT_GET = "/webapi/v1/portal/getallprojects",
    USER_PROJECT_GET = "/webapi/v1/portal/usersproject",
    PROJECT_GET = "/webapi/v1/portal/getproject",
    PROJECT_LOGO_SAVE = "/webapi/v1/portal/saveprojectlogo",
    PROJECT_SAVE = "/webapi/v1/portal/saveproject",
    PROJECT_REPORT = "/webapi/v1/portal/projectreport",

    // Project equipment module - portal
    PROJECT_EQUIPMENT_DATATABLE = "/webapi/v1/portal/getequipmentsDatabase",
    PROJECT_EQUIPMENT_EXPENSES_DATATABLE = "/webapi/v1/portal/getequipmentexpensesDatabase",

    PROJECT_SAVE_DAILY_REPORT = "/webapi/v1/portal/getoneprojectdailyreportsdatatable",

    //Project material module -portal
    PROJECT_MATERIAL_DATATABLE = "/webapi/v1/portal/getmaterialfordatatable",

    //Project extra material module -portal
    PROJECT_EXTRA_MATERIAL_DATATABLE = "/webapi/v1/portal/getextramaterialDatatable",

    //Project setting module -portal
    PROJECT_SETTING_UPDATE = "/webapi/v1/portal/updateprojectsettings",
    PROJECT_SETTING_COST_CODE_SAVE = "/webapi/v1/portal/savecostcode",
    PROJECT_SETTING_COST_CODE_DATATABLE = "/webapi/v1/portal/getcostcodefordatatable",
    PROJECT_SETTING_ALL_COST_CODE = "/webapi/v1/portal/getallcostcode",
    PROJECT_SETTING_COST_CODE_DELETE = "/webapi/v1/portal/deletecostcode",
    PROJECT_SETTING_WORKER_GET = "/webapi/v1/portal/getprojectworker",
    PROJECT_SETTING_WORKER_DELETE = "/webapi/v1/portal/getprojectworker",

    // Project safety talk module -portal
    PROJECT_SAFETY_TALK_SCHEDULE_DATATABLE = "/webapi/v1/portal/getschedulesafetytalkDatatable",
    PROJECT_SAFETY_TALK_PAST_DATATABLE = "/webapi/v1/portal/getpastsafetytalkDatatable",
    PROJECT_SAFETY_TALK_PAST_DATATABLE_USER = "/webapi/v1/portal/getpastsafetytalkUserDatatable",
    PROJECT_SAFETY_TALK_SCHEDULE_CREATE = "/webapi/v1/portal/schedulesafetytalk",
    PROJECT_SAFETY_TALK_CHECK_LIST_SCHEDULE_CREATE = "/webapi/v1/portal/schedulechecklist",
    PROJECT_SAFETY_TALK_FULL_LIST_DATATABLE = "/webapi/v1/portal/getallsafetytalkDatatable",
    PROJECT_SAFETY_TALK_CHECKLIST_FULL_LIST_DATATABLE = "/webapi/v1/portal/getallchecklistDatatable",
    PROJECT_SAFETY_TALK_CHECKLIST_SCHEDULE_LIST_DATATABLE = "/webapi/v1/portal/getschedulechecklistDatatable",
    PROJECT_SAFETY_TALK_CHECKLIST_PAST_LIST_DATATABLE = "/webapi/v1/portal/getpastchecklistDatatable",
    PROJECT_SAFETY_TALK_CHECKLIST_SAVE = "/webapi/v1/portal/savechecklist",
    PROJECT_CHECKLIST_DELETE = "/webapi/v1/portal/deletechecklist",
    PROJECT_SAFETYTALK_SEND = "/webapi/v1/portal/sendsafetytalkpdf",
    PROJECT_SAFETYTALK_PAST_SEND = "/webapi/v1/portal/sendpastsafetytalkpdf",
    PROJECT_CHECKLIST_SEND = "/webapi/v1/portal/sendchecklistpdf",
    PROJECT_CHECKLIST_PAST_SEND = "/webapi/v1/portal/sendpastchecklistpdf",

    //Project task module -portal
    PROJECT_TASK_SAVE = "/webapi/v1/portal/addtask",
    PROJECT_TASK_DATATABLE = "/webapi/v1/portal/gettaskdatatables",
    PROJECT_TASK_GEET_BY_ID = "/webapi/v1/portal/getonetasks",
    PROJECT_TASK_DELETE = "/webapi/v1/portal/deletetask",

    //Project note module -portal
    PROJECT_NOTE_SAVE = "/webapi/v1/portal/addnote",
    PROJECT_NOTE_GET_BY_ID = "/webapi/v1/portal/getonenote",
    PROJECT_NOTE_DELETE = "/webapi/v1/portal/deleteNote",
    PROJECT_NOTE_DATATABLE = "/webapi/v1/portal/getnotesdatatables",

    //Project Document module -portal
    PROJECT_DOCUMENT_SAVE = "/webapi/v1/portal/saveprojectdocument",
    PROJECT_DOCUMENT_DATATABLE = "/webapi/v1/portal/getprojectdocumentDatatable",
    PROJECT_DOCUMENT_DELETE = "/webapi/v1/portal/deleteprojectdocument",
    PROJECT_DOCUMENT_GET_BY_ID = "/webapi/v1/portal/getsingleprojectdocument",
    PROJECT_DOCUMENT_UPDATE = "/webapi/v1/portal/updateprojectdocument",
    PROJECT_DECUMENT_EXPIRATION_SEND = "/webapi/v1/portal/senddocumentexpiration",
    PROJECT_DOCUMENT_HISTORY = "/webapi/v1/portal/getprojectdocumenthistorydatatable",
    //Project survey module -portal
    PROJECT_SURVEY_SAVE = "/webapi/v1/portal/savesurvey",
    PROJECT_SURVEY_DELETE = "/webapi/v1/portal/deletesurvey",
    PROJECT_SURVET_GET_BY_ID = "/webapi/v1/portal/getsinglesurvey",
    PROJECT_SURVEY_DATATABLE = "/webapi/v1/portal/getsurveyDatatable",
    PROJECT_SURVEY_HISTORY = "/webapi/v1/portal/getsurveyhistorydatatable",

    //Project incident module -portal
    PROJECT_INCIDENT_SAVE = "/webapi/v1/portal/saveincident",
    PROJECT_INCIDENT_GET_BY_ID = "/webapi/v1/portal/getsingleincident",
    PROJECT_INCIDENT_DELETE = "/webapi/v1/portal/deleteincident",
    PROJECT_INCIDENT_DATATABLE = "/webapi/v1/portal/getincidentDatatable",
    PROJECT_INCIDENT_SAVE_NOTE = "/webapi/v1/portal/saveincidentnote",
    PROJECT_INCIDENT_DELETE_NOTE = "/webapi/v1/portal/deleteincidentnote",
    PROJECT_INCIDENT_NOTE_DATATABLE = "/webapi/v1/portal/getincidentsnotesdatatable",
    PROJECT_REPORT_INCIDENT_PFD = "/webapi/v1/portal/incidentpdf",

    // Project daily report module -portal
    PROJECT_DAILY_REPORT_SEND = "/webapi/v1/portal/senddailypdf",

    // Project attachment module -portal
    PROJECT_ATTACHMENT_SAVE = '/webapi/v1/portal/saveprojectattachment',
    PROJECT_ATTACHMENT_GET = "/webapi/v1/portal/getprojectattachment",
    PROJECT_ATTACHMENT_DELETE = "/webapi/v1/portal/deleteprojectattachment",
    PROJECT_GET_ALL_ATTACHMENT = "/webapi/v1/portal/getallprojectattachment",

    //project budget module -portal
    PROJECT_BUDGET_VENDOR_GET = "/webapi/v1/portal/getprojectvendor",
    PROJECT_BUDGET_USED_CARD_GET = "/webapi/v1/portal/getprojectcardused",

    //COMMON SAVE IMAGE
    PORTAL_COMMON_COMPANY_SAVE_PROFILE = "/webapi/v1/portal/saveprofileimagescompany",
    PORTAL_ATTECHMENT = "/webapi/v1/portal/saveattechment",
    PORTAL_SINGATURE = "/webapi/v1/portal/savesignature",

    //Location Module - Portal
    PORTAL_LOCATION_SAVE = "/webapi/v1/portal/savelocation",
    PORTAL_LOCATION_DELETE = "/webapi/v1/portal/deletelocation",
    PORTAL_LOCATION_GETDATA = "/webapi/v1/portal/getalllocation",
    PORTAL_LOCATION_GETONE = "/webapi/v1/portal/getonelocation",
    PORTAL_LOCATION_MANY_INSERT = "/webapi/v1/portal/savelocationxslx",

    //setting module -portal
    PORTAL_SETTING_USEAGE = "/webapi/v1/portal/compnayusage",
    PORTAL_SETTING_SMTP = "/webapi/v1/portal/compnaysmtp",
    PORTAL_SETTING_SMTP_UPDATE = "/webapi/v1/portal/compnayupdatesmtp",
    PORTAL_SETTING_GET = "/webapi/v1/portal/getallsetting",
    PORTAL_SETTING_UPDATE = "/webapi/v1/portal/getupdatesetting",
    PORTAL_SETTING_COMPANY_GET = "/webapi/v1/portal/compnayinformation",
    PORTAL_SETTING_COMPANY_UPDATE = "/webapi/v1/portal/compnayupdateinformation",
    PORTAL_SETTING_QUICKBOOK_UPDATE = "/webapi/v1/portal/compnayupdatequickbooks",

    //Company Module
    PORTAL_COMPANY_COSTCODE_GET = "/webapi/v1/portal/getcostcode",
    PORTAL_COMPANY_STATUS_GET = "/webapi/v1/portal/getstatussetting",
    PORTAL_COMPANY_COSTCODE_XLSX_SAVE = "/webapi/v1/portal/savexlsxcostcode",
    PORTAL_CHECK_AND_INSERT_COSTCODE = "/webapi/v1/portal/savecostcodeindb",

    //company equipment module -portal
    PORTAL_COMPANY_EQUIPMENT_GET = "/webapi/v1/portal/getAllEquipments",
    PORTAL_COMPANY_EQUIPMENT_TYPE_GET = "/webapi/v1/portal/getequipmenttype",
    PORTAL_COMPANY_EQUIPMENT_SAVE = "/webapi/v1/portal/saveequipment",
    PORTAL_COMPANY_EQUIPMENT_TRANSFER = "/webapi/v1/portal/transferequipment",
    PORTAL_COMPANY_EQUIPMENT_DATATABLE = "/webapi/v1/portal/getallequipmentsdatabase",
    PORTAL_COMPANY_EQUIPMENT_GET_BY_ID = "/webapi/v1/portal/getequipment",
    PORTAL_COMPANY_EQUIPMENT_DELETE = "/webapi/v1/portal/deleteequipment",
    PORTAL_COMPANY_EQUIPMENT_XSLX_SAVE = "/webapi/v1/portal/saveequipmentsxslx",
    PORTAL_COMPANY_EQUIPMENT_REPORT = "/webapi/v1/portal/getallequipmentsreport",
    PORTAL_COMPANY_EQUIPMENT_GET_ALL = "/webapi/v1/portal/getallequipments",
    PORTAL_COMPANY_EQUIPMENT_COUNT_GET = "/webapi/v1/portal/getequipmentcount",
    PORTAL_COMPANY_EQUIPMENT_RECEIVE = "/webapi/v1/portal/receivetransferequipment",
    PORTAL_COMPANY_EQUIPMENT_TRANSIT_CANCEL = "/webapi/v1/portal/canceltransferequipment",
    PORTAL_COMPANY_EQUIPMENT_RETURN = "/webapi/v1/portal/returnequipment",
    PORTAL_COMPANY_EQUIPMENT_AVAILABLE = "/webapi/v1/portal/availableequipment",

    // company item module -portal
    PORTAL_COMPANY_ITEM_TYPE_GET = "/webapi/v1/portal/getallitemtype",
    PORTAL_COMPANY_ITEM_TYPE_SAVE = "/webapi/v1/portal/saveitemtype",
    PORTAL_COMPANY_ITEM_TYPE_DELETE = "/webapi/v1/portal/deleteitemtype",
    PORTAL_COMPANY_ITEM_XLSX_SAVE = "/webapi/v1/portal/saveitemxslx",
    PORTAL_COMPANY_ITEM_ALL = "/webapi/v1/portal/getallitems",
    PORTAL_COMPANY_ITEM_PACKAGING_GET = "/webapi/v1/portal/getpackaging",
    PORTAL_COMPANY_ITEM_VENDOR_GET = "/webapi/v1/portal/getallvendor",
    PORTAL_COMPANY_ITEM_VENDOR_DATATABLE = "/webapi/v1/portal/getallvendorsatatable",
    PORTAL_COMPANY_ITEM_SAVE = "/webapi/v1/portal/saveitem",
    PORTAL_COMPANY_ITEM_DATATABLE = "/webapi/v1/portal/getallitemsdatabase",
    PORTAL_COMPANY_ITEM_GET_BY_ID = "/webapi/v1/portal/getitem",
    PORTAL_COMPANY_ITEM_DELETE = "/webapi/v1/portal/deleteitem",
    PORTAL_COMPANY_ALL_ITEM_GET = "/webapi/v1/portal/getallitems",
    PORTAL_COMPANY_ALL_ITEM_REPORT = "/webapi/v1/portal/getreportitems",

    //company material module -portal
    PORTAL_COMPANY_MATERIAL_XLSX = "/webapi/v1/portal/getallusedmaterialexport",
    PORTAL_COMPANY_MATERIAL_REPORT = "/webapi/v1/portal/getallusedmaterialReport",
    PORTAL_COMPANY_MATERIAL_USED_SAVE = "/webapi/v1/portal/saveusedmaterial",
    PORTAL_COMPANY_MATERIAL_EXTRA_XLSX = "/webapi/v1/portal/getallextramaterialexport",
    PORTAL_COMPANY_MATERIAL_EXTRA_REPORT = "/webapi/v1/portal/getallextramaterialreport",
    PORTAL_COMPANY_MATERIAL_USED_DATATABLE = "/webapi/v1/portal/getmaterialtypefordatatable",
    PORTAL_COMPANY_MATERIAL_EXTRA_DATATABLE = "/webapi/v1/portal/getallextramaterialdatatable",
    PORTAL_COMPANY_USED_MATERIAL_GET_BY_ID = "/webapi/v1/portal/getusedmaterial",
    PORTAL_COMPANY_USED_MATERIAL_DELETE = "/webapi/v1/portal/deleteusedmaterial",

    //company extra material module -portal
    PORTAL_COMPANY_EXTRA_MATERIAL_SAVE = "/webapi/v1/portal/saveextramaterial",
    PORTAAL_COMPANY_EXTRA_MATERIAL_GET_BY_ID = "/webapi/v1/portal/getextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_DELETE = "/webapi/v1/portal/deleteextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_TRANSFER = "/webapi/v1/portal/transferextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_TRANSIT_RECEIVE = "/webapi/v1/portal/receivetransferextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_TRANSIT_CANCEL = "/webapi/v1/portal/cancelintransitextramaterial",

    //company vendor module -portal
    PORTAL_COMPANY_VENDOR_SAVE = "/webapi/v1/portal/savevendor",
    PORTAL_COMPANY_VENDOR_GET_BY_ID = "/webapi/v1/portal/getvendor",
    PORTAL_COMPANY_VENDOR_DELETE = "/webapi/v1/portal/deletevendor",
    PORTAL_COMPANY_VENDOR_SAVE_XSLX = "/webapi/v1/portal/savevendorxslx",
    PORTAL_COMPANY_VENDOR_SAVE_REPORT = "/webapi/v1/portal/getallvendorreport",
    PORTAL_COMPANY_VENDOR_STATUS_CHANGE = "/webapi/v1/portal/updatevendorstatus",
    PORTAL_COMPANY_VENDOR_CONTACT_DESIGNATION = "/webapi/v1/portal/getdesignations",
    PORTAL_COMPANY_VENDOR_CONTACT_SAVE = "/webapi/v1/portal/savevendorcontact",
    PORTAL_COMPANY_VENDOR_CONTACT_DELETE = "/webapi/v1/portal/deletevendorcontact",
    PORTAL_COMPANY_VENDOR_CONTACT_DATATABLE = "/webapi/v1/portal/getallvendorcontactsdatatable",
    PORTAL_COMPANY_VENDOR_CONTACT_GET_BY_ID = "/webapi/v1/portal/getvendorcontact",

    //company po & poreceive module -portal
    PORTAL_COMPANY_PO_ITEM_GET = "/webapi/v1/portal/getallitems",
    PORTAL_COMPANY_PO_SAVE = "/webapi/v1/portal/savepocreation",
    PORTAL_COMPANY_PO_GET_BY_ID = "/webapi/v1/portal/getpocreation",
    PORTAL_COMPANY_PO_DELETE = "/webapi/v1/portal/deletepocreation",
    PORTAL_COMPANY_PO_RECIVED_SAVE = "/webapi/v1/portal/savereceivingpo",
    PORTAL_COMPANY_PO_RECIVED_GET_BY_ID = "/webapi/v1/portal/getreceivedpo",
    PORTAL_COMPANY_PO_RECIVED_DELETE = "/webapi/v1/portal/deletereceivedpo",
    PORTAL_COMPANY_PO_STATUS_COUNT = "/webapi/v1/portal/getpocount",
    PORTAL_COMPANY_PO_REPORT = "/webapi/v1/portal/getallpocreationreport",
    PORTAL_COMPANY_PO_SEND = "/webapi/v1/portal/sendpopdf",
    PORTAL_COMPANY_UPDATE_PO_STATUS = "/webapi/v1/portal/updatepo",
    PORTAL_COMPANY_PO_DATATABLE = "/webapi/v1/portal/getallpocreationdatatatble",
    PORTAL_COMPANY_PO_EXPORT = "/webapi/v1/portal/getallpocreationexport",
    PORTAL_COMPANY_DUPLICATE_ARCHIVED_PO = "/webapi/v1/portal/duplicatearchivepo",
    PORTAL_COMPANY_CREATE_PO_BACK_ORDER = "/webapi/v1/portal/createpobackorder",

    //company expenses module -portal
    PORTAL_COMPANY_GET_ALL_EXPENSES_TYPE = "/webapi/v1/portal/getallexpensestypes",
    PORTAL_COMPANY_EXPENSES_SAVE = "/webapi/v1/portal/saveexpenses",
    PORTL_COMPANY_EXPENSES_GET_BY_ID = "/webapi/v1/portal/getexpense",
    PORTAL_COMPANY_EXPENSES_DELETE = "/webapi/v1/portal/deleteexpenses",
    PORTAL_COMPANY_EXPENSES_GET_ALL = "/webapi/v1/portal/getallexpensesexport",
    PORTAL_COMPANY_EXPENSES_GET_REPORT = "/webapi/v1/portal/getallexpensesreport",
    PORTAL_COMPANY_EXPENSES_DATATABLE = "/webapi/v1/portal/getexpensesdatatable",

    //setting document module -portal
    PORTAL_SETTING_DOCUMENT_TYPE_SAVE = "/webapi/v1/portal/savedoctype",
    PORTAL_SETTING_DOCUMENT_TYPE_GET = "/webapi/v1/portal/getalldoctype",
    PORTAL_SETTING_DOCUMENT_TYPE_DELETE = "/webapi/v1/portal/deletedoctype",

    //setting departmeny module -portal
    PORTAL_SETTING_DEPARTMENTS_SAVE = "/webapi/v1/portal/savedepartment",
    PORTAL_SETTING_DEPARTMENTS_GET = "/webapi/v1/portal/getalldepartment",
    PORTAL_SETTING_DEPARTMENTS_DELETE = "/webapi/v1/portal/deletedepartment",

    //setting job tital module -portal
    PORTAL_SETTING_JOB_TITLE_ALL = "/webapi/v1/portal/getAlljobtitle",
    PORTAL_SETTING_JOB_TITLE_SAVE = "/webapi/v1/portal/savejobtitle",
    PORTAL_SETTING_JOB_TITLE_DELETE = "/webapi/v1/portal/deletejobtitle",

    //setting job type -portal
    PORTAL_SETTING_JOB_TYPE_ALL = "/webapi/v1/portal/getAlljobtype",
    PORTAL_SETTING_JOB_TYPE_SAVE = "/webapi/v1/portal/savejobtype",
    PORTAL_SETTING_JOB_TYPE_DELETE = "/webapi/v1/portal/deletejobtype",

    //setting relationship module -portal
    PORTAL_SETTING_RELATIONSHIP_ALL = "/webapi/v1/portal/getallrelationships",
    PORTAL_SETTING_RELATIONSHIP_SAVE = "/webapi/v1/portal/saverelationship",
    PORTAL_SETTING_RELATIONSHIP_DELETE = "/webapi/v1/portal/deleterelationship",

    //setting payroll group module -portal
    PORTAL_SETTING_PAYROLLGROUP_ALL = "/webapi/v1/portal/getAllpayroll_group",
    PORTAL_SETTING_PAYROLLGROUP_SAVE = "/webapi/v1/portal/savepayrollgroup",
    PORTAL_SETTING_PAYROLLGROUP_DELETE = "/webapi/v1/portal/deletepayrollgroup",

    //setting roles module -portal
    PORTAL_SETTING_ROLES_ALL = "/webapi/v1/portal/getallrolespermission",
    PORTAL_SETTING_ROLES_SAVE = "/webapi/v1/portal/saveRoles",

    // other setting packaging module -portal
    OTHER_SEETING_PACKAGING_SAVE = "/webapi/v1/portal/savepackaging",
    OTHER_SEETING_PACKAGING_GET = "/webapi/v1/portal/getpackaging",
    OTHER_SEETING_PACKAGING_DELETE = "/webapi/v1/portal/deletepackaging",

    //other setting manufacture module -portal
    OTHER_SEETING_MANUFACTURERS_SAVE = "/webapi/v1/portal/savemanufacturer",
    OTHER_SEETING_MANUFACTURERS_GET = "/webapi/v1/portal/getmanufacturer",
    OTHER_SEETING_MANUFACTURERS_DELETE = "/webapi/v1/portal/deletemanufacturer",

    //other setting equipment module -portal
    OTHER_SEETING_EQUIPMENT_SAVE = "/webapi/v1/portal/saveequipmenttype",
    OTHER_SEETING_EQUIPMENT_GET = "/webapi/v1/portal/getequipmenttype",
    OTHER_SEETING_EQUIPMENT_DELETE = "/webapi/v1/portal/deleteequipmenttype",

    //other setting ownership module -portal
    OTHER_SEETING_OWNERSHIP_SAVE = "/webapi/v1/portal/saveownership",
    OTHER_SEETING_OWNERSHIP_GET = "/webapi/v1/portal/getownership",
    OTHER_SEETING_OWNERSHIP_DELETE = "/webapi/v1/portal/deleteownership",

    //other setting status module -portal
    OTHER_SEETING_STATUSSETTING_SAVE = "/webapi/v1/portal/savestatussetting",
    OTHER_SEETING_STATUSSETTING_GET = "/webapi/v1/portal/getstatussetting",
    OTHER_SEETING_STATUSSETTING_DELETE = "/webapi/v1/portal/deletestatussetting",

    //other setting frequency module -portal
    OTHER_SEETING_FREQUENCY_SAVE = "/webapi/v1/portal/savefrequencysetting",
    OTHER_SEETING_FREQUENCY_GET = "/webapi/v1/portal/getfrequencysetting",
    OTHER_SEETING_FREQUENCY_DELETE = "/webapi/v1/portal/deletefrequencysetting",

    //other setting expenses module -portal
    OTHER_SEETING_EXPENSES_TYPE_GET = "/webapi/v1/portal/getallexpensestypes",
    OTHER_SEETING_EXPENSES_TYPE_SAVE = "/webapi/v1/portal/saveexpesestype",
    OTHER_SEETING_EXPENSES_TYPE_DELETE = "/webapi/v1/portal/deleteexpesestype",

    //other setting weight module -portal
    OTHER_SEETING_WEIGHT_SAVE = "/webapi/v1/portal/saveweight",
    OTHER_SETTING_WEIGHT_GET = "/webapi/v1/portal/getweight",
    OTHER_SETTING_WEIGHT_DELETE = "/webapi/v1/portal/deleteweight",

    //other setting project doument module -portal
    OTHER_SETTING_PROJECT_DOC_SAVE = "/webapi/v1/portal/saveProjectDocType",
    OTHER_SETTING_PROJECT_DOC_GET = "/webapi/v1/portal/getallProjectDocType",
    OTHER_SETTING_PROJECT_DOC_DELETE = "/webapi/v1/portal/deleteProjectDocType",

    //other setting cradit card module -portal
    OTHER_SETTING_CREDIT_CARD_SAVE = "/webapi/v1/portal/savecreditcardsettings",
    OTHER_SETTING_CREDIT_CARD_GET = "/webapi/v1/portal/getcreditcardsettings",
    OTHER_SETTING_CREDIT_CARD_DELETE = "/webapi/v1/portal/deletecreditcardsettings",

    //other setting color module -portal
    OTHER_COLOR_GET = "/webapi/v1/portal/getcolor",
    OTHER_COLOR_SAVE = "/webapi/v1/portal/savecolor",
    OTHER_COLOR_DELETE = "/webapi/v1/portal/deletecolor",

    //other setting term module -portal
    OTHER_TERM_GET = "/webapi/v1/portal/getinvoiceterm",
    OTHER_TERM_SAVE = "/webapi/v1/portal/saveinvoiceterm",
    OTHER_TERM_DELETE = "/webapi/v1/portal/deleteInvoiceterm",

    //ID CARD SAVE 
    ID_CARD_SAVE = "/webapi/v1/portal/updateshowidcardflag",

    //other setting language module -portal
    OTHER_LANGUAGE_GET = "/webapi/v1/portal/getlanguage",
    OTHER_LANGUAGE_SAVE = "/webapi/v1/portal/savelanguage",
    OTHER_LANGUAGE_DELETE = "/webapi/v1/portal/deletelanguage",

    //Dashboard Module
    PROJECT_WORKER_GET = "/webapi/v1/portal/getprojectworkercount",
    PROJECT_OPEN_TASK_GET = "/webapi/v1/portal/getprojectopentaskcount",
    PROJECT_SAFETY_INCIDENT_GET = "/webapi/v1/portal/gettotalsafetyincident",
    TOTAL_HOURS_PER_EMPLOYEE_GET = "/webapi/v1/portal/gettotalhoursperemployeecount",
    TOTAL_DELAY_PROJECT_GET = "/webapi/v1/portal/gettotalprojectdelays",
    RENTAL_EQUIPMENT_GET = "/webapi/v1/portal/getrentalequipmenttotal",
    PO_TOTAL_GET = "/webapi/v1/portal/getpototal",
    COMPLIANCE_GET = "/webapi/v1/portal/getcompliancetotal",
    PAYROLL_GET = "/webapi/v1/portal/getpayrolletotal",
    EXPENSES_BREAKDOWN_GET = "/webapi/v1/portal/getexpensesbreakdowntotal",

    DAILY_REPORT_GET = "/webapi/v1/portal/gettotaldailyreport",
    TEAM_MEMBERS_GET = "/webapi/v1/portal/gettotalteamcount",

    //DAILY REPORT
    DAILY_REPORT_ALL_PROJECT = "/webapi/v1/portal/getprojectdailyreportsdatatable",
    DAILY_REPORT_PROJECT_VIEW = "/webapi/v1/portal/dailyreportpdf",
    DAILY_REPORT_PROJECT_UPDATE = "/webapi/v1/portal/generateprojectdailyreport",
    REPORT_PROJECT_MISSING = "/webapi/v1/portal/getmissdailyreportsdatatable",
    REPORT_PROJECT_MISSING_UPDATE = "/webapi/v1/portal/updatedailyreportstatus",

    //History
    ITEM_HISTORY = "/webapi/v1/portal/historyitemdatatable",
    PO_HISTORY = "/webapi/v1/portal/getallpocreationhistory",
    PROJECT_HISTORY = "/webapi/v1/portal/getprojectshistory",
    TEAMS_HISTORY = "/webapi/v1/portal/getalluserhistory",
    LOCATION_HISTORY = "/webapi/v1/portal/getalllocationhistory",
    SHIFT_HISTORY = "/webapi/v1/portal/getshiftshistory",
    TIMECARD_HISTORY = "/webapi/v1/portal/gettimecardhistory",
    MATERIAL_HISTORY = "/webapi/v1/portal/getmaterialhistory",
    USED_MATERIAL_HISTORY = "/webapi/v1/portal/getextramaterialhistory",
    EQUIPMENT_HISTORY = "/webapi/v1/portal/getallequipmentshistory",
    VENDOR_HISTORY = "/webapi/v1/portal/getallvendorhistory",
    SCHEDULE_HISTORY = "/webapi/v1/portal/getshedulehistory",
    EXPENSE_HISTORY = "/webapi/v1/portal/getexpenseshistory",
    VENDOR_CONTACT_HISTORY = "/webapi/v1/portal/getallvendorcontactshistory",
    INCIDENT_HISTORY = "/webapi/v1/portal/getincidenthistorydatatable",
    INCIDENT_NOTE_HISTORY = "/webapi/v1/portal/getincidentnotehistorydatatable",

    //TODAY_ACTIVITY 
    GET_TODAY_ACTIVITY = "/webapi/v1/portal/gettodaysactivity",

    //BUDGET
    BUDGET_LIST_API = "/webapi/v1/portal/expensesbudgetdatatable",
    BUDGET_REPORT = "/webapi/v1/portal/expensesbudgetreport",
    BUDGET_USED = "/webapi/v1/portal/totalexpenses",

    //PAYROLL 
    PAYROLL_USER_GET = "/webapi/v1/portal/gettimecardusingemployeepayrollgroup",
    PAYROLL_USER_SAVE = "/webapi/v1/portal/savepayrolldate",
    PAYROLL_USER_DATATABLE = "/webapi/v1/portal/getpayrolldatabase",
    PAYROLL_VIEW = "/webapi/v1/portal/getpayrollinfo",

    //QUESTION SET 
    GET_ALL_QUESTION = "/webapi/v1/portal/getallquestions",
    SAVE_QUESTION = "/webapi/v1/portal/savequestions",
    DELETE_QUESTION = "/webapi/v1/portal/deletequestions",

    //SHORTCUTS 
    SHORTCUTS_SAVE = "/webapi/v1/portal/saveshortcusts",
    SHORTCUTS_GET = "/webapi/v1/portal/getshortcusts",
    SHORTCUTS_DELETE = "/webapi/v1/portal/deleteshortcusts",

    //SUPERADMIN SMALLTOOL STATUS UPDATE
    SMALLTOOL_STATUS_UPDATE = "/webapi/v1/superadmin/smalltool/updatestatussmalltool",

    //SUPERADMIN SMALLTOOL KIT STATUS UPDATE
    SMALLTOOL_KIT_STATUS_UPDATE = "/webapi/v1/superadmin/smalltool/updatestatussmalltoolkit",


    //SUPERADMIN MANUFACTURER ADD
    MANUFACTURER_ADD = "/webapi/v1/superadmin/smalltool/savemanufacturer",

    //SUPERADMIN CATEGORY ADD
    CATEGORY_ADD = "/webapi/v1/superadmin/smalltool/savecategories",


    //SUPERADMIN ROVUK-MANAGEMENT ITEM TYPE
    ADMIN_SETTING_ITEMTYPE = "/webapi/v1/superadmin/management/getitemtype",

    //SUPERADMIN ROVUK-MANAGEMENT PACKAGING
    ADMIN_SETTING_PACKAGING = "/webapi/v1/superadmin/management/getpackaging",

    //SUPERADMIN ROVUK-MANAGEMENT MANUFACTURER
    ADMIN_SETTING_MANUFACTURER = "/webapi/v1/superadmin/management/getmanufacturers",

    //SUPERADMIN ROVUK-MANAGEMENT EXPENSE
    ADMIN_SETTING_EXPENSE = "/webapi/v1/superadmin/management/getexpensestype",

    //SUPERADMIN ROVUK-MANAGEMENT EQUIPMENT
    ADMIN_SETTING_EQUIPMENT = "/webapi/v1/superadmin/management/getequipments",

    //SUPERADMIN ROVUK-MANAGEMENT OWNERSHIP
    ADMIN_SETTING_OWNERSHIP = "/webapi/v1/superadmin/management/getownership",

    //SUPERADMIN ROVUK-MANAGEMENT EQUIPMENT STATUS
    ADMIN_SETTING_EQUIPMENT_STATUS = "/webapi/v1/superadmin/management/getequipmentstatus",

    //SUPERADMIN ROVUK-MANAGEMENT FREQUENCY 
    ADMIN_SETTING_FREQUENCY = "/webapi/v1/superadmin/management/getfrequency",

    //SUPERADMIN ROVUK-MANAGEMENT WEIGHT
    ADMIN_SETTING_WEIGHT = "/webapi/v1/superadmin/management/getweight",

    //SUPERADMIN ROVUK-MANAGEMENT PROJECT DOCUMENT
    ADMIN_SETTING_PROJECT_DOCUMENT = "/webapi/v1/superadmin/management/getprojectdocument",

    //SUPERADMIN ROVUK-MANAGEMENT COLOR
    ADMIN_SETTING_PROJECT_COLOR = "/webapi/v1/superadmin/management/getcolor",

    //SUPERADMIN ROVUK-MANAGEMENT PACKAGING DELETE 
    ADMIN_SETTING_PACKAGING_DELETE = "/webapi/v1/superadmin/management/deletepackaging",

    //SUPERADMIN ROVUK-MANAGEMENT MANUFACTURERS DELETE
    ADMIN_SETTING_MANUFACTURERS_DELETE = "/webapi/v1/superadmin/management/deletemanufacturers",

    //SUPERADMIN ROVUK-MANAGEMENT ITEM TYPE DELETE
    ADMIN_SETTING_ITEMTYPE_DELETE = "/webapi/v1/superadmin/management/deleteitemtype",

    //SUPERADMIN ROVUK-MANAGEMENT EXPENSE TYPE DELETE
    ADMIN_SETTING_EXPENSE_TYPE_DELETE = "/webapi/v1/superadmin/management/deleteexpensestype",

    //SUPERADMIN ROVUK-MANAGEMENT EQUIPMENT DELETE
    ADMIN_SETTING_EQUIPMENT_DELETE = "/webapi/v1/superadmin/management/deleteequipments",

    //SUPERADMIN ROVUK-MANAGEMENT OWNERSHIP DELETE
    ADMIN_SETTING_OWNERSHIP_DELETE = "/webapi/v1/superadmin/management/deleteownership",

    //SUPERADMIN ROVUK-MANAGEMENT EQUIPMENT STATUS DELETE
    ADMIN_SETTING_EQUIPMENT_STATUS_DELETE = "/webapi/v1/superadmin/management/deleteequipmentstatus",

    //SUPERADMIN ROVUK-MANAGEMENT FREQUENCY DELETE
    ADMIN_SETTING_FREQUENCY_DELETE = "/webapi/v1/superadmin/management/deletefrequency",

    //SUPERADMIN ROVUK-MANAGEMENT WEIGHT DELETE
    ADMIN_SETTING_WEIGHT_DELETE = "/webapi/v1/superadmin/management/deleteweight",

    //SUPERADMIN ROVUK-MANAGEMENT PROJECT DOCUMENT DELETE
    ADMIN_SETTING_PROJECT_DOCUMENT_DELETE = "/webapi/v1/superadmin/management/deleteprojectdocument",

    //SUPERADMIN ROVUK-MANAGEMENT COLOR DELETE
    ADMIN_SETTING_PROJECT_COLOR_DELETE = "/webapi/v1/superadmin/management/deletecolor",

    //SUPERADMIN ROVUK-MANAGEMENT ITEM TYPE INSERT
    ADMIN_SETTING_ITEM_TYPE_INSERT = "/webapi/v1/superadmin/management/saveitemtype",

    //SUPERADMIN ROVUK-MANAGEMENT PACKAGING INSERT 
    ADMIN_SETTING_PACKAGING_INSERT = "/webapi/v1/superadmin/management/savepackaging",

    //SUPERADMIN ROVUK-MANAGEMENT MANUFACTURER INSERT 
    ADMIN_SETTING_MANUFACTURER_INSERT = "/webapi/v1/superadmin/management/savemanufacturers",

    //SUPERADMIN ROVUK-MANAGEMENT EQUIPMENT INSERT 
    ADMIN_SETTING_EQUIPMENT_INSERT = "/webapi/v1/superadmin/management/saveequipments",

    //SUPERADMIN ROVUK-MANAGEMENT OWNERSHIP INSERT 
    ADMIN_SETTING_OWNERSHIP_INSERT = "/webapi/v1/superadmin/management/saveownership",

    //SUPERADMIN ROVUK-MANAGEMENT FREQUENCY INSERT 
    ADMIN_SETTING_FREQUENCY_INSERT = "/webapi/v1/superadmin/management/savefrequency",

    //SUPERADMIN ROVUK-MANAGEMENT EXPENSE TYPE INSERT 
    ADMIN_SETTING_EXPENSE_TYPE_INSERT = "/webapi/v1/superadmin/management/saveexpensestype",

    //SUPERADMIN ROVUK-MANAGEMENT WEIGHT INSERT 
    ADMIN_SETTING_WEIGHT_INSERT = "/webapi/v1/superadmin/management/saveweight",

    //SUPERADMIN ROVUK-MANAGEMENT PROJECT DOCUMENT INSERT 
    ADMIN_SETTING_PROJECT_DOCUMENT_INSERT = "/webapi/v1/superadmin/management/saveprojectdocument",

    //SUPERADMIN ROVUK-MANAGEMENT COLOR INSERT 
    ADMIN_SETTING_COLOR_INSERT = "/webapi/v1/superadmin/management/savecolor",

    //SUPERADMIN ROVUK-MANAGEMENT EQUIPMENT STATUS INSERT 
    ADMIN_SETTING_EQUIPMENT_STATUS_INSERT = "/webapi/v1/superadmin/management/saveequipmentstatus",

    //SUPERADMIN ROVUK-MANAGEMENT ROLES
    ADMIN_SETTINGS_ROVUK_MANAGEMENT_ROLES = "/webapi/v1/superadmin/management/getallroles",

    //SUPERADMIN ROVUK-MANAGEMENT ROLES SAVE
    ADMIN_SETTINGS_ROVUK_MANAGEMENT_ROLES_SAVE = "/webapi/v1/superadmin/management/saveroles",

    //SUPERADMIN ROVUK-SMALLTOOL ROLES GET 
    ADMIN_SETTINGS_ROVUK_SMALLTOOL_ROLES_GET = "/webapi/v1/superadmin/smalltool/getallroles",


    //SUPERADMIN ROVUK-SMALLTOOL ROLES SAVE 
    ADMIN_SETTINGS_ROVUK_SMALLTOOL_ROLES_SAVE = "/webapi/v1/superadmin/smalltool/saveroles",

    //SUPERADMIN OTHERSETTINGS SMALLTOOLS CATEGORY
    ADMIN_SETTINGS_SMALLTOOLS_CATEGORY_DELETE = "/webapi/v1/superadmin/smalltool/deletecategories",
    ADMIN_SETTINGS_SMALLTOOLS_CATEGORY_GET = "/webapi/v1/superadmin/smalltool/getcategories",
    ADMIN_SETTINGS_SMALLTOOLS_CATEGORY_SAVE = "/webapi/v1/superadmin/smalltool/savecategories",

    //SUPERADMIN OTHERSETTINGS SMALLTOOLS MANUFACTURER 
    ADMIN_SETTINGS_SMALLTOOLS_MANUFACTURER_DELETE = "/webapi/v1/superadmin/smalltool/deletemanufacturer",
    ADMIN_SETTINGS_SMALLTOOLS_MANUFACTURER_GET = "/webapi/v1/superadmin/smalltool/getmanufacturer",
    ADMIN_SETTINGS_SMALLTOOLS_MANUFACTURER_SAVE = "/webapi/v1/superadmin/smalltool/savemanufacturer",

    //SUPERADMIN OTHERSETTINGS EQUIPMENTS MANUFACTURER 
    ADMIN_SETTINGS_EQUIPMENTS_MANUFACTURER_DELETE = "/webapi/v1/superadmin/smalltool/deleteequipmentmanufacturer",
    ADMIN_SETTINGS_EQUIPMENTS_MANUFACTURER_GET = "/webapi/v1/superadmin/smalltool/getequipmentmanufacturer",
    ADMIN_SETTINGS_EQUIPMENTS_MANUFACTURER_SAVE = "/webapi/v1/superadmin/smalltool/saveequipmentmanufacturer",
    EQUIPMENTS_MANUFACTURER_EXCLE = "/webapi/v1/superadmin/management/savebulkequipmentmanufacturers",

    //SUPERADMIN OTHERSETTINGS EQUIPMENTS CATEGORY
    ADMIN_SETTINGS_EQUIPMENTS_CATEGORY_DELETE = "/webapi/v1/superadmin/smalltool/deleteequipmentcategories",
    ADMIN_SETTINGS_EQUIPMENTS_CATEGORY_GET = "/webapi/v1/superadmin/smalltool/getequipmentcategories",
    ADMIN_SETTINGS_EQUIPMENTS_CATEGORY_SAVE = "/webapi/v1/superadmin/smalltool/saveequipmentcategories",
    EQUIPMENTS_CATEGORY_EXCLE = "/webapi/v1/superadmin/smalltool/savebulkequipmentcategories",

    GET_MENUFACURE_EQUIPMENTS = "/webapi/v1/superadmin/smalltool/getequipmentmanufacturer",
    GET_CATEGORY_BY_MENUFACURE_EQUIPMENTS = "/webapi/v1/superadmin/smalltool/getequipmentcategoriesbymanufacturers",
    SAVESMALLTOOL_EQUIPMENTS = "/webapi/v1/superadmin/smalltool/saveequipment",
    GET_DATATABLE__EQUIPMENTS = "/webapi/v1/superadmin/smalltool/datatableequipment",
    ADMIN_EQUIPMENTS_GETONE = "/webapi/v1/superadmin/smalltool/oneequipment",

    //SUPERADMIN OTHER SETTINGS TERMS CATEGORY
    ADMIN_SETTINGS_TERMS_CATEGORY_GET_TERM = "/webapi/v1/superadmin/management/getterm",
    ADMIN_SETTINGS_TERMS_CATEGORY_SAVE_TERM = "/webapi/v1/superadmin/management/saveterm",
    ADMIN_SETTINGS_TERMS_CATEGORY_DELETE_TERM = "/webapi/v1/superadmin/management/deleteterm",

    //SUPERADMIN OTHER SETTINGS LANGUAGE CATEGORY
    ADMIN_SETTINGS_LANGUAGES_CATEGORY_GET_LANGUAGE = "/webapi/v1/superadmin/management/getlanguage",
    ADMIN_SETTINGS_LANGUAGES_CATEGORY_SAVE_LANGUAGE = "/webapi/v1/superadmin/management/savelanguage",
    ADMIN_SETTINGS_LANGUAGES_CATEGORY_DELETE_LANGUAGE = "/webapi/v1/superadmin/management/deletelanguage",
    // Dashboard send image report

    DASHBOARD_IMAGE_REPORT = "/webapi/v1/portal/senddashboardreport",

    PUBLIC_PAGE_USER = "/webapi/v1/portal/getuserinformation",
    PUBLIC_PAGE_USER_DOCUMENT = "/webapi/v1/portal/getuserpublicdocument",
    PUBLIC_PAGE_PAST_SAFETY_TALK_DOCUMENT = "/webapi/v1/portal/getpastsafetytalkpublicuserdatatable",




    SPONSOR_GET_ALL_VENDOR = "/webapi/v1/getallsponsorvendor",
    SPONSOR_GET_VENDOR_FOR_CONTRACT = "/webapi/v1/getsponsorvendorforcontract",
    SPONSOR_VENDOR_DATATABLE = "/webapi/v1/getvendoruserdatatable",
    ONE_VENDOR_SPONSOR = "/webapi/v1/getonesponsorvendor",
    UPDATE_VENDOR_SPONSOR = "/webapi/v1/updatevendor",
    SAVE_VENDOR_SPONSOR = "/webapi/v1/savevendor",
    UPDATE_VENDOR_CONTACT_INFORMATION = "/webapi/v1/updatevendorcontactinformation",
    UPDATE_DEMOGRAPHICAL_INFO_SPONSORE = "/webapi/v1/savevendorminorityownerssponsor",
    RESTORE_VENDOR_USER = "/webapi/v1/restorevendor",
    ARCHIVE_VENDOR_USER = "/webapi/v1/archivevendor",
    ARCHIVE_VENDOR_DATATABLE = "/webapi/v1/getvendoruserdatatablearchive",
    VENDOR_HISTORY_DATATABLE = "/webapi/v1/getvendoruserhistorydatatable",
    VENDOR_IMPORT = "/webapi/v1/importvendors",
    SPECIFIC_VENDOR_GET = "/webapi/v1/getspecificvendor",
    VENDOR_BY_NIGP_CODE = "/webapi/v1/getvendorbynigp",

    COMPNAY_MIORITY_CODE_GET = "/webapi/v1/getcompanyminoritycode",
    COMPNAY_CODE_GET = "/webapi/v1/getcompanycode",
    COMPNAY_TYPE_GET = "/webapi/v1/getcompanytype",
    COMPNAY_SIZE_GET = "/webapi/v1/getcompanysize",
    COMPNAY_PRIME_WORK_PERFORMED_GET = "/webapi/v1/getsupplierprimeworkperformed",
    COMPNAY_CISDIVISION_GET = "/webapi/v1/getcsidivision",
    COMPNAY_SCHEDULEOFITEM_GET = "/webapi/v1/getsupplierscheduleofvaluesitem",
    COMPNAY_SCHEDULEOFITEM_GET_BY_CSI_DIVISION = "/webapi/v1/getscheduleofvaluesitembycsidivision",

    COMPNAY_INFO_OTHER_SETTING_GET = "/webapi/v1/compnayinformation",
    COMPNAY_SMTP_OTHER_SETTING_GET = "/webapi/v1/portal/compnaysmtp",

    COMPNAY_INFO_OTHER_SETTING_UPDATE = "/webapi/v1/editcompany",
    COMPNAY_SMTP_OTHER_SETTING_UPDATE = "/webapi/v1/compnayupdatesmtp",
    COMPNAY_SMTP_OTHER_SETTING_VERIFY = "/webapi/v1/compnayverifysmtp",

    COMPANY_SEDN_MAIL_IFRAME = "/webapi/v1/sendiframecode",

    CERTIFICATE_REPORT = "/webapi/v1/sendcertificationsreport",
    SEND_VENDOR_CERTIFICATE = "/webapi/v1/sendvendorcertificate",

    //project
    SUPPLIER_PROJECT_SAVE = "/webapi/v1/portal/savesupplierproject",
    SUPPLIER_PROJECT_GET_ONE = "/webapi/v1/portal/getonesupplierproject",
    SUPPLIER_PROJECT_GET_ALL = "/webapi/v1/portal/getallsupplierproject",
    SUPPLIER_PROJECT_GET_HISTORY_DATATABLES = "/webapi/v1/portal/getsupplierprojecthistorydatatables",
    SUPPLIER_PROJECT_GET_ARCHIVED_ALL = "/webapi/v1/portal/getsallarchivesupplierproject",
    SUPPLIER_PROJECT_GET_BY_CONTRACTOR = "/webapi/v1/portal/getprojectsofcontractor",
    SUPPLIER_PROJECT_RECOVER = "/webapi/v1/portal/recoversupplierproject",
    SUPPLIER_PROJECT_EXCEL_REPORT = "/webapi/v1/portal/getsupplierprojectexcelreport",
    SUPPLIER_PROJECT_WITHOUT_CONTRACT = "/webapi/v1/portal/getallsupplierprojectWithoutContract",

    PORTAL_ROVUK_SPONSOR_SAVE_PROJECT_CONTRACTOR = "/webapi/v1/portal/savesupplierprojectcontractor",
    PORTAL_ROVUK_SPONSOR_GET_PROJECT_CONTRACTOR_DATATABLES = "/webapi/v1/portal/getprojectcontractordatatable",
    PORTAL_ROVUK_SPONSOR_REMOVE_PROJECT_CONTRACTOR = "/webapi/v1/portal/removesupplierprojectcontractor",
    PORTAL_ROVUK_SPONSOR_GET_PRIME_OF_PROJECT = "/webapi/v1/portal/getprimeofproject",
    PORTAL_ROVUK_SPONSOR_GET_ALL_VENDOR_OF_PROJECT = "/webapi/v1/portal/getallvendorofproject",

    // Project Document
    SUPPLIER_PROJECT_SAVE_CERTIFICATE = "/webapi/v1/portal/savesupplierprojectcertificates",
    SUPPLIER_PROJECT_GET_CERTIFICATE = "/webapi/v1/portal/getsupplierprojectcertificates",
    SUPPLIER_PROJECT_SEND_CERTIFICATE_REPORT = "/webapi/v1/portal/sendprojectcertificationsreport",
    SUPPLIER_PROJECT_CERTIFICATE_HISTORY_DATATABLES = "/webapi/v1/portal/getsupplierprojectcertificatehistorydatatables",
    SUPPLIER_PROJECT_DELETE_CERTIFICATE = "/webapi/v1/portal/deletesupplierprojectcertificates",

    // Project Vendor Performance
    SUPPLIER_SAVE_VENDOR_PERFORMANCE = "/webapi/v1/portal/savesuppliervendorperformance",
    SUPPLIER_GET_ONE_VENDOR_PERFORMANCE = "/webapi/v1/portal/getonesuppliervendorperformance",
    SUPPLIER_GET_VENDOR_PERFORMANCE_DATATABLES = "/webapi/v1/portal/getsuppliervendorperformancedatatables",
    SUPPLIER_DELETE_VENDOR_PERFORMANCE = "/webapi/v1/portal/deletesuppliervendorperformance",
    SUPPLIER_GET_VENDOR_PERFORMANCE_HISTORY_DATATABLES = "/webapi/v1/portal/getsuppliervendorperformancehistorydatatables",
    SUPPLIER_GET_VENDOR_PERFORMANCE_EXCEL_REPORT = "/webapi/v1/portal/getsuppliervendorperformanceexcelreport",

    PORTAL_COMPANY_VENDOR_SEND_INVITATION_MAIL = "/webapi/v1/sendvendorinvitationmail",

    // Supplier Change Order
    SUPPLIER_CHANGE_ORDER_SAVE = "/webapi/v1/portal/savesupplierchangeorder",
    SUPPLIER_CHANGE_ORDER_CHANGE_STATUS = "/webapi/v1/portal/updatesupplierchangeorderstatus",
    SUPPLIER_CHANGE_ORDER_GET = "/webapi/v1/portal/getsupplierchangeorder",
    SUPPLIER_CHANGE_ORDER_GET_ONE = "/webapi/v1/portal/getonesupplierchangeorder",
    SUPPLIER_CHANGE_ORDER_GET_DATATABLES = "/webapi/v1/portal/getsupplierchangeorderdatatables",
    SUPPLIER_CHANGE_ORDER_GET_HISTORY_DATATABLES = "/webapi/v1/portal/getsupplierchangeorderhistorydatatables",
    SUPPLIER_CHANGE_ORDER_ARCHIVE = "/webapi/v1/portal/archivesupplierchangeorder",
    SUPPLIER_CHANGE_ORDER_RESTORE = "/webapi/v1/portal/restoresupplierchangeorder",
    SUPPLIER_CHANGE_ORDER_EXCEL_REPORT = "/webapi/v1/portal/getsupplierchangeorderexcelreport",
    SUPPLIER_CHANGE_ORDER_PDF_REPORT = "/webapi/v1/portal/getsupplierchangeorderpdfreport",

    // Project Email Recipients
    SUPPLIER_PROJECT_EMAIL_RECIPIENT_GET_USERS = "/webapi/v1/portal/getusersforemailrecipients",
    SUPPLIER_PROJECT_SAVE_EMAIL_RECIPIENT = "/webapi/v1/portal/saveprojectemailrecipients",
    SUPPLIER_PROJECT_GET_EMAIL_RECIPIENT = "/webapi/v1/portal/getprojectemailrecipients",

    // Employee
    PORTAL_GET_ALL_USERS = "/webapi/v1/portal/getalluser", // For display in team menu
    PORTAL_GET_ALL_USERS_LIST = "/webapi/v1/portal/getalluserlist", // For display user list in dropdown
    PORTAL_GET_MANAGEMENT_USERS = "/webapi/v1/portal/listManagementUser",
    PORTAL_IMPORT_MANAGEMENT_USERS = "/webapi/v1/portal/importManagementUser",

    // Project User
    PORTAL_GET_USERS_FOR_ADD_PROJECT_USERS = "/webapi/v1/portal/getsuersforaddprojectUser",
    PORTAL_SAVE_PROJECT_USER = "/webapi/v1/portal/savesupplierprojectuser",
    PORTAL_GET_PROJECT_USER_DATATABLES = "/webapi/v1/portal/getsupplierprojectuserdatatables",
    PORTAL_GET_PROJECT_USER_HISTORY_DATATABLES = "/webapi/v1/portal/getsupplierprojectuserhistorydatatables",
    PORTAL_GET_USER_PROJECTS_DATATABLES = "/webapi/v1/portal/getsupplierprojectofuserdatatables",

    // Vendor Report
    SPONSOR_VENDOR_INFORMATION_REPORT = "/webapi/v1/getvendorexcelreport",
    SPONSOR_VENDOR_DEMOGRAPHICAL_INFO_REPORT = "/webapi/v1/getvendordemographicalpdfreport",
    SPONSOR_VENDOR_REPORT_BY_CSI_CODE = "/webapi/v1/getvendorpdfreportbycsicode",
    SPONSOR_VENDOR_REPORT_BY_MINORITY_CODE = "/webapi/v1/getvendorpdfreportbyminoritycode",

    // Dashboard Charts
    DASHBOARD_CHART_GET_TOTAL_PROJECT_VALUE = "/webapi/v1/portal/getprojectvalue",
    DASHBOARD_CHART_GET_MINORITY_PARTICIPATION = "/webapi/v1/portal/getminorityparticipationvalue",
    DASHBOARD_CHART_GET_TOTAL_NUMBER_BY_DIVISION = "/webapi/v1/portal/getnigpdivisionvalue",
    DASHBOARD_CHART_GET_TOTAL_CONTRACT_VALUE_BYPRIME = "/webapi/v1/portal/gettotalcontractvaluebyprime",
    DASHBOARD_CHART_GET_PROJECT_NUMBER_OF_PAYMENT = "/webapi/v1/portal/getprojectnumberofpayment",
    DASHBOARD_CHART_GET_TOTAL_VALUE_BY_MINORITY = "/webapi/v1/portal/gettotalvaluebyminority",
    DASHBOARD_CHART_GET_SIGNED_UNSIGNED_DAILY_REPORT = "/webapi/v1/portal/getsignedunsigneddailyreport",
    DASHBOARD_CHART_GET_MINORITY_NON_MINORITY_PARTICIPATION = "/webapi/v1/portal/getminorityvsnonminorityparticipation",

    // Users Bulk Upload
    PORTAL_CHECK_AND_INSERT = "/webapi/v1/portal/checkandinsertimportdata",
    PORTAL_EMPLOYEE_REPORT = "/webapi/v1/portal/getallemployeereport",
    PORTAL_EMPLOYEE_IMPORT = "/webapi/v1/portal/importemployees",

    // Project Pay Retainage
    SPONSOR_PORTAL_GET_ALL_PROJECT_PAY_RETAINAGES = "/webapi/v1/portal/getallprojectpayretainage",
    SPONSOR_PORTAL_GET_PROJECT_VENDOR_PAY_RETAINAGES = "/webapi/v1/portal/getprojectvendorpayretainage",
    SPONSOR_PORTAL_SAVE_PROJECT_PAY_RETAINAGE = "/webapi/v1/portal/saveprojectpayretainage",
    SPONSOR_PORTAL_UPDATE_PROJECT_PAY_RETAINAGE_STATUS = "/webapi/v1/portal/updateprojectpayretainagestatus",
    SPONSOR_PORTAL_GET_PROJECT_PAY_RETAINAGE_DATATABLES = "/webapi/v1/portal/getprojectpayretainagedatatables",
    SPONSOR_PORTAL_GET_PROJECT_PAY_RETAINAGE_HISTORY_DATATABLES = "/webapi/v1/portal/getprojectpayretainagehistorydatatables",

    // Vendor Note
    SPONSOR_PORTAL_SAVE_VENDOR_NOTE = "/webapi/v1/portal/savesuppliervendornote",
    SPONSOR_PORTAL_DELETE_VENDOR_NOTE = "/webapi/v1/portal/deletesuppliervendornote",
    SPONSOR_PORTAL_GET_VENDOR_NOTE_DATATABLES = "/webapi/v1/portal/getsuppliervendornotedatatables",
    SPONSOR_PORTAL_GET_VENDOR_NOTE_HISTORY_DATATABLES = "/webapi/v1/portal/getsuppliervendornotehistorydatatables",

    // Supplier Owner Direct Purchase
    SUPPLIER_ODP_SAVE = "/webapi/v1/portal/savesupplierodp",
    SUPPLIER_ODP_CHANGE_STATUS = "/webapi/v1/portal/updatesupplierodpstatus",
    SUPPLIER_ODP_GET = "/webapi/v1/portal/getsupplierodp",
    SUPPLIER_ODP_GET_ONE = "/webapi/v1/portal/getonesupplierodp",
    SUPPLIER_ODP_GET_DATATABLES = "/webapi/v1/portal/getsupplierodpdatatables",
    SUPPLIER_ODP_GET_HISTORY_DATATABLES = "/webapi/v1/portal/getsupplierodphistorydatatables",
    SUPPLIER_ODP_ARCHIVE = "/webapi/v1/portal/archivesupplierodp",
    SUPPLIER_ODP_RESTORE = "/webapi/v1/portal/restoresupplierodp",
    SUPPLIER_ODP_EXCEL_REPORT = "/webapi/v1/portal/getsupplierodpexcelreport",
    SUPPLIER_ODP_PDF_REPORT = "/webapi/v1/portal/getsupplierodppdfreport",

    // Supplier Vendor Certificate 
    SPONSOR_PORTAL_SAVE_VENDOR_CERTIFICATE = "/webapi/v1/portal/savesuppliervendorcertificates",
    SPONSOR_PORTAL_DELETE_VENDOR_CERTIFICATE = "/webapi/v1/portal/deletesuppliervendorcertificates",
    SPONSOR_PORTAL_GET_VENDOR_CERTIFICATE = "/webapi/v1/portal/getsuppliervendorcertificates",
    SPONSOR_PORTAL_UPDATE_VENDOR_CERTIFICATE_STATUS = "/webapi/v1/portal/updatesuppliervendorcertificatestatus",
    SPONSOR_PORTAL_GET_VENDOR_CERTIFICATE_DATATABLES = "/webapi/v1/portal/getsuppliervendorcertificatesDatatables",

    PORTAL_COMPANY_EMPLOYEE_SETTING = "",
    PORTAL_CHECK_AND_INSERT_EMP_SETTING = "",

    // Supplier Contract
    SPONSOR_PORTAL_GET_CUSTOM_CONTRACT = "/webapi/v1/portal/getcustomsuppliercontract",
    SPONSOR_PORTAL_GET_ONE_CONTRACT = "/webapi/v1/portal/getonesuppliercontract",
    SPONSOR_PORTAL_SAVE_CONTRACT = "/webapi/v1/portal/savesuppliercontract",
    SPONSOR_PORTAL_GET_CONTRACT_DATATABLES = "/webapi/v1/portal/getsuppliercontractdatatable",
    SPONSOR_PORTAL_GET_CONTRACT_HISTORY_DATATABLES = "/webapi/v1/portal/getsuppliercontracthistorydatatable",
    SPONSOR_PORTAL_EXPIRE_CONTRACT = "/webapi/v1/portal/expiresuppliercontract",
    SPONSOR_PORTAL_SEND_CONTRACT_REPORT = "/webapi/v1/portal/getsuppliercontractpdfreport",

    // Supplier Contract Document
    SPONSOR_PORTAL_SAVE_CONTRACT_DOCUMENT = "/webapi/v1/portal/savesuppliercontractdocument",
    SPONSOR_PORTAL_GET_CONTRACT_DOCUMENT = "/webapi/v1/portal/getsuppliercontractdocuments",
    SPONSOR_PORTAL_SEND_CONTRACT_DOCUMENT_REPORT = "/webapi/v1/portal/sendcontractdocumentreport",
    SPONSOR_PORTAL_GET_CONTRACT_DOCUMENT_HISTORY_DATATABLES = "/webapi/v1/portal/getsuppliercontractdocumenthistorydatatables",
    SPONSOR_PORTAL_DELETE_CONTRACT_DOCUMENT = "/webapi/v1/portal/deletesuppliercontractdocuments",

    SPONSOR_PORTAL_DELETE_VENDOR_DOCUMENT = "/webapi/v1/deletevendorcertificate",

    SPONSOR_PORTAL_GET_USER_DOCUMENT_HISTORY_DATATABLES = "/webapi/v1/portal/getuserdocumenthistory",

    SPONSOR_GET_ALL_TODAYS_ACTIVITY = "/webapi/v1/portal/getsuppliertodaysAactivity",

    SPONSOR_GET_DAILY_REPORT_DATATABLES = "/webapi/v1/portal/getsupplierprojectdailyreportsdatatable",
    SPONSOR_SEND_DAILY_REPORT_PDF = "/webapi/v1/portal/getsupplierdailyreportpdfreport",

    GET_CHART_LIST = "/webapi/v1/portal/getchartlist",
    SAVE_CHART_LIST = "/webapi/v1/portal/savechartlist",

    GET_VENDORS_BASEDON_DROPDOWN = "/webapi/v1/portal/getvendorprojectcustomcontractor",
    TEAM_RECOVER = "/webapi/v1/portal/recoverteam",
    TEAM_AECHIVE = "/webapi/v1/portal/getarchiveteams",
    GET_COMPANY_SETTINGS = "/webapi/v1/getcompanysetting",
    SEND_SUPPLIER_OTP_EMAIL = "/webapi/v1/sendsupplierotp",
    SUBMITT_SUPPLIER_OTP = "/webapi/v1/submitemailotp",

    // PROJECT_DAILY_REPORT_SEND = "/webapi/v2/portal/senddailypdf",
    // DAILY_REPORT_PROJECT_VIEW = "/webapi/v2/portal/dailyreportpdf",
    // PROJECT_NOTE_SAVE = "/webapi/v2/portal/addnote",
    // PORTAL_ATTECHMENT = "/webapi/v2/portal/saveattechment",


    // PROJECT_ATTACHMENT_SAVE = '/webapi/v2/portal/saveprojectattachment',
    // PROJECT_ATTACHMENT_GET = "/webapi/v2/portal/getprojectattachment",
    // PROJECT_ATTACHMENT_DELETE = "/webapi/v2/portal/deleteprojectattachment",
    // PROJECT_GET_ALL_ATTACHMENT = "/webapi/v2/portal/getallprojectattachment",
    PROJECT_ATTACHMENT_HISTORY = "/webapi/v2/portal/getprojectattachmenthistorydatatable",

    //Project task module -portal
    // PROJECT_TASK_SAVE = "/webapi/v2/portal/addtask",
    // PROJECT_TASK_DATATABLE = "/webapi/v2/portal/gettaskdatatables",
    // PROJECT_TASK_GEET_BY_ID = "/webapi/v2/portal/getonetasks",
    // PROJECT_TASK_DELETE = "/webapi/v2/portal/deletetask",
    PROJECT_TASK_HISTORY = "/webapi/v2/portal/gettaskhistorydatatable",


    // PORTAL_COMPANY_MATERIAL_USED_SAVE = "/webapi/v2/portal/saveusedmaterial",
    // PORTAL_COMPANY_USED_MATERIAL_DELETE = "/webapi/v2/portal/deleteusedmaterial",
    // MATERIAL_HISTORY = "/webapi/v2/portal/getmaterialhistory",
    // PORTAL_COMPANY_EXTRA_MATERIAL_SAVE = "/webapi/v2/portal/saveextramaterial",
    // PORTAAL_COMPANY_EXTRA_MATERIAL_GET_BY_ID = "/webapi/v2/portal/getextramaterial",
    // PORTAL_COMPANY_EXTRA_MATERIAL_DELETE = "/webapi/v2/portal/deleteextramaterial",
    // PORTAL_COMPANY_EXTRA_MATERIAL_TRANSFER = "/webapi/v2/portal/transferextramaterial",
    // PORTAL_COMPANY_EXTRA_MATERIAL_TRANSIT_RECEIVE = "/webapi/v2/portal/receivetransferextramaterial",
    // PORTAL_COMPANY_EXTRA_MATERIAL_TRANSIT_CANCEL = "/webapi/v2/portal/cancelintransitextramaterial",
    // USED_MATERIAL_HISTORY = "/webapi/v2/portal/getextramaterialhistory",

    // PORTAL_COMPANY_EQUIPMENT_GET = "/webapi/v2/portal/getAllEquipments",
    // PORTAL_COMPANY_EQUIPMENT_TYPE_GET = "/webapi/v2/portal/getequipmenttype",
    // PORTAL_COMPANY_EQUIPMENT_SAVE = "/webapi/v2/portal/saveequipment",
    // PORTAL_COMPANY_EQUIPMENT_TRANSFER = "/webapi/v2/portal/transferequipment",
    // PORTAL_COMPANY_EQUIPMENT_DATATABLE = "/webapi/v2/portal/getallequipmentsdatabase",
    // PORTAL_COMPANY_EQUIPMENT_GET_BY_ID = "/webapi/v2/portal/getequipment",
    // PORTAL_COMPANY_EQUIPMENT_DELETE = "/webapi/v2/portal/deleteequipment",
    // PORTAL_COMPANY_EQUIPMENT_XSLX_SAVE = "/webapi/v2/portal/saveequipmentsxslx",
    // PORTAL_COMPANY_EQUIPMENT_REPORT = "/webapi/v2/portal/getallequipmentsreport",
    // PORTAL_COMPANY_EQUIPMENT_GET_ALL = "/webapi/v2/portal/getallequipments",
    // PORTAL_COMPANY_EQUIPMENT_COUNT_GET = "/webapi/v2/portal/getequipmentcount",
    // PORTAL_COMPANY_EQUIPMENT_RECEIVE = "/webapi/v2/portal/receivetransferequipment",
    // PORTAL_COMPANY_EQUIPMENT_TRANSIT_CANCEL = "/webapi/v2/portal/canceltransferequipment",
    // PORTAL_COMPANY_EQUIPMENT_RETURN = "/webapi/v2/portal/returnequipment",
    // PORTAL_COMPANY_EQUIPMENT_AVAILABLE = "/webapi/v2/portal/availableequipment",
    // EQUIPMENT_HISTORY = "/webapi/v2/portal/getallequipmentshistory",


    //Project incident module -portal
    // PROJECT_INCIDENT_SAVE = "/webapi/v2/portal/saveincident",
    // PROJECT_INCIDENT_GET_BY_ID = "/webapi/v2/portal/getsingleincident",
    // PROJECT_INCIDENT_DELETE = "/webapi/v2/portal/deleteincident",
    // PROJECT_INCIDENT_DATATABLE = "/webapi/v2/portal/getincidentDatatable",
    // PROJECT_INCIDENT_SAVE_NOTE = "/webapi/v2/portal/saveincidentnote",
    // PROJECT_INCIDENT_DELETE_NOTE = "/webapi/v2/portal/deleteincidentnote",
    // PROJECT_INCIDENT_NOTE_DATATABLE = "/webapi/v2/portal/getincidentsnotesdatatable",
    // PROJECT_REPORT_INCIDENT_PFD = "/webapi/v2/portal/incidentpdf",
    // INCIDENT_HISTORY = "/webapi/v2/portal/getincidenthistorydatatable",
    // INCIDENT_NOTE_HISTORY = "/webapi/v2/portal/getincidentnotehistorydatatable",


    // Projects Module - Portal
    // PORTAL_PROJECT_GET = "/webapi/v2/portal/getprojects",
    // ALL_PROJECT_GET = "/webapi/v2/portal/getallprojects",
    // PROJECT_SAVE = "/webapi/v2/portal/saveproject",
    PROJECT_AECHIVE = "/webapi/v2/portal/getarchiveprojects",
    PROJECT_RECOVER = "/webapi/v2/portal/recoverproject",
    // PROJECT_GET = "/webapi/v2/portal/getproject",
    // PROJECT_REPORT = "/webapi/v2/portal/projectreport",

    // Archive PO - Portal
    PORTAL_COMPANY_ARCHIVE_PO_DATATABLE = "/webapi/v2/portal/getarchivepoDataTable",


    //PROJECT NOTE
    NOTE_HISTORY = "/webapi/v2/portal/getnotehistorydatatable",
    // PROJECT_NOTE_DELETE = "/webapi/v2/portal/deleteNote",

    //SURVEY 
    // PROJECT_SURVEY_DELETE = "/webapi/v2/portal/deletesurvey",

    // PROJECT_SAFETY_TALK_FULL_LIST_DATATABLE = "/webapi/v2/portal/getallsafetytalkDatatable",

    FILEIPLOAD_SAFETY_TALKS = "/webapi/v2/portal/saveseftytalksfile",
    SAFETY_TALKS_PROJECT = "/webapi/v2/portal/savesafetytalks",
    SAFETY_TALKS_DOCUMENT = "/webapi/v2/portal/getsafetydocumenttype",
    PROJECT_SAFETYTALKS_DELETE = "/webapi/v2/portal/deletesafety",


    PORTAL_COMPANY_OTHER_SETTING = "/webapi/v2/portal/importothersetting",
    // PORTAL_COMPANY_ITEM_XLSX_SAVE = "/webapi/v2/portal/saveitemxslx",
    // PORTAL_COMPANY_VENDOR_SAVE_XSLX = "/webapi/v2/portal/savevendorxslx",
    // PORTAL_COMPANY_EMPLOYEE_SETTING = "/webapi/v2/portal/importemployeesetting",

    // PORTAL_EMPLOYEE_IMPORT = "/webapi/v2/portal/importemployees",


    PORTAL_ROVUK_SPONSOR_GET_CRERIFICATION = "/webapi/v1/getcertificationtype",
    PORTAL_ROVUK_SPONSOR_SAVE_CRERIFICATION = "/webapi/v1/savecertificationtype",
    PORTAL_ROVUK_SPONSOR_DELETE_CRERIFICATION = "/webapi/v1/deletecertificationtype",

    PORTAL_ROVUK_SPONSOR_GET_COMPNAY_CODE = "/webapi/v1/getcompanycode",
    PORTAL_ROVUK_SPONSOR_SAVE_COMPNAY_CODE = "/webapi/v1/savecompanycode",
    PORTAL_ROVUK_SPONSOR_DELETE_COMPNAY_CODE = "/webapi/v1/deletecompanycode",
    // SUPERADMIN_ROVUK_SPONSOR_IMPORT_COMPNAY_CODE = "/webapi/v2/superadmin/supplier_diversity/savebulkcompanycodes",
    PORTAL_ROVUK_SPONSOR_DATABASE_GET_COMPNAY_CODE = "/webapi/v1/getdatatablecompanycode",
    PORTAL_ROVUK_SPONSOR_ONE_GET_COMPNAY_CODE = "/webapi/v1/getonecompanycode",
    PORTAL_ROVUK_SPONSOR_ONE_IMPORT_COMPNAY_CODE = "/webapi/v1/importcompnaycode",
    PORTAL_ROVUK_SPONSOR_ONE_EXPORT_COMPNAY_CODE = "/webapi/v1/exportcompnaycode",


    PORTAL_ROVUK_SPONSOR_GET_COMPNAY_TYPE = "/webapi/v1/getcompanytype",
    PORTAL_ROVUK_SPONSOR_SAVE_COMPNAY_TYPE = "/webapi/v1/savecompanytype",
    PORTAL_ROVUK_SPONSOR_DELETE_COMPNAY_TYPE = "/webapi/v1/deletecompanytype",
    PORTAL_ROVUK_SPONSOR_IMPORT_COMPNAY_TYPE = "/webapi/v1/importcompanytype",
    PORTAL_ROVUK_SPONSOR_EXPORT_COMPNAY_TYPE = "/webapi/v1/exportcompanytype",



    PORTAL_ROVUK_SPONSOR_GET_COMPNAY_SIZE = "/webapi/v1/getcompanysize",
    PORTAL_ROVUK_SPONSOR_SAVE_COMPNAY_SIZE = "/webapi/v1/savecompanysize",
    PORTAL_ROVUK_SPONSOR_DELETE_COMPNAY_SIZE = "/webapi/v1/deletecompanysize",
    PORTAL_ROVUK_SPONSOR_IMPORT_COMPNAY_SIZE = "/webapi/v1/importcompanysize",
    PORTAL_ROVUK_SPONSOR_EXPORT_COMPNAY_SIZE = "/webapi/v1/exportcompanysize",

    PORTAL_ROVUK_SPONSOR_GET_MINORITY_CODE = "/webapi/v1/getcompanyminoritycode",
    PORTAL_ROVUK_SPONSOR_SAVE_MINORITY_CODE = "/webapi/v1/savecompanyminoritycode",
    PORTAL_ROVUK_SPONSOR_DELETE_MINORITY_CODE = "/webapi/v1/deletecompanyminoritycode",
    PORTAL_ROVUK_SPONSOR_IMPORT_MINORITY_CODE = "/webapi/v1/importminoritytype",
    PORTAL_ROVUK_SPONSOR_EXPORT_MINORITY_CODE = "/webapi/v1/exportminoritytype",

    PORTAL_ROVUK_SPONSOR_GET_PROJECT_TYPE = "/webapi/v1/getprojecttype",
    PORTAL_ROVUK_SPONSOR_SAVE_PROJECT_TYPE = "/webapi/v1/saveprojecttype",
    PORTAL_ROVUK_SPONSOR_DELETE_PROJECT_TYPE = "/webapi/v1/deleteprojecttype",
    PORTAL_ROVUK_SPONSOR_IMPORT_PROJECT_TYPE = "/webapi/v1/importprojecttype",
    PORTAL_ROVUK_SPONSOR_EXPORT_PROJECT_TYPE = "/webapi/v1/exportprojectype",

    PORTAL_ROVUK_SPONSOR_GET_DOCUMENT_TYPE = "/webapi/v1/getdocumenttype",
    PORTAL_ROVUK_SPONSOR_SAVE_DOCUMENT_TYPE = "/webapi/v1/savedocumenttype",
    PORTAL_ROVUK_SPONSOR_DELETE_DOCUMENT_TYPE = "/webapi/v1/deletedocumenttype",
    PORTAL_ROVUK_SPONSOR_IMPORT_DOCUMENT_TYPE = "/webapi/v1/importdocumenttype",
    PORTAL_ROVUK_SPONSOR_EXPORT_DOCUMENT_TYPE = "/webapi/v1/exportdocumenttype",

    PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED = "/webapi/v1/getsupplierprimeworkperformed",
    PORTAL_ROVUK_SPONSOR_SAVE_PRIME_WORK_PERFORMED = "/webapi/v1/savesupplierprimeworkperformed",
    PORTAL_ROVUK_SPONSOR_DELETE_PRIME_WORK_PERFORMED = "/webapi/v1/deletesupplierprimeworkperformed",
    PORTAL_ROVUK_SPONSOR_IMPORT_PRIME_WORK_PERFORMED = "/webapi/v1/importprimeworkperformed",
    PORTAL_ROVUK_SPONSOR_EXPORT_PRIME_WORK_PERFORMED = "/webapi/v1/exportprimeworkperformed",

    PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED = "/webapi/v1/getcsidivision",
    PORTAL_ROVUK_SPONSOR_SAVE_CSIDIVISION_WORK_PERFORMED = "/webapi/v1/savecsidivision",
    PORTAL_ROVUK_SPONSOR_DELETE_CSIDIVISION_WORK_PERFORMED = "/webapi/v1/deletecsidivision",
    PORTAL_ROVUK_SPONSOR_IMPORT_CSIDIVISION_WORK_PERFORMED = "/webapi/v1/importcsidivision",
    PORTAL_ROVUK_SPONSOR_EXPORT_CSIDIVISION_WORK_PERFORMED = "/webapi/v1/exportcsidivision",

    PORTAL_ROVUK_SPONSOR_GET_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/getsupplierscheduleofvaluesitem",
    PORTAL_ROVUK_SPONSOR_DATABASE_GET_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/getsupplierscheduleofvaluesitemdatatables",
    PORTAL_ROVUK_SPONSOR_GET_ONE_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/getonesupplierscheduleofvaluesitem",
    PORTAL_ROVUK_SPONSOR_SAVE_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/savesupplierscheduleofvaluesitem",
    PORTAL_ROVUK_SPONSOR_DELETE_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/deletesupplierscheduleofvaluesitem",
    PORTAL_ROVUK_SPONSOR_IMPORT_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/importscheduleofvaluesitem",
    PORTAL_ROVUK_SPONSOR_EXPORT_SCHEDULE_OF_VALUE_ITEM = "/webapi/v1/exportscheduleofvaluesitem",

    PORTAL_ROVUK_SPONSOR_GET_PERFORMANCE_REASON = "/webapi/v1/getperformancereason",
    PORTAL_ROVUK_SPONSOR_SAVE_PERFORMANCE_REASON = "/webapi/v1/saveperformancereason",
    PORTAL_ROVUK_SPONSOR_DELETE_PERFORMANCE_REASON = "/webapi/v1/deleteperformancereason",
    PORTAL_ROVUK_SPONSOR_IMPORT_PERFORMANCE_REASON = "/webapi/v1/importperformancereason",
    PORTAL_ROVUK_SPONSOR_EXPORT_PERFORMANCE_REASON = "/webapi/v1/exportperformancereason",

    PORTAL_ROVUK_SPONSOR_GET_PAYMENT_FOR = "/webapi/v1/getpaymentfor",
    PORTAL_ROVUK_SPONSOR_SAVE_PAYMENT_FOR = "/webapi/v1/savepaymentfor",
    PORTAL_ROVUK_SPONSOR_DELETE_PAYMENT_FOR = "/webapi/v1/deletepaymentfor",
    PORTAL_ROVUK_SPONSOR_IMPORT_PAYMENT_FOR = "/webapi/v1/importpaymentfor",
    PORTAL_ROVUK_SPONSOR_EXPORT_PAYMENT_FOR = "/webapi/v1/exportpaymentfor",

    PORTAL_ROVUK_SPONSOR_GET_PAYMENT_TYPE = "/webapi/v1/getpaymenttype",
    PORTAL_ROVUK_SPONSOR_SAVE_PAYMENT_TYPE = "/webapi/v1/savepaymenttype",
    PORTAL_ROVUK_SPONSOR_DELETE_PAYMENT_TYPE = "/webapi/v1/deletepaymenttype",
    PORTAL_ROVUK_SPONSOR_IMPORT_PAYMENT_TYPE = "/webapi/v1/importpaymenttype",
    PORTAL_ROVUK_SPONSOR_EXPORT_PAYMENT_TYPE = "/webapi/v1/exportpaymenttype",

    PORTAL_ROVUK_SPONSOR_GET_FREQUENCY = "/webapi/v1/getfrequency",
    PORTAL_ROVUK_SPONSOR_SAVE_FREQUENCY = "/webapi/v1/savefrequency",
    PORTAL_ROVUK_SPONSOR_DELETE_FREQUENCY = "/webapi/v1/deletefrequency",
    PORTAL_ROVUK_SPONSOR_IMPORT_FREQUENCY = "/webapi/v1/importfrequency",
    PORTAL_ROVUK_SPONSOR_EXPORT_FREQUENCY = "/webapi/v1/exportfrequency",

    PORTAL_ROVUK_SPONSOR_GET_UNIT_OF_MEASURE = "/webapi/v1/getunitofmeasure",
    PORTAL_ROVUK_SPONSOR_SAVE_UNIT_OF_MEASURE = "/webapi/v1/saveunitofmeasure",
    PORTAL_ROVUK_SPONSOR_DELETE_UNIT_OF_MEASURE = "/webapi/v1/deleteunitofmeasure",
    PORTAL_ROVUK_SPONSOR_IMPORT_UNIT_OF_MEASURE = "/webapi/v1/importunitofmeasure",
    PORTAL_ROVUK_SPONSOR_EXPORT_UNIT_OF_MEASURE = "/webapi/v1/exportunitofmeasure",

    PORTAL_ROVUK_SPONSOR_GET_EQUIPMENT_TYPE = "/webapi/v1/getequipmenttype",
    PORTAL_ROVUK_SPONSOR_SAVE_EQUIPMENT_TYPE = "/webapi/v1/saveequipmenttype",
    PORTAL_ROVUK_SPONSOR_DELETE_EQUIPMENT_TYPE = "/webapi/v1/deleteequipmenttype",
    PORTAL_ROVUK_SPONSOR_IMPORT_EQUIPMENT_TYPE = "/webapi/v1/importequipmenttype",
    PORTAL_ROVUK_SPONSOR_EXPORT_EQUIPMENT_TYPE = "/webapi/v1/exportequipmenttype",

    PORTAL_ROVUK_SPONSOR_GET_NOTE_TYPE = "/webapi/v1/getnotetype",
    PORTAL_ROVUK_SPONSOR_SAVE_NOTE_TYPE = "/webapi/v1/savenotetype",
    PORTAL_ROVUK_SPONSOR_DELETE_NOTE_TYPE = "/webapi/v1/deletenotetype",
    PORTAL_ROVUK_SPONSOR_IMPORT_NOTE_TYPE = "/webapi/v1/importnotetype",
    PORTAL_ROVUK_SPONSOR_EXPORT_NOTE_TYPE = "/webapi/v1/exportnotetype",


    PORTAL_ROVUK_SPONSOR_GET_CONTRACT_TYPE = "/webapi/v1/getcontracttype",
    PORTAL_ROVUK_SPONSOR_SAVE_CONTRACT_TYPE = "/webapi/v1/savecontracttype",
    PORTAL_ROVUK_SPONSOR_DELETE_CONTRACT_TYPE = "/webapi/v1/deletecontracttype",
    PORTAL_ROVUK_SPONSOR_IMPORT_CONTRACT_TYPE = "/webapi/v1/importcontracttype",
    PORTAL_ROVUK_SPONSOR_EXPORT_CONTRACT_TYPE = "/webapi/v1/exportcontracttype",

    PORTAL_ROVUK_SPONSOR_GET_DEPARTMENT = "/webapi/v1/getsupplierdepartment",
    PORTAL_ROVUK_SPONSOR_SAVE_DEPARTMENT = "/webapi/v1/savesupplierdepartment",
    PORTAL_ROVUK_SPONSOR_DELETE_DEPARTMENT = "/webapi/v1/deletesupplierdepartment",
    PORTAL_ROVUK_SPONSOR_IMPORT_DEPARTMENT = "/webapi/v1/importsupplierdepartment",
    PORTAL_ROVUK_SPONSOR_EXPORT_DEPARTMENT = "/webapi/v1/exportsupplierdepartment",

    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-term>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_TERMS = "/webapi/v1/portal/getinvoiceterm",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_TERMS = "/webapi/v1/portal/saveinvoiceterm",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_TERMS = "/webapi/v1/portal/deleteinvoiceterm",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-Text-reat>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_TEXT_RATE = "/webapi/v1/portal/gettaxrate",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_TEXT_RATE = "/webapi/v1/portal/savetaxrate",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_TEXT_RATE = "/webapi/v1/portal/deletetaxrate",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-document>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_DOCUMENT = "/webapi/v1/portal/getinvoicedocument",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_DOCUMENT = "/webapi/v1/portal/saveinvoicedocument",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_DOCUMENT = "/webapi/v1/portal/deleteInvoiceDocument",

    PORTAL_DASHBOARD_COUNT_GETDATA = "/webapi/v1/portal/getdashboardcount",
    PORTAL_DASHBOARD_CARD_COUNT_GETDATA = "/webapi/v1/portal/getdashboardpending",
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<invoice-other-setting-Alerta>>>>>>>>>>>>>>>>>>>>>>>>
    PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS = "/webapi/v1/portal/getallsetting",
    PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS = "/webapi/v1/portal/getupdatesetting",

    PORTAL_ROVUK_INVOICE_TEAM_NEW_HISTORY = "/webapi/v1/portal/getuserhistory",
    GET_GIF_LOADER = "/webapi/v1/getgifloader",
    // vendor module
    INVOICE_SAVE_VENDOR_FORM = "/webapi/v1/portal/savevendor",
    INVOICE_GET_ONE_VENDOR = "/webapi/v1/portal/getonevendor",
    INVOICE_GET_VENDOR_DATATABLES = "/webapi/v1/portal/getvendordatatable",
    INVOICE_ARCHIVE_VENDOR = "/webapi/v1/portal/deletevendor",
    INVOICE_GET_VENDOR_HISTORY = "/webapi/v1/portal/getvendorhistory",
    INVOICE_GET_VENDOR_REPORT = "/webapi/v1/portal/getvendorreport",
    INVOICE_CHANGE_VENDOR_STATUS = "/webapi/v1/portal/vendorStatusUpdate",
    INVOICE_VENDOR_STATUS_COUNT = "/webapi/v1/portal/getvendorstatuscount",

    // invoice module
    INVOICE_SAVE_INVOICE_PROCESS = "/webapi/v1/portal/saveinvoiceprocess",
    INVOICE_GET_INVOICE_PROCESS = "/webapi/v1/portal/getinvoiceprocess",
    INVOICE_PROCESS_INVOICE_DATA = "/webapi/v1/portal/importprocessinvoice",
    INVOICE_GET_LIST = "/webapi/v1/portal/getinvoice",
    INVOICE_GET_ONE_INVOICE = "/webapi/v1/portal/getoneinvoice",
    INVOICE_SAVE_INVOICE = "/webapi/v1/portal/saveinvoice",
}

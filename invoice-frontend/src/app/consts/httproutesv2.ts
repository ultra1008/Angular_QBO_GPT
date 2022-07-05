export enum httproutesv2 {
    PROJECT_DAILY_REPORT_SEND = "/webapi/v2/portal/senddailypdf",
    DAILY_REPORT_PROJECT_VIEW = "/webapi/v2/portal/dailyreportpdf",
    PROJECT_NOTE_SAVE = "/webapi/v2/portal/addnote",
    PORTAL_ATTECHMENT = "/webapi/v2/portal/saveattechment",


    PROJECT_ATTACHMENT_SAVE = '/webapi/v2/portal/saveprojectattachment',
    PROJECT_ATTACHMENT_GET = "/webapi/v2/portal/getprojectattachment",
    PROJECT_ATTACHMENT_DELETE = "/webapi/v2/portal/deleteprojectattachment",
    PROJECT_GET_ALL_ATTACHMENT = "/webapi/v2/portal/getallprojectattachment",
    PROJECT_ATTACHMENT_HISTORY = "/webapi/v2/portal/getprojectattachmenthistorydatatable",

    //Project task module -portal
    PROJECT_TASK_SAVE = "/webapi/v2/portal/addtask",
    PROJECT_TASK_DATATABLE = "/webapi/v2/portal/gettaskdatatables",
    PROJECT_TASK_GEET_BY_ID = "/webapi/v2/portal/getonetasks",
    PROJECT_TASK_DELETE = "/webapi/v2/portal/deletetask",
    PROJECT_TASK_HISTORY = "/webapi/v2/portal/gettaskhistorydatatable",


    PORTAL_COMPANY_MATERIAL_USED_SAVE = "/webapi/v2/portal/saveusedmaterial",
    PORTAL_COMPANY_USED_MATERIAL_DELETE = "/webapi/v2/portal/deleteusedmaterial",
    MATERIAL_HISTORY = "/webapi/v2/portal/getmaterialhistory",
    PORTAL_COMPANY_EXTRA_MATERIAL_SAVE = "/webapi/v2/portal/saveextramaterial",
    PORTAAL_COMPANY_EXTRA_MATERIAL_GET_BY_ID = "/webapi/v2/portal/getextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_DELETE = "/webapi/v2/portal/deleteextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_TRANSFER = "/webapi/v2/portal/transferextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_TRANSIT_RECEIVE = "/webapi/v2/portal/receivetransferextramaterial",
    PORTAL_COMPANY_EXTRA_MATERIAL_TRANSIT_CANCEL = "/webapi/v2/portal/cancelintransitextramaterial",
    USED_MATERIAL_HISTORY = "/webapi/v2/portal/getextramaterialhistory",

    PORTAL_COMPANY_EQUIPMENT_GET = "/webapi/v2/portal/getAllEquipments",
    PORTAL_COMPANY_EQUIPMENT_TYPE_GET = "/webapi/v2/portal/getequipmenttype",
    PORTAL_COMPANY_EQUIPMENT_SAVE = "/webapi/v2/portal/saveequipment",
    PORTAL_COMPANY_EQUIPMENT_TRANSFER = "/webapi/v2/portal/transferequipment",
    PORTAL_COMPANY_EQUIPMENT_DATATABLE = "/webapi/v2/portal/getallequipmentsdatabase",
    PORTAL_COMPANY_EQUIPMENT_GET_BY_ID = "/webapi/v2/portal/getequipment",
    PORTAL_COMPANY_EQUIPMENT_DELETE = "/webapi/v2/portal/deleteequipment",
    PORTAL_COMPANY_EQUIPMENT_XSLX_SAVE = "/webapi/v2/portal/saveequipmentsxslx",
    PORTAL_COMPANY_EQUIPMENT_REPORT = "/webapi/v2/portal/getallequipmentsreport",
    PORTAL_COMPANY_EQUIPMENT_GET_ALL = "/webapi/v2/portal/getallequipments",
    PORTAL_COMPANY_EQUIPMENT_COUNT_GET = "/webapi/v2/portal/getequipmentcount",
    PORTAL_COMPANY_EQUIPMENT_RECEIVE = "/webapi/v2/portal/receivetransferequipment",
    PORTAL_COMPANY_EQUIPMENT_TRANSIT_CANCEL = "/webapi/v2/portal/canceltransferequipment",
    PORTAL_COMPANY_EQUIPMENT_RETURN = "/webapi/v2/portal/returnequipment",
    PORTAL_COMPANY_EQUIPMENT_AVAILABLE = "/webapi/v2/portal/availableequipment",
    EQUIPMENT_HISTORY = "/webapi/v2/portal/getallequipmentshistory",


    //Project incident module -portal
    PROJECT_INCIDENT_SAVE = "/webapi/v2/portal/saveincident",
    PROJECT_INCIDENT_GET_BY_ID = "/webapi/v2/portal/getsingleincident",
    PROJECT_INCIDENT_DELETE = "/webapi/v2/portal/deleteincident",
    PROJECT_INCIDENT_DATATABLE = "/webapi/v2/portal/getincidentDatatable",
    PROJECT_INCIDENT_SAVE_NOTE = "/webapi/v2/portal/saveincidentnote",
    PROJECT_INCIDENT_DELETE_NOTE = "/webapi/v2/portal/deleteincidentnote",
    PROJECT_INCIDENT_NOTE_DATATABLE = "/webapi/v2/portal/getincidentsnotesdatatable",
    PROJECT_REPORT_INCIDENT_PFD = "/webapi/v2/portal/incidentpdf",
    INCIDENT_HISTORY = "/webapi/v2/portal/getincidenthistorydatatable",
    INCIDENT_NOTE_HISTORY = "/webapi/v2/portal/getincidentnotehistorydatatable",


    // Projects Module - Portal
    PORTAL_PROJECT_GET = "/webapi/v2/portal/getprojects",
    ALL_PROJECT_GET = "/webapi/v2/portal/getallprojects",
    PROJECT_SAVE = "/webapi/v2/portal/saveproject",
    PROJECT_AECHIVE = "/webapi/v2/portal/getarchiveprojects",
    PROJECT_RECOVER = "/webapi/v2/portal/recoverproject",
    PROJECT_GET = "/webapi/v2/portal/getproject",
    PROJECT_REPORT = "/webapi/v2/portal/projectreport",

    // Archive PO - Portal
    PORTAL_COMPANY_ARCHIVE_PO_DATATABLE = "/webapi/v2/portal/getarchivepoDataTable",


    //PROJECT NOTE
    NOTE_HISTORY = "/webapi/v2/portal/getnotehistorydatatable",
    PROJECT_NOTE_DELETE = "/webapi/v2/portal/deleteNote",

    //SURVEY 
    PROJECT_SURVEY_DELETE = "/webapi/v2/portal/deletesurvey",

    PROJECT_SAFETY_TALK_FULL_LIST_DATATABLE = "/webapi/v2/portal/getallsafetytalkDatatable",

    FILEIPLOAD_SAFETY_TALKS = "/webapi/v2/portal/saveseftytalksfile",
    SAFETY_TALKS_PROJECT = "/webapi/v2/portal/savesafetytalks",
    SAFETY_TALKS_DOCUMENT = "/webapi/v2/portal/getsafetydocumenttype",
    PROJECT_SAFETYTALKS_DELETE = "/webapi/v2/portal/deletesafety",


    PORTAL_COMPANY_OTHER_SETTING = "/webapi/v2/portal/importothersetting",
    PORTAL_COMPANY_ITEM_XLSX_SAVE = "/webapi/v2/portal/saveitemxslx",
    PORTAL_COMPANY_VENDOR_SAVE_XSLX = "/webapi/v2/portal/savevendorxslx",
    PORTAL_COMPANY_EMPLOYEE_SETTING = "/webapi/v2/portal/importemployeesetting",

    PORTAL_EMPLOYEE_IMPORT = "/webapi/v2/portal/importemployees",


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
}

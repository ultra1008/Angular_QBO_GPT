import { configData } from 'src/environments/configData';

export const httpversion = {
  PORTAL_V1: configData.API_URL + 'webapi/v1/portal/',
  V1: configData.API_URL + 'webapi/v1/',
};

export enum httproutes {
  // auth
  GET_COMPANY_SETTINGS = 'getcompanysetting',
  USER_LOGIN = 'login',
  SEND_OTP_EMAIL = 'sendotp',
  USER_FORGET_PASSWORD = 'forgetpassword',
  SUBMITT_OTP = 'submitemailotp',
  CHANGEPASSWORD = 'changepassword',

  // Vendor
  PORTAL_VENDOR_GET_FOR_TABLE = 'getvendorfortable',
  PORTAL_VENDOR_GET_ONE = 'getonevendor',
  PORTAL_VENDOR_SAVE = 'savevendor',
  PORTAL_VENDOR_STATUS_UPDATE = 'vendorStatusUpdate',
  PORTAL_VENDOR_DELETE = 'deletevendor',
  PORTAL_VENDOR_GET_HISTORY = 'getvendorhistory',
  PORTAL_VENDOR_REPORT = 'getvendorreport',
  PORTAL_VENDOR_ALL_DELETE = 'deleteMultipleVendor',
  PORTAL_ALL_VENDOR_STATUS_UPDATE = 'updateMultipleVendorStatus',

  // Terms
  PORTAL_TERM_GET = 'getinvoiceterm',
  PORTAL_TERM_SAVE = 'saveinvoiceterm',
  PORTAL_TERM_DELETE = 'deleteinvoiceterm',

  GET_COMPNAY_INFO = 'compnayinformation',
  GET_COMPNAY_TYPE = 'getcompanytype',
  GET_COMPNAY_NIGP = 'getcsidivision',
  GET_COMPNAY_SIZE = 'getcompanysize ',
  GET_COMPNAY_ACTIVE_SINEC = 'compnayinformation',
  SAVE_COMPNAY_INFO = 'editcompany',
  PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED = 'getsupplierprimeworkperformed',
  PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED = 'getcsidivision',
  // Attachment
  PORTAL_SAVE_ATTACHMENT = 'saveattechment',

  // User
  PORTAL_USER_GET_FOR_TABLE = 'getUserForTable',
  USER_DELETE = 'deleteteammember',
  USER_SETTING_ROLES_ALL = 'getallrolespermission',
  USER_RECOVER = 'recoverteam',
  USER_HISTORY = 'getuserhistory',
  USER_REPORT = 'getallemployeereport',
  TEAM_HISTORY = 'getuserhistory',
  GET_ALL_USER = 'getalluser',
  GET_LOCATION = 'getalllocation',
  GET_JOB_TITLE = 'getAlljobtitle',
  GET_JOB_TYPE = 'getAlljobtype',
  GET_LANGUAGE = 'getlanguage',
  GET_DEPARTMENT = 'getalldepartment',
  SAVE_USER = 'saveemployee',

  //Mail box
  MAILBOX_DATA_TABLE = 'getMailboxMonitorForTable',
  SAVE_MAILBOX = 'savemailboxmonitor',
  GET_ONE_MAILBOX = 'getonemailboxmonitor',
  DELETE_MAILBOX = 'deletemailboxmonitor',

  //SMTP
  GET_COMPNAY_SMTP = 'compnaysmtp',
  VERIFY_SMTP = 'compnayverifysmtp',
  SAVE_SMTP = 'compnayupdatesmtp',

  //employee
  SETTING_DOCUMENT_TYPE_DATA_TABLE = 'getdoctypefortable',
  SETTING_DOCUMENT_TYPE_GET = 'getalldoctype',
  SETTING_DOCUMENT_TYPE_DELETE = 'deletedoctype',
  SETTING_DOCUMENT_TYPE_SAVE = 'savedoctype',
  SETTING_DEPARTMENTS_DATA_TABLE = 'getdepartmentfortable',
  SETTING_DEPARTMENTS_GET = 'getalldepartment',
  SETTING_DEPARTMENTS_DELETE = 'deletedepartment',
  SETTING_DEPARTMENTS_SAVE = 'savedepartment',
  SETTING_JOB_TITLE_DATA_TABLE = 'getjobtitlefortable',
  SETTING_JOB_TITLE_ALL = 'getAlljobtitle',
  SETTING_JOB_TITLE_DELETE = 'deletejobtitle',
  SETTING_JOB_TITLE_SAVE = 'savejobtitle',
  SETTING_JOB_TYPE_DATA_TABLE = 'getjobtypefortable',
  SETTING_JOB_TYPE_ALL = 'getAlljobtype',
  SETTING_JOB_TYPE_DELETE = 'deletejobtype',
  SETTING_JOB_TYPE_SAVE = 'savejobtype',
  SETTING_RELATIONSHIP_DATA_TABLE = 'getrelationshipfortable',
  SETTING_RELATIONSHIP_ALL = 'getallrelationships',
  SETTING_RELATIONSHIP_DELETE = 'deleterelationship',
  SETTING_RELATIONSHIP_SAVE = 'saverelationship',
  OTHER_LANGUAGE_DATA_TABLE = 'getlanguageForTable',
  OTHER_LANGUAGE_GET = 'getlanguage',
  OTHER_LANGUAGE_DELETE = 'deletelanguage',
  OTHER_LANGUAGE_SAVE = 'savelanguage',

  //other settings
  OTHER_SETTINGS_GET_TERMS = 'getinvoiceterm',
  OTHER_SETTING_SAVE_TERMS = 'saveinvoiceterm',
  OTHER_SETTING_DELETE_TERMS = 'deleteinvoiceterm',
  OTHER_SETTINGS_IMPORT_TERMS = 'importterm',
  OTHER_SETTINGS_GET_VENDOR_TYPE = 'getvendortype',
  OTHER_SETTINGS_SAVE_VENDOR_TYPE = 'savevendortype',
  OTHER_SETTINGS_DELETE_VENDOR_TYPE = 'deletevendortype',
  OTHER_SETTINGS_IMPORT_VENDOR_TYPE = 'importvendortype',
  OTHER_SETTINGS_GET_TEXT_RATE = 'gettaxrate',
  OTHER_SETTING_SAVE_TEXT_RATE = 'savetaxrate',
  OTHER_SETTING_DELETE_TEXT_RATE = 'deletetaxrate',
  OTHER_SETTINGS_IMPORT_TEXT_RATE = 'importtax_rate',
  OTHER_SETTINGS_GET_DOCUMENT = 'getinvoicedocument',
  OTHER_SETTING_SAVE_DOCUMENT = 'saveinvoicedocument',
  OTHER_SETTING_DELETE_DOCUMENT = 'deleteInvoiceDocument',
  OTHER_SETTINGS_IMPORT_DOCUMENT = 'importInvoiceDocument',
  OTHER_SETTING_SAVE_JOB_NAME = 'savejobname',
  OTHER_SETTINGS_GET_JOB_NAME = 'getjobname',
  OTHER_SETTING_DELETE_JOB_NAME = 'deletejobname',
  OTHER_SETTINGS_IMPORT = 'importjobname',

  // Document_View
  INVOICE_OTHER_SETTING_UPDATE_ALERTS = 'getupdatesetting',
  PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS = 'getallsetting',

  // Report
  INVOICE_FOR_REPORT = 'getinvoiceforreport',

  //security
  PORTAL_SETTING_GET = 'getallsetting',
  PORTAL_SETTING_UPDATE = 'getupdatesetting',

  //Alerts
  PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS = 'getupdatesetting',
  PORTAL_SETTING_ROLES_ALL = 'getallrolespermission',
  PORTAL_GET_ALL_USERS = 'getalluser',
  // DOCUMENT
  DOCUMENTS_DATATABLE = 'getViewDocumentsDatatableForTable',

  //costcode
  COSTCODE_DATA_TABLE = 'getCostCodeForTable',
  DELETE_COST_CODE = 'deletecostcode',
  COST_CODE_SAVE = 'savecostcode',

  //usage
  USAGE_DATA_TABLE = 'getCustomerStates',
  PORTAL_SETTING_USEAGE = 'compnayusage',

  //role
  SETTING_ROLES_ALL = 'getallrolespermission',
  SETTING_ROLES_SAVE = 'saveRoles',
}

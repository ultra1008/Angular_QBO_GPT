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

  //Mail box
  MAILBOX_DATA_TABLE = 'getMailboxMonitorForTable',
  SAVE_MAILBOX = 'savemailboxmonitor',
  GET_ONE_MAILBOX = 'getonemailboxmonitor',
  DELETE_MAILBOX = 'deletemailboxmonitor',

  //SMTP
  GET_COMPNAY_SMTP = 'compnaysmtp',
  VERIFY_SMTP = 'compnayverifysmtp',
  SAVE_SMTP = 'compnayupdatesmtp',
}

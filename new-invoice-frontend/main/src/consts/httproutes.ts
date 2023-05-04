import { configData } from "src/environments/configData";

export const httpversion = {
    PORTAL_V1: configData.API_URL + "webapi/v1/portal/",
    V1: configData.API_URL + "webapi/v1/",
};

export enum httproutes {
    // auth
    GET_COMPANY_SETTINGS = "getcompanysetting",
    USER_LOGIN = "login",


    // Vendor
    PORTAL_VENDOR_GET_FOR_TABLE = "getvendorfortable",
    PORTAL_VENDOR_GET_ONE = "getonevendor",
    PORTAL_VENDOR_SAVE = "savevendor",
    PORTAL_VENDOR_STATUS_UPDATE = "vendorStatusUpdate",
    PORTAL_VENDOR_DELETE = "deletevendor",
    PORTAL_VENDOR_GET_HISTORY = "getvendorhistory",

    // Terms
    PORTAL_TERM_GET = "getinvoiceterm",
    PORTAL_TERM_SAVE = "saveinvoiceterm",
    PORTAL_TERM_DELETE = "deleteinvoiceterm",

    // Attachment
    PORTAL_SAVE_ATTACHMENT = "saveattechment",
}

export enum httpversion {
    PORTAL_V1 = "https://dbtest.rovuk.us:4207/webapi/v1/portal/"
}

export enum httproutes {
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
}

import { Invoice } from "src/app/invoice/invoice.model";
import { User } from "src/app/users/user.model";
import { Vendor } from "src/app/vendors/vendor.model";

export interface Permission {
    Add: boolean;
    Delete: boolean;
    Edit: boolean;
    View: boolean;
}

export interface UserPermission {
    Add: boolean;
    Delete: boolean;
    Edit: boolean;
    View: boolean;
    personalInformation: Permission;
    contactInformation: Permission;
    employeeInformation: Permission;
    emergencyContact: Permission;
    employeeDocument: Permission;
}

export interface RolePermission {
    dashboard: Permission;
    vendor: Permission;
    clientJob: Permission;
    invoice: Permission;
    documents: Permission;
    reports: Permission;
    users: UserPermission;
    settings: Permission;
}

export class ProcessDocument {
    _id: string;
    document_type: string;
    vendor_data: Vendor;
    invoice_no: string;
    status: string;
    po_no: string;
    created_by: User;
    // action-edit open associated edit page
    constructor (responce: ProcessDocument) {
        {
            this._id = responce._id;
            this.document_type = responce.document_type;
            this.vendor_data = responce.vendor_data;
            this.invoice_no = responce.invoice_no;
            this.status = responce.status;
            this.po_no = responce.po_no;
            this.created_by = responce.created_by;
        }
    }
}
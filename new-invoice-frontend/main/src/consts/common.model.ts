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
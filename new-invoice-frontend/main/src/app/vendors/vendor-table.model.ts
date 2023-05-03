import { formatDate } from "@angular/common";

export class VendorTable {
    id: number;
    img: string;
    fName: string;
    lName: string;
    email: string;
    gender: string;
    bDate: string;
    mobile: string;
    address: string;
    country: string;
    constructor (vendorTable: VendorTable) {
        {
            this.id = vendorTable.id || this.getRandomID();
            this.img = vendorTable.img || 'assets/images/user/user1.jpg';
            this.fName = vendorTable.fName || '';
            this.lName = vendorTable.lName || '';
            this.email = vendorTable.email || '';
            this.gender = vendorTable.gender || 'male';
            this.bDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
            this.mobile = vendorTable.mobile || '';
            this.address = vendorTable.address || '';
            this.country = vendorTable.country || '';
        }
    }
    public getRandomID(): number {
        const S4 = () => {
            return ((1 + Math.random()) * 0x10000) | 0;
        };
        return S4() + S4();
    }
}

export class DataTablesResponse {
    _id: string;
    vendor_name: string;
    vendor_id: string;
    customer_id: string;
    vendor_phone: string;
    vendor_email: string;
    vendor_address: string;
    vendor_status: number;
    vendor_attachment: Array<string>;
    isVendorfromQBO: boolean;
    constructor (response: DataTablesResponse) {
        {
            this._id = response._id;
            this.vendor_name = response.vendor_name;
            this.vendor_id = response.vendor_id;
            this.customer_id = response.customer_id;
            this.vendor_phone = response.vendor_phone;
            this.vendor_email = response.vendor_email;
            this.vendor_address = response.vendor_address;
            this.vendor_status = response.vendor_status;
            this.vendor_attachment = response.vendor_attachment;
            this.isVendorfromQBO = response.isVendorfromQBO;
        }
    }
}

export class UpdateResponse {
    status: boolean;
    message: string;
    constructor (response: UpdateResponse) {
        {
            this.status = response.status;
            this.message = response.message;
        }
    }
}

export class TermModel {
    _id: string;
    name: string;
    is_dicount: boolean;
    discount: number;
    due_days: string;
    constructor (response: TermModel) {
        {
            this._id = response._id;
            this.name = response.name;
            this.is_dicount = response.is_dicount;
            this.discount = response.discount;
            this.due_days = response.due_days;
        }
    }
}
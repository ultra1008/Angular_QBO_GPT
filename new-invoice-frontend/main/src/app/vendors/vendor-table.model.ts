export class Vendor {
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
    constructor (response: Vendor) {
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
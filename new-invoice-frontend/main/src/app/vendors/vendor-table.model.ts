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

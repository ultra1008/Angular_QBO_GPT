import { formatDate } from "@angular/common";

export class User {
    _id: string;
    userfullname: string;
    useremail: string;
    role_name: string;
    userphone: string;
    userjob_title_name: string;
    department_name: string;
    userstatus: number;
    static _id: string;
    constructor(response: User) {
        {
            this._id = response._id;
            this.userfullname = response.userfullname;
            this.useremail = response.useremail;
            this.role_name = response.role_name;
            this.userphone = response.userphone;
            this.userjob_title_name = response.userjob_title_name;
            this.department_name = response.department_name;
            this.userstatus = response.userstatus;
        }
    }
}

export class AdvanceTable {
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
    constructor(advanceTable: AdvanceTable) {
        {
            this.id = advanceTable.id || this.getRandomID();
            this.img = advanceTable.img || 'assets/images/user/user1.jpg';
            this.fName = advanceTable.fName || '';
            this.lName = advanceTable.lName || '';
            this.email = advanceTable.email || '';
            this.gender = advanceTable.gender || 'male';
            this.bDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
            this.mobile = advanceTable.mobile || '';
            this.address = advanceTable.address || '';
            this.country = advanceTable.country || '';
        }
    }
    public getRandomID(): number {
        const S4 = () => {
            return ((1 + Math.random()) * 0x10000) | 0;
        };
        return S4() + S4();
    }
}

export class RoleModel {
    _id: string;
    role_name: string;
    is_delete: boolean;
    role_id: string;

    constructor(response: RoleModel) {
        {
            this._id = response._id;
            this.role_name = response.role_name;
            this.is_delete = response.is_delete;
            this.role_id = response.role_id;

        }
    }
}

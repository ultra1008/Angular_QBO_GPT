export class User {
    _id: string;
    userfullname: string;
    useremail: string;
    role_name: string;
    userphone: string;
    userjob_title_name: string;
    department_name: string;
    userstatus: number;
    constructor (response: User) {
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
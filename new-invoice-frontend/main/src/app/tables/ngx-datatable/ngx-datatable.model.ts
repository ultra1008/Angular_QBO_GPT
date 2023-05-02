export class NgxDatable {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  address: string;
  age: string;
  email: string;
  phone: string;
  constructor(departmentList: NgxDatable) {
    {
      this.id = departmentList.id || this.getRandomID();
      this.firstName = departmentList.firstName || '';
      this.lastName = departmentList.lastName || '';
      this.gender = departmentList.gender || '';
      this.address = departmentList.address || '';
      this.age = departmentList.age || '';
      this.email = departmentList.email || '';
      this.phone = departmentList.phone || '';
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}

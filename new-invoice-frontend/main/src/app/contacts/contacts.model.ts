import { formatDate } from '@angular/common';
export class Contacts {
  id: number;
  img: string;
  name: string;
  email: string;
  birthDate: string;
  mobile: string;
  address: string;
  note: string;

  constructor(contacts: Contacts) {
    {
      this.id = contacts.id || this.getRandomID();
      this.img = contacts.img || 'assets/images/user/usrbig1.jpg';
      this.name = contacts.name || '';
      this.email = contacts.email || '';
      this.birthDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.address = contacts.address || '';
      this.mobile = contacts.mobile || '';
      this.note = contacts.note || '';
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}

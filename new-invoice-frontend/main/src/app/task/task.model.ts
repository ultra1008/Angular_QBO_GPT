import { formatDate } from '@angular/common';
export class Task {
  id: string;
  img: string;
  name: string;
  title: string;
  done: boolean;
  note: string;
  priority: string;
  due_date: string;
  constructor(appointment: Task) {
    {
      this.id = appointment.id || this.getRandomID();
      this.img = appointment.img || 'assets/images/user/user1.jpg';
      this.name = appointment.name || '';
      this.title = appointment.title || '';
      this.done = appointment.done || true;
      this.due_date = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.note = appointment.note || '';
      this.priority = appointment.priority || '';
    }
  }
  public getRandomID(): string {
    const S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4();
  }
}

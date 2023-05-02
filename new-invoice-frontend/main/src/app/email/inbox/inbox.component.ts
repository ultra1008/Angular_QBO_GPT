import { Component } from '@angular/core';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent {
  breadscrums = [
    {
      title: 'Inbox',
      items: ['Email'],
      active: 'Inbox',
    },
  ];
  constructor() {
    //constructor
  }
}

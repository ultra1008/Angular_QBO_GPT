import { Component } from '@angular/core';
@Component({
  selector: 'app-read-mail',
  templateUrl: './read-mail.component.html',
  styleUrls: ['./read-mail.component.scss'],
})
export class ReadMailComponent {
  breadscrums = [
    {
      title: 'Read',
      items: ['Email'],
      active: 'Read',
    },
  ];

  constructor() {
    //constructor
  }
}

import { Component } from '@angular/core';
@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  breadscrums = [
    {
      title: 'Bedge',
      items: ['UI'],
      active: 'Bedge',
    },
  ];

  constructor() {
    //constructor
  }
}

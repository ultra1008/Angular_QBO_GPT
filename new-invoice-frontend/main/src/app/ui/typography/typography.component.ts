import { Component } from '@angular/core';
@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.scss'],
})
export class TypographyComponent {
  breadscrums = [
    {
      title: 'Typography',
      items: ['UI'],
      active: 'Typography',
    },
  ];

  constructor() {
    //constructor
  }
}

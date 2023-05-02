import { Component } from '@angular/core';
@Component({
  selector: 'app-helper-classes',
  templateUrl: './helper-classes.component.html',
  styleUrls: ['./helper-classes.component.scss'],
})
export class HelperClassesComponent {
  breadscrums = [
    {
      title: 'Helper',
      items: ['UI'],
      active: 'Helper',
    },
  ];

  constructor() {
    //constructor
  }
}

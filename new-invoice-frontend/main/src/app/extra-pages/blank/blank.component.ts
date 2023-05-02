import { Component } from '@angular/core';
@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
})
export class BlankComponent {
  breadscrums = [
    {
      title: 'Blank',
      items: ['Extra'],
      active: 'Blank',
    },
  ];
  constructor() {
    // constructor
  }
}

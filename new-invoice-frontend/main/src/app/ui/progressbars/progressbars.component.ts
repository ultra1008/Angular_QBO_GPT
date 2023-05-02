import { Component } from '@angular/core';
@Component({
  selector: 'app-progressbars',
  templateUrl: './progressbars.component.html',
  styleUrls: ['./progressbars.component.scss'],
})
export class ProgressbarsComponent {
  breadscrums = [
    {
      title: 'Progress',
      items: ['UI'],
      active: 'Progress',
    },
  ];

  constructor() {
    //constructor
  }
}

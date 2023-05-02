import { Component } from '@angular/core';
@Component({
  selector: 'app-timeline1',
  templateUrl: './timeline1.component.html',
  styleUrls: ['./timeline1.component.scss'],
})
export class Timeline1Component {
  breadscrums = [
    {
      title: 'Timeline 1',
      items: ['Timeline'],
      active: 'Timeline 1',
    },
  ];

  constructor() {
    // constructor
  }
}

import { Component } from '@angular/core';
@Component({
  selector: 'app-timeline2',
  templateUrl: './timeline2.component.html',
  styleUrls: ['./timeline2.component.scss'],
})
export class Timeline2Component {
  breadscrums = [
    {
      title: 'Timeline 2',
      items: ['Timeline'],
      active: 'Timeline 2',
    },
  ];

  constructor() {
    //constructor
  }
}

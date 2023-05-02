import { Component } from '@angular/core';
@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
})
export class LabelsComponent {
  breadscrums = [
    {
      title: 'Labels',
      items: ['UI'],
      active: 'Labels',
    },
  ];

  constructor() {
    //constructor
  }
}

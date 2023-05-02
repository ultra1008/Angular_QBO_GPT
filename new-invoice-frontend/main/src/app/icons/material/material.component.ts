import { Component } from '@angular/core';
@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss'],
})
export class MaterialComponent {
  breadscrums = [
    {
      title: 'Material',
      items: ['Icons'],
      active: 'Material',
    },
  ];
  constructor() {
    //constructor
  }
}

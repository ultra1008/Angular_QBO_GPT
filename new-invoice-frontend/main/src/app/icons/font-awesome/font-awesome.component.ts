import { Component } from '@angular/core';
@Component({
  selector: 'app-font-awesome',
  templateUrl: './font-awesome.component.html',
  styleUrls: ['./font-awesome.component.scss'],
})
export class FontAwesomeComponent {
  breadscrums = [
    {
      title: 'Font-awesome',
      items: ['Icons'],
      active: 'Font-awesome',
    },
  ];
  constructor() {
    //constructor
  }
}

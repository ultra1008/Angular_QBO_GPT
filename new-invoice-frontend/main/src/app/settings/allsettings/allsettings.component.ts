import { Component } from '@angular/core';

@Component({
  selector: 'app-allsettings',
  templateUrl: './allsettings.component.html',
  styleUrls: ['./allsettings.component.scss']
})
export class AllsettingsComponent {
  breadscrums = [
    {
      title: 'Profile',
      items: ['Extra'],
      active: 'Profile',
    },
  ];

  constructor() {
    //constructor
  }
}
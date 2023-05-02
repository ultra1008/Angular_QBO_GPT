import { Component } from '@angular/core';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
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

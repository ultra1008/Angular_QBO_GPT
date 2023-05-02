import { Component } from '@angular/core';
@Component({
  selector: 'app-preloaders',
  templateUrl: './preloaders.component.html',
  styleUrls: ['./preloaders.component.scss'],
})
export class PreloadersComponent {
  breadscrums = [
    {
      title: 'Preloaders',
      items: ['UI'],
      active: 'Preloaders',
    },
  ];

  constructor() {
    //constructor
  }
}

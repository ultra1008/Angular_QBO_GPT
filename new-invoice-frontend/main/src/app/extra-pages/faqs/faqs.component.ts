import { Component } from '@angular/core';
@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
})
export class FaqsComponent {
  breadscrums = [
    {
      title: 'Faqs',
      items: ['Extra'],
      active: 'Faqs',
    },
  ];

  constructor() {
    //constructor
  }
}

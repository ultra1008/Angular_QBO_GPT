import { Component } from '@angular/core';
@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent {
  breadscrums = [
    {
      title: 'Pricing',
      items: ['Extra'],
      active: 'Pricing',
    },
  ];

  constructor() {
    //constructor
  }
}

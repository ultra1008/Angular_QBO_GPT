import { Component } from '@angular/core';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent {
  breadscrums = [
    {
      title: 'Invoice',
      items: ['Extra'],
      active: 'Invoice',
    },
  ];
  constructor() {
    //constructor
  }
}

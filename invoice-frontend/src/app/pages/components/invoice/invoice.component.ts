import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { icon, localstorageconstants } from 'src/app/consts';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  constructor(private router: Router) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
  }

  ngOnInit(): void {
  }

  openform() {
    this.router.navigate(['/invoice-form']);
  }
}

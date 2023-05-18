import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { icon } from 'src/consts/icon';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent {

  qboIcon: any = icon.QUICKBOOKS_ONLINE_LOGO;
  qbdIcon: any = icon.QUICKBOOKS_DESKTOP_LOGO;

  constructor(private router: Router) {

  }

  ngOnInit() {

  }

  clickOnCard(type: any) {
    if (type == "qbo") {
      this.router.navigate(['settings/qbo-integration']);
    } else if (type == "qbd") {
      this.router.navigate(['settings/qbd-integration']);
    }
  }

  back() {
    this.router.navigate(['/settings']);
  }
}

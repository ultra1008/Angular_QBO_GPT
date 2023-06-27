import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent {
  qboIcon: any = icon.QUICKBOOKS_ONLINE_LOGO;
  qbdIcon: any = icon.QUICKBOOKS_DESKTOP_LOGO;
  onlineLoggedIn = true;
  desktopLoggedIn = true;

  constructor (private router: Router, private commonService: CommonService) {
    this.getCompanyTenants();
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {
      this.onlineLoggedIn = data.data.is_quickbooks_online == true;
      this.desktopLoggedIn = data.data.is_quickbooks_desktop == true;
    }
  }

  clickOnCard(type: any) {
    if (type == "qbo") {
      this.router.navigate([WEB_ROUTES.QBO_INTEGRATION_SETTING]);
    } else if (type == "qbd") {
      this.router.navigate([WEB_ROUTES.QBD_INTEGRATION_SETTING]);
    }
  }

  clickOnCalculator() {
    this.router.navigate(["settings/calculator"]);
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}

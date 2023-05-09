import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WEB_ROUTES } from 'src/consts/routes';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-allsettings',
  templateUrl: './allsettings.component.html',
  styleUrls: ['./allsettings.component.scss'],
})
export class AllsettingsComponent {
  CompanyData: any;
  constructor(
    private router: Router,
    public translate: TranslateService,
    public SettingsServices: SettingsService
  ) {
    this.getOneCompany();
    //constructor
  }

  async getOneCompany() {
    let that = this;
    const data = await this.SettingsServices.getCompanyInfo();
    console.log('data', data);
    that.CompanyData = data.data;
  }

  openMailboxListing() {
    this.router.navigate(['/settings/mailbox']);
  }

  openEmployeeSettings() {
    this.router.navigate(['/settings/employeesettings']);
  }

  openRolesSettings() {
    this.router.navigate(['/settings/rolesettings']);
  }

  openAlertsSettings() {
    this.router.navigate(['/settings/alerts']);
  }

  openSMTPSettings() {
    this.router.navigate(['/settings/smtp']);
  }

  openIntegrations() {
    this.router.navigate(['/settings/integration']);
  }

  openUsage() {
    this.router.navigate(['/settings/usage']);
  }

  openOtherSettings() {
    this.router.navigate(['/settings/othersettings']);
  }

  openSecurity() {
    this.router.navigate(['/settings/security']);
  }

  openCostcode() {
    this.router.navigate(['/settings/costcode']);
  }

  openDocumentView() {
    this.router.navigate(['/settings/documentview']);
  }

  editPress() {
    this.router.navigate(['/settings/company-info-form']);
  }
}

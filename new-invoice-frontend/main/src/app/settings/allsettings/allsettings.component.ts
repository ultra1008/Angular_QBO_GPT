import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-allsettings',
  templateUrl: './allsettings.component.html',
  styleUrls: ['./allsettings.component.scss']
})
export class AllsettingsComponent {

  constructor(private router: Router, public translate: TranslateService) {
    //constructor
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

  }
}
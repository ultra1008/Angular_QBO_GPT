import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-allsettings',
  templateUrl: './allsettings.component.html',
  styleUrls: ['./allsettings.component.scss']
})
export class AllsettingsComponent {
  breadscrums = [
    {
      title: 'Profile',
      items: ['Extra'],
      active: 'Profile',
    },
  ];

  constructor(private router: Router) {
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
    this.router.navigate(['/settings/alerts']);
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
}
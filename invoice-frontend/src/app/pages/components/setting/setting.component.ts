import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { icon } from 'src/app/consts';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true }
  }]
})

export class SettingComponent implements OnInit {
  firstFormGroup: any;
  secondFormGroup: any;
  companyinfo = icon.COMPANY_INFO;
  companyinfo_white = icon.COMPANY_INFO_WHITE;
  roleIcon = icon.ROLE;
  roleicon_white = icon.ROLE_WHITE;
  smtp = icon.SMTP;
  smtp_white = icon.SMTP_WHITE;
  website_plugin = icon.WEBSITE_PLUGIN;
  website_plugin_white = icon.WEBSITE_PLUGIN_WHITE;
  other_settings = icon.OTHER_SETTINGS;
  other_settings_white = icon.OTHER_SETTINGS_WHITE;
  userIcon_white = icon.USERLIGHT_ICON;
  userIcon = icon.USER;



  constructor(private router: Router) { }

  ngOnInit(): void { }

  routefun() {
    this.router.navigate(['/settings'])
  }

  temp_ocpsdashboard() {
    this.router.navigate(['/dashboard'])
  }

}

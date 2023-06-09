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
  settingsList: any = [
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOXES'),
      icon: 'fas fa-inbox bg-red sell-icon',
      click: this.openMailboxListing,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE'),
      icon: 'fas fa-user bg-pink sell-icon',
      click: this.openEmployeeSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.ROLE'),
      icon: 'fas fa-sliders-h bg-purple sell-icon',
      click: this.openRolesSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.ALERTS'),
      icon: 'fas fa-bell bg-indigo sell-icon',
      click: this.openAlertsSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.SMTP'),
      icon: 'fas fa-envelope bg-blue sell-icon',
      click: this.openSMTPSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.INTEGRATION'),
      icon: 'fas fa-puzzle-piece bg-cyan sell-icon',
      click: this.openIntegrations,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.USAGE'),
      icon: 'fas fa-database bg-teal sell-icon',
      click: this.openUsage,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS'),
      icon: 'fas fa-cog bg-green sell-icon',
      click: this.openOtherSettings,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.SECURITY'),
      icon: 'fas fa-lock bg-yellow sell-icon',
      click: this.openSecurity,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.COST_CODE'),
      icon: 'fas fa-dollar-sign bg-orange sell-icon',
      click: this.openCostcode,
    },
    /* {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOXES'),
      icon: 'fas fa-inbox bg-red sell-icon',
      click: this.openMailboxListing,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOXES'),
      icon: 'fas fa-inbox bg-red sell-icon',
      click: this.openMailboxListing,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOXES'),
      icon: 'fas fa-inbox bg-red sell-icon',
      click: this.openMailboxListing,
    },
    {
      title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOXES'),
      icon: 'fas fa-inbox bg-red sell-icon',
      click: this.openMailboxListing,
    } */
  ];
  CompanyData: any;
  variablesCompnayTypes_data: any = [];
  variablesCSIDivisions: any = [];
  variablesCompnaySizes_data: any = [];
  getOne_CompanyType_id: any;
  getOne_Nigp_id: any;
  getOne_Company_Size_id: any;
  companyTypeName: any;
  companySizeName: any;
  NigpCode: any;
  constructor (
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
    that.CompanyData = data.data;
    that.getOne_CompanyType_id = that.CompanyData.companytype;
    that.getOne_Nigp_id = that.CompanyData.companydivision;
    that.getOne_Company_Size_id = that.CompanyData.companysize;
    this.getCompanyType();
    this.getCompanyNigp();
    this.getCompanySize();
  }

  async getCompanyType() {
    const data = await this.SettingsServices.getCompanyType();
    if (data.status) {
      this.variablesCompnayTypes_data = data.data;
      if (this.variablesCompnayTypes_data.length > 0) {
        for (let i = 0; i < this.variablesCompnayTypes_data.length; i++) {
          if (this.variablesCompnayTypes_data[i]._id == this.getOne_CompanyType_id) {
            this.companyTypeName = this.variablesCompnayTypes_data[i].name;
          }
        }
      }
    }
  }

  async getCompanyNigp() {
    const data = await this.SettingsServices.getCompanyNigp();
    if (data.status) {
      this.variablesCSIDivisions = data.data;
      if (this.variablesCSIDivisions.length > 0) {
        for (let i = 0; i < this.variablesCSIDivisions.length; i++) {
          if (this.variablesCSIDivisions[i]._id == this.getOne_Nigp_id) {
            this.NigpCode = this.variablesCSIDivisions[i].name;
          }
        }
      }
    }
  }

  async getCompanySize() {
    const data = await this.SettingsServices.getCompanySize();
    if (data.status) {
      this.variablesCompnaySizes_data = data.data;
      if (this.variablesCompnaySizes_data.length > 0) {
        for (let i = 0; i < this.variablesCompnaySizes_data.length; i++) {
          if (this.variablesCompnaySizes_data[i]._id == this.getOne_Company_Size_id) {
            this.companySizeName = this.variablesCompnaySizes_data[i].name;
          }
        }
      }
    }
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

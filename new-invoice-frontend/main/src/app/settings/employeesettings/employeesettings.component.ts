import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-employeesettings',
  templateUrl: './employeesettings.component.html',
  styleUrls: ['./employeesettings.component.scss'],
})
export class EmployeesettingsComponent {
  AllDocument: any;
  AllDepartment: any;
  AllJobTitle: any;
  AllJobType: any;
  AllRelationship: any;
  AllLanguage: any;

  constructor(
    private router: Router,
    public translate: TranslateService,
    public SettingsServices: SettingsService
  ) {}

  ngOnInit() {
    this.getDataDocumentType();
    this.getDataDepartment();
    this.getDataJobTitle();
    this.getDataJobType();
    this.getDataRelationship();
    this.getDataLanguage();
  }

  async getDataDocumentType() {
    const data = await this.SettingsServices.getDocumentType();
    if (data.status) {
      this.AllDocument = data.data;
      console.log('AllDocument', this.AllDocument);
    }
  }

  async getDataDepartment() {
    const data = await this.SettingsServices.getDepartment();
    if (data.status) {
      this.AllDepartment = data.data;
      console.log('AllDepartment', this.AllDepartment);
    }
  }

  async getDataJobTitle() {
    const data = await this.SettingsServices.getJobTitle();
    if (data.status) {
      this.AllJobTitle = data.data;
      console.log('AllJobTitle', this.AllJobTitle);
    }
  }

  async getDataJobType() {
    const data = await this.SettingsServices.getJobType();
    if (data.status) {
      this.AllJobType = data.data;
      console.log('AllJobType', this.AllJobType);
    }
  }

  async getDataRelationship() {
    const data = await this.SettingsServices.getRelationship();
    if (data.status) {
      this.AllRelationship = data.data;
      console.log('AllRelationship', this.AllRelationship);
    }
  }

  async getDataLanguage() {
    const data = await this.SettingsServices.getLanguage();
    if (data.status) {
      this.AllLanguage = data.data;
      console.log('AllLanguage', this.AllLanguage);
    }
  }

  back() {
    this.router.navigate(['/settings']);
  }
}

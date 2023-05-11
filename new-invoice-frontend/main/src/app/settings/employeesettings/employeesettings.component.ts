import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../settings.service';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    public SettingsServices: SettingsService,
    private snackBar: MatSnackBar
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

  async deleteDocumentType(Document: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.DOCUMENT'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteDocumentType(
            Document._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataDocumentType();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteDepartment(Department: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.DEPARTMENT'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteDepartments(
            Department._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataDepartment();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteJobType(JobType: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.JOBTYPE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteJobType(JobType._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataJobType();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteJobTitle(JobTitle: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.JOBTITLE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteJobTitle(JobTitle._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataJobTitle();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteRelationship(Relationship: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.RELATIONSHIP'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteRelationship(
            Relationship._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataRelationship();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteLanguage(Language: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.LANGUAGE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteLanguage(Language._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataLanguage();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  back() {
    this.router.navigate(['/settings']);
  }
}

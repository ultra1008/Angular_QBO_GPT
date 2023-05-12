import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../settings.service';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentTypeFormComponent } from './document-type-form/document-type-form.component';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { LogOut } from 'angular-feather/icons';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { JobTitleFormComponent } from './job-title-form/job-title-form.component';
import { JobTypeFormComponent } from './job-type-form/job-type-form.component';
import { RelationshipFormComponent } from './relationship-form/relationship-form.component';
import { LanguageFormComponent } from './language-form/language-form.component';

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

  currrent_tab: any = 'document';

  tab_Array: any = [
    'document',
    'department',
    'jobtitle',
    'jobtype',
    'relationship',
    'language',
  ];

  constructor(
    private router: Router,
    public translate: TranslateService,
    public SettingsServices: SettingsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getDataDocumentType();
    this.getDataDepartment();
    this.getDataJobTitle();
    this.getDataJobType();
    this.getDataRelationship();
    this.getDataLanguage();
  }

  onTabChanged($event: { index: string | number }) {
    this.currrent_tab = this.tab_Array[$event.index];
    console.log('currrent_tab', this.currrent_tab);
  }

  add() {
    console.log('call', this.currrent_tab == 'document');

    if (this.currrent_tab == 'document') {
      console.log('document');
      const dialogRef = this.dialog.open(DocumentTypeFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDocumentType();
      });
    } else if (this.currrent_tab == 'department') {
      const dialogRef = this.dialog.open(DepartmentFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDepartment();
      });
    } else if (this.currrent_tab == 'jobtitle') {
      const dialogRef = this.dialog.open(JobTitleFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobTitle();
      });
    } else if (this.currrent_tab == 'jobtype') {
      const dialogRef = this.dialog.open(JobTypeFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobType();
      });
    } else if (this.currrent_tab == 'relationship') {
      const dialogRef = this.dialog.open(RelationshipFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataRelationship();
      });
    } else if (this.currrent_tab == 'language') {
      const dialogRef = this.dialog.open(LanguageFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataLanguage();
      });
    }
  }

  edit(Document: any) {
    if (this.currrent_tab == 'document') {
      console.log('document');
      const dialogRef = this.dialog.open(DocumentTypeFormComponent, {
        width: '350px',
        data: Document,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDocumentType();
      });
    }
  }

  editDepartment(Department: any) {
    if (this.currrent_tab == 'department') {
      const dialogRef = this.dialog.open(DepartmentFormComponent, {
        width: '350px',
        data: Department,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDepartment();
      });
    }
  }

  editJobtitle(JobTitle: any) {
    if (this.currrent_tab == 'jobtitle') {
      const dialogRef = this.dialog.open(JobTitleFormComponent, {
        width: '350px',
        data: JobTitle,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobTitle();
      });
    }
  }

  editJobtype(JobType: any) {
    if (this.currrent_tab == 'jobtype') {
      const dialogRef = this.dialog.open(JobTypeFormComponent, {
        width: '350px',
        data: JobType,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobType();
      });
    }
  }

  editRelationship(Relationship: any) {
    if (this.currrent_tab == 'relationship') {
      const dialogRef = this.dialog.open(RelationshipFormComponent, {
        width: '350px',
        data: Relationship,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataRelationship();
      });
    }
  }

  editLanguage(Language: any) {
    if (this.currrent_tab == 'language') {
      const dialogRef = this.dialog.open(LanguageFormComponent, {
        width: '350px',
        data: Language,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataLanguage();
      });
    }
  }
  async getDataDocumentType() {
    const data = await this.SettingsServices.getDocumentType();
    if (data.status) {
      this.AllDocument = data.data;
    }
  }

  async getDataDepartment() {
    const data = await this.SettingsServices.getDepartment();
    if (data.status) {
      this.AllDepartment = data.data;
    }
  }

  async getDataJobTitle() {
    const data = await this.SettingsServices.getJobTitle();
    if (data.status) {
      this.AllJobTitle = data.data;
    }
  }

  async getDataJobType() {
    const data = await this.SettingsServices.getJobType();
    if (data.status) {
      this.AllJobType = data.data;
    }
  }

  async getDataRelationship() {
    const data = await this.SettingsServices.getRelationship();
    if (data.status) {
      this.AllRelationship = data.data;
    }
  }

  async getDataLanguage() {
    const data = await this.SettingsServices.getLanguage();
    if (data.status) {
      this.AllLanguage = data.data;
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

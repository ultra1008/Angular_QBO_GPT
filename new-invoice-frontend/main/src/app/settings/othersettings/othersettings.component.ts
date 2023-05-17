import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../settings.service';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { TermsFormComponent } from './terms-form/terms-form.component';
import { TaxRateFormComponent } from './tax-rate-form/tax-rate-form.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { VendorFormComponent } from 'src/app/vendors/vendor-form/vendor-form.component';
import { VendorTypeFormComponent } from './vendor-type-form/vendor-type-form.component';
import { JobNameFormComponent } from './job-name-form/job-name-form.component';
import { saveAs } from 'file-saver';
import * as fs from 'file-saver';
import * as XLSX from 'xlsx';
import { ImportOtherSettingsComponent } from './import-other-settings/import-other-settings.component';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';

@Component({
  selector: 'app-othersettings',
  templateUrl: './othersettings.component.html',
  styleUrls: ['./othersettings.component.scss'],
})
export class OthersettingsComponent {
  AllTerms: any;
  AllTaxrate: any;
  AllDocument: any;
  AllVendorType: any;
  AllJobName: any;
  currrent_tab: any = 'Terms';
  tab_Array: any = [
    'Terms',
    'Tax rate',
    'Documents',
    'Vendor type',
    'Job name',
  ];
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    public SettingsServices: SettingsService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    public dialog: MatDialog,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService
  ) {}

  ngOnInit() {
    this.getDataTerms();
    this.getDataTaxRate();
    this.getDataDocuments();
    this.getDataVendorType();
    this.getDataJobName();
  }

  onTabChanged($event: { index: string | number }) {
    this.currrent_tab = this.tab_Array[$event.index];
  }

  async getDataTerms() {
    const data = await this.SettingsServices.getTerms();
    if (data.status) {
      this.AllTerms = data.data;
    }
  }

  async getDataTaxRate() {
    const data = await this.SettingsServices.getTaxRate();
    if (data.status) {
      this.AllTaxrate = data.data;
    }
  }

  async getDataDocuments() {
    const data = await this.SettingsServices.getDocuments();
    if (data.status) {
      this.AllDocument = data.data;
    }
  }

  async getDataVendorType() {
    const data = await this.SettingsServices.getVendorType();
    if (data.status) {
      this.AllVendorType = data.data;
    }
  }

  async getDataJobName() {
    const data = await this.SettingsServices.getJobName();
    if (data.status) {
      this.AllJobName = data.data;
      console.log('AllJobName', this.AllJobName);
    }
  }

  add() {
    if (this.currrent_tab == 'Terms') {
      const dialogRef = this.dialog.open(TermsFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataTerms();
      });
    } else if (this.currrent_tab == 'Tax rate') {
      const dialogRef = this.dialog.open(TaxRateFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataTaxRate();
      });
    } else if (this.currrent_tab == 'Documents') {
      const dialogRef = this.dialog.open(DocumentFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDocuments();
      });
    } else if (this.currrent_tab == 'Vendor type') {
      const dialogRef = this.dialog.open(VendorTypeFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataVendorType();
      });
    } else if (this.currrent_tab == 'Job name') {
      const dialogRef = this.dialog.open(JobNameFormComponent, {
        width: '350px',
        data: {},
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobName();
      });
    }
  }

  editTerms(Terms: any) {
    if (this.currrent_tab == 'Terms') {
      const dialogRef = this.dialog.open(TermsFormComponent, {
        width: '350px',
        data: Terms,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataTerms();
      });
    }
  }

  editTaxRate(Taxrate: any) {
    if (this.currrent_tab == 'Tax rate') {
      const dialogRef = this.dialog.open(TaxRateFormComponent, {
        width: '350px',
        data: Taxrate,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataTaxRate();
      });
    }
  }

  editDocument(Document: any) {
    if (this.currrent_tab == 'Documents') {
      const dialogRef = this.dialog.open(DocumentFormComponent, {
        width: '350px',
        data: Document,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDocuments();
      });
    }
  }

  editVendorType(VendorType: any) {
    if (this.currrent_tab == 'Vendor type') {
      const dialogRef = this.dialog.open(VendorTypeFormComponent, {
        width: '350px',
        data: VendorType,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataVendorType();
      });
    }
  }

  editJobName(JobName: any) {
    if (this.currrent_tab == 'Job name') {
      const dialogRef = this.dialog.open(JobNameFormComponent, {
        width: '350px',
        data: JobName,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobName();
      });
    }
  }

  async deleteTerms(Terms: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.CONFIRMATION_DIALOG.TERMS'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteTerms(Terms._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataTerms();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteTaxRate(Taxrate: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.CONFIRMATION_DIALOG.TAX_RATE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteTaxrate(Taxrate._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataTaxRate();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteDocument(Document: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.CONFIRMATION_DIALOG.DOCUMENT'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteDocuments(
            Document._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataDocuments();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteVendorType(VendorType: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.CONFIRMATION_DIALOG.VENDOR_TYPE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteVendorType(
            VendorType._id
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataVendorType();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  async deleteJobName(JobName: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.CONFIRMATION_DIALOG.JOB_NAME'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.SettingsServices.DeleteJobName(JobName._id);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            that.getDataJobName();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev: any) {
    let that = this;
    let workBook: any;
    let jsonData = null;
    let header_;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header_ = data.shift();

        return initial;
      }, {});
      // const dataString = JSON.stringify(jsonData);
      // const keys_OLD = ["item_type_name", "packaging_name", "terms_name"];
      // if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
      //   that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
      //   return;
      // } else {
      const formData_profle = new FormData();
      formData_profle.append('file', file);
      let apiurl = '';

      if (that.currrent_tab == 'Terms') {
        apiurl = httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_TERMS;
      } else if (that.currrent_tab == 'Tax rate') {
        apiurl =
          httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_TEXT_RATE;
      } else if (that.currrent_tab == 'Documents') {
        apiurl =
          httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_DOCUMENT;
      } else if (that.currrent_tab == 'Vendor type') {
        apiurl =
          httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_VENDOR_TYPE;
      } else if (that.currrent_tab == 'Job name') {
        apiurl = httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT;
      }

      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(apiurl, formData_profle)
        .subscribe(function (params) {
          if (params.status) {
            if (that.currrent_tab == 'Terms') {
              that.getDataTerms();
            } else if (that.currrent_tab == 'Tax rate') {
              that.getDataTaxRate();
            } else if (that.currrent_tab == 'Documents') {
              that.getDataDocuments();
            } else if (that.currrent_tab == 'Vendor type') {
              that.getDataVendorType();
            } else if (that.currrent_tab == 'Job name') {
              that.getDataJobName();
            }
            // that.openErrorDataDialog(params);

            showNotification(that.snackBar, params.message, 'success');
            that.uiSpinner.spin$.next(false);
          } else {
            showNotification(that.snackBar, params.message, 'error');
            that.uiSpinner.spin$.next(false);
          }
        });
      // }
    };
    reader.readAsBinaryString(file);
  }

  downloadImport() {
    if (this.currrent_tab == 'Terms') {
      const dialogRef = this.dialog.open(ImportOtherSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataTerms();
      });
    } else if (this.currrent_tab == 'Tax rate') {
      const dialogRef = this.dialog.open(ImportOtherSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataTaxRate();
      });
    } else if (this.currrent_tab == 'Documents') {
      const dialogRef = this.dialog.open(ImportOtherSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataDocuments();
      });
    } else if (this.currrent_tab == 'Vendor type') {
      const dialogRef = this.dialog.open(ImportOtherSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataVendorType();
      });
    } else if (this.currrent_tab == 'Job name') {
      const dialogRef = this.dialog.open(ImportOtherSettingsComponent, {
        width: '500px',
        data: this.currrent_tab,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getDataJobName();
      });
    }
  }

  back() {
    this.router.navigate(['/settings']);
  }
}

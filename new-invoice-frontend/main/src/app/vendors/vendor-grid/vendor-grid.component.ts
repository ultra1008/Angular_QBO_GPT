import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WEB_ROUTES } from 'src/consts/routes';
import { TermModel, Vendor } from '../vendor.model';
import { HttpClient } from '@angular/common/http';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { VendorsService } from '../vendors.service';
import { formateAmount, showNotification, timeDateToepoch } from 'src/consts/utils';
import { VendorReportComponent } from '../vendor-report/vendor-report.component';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { FormateDateStringPipe } from 'src/app/users/users-filter.pipe';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import * as XLSX from 'xlsx';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { ImportVendorComponent } from '../import-vendor/import-vendor.component';
import { VendorExistListComponent } from '../vendor-exist-list/vendor-exist-list.component';

@Component({
  selector: 'app-vendor-grid',
  templateUrl: './vendor-grid.component.html',
  styleUrls: ['./vendor-grid.component.scss'],
  providers: [FormateDateStringPipe],
})
export class VendorGridComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  vendorList: any = [];
  vendorActiveList: any = [];
  vendorInactiveList: any = [];
  cardLoading = true;
  isDelete = 0;
  active_word = 'Active';
  inactive_word = 'Inactive';
  vendorname_search: any;
  vendor_status: any;
  termsList: Array<TermModel> = [];
  role_permission: any;
  exitData!: any[];
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;

  constructor(
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public vendorTableService: VendorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    public commonService: CommonService,
    public uiSpinner: UiSpinnerService
  ) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
  }
  ngOnInit() {
    this.getVendor();
  }

  gotolist() {
    localStorage.setItem(localstorageconstants.VENDOR_DISPLAY, 'list');
    this.router.navigate([WEB_ROUTES.VENDOR]);
  }

  async getVendor() {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET,
      { is_delete: this.isDelete }
    );
    this.vendorList = data.data;
    this.vendorActiveList = this.vendorList.filter((obj: any) => {
      return obj.vendor_status == 1;
    });
    this.vendorInactiveList = this.vendorList.filter((obj: any) => {
      return obj.vendor_status == 2;
    });
    this.cardLoading = false;
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.cardLoading = true;
    this.vendorList = [];
    this.getVendor();
  }

  refresh() {
    this.getVendor();
  }

  convertDate(date: any) {
    return timeDateToepoch(date);
  }

  addNew() {
    this.router.navigate([WEB_ROUTES.VENDOR_FORM]);
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET
    );
    if (data.status) {
      this.termsList = data.data;
    }
  }

  vendorReport() {
    const dialogRef = this.dialog.open(VendorReportComponent, {
      width: '700px',
      data: {
        termsList: this.termsList,
        invoiceStatus: '',
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }

  editVendor(vendor: Vendor) {

    this.router.navigate([WEB_ROUTES.VENDOR_FORM], {
      queryParams: { _id: vendor._id },
    });

  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.VENDOR_HISTORY]);
  }

  formateAmount(price: any) {
    return formateAmount(price);
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


      apiurl = httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_CHECK_IMPORT_TERMS;


      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(apiurl, formData_profle)
        .subscribe(function (params) {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            that.exitData = params;
            const dialogRef = that.dialog.open(VendorExistListComponent, {
              width: '750px',
              height: '500px',
              // data: that.exitData,
              data: { data: that.exitData },
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe((result: any) => {
              that.refresh();
            });
            // that.openErrorDataDialog(params);

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
    let that = this;
    const dialogRef = that.dialog.open(ImportVendorComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      that.refresh();
    });

  }
}

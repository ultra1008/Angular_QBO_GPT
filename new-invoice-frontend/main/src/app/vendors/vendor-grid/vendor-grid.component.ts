import { Component, OnInit } from '@angular/core';
import { WEB_ROUTES } from 'src/consts/routes';
import { TermModel, Vendor } from '../vendor-table.model';
import { HttpClient } from '@angular/common/http';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { VendorsService } from '../vendors.service';
import { timeDateToepoch } from 'src/consts/utils';
import { VendorReportComponent } from '../vendor-report/vendor-report.component';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { FormateDateStringPipe } from 'src/app/users/users-filter.pipe';

@Component({
  selector: 'app-vendor-grid',
  templateUrl: './vendor-grid.component.html',
  styleUrls: ['./vendor-grid.component.scss'],
  providers: [FormateDateStringPipe],
})
export class VendorGridComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  vendorList: any = [];
  cardLoading = true;
  isDelete = 0;
  active_word: string = "Active";
  inactive_word: string = "Inactive";
  vendorname_search: any;
  vendor_status: any;
  termsList: Array<TermModel> = [];

  constructor(
    public httpClient: HttpClient, private httpCall: HttpCall,
    public dialog: MatDialog,
    public vendorTableService: VendorsService,
    private snackBar: MatSnackBar, private router: Router, public translate: TranslateService,
    private fb: UntypedFormBuilder,
  ) {
    super();
  }
  ngOnInit() {
    this.getVendor();
  }
  changeStatus(event: any) {

  }
  gotolist() {
    this.router.navigate([WEB_ROUTES.VENDOR_GRID]);
  }
  async getVendor() {
    const data = await this.vendorTableService.getVendor(this.isDelete);
    this.vendorList = data.data;
    this.cardLoading = false;
    console.log("vendorList", this.vendorList);
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
    const data = await this.vendorTableService?.getTerms();
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
    this.router.navigate([WEB_ROUTES.VENDOR_FORM], { queryParams: { _id: vendor._id } });
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.VENDOR_HISTORY]);
  }


}


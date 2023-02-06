import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { LanguageApp } from 'src/app/service/utils';

@Component({
  selector: 'app-invoice-card',
  templateUrl: './invoice-card.component.html',
  styleUrls: ['./invoice-card.component.scss']
})
export class InvoiceCardComponent implements OnInit {
  @Input() invoiceStatus: any;
  @Output() invoiceCountData: EventEmitter<void> = new EventEmitter<void>();
  subscription!: Subscription;
  mode: any;
  allInvoices = [];
  viewIcon: string = '';
  showInvoiceTable = true;
  dtOptions: DataTables.Settings = {};
  isManagement: boolean = true;
  invoiceCount: any = {
    pending: 0,
    complete: 0
  };
  editIcon!: string;
  gridIcon: string;
  listIcon: string;
  role_to: any;
  role_permission: any;
  approveIcon: string;
  denyIcon: string;
  status: any;
  constructor(public route: ActivatedRoute, private router: Router, private modeService: ModeDetectService, public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
    this.status = this.route.snapshot.queryParamMap.get('status');
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {

      this.editIcon = icon.EDIT;
      this.approveIcon = icon.APPROVE;
      this.denyIcon = icon.DENY;
      this.viewIcon = icon.VIEW;

    } else {

      this.editIcon = icon.EDIT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
      this.viewIcon = icon.VIEW_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';

        this.editIcon = icon.EDIT;
        this.approveIcon = icon.APPROVE;
        this.denyIcon = icon.DENY;
        this.viewIcon = icon.VIEW;

      } else {
        this.mode = 'on';

        this.editIcon = icon.EDIT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
        this.viewIcon = icon.VIEW_WHITE;

      }
      this.rerenderfunc();
    });
  }

  ngOnInit(): void {
    let that = this;
    console.log("invoiceStatus", this.invoiceStatus);
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    this.role_to = role_permission.UserData.role_name;

    this.getAllInvoices();
  }
  getAllInvoices() {
    let that = this;
    let requestData = {};
    if (this.invoiceStatus != undefined && this.invoiceStatus != null && this.invoiceStatus != '') {
      requestData = {
        status: this.invoiceStatus,
      };
    }
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_STATUS_VISE_LIST, requestData).subscribe(function (params) {
      if (params.status) {
        that.allInvoices = params.data;
        that.invoiceCount = params.count;
        that.isManagement = params.is_management;
        that.sendCount(params.count);
      }
      that.uiSpinner.spin$.next(false);
    });
  }
  public sendCount(count): void {
    this.invoiceCountData.emit(count);
  }
  invoiceApprove() {
    // let po_id = this.route.snapshot.queryParamMap.get("po_id");
    // let po_status = "Pending";
    // let that = this;
    // swalWithBootstrapButtons
    //   .fire({
    //     title: this.Custom_Pdf_Viewer_Please_Confirm,
    //     text: this.Custom_Pdf_Viewer_Want_Approve_Po,
    //     showDenyButton: true,
    //     showCancelButton: false,
    //     confirmButtonText: this.Compnay_Equipment_Delete_Yes,
    //     denyButtonText: this.Compnay_Equipment_Delete_No,
    //   })
    //   .then((result) => {
    //     if (result.isConfirmed) {
    //       // denied PO api call
    //       that.httpCall
    //         .httpPostCall(httproutes.PORTAL_COMPANY_UPDATE_PO_STATUS, {
    //           _id: po_id,
    //           po_status: po_status,
    //         })
    //         .subscribe(function (params) {
    //           if (params.status) {
    //             that.snackbarservice.openSnackBar(params.message, "success");
    //             that.location.back();
    //           } else {
    //             that.snackbarservice.openSnackBar(params.message, "error");
    //           }
    //         });
    //     }
    //   });
  }

  invoiceDenied() {
    // let po_id = this.route.snapshot.queryParamMap.get("po_id");
    // let po_status = "Denied";
    // let that = this;
    // swalWithBootstrapButtons
    //   .fire({
    //     title: this.Custom_Pdf_Viewer_Please_Confirm,
    //     text: this.Custom_Pdf_Viewer_Want_Deny_Po,
    //     showDenyButton: true,
    //     showCancelButton: false,
    //     confirmButtonText: this.Compnay_Equipment_Delete_Yes,
    //     denyButtonText: this.Compnay_Equipment_Delete_No,
    //   })
    //   .then((result) => {
    //     if (result.isConfirmed) {
    //       /*--- denied PO api call ---*/
    //       that.httpCall
    //         .httpPostCall(httproutes.PORTAL_COMPANY_UPDATE_PO_STATUS, {
    //           _id: po_id,
    //           po_status: po_status,
    //         })
    //         .subscribe(function (params) {
    //           if (params.status) {
    //             that.snackbarservice.openSnackBar(params.message, "success");
    //             that.location.back();
    //           } else {
    //             that.snackbarservice.openSnackBar(params.message, "error");
    //           }
    //         });
    //     }
    //   });
  }


  viewInvoice(invoice) {
    this.router.navigate(['/invoice-detail'], { queryParams: { _id: invoice._id } });
  }

  editInvoice(invoice) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id } });
  }

  rerenderfunc() {
    this.showInvoiceTable = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.showInvoiceTable = true;
    }, 100);
  }
}

import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { MMDDYYYY } from 'src/app/service/utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2'
  },
  buttonsStyling: false
});
@Component({
  selector: 'app-invoice-detail-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  displayMode: string = 'default';
  placeholderIcon: icon.PHOTO_PLACEHOLDER;
  show_tabs: boolean = true;
  hideToggle = false;
  disabled = false;
  pdf_url = '';
  multi = false;
  hide: Boolean = true;
  backIcon: string;
  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  id: any;
  invoiceData: any;
  loadInvoice: boolean = false;
  has_packing_slip: any = [];
  notsList: any = [];
  invoiceNoteform: FormGroup;
  poDocumentType = 'PO';
  packingSlipDocumentType = 'Packing Slip';
  receivingSlipDocumentType = 'Receiving Slip';
  quoteoDocumentType = 'Quote';
  invoice_id: any;

  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };

  dashboardHistory = [];
  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;
  show_Nots: boolean = false;

  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;
  activityIcon!: string;
  isSearch: boolean = false;

  modelDeleteTitle: string = "";
  modelDeleteYes: string = "";
  modelDeleteNo: string = "";
  yesButton: string;
  noButton: string;
  Remove_Notes: string;


  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, private location: Location, private modeService: ModeDetectService, private router: Router, public route: ActivatedRoute, public uiSpinner: UiSpinnerService, public httpCall: HttpCall,
    public snackbarservice: Snackbarservice, public translate: TranslateService,) {
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.invoice_id = this.id;


    if (this.mode == "off") {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.backIcon = icon.BACK;
    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.backIcon = icon.BACK_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.backIcon = icon.BACK;
      } else {
        this.mode = "on";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.backIcon = icon.BACK_WHITE;
      }
    });
    if (this.id) {
      this.uiSpinner.spin$.next(true);
      this.getOneInvoice();
    }
  }

  ngOnInit(): void {
    this.getTodaysActivity();
    this.invoiceNoteform = this.formBuilder.group({
      notes: [""],

    });
  }
  addNotes() {
    this.show_Nots = true;
  }
  saveNotes() {
    console.log("call");
    let that = this;
    this.invoiceNoteform.markAllAsTouched();
    if (that.invoiceNoteform.valid) {
      let req_temp = that.invoiceNoteform.value;
      req_temp.invoice_id = this.invoice_id;
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_SAVE_INVOICE_NOTES, req_temp).subscribe(function (params_new) {
        if (params_new.status) {

          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
          that.show_Nots = false;
          that.getOneInvoice();

        } else {
          that.snackbarservice.openSnackBar(params_new.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }


  }
  deleteNote(_id, invoice_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Remove_Notes,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.yesButton,
        denyButtonText: this.noButton,

      })
      .then((result) => {
        if (result.isConfirmed) {
          this.uiSpinner.spin$.next(true);
          that.httpCall
            .httpPostCall(httproutes.PORTAL_DELETE_INVOICE_NOTES, {
              _id: _id,
              invoice_id: invoice_id
            })
            .subscribe(function (params) {
              that.uiSpinner.spin$.next(false);
              if (params.status) {

                that.snackbarservice.openSnackBar(params.message, "success");
                that.dialog.closeAll();
                that.getOneInvoice();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }


  getOneInvoice() {
    let that = this;
    that.httpCall
      .httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id })
      .subscribe(function (params) {
        if (params.status) {
          that.invoiceData = params.data;
          that.has_packing_slip = that.invoiceData.has_packing_slip;
          that.notsList = that.invoiceData.invoice_notes;

          that.loadInvoice = true;
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }

        console.log("notsList", that.notsList);
      });
  }

  goToInvoiceEdit(invoiceData) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoiceData._id } });

  }
  back() {
    this.location.back();
  }
  print() {
    fetch(this.invoiceData.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
      /*--- set the blog type to final pdf ---*/
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      //iframe.contentWindow.print();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.focus();
          iframe.contentWindow!.print();
        });
      };
    });
  }

  download() {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = "_blank";
    a.href = this.invoiceData.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }
  onKey(event: any) {
    console.log(event.target.value);
    if (event.target.value.length == 0) {
      console.log("emprty string");
      this.dashboardHistory = [];
      this.start = 0;
      this.getTodaysActivity();
    }
  }
  searchActivity() {
    console.log("searchTodayActivity");
    console.log("Entered email:", this.todayactivity_search);
    let that = this;
    that.isSearch = true;
    that.dashboardHistory = [];
    that.start = 0;
    this.getTodaysActivity();
  }

  onScroll() {
    this.start++;
    this.getTodaysActivity();
  }
  // getTodaysActivity() {
  //   console.log("callllll");
  //   let self = this;

  //   // let requestObject = { start: this.start };

  //   self.httpCall
  //     .httpPostCall(httproutes.INVOICE_GET_DASHBOARD_HISTORY,
  //       { start: 0 })
  //     .subscribe(function (params) {
  //       console.log("dashboardHistory", params);
  //       if (params.status) {
  //         if (self.start == 0)

  //           self.dashboardHistory = self.dashboardHistory.concat(params.data);
  //         console.log("dashboardHistory", self.dashboardHistory);
  //       }

  //     });

  // }
  temp_MMDDYYY(epoch) {
    return MMDDYYYY(epoch);
  }
  getTodaysActivity() {
    let self = this;
    this.is_httpCall = true;
    let requestObject = {};
    requestObject = {
      start: this.start,
      _id: this.id

    };
    this.httpCall
      .httpPostCall(httproutes.INVOICE_GET_INVOICE_HISTORY, requestObject)
      .subscribe(function (params) {
        if (params.status) {
          if (self.start == 0)
            self.is_httpCall = false;
          self.dashboardHistory = self.dashboardHistory.concat(params.data);
        }
        console.log("dashboardHistory", self.dashboardHistory);
      });
  }


}






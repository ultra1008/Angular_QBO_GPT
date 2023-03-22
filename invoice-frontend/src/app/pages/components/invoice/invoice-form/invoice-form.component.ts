import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Location } from '@angular/common';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Observable, Subscription } from 'rxjs';
import { commonFileChangeEvent, MMDDYYYY_formet } from 'src/app/service/utils';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../team/employee.service';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  @Input() invoice: any;
  filepath: any;
  item_image_url: String = "./assets/images/currentplaceholder.png";
  startDate: any;
  endDate: any;
  showHeader = false;
  one_template: any;
  mode: any;
  backIcon: string = "";
  downloadIcon: string = "";
  saveIcon = icon.SAVE_WHITE;
  subscription!: Subscription;
  exitIcon: string = "";
  printIcon: string = "";
  viewIcon: string = icon.VIEW_WHITE;
  close_this_window: string = "";
  All_popup_Cancel = "";
  All_Save_Exit = "";
  Dont_Save = "";
  invoiceform: FormGroup;
  Email_Template_Form_Submitting = "";
  id: any;
  isManagement: boolean = true;
  pdf_url = "";
  invoiceData: any;
  approveIcon: string;
  denyIcon: string;
  vendorList: any = [];
  filteredVendors: Observable<any[]>;
  isEmployeeData: Boolean = false;
  // db_costcodes
  variablesdb_costcodes: any = [];
  db_costcodes: any = this.variablesdb_costcodes.slice();
  // usersArray
  variablesusersArray: any = [];
  usersArray: any = this.variablesusersArray.slice();


  // DOCUMENT TYPE
  variablesDocumenttype: any = configdata.DOCUMENT_TYPE;
  DocumentType = this.variablesDocumenttype.slice();


  statusList = configdata.INVOICES_STATUS;
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  yesButton: string = "";
  noButton: string = "";
  Approve_Invoice_massage: string = "";
  Reject_Invoice_massage: string = "";

  // options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  vendor = new FormControl('');
  badge: any = [];
  status: any;
  historyIcon: string;
  loadInvoice: boolean = false;
  document_id: any;
  invoiceStatus: any;


  constructor (public dialog: MatDialog, public employeeservice: EmployeeService, private location: Location, private modeService: ModeDetectService, public snackbarservice: Snackbarservice, private formBuilder: FormBuilder,
    public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public route: ActivatedRoute, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.document_id = this.route.snapshot.queryParamMap.get('document_id');
    this.invoiceStatus = this.route.snapshot.queryParamMap.get('status');
    if (this.id) {
      this.getOneInvoice();
    }
    if (this.document_id) {
      this.getOneProcessDocument();
    }
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      this.close_this_window = this.translate.instant("close_this_window");
      this.All_popup_Cancel = this.translate.instant('All_popup_Cancel');
      this.All_Save_Exit = this.translate.instant('All_Save_Exit');
      this.Dont_Save = this.translate.instant('Dont_Save');
      this.Email_Template_Form_Submitting = this.translate.instant('Email_Template_Form_Submitting');
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Approve_Invoice_massage = this.translate.instant("Approve_Invoice_massage");
      this.Reject_Invoice_massage = this.translate.instant("Reject_Invoice_massage");


    });
    this.invoiceform = this.formBuilder.group({
      document_type: [""],
      invoice_name: [""],
      vendor: [""],
      customer_id: [""],
      vendor_id: [""],
      invoice: [""],
      p_o: [""],
      job_number: [""],
      invoice_date: [""],
      due_date: [""],
      order_date: [""],
      ship_date: [""],
      packing_slip: [""],
      receiving_slip: [""],
      status: [""],
      terms: [""],
      total: [""],
      tax_amount: [""],
      tax_id: [""],
      sub_total: [""],
      amount_due: [""],
      cost_code: [""],
      gl_account: [""],
      assign_to: [""],
      notes: [""],
      myControl: [""]
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
      this.historyIcon = icon.HISTORY;

    } else {

      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
      this.historyIcon = icon.HISTORY_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
        this.historyIcon = icon.HISTORY;


      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
        this.historyIcon = icon.HISTORY_WHITE;


      }
    });

  }
  back() {
    if (this.id) {
      if (this.invoiceStatus) {
        this.router.navigate(['/dashboard-invoice-list'], { queryParams: { status: this.invoiceStatus } });
      } else {
        this.router.navigate(['/invoice']);
      }
    } else {
      this.location.back();
    }
  }

  ngOnInit(): void {

    let that = this;
    this.filteredVendors = this.vendor.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVendor(value || '')),
    );

    this.employeeservice.getalluser().subscribe(function (data) {
      // that.uiSpinner.spin$.next(false);
      if (data.status) {
        that.isEmployeeData = true;
        // that.usersArray = data.data;
        that.variablesusersArray = data.data;
        that.usersArray = that.variablesusersArray.slice();
        that.isManagement = data.is_management;
      }

    });
    that.getAllCostCode();
    this.getAllVendorList();
  }


  private _filterVendor(value: any): any[] {
    return this.vendorList.filter(one_vendor => {
      let vendor_name = value.vendor_name ? value.vendor_name : value;
      return one_vendor.vendor_name.toLowerCase().indexOf(vendor_name.toLowerCase()) > -1;
    });

  }
  getIdFromVendor(event, Option) {
    this.invoiceform.get('vendor').setValue(Option._id);
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
  getAllCostCode() {
    let that = this;
    that.httpCall.httpPostCall(httproutes.PROJECT_SETTING_COST_CODE, { module: 'Invoice' }
    ).subscribe(function (params) {

      if (params.status) {
        // that.db_costcodes = params.data;
        that.variablesdb_costcodes = params.data;
        that.db_costcodes = that.variablesdb_costcodes.slice();

      }
    });
  }
  openHistoryDialog() {
    const dialogRef = this.dialog.open(InvoiceHistoryComponent, {
      height: "550px",
      width: "1000px",
      data: {
        // project_id: this.projectId,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  updateInvoice(id, status) {
    let that = this;
    let title = '';
    if (status == 'Approved') {
      title = that.Approve_Invoice_massage;
    } else {
      title = that.Reject_Invoice_massage;
    }
    let requestObject = {
      _id: id,
      status: status,
    };
    swalWithBootstrapButtons
      .fire({
        title: title,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.yesButton,
        denyButtonText: that.noButton,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.uiSpinner.spin$.next(true);
          that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
            if (params.status) {
              that.snackbarservice.openSnackBar(params.message, "success");
              that.status = status;
              that.uiSpinner.spin$.next(false);
              // that.rerenderfunc();
              // that.invoiceUpdateCard.emit();
            } else {
              that.snackbarservice.openSnackBar(params.message, "error");
              that.uiSpinner.spin$.next(false);
            }
          });
        }
      });
    /* if (requestObject.status == 'Approved') {
  
      swalWithBootstrapButtons
        .fire({
  
          title: that.Approve_Invoice_massage,
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: that.yesButton,
          denyButtonText: that.noButton,
        })
        .then((result) => {
          if (result.isConfirmed) {
            that.uiSpinner.spin$.next(true);
            that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
              if (params.status) {
                that.snackbarservice.openSnackBar(params.message, "success");
                that.uiSpinner.spin$.next(false);
                // that.rerenderfunc();
                // that.invoiceUpdateCard.emit();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
                that.uiSpinner.spin$.next(false);
              }
            });
          }
        });
  
    } else {
      swalWithBootstrapButtons
        .fire({
  
          title: that.Reject_Invoice_massage,
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: that.yesButton,
          denyButtonText: that.noButton,
        }).then((result) => {
          if (result.isConfirmed) {
            that.uiSpinner.spin$.next(true);
            that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
              if (params.status) {
                that.snackbarservice.openSnackBar(params.message, "success");
                that.uiSpinner.spin$.next(false);
                // that.rerenderfunc();
                // that.invoiceUpdateCard.emit();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
                that.uiSpinner.spin$.next(false);
              }
            });
          }
        });
  
  
    } */

    // that.uiSpinner.spin$.next(true);
    // that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
    //   if (params.status) {
    //     that.snackbarservice.openSnackBar(params.message, "success");
    //     that.uiSpinner.spin$.next(false);
    //     // that.rerenderfunc();
    //     // that.invoiceUpdateCard.emit();
    //   } else {
    //     that.snackbarservice.openSnackBar(params.message, "error");
    //     that.uiSpinner.spin$.next(false);
    //   }
    // });
  }
  viewInvoice(_id) {
    this.router.navigate(['/invoice-detail'], { queryParams: { _id: _id } });
  }
  async getAllVendorList() {
    let data = await this.httpCall.httpGetCall(httproutes.PORTAL_COMPANY_VENDOR_GET_BY_ID).toPromise();
    if (data.status) {
      this.vendorList = data.data;



    }
  }

  displayOption(option: any): string {
    return option ? option.vendor_name : option;
  }

  getOneInvoice() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id }).subscribe(function (params) {
      if (params.status) {
        that.status = params.data.status;
        that.invoiceData = params.data;
        that.pdf_url = that.invoiceData.pdf_url;
        that.badge = that.invoiceData.badge;
        that.vendor.setValue(params.data.vendor);
        that.invoiceform = that.formBuilder.group({
          document_type: [params.data.document_type],
          invoice_name: [params.data.invoice_name],
          vendor: [params.data.vendor._id],
          vendor_id: [params.data.vendor_id],
          customer_id: [params.data.customer_id],
          invoice: [params.data.invoice],
          p_o: [params.data.p_o],
          job_number: [params.data.job_number],
          invoice_date: [params.data.invoice_date],
          due_date: [params.data.due_date],
          order_date: [params.data.order_date],
          ship_date: [params.data.ship_date],
          packing_slip: [params.data.packing_slip],
          receiving_slip: [params.data.receiving_slip],
          status: [params.data.status],
          terms: [params.data.terms],
          total: [params.data.total],
          tax_amount: [params.data.tax_amount],
          tax_id: [params.data.tax_id],
          sub_total: [params.data.sub_total],
          amount_due: [params.data.amount_due],
          cost_code: [params.data.cost_code],
          gl_account: [params.data.gl_account],
          assign_to: [params.data.assign_to],
          notes: [params.data.notes],
          pdf_url: [params.data.pdf_url],
        });
      }
      that.uiSpinner.spin$.next(false);
    });
  }

  getOneProcessDocument() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_DOCUMENT_PROCESS_GET, { _id: that.document_id }).subscribe(function (params) {
      if (params.status) {
        that.status = params.data.status;
        if (params.data.data) {
          that.invoiceData = params.data.data;
          that.pdf_url = that.invoiceData.pdf_url;
          that.badge = that.invoiceData.badge;
        } else {
          that.invoiceData = params.data;
          that.pdf_url = that.invoiceData.pdf_url;
          // that.badge = that.invoiceData.badge;
        }
        let vendorId = '';
        if (that.invoiceData.vendor) {
          vendorId = that.invoiceData.vendor._id;
        }
        that.loadInvoice = true;
        that.invoiceform = that.formBuilder.group({
          document_type: [params.data.document_type],
          invoice_name: [that.invoiceData.invoice_name],
          vendor: [vendorId],
          vendor_id: [that.invoiceData.vendor_id],
          customer_id: [that.invoiceData.customer_id],
          invoice: [that.invoiceData.invoice],
          p_o: [that.invoiceData.p_o],
          job_number: [that.invoiceData.job_number],
          invoice_date: [that.invoiceData.invoice_date],
          due_date: [that.invoiceData.due_date],
          order_date: [that.invoiceData.order_date],
          ship_date: [that.invoiceData.ship_date],
          packing_slip: [that.invoiceData.packing_slip],
          receiving_slip: [that.invoiceData.receiving_slip],
          status: [that.invoiceData.status ?? 'Pending'],
          terms: [that.invoiceData.terms],
          total: [that.invoiceData.total],
          tax_amount: [that.invoiceData.tax_amount],
          tax_id: [that.invoiceData.tax_id],
          sub_total: [that.invoiceData.sub_total],
          amount_due: [that.invoiceData.amount_due],
          cost_code: [that.invoiceData.cost_code],
          gl_account: [that.invoiceData.gl_account],
          assign_to: [that.invoiceData.assign_to],
          notes: [that.invoiceData.notes],
          pdf_url: [that.invoiceData.pdf_url],
        });

      }
      that.uiSpinner.spin$.next(false);
    });
  }

  saveData() {
    if (this.id) {
      this.saveInvoice();
    } else if (this.document_id) {
      this.saveProcessDocument();
    }
  }
  saveInvoice() {
    let that = this;

    if (that.invoiceform.valid) {
      let requestObject = that.invoiceform.value;
      if (that.id) {
        requestObject._id = that.id;
      }
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.INVOICE_SAVE_INVOICE, requestObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.back();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
        that.uiSpinner.spin$.next(false);
      });
    }
  }
  saveProcessDocument() {
    let that = this;
    if (that.invoiceform.valid) {

      let formVal = that.invoiceform.value;
      let requestObject = {
        _id: that.document_id,
        module: 'INVOICE',
        'data.date': formVal.date,
        'data.vendor': formVal.vendor,
        'data.document_type': formVal.document_type,
        'data.invoice_name': formVal.invoice_name,
        'data.vendor_id': formVal.vendor_id,
        'data.customer_id': formVal.customer_id,
        'data.invoice': formVal.invoice,
        'data.p_o': formVal.p_o,
        'data.job_number': formVal.job_number,
        'data.invoice_date': formVal.invoice_date,
        'data.due_date': formVal.due_date,
        'data.order_date': formVal.order_date,
        'data.ship_date': formVal.ship_date,
        'data.packing_slip': formVal.packing_slip,
        'data.receiving_slip': formVal.receiving_slip,
        'data.status': formVal.status,
        'data.terms': formVal.terms,
        'data.total': formVal.total,
        'data.tax_amount': formVal.tax_amount,
        'data.tax_id': formVal.tax_id,
        'data.sub_total': formVal.sub_total,
        'data.amount_due': formVal.amount_due,
        'data.cost_code': formVal.cost_code,
        'data.gl_account': formVal.gl_account,
        'data.assign_to': formVal.assign_to,
        'data.notes': formVal.notes,
        'data.pdf_url': formVal.pdf_url,
      };

      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.INVOICE_DOCUMENT_PROCESS_SAVE, requestObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.back();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
        that.uiSpinner.spin$.next(false);
      });

    }
  }

}


@Component({
  selector: 'invoice-history',
  templateUrl: './invoice-history.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceHistoryComponent implements OnInit {
  id!: string;

  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;
  mode: any;
  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;
  activityIcon!: string;
  isSearch: boolean = false;
  subscription: Subscription;
  dashboardHistory = [];
  constructor (
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    private modeService: ModeDetectService,
    public route: ActivatedRoute,

    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });
  }

  ngOnInit(): void {
    this.getTodaysActivity();
  }


  onKey(event: any) {
    if (event.target.value.length == 0) {
      this.dashboardHistory = [];
      this.start = 0;
      this.getTodaysActivity();
    }
  }
  searchActivity() {

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

      });
  }

  temp_MMDDYYY_format(epoch) {
    return MMDDYYYY_formet(epoch);
  }

  setHeightStyles() {
    let styles = {
      height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }

}

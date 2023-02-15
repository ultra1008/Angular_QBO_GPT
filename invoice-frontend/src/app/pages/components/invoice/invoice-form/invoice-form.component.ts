import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Location } from '@angular/common';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Observable, Subscription } from 'rxjs';
import { commonFileChangeEvent } from 'src/app/service/utils';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../team/employee.service';
import { map, startWith } from 'rxjs/operators';
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
  viewIcon: string = "";
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
  status: any;
  // options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  vendor_name = new FormControl('');


  constructor(public employeeservice: EmployeeService, private location: Location, private modeService: ModeDetectService, public snackbarservice: Snackbarservice, private formBuilder: FormBuilder,
    public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public route: ActivatedRoute, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.pdf_url = this.route.snapshot.queryParamMap.get('pdf_url');
    this.status = this.route.snapshot.queryParamMap.get('status');
    console.log("invoice", this.id);
    if (this.id) {
      console.log("id11111111", this.id);
      this.uiSpinner.spin$.next(true);
      this.getOneInvoice();
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
      vendor_name: [""],
      customer_id: [""],
      invoice: [""],
      p_o: [""],
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
      this.viewIcon = icon.VIEW_WHITE;
    } else {

      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
      this.viewIcon = icon.VIEW;
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
        this.viewIcon = icon.VIEW_WHITE;

      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
        this.viewIcon = icon.VIEW;

      }
    });

  }

  back() {
    this.router.navigate(['/invoice']);
  }

  ngOnInit(): void {

    let that = this;
    this.filteredVendors = this.vendor_name.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.invoiceform.get("due_date").valueChanges.subscribe(function (params: any) {
      console.log("params:         $$$$$$$$$", params);
      /* if (params.length == that.vendorList.length) {
        that.invoiceinfo.get("All_Vendors")!.setValue(true);
      } else {
        that.invoiceinfo.get("All_Vendors")!.setValue(false);
      } */
    });
    /* this.filteredVendors = this.invoiceform.get('vendor_name').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    ); */




    this.employeeservice.getalluser().subscribe(function (data) {
      // that.uiSpinner.spin$.next(false);
      if (data.status) {
        that.isEmployeeData = true;
        // that.usersArray = data.data;
        that.variablesusersArray = data.data;
        that.usersArray = that.variablesusersArray.slice();
        that.isManagement = data.is_management;
      }
      console.log("usersArray", data.data);
    });
    that.getAllCostCode();
    this.getAllVendorList();
  }

  // private _filter(value: string) {
  //   console.log("vealue: v", value);
  //   const filterValue = value.toLowerCase();
  //   return this.vendorList.filter(option => option.vendor_name.toLowerCase().includes(filterValue));
  // }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.vendorList.filter(option => option.vendor_name.toLowerCase().includes(filterValue));
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
      console.log("vendorListttttt", this.vendorList);


    }
  }



  getOneInvoice() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id }).subscribe(function (params) {
      if (params.status) {
        that.status = params.data.status;
        that.invoiceData = params.data;
        that.pdf_url = that.invoiceData.pdf_url;
        that.invoiceform = that.formBuilder.group({
          document_type: [params.data.document_type],
          invoice_name: [params.data.invoice_name],
          vendor_name: [params.data.vendor_name],
          customer_id: [params.data.customer_id],
          invoice: [params.data.invoice],
          p_o: [params.data.p_o],
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
}

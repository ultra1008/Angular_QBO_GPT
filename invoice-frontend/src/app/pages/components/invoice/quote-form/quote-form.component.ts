import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { Console } from 'console';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2'
  },
  buttonsStyling: false
});
@Component({
  selector: 'app-quote-form',
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.scss']
})
export class QuoteFormComponent implements OnInit {
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
  close_this_window: string = "";
  All_popup_Cancel = "";
  All_Save_Exit = "";
  Dont_Save = "";
  invoiceform: FormGroup;
  Email_Template_Form_Submitting = "";
  id: any;
  isManagement: boolean = true;

  isEmployeeData: Boolean = false;
  // db_costcodes
  variablesdb_costcodes: any = [];
  db_costcodes: any = this.variablesdb_costcodes.slice();
  // usersArray
  variablesusersArray: any = [];
  usersArray: any = this.variablesusersArray.slice();
  approveIcon: string;
  denyIcon: string;
  // DOCUMENT TYPE
  variablesDocumenttype: any = configdata.DOCUMENT_TYPE;
  DocumentType = this.variablesDocumenttype.slice();

  pdf_url = "";
  invoiceData: any;
  statusList = configdata.INVOICE_STATUS;
  invoice_id: any;
  loadInvoice: boolean = false;
  badge: any = [];
  status: any;
  filteredOptions: Observable<string[]>;
  vendor = new FormControl('');
  filteredVendors: Observable<any[]>;
  vendorList: any = [];
  viewIcon: any;

  constructor(public employeeservice: EmployeeService, private location: Location, private modeService: ModeDetectService, public snackbarservice: Snackbarservice, private formBuilder: FormBuilder,
    public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public route: ActivatedRoute, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.invoice_id = this.id;
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
    });
    this.invoiceform = this.formBuilder.group({
      document_type: [""],
      quote_number: [""],
      vendor: [""],
      sub_total: [""],
      date: [""],
      terms: [""],
      address: [""],
      shipping_method: [""],
      tax: [""],
      receiver_phone: [""],
      quote_total: [""],
      //     invoice_name: [""],
      //     invoice: [""],
      //     p_o: [""],
      //     invoice_date: [""],
      //     due_date: [""],
      //     order_date: [""],
      //     ship_date: [""],
      //     packing_slip: [""],
      //     receiving_slip: [""],
      //     status: [""],
      //     total: [""],
      //  tax_amount: [""],
      //     tax_id: [""],
      //     amount_due: [""],
      //     cost_code: [""],
      //     gl_account: [""],
      //     assign_to: [""],
      //     notes: [""],
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
    } else {

      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
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
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
      }
    });
    if (this.id) {
      this.getOneInvoice();
    }
  }

  back() {
    this.router.navigate(['/invoice-detail'], { queryParams: { _id: this.invoice_id } });
  }

  ngOnInit(): void {
    let that = this;
    this.getAllVendorList();
    this.filteredVendors = this.vendor.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVendor(value || '')),
    );
    this.employeeservice.getalluser().subscribe(function (data) {
      that.uiSpinner.spin$.next(false);
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
  }

  private _filterVendor(value: any): any[] {
    return this.vendorList.filter(one_vendor => {
      let vendor_name = value.vendor_name ? value.vendor_name : value;
      return one_vendor.vendor_name.toLowerCase().indexOf(vendor_name.toLowerCase()) > -1;
    });

  }

  async getAllVendorList() {
    let data = await this.httpCall.httpGetCall(httproutes.PORTAL_COMPANY_VENDOR_GET_BY_ID).toPromise();
    if (data.status) {
      this.vendorList = data.data;
    }
  }
  getIdFromVendor(event, Option) {
    this.invoiceform.get('vendor').setValue(Option._id);
  }

  displayOption(option: any): string {
    return option ? option.vendor_name : option;
  }
  print() {
    fetch(this.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
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
    a.href = this.pdf_url;
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

  getOneInvoice() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id }).subscribe(function (params) {
      if (params.status) {
        that.invoiceData = params.data;
        that.pdf_url = that.invoiceData.quote_data.pdf_url;
        that.badge = that.invoiceData.quote_data.badge;
        that.vendor.setValue(params.data.vendor);
        that.loadInvoice = true;

        that.invoiceform = that.formBuilder.group({

          terms: [params.data.quote_data.terms],
          sub_total: [params.data.quote_data.sub_total],
          vendor: [params.data.vendor._id],
          document_type: [params.data.quote_data.document_type],
          tax: [params.data.quote_data.tax],
          date: [params.data.quote_data.date],
          quote_number: [params.data.quote_data.quote_number],
          address: [params.data.quote_data.address],
          shipping_method: [params.data.quote_data.shipping_method],
          receiver_phone: [params.data.quote_data.receiver_phone],
          quote_total: [params.data.quote_data.quote_total],

          // invoice_name: [params.data.invoice_name],
          // vendor_name: [params.data.vendor_name],
          // customer_id: [params.data.customer_id],
          // invoice: [params.data.invoice],
          // p_o: [params.data.p_o],
          // invoice_date: [params.data.invoice_date],
          // order_date: [params.data.order_date],
          // ship_date: [params.data.ship_date],
          // packing_slip: [params.data.packing_slip],
          // receiving_slip: [params.data.receiving_slip],
          // status: [params.data.status],
          // total: [params.data.total],
          // tax_id: [params.data.tax_id],
          // amount_due: [params.data.amount_due],
          // cost_code: [params.data.cost_code],
          // gl_account: [params.data.gl_account],
          // assign_to: [params.data.assign_to],
          // notes: [params.data.notes],
          // pdf_url: [params.data.quote_data.pdf_url]
        });
      }
      that.uiSpinner.spin$.next(false);
    });
  }


  saveInvoice() {
    let that = this;
    if (that.invoiceform.valid) {

      let formVal = that.invoiceform.value;
      let requestObject = {
        _id: that.id,
        module: 'Quote',
        'quote_data.document_type': formVal.document_type,
        'quote_data.quote_number': formVal.quote_number,
        'quote_data.sub_total': formVal.sub_total,
        'quote_data.vendor': formVal.vendor,
        'quote_data.terms': formVal.terms,
        'quote_data.shipping_method': formVal.shipping_method,
        'quote_data.tax': formVal.tax,
        'quote_data.received_by': formVal.received_by,
        'quote_data.receiver_phone': formVal.receiver_phone,
        'quote_data.quote_total': formVal.quote_total,
      };
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_UPDATE_QUOTE, requestObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.back();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
        that.uiSpinner.spin$.next(false);
      });
      console.log("requestObject", requestObject);
    }
  }


}




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
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2'
  },
  buttonsStyling: false
});
@Component({
  selector: 'app-receiving-slip-form',
  templateUrl: './receiving-slip-form.component.html',
  styleUrls: ['./receiving-slip-form.component.scss']
})
export class ReceivingSlipFormComponent implements OnInit {
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
  invoiceData: any;


  isEmployeeData: Boolean = false;
  // db_costcodes
  variablesdb_costcodes: any = [];
  db_costcodes: any = this.variablesdb_costcodes.slice();
  // usersArray
  variablesusersArray: any = [];
  usersArray: any = this.variablesusersArray.slice();

  pdf_url = '';

  statusList = configdata.INVOICE_STATUS;
  approveIcon: string;
  denyIcon: string;
  // DOCUMENT TYPE
  variablesDocumenttype: any = configdata.DOCUMENT_TYPE;
  DocumentType = this.variablesDocumenttype.slice();
  invoice_id: any;
  loadInvoice: boolean = false;

  badge: any = [];
  status: any;
  filteredOptions: Observable<string[]>;
  vendor = new FormControl('');
  filteredVendors: Observable<any[]>;
  vendorList: any = [];
  viewIcon: any;
  document_id: any;


  constructor (public employeeservice: EmployeeService, private location: Location, private modeService: ModeDetectService, public snackbarservice: Snackbarservice, private formBuilder: FormBuilder,
    public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public route: ActivatedRoute, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.document_id = this.route.snapshot.queryParamMap.get('document_id');
    this.invoice_id = this.id;

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
      invoice_number: [""],
      po_number: [""],
      received_by: [""],
      ship_to_address: [""],
      date: [""],



      // invoice_name: [""],
      // vendor_name: [""],
      // customer_id: [""],

      // invoice_date: [""],
      // due_date: [""],
      // order_date: [""],
      // ship_date: [""],
      // packing_slip: [""],
      // receiving_slip: [""],
      // status: [""],
      // terms: [""],
      // total: [""],


      // tax_amount: [""],
      // tax_id: [""],
      // sub_total: [""],
      // amount_due: [""],
      // cost_code: [""],
      // gl_account: [""],
      // assign_to: [""],
      // notes: [""],
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
    if (this.document_id) {
      this.getOneProcessDocument();
    }
  }

  back() {
    if (this.id) {
      this.router.navigate(['/invoice-detail'], { queryParams: { _id: this.invoice_id } });
    } else if (this.document_id) {
      this.router.navigate(['/documents-list']);
    } else {
      this.location.back();
    }
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
        that.pdf_url = that.invoiceData.receiving_slip_data.pdf_url;
        that.badge = that.invoiceData.receiving_slip_data.badge;
        that.vendor.setValue(params.data.vendor);
        that.loadInvoice = true;

        that.invoiceform = that.formBuilder.group({

          document_type: [params.data.receiving_slip_data.document_type],
          vendor: [params.data.vendor._id],
          invoice_number: [params.data.receiving_slip_data.invoice_number],
          po_number: [params.data.receiving_slip_data.po_number],
          date: [params.data.receiving_slip_data.date],
          ship_to_address: [params.data.receiving_slip_data.ship_to_address],
          received_by: [params.data.receiving_slip_data.received_by],


          // invoice_name: [params.data.invoice_name],
          // vendor_name: [params.data.vendor_name],

          // customer_id: [params.data.customer_id],

          // invoice_date: [params.data.invoice_date],
          // due_date: [params.data.due_date],
          // order_date: [params.data.order_date],
          // ship_date: [params.data.ship_date],

          // packing_slip: [params.data.packing_slip],
          // receiving_slip: [params.data.receiving_slip],
          // status: [params.data.status],
          // terms: [params.data.terms],
          // total: [params.data.total],

          // tax_amount: [params.data.tax_amount],
          // tax_id: [params.data.tax_id],
          // sub_total: [params.data.sub_total],
          // amount_due: [params.data.amount_due],
          // cost_code: [params.data.cost_code],
          // gl_account: [params.data.gl_account],
          // assign_to: [params.data.assign_to],
          // notes: [params.data.notes],
          // pdf_url: [params.data.packing_slip_data.pdf_url]
        });
      }
      that.uiSpinner.spin$.next(false);
    });
  }
  getOneProcessDocument() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_DOCUMENT_PROCESS_GET, { _id: that.document_id }).subscribe(function (params) {
      if (params.status) {
        if (params.data.data) {
          that.invoiceData = params.data.data;
          // that.pdf_url = that.invoiceData.pdf_url;
          // that.badge = that.invoiceData.badge;
          if (that.invoiceData.pdf_url) {
            that.pdf_url = that.invoiceData.pdf_url;
          } else {
            that.pdf_url = params.data.pdf_url;
          }
          if (that.invoiceData.badge) {
            that.badge = that.invoiceData.badge;
          } else {
            that.badge = {
              vendor: false,
            };
          }
        } else {
          that.invoiceData = params.data;
          if (that.invoiceData.pdf_url) {
            that.pdf_url = that.invoiceData.pdf_url;
          } else {
            that.pdf_url = params.data.pdf_url;
          }
          that.badge = {
            document_type: false,
          };
        }
        that.vendor.setValue(that.invoiceData.vendor);
        that.loadInvoice = true;
        let vendorId = '';
        if (that.invoiceData.vendor) {
          vendorId = that.invoiceData.vendor._id;
        }
        that.invoiceform = that.formBuilder.group({
          document_type: [that.invoiceData.document_type],
          vendor: [vendorId],
          invoice_number: [that.invoiceData.invoice_number],
          po_number: [that.invoiceData.po_number],
          date: [that.invoiceData.date],
          ship_to_address: [that.invoiceData.ship_to_address],
          received_by: [that.invoiceData.received_by],


          // invoice_name: [params.data.invoice_name],
          // vendor_name: [params.data.vendor_name],

          // customer_id: [params.data.customer_id],

          // invoice_date: [params.data.invoice_date],
          // due_date: [params.data.due_date],
          // order_date: [params.data.order_date],
          // ship_date: [params.data.ship_date],

          // packing_slip: [params.data.packing_slip],
          // receiving_slip: [params.data.receiving_slip],
          // status: [params.data.status],
          // terms: [params.data.terms],
          // total: [params.data.total],

          // tax_amount: [params.data.tax_amount],
          // tax_id: [params.data.tax_id],
          // sub_total: [params.data.sub_total],
          // amount_due: [params.data.amount_due],
          // cost_code: [params.data.cost_code],
          // gl_account: [params.data.gl_account],
          // assign_to: [params.data.assign_to],
          // notes: [params.data.notes],
          // pdf_url: [params.data.packing_slip_data.pdf_url]
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

      let formVal = that.invoiceform.value;
      let requestObject = {
        _id: that.id,
        module: 'Receiving Slip',
        'receiving_slip_data.date': formVal.date,
        'receiving_slip_data.invoice_number': formVal.invoice_number,
        'receiving_slip_data.po_number': formVal.po_number,
        'receiving_slip_data.vendor': formVal.vendor,
        'receiving_slip_data.received_by': formVal.received_by,
        'receiving_slip_data.ship_to_address': formVal.ship_to_address,
        'receiving_slip_data.document_type': formVal.document_type,
      };

      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_UPDATE_Receiving_Slip, requestObject).subscribe(function (params) {
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
        module: 'Receiving Slip',
        'data.date': formVal.date,
        'data.invoice_number': formVal.invoice_number,
        'data.po_number': formVal.po_number,
        'data.vendor': formVal.vendor,
        'data.received_by': formVal.received_by,
        'data.ship_to_address': formVal.ship_to_address,
        'data.document_type': formVal.document_type,
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


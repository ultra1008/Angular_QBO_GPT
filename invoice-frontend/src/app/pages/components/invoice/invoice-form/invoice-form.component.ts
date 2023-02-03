import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Location } from '@angular/common';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Subscription } from 'rxjs';
import { commonFileChangeEvent } from 'src/app/service/utils';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../team/employee.service';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2'
  },
  buttonsStyling: false
});

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
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
  pdf_url: "";
  invoiceData: any;

  isEmployeeData: Boolean = false;
  // db_costcodes
  variablesdb_costcodes: any = [];
  db_costcodes: any = this.variablesdb_costcodes.slice();
  // usersArray
  variablesusersArray: any = [];
  usersArray: any = this.variablesusersArray.slice();


  statusList = configdata.INVOICE_STATUS;

  constructor(public employeeservice: EmployeeService, private location: Location, private modeService: ModeDetectService, public snackbarservice: Snackbarservice, private formBuilder: FormBuilder,
    public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public route: ActivatedRoute, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');

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
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
      }
    });
    if (this.id) {
      this.getOneInvoice();
    }
  }

  back() {
    this.router.navigate(['/invoice']);
  }

  ngOnInit(): void {
    let that = this;
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

  getOneInvoice() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id }).subscribe(function (params) {
      if (params.status) {
        console.log("params11", params);
        that.invoiceData = params.data;
        that.invoiceform = that.formBuilder.group({
          // invoice: [params.data.invoice],
          // p_o: [params.data.p_o, Validators.required],

          // packing_slip: [params.data.packing_slip],
          // receiving_slip: [params.data.receiving_slip],
          // notes: [params.data.notes],
          // status: [params.data.status, Validators.required],
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private router: Router, private modeService: ModeDetectService, public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {

      this.editIcon = icon.EDIT;

      this.viewIcon = icon.VIEW;

    } else {

      this.editIcon = icon.EDIT_WHITE;

      this.viewIcon = icon.VIEW_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';

        this.editIcon = icon.EDIT;

        this.viewIcon = icon.VIEW;

      } else {
        this.mode = 'on';

        this.editIcon = icon.EDIT_WHITE;

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

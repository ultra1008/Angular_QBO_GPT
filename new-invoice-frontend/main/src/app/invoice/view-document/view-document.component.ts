import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TermModel } from 'src/app/vendors/vendor.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { amountChange, epochToDateTime, numberWithCommas, showNotification } from 'src/consts/utils';
import { configData } from 'src/environments/configData';
import { InvoiceRejectedReasonComponent } from '../invoice-detail/invoice-rejected-reason/invoice-rejected-reason.component';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent {
  poForm: UntypedFormGroup;
  quoteForm: UntypedFormGroup;
  packingSlipForm: UntypedFormGroup;
  receivingSlipForm: UntypedFormGroup;
  showPoEdit: boolean = false;

  pdf_url = 'https://s3.wasabisys.com/r-988514/dailyreport/60c31f3dc5ba8494a2b1070f/60c31f3dc5ba8494a2b1070fdailyreport1630757615234.pdf';

  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  documentTypesList: any = configData.DOCUMENT_TYPE_LIST;

  document: any;
  documentTypes = configData.DOCUMENT_TYPES;
  poList: any = [];
  quoteList: any = [];
  packingSlipList: any = [];
  receivingSlipList: any = [];
  id: any;
  maxDate = new Date();
  invoice_id: any;

  constructor(public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, private fb: UntypedFormBuilder, public commonService: CommonService, public route: ActivatedRoute, private router: Router,) {
    this.document = this.route.snapshot.queryParamMap.get('document') ?? '';
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';

    this.poForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      quote_number: ['',],
      date: [''],
      shipping_method: [''],
      sub_total: [''],
      tax: [''],
      quote_total: [''],
      receiver_phone: [''],
      terms: [''],
      address: [''],
    });

    this.quoteForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      quote_number: ['',],
      date: [''],
      shipping_method: [''],
      sub_total: [''],
      tax: [''],
      quote_total: [''],
      receiver_phone: [''],
      terms: [''],
      address: [''],
    });

    this.packingSlipForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      invoice: ['',],
      date: [''],
      po: [''],
      address: [''],
      received_by: [''],
    });

    this.receivingSlipForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      invoice: ['',],
      date: [''],
      po: [''],
      address: [''],
      received_by: [''],
    });

    this.getTerms();
    if (this.document == 'PURCHASE_ORDER') {
      this.getOnePo();
    }
    if (this.document == 'QUOTE') {
      this.getOneQuote();
    }
    if (this.document == 'PACKING_SLIP') {
      this.getOnePackingSlipList();
    }
    if (this.document == 'RECEIVING_SLIP') {
      this.getOneRecevingSlipList();
    }
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET);
    if (data.status) {
      this.variablestermList = data.data;
      this.termsList = this.variablestermList.slice();
    }
  }
  goDocumentForm() {
    this.showPoEdit = true;
  }
  async getOnePo() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_PO, { _id: this.id });
    if (data.status) {
      this.poList = data.data;
    }
    let poDate;
    if (this.poList.date_epoch != undefined && this.poList.date_epoch != null && this.poList.date_epoch != 0) {
      poDate = epochToDateTime(this.poList.date_epoch);
    }
    this.invoice_id = this.poList.invoice_id;
    this.poForm = this.fb.group({
      document_type: [this.poList.document_type],
      vendor_name: [this.poList.vendor_data.vendor_name],
      quote_number: [this.poList.quote_number],
      date: [poDate],
      shipping_method: [this.poList.shipping_method],
      sub_total: [this.poList.sub_total],
      tax: [this.poList.tax],
      quote_total: [numberWithCommas(this.poList.quote_total.toFixed(2))],
      receiver_phone: [this.poList.receiver_phone],
      terms: [this.poList.terms],
      address: [this.poList.address],
    });
  }
  poAmountChange(params: any, controller: string) {
    this.poForm.get(controller)?.setValue(amountChange(params));
  }

  async savePoForm() {
    if (this.poForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.poForm.value;
      formValues._id = this.id;
      if (formValues.date == null) {
        formValues.date = 0;
      } else {
        formValues.date = Math.round(formValues.date.valueOf() / 1000);
      }

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_AP_PO, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async getOneQuote() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_QUOET, { _id: this.id });
    if (data.status) {
      this.quoteList = data.data;
    }
    let quoteDate;
    if (this.quoteList.date_epoch != undefined && this.quoteList.date_epoch != null && this.quoteList.date_epoch != 0) {
      quoteDate = epochToDateTime(this.quoteList.date_epoch);
    }
    this.invoice_id = this.quoteList.invoice_id;
    this.quoteForm = this.fb.group({
      document_type: [this.quoteList.document_type],
      vendor_name: [this.quoteList.vendor_name],
      quote_number: [this.quoteList.quote_number],
      date: [quoteDate],
      shipping_method: [this.quoteList.shipping_method],
      sub_total: [this.quoteList.sub_total],
      tax: [this.quoteList.tax],
      quote_total: [this.quoteList.quote_total],
      receiver_phone: [this.quoteList.receiver_phone],
      terms: [this.quoteList.terms],
      address: [this.quoteList.address],
    });
  }
  async getOnePackingSlipList() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_PACKLING_SLIP, { _id: this.id });
    if (data.status) {
      this.packingSlipList = data.data;
    }
    let packingSlipDate;
    if (this.packingSlipList.date_epoch != undefined && this.packingSlipList.date_epoch != null && this.packingSlipList.date_epoch != 0) {
      packingSlipDate = epochToDateTime(this.packingSlipList.date_epoch);
    }
    this.invoice_id = this.packingSlipList.invoice_id;
    this.packingSlipForm = this.fb.group({
      document_type: [this.packingSlipList.document_type],
      vendor_name: [this.packingSlipList.vendor_name],
      invoice: [this.packingSlipList.invoice],
      date: [packingSlipDate],
      po: [this.packingSlipList.po],
      address: [this.packingSlipList.address],
      received_by: [this.packingSlipList.received_by],
    });

  }
  async getOneRecevingSlipList() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_RECEVING_SLIP, { _id: this.id });
    if (data.status) {
      this.receivingSlipList = data.data;
    }
    let receivingSliDate;
    if (this.receivingSlipList.date_epoch != undefined && this.receivingSlipList.date_epoch != null && this.receivingSlipList.date_epoch != 0) {
      receivingSliDate = epochToDateTime(this.receivingSlipList.date_epoch);
    }
    this.invoice_id = this.receivingSlipList.invoice_id;
    this.receivingSlipForm = this.fb.group({
      document_type: [this.receivingSlipList.document_type],
      vendor_name: [this.receivingSlipList.vendor_name],
      invoice: [this.receivingSlipList.invoice],
      date: [receivingSliDate],
      po: [this.receivingSlipList.po],
      address: [this.receivingSlipList.address],
      received_by: [this.receivingSlipList.received_by],
    });

  }

  backListing() {
    this.router.navigate([WEB_ROUTES.INVOICE]);
  }
  back() {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: this.invoice_id } });
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
  onKey(event: any) {

    if (event.target.value.length == 0) {

      // this.dashboardHistory = [];
      // this.start = 0;
      // this.getTodaysActivity();
    }
  }
}

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
  showPoEdit = false;

  pdf_url = '';
  invoicePDF = '';
  loadPDF = false;

  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  documentTypesList: any = configData.DOCUMENT_TYPE_LIST;

  document: any;
  documentTypes = configData.DOCUMENT_TYPES;
  poData: any = [];
  quoteData: any = [];
  packingSlipData: any = [];
  receivingSlipData: any = [];
  id: any;
  maxDate = new Date();
  invoice_id: any;

  constructor (public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, private fb: UntypedFormBuilder, public commonService: CommonService, public route: ActivatedRoute, private router: Router,) {
    this.document = this.route.snapshot.queryParamMap.get('document') ?? '';
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';

    this.poForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      quote_no: ['',],
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
      quote_no: ['',],
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
      this.poData = data.data;
      let poDate;
      if (this.poData.date_epoch != undefined && this.poData.date_epoch != null && this.poData.date_epoch != 0) {
        poDate = epochToDateTime(this.poData.date_epoch);
      }
      this.invoice_id = this.poData.invoice_id;
      let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.poData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      }
      this.poForm = this.fb.group({
        document_type: [document_type],
        vendor_name: [this.poData.vendor_data.vendor_name],
        quote_no: [this.poData.quote_no],
        date: [poDate],
        shipping_method: [this.poData.shipping_method],
        sub_total: [numberWithCommas(this.poData.sub_total.toFixed(2))],
        tax: [numberWithCommas(this.poData.tax.toFixed(2))],
        po_total: [numberWithCommas(this.poData.po_total.toFixed(2))],
        receiver_phone: [this.poData.receiver_phone],
        terms: [this.poData.terms],
        address: [this.poData.address],
      });
      this.pdf_url = this.poData.pdf_url;
      this.invoicePDF = this.poData.invoice.pdf_url;
      this.loadPDF = false;
      setTimeout(() => {
        this.loadPDF = true;
      }, 100);
    }
  }
  poAmountChange(params: any, controller: string) {
    this.poForm.get(controller)?.setValue(amountChange(params));
  }

  async savePO() {
    if (this.poForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.poForm.value;

      delete formValues.document_type;
      delete formValues.vendor_name;
      formValues._id = this.id;

      if (formValues.date == null) {
        formValues.date = 0;
      } else {
        formValues.date = Math.round(formValues.date.valueOf() / 1000);
      }

      formValues.sub_total = formValues.sub_total.toString().replace(/,/g, "");
      formValues.tax = formValues.tax.toString().replace(/,/g, "");
      formValues.po_total = formValues.po_total.toString().replace(/,/g, "");

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
      this.quoteData = data.data;
      let quoteDate;
      if (this.quoteData.date_epoch != undefined && this.quoteData.date_epoch != null && this.quoteData.date_epoch != 0) {
        quoteDate = epochToDateTime(this.quoteData.date_epoch);
      }
      let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.quoteData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      }
      this.invoice_id = this.quoteData.invoice_id;
      this.quoteForm = this.fb.group({
        document_type: [document_type],
        vendor_name: [this.quoteData.vendor_data.vendor_name],
        quote_no: [this.quoteData.quote_no],
        date: [quoteDate],
        shipping_method: [this.quoteData.shipping_method],
        sub_total: [numberWithCommas(this.quoteData.sub_total.toFixed(2))],
        tax: [numberWithCommas(this.quoteData.tax.toFixed(2))],
        quote_total: [numberWithCommas(this.quoteData.quote_total.toFixed(2))],
        receiver_phone: [this.quoteData.receiver_phone],
        terms: [this.quoteData.terms],
        address: [this.quoteData.address],
      });
      this.pdf_url = this.quoteData.pdf_url;
      this.invoicePDF = this.quoteData.invoice.pdf_url;
      this.loadPDF = false;
      setTimeout(() => {
        this.loadPDF = true;
      }, 100);
    }
  }

  quoteAmountChange(params: any, controller: string) {
    this.quoteForm.get(controller)?.setValue(amountChange(params));
  }

  async saveQuote() {
    if (this.quoteForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.quoteForm.value;

      delete formValues.document_type;
      delete formValues.vendor_name;
      formValues._id = this.id;

      if (formValues.date == null) {
        formValues.date = 0;
      } else {
        formValues.date = Math.round(formValues.date.valueOf() / 1000);
      }

      formValues.sub_total = formValues.sub_total.toString().replace(/,/g, "");
      formValues.tax = formValues.tax.toString().replace(/,/g, "");
      formValues.quote_total = formValues.quote_total.toString().replace(/,/g, "");

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_AP_QUOTE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async getOnePackingSlipList() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_PACKLING_SLIP, { _id: this.id });
    if (data.status) {
      this.packingSlipData = data.data;
      let packingSlipDate;
      if (this.packingSlipData.date_epoch != undefined && this.packingSlipData.date_epoch != null && this.packingSlipData.date_epoch != 0) {
        packingSlipDate = epochToDateTime(this.packingSlipData.date_epoch);
      }
      let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.packingSlipData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      }
      this.invoice_id = this.packingSlipData.invoice_id;
      this.packingSlipForm = this.fb.group({
        document_type: [document_type],
        vendor_name: [this.packingSlipData.vendor_data.vendor_name],
        invoice_no: [this.packingSlipData.invoice_no],
        date: [packingSlipDate],
        po_no: [this.packingSlipData.po_no],
        address: [this.packingSlipData.address],
        received_by: [this.packingSlipData.received_by],
      });
      this.pdf_url = this.packingSlipData.pdf_url;
      this.invoicePDF = this.packingSlipData.invoice.pdf_url;
      this.loadPDF = false;
      setTimeout(() => {
        this.loadPDF = true;
      }, 100);
    }
  }

  async savePackingSlip() {
    if (this.packingSlipForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.packingSlipForm.value;

      delete formValues.document_type;
      delete formValues.vendor_name;
      formValues._id = this.id;

      if (formValues.date == null) {
        formValues.date = 0;
      } else {
        formValues.date = Math.round(formValues.date.valueOf() / 1000);
      }

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_AP_PACKLING_SLIP, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async getOneRecevingSlipList() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_RECEVING_SLIP, { _id: this.id });
    if (data.status) {
      this.receivingSlipData = data.data;
      let receivingSliDate;
      if (this.receivingSlipData.date_epoch != undefined && this.receivingSlipData.date_epoch != null && this.receivingSlipData.date_epoch != 0) {
        receivingSliDate = epochToDateTime(this.receivingSlipData.date_epoch);
      }
      this.invoice_id = this.receivingSlipData.invoice_id;
      this.receivingSlipForm = this.fb.group({
        document_type: [this.receivingSlipData.document_type],
        vendor_name: [this.receivingSlipData.vendor_name],
        invoice_no: [this.receivingSlipData.invoice_no],
        date: [receivingSliDate],
        po_no: [this.receivingSlipData.po_no],
        address: [this.receivingSlipData.address],
        received_by: [this.receivingSlipData.received_by],
      });
      this.pdf_url = this.receivingSlipData.pdf_url;
      this.invoicePDF = this.receivingSlipData.invoice.pdf_url;
      this.loadPDF = false;
      setTimeout(() => {
        this.loadPDF = true;
      }, 100);
    }
  }

  async saveReceivingSlip() {
    if (this.receivingSlipForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.receivingSlipForm.value;

      delete formValues.document_type;
      delete formValues.vendor_name;
      formValues._id = this.id;

      if (formValues.date == null) {
        formValues.date = 0;
      } else {
        formValues.date = Math.round(formValues.date.valueOf() / 1000);
      }

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_AP_RECEVING_SLIP, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
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

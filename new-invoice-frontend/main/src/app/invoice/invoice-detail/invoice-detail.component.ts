import { ActivatedRoute, Router } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { SendInvoiceMessageComponent } from './send-invoice-message/send-invoice-message.component';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { icon } from 'src/consts/icon';
import { MailFormComponent } from '../mail-form/mail-form.component';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { User } from 'src/app/users/user.model';
import { TermModel, Vendor } from 'src/app/vendors/vendor.model';
import { configData } from 'src/environments/configData';
import { ClassNameTable, CostCodeTable } from 'src/app/settings/settings.model';
import { ClientList } from 'src/app/client/client.model';
import { epochToDateTime, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
})
export class InvoiceDetailComponent extends UnsubscribeOnDestroyAdapter {
  MAIL_ICON = icon.MAIL_ICON;
  MESSAGE_ICON = icon.MESSAGE_ICON;
  panelOpenState = false;
  invoiceForm: UntypedFormGroup;
  moreInformationForm!: UntypedFormGroup;
  noteForm!: UntypedFormGroup;

  step = 0;
  pdf_url = '/assets/pdf_url/file-3.pdf';
  loadInvoice = true;
  isLoading = true;
  maxDate = new Date();

  variablesVendorList: any = [];
  vendorList: Array<Vendor> = this.variablesVendorList.slice();

  variablesUserList: any = [];
  userList: Array<User> = this.variablesUserList.slice();

  variablesJobNameList: any = [];
  jobNameList: Array<ClientList> = this.variablesJobNameList.slice();

  variablesTermList: any = [];
  termList: Array<TermModel> = this.variablesTermList.slice();

  variablesCostCodeList: any = [];
  costCodeList: Array<CostCodeTable> = this.variablesCostCodeList.slice();

  variablesClassNameList: any = [];
  classNameList: Array<ClassNameTable> = this.variablesClassNameList.slice();

  documentList: any = configData.DOCUMENT_TYPE_LIST;
  statusList: any = configData.INVOICE_STATUS;

  id: any;
  invoiceData: any;
  pdfLoader = true;
  notes: any = [];
  supportingDocuments: any = [];

  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }
  constructor (private fb: UntypedFormBuilder, private router: Router, public dialog: MatDialog, private commonService: CommonService,
    public route: ActivatedRoute, public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, public translate: TranslateService,) {
    super();
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.uiSpinner.spin$.next(true);
    this.invoiceForm = this.fb.group({
      document_type: [''],
      vendor: [''],
      invoice_no: [''],
      invoice_date_epoch: [''],
      due_date_epoch: [''],
      invoice_total_amount: [''],
      tax_amount: [''],
      assign_to: [''],
      status: [''],
    });

    this.moreInformationForm = this.fb.group({
      vendor_id: [''],
      customer_id: [''],
      po_no: [''],

      job_client_name: [''],
      order_date_epoch: [''],
      ship_date_epoch: [''],

      packing_slip_no: [''],
      receiving_slip_no: [''],
      terms: [''],

      tax_id: [''],
      sub_total: [''],
      amount_due: [''],

      gl_account: [''],
      class_name: [''],

      notes: [''],
    });

    this.noteForm = this.fb.group({
      notes: ['', [Validators.required]],
    });

    this.getVendor();
    this.getUser();
    this.getClienJobName();
    this.getTerms();
    this.getCostCode();
    this.getClassName();
    this.getOneInvoice();
  }

  async getVendor() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET, { is_delete: 0 });
    if (data.status) {
      this.variablesVendorList = data.data;
      this.vendorList = this.variablesVendorList.slice();
    }
  }

  async getUser() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER);
    if (data.status) {
      this.variablesUserList = data.data;
      this.userList = this.variablesUserList.slice();
    }
  }

  async getClienJobName() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_CLIENT);
    if (data.status) {
      this.variablesJobNameList = data.data;
      this.jobNameList = this.variablesJobNameList.slice();
    }
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET);
    if (data.status) {
      this.variablesTermList = data.data;
      this.termList = this.variablesTermList.slice();
    }
  }

  async getCostCode() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COST_CODE);
    if (data.status) {
      this.variablesCostCodeList = data.data;
      this.costCodeList = this.variablesCostCodeList.slice();
    }
  }

  async getClassName() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_CLASS_NAME);
    if (data.status) {
      this.variablesClassNameList = data.data;
      this.classNameList = this.variablesClassNameList.slice();
    }
  }

  async getOneInvoice() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_INVOICE, { _id: this.id });
    if (data.status) {
      this.invoiceData = data.data;
      let invoiceDate;
      if (this.invoiceData.invoice_date_epoch != undefined && this.invoiceData.invoice_date_epoch != null && this.invoiceData.invoice_date_epoch != 0) {
        invoiceDate = epochToDateTime(this.invoiceData.invoice_date_epoch);
      }
      let dueDate;
      if (this.invoiceData.due_date_epoch != undefined && this.invoiceData.due_date_epoch != null && this.invoiceData.due_date_epoch != 0) {
        dueDate = epochToDateTime(this.invoiceData.due_date_epoch);
      }

      this.invoiceForm = this.fb.group({
        document_type: [this.invoiceData.document_type],
        vendor: [this.invoiceData.vendor],
        invoice_no: [this.invoiceData.invoice_no],
        invoice_date_epoch: [invoiceDate],
        due_date_epoch: [dueDate],
        invoice_total_amount: [this.invoiceData.invoice_total_amount],
        tax_amount: [this.invoiceData.tax_amount],
        assign_to: [this.invoiceData.assign_to],
        status: [this.invoiceData.status],
      });


      let orderDate;
      if (this.invoiceData.order_date_epoch != undefined && this.invoiceData.order_date_epoch != null && this.invoiceData.order_date_epoch != 0) {
        orderDate = epochToDateTime(this.invoiceData.order_date_epoch);
      }
      let shipDate;
      if (this.invoiceData.ship_date_epoch != undefined && this.invoiceData.ship_date_epoch != null && this.invoiceData.ship_date_epoch != 0) {
        shipDate = epochToDateTime(this.invoiceData.ship_date_epoch);
      }
      this.moreInformationForm = this.fb.group({
        vendor_id: [this.invoiceData.vendor_id],
        customer_id: [this.invoiceData.customer_id],
        po_no: [this.invoiceData.po_no],

        job_client_name: [this.invoiceData.job_client_name],
        order_date_epoch: [orderDate],
        ship_date_epoch: [shipDate],

        packing_slip_no: [this.invoiceData.packing_slip_no],
        receiving_slip_no: [this.invoiceData.receiving_slip_no],
        terms: [this.invoiceData.terms],

        tax_id: [this.invoiceData.tax_id],
        sub_total: [this.invoiceData.sub_total],
        amount_due: [this.invoiceData.amount_due],

        gl_account: [this.invoiceData.gl_account],
        class_name: [this.invoiceData.class_name],

        notes: [this.invoiceData.notes],
      });

      this.notes = this.invoiceData.invoice_notes;
      this.supportingDocuments = this.invoiceData.supporting_documents;
      this.pdf_url = this.invoiceData.pdf_url;
      this.pdfLoader = false;
      this.uiSpinner.spin$.next(false);
    }
  }

  async saveInformation() {
    if (this.invoiceForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.invoiceForm.value;
      formValues._id = this.id;
      if (formValues.invoice_date_epoch == null) {
        formValues.invoice_date_epoch = 0;
      } else {
        formValues.invoice_date_epoch = Math.round(formValues.invoice_date_epoch.valueOf() / 1000);
      }
      if (formValues.due_date_epoch == null) {
        formValues.due_date_epoch = 0;
      } else {
        formValues.due_date_epoch = Math.round(formValues.due_date_epoch.valueOf() / 1000);
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async updateStatus(status: string) {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, { _id: this.id, status: status });
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      showNotification(this.snackBar, 'Invoice status updated successfully.', 'success');
      this.invoiceForm.get('status')?.setValue(status);
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async saveMoreInformation() {
    if (this.moreInformationForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.moreInformationForm.value;
      formValues._id = this.id;
      if (formValues.order_date_epoch == null) {
        formValues.order_date_epoch = 0;
      } else {
        formValues.order_date_epoch = Math.round(formValues.order_date_epoch.valueOf() / 1000);
      }
      if (formValues.ship_date_epoch == null) {
        formValues.ship_date_epoch = 0;
      } else {
        formValues.ship_date_epoch = Math.round(formValues.ship_date_epoch.valueOf() / 1000);
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async saveNote() {
    if (this.noteForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.noteForm.value;
      formValues.invoice_id = this.id;
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE_NOTE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.getOneInvoice();
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  deleteNotes(note: any) {
    swalWithBootstrapTwoButtons
      .fire({
        title: 'Are you sure you want to delete this note?',
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          this.uiSpinner.spin$.next(true);
          const requestObject = {
            invoice_id: this.id,
            _id: note._id,
          };
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_INVOICE_NOTE, requestObject);
          this.uiSpinner.spin$.next(false);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.notes.findIndex((x: any) => x._id === note._id);
            if (foundIndex != null) {
              this.notes.splice(foundIndex, 1);
            }
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  documentDocument(document: any) {
    window.location.href = document.pdf_url;
  }

  back() {
    this.router.navigate([WEB_ROUTES.INVOICE]);
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.INVOICE_HISTORY], { queryParams: { _id: this.id } });
  }

  sendMessage() {
    const dialogRef = this.dialog.open(SendInvoiceMessageComponent, {
      width: '28%',
      data: {},
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      //
    });
  }

  addmail() {
    const dialogRef = this.dialog.open(MailFormComponent, {
      width: '600px',
      height: '600px',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => { });
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

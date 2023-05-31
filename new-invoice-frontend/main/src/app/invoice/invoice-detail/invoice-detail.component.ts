import { Router } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { SendInvoiceMessageComponent } from './send-invoice-message/send-invoice-message.component';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { icon } from 'src/consts/icon';
import { MailFormComponent } from '../mail-form/mail-form.component';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { User } from 'src/app/users/user.model';

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
  step = 0;
  pdf_url = '/assets/pdf_url/file-3.pdf';
  loadInvoice = true;
  isLoading = true;
  maxDate = new Date();
  variablesUserList: any = [];
  userList: Array<User> = this.variablesUserList.slice();
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private commonService: CommonService,
  ) {
    super();
    this.invoiceForm = this.fb.group({
      document_type: [''],
      vendor_name: [''],
      invoice: [''],
      invoice_date: [''],
      due_date: [''],
      total_amount: [''],
      text_amount: [''],
      assign_to: [''],
      status: [''],
    });

    this.moreInformationForm = this.fb.group({
      vendor_id: [''],
      customer_id: [''],
      po_number: [''],

      job_number: [''],
      order_date: [''],
      ship_date: [''],

      packing_slip: [''],
      reciving_slip: [''],
      terms: [''],

      tax_id: [''],
      sub_total: [''],
      amount_due: [''],

      costcode: [''],
      gl_account: [''],

      notes: [''],
    });

  }
  async ngOnInit() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER);
    this.isLoading = false;
    if (data.status) {
      this.variablesUserList = data.data;
      this.userList = this.variablesUserList.slice();
    }
    this.isLoading = false;
  }


  back() {
    this.router.navigate([WEB_ROUTES.INVOICE]);
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

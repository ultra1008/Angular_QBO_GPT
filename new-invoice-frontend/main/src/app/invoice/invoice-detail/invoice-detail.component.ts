import { Router } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { SendInvoiceMessageComponent } from './send-invoice-message/send-invoice-message.component';
import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Icons } from 'angular-feather/lib/icons.provider';
import { DepartmentFormComponent } from 'src/app/settings/employeesettings/department-form/department-form.component';
import { icon } from 'src/consts/icon';
import { MailFormComponent } from '../mail-form/mail-form.component';

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
  pdf_url =
    'https://s3.wasabisys.com/r-988514/dailyreport/60c31f3dc5ba8494a2b1070f/60c31f3dc5ba8494a2b1070fdailyreport1630757615234.pdf';
  loadInvoice = true;
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
    public dialog: MatDialog
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
    dialogRef.afterClosed().subscribe((result) => {});
  }
}

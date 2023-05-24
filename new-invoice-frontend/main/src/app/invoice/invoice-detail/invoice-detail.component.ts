import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent {
  panelOpenState = false;
  invoiceForm: UntypedFormGroup;
  step = 0;
  pdf_url = 'https://s3.wasabisys.com/r-988514/dailyreport/60c31f3dc5ba8494a2b1070f/60c31f3dc5ba8494a2b1070fdailyreport1630757615234.pdf';
  loadInvoice: boolean = true;
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }
  constructor(private fb: UntypedFormBuilder,) {
    //constructor
    this.invoiceForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: ['', [Validators.required]],
      invoice: ['', [Validators.required]],
      invoice_date: ['', [Validators.required]],
      due_date: ['', [Validators.required]],
      totle_amount: ['', [Validators.required]],
      text_amount: ['', [Validators.required]],
      assign_to: ['', [Validators.required]],
      status: ['', [Validators.required]],

    });
  }


}

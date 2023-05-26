import { Injectable } from '@angular/core';
import { Invoice } from './invoice.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/invoiceTable.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<Invoice[]> = new BehaviorSubject<Invoice[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: Invoice;
  constructor (private httpClient: HttpClient) {
    super();
  }
  get data(): Invoice[] {
    return this.dataChange.value;
  }
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */
  getInvoiceTable(): void {
    this.subs.sink = this.httpClient
      .get<Invoice[]>(this.API_URL)
      .subscribe({
        next: (data) => {
          this.isTblLoading = false;
          this.dataChange.next(data);
        },
        error: (error: HttpErrorResponse) => {
          this.isTblLoading = false;
          console.log(error.name + ' ' + error.message);
        },
      });
  }

}
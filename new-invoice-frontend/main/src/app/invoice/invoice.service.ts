import { Injectable } from '@angular/core';
import { Invoice, InvoiceMessage } from './invoice.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject } from 'rxjs';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/invoiceTable.json';
  isTblLoading = true;
  isMessageTblLoading = true;
  dataChange: BehaviorSubject<Invoice[]> = new BehaviorSubject<Invoice[]>([]);
  messageDataChange: BehaviorSubject<InvoiceMessage[]> = new BehaviorSubject<
    InvoiceMessage[]
  >([]);
  // Temporarily stores data from dialogs
  dialogData!: Invoice;
  constructor (private httpClient: HttpClient, private httpCall: HttpCall) {
    super();
  }
  get data(): Invoice[] {
    return this.dataChange.value;
  }

  get messageData(): InvoiceMessage[] {
    return this.messageDataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  /** CRUD METHODS */
  async getInvoiceTable(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_FOR_TABLE, { is_delete: is_delete }).toPromise();
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  // Message Datatable API
  async getMessageForTable(): Promise<void> {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_MESSAGE_FOR_TABLE).toPromise();
    this.isMessageTblLoading = false;
    this.messageDataChange.next(data);
  }
}

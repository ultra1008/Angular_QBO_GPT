import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject } from 'rxjs';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { Vendor } from '../vendors/vendor-table.model';
import { ClientList } from './client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<Vendor[]> = new BehaviorSubject<Vendor[]>([]);

  dataClientChange: BehaviorSubject<ClientList[]> = new BehaviorSubject<
    ClientList[]
  >([]);
  // Temporarily stores data from dialogs
  dialogData!: Vendor;
  constructor(private httpCall: HttpCall) {
    super();
  }
  get data(): Vendor[] {
    return this.dataChange.value;
  }

  get dataClient(): ClientList[] {
    return this.dataClientChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  // Datatable API
  async getAllVendorTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_FOR_TABLE,
        { is_delete: is_delete }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data

    this.dataChange.next(data);
    this.isTblLoading = false;
  }

  async getAllClientTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.CLIENT_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data

    this.dataClientChange.next(data);
    this.isTblLoading = false;
  }

  async getOneClient(id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.CLIENT_GET_ONE, {
        _id: id,
      })
      .toPromise();
    return data;
  }

  async saveVendor(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_SAVE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async updateClientStatus(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.CLIENT_UPDATE_STATUS,
        requestObject
      )
      .toPromise();
    return data;
  }
  async updateAllclientStatus(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.CLIENT_UPDATE_ALL_STATUS,
        requestObject
      )
      .toPromise();
    return data;
  }

  async deleteClient(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.CLIENT_DELETE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async allDeleteClient(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.CLIENT_ALL_DELETE,
        requestObject
      )
      .toPromise();
    return data;
  }
  async getTerms() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET)
      .toPromise();
    return data;
  }

  async getcostcode() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_ALL_COSTCODE)
      .toPromise();
    return data;
  }

  async getApprover() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER)
      .toPromise();
    return data;
  }

  async getVendorHistory(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_HISTORY,
        requestObject
      )
      .toPromise();
    return data;
  }

  async sendVendorReport(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_REPORT,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveClient(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SAVE_CLIENT,
        requestObject
      )
      .toPromise();
    return data;
  }
}

import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject } from 'rxjs';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { Vendor } from '../vendors/vendor-table.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<Vendor[]> = new BehaviorSubject<Vendor[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: Vendor;
  constructor(private httpCall: HttpCall) {
    super();
  }
  get data(): Vendor[] {
    return this.dataChange.value;
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

  async getOneVendor(id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_ONE, {
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

  async updateVendorStatus(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_STATUS_UPDATE,
        requestObject
      )
      .toPromise();
    return data;
  }
  async updateAllVendorStatus(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_ALL_VENDOR_STATUS_UPDATE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async deleteVendor(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_DELETE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async allDeleteVendor(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_ALL_DELETE,
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

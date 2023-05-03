import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { DataTablesResponse } from './vendor-table.model';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
@Injectable()

export class VendorsService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<DataTablesResponse[]> = new BehaviorSubject<DataTablesResponse[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: DataTablesResponse;
  constructor (private httpClient: HttpClient, private httpCall: HttpCall) {
    super();
  }
  get data(): DataTablesResponse[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  async getAllVendorTables(is_delete: number): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_FOR_TABLE, { is_delete: is_delete }).toPromise();
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  async getOneVendor(id: string) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_ONE, { _id: id }).toPromise();
    return data;
  }

  async saveVendor(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_SAVE, requestObject).toPromise();
    return data;
  }

  async updateVendorStatus(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_STATUS_UPDATE, requestObject).toPromise();
    return data;
  }

  async deleteVendor(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_DELETE, requestObject).toPromise();
    return data;
  }

  async getTerms() {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET).toPromise();
    return data;
  }
}

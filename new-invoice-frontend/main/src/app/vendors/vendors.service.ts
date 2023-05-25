import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { Vendor } from './vendor.model';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
@Injectable()

export class VendorsService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<Vendor[]> = new BehaviorSubject<Vendor[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: Vendor;
  constructor (private httpCall: HttpCall) {
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
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_FOR_TABLE, { is_delete: is_delete }).toPromise();
    // Only write this for datatable api otherwise return data
    this.dataChange.next(data);
    this.isTblLoading = false;
  }
}

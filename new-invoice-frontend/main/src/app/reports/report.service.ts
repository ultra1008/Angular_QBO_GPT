import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { Report } from './reports-listing/reports-table.model';
import { BehaviorSubject } from 'rxjs';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';

@Injectable()
export class ReportService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;
  dataChange: BehaviorSubject<Report[]> = new BehaviorSubject<Report[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: Report;
  constructor(private httpCall: HttpCall) {
    super();
  }
  get data(): Report[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }


  async getReportTable() {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.INVOICE_FOR_REPORT).toPromise();
    return data;
  }

}

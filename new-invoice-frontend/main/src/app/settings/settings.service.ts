import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import { MailboxTable, Settings } from './settings.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class SettingsService extends UnsubscribeOnDestroyAdapter {
  // private readonly API_URL = 'assets/data/advanceTable.json';
  // dataChange: BehaviorSubject<Settings[]> = new BehaviorSubject<Settings[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: any;
  isTblLoading = true;
  dataChange: BehaviorSubject<MailboxTable[]> = new BehaviorSubject<
    MailboxTable[]
  >([]);

  constructor(private httpCall: HttpCall) {
    super();
  }
  get data(): MailboxTable[] {
    return this.dataChange.value;
  }
  async getCompanyType() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_TYPE)
      .toPromise();
    return data;
  }

  // Datatable API
  getDialogData() {
    return this.dialogData;
  }
  /** CRUD METHODS */

  async getAllMailboxTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.MAILBOX_DATA_TABLE, {
        is_delete: is_delete,
      })
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  async getCompanyNigp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_NIGP)
      .toPromise();
    return data;
  }

  async getCompanySize() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_SIZE)
      .toPromise();
    return data;
  }

  async getCompanyInfo() {
    const data = await this.httpCall
      .httpGetCall(httpversion.V1 + httproutes.GET_COMPNAY_INFO)
      .toPromise();
    return data;
  }

  async getCompanysmtp() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP)
      .toPromise();
    return data;
  }

  async VerifySmtp(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(httpversion.V1 + httproutes.VERIFY_SMTP, requestObject)
      .toPromise();
    return data;
  }

  async SaveSmtp(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(httpversion.V1 + httproutes.SAVE_SMTP, requestObject)
      .toPromise();
    return data;
  }

  async saveCompanyInfo(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.V1 + httproutes.SAVE_COMPNAY_INFO,
        requestObject
      )
      .toPromise();
    return data;
  }

  async AddMailbox(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.SAVE_MAILBOX,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getOneMailBox(id: string) {
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.GET_ONE_MAILBOX, {
        _id: id,
      })
      .toPromise();
    return data;
  }

  async deleteMailbox(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.DELETE_MAILBOX,
        requestObject
      )
      .toPromise();
    return data;
  }
}

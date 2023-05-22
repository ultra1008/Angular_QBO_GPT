import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { User } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class UserService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  dataChange: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: User;

  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): User[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  // Datatable API
  async getUserForTable(is_delete: number): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE,
        { is_delete: is_delete }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  async getUser(is_delete: number) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE,
        { is_delete: is_delete }
      )
      .toPromise();
    return data;
  }

  async getOneUser(id: string) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.GET_ONE_USER,
        { _id: id }
      )
      .toPromise();
    return data;
  }

  async deleteUser(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.USER_DELETE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async allArchiveUser(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_ALL_DELETE,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getRole() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL)
      .toPromise();
    return data;
  }

  async getManeger() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER)
      .toPromise();
    return data;
  }
  async getSupervisor() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER)
      .toPromise();
    return data;
  }

  async getLocation() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_LOCATION)
      .toPromise();
    return data;
  }
  async getJobTitle() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_JOB_TITLE)
      .toPromise();
    return data;
  }

  async getAlljobtype() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_JOB_TYPE)
      .toPromise();
    return data;
  }

  async getLanguage() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_LANGUAGE)
      .toPromise();
    return data;
  }

  async getDepartment() {
    const data = await this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_DEPARTMENT)
      .toPromise();
    return data;
  }

  async restoreUser(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.USER_RECOVER,
        requestObject
      )
      .toPromise();
    return data;
  }

  async getUserHistory(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.USER_HISTORY,
        requestObject
      )
      .toPromise();
    return data;
  }

  async sendUserReport(requestObject: any) {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.USER_REPORT,
        requestObject
      )
      .toPromise();
    return data;
  }

  async saveUsers(requestObject: any) {
    console.log('requestObject', requestObject);
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    const data = await this.httpCall
      .httpPostCall(httpversion.PORTAL_V1 + httproutes.SAVE_USER, requestObject)
      .toPromise();
    return data;
  }

  async saveUserPersonalInfo(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SAVE_USER_PERSONAL_INFO, requestObject).toPromise();
    return data;
  }

  async saveUserContactInfo(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SAVE_USER_CONTACT_INFO, requestObject).toPromise();
    return data;
  }

  async saveUserInfo(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SAVE_USER_INFO, requestObject).toPromise();
    return data;
  }

  async saveUserMobilePicInfo(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.SAVE_USER_MOBILE_PIC, requestObject).toPromise();
    return data;
  }

  async updateAllUserStatus(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_ALL_USER_STATUS_CHANGE, requestObject).toPromise();
    return data;
  }

  async updateStatus(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_USER_STATUS_UPDATE, requestObject).toPromise();
    return data;
  }

  addAdvanceTable(User: User): void {
    this.dialogData = User;
    // this.httpClient.post(this.API_URL, advanceTable)
    //   .subscribe({
    //     next: (data) => {
    //       this.dialogData = advanceTable;
    //     },
    //     error: (error: HttpErrorResponse) => {
    //        // error code here
    //     },
    //   });
  }
}

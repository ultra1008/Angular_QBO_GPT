import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { AdvanceTable, User } from './user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UserService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  dataChange: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: User;

  constructor(private httpCall: HttpCall) {
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
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE, { is_delete: is_delete }).toPromise();
    // Only write this for datatable api otherwise return data
    this.isTblLoading = false;
    this.dataChange.next(data);
  }

  async getUser(is_delete: number) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE, { is_delete: is_delete }).toPromise();
    return data;
  }

  async deleteUser(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.USER_DELETE, requestObject).toPromise();
    return data;
  }
  async getRole() {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL).toPromise();
    return data;
  }
  async restoreUser(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.USER_RECOVER, requestObject).toPromise();
    return data;
  }

  async getUserHistory(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.USER_HISTORY, requestObject).toPromise();
    return data;
  }
  async sendUserReport(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.USER_REPORT, requestObject).toPromise();
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
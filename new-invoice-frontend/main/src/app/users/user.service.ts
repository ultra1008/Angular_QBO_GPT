import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { User } from './user.model';
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

}

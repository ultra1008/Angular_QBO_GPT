import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { EmergencyContact, User } from './user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UserService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  isEmergencyTblLoading = true;
  dataChange: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  emergencyDataChange: BehaviorSubject<EmergencyContact[]> = new BehaviorSubject<EmergencyContact[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: User;

  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): User[] {
    return this.dataChange.value;
  }

  get emergencyData(): EmergencyContact[] {
    return this.emergencyDataChange.value;
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

  // Emergency Contact Datatable API
  async getEmergencyContactForTable(id: string): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.GET_EMERGENCY_CONTACT,
        { _id: id }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isEmergencyTblLoading = false;
    this.emergencyDataChange.next(data);
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

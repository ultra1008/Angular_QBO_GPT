import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
} from '@angular/forms';
import { AdvanceTable, User } from '../user.model';
import { UserService } from '../user.service';
import {
  showNotification,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { WEB_ROUTES } from 'src/consts/routes';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';

export interface DialogData {
  user: any;
  id: number;
  action: string;
  advanceTable: AdvanceTable;
}

@Component({
  selector: 'app-user-restore-form',
  templateUrl: './user-restore-form.component.html',
  styleUrls: ['./user-restore-form.component.scss'],
})
export class UserRestoreFormComponent {
  action: string;
  dialogTitle: string;
  userRoleInfo: UntypedFormGroup;
  advanceTable: AdvanceTable;
  selection = new SelectionModel<User>(true, []);
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  constructor (
    public dialogRef: MatDialogRef<UserRestoreFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public UserService: UserService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private router: Router, private commonService: CommonService,
  ) {
    console.log('constroctor User', data);

    this.getRole();
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.advanceTable.fName + ' ' + data.advanceTable.lName;
      this.advanceTable = data.advanceTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as AdvanceTable;
      this.advanceTable = new AdvanceTable(blankObject);
    }
    this.userRoleInfo = this.createContactForm();
  }
  formControl = new UntypedFormControl('', [
    Validators.required, // Validators.email,
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
        ? 'Not a valid email'
        : '';
  }
  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      userroleId: ['', [Validators.required]],
      userstatus: ['', [Validators.required]],
    });
  }
  submit() {
    // emppty stuff
  }
  async getRole() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL);
    if (data.status) {
      this.variablesRoleList = data.data;
      this.roleList = this.variablesRoleList.slice();
    }
  }
  // async archiveRecover(user: User, is_delete: number) {
  //   const data = await this.advanceTableService.deleteUser({ _id: user, is_delete: is_delete });
  //   if (data.status) {
  //     showNotification(this.snackBar, data.message, 'success');

  //   } else {
  //     showNotification(this.snackBar, data.message, 'error');
  //   }
  // }
  async restoreUser(userId: any) {
    const requestObject = this.userRoleInfo.value;
    requestObject._id = userId;
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.USER_RECOVER, requestObject);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      location.reload();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  // gotoArchiveUnarchive() {
  //   this.isDelete = this.isDelete == 1 ? 0 : 1;
  //   this.getUser();

  // }
  async getUser() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE, { is_delete: this.isDelete });
    this.userList = data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    this.UserService.addAdvanceTable(this.userRoleInfo.getRawValue());
  }
}

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormGroup,
  FormControl,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { DepartmentFormComponent } from 'src/app/settings/employeesettings/department-form/department-form.component';
import { AdvanceTable, User } from 'src/app/users/user.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-mail-form',
  templateUrl: './mail-form.component.html',
  styleUrls: ['./mail-form.component.scss'],
})
export class MailFormComponent {
  action: string;
  dialogTitle: string;
  DepartmentInfo!: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];
  invoice_logo = icon.INVOICE_LOGO;

  roleList: any = this.variablesRoleList.slice();
  titleMessage: string = '';
  variablesUserList: any = [];
  userList: Array<User> = this.variablesUserList.slice();
  isDelete = 0;

  removable = true;
  addOnBlur = true;
  selectedUsers: Array<string> = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(
    public dialogRef: MatDialogRef<MailFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    public uiSpinner: UiSpinnerService,
    public commonService: CommonService
  ) {
    this.getUser();
    this.DepartmentInfo = new FormGroup({
      subject: new FormControl('', [Validators.required]),
      drop_to: new FormControl('', [Validators.required]),
      drop_copy: new FormControl('', [Validators.required]),

    });
    console.log('data', data);
    const document_data = data.data;

    if (this.data) {
      console.log('call');
      this.DepartmentInfo = new FormGroup({
        department_name: new FormControl(this.data.department_name, [
          Validators.required,
        ]),
      });
    }




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
  }
  formControl = new UntypedFormControl('', [
    Validators.required, // Validators.email,
  ]);

  async getUser() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.GET_ALL_USER
    );
    if (data.status) {
      this.variablesUserList = data.data;
      this.userList = this.variablesUserList.slice();
    }
  }
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
        ? 'Not a valid email'
        : '';
  }

  onUserChange(event: any) {
    this.selectedUsers = event.value;
  }

  onUserCopyChange(event: any) {
    this.selectedUsers = event.value;
  }
  removeUseremail(user: string) {
    var index = this.selectedUsers.indexOf(user);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
    }
  }

  async submit() {
    // if (this.DepartmentInfo.valid) {
    //   let requestObject = this.DepartmentInfo.value;
    //   if (this.data) {
    //     requestObject._id = this.data._id;
    //   }
    //   this.uiSpinner.spin$.next(true);
    //   const data = await this.SettingsServices.saveDepartment(requestObject);
    //   if (data.status) {
    //     this.uiSpinner.spin$.next(false);
    //     showNotification(this.snackBar, data.message, 'success');
    //     location.reload();
    //   } else {
    //     this.uiSpinner.spin$.next(false);
    //     showNotification(this.snackBar, data.message, 'error');
    //   }
    // }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    // this.advanceTableService.addAdvanceTable(this.DepartmentInfo.getRawValue());
  }
}


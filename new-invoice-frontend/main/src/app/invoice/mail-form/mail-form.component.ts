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
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-mail-form',
  templateUrl: './mail-form.component.html',
  styleUrls: ['./mail-form.component.scss'],
})
export class MailFormComponent {
  action: string;
  dialogTitle: string;
  mailInfo!: any;
  advanceTable: AdvanceTable;
  invoice_logo = icon.INVOICE_LOGO;


  titleMessage: string = '';
  variablesUserList: any = [];
  userList: Array<User> = this.variablesUserList.slice();
  variablesUserToList: any = [];
  usertoList: Array<User> = this.variablesUserToList.slice();
  isDelete = 0;
  SmtpEmail: any;
  removable = true;
  addOnBlur = true;
  selectedUsers: Array<string> = [];
  selectedToUsers: Array<string> = [];

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
    this.mailInfo = this.fb.group({
      to: [[], [Validators.required]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
      cc: [[], [Validators.required]],
    });
    this.mailInfo.get("message")!.setValue(`
    
-----------------------------------------------------------------------------\n
Please Note: Reply To Mailto:Info@Rovuk.Us\n
Company Name\n
Vendor:Vendor Name\n
Invoice Number: 7846002546556552\n
Total Amount: $12,000`);

    this.getUser();
    this.getSmtpEmail();
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

      this.variablesUserToList = data.data;
      this.usertoList = this.variablesUserToList.slice();
    }
    const user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.mailInfo.get("cc")!.setValue([user_data.UserData.useremail]);
    this.selectedUsers.push(user_data.UserData.useremail);
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

  onUsertoChange(event: any) {
    this.selectedToUsers = event.value;
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

  removeUserTOemail(user: string) {
    var index = this.selectedToUsers.indexOf(user);
    if (index !== -1) {
      this.selectedToUsers.splice(index, 1);
    }
  }

  async getSmtpEmail() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP
    );
    if (data.status) {
      this.SmtpEmail = data.data.tenant_smtp_username;
    }

  }

  async submit() {
    if (this.mailInfo.valid) {
      let requestObject = this.mailInfo.value;
      requestObject.pdf_url = 'https://www.orimi.com/pdf-test.pdf';
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SEND_INVOICE_EMAIL, requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        location.reload();
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    // this.advanceTableService.addAdvanceTable(this.mailInfo.getRawValue());
  }
}


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { checkPermissionAfterLogin, showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { AuthService } from 'src/app/core/service/auth.service';
import { AuthenticationService } from '../authentication.service';
import { WEB_ROUTES } from 'src/consts/routes';
@Component({
  selector: 'app-send-otp',
  templateUrl: './send-otp.component.html',
  styleUrls: ['./send-otp.component.scss']
})
export class SendOtpComponent {
  authForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  companyCode = '';
  sentOTP = false;
  otp = "";
  otpTimer: any;
  otpConfig: any = {
    length: 6,
    allowNumbersOnly: false,
    letterCase: 'Upper'
  };
  companyList: any = [];
  useremail = '';
  showCompanyList = false;
  removable = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE) ?? '';
    this.authForm = this.formBuilder.group({
      useremail: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
    });
  }
  get f() {
    return this.authForm.controls;
  }
  onOtpChange(event: any) {
    this.otp = event;
  }

  async sendOTP() {
    let that = this;
    if (that.authForm.valid) {
      const reqObject = this.authForm.value;
      reqObject.companycode = this.companyCode;
      const data = await this.authenticationService.sendOTP(reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.sentOTP = true;
        // for delete we use splice in order to remove single object from DataService 
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async submitOTP() {
    let that = this;
    if (that.authForm.valid) {
      const reqObject = this.authForm.value;
      reqObject.companycode = this.companyCode;
      reqObject.otp = this.otp;

      const data = await this.authenticationService.submitOTP(reqObject);
      if (data.status) {
        if (data.data.length === 0) {
          showNotification(this.snackBar, 'You are not associated with any company. Kindly contact superadmin.', 'error');
        } else if (data.data.length === 1) {
          // only one compant so direct login
          showNotification(this.snackBar, data.message, 'success');
          if (data.user_data.UserData.useris_password_temp == true) {
            this.router.navigate([WEB_ROUTES.CHANGE_PASSWORD]);
          } else {
            setTimeout(() => {
              this.router.navigate([checkPermissionAfterLogin(data.user_data.role_permission)]);
            }, 300);
          }
          localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.user_data.token);
          localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.user_data));
          localStorage.setItem(localstorageconstants.COMPANYID, data.user_data.companydata._id);
          localStorage.setItem(localstorageconstants.LOGOUT, 'false');

          sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
          localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
        } else {
          this.useremail = reqObject.useremail;
          this.companyList = data.data;
          this.showCompanyList = true;
        }
        // for delete we use splice in order to remove single object from DataService
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async selectCompany(company: any) {
    const formValues = this.authForm.value;
    formValues._id = company._id;

    const data = await this.authenticationService.loginwithOTP(formValues);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      if (data.user_data.UserData.useris_password_temp == true) {
        this.router.navigate([WEB_ROUTES.CHANGE_PASSWORD]);
      } else {
        setTimeout(() => {
          this.router.navigate([WEB_ROUTES.DASHBOARD]);
        }, 300);
      }
      localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.user_data.token);
      localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.user_data));
      localStorage.setItem(localstorageconstants.COMPANYID, data.user_data.companydata._id);
      localStorage.setItem(localstorageconstants.LOGOUT, 'false');

      sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  removeUseremail() {
    this.router.navigate([WEB_ROUTES.LOGIN]);
  }

  openLogin() {
    this.router.navigate([WEB_ROUTES.LOGIN]);
  }
}

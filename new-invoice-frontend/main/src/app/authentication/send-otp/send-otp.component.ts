import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { AuthService } from 'src/app/core/service/auth.service';
import { AuthenticationService } from '../authentication.service';
@Component({
  selector: 'app-send-otp',
  templateUrl: './send-otp.component.html',
  styleUrls: ['./send-otp.component.scss']
})
export class SendOtpComponent {
  authForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  companyCode: string = '';
  sentOTP: boolean = false;
  otp: string = "";
  otpTimer: any;
  otpConfig: any = {
    length: 6,
    allowNumbersOnly: false,
    letterCase: 'Upper'
  };

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
    console.log("call");
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
    console.log("call");
    let that = this;
    if (that.authForm.valid) {
      const reqObject = this.authForm.value;
      reqObject.companycode = this.companyCode;
      reqObject.otp = this.otp;

      const data = await this.authenticationService.submitOTP(reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.data.token);
        localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));
        localStorage.setItem(localstorageconstants.SUPPLIERID, data.data.companydata._id);
        localStorage.setItem(localstorageconstants.LOGOUT, 'false');

        sessionStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
        localStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
        this.router.navigate(['/dashboard/main']);
        // for delete we use splice in order to remove single object from DataService

      } else {
        showNotification(this.snackBar, data.message, 'error');
      }

    }
  }
  // onSubmit() {
  //   this.submitted = true;
  //   // stop here if form is invalid
  //   if (this.authForm.invalid) {
  //     return;
  //   } else {
  //     this.router.navigate(['/dashboard/main']);
  //   }
  // }
}

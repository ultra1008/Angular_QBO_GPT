import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { AuthService } from 'src/app/core/service/auth.service';
import { AuthenticationService } from '../authentication.service';
import { WEB_ROUTES } from 'src/consts/routes';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  companyCode = '';
  useremail = '';
  showForm = true;
  companyList: any = [];
  removable = true;

  constructor (
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

  async forgotPasswordPress() {
    let that = this;
    if (that.authForm.valid) {
      const formValues = this.authForm.value;
      const data = await this.authenticationService.emailForgotPassword(formValues);
      if (data.status) {
        if (data.data.length == 1) {
          showNotification(this.snackBar, data.message, 'success');
          this.router.navigate([WEB_ROUTES.LOGIN]);
        } else {
          this.useremail = formValues.useremail;
          this.companyList = data.data;
          this.showForm = false;
        }
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async selectCompany(company: any) {
    const formValues = this.authForm.value;
    formValues._id = company._id;
    const data = await this.authenticationService.sendEmailForgotPassword(formValues);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.router.navigate([WEB_ROUTES.LOGIN]);
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  removeUseremail() {
    this.useremail = '';
    this.showForm = true;
    this.authForm.reset();
  }

  openLogin() {
    this.router.navigate([WEB_ROUTES.LOGIN]);
  }
}

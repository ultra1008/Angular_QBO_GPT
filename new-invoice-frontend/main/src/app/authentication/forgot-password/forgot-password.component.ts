import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { AuthService } from 'src/app/core/service/auth.service';
import { AuthenticationService } from '../authentication.service';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  companyCode: string = '';

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

  async forgotPasswordPress() {
    console.log("call");
    let that = this;
    if (that.authForm.valid) {
      const reqObject = this.authForm.value;
      reqObject.companycode = this.companyCode;
      const data = await this.authenticationService.forgotPasswordPress(reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate(['/authentication/signin']);
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

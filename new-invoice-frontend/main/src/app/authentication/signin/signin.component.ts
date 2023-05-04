import { AuthService } from 'src/app/core/service/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { showNotification } from 'src/consts/utils';
import { localstorageconstants } from 'src/consts/localstorageconstants';
export interface ChipColor {
  name: string;
  color: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  returnUrl!: string;
  error = '';
  hide = true;
  removable = true;
  showLogin = false;
  companyCode = '';
  checked = false;

  availableColors: ChipColor[] = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' },
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private AuthenticationService: AuthenticationService,
    private snackBar: MatSnackBar
  ) { }
  ngOnInit() {
    // this.c_code = localStorage.getItem(localstorageconstants.COMPANYCODE);
    this.authForm = this.formBuilder.group({
      useremail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      companycode: ['', Validators.required],
      terms: ['', Validators.required],
    });

    // this.AuthenticationService.userLogin(reqObject).subscribe(function (data) {
    //   if (data.status) {
    //     localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.data.token);
    //     localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));
    //     localStorage.setItem(localstorageconstants.SUPPLIERID, data.data.companydata._id);
    //     localStorage.setItem(localstorageconstants.LOGOUT, 'false');

    //     sessionStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
    //     localStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
    //   }
    // });
  }
  get f() {
    return this.authForm.controls;
  }
  showLoginForm() {
    this.getCompunySettings();

  }
  public removacode() {
    this.companyCode = '';
    this.showLogin = false;
    this.authForm.reset();
  }
  langurl() {

    window.open('https://www.rovuk.us/mobile-terms-of-service-2', '_blank');
  }
  public onSaveUsernameChanged(value: boolean) {
    this.checked = value;
  }

  async getCompunySettings() {
    const formValues = this.authForm.value;
    this.companyCode = 'R-' + formValues.companycode;
    const data = await this.AuthenticationService.getCompunySettings(this.companyCode);
    if (data.status) {
      this.showLogin = true;
    }
  }
  async userLogin() {
    if (!this.checked) {
      showNotification(this.snackBar, 'Please agree terms & conditions before proceed.', 'error');
      return;
    }
    const formValues = this.authForm.value;
    formValues.companycode = 'R-' + formValues.companycode;

    const data = await this.AuthenticationService.userLogin(formValues);
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

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Username and Password not valid !';
      return;
    } else {
      this.authService
        .login(this.f['username'].value, this.f['password'].value)
        .subscribe({
          next: (res) => {
            if (res) {
              if (res) {
                const token = this.authService.currentUserValue.token;
                if (token) {
                  this.router.navigate(['/dashboard/main']);
                }
              } else {
                this.error = 'Invalid Login';
              }
            } else {
              this.error = 'Invalid Login';
            }
          },
          error: (error) => {
            this.error = error;
            this.submitted = false;
            this.loading = false;
          },
        });
    }
  }
}

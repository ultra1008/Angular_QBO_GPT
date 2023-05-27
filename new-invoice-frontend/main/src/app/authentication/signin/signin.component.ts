import { AuthService } from 'src/app/core/service/auth.service';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { showNotification } from 'src/consts/utils';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { Theme } from '@fullcalendar/core/internal';
import { DOCUMENT } from '@angular/common';
import { InConfiguration } from 'src/app/core/models/config.interface';
import { WEB_ROUTES } from 'src/consts/routes';
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
  showLogin = true;
  companyCode!: string;
  useremail!: string;
  checked = false;

  availableColors: ChipColor[] = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' },
  ];
  showForm = false;
  companyList: any = [];

  constructor (
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private AuthenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    //localStorage.setItem(localstorageconstants.DARKMODE, 'dark');
    setTimeout(() => {
      this.showForm = true;
    }, 100);
  }
  ngOnInit() {

    this.authForm = this.formBuilder.group({
      useremail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // companycode: ['', Validators.required],
      terms: ['', Validators.required],
    });

    this.companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE)!;
    if (this.companyCode != null) {
      const removeFirst2 = this.companyCode.slice(2);
      this.showLogin = true;
      this.authForm = this.formBuilder.group({
        useremail: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        // companycode: [removeFirst2, Validators.required],
        terms: ['', Validators.required],
      });
    }
    this.lightThemeBtnClick();

    // if (
    //   window.matchMedia &&
    //   window.matchMedia('(prefers-color-scheme: dark)').matches
    // ) {
    //   // dark mode
    //   this.darkThemeBtnClick();
    // } else {
    //   //Light mode
    //   this.lightThemeBtnClick();
    // }
  }
  get f() {
    return this.authForm.controls;
  }
  showLoginForm() {
    this.getCompanySettings();
  }
  goResetPasswordForm() {
    this.router.navigate(['/authentication/forgot-password']);
  }
  goSendOtpForm() {
    this.router.navigate(['/authentication/send-otp']);
  }
  public removeCompanyCode() {
    this.companyCode = '';
    this.showLogin = false;
    localStorage.removeItem(localstorageconstants.COMPANYCODE);
    this.authForm.reset();
  }
  langurl() {
    window.open('https://www.rovuk.us/mobile-terms-of-service-2', '_blank');
  }
  public onSaveUsernameChanged(value: boolean) {
    this.checked = value;
  }

  async getCompanySettings() {
    const formValues = this.authForm.value;
    // this.companyCode = 'R-' + formValues.companycode;
    const data = await this.AuthenticationService.getCompanySettings(
      this.companyCode
    );
    if (data.status) {
      this.showLogin = true;
      localStorage.setItem(localstorageconstants.COMPANYCODE, this.companyCode);
    }
  }
  async userLogin() {
    if (!this.checked) {
      showNotification(this.snackBar, 'Please agree terms & conditions before proceed.', 'error');
      return;
    }
    const formValues = this.authForm.value;
    // formValues.companycode = 'R-' + formValues.companycode;

    const data = await this.AuthenticationService.checkUserCompany(formValues);
    if (data.status) {
      if (data.data.length === 0) {
        showNotification(this.snackBar, 'Invalid email or password!', 'error');
      } else if (data.data.length === 1) {
        // only one compant so direct login
        showNotification(this.snackBar, data.message, 'success');
        if (data.user_data.UserData.useris_password_temp == true) {
          this.router.navigate([WEB_ROUTES.CHANGE_PASSWORD]);
        } else {
          setTimeout(() => {
            localStorage.setItem(localstorageconstants.LOGOUT, 'false');
            this.router.navigate([WEB_ROUTES.DASHBOARD]);
          }, 300);
        }
        localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.user_data.token);
        localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.user_data));
        localStorage.setItem(localstorageconstants.COMPANYID, data.user_data.companydata._id);

        sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
        localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      } else {
        this.useremail = formValues.useremail;
        this.companyList = data.data;
        this.showLogin = false;
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  lightThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'dark');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(this.document.body, localStorage.getItem('choose_skin') as string);
    } else {
      this.renderer.removeClass(this.document.body, 'theme-dark');
    }

    this.renderer.addClass(this.document.body, 'light');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'theme-white');
    const theme = 'light';
    const menuOption = 'menu_light';
    // this.selectedBgColor = 'white';
    // this.isDarkSidebar = false;
    localStorage.setItem('choose_logoheader', 'logo-white');
    localStorage.setItem('choose_skin', 'theme-white');
    localStorage.setItem(localstorageconstants.DARKMODE, theme);
    localStorage.setItem('menuOption', menuOption);
  }

  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(this.document.body, localStorage.getItem('choose_skin') as string);
    } else {
      this.renderer.removeClass(this.document.body, 'theme-light');
    }
    this.renderer.addClass(this.document.body, 'dark');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'theme-black');
    const theme = 'dark';
    const menuOption = 'menu_dark';
    // this.selectedBgColor = 'black';
    // this.isDarkSidebar = true;
    localStorage.setItem('choose_logoheader', 'logo-black');
    localStorage.setItem('choose_skin', 'theme-black');
    localStorage.setItem(localstorageconstants.DARKMODE, theme);
    localStorage.setItem('menuOption', menuOption);
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
                  this.router.navigate([WEB_ROUTES.DASHBOARD]);
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

  removeUseremail() {
    this.useremail = '';
    this.showLogin = true;
    this.authForm.reset();
  }

  async selectCompany(company: any) {
    const formValues = this.authForm.value;
    formValues.companycode = company.companycode;

    const data = await this.AuthenticationService.userLogin(formValues);
    if (data.status) {

      showNotification(this.snackBar, data.message, 'success');
      if (data.data.UserData.useris_password_temp == true) {
        this.router.navigate([WEB_ROUTES.CHANGE_PASSWORD]);
      } else {
        localStorage.setItem(localstorageconstants.LOGOUT, 'false');
        setTimeout(() => {
          this.router.navigate([WEB_ROUTES.DASHBOARD]);
        }, 300);
      }
      localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.data.token);
      localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));
      localStorage.setItem(localstorageconstants.COMPANYID, data.data.companydata._id);


      sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }
}

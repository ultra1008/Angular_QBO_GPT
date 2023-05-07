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
  public config!: InConfiguration;
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
  showForm = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private AuthenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    localStorage.setItem(localstorageconstants.THEME, 'dark');
    setTimeout(() => {
      this.showForm = true;
    }, 100);
  }
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
  goResetPasswordForm() {
    this.router.navigate(['/authentication/forgot-password']);
  }
  goSendOtpForm() {
    this.router.navigate(['/authentication/send-otp']);
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
    const data = await this.AuthenticationService.getCompunySettings(
      this.companyCode
    );
    if (data.status) {
      this.showLogin = true;
    }
  }
  async userLogin() {
    if (!this.checked) {
      showNotification(
        this.snackBar,
        'Please agree terms & conditions before proceed.',
        'error'
      );
      return;
    }
    const formValues = this.authForm.value;
    formValues.companycode = 'R-' + formValues.companycode;

    const data = await this.AuthenticationService.userLogin(formValues);
    if (data.status) {
      console.log('data', data);
      showNotification(this.snackBar, data.message, 'success');

      if (data.data.UserData.useris_password_temp == true) {
        this.router.navigate([WEB_ROUTES.CHANGE_PASSWORD]);
      } else {
        setTimeout(() => {
          this.router.navigate(['/dashboard/main']);
        }, 1300);
      }
      localStorage.setItem(
        localstorageconstants.INVOICE_TOKEN,
        data.data.token
      );
      localStorage.setItem(
        localstorageconstants.USERDATA,
        JSON.stringify(data.data)
      );
      localStorage.setItem(
        localstorageconstants.COMPANYID,
        data.data.companydata._id
      );
      localStorage.setItem(localstorageconstants.LOGOUT, 'false');

      sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');

      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        this.darkThemeBtnClick();
        // dark mode
        console.log('dark mode');
      } else {
        //Light mode
        this.lightThemeBtnClick();
        console.log('Light mode');
      }

      // for delete we use splice in order to remove single object from DataService
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
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin') as string
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
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
    localStorage.setItem('theme', theme);
    localStorage.setItem('menuOption', menuOption);
  }
  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin') as string
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
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
    localStorage.setItem('theme', theme);
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

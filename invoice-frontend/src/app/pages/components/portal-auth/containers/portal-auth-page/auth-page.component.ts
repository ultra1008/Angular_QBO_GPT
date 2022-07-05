import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PortalAuthService } from '../../services';
import { httproutes, localstorageconstants, routes } from '../../../../../consts';
import { TranslateService } from '@ngx-translate/core';
import { Snackbarservice } from '../../../../../service/snack-bar-service';
import { configdata } from 'src/environments/configData';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements OnInit {
  public todayDate: Date = new Date();
  public routers: typeof routes = routes;

  public c_code: any = "";
  public form: any;
  public forgotpassword_form: any;
  public showCompanyCode: Boolean = true;
  public showLogin: Boolean = false;
  public showForgotPassword: Boolean = false;
  removable = true;
  public roles: any = configdata.superAdminRole;
  Auth_Page_Reset_Successfully: string = "";

  constructor(public httpCall: HttpCall, private service: PortalAuthService, private router: Router, public uiSpinner: UiSpinnerService,
    public translate: TranslateService, public authservice: PortalAuthService, public snackbarservice: Snackbarservice) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Auth_Page_Reset_Successfully = this.translate.instant('Auth_Page_Reset_Successfully');
    });
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(locallanguage);
    if (localStorage.getItem(localstorageconstants.COMPANYCODE)) {
      this.showCompanyCode = false;
      this.showLogin = true;
      this.showForgotPassword = false;
      this.c_code = localStorage.getItem(localstorageconstants.COMPANYCODE);
    }

  }

  public ngOnInit(): void {
    this.form = new FormGroup({
      companycode: new FormControl("", [Validators.required])
    });

    this.forgotpassword_form = new FormGroup({
      useremail: new FormControl("", [Validators.required, Validators.email]),
      userole: new FormControl(1, [Validators.required])
    });
  }

  public sendSignForm(): void {
    this.service.sign();
    this.router.navigate([this.routers.DASHBOARD]).then();
  }

  public savecompnaycode(): void {
    if (this.form.valid) {
      localStorage.setItem(localstorageconstants.COMPANYCODE, "R-" + this.form.value.companycode);
      this.showCompanyCode = false;
      this.showLogin = true;
      this.showForgotPassword = false;
      this.c_code = localStorage.getItem(localstorageconstants.COMPANYCODE);
    }
  }
  public removacode() {
    localStorage.removeItem(localstorageconstants.COMPANYCODE);
    this.showCompanyCode = true;
    this.showLogin = false;
    this.showForgotPassword = false;
  }

  public forgotPasswordPress(): void {
    if (this.forgotpassword_form.valid) {
      let reqObject = {
        useremail: this.forgotpassword_form.value.useremail,
        companycode: localStorage.getItem(localstorageconstants.COMPANYCODE)
      };
      const that = this;
      that.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCallWithoutToken(httproutes.USER_FORGET_PASSWORD, reqObject).subscribe((params) => {
        if (params.status) {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, 'success');
          that.showCompanyCode = false;
          that.showLogin = true;
          that.showForgotPassword = false;
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, 'error');
        }
      });
    }
  }

  public openForgotPasswordPress(): void {
    this.showCompanyCode = false;
    this.showLogin = false;
    this.showForgotPassword = true;
  }

  public resetForgotPasswordPress(): void {
    this.showCompanyCode = false;
    this.showLogin = true;
    this.showForgotPassword = false;
  }
}

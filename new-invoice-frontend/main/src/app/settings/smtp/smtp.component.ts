import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { swalWithBootstrapButtons, showNotification } from 'src/consts/utils';
import { configData } from 'src/environments/configData';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-smtp',
  templateUrl: './smtp.component.html',
  styleUrls: ['./smtp.component.scss'],
})
export class SmtpComponent {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  companyinfoForm!: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  id: any;
  LTS_ACTIVE: any = configData.LTS_ACTIVE;
  frequency = configData.MAILBOX_MONITOR_TIME;
  cronTime: any;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public route: ActivatedRoute,
    private sanitiser: DomSanitizer,
    public httpCall: HttpCall,
    // public commonService: CommonService,
    public SettingsServices: SettingsService
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';

    this.getCompanySmtp();

    this.companyinfoForm = this.fb.group({
      tenant_smtp_server: ['', Validators.required],
      tenant_smtp_username: ['', Validators.required],
      tenant_smtp_port: ['', Validators.required],
      tenant_smtp_timeout: ['', Validators.required],
      tenant_smtp_password: ['', Validators.required],
      tenant_smtp_security: ['', Validators.required],
      tenant_smtp_reply_to_mail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  async getCompanySmtp() {
    const data = await this.SettingsServices.getCompanysmtp();
    console.log('data', data);

    if (data.status) {
      let stmp = data.data;
      console.log('data', stmp);
      this.companyinfoForm = this.fb.group({
        tenant_smtp_server: [stmp.tenant_smtp_server, Validators.required],
        tenant_smtp_username: [stmp.tenant_smtp_username, Validators.required],
        tenant_smtp_port: [stmp.tenant_smtp_port, Validators.required],
        tenant_smtp_timeout: [stmp.tenant_smtp_timeout, Validators.required],
        tenant_smtp_password: [stmp.tenant_smtp_password, Validators.required],
        tenant_smtp_security: [stmp.tenant_smtp_security, Validators.required],
        tenant_smtp_reply_to_mail: [
          stmp.tenant_smtp_reply_to_mail,
          [Validators.required, Validators.email],
        ],
      });
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title:
          'Are you sure you want to close this window without saving changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save And Exit',
        cancelButtonText: 'Dont Save',
        denyButtonText: 'Cancel',
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Move to the vendor listing
          if (this.companyinfoForm.valid) {
            this.saveVendor();
          } else {
            // alert form invalidation
            showNotification(
              this.snackBar,
              'Please complete the vendor form before submitting.',
              'error'
            );
          }
        } else if (result.isDenied) {
          // ;
        } else {
          setTimeout(() => {
            this.router.navigate(['/settings/mailbox']);
          }, 100);
        }
      });
  }

  async saveVendor() {
    let that = this;
    if (this.companyinfoForm.valid) {
      let requestObject = this.companyinfoForm.value;
      requestObject.cron_time = this.cronTime;
      if (this.id) {
        requestObject._id = this.id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.AddMailbox(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate(['/settings/mailbox']);
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }

      // this.httpCall
      //   .httpPostCall(httproutes.COMPNAY_INFO_OTHER_SETTING_UPDATE, formData)
      //   .subscribe(function (params) {
      //     that.uiSpinner.spin$.next(false);
      //     if (params.status) {
      //       that.snackbarservice.openSnackBar(params.message, "success");
      //       that.httpCall
      //         .httpGetCall(httproutes.COMPNAY_INFO_OTHER_SETTING_GET)
      //         .subscribe(function (compnayData: any) {
      //           if (compnayData.status) {
      //             userData.companydata = compnayData.data;
      //             localStorage.setItem(
      //               localstorageconstants.USERDATA,
      //               JSON.stringify(userData)
      //             );
      //             that.mostusedservice.userupdatecompnayEmit();
      //           }
      //         });
      //     } else {
      //       that.snackbarservice.openSnackBar(params.message, "error");
      //     }
      //   });
    }

    // const data = await this.vendorService.saveVendor(requestObject);
    // if (data.status) {
    //   this.uiSpinner.spin$.next(false);
    //   showNotification(this.snackBar, data.message, 'success');
    //   this.router.navigate([WEB_ROUTES.VENDOR]);
    // } else {
    //   this.uiSpinner.spin$.next(false);
    //   showNotification(this.snackBar, data.message, 'error');
    // }
  }

  back() {
    this.router.navigate(['/settings']);
  }
}

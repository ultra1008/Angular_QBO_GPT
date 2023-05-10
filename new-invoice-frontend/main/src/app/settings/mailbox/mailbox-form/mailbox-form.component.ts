import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NgxGalleryComponent,
  NgxGalleryOptions,
  NgxGalleryImage,
} from 'ngx-gallery-9';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TermModel, CountryModel } from 'src/app/vendors/vendor-table.model';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { SettingsService } from '../../settings.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-mailbox-form',
  templateUrl: './mailbox-form.component.html',
  styleUrls: ['./mailbox-form.component.scss'],
})
export class MailboxFormComponent {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  companyinfoForm!: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  id: any;

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
    if (this.id) {
      this.getOneMailbox();
    }

    this.companyinfoForm = this.fb.group({
      password: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      imap: ['', [Validators.required]],
      port: [''],
      time: [''],
    });
  }

  onSelectTime(event: any) {
    console.log('element', this.frequency, event);
    let found = this.frequency.find((element) => element.time == event);
    console.log('found', found);
    this.cronTime = found?.cron_time;
    console.log('crontime', this.cronTime);
  }

  async getOneMailbox() {
    const data = await this.SettingsServices.getOneMailBox(this.id);

    if (data.status) {
      let mailBox = data.data;
      console.log('data', mailBox);
      this.companyinfoForm = this.fb.group({
        email: [mailBox.email, [Validators.required, Validators.email]],
        password: ['', Validators.required],
        imap: [mailBox.imap, Validators.required],
        port: [mailBox.port, Validators.required],
        time: [mailBox.time, Validators.required],
      });
      this.cronTime = mailBox.cron_time;
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
}

// View Thumbnail of Location attachment

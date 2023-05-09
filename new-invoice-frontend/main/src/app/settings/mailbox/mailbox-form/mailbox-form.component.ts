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
  termsList: Array<TermModel> = this.variablestermList.slice();
  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id = '';
  company_logo: any;
  imageError: any;
  isImageSaved: any;
  defalut_image: string = '../assets/images/placeholder_logo.png';
  cardImageBase64: any;
  files_old: string[] = [];
  last_files_array: string[] = [];
  files: File[] = [];
  @ViewChild('gallery') gallery!: NgxGalleryComponent;
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  imageObject = [];
  tmp_gallery: any;
  filepath: any;
  variablesCompnayTypes_data: any = [];
  CompnayTypes_data: any = this.variablesCompnayTypes_data.slice();

  variablesCSIDivisions: any = [];
  csiDivisions: any = this.variablesCSIDivisions.slice();

  // CompnaySizes_data: any;
  variablesCompnaySizes_data: any = [];
  CompnaySizes_data: any = this.variablesCompnaySizes_data.slice();

  range: any = [];
  year: number = new Date().getFullYear();
  selectedVendorType = '';
  compnay_code: any;
  compnay_id: any;

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
    this.getOneVendor();
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.companyinfoForm = this.fb.group({
      password: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      imap: ['', [Validators.required]],
      port: [''],
      time: [''],
      cron_time: ['*/20 * * * *'],
    });
  }

  async getOneVendor() {
    // let that = this;
    // const data = await this.SettingsServices.getCompanyInfo();
    // console.log('data', data);
    // if (data.status) {
    //   const CompanyInfoData = data.data;
    //   that.compnay_code = CompanyInfoData.companycode;
    //   that.compnay_id = CompanyInfoData._id;
    //   if (
    //     CompanyInfoData.companylogo == undefined ||
    //     CompanyInfoData.companylogo == null ||
    //     CompanyInfoData.companylogo == ''
    //   ) {
    //     that.company_logo = '../assets/images/placeholder_logo.png';
    //   } else {
    //     that.company_logo = CompanyInfoData.companylogo;
    //   }
    //   this.companyinfoForm = this.fb.group({
    //     companyname: [CompanyInfoData.companyname, Validators.required],
    //     companywebsite: [CompanyInfoData.companywebsite],
    //     companycode: [{ value: CompanyInfoData.companycode, disabled: true }],
    //     companyphone: [CompanyInfoData.companyphone, [Validators.required]],
    //     companyemail: [
    //       CompanyInfoData.companyemail,
    //       [Validators.email, Validators.required],
    //     ],
    //     companyphone2: [CompanyInfoData.companyphone2],
    //     companyactivesince: [
    //       { value: CompanyInfoData.companyactivesince, disabled: true },
    //     ],
    //     companydivision: [CompanyInfoData.companydivision],
    //     companysize: [CompanyInfoData.companysize],
    //     companytype: [CompanyInfoData.companytype],
    //     companyaddress: [CompanyInfoData.companyaddress],
    //     companyaddresscity: [CompanyInfoData.companyaddresscity],
    //     companyaddressstate: [CompanyInfoData.companyaddressstate],
    //     companyaddresszip: [CompanyInfoData.companyaddresszip],
    //   });
    //   let found = that.CompnayTypes_data.find(
    //     (element: any) => element._id == CompanyInfoData.companytype
    //   );
    //   that.selectedVendorType = found.name
    //     ? found.name
    //     : configData.PRIME_VENDOR_TYPE;
    //   that.getCISDivision(
    //     that.selectedVendorType == configData.PRIME_VENDOR_TYPE
    //   );
    // }
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
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.AddMailbox(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
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

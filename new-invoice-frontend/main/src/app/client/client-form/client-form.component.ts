import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  NgxGalleryComponent,
  NgxGalleryOptions,
  NgxGalleryImage,
} from 'ngx-gallery-9';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TermModel, CountryModel } from 'src/app/vendors/vendor-table.model';
import { VendorsService } from 'src/app/vendors/vendors.service';
import { WEB_ROUTES } from 'src/consts/routes';
import {
  gallery_options,
  showNotification,
  swalWithBootstrapButtons,
} from 'src/consts/utils';
import { wasabiImagePath } from 'src/consts/wasabiImagePath';
import { ClientService } from '../client.service';
import { UsersModule } from 'src/app/users/users.module';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
})
export class ClientFormComponent {
  vendorForm: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  variablecostcodeList: any = [];
  costcodeList: any = this.variablecostcodeList.slice();

  variableapproverList: any = [];
  approverList: any = this.variableapproverList.slice();

  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id = '';
  isDelete = 1;

  submitting_text: string = '';
  titleMessage: string = '';
  show: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public vendorService: ClientService,
    private sanitiser: DomSanitizer,
    public commonService: CommonService
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';

    this.vendorForm = this.fb.group({
      client_name: ['', [Validators.required]],
      client_number: ['', [Validators.required]],
      client_email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      gl_account: ['642ab08828667a73474c3c10'],
      client_phone: ['', [Validators.required]],
      client_cost_cost_id: ['', [Validators.required]],
      approver_id: ['', [Validators.required]],
      client_status: ['', [Validators.required]],
      client_notes: [''],
    });
    this.getapprover();
    this.getcostcode();
    if (this.id) {
      this.getOneVendor();
    }
  }

  async getOneVendor() {
    const data = await this.vendorService.getOneVendor(this.id);
    if (data.status) {
      const vendorData = data.data;
      this.vendorForm = this.fb.group({
        vendor_name: [vendorData.vendor_name, [Validators.required]],
        vendor_phone: [vendorData.vendor_phone, [Validators.required]],
        vendor_email: [
          vendorData.vendor_email,
          [Validators.required, Validators.email, Validators.minLength(5)],
        ],
        gl_account: [vendorData.gl_account],
        vendor_id: [vendorData.vendor_id],
        customer_id: [vendorData.customer_id],
        vendor_address: [vendorData.vendor_address, [Validators.required]],
        vendor_address2: [vendorData.vendor_address2],
        vendor_city: [vendorData.vendor_city, [Validators.required]],
        vendor_state: [vendorData.vendor_state, [Validators.required]],
        vendor_zipcode: [vendorData.vendor_zipcode, [Validators.required]],
        vendor_country: [vendorData.vendor_country],
        vendor_terms: [vendorData.vendor_terms, [Validators.required]],
        vendor_status: [vendorData.vendor_status, [Validators.required]],
        vendor_description: [vendorData.vendor_description],
      });

      this.vendorForm.markAllAsTouched();
    }
  }

  async getcostcode() {
    const data = await this.vendorService.getcostcode();
    if (data.status) {
      this.variablecostcodeList = data.data;
      this.costcodeList = this.variablecostcodeList.slice();
    }
  }

  async getapprover() {
    const data = await this.vendorService.getApprover();
    if (data.status) {
      this.variableapproverList = data.data;
      this.approverList = this.variableapproverList.slice();
    }
  }

  // async archiveRecover(vendor: Vendor, is_delete: number) {
  //   this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
  //   const data = await this.vendorService.deleteVendor({id });
  //   if (data.status) {
  //     showNotification(this.snackBar, data.message, 'success');
  //     const foundIndex = this.vendorService?.dataChange.value.findIndex(
  //       (x) => x._id === vendor._id
  //     );
  //     // for delete we use splice in order to remove single object from DataService
  //     if (foundIndex != null && this.vendorService) {
  //       this.vendorService.dataChange.value.splice(foundIndex, 1);

  //       this.router.navigate([WEB_ROUTES.VENDOR], { queryParams: { isDelete: this.isDelete } });

  //     }
  //   } else {
  //     showNotification(this.snackBar, data.message, 'error');
  //   }
  // }

  async deleteVendor() {
    //   this.titleMessage = this.translate.instant('VENDOR.CONFIRMATION_DIALOG.ARCHIVE');
    // swalWithBootstrapTwoButtons
    //   .fire({
    //     title: this.titleMessage,
    //     showDenyButton: true,
    //     confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
    //     denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
    //     allowOutsideClick: false,
    //   })
    //   .then((result) => {
    //     if (result.isConfirmed) {
    //       this.archiveRecover(vendor, is_delete);
    //       this.show = false;
    //     }
    //   });
  }

  async saveVendor() {
    if (this.vendorForm.valid) {
      const requestObject = this.vendorForm.value;
      if (this.id) {
        requestObject._id = this.id;
      }

      const data = await this.vendorService.saveClient(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate([WEB_ROUTES.CLIENT]);
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('VENDOR.CONFIRMATION_DIALOG.SAVING'),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.SAVE_EXIT'),
        cancelButtonText: this.translate.instant('COMMON.ACTIONS.DONT_SAVE'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.CANCEL'),
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.submitting_text = this.translate.instant(
            'VENDOR.CONFIRMATION_DIALOG.SUBMIT'
          );
          // Move to the vendor listing
          if (this.vendorForm.valid) {
            this.saveVendor();
          } else {
            // alert form invalidation
            showNotification(this.snackBar, this.submitting_text, 'error');
          }
        } else if (result.isDenied) {
          // ;
        } else {
          setTimeout(() => {
            this.router.navigate([WEB_ROUTES.CLIENT]);
          }, 100);
        }
      });
  }
}

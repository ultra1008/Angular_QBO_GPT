import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorsService } from '../vendors.service';
import { CountryModel, TermModel, Vendor } from '../vendor-table.model';
import {
  commonLocalThumbImage,
  commonNetworkThumbImage,
  commonNewtworkAttachmentViewer,
  gallery_options,
  showNotification,
  swalWithBootstrapButtons,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { DomSanitizer } from '@angular/platform-browser';
import {
  NgxGalleryComponent,
  NgxGalleryImage,
  NgxGalleryOptions,
} from 'ngx-gallery-9';
import { CommonService } from 'src/app/services/common.service';
import { wasabiImagePath } from 'src/consts/wasabiImagePath';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { TranslateService } from '@ngx-translate/core';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Component({
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss'],
})
export class VendorFormComponent {
  vendorForm: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id = '';
  isDelete = 1;
  files_old: string[] = [];
  last_files_array: string[] = [];
  files: File[] = [];
  @ViewChild('gallery') gallery!: NgxGalleryComponent;
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  imageObject = [];
  tmp_gallery: any;
  submitting_text = '';
  titleMessage = "";
  show = false;

  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public vendorService: VendorsService,
    private sanitiser: DomSanitizer,
    public commonService: CommonService,
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';

    this.vendorForm = this.fb.group({
      vendor_name: ['', [Validators.required]],
      vendor_phone: ['', [Validators.required]],
      vendor_email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      gl_account: [''],
      vendor_id: [''],
      customer_id: [''],
      vendor_address: ['', [Validators.required]],
      vendor_address2: [''],
      vendor_city: ['', [Validators.required]],
      vendor_state: ['', [Validators.required]],
      vendor_zipcode: ['', [Validators.required]],
      vendor_country: ['USA'],
      vendor_terms: ['', [Validators.required]],
      vendor_status: ['', [Validators.required]],
      vendor_description: [''],
    });
    this.tmp_gallery = gallery_options();
    this.tmp_gallery.actions = [
      {
        icon: 'fas fa-download',
        onClick: this.downloadButtonPress.bind(this),
        titleText: 'download',
      },
    ];
    this.galleryOptions = [this.tmp_gallery];

    this.getTerms();
    if (this.id) {
      this.getOneVendor();
    }
  }

  async getOneVendor() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_ONE, { _id: this.id });
    if (data.status) {
      const vendorData = data.data;
      this.vendorForm = this.fb.group({
        vendor_name: [vendorData.vendor_name, [Validators.required]],
        vendor_phone: [vendorData.vendor_phone, [Validators.required]],
        vendor_email: [vendorData.vendor_email, [Validators.required, Validators.email, Validators.minLength(5)],],
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
      this.files_old = [];
      for (
        let loop_i = 0;
        loop_i < vendorData.vendor_attachment.length;
        loop_i++
      ) {
        const tmpArray = vendorData.vendor_attachment[loop_i].split('/');
        this.files_old.push(tmpArray[tmpArray.length - 1]);
      }
      this.last_files_array = vendorData.vendor_attachment;
      this.vendorForm.markAllAsTouched();
    }
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET);
    if (data.status) {
      this.variablestermList = data.data;
      this.termsList = this.variablestermList.slice();
    }
  }

  async saveVendor() {
    if (this.vendorForm.valid) {
      const requestObject = this.vendorForm.value;
      if (this.id) {
        requestObject._id = this.id;
      }

      const formData = new FormData();
      for (let i = 0; i < this.files.length; i++) {
        formData.append('file[]', this.files[i]);
      }
      formData.append('folder_name', wasabiImagePath.VENDOR_ATTACHMENT);
      this.uiSpinner.spin$.next(true);
      const attachment = await this.commonService.saveAttachment(formData);
      if (attachment.status) {
        requestObject.vendor_attachment = attachment.data.concat(
          this.last_files_array
        );
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_SAVE, requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate([WEB_ROUTES.VENDOR]);
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
            this.router.navigate([WEB_ROUTES.VENDOR]);
          }, 100);
        }
      });
  }

  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }
  fileChange(event: Event) {
    // console.log("event:' ", event);
    const element = event.currentTarget as HTMLInputElement;
    const fileList = element.files;
    if (fileList) {
      this.prepareFilesList(fileList);
    }
  }
  fileBrowseHandler(files: any) {
    this.prepareFilesList(files);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteFile_old(index: number) {
    this.last_files_array.splice(index, 1);
    this.files_old.splice(index, 1);
  }

  prepareFilesList(files: any) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }

  // View Thumbnail of Location attachment
  thumbImage(file: File) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  // View Thumbnail of Network Attachment
  thumbNetworkImage(index: number) {
    return commonNetworkThumbImage(this.last_files_array[index]);
  }

  imageNetworkPreview(allAttachment: Array<string>, index: number) {
    this.galleryImages = commonNewtworkAttachmentViewer(allAttachment);
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0);
  }

  downloadButtonPress(event: any, index: number): void {
    window.location.href = this.imageObject[index];
  }
}

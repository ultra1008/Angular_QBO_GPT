import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VendorsService } from '../vendors.service';
import { TermModel } from '../vendor-table.model';
import { showNotification } from 'src/consts/utils';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success s2-confirm margin-right-cust",
    denyButton: "btn btn-danger s2-confirm",
    cancelButton: "s2-confirm btn btn-gray ml-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/images/rovukinvoice.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss']
})
export class VendorFormComponent {
  // Form 1
  vendorForm: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  termsList: Array<TermModel> = [];

  id: any = '';

  breadscrums = [
    {
      title: 'Vendor',
      items: ['Add Vendor'],
      active: 'Add Vendor',
    },
  ];

  constructor (private fb: UntypedFormBuilder, private router: Router, private snackBar: MatSnackBar,
    public route: ActivatedRoute, public vendorService: VendorsService,) {
    this.id = this.route.snapshot.queryParamMap.get("_id");

    this.vendorForm = this.fb.group({
      vendor_name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      vendor_phone: ['', [Validators.required]],
      vendor_email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      gl_account: ['', [Validators.required]],
      vendor_id: [''],
      customer_id: [''],
      vendor_address: ['', [Validators.required]],
      vendor_address2: [''],
      vendor_city: ['', [Validators.required]],
      vendor_state: ['', [Validators.required]],
      vendor_zipcode: ['', [Validators.required]],
      vendor_country: [''],
      vendor_terms: ['', [Validators.required]],
      vendor_status: ['', [Validators.required]],
      vendor_description: [''],
    });
    this.getTerms();
    if (this.id) {
      this.getOneVendor();
    }
  }

  async getOneVendor() {
    const data = await this.vendorService.getOneVendor(this.id);
    if (data.status) {
      const vendorData = data.data;
      this.vendorForm = this.fb.group({
        vendor_name: [vendorData.vendor_name, [Validators.required, Validators.pattern('[a-zA-Z]+')]],
        vendor_phone: [vendorData.vendor_phone, [Validators.required]],
        vendor_email: [vendorData.vendor_email, [Validators.required, Validators.email, Validators.minLength(5)],],
        gl_account: [vendorData.gl_account, [Validators.required]],
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

  async getTerms() {
    const data = await this.vendorService.getTerms();
    if (data.status) {
      this.termsList = data.data;
    }
  }

  async saveVendor() {
    if (this.vendorForm.valid) {
      const requestObject = this.vendorForm.value;
      if (this.id) {
        requestObject._id = this.id;
      }
      const data = await this.vendorService.saveVendor(requestObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate(['/vendors']);
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure you want to close this window without saving changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save And Exite",
        cancelButtonText: "Dont Save",
        denyButtonText: "Cancel",
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Move to the vendor listing
          if (this.vendorForm.valid) {
            this.saveVendor();
          } else {
            // alert form invalidation
            showNotification(this.snackBar, 'Please complete the vendor form before submitting.', 'error');
          }
        } else if (result.isDenied) {
          // ;
        } else {
          setTimeout(() => {
            this.router.navigate(["/vendors"]);
          }, 100);
        }
      });
  }


}

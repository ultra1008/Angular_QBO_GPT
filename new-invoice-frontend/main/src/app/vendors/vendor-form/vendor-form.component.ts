import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VendorsService } from '../vendors.service';
import { TermModel } from '../vendor-table.model';

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

  breadscrums = [
    {
      title: 'Vendor',
      items: ['Add Vendor'],
      active: 'Add Vendor',
    },
  ];

  constructor(private fb: UntypedFormBuilder, private router: Router, private snackBar: MatSnackBar, public vendorService: VendorsService,) {
    this.vendorForm = this.fb.group({
      vendor_name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      vendor_phone: ['', [Validators.required]],
      vendor_email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      gcl_account: ['', [Validators.required]],
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
      password: [''],
    });
    this.getTerms();
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
      const data = await this.vendorService.saveVendor(requestObject);
      if (data.status) {
        this.showNotification(data.message, 'snackbar-success');
        this.router.navigate(['/vendors']);
      } else {
        this.showNotification(data.message, 'snackbar-danger');
      }
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure you want to close this window without saving changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save And Exit",
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
            this.showNotification("Please complete the vendor form before submitting.", 'white');
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

  showNotification(
    text: string,
    colorName: string,
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: colorName,
    });
  }
}

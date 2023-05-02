import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  register: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;

  breadscrums = [
    {
      title: 'Validation',
      items: ['Forms'],
      active: 'Validation',
    },
  ];

  constructor (private fb: UntypedFormBuilder, private router: Router, private snackBar: MatSnackBar) {
    this.register = this.fb.group({
      vendor_name: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      gcl_account: ['', [Validators.required]],
      vendor_id: [''],
      Customer_id: [''],
      address: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: [''],
      zip_code: ['', [Validators.required]],
      terms: ['', [Validators.required]],
      Status: ['', [Validators.required]],
      discripction: [''],
      tmp_password: [''],
    });
  }
  onRegister() {
    console.log('Form Value', this.register.value);
  }
  saveData() {
    // rgf
  }
  confirmexit() {

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
          if (this.register.valid) {
            this.saveData();
          } else {
            // alert form invalidation
            this.showNotification("Please complete the vendor form before submitting.");
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

  showNotification(text: string) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: 'white',
    });
  }
}

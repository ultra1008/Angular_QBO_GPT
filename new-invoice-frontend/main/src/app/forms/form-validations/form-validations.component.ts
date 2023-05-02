import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-form-validations',
  templateUrl: './form-validations.component.html',
  styleUrls: ['./form-validations.component.scss'],
})
export class FormValidationsComponent {
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

  constructor(private fb: UntypedFormBuilder) {
    this.register = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: [''],
      password: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      address: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      termcondition: [false, [Validators.requiredTrue]],
    });
  }
  onRegister() {
    console.log('Form Value', this.register.value);
  }
}

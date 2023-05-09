import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  isLinear = false;
  HFormGroup1?: UntypedFormGroup;
  HFormGroup2?: UntypedFormGroup;
  VFormGroup1?: UntypedFormGroup;
  VFormGroup2?: UntypedFormGroup;

  breadscrums = [
    {
      title: 'Wizard',
      items: ['Forms'],
      active: 'Wizard',
    },
  ];

  constructor(private _formBuilder: UntypedFormBuilder) { }
  ngOnInit() {
    this.HFormGroup1 = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
    this.HFormGroup2 = this._formBuilder.group({
      address: ['', Validators.required],
    });

    this.VFormGroup1 = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
    this.VFormGroup2 = this._formBuilder.group({
      address: ['', Validators.required],
    });
  }
}
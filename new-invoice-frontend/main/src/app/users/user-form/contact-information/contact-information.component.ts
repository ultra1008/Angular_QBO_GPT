import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss']
})
export class ContactInformationComponent {
  // Form 1
  usercontactinfo?: UntypedFormGroup;
  hide = true;

  breadscrums = [
    {
      title: 'Examples',
      items: ['Forms'],
      active: 'Examples',
    },
  ];
  constructor(private fb: UntypedFormBuilder) {
    this.initForm();

  }
  initForm() {

    this.usercontactinfo = this.fb.group({
      userphone: [""],
      usersecondary_email: ["", [Validators.email]],
      userstreet1: [""],
      userstreet2: [""],
      usercity: [""],
      user_state: [""],
      userzipcode: [""],
      usercountry: [""]
    });
  }

  onRegister() {
    console.log('Form Value', this.usercontactinfo?.value);
  }

}

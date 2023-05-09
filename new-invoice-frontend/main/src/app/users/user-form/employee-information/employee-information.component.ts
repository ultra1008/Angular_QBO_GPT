import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-information',
  templateUrl: './employee-information.component.html',
  styleUrls: ['./employee-information.component.scss']
})
export class EmployeeInformationComponent {
  // Form 1
  useremployeeinfo?: UntypedFormGroup;
  hide = true;
  public payroll_cycles: any = [];

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
    this.useremployeeinfo = this.fb.group({
      usersalary: ["0.00", Validators.required],
      userstartdate: [""],
      usermanager_id: [""],
      usersupervisor_id: [""],
      userlocation_id: [""],
      userdepartment_id: ["", Validators.required],
      userjob_type_id: [""],
      userjob_title_id: [""],
      user_payroll_rules: [""],
      user_id_payroll_group: [""],
      card_no: [""],
      card_type: [""],
      usercostcode: [""],
      user_languages: []
    });
  }

  onRegister() {
    console.log('Form Value', this.useremployeeinfo?.value);
  }

}

import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { commonFileChangeEvent } from 'src/app/services/utils';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification } from 'src/consts/utils';
import { UserService } from '../user.service';
import { configData } from 'src/environments/configData';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { Location } from '@angular/common';
import { icon } from 'src/consts/icon';
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class UserFormComponent {
  isLinear = false;

  HFormGroup1?: UntypedFormGroup;
  HFormGroup2?: UntypedFormGroup;
  HFormGroup3?: UntypedFormGroup;
  VFormGroup1?: UntypedFormGroup;
  VFormGroup2?: UntypedFormGroup;
  VFormGroup3?: UntypedFormGroup;
  @ViewChild('OpenFilebox') OpenFilebox: any;
  userpersonalinfo!: UntypedFormGroup;
  usercontactinfo!: UntypedFormGroup;
  useremployeeinfo!: UntypedFormGroup;
  showHideExpiration: any = [];
  db_Doc_types: any = [];
  doc_controller: number = 0;
  document_array: any = Array(Array());
  sample_img = '/assets/images/image-gallery/logo.png';

  defalut_image: string = icon.MALE_PLACEHOLDER;
  defalut_female_mage: string = icon.FEMALE_PLACEHOLDER;
  imageError: any;
  isImageSaved: boolean = false;
  cardImageBase64: any;
  filepath: any;
  maxDate = new Date();
  variablesRoleList: any = [];
  db_roles: any = this.variablesRoleList.slice();

  //db_manager_users
  variablesdb_manager_users: any = [];
  db_manager_users: any = this.variablesdb_manager_users.slice();

  //db_locations
  variablesdb_locations: any = [];
  db_locations: any = this.variablesdb_locations.slice();

  //db_supervisor_users
  variablesdb_supervisor_users: any = [];
  db_supervisor_users: any = this.variablesdb_supervisor_users.slice();

  //db_jobtitle
  variablesdb_jobtitle: any = [];
  db_jobtitle: any = this.variablesdb_jobtitle.slice();

  //db_jobtype
  variablesdb_jobtype: any = [];
  db_jobtype: any = this.variablesdb_jobtype.slice();

  // languageList
  variableslanguageList: any = [];
  languageList: any = this.variableslanguageList.slice();

  //db_Departmaents
  variablesdb_Departmaents: any = [];
  db_Departmaents: any = this.variablesdb_Departmaents.slice();

  public gender_array: any = configData.gender;
  public statuss: any = configData.Status;

  db_costcodes: any = [];

  breadscrums = [
    {
      title: 'Wizard',
      items: ['Forms'],
      active: 'Wizard',
    },
  ];

  constructor(private location: Location, public uiSpinner: UiSpinnerService, public UserService: UserService, private fb: UntypedFormBuilder, private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar,) { }
  ngOnInit() {
    this.getRole();
    this.getManeger();
    this.getLocation();
    this.getSupervisor();
    this.getJobTitle();
    this.getAlljobtype();
    this.getDepartment();
    this.getLanguage();
    this.userpersonalinfo = this.fb.group({
      username: ['', Validators.required],
      usermiddlename: [""],
      userlastname: ['', Validators.required],
      useremail: ["", [Validators.required, Validators.email]],
      password: [""],
      userssn: [""],
      user_no: [""],
      userroleId: ["", Validators.required],
      usergender: [""],
      // project_email_group: [""],
      // compliance_officer: ["false"],
      userdob: [""],
      userstatus: ["", Validators.required],
      login_from: ["All", Validators.required],
      usersDocument: new FormArray([]),
      allow_for_projects: ["true"]
    });
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
  amountChange(params: any) {

    this.useremployeeinfo.get("usersalary")!.setValue(this.amountChange(params));

  }
  removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
  }

  async getRole() {
    const data = await this.UserService.getRole();
    if (data.status) {
      this.variablesRoleList = data.data;
      this.db_roles = this.variablesRoleList.slice();
    }
  }
  async getManeger() {
    const data = await this.UserService.getManeger();
    if (data.status) {
      this.variablesdb_manager_users = data.data;
      this.db_manager_users = this.variablesdb_manager_users.slice();

    }
  }
  async getSupervisor() {
    const data = await this.UserService.getSupervisor();
    if (data.status) {
      this.variablesdb_supervisor_users = data.data;
      this.db_supervisor_users = this.variablesdb_supervisor_users.slice();

    }
  }
  async getLocation() {
    const data = await this.UserService.getLocation();
    if (data.status) {

      this.variablesdb_locations = data.data;
      this.db_locations = this.variablesdb_locations.slice();

    }
  }
  async getJobTitle() {
    const data = await this.UserService.getJobTitle();
    if (data.status) {

      this.variablesdb_jobtitle = data.data;
      this.db_jobtitle = this.variablesdb_jobtitle.slice();

    }
  }
  async getAlljobtype() {
    const data = await this.UserService.getAlljobtype();
    if (data.status) {

      this.variablesdb_jobtype = data.data;
      this.db_jobtype = this.variablesdb_jobtype.slice();

    }
  }
  async getDepartment() {
    const data = await this.UserService.getDepartment();
    if (data.status) {

      this.variablesdb_Departmaents = data.data;
      this.db_Departmaents = this.variablesdb_Departmaents.slice();
    }
  }
  async getLanguage() {
    const data = await this.UserService.getLanguage();
    if (data.status) {

      this.variableslanguageList = data.data;
      this.languageList = this.variableslanguageList.slice();

    }
  }
  language_change(event: any) {

    let language = event.value;
    this.useremployeeinfo.get("user_languages")!.setValue(language);
  }

  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  addDoc() {
    this.doc_controller++;

    // this.U_D.push(this.formBuilder.group({
    //   userdocument_type_id: ['', Validators.required],
    //   userdocument_expire_date: ['']
    // }));
  }
  showHideExpirationDate(event: any, i: any) {
    let found = this.db_Doc_types.find((element: any) => element._id == event);
    this.showHideExpiration[i] = found.is_expiration;
  }
  documentChangeEvent(fileInput: any, index: any) {

    if (fileInput.target.files && fileInput.target.files[0]) {
      this.document_array[index] = fileInput.target.files[0];
    }
  }
  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    commonFileChangeEvent(fileInput, 'image').then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        this.imageError = result.message;
        showNotification(this.snackBar, result.message, 'error');
      }
    });
  }
  get u_from() { return this.userpersonalinfo.controls; }
  get U_D() { return this.u_from['usersDocument']; }

  async savedata() {
    let that = this;
    this.userpersonalinfo.markAllAsTouched();
    this.usercontactinfo.markAllAsTouched();
    this.useremployeeinfo.markAllAsTouched();
    this.saveUser();
    // if (this.userpersonalinfo.valid && this.useremployeeinfo.valid && this.usercontactinfo.valid) {
    //   swalWithBootstrapButtons.fire({
    //     title: this.YOU_WANT_TO_ADD_SCHEDULE,
    //     showDenyButton: true,
    //     showCancelButton: false,
    //     confirmButtonText: this.Compnay_Equipment_Delete_Yes,
    //     denyButtonText: this.Compnay_Equipment_Delete_No,
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.openScheduleform({});
    //     } else {
    //       this.saveUserInDB("");
    //     }

    //   });
    // }
  }
  async saveUser() {
    let that = this;
    if (that.userpersonalinfo.valid && that.useremployeeinfo.valid && that.usercontactinfo.valid) {
      let usersDocument = that.userpersonalinfo.value.usersDocument || [];
      delete that.userpersonalinfo.value.usersDocument;
      let reqObject = {
        ...that.userpersonalinfo.value,
        ...that.useremployeeinfo.value,
        usersalary: this.useremployeeinfo.value.usersalary.toString().replace(/,/g, ""),
        ...that.usercontactinfo.value


      };
      reqObject.userpicture = that.sample_img;

      reqObject.allow_for_projects = String(reqObject.allow_for_projects);

      let department_name = that.db_Departmaents.find((dpt: any) => { return dpt._id == reqObject.userdepartment_id; });
      let jobtitle_name = that.db_jobtitle.find((dpt: any) => { return dpt._id == reqObject.userjob_title_id; });
      let costcode_name = that.db_costcodes.find((dpt: any) => { return dpt._id == reqObject.usercostcode; });

      reqObject.department_name = department_name != undefined ? department_name.department_name : "";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : "";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : "";

      reqObject.userfullname = reqObject.username + " " + reqObject.usermiddlename + " " + reqObject.userlastname;
      reqObject.userfulladdress = reqObject.userstreet1 + "," + reqObject.userstreet2 + "," + reqObject.usercity + "," + reqObject.user_state + reqObject.user_state + "-" + reqObject.userzipcode;
      reqObject = await that.removeEmptyOrNull(reqObject);
      const formData = new FormData();
      formData.append('file', that.filepath);
      formData.append('reqObject', JSON.stringify(reqObject));
      const data = await this.UserService.saveUsers(reqObject);
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
  removeEmptyOrNull = (obj: any) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && this.removeEmptyOrNull(obj[k]) ||
      (!obj[k] && obj[k] !== undefined) && delete obj[k]
    );
    return obj;
  };


  back(): void {
    this.location.back();
  }
  onRegister() {
    // console.log('Form Value', this.useremployeeinfo?.value);
  }
}